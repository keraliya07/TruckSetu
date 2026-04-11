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
      <section className="rounded-3xl bg-white/40 border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600">Time horizon</p>
            <h2 className="mt-3 font-heading text-3xl bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">Platform intelligence</h2>
          </div>
          <div className="relative inline-flex rounded-full bg-slate-100/80 p-1 shadow-inner backdrop-blur-md">
            <div
              className="absolute top-1 bottom-1 w-16 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(${periods.indexOf(period) * 100}%)`,
              }}
            />
            {periods.map((value) => (
              <button
                key={value}
                className={`relative z-10 w-16 py-2 text-sm font-medium transition-colors duration-300 rounded-full ${
                  value === period
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
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
            <article className="rounded-3xl bg-white/40 border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
              <h3 className="font-heading text-2xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">City breakdown</h3>
              <div className="mt-6 space-y-4">
                {analytics.cityBreakdown.map((city) => (
                  <div key={city.city} className="group rounded-2xl border border-slate-200/60 bg-white/50 px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300/80">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 transition-colors">{city.city}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          <span className="font-medium text-slate-700">{city.shipments}</span> shipment{city.shipments !== 1 && 's'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 opacity-70"></div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatNumber(city.weightKg)} kg
                        </p>
                      </div>
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
