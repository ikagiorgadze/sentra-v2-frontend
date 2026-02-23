import { render, screen } from '@testing-library/react';
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
    clearAccessToken();
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getAllByRole('button', { name: /get started/i })[0]);

    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
  });

  it('forces auth when app route is opened without a backend token', () => {
    clearAccessToken();
    render(<AppShell initialView="app" />);
    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
  });

  it('keeps app view for authenticated users', () => {
    setAccessToken(makeToken(3600));
    render(<AppShell initialView="app" />);
    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
  });
});
