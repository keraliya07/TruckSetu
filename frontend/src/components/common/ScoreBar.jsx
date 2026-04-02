import clsx from 'clsx';

const weights = {
  utilization: 0.35,
  route: 0.25,
  cost: 0.2,
  co2: 0.2,
};

const colors = {
  utilization: 'bg-sky-500',
  route: 'bg-emerald-500',
  cost: 'bg-amber-500',
  co2: 'bg-teal-500',
};

const labels = {
  utilization: 'Utilization',
  route: 'Route',
  cost: 'Cost',
  co2: 'CO2',
};

const heightMap = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export default function ScoreBar({
  scores,
  compositeScore,
  showLabels = true,
  size = 'md',
}) {
  const segments = Object.entries(weights).map(([key, weight]) => {
    const contribution = Math.max(0, Number(scores?.[key] || 0) * weight);
    return {
      key,
      label: labels[key],
      contribution,
    };
  });

  const total = segments.reduce((sum, segment) => sum + segment.contribution, 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Composite score</p>
        <p className="font-heading text-xl text-slate-950">
          {Number(compositeScore || 0).toFixed(1)}
        </p>
      </div>

      <div className={clsx('flex overflow-hidden rounded-full bg-slate-100', heightMap[size] || heightMap.md)}>
        {segments.map((segment) => (
          <span
            key={segment.key}
            className={clsx(colors[segment.key])}
            style={{ width: `${(segment.contribution / total) * 100}%` }}
            title={`${segment.label}: ${Number(scores?.[segment.key] || 0).toFixed(1)}`}
          />
        ))}
      </div>

      {showLabels ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {segments.map((segment) => (
            <div key={segment.key} className="flex items-center gap-2 text-sm text-slate-600">
              <span className={clsx('h-2.5 w-2.5 rounded-full', colors[segment.key])} />
              <span>
                {segment.label}:{' '}
                <span className="font-semibold text-slate-900">
                  {Number(scores?.[segment.key] || 0).toFixed(0)}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
