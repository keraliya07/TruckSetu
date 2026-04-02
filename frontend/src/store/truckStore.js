import { create } from 'zustand';

import * as truckApi from '../api/truck.api';

const defaultFilters = {
  status: '',
  page: 1,
  limit: 12,
};

export const useTruckStore = create((set, get) => ({
  trucks: [],
  total: 0,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  fetchTrucks: async (overrides = {}) => {
    const filters = { ...get().filters, ...overrides };
    set({ isLoading: true, error: null, filters });

    try {
      const result = await truckApi.getTrucks(filters);
      set({
        trucks: result.trucks,
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
  addTruck: async (payload) => {
    set({ error: null });
    try {
      const truck = await truckApi.addTruck(payload);
      set((state) => ({ trucks: [truck, ...state.trucks] }));
      return truck;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  updateTruckStatus: async (id, payload) => {
    set({ error: null });
    try {
      const truck = await truckApi.updateTruckStatus(id, payload);
      set((state) => ({
        trucks: state.trucks.map((item) => (item.id === id ? truck : item)),
      }));
      return truck;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  removeTruck: async (id) => {
    set({ error: null });
    try {
      await truckApi.deleteTruck(id);
      set((state) => ({
        trucks: state.trucks.filter((truck) => truck.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key === 'page' ? value : 1,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
