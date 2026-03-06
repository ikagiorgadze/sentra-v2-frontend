import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  beforeEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = false;
  });

  afterEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = undefined;
  });

  it('reopens a recent chat from sidebar and restores results', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const jobId = 'a0c68e3c-4865-4dc8-b2e7-6ed39dbdc002';
    let statusPollCount = 0;

    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      const method = input instanceof Request ? input.method.toUpperCase() : 'GET';

      if (url.endsWith('/v1/conversations') && method === 'GET') {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: conversationId,
                user_id: '11111111-1111-1111-1111-111111111111',
                title: 'Pension reform Romania',
                state: 'monitoring',
                active_proposal_version: 1,
                inserted_at: '2026-02-23T20:00:00Z',
                updated_at: '2026-02-23T20:00:05Z',
              },
            ],
            next_cursor: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/conversations/${conversationId}/snapshot`)) {
        return new Response(
          JSON.stringify({
            conversation: {
              id: conversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: 'Pension reform Romania',
              state: 'monitoring',
              active_proposal_version: 1,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:05Z',
            },
            messages: [
              {
                id: 'c80da9d4-bad6-4637-9ee6-ab6fef53e8ab',
                conversation_id: conversationId,
                role: 'user',
                content: 'Pension reform Romania',
                tool_trace_ref: null,
                inserted_at: '2026-02-23T20:00:00Z',
                updated_at: '2026-02-23T20:00:00Z',
              },
              {
                id: '6ccdbecf-d86f-4dc5-aeb6-fd35045fdb18',
                conversation_id: conversationId,
                role: 'assistant',
                content: 'Confirmed. Creating your monitoring job now.',
                tool_trace_ref: null,
                inserted_at: '2026-02-23T20:00:02Z',
                updated_at: '2026-02-23T20:00:02Z',
              },
            ],
            pending_proposal: null,
            active_job_id: jobId,
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
    await user.click(await screen.findByRole('button', { name: /pension reform romania.*monitoring/i }));

    await waitFor(() => {
      expect(screen.getByText(/executive key metrics/i)).toBeInTheDocument();
    }, { timeout: 4000 });

    expect(screen.getByRole('button', { name: /pension reform romania.*monitoring/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new investigation/i }));
    await user.click(screen.getByRole('button', { name: /pension reform romania.*monitoring/i }));

    expect(screen.getByText(/executive key metrics/i)).toBeInTheDocument();
  });

  it('shows completed/failed state badges consistently after selecting historical chat', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const completedConversationId = '10d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const failedConversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const completedJobId = 'a0c68e3c-4865-4dc8-b2e7-6ed39dbdc010';

    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      const method = input instanceof Request ? input.method.toUpperCase() : 'GET';

      if (url.endsWith('/v1/conversations') && method === 'GET') {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: completedConversationId,
                user_id: '11111111-1111-1111-1111-111111111111',
                title: 'Completed investigation',
                state: 'completed',
                active_proposal_version: 1,
                inserted_at: '2026-02-23T20:00:00Z',
                updated_at: '2026-02-23T20:00:05Z',
              },
              {
                id: failedConversationId,
                user_id: '11111111-1111-1111-1111-111111111111',
                title: 'Failed investigation',
                state: 'failed',
                active_proposal_version: 1,
                inserted_at: '2026-02-23T19:00:00Z',
                updated_at: '2026-02-23T19:00:05Z',
              },
            ],
            next_cursor: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith(`/v1/conversations/${completedConversationId}/snapshot`)) {
        return new Response(
          JSON.stringify({
            conversation: {
              id: completedConversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: 'Completed investigation',
              state: 'completed',
              active_proposal_version: 1,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:05Z',
            },
            messages: [
              {
                id: 'first-user-message',
                conversation_id: completedConversationId,
                role: 'user',
                content: 'Completed investigation',
                tool_trace_ref: null,
                inserted_at: '2026-02-23T20:00:00Z',
                updated_at: '2026-02-23T20:00:00Z',
              },
            ],
            pending_proposal: null,
            active_job_id: completedJobId,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith(`/v1/conversations/${failedConversationId}/snapshot`)) {
        return new Response(
          JSON.stringify({
            conversation: {
              id: failedConversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: 'Failed investigation',
              state: 'failed',
              active_proposal_version: 1,
              inserted_at: '2026-02-23T19:00:00Z',
              updated_at: '2026-02-23T19:00:05Z',
            },
            messages: [
              {
                id: 'failed-user-message',
                conversation_id: failedConversationId,
                role: 'assistant',
                content: 'Last run failed.',
                tool_trace_ref: null,
                inserted_at: '2026-02-23T19:00:05Z',
                updated_at: '2026-02-23T19:00:05Z',
              },
            ],
            pending_proposal: null,
            active_job_id: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${completedJobId}/overview`)) {
        return new Response(
          JSON.stringify({
            job_id: completedJobId,
            total_mentions: 10,
            sentiment_index: -10,
            engagement_rate: 1.2,
            dominant_theme: 'Economy',
            summary: 'Summary text',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${completedJobId}/sentiment-overview`)) {
        return new Response(
          JSON.stringify({ job_id: completedJobId, positive: 2, neutral: 3, negative: 5 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${completedJobId}/sentiment-timeseries`)) {
        return new Response(
          JSON.stringify({
            job_id: completedJobId,
            items: [{ date: '2026-02-23', positive: 2, neutral: 3, negative: 5 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={1} />);

    expect(await screen.findByRole('button', { name: /completed investigation.*completed/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /failed investigation.*failed/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /completed investigation.*completed/i }));
    await waitFor(() => {
      expect(screen.getByText(/executive key metrics/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /failed investigation.*failed/i }));
    await waitFor(() => {
      expect(screen.getByText(/last run failed\./i)).toBeInTheDocument();
    });
    expect(screen.getByText(/status:\s*failed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('restores pending reuse decision choices from snapshot payload', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '30d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const existingJobId = 'b0c68e3c-4865-4dc8-b2e7-6ed39dbdc111';

    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      const method = input instanceof Request ? input.method.toUpperCase() : 'GET';

      if (url.endsWith('/v1/conversations') && method === 'GET') {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: conversationId,
                user_id: '11111111-1111-1111-1111-111111111111',
                title: 'Reuse option pending',
                state: 'awaiting_confirmation',
                active_proposal_version: 1,
                inserted_at: '2026-02-23T20:00:00Z',
                updated_at: '2026-02-23T20:00:05Z',
              },
            ],
            next_cursor: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith(`/v1/conversations/${conversationId}/snapshot`)) {
        return new Response(
          JSON.stringify({
            conversation: {
              id: conversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: 'Reuse option pending',
              state: 'awaiting_confirmation',
              active_proposal_version: 1,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:05Z',
            },
            messages: [
              {
                id: 'first-user-message',
                conversation_id: conversationId,
                role: 'user',
                content: 'Pension reform Romania',
                tool_trace_ref: null,
                inserted_at: '2026-02-23T20:00:00Z',
                updated_at: '2026-02-23T20:00:00Z',
              },
            ],
            pending_proposal: {
              id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
              conversation_id: conversationId,
              version: 1,
              normalized_query: 'Sentiment around pension reform in Romania last 7 days',
              filters_json: { country: 'Romania', time_range: '7d', reuse_requested: true },
              reuse_candidates: [
                {
                  job_id: existingJobId,
                  query: 'Sentiment around pension reform in Romania last 7 days',
                  updated_at: '2026-02-23T20:00:00Z',
                  similarity_score: 0.97,
                },
              ],
              status: 'pending',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
            active_job_id: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={1} />);
    await user.click(await screen.findByRole('button', { name: /reuse option pending.*awaiting confirmation/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /use existing/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /start new/i })).toBeInTheDocument();
  });
});
