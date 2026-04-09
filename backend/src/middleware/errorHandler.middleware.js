const { ZodError } = require('zod');
const { Prisma } = require('../../generated/prisma');
const ApiError = require('../utils/apiError.utils');
const { NODE_ENV } = require('../config/env');

const databaseUnavailablePatterns = [
  "Can't reach database server",
  'Authentication failed against database server',
  'Timed out fetching a new connection',
  'Connection pool timeout',
];

const isDatabaseUnavailableError = (err) => {
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message = String(err?.message || '');
  return databaseUnavailablePatterns.some((pattern) => message.includes(pattern));
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      ...(NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.flatten(),
    });
  }

  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'Already exists' });
  }

  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (isDatabaseUnavailableError(err)) {
    return res.status(503).json({
      error: 'Database unavailable',
      details:
        'The API could not connect to PostgreSQL. Check DATABASE_URL/DIRECT_URL and make sure the database is running.',
      ...(NODE_ENV === 'development' && err?.stack ? { stack: err.stack } : {}),
    });
  }

  console.error(err);

  return res.status(500).json({
    error: 'Internal server error',
    ...(NODE_ENV === 'development' && err?.stack ? { stack: err.stack } : {}),
  });
};

module.exports = { errorHandler };
