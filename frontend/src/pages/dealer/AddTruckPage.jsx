// === frontend/src/pages/dealer/AddTruckPage.jsx ===
// Purpose: Form to register a new truck in the dealer's fleet
// Dependencies: react-hook-form, zod, ../../api/truck.api

/**
 * TODO: Implement AddTruckPage
 *
 * Form fields:
 *   - Registration Number: text, required, unique
 *   - Truck Type: dropdown (MINI_TRUCK, LCV, ICV, HEAVY, MULTI_AXLE, TRAILER, REFRIGERATED)
 *   - Max Weight (kg): number
 *   - Max Volume (m³): number
 *   - Emission Factor: number, default 2.68 kg CO2/liter
 *   - Fuel Efficiency: number, default varies by type (auto-suggest)
 *   - Current City: dropdown with auto-complete
 *
 * Auto-fill capacity suggestions based on truck type selection
 * On submit: truckApi.addTruck → redirect to FleetPage
 *
 * @returns {JSX.Element}
 */

// export default function AddTruckPage() {
//   // TODO: Implement add truck form
// }
