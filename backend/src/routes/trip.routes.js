const router = require('express').Router();
const controller = require('../controllers/trip.controller');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', requireRole('WAREHOUSE', 'DEALER', 'ADMIN'), controller.getAll);
router.get('/:id', requireRole('WAREHOUSE', 'DEALER', 'ADMIN'), controller.getById);
router.get('/:id/invoice', requireRole('WAREHOUSE', 'DEALER', 'ADMIN'), controller.downloadInvoice);
router.get(
  '/:id/co2-report',
  requireRole('WAREHOUSE', 'DEALER', 'ADMIN'),
  controller.downloadCO2Report
);
router.patch('/:id/start', requireRole('DEALER'), controller.start);
router.patch('/:id/stops/:stopId/complete', requireRole('DEALER'), controller.completeStop);
router.patch('/:id/geometry', requireRole('WAREHOUSE', 'DEALER', 'ADMIN'), controller.refreshGeometry);

module.exports = router;
