import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompactNumber, formatCurrency } from '../../utils/formatters';

export default function RevenueChart({ data, period = '30d' }) {
  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Revenue flow</p>
          <h3 className="mt-2 font-heading text-2xl text-slate-950">Bookings converted into earnings</h3>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          {period}
        </p>
      </div>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => formatCompactNumber(value)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name, item) => {
                if (name === 'revenue') {
                  return [formatCurrency(value), 'Revenue'];
                }

                return [item?.payload?.trips || 0, 'Trips'];
              }}
              contentStyle={{
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
              }}
            />
            <Bar dataKey="revenue" fill="#0f766e" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
