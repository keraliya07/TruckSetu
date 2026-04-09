export function getDashboardPath(role) {
  switch (role) {
    case 'WAREHOUSE':
      return '/warehouse/shipments';
    case 'DEALER':
      return '/dealer/fleet';
    case 'ADMIN':
      return '/admin/analytics';
    case 'ANALYST':
      return '/admin/analytics';
    default:
      return '/';
  }
}
