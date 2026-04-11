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
        className={`fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 px-3 py-3 shadow-lg transition-all duration-300 ease-in-out lg:sticky lg:top-3 lg:z-20 lg:h-[calc(100vh-1.5rem)] lg:translate-x-0 lg:rounded-[2rem] lg:border ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-[5.5rem] lg:w-[5.5rem]' : 'w-[17.5rem] lg:w-[17.5rem]'}`}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        }}
      >
        {/* ── Brand Header ── */}
        <div className="border-b border-slate-200 pb-4">
          <div className={`px-1 ${isCollapsed ? 'space-y-3' : 'space-y-3'}`}>
            <div className={`flex gap-3 ${isCollapsed ? 'justify-center' : 'items-center justify-between'}`}>
              <Link
                className={`flex min-w-0 items-center gap-3 ${isCollapsed ? 'lg:flex-col' : ''}`}
                onClick={handleClose}
                title="TruckSetu"
                to={primaryWorkspaceLink}
              >
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-heading text-sm uppercase tracking-[0.2em] text-white"
                  style={{
                    background: 'linear-gradient(135deg, #0d9488, #6366f1)',
                    boxShadow: '0 0 20px rgba(13, 148, 136, 0.3)',
                  }}
                >
                  TS
                </div>
                <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                  <p className="font-heading text-lg text-slate-800">TruckSetu</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                    {roleLabel}
                  </p>
                </div>
              </Link>

              {!isCollapsed ? (
                <button
                  className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:inline-flex"
                  onClick={onToggleCollapse}
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:hidden"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
              {isCollapsed ? (
                <button
                  className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:inline-flex"
                  onClick={onToggleCollapse}
                  type="button"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-4 pt-4">
          {sections.map((section) => (
            <section key={section.title} className="space-y-1">
              <p
                className={`px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}
              >
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || ShieldCheck;

                  return (
                    <NavLink
                      end={item.end}
                      key={item.key}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-freight-600/10 to-accent-600/10 text-slate-800'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                      }
                      onClick={handleClose}
                      title={isCollapsed ? item.label : undefined}
                      to={item.to}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                              style={{
                                background: 'linear-gradient(180deg, #0d9488, #6366f1)',
                                boxShadow: '0 0 8px rgba(13, 148, 136, 0.5)',
                              }}
                            />
                          )}
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                            isActive
                              ? 'bg-gradient-to-br from-freight-600/20 to-accent-600/20 text-freight-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}>
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}

        </div>

        {/* ── Profile Section ── */}
        <div className="relative mt-2" ref={profileRef}>
          <button
            className={`flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition-all duration-200 hover:bg-slate-100 ${
              isCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
            onClick={() => setIsProfileOpen((current) => !current)}
            title={isCollapsed ? user?.name : undefined}
            type="button"
          >
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #0d9488, #6366f1)',
              }}
            >
              {initials}
            </div>
            <div className={`min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-slate-700">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{roleLabel}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 ${isCollapsed ? 'lg:hidden' : ''}`} />
          </button>

          {isProfileOpen ? (
            <div
              className={`absolute bottom-full z-30 mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ${
                isCollapsed ? 'left-full ml-3 w-72' : 'left-0 right-0'
              }`}
            >
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-slate-400">
                  {roleLabel}
                </p>
              </div>

              <div className="mt-2">
                <button
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
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

        {/* ── Notifications ── */}
        <button
          className={`mt-3 flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 text-left transition-all duration-200 hover:bg-slate-100 ${
            isCollapsed ? 'justify-center px-2 py-2' : 'justify-between gap-3 px-3 py-3'
          }`}
          onClick={toggleNotifications}
          type="button"
        >
          <div className={`flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
            {!isCollapsed ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Updates</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">Notifications</p>
              </>
            ) : null}
          </div>
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-600">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30 animate-glow-pulse">
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
