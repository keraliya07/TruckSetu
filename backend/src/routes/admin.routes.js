const router = require('express').Router();

const controller = require('../controllers/admin.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createAnalystSchema,
  updateUserStatusSchema,
  userParamsSchema,
  userQuerySchema,
} = require('../validators/admin.validator');

router.get('/users', requireRole('ADMIN', 'ANALYST'), validate(userQuerySchema, 'query'), controller.getUsers);
router.post(
  '/analysts',
  requireRole('ADMIN'),
  validate(createAnalystSchema),
  controller.createAnalyst
);
router.get(
  '/users/:id',
  requireRole('ADMIN', 'ANALYST'),
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

module.exports = router;
