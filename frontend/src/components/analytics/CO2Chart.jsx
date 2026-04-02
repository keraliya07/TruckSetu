import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatNumber } from '../../utils/formatters';

export default function CO2Chart({ data, period = '30d' }) {
  const treesEquivalent = Math.max(1, Math.round((data?.totalSaved || 0) / 21));

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sustainability</p>
          <h3 className="mt-2 font-heading text-2xl text-slate-950">CO2 savings trend</h3>
        </div>
        <p className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {period}
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total saved</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{formatNumber(data?.totalSaved)} kg</p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Avg per trip</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{formatNumber(data?.perTripAvg)} kg</p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Equivalent impact</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{treesEquivalent} trees</p>
        </div>
      </div>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data?.timeSeries || []}>
            <defs>
              <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => [`${formatNumber(value)} kg`, 'CO2 saved']} />
            <Area
              dataKey="co2"
              type="monotone"
              stroke="#16a34a"
              strokeWidth={3}
              fill="url(#co2Gradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
