const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/[0-9]/, 'Password must include a number');

const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(12),
  role: z.enum(['ADMIN', 'ANALYST', 'WAREHOUSE', 'DEALER']).optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED']).optional(),
  search: z.string().trim().max(120).optional(),
});

const userParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateUserStatusSchema = z.object({
  accountStatus: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED']),
});

const createAnalystSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().trim().min(8).max(20).optional().or(z.literal('')),
  password: passwordSchema,
});

module.exports = {
  createAnalystSchema,
  updateUserStatusSchema,
  userParamsSchema,
  userQuerySchema,
};
