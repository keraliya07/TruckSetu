const { z } = require('zod');

const tripParamsSchema = z.object({
  tripId: z.string().uuid(),
});

const trackingHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

const locationUpdateSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  speed: z.coerce.number().min(0).max(240).optional(),
  heading: z.coerce.number().min(0).max(360).optional(),
  source: z.string().max(40).optional(),
  recordedAt: z.coerce.date().optional(),
});

module.exports = {
  locationUpdateSchema,
  trackingHistoryQuerySchema,
  tripParamsSchema,
};
