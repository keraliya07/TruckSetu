const { z } = require('zod');

const getMatchesQuerySchema = z.object({
  tripId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const matchParamsSchema = z.object({
  matchId: z.string().uuid(),
});

module.exports = {
  getMatchesQuerySchema,
  matchParamsSchema,
};
