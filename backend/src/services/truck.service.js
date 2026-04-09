const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');
const { resolveCityCoordinates } = require('../utils/cityCoordinates');

const truckInclude = {
  dealer: true,
  trips: {
    take: 10,
    orderBy: { createdAt: 'desc' },
  },
};

const truckListInclude = {
  dealer: {
    select: {
      id: true,
      companyName: true,
      primaryCity: true,
    },
  },
  trips: {
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
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

const getTruckById = async (truckId, dealerId) => {
  const truck = await prisma.truck.findFirst({
    where: {
      id: truckId,
      dealerId,
      isActive: true,
    },
    include: truckInclude,
  });

  if (!truck) {
    throw ApiError.notFound('Truck not found');
  }

  return truck;
};

const getAll = async (filters, user) => {
  const page = Number.parseInt(filters.page || '1', 10);
  const limit = Math.min(Number.parseInt(filters.limit || '10', 10), 100);
  const skip = (page - 1) * limit;
  let where;
  let include = truckListInclude;

  if (user.role === 'DEALER') {
    const dealer = await getDealerProfile(user.userId);
    where = {
      dealerId: dealer.id,
      isActive: true,
      ...(filters.status ? { status: filters.status } : {}),
    };
  } else if (user.role === 'WAREHOUSE') {
    where = {
      isActive: true,
      ...(filters.status ? { status: filters.status } : { status: 'AVAILABLE' }),
    };
    include = {
      dealer: truckListInclude.dealer,
    };
  } else if (user.role === 'ADMIN') {
    where = {
      isActive: true,
      ...(filters.status ? { status: filters.status } : {}),
    };
  } else {
    throw ApiError.forbidden('You cannot access truck listings');
  }

  const [trucks, total] = await prisma.$transaction([
    prisma.truck.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include,
    }),
    prisma.truck.count({ where }),
  ]);

  return { trucks, total, page, limit };
};

const getById = async (truckId, user) => {
  if (user.role === 'DEALER') {
    const dealer = await getDealerProfile(user.userId);
    return getTruckById(truckId, dealer.id);
  }

  if (['WAREHOUSE', 'ADMIN'].includes(user.role)) {
    const truck = await prisma.truck.findFirst({
      where: {
        id: truckId,
        isActive: true,
      },
      include: {
        dealer: true,
      },
    });

    if (!truck) {
      throw ApiError.notFound('Truck not found');
    }

    return truck;
  }

  throw ApiError.forbidden('You cannot access truck details');
};

const create = async (data, user) => {
  const dealer = await getDealerProfile(user.userId);
  const currentLocation = resolveCityCoordinates(data.currentCity || dealer.primaryCity);

  const existingTruck = await prisma.truck.findUnique({
    where: { registrationNo: data.registrationNo },
  });

  if (existingTruck) {
    throw ApiError.conflict('Truck registration already exists');
  }

  return prisma.truck.create({
    data: {
      dealerId: dealer.id,
      registrationNo: data.registrationNo,
      truckType: data.truckType,
      maxWeightKg: data.maxWeightKg,
      maxVolumeM3: data.maxVolumeM3,
      emissionFactor: data.emissionFactor ?? 2.68,
      fuelEfficiency: data.fuelEfficiency ?? 4.0,
      currentCity: currentLocation?.city || data.currentCity || dealer.primaryCity,
      currentLat: data.currentLat ?? currentLocation?.lat ?? dealer.primaryLat ?? null,
      currentLng: data.currentLng ?? currentLocation?.lng ?? dealer.primaryLng ?? null,
      status: 'AVAILABLE',
      isActive: true,
    },
    include: truckInclude,
  });
};

const update = async (truckId, data, user) => {
  const dealer = await getDealerProfile(user.userId);
  await getTruckById(truckId, dealer.id);
  const currentLocation =
    data.currentCity !== undefined ? resolveCityCoordinates(data.currentCity) : null;

  if (data.registrationNo) {
    const existingTruck = await prisma.truck.findFirst({
      where: {
        registrationNo: data.registrationNo,
        id: { not: truckId },
      },
    });

    if (existingTruck) {
      throw ApiError.conflict('Truck registration already exists');
    }
  }

  return prisma.truck.update({
    where: { id: truckId },
    data: {
      ...(data.registrationNo !== undefined
        ? { registrationNo: data.registrationNo }
        : {}),
      ...(data.truckType !== undefined ? { truckType: data.truckType } : {}),
      ...(data.maxWeightKg !== undefined ? { maxWeightKg: data.maxWeightKg } : {}),
      ...(data.maxVolumeM3 !== undefined ? { maxVolumeM3: data.maxVolumeM3 } : {}),
      ...(data.emissionFactor !== undefined
        ? { emissionFactor: data.emissionFactor }
        : {}),
      ...(data.fuelEfficiency !== undefined
        ? { fuelEfficiency: data.fuelEfficiency }
        : {}),
      ...(data.currentCity !== undefined
        ? { currentCity: currentLocation?.city || data.currentCity || null }
        : {}),
      ...(data.currentLat !== undefined
        ? { currentLat: data.currentLat }
        : currentLocation
          ? { currentLat: currentLocation.lat }
          : {}),
      ...(data.currentLng !== undefined
        ? { currentLng: data.currentLng }
        : currentLocation
          ? { currentLng: currentLocation.lng }
          : {}),
    },
    include: truckInclude,
  });
};

const updateStatus = async (truckId, { status }, user) => {
  const dealer = await getDealerProfile(user.userId);
  const truck = await getTruckById(truckId, dealer.id);

  if (truck.status === 'ON_TRIP' && status === 'AVAILABLE') {
    throw ApiError.badRequest('Truck cannot be marked AVAILABLE while it is ON_TRIP');
  }

  return prisma.truck.update({
    where: { id: truckId },
    data: { status },
    include: truckInclude,
  });
};

const remove = async (truckId, user) => {
  const dealer = await getDealerProfile(user.userId);
  const truck = await getTruckById(truckId, dealer.id);

  const hasActiveTrips = truck.trips.some((trip) =>
    ['PLANNED', 'IN_TRANSIT'].includes(trip.status)
  );

  if (hasActiveTrips || truck.status === 'ON_TRIP') {
    throw ApiError.badRequest('Truck with active trips cannot be removed');
  }

  await prisma.truck.update({
    where: { id: truckId },
    data: {
      isActive: false,
      status: 'INACTIVE',
    },
  });

  return { success: true };
};

module.exports = {
  create,
  getAll,
  getById,
  remove,
  update,
  updateStatus,
};
