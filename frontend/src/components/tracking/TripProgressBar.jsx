import { formatNumber } from '../../utils/formatters';

export default function TripProgressBar({
  completedStops,
  totalStops,
  distanceCoveredKm,
  totalDistanceKm,
}) {
  const percent = totalStops === 0 ? 0 : (completedStops / totalStops) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-900">
          {completedStops}/{totalStops} stops completed
        </span>
        <span className="text-slate-500">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-freight-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-slate-600">
        {formatNumber(distanceCoveredKm)} of {formatNumber(totalDistanceKm)} km covered
      </p>
    </div>
  );
}
