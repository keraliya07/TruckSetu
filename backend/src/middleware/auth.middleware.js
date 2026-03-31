// === backend/src/middleware/auth.middleware.js ===
// Purpose: Verify JWT token and attach user to request
// Dependencies: jsonwebtoken, ../config/env

/**
 * TODO: Implement authenticate middleware
 *
 * Steps:
 *   1. Extract token from Authorization header: 'Bearer <token>'
 *   2. If no token: return 401 { error: 'No token provided' }
 *   3. Verify token: jwt.verify(token, JWT_SECRET)
 *   4. If invalid/expired: return 401 { error: 'Invalid or expired token' }
 *   5. Attach decoded payload to req.user: { userId, email, role }
 *   6. Call next()
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */

// const authenticate = (req, res, next) => {
//   // TODO: Implement JWT verification
// };
// module.exports = { authenticate };
