import ScoreBar from '../common/ScoreBar';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function TruckResultCard({
  active = false,
  truck,
  scores,
  route,
  estimatedCost,
  co2Saved,
  rank,
  highlights = [],
  onBook,
  onViewRoute,
}) {
  return (
    <article
      className={`panel p-5 transition ${
        active ? 'ring-2 ring-freight-500 ring-offset-2 ring-offset-white' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Rank {rank}
            </p>
            <StatusBadge status={truck.status} />
          </div>
          <h3 className="mt-4 font-heading text-2xl text-slate-950">{truck.registrationNo}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {truck.truckType} with {formatNumber(truck.maxWeightKg)} kg capacity
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {truck.dealer?.companyName} from {truck.currentCity || truck.dealer?.primaryCity}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-4 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated commercial</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(estimatedCost)}</p>
          <p className="mt-1 text-sm text-emerald-700">{formatNumber(co2Saved)} kg CO2 saved</p>
        </div>
      </div>

      <div className="mt-5">
        <ScoreBar scores={scores} compositeScore={scores.composite} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {highlights.map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Route preview</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {route.stops.map((stop) => stop.city).join(' to ')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {formatNumber(route.totalDistanceKm)} km and {route.estimatedDuration}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fit summary</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatNumber(route.loadWeightKg)} kg booked against {formatNumber(truck.maxWeightKg)} kg
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Dealer base rate {formatCurrency(truck.dealer?.baseRatePerKmTon || 0)} / km-ton
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Weighted score blend: 35% utilization, 25% route, 20% cost, 20% CO2
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn-secondary" onClick={() => onViewRoute(route)} type="button">
          View route
        </button>
        <button className="btn-primary" onClick={() => onBook(truck)} type="button">
          Book this truck
        </button>
      </div>
    </article>
  );
}
