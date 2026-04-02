import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

import ScoreBar from '../common/ScoreBar';

export default function ScoreBreakdown({ scores, compositeScore }) {
  const data = [
    { metric: 'Utilization', score: scores?.utilization || 0 },
    { metric: 'Route', score: scores?.route || 0 },
    { metric: 'Cost', score: scores?.cost || 0 },
    { metric: 'CO2', score: scores?.co2 || 0 },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl bg-slate-50 p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 12 }} />
              <Radar dataKey="score" stroke="#0f766e" fill="#0f766e" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 p-4">
        <ScoreBar scores={scores} compositeScore={compositeScore} />
      </div>
    </div>
  );
}
