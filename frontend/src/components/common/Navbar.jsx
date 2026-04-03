import { ChevronDown, LayoutGrid, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import {
  getPrimaryWorkspaceLink,
  getQuickLinksForRole,
  getRoleLabel,
} from '../../utils/navigation';
import NotificationBell from './NotificationBell';

export default function Navbar({ onOpenSidebar }) {
  const { logout, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const containerRef = useRef(null);
  const role = user?.role;
  const quickLinks = getQuickLinksForRole(role);
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
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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

  return (
    <header className="panel sticky top-3 z-40 overflow-visible">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          onClick={onOpenSidebar}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          className="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-slate-50"
          to={getPrimaryWorkspaceLink(role)}
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 font-heading text-sm uppercase tracking-[0.25em] text-white">
            ST
          </div>
          <div className="min-w-0">
            <p className="font-heading text-lg text-slate-950">STLOS</p>
            <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-500">
              {getRoleLabel(role)}
            </p>
          </div>
        </Link>

        <nav className="ml-3 hidden items-center gap-1 lg:flex">
          {quickLinks.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <NotificationBell />

          <div className="relative" ref={containerRef}>
            <button
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => setIsProfileOpen((current) => !current)}
              type="button"
            >
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-freight-700 to-brand-600 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{getRoleLabel(role)}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 z-50 mt-3 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
                </div>

                <div className="mt-3 space-y-1">
                  <Link
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                    onClick={() => setIsProfileOpen(false)}
                    to={getPrimaryWorkspaceLink(role)}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                    onClick={() => setIsProfileOpen(false)}
                    to="/account/security"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Account security
                  </Link>
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
        </div>
      </div>
    </header>
  );
}
