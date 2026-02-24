import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppShell } from '@/features/sentra/components/AppShell';
import { clearAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

function makeToken(expOffsetSeconds: number): string {
  const payload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.sig`;
}

describe('landing/auth flow', () => {
  it('opens auth when get started is clicked', async () => {
    window.history.pushState({}, '', '/');
    clearAccessToken();
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getAllByRole('button', { name: /get started/i })[0]);

    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('forces auth when app route is opened without a backend token', () => {
    window.history.pushState({}, '', '/chat');
    clearAccessToken();
    render(<AppShell initialView="app" />);
    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
    return waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('keeps app view for authenticated users', () => {
    window.history.pushState({}, '', '/chat');
    setAccessToken(makeToken(3600));
    render(<AppShell initialView="app" />);
    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/chat');
  });

  it('redirects authenticated users away from auth view', () => {
    window.history.pushState({}, '', '/login');
    setAccessToken(makeToken(3600));
    render(<AppShell initialView="auth" />);
    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
    return waitFor(() => {
      expect(window.location.pathname).toBe('/chat');
    });
  });

  it('navigates to sample-report route when sample is opened', async () => {
    window.history.pushState({}, '', '/');
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole('button', { name: /view sample report/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/sample-report');
    });
  });
});
