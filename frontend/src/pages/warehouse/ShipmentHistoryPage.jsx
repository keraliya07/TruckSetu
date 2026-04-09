import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import * as shipmentApi from '../../api/shipment.api';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatDateTime, formatNumber } from '../../utils/formatters';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'BOOKING_PENDING', label: 'Booking pending' },
  { value: 'BOOKING_CONFIRMED', label: 'Booking confirmed' },
  { value: 'LOADING', label: 'Loading' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ShipmentHistoryPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 12,
  });
  const [historyState, setHistoryState] = useState({
    shipments: [],
    total: 0,
    isLoading: true,
    error: null,
  });
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setHistoryState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await shipmentApi.getShipments({
          ...filters,
          search: deferredSearch || undefined,
          status: filters.status || undefined,
        });

        if (cancelled) {
          return;
        }

        setHistoryState({
          shipments: result.shipments || [],
          total: result.total || 0,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setHistoryState({
          shipments: [],
          total: 0,
          isLoading: false,
          error: error.message || 'Failed to load shipment history',
        });
      }
    }

    loadHistory().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [deferredSearch, filters.limit, filters.page, filters.status]);

  const totalPages = Math.max(1, Math.ceil((historyState.total || 0) / filters.limit));
  const visibleDelivered = useMemo(
    () => historyState.shipments.filter((shipment) => shipment.status === 'DELIVERED').length,
    [historyState.shipments]
  );
  const visibleCancelled = useMemo(
    () => historyState.shipments.filter((shipment) => shipment.status === 'CANCELLED').length,
    [historyState.shipments]
  );

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title={`Shipment history for ${user?.warehouse?.warehouseName || user?.name}`}
      subtitle="Review every shipment created from this warehouse, filter by status, and reopen full details whenever you need the record."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history', active: true },
          { to: '/warehouse/shipments/new', label: 'Dispatch workspace' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      <section className="panel p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 xl:items-end">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-end">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="w-full sm:w-72">
                  <span className="field-label">Search</span>
                  <input
                    className="input-base"
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        page: 1,
                        search: event.target.value,
                      }))
                    }
                    placeholder="Reference, title, or destination"
                    type="search"
                    value={filters.search}
                  />
                </label>

                <label className="w-full sm:w-56">
                  <span className="field-label">Status</span>
                  <select
                    className="input-base"
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        page: 1,
                        status: event.target.value,
                      }))
                    }
                    value={filters.status}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value || 'all'} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-end gap-3 xl:justify-end">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                    }))
                  }
                  type="button"
                >
                  Refresh
                </button>
                <Link className="btn-primary" to="/warehouse/shipments/new">
                  New shipment
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Matching records</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{historyState.total}</p>
              <p className="mt-1 text-sm text-slate-600">Across all pages</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visible delivered</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{visibleDelivered}</p>
              <p className="mt-1 text-sm text-slate-600">On this page</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visible cancelled</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{visibleCancelled}</p>
              <p className="mt-1 text-sm text-slate-600">On this page</p>
            </div>
          </div>
        </div>
      </section>

      {historyState.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {historyState.error}
        </div>
      ) : null}

      {historyState.isLoading ? <LoadingSpinner label="Loading shipment history..." /> : null}

      {!historyState.isLoading && !historyState.shipments.length ? (
        <EmptyState
          description="No shipments matched the current history filters."
          title="No shipment history found"
          action={
            <Link className="btn-primary" to="/warehouse/shipments/new">
              Open dispatch workspace
            </Link>
          }
        />
      ) : null}

      {historyState.shipments.length ? (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            {historyState.shipments.map((shipment) => {
              const booking = shipment.bookingShipments?.[0]?.bookingRequest || null;
              const trip = shipment.tripShipments?.[0]?.trip || null;

              return (
                <article key={shipment.id} className="panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {shipment.referenceNo}
                      </p>
                      <Link
                        className="mt-2 block font-heading text-2xl text-slate-950 hover:text-freight-700"
                        to={`/warehouse/shipments/${shipment.id}`}
                      >
                        {shipment.title || shipment.referenceNo}
                      </Link>
                      <p className="mt-2 text-sm text-slate-600">
                        {shipment.originCity} to {shipment.destCity}
                      </p>
                    </div>
                    <StatusBadge
                      animate={['BOOKING_PENDING', 'LOADING', 'IN_TRANSIT'].includes(shipment.status)}
                      status={shipment.status}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Load profile</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {formatNumber(shipment.weightKg)} kg and {formatNumber(shipment.volumeM3)} m3
                      </p>
                      <p className="mt-1 text-sm text-slate-600">Priority {shipment.priority}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        Created {formatDate(shipment.createdAt)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Updated {formatDateTime(shipment.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Booking</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {booking ? booking.status : 'Not attached'}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trip</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {trip ? trip.status : 'Not started'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link className="btn-secondary" to={`/warehouse/shipments/${shipment.id}`}>
                      Open detail
                    </Link>
                    {trip ? (
                      <Link className="btn-secondary" to={`/warehouse/tracking/${trip.id}`}>
                        Track trip
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="panel flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="text-sm text-slate-600">
              Page {filters.page} of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary"
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1),
                  }))
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
          </section>
        </>
      ) : null}
    </DashboardShell>
  );
}
