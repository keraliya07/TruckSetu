import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { getPrimaryWorkspaceLink, getRoleLabel, getSectionsForRole } from '../../utils/navigation';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationBell from './NotificationBell';

const iconMap = {
  alert: AlertTriangle,
  analytics: BarChart3,
  bookings: ClipboardList,
  create: PlusCircle,
  dashboard: LayoutDashboard,
  fleet: Truck,
  returnLoads: RotateCcw,
  shipments: Package,
  users: Users,
};

export default function Sidebar({
  isCollapsed,
  isMobileOpen,
  onClose,
  onToggleCollapse,
}) {
  const { logout, user } = useAuth();
  const sections = getSectionsForRole(user?.role);
  const primaryWorkspaceLink = getPrimaryWorkspaceLink(user?.role);
  const roleLabel = getRoleLabel(user?.role);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const toggleNotifications = useNotificationStore((state) => state.togglePanel);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const initials = String(user?.name || 'S')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    if (!isProfileOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);

  const handleClose = () => {
    setIsProfileOpen(false);
    onClose();
  };
  const notificationBadge = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition lg:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[18.5rem] flex-col border-r border-slate-200 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur transition duration-200 lg:sticky lg:top-3 lg:z-20 lg:h-[calc(100vh-1.5rem)] lg:translate-x-0 lg:rounded-[2rem] lg:border lg:shadow-card ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[6.25rem]' : 'lg:w-[18.5rem]'}`}
      >
        <div className="border-b border-slate-200 pb-5">
          <div className={`px-2 ${isCollapsed ? 'space-y-3' : 'space-y-4'}`}>
            <div className={`flex gap-3 ${isCollapsed ? 'justify-center' : 'items-center justify-between'}`}>
              <Link
                className={`flex min-w-0 items-center gap-3 ${isCollapsed ? 'lg:flex-col' : ''}`}
                onClick={handleClose}
                title="TruckSetu"
                to={primaryWorkspaceLink}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 font-heading text-sm uppercase tracking-[0.25em] text-white">
                  TS
                </div>
                <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                  <p className="font-heading text-xl text-slate-950">TruckSetu</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {roleLabel}
                  </p>
                </div>
              </Link>

              {!isCollapsed ? (
                <button
                  className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:inline-flex"
                  onClick={onToggleCollapse}
                  type="button"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : null}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
              {isCollapsed ? (
                <button
                  className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:inline-flex"
                  onClick={onToggleCollapse}
                  type="button"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto pb-4 pt-5">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <p
                className={`px-3 text-xs uppercase tracking-[0.24em] text-slate-400 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}
              >
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || ShieldCheck;

                  return (
                    <NavLink
                      end={item.end}
                      key={item.key}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                          isActive
                            ? 'bg-slate-950 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                      }
                      onClick={handleClose}
                      title={isCollapsed ? item.label : undefined}
                      to={item.to}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}

        </div>

        <div className="relative mt-4" ref={profileRef}>
          <button
            className={`flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-4 text-left transition hover:border-slate-300 hover:bg-white ${
              isCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
            onClick={() => setIsProfileOpen((current) => !current)}
            title={isCollapsed ? user?.name : undefined}
            type="button"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 to-freight-700 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className={`min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{roleLabel}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 ${isCollapsed ? 'lg:hidden' : ''}`} />
          </button>

          {isProfileOpen ? (
            <div
              className={`absolute bottom-full z-30 mb-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl ${
                isCollapsed ? 'left-full ml-3 w-72' : 'left-0 right-0'
              }`}
            >
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <div className="mt-3 space-y-1">
                <button
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  onClick={async () => {
                    setIsProfileOpen(false);
                    await logout();
                  }}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <button
          className={`mt-4 flex w-full items-center rounded-3xl border border-slate-200 bg-slate-50 text-left transition hover:border-slate-300 hover:bg-white ${
            isCollapsed ? 'justify-center px-2 py-2' : 'justify-between gap-3 px-3 py-3'
          }`}
          onClick={toggleNotifications}
          type="button"
        >
          <div className={`flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
            {!isCollapsed ? (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Updates</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Notifications</p>
              </>
            ) : null}
          </div>
          <div className="relative ml-auto grid h-14 w-14 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-700">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                {notificationBadge}
              </span>
            ) : null}
          </div>
          <NotificationBell
            hideTrigger
            panelClassName="fixed bottom-4 left-4 right-4 top-auto mt-0 w-auto sm:left-auto sm:right-6 sm:w-96 sm:max-w-[calc(100vw-3rem)] sm:bottom-6 lg:absolute lg:bottom-auto lg:left-full lg:right-auto lg:top-1/2 lg:ml-8 lg:mt-0 lg:w-96 lg:max-w-none lg:-translate-y-[65%]"
          />
        </button>
      </aside>
    </>
  );
}
