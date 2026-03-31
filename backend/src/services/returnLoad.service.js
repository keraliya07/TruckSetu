// === backend/src/services/returnLoad.service.js ===
// Purpose: Return load matching after trip completion
// Dependencies: ../config/db, ../config/redis, axios, ./notification.service, ../utils/osrm.utils

// const prisma = require('../config/db');              // TODO: uncomment
// const axios = require('axios');                      // TODO: uncomment
// const { PYTHON_ML_URL } = require('../config/env'); // TODO: uncomment
// const { sendNotification } = require('./notification.service'); // TODO: uncomment

/**
 * TODO: Implement findReturnLoads
 * @param {string} tripId
 *
 * RETURN LOAD MATCHING ALGORITHM:
 *
 * Step 1: Get the trip's final delivery location (last stop coordinates + city)
 *   Prisma: prisma.trip.findUnique({ where: { id: tripId }, include: {
 *     truck: { include: { dealer: true } },
 *     stops: { orderBy: { sequenceOrder: 'desc' }, take: 1 }
 *   }})
 *
 * Step 2: Get the truck's home city (dealer's primary city coordinates)
 *
 * Step 3: Find all PENDING shipments where:
 *   - shipment.origin_city is within 150 km of trip's last delivery city (use haversine)
 *   - shipment.weight_kg <= truck.maxWeightKg
 *   - shipment.deadline > NOW + estimated_return_travel_time
 *   Prisma: prisma.shipment.findMany({ where: { status: 'PENDING' } })
 *   Then filter by haversine distance in app code (Prisma doesn't support geo queries)
 *
 * Step 4: Call Python ML service POST /internal/return-load-score
 *   Body: { truck: { id, currentLat, currentLng, maxWeightKg, homeLat, homeLng }, candidateShipments }
 *   Response: { scored: [{ shipmentId, proximityScore, directionScore, utilizationScore, combinedScore }] }
 *
 * Step 5: Save top matches to return_load_matches table:
 *   prisma.returnLoadMatch.createMany({ data: topMatches.map(m => ({
 *     tripId, shipmentId: m.shipmentId, ...m.scores,
 *     status: 'PENDING', expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
 *   })) })
 *
 * Step 6: Send notification to dealer:
 *   sendNotification({ userId: dealerUserId, type: 'RETURN_LOAD',
 *     title: 'Return Load Available!',
 *     message: \`\${matches.length} return load opportunities near \${lastStopCity}\`,
 *     link: '/dealer/return-loads?tripId=' + tripId
 *   })
 *
 * Step 7: Emit socket event to dealer: io.to(\`user:\${dealerUserId}\`).emit('returnLoad:available', { tripId, count: matches.length })
 *
 * Called by: jobs/returnLoad.job.js (triggered on trip DELIVERED event)
 * Calls: Python ML service, osrm.utils, notification.service
 */

/**
 * TODO: Implement acceptMatch — Dealer accepts a return load
 * 1. Update match status → ACCEPTED
 * 2. Create booking request with status PRE_APPROVED
 * 3. Expire other matches for this trip
 */

/**
 * TODO: Implement rejectMatch — Dealer rejects a return load
 * Update match status → REJECTED
 */

// module.exports = { findReturnLoads, getMatches, acceptMatch, rejectMatch };
