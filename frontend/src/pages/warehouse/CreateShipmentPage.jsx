// === frontend/src/pages/warehouse/CreateShipmentPage.jsx ===
// Purpose: Form to create a new shipment
// Dependencies: react-hook-form, zod, ../../api/shipment.api, leaflet

/**
 * TODO: Implement CreateShipmentPage
 *
 * Form fields:
 *   - Weight (kg): number, required, min 1
 *   - Volume (m³): number, required, min 0.01
 *   - Box Count: number, default 1
 *   - Destination City: dropdown/autocomplete from supported cities
 *   - Destination coordinates: auto-fill from city or click on map
 *   - Deadline: datetime picker, must be future date
 *   - Fragile: checkbox
 *   - Hazardous: checkbox
 *   - Priority: radio (Normal / High / Urgent)
 *   - Special Instructions: textarea
 *
 * Map: Mini Leaflet map to confirm destination location
 * Origin: Auto-filled from user's warehouse details
 *
 * On submit: call shipmentApi.createShipment → redirect to ShipmentDetailPage
 *
 * @returns {JSX.Element}
 */

// export default function CreateShipmentPage() {
//   // TODO: Implement shipment creation form
// }
