// === frontend/src/hooks/useSocket.js ===
// Purpose: Custom hook for Socket.io connection lifecycle and event handling
// Dependencies: socket.io-client, ../store/authStore, ../store/notificationStore, ../store/tripStore

// import { useEffect, useRef, useCallback } from 'react';       // TODO: uncomment
// import { io } from 'socket.io-client';                          // TODO: uncomment
// import { useAuthStore } from '../store/authStore';               // TODO: uncomment
// import { useNotificationStore } from '../store/notificationStore'; // TODO: uncomment

/**
 * TODO: Implement useSocket hook
 *
 * Purpose: Manage a single Socket.io connection per authenticated user
 *
 * Steps:
 *   1. On mount (when user is authenticated):
 *      - Connect to VITE_SOCKET_URL with auth: { token: jwt }
 *      - Store socket ref in useRef
 *
 *   2. Register global event listeners:
 *      - 'notification:new' → add to notificationStore
 *      - 'booking:update' → refresh booking data
 *      - 'connect_error' → handle auth failure
 *      - 'disconnect' → log and attempt reconnect
 *
 *   3. On unmount or logout:
 *      - socket.disconnect()
 *      - Clean up all listeners
 *
 *   4. Expose methods:
 *      - joinRoom(roomName)  — socket.emit('join', roomName)
 *      - leaveRoom(roomName) — socket.emit('leave', roomName)
 *      - socket (ref)        — Raw socket for trip-specific hooks
 *
 * SOCKET URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
 *
 * Called by: App.jsx (top-level), useTracking hook
 *
 * @returns {{ socket: Socket | null, joinRoom: function, leaveRoom: function, isConnected: boolean }}
 */

// export function useSocket() {
//   // TODO: Implement socket connection lifecycle
// }
