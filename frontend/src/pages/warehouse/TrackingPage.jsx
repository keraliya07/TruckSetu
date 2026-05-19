import { useParams } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import TrackingMap from '../../components/maps/TrackingMap';
import LiveTrackingPanel from '../../components/tracking/LiveTrackingPanel';
import CO2DownloadButton from '../../components/trips/CO2DownloadButton';
import InvoiceDownloadButton from '../../components/trips/InvoiceDownloadButton';
import { useTracking } from '../../hooks/useTracking';
import { useTripStore } from '../../store/tripStore';

export default function TrackingPage() {
  const { tripId } = useParams();
  const tracking = useTracking(tripId);
  const refreshGeometryAction = useTripStore((state) => state.refreshGeometry);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title={tracking.trip ? `Trip ${tracking.trip.id.slice(0, 8)}` : 'Live tracking'}
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Create workspace' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      {tracking.isLoading ? <LoadingSpinner label="Loading trip tracking..." /> : null}

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
              <div className="flex flex-col sm:flex-row gap-2">
                <CO2DownloadButton className="btn-secondary gap-2" tripId={tracking.trip.id} />
                <InvoiceDownloadButton
                  className="btn-secondary gap-2"
                  tripId={tracking.trip.id}
                />
              </div>
            }
            eta={tracking.eta}
            progress={tracking.progress}
            stops={tracking.stops}
            trip={tracking.trip}
          />
        </div>
      ) : null}
    </DashboardShell>
  );
}
