import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import PageTabs from '../../components/common/PageTabs';
import ReturnLoadBadge from '../../components/returnLoad/ReturnLoadBadge';
import ReturnLoadPanel from '../../components/returnLoad/ReturnLoadPanel';
import { useReturnLoad } from '../../hooks/useReturnLoad';
import { formatNumber } from '../../utils/formatters';

export default function ReturnLoadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId') || '';
  const [pendingAction, setPendingAction] = useState({
    type: '',
    matchId: '',
  });
  const {
    acceptedResult,
    acceptMatch,
    error,
    hasNewMatches,
    isLoading,
    matches,
    rejectMatch,
    setHasNewMatches,
  } = useReturnLoad({ tripId });

  const topTrip = matches[0]?.trip || acceptedResult?.newTrip || null;
  const topMatchCount = matches.filter((match) => match.status === 'PENDING').length;

  const summary = useMemo(() => {
    if (!topTrip) {
      return null;
    }

    const lastStop = [...(topTrip.stops || [])].sort((left, right) => right.sequence - left.sequence)[0];

    return {
      dealer: topTrip.truck?.dealer?.companyName,
      dropCity: lastStop?.city,
      truck: topTrip.truck?.registrationNo,
    };
  }, [topTrip]);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title="Return load opportunities"
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet', label: 'Fleet' },
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/analytics', label: 'Analytics' },
          { to: '/dealer/return-loads', label: 'Return loads', active: true },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Current focus */}
        <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-400">Current focus</p>
            <h2 className="mt-1 font-heading text-base font-semibold text-slate-900">
              {summary?.truck ? `Truck ${summary.truck}` : 'Select a delivered trip'}
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-slate-500">
              {summary
                ? `Latest delivered drop at ${summary.dropCity}. ${summary.dealer} can accept one of the open matches below.`
                : 'Open this page from a delivered trip notification or keep it open to catch new return load opportunities in realtime.'}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-medium text-slate-400">Pending matches</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatNumber(topMatchCount)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-medium text-slate-400">Trip filter</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {tripId ? `Trip ${tripId.slice(0, 8)}` : 'All delivered trips'}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Realtime signal */}
        <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-400">Realtime signal</p>
          </div>
          <div className="p-5 space-y-4">
            <ReturnLoadBadge
              matchCount={hasNewMatches ? topMatchCount || matches.length : 0}
              onClick={() => setHasNewMatches(false)}
            />
            {acceptedResult?.newTrip ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Return load accepted. New trip {acceptedResult.newTrip.id.slice(0, 8)} is ready.
                <button
                  className="ml-2 font-semibold text-emerald-900 underline"
                  onClick={() => navigate(`/dealer/trips/${acceptedResult.newTrip.id}`)}
                  type="button"
                >
                  Open trip
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Keep this page open and new matches will refresh automatically when a delivered
                trip becomes eligible.
              </p>
            )}
          </div>
        </article>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <ReturnLoadPanel
        isLoading={isLoading}
        matches={matches}
        onAccept={async (matchId) => {
          setPendingAction({ type: 'accept', matchId });
          try {
            await acceptMatch(matchId);
          } finally {
            setPendingAction({ type: '', matchId: '' });
          }
        }}
        onReject={async (matchId) => {
          setPendingAction({ type: 'reject', matchId });
          try {
            await rejectMatch(matchId);
          } finally {
            setPendingAction({ type: '', matchId: '' });
          }
        }}
        pendingAction={pendingAction}
      />
    </DashboardShell>
  );
}
