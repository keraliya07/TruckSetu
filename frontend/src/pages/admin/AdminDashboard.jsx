import { Link } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import MetricCard from '../../components/common/MetricCard';

const metrics = [
  { label: 'Auth + Profiles', value: 'Live', hint: 'Supabase-backed authentication and seeded roles.' },
  { label: 'Core Modules', value: 'Live', hint: 'Shipment, truck, booking, trip, and tracking data are active.' },
  { label: 'Analytics', value: 'Live', hint: 'Platform analytics now aggregate live operational records.' },
  { label: 'Next Focus', value: 'UI Polish', hint: 'Design refinement and deeper module expansion remain next.' },
];

const alerts = [
  'Warehouse and dealer flows now include detail pages and trip handoff surfaces.',
  'Admin analytics can inspect shipment, truck, booking, and trip trends.',
  'Optimization uses a derived scoring model until dedicated ML scoring routes are connected.',
];

export default function AdminDashboard() {
  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Dashboard"
      title="Platform rollout overview"
      subtitle="Admin access now spans system analytics and a more accurate picture of what parts of the logistics platform are live today."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="panel p-6">
          <h2 className="font-heading text-2xl text-slate-950">Delivery checkpoints</h2>
          <div className="mt-6 grid gap-3">
            {['Auth + onboarding', 'Database model', 'Shipment + fleet', 'Booking + trip', 'Tracking + analytics', 'Optimization detail'].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <span>{item}</span>
                  <span className="font-semibold text-slate-900">Live</span>
                </div>
              )
            )}
          </div>
        </article>

        <article className="panel p-6">
          <h2 className="font-heading text-2xl text-slate-950">Current alerts</h2>
          <div className="mt-6 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
              >
                {alert}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link className="btn-primary" to="/admin/analytics">
              Open system analytics
            </Link>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
