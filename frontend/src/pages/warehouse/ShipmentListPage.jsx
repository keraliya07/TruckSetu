import { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '../../components/common/ConfirmModal';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
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
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    fetchShipments({ ...filters, search: deferredSearch }).catch(() => {});
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
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title={`Shipment board for ${user?.warehouse?.warehouseName || user?.name}`}
      subtitle="Review outbound shipments, monitor which loads are waiting on dealer responses, and follow assignments through delivery."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board', active: true },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Dispatch workspace' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      <section className="panel p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-end">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="w-full sm:w-72">
                  <span className="field-label">Search</span>
                  <input
                    className="input-base"
                    placeholder="Title or destination"
                    value={filters.search}
                    onChange={(event) => setFilter('search', event.target.value)}
                  />
                </label>

                <label className="w-full sm:w-56">
                  <span className="field-label">Status</span>
                  <select
                    className="input-base"
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
                </label>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <button className="btn-secondary" onClick={() => fetchShipments(filters)} type="button">
                  Refresh
                </button>
                <Link className="btn-primary" to="/warehouse/shipments/new">
                  New shipment
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>{total} shipment(s)</span>
            <button className="font-semibold text-freight-700" onClick={selectAllVisible} type="button">
              Select visible
            </button>
            <button className="font-semibold text-slate-700" onClick={clearSelection} type="button">
              Clear selection
            </button>
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-freight-200 bg-teal-50 px-4 py-4">
              <span className="text-sm font-semibold text-slate-900">
                {selectedIds.length} shipment(s) selected
              </span>
              <button
                className="btn-secondary"
                disabled={!canMoveToPending}
                onClick={() =>
                  batchUpdateStatus({ shipmentIds: selectedIds, status: 'PENDING' })
                }
                type="button"
              >
                Mark pending
              </button>
              <button
                className="btn-secondary"
                disabled={!canCancel}
                onClick={() =>
                  batchUpdateStatus({ shipmentIds: selectedIds, status: 'CANCELLED' })
                }
                type="button"
              >
                Cancel selected
              </button>
              <Link className="btn-primary" to="/warehouse/bookings">
                Open requests
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
        <section className="grid gap-4 xl:grid-cols-2">
          {shipments.map((shipment) => (
            <article key={shipment.id} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <input
                    checked={selectedIds.includes(shipment.id)}
                    className="mt-1"
                    onChange={() => toggleSelect(shipment.id)}
                    type="checkbox"
                  />
                  <div>
                    <Link
                      className="font-heading text-2xl text-slate-950 hover:text-freight-700"
                      to={`/warehouse/shipments/${shipment.id}`}
                    >
                      {shipment.title || shipment.referenceNo}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{shipment.referenceNo}</p>
                  </div>
                </div>
                <StatusBadge
                  animate={['BOOKING_PENDING', 'LOADING', 'IN_TRANSIT'].includes(
                    shipment.status
                  )}
                  size="md"
                  status={shipment.status}
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lane</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {shipment.originCity} to {shipment.destCity}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{shipment.destAddress}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Load profile
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {shipment.weightKg} kg and {shipment.volumeM3} m3
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Priority {shipment.priority}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="btn-secondary" to={`/warehouse/shipments/${shipment.id}`}>
                  Open detail
                </Link>
                {shipment.status === 'DRAFT' ? (
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      batchUpdateStatus({
                        shipmentIds: [shipment.id],
                        status: 'PENDING',
                      })
                    }
                    type="button"
                  >
                    Move to pending
                  </button>
                ) : null}
                {['DRAFT', 'PENDING', 'BOOKING_PENDING'].includes(shipment.status) ? (
                  <button
                    className="btn-secondary"
                    onClick={() => setDeleteId(shipment.id)}
                    type="button"
                  >
                    Delete / cancel
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
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
