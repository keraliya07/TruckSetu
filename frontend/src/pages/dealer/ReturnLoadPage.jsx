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
      subtitle="Keep trucks productive after delivery by capturing nearby pending shipments that pull the fleet back toward base instead of returning empty."
    >
      <PageTabs
        items={[
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/return-loads', label: 'Return loads', active: true },
          { to: '/dealer/analytics', label: 'Analytics' },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="panel p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current focus</p>
          <h2 className="mt-3 font-heading text-3xl text-slate-950">
            {summary?.truck ? `Truck ${summary.truck}` : 'Select a delivered trip'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {summary
              ? `Latest delivered drop at ${summary.dropCity}. ${summary.dealer} can accept one of the open matches below and keep the truck moving.`
              : 'Open this page from a delivered trip notification or keep it open to catch new return load opportunities in realtime.'}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending matches</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatNumber(topMatchCount)}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trip filter</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {tripId ? `Trip ${tripId.slice(0, 8)}` : 'All delivered trips'}
              </p>
            </div>
          </div>
        </article>

        <article className="panel p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Realtime signal</p>
          <div className="mt-4">
            <ReturnLoadBadge
              matchCount={hasNewMatches ? topMatchCount || matches.length : 0}
              onClick={() => setHasNewMatches(false)}
            />
          </div>
          {acceptedResult?.newTrip ? (
            <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
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
            <p className="mt-4 text-sm text-slate-600">
              Keep this page open and new matches will refresh automatically when a delivered
              trip becomes eligible.
            </p>
          )}
        </article>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
