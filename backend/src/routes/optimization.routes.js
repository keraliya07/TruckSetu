const router = require('express').Router();

const controller = require('../controllers/optimization.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  cacheKeyParamsSchema,
  optimizationHistoryQuerySchema,
  scoreTrucksSchema,
  truckFitEstimateSchema,
} = require('../validators/optimization.validator');

router.use(requireRole('WAREHOUSE'));

router.get('/history', validate(optimizationHistoryQuerySchema, 'query'), controller.getHistory);
router.post('/score', validate(scoreTrucksSchema), controller.scoreTrucks);
router.get(
  '/result/:cacheKey',
  validate(cacheKeyParamsSchema, 'params'),
  controller.getCachedResult
);
router.post('/truck-fit', validate(truckFitEstimateSchema), controller.truckFitEstimate);

module.exports = router;
