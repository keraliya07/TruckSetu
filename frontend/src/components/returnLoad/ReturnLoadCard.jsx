// === frontend/src/components/returnLoad/ReturnLoadCard.jsx ===
// Purpose: Card showing a single return load match opportunity for dealer
// Dependencies: ../common/ScoreBar, ../common/StatusBadge, date-fns

/**
 * TODO: Implement ReturnLoadCard component
 *
 * Visual:
 *   ┌─────────────────────────────────────────┐
 *   │ 🔄 Return Load Match                    │
 *   │ Shipment: 1,200 kg from Nashik → Mumbai │
 *   │ Score: 82.5 / 100                        │
 *   │ Proximity: 92 | Direction: 78 | Fill: 65│
 *   │ Pickup distance: 12 km from current loc  │
 *   │ Expires in: 3h 15m                       │
 *   │ [Accept] [Reject]                        │
 *   └─────────────────────────────────────────┘
 *
 * Props:
 *   @param {object} match — { id, shipment, proximityScore, directionScore, utilizationScore, combinedScore, expiresAt }
 *   @param {function} onAccept
 *   @param {function} onReject
 *
 * @returns {JSX.Element}
 */

// export default function ReturnLoadCard({ match, onAccept, onReject }) {
//   // TODO: Implement return load match card
// }
