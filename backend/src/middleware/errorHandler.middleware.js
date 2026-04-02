const { ZodError } = require('zod');
const ApiError = require('../utils/apiError.utils');
const { NODE_ENV } = require('../config/env');

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

  console.error(err);

  return res.status(500).json({
    error: 'Internal server error',
    ...(NODE_ENV === 'development' && err?.stack ? { stack: err.stack } : {}),
  });
};

module.exports = { errorHandler };
