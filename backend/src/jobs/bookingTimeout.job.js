// === backend/src/jobs/bookingTimeout.job.js ===
// Purpose: Auto-escalate unanswered booking requests after 2 hours
// Dependencies: node-cron, ../config/db, ../services/notification.service

// const cron = require('node-cron');
// const prisma = require('../config/db');

/**
 * TODO: Run every 15 minutes via node-cron
 * Schedule: every 15 minutes ("star slash 15")
 *
 * Steps:
 *   1. Find bookings WHERE status = 'SENT' AND expiresAt < NOW
 *   2. For each expired:
 *      a. Update status to 'EXPIRED'
 *      b. Find next-best truck from cached optimization result
 *      c. Create new booking_request for next-best truck
 *      d. Notify warehouse: "Previous truck unavailable, trying next best"
 *      e. Notify new dealer with booking request
 *   3. If no more trucks: notify warehouse to re-run optimization
 *
 * Called by: server.js on startup
 */

// function startBookingTimeoutJob() { /* TODO */ }
// module.exports = { startBookingTimeoutJob };
