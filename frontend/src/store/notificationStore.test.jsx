import { beforeEach, describe, expect, test, vi } from 'vitest';

const { notificationApiMocks } = vi.hoisted(() => ({
  notificationApiMocks: {
    getNotifications: vi.fn(),
    markAllNotificationsRead: vi.fn(),
    markNotificationRead: vi.fn(),
  },
}));

vi.mock('../api/notification.api', () => notificationApiMocks);

import { useNotificationStore } from './notificationStore';

function resetStore() {
  useNotificationStore.setState({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    isLoading: false,
    error: null,
  });
}

describe('useNotificationStore realtime updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  test('fetchNotifications hydrates unread count and notification list', async () => {
    notificationApiMocks.getNotifications.mockResolvedValue({
      unreadCount: 2,
      notifications: [
        { id: 'n-1', title: 'Trip started', isRead: false },
        { id: 'n-2', title: 'Booking approved', isRead: true },
      ],
    });

    await useNotificationStore.getState().fetchNotifications();

    const state = useNotificationStore.getState();
    expect(state.unreadCount).toBe(2);
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[0].id).toBe('n-1');
  });

  test('applyNotificationUpdate keeps a single copy and recalculates unread count', () => {
    useNotificationStore.setState({
      notifications: [
        { id: 'n-1', title: 'Trip started', isRead: false },
        { id: 'n-2', title: 'Booking approved', isRead: false },
      ],
      unreadCount: 2,
    });

    useNotificationStore.getState().applyNotificationUpdate({
      id: 'n-1',
      title: 'Trip started',
      isRead: true,
    });

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[0].id).toBe('n-1');
    expect(state.unreadCount).toBe(1);
  });
});
