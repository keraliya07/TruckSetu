import clsx from 'clsx';

function getTone(value, maxValue) {
  const ratio = maxValue === 0 ? 0 : value / maxValue;

  if (ratio > 0.75) {
    return 'bg-rose-500 text-white';
  }

  if (ratio > 0.45) {
    return 'bg-amber-400 text-slate-900';
  }

  if (ratio > 0.2) {
    return 'bg-emerald-300 text-slate-900';
  }

  return 'bg-slate-100 text-slate-600';
}

export default function DemandHeatmap({ data, horizon = '7d' }) {
  const cities = [...new Set(data.map((item) => item.city))];
  const dates = [...new Set(data.map((item) => item.dateLabel))];
  const maxValue = Math.max(...data.map((item) => item.predictedDemand), 0);

  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Demand forecast</p>
          <h3 className="mt-2 font-heading text-2xl text-slate-950">Lane heatmap</h3>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          {horizon}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div
          className="grid min-w-[640px] gap-2"
          style={{ gridTemplateColumns: `160px repeat(${dates.length}, minmax(70px, 1fr))` }}
        >
          <div />
          {dates.map((date) => (
            <div key={date} className="px-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {date}
            </div>
          ))}

          {cities.map((city) => (
            <div key={city} className="contents">
              <div className="flex items-center rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                {city}
              </div>
              {dates.map((date) => {
                const entry = data.find((item) => item.city === city && item.dateLabel === date);
                const value = entry?.predictedDemand || 0;

                return (
                  <div
                    key={`${city}-${date}`}
                    className={clsx(
                      'flex h-16 items-center justify-center rounded-2xl text-sm font-semibold transition',
                      getTone(value, maxValue)
                    )}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
