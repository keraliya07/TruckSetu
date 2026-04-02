import { useEffect, useState } from 'react';
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
  const [counterState, setCounterState] = useState({
    bookingId: '',
    counterPrice: '',
    dealerNote: '',
  });

  useEffect(() => {
    fetchBookings(filters).catch(() => {});
  }, [filters.status, filters.limit, filters.page]);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title="Booking requests"
      subtitle="Review incoming booking demand, counter when the economics need adjustment, and approve when a trip is ready to launch."
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet', label: 'Fleet' },
          { to: '/dealer/fleet/new', label: 'Add truck' },
          { to: '/dealer/bookings', label: 'Booking requests', active: true },
          { to: '/dealer/analytics', label: 'Analytics' },
        ]}
      />

      <section className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Status</span>
              <select
                className="input-base"
                value={filters.status}
                onChange={(event) => setFilter('status', event.target.value)}
              >
                <option value="">All requests</option>
                <option value="SENT">Pending</option>
                <option value="COUNTERED">Countered</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </label>

            <label>
              <span className="field-label">Page size</span>
              <select
                className="input-base"
                value={filters.limit}
                onChange={(event) => setFilter('limit', Number(event.target.value))}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </label>
          </div>

          <button className="btn-secondary" onClick={() => fetchBookings(filters)} type="button">
            Refresh
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {bookings.length === 0 ? (
        <EmptyState
          title="No booking requests"
          description="Incoming booking demand will appear here once warehouses start sending requests."
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
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quoted</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Rs {booking.quotedPrice}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expires</p>
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
                <div className="mt-5 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      className="btn-primary"
                      onClick={() => respondToBooking(booking.id, { action: 'APPROVE' })}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setCounterState({
                          bookingId: booking.id,
                          counterPrice: String(
                            booking.counterPrice || Math.round(booking.quotedPrice * 1.08)
                          ),
                          dealerNote: '',
                        })
                      }
                      type="button"
                    >
                      Counter
                    </button>
                  </div>
                  <button
                    className="btn-secondary w-full"
                    onClick={() => setRejectId(booking.id)}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              ) : null}

              {booking.status === 'APPROVED' && booking.trip ? (
                <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                  Trip {booking.trip.id.slice(0, 8)} is ready in {booking.trip.status} state.
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}

      <ConfirmModal
        confirmText="Reject booking"
        isOpen={Boolean(rejectId)}
        message="The warehouse will get the shipments back into a pending state if you reject this request."
        onClose={() => setRejectId(null)}
        onConfirm={async () => {
          await respondToBooking(rejectId, { action: 'REJECT' });
          setRejectId(null);
        }}
        title="Reject request"
      />

      {counterState.bookingId ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="panel w-full max-w-lg p-6">
            <h3 className="font-heading text-2xl text-slate-950">Counter offer</h3>
            <div className="mt-5 grid gap-4">
              <label>
                <span className="field-label">Counter price</span>
                <input
                  className="input-base"
                  min="1"
                  type="number"
                  value={counterState.counterPrice}
                  onChange={(event) =>
                    setCounterState((state) => ({
                      ...state,
                      counterPrice: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span className="field-label">Dealer note</span>
                <textarea
                  className="input-base min-h-24"
                  placeholder="Explain the revised economics or route assumptions"
                  value={counterState.dealerNote}
                  onChange={(event) =>
                    setCounterState((state) => ({
                      ...state,
                      dealerNote: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() =>
                  setCounterState({
                    bookingId: '',
                    counterPrice: '',
                    dealerNote: '',
                  })
                }
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  await respondToBooking(counterState.bookingId, {
                    action: 'COUNTER',
                    counterPrice: Number(counterState.counterPrice),
                    dealerNote: counterState.dealerNote,
                  });
                  setCounterState({
                    bookingId: '',
                    counterPrice: '',
                    dealerNote: '',
                  });
                }}
                type="button"
              >
                Send counter
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
