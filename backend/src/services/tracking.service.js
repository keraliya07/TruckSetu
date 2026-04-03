const prisma = require('../config/db');
const { stopSimulator } = require('../jobs/gpsSimulator.job');
const { triggerReturnLoadMatching } = require('../jobs/returnLoad.job');
const notificationService = require('./notification.service');
const tripService = require('./trip.service');
const { updateTripCO2 } = require('./co2.service');
const ApiError = require('../utils/apiError.utils');

const getIO = () => require('../config/socket').getIO?.() || null;

const tripInclude = {
  truck: {
    include: {
      dealer: true,
    },
  },
  dealer: true,
  bookingRequest: {
    include: {
      warehouse: {
        include: {
          user: true,
        },
      },
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
    take: 20,
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

  throw ApiError.forbidden('You cannot access this trip');
};

const buildLocationPayload = (location) => ({
  id: location.id,
  tripId: location.tripId,
  truckId: location.truckId,
  lat: location.lat,
  lng: location.lng,
  speed: location.speed,
  heading: location.heading,
  source: location.source,
  recordedAt: location.recordedAt,
});

const emitTripState = async (tripId, target = null) => {
  const trip = await getTripOrThrow(tripId);
  const io = getIO();

  if (target?.emit) {
    target.emit('trip:state', trip);
  } else if (io) {
    io.to(`trip:${tripId}`).emit('trip:state', trip);
  }

  return trip;
};

const joinTripRoom = async (socket, tripId, user) => {
  const trip = await getTripOrThrow(tripId);
  await assertTripAccess(trip, user);
  socket.join(`trip:${tripId}`);
  socket.emit('trip:state', trip);

  if (trip.locations[0]) {
    socket.emit('location:update', buildLocationPayload(trip.locations[0]));
  }

  return trip;
};

const getLatestLocation = async (tripId, user) => {
  const trip = await getTripOrThrow(tripId);
  await assertTripAccess(trip, user);

  return {
    tripId,
    latestLocation: trip.locations[0] ? buildLocationPayload(trip.locations[0]) : null,
    truckPosition: trip.locations[0]
      ? {
          lat: trip.locations[0].lat,
          lng: trip.locations[0].lng,
        }
      : trip.truck.currentLat != null && trip.truck.currentLng != null
        ? {
            lat: trip.truck.currentLat,
            lng: trip.truck.currentLng,
          }
        : null,
    stops: trip.stops,
  };
};

const getLocationHistory = async (tripId, { limit }, user) => {
  const trip = await getTripOrThrow(tripId);
  await assertTripAccess(trip, user);

  const locations = await prisma.tripLocation.findMany({
    where: { tripId },
    orderBy: { recordedAt: 'desc' },
    take: limit,
  });

  return {
    tripId,
    locations: locations.map(buildLocationPayload),
  };
};

const broadcastLocation = async (tripId, data, user) => {
  const trip = await getTripOrThrow(tripId);
  await assertTripAccess(trip, user);

  if (user.role !== 'DEALER') {
    throw ApiError.forbidden('Only dealers can publish trip locations');
  }

  if (trip.status !== 'IN_TRANSIT') {
    throw ApiError.badRequest('Locations can only be published while a trip is in transit');
  }

  const location = await prisma.$transaction(async (tx) => {
    const created = await tx.tripLocation.create({
      data: {
        tripId,
        truckId: trip.truckId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed ?? null,
        heading: data.heading ?? null,
        source: data.source || 'SOCKET',
        recordedAt: data.recordedAt || new Date(),
      },
    });

    await tx.truck.update({
      where: { id: trip.truckId },
      data: {
        currentLat: data.lat,
        currentLng: data.lng,
      },
    });

    return created;
  });

  const payload = buildLocationPayload(location);
  const io = getIO();
  if (io) {
    io.to(`trip:${tripId}`).emit('location:update', payload);
  }

  return payload;
};

const completeStop = async (tripId, stopId, user) => {
  const trip = await tripService.completeStop(tripId, stopId, user);
  const updatedTrip = await emitTripState(tripId);

  if (updatedTrip.status === 'DELIVERED') {
    stopSimulator(updatedTrip.id);
    await updateTripCO2(updatedTrip.id);

    await notificationService.sendNotification({
      userId: updatedTrip.bookingRequest.requestedById,
      type: 'TRIP',
      title: 'Trip delivered',
      message: `Trip ${updatedTrip.id.slice(0, 8)} completed and shipments were delivered.`,
      link: `/warehouse/tracking/${updatedTrip.id}`,
      metadata: {
        tripId: updatedTrip.id,
      },
      email: {
        subject: 'STLOS trip delivered',
        text: `Trip ${updatedTrip.id.slice(0, 8)} has been delivered successfully.`,
        html: `
          <p>Trip <strong>${updatedTrip.id.slice(0, 8)}</strong> has been delivered.</p>
          <p>You can review the trip in your STLOS dashboard.</p>
        `,
      },
    });

    await triggerReturnLoadMatching(updatedTrip.id);
  }

  return trip;
};

module.exports = {
  broadcastLocation,
  completeStop,
  emitTripState,
  getLatestLocation,
  getLocationHistory,
  joinTripRoom,
};
