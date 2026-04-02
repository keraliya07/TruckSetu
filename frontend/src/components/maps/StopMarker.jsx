import L from 'leaflet';
import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';

const toneByType = {
  PICKUP: {
    base: '#0ea5e9',
    label: 'Pickup',
  },
  DELIVERY: {
    base: '#10b981',
    label: 'Delivery',
  },
};

function createStopIcon(type, status, sequenceOrder) {
  const tone = toneByType[type] || toneByType.DELIVERY;
  const isCompleted = status === 'COMPLETED';
  const background = isCompleted ? '#94a3b8' : tone.base;

  return L.divIcon({
    className: 'stlos-stop-icon-wrapper',
    html: `
      <div class="stlos-stop-icon" style="background:${background}; opacity:${isCompleted ? 0.75 : 1};">
        <span>${sequenceOrder}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export default function StopMarker({
  position,
  type,
  status,
  city,
  sequenceOrder,
  estimatedArrival,
}) {
  const icon = useMemo(
    () => createStopIcon(type, status, sequenceOrder),
    [sequenceOrder, status, type]
  );

  if (position?.lat == null || position?.lng == null) {
    return null;
  }

  const tone = toneByType[type] || toneByType.DELIVERY;

  return (
    <Marker icon={icon} position={[position.lat, position.lng]}>
      <Popup>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-slate-900">{city || `${tone.label} stop`}</p>
          <p className="text-slate-600">
            {tone.label} • Stop {sequenceOrder}
          </p>
          <p className="text-slate-600">Status {status}</p>
          {estimatedArrival ? (
            <p className="text-slate-500">ETA {new Date(estimatedArrival).toLocaleString()}</p>
          ) : null}
        </div>
      </Popup>
    </Marker>
  );
}
