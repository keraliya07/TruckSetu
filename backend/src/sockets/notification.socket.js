// === backend/src/sockets/notification.socket.js ===
// Purpose: Handle notification read events from clients
// Dependencies: ../services/notification.service

/**
 * TODO: Implement registerNotificationSocket(io, socket)
 *
 * Events:
 *   'notification:read' — { notificationId } → markRead
 *   'notification:readAll' — mark all read for socket.userId
 *
 * NOTE: Outgoing notifications are pushed FROM notification.service
 *   via io.to('user:' + userId).emit('notification:new', data)
 */

// function registerNotificationSocket(io, socket) { /* TODO */ }
// module.exports = { registerNotificationSocket };
