import { create } from 'zustand';

import * as notificationApi from '../api/notification.api';

const upsertNotification = (notifications, notification) => {
  const next = [
    notification,
    ...notifications.filter((item) => item.id !== notification.id),
  ];

  return next.slice(0, 20);
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,
  error: null,
  lastFetchedAt: 0,
  fetchNotifications: async (limit = 12, { force = false } = {}) => {
    const { notifications, lastFetchedAt } = get();
    if (!force && notifications.length && Date.now() - lastFetchedAt < 30 * 1000) {
      return {
        notifications,
        unreadCount: get().unreadCount,
      };
    }

    set({ isLoading: true, error: null });

    try {
      const result = await notificationApi.getNotifications({ limit });
      set({
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        isLoading: false,
        lastFetchedAt: Date.now(),
      });
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  addNotification: (notification) =>
    set((state) => {
      const notifications = upsertNotification(state.notifications, notification);
      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.isRead).length,
      };
    }),
  markRead: async (notificationId) => {
    const result = await notificationApi.markNotificationRead(notificationId);
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? result.notification : notification
      ),
      lastFetchedAt: Date.now(),
      unreadCount: Math.max(
        0,
        state.notifications.some(
          (notification) => notification.id === notificationId && !notification.isRead
        )
          ? state.unreadCount - 1
          : state.unreadCount
      ),
    }));
    return result;
  },
  markAllRead: async () => {
    await notificationApi.markAllNotificationsRead();
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString(),
      })),
      lastFetchedAt: Date.now(),
      unreadCount: 0,
    }));
  },
  applyNotificationUpdate: (notification) =>
    set((state) => {
      const notifications = upsertNotification(state.notifications, notification);
      return {
        notifications,
        lastFetchedAt: Date.now(),
        unreadCount: notifications.filter((item) => !item.isRead).length,
      };
    }),
  markAllReadLocal: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      lastFetchedAt: Date.now(),
      unreadCount: 0,
    })),
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  closePanel: () => set({ isOpen: false }),
}));
