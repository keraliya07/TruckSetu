const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const authRoutes = require('./auth.routes');
const shipmentRoutes = require('./shipment.routes');
const truckRoutes = require('./truck.routes');
const bookingRoutes = require('./booking.routes');
const tripRoutes = require('./trip.routes');

router.get('/', (req, res) => {
  res.json({
    service: 'stlos-api',
    status: 'ok',
    phase: 'Phase 2 - Persistent Auth, Database Workflows, and Security Closeout',
    availableRoutes: [
      'GET /api/health',
      'GET /api/auth/demo-accounts',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/auth/forgot-password',
      'POST /api/auth/reset-password',
      'POST /api/auth/verify-email',
      'GET /api/auth/me',
      'PUT /api/auth/me',
      'POST /api/auth/send-verification',
      'GET /api/auth/sessions',
      'DELETE /api/auth/sessions/:sessionId',
      'DELETE /api/auth/sessions/others',
      'GET /api/shipments',
      'POST /api/shipments',
      'GET /api/trucks',
      'POST /api/trucks',
      'GET /api/bookings',
      'POST /api/bookings',
      'GET /api/trips',
    ],
  });
});

router.use('/auth', authLimiter, authRoutes);
router.use('/shipments', authenticate, shipmentRoutes);
router.use('/trucks', authenticate, truckRoutes);
router.use('/bookings', authenticate, bookingRoutes);
router.use('/trips', authenticate, tripRoutes);

router.use((req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl,
  });
});

module.exports = router;
