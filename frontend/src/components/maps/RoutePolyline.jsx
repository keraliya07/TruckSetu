import { Polyline } from 'react-leaflet';

function normalizeCoordinates(coordinates = []) {
  return coordinates
    .map((coordinate) => {
      if (Array.isArray(coordinate)) {
        return coordinate.length === 2 ? coordinate : null;
      }

      if (coordinate?.lat != null && coordinate?.lng != null) {
        return [coordinate.lat, coordinate.lng];
      }

      return null;
    })
    .filter(Boolean);
}

export default function RoutePolyline({
  coordinates,
  completedIndex = -1,
  color = '#2563eb',
  weight = 4,
  dashedColor = '#94a3b8',
  showDashedRemaining = true,
}) {
  const points = normalizeCoordinates(coordinates);

  if (points.length < 2) {
    return null;
  }

  const clampedCompletedIndex = Math.min(points.length - 1, Math.max(-1, completedIndex));
  const completedPoints =
    !showDashedRemaining && clampedCompletedIndex < 0
      ? points
      : clampedCompletedIndex >= 1
        ? points.slice(0, clampedCompletedIndex + 1)
        : [];
  const remainingPoints =
    clampedCompletedIndex >= 0 ? points.slice(clampedCompletedIndex) : points;

  return (
    <>
      {showDashedRemaining && remainingPoints.length >= 2 ? (
        <Polyline
          pathOptions={{
            color: dashedColor,
            dashArray: '6 10',
            opacity: 0.75,
            weight,
          }}
          positions={remainingPoints}
        />
      ) : null}

      {completedPoints.length >= 2 ? (
        <Polyline
          pathOptions={{
            color,
            opacity: 0.95,
            weight: weight + 1,
          }}
          positions={completedPoints}
        />
      ) : null}
    </>
  );
}
