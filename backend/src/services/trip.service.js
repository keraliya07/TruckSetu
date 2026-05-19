const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');
const { startSimulator } = require('../jobs/gpsSimulator.job');
const { getRoute } = require('../utils/osrm.utils');

const tripDetailInclude = {
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
    take: 40,
  },
};

const tripListInclude = {
  truck: {
    select: {
      id: true,
      registrationNo: true,
      status: true,
      dealer: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  },
  dealer: {
    select: {
      id: true,
      companyName: true,
    },
  },
  bookingRequest: {
    select: {
      id: true,
      warehouse: {
        select: {
          id: true,
          warehouseName: true,
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
          originCity: true,
          destCity: true,
          weightKg: true,
        },
      },
    },
  },
  stops: {
    orderBy: {
      sequence: 'asc',
    },
    select: {
      id: true,
      sequence: true,
      status: true,
      type: true,
      city: true,
    },
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
    include: tripDetailInclude,
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
      include: tripListInclude,
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

  // Reuse already-fetched trip data for location seed check — saves 1 DB round-trip
  if (!trip.locations.length) {
    const pickupStop = trip.stops[0];
    await prisma.tripLocation.create({
      data: {
        tripId,
        truckId: trip.truckId,
        lat:
          pickupStop?.lat ??
          trip.truck.currentLat ??
          0,
        lng:
          pickupStop?.lng ??
          trip.truck.currentLng ??
          0,
        source: 'TRIP_START',
      },
    });
  }

  startSimulator(tripId).catch((error) => {
    console.warn(`[gps-simulator] unable to start for trip ${tripId}: ${error.message}`);
  });

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

const refreshGeometry = async (tripId, user) => {
  const trip = await getTripOrThrow(tripId);
  await assertTripAccess(trip, user);

  // Build [lng, lat] coordinates from the trip's ordered stops
  const coordinates = trip.stops
    .filter((stop) => stop.lat && stop.lng)
    .map((stop) => [stop.lng, stop.lat]);

  if (coordinates.length < 2) {
    throw ApiError.badRequest('Trip does not have enough stops to calculate a route');
  }

  const osrmRoute = await getRoute(coordinates);

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: {
      routeGeometry: osrmRoute.geometry,
      ...(osrmRoute.source === 'osrm' && {
        estimatedDistanceKm: Number((osrmRoute.distance / 1000).toFixed(1)),
        estimatedDurationMin: Math.round(osrmRoute.duration / 60),
      }),
    },
    include: {
      ...tripDetailInclude,
    },
  });

  return { trip: updated, source: osrmRoute.source };
};

module.exports = {
  completeStop,
  getAll,
  getById,
  refreshGeometry,
  start,
};
