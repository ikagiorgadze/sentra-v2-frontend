import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

describe('investigation history', () => {
  it('adds completed query to sidebar and reopens it when selected', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    const job = {
      id: 'a0c68e3c-4865-4dc8-b2e7-6ed39dbdc002',
      query: 'Pension reform Romania',
      status: 'queued',
      inserted_at: '2026-02-23T10:00:00Z',
      updated_at: '2026-02-23T10:00:00Z',
    };
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(job), { status: 201, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...job, status: 'running' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...job, status: 'completed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    render(<AppShell initialView="app" processingDelayMs={1} />);

    await user.type(screen.getByRole('textbox'), 'Pension reform Romania');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
    }, { timeout: 4000 });

    expect(screen.getByRole('button', { name: /pension reform romania/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new investigation/i }));
    await user.click(screen.getByRole('button', { name: /pension reform romania/i }));

    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
  });
});
