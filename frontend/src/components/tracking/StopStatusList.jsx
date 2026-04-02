import StatusBadge from '../common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

export default function StopStatusList({ stops, onCompleteStop, busyStopId }) {
  return (
    <div className="space-y-4">
      {stops.map((stop, index) => {
        const isComplete = stop.status === 'COMPLETED';

        return (
          <div key={stop.id} className="flex gap-4">
            <div className="flex w-6 flex-col items-center">
              <span
                className={`mt-2 h-3 w-3 rounded-full ${
                  isComplete ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              {index !== stops.length - 1 ? (
                <span className="mt-2 h-full w-px bg-slate-200" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 rounded-3xl border border-slate-200 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    Stop {stop.sequence}. {stop.city}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {stop.type} {stop.address ? `• ${stop.address}` : ''}
                  </p>
                </div>
                <StatusBadge status={stop.status} />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {isComplete
                  ? `Completed ${formatDateTime(stop.completedAt)}`
                  : stop.plannedArrival
                    ? `Planned arrival ${formatDateTime(stop.plannedArrival)}`
                    : 'Awaiting live ETA'}
              </p>
              {onCompleteStop && !isComplete ? (
                <button
                  className="btn-secondary mt-4"
                  disabled={busyStopId === stop.id}
                  onClick={() => onCompleteStop(stop.id)}
                  type="button"
                >
                  {busyStopId === stop.id ? 'Updating stop...' : 'Mark complete'}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
