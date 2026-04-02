import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import NotificationBell from './NotificationBell';

export default function DashboardShell({
  accent,
  eyebrow,
  title,
  subtitle,
  children,
}) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <main className="min-h-screen bg-dashboard-grid bg-[size:24px_24px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="panel overflow-hidden">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="space-y-3">
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Signed in as <span className="font-semibold text-slate-900">{user?.name}</span>
              </div>
              <div
                className={`rounded-full px-4 py-3 text-sm font-semibold ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {isConnected ? 'Realtime connected' : 'Realtime reconnecting'}
              </div>
              <NotificationBell />
              <Link className="btn-secondary" to="/account/security">
                Security
              </Link>
              <Link className="btn-secondary" to="/status">
                Roadmap
              </Link>
              <button className="btn-primary" onClick={logout} type="button">
                Sign out
              </button>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
