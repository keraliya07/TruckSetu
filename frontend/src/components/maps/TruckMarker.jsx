import { formatDistanceToNow } from 'date-fns';
import L from 'leaflet';
import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';

function createTruckIcon(heading = 0) {
  return L.divIcon({
    className: 'stlos-truck-icon-wrapper',
    html: `
      <div class="stlos-truck-icon" style="transform: rotate(${heading}deg);">
        <span class="stlos-truck-pulse"></span>
        <span class="stlos-truck-glyph">T</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

export default function TruckMarker({
  position,
  heading = 0,
  speed,
  registrationNo,
  recordedAt,
}) {
  const icon = useMemo(() => createTruckIcon(heading), [heading]);

  if (position?.lat == null || position?.lng == null) {
    return null;
  }

  return (
    <Marker icon={icon} position={[position.lat, position.lng]}>
      <Popup>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-900">
            {registrationNo ? `Truck ${registrationNo}` : 'Active truck'}
          </p>
          <p className="text-slate-600">Heading {Math.round(heading || 0)}°</p>
          <p className="text-slate-600">
            Speed {speed != null ? `${Number(speed).toFixed(1)} km/h` : 'Unavailable'}
          </p>
          <p className="text-slate-500">
            {recordedAt
              ? `Updated ${formatDistanceToNow(new Date(recordedAt), { addSuffix: true })}`
              : 'Live location'}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
