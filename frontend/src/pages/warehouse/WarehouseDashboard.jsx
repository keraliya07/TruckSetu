import { Link } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import MetricCard from '../../components/common/MetricCard';
import { useAuth } from '../../hooks/useAuth';

const metrics = [
  { label: 'Shipment Board', value: 'Live', hint: 'Create, inspect, and progress loads through booking.' },
  { label: 'Optimization', value: 'Live', hint: 'Score visible trucks before sending a request.' },
  { label: 'Booking Detail', value: 'Live', hint: 'Review counters, economics, and trip handoff.' },
  { label: 'Tracking', value: 'Live', hint: 'Monitor approved trips with ETA and stop progression.' },
];

const highlights = [
  'Create shipment drafts, promote them to pending, and inspect shipment-level detail.',
  'Run optimization to compare truck utilization, cost, route fit, and CO2 impact.',
  'Open booking detail pages to accept counters and jump into live trip tracking.',
];

export default function WarehouseDashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Dashboard"
      title={`Welcome back, ${user?.warehouse?.warehouseName || user?.name}`}
      subtitle="The warehouse workspace now covers shipment detail, truck optimization, booking negotiation, and live trip visibility."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="panel p-6">
          <h2 className="font-heading text-2xl text-slate-950">What you can do now</h2>
          <div className="mt-6 space-y-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-6">
          <h2 className="font-heading text-2xl text-slate-950">Open workflows</h2>
          <div className="mt-6 flex flex-col gap-3">
            <Link className="btn-primary" to="/warehouse/shipments">
              Open shipment board
            </Link>
            <Link className="btn-secondary" to="/warehouse/bookings">
              Open bookings
            </Link>
            <Link className="btn-secondary" to="/warehouse/optimization">
              Open optimization
            </Link>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
