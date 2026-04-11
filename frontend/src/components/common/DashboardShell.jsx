import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useSocket } from '../../hooks/useSocket';
import Sidebar from './Sidebar';

export default function DashboardShell({
  accent,
  eyebrow,
  title,
  subtitle,
  children,
}) {
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

        <div className="min-w-0 flex-1 space-y-6 animate-fade-in">
          <header className="flex items-center justify-between py-2 mb-2">
            <div className="flex items-center gap-4">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/50 text-slate-700 backdrop-blur-md transition hover:border-slate-300 hover:bg-white hover:shadow-sm lg:hidden hover:-translate-y-px"
                onClick={() => setIsSidebarOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-heading text-xl font-semibold text-slate-900 tracking-tight lg:text-2xl">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div
                  className="flex items-center gap-2 rounded-full bg-white/60 border border-emerald-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 shadow-sm backdrop-blur-md"
                  title="Realtime connected"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-full bg-white/60 border border-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-700 shadow-sm backdrop-blur-md"
                  title="Reconnecting"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Offline
                </div>
              )}
            </div>
          </header>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
