import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const { forgotPasswordMock } = vi.hoisted(() => ({
  forgotPasswordMock: vi.fn(),
}));

vi.mock('../../api/auth.api', () => ({
  forgotPassword: forgotPasswordMock,
}));

import ForgotPasswordPage from './ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  test('submits an email and shows the local reset link', async () => {
    forgotPasswordMock.mockResolvedValue({
      message: 'Reset instructions generated for local development.',
      devUrl: 'http://localhost:3000/reset-password?token=reset-token-1234567890',
      devToken: 'reset-token-1234567890',
    });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'phase2@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset instructions' }));

    await waitFor(() => {
      expect(forgotPasswordMock).toHaveBeenCalledWith({
        email: 'phase2@example.com',
      });
    });
    expect(
      await screen.findByText('Reset instructions generated for local development.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open development reset link' })).toHaveAttribute(
      'href',
      'http://localhost:3000/reset-password?token=reset-token-1234567890'
    );
    expect(screen.getByText(/Token: reset-token-1234567890/)).toBeInTheDocument();
  });
});
