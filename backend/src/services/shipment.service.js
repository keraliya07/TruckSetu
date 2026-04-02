const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');

const shipmentInclude = {
  warehouse: true,
  tripShipments: {
    include: {
      trip: true,
    },
  },
  bookingShipments: {
    include: {
      bookingRequest: true,
    },
  },
};

const editableStatuses = new Set(['DRAFT']);
const allowedBatchStatuses = new Set(['DRAFT', 'PENDING', 'CANCELLED']);

const getWarehouseProfile = async (userId) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { userId },
  });

  if (!warehouse) {
    throw ApiError.forbidden('Warehouse profile is not set up for this user');
  }

  return warehouse;
};

const getShipmentById = async (shipmentId, warehouseId) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      warehouseId,
    },
    include: shipmentInclude,
  });

  if (!shipment) {
    throw ApiError.notFound('Shipment not found');
  }

  return shipment;
};

const getAll = async (filters, user) => {
  const page = Number.parseInt(filters.page || '1', 10);
  const limit = Math.min(Number.parseInt(filters.limit || '10', 10), 100);
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { destCity: { contains: filters.search, mode: 'insensitive' } },
            { referenceNo: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  if (user.role === 'WAREHOUSE') {
    const warehouse = await getWarehouseProfile(user.userId);
    where.warehouseId = warehouse.id;
  } else if (user.role !== 'ADMIN') {
    throw ApiError.forbidden('You cannot access shipment listings');
  }

  const [shipments, total] = await prisma.$transaction([
    prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: shipmentInclude,
    }),
    prisma.shipment.count({ where }),
  ]);

  return { shipments, total, page, limit };
};

const getById = async (shipmentId, user) => {
  if (user.role === 'ADMIN') {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: shipmentInclude,
    });

    if (!shipment) {
      throw ApiError.notFound('Shipment not found');
    }

    return shipment;
  }

  const warehouse = await getWarehouseProfile(user.userId);
  return getShipmentById(shipmentId, warehouse.id);
};

const create = async (data, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const referenceNo = `SHP-${Date.now()}`;

  return prisma.shipment.create({
    data: {
      warehouseId: warehouse.id,
      createdById: user.userId,
      referenceNo,
      title: data.title || `${warehouse.city} to ${data.destCity}`,
      description: data.description || null,
      weightKg: data.weightKg,
      volumeM3: data.volumeM3,
      originCity: warehouse.city,
      originAddress: warehouse.address,
      originLat: warehouse.latitude || 0,
      originLng: warehouse.longitude || 0,
      destCity: data.destCity,
      destAddress: data.destAddress || null,
      destLat: data.destLat,
      destLng: data.destLng,
      deadline: data.deadline,
      fragile: data.fragile ?? false,
      hazardous: data.hazardous ?? false,
      priority: data.priority ?? 1,
      specialInstructions: data.specialInstructions || null,
      status: 'DRAFT',
    },
    include: shipmentInclude,
  });
};

const update = async (shipmentId, data, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const shipment = await getShipmentById(shipmentId, warehouse.id);

  if (!editableStatuses.has(shipment.status)) {
    throw ApiError.badRequest('Only DRAFT shipments can be updated');
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      ...(data.title !== undefined ? { title: data.title || null } : {}),
      ...(data.description !== undefined
        ? { description: data.description || null }
        : {}),
      ...(data.weightKg !== undefined ? { weightKg: data.weightKg } : {}),
      ...(data.volumeM3 !== undefined ? { volumeM3: data.volumeM3 } : {}),
      ...(data.destCity !== undefined ? { destCity: data.destCity } : {}),
      ...(data.destAddress !== undefined
        ? { destAddress: data.destAddress || null }
        : {}),
      ...(data.destLat !== undefined ? { destLat: data.destLat } : {}),
      ...(data.destLng !== undefined ? { destLng: data.destLng } : {}),
      ...(data.deadline !== undefined ? { deadline: data.deadline } : {}),
      ...(data.fragile !== undefined ? { fragile: data.fragile } : {}),
      ...(data.hazardous !== undefined ? { hazardous: data.hazardous } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.specialInstructions !== undefined
        ? { specialInstructions: data.specialInstructions || null }
        : {}),
    },
    include: shipmentInclude,
  });
};

const remove = async (shipmentId, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const shipment = await getShipmentById(shipmentId, warehouse.id);

  if (!editableStatuses.has(shipment.status)) {
    throw ApiError.badRequest('Only DRAFT shipments can be deleted');
  }

  await prisma.shipment.delete({
    where: { id: shipmentId },
  });

  return { success: true };
};

const batchUpdateStatus = async ({ shipmentIds, status }, user) => {
  const warehouse = await getWarehouseProfile(user.userId);

  if (!allowedBatchStatuses.has(status)) {
    throw ApiError.badRequest('Unsupported shipment status update');
  }

  const shipments = await prisma.shipment.findMany({
    where: {
      id: { in: shipmentIds },
      warehouseId: warehouse.id,
    },
  });

  if (shipments.length !== shipmentIds.length) {
    throw ApiError.notFound('One or more shipments were not found');
  }

  if (status === 'DRAFT') {
    const nonEditable = shipments.some((shipment) => shipment.status !== 'PENDING');
    if (nonEditable) {
      throw ApiError.badRequest('Only PENDING shipments can move back to DRAFT');
    }
  }

  if (status === 'PENDING') {
    const invalidSource = shipments.some((shipment) => !['DRAFT', 'PENDING'].includes(shipment.status));
    if (invalidSource) {
      throw ApiError.badRequest('Only DRAFT or PENDING shipments can be marked PENDING');
    }
  }

  if (status === 'CANCELLED') {
    const invalidSource = shipments.some((shipment) =>
      ['BOOKING_CONFIRMED', 'LOADING', 'IN_TRANSIT', 'DELIVERED'].includes(
        shipment.status
      )
    );
    if (invalidSource) {
      throw ApiError.badRequest('Active or delivered shipments cannot be cancelled');
    }
  }

  await prisma.shipment.updateMany({
    where: {
      id: { in: shipmentIds },
      warehouseId: warehouse.id,
    },
    data: { status },
  });

  const updatedShipments = await prisma.shipment.findMany({
    where: { id: { in: shipmentIds } },
    include: shipmentInclude,
    orderBy: { createdAt: 'desc' },
  });

  return {
    success: true,
    count: updatedShipments.length,
    shipments: updatedShipments,
  };
};

module.exports = {
  batchUpdateStatus,
  create,
  getAll,
  getById,
  remove,
  update,
};
