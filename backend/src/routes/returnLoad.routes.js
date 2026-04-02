const router = require('express').Router();

const controller = require('../controllers/returnLoad.controller');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  getMatchesQuerySchema,
  matchParamsSchema,
} = require('../validators/returnLoad.validator');

router.get(
  '/',
  requireRole('DEALER', 'ADMIN'),
  validate(getMatchesQuerySchema, 'query'),
  controller.getMatches
);
router.post(
  '/:matchId/accept',
  requireRole('DEALER'),
  validate(matchParamsSchema, 'params'),
  controller.acceptMatch
);
router.post(
  '/:matchId/reject',
  requireRole('DEALER'),
  validate(matchParamsSchema, 'params'),
  controller.rejectMatch
);

module.exports = router;
