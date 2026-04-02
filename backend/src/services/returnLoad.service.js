const prisma = require('../config/db');
const { RETURN_LOAD_EXPIRY_HOURS } = require('../config/env');
const notificationService = require('./notification.service');
const ApiError = require('../utils/apiError.utils');

const getIO = () => require('../config/socket').getIO?.() || null;

const matchInclude = {
  trip: {
    include: {
      truck: {
        include: {
          dealer: {
            include: {
              user: true,
            },
          },
        },
      },
      bookingRequest: {
        include: {
          warehouse: true,
        },
      },
      stops: {
        orderBy: {
          sequence: 'asc',
        },
      },
    },
  },
  shipment: {
    include: {
      warehouse: true,
    },
  },
};

const toRadians = (value) => (value * Math.PI) / 180;

const haversineKm = (fromLat, fromLng, toLat, toLng) => {
  if (
    [fromLat, fromLng, toLat, toLng].some(
      (value) => typeof value !== 'number' || Number.isNaN(value)
    )
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

const getTripOrThrow = async (tripId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      truck: {
        include: {
          dealer: {
            include: {
              user: true,
            },
          },
        },
      },
      bookingRequest: {
        include: {
          warehouse: true,
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
      returnLoadMatches: true,
    },
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  return trip;
};

const getLastStop = (trip) =>
  [...trip.stops].sort((left, right) => right.sequence - left.sequence)[0] || null;

const getTruckPosition = (trip, lastStop) => ({
  lat:
    trip.status === 'DELIVERED'
      ? lastStop?.lat ?? trip.truck.currentLat ?? trip.truck.dealer.primaryLat ?? 0
      : trip.truck.currentLat ?? lastStop?.lat ?? trip.truck.dealer.primaryLat ?? 0,
  lng:
    trip.status === 'DELIVERED'
      ? lastStop?.lng ?? trip.truck.currentLng ?? trip.truck.dealer.primaryLng ?? 0
      : trip.truck.currentLng ?? lastStop?.lng ?? trip.truck.dealer.primaryLng ?? 0,
});

const clampScore = (value) => Math.max(0, Math.min(100, value));

const scoreCandidateShipment = (trip, shipment, truckPosition, homeBase) => {
  const pickupDistanceKm = haversineKm(
    truckPosition.lat,
    truckPosition.lng,
    shipment.originLat,
    shipment.originLng
  );
  const homeDistanceFromDropKm =
    homeBase.lat != null && homeBase.lng != null
      ? haversineKm(truckPosition.lat, truckPosition.lng, homeBase.lat, homeBase.lng)
      : null;
  const homeDistanceFromShipmentDestKm =
    homeBase.lat != null && homeBase.lng != null
      ? haversineKm(shipment.destLat, shipment.destLng, homeBase.lat, homeBase.lng)
      : null;

  const proximityScore = clampScore(100 - pickupDistanceKm * 0.65);
  const directionScore =
    homeDistanceFromDropKm != null && homeDistanceFromShipmentDestKm != null
      ? clampScore(
          100 -
            Math.max(0, homeDistanceFromShipmentDestKm - homeDistanceFromDropKm) * 0.18
        )
      : 68;
  const weightUtilization = (shipment.weightKg / trip.truck.maxWeightKg) * 100;
  const volumeUtilization = (shipment.volumeM3 / trip.truck.maxVolumeM3) * 100;
  const utilizationScore = clampScore(
    Math.max(weightUtilization, volumeUtilization * 0.92)
  );
  const combinedScore = Number(
    (
      proximityScore * 0.42 +
      directionScore * 0.33 +
      utilizationScore * 0.25
    ).toFixed(2)
  );

  return {
    shipment,
    pickupDistanceKm: Number(pickupDistanceKm.toFixed(2)),
    proximityScore: Number(proximityScore.toFixed(2)),
    directionScore: Number(directionScore.toFixed(2)),
    utilizationScore: Number(utilizationScore.toFixed(2)),
    combinedScore,
  };
};

const buildTripStops = (shipment) => [
  {
    sequence: 1,
    type: 'PICKUP',
    status: 'PENDING',
    city: shipment.originCity,
    address: shipment.originAddress,
    lat: shipment.originLat,
    lng: shipment.originLng,
  },
  {
    sequence: 2,
    type: 'DELIVERY',
    status: 'PENDING',
    city: shipment.destCity,
    address: shipment.destAddress,
    lat: shipment.destLat,
    lng: shipment.destLng,
    shipmentId: shipment.id,
  },
];

const markExpiredMatches = async (tripId) => {
  await prisma.returnLoadMatch.updateMany({
    where: {
      tripId,
      status: 'PENDING',
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });
};

const createReturnLoadNotification = async (trip, count) => {
  const dealerUserId = trip.truck.dealer.user?.id;
  if (!dealerUserId || count === 0) {
    return;
  }

  await notificationService.sendNotification({
    userId: dealerUserId,
    type: 'RETURN_LOAD',
    title: 'Return load opportunities ready',
    message: `${count} return load match(es) are available near ${getLastStop(trip)?.city || 'your drop point'}.`,
    link: `/dealer/return-loads?tripId=${trip.id}`,
    metadata: {
      tripId: trip.id,
      count,
    },
  });

  const io = getIO();
  if (io) {
    io.to(`user:${dealerUserId}`).emit('returnLoad:available', {
      tripId: trip.id,
      count,
    });
  }
};

const findReturnLoads = async (tripId) => {
  const trip = await getTripOrThrow(tripId);

  if (trip.status !== 'DELIVERED') {
    return { matches: [], trip };
  }

  await markExpiredMatches(tripId);

  const lastStop = getLastStop(trip);
  if (!lastStop) {
    return { matches: [], trip };
  }

  const truckPosition = getTruckPosition(trip, lastStop);
  const homeBase = {
    lat: trip.truck.dealer.primaryLat,
    lng: trip.truck.dealer.primaryLng,
  };
  const existingMatches = await prisma.returnLoadMatch.findMany({
    where: {
      tripId,
    },
    select: {
      shipmentId: true,
      status: true,
    },
  });
  const excludedShipmentIds = new Set(existingMatches.map((match) => match.shipmentId));
  trip.shipments.forEach((entry) => excludedShipmentIds.add(entry.shipmentId));

  const pendingShipments = await prisma.shipment.findMany({
    where: {
      status: 'PENDING',
      id: {
        notIn: [...excludedShipmentIds],
      },
      weightKg: {
        lte: trip.truck.maxWeightKg,
      },
      volumeM3: {
        lte: trip.truck.maxVolumeM3,
      },
      deadline: {
        gt: new Date(),
      },
    },
    include: {
      warehouse: true,
    },
  });

  const scoredMatches = pendingShipments
    .map((shipment) => scoreCandidateShipment(trip, shipment, truckPosition, homeBase))
    .filter((candidate) => candidate.pickupDistanceKm <= 180 && candidate.combinedScore >= 45)
    .sort((left, right) => right.combinedScore - left.combinedScore)
    .slice(0, 6);

  if (!scoredMatches.length) {
    return { matches: [], trip };
  }

  const expiresAt = new Date(Date.now() + RETURN_LOAD_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.$transaction(
    scoredMatches.map((candidate) =>
      prisma.returnLoadMatch.upsert({
        where: {
          tripId_shipmentId: {
            tripId,
            shipmentId: candidate.shipment.id,
          },
        },
        create: {
          tripId,
          shipmentId: candidate.shipment.id,
          proximityScore: candidate.proximityScore,
          directionScore: candidate.directionScore,
          utilizationScore: candidate.utilizationScore,
          combinedScore: candidate.combinedScore,
          expiresAt,
          status: 'PENDING',
        },
        update: {
          proximityScore: candidate.proximityScore,
          directionScore: candidate.directionScore,
          utilizationScore: candidate.utilizationScore,
          combinedScore: candidate.combinedScore,
          expiresAt,
          status: 'PENDING',
          acceptedAt: null,
          rejectedAt: null,
        },
      })
    )
  );

  const matches = await prisma.returnLoadMatch.findMany({
    where: {
      tripId,
      shipmentId: {
        in: scoredMatches.map((candidate) => candidate.shipment.id),
      },
    },
    include: matchInclude,
    orderBy: [{ combinedScore: 'desc' }, { createdAt: 'desc' }],
  });

  await createReturnLoadNotification(trip, matches.length);

  return { matches, trip };
};

const getMatches = async (filters, user) => {
  const dealer = await getDealerProfile(user.userId);

  if (filters.tripId) {
    const trip = await getTripOrThrow(filters.tripId);
    if (trip.dealerId !== dealer.id) {
      throw ApiError.forbidden('You cannot access this trip');
    }

    if (trip.status === 'DELIVERED') {
      await findReturnLoads(filters.tripId);
    }
  }

  await prisma.returnLoadMatch.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        lt: new Date(),
      },
      trip: {
        dealerId: dealer.id,
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  const matches = await prisma.returnLoadMatch.findMany({
    where: {
      trip: {
        dealerId: dealer.id,
      },
      ...(filters.tripId ? { tripId: filters.tripId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: matchInclude,
    orderBy: [{ combinedScore: 'desc' }, { createdAt: 'desc' }],
    take: filters.limit,
  });

  return {
    matches: matches.map((match) => ({
      ...match,
      pickupDistanceKm: Number(
        haversineKm(
          match.trip.truck.currentLat ?? getLastStop(match.trip)?.lat ?? 0,
          match.trip.truck.currentLng ?? getLastStop(match.trip)?.lng ?? 0,
          match.shipment.originLat,
          match.shipment.originLng
        ).toFixed(2)
      ),
    })),
  };
};

const getMatchOrThrow = async (matchId, user) => {
  const dealer = await getDealerProfile(user.userId);
  const match = await prisma.returnLoadMatch.findUnique({
    where: { id: matchId },
    include: matchInclude,
  });

  if (!match) {
    throw ApiError.notFound('Return load match not found');
  }

  if (match.trip.dealerId !== dealer.id) {
    throw ApiError.forbidden('You cannot access this return load match');
  }

  return match;
};

const ensureActionableMatch = (match) => {
  if (match.status !== 'PENDING') {
    throw ApiError.badRequest('This return load match is no longer actionable');
  }

  if (match.expiresAt && match.expiresAt <= new Date()) {
    throw ApiError.badRequest('This return load match has expired');
  }
};

const acceptMatch = async (matchId, user) => {
  const match = await getMatchOrThrow(matchId, user);
  ensureActionableMatch(match);

  if (match.trip.truck.status !== 'AVAILABLE') {
    throw ApiError.badRequest('Truck is no longer available for a return load');
  }

  if (match.shipment.status !== 'PENDING') {
    throw ApiError.badRequest('Shipment is no longer available for booking');
  }

  const booking = await prisma.$transaction(
    async (tx) => {
      const createdBooking = await tx.bookingRequest.create({
        data: {
          warehouseId: match.shipment.warehouseId,
          requestedById:
            match.shipment.createdById || match.trip.bookingRequest?.requestedById,
          truckId: match.trip.truckId,
          status: 'PRE_APPROVED',
          quotedPrice: Number(
            (
              (match.trip.truck.dealer.baseRatePerKmTon || 8) *
              Math.max(match.shipment.weightKg / 1000, 1) *
              Math.max(match.combinedScore / 25, 1.2)
            ).toFixed(2)
          ),
          finalPrice: Number(
            (
              (match.trip.truck.dealer.baseRatePerKmTon || 8) *
              Math.max(match.shipment.weightKg / 1000, 1) *
              Math.max(match.combinedScore / 25, 1.2)
            ).toFixed(2)
          ),
          approvedAt: new Date(),
          respondedAt: new Date(),
          shipments: {
            create: {
              shipmentId: match.shipmentId,
            },
          },
        },
        include: {
          shipments: {
            include: {
              shipment: true,
            },
          },
          truck: true,
        },
      });

      await tx.trip.create({
        data: {
          bookingRequestId: createdBooking.id,
          truckId: match.trip.truckId,
          dealerId: match.trip.dealerId,
          status: 'PLANNED',
          estimatedCost: createdBooking.finalPrice,
          estimatedDistanceKm: Number(
            (
              haversineKm(
                match.shipment.originLat,
                match.shipment.originLng,
                match.shipment.destLat,
                match.shipment.destLng
              ) || 0
            ).toFixed(2)
          ),
          shipments: {
            create: {
              shipmentId: match.shipmentId,
            },
          },
          stops: {
            create: buildTripStops(match.shipment),
          },
        },
      });

      await tx.shipment.update({
        where: { id: match.shipmentId },
        data: {
          status: 'BOOKING_CONFIRMED',
        },
      });

      await tx.truck.update({
        where: { id: match.trip.truckId },
        data: {
          status: 'ON_TRIP',
          currentCity: match.shipment.originCity,
          currentLat: match.shipment.originLat,
          currentLng: match.shipment.originLng,
        },
      });

      await tx.returnLoadMatch.update({
        where: { id: matchId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      await tx.returnLoadMatch.updateMany({
        where: {
          tripId: match.tripId,
          id: {
            not: matchId,
          },
          status: 'PENDING',
        },
        data: {
          status: 'EXPIRED',
        },
      });

      return tx.bookingRequest.findUnique({
        where: { id: createdBooking.id },
        include: {
          warehouse: true,
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
            },
          },
        },
      });
    },
    { timeout: 20000 }
  );

  await notificationService.sendNotification({
    userId: match.shipment.createdById || match.trip.bookingRequest?.requestedById,
    type: 'RETURN_LOAD',
    title: 'Return load accepted',
    message: `Dealer accepted a return load for ${match.shipment.destCity}.`,
    link: `/warehouse/bookings/${booking.id}`,
    metadata: {
      bookingId: booking.id,
      tripId: booking.trip?.id,
      shipmentId: match.shipmentId,
    },
  });

  return {
    bookingRequest: booking,
    newTrip: booking.trip,
  };
};

const rejectMatch = async (matchId, user) => {
  const match = await getMatchOrThrow(matchId, user);
  ensureActionableMatch(match);

  const updated = await prisma.returnLoadMatch.update({
    where: { id: matchId },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
    },
    include: matchInclude,
  });

  return {
    message: 'Return load rejected',
    match: updated,
  };
};

module.exports = {
  acceptMatch,
  findReturnLoads,
  getMatches,
  rejectMatch,
};
