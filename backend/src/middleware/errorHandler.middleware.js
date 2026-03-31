// === backend/src/middleware/errorHandler.middleware.js ===
// Purpose: Global error handler — catches all errors and returns consistent JSON responses
// Dependencies: ../utils/apiError.utils

/**
 * TODO: Implement errorHandler middleware
 *
 * Steps:
 *   1. Check if error is instanceof ApiError (custom error class)
 *      - If yes: use error.statusCode and error.message
 *   2. Check for Prisma errors:
 *      - P2002 (unique constraint): return 409 "Already exists"
 *      - P2025 (record not found): return 404 "Not found"
 *   3. Check for Zod validation errors: return 400 with error details
 *   4. For unknown errors: return 500 "Internal server error"
 *   5. In development: include error stack trace in response
 *   6. Log error to console/log service
 *
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */

// const errorHandler = (err, req, res, next) => {
//   // TODO: Implement global error handler
// };
// module.exports = { errorHandler };
