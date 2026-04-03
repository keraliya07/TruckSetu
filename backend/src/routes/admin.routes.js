const router = require('express').Router();

const controller = require('../controllers/admin.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  disputeParamsSchema,
  disputeQuerySchema,
  resolveDisputeSchema,
  updateUserStatusSchema,
  userParamsSchema,
  userQuerySchema,
} = require('../validators/admin.validator');

router.get('/users', requireRole('ADMIN'), validate(userQuerySchema, 'query'), controller.getUsers);
router.get(
  '/users/:id',
  requireRole('ADMIN'),
  validate(userParamsSchema, 'params'),
  controller.getUserById
);
router.patch(
  '/users/:id/status',
  requireRole('ADMIN'),
  validate(userParamsSchema, 'params'),
  validate(updateUserStatusSchema),
  controller.updateUserStatus
);
router.get(
  '/disputes',
  requireRole('ADMIN'),
  validate(disputeQuerySchema, 'query'),
  controller.getDisputes
);
router.patch(
  '/disputes/:id/resolve',
  requireRole('ADMIN'),
  validate(disputeParamsSchema, 'params'),
  validate(resolveDisputeSchema),
  controller.resolveDispute
);

module.exports = router;
