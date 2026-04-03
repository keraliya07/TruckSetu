const router = require('express').Router();

const controller = require('../controllers/analytics.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  analyticsQuerySchema,
  co2ReportQuerySchema,
  demandForecastQuerySchema,
} = require('../validators/analytics.validator');

router.get(
  '/kpis',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(analyticsQuerySchema, 'query'),
  controller.getKPIs
);
router.get(
  '/utilization',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(analyticsQuerySchema, 'query'),
  controller.getUtilization
);
router.get(
  '/revenue',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(analyticsQuerySchema, 'query'),
  controller.getRevenue
);
router.get(
  '/co2',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(analyticsQuerySchema, 'query'),
  controller.getCO2
);
router.get(
  '/demand-forecast',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(demandForecastQuerySchema, 'query'),
  controller.getDemandForecast
);
router.get(
  '/co2-report/download',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  validate(co2ReportQuerySchema, 'query'),
  controller.downloadCO2Report
);

module.exports = router;
