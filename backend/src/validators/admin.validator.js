const { z } = require('zod');

const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  role: z.enum(['ADMIN', 'WAREHOUSE', 'DEALER']).optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED']).optional(),
  search: z.string().trim().max(120).optional(),
});

const disputeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
  type: z.enum(['SHIPMENT', 'TRIP', 'BOOKING', 'PAYMENT', 'OTHER']).optional(),
});

const userParamsSchema = z.object({
  id: z.string().uuid(),
});

const disputeParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateUserStatusSchema = z.object({
  accountStatus: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED']),
});

const resolveDisputeSchema = z.object({
  status: z.enum(['RESOLVED', 'REJECTED']),
  resolution: z.string().trim().min(8).max(1000),
});

module.exports = {
  disputeParamsSchema,
  disputeQuerySchema,
  resolveDisputeSchema,
  updateUserStatusSchema,
  userParamsSchema,
  userQuerySchema,
};
