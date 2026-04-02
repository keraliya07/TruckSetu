const router = require('express').Router();
const controller = require('../controllers/booking.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  acceptCounterSchema,
  createBookingSchema,
  respondBookingSchema,
} = require('../validators/booking.validator');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', requireRole('WAREHOUSE'), validate(createBookingSchema), controller.create);
router.patch('/:id/respond', requireRole('DEALER'), validate(respondBookingSchema), controller.respond);
router.patch(
  '/:id/accept-counter',
  requireRole('WAREHOUSE'),
  validate(acceptCounterSchema),
  controller.acceptCounter
);

module.exports = router;
