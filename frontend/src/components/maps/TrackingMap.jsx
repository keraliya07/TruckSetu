import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import RoutePolyline from './RoutePolyline';
import StopMarker from './StopMarker';
import TruckMarker from './TruckMarker';
import { findCity } from '../../data/logisticsOptions';
import { formatNumber } from '../../utils/formatters';

const INDIA_CENTER = [22.9734, 78.6569];

function isMissingCoordinate(lat, lng) {
  return lat == null || lng == null || (Number(lat) === 0 && Number(lng) === 0);
}

function resolvePosition(lat, lng, city) {
  if (!isMissingCoordinate(lat, lng)) {
    return { lat, lng };
  }

  const fallback = findCity(city);
  if (!fallback) {
    return null;
  }

  return { lat: fallback.lat, lng: fallback.lng };
}

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
  const normalizedStops = useMemo(
    () =>
      stops
        .map((stop) => {
          const position = resolvePosition(stop.lat, stop.lng, stop.city);
          return position
            ? {
                ...stop,
                lat: position.lat,
                lng: position.lng,
              }
            : stop;
        })
        .filter((stop) => !isMissingCoordinate(stop.lat, stop.lng)),
    [stops]
  );

  const normalizedTruckPosition = useMemo(() => {
    if (!truckPosition) {
      return null;
    }

    return resolvePosition(truckPosition.lat, truckPosition.lng, trip?.truck?.currentCity);
  }, [trip?.truck?.currentCity, truckPosition]);

  const plannedCoordinates = useMemo(
    () =>
      normalizedStops
        .filter((stop) => stop.lat != null && stop.lng != null)
        .map((stop) => [stop.lat, stop.lng]),
    [normalizedStops]
  );

  const liveTrail = useMemo(
    () =>
      locationHistory
        .filter((location) => !isMissingCoordinate(location.lat, location.lng))
        .map((location) => [location.lat, location.lng]),
    [locationHistory]
  );

  const boundsPoints = useMemo(() => {
    const next = [...plannedCoordinates, ...liveTrail];

    if (normalizedTruckPosition?.lat != null && normalizedTruckPosition?.lng != null) {
      next.push([normalizedTruckPosition.lat, normalizedTruckPosition.lng]);
    }

    return next;
  }, [liveTrail, normalizedTruckPosition?.lat, normalizedTruckPosition?.lng, plannedCoordinates]);

  const completedStops = normalizedStops.filter((stop) => stop.status === 'COMPLETED').length;

  return (
    <section className="relative flex h-[calc(100vh-10rem)] max-h-[900px] flex-col overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="absolute inset-0 top-0 h-48 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Route map</p>
          <h2 className="mt-1 font-heading text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">Live path</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-2">
            {completedStops}/{stops.length || 0} stops complete
          </span>
          {normalizedTruckPosition ? (
            <span className="rounded-full bg-freight-50 px-3 py-2 text-freight-700">
              {formatNumber(normalizedTruckPosition.lat, { maximumFractionDigits: 3 })},{' '}
              {formatNumber(normalizedTruckPosition.lng, { maximumFractionDigits: 3 })}
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
          <span className="rounded-full bg-freight-50 px-3 py-2 text-freight-700">
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

            {normalizedStops.map((stop) => (
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
              position={
                normalizedTruckPosition
                  ? {
                      ...(truckPosition || {}),
                      ...normalizedTruckPosition,
                    }
                  : null
              }
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
