const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');
const { BOOKING_TIMEOUT_HOURS } = require('../config/env');
const notificationService = require('./notification.service');
const { resolveCityCoordinates } = require('../utils/cityCoordinates');

const bookingInclude = {
  warehouse: true,
  requestedBy: true,
  truck: {
    include: {
      dealer: {
        include: {
          user: true,
        },
      },
    },
  },
  shipments: {
    include: {
      shipment: true,
    },
  },
  trip: {
    include: {
      stops: true,
      shipments: {
        include: {
          shipment: true,
        },
      },
    },
  },
};

const bookingListInclude = {
  warehouse: {
    select: {
      id: true,
      warehouseName: true,
      city: true,
    },
  },
  truck: {
    select: {
      id: true,
      registrationNo: true,
      dealerId: true,
      dealer: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  },
  shipments: {
    include: {
      shipment: {
        select: {
          id: true,
          title: true,
          referenceNo: true,
          originCity: true,
          destCity: true,
          weightKg: true,
          volumeM3: true,
          shipmentType: true,
          systemPrice: true,
          status: true,
          pickupDeadline: true,
          deadline: true,
        },
      },
    },
  },
  trip: {
    select: {
      id: true,
      status: true,
    },
  },
};

const getWarehouseProfile = async (userId) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { userId },
  });

  if (!warehouse) {
    throw ApiError.forbidden('Warehouse profile is not set up for this user');
  }

  return warehouse;
};

const getDealerProfile = async (userId) => {
  const dealer = await prisma.truckDealer.findUnique({
    where: { userId },
  });

  if (!dealer) {
    throw ApiError.forbidden('Dealer profile is not set up for this user');
  }

  return dealer;
};

const getBookingById = async (bookingId) => {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: bookingInclude,
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  return booking;
};

const getShipmentIds = (booking) =>
  [...new Set(booking.shipments.map((entry) => entry.shipment.id))];

const buildTripStops = (warehouse, shipments) => {
  const warehouseLocation = resolveCityCoordinates(warehouse.city);
  const pickupStop = {
    sequence: 1,
    type: 'PICKUP',
    status: 'PENDING',
    city: warehouse.city,
    address: warehouse.address,
    lat: warehouse.latitude ?? warehouseLocation?.lat ?? shipments[0]?.shipment.originLat ?? 0,
    lng: warehouse.longitude ?? warehouseLocation?.lng ?? shipments[0]?.shipment.originLng ?? 0,
  };

  const deliveryStops = shipments.map((entry, index) => ({
    sequence: index + 2,
    type: 'DELIVERY',
    status: 'PENDING',
    city: entry.shipment.destCity,
    address: entry.shipment.destAddress,
    lat: entry.shipment.destLat,
    lng: entry.shipment.destLng,
    shipmentId: entry.shipment.id,
  }));

  return [pickupStop, ...deliveryStops];
};

const syncShipmentOpenState = async (tx, shipmentIds) => {
  const uniqueIds = [...new Set(shipmentIds)];

  // Single query to get booking status for all shipments — replaces 2N serial count queries
  const shipments = await tx.shipment.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      bookingShipments: {
        select: {
          bookingRequest: {
            select: { status: true },
          },
        },
      },
    },
  });

  const updates = shipments
    .filter(
      (s) => !s.bookingShipments.some((bs) => bs.bookingRequest.status === 'APPROVED')
    )
    .map((s) => {
      const hasOpen = s.bookingShipments.some(
        (bs) => bs.bookingRequest.status === 'SENT'
      );
      return tx.shipment.update({
        where: { id: s.id },
        data: { status: hasOpen ? 'BOOKING_PENDING' : 'PENDING' },
      });
    });

  await Promise.all(updates);
};

const createTripForBooking = async (tx, booking, finalPrice) => {
  const shipmentIds = getShipmentIds(booking);

  const lockedShipments = await tx.shipment.updateMany({
    where: {
      id: {
        in: shipmentIds,
      },
      status: 'BOOKING_PENDING',
    },
    data: {
      status: 'BOOKING_CONFIRMED',
    },
  });

  if (lockedShipments.count !== shipmentIds.length) {
    throw ApiError.conflict('This shipment has already been assigned to another dealer');
  }

  const lockedTruck = await tx.truck.updateMany({
    where: {
      id: booking.truckId,
      status: 'AVAILABLE',
    },
    data: {
      status: 'ON_TRIP',
    },
  });

  if (lockedTruck.count !== 1) {
    throw ApiError.conflict('The selected truck is no longer available');
  }

  const totalDistanceEstimate = booking.shipments.reduce(
    (sum, entry) => sum + Math.max(entry.shipment.weightKg / 200, 10),
    0
  );

  return tx.trip.create({
    data: {
      bookingRequestId: booking.id,
      truckId: booking.truckId,
      dealerId: booking.truck.dealerId,
      status: 'PLANNED',
      estimatedCost: finalPrice,
      estimatedDistanceKm: totalDistanceEstimate,
      shipments: {
        create: booking.shipments.map((entry) => ({
          shipmentId: entry.shipment.id,
        })),
      },
      stops: {
        create: buildTripStops(booking.warehouse, booking.shipments),
      },
    },
    include: {
      stops: true,
      shipments: true,
    },
  });
};

