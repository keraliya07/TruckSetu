import { getDashboardPath } from './roleRoutes';

const roleNavigation = {
  WAREHOUSE: {
    sections: [
      {
        title: 'Operate',
        items: [
          { key: 'shipments', label: 'Shipment Board', to: '/warehouse/shipments', icon: 'shipments' },
          { key: 'shipment-history', label: 'Shipment History', to: '/warehouse/shipments/history', icon: 'shipments' },
          { key: 'create-shipment', label: 'Dispatch Workspace', to: '/warehouse/shipments/new', icon: 'create' },
          { key: 'bookings', label: 'Bookings', to: '/warehouse/bookings', icon: 'bookings' },
          { key: 'truck-estimation', label: 'Truck Estimation', to: '/warehouse/truck-estimation', icon: 'fleet' },
        ],
      },
    ],
  },
  DEALER: {
    sections: [
      {
        title: 'Operate',
        items: [
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
    sections: [
      {
        title: 'Admin',
        items: [
          { key: 'analytics', label: 'System Analytics', to: '/admin/analytics', icon: 'analytics' },
          { key: 'users', label: 'User Management', to: '/admin/users', icon: 'users' },
          { key: 'analyst-management', label: 'Analyst Management', to: '/admin/analysts', icon: 'users', end: true },
          { key: 'add-analyst', label: 'Add Analyst', to: '/admin/analysts/new', icon: 'create' },
        ],
      },
    ],
  },
  ANALYST: {
    sections: [
      {
        title: 'Insights',
        items: [
          { key: 'analytics', label: 'System Analytics', to: '/admin/analytics', icon: 'analytics' },
          { key: 'users', label: 'User Directory', to: '/admin/users', icon: 'users' },
        ],
      },
    ],
  },
};

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
    case 'ANALYST':
      return 'Analyst';
    default:
      return 'Workspace';
  }
}

export function getPrimaryWorkspaceLink(role) {
  return getDashboardPath(role);
}

export function getPrimaryWorkspaceLabel(role) {
  switch (role) {
    case 'WAREHOUSE':
      return 'Shipment Board';
    case 'DEALER':
      return 'Fleet';
    case 'ADMIN':
      return 'System Analytics';
    case 'ANALYST':
      return 'System Analytics';
    default:
      return 'Workspace';
  }
}
