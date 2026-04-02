import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const { authApiMocks, useAuthMock } = vi.hoisted(() => ({
  authApiMocks: {
    getSessions: vi.fn(),
    revokeOtherSessions: vi.fn(),
    revokeSession: vi.fn(),
    sendVerificationEmail: vi.fn(),
  },
  useAuthMock: vi.fn(),
}));

vi.mock('../../api/auth.api', () => authApiMocks);

vi.mock('../../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

import AccountSecurityPage from './AccountSecurityPage';

const sessions = [
  {
    id: 'session-current',
    isCurrent: true,
    userAgent: 'Chrome on Windows',
    ipAddress: '127.0.0.1',
    createdAt: '2026-04-01T10:00:00.000Z',
    lastUsedAt: '2026-04-02T08:00:00.000Z',
    expiresAt: '2026-05-02T08:00:00.000Z',
  },
  {
    id: 'session-other',
    isCurrent: false,
    userAgent: 'Safari on iPhone',
    ipAddress: '10.0.0.2',
    createdAt: '2026-03-31T09:00:00.000Z',
    lastUsedAt: '2026-04-01T20:00:00.000Z',
    expiresAt: '2026-05-01T20:00:00.000Z',
  },
];

describe('AccountSecurityPage', () => {
  test('loads sessions and can revoke other sessions', async () => {
    useAuthMock.mockReturnValue({
      user: { name: 'Phase 2 User', isEmailVerified: false },
      fetchProfile: vi.fn(),
      logout: vi.fn(),
    });
    authApiMocks.getSessions
      .mockResolvedValueOnce({ sessions })
      .mockResolvedValueOnce({ sessions: [sessions[0]] });
    authApiMocks.revokeOtherSessions.mockResolvedValue({
      message: 'Other sessions revoked.',
    });

    render(
      <MemoryRouter>
        <AccountSecurityPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Chrome on Windows')).toBeInTheDocument();
    expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Revoke other sessions' }));

    expect(await screen.findByText('Other sessions revoked.')).toBeInTheDocument();
    await waitFor(() => {
      expect(authApiMocks.getSessions).toHaveBeenCalledTimes(2);
    });
  });
});
