import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

import { formatNumber } from '../../utils/formatters';

export default function DemandForecastChart({ data, period = '14d' }) {
  // If there are multiple cities, we could render multiple lines,
  // but for simplicity, let's just group by dateLabel if needed, or 
  // assume the data is either grouped or filtered. 
  // The backend returns an array of { city, dateLabel, predictedDemand, lowerBound, upperBound }.
  
  // To handle multiple cities on a LineChart, we need the data transformed 
  // to { dateLabel: 'D+1', 'Mumbai': 15, 'Delhi': 20 }.
  const transformedData = data?.reduce((acc, curr) => {
    const existingDate = acc.find((item) => item.dateLabel === curr.dateLabel);
    if (existingDate) {
      existingDate[curr.city] = curr.predictedDemand;
    } else {
      acc.push({
        dateLabel: curr.dateLabel,
        [curr.city]: curr.predictedDemand,
      });
    }
    return acc;
  }, []);

  const cities = [...new Set(data?.map(item => item.city))] || [];
  
  // A palette of line colors
  const colors = ['#0f766e', '#0369a1', '#b45309', '#be123c', '#4d7c0f', '#6d28d9'];

  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Market Intelligence</p>
          <h3 className="mt-2 font-heading text-2xl text-slate-950">Demand Forecast (ML)</h3>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          {period}
        </p>
      </div>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => formatNumber(val)} />
            <Tooltip
              contentStyle={{
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
            {cities.map((city, index) => (
              <Line
                key={city}
                type="monotone"
                dataKey={city}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
