import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNotificationStore } from '../../store/notificationStore';

export default function NotificationBell() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    error,
    fetchNotifications,
    togglePanel,
    closePanel,
    markRead,
    markAllRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications().catch(() => {});
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closePanel();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closePanel, isOpen]);

  const badge = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="relative rounded-full border border-slate-200 bg-white p-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        onClick={togglePanel}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-30 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Notifications
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {unreadCount} unread item(s)
              </p>
            </div>
            <button
              className="text-sm font-semibold text-freight-700"
              onClick={async () => {
                await markAllRead();
              }}
              type="button"
            >
              Mark all read
            </button>
          </div>

          <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Loading notifications...
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    notification.isRead
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-brand-200 bg-brand-50'
                  }`}
                  onClick={async () => {
                    if (!notification.isRead) {
                      await markRead(notification.id);
                    }

                    closePanel();
                    if (notification.link) {
                      navigate(notification.link);
                    }
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                    </div>
                    {!notification.isRead ? (
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                    ) : null}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
