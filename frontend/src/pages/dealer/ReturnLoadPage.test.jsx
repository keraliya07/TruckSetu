import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

const { useReturnLoadMock } = vi.hoisted(() => ({
  useReturnLoadMock: vi.fn(),
}));

vi.mock('../../hooks/useReturnLoad', () => ({
  useReturnLoad: useReturnLoadMock,
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Dealer', role: 'DEALER' },
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}));

vi.mock('../../hooks/useSocket', () => ({
  useSocket: () => ({
    isConnected: true,
    socket: null,
  }),
}));

vi.mock('../../components/common/DashboardShell', () => ({
  default: ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

import ReturnLoadPage from './ReturnLoadPage';

describe('ReturnLoadPage', () => {
  test('renders matches and triggers accept flow', async () => {
    const acceptMatch = vi.fn().mockResolvedValue(undefined);
    const rejectMatch = vi.fn().mockResolvedValue(undefined);

    useReturnLoadMock.mockReturnValue({
      acceptedResult: null,
      acceptMatch,
      error: '',
      hasNewMatches: true,
      isLoading: false,
      matches: [
        {
          id: 'match-1',
          status: 'PENDING',
          shipmentId: 'shipment-1',
          proximityScore: 82,
          directionScore: 74,
          utilizationScore: 69,
          combinedScore: 77,
          pickupDistanceKm: 12,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          shipment: {
            title: 'Surat backhaul',
            weightKg: 1800,
            originCity: 'Surat',
            originAddress: 'Surat Hub',
            destCity: 'Ahmedabad',
            deadline: new Date(Date.now() + 86400000).toISOString(),
            warehouse: {
              warehouseName: 'Central Warehouse',
            },
          },
          trip: {
            id: 'trip-1',
            truck: {
              registrationNo: 'GJ05STLOS1001',
              dealer: {
                companyName: 'STLOS Dealer',
              },
            },
            stops: [
              { sequence: 2, city: 'Surat' },
            ],
          },
        },
      ],
      rejectMatch,
      setHasNewMatches: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dealer/return-loads?tripId=trip-1']}>
        <Routes>
          <Route path="/dealer/return-loads" element={<ReturnLoadPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Return load opportunities')).toBeInTheDocument();
    expect(screen.getByText('Surat backhaul')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Accept return load' }));
    expect(acceptMatch).toHaveBeenCalledWith('match-1');
  });
});
