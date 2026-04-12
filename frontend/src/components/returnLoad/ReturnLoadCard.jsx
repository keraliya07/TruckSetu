import { TimerReset } from 'lucide-react';

import StatusBadge from '../common/StatusBadge';
import {
  formatCountdown,
  formatNumber,
} from '../../utils/formatters';

function ScoreBar({ label, value, tone = 'bg-freight-600' }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
        <span>{label}</span>
        <span>{formatNumber(value)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.max(6, Math.min(100, Number(value || 0)))}%` }}
        />
      </div>
    </div>
  );
}

export default function ReturnLoadCard({
  busyAction,
  match,
  onAccept,
  onReject,
}) {
  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">
            Return Load Match
          </p>
          <h3 className="mt-2 font-heading text-2xl text-slate-950">
            {match.shipment.title || `${match.shipment.originCity} return load`}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {formatNumber(match.shipment.weightKg)} kg from {match.shipment.originCity} to{' '}
            {match.shipment.destCity}
          </p>
        </div>
        <StatusBadge size="md" status={match.status} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Combined score</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatNumber(match.combinedScore)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Pickup distance {formatNumber(match.pickupDistanceKm)} km
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expires in</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-950">
            <TimerReset className="h-4 w-4 text-emerald-600" />
            {formatCountdown(match.expiresAt)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Warehouse {match.shipment.warehouse?.warehouseName}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ScoreBar label="Proximity" tone="bg-freight-600" value={match.proximityScore} />
        <ScoreBar label="Direction" tone="bg-freight-600" value={match.directionScore} />
        <ScoreBar label="Utilization" tone="bg-emerald-600" value={match.utilizationScore} />
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
        Pickup at {match.shipment.originAddress || match.shipment.originCity} and route the
        truck toward {match.shipment.destCity}. Deadline:{' '}
        {new Date(match.shipment.deadline).toLocaleString()}.
      </div>

      {match.status === 'PENDING' ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="btn-primary"
            disabled={busyAction === 'accept' || busyAction === 'reject'}
            onClick={() => onAccept(match.id)}
            type="button"
          >
            Accept return load
          </button>
          <button
            className="btn-secondary"
            disabled={busyAction === 'accept' || busyAction === 'reject'}
            onClick={() => onReject(match.id)}
            type="button"
          >
            Reject
          </button>
        </div>
      ) : null}
    </article>
  );
}
