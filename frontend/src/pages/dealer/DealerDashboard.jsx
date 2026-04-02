import { Link } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import MetricCard from '../../components/common/MetricCard';
import { useAuth } from '../../hooks/useAuth';

const metrics = [
  { label: 'Fleet Board', value: 'Live', hint: 'Inspect truck detail and keep availability accurate.' },
  { label: 'Booking Detail', value: 'Live', hint: 'Counter, approve, and open trip-ready requests.' },
  { label: 'Trip Console', value: 'Live', hint: 'Start trips and complete stops from a single surface.' },
  { label: 'Analytics', value: 'Live', hint: 'Revenue, utilization, and CO2 performance are now visible.' },
  { label: 'Return Loads', value: 'Live', hint: 'Capture backhaul opportunities after a trip is delivered.' },
];

const fleetNotes = [
  'Open truck detail for lifecycle, trip history, and quick status changes.',
  'Respond to booking requests with approval or counter offers from the board or detail view.',
  'Use trip management pages to progress active routes and return trucks to availability.',
];

export default function DealerDashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Dashboard"
      title={user?.truckDealer?.companyName || user?.name}
      subtitle="The dealer workspace now connects fleet management, booking negotiation, trip execution, and analytics into one flow."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="panel p-6">
          <h2 className="font-heading text-2xl text-slate-950">Operational focus</h2>
          <div className="mt-6 space-y-3">
            {fleetNotes.map((item) => (
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
            <Link className="btn-primary" to="/dealer/fleet">
              Open fleet
            </Link>
            <Link className="btn-secondary" to="/dealer/bookings">
              Open booking requests
            </Link>
            <Link className="btn-secondary" to="/dealer/return-loads">
              Open return loads
            </Link>
            <Link className="btn-secondary" to="/dealer/analytics">
              Open analytics
            </Link>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
