import { useEffect, useState } from 'react';

import { formatCountdown } from '../../utils/formatters';

export default function ETADisplay({ nextStopETA, finalETA, nextStopCity }) {
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setTick(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  void tick;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-3xl bg-slate-50 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next stop</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">{nextStopCity || 'Awaiting route'}</p>
        <p className="mt-1 text-sm text-slate-600">ETA in {formatCountdown(nextStopETA)}</p>
      </div>
      <div className="rounded-3xl bg-slate-50 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Final destination</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">Route completion</p>
        <p className="mt-1 text-sm text-slate-600">ETA in {formatCountdown(finalETA)}</p>
      </div>
    </div>
  );
}
