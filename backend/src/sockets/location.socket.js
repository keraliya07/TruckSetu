const trackingService = require('../services/tracking.service');

function registerLocationSocket(io, socket) {
  socket.on('location:update', async (payload) => {
    if (!payload?.tripId) {
      return;
    }

    try {
      await trackingService.broadcastLocation(payload.tripId, payload, socket.data.user);
    } catch (error) {
      socket.emit('tracking:error', {
        message: error.message,
      });
    }
  });
}

module.exports = { registerLocationSocket };
