const { z } = require('zod');

const periodSchema = z.enum(['7d', '30d', '90d']).default('30d');

const analyticsQuerySchema = z.object({
  period: periodSchema,
});

const demandForecastQuerySchema = z.object({
  city: z.string().trim().max(120).optional(),
  horizon: z.enum(['7d', '30d']).default('7d'),
});

const co2ReportQuerySchema = z.object({
  tripId: z.string().uuid(),
});

module.exports = {
  analyticsQuerySchema,
  co2ReportQuerySchema,
  demandForecastQuerySchema,
  periodSchema,
};
