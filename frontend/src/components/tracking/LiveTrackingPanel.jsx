import StatusBadge from '../common/StatusBadge';
import ETADisplay from './ETADisplay';
import StopStatusList from './StopStatusList';
import TripProgressBar from './TripProgressBar';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from '../../utils/formatters';

export default function LiveTrackingPanel({
  trip,
  stops,
  eta,
  progress,
  onCompleteStop,
  busyStopId,
  actions,
}) {
  const completedStops = stops.filter((stop) => stop.status === 'COMPLETED').length;

  return (
    <section className="relative flex h-[calc(100vh-10rem)] max-h-[900px] flex-col overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
      {/* Gradient header overlay */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand-50/80 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative flex-none border-b border-slate-100/80 px-8 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-freight-600">Trip control</p>
            <h2 className="mt-1 font-heading text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Trip {trip.id.slice(0, 8)}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Truck <span className="font-semibold text-slate-700">{trip.truck?.registrationNo}</span>
              {' · '}{trip.bookingRequest?.shipments?.length || trip.shipments?.length || 0} linked shipment(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            {trip.status === 'IN_TRANSIT' && (
              <span className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </span>
            )}
            <StatusBadge animate={trip.status === 'IN_TRANSIT'} size="md" status={trip.status} />
          </div>
        </div>

        {/* Telemetry stats */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/60 px-4 py-3.5">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Commercial Value</p>
            <p className="mt-1.5 font-mono text-lg font-bold text-slate-900">{formatCurrency(trip.estimatedCost)}</p>
            <p className="mt-0.5 text-xs text-slate-500">{formatNumber(trip.estimatedDistanceKm)} km planned</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/60 px-4 py-3.5">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Timeline</p>
            <p className="mt-1.5 text-sm font-bold text-slate-900">Started {formatDateTime(trip.startedAt)}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {trip.completedAt ? `Completed ${formatDateTime(trip.completedAt)}` : 'In progress'}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">

        {/* Action slot */}
        {actions ? (
          <div>
            {actions}
          </div>
        ) : null}

        {/* Progress bar */}
        <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4">Journey Progress</p>
          <TripProgressBar
            completedStops={completedStops}
            distanceCoveredKm={progress.distanceCoveredKm}
            totalDistanceKm={progress.totalDistanceKm}
            totalStops={stops.length}
          />
          <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500">
            <span>{completedStops} / {stops.length} stops done</span>
            <span>{formatNumber(progress.distanceCoveredKm)} / {formatNumber(progress.totalDistanceKm)} km</span>
          </div>
        </div>

        {/* ETA */}
        <div className="rounded-[1.5rem] border border-freight-100/60 bg-gradient-to-br from-brand-50/50 to-indigo-50/20 p-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-freight-600 mb-4">ETA Intelligence</p>
          <ETADisplay
            finalETA={eta.finalStop}
            nextStopCity={eta.nextStopCity}
            nextStopETA={eta.nextStop}
          />
        </div>

        {/* Stop list */}
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4">Stop Sequence</p>
          <StopStatusList busyStopId={busyStopId} onCompleteStop={onCompleteStop} stops={stops} />
        </div>
      </div>
    </section>
  );
}
