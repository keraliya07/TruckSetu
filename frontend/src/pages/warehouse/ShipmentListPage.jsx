import { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '../../components/common/ConfirmModal';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import ShipmentDetailPane from '../../components/warehouse/ShipmentDetailPane';
import { useAuth } from '../../hooks/useAuth';
import { useShipmentStore } from '../../store/shipmentStore';

export default function ShipmentListPage() {
  const { user } = useAuth();
  const {
    shipments,
    total,
    filters,
    selectedIds,
    isLoading,
    error,
    fetchShipments,
    toggleSelect,
    selectAllVisible,
    clearSelection,
    setFilter,
    batchUpdateStatus,
    deleteShipment,
  } = useShipmentStore();
  const [deleteId, setDeleteId] = useState(null);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    fetchShipments({ ...filters, search: deferredSearch }).catch(() => { });
  }, [deferredSearch, filters.status, filters.limit, filters.page]);

  const selectedShipments = shipments.filter((shipment) =>
    selectedIds.includes(shipment.id)
  );

  const canMoveToPending = selectedShipments.every((shipment) =>
    ['DRAFT', 'PENDING'].includes(shipment.status)
  );
  const canCancel = selectedShipments.every((shipment) =>
    ['DRAFT', 'PENDING', 'BOOKING_PENDING'].includes(shipment.status)
  );

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title={`Shipment board for ${user?.warehouse?.warehouseName || user?.name}`}
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board', active: true },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
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
            <h2 className="text-base font-semibold text-slate-900">Shipments</h2>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
              {total}
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
              placeholder="Search shipments..."
              value={filters.search}
              onChange={(event) => setFilter('search', event.target.value)}
            />
          </div>

          <select
            className="w-full sm:w-44 rounded-lg border border-slate-200 py-2 px-3 text-sm text-slate-700 outline-none transition-all duration-200 bg-white focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10"
            value={filters.status}
            onChange={(event) => setFilter('status', event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="BOOKING_PENDING">Booking pending</option>
            <option value="BOOKING_CONFIRMED">Booking confirmed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 shrink-0"
            onClick={() => fetchShipments(filters)}
            type="button"
            title="Refresh"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {shipments.length === 0 && !isLoading ? (
        <EmptyState
          title="No shipments yet"
          description="Create your first shipment to start the warehouse workflow."
          action={
            <Link className="btn-primary" to="/warehouse/shipments/new">
              Open dispatch workspace
            </Link>
          }
        />
      ) : (
        <section
          className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${selectedShipmentId
            ? 'grid gap-6 xl:grid-cols-[1.4fr_0.9fr] xl:items-start'
            : 'mx-auto max-w-4xl'
            }`}
        >
          {/* ── Compact card list ── */}
          <div className="space-y-2.5">
            {shipments.map((shipment, index) => (
              <button
                key={shipment.id}
                onClick={() => setSelectedShipmentId(shipment.id)}
                type="button"
                className={`group w-full text-left relative overflow-hidden rounded-2xl border transition-all duration-250 px-5 py-5 block animate-fade-in ${selectedShipmentId === shipment.id
                  ? 'border-freight-200 bg-freight-50/30 shadow-sm ring-1 ring-freight-100'
                  : 'border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]'
                  }`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Core info — single row */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className={`font-heading text-base font-semibold truncate transition ${selectedShipmentId === shipment.id ? 'text-freight-900' : 'text-slate-900 group-hover:text-freight-700'
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
                      <span className="text-slate-400">{shipment.weightKg} kg</span>
                      <span className="text-slate-200 mx-1.5">·</span>
                      <span className="text-slate-400">{shipment.volumeM3} m³</span>
                    </p>
                  </div>

                  {/* Status + quick actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge
                      animate={['BOOKING_PENDING', 'LOADING', 'IN_TRANSIT'].includes(
                        shipment.status
                      )}
                      size="sm"
                      status={shipment.status}
                    />

                    {/* Hover-reveal actions */}
                    {['DRAFT', 'PENDING', 'BOOKING_PENDING'].includes(shipment.status) && (
                      <div className="hidden group-hover:flex items-center gap-1.5 animate-fade-in">
                        <button
                          className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-rose-500 hover:bg-rose-50 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(shipment.id);
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail Pane */}
          {selectedShipmentId && (
            <div className="xl:sticky xl:top-3 flex h-[calc(100vh-1.5rem)] max-h-[1200px] flex-col animate-slide-up">
              <ShipmentDetailPane shipmentId={selectedShipmentId} onClose={() => setSelectedShipmentId(null)} />
            </div>
          )}
        </section>
      )}

      {/* ── Floating batch action bar ── */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full bg-slate-900 text-white pl-6 pr-4 py-3 shadow-2xl shadow-slate-900/30 animate-slide-up">
          <span className="text-sm font-semibold whitespace-nowrap">
            {selectedIds.length} selected
          </span>
          <div className="h-5 w-px bg-white/20" />
          <button
            className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium hover:bg-white/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!canMoveToPending}
            onClick={() =>
              batchUpdateStatus({ shipmentIds: selectedIds, status: 'PENDING' })
            }
            type="button"
          >
            Mark pending
          </button>
          <button
            className="rounded-full bg-rose-500/80 px-4 py-1.5 text-sm font-medium hover:bg-rose-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!canCancel}
            onClick={() =>
              batchUpdateStatus({ shipmentIds: selectedIds, status: 'CANCELLED' })
            }
            type="button"
          >
            Cancel selected
          </button>
          <Link
            className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium hover:bg-white/25 transition"
            to="/warehouse/bookings"
          >
            Open requests
          </Link>
          <button
            className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition ml-1"
            onClick={clearSelection}
            type="button"
            title="Clear selection"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <ConfirmModal
        cancelText="Keep shipment"
        confirmText="Remove shipment"
        isOpen={Boolean(deleteId)}
        message="Draft shipments are deleted. Pending or booking-pending shipments are moved into cancelled status."
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          const shipment = shipments.find((item) => item.id === deleteId);
          if (!shipment) return;

          if (shipment.status === 'DRAFT') {
            await deleteShipment(deleteId);
          } else {
            await batchUpdateStatus({
              shipmentIds: [deleteId],
              status: 'CANCELLED',
            });
          }
          setDeleteId(null);
        }}
        title="Update shipment"
      />
    </DashboardShell>
  );
}
