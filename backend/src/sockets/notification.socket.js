const notificationService = require('../services/notification.service');

function registerNotificationSocket(io, socket) {
  socket.on('notification:read', async ({ notificationId }) => {
    if (!notificationId) {
      return;
    }

    try {
      await notificationService.markRead(socket.data.user.userId, notificationId);
    } catch (error) {
      socket.emit('notification:error', {
        message: error.message,
      });
    }
  });

  socket.on('notification:readAll', async () => {
    try {
      await notificationService.markAllRead(socket.data.user.userId);
    } catch (error) {
      socket.emit('notification:error', {
        message: error.message,
      });
    }
  });
}

module.exports = { registerNotificationSocket };
