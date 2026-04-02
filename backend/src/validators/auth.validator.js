const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/[0-9]/, 'Password must include a number');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(2).max(80),
  phone: z.string().trim().min(8).max(20).optional().or(z.literal('')),
  role: z.enum(['WAREHOUSE', 'DEALER']),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
});

const verifyEmailSchema = z.object({
  token: z.string().min(20),
});

const sessionParamsSchema = z.object({
  sessionId: z.string().uuid(),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().trim().min(8).max(20).optional().or(z.literal('')),
    warehouse: z
      .object({
        warehouseName: z.string().min(2).max(120),
        city: z.string().min(2).max(80),
        address: z.string().min(5).max(200),
      })
      .optional(),
    truckDealer: z
      .object({
        companyName: z.string().min(2).max(120),
        primaryCity: z.string().min(2).max(80),
        baseRatePerKmTon: z.coerce.number().min(1),
      })
      .optional(),
  })
  .refine(
    (value) => value.name || value.phone || value.warehouse || value.truckDealer,
    {
      message: 'Provide at least one field to update',
    }
  );

module.exports = {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sessionParamsSchema,
  updateProfileSchema,
  verifyEmailSchema,
};
