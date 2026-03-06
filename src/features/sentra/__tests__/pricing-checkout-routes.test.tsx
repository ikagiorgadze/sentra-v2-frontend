import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { setAccessToken, clearAccessToken } from '@/lib/auth/tokenStorage';

import App from '@/App';

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

afterEach(() => {
  clearAccessToken();
});

describe('pricing and checkout routes', () => {
  it('renders pricing route with paid plan placeholder', () => {
    setAccessToken(makeToken(3600));
    window.history.pushState({}, '', '/pricing');
    render(<App />);

    expect(screen.getByRole('heading', { name: /paid plan/i })).toBeInTheDocument();
    expect(screen.getByText('$20/mo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue to checkout/i })).toBeInTheDocument();
  });

  it('navigates from pricing to checkout placeholder', async () => {
    setAccessToken(makeToken(3600));
    window.history.pushState({}, '', '/pricing');
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: /continue to checkout/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/checkout');
    });
    expect(screen.getByRole('heading', { name: /checkout placeholder/i })).toBeInTheDocument();
  });
});
