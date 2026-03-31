// === backend/src/middleware/rateLimit.middleware.js ===
// Purpose: Rate limiting for API endpoints (prevent abuse)
// Dependencies: express-rate-limit

/**
 * TODO: Implement rate limiters
 *
 * Export multiple rate limiters:
 *   - generalLimiter: 100 requests per 15 minutes per IP
 *   - authLimiter: 10 requests per 15 minutes per IP (login/register)
 *   - optimizationLimiter: 5 requests per minute per user (expensive operation)
 */

// const rateLimit = require('express-rate-limit');  // TODO: uncomment

// const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many auth attempts' });
// const optimizationLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, keyGenerator: (req) => req.user?.userId });

// module.exports = { generalLimiter, authLimiter, optimizationLimiter };
