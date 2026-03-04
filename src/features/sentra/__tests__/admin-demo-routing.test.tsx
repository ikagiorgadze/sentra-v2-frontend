import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from '@/App';
import { clearAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

function makeToken(role: string, expOffsetSeconds = 3600): string {
  const payload = {
    sub: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    role,
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.sig`;
}

describe('admin demo routing', () => {
  it('allows admin token users to open /admin/demo', async () => {
    clearAccessToken();
    setAccessToken(makeToken('admin'));
    window.history.pushState({}, '', '/admin/demo');

    render(<App />);

    expect(await screen.findByLabelText(/scenario/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/admin/demo');
  });

  it('allows non-admin users to open /admin/demo', async () => {
    clearAccessToken();
    setAccessToken(makeToken('user'));
    window.history.pushState({}, '', '/admin/demo');

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/admin/demo');
    });
    expect(await screen.findByLabelText(/scenario/i)).toBeInTheDocument();
  });

  it('opens admin demo immediately when clicking demo from /chat', async () => {
    clearAccessToken();
    setAccessToken(makeToken('admin'));
    window.history.pushState({}, '', '/chat');
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^demo$/i }));

    expect(window.location.pathname).toBe('/admin/demo');
    expect(await screen.findByLabelText(/scenario/i)).toBeInTheDocument();
  });
});
