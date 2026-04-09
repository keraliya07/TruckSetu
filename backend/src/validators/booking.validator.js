const { z } = require('zod');

const createBookingSchema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1),
  truckId: z.string().uuid(),
  quotedPrice: z.coerce.number().positive(),
});

const respondBookingSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  dealerNote: z.string().max(500).optional().or(z.literal('')),
});

module.exports = {
  createBookingSchema,
  respondBookingSchema,
};
