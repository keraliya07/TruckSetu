// === frontend/src/components/tracking/StopStatusList.jsx ===
// Purpose: Ordered vertical list of trip stops with status indicators
// Dependencies: ../common/StatusBadge, date-fns

/**
 * TODO: Implement StopStatusList component
 *
 * Purpose: Show all stops in order with completion status
 *
 * Props:
 *   @param {array} stops — [{ id, city, type, status, sequenceOrder, estimatedArrival, arrivedAt }]
 *   @param {function} [onCompleteStop] — Dealer action to mark stop as completed
 *
 * Visual: Vertical timeline with connected dots
 *   ● Mumbai (Pickup)     — Completed at 10:30 AM     ✅
 *   │
 *   ● Pune (Delivery)     — Arrived at 1:15 PM        ✅
 *   │
 *   ◉ Nashik (Delivery)   — ETA: 3:45 PM              🔵 [Mark Complete]
 *   │
 *   ○ Surat (Delivery)    — ETA: 6:30 PM              ⬜
 *
 * @returns {JSX.Element}
 */

// export default function StopStatusList({ stops, onCompleteStop }) {
//   // TODO: Implement vertical stop timeline
// }
