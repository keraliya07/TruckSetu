const { z } = require('zod');

const scoreTrucksSchema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1).max(25),
  forceRefresh: z.boolean().optional().default(false),
});

const truckFitEstimateSchema = z.object({
  weightKg: z.coerce.number().positive(),
  volumeM3: z.coerce.number().positive(),
  originCity: z.string().min(2).max(80),
  destCity: z.string().min(2).max(80),
});

const cacheKeyParamsSchema = z.object({
  cacheKey: z.string().min(12).max(120),
});

const optimizationHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(8),
});

module.exports = {
  cacheKeyParamsSchema,
  optimizationHistoryQuerySchema,
  scoreTrucksSchema,
  truckFitEstimateSchema,
};
