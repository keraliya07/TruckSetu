import { Link, useParams } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import TrackingMap from '../../components/maps/TrackingMap';
import LiveTrackingPanel from '../../components/tracking/LiveTrackingPanel';
import CO2DownloadButton from '../../components/trips/CO2DownloadButton';
import InvoiceDownloadButton from '../../components/trips/InvoiceDownloadButton';
import { useTracking } from '../../hooks/useTracking';
import { useTripStore } from '../../store/tripStore';

export default function TripManagePage() {
  const { tripId } = useParams();
  const tracking = useTracking(tripId);
  const refreshGeometryAction = useTripStore((state) => state.refreshGeometry);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title={tracking.trip ? `Trip ${tracking.trip.id.slice(0, 8)}` : 'Trip management'}
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet', label: 'Fleet' },
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/analytics', label: 'Analytics' },
          { to: '/dealer/return-loads', label: 'Return loads' },
        ]}
      />

      {tracking.isLoading ? <LoadingSpinner label="Loading trip controls..." /> : null}

      {tracking.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {tracking.error}
        </div>
      ) : null}

      {tracking.trip ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <TrackingMap
            locationHistory={tracking.locationHistory}
            onRefreshGeometry={() => refreshGeometryAction(tripId)}
            routeGeometry={tracking.trip?.routeGeometry}
            stops={tracking.stops}
            trip={tracking.trip}
            truckPosition={tracking.truckPosition}
          />
          <LiveTrackingPanel
            actions={
              tracking.trip.status === 'PLANNED' ? (
                <div className="flex flex-wrap gap-3">
                  <button className="btn-primary" onClick={tracking.startTrip} type="button">
                    Start trip
                  </button>
                  <CO2DownloadButton className="btn-secondary gap-2" tripId={tracking.trip.id} />
                  <InvoiceDownloadButton
                    className="btn-secondary gap-2"
                    tripId={tracking.trip.id}
                  />
                </div>
              ) : tracking.trip.status === 'DELIVERED' ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <CO2DownloadButton className="btn-secondary gap-2" tripId={tracking.trip.id} />
                    <InvoiceDownloadButton
                      className="btn-secondary gap-2"
                      tripId={tracking.trip.id}
                    />
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <p>Trip is fully delivered. Truck can now be repositioned for the next load.</p>
                    <Link
                      className="mt-3 inline-flex font-semibold text-emerald-900 underline"
                      to={`/dealer/return-loads?tripId=${tracking.trip.id}`}
                    >
                      Review return loads
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <CO2DownloadButton className="btn-secondary gap-2" tripId={tracking.trip.id} />
                  <InvoiceDownloadButton
                    className="btn-secondary gap-2"
                    tripId={tracking.trip.id}
                  />
                </div>
              )
            }
            busyStopId={tracking.busyStopId}
            eta={tracking.eta}
            onCompleteStop={tracking.trip.status !== 'DELIVERED' ? tracking.completeStop : undefined}
            progress={tracking.progress}
            stops={tracking.stops}
            trip={tracking.trip}
          />
        </div>
      ) : null}
    </DashboardShell>
  );
}
