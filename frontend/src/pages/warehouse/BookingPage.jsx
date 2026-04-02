import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useBookingStore } from '../../store/bookingStore';
import { useShipmentStore } from '../../store/shipmentStore';
import { useTruckStore } from '../../store/truckStore';

export default function BookingPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const bookingStore = useBookingStore();
  const shipmentStore = useShipmentStore();
  const truckStore = useTruckStore();

  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [warehouseNote, setWarehouseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryShipmentIds = searchParams.get('shipmentIds')?.split(',').filter(Boolean) || [];
  const queryTruckId = searchParams.get('truckId') || '';

  useEffect(() => {
    shipmentStore.fetchShipments({ status: 'PENDING', page: 1, limit: 50 }).catch(() => {});
    truckStore.fetchTrucks({ status: 'AVAILABLE', page: 1, limit: 20 }).catch(() => {});
    bookingStore.fetchBookings({ page: 1, limit: 20 }).catch(() => {});
  }, []);

  useEffect(() => {
    if (queryTruckId) {
      setSelectedTruckId(queryTruckId);
    }
  }, [queryTruckId]);

  useEffect(() => {
    if (queryShipmentIds.length) {
      queryShipmentIds.forEach((shipmentId) => {
        if (!shipmentStore.selectedIds.includes(shipmentId)) {
          shipmentStore.toggleSelect(shipmentId);
        }
      });
    }
  }, [queryShipmentIds.join(','), shipmentStore.selectedIds.join(',')]);

  const preselectedIds = shipmentStore.selectedIds;
  const pendingShipments = shipmentStore.shipments;
  const selectedShipments = pendingShipments.filter((shipment) =>
    preselectedIds.includes(shipment.id)
  );
  const selectedTruck = truckStore.trucks.find((truck) => truck.id === selectedTruckId);

  const totalWeightTons = useMemo(
    () =>
      selectedShipments.reduce((sum, shipment) => sum + shipment.weightKg, 0) / 1000,
    [selectedShipments]
  );

  const suggestedPrice = useMemo(() => {
    if (!selectedTruck?.dealer?.baseRatePerKmTon || totalWeightTons === 0) {
      return 0;
    }
    return Math.round(
      selectedTruck.dealer.baseRatePerKmTon * totalWeightTons * 100
    );
  }, [selectedTruck, totalWeightTons]);

  useEffect(() => {
    if (suggestedPrice && !quotedPrice) {
      setQuotedPrice(String(suggestedPrice));
    }
  }, [suggestedPrice, quotedPrice]);

  const createBooking = async () => {
    if (!selectedTruckId || selectedShipments.length === 0 || !quotedPrice) {
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingStore.createBooking({
        shipmentIds: selectedShipments.map((shipment) => shipment.id),
        truckId: selectedTruckId,
        quotedPrice: Number(quotedPrice),
      });
      shipmentStore.clearSelection();
      setSelectedTruckId('');
      setQuotedPrice('');
      await shipmentStore.fetchShipments({ status: 'PENDING', page: 1, limit: 50 });
      await bookingStore.fetchBookings({ page: 1, limit: 20 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title={`Booking workspace for ${user?.warehouse?.warehouseName || user?.name}`}
      subtitle="Select pending shipments, compare available dealer trucks, and manage sent or countered booking requests."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/bookings', label: 'Bookings', active: true },
          { to: '/warehouse/optimization', label: 'Optimization' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
                  Step 1
                </p>
                <h2 className="mt-2 font-heading text-3xl text-slate-950">
                  Select pending shipments
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    shipmentStore.fetchShipments({ status: 'PENDING', page: 1, limit: 50 })
                  }
                  type="button"
                >
                  Refresh
                </button>
                <Link className="btn-secondary" to="/warehouse/optimization">
                  Open optimizer
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {pendingShipments.length === 0 ? (
                <EmptyState
                  title="No pending shipments"
                  description="Promote a draft shipment to pending from the shipment board first."
                />
              ) : (
                pendingShipments.map((shipment) => (
                  <label
                    key={shipment.id}
                    className={`rounded-3xl border px-4 py-4 transition ${
                      preselectedIds.includes(shipment.id)
                        ? 'border-freight-500 bg-teal-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        checked={preselectedIds.includes(shipment.id)}
                        onChange={() => shipmentStore.toggleSelect(shipment.id)}
                        type="checkbox"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-950">{shipment.title}</p>
                            <p className="mt-1 text-sm text-slate-600">
                              {shipment.originCity} to {shipment.destCity}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {shipment.weightKg} kg and {shipment.volumeM3} m3
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <StatusBadge status={shipment.status} />
                            <Link className="btn-secondary" to={`/warehouse/shipments/${shipment.id}`}>
                              Detail
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="panel p-6">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
              Step 2
            </p>
            <h2 className="mt-2 font-heading text-3xl text-slate-950">Choose a truck</h2>
            <div className="mt-6 grid gap-4">
              {truckStore.trucks.map((truck) => (
                <button
                  key={truck.id}
                  className={`rounded-3xl border px-5 py-5 text-left transition ${
                    selectedTruckId === truck.id
                      ? 'border-freight-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedTruckId(truck.id)}
                  type="button"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-heading text-2xl text-slate-950">
                        {truck.registrationNo}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {truck.truckType} and {truck.maxWeightKg} kg capacity
                      </p>
                    </div>
                    <StatusBadge status={truck.status} />
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    Dealer {truck.dealer?.companyName} from {truck.dealer?.primaryCity}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-freight-700">
                    Base rate Rs {truck.dealer?.baseRatePerKmTon || 0} / km-ton
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="panel p-6">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
              Step 3
            </p>
            <h2 className="mt-2 font-heading text-3xl text-slate-950">Send booking request</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Selected shipments
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {selectedShipments.length}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total weight</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {totalWeightTons.toFixed(2)} tons
                </p>
              </div>
              <div>
                <label className="field-label" htmlFor="quotedPrice">
                  Quoted price
                </label>
                <input
                  className="input-base"
                  id="quotedPrice"
                  min="1"
                  onChange={(event) => setQuotedPrice(event.target.value)}
                  type="number"
                  value={quotedPrice}
                />
                {suggestedPrice ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Suggested from selected truck profile: Rs {suggestedPrice}
                  </p>
                ) : null}
              </div>
              <button
                className="btn-primary w-full"
                disabled={
                  isSubmitting ||
                  selectedShipments.length === 0 ||
                  !selectedTruckId ||
                  !quotedPrice
                }
                onClick={createBooking}
                type="button"
              >
                {isSubmitting ? 'Sending booking...' : 'Send booking request'}
              </button>
            </div>
          </section>

          <section className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-heading text-sm uppercase tracking-[0.3em] text-slate-500">
                  Existing requests
                </p>
                <h2 className="mt-2 font-heading text-2xl text-slate-950">
                  Booking timeline
                </h2>
              </div>
              <button
                className="btn-secondary"
                onClick={() => bookingStore.fetchBookings({ page: 1, limit: 20 })}
                type="button"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {bookingStore.bookings.length === 0 ? (
                <p className="text-sm text-slate-600">No booking requests yet.</p>
              ) : (
                bookingStore.bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {booking.truck?.registrationNo}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.shipments.length} shipment(s) with{' '}
                          {booking.truck?.dealer?.companyName}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="mt-4 text-sm text-slate-600">
                      Quote Rs {booking.quotedPrice}
                      {booking.counterPrice ? `, counter Rs ${booking.counterPrice}` : ''}
                      {booking.finalPrice ? `, final Rs ${booking.finalPrice}` : ''}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link className="btn-secondary" to={`/warehouse/bookings/${booking.id}`}>
                        Open detail
                      </Link>
                    </div>

                    {booking.status === 'COUNTERED' ? (
                      <div className="mt-4 space-y-3">
                        <textarea
                          className="input-base min-h-24"
                          placeholder="Add an optional note before accepting the counter offer"
                          value={warehouseNote}
                          onChange={(event) => setWarehouseNote(event.target.value)}
                        />
                        <button
                          className="btn-primary w-full"
                          onClick={() =>
                            bookingStore.acceptCounter(booking.id, {
                              warehouseNote,
                            })
                          }
                          type="button"
                        >
                          Accept counter offer
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </DashboardShell>
  );
}
