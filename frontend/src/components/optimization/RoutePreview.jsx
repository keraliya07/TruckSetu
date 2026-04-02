import TrackingMap from '../maps/TrackingMap';
import StatusBadge from '../common/StatusBadge';
import { formatNumber } from '../../utils/formatters';

export default function RoutePreview({
  stops,
  totalDistanceKm,
  estimatedDuration,
  truckPosition,
}) {
  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Route preview</p>
          <h2 className="mt-2 font-heading text-3xl text-slate-950">Operational path</h2>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-4 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Projected route</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatNumber(totalDistanceKm)} km
          </p>
          <p className="mt-1 text-sm text-slate-600">{estimatedDuration}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          {stops.map((stop) => (
            <div
              key={`${stop.type}-${stop.sequence}`}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    Stop {stop.sequence}. {stop.city}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{stop.address || 'Address available after confirmation'}</p>
                </div>
                <StatusBadge status={stop.type} />
              </div>
            </div>
          ))}
        </div>

        <TrackingMap
          stops={stops}
          truckPosition={truckPosition || (stops[0] ? { lat: stops[0].lat, lng: stops[0].lng } : null)}
        />
      </div>
    </section>
  );
}
