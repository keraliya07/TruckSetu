const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');
const { BOOKING_TIMEOUT_HOURS } = require('../config/env');

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

const createNotification = async ({ userId, type, title, message, link, metadata }) => {
  if (!userId) {
    return null;
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      metadata,
    },
  });
};

const buildTripStops = (warehouse, shipments) => {
  const pickupStop = {
    sequence: 1,
    type: 'PICKUP',
    status: 'PENDING',
    city: warehouse.city,
    address: warehouse.address,
    lat: warehouse.latitude || shipments[0]?.shipment.originLat || 0,
    lng: warehouse.longitude || shipments[0]?.shipment.originLng || 0,
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

const createTripForBooking = async (tx, booking, finalPrice) => {
  const totalDistanceEstimate = booking.shipments.reduce(
    (sum, entry) => sum + Math.max(entry.shipment.weightKg / 200, 10),
    0
  );

  const trip = await tx.trip.create({
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

  await tx.shipment.updateMany({
    where: {
      id: {
        in: booking.shipments.map((entry) => entry.shipment.id),
      },
    },
    data: {
      status: 'BOOKING_CONFIRMED',
    },
  });

  await tx.truck.update({
    where: { id: booking.truckId },
    data: {
      status: 'ON_TRIP',
    },
  });

  return trip;
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

  await createNotification({
    userId: truck.dealer.user?.id,
    type: 'BOOKING',
    title: 'New booking request',
    message: `${booking.shipments.length} shipment(s) have been sent for your truck ${truck.registrationNo}.`,
    link: `/dealer/bookings/${booking.id}`,
    metadata: { bookingId: booking.id },
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
      include: bookingInclude,
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

  if (!['SENT', 'COUNTERED'].includes(booking.status)) {
    throw ApiError.badRequest('Booking is not awaiting dealer response');
  }

  if (data.action === 'REJECT') {
    const updated = await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        status: 'REJECTED',
        dealerNote: data.dealerNote || null,
        respondedAt: new Date(),
      },
      include: bookingInclude,
    });

    await prisma.shipment.updateMany({
      where: {
        id: { in: updated.shipments.map((entry) => entry.shipment.id) },
      },
      data: { status: 'PENDING' },
    });

    await createNotification({
      userId: updated.requestedById,
      type: 'BOOKING',
      title: 'Booking rejected',
      message: `Dealer rejected booking for truck ${updated.truck.registrationNo}.`,
      link: `/warehouse/bookings/${updated.id}`,
      metadata: { bookingId: updated.id },
    });

    return getBookingById(updated.id);
  }

  if (data.action === 'COUNTER') {
    const updated = await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        status: 'COUNTERED',
        counterPrice: data.counterPrice,
        dealerNote: data.dealerNote || null,
        respondedAt: new Date(),
      },
      include: bookingInclude,
    });

    await createNotification({
      userId: updated.requestedById,
      type: 'BOOKING',
      title: 'Counter offer received',
      message: `Dealer proposed Rs ${data.counterPrice} for booking ${updated.id}.`,
      link: `/warehouse/bookings/${updated.id}`,
      metadata: { bookingId: updated.id },
    });

    return updated;
  }

  const approved = await prisma.$transaction(
    async (tx) => {
      const updatedBooking = await tx.bookingRequest.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          dealerNote: data.dealerNote || null,
          finalPrice: booking.counterPrice || booking.quotedPrice,
          respondedAt: new Date(),
          approvedAt: new Date(),
        },
        include: bookingInclude,
      });

      await createTripForBooking(tx, updatedBooking, updatedBooking.finalPrice);
      return updatedBooking;
    },
    { timeout: 20000 }
  );

  await createNotification({
    userId: approved.requestedById,
    type: 'BOOKING',
    title: 'Booking approved',
    message: `Dealer approved your booking for truck ${approved.truck.registrationNo}.`,
    link: `/warehouse/bookings/${approved.id}`,
    metadata: { bookingId: approved.id },
  });

  return getBookingById(approved.id);
};

const acceptCounter = async (bookingId, data, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const booking = await getBookingById(bookingId);

  if (booking.warehouseId !== warehouse.id) {
    throw ApiError.forbidden('You cannot approve this booking');
  }

  if (booking.status !== 'COUNTERED' || !booking.counterPrice) {
    throw ApiError.badRequest('Booking does not have a pending counter offer');
  }

  const approved = await prisma.$transaction(
    async (tx) => {
      const updatedBooking = await tx.bookingRequest.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          warehouseNote: data.warehouseNote || null,
          finalPrice: booking.counterPrice,
          approvedAt: new Date(),
        },
        include: bookingInclude,
      });

      await createTripForBooking(tx, updatedBooking, updatedBooking.finalPrice);
      return updatedBooking;
    },
    { timeout: 20000 }
  );

  await createNotification({
    userId: approved.truck.dealer.user?.id,
    type: 'BOOKING',
    title: 'Counter offer accepted',
    message: `Warehouse accepted the counter price for booking ${approved.id}.`,
    link: `/dealer/bookings/${approved.id}`,
    metadata: { bookingId: approved.id },
  });

  return getBookingById(approved.id);
};

module.exports = {
  acceptCounter,
  create,
  getAll,
  getById,
  respond,
};
