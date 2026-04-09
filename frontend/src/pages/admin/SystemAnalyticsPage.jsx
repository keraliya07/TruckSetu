import { useState } from 'react';

import CO2Chart from '../../components/analytics/CO2Chart';
import KPICard from '../../components/analytics/KPICard';
import RevenueChart from '../../components/analytics/RevenueChart';
import UtilizationChart from '../../components/analytics/UtilizationChart';
import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatNumber } from '../../utils/formatters';

const periods = ['7d', '30d', '90d'];

export default function SystemAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { analytics, error, isLoading } = useAnalytics('admin', period);

  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Control"
      title="System analytics"
      subtitle="Review platform utilization, trip throughput, and sustainability impact across the operating network."
    >
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Time horizon</p>
            <h2 className="mt-2 font-heading text-3xl text-slate-950">Platform intelligence</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {periods.map((value) => (
              <button
                key={value}
                className={value === period ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setPeriod(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? <LoadingSpinner label="Loading system analytics..." /> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
            <article className="panel p-5">
              <h3 className="font-heading text-2xl text-slate-950">City breakdown</h3>
              <div className="mt-6 space-y-4">
                {analytics.cityBreakdown.map((city) => (
                  <div key={city.city} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{city.city}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {city.shipments} shipment(s)
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatNumber(city.weightKg)} kg
                      </p>
                    </div>
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
