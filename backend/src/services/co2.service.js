const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');

const DEFAULT_EMISSION_FACTOR = 2.68;
const DEFAULT_FUEL_EFFICIENCY = 4.0;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const round = (value, digits = 2) => Number(toNumber(value).toFixed(digits));

const calculateCO2 = ({
  distanceKm,
  weightTons,
  emissionFactor = DEFAULT_EMISSION_FACTOR,
  fuelEfficiency = DEFAULT_FUEL_EFFICIENCY,
  utilizationPct,
  baselineMultiplier = 1.22,
}) => {
  const safeDistanceKm = Math.max(toNumber(distanceKm), 0);
  const safeWeightTons = Math.max(toNumber(weightTons), 0);
  const safeFuelEfficiency = Math.max(toNumber(fuelEfficiency, DEFAULT_FUEL_EFFICIENCY), 1);
  const safeEmissionFactor = Math.max(
    toNumber(emissionFactor, DEFAULT_EMISSION_FACTOR),
    0.1
  );
  const utilizationFactor =
    utilizationPct == null
      ? Math.min(Math.max(safeWeightTons / 10, 0.85), 1.2)
      : Math.min(Math.max(toNumber(utilizationPct) / 100, 0.55), 1.2);

  const emittedKg =
    (safeDistanceKm / safeFuelEfficiency) * safeEmissionFactor * utilizationFactor;
  const baselineKg = emittedKg * Math.max(toNumber(baselineMultiplier, 1.22), 1);
  const savedKg = Math.max(baselineKg - emittedKg, 0);
  const savedPct = baselineKg > 0 ? (savedKg / baselineKg) * 100 : 0;

  return {
    emittedKg: round(emittedKg),
    baselineKg: round(baselineKg),
    savedKg: round(savedKg),
    savedPct: round(savedPct),
  };
};

const getEnvironmentalEquivalents = (co2SavedKg) => {
  const saved = Math.max(toNumber(co2SavedKg), 0);

  return {
    treesEquivalent: round(saved / 21.8),
    carKmAvoided: round(saved * 4.1, 1),
    flightsAvoided: round(saved / 255, 3),
  };
};

const buildTripCO2Summary = (trip) => {
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  const shipments = trip.shipments || [];
  const totalWeightKg = shipments.reduce(
    (sum, entry) => sum + toNumber(entry.shipment?.weightKg),
    0
  );
  const utilizationPct = trip.truck?.maxWeightKg
    ? (totalWeightKg / trip.truck.maxWeightKg) * 100
    : 0;

  const calculated = calculateCO2({
    distanceKm: trip.estimatedDistanceKm || trip.routeSummary?.totalDistanceKm || 0,
    weightTons: totalWeightKg / 1000,
    emissionFactor: trip.truck?.emissionFactor,
    fuelEfficiency: trip.truck?.fuelEfficiency,
    utilizationPct,
  });

  return {
    ...calculated,
    utilizationPct: round(utilizationPct),
    distanceKm: round(
      trip.estimatedDistanceKm || trip.routeSummary?.totalDistanceKm || 0,
      1
    ),
    weightTons: round(totalWeightKg / 1000, 2),
    equivalents: getEnvironmentalEquivalents(calculated.savedKg),
  };
};

const updateTripCO2 = async (tripId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      truck: true,
      shipments: {
        include: {
          shipment: true,
        },
      },
    },
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  const summary = buildTripCO2Summary(trip);

  return prisma.trip.update({
    where: { id: tripId },
    data: {
      baselineCo2Kg: summary.baselineKg,
      tripCo2Kg: summary.emittedKg,
      co2SavedKg: summary.savedKg,
    },
  });
};

module.exports = {
  buildTripCO2Summary,
  calculateCO2,
  getEnvironmentalEquivalents,
  updateTripCO2,
};
