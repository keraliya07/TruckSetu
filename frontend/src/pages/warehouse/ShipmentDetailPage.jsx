import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import * as shipmentApi from '../../api/shipment.api';
import {
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

  const activeBooking = useMemo(
    () => shipment?.bookingShipments?.[0]?.bookingRequest || null,
    [shipment?.bookingShipments]
  );
  const activeTrip = useMemo(
    () => shipment?.tripShipments?.[0]?.trip || null,
    [shipment?.tripShipments]
  );

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title={shipment?.title || shipment?.referenceNo || 'Shipment detail'}
      subtitle="Inspect lane, load profile, commercial state, and downstream trip activity for a single shipment."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/new', label: 'Create shipment' },
          { to: '/warehouse/bookings', label: 'Bookings' },
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
                {['DRAFT', 'PENDING'].includes(shipment.status) ? (
                  <Link
                    className="btn-secondary"
                    to={`/warehouse/optimization?shipmentIds=${shipment.id}`}
                  >
                    Optimize
                  </Link>
                ) : null}
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatDate(shipment.deadline)}
                </p>
                <p className="mt-1 text-sm text-slate-600">Priority {shipment.priority}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk flags</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {shipment.fragile ? 'Fragile' : 'Standard'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {shipment.hazardous ? 'Hazardous handling' : 'No hazardous restriction'}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Created</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatDateTime(shipment.createdAt)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Updated {formatDateTime(shipment.updatedAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="panel p-6">
              <h3 className="font-heading text-2xl text-slate-950">Lane breakdown</h3>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Origin</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{shipment.originCity}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {shipment.originAddress || 'Warehouse address on file'}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Destination</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{shipment.destCity}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {shipment.destAddress || 'Destination address pending'}
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
                <h3 className="font-heading text-2xl text-slate-950">Booking state</h3>
                {activeBooking ? (
                  <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          Booking {activeBooking.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Truck {activeBooking.truckId}</p>
                      </div>
                      <StatusBadge status={activeBooking.status} />
                    </div>
                    <Link className="btn-secondary mt-4" to={`/warehouse/bookings/${activeBooking.id}`}>
                      Open booking detail
                    </Link>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-600">
                    This shipment has not been attached to a booking request yet.
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
                    A trip will appear here once the booking request is approved.
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
