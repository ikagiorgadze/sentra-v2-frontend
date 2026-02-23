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

describe('jobs api lifecycle', () => {
  it('creates a backend job, polls status, and transitions to results', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const queuedJob = {
      id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
      query: 'Pension reform Romania',
      status: 'queued',
      inserted_at: '2026-02-23T10:00:00Z',
      updated_at: '2026-02-23T10:00:00Z',
      error_message: null,
    };
    const runningJob = { ...queuedJob, status: 'running' };
    const completedJob = { ...queuedJob, status: 'completed' };

    const fetchMock = vi.spyOn(global, 'fetch');
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify(queuedJob), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(runningJob), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(completedJob), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), queuedJob.query);
    await user.keyboard('{Enter}');

    expect(screen.getByText(/collecting public discourse/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls.some((url) => url.includes('/v1/jobs'))).toBe(true);
    expect(calledUrls.some((url) => url.includes(`/v1/jobs/${queuedJob.id}`))).toBe(true);
  });
});
