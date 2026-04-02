const router = require('express').Router();
const controller = require('../controllers/trip.controller');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', requireRole('WAREHOUSE', 'DEALER', 'ADMIN'), controller.getAll);
router.get('/:id', requireRole('WAREHOUSE', 'DEALER', 'ADMIN'), controller.getById);
router.patch('/:id/start', requireRole('DEALER'), controller.start);
router.patch('/:id/stops/:stopId/complete', requireRole('DEALER'), controller.completeStop);

module.exports = router;
