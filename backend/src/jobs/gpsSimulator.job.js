const prisma = require('../config/db');
const { GPS_SIMULATOR_ENABLED, GPS_UPDATE_INTERVAL_MS } = require('../config/env');

const activeSimulators = new Map();
const getIO = () => require('../config/socket').getIO?.() || null;

const toWaypoint = (lng, lat, index) => ({
  lat: Number(lat),
  lng: Number(lng),
  speed: 52,
  heading: (index * 35) % 360,
  source: 'GPS_SIMULATOR',
});

const buildWaypointStream = (trip) => {
  const fromGeometry = trip?.routeGeometry?.coordinates;
  if (Array.isArray(fromGeometry) && fromGeometry.length > 0) {
    return fromGeometry
      .filter((point) => Array.isArray(point) && point.length >= 2)
      .map(([lng, lat], index) => toWaypoint(lng, lat, index));
  }

  return (trip?.stops || [])
    .filter((stop) => Number.isFinite(stop?.lat) && Number.isFinite(stop?.lng))
    .map((stop, index) => ({
      lat: Number(stop.lat),
      lng: Number(stop.lng),
      speed: stop.type === 'PICKUP' ? 28 : 44,
      heading: (index * 55) % 360,
      source: 'GPS_SIMULATOR',
    }));
};

const publishWaypoint = async (trip, waypoint) => {
  const created = await prisma.tripLocation.create({
    data: {
      tripId: trip.id,
      truckId: trip.truckId,
      lat: waypoint.lat,
      lng: waypoint.lng,
      speed: waypoint.speed,
      heading: waypoint.heading,
      source: waypoint.source,
    },
  });

  await prisma.truck.update({
    where: { id: trip.truckId },
    data: {
      currentLat: waypoint.lat,
      currentLng: waypoint.lng,
    },
  });

  const io = getIO();
  if (io) {
    io.to(`trip:${trip.id}`).emit('location:update', {
      id: created.id,
      tripId: created.tripId,
      truckId: created.truckId,
      lat: created.lat,
      lng: created.lng,
      speed: created.speed,
      heading: created.heading,
      source: created.source,
      recordedAt: created.recordedAt,
    });
  }
};

async function startSimulator(tripId, options = {}) {
  if (!GPS_SIMULATOR_ENABLED || activeSimulators.has(tripId)) {
    return;
  }

  const prismaClient = options.prismaClient || prisma;
  const trip = await prismaClient.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        orderBy: {
          sequence: 'asc',
        },
      },
    },
  });

  if (!trip || trip.status !== 'IN_TRANSIT') {
    return;
  }

  const waypoints = buildWaypointStream(trip);
  if (!waypoints.length) {
    return;
  }

  let index = 0;
  const interval = setInterval(async () => {
    try {
      const currentTrip = await prismaClient.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          truckId: true,
          status: true,
        },
      });

      if (!currentTrip || currentTrip.status !== 'IN_TRANSIT' || index >= waypoints.length) {
        stopSimulator(tripId);
        return;
      }

      await publishWaypoint(
        {
          id: tripId,
          truckId: currentTrip.truckId,
        },
        waypoints[index]
      );

      index += 1;

      if (index >= waypoints.length) {
        const io = getIO();
        if (io) {
          io.to(`trip:${tripId}`).emit('trip:route:complete', { tripId });
        }
        stopSimulator(tripId);
      }
    } catch (error) {
      console.warn(`[gps-simulator] failed for trip ${tripId}: ${error.message}`);
      stopSimulator(tripId);
    }
  }, options.intervalMs || GPS_UPDATE_INTERVAL_MS);

  activeSimulators.set(tripId, interval);
}

function stopSimulator(tripId) {
  const interval = activeSimulators.get(tripId);
  if (!interval) {
    return;
  }

  clearInterval(interval);
  activeSimulators.delete(tripId);
}

function stopAllSimulators() {
  for (const tripId of activeSimulators.keys()) {
    stopSimulator(tripId);
  }
}

function isSimulatorRunning(tripId) {
  return activeSimulators.has(tripId);
}

module.exports = {
  buildWaypointStream,
  isSimulatorRunning,
  startSimulator,
  stopAllSimulators,
  stopSimulator,
};
