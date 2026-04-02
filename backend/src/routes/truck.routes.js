const router = require('express').Router();
const controller = require('../controllers/truck.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createTruckSchema,
  updateTruckSchema,
  updateTruckStatusSchema,
} = require('../validators/truck.validator');

router.get('/', requireRole('DEALER', 'WAREHOUSE', 'ADMIN'), controller.getAll);
router.get('/:id', requireRole('DEALER', 'WAREHOUSE', 'ADMIN'), controller.getById);
router.use(requireRole('DEALER'));
router.post('/', validate(createTruckSchema), controller.create);
router.put('/:id', validate(updateTruckSchema), controller.update);
router.patch('/:id/status', validate(updateTruckStatusSchema), controller.updateStatus);
router.delete('/:id', controller.remove);

module.exports = router;