const notifyRequestClosed = async (booking, message) => {
  await notificationService.sendNotification({
    userId: booking.truck.dealer.user?.id,
    type: 'BOOKING',
    title: 'Shipment request closed',
    message,
    link: `/dealer/bookings/${booking.id}`,
    metadata: { bookingId: booking.id },
  });
};

const create = async ({ shipmentIds, truckId, quotedPrice }, user) => {
  const warehouse = await getWarehouseProfile(user.userId);

  const [shipments, truck] = await Promise.all([
    prisma.shipment.findMany({
      where: {
        id: { in: shipmentIds },
        warehouseId: warehouse.id,
      },
    }),
    prisma.truck.findUnique({
      where: { id: truckId },
      include: {
        dealer: {
          include: {
            user: true,
          },
        },
      },
    }),
  ]);

  if (shipments.length !== shipmentIds.length) {
    throw ApiError.badRequest('All shipments must belong to the requesting warehouse');
  }

  const invalidShipment = shipments.find((shipment) => shipment.status !== 'PENDING');
  if (invalidShipment) {
    throw ApiError.badRequest('Only PENDING shipments can be booked');
  }

  if (!truck || !truck.isActive || truck.status !== 'AVAILABLE') {
    throw ApiError.badRequest('Selected truck is not available');
  }

  const totalWeight = shipments.reduce((sum, shipment) => sum + shipment.weightKg, 0);
  const totalVolume = shipments.reduce((sum, shipment) => sum + shipment.volumeM3, 0);

  if (totalWeight > truck.maxWeightKg || totalVolume > truck.maxVolumeM3) {
    throw ApiError.badRequest('Selected truck cannot carry the chosen shipments');
  }

  const booking = await prisma.$transaction(
    async (tx) => {
      const created = await tx.bookingRequest.create({
        data: {
          warehouseId: warehouse.id,
          requestedById: user.userId,
          truckId,
          quotedPrice,
          status: 'SENT',
          expiresAt: new Date(Date.now() + BOOKING_TIMEOUT_HOURS * 60 * 60 * 1000),
          shipments: {
            create: shipmentIds.map((shipmentId) => ({
              shipmentId,
            })),
          },
        },
        include: bookingInclude,
      });

      await tx.shipment.updateMany({
        where: { id: { in: shipmentIds } },
        data: { status: 'BOOKING_PENDING' },
      });

      return created;
    },
    { timeout: 20000 }
  );

  await notificationService.sendNotification({
    userId: truck.dealer.user?.id,
    type: 'BOOKING',
    title: 'New shipment request',
    message: `${booking.shipments.length} shipment(s) have been sent for truck ${truck.registrationNo}.`,
    link: `/dealer/bookings/${booking.id}`,
    metadata: { bookingId: booking.id },
    email: {
      subject: 'TruckSetu shipment request received',
      text: `A new shipment request for truck ${truck.registrationNo} is waiting for review.`,
      html: `
        <p>A new shipment request is waiting for review.</p>
        <p>Truck: <strong>${truck.registrationNo}</strong></p>
        <p>Shipments: <strong>${booking.shipments.length}</strong></p>
      `,
    },
  });

  return getBookingById(booking.id);
};

const getAll = async (filters, user) => {
  const page = Number.parseInt(filters.page || '1', 10);
  const limit = Math.min(Number.parseInt(filters.limit || '10', 10), 100);
  const skip = (page - 1) * limit;

  let where;

  if (user.role === 'WAREHOUSE') {
    const warehouse = await getWarehouseProfile(user.userId);
    where = { warehouseId: warehouse.id };
  } else if (user.role === 'DEALER') {
    const dealer = await getDealerProfile(user.userId);
    where = {
      truck: {
        is: {
          dealerId: dealer.id,
        },
      },
    };
  } else {
    where = {};
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const [bookings, total] = await prisma.$transaction([
    prisma.bookingRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: bookingListInclude,
    }),
    prisma.bookingRequest.count({ where }),
  ]);

  return { bookings, total, page, limit };
};

