const router = require('express').Router();

const controller = require('../controllers/tracking.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  locationUpdateSchema,
  trackingHistoryQuerySchema,
  tripParamsSchema,
} = require('../validators/tracking.validator');

router.get(
  '/:tripId/latest',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(tripParamsSchema, 'params'),
  controller.getLatestLocation
);
router.get(
  '/:tripId/history',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(tripParamsSchema, 'params'),
  validate(trackingHistoryQuerySchema, 'query'),
  controller.getLocationHistory
);
router.post(
  '/:tripId/location',
  requireRole('DEALER'),
  validate(tripParamsSchema, 'params'),
  validate(locationUpdateSchema),
  controller.createLocationUpdate
);

module.exports = router;
