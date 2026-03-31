// === frontend/src/store/notificationStore.js ===
// Purpose: Zustand store for in-app notification state
// Dependencies: zustand

// import { create } from 'zustand';   // TODO: uncomment

/**
 * TODO: Create notificationStore
 *
 * STATE:
 *   notifications: array         — List of notifications
 *   unreadCount: number          — Badge count
 *   isOpen: boolean              — Notification panel open state
 *
 * ACTIONS:
 *   addNotification(notification) — Push new notification (from socket)
 *   markRead(notificationId)     — Mark single as read
 *   markAllRead()                — Mark all as read
 *   togglePanel()                — Open/close notification panel
 *   fetchNotifications()         — Load from API on initial mount
 *
 * Called by: NotificationBell, useSocket hook
 */
