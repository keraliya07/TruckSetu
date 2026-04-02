import { formatNumber } from '../../utils/formatters';

export default function TrackingMap({ truckPosition, stops = [] }) {
  const firstOpenIndex = stops.findIndex((stop) => stop.status !== 'COMPLETED');
  const markerPosition = Math.min(
    100,
    Math.max(
      6,
      stops.length <= 1
        ? 12
        : (((firstOpenIndex === -1 ? stops.length : firstOpenIndex + 1) / stops.length) * 100)
    )
  );

  return (
    <section className="panel h-full p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Route canvas</p>
          <h2 className="mt-2 font-heading text-3xl text-slate-950">Visual path</h2>
        </div>
        {truckPosition ? (
          <p className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {formatNumber(truckPosition.lat, { maximumFractionDigits: 2 })}, {formatNumber(truckPosition.lng, { maximumFractionDigits: 2 })}
          </p>
        ) : null}
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(160deg,_#f8fafc,_#ecfeff)] p-6">
        <div className="relative h-80 overflow-hidden rounded-[28px] border border-white/60 bg-white/55">
          <div className="absolute left-10 right-10 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
          <div
            className="absolute left-10 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-500 via-freight-500 to-emerald-500 transition-all duration-500"
            style={{ width: `calc(${markerPosition}% - 2.5rem)` }}
          />
          <div
            className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full border-4 border-white bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-500"
            style={{ left: `calc(${markerPosition}% - 2.5rem)` }}
          >
            Truck
          </div>

          <div className="absolute inset-x-10 top-1/2 flex -translate-y-1/2 justify-between">
            {stops.map((stop) => (
              <div key={stop.id || `${stop.type}-${stop.sequence}`} className="flex flex-col items-center gap-3">
                <span
                  className={`h-5 w-5 rounded-full border-4 border-white ${
                    stop.status === 'COMPLETED'
                      ? 'bg-emerald-500'
                      : stop.type === 'PICKUP'
                        ? 'bg-sky-500'
                        : 'bg-slate-300'
                  } shadow`}
                />
                <div className="rounded-2xl bg-white/90 px-3 py-2 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    {stop.type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{stop.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
