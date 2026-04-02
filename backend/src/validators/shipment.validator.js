const { z } = require('zod');

const shipmentBaseSchema = {
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  weightKg: z.coerce.number().positive(),
  volumeM3: z.coerce.number().positive(),
  destCity: z.string().min(2).max(80),
  destAddress: z.string().min(5).max(200).optional().or(z.literal('')),
  destLat: z.coerce.number().min(-90).max(90),
  destLng: z.coerce.number().min(-180).max(180),
  deadline: z.coerce.date(),
  fragile: z.boolean().optional().default(false),
  hazardous: z.boolean().optional().default(false),
  priority: z.coerce.number().int().min(1).max(5).optional().default(1),
  specialInstructions: z.string().max(500).optional().or(z.literal('')),
};

const createShipmentSchema = z.object(shipmentBaseSchema);

const updateShipmentSchema = z.object(shipmentBaseSchema).partial();

const batchUpdateShipmentStatusSchema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1),
  status: z.enum(['DRAFT', 'PENDING', 'CANCELLED']),
});

module.exports = {
  batchUpdateShipmentStatusSchema,
  createShipmentSchema,
  updateShipmentSchema,
};
