import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';

const { navigateMock, resetPasswordMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  resetPasswordMock: vi.fn(),
}));

vi.mock('../../api/auth.api', () => ({
  resetPassword: resetPasswordMock,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import ResetPasswordPage from './ResetPasswordPage';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads the token from the URL and resets the password', async () => {
    resetPasswordMock.mockResolvedValue({
      message: 'Password reset complete.',
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=reset-token-1234567890']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Reset token')).toHaveValue('reset-token-1234567890');

    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: 'reset-token-1234567890',
        password: 'Password123',
      });
    });

    expect(await screen.findByText('Password reset complete.')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
