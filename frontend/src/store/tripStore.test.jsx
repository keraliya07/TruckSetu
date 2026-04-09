import { beforeEach, describe, expect, test, vi } from 'vitest';

const { tripApiMocks } = vi.hoisted(() => ({
  tripApiMocks: {
    completeStop: vi.fn(),
    getTripById: vi.fn(),
    getTrips: vi.fn(),
    startTrip: vi.fn(),
  },
}));

vi.mock('../api/trip.api', () => tripApiMocks);

import { useTripStore } from './tripStore';

function resetStore() {
  useTripStore.setState({
    trips: [],
    total: 0,
    activeTrip: null,
    truckLocation: null,
    locationHistory: [],
    stops: [],
    isLoading: false,
    error: null,
  });
}

describe('useTripStore realtime state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  test('fetchTripById hydrates trip, stops, truck position, and location history', async () => {
    tripApiMocks.getTripById.mockResolvedValue({
      id: 'trip-1',
      truck: {
        registrationNo: 'GJ05TEST1001',
        currentLat: 22.8,
        currentLng: 72.4,
      },
      stops: [
        { id: 'stop-2', sequence: 2, status: 'PENDING' },
        { id: 'stop-1', sequence: 1, status: 'COMPLETED' },
      ],
      locations: [
        {
          id: 'loc-2',
          tripId: 'trip-1',
          lat: 22.8,
          lng: 72.4,
          recordedAt: '2026-04-02T10:00:00.000Z',
        },
        {
          id: 'loc-1',
          tripId: 'trip-1',
          lat: 22.9,
          lng: 72.5,
          recordedAt: '2026-04-02T09:50:00.000Z',
        },
      ],
    });

    await useTripStore.getState().fetchTripById('trip-1');

    const state = useTripStore.getState();
    expect(state.activeTrip.id).toBe('trip-1');
    expect(state.stops.map((stop) => stop.id)).toEqual(['stop-1', 'stop-2']);
    expect(state.truckLocation.lat).toBe(22.8);
    expect(state.locationHistory.map((location) => location.id)).toEqual([
      'loc-1',
      'loc-2',
    ]);
  });

  test('updateTruckLocation appends live points for the active trip', () => {
    useTripStore.setState({
      activeTrip: {
        id: 'trip-1',
        truck: {
          registrationNo: 'GJ05TEST1001',
          currentLat: 23.02,
          currentLng: 72.57,
        },
        locations: [],
      },
      locationHistory: [],
      truckLocation: null,
    });

    useTripStore.getState().updateTruckLocation({
      id: 'loc-live',
      tripId: 'trip-1',
      lat: 21.74,
      lng: 72.15,
      speed: 52,
      heading: 160,
      recordedAt: '2026-04-02T11:00:00.000Z',
      source: 'SOCKET',
    });

    const state = useTripStore.getState();
    expect(state.truckLocation.lat).toBe(21.74);
    expect(state.locationHistory).toHaveLength(1);
    expect(state.locationHistory[0].id).toBe('loc-live');
    expect(state.activeTrip.locations[0].id).toBe('loc-live');
  });
});
