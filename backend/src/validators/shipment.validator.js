const { z } = require('zod');

const shipmentTypeEnum = z.enum([
  'STANDARD',
  'FRAGILE',
  'HAZARDOUS',
  'TEMPERATURE_CONTROLLED',
  'EXPRESS',
  'BULK',
]);

const shipmentBaseSchema = {
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  pickupCity: z.string().min(2).max(80).optional(),
  pickupAddress: z.string().min(5).max(200).optional().or(z.literal('')),
  pickupLat: z.coerce.number().min(-90).max(90).optional(),
  pickupLng: z.coerce.number().min(-180).max(180).optional(),
  pickupDeadline: z.coerce.date().optional(),
  deliveryCity: z.string().min(2).max(80).optional(),
  deliveryAddress: z.string().min(5).max(200).optional().or(z.literal('')),
  deliveryLat: z.coerce.number().min(-90).max(90).optional(),
  deliveryLng: z.coerce.number().min(-180).max(180).optional(),
  deliveryDeadline: z.coerce.date().optional(),
  shipmentType: shipmentTypeEnum.optional().default('STANDARD'),
  weightKg: z.coerce.number().positive(),
  volumeM3: z.coerce.number().positive(),
  fragile: z.boolean().optional().default(false),
  hazardous: z.boolean().optional().default(false),
  priority: z.coerce.number().int().min(1).max(5).optional().default(1),
  specialInstructions: z.string().max(500).optional().or(z.literal('')),
  autoDispatch: z.boolean().optional().default(true),
  // Legacy fields kept for older clients and tests.
  destCity: z.string().min(2).max(80).optional(),
  destAddress: z.string().min(5).max(200).optional().or(z.literal('')),
  destLat: z.coerce.number().min(-90).max(90).optional(),
  destLng: z.coerce.number().min(-180).max(180).optional(),
  deadline: z.coerce.date().optional(),
};

const createShipmentSchema = z
  .object(shipmentBaseSchema)
  .superRefine((value, ctx) => {
    if (!value.deliveryCity && !value.destCity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Delivery city is required',
        path: ['deliveryCity'],
      });
    }

    if (!value.deliveryAddress && !value.destAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Delivery address is required',
        path: ['deliveryAddress'],
      });
    }

    if (value.deliveryLat === undefined && value.destLat === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Delivery latitude is required',
        path: ['deliveryLat'],
      });
    }

    if (value.deliveryLng === undefined && value.destLng === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Delivery longitude is required',
        path: ['deliveryLng'],
      });
    }

    if (!value.deliveryDeadline && !value.deadline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Delivery deadline is required',
        path: ['deliveryDeadline'],
      });
    }
  });

const updateShipmentSchema = z.object(shipmentBaseSchema).partial();

const batchUpdateShipmentStatusSchema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1),
  status: z.enum(['DRAFT', 'PENDING', 'CANCELLED']),
});

module.exports = {
  batchUpdateShipmentStatusSchema,
  createShipmentSchema,
  shipmentTypeEnum,
  updateShipmentSchema,
};
