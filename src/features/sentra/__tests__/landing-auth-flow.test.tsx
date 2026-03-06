import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

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

function renderShell(props: Parameters<typeof AppShell>[0] = {}) {
  return render(
    <BrowserRouter>
      <AppShell {...props} />
    </BrowserRouter>,
  );
}

describe('landing/auth flow', () => {
  beforeEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = false;
  });

  afterEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = undefined;
    clearAccessToken();
  });

  it('opens auth when get started is clicked', async () => {
    window.history.pushState({}, '', '/');
    clearAccessToken();
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getAllByRole('button', { name: /get started/i })[0]);

    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('forces auth when app route is opened without a backend token', () => {
    window.history.pushState({}, '', '/chat');
    clearAccessToken();
    renderShell({ initialView: 'app' });
    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
    return waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('redirects authenticated users away from auth view', () => {
    window.history.pushState({}, '', '/login');
    setAccessToken(makeToken(3600));
    renderShell({ initialView: 'auth' });
    return waitFor(() => {
      expect(window.location.pathname).toBe('/request-history');
    });
  });

  it('redirects authenticated users from root route to request history', async () => {
    window.history.pushState({}, '', '/');
    setAccessToken(makeToken(3600));

    renderShell();

    await waitFor(() => {
      expect(window.location.pathname).toBe('/request-history');
    });
  });

  it('redirects to request history when sample is opened', async () => {
    window.history.pushState({}, '', '/about');
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('button', { name: /view sample report/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/request-history');
    });
  });

  it('prefills landing query input when example chip is clicked', async () => {
    window.history.pushState({}, '', '/');
    clearAccessToken();
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('button', { name: /track pension reform sentiment in romania this week/i }));

    expect(screen.getByRole('textbox', { name: /query/i })).toHaveValue(
      'Track pension reform sentiment in Romania this week',
    );
  });

  it('redirects to request history after authentication', async () => {
    window.history.pushState({}, '', '/');
    clearAccessToken();
    const user = userEvent.setup();

    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('/v1/auth/login')) {
        return new Response(
          JSON.stringify({
            access_token: makeToken(3600),
            token_type: 'bearer',
            expires_in: 3600,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    renderShell();

    const queryInput = screen.getByRole('textbox', { name: /query/i });
    await user.type(queryInput, 'Track pension reform sentiment in Romania this week');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByRole('heading', { name: /sign in to continue/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/request-history');
    });
  });
});
