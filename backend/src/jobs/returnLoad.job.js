// === backend/src/jobs/returnLoad.job.js ===
// Purpose: Triggered when a trip is marked DELIVERED — find return load matches
// Dependencies: ../services/returnLoad.service

/**
 * TODO: Triggered (NOT cron-based) when trip is marked DELIVERED
 *
 * TRIGGER: Called from tracking.service.completeStop() (when last stop completed)
 *
 * FLOW:
 *   1. Receive tripId
 *   2. Call returnLoad.service.findReturnLoads(tripId)
 *   3. Service handles ML scoring, DB storage, and notifications
 *
 * If dealer accepts a return load match:
 *   - Create new booking with status PRE_APPROVED
 *   - Route re-optimized from truck's current location
 */

// async function triggerReturnLoadMatching(tripId) { /* TODO */ }
// module.exports = { triggerReturnLoadMatching };
