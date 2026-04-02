const { z } = require('zod');

const truckBaseSchema = {
  registrationNo: z.string().min(5).max(30).transform((value) => value.toUpperCase()),
  truckType: z.string().min(2).max(60),
  maxWeightKg: z.coerce.number().positive(),
  maxVolumeM3: z.coerce.number().positive(),
  emissionFactor: z.coerce.number().positive().optional(),
  fuelEfficiency: z.coerce.number().positive().optional(),
  currentCity: z.string().min(2).max(80).optional().or(z.literal('')),
  currentLat: z.coerce.number().min(-90).max(90).optional(),
  currentLng: z.coerce.number().min(-180).max(180).optional(),
};

const createTruckSchema = z.object(truckBaseSchema);
const updateTruckSchema = z.object(truckBaseSchema).partial();
const updateTruckStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'INACTIVE']),
});

module.exports = {
  createTruckSchema,
  updateTruckSchema,
  updateTruckStatusSchema,
};
