import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import Sidebar from './Sidebar';

export default function DashboardShell({
  accent,
  eyebrow,
  title,
  subtitle,
  children,
}) {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="min-h-screen bg-dashboard-grid bg-[size:24px_24px] px-3 py-3 sm:px-4 lg:px-5">
      <div className="flex w-full items-start gap-4 lg:gap-6">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <header className="panel overflow-hidden">
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
              <div className="space-y-3">
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                  type="button"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <p className={`font-heading text-sm uppercase tracking-[0.35em] ${accent}`}>
                  {eyebrow}
                </p>
                <div>
                  <h1 className="font-heading text-3xl text-slate-950 sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  Signed in as <span className="font-semibold text-slate-900">{user?.name}</span>
                </div>
                <div
                  className={`rounded-3xl px-4 py-4 text-sm font-semibold ${
                    isConnected
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {isConnected ? 'Realtime connected' : 'Realtime reconnecting'}
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 sm:col-span-2 xl:col-span-1">
                  Role: <span className="font-semibold text-slate-900">{user?.role}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
