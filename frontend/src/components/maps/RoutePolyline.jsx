// === frontend/src/components/maps/RoutePolyline.jsx ===
// Purpose: Draw OSRM route geometry as a polyline on Leaflet map
// Dependencies: react-leaflet (Polyline), leaflet

/**
 * TODO: Implement RoutePolyline component
 *
 * Purpose: Render the OSRM route as a colored line on the map
 *
 * Steps:
 *   1. Convert OSRM geometry (encoded polyline or GeoJSON) to LatLng array
 *   2. Render react-leaflet Polyline with:
 *      - Completed portion: solid blue line
 *      - Remaining portion: dashed gray line
 *   3. Optionally show distance labels at midpoint
 *
 * Props:
 *   @param {array} coordinates — Array of [lat, lng] waypoints
 *   @param {number} [completedIndex] — Index of last completed waypoint (for progress)
 *   @param {string} [color='#3B82F6']
 *   @param {number} [weight=4]
 *
 * @returns {JSX.Element}
 */

// export default function RoutePolyline({ coordinates, completedIndex, color, weight }) {
//   // TODO: Render route polyline
// }
