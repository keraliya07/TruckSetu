import { getDashboardPath } from './roleRoutes';

const roleNavigation = {
  WAREHOUSE: {
    quickLinks: [
      { label: 'Shipments', to: '/warehouse/shipments' },
      { label: 'Bookings', to: '/warehouse/bookings' },
      { label: 'Optimize', to: '/warehouse/optimization' },
    ],
    sections: [
      {
        title: 'Operate',
        items: [
          { key: 'dashboard', label: 'Dashboard', to: '/dashboard/warehouse', icon: 'dashboard' },
          { key: 'shipments', label: 'Shipment Board', to: '/warehouse/shipments', icon: 'shipments' },
          { key: 'create-shipment', label: 'Create Shipment', to: '/warehouse/shipments/new', icon: 'create' },
          { key: 'bookings', label: 'Bookings', to: '/warehouse/bookings', icon: 'bookings' },
          { key: 'optimization', label: 'Optimization', to: '/warehouse/optimization', icon: 'optimize' },
        ],
      },
    ],
  },
  DEALER: {
    quickLinks: [
      { label: 'Fleet', to: '/dealer/fleet' },
      { label: 'Bookings', to: '/dealer/bookings' },
      { label: 'Analytics', to: '/dealer/analytics' },
    ],
    sections: [
      {
        title: 'Operate',
        items: [
          { key: 'dashboard', label: 'Dashboard', to: '/dashboard/dealer', icon: 'dashboard' },
          { key: 'fleet', label: 'Fleet', to: '/dealer/fleet', icon: 'fleet' },
          { key: 'add-truck', label: 'Add Truck', to: '/dealer/fleet/new', icon: 'create' },
          { key: 'bookings', label: 'Booking Requests', to: '/dealer/bookings', icon: 'bookings' },
          { key: 'return-loads', label: 'Return Loads', to: '/dealer/return-loads', icon: 'returnLoads' },
          { key: 'analytics', label: 'Analytics', to: '/dealer/analytics', icon: 'analytics' },
        ],
      },
    ],
  },
  ADMIN: {
    quickLinks: [
      { label: 'Analytics', to: '/admin/analytics' },
      { label: 'Users', to: '/admin/users' },
      { label: 'Disputes', to: '/admin/disputes' },
    ],
    sections: [
      {
        title: 'Admin',
        items: [
          { key: 'dashboard', label: 'Dashboard', to: '/dashboard/admin', icon: 'dashboard' },
          { key: 'analytics', label: 'System Analytics', to: '/admin/analytics', icon: 'analytics' },
          { key: 'users', label: 'User Management', to: '/admin/users', icon: 'users' },
          { key: 'disputes', label: 'Disputes', to: '/admin/disputes', icon: 'alert' },
        ],
      },
    ],
  },
};

export function getQuickLinksForRole(role) {
  return roleNavigation[role]?.quickLinks || [];
}

export function getSectionsForRole(role) {
  return roleNavigation[role]?.sections || [];
}

export function getRoleLabel(role) {
  switch (role) {
    case 'WAREHOUSE':
      return 'Warehouse';
    case 'DEALER':
      return 'Truck Dealer';
    case 'ADMIN':
      return 'Admin';
    default:
      return 'Workspace';
  }
}

export function getPrimaryWorkspaceLink(role) {
  return getDashboardPath(role);
}
