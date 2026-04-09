const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

// In development, use a pass-through middleware to avoid rate-limit lockouts
const noopLimiter = (_req, _res, next) => next();

const generalLimiter = isDev
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
    });

const authLimiter = isDev
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many auth attempts. Please try again later.' },
    });

const optimizationLimiter = isDev
  ? noopLimiter
  : rateLimit({
      windowMs: 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.user?.userId || req.ip,
    });

module.exports = { generalLimiter, authLimiter, optimizationLimiter };
