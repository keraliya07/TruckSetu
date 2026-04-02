import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

const { authApiMocks, useAuthMock } = vi.hoisted(() => ({
  authApiMocks: {
    sendVerificationEmail: vi.fn(),
    verifyEmail: vi.fn(),
  },
  useAuthMock: vi.fn(),
}));

vi.mock('../../api/auth.api', () => authApiMocks);

vi.mock('../../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

import VerifyEmailPage from './VerifyEmailPage';

describe('VerifyEmailPage', () => {
  test('verifies a token from the URL and refreshes the signed-in profile', async () => {
    const fetchProfileMock = vi.fn().mockResolvedValue({});

    useAuthMock.mockReturnValue({
      fetchProfile: fetchProfileMock,
      isAuthenticated: true,
      user: { isEmailVerified: false },
    });
    authApiMocks.verifyEmail.mockResolvedValue({
      message: 'Email verified successfully.',
    });

    render(
      <MemoryRouter initialEntries={['/verify-email?token=verify-token-1234567890']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Email verified successfully.')).toBeInTheDocument();
    expect(authApiMocks.verifyEmail).toHaveBeenCalledWith({
      token: 'verify-token-1234567890',
    });
    await waitFor(() => {
      expect(fetchProfileMock).toHaveBeenCalledTimes(1);
    });
  });

  test('creates a local verification link for signed-in users without a token', async () => {
    useAuthMock.mockReturnValue({
      fetchProfile: vi.fn(),
      isAuthenticated: true,
      user: { isEmailVerified: false },
    });
    authApiMocks.sendVerificationEmail.mockResolvedValue({
      message: 'Verification email queued.',
      devUrl: 'http://localhost:3000/verify-email?token=verify-token-1234567890',
      devToken: 'verify-token-1234567890',
    });

    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send verification link' }));

    expect(await screen.findByText('Verification email queued.')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open development verification link' })
    ).toHaveAttribute(
      'href',
      'http://localhost:3000/verify-email?token=verify-token-1234567890'
    );
    expect(screen.getByText('verify-token-1234567890')).toBeInTheDocument();
  });
});
