import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import * as bookingApi from '../../api/booking.api';
import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import CO2DownloadButton from '../../components/trips/CO2DownloadButton';
import InvoiceDownloadButton from '../../components/trips/InvoiceDownloadButton';
import { useAuth } from '../../hooks/useAuth';
import { useBookingStore } from '../../store/bookingStore';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from '../../utils/formatters';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { isDealer } = useAuth();
  const { respondToBooking } = useBookingStore();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealerNote, setDealerNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadBooking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await bookingApi.getBookingById(id);
      setBooking(result);
      setDealerNote(result.dealerNote || '');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooking().catch(() => {});
  }, [id]);

  const tabs = isDealer
    ? [
        { to: '/dealer/fleet', label: 'Fleet' },
        { to: '/dealer/bookings', label: 'Shipment requests' },
        { to: '/dealer/analytics', label: 'Analytics' },
      ]
    : [
        { to: '/warehouse/shipments', label: 'Shipment board' },
        { to: '/warehouse/bookings', label: 'Bookings' },
        { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
      ];

  const trip = booking?.trip || null;
  const totalWeight = useMemo(
    () =>
      booking?.shipments?.reduce(
        (sum, entry) => sum + Number(entry.shipment?.weightKg || 0),
        0
      ) || 0,
    [booking?.shipments]
  );
  const primaryShipment = booking?.shipments?.[0]?.shipment || null;

  return (
    <DashboardShell
      accent={isDealer ? 'text-freight-600' : 'text-freight-600'}
      eyebrow={isDealer ? 'Dealer Flow' : 'Warehouse Flow'}
      title={booking ? `Shipment request ${booking.id.slice(0, 8)}` : 'Shipment request detail'}
      subtitle="Review shipment economics, response status, invited load bundle, and the resulting trip assignment from one page."
    >
      <PageTabs items={tabs} />

      {isLoading ? <LoadingSpinner label="Loading shipment request..." /> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {booking ? (
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                  Requested {formatDateTime(booking.createdAt)}
                </p>
                <h2 className="mt-3 font-heading text-4xl text-slate-950">
                  {booking.truck?.registrationNo}
                </h2>
                <p className="mt-3 max-w-3xl text-slate-600">
                  {booking.shipments.length} shipment(s) with total load {formatNumber(totalWeight)} kg.
                </p>
              </div>
              <StatusBadge animate={booking.status === 'SENT'} size="md" status={booking.status} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quoted price</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(booking.quotedPrice)}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System shipment price</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {primaryShipment?.systemPrice ? formatCurrency(primaryShipment.systemPrice) : 'Not available'}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Final price</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {booking.finalPrice ? formatCurrency(booking.finalPrice) : 'Awaiting response'}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expires</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatDateTime(booking.expiresAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <article className="panel flex max-h-[600px] flex-col xl:sticky xl:top-6">
              <div className="flex-none p-6 pb-0">
                <h3 className="font-heading text-2xl text-slate-950">Shipment bundle</h3>
              </div>
              <div className="mt-2 flex-1 space-y-4 overflow-y-auto p-6">
                {booking.shipments.map((entry) => (
                  <div key={entry.shipment.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {entry.shipment.title || entry.shipment.referenceNo}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {entry.shipment.originCity} to {entry.shipment.destCity}
                        </p>
                      </div>
                      <StatusBadge status={entry.shipment.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {formatNumber(entry.shipment.weightKg)} kg | {formatNumber(entry.shipment.volumeM3)} m3 | {entry.shipment.shipmentType}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Pickup deadline {formatDateTime(entry.shipment.pickupDeadline)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Delivery deadline {formatDateTime(entry.shipment.deadline)}
                    </p>
                    {!isDealer ? (
                      <Link className="btn-secondary mt-4" to={`/warehouse/shipments/${entry.shipment.id}`}>
                        Open shipment detail
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>

            <article className="space-y-6">
              <div className="panel p-6">
                <h3 className="font-heading text-2xl text-slate-950">Notes and assignment</h3>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-50 px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dealer note</p>
                    <p className="mt-2 text-sm text-slate-700">
                      {booking.dealerNote || 'No dealer note shared yet.'}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Warehouse note</p>
                    <p className="mt-2 text-sm text-slate-700">
                      {booking.warehouseNote || 'No warehouse note shared yet.'}
                    </p>
                  </div>

                  {booking.status === 'CANCELLED' ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-700">
                      This request was closed because another dealer accepted the shipment first.
                    </div>
                  ) : null}

                  {booking.status === 'REJECTED' ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-5 text-sm text-rose-700">
                      The dealer rejected this request. The shipment stays open for the other invited dealers unless another request closes first.
                    </div>
                  ) : null}

                  {trip ? (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-emerald-950">
                            Trip {trip.id.slice(0, 8)} is active
                          </p>
                          <p className="mt-1 text-sm text-emerald-800">Status {trip.status}</p>
                        </div>
                        <Link
                          className="btn-primary"
                          to={isDealer ? `/dealer/trips/${trip.id}` : `/warehouse/tracking/${trip.id}`}
                        >
                          Open trip
                        </Link>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <CO2DownloadButton className="btn-secondary gap-2" tripId={trip.id} />
                          <InvoiceDownloadButton
                            className="btn-secondary gap-2"
                            tripId={trip.id}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {isDealer && booking.status === 'SENT' ? (
                <div className="panel p-6">
                  <h3 className="font-heading text-2xl text-slate-950">Dealer response</h3>
                  <div className="mt-5 grid gap-4">
                    <label>
                      <span className="field-label">Dealer note</span>
                      <textarea
                        className="input-base min-h-24"
                        value={dealerNote}
                        onChange={(event) => setDealerNote(event.target.value)}
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="btn-primary"
                        disabled={isSaving}
                        onClick={async () => {
                          setIsSaving(true);
                          try {
                            await respondToBooking(booking.id, {
                              action: 'APPROVE',
                              dealerNote,
                            });
                            await loadBooking();
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        type="button"
                      >
                        Accept request
                      </button>
                      <button
                        className="btn-secondary"
                        disabled={isSaving}
                        onClick={async () => {
                          setIsSaving(true);
                          try {
                            await respondToBooking(booking.id, {
                              action: 'REJECT',
                              dealerNote,
                            });
                            await loadBooking();
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        type="button"
                      >
                        Reject request
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
