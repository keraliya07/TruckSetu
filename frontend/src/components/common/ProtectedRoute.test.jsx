import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

import ProtectedRoute from './ProtectedRoute';

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <div>Private workspace</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  test('shows the bootstrap loader while auth state is restoring', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isBootstrapping: true,
    });

    renderProtectedRoute();

    expect(screen.getByText('Restoring session...')).toBeInTheDocument();
  });

  test('redirects unauthenticated users to login', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isBootstrapping: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('renders protected content for authenticated users', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isBootstrapping: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Private workspace')).toBeInTheDocument();
  });
});
