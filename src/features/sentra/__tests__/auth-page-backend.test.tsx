import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AuthPage } from '@/features/sentra/components/AuthPage';
import { clearAccessToken, getAccessToken } from '@/lib/auth/tokenStorage';

describe('AuthPage backend auth', () => {
  it('logs in via backend and stores access token', async () => {
    clearAccessToken();
    const user = userEvent.setup();
    const onAuthenticated = vi.fn();
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'backend.jwt.token',
          token_type: 'bearer',
          expires_in: 86400,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    render(<AuthPage onAuthenticate={onAuthenticated} />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).toContain('/v1/auth/login');
      expect(getAccessToken()).toBe('backend.jwt.token');
      expect(onAuthenticated).toHaveBeenCalled();
    });
  });

  it('does not render unsupported forgot-password control', () => {
    render(<AuthPage onAuthenticate={vi.fn()} />);
    expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
  });
});
