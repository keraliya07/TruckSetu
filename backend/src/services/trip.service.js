const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');

const tripInclude = {
  truck: {
    include: {
      dealer: true,
    },
  },
  dealer: true,
  bookingRequest: {
    include: {
      warehouse: true,
      shipments: {
        include: {
          shipment: true,
        },
      },
    },
  },
  shipments: {
    include: {
      shipment: true,
    },
  },
  stops: {
    orderBy: {
      sequence: 'asc',
    },
  },
  locations: {
    orderBy: {
      recordedAt: 'desc',
    },
    take: 10,
  },
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

const getWarehouseProfile = async (userId) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { userId },
  });

  if (!warehouse) {
    throw ApiError.forbidden('Warehouse profile is not set up for this user');
  }

  return warehouse;
};

const getTripOrThrow = async (tripId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: tripInclude,
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  return trip;
};

const assertTripAccess = async (trip, user) => {
  if (user.role === 'ADMIN') {
    return;
  }

  if (user.role === 'DEALER') {
    const dealer = await getDealerProfile(user.userId);
    if (trip.dealerId !== dealer.id) {
      throw ApiError.forbidden('You cannot access this trip');
    }
    return;
  }

  if (user.role === 'WAREHOUSE') {
    const warehouse = await getWarehouseProfile(user.userId);
    if (trip.bookingRequest?.warehouseId !== warehouse.id) {
      throw ApiError.forbidden('You cannot access this trip');
    }
    return;
  }

  throw ApiError.forbidden('You cannot access trips');
};

const getAll = async (filters, user) => {
  const page = Number.parseInt(filters.page || '1', 10);
  const limit = Math.min(Number.parseInt(filters.limit || '10', 10), 100);
  const skip = (page - 1) * limit;
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
  };

  if (user.role === 'DEALER') {
    const dealer = await getDealerProfile(user.userId);
    where.dealerId = dealer.id;
  } else if (user.role === 'WAREHOUSE') {
    const warehouse = await getWarehouseProfile(user.userId);
    where.bookingRequest = {
      is: {
        warehouseId: warehouse.id,
      },
    };
  } else if (user.role !== 'ADMIN') {
    throw ApiError.forbidden('You cannot access trips');
  }

  const [trips, total] = await prisma.$transaction([
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: tripInclude,
    }),
    prisma.trip.count({ where }),
  ]);

  return { trips, total, page, limit };
};

const getById = async (tripId, user) => {
  const trip = await getTripOrThrow(tripId);
  await assertTripAccess(trip, user);
  return trip;
};

const start = async (tripId, user) => {
  const dealer = await getDealerProfile(user.userId);
  const trip = await getTripOrThrow(tripId);

  if (trip.dealerId !== dealer.id) {
    throw ApiError.forbidden('You cannot start this trip');
  }

  if (trip.status !== 'PLANNED') {
    throw ApiError.badRequest('Only planned trips can be started');
  }

  await prisma.$transaction([
    prisma.trip.update({
      where: { id: tripId },
      data: {
        status: 'IN_TRANSIT',
        startedAt: new Date(),
      },
    }),
    prisma.shipment.updateMany({
      where: {
        id: {
          in: trip.shipments.map((entry) => entry.shipmentId),
        },
      },
      data: {
        status: 'IN_TRANSIT',
      },
    }),
  ]);

  return getTripOrThrow(tripId);
};

const completeStop = async (tripId, stopId, user) => {
  const dealer = await getDealerProfile(user.userId);
  const trip = await getTripOrThrow(tripId);

  if (trip.dealerId !== dealer.id) {
    throw ApiError.forbidden('You cannot update this trip');
  }

  if (!['PLANNED', 'IN_TRANSIT'].includes(trip.status)) {
    throw ApiError.badRequest('Trip is not active');
  }

  const stop = trip.stops.find((entry) => entry.id === stopId);
  if (!stop) {
    throw ApiError.notFound('Trip stop not found');
  }

  if (stop.status === 'COMPLETED') {
    return trip;
  }

  await prisma.$transaction(async (tx) => {
    if (trip.status === 'PLANNED') {
      await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'IN_TRANSIT',
          startedAt: trip.startedAt || new Date(),
        },
      });

      await tx.shipment.updateMany({
        where: {
          id: {
            in: trip.shipments.map((entry) => entry.shipmentId),
          },
        },
        data: {
          status: 'IN_TRANSIT',
        },
      });
    }

    await tx.tripStop.update({
      where: { id: stopId },
      data: {
        status: 'COMPLETED',
        arrivedAt: new Date(),
        completedAt: new Date(),
      },
    });

    if (stop.shipmentId) {
      await tx.tripShipment.update({
        where: {
          tripId_shipmentId: {
            tripId,
            shipmentId: stop.shipmentId,
          },
        },
        data: {
          deliveredAt: new Date(),
        },
      });

      await tx.shipment.update({
        where: { id: stop.shipmentId },
        data: {
          status: 'DELIVERED',
        },
      });
    }

    const remainingStops = await tx.tripStop.count({
      where: {
        tripId,
        status: {
          not: 'COMPLETED',
        },
      },
    });

    if (remainingStops === 0) {
      await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'DELIVERED',
          completedAt: new Date(),
        },
      });

      await tx.truck.update({
        where: { id: trip.truckId },
        data: {
          status: 'AVAILABLE',
        },
      });
    }
  });

  return getTripOrThrow(tripId);
};

module.exports = {
  completeStop,
  getAll,
  getById,
  start,
};
