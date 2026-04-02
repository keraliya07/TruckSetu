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
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <p className="mt-4 font-heading text-3xl text-slate-950">
            {prefix}
            {value}
            {suffix}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-3 text-sm font-medium ${changeTone}`}>
        {change === undefined ? period : `${change >= 0 ? '+' : ''}${change.toFixed(1)}% ${period}`}
      </p>
    </article>
  );
}
