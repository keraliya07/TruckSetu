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
    <section className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Trip control</p>
          <h2 className="mt-2 font-heading text-3xl text-slate-950">
            Trip {trip.id.slice(0, 8)}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Truck {trip.truck?.registrationNo} with {trip.bookingRequest?.shipments?.length || trip.shipments?.length || 0} linked shipment(s)
          </p>
        </div>
        <StatusBadge animate={trip.status === 'IN_TRANSIT'} size="md" status={trip.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated commercial</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(trip.estimatedCost)}</p>
          <p className="mt-1 text-sm text-slate-600">{formatNumber(trip.estimatedDistanceKm)} km planned</p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Started</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{formatDateTime(trip.startedAt)}</p>
          <p className="mt-1 text-sm text-slate-600">Completed {formatDateTime(trip.completedAt)}</p>
        </div>
      </div>

      {actions ? <div className="mt-5">{actions}</div> : null}

      <div className="mt-5">
        <TripProgressBar
          completedStops={completedStops}
          distanceCoveredKm={progress.distanceCoveredKm}
          totalDistanceKm={progress.totalDistanceKm}
          totalStops={stops.length}
        />
      </div>

      <div className="mt-5">
        <ETADisplay
          finalETA={eta.finalStop}
          nextStopCity={eta.nextStopCity}
          nextStopETA={eta.nextStop}
        />
      </div>

      <div className="mt-5">
        <StopStatusList busyStopId={busyStopId} onCompleteStop={onCompleteStop} stops={stops} />
      </div>
    </section>
  );
}
