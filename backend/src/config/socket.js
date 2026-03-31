// === backend/src/config/socket.js ===
// Purpose: Socket.io server initialization with Redis adapter and JWT auth
// Dependencies: socket.io, @socket.io/redis-adapter, ioredis, jsonwebtoken, ../sockets/*

// const { Server } = require('socket.io');                    // TODO: uncomment
// const { createAdapter } = require('@socket.io/redis-adapter'); // TODO: uncomment
// const Redis = require('ioredis');                            // TODO: uncomment
// const jwt = require('jsonwebtoken');                         // TODO: uncomment
// const { registerTripSocket } = require('../sockets/trip.socket');       // TODO: uncomment
// const { registerLocationSocket } = require('../sockets/location.socket'); // TODO: uncomment
// const { registerNotificationSocket } = require('../sockets/notification.socket'); // TODO: uncomment

/**
 * TODO: Initialize Socket.io server with the Express HTTP server
 *
 * Steps:
 *   1. Create Socket.io server:
 *      const io = new Server(httpServer, {
 *        cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
 *        transports: ['websocket', 'polling'],
 *      });
 *
 *   2. Attach Redis adapter (for multi-instance pub/sub):
 *      const pubClient = new Redis(process.env.REDIS_URL);
 *      const subClient = pubClient.duplicate();
 *      io.adapter(createAdapter(pubClient, subClient));
 *
 *   3. On connection: extract JWT from handshake.auth.token, verify it:
 *      io.use((socket, next) => {
 *        const token = socket.handshake.auth.token;
 *        try {
 *          const decoded = jwt.verify(token, process.env.JWT_SECRET);
 *          socket.userId = decoded.userId;
 *          socket.userRole = decoded.role;
 *          next();
 *        } catch (err) {
 *          next(new Error('Authentication error'));
 *        }
 *      });
 *
 *   4. Register all socket event handlers from /sockets/ folder:
 *      io.on('connection', (socket) => {
 *        // Auto-join user to their personal room for notifications
 *        socket.join(`user:${socket.userId}`);
 *        registerTripSocket(io, socket);
 *        registerLocationSocket(io, socket);
 *        registerNotificationSocket(io, socket);
 *      });
 *
 *   5. Export io instance for use in services:
 *      module.exports = { initSocketServer, getIO };
 *
 * Called by: server.js
 */

// let io;
// function initSocketServer(httpServer) {
//   // TODO: Implement Socket.io initialization
// }
// function getIO() { return io; }
// module.exports = { initSocketServer, getIO };
