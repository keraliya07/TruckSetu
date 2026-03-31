// === backend/src/config/redis.js ===
// Purpose: Redis client singleton for caching and pub/sub
// Dependencies: ioredis

// const Redis = require('ioredis');  // TODO: uncomment

/**
 * TODO: Create Redis client singleton
 *
 * Steps:
 *   1. Create new Redis instance: new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
 *   2. Handle 'connect' event: log "✅ Redis connected"
 *   3. Handle 'error' event: log error, don't crash (cache is optional)
 *   4. Handle 'reconnecting' event: log attempt
 *   5. Export the client
 *
 * USAGE:
 *   const redis = require('../config/redis');
 *   await redis.set('key', 'value', 'EX', 3600);  // Set with 1hr TTL
 *   const value = await redis.get('key');
 *
 * NOTE: For Socket.io Redis adapter, a SEPARATE pub/sub client pair is needed
 *   (created in socket.js config)
 */

// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
// module.exports = redis;
