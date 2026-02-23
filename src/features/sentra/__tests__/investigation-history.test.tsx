import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/features/sentra/components/AppShell';
import { clearAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

function makeToken(expOffsetSeconds: number): string {
  const payload = {
    sub: '11111111-1111-1111-1111-111111111111',
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

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const jobId = 'a0c68e3c-4865-4dc8-b2e7-6ed39dbdc002';
    let statusPollCount = 0;

    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith('/v1/conversations')) {
        return new Response(
          JSON.stringify({
            id: conversationId,
            user_id: '11111111-1111-1111-1111-111111111111',
            title: null,
            state: 'collecting_intent',
            active_proposal_version: 0,
            inserted_at: '2026-02-23T20:00:00Z',
            updated_at: '2026-02-23T20:00:00Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/conversations/${conversationId}/messages`)) {
        return new Response(
          JSON.stringify({
            conversation: {
              id: conversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: null,
              state: 'awaiting_confirmation',
              active_proposal_version: 1,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:00Z',
            },
            assistant_message: {
              id: '3b15995c-fcbf-4d84-966d-eecf4e5393ac',
              conversation_id: conversationId,
              role: 'assistant',
              content: 'Please confirm this query before I create the job.',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
            pending_proposal: {
              id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
              conversation_id: conversationId,
              version: 1,
              normalized_query: 'Pension reform Romania',
              filters_json: { country: 'Romania', time_range: '7d' },
              status: 'pending',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/conversations/${conversationId}/confirm-job`)) {
        return new Response(
          JSON.stringify({
            conversation_id: conversationId,
            proposal_id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
            job_id: jobId,
            status: 'queued',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${jobId}`)) {
        statusPollCount += 1;
        const status = statusPollCount >= 2 ? 'completed' : 'running';
        return new Response(
          JSON.stringify({
            id: jobId,
            query: 'Pension reform Romania',
            status,
            inserted_at: '2026-02-23T20:00:02Z',
            updated_at: '2026-02-23T20:00:03Z',
            error_message: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${jobId}/overview`)) {
        return new Response(
          JSON.stringify({
            job_id: jobId,
            total_mentions: 10,
            sentiment_index: -10,
            engagement_rate: 1.2,
            dominant_theme: 'Economy',
            summary: 'Summary text',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${jobId}/sentiment-overview`)) {
        return new Response(
          JSON.stringify({ job_id: jobId, positive: 2, neutral: 3, negative: 5 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${jobId}/sentiment-timeseries`)) {
        return new Response(
          JSON.stringify({
            job_id: jobId,
            items: [{ date: '2026-02-23', positive: 2, neutral: 3, negative: 5 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={1} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'Pension reform Romania');
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
    }, { timeout: 4000 });

    expect(screen.getByRole('button', { name: /pension reform romania/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new investigation/i }));
    await user.click(screen.getByRole('button', { name: /pension reform romania/i }));

    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
  });
});
