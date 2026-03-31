// === backend/src/middleware/validate.middleware.js ===
// Purpose: Request body/query/params validation using Zod schemas
// Dependencies: zod

/**
 * TODO: Implement validate middleware factory
 *
 * Usage: router.post('/shipments', validate(createShipmentSchema), controller)
 *
 * @param {ZodSchema} schema — Zod schema to validate against
 * @param {'body'|'query'|'params'} [source='body'] — Where to find data
 * @returns {Function} Express middleware
 *
 * Steps:
 *   1. Parse req[source] with schema.safeParse()
 *   2. If validation fails: return 400 with formatted Zod errors
 *   3. If passes: replace req[source] with parsed data (strips unknowns), call next()
 */

// const validate = (schema, source = 'body') => (req, res, next) => {
//   // TODO: Implement Zod validation
// };
// module.exports = { validate };
