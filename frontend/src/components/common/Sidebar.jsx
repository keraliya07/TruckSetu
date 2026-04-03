import {
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Package,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
  Users,
  Zap,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { getRoleLabel, getSectionsForRole } from '../../utils/navigation';

const iconMap = {
  alert: AlertTriangle,
  analytics: BarChart3,
  bookings: ClipboardList,
  create: PlusCircle,
  dashboard: LayoutDashboard,
  fleet: Truck,
  optimize: Zap,
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
  const { user } = useAuth();
  const sections = getSectionsForRole(user?.role);

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
        <div className="flex items-center justify-between gap-3 px-2 pb-4">
          <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
            <p className="font-heading text-lg text-slate-950">Workspace</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {getRoleLabel(user?.role)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:inline-flex"
              onClick={onToggleCollapse}
              type="button"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto pb-4">
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
                      key={item.key}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                          isActive
                            ? 'bg-slate-950 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                      }
                      onClick={onClose}
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

        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 to-freight-700 text-sm font-semibold text-white">
              {String(user?.name || 'S')
                .split(' ')
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
