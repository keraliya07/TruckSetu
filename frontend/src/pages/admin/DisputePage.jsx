import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { getDisputes, resolveDispute } from '../../api/admin.api';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

const disputeStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];
const disputeTypes = ['SHIPMENT', 'TRIP', 'BOOKING', 'PAYMENT', 'OTHER'];

function getEntityLabel(dispute) {
  if (dispute.shipment) {
    return `${dispute.shipment.originCity} -> ${dispute.shipment.destCity}`;
  }

  if (dispute.trip) {
    return `Trip ${dispute.trip.id.slice(0, 8)}`;
  }

  if (dispute.bookingRequest) {
    return `Booking ${dispute.bookingRequest.id.slice(0, 8)}`;
  }

  return 'General issue';
}

export default function DisputePage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    status: '',
    type: '',
  });
  const [state, setState] = useState({
    disputes: [],
    total: 0,
    isLoading: true,
    error: null,
  });
  const [selectedDisputeId, setSelectedDisputeId] = useState(null);
  const [resolutionState, setResolutionState] = useState({
    status: 'RESOLVED',
    resolution: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDisputes() {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await getDisputes({
          ...filters,
          status: filters.status || undefined,
          type: filters.type || undefined,
        });

        if (cancelled) {
          return;
        }

        setState({
          disputes: result.disputes || [],
          total: result.total || 0,
          isLoading: false,
          error: null,
        });

        if (!selectedDisputeId && result.disputes?.length) {
          setSelectedDisputeId(result.disputes[0].id);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          disputes: [],
          total: 0,
          isLoading: false,
          error: error.message || 'Failed to load disputes',
        });
      }
    }

    loadDisputes().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const selectedDispute =
    state.disputes.find((dispute) => dispute.id === selectedDisputeId) || null;

  async function handleResolve() {
    if (!selectedDisputeId || resolutionState.resolution.trim().length < 8) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await resolveDispute(selectedDisputeId, {
        status: resolutionState.status,
        resolution: resolutionState.resolution.trim(),
      });

      setState((current) => ({
        ...current,
        disputes: current.disputes.map((dispute) =>
          dispute.id === updated.id ? updated : dispute
        ),
      }));
      setResolutionState({
        status: 'RESOLVED',
        resolution: '',
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.message || 'Failed to resolve dispute',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil((state.total || 0) / filters.limit));

  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Control"
      title="Dispute resolution"
      subtitle="Review shipment, trip, and booking disputes, then record a final administrative resolution with a clear audit trail."
    >
      <PageTabs
        items={[
          { to: '/admin/analytics', label: 'Analytics' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/disputes', label: 'Disputes', active: true },
        ]}
      />

      <section className="panel p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.7fr]">
          <select
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-freight-500"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                status: event.target.value,
              }))
            }
            value={filters.status}
          >
            <option value="">All statuses</option>
            {disputeStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-freight-500"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                type: event.target.value,
              }))
            }
            value={filters.type}
          >
            <option value="">All entity types</option>
            {disputeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {state.total} dispute(s)
          </div>
        </div>
      </section>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.isLoading ? <LoadingSpinner label="Loading disputes..." /> : null}

      {!state.isLoading && !state.disputes.length ? (
        <EmptyState
          description="There are no disputes for the current filter combination."
          icon={AlertTriangle}
          title="No disputes found"
        />
      ) : null}

      {state.disputes.length ? (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Queue</p>
                <h2 className="mt-2 font-heading text-2xl text-slate-950">Dispute list</h2>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary"
                  disabled={filters.page <= 1}
                  onClick={() =>
                    setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))
                  }
                  type="button"
                >
                  Prev
                </button>
                <button
                  className="btn-secondary"
                  disabled={filters.page >= totalPages}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: Math.min(totalPages, current.page + 1),
                    }))
                  }
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {state.disputes.map((dispute) => (
                <button
                  key={dispute.id}
                  className={`w-full rounded-3xl border px-5 py-5 text-left transition ${
                    selectedDisputeId === dispute.id
                      ? 'border-freight-400 bg-freight-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedDisputeId(dispute.id)}
                  type="button"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{dispute.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{getEntityLabel(dispute)}</p>
                    </div>
                    <StatusBadge status={dispute.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <span>{dispute.type}</span>
                    <span>{dispute.raisedBy?.name || 'Unknown requester'}</span>
                    <span>{formatDateTime(dispute.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </article>

          <article className="panel p-5">
            {selectedDispute ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resolution desk</p>
                    <h2 className="mt-2 font-heading text-2xl text-slate-950">
                      {selectedDispute.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">{selectedDispute.description}</p>
                  </div>
                  <StatusBadge status={selectedDispute.status} size="md" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Raised by</p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {selectedDispute.raisedBy?.name || 'Unknown user'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{selectedDispute.raisedBy?.email}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Entity</p>
                    <p className="mt-2 font-semibold text-slate-950">{getEntityLabel(selectedDispute)}</p>
                    <p className="mt-1 text-sm text-slate-600">{selectedDispute.type}</p>
                  </div>
                </div>

                {selectedDispute.resolution ? (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Current resolution</p>
                    <p className="mt-2 text-sm text-emerald-900">{selectedDispute.resolution}</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="dispute-status">
                    Final status
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-freight-500"
                    id="dispute-status"
                    onChange={(event) =>
                      setResolutionState((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    value={resolutionState.status}
                  >
                    <option value="RESOLVED">Resolve</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="dispute-resolution">
                    Resolution note
                  </label>
                  <textarea
                    className="min-h-32 w-full rounded-3xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-freight-500"
                    id="dispute-resolution"
                    onChange={(event) =>
                      setResolutionState((current) => ({
                        ...current,
                        resolution: event.target.value,
                      }))
                    }
                    placeholder="Summarize the decision, evidence, and any follow-up action."
                    value={resolutionState.resolution}
                  />
                </div>

                <button
                  className="btn-primary"
                  disabled={
                    isSubmitting ||
                    ['RESOLVED', 'REJECTED'].includes(selectedDispute.status) ||
                    resolutionState.resolution.trim().length < 8
                  }
                  onClick={handleResolve}
                  type="button"
                >
                  {isSubmitting ? 'Saving resolution...' : 'Save resolution'}
                </button>
              </div>
            ) : (
              <EmptyState
                description="Choose a dispute to review its context and record a final decision."
                icon={AlertTriangle}
                title="Select a dispute"
              />
            )}
          </article>
        </section>
      ) : null}
    </DashboardShell>
  );
}
