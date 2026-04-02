const router = require('express').Router();
const controller = require('../controllers/shipment.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  batchUpdateShipmentStatusSchema,
  createShipmentSchema,
  updateShipmentSchema,
} = require('../validators/shipment.validator');

router.get('/', requireRole('WAREHOUSE', 'ADMIN'), controller.getAll);
router.get('/:id', requireRole('WAREHOUSE', 'ADMIN'), controller.getById);
router.post('/', requireRole('WAREHOUSE'), validate(createShipmentSchema), controller.create);
router.put('/:id', requireRole('WAREHOUSE'), validate(updateShipmentSchema), controller.update);
router.patch(
  '/batch-status',
  requireRole('WAREHOUSE'),
  validate(batchUpdateShipmentStatusSchema),
  controller.batchUpdateStatus
);
router.delete('/:id', requireRole('WAREHOUSE'), controller.remove);

module.exports = router;
