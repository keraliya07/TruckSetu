// === backend/src/middleware/role.middleware.js ===
// Purpose: Role-based access control — restrict routes to specific roles
// Dependencies: none (uses req.user from auth middleware)

/**
 * TODO: Implement requireRole middleware factory
 *
 * Usage: router.get('/admin-only', authenticate, requireRole('ADMIN'), controller)
 *
 * @param {...string} roles — Allowed roles, e.g., 'WAREHOUSE', 'ADMIN'
 * @returns {Function} Express middleware
 *
 * Steps:
 *   1. Return a middleware function
 *   2. Check if req.user.role is in the allowed roles
 *   3. If not: return 403 { error: 'Access denied. Required role: [roles]' }
 *   4. If yes: call next()
 */

// const requireRole = (...roles) => (req, res, next) => {
//   // TODO: Implement role check
// };
// module.exports = { requireRole };
