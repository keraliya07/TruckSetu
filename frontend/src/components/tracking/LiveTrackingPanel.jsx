// === frontend/src/components/tracking/LiveTrackingPanel.jsx ===
// Purpose: Right-side panel showing trip info, ETA, and stop list during live tracking
// Dependencies: ./StopStatusList, ./ETADisplay, ./TripProgressBar

/**
 * TODO: Implement LiveTrackingPanel component
 *
 * Purpose: Side panel alongside the tracking map with trip details
 *
 * Layout:
 *   ┌──────────────────────────┐
 *   │ Trip #ABC123             │
 *   │ 🚛 MH-12-AB-1234        │
 *   │ Status: IN_TRANSIT       │
 *   ├──────────────────────────┤
 *   │ TripProgressBar          │
 *   │ [===●==========] 35%    │
 *   ├──────────────────────────┤
 *   │ Next Stop ETA: 2h 15m   │
 *   │ Final ETA: 8h 30m       │
 *   ├──────────────────────────┤
 *   │ StopStatusList           │
 *   │  ✅ Mumbai (Pickup)      │
 *   │  ✅ Pune (Delivery)      │
 *   │  🔵 Nashik (Delivery)   │  ← Current
 *   │  ⬜ Surat (Delivery)    │
 *   └──────────────────────────┘
 *
 * Props:
 *   @param {object} trip — Full trip object
 *   @param {array} stops — Ordered stops with statuses
 *   @param {{ nextStop: Date, finalStop: Date }} eta
 *   @param {number} progressPercent
 *
 * @returns {JSX.Element}
 */

// export default function LiveTrackingPanel({ trip, stops, eta, progressPercent }) {
//   // TODO: Implement tracking side panel
// }
