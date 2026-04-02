import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function UtilizationChart({ data, period = '30d' }) {
  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Utilization</p>
          <h3 className="mt-2 font-heading text-2xl text-slate-950">Capacity efficiency trend</h3>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          {period}
        </p>
      </div>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(0)}%`, 'Utilization']} />
            <ReferenceLine y={87} stroke="#f59e0b" strokeDasharray="4 4" />
            <Area
              dataKey="utilization"
              type="monotone"
              stroke="#0284c7"
              strokeWidth={3}
              fill="url(#utilizationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
