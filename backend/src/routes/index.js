const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const authRoutes = require('./auth.routes');
const shipmentRoutes = require('./shipment.routes');
const truckRoutes = require('./truck.routes');
const bookingRoutes = require('./booking.routes');
const tripRoutes = require('./trip.routes');
const optimizationRoutes = require('./optimization.routes');
const trackingRoutes = require('./tracking.routes');
const notificationRoutes = require('./notification.routes');
const returnLoadRoutes = require('./returnLoad.routes');
const analyticsRoutes = require('./analytics.routes');
const adminRoutes = require('./admin.routes');

router.get('/', (req, res) => {
  res.json({
    service: 'trucksetu-api',
    status: 'ok',
    phase: 'Phase 8 - Background Jobs And Automation',
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
      'GET /api/shipments',
      'POST /api/shipments',
      'GET /api/trucks',
      'POST /api/trucks',
      'GET /api/bookings',
      'POST /api/bookings',
      'GET /api/trips',
      'GET /api/trips/:id/invoice',
      'GET /api/trips/:id/co2-report',
      'GET /api/tracking/:tripId/latest',
      'GET /api/tracking/:tripId/history',
      'POST /api/tracking/:tripId/location',
      'GET /api/notifications',
      'PATCH /api/notifications/:id/read',
      'POST /api/notifications/read-all',
      'GET /api/return-loads',
      'POST /api/return-loads/:matchId/accept',
      'POST /api/return-loads/:matchId/reject',
      'GET /api/analytics/kpis',
      'GET /api/analytics/utilization',
      'GET /api/analytics/revenue',
      'GET /api/analytics/co2',
      'GET /api/analytics/demand-forecast',
      'GET /api/analytics/co2-report/download',
      'GET /api/admin/users',
      'POST /api/admin/analysts',
      'PATCH /api/admin/users/:id/status',
      'GET /api/optimization/history',
      'POST /api/optimization/score',
      'GET /api/optimization/result/:cacheKey',
      'POST /api/optimization/truck-fit',
    ],
  });
});

router.use('/auth', authLimiter, authRoutes);
router.use('/shipments', authenticate, shipmentRoutes);
router.use('/trucks', authenticate, truckRoutes);
router.use('/bookings', authenticate, bookingRoutes);
router.use('/trips', authenticate, tripRoutes);
router.use('/optimization', authenticate, optimizationRoutes);
router.use('/tracking', authenticate, trackingRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/return-loads', authenticate, returnLoadRoutes);
router.use('/analytics', authenticate, analyticsRoutes);
router.use('/admin', authenticate, adminRoutes);

router.use((req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl,
  });
});

module.exports = router;
