import { create } from 'zustand';

import * as shipmentApi from '../api/shipment.api';

const defaultFilters = {
  scope: 'active',
  status: '',
  search: '',
  page: 1,
  limit: 12,
};

const shipmentMatchesScope = (shipment, scope) => {
  if (!scope) {
    return true;
  }

  if (scope === 'active') {
    return ['PENDING', 'BOOKING_PENDING', 'BOOKING_CONFIRMED', 'LOADING', 'IN_TRANSIT'].includes(
      shipment.status
    );
  }

  if (scope === 'closed') {
    return ['DELIVERED', 'CANCELLED'].includes(shipment.status);
  }

  return true;
};

export const useShipmentStore = create((set, get) => ({
  shipments: [],
  total: 0,
  filters: defaultFilters,
  selectedIds: [],
  isLoading: false,
  error: null,
  fetchShipments: async (overrides = {}) => {
    const filters = { ...get().filters, ...overrides };
    set({ isLoading: true, error: null, filters });

    try {
      const result = await shipmentApi.getShipments(filters);
      set({
        shipments: result.shipments,
        total: result.total,
        filters,
        isLoading: false,
      });
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  createShipment: async (payload) => {
    set({ error: null });
    try {
      const shipment = await shipmentApi.createShipment(payload);
      set((state) => ({ shipments: [shipment, ...state.shipments] }));
      return shipment;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  batchUpdateStatus: async (payload) => {
    set({ error: null });
    try {
      const result = await shipmentApi.batchUpdateStatus(payload);
      set((state) => ({
        shipments: state.shipments
          .map((shipment) => {
            const updated = result.shipments.find((item) => item.id === shipment.id);
            return updated || shipment;
          })
          .filter((shipment) => shipmentMatchesScope(shipment, state.filters.scope)),
        selectedIds: [],
      }));
      return result;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  deleteShipment: async (id) => {
    set({ error: null });
    try {
      await shipmentApi.deleteShipment(id);
      set((state) => ({
        shipments: state.shipments.filter((shipment) => shipment.id !== id),
        selectedIds: state.selectedIds.filter((item) => item !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id],
    })),
  selectAllVisible: () =>
    set((state) => ({
      selectedIds: state.shipments.map((shipment) => shipment.id),
    })),
  clearSelection: () => set({ selectedIds: [] }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key === 'page' ? value : 1,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters, selectedIds: [] }),
}));
