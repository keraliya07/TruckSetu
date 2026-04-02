const trackingService = require('../services/tracking.service');

function registerTripSocket(io, socket) {
  socket.on('trip:join', async ({ tripId }) => {
    if (!tripId) {
      return;
    }

    try {
      await trackingService.joinTripRoom(socket, tripId, socket.data.user);
    } catch (error) {
      socket.emit('trip:error', {
        message: error.message,
      });
    }
  });

  socket.on('trip:leave', ({ tripId }) => {
    if (!tripId) {
      return;
    }

    socket.leave(`trip:${tripId}`);
  });
}

module.exports = { registerTripSocket };
