import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import * as shipmentApi from '../../api/shipment.api';
import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from '../../utils/formatters';

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadShipment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await shipmentApi.getShipmentById(id);
        setShipment(result);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadShipment().catch(() => {});
  }, [id]);

  const bookingRequests = useMemo(
    () =>
      (shipment?.bookingShipments || [])
        .map((entry) => entry.bookingRequest)
        .filter(Boolean),
    [shipment?.bookingShipments]
  );
  const approvedBooking = useMemo(
    () => bookingRequests.find((booking) => booking.status === 'APPROVED') || null,
    [bookingRequests]
  );
  const activeTrip = useMemo(
    () => approvedBooking?.trip || shipment?.tripShipments?.[0]?.trip || null,
    [approvedBooking?.trip, shipment?.tripShipments]
  );

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title={shipment?.title || shipment?.referenceNo || 'Shipment detail'}
      subtitle="Inspect the shipment lane, system price, dealer request board, and downstream assignment status from one place."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Create shipment' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      {isLoading ? <LoadingSpinner label="Loading shipment detail..." /> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {shipment ? (
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                  {shipment.referenceNo}
                </p>
                <h2 className="mt-3 font-heading text-4xl text-slate-950">
                  {shipment.title || shipment.referenceNo}
                </h2>
                <p className="mt-3 max-w-3xl text-slate-600">
                  {shipment.description || 'No shipment description added yet.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <StatusBadge
                  animate={['BOOKING_PENDING', 'IN_TRANSIT', 'LOADING'].includes(shipment.status)}
                  size="md"
                  status={shipment.status}
                />
                {activeTrip ? (
                  <Link className="btn-primary" to={`/warehouse/tracking/${activeTrip.id}`}>
                    Track trip
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Load</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatNumber(shipment.weightKg)} kg
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatNumber(shipment.volumeM3)} m3 volume
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timing</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  Pickup {formatDateTime(shipment.pickupDeadline)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Delivery {formatDate(shipment.deadline)}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Shipment type</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{shipment.shipmentType}</p>
                <p className="mt-1 text-sm text-slate-600">Priority {shipment.priority}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System price</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {shipment.systemPrice ? formatCurrency(shipment.systemPrice) : 'Not available'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Distance {shipment.estimatedDistanceKm ? `${shipment.estimatedDistanceKm} km` : 'N/A'}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="panel p-6">
              <h3 className="font-heading text-2xl text-slate-950">Lane breakdown</h3>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pickup</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{shipment.originCity}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {shipment.originAddress || 'Pickup address pending'}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Delivery</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{shipment.destCity}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {shipment.destAddress || 'Delivery address pending'}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Special instructions</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {shipment.specialInstructions || 'No special handling notes have been added.'}
                  </p>
                </div>
              </div>
            </article>

            <article className="space-y-6">
              <div className="panel p-6">
                <h3 className="font-heading text-2xl text-slate-950">Dealer request board</h3>
                {bookingRequests.length ? (
                  <div className="mt-5 space-y-4">
                    {bookingRequests.map((booking) => (
                      <div key={booking.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {booking.truck?.dealer?.companyName}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Truck {booking.truck?.registrationNo}
                            </p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                          Quote {formatCurrency(booking.quotedPrice)}
                        </p>
                        <Link className="btn-secondary mt-4" to={`/warehouse/bookings/${booking.id}`}>
                          Open request detail
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-600">
                    No dealer requests have been created for this shipment yet.
                  </p>
                )}
              </div>

              <div className="panel p-6">
                <h3 className="font-heading text-2xl text-slate-950">Trip state</h3>
                {activeTrip ? (
                  <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-emerald-950">
                          Trip {activeTrip.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-sm text-emerald-800">
                          Started {formatDateTime(activeTrip.startedAt)}
                        </p>
                      </div>
                      <StatusBadge status={activeTrip.status} />
                    </div>
                    <Link className="btn-primary mt-4" to={`/warehouse/tracking/${activeTrip.id}`}>
                      Open live tracking
                    </Link>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-600">
                    A trip will appear here once one dealer accepts the shipment request.
                  </p>
                )}
              </div>
            </article>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
