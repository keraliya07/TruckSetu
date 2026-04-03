const axios = require('axios');
const { z } = require('zod');

const { ML_REQUEST_TIMEOUT_MS, PYTHON_ML_URL } = require('../config/env');

class MlServiceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'MlServiceError';
    this.details = details;
  }
}

const scoreBreakdownSchema = z.object({
  utilization: z.number(),
  route: z.number(),
  cost: z.number(),
  co2: z.number(),
});

const scoredTruckSchema = z.object({
  truckId: z.string(),
  scores: scoreBreakdownSchema,
  compositeScore: z.number(),
  estimatedCost: z.number(),
  co2SavedKg: z.number().optional().default(0),
});

const routeStopSchema = z.object({
  type: z.string(),
  city: z.string(),
  address: z.string().nullable().optional(),
  lat: z.number(),
  lng: z.number(),
  shipmentId: z.string().nullable().optional(),
});

const routeResponseSchema = z.object({
  orderedStops: z.array(routeStopSchema),
  totalDistanceKm: z.number(),
  totalTimeS: z.number(),
  feasible: z.boolean(),
  geometry: z
    .object({
      type: z.string(),
      coordinates: z.array(z.array(z.number())),
    })
    .nullable()
    .optional(),
});

const returnLoadCandidateSchema = z.object({
  shipmentId: z.string(),
  pickupDistanceKm: z.number(),
  proximityScore: z.number(),
  directionScore: z.number(),
  utilizationScore: z.number(),
  combinedScore: z.number(),
});

const forecastItemSchema = z.object({
  city: z.string(),
  date: z.string(),
  predicted_demand: z.number(),
  lower_bound: z.number(),
  upper_bound: z.number(),
});

const pricePredictionSchema = z.object({
  estimated_price: z.number(),
  confidence_interval: z.array(z.number()).length(2),
  pricing_factors: z.record(z.number()),
});

const distanceMatrixSchema = z.object({
  distances: z.array(z.array(z.number())),
  durations: z.array(z.array(z.number())),
  source: z.string(),
});

const co2ScoreSchema = z.object({
  emitted_kg: z.number(),
  baseline_kg: z.number(),
  saved_kg: z.number(),
  saved_pct: z.number(),
  equivalents: z.record(z.number()),
});

const createMlClient = (options = {}) =>
  axios.create({
    baseURL: options.baseURL || PYTHON_ML_URL,
    timeout: options.timeout ?? ML_REQUEST_TIMEOUT_MS,
  });

const buildMlError = (feature, error) => {
  const reason =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.code ||
    error.message ||
    'unknown error';

  return new MlServiceError(`ML ${feature} request failed`, {
    feature,
    reason,
    status: error.response?.status,
  });
};

const requestAndValidate = async ({ client, path, payload, schema, feature }) => {
  try {
    const response = await client.post(path, payload);
    return schema.parse(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new MlServiceError(`ML ${feature} response validation failed`, {
        feature,
        reason: error.issues.map((issue) => issue.message).join(', '),
      });
    }

    throw buildMlError(feature, error);
  }
};

const scoreTrucks = async (payload, options = {}) => {
  const client = options.client || createMlClient(options);
  const body = await requestAndValidate({
    client,
    path: '/internal/score-trucks',
    payload,
    feature: 'truck scoring',
    schema: z.object({
      scoredTrucks: z.array(scoredTruckSchema),
    }),
  });

  return body.scoredTrucks;
};

const solveRoute = async (payload, options = {}) => {
  const client = options.client || createMlClient(options);

  return requestAndValidate({
    client,
    path: '/internal/vrp-route',
    payload,
    feature: 'route solving',
    schema: routeResponseSchema,
  });
};

const scoreReturnLoads = async (payload, options = {}) => {
  const client = options.client || createMlClient(options);
  const body = await requestAndValidate({
    client,
    path: '/internal/return-load-score',
    payload,
    feature: 'return-load scoring',
    schema: z.object({
      scored: z.array(returnLoadCandidateSchema),
    }),
  });

  return body.scored;
};

const forecastDemand = async (payload, options = {}) => {
  const client = options.client || createMlClient(options);
  const body = await requestAndValidate({
    client,
    path: '/internal/forecast-demand',
    payload,
    feature: 'demand forecast',
    schema: z.object({
      forecasts: z.array(forecastItemSchema),
    }),
  });

  return body.forecasts;
};

const predictPrice = async (payload, options = {}) => {
  const client = options.client || createMlClient(options);
  return requestAndValidate({
    client,
    path: '/internal/predict-price',
    payload,
    feature: 'price prediction',
    schema: pricePredictionSchema,
  });
};

const getDistanceMatrix = async (payload, options = {}) => {
  const client = options.client || createMlClient(options);
  return requestAndValidate({
    client,
    path: '/internal/distance-matrix',
    payload,
    feature: 'distance matrix',
    schema: distanceMatrixSchema,
  });
};

const scoreCO2 = async (payload, options = {}) => {
  const client = options.client || createMlClient(options);
  return requestAndValidate({
    client,
    path: '/internal/co2-score',
    payload,
    feature: 'co2 scoring',
    schema: co2ScoreSchema,
  });
};

module.exports = {
  MlServiceError,
  createMlClient,
  forecastDemand,
  getDistanceMatrix,
  predictPrice,
  scoreReturnLoads,
  scoreCO2,
  scoreTrucks,
  solveRoute,
};
