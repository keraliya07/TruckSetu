import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useTripStore } from '../store/tripStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let sharedSocket = null;
let sharedToken = null;

function registerSharedListeners(socket) {
  if (socket.__stlosRegistered) {
    return;
  }

  socket.__stlosRegistered = true;

  socket.on('notification:new', (notification) => {
    useNotificationStore.getState().addNotification(notification);
  });

  socket.on('notification:updated', (notification) => {
    useNotificationStore.getState().applyNotificationUpdate(notification);
  });

  socket.on('notification:allRead', () => {
    useNotificationStore.getState().markAllReadLocal();
  });

  socket.on('trip:state', (trip) => {
    useTripStore.getState().applyTripState(trip);
  });

  socket.on('location:update', (location) => {
    useTripStore.getState().updateTruckLocation(location);
  });
}

function ensureSocket(token) {
  if (!token) {
    if (sharedSocket) {
      sharedSocket.disconnect();
      sharedSocket = null;
      sharedToken = null;
    }
    return null;
  }

  if (sharedSocket && sharedToken === token) {
    registerSharedListeners(sharedSocket);
    return sharedSocket;
  }

  if (sharedSocket) {
    sharedSocket.disconnect();
  }

  sharedSocket = io(SOCKET_URL, {
    auth: {
      token,
    },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });
  sharedToken = token;
  registerSharedListeners(sharedSocket);

  return sharedSocket;
}

export function useSocket() {
  const token = useAuthStore((state) => state.token);
  const [isConnected, setIsConnected] = useState(Boolean(sharedSocket?.connected));

  useEffect(() => {
    const socket = ensureSocket(token);

    if (!socket) {
      setIsConnected(false);
      return undefined;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = () => setIsConnected(false);

    setIsConnected(socket.connected);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
    };
  }, [token]);

  const joinTrip = useCallback((tripId) => {
    if (sharedSocket && tripId) {
      sharedSocket.emit('trip:join', { tripId });
    }
  }, []);

  const leaveTrip = useCallback((tripId) => {
    if (sharedSocket && tripId) {
      sharedSocket.emit('trip:leave', { tripId });
    }
  }, []);

  const emitLocationUpdate = useCallback((payload) => {
    if (sharedSocket && payload?.tripId) {
      sharedSocket.emit('location:update', payload);
    }
  }, []);

  const markNotificationRead = useCallback((notificationId) => {
    if (sharedSocket && notificationId) {
      sharedSocket.emit('notification:read', { notificationId });
    }
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (sharedSocket) {
      sharedSocket.emit('notification:readAll');
    }
  }, []);

  return {
    emitLocationUpdate,
    isConnected,
    joinTrip,
    leaveTrip,
    markAllNotificationsRead,
    markNotificationRead,
    socket: sharedSocket,
  };
}
