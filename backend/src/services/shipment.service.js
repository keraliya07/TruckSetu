const prisma = require('../config/db');
const { BOOKING_TIMEOUT_HOURS } = require('../config/env');
const ApiError = require('../utils/apiError.utils');
const { resolveCityCoordinates } = require('../utils/cityCoordinates');
const notificationService = require('./notification.service');
const optimizationService = require('./optimization.service');

const shipmentInclude = {
  warehouse: true,
  tripShipments: {
    include: {
      trip: true,
    },
  },
  bookingShipments: {
    include: {
      bookingRequest: {
        include: {
          truck: {
            include: {
              dealer: true,
            },
          },
          trip: true,
        },
      },
    },
  },
};

const shipmentListInclude = {
  bookingShipments: {
    take: 1,
    include: {
      bookingRequest: {
        select: {
          id: true,
          status: true,
          trip: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  },
  tripShipments: {
    take: 1,
    include: {
      trip: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  },
};

const editableStatuses = new Set(['DRAFT']);
const allowedBatchStatuses = new Set(['DRAFT', 'PENDING', 'CANCELLED']);

const shipmentTypeMultipliers = {
  STANDARD: 1,
  FRAGILE: 1.08,
  HAZARDOUS: 1.15,
  TEMPERATURE_CONTROLLED: 1.12,
  EXPRESS: 1.18,
  BULK: 0.96,
};

const activeShipmentStatuses = [
  'PENDING',
  'BOOKING_PENDING',
  'BOOKING_CONFIRMED',
  'LOADING',
  'IN_TRANSIT',
];

const closedShipmentStatuses = ['DELIVERED', 'CANCELLED'];

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

const normalizeText = (value) => {
  const normalized = String(value || '').trim();
  return normalized ? normalized : null;
};

const normalizeShipmentType = (data) => {
  if (data.shipmentType) {
    return data.shipmentType;
  }

  if (data.hazardous) {
    return 'HAZARDOUS';
  }

  if (data.fragile) {
    return 'FRAGILE';
  }

  return 'STANDARD';
};

const resolveShipmentPayload = (data, warehouse) => {
  const pickupCity = normalizeText(data.pickupCity) || warehouse.city;
  const pickupAddress = normalizeText(data.pickupAddress) || warehouse.address;
  const pickupCoordinates = resolveCityCoordinates(pickupCity) || resolveCityCoordinates(warehouse.city);

  const deliveryCity = normalizeText(data.deliveryCity || data.destCity);
  const deliveryAddress = normalizeText(data.deliveryAddress || data.destAddress);
  const deliveryDeadline = new Date(data.deliveryDeadline || data.deadline);
  const pickupDeadline = data.pickupDeadline
    ? new Date(data.pickupDeadline)
    : new Date(deliveryDeadline.getTime() - 12 * 60 * 60 * 1000);

  return {
    title:
      normalizeText(data.title) ||
      `${pickupCity} to ${deliveryCity}`,
    description: normalizeText(data.description),
    weightKg: Number(data.weightKg),
    volumeM3: Number(data.volumeM3),
    originCity: pickupCity,
    originAddress: pickupAddress,
    originLat: Number(data.pickupLat ?? warehouse.latitude ?? pickupCoordinates?.lat ?? 0),
    originLng: Number(data.pickupLng ?? warehouse.longitude ?? pickupCoordinates?.lng ?? 0),
    destCity: deliveryCity,
    destAddress: deliveryAddress,
    destLat: Number(data.deliveryLat ?? data.destLat),
    destLng: Number(data.deliveryLng ?? data.destLng),
    deadline: deliveryDeadline,
    pickupDeadline,
    shipmentType: normalizeShipmentType(data),
    fragile: Boolean(data.fragile),
    hazardous: Boolean(data.hazardous),
    priority: Number(data.priority ?? 1),
    specialInstructions: normalizeText(data.specialInstructions),
  };
};

const calculateShipmentPricing = async (shipment, user) => {
  const estimate = await optimizationService.truckFitEstimate(
    {
      weightKg: shipment.weightKg,
      volumeM3: shipment.volumeM3,
      originCity: shipment.originCity,
      destCity: shipment.destCity,
    },
    user,
    { preferFast: true }
  );

  const typeMultiplier = shipmentTypeMultipliers[shipment.shipmentType] || 1;
  const handlingMultiplier =
    1 + (shipment.fragile ? 0.03 : 0) + (shipment.hazardous ? 0.05 : 0);
  const systemPrice = Math.max(
    1,
    Math.round(Number(estimate.estimatedCost || 0) * typeMultiplier * handlingMultiplier)
  );

  return {
    estimatedDistanceKm: Number(estimate.estimatedDistanceKm || 0),
    recommendedTruckType: estimate.recommendedType,
    systemPrice,
    pricingSource: estimate.estimationSource,
    availableTruckCount: estimate.availableTruckCount,
  };
};

const selectOptimizedDealers = (optimizationResponse, limit = 10) => {
  const selected = [];
  const seenDealers = new Set();

  for (const candidate of optimizationResponse?.trucks || []) {
    const dealerId = candidate.truck?.dealer?.id;
    if (!dealerId || seenDealers.has(dealerId)) {
      continue;
    }

    seenDealers.add(dealerId);
    selected.push(candidate);

    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
};

const buildDispatchSummary = (shipment, pricing, invitedRequests = [], workflowState = 'INVITED') => ({
  workflowState,
  systemPrice: pricing.systemPrice,
  estimatedDistanceKm: pricing.estimatedDistanceKm,
  shipmentType: shipment.shipmentType,
  invitedDealerCount: invitedRequests.length,
  invitedRequests: invitedRequests.map((request) => ({
    bookingId: request.id,
    status: request.status,
    quotedPrice: request.quotedPrice,
    truckId: request.truckId,
    truckRegistrationNo: request.truck?.registrationNo || null,
    dealerId: request.truck?.dealer?.id || null,
    dealerName: request.truck?.dealer?.companyName || null,
    expiresAt: request.expiresAt,
  })),
});

const getAll = async (filters, user) => {
  const page = Number.parseInt(filters.page || '1', 10);
  const limit = Math.min(Number.parseInt(filters.limit || '10', 10), 100);
  const skip = (page - 1) * limit;
  const requestedStatus = filters.status || null;
  const scopeStatuses =
    filters.scope === 'active'
      ? activeShipmentStatuses
      : filters.scope === 'closed'
        ? closedShipmentStatuses
        : null;

  const where = {
    ...(requestedStatus
      ? { status: requestedStatus }
      : scopeStatuses
        ? { status: { in: scopeStatuses } }
        : {}),
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
      include: shipmentListInclude,
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
  const shipmentPayload = resolveShipmentPayload(data, warehouse);
  const pricing = await calculateShipmentPricing(shipmentPayload, user);
  const referenceNo = `SHP-${Date.now()}`;

  const createdShipment = await prisma.shipment.create({
    data: {
      warehouseId: warehouse.id,
      createdById: user.userId,
      referenceNo,
      ...shipmentPayload,
      systemPrice: pricing.systemPrice,
      estimatedDistanceKm: pricing.estimatedDistanceKm,
      status: data.autoDispatch === false ? 'PENDING' : 'PENDING',
    },
    include: shipmentInclude,
  });

  if (data.autoDispatch === false) {
    return {
      ...createdShipment,
      dispatchSummary: buildDispatchSummary(createdShipment, pricing, [], 'PENDING_ONLY'),
    };
  }

  let optimizationResponse;

  try {
    optimizationResponse = await optimizationService.scoreTrucks(
      {
        shipmentIds: [createdShipment.id],
        forceRefresh: true,
      },
      user,
      { lightweight: true }
    );
  } catch (error) {
    const noEligibleDealers =
      error instanceof ApiError &&
      error.statusCode === 400 &&
      error.message.includes('No available trucks');

    if (!noEligibleDealers) {
      throw error;
    }
  }

  const selectedCandidates = selectOptimizedDealers(optimizationResponse, 10);

  if (!selectedCandidates.length) {
    // Only fetch once for the no-eligible-dealers case
    const pendingShipment = await getShipmentById(createdShipment.id, warehouse.id);
    return {
      ...pendingShipment,
      dispatchSummary: buildDispatchSummary(pendingShipment, pricing, [], 'NO_ELIGIBLE_DEALERS'),
    };
  }

  // ── Batch-create booking requests (replaces sequential for-loop) ─────────
  const expiresAt = new Date(Date.now() + BOOKING_TIMEOUT_HOURS * 60 * 60 * 1000);

  const invitedRequests = await prisma.$transaction(
    async (tx) => {
      await tx.shipment.update({
        where: { id: createdShipment.id },
        data: {
          status: 'BOOKING_PENDING',
        },
      });

      // Batch-create all booking requests at once
      await tx.bookingRequest.createMany({
        data: selectedCandidates.map((candidate) => ({
          warehouseId: warehouse.id,
          requestedById: user.userId,
          truckId: candidate.truck.id,
          optimizationRunId: optimizationResponse.optimizationRunId || null,
          optimizationCandidateId: candidate.id || null,
          status: 'SENT',
          quotedPrice: pricing.systemPrice,
          expiresAt,
        })),
      });

      // Fetch the created requests with truck/dealer includes
      const requests = await tx.bookingRequest.findMany({
        where: {
          warehouseId: warehouse.id,
          truckId: { in: selectedCandidates.map((c) => c.truck.id) },
          status: 'SENT',
          expiresAt,
        },
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
        },
      });

      // Link shipments to booking requests in batch
      await tx.bookingShipment.createMany({
        data: requests.map((request) => ({
          bookingRequestId: request.id,
          shipmentId: createdShipment.id,
        })),
      });

      return requests;
    },
    { timeout: 20000 }
  );

  // ── Fire notifications in background (don't block the response) ──────────
  setImmediate(() => {
    Promise.all(
      invitedRequests.map((request) =>
        notificationService.sendNotification({
          userId: request.truck.dealer.user?.id,
          type: 'BOOKING',
          title: 'New shipment request',
          message: `A new shipment request is available for truck ${request.truck.registrationNo}.`,
          link: `/dealer/bookings/${request.id}`,
          metadata: {
            bookingId: request.id,
            shipmentId: createdShipment.id,
          },
          email: {
            subject: 'TruckSetu shipment request received',
            text: `Shipment ${createdShipment.referenceNo} was sent for truck ${request.truck.registrationNo}.`,
          },
        })
      )
    ).catch((err) => {
      console.warn(`[shipment] background notification failed: ${err.message}`);
    });
  });

  // Single final fetch for the complete dispatched shipment
  const dispatchedShipment = await getShipmentById(createdShipment.id, warehouse.id);

  return {
    ...dispatchedShipment,
    dispatchSummary: buildDispatchSummary(dispatchedShipment, pricing, invitedRequests),
  };
};

const update = async (shipmentId, data, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const shipment = await getShipmentById(shipmentId, warehouse.id);

  if (!editableStatuses.has(shipment.status)) {
    throw ApiError.badRequest('Only DRAFT shipments can be updated');
  }

  const nextFields = resolveShipmentPayload(
    {
      ...shipment,
      ...data,
      deliveryCity: data.deliveryCity ?? data.destCity ?? shipment.destCity,
      deliveryAddress: data.deliveryAddress ?? data.destAddress ?? shipment.destAddress,
      deliveryLat: data.deliveryLat ?? data.destLat ?? shipment.destLat,
      deliveryLng: data.deliveryLng ?? data.destLng ?? shipment.destLng,
      deliveryDeadline: data.deliveryDeadline ?? data.deadline ?? shipment.deadline,
      pickupCity: data.pickupCity ?? shipment.originCity,
      pickupAddress: data.pickupAddress ?? shipment.originAddress,
      pickupLat: data.pickupLat ?? shipment.originLat,
      pickupLng: data.pickupLng ?? shipment.originLng,
      pickupDeadline: data.pickupDeadline ?? shipment.pickupDeadline ?? shipment.deadline,
      shipmentType: data.shipmentType ?? shipment.shipmentType,
    },
    warehouse
  );

  const pricing = await calculateShipmentPricing(nextFields, user);

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      ...nextFields,
      systemPrice: pricing.systemPrice,
      estimatedDistanceKm: pricing.estimatedDistanceKm,
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
    const invalidSource = shipments.some((shipment) =>
      !['DRAFT', 'PENDING', 'BOOKING_PENDING'].includes(shipment.status)
    );

    if (invalidSource) {
      throw ApiError.badRequest(
        'Only DRAFT, PENDING, or closed BOOKING_PENDING shipments can be marked PENDING'
      );
    }

    const bookingPendingIds = shipments
      .filter((shipment) => shipment.status === 'BOOKING_PENDING')
      .map((shipment) => shipment.id);

    if (bookingPendingIds.length) {
      const openRequests = await prisma.bookingRequest.count({
        where: {
          status: 'SENT',
          shipments: {
            some: {
              shipmentId: {
                in: bookingPendingIds,
              },
            },
          },
        },
      });

      if (openRequests > 0) {
        throw ApiError.badRequest(
          'Shipments with active dealer requests cannot be moved back to pending'
        );
      }
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

  await prisma.$transaction(
    async (tx) => {
      await tx.shipment.updateMany({
        where: {
          id: { in: shipmentIds },
          warehouseId: warehouse.id,
        },
        data: { status },
      });

      if (status === 'CANCELLED') {
        const pendingRequests = await tx.bookingRequest.findMany({
          where: {
            status: 'SENT',
            shipments: {
              some: {
                shipmentId: {
                  in: shipmentIds,
                },
              },
            },
          },
          select: {
            id: true,
          },
        });

        if (pendingRequests.length) {
          await tx.bookingRequest.updateMany({
            where: {
              id: {
                in: pendingRequests.map((request) => request.id),
              },
            },
            data: {
              status: 'CANCELLED',
              respondedAt: new Date(),
            },
          });
        }
      }
    },
    { timeout: 20000 }
  );

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
