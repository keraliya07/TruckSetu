import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import ReturnLoadCard from './ReturnLoadCard';

export default function ReturnLoadPanel({
  matches,
  isLoading,
  onAccept,
  onReject,
  pendingAction,
}) {
  if (isLoading) {
    return (
      <section className="panel p-6">
        <LoadingSpinner label="Loading return load opportunities..." />
      </section>
    );
  }

  if (!matches.length) {
    return (
      <EmptyState
        title="No return loads available"
        description="Once delivered trips end near pending shipments, the best matches will appear here for the dealer to pick up on the way back."
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="panel p-5">
        <h2 className="font-heading text-2xl text-slate-950">
          Return load opportunities ({matches.length})
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          These matches are scored by pickup proximity, direction toward base, and truck
          utilization.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {matches.map((match) => (
          <ReturnLoadCard
            key={match.id}
            busyAction={pendingAction.matchId === match.id ? pendingAction.type : ''}
            match={match}
            onAccept={onAccept}
            onReject={onReject}
          />
        ))}
      </div>
    </section>
  );
}
