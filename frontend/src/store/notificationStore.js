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
  fetchNotifications: async (limit = 12) => {
    set({ isLoading: true, error: null });

    try {
      const result = await notificationApi.getNotifications({ limit });
      set({
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        isLoading: false,
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
      unreadCount: 0,
    }));
  },
  applyNotificationUpdate: (notification) =>
    set((state) => {
      const notifications = upsertNotification(state.notifications, notification);
      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.isRead).length,
      };
    }),
  markAllReadLocal: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
    })),
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  closePanel: () => set({ isOpen: false }),
}));
