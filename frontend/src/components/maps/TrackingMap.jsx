import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import RoutePolyline from './RoutePolyline';
import StopMarker from './StopMarker';
import TruckMarker from './TruckMarker';
import { formatNumber } from '../../utils/formatters';

const INDIA_CENTER = [22.9734, 78.6569];

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      map.setView(INDIA_CENTER, 5);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 8);
      return;
    }

    map.fitBounds(L.latLngBounds(points), {
      padding: [36, 36],
    });
  }, [map, points]);

  return null;
}

export default function TrackingMap({
  trip,
  truckPosition,
  stops = [],
  locationHistory = [],
}) {
  const plannedCoordinates = useMemo(
    () =>
      stops
        .filter((stop) => stop.lat != null && stop.lng != null)
        .map((stop) => [stop.lat, stop.lng]),
    [stops]
  );

  const liveTrail = useMemo(
    () =>
      locationHistory
        .filter((location) => location.lat != null && location.lng != null)
        .map((location) => [location.lat, location.lng]),
    [locationHistory]
  );

  const boundsPoints = useMemo(() => {
    const next = [...plannedCoordinates, ...liveTrail];

    if (truckPosition?.lat != null && truckPosition?.lng != null) {
      next.push([truckPosition.lat, truckPosition.lng]);
    }

    return next;
  }, [liveTrail, plannedCoordinates, truckPosition?.lat, truckPosition?.lng]);

  const completedStops = stops.filter((stop) => stop.status === 'COMPLETED').length;

  return (
    <section className="panel h-full overflow-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Route map</p>
          <h2 className="mt-2 font-heading text-3xl text-slate-950">Live path</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-2">
            {completedStops}/{stops.length || 0} stops complete
          </span>
          {truckPosition ? (
            <span className="rounded-full bg-brand-50 px-3 py-2 text-brand-700">
              {formatNumber(truckPosition.lat, { maximumFractionDigits: 3 })},{' '}
              {formatNumber(truckPosition.lng, { maximumFractionDigits: 3 })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-2">Planned route</span>
          <span className="rounded-full bg-freight-50 px-3 py-2 text-freight-700">
            Live trail
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-2 text-brand-700">
            Current truck
          </span>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100">
          <MapContainer
            center={INDIA_CENTER}
            className="h-[26rem] w-full"
            scrollWheelZoom={false}
            zoom={5}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={boundsPoints} />

            <RoutePolyline
              color="#0f766e"
              completedIndex={Math.max(0, completedStops - 1)}
              coordinates={plannedCoordinates}
              dashedColor="#94a3b8"
              weight={4}
            />

            {liveTrail.length >= 2 ? (
              <RoutePolyline
                color="#b45309"
                coordinates={liveTrail}
                dashedColor="#b45309"
                showDashedRemaining={false}
                weight={5}
              />
            ) : null}

            {stops.map((stop) => (
              <StopMarker
                key={stop.id || `${stop.type}-${stop.sequence}`}
                city={stop.city}
                estimatedArrival={stop.estimatedArrival}
                position={{ lat: stop.lat, lng: stop.lng }}
                sequenceOrder={stop.sequence}
                status={stop.status}
                type={stop.type}
              />
            ))}

            <TruckMarker
              heading={truckPosition?.heading}
              position={truckPosition}
              recordedAt={truckPosition?.recordedAt}
              registrationNo={trip?.truck?.registrationNo}
              speed={truckPosition?.speed}
            />
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
