// === frontend/src/components/common/StatusBadge.jsx ===
// Purpose: Color-coded status badge for shipments, trips, bookings
// Dependencies: clsx

/**
 * TODO: Implement StatusBadge component
 *
 * Purpose: Display a styled pill/badge showing entity status
 *
 * Steps:
 *   1. Map status string to color scheme:
 *      - DRAFT/PENDING → gray
 *      - OPTIMIZED/BOOKING_REQUESTED → blue
 *      - BOOKING_CONFIRMED/APPROVED → green
 *      - IN_TRANSIT/LOADING → amber/yellow with pulse animation
 *      - DELIVERED/COMPLETED → emerald
 *      - CANCELLED/REJECTED/EXPIRED → red
 *      - DISPUTED → orange
 *   2. Render pill with dot indicator + status text
 *
 * Props:
 *   @param {string} status — The status string
 *   @param {string} [size='sm'] — 'sm' | 'md'
 *   @param {boolean} [animate=false] — Pulse animation for active states
 *
 * @returns {JSX.Element}
 */

// export default function StatusBadge({ status, size = 'sm', animate = false }) {
//   // TODO: Implement status-to-color mapping and render badge
// }
