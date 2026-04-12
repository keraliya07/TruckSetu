import { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import * as shipmentApi from '../../api/shipment.api';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import ShipmentDetailPane from '../../components/warehouse/ShipmentDetailPane';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatNumber } from '../../utils/formatters';

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
    limit: 1000,
  });
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.page]);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title={`Shipment history for ${user?.warehouse?.warehouseName || user?.name}`}
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history', active: true },
          { to: '/warehouse/shipments/new', label: 'Create workspace' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      {/* ── Toolbar ── */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Top row: title + count + CTA */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Shipment History</h2>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
              {historyState.total}
            </span>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full bg-freight-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md hover:-translate-y-px"
            to="/warehouse/shipments/new"
          >
            + New shipment
          </Link>
        </div>

        {/* Bottom row: search + filter + refresh */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center px-5 py-3 bg-slate-50/50">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all duration-200 bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  page: 1,
                  search: event.target.value,
                }))
              }
              placeholder="Search shipments..."
              type="search"
              value={filters.search}
            />
          </div>

          <select
            className="w-full sm:w-44 rounded-lg border border-slate-200 py-2 px-3 text-sm text-slate-700 outline-none transition-all duration-200 bg-white focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10"
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

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 shrink-0"
            onClick={() => setFilters((current) => ({ ...current }))}
            type="button"
            title="Refresh"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </section>

      {historyState.error ? (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
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
        <section
          className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            selectedShipmentId
              ? 'grid gap-6 xl:grid-cols-[1.4fr_0.9fr] xl:items-start'
              : 'mx-auto max-w-4xl'
          }`}
        >
          {/* ── Compact card list ── */}
          <div className="space-y-2.5">
            {historyState.shipments.map((shipment, index) => {
              const booking = shipment.bookingShipments?.[0]?.bookingRequest || null;
              const trip = shipment.tripShipments?.[0]?.trip || null;

              return (
                <button
                  key={shipment.id}
                  onClick={() => setSelectedShipmentId(shipment.id)}
                  type="button"
                  className={`group w-full text-left relative overflow-hidden rounded-2xl border transition-all duration-250 px-5 py-4 block animate-fade-in ${
                    selectedShipmentId === shipment.id
                      ? 'border-freight-200 bg-freight-50/30 shadow-sm ring-1 ring-freight-100'
                      : 'border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]'
                  }`}
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Core info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className={`font-heading text-base font-semibold truncate transition ${
                          selectedShipmentId === shipment.id ? 'text-freight-900' : 'text-slate-900 group-hover:text-freight-700'
                        }`}>
                          {shipment.title || shipment.referenceNo}
                        </p>
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">{shipment.referenceNo}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500 truncate">
                        {shipment.originCity}
                        <span className="text-slate-300 mx-1.5">→</span>
                        {shipment.destCity}
                        <span className="text-slate-200 mx-1.5">·</span>
                        <span className="text-slate-400">{formatNumber(shipment.weightKg)} kg</span>
                        <span className="text-slate-200 mx-1.5">·</span>
                        <span className="text-slate-400">{formatDate(shipment.createdAt)}</span>
                      </p>
                      {/* Inline status tags */}
                      {(booking || trip) && (
                        <div className="mt-1 flex items-center gap-2">
                          {booking && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${
                              booking.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              Booking: {booking.status}
                            </span>
                          )}
                          {trip && (
                            <span className="inline-flex items-center rounded-full bg-freight-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-freight-600">
                              Trip: {trip.status}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status + hover actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge
                        animate={['BOOKING_PENDING', 'LOADING', 'IN_TRANSIT'].includes(shipment.status)}
                        size="sm"
                        status={shipment.status}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail Pane */}
          {selectedShipmentId && (
            <div className="xl:sticky xl:top-3 flex h-[calc(100vh-1.5rem)] max-h-[1200px] flex-col animate-slide-up">
              <ShipmentDetailPane
                onClose={() => setSelectedShipmentId(null)}
                shipmentId={selectedShipmentId}
              />
            </div>
          )}
        </section>
      ) : null}
    </DashboardShell>
  );
}
