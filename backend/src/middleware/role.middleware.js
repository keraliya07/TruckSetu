const ApiError = require('../utils/apiError.utils');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    return next(
      ApiError.forbidden(
        `Access denied. Required role: ${roles.join(', ')}`
      )
    );
  }

  return next();
};

module.exports = { requireRole };
