import { useState } from 'react';

import CO2Chart from '../../components/analytics/CO2Chart';
import KPICard from '../../components/analytics/KPICard';
import RevenueChart from '../../components/analytics/RevenueChart';
import UtilizationChart from '../../components/analytics/UtilizationChart';
import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatters';

const periods = ['7d', '30d', '90d'];

export default function DealerAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { analytics, error, isLoading } = useAnalytics('dealer', period);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title="Fleet analytics"
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet', label: 'Fleet' },
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/analytics', label: 'Analytics', active: true },
          { to: '/dealer/return-loads', label: 'Return loads' },
        ]}
      />

      {/* ── Toolbar ── */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Commercial performance</h2>
          </div>
          <div className="flex gap-1.5">
            {periods.map((value) => (
              <button
                key={value}
                className={`inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-semibold transition-all duration-200 ${
                  value === period
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setPeriod(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? <LoadingSpinner label="Loading analytics..." /> : null}

      {error ? (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {analytics ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {analytics.metrics.map((metric) => (
              <KPICard
                key={metric.title}
                change={metric.change}
                icon={metric.icon}
                title={metric.title}
                value={metric.value}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <RevenueChart data={analytics.revenueSeries} period={period} />
            <UtilizationChart data={analytics.utilizationSeries} period={period} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <CO2Chart data={analytics.co2Series} period={period} />
            <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
              <div className="flex-none px-6 py-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-semibold text-slate-900">Per-truck performance</h3>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
                    {analytics.truckTable.length}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar">
                {analytics.truckTable.map((truck) => (
                  <div key={truck.id} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900">{truck.registrationNo}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {truck.trips} trips · {truck.utilization.toFixed(0)}% utilization
                        </p>
                      </div>
                      <StatusBadge status={truck.status} size="sm" />
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      {formatCurrency(truck.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
