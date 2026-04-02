export function getDashboardPath(role) {
  switch (role) {
    case 'WAREHOUSE':
      return '/dashboard/warehouse';
    case 'DEALER':
      return '/dashboard/dealer';
    case 'ADMIN':
      return '/dashboard/admin';
    default:
      return '/';
  }
}
