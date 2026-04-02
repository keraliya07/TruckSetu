const { z } = require('zod');

const createBookingSchema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1),
  truckId: z.string().uuid(),
  quotedPrice: z.coerce.number().positive(),
});

const respondBookingSchema = z
  .object({
    action: z.enum(['APPROVE', 'REJECT', 'COUNTER']),
    counterPrice: z.coerce.number().positive().optional(),
    dealerNote: z.string().max(500).optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    if (value.action === 'COUNTER' && !value.counterPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'counterPrice is required when action is COUNTER',
        path: ['counterPrice'],
      });
    }
  });

const acceptCounterSchema = z.object({
  warehouseNote: z.string().max(500).optional().or(z.literal('')),
});

module.exports = {
  acceptCounterSchema,
  createBookingSchema,
  respondBookingSchema,
};
