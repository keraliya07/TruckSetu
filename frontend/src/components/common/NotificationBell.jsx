// === frontend/src/components/common/NotificationBell.jsx ===
// Purpose: Bell icon with unread count badge, opens notification panel on click
// Dependencies: lucide-react, ../../store/notificationStore

/**
 * TODO: Implement NotificationBell component
 *
 * Purpose: Show notification bell icon with unread badge count
 *
 * Steps:
 *   1. Get unreadCount and togglePanel from notificationStore
 *   2. Render Bell icon from lucide-react
 *   3. If unreadCount > 0: show red badge with count (max display: "9+")
 *   4. On click: togglePanel() to show/hide notification dropdown
 *   5. Dropdown shows recent notifications with:
 *      - Icon per type (booking, trip, return load)
 *      - Title, message, time ago (date-fns formatDistanceToNow)
 *      - Click → navigate to notification.link
 *      - "Mark all read" button at top
 *
 * Props: none (reads from store)
 *
 * @returns {JSX.Element}
 */

// export default function NotificationBell() {
//   // TODO: Implement notification bell with dropdown
// }
