// === frontend/src/components/maps/StopMarker.jsx ===
// Purpose: Pickup/delivery stop markers with status indicators
// Dependencies: react-leaflet (Marker, Popup), leaflet

/**
 * TODO: Implement StopMarker component
 *
 * Props:
 *   @param {{ lat: number, lng: number }} position
 *   @param {'PICKUP'|'DELIVERY'} type — Blue for pickup, green for delivery
 *   @param {'PENDING'|'EN_ROUTE'|'ARRIVED'|'COMPLETED'} status
 *   @param {string} city — City name for popup
 *   @param {number} sequenceOrder — Stop number (1, 2, 3...)
 *   @param {string} [estimatedArrival] — ETA string
 *
 * Visual:
 *   - Numbered circle marker (1, 2, 3...)
 *   - Color: blue (pickup) or green (delivery)
 *   - Opacity: 1.0 (pending/en_route), 0.5 (completed)
 *   - Popup shows: city, type, status, ETA
 *
 * @returns {JSX.Element}
 */

// export default function StopMarker({ position, type, status, city, sequenceOrder, estimatedArrival }) {
//   // TODO: Implement stop marker
// }
