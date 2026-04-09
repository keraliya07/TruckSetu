import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '../../components/common/ConfirmModal';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { useBookingStore } from '../../store/bookingStore';

export default function BookingRequestsPage() {
  const { bookings, filters, error, fetchBookings, setFilter, respondToBooking } =
    useBookingStore();
  const [rejectId, setRejectId] = useState(null);

  useEffect(() => {
    fetchBookings(filters).catch(() => {});
  }, [filters.status, filters.limit, filters.page]);

  const metrics = useMemo(
    () => ({
      open: bookings.filter((booking) => booking.status === 'SENT').length,
      accepted: bookings.filter((booking) => booking.status === 'APPROVED').length,
      closed: bookings.filter((booking) =>
        ['REJECTED', 'CANCELLED', 'EXPIRED'].includes(booking.status)
      ).length,
    }),
    [bookings]
  );

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title="Shipment requests"
      subtitle="Review optimized shipment requests from warehouses and respond with either accept or reject. Once another dealer accepts, the remaining open requests are closed automatically."
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet/new', label: 'Add truck' },
          { to: '/dealer/bookings', label: 'Shipment requests', active: true },
          { to: '/dealer/analytics', label: 'Analytics' },
        ]}
      />

      <section className="panel p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:justify-end">
              <label className="w-full sm:w-56">
                <span className="field-label">Status</span>
                <select
                  className="input-base"
                  value={filters.status}
                  onChange={(event) => setFilter('status', event.target.value)}
                >
                  <option value="">All requests</option>
                  <option value="SENT">Open for response</option>
                  <option value="APPROVED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Closed by assignment</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </label>

              <button className="btn-secondary" onClick={() => fetchBookings(filters)} type="button">
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open requests</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.open}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Accepted</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.accepted}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Closed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.closed}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {bookings.length === 0 ? (
        <EmptyState
          title="No shipment requests"
          description="Optimized warehouse shipment requests will appear here when your available trucks match the route and load."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {bookings.map((booking) => (
            <article key={booking.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    className="font-heading text-2xl text-slate-950 hover:text-freight-700"
                    to={`/dealer/bookings/${booking.id}`}
                  >
                    {booking.truck?.registrationNo}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    {booking.shipments.length} shipment(s) from {booking.warehouse?.warehouseName}
                  </p>
                </div>
                <StatusBadge animate={booking.status === 'SENT'} size="md" status={booking.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quoted price</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Rs {booking.quotedPrice}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Response window</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {booking.expiresAt ? new Date(booking.expiresAt).toLocaleString() : 'No expiry'}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                {booking.shipments.map((entry) => (
                  <p key={entry.shipment.id}>
                    {entry.shipment.title} and {entry.shipment.weightKg} kg to {entry.shipment.destCity}
                  </p>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="btn-secondary" to={`/dealer/bookings/${booking.id}`}>
                  Open detail
                </Link>
                {booking.status === 'APPROVED' && booking.trip ? (
                  <Link className="btn-secondary" to={`/dealer/trips/${booking.trip.id}`}>
                    Manage trip
                  </Link>
                ) : null}
              </div>

              {booking.status === 'SENT' ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    className="btn-primary"
                    onClick={() => respondToBooking(booking.id, { action: 'APPROVE' })}
                    type="button"
                  >
                    Accept request
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setRejectId(booking.id)}
                    type="button"
                  >
                    Reject request
                  </button>
                </div>
              ) : null}

              {booking.status === 'CANCELLED' ? (
                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  This request was closed because another dealer accepted the shipment first.
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}

      <ConfirmModal
        confirmText="Reject request"
        isOpen={Boolean(rejectId)}
        message="This rejection will be recorded, and the shipment will remain open for the other invited dealers."
        onClose={() => setRejectId(null)}
        onConfirm={async () => {
          await respondToBooking(rejectId, { action: 'REJECT' });
          setRejectId(null);
        }}
        title="Reject shipment request"
      />
    </DashboardShell>
  );
}
