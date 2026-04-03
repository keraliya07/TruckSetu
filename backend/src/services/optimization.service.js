const crypto = require('crypto');

const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');
const {
  MlServiceError,
  getDistanceMatrix,
  predictPrice,
  scoreCO2,
  scoreTrucks: scoreWithMl,
  solveRoute,
} = require('./ml.service');

const truckInclude = {
  dealer: true,
};

const runInclude = {
  shipments: {
    include: {
      shipment: true,
    },
  },
  candidates: {
    orderBy: { rank: 'asc' },
    include: {
      truck: {
        include: {
          dealer: true,
        },
      },
    },
  },
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeCity = (value) => String(value || '').trim().toLowerCase();

const getWarehouseProfile = async (userId) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { userId },
  });

  if (!warehouse) {
    throw ApiError.forbidden('Warehouse profile is not set up for this user');
  }

  return warehouse;
};

const haversineKm = (start, end) => {
  if (!start || !end) {
    return 0;
  }

  const toRadians = (value) => (Number(value) * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDiff = toRadians(Number(end.lat) - Number(start.lat));
  const lngDiff = toRadians(Number(end.lng) - Number(start.lng));
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDiff / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDuration = (minutes) => {
  const safeMinutes = Math.max(Math.round(minutes || 0), 1);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (!hours) {
    return `${remainingMinutes}m`;
  }

  if (!remainingMinutes) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const uniqueDestinations = (shipments) =>
  [...new Map(shipments.map((shipment) => [shipment.destCity, shipment])).values()];

const toRouteStop = (item, sequence) => ({
  sequence,
  type: item.type,
  city: item.city,
  address: item.address || null,
  lat: item.lat,
  lng: item.lng,
  status: 'PENDING',
  shipmentId: item.shipmentId || null,
});

const buildHeuristicRoute = (shipments, truck) => {
  const pickup = shipments[0];
  const truckPosition = {
    lat:
      truck.currentLat ??
      truck.dealer?.primaryLat ??
      pickup.originLat,
    lng:
      truck.currentLng ??
      truck.dealer?.primaryLng ??
      pickup.originLng,
  };

  const destinations = uniqueDestinations(shipments).map((shipment) => ({
    type: 'DELIVERY',
    city: shipment.destCity,
    address: shipment.destAddress,
    lat: shipment.destLat,
    lng: shipment.destLng,
    shipmentId: shipment.id,
  }));

  const orderedDestinations = [];
  const remaining = [...destinations];
  let cursor = {
    lat: pickup.originLat,
    lng: pickup.originLng,
  };

  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    remaining.forEach((candidate, index) => {
      const nextDistance = haversineKm(cursor, candidate);
      if (nextDistance < bestDistance) {
        bestDistance = nextDistance;
        bestIndex = index;
      }
    });

    const [nextStop] = remaining.splice(bestIndex, 1);
    orderedDestinations.push(nextStop);
    cursor = nextStop;
  }

  const rawStops = [
    {
      type: 'PICKUP',
      city: pickup.originCity,
      address: pickup.originAddress,
      lat: pickup.originLat,
      lng: pickup.originLng,
    },
    ...orderedDestinations,
  ];

  const points = [truckPosition, ...rawStops];
  let totalDistanceKm = 0;

  for (let index = 1; index < points.length; index += 1) {
    totalDistanceKm += haversineKm(points[index - 1], points[index]);
  }

  totalDistanceKm = Math.max(totalDistanceKm * 1.18, 12);
  const estimatedDurationMin = Math.max(Math.round((totalDistanceKm / 42) * 60), 45);

  return {
    stops: rawStops.map((stop, index) => toRouteStop(stop, index + 1)),
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    estimatedDuration: formatDuration(estimatedDurationMin),
    estimatedDurationMin,
    loadWeightKg: shipments.reduce((sum, shipment) => sum + Number(shipment.weightKg || 0), 0),
    loadVolumeM3: shipments.reduce((sum, shipment) => sum + Number(shipment.volumeM3 || 0), 0),
    truckPosition,
    feasible: true,
    geometry: {
      type: 'LineString',
      coordinates: rawStops.map((stop) => [stop.lng, stop.lat]),
    },
  };
};

const isTruckEligible = (truck, originCity, destinationCities) => {
  if (!truck.isActive || truck.status !== 'AVAILABLE') {
    return false;
  }

  const pickupZones = (truck.dealer?.pickupZones || []).map(normalizeCity);
  const deliveryZones = (truck.dealer?.deliveryZones || []).map(normalizeCity);
  const normalizedOrigin = normalizeCity(originCity);
  const normalizedDestinations = destinationCities.map(normalizeCity);

  const pickupAllowed =
    pickupZones.length === 0 ||
    pickupZones.includes(normalizedOrigin) ||
    normalizeCity(truck.currentCity) === normalizedOrigin ||
    normalizeCity(truck.dealer?.primaryCity) === normalizedOrigin;

  const deliveryAllowed =
    deliveryZones.length === 0 ||
    normalizedDestinations.every((city) => deliveryZones.includes(city));

  return pickupAllowed && deliveryAllowed;
};

const estimateScores = (shipments, truck, maxBaseRate) => {
  const totalWeightKg = shipments.reduce(
    (sum, shipment) => sum + Number(shipment.weightKg || 0),
    0
  );
  const totalVolumeM3 = shipments.reduce(
    (sum, shipment) => sum + Number(shipment.volumeM3 || 0),
    0
  );

  if (totalWeightKg > truck.maxWeightKg || totalVolumeM3 > truck.maxVolumeM3) {
    return null;
  }

  const route = buildHeuristicRoute(shipments, truck);
  const weightUtilization = (totalWeightKg / truck.maxWeightKg) * 100;
  const volumeUtilization = (totalVolumeM3 / truck.maxVolumeM3) * 100;
  const blendedUtilization = weightUtilization * 0.65 + volumeUtilization * 0.35;
  const utilizationScore = clamp(100 - Math.abs(84 - blendedUtilization) * 1.6, 0, 100);
  const deadheadKm = haversineKm(route.truckPosition, {
    lat: shipments[0].originLat,
    lng: shipments[0].originLng,
  });
  const routeScore = clamp(100 - deadheadKm * 0.45 - (route.stops.length - 2) * 4, 25, 100);

  const totalWeightTons = totalWeightKg / 1000;
  const baseRate = Number(truck.dealer?.baseRatePerKmTon || 0) || 18;
  const estimatedCost = Math.round(baseRate * totalWeightTons * route.totalDistanceKm);
  const costScore = clamp(
    100 - (baseRate / Math.max(maxBaseRate || baseRate, 1)) * 42,
    40,
    98
  );

  const routeCo2Kg =
    (route.totalDistanceKm / Math.max(Number(truck.fuelEfficiency || 4), 1)) *
    Number(truck.emissionFactor || 2.68);
  const co2Score = clamp(108 - routeCo2Kg / Math.max(totalWeightTons, 1), 30, 97);
  const baselineCo2Kg = routeCo2Kg * 1.22;
  const co2Saved = Math.max(baselineCo2Kg - routeCo2Kg, 1);

  const composite =
    utilizationScore * 0.35 +
    routeScore * 0.25 +
    costScore * 0.2 +
    co2Score * 0.2;

  return {
    truck,
    route,
    estimatedCost,
    co2Saved,
    scores: {
      utilization: Number(utilizationScore.toFixed(1)),
      route: Number(routeScore.toFixed(1)),
      cost: Number(costScore.toFixed(1)),
      co2: Number(co2Score.toFixed(1)),
      composite: Number(clamp(composite, 0, 100).toFixed(1)),
    },
  };
};

const normalizeMlRoute = (route, fallbackRoute) => {
  if (!route || !Array.isArray(route.orderedStops) || !route.orderedStops.length) {
    return fallbackRoute;
  }

  const totalDistanceKm = Number(route.totalDistanceKm || fallbackRoute.totalDistanceKm || 0);
  const estimatedDurationMin = Math.max(
    Math.round((Number(route.totalTimeS || 0) || fallbackRoute.estimatedDurationMin * 60) / 60),
    1
  );

  return {
    ...fallbackRoute,
    stops: route.orderedStops.map((stop, index) => ({
      sequence: index + 1,
      type: stop.type,
      city: stop.city,
      address: stop.address || null,
      lat: stop.lat,
      lng: stop.lng,
      status: 'PENDING',
      shipmentId: stop.shipmentId || null,
    })),
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    estimatedDurationMin,
    estimatedDuration: formatDuration(estimatedDurationMin),
    feasible: route.feasible !== false,
    geometry: route.geometry || fallbackRoute.geometry,
  };
};

const callMlScore = async (trucks, shipments) => {
  try {
    return await scoreWithMl({
      trucks,
      shipments,
    });
  } catch (error) {
    if (!(error instanceof MlServiceError)) {
      throw error;
    }
    return null;
  }
};

const callMlRoute = async (truck, shipments) => {
  try {
    return await solveRoute({
      truck,
      shipments,
    });
  } catch (error) {
    if (!(error instanceof MlServiceError)) {
      throw error;
    }
    return null;
  }
};

const callMlTruckFitInsights = async ({
  distanceKm,
  weightKg,
  volumeM3,
  recommendedType,
  originCity,
  destCity,
}) => {
  try {
    const [pricing, co2] = await Promise.all([
      predictPrice({
        distance_km: distanceKm,
        weight_tons: weightKg / 1000,
        truck_type: recommendedType,
        origin_city: originCity,
        dest_city: destCity,
        urgency: 1,
      }),
      scoreCO2({
        distance_km: distanceKm,
        weight_tons: weightKg / 1000,
        fuel_efficiency: recommendedType === 'LCV' ? 6.2 : recommendedType === 'ICV' ? 4.9 : 3.8,
        emission_factor: 2.68,
        utilization_pct: Math.min(100, Math.max((weightKg / Math.max(volumeM3 * 180, 1)) * 10, 45)),
      }),
    ]);

    return { pricing, co2, source: 'ml' };
  } catch (error) {
    if (!(error instanceof MlServiceError)) {
      throw error;
    }

    return null;
  }
};

const getEstimatedDistanceKm = async (originCity, destCity) => {
  const presets = {
    ahmedabad: { lat: 23.0225, lng: 72.5714 },
    surat: { lat: 21.1702, lng: 72.8311 },
    vadodara: { lat: 22.3072, lng: 73.1812 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    pune: { lat: 18.5204, lng: 73.8567 },
    rajkot: { lat: 22.3039, lng: 70.8022 },
  };

  const origin = presets[normalizeCity(originCity)];
  const destination = presets[normalizeCity(destCity)];

  if (!origin || !destination) {
    return normalizeCity(originCity) === normalizeCity(destCity) ? 35 : 180;
  }

  try {
    const matrix = await getDistanceMatrix({
      coordinates: [origin, destination],
    });
    const meters = Number(matrix.distances?.[0]?.[1] || 0);
    return meters > 0 ? Number((meters / 1000).toFixed(1)) : 180;
  } catch (error) {
    if (!(error instanceof MlServiceError)) {
      throw error;
    }

    return Number(Math.max(haversineKm(origin, destination) * 1.18, 35).toFixed(1));
  }
};

const toCandidateRecord = (result, index) => ({
  truckId: result.truck.id,
  rank: index + 1,
  compositeScore: result.scores.composite,
  utilizationScore: result.scores.utilization,
  routeScore: result.scores.route,
  costScore: result.scores.cost,
  co2Score: result.scores.co2,
  estimatedCost: result.estimatedCost,
  co2SavedKg: result.co2Saved,
  routeSummary: result.route,
});

const inferSource = (notes) => {
  const lower = String(notes || '').toLowerCase();
  if (lower.includes('via ml')) {
    return 'ml';
  }

  if (lower.includes('via heuristic')) {
    return 'heuristic';
  }

  return 'cache';
};

const buildCandidateHighlights = (candidate) => {
  const highlights = [];

  if (Number(candidate.utilizationScore || 0) >= 85) {
    highlights.push('Strong capacity utilization');
  }

  if (Number(candidate.routeScore || 0) >= 80) {
    highlights.push('Tight route alignment');
  }

  if (Number(candidate.costScore || 0) >= 80) {
    highlights.push('Competitive commercial rate');
  }

  if (Number(candidate.co2Score || 0) >= 80) {
    highlights.push('Lower emissions profile');
  }

  if (!highlights.length) {
    highlights.push('Balanced overall fit');
  }

  return highlights.slice(0, 2);
};

const mapCandidate = (candidate) => ({
  id: candidate.id,
  truck: candidate.truck,
  estimatedCost: Number(candidate.estimatedCost || 0),
  co2Saved: Number(candidate.co2SavedKg || 0),
  scores: {
    utilization: Number(candidate.utilizationScore || 0),
    route: Number(candidate.routeScore || 0),
    cost: Number(candidate.costScore || 0),
    co2: Number(candidate.co2Score || 0),
    composite: Number(candidate.compositeScore || 0),
  },
  route: candidate.routeSummary || null,
  rank: candidate.rank,
  highlights: buildCandidateHighlights(candidate),
});

const buildRunSummary = (run) => {
  const destinations = [
    ...new Set(run.shipments.map((entry) => entry.shipment?.destCity).filter(Boolean)),
  ];
  const totalWeightKg = run.shipments.reduce(
    (sum, entry) => sum + Number(entry.shipment?.weightKg || 0),
    0
  );
  const totalVolumeM3 = run.shipments.reduce(
    (sum, entry) => sum + Number(entry.shipment?.volumeM3 || 0),
    0
  );

  return {
    shipmentCount: run.shipments.length,
    destinationCities: destinations,
    totalWeightKg: Number(totalWeightKg.toFixed(1)),
    totalVolumeM3: Number(totalVolumeM3.toFixed(1)),
  };
};

const buildResponse = (run, source = 'cache') => {
  const topCandidate = run.candidates[0] ? mapCandidate(run.candidates[0]) : null;

  return {
    optimizationRunId: run.id,
    cacheKey: run.cacheKey,
    source,
    shipmentIds: run.shipments.map((entry) => entry.shipmentId),
    summary: buildRunSummary(run),
    topCandidate,
    trucks: run.candidates.map(mapCandidate),
  };
};

const findCachedRun = async (cacheKey) =>
  prisma.optimizationRun.findUnique({
    where: { cacheKey },
    include: runInclude,
  });

const persistRun = async ({
  cacheKey,
  warehouseId,
  requestedById,
  shipmentIds,
  results,
  source,
}) => {
  const existing = await prisma.optimizationRun.findUnique({
    where: { cacheKey },
  });

  return prisma.$transaction(async (tx) => {
    let run;

    if (existing) {
      await tx.optimizationCandidate.deleteMany({
        where: { optimizationRunId: existing.id },
      });
      await tx.optimizationRunShipment.deleteMany({
        where: { optimizationRunId: existing.id },
      });

      run = await tx.optimizationRun.update({
        where: { id: existing.id },
        data: {
          warehouseId,
          requestedById,
          status: 'COMPLETED',
          notes: `Optimization generated via ${source}`,
          errorMessage: null,
          completedAt: new Date(),
        },
      });
    } else {
      run = await tx.optimizationRun.create({
        data: {
          warehouseId,
          requestedById,
          status: 'COMPLETED',
          cacheKey,
          notes: `Optimization generated via ${source}`,
          completedAt: new Date(),
        },
      });
    }

    await tx.optimizationRunShipment.createMany({
      data: shipmentIds.map((shipmentId) => ({
        optimizationRunId: run.id,
        shipmentId,
      })),
    });

    for (const [index, result] of results.entries()) {
      await tx.optimizationCandidate.create({
        data: {
          optimizationRunId: run.id,
          ...toCandidateRecord(result, index),
        },
      });
    }

    return tx.optimizationRun.findUnique({
      where: { id: run.id },
      include: runInclude,
    });
  });
};

const buildCacheKey = (shipments) => {
  const signature = shipments
    .map((shipment) => `${shipment.id}:${shipment.updatedAt.toISOString()}`)
    .sort()
    .join('|');

  return `opt_${crypto.createHash('sha1').update(signature).digest('hex')}`;
};

const scoreCandidates = async (shipments, trucks) => {
  const maxBaseRate = Math.max(
    ...trucks.map((truck) => Number(truck.dealer?.baseRatePerKmTon || 0)),
    1
  );

  const heuristicResults = trucks
    .map((truck) => estimateScores(shipments, truck, maxBaseRate))
    .filter(Boolean)
    .sort((left, right) => right.scores.composite - left.scores.composite);

  if (!heuristicResults.length) {
    throw ApiError.badRequest('No available trucks can carry the selected shipments');
  }

  const heuristicById = new Map(
    heuristicResults.map((result) => [result.truck.id, result])
  );

  const mlScored = await callMlScore(trucks, shipments);

  if (!mlScored?.length) {
    return { results: heuristicResults.slice(0, 10), source: 'heuristic' };
  }

  const ranked = [];

  for (const entry of mlScored) {
    const fallback = heuristicById.get(entry.truckId);
    if (!fallback) {
      continue;
    }

    const mlRoute = await callMlRoute(fallback.truck, shipments);
    const route = normalizeMlRoute(mlRoute, fallback.route);

    ranked.push({
      truck: fallback.truck,
      route,
      estimatedCost: Number(entry.estimatedCost || fallback.estimatedCost),
      co2Saved: Number(entry.co2SavedKg || fallback.co2Saved),
      scores: {
        utilization: Number(entry.scores?.utilization || fallback.scores.utilization),
        route: Number(entry.scores?.route || fallback.scores.route),
        cost: Number(entry.scores?.cost || fallback.scores.cost),
        co2: Number(entry.scores?.co2 || fallback.scores.co2),
        composite: Number(entry.compositeScore || fallback.scores.composite),
      },
    });
  }

  if (!ranked.length) {
    return { results: heuristicResults.slice(0, 10), source: 'heuristic' };
  }

  ranked.sort((left, right) => right.scores.composite - left.scores.composite);
  return { results: ranked.slice(0, 10), source: 'ml' };
};

const scoreTrucks = async ({ shipmentIds, forceRefresh }, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const shipments = await prisma.shipment.findMany({
    where: {
      id: { in: shipmentIds },
      warehouseId: warehouse.id,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (shipments.length !== shipmentIds.length) {
    throw ApiError.notFound('One or more selected shipments were not found');
  }

  const invalidShipment = shipments.find((shipment) => shipment.status !== 'PENDING');
  if (invalidShipment) {
    throw ApiError.badRequest('Only PENDING shipments can be optimized');
  }

  const cacheKey = buildCacheKey(shipments);

  if (!forceRefresh) {
    const cached = await findCachedRun(cacheKey);
    if (cached && cached.warehouseId === warehouse.id) {
      return buildResponse(cached, 'cache');
    }
  }

  const destinationCities = uniqueDestinations(shipments).map((shipment) => shipment.destCity);
  const trucks = await prisma.truck.findMany({
    where: {
      isActive: true,
      status: 'AVAILABLE',
    },
    include: truckInclude,
  });

  const eligibleTrucks = trucks.filter((truck) =>
    isTruckEligible(truck, shipments[0].originCity, destinationCities)
  );

  if (!eligibleTrucks.length) {
    throw ApiError.badRequest(
      'No available trucks match the current origin and delivery zone requirements'
    );
  }

  const { results, source } = await scoreCandidates(shipments, eligibleTrucks);
  const persisted = await persistRun({
    cacheKey,
    warehouseId: warehouse.id,
    requestedById: user.userId,
    shipmentIds: shipments.map((shipment) => shipment.id),
    results,
    source,
  });

  return buildResponse(persisted, source);
};

const getCachedResult = async (cacheKey, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const run = await findCachedRun(cacheKey);

  if (!run || run.warehouseId !== warehouse.id) {
    throw ApiError.notFound('Optimization result not found');
  }

  return buildResponse(run, 'cache');
};

const getHistory = async ({ limit }, user) => {
  const warehouse = await getWarehouseProfile(user.userId);
  const runs = await prisma.optimizationRun.findMany({
    where: {
      warehouseId: warehouse.id,
      status: 'COMPLETED',
      cacheKey: {
        not: null,
      },
    },
    orderBy: {
      requestedAt: 'desc',
    },
    take: limit,
    include: runInclude,
  });

  return {
    runs: runs.map((run) => {
      const response = buildResponse(run, inferSource(run.notes));

      return {
        optimizationRunId: response.optimizationRunId,
        cacheKey: response.cacheKey,
        source: response.source,
        requestedAt: run.requestedAt,
        completedAt: run.completedAt,
        summary: response.summary,
        topCandidate: response.topCandidate,
      };
    }),
  };
};

const fitTruckType = (weightKg, volumeM3) => {
  if (weightKg <= 1500 && volumeM3 <= 12) {
    return 'LCV';
  }

  if (weightKg <= 7000 && volumeM3 <= 32) {
    return 'ICV';
  }

  if (weightKg <= 18000 && volumeM3 <= 75) {
    return 'HEAVY';
  }

  return 'MULTI_AXLE';
};

const truckFitEstimate = async ({ weightKg, volumeM3, originCity, destCity }, user) => {
  await getWarehouseProfile(user.userId);

  const availableTrucks = await prisma.truck.findMany({
    where: {
      isActive: true,
      status: 'AVAILABLE',
    },
    include: truckInclude,
  });

  const eligible = availableTrucks.filter(
    (truck) =>
      truck.maxWeightKg >= weightKg &&
      truck.maxVolumeM3 >= volumeM3 &&
      isTruckEligible(truck, originCity, [destCity])
  );

  const recommendedType =
    eligible
      .sort(
        (left, right) =>
          left.maxWeightKg - right.maxWeightKg || left.maxVolumeM3 - right.maxVolumeM3
      )[0]?.truckType || fitTruckType(weightKg, volumeM3);

  const candidateRates = eligible.map((truck) => Number(truck.dealer?.baseRatePerKmTon || 0));
  const avgRate =
    candidateRates.length > 0
      ? candidateRates.reduce((sum, rate) => sum + rate, 0) / candidateRates.length
      : 22;
  const estimatedDistanceKm = await getEstimatedDistanceKm(originCity, destCity);
  const fallbackCost = Math.round(avgRate * (weightKg / 1000) * estimatedDistanceKm);
  const fallbackCo2Kg = Number(
    (
      (estimatedDistanceKm / 4.5) *
      2.68 *
      clamp((weightKg / Math.max(volumeM3 * 180, 1)) / 10, 0.7, 1.15)
    ).toFixed(1)
  );
  const mlInsights = await callMlTruckFitInsights({
    distanceKm: estimatedDistanceKm,
    weightKg,
    volumeM3,
    recommendedType,
    originCity,
    destCity,
  });

  const estimatedCost = Math.round(
    mlInsights?.pricing?.estimated_price ?? fallbackCost
  );
  const estimatedCo2Kg = Number(
    (mlInsights?.co2?.emitted_kg ?? fallbackCo2Kg).toFixed(1)
  );

  return {
    recommendedType,
    estimatedCost,
    estimatedCostRange: {
      min: Math.round(mlInsights?.pricing?.confidence_interval?.[0] ?? estimatedCost * 0.9),
      max: Math.round(mlInsights?.pricing?.confidence_interval?.[1] ?? estimatedCost * 1.12),
    },
    estimatedCO2Kg: estimatedCo2Kg,
    availableTruckCount: eligible.length,
    availableTruckTypes: [...new Set(eligible.map((truck) => truck.truckType))],
    estimationSource: mlInsights?.source || 'heuristic',
  };
};

module.exports = {
  getCachedResult,
  getHistory,
  scoreTrucks,
  truckFitEstimate,
};
