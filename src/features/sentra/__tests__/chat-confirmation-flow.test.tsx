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

describe('chat confirmation flow', () => {
  beforeEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = false;
  });

  afterEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = undefined;
  });

  it('shows confirm card and only creates job after explicit confirm', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const jobId = '120d6e13-9f74-42bb-9fff-395a7f4f5f00';
    let statusPollCount = 0;

    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
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
              normalized_query: 'Sentiment around pension reform in Romania last 7 days',
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
        const isCompleted = statusPollCount >= 2;
        return new Response(
          JSON.stringify({
            id: jobId,
            query: 'Sentiment around pension reform in Romania last 7 days',
            status: isCompleted ? 'completed' : 'running',
            inserted_at: '2026-02-23T20:00:02Z',
            updated_at: '2026-02-23T20:00:03Z',
            error_message: null,
            stage_code: isCompleted ? 'completed' : 'sentiment',
            stage_label: isCompleted ? 'Completed' : 'Sentiment',
            progress: isCompleted
              ? {
                  overall: {
                    current_stage_code: 'completed',
                    stages_completed: 5,
                    stages_total: 5,
                  },
                  stages: {
                    sentiment: {
                      posts_total: 2,
                      posts_done: 2,
                      comments_total: 4,
                      comments_done: 4,
                    },
                  },
                }
              : {
                  overall: {
                    current_stage_code: 'sentiment',
                    stages_completed: 2,
                    stages_total: 5,
                  },
                  stages: {
                    sentiment: {
                      posts_total: 2,
                      posts_done: 1,
                      comments_total: 4,
                      comments_done: 2,
                    },
                  },
                },
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

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'Track pension reform sentiment in Romania for the last 7 days');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/confirm query/i)).toBeInTheDocument();
    });

    const beforeConfirm = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(beforeConfirm.some((url) => url.includes('/confirm-job'))).toBe(false);

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      const called = fetchMock.mock.calls.map((call) => String(call[0]));
      expect(called.some((url) => url.includes('/confirm-job'))).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByText(/Overall: 2\/5 stages/i)).toBeInTheDocument();
      expect(screen.getByText(/Sentiment: posts 1\/2, comments 2\/4/i)).toBeInTheDocument();
    });
  });

  it('does not auto-confirm from typed acknowledgement while proposal is pending', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '3e26c319-913d-4bc3-990b-b6678f8b0351';
    const jobId = 'ac4c09f5-0df5-4720-bbcf-c8f3f6fef097';

    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
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
              id: 'd74cf106-9f81-4f31-b6b4-54f133f6eb9f',
              conversation_id: conversationId,
              role: 'assistant',
              content: 'Please confirm this query before I create the job.',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
            pending_proposal: {
              id: 'f27f0f4a-cf2f-4f3e-b57a-9b50a277ba7a',
              conversation_id: conversationId,
              version: 1,
              normalized_query: 'Sentiment around bank of georgia on facebook last week',
              filters_json: { country: 'Georgia', time_range: '7d' },
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
            proposal_id: 'f27f0f4a-cf2f-4f3e-b57a-9b50a277ba7a',
            job_id: jobId,
            status: 'queued',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${jobId}`)) {
        return new Response(
          JSON.stringify({
            id: jobId,
            query: 'Sentiment around bank of georgia on facebook last week',
            status: 'running',
            inserted_at: '2026-02-23T20:00:02Z',
            updated_at: '2026-02-23T20:00:03Z',
            error_message: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'monitor bank of georgia on facebook last week');
    await user.keyboard('{Enter}');
    await screen.findByText(/confirm query/i);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'i confirm');
    await user.keyboard('{Enter}');

    const called = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(called.some((url) => url.includes('/confirm-job'))).toBe(false);
    expect(screen.getByText(/use the confirm query card to start the job/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^confirm$/i })).toBeInTheDocument();

    const messageCalls = called.filter((url) => url.includes(`/v1/conversations/${conversationId}/messages`));
    expect(messageCalls).toHaveLength(1);
  });

  it('lets user choose a similar completed job and loads existing results', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const existingJobId = 'a0c68e3c-4865-4dc8-b2e7-6ed39dbdc002';
    let confirmPayload: Record<string, unknown> | null = null;

    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
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
              content: 'I found similar completed jobs from your history. Choose one to reuse, or start a new job.',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
            pending_proposal: {
              id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
              conversation_id: conversationId,
              version: 1,
              normalized_query: 'Sentiment around pension reform in Romania last 7 days',
              filters_json: { country: 'Romania', time_range: '7d' },
              reuse_candidates: [
                {
                  job_id: existingJobId,
                  query: 'Sentiment around pension reform in Romania last 7 days',
                  updated_at: '2026-02-23T19:59:00Z',
                  similarity_score: 0.97,
                },
              ],
              status: 'pending',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/conversations/${conversationId}/confirm-job`)) {
        confirmPayload = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            conversation_id: conversationId,
            proposal_id: 'b8f80a2a-5662-4268-a4b7-9886f7262dcf',
            job_id: existingJobId,
            status: 'completed',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/overview`)) {
        return new Response(
          JSON.stringify({
            job_id: existingJobId,
            total_mentions: 10,
            sentiment_index: -10,
            engagement_rate: 1.2,
            dominant_theme: 'Economy',
            summary: 'Summary text',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/sentiment-overview`)) {
        return new Response(
          JSON.stringify({ job_id: existingJobId, positive: 2, neutral: 3, negative: 5 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/sentiment-timeseries`)) {
        return new Response(
          JSON.stringify({
            job_id: existingJobId,
            items: [{ date: '2026-02-23', positive: 2, neutral: 3, negative: 5 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'Track pension reform sentiment in Romania for the last 7 days');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /use existing/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /use existing/i }));

    await waitFor(() => {
      expect(screen.getByText(/executive key metrics/i)).toBeInTheDocument();
    });

    expect(confirmPayload).toMatchObject({
      action: 'use_existing',
      selected_job_id: existingJobId,
    });
  });

  it('routes directly to results when backend auto-reuses a completed job', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = 'c7c2d611-254f-47f2-9f41-d4f6a6e0232f';
    const existingJobId = '16b11cf3-6d3e-4482-aad8-890eb4f67fd3';
    const calledUrls: string[] = [];

    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      calledUrls.push(url);

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
              state: 'completed',
              active_proposal_version: 0,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:00Z',
            },
            assistant_message: {
              id: '6e63d114-9124-4f7e-9f5a-968b58437f1b',
              conversation_id: conversationId,
              role: 'assistant',
              content: 'I found a high-confidence completed job match and opened it.',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
            pending_proposal: null,
            decision_mode: 'auto_reused_existing',
            auto_reused_job: {
              job_id: existingJobId,
              matched_query: 'Sentiment around pension reform in Romania last 7 days',
              similarity_score: 0.97,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/overview`)) {
        return new Response(
          JSON.stringify({
            job_id: existingJobId,
            total_mentions: 10,
            sentiment_index: -10,
            engagement_rate: 1.2,
            dominant_theme: 'Economy',
            summary: 'Summary text',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/sentiment-overview`)) {
        return new Response(
          JSON.stringify({ job_id: existingJobId, positive: 2, neutral: 3, negative: 5 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/sentiment-timeseries`)) {
        return new Response(
          JSON.stringify({
            job_id: existingJobId,
            items: [{ date: '2026-02-23', positive: 2, neutral: 3, negative: 5 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/sentiment-by-topic`)) {
        return new Response(
          JSON.stringify({
            job_id: existingJobId,
            items: [{ topic: 'Economy', positive: 1, neutral: 1, negative: 2 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/jobs/${existingJobId}/sentiment-examples`)) {
        return new Response(
          JSON.stringify({
            job_id: existingJobId,
            items: [{ text: 'Example text', sentiment: 'negative', score: 0.87 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'Track pension reform sentiment in Romania for the last 7 days');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByTestId('chat-analysis-results-document')).toBeInTheDocument();
    });
    expect(screen.queryByText(/confirm query/i)).not.toBeInTheDocument();
    expect(calledUrls.some((url) => url.includes('/confirm-job'))).toBe(false);
  });

  it('renders a normal assistant chat response without proposal card for greeting', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    let resolveMessageRequest: ((response: Response) => void) | null = null;

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
        return await new Promise<Response>((resolve) => {
          resolveMessageRequest = resolve;
        });
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'hi');
    await user.keyboard('{Enter}');

    resolveMessageRequest?.(
      new Response(
        JSON.stringify({
          conversation: {
            id: conversationId,
            user_id: '11111111-1111-1111-1111-111111111111',
            title: null,
            state: 'collecting_intent',
            active_proposal_version: 0,
            inserted_at: '2026-02-23T20:00:00Z',
            updated_at: '2026-02-23T20:00:01Z',
          },
          assistant_message: {
            id: '3b15995c-fcbf-4d84-966d-eecf4e5393ac',
            conversation_id: conversationId,
            role: 'assistant',
            content: 'Hi, I am Sentra. What topic should we monitor?',
            inserted_at: '2026-02-23T20:00:01Z',
            updated_at: '2026-02-23T20:00:01Z',
          },
          pending_proposal: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await waitFor(() => {
      expect(screen.getByText(/what topic should we monitor/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/confirm query/i)).not.toBeInTheDocument();
  });

  it('restores confirm card from failed chat when user clicks try again', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const failedConversationId = '31d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const calledUrls: string[] = [];

    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      calledUrls.push(url);
      const method = String(init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();

      if (url.endsWith('/v1/conversations') && method === 'GET') {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: failedConversationId,
                user_id: '11111111-1111-1111-1111-111111111111',
                title: 'Failed investigation',
                state: 'failed',
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

      if (url.endsWith(`/v1/conversations/${failedConversationId}/snapshot`)) {
        return new Response(
          JSON.stringify({
            conversation: {
              id: failedConversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: 'Failed investigation',
              state: 'failed',
              active_proposal_version: 1,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:05Z',
            },
            messages: [
              {
                id: 'failed-assistant-message',
                conversation_id: failedConversationId,
                role: 'assistant',
                content: 'Last run failed.',
                tool_trace_ref: null,
                inserted_at: '2026-02-23T20:00:05Z',
                updated_at: '2026-02-23T20:00:05Z',
              },
            ],
            pending_proposal: null,
            retry_proposal: null,
            active_job_id: null,
            latest_job: {
              id: 'c0c68e3c-4865-4dc8-b2e7-6ed39dbdc999',
              status: 'failed',
              error_message: 'collection_failed',
              stage_code: 'collecting',
              stage_label: 'Collecting',
              updated_at: '2026-02-23T20:00:05Z',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith(`/v1/conversations/${failedConversationId}/retry-proposal`) && method === 'POST') {
        return new Response(
          JSON.stringify({
            conversation: {
              id: failedConversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: 'Failed investigation',
              state: 'awaiting_confirmation',
              active_proposal_version: 2,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:06Z',
            },
            assistant_message: {
              id: 'retry-assistant-message',
              conversation_id: failedConversationId,
              role: 'assistant',
              content: 'I restored your last failed query. Review and confirm to start a new job.',
              inserted_at: '2026-02-23T20:00:06Z',
              updated_at: '2026-02-23T20:00:06Z',
            },
            pending_proposal: {
              id: 'retry-proposal-id',
              conversation_id: failedConversationId,
              version: 2,
              normalized_query: 'Sentiment around bank of georgia on facebook last week',
              filters_json: { country: 'Georgia', time_range: '7d' },
              status: 'pending',
              inserted_at: '2026-02-23T20:00:06Z',
              updated_at: '2026-02-23T20:00:06Z',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.click(await screen.findByRole('button', { name: /failed investigation.*failed/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText(/confirm query/i)).toBeInTheDocument();
    });

    expect(calledUrls.some((url) => url.includes('/retry-proposal'))).toBe(true);
    expect(calledUrls.some((url) => url.includes('/confirm-job'))).toBe(false);
  });

  it('shows backend error detail when message request fails', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';

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
        return new Response(JSON.stringify({ detail: 'provider timeout' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('provider timeout')).toBeInTheDocument();
    });
  });
});
