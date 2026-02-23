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

describe('right panel', () => {
  it('expands and collapses advanced filters panel', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    render(<AppShell initialView="app" />);

    const toggle = screen.getByRole('button', { name: /toggle filters panel/i });

    await user.click(toggle);
    expect(screen.getByText(/advanced filters/i)).toBeInTheDocument();

    await user.click(toggle);
    expect(screen.queryByText(/advanced filters/i)).not.toBeInTheDocument();
  });
});
