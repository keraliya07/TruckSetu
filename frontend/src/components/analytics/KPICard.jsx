import { Activity, BarChart3, Coins, Leaf, Package, Truck } from 'lucide-react';

const iconMap = {
  activity: Activity,
  revenue: Coins,
  co2: Leaf,
  shipments: Package,
  trucks: Truck,
  chart: BarChart3,
};

export default function KPICard({
  title,
  value,
  change,
  icon = 'chart',
  prefix = '',
  suffix = '',
  period = 'vs prior period',
}) {
  const Icon = iconMap[icon] || BarChart3;
  const changeTone =
    change === undefined ? 'text-slate-500' : change >= 0 ? 'text-emerald-600' : 'text-rose-600';

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white/40 border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-slate-50/50 blur-3xl transition-all duration-500 group-hover:bg-slate-100/50"></div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="inline-block rounded-full bg-slate-100/80 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 backdrop-blur-sm">
            {title}
          </p>
          <p className="mt-4 font-heading text-4xl font-medium bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {prefix}
            {value}
            {suffix}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-transform duration-300 group-hover:scale-110 group-hover:text-slate-900">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="relative z-10 mt-5 flex items-center gap-2">
        {change !== undefined && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${change >= 0 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
        <p className="text-xs font-medium text-slate-500">
          {period}
        </p>
      </div>
    </article>
  );
}
