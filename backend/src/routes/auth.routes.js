const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} = require('../validators/auth.validator');

router.get('/demo-accounts', controller.getDemoAccounts);
router.post('/login', validate(loginSchema), controller.login);
router.post('/register', validate(registerSchema), controller.register);
router.post('/refresh', controller.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.get('/me', authenticate, controller.getProfile);
router.put(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  controller.updateProfile
);
router.post('/send-verification', authenticate, controller.sendVerificationEmail);
router.post('/logout', controller.logout);

module.exports = router;