const getById = async (bookingId, user) => {
  const booking = await getBookingById(bookingId);

  if (user.role === 'WAREHOUSE') {
    const warehouse = await getWarehouseProfile(user.userId);
    if (booking.warehouseId !== warehouse.id) {
      throw ApiError.forbidden('You cannot access this booking');
    }
  }

  if (user.role === 'DEALER') {
    const dealer = await getDealerProfile(user.userId);
    if (booking.truck.dealerId !== dealer.id) {
      throw ApiError.forbidden('You cannot access this booking');
    }
  }

  return booking;
};

const respond = async (bookingId, data, user) => {
  const dealer = await getDealerProfile(user.userId);
  const booking = await getBookingById(bookingId);

  if (booking.truck.dealerId !== dealer.id) {
    throw ApiError.forbidden('You cannot respond to this booking');
  }

  if (booking.status !== 'SENT') {
    throw ApiError.conflict('This shipment request is no longer open for response');
  }

  if (data.action === 'REJECT') {
    const shipmentIds = getShipmentIds(booking);

    await prisma.$transaction(
      async (tx) => {
        const updated = await tx.bookingRequest.updateMany({
          where: {
            id: bookingId,
            status: 'SENT',
          },
          data: {
            status: 'REJECTED',
            dealerNote: data.dealerNote || null,
            respondedAt: new Date(),
          },
        });

        if (updated.count !== 1) {
          throw ApiError.conflict('This shipment request is no longer open for response');
        }

        await syncShipmentOpenState(tx, shipmentIds);
      },
      { timeout: 20000 }
    );

    const rejected = await getBookingById(bookingId);

    await notificationService.sendNotification({
      userId: rejected.requestedById,
      type: 'BOOKING',
      title: 'Shipment request rejected',
      message: `Dealer rejected shipment request for truck ${rejected.truck.registrationNo}.`,
      link: `/warehouse/bookings/${rejected.id}`,
      metadata: { bookingId: rejected.id },
      email: {
        subject: 'TruckSetu shipment request rejected',
        text: `Your shipment request for truck ${rejected.truck.registrationNo} was rejected.`,
      },
    });

    return rejected;
  }

  const approval = await prisma.$transaction(
    async (tx) => {
      const updated = await tx.bookingRequest.updateMany({
        where: {
          id: bookingId,
          status: 'SENT',
        },
        data: {
          status: 'APPROVED',
          dealerNote: data.dealerNote || null,
          finalPrice: booking.quotedPrice,
          respondedAt: new Date(),
          approvedAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        throw ApiError.conflict('This shipment request is no longer open for response');
      }

      const approvedBooking = await tx.bookingRequest.findUnique({
        where: { id: bookingId },
        include: bookingInclude,
      });

      await createTripForBooking(tx, approvedBooking, approvedBooking.finalPrice);

      const competingRequests = await tx.bookingRequest.findMany({
        where: {
          id: {
            not: bookingId,
          },
          status: 'SENT',
          shipments: {
            some: {
              shipmentId: {
                in: getShipmentIds(approvedBooking),
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (competingRequests.length) {
        await tx.bookingRequest.updateMany({
          where: {
            id: {
              in: competingRequests.map((entry) => entry.id),
            },
          },
          data: {
            status: 'CANCELLED',
            respondedAt: new Date(),
          },
        });
      }

      return {
        approvedBooking,
        cancelledBookingIds: competingRequests.map((entry) => entry.id),
      };
    },
    { timeout: 20000 }
  );

  // Use the booking already fetched inside the transaction — saves 1 DB round-trip
  const approved = approval.approvedBooking;

  await notificationService.sendNotification({
    userId: approved.requestedById,
    type: 'BOOKING',
    title: 'Shipment assigned',
    message: `Dealer accepted and shipment was assigned to truck ${approved.truck.registrationNo}.`,
    link: `/warehouse/bookings/${approved.id}`,
    metadata: { bookingId: approved.id },
    email: {
      subject: 'TruckSetu shipment assigned',
      text: `Your shipment was assigned to truck ${approved.truck.registrationNo}.`,
    },
  });

  if (approval.cancelledBookingIds.length) {
    const cancelledRequests = await prisma.bookingRequest.findMany({
      where: {
        id: {
          in: approval.cancelledBookingIds,
        },
      },
      include: bookingInclude,
    });

    await Promise.all(
      cancelledRequests.map((cancelled) =>
        notifyRequestClosed(
          cancelled,
          `Shipment request ${cancelled.id.slice(0, 8)} was closed because another dealer accepted first.`
        )
      )
    );
  }

  return approved;
};

module.exports = {
  create,
  getAll,
  getById,
  respond,
};
