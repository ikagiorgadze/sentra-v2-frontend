import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

describe('chat streaming flow', () => {
  afterEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = undefined;
  });

  it('uses stream endpoint by default when no explicit override is set', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const encoder = new TextEncoder();
    let streamEndpointCalled = false;

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
            inserted_at: '2026-02-24T00:00:00Z',
            updated_at: '2026-02-24T00:00:00Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes(`/v1/conversations/${conversationId}/messages/stream`)) {
        streamEndpointCalled = true;
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                'event: turn_complete\ndata: {"conversation":{"id":"' +
                  conversationId +
                  '"},"assistant_message":{"id":"m1","content":"Hello"},"proposal":null}\n\n',
              ),
            );
            controller.close();
          },
        });
        return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    expect(streamEndpointCalled).toBe(true);
  });

  it('renders assistant content progressively from stream tokens', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    window.__SENTRA_STREAMING_ENABLED__ = true;
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const encoder = new TextEncoder();
    let releaseSecondChunk: (() => void) | null = null;

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
            inserted_at: '2026-02-24T00:00:00Z',
            updated_at: '2026-02-24T00:00:00Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes(`/v1/conversations/${conversationId}/messages/stream`)) {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                'event: turn_start\ndata: {"conversation":{"id":"' + conversationId + '"}}\n\n' +
                  'event: assistant_token\ndata: {"delta":"Hel"}\n\n',
              ),
            );
            releaseSecondChunk = () => {
              controller.enqueue(
                encoder.encode(
                  'event: assistant_token\ndata: {"delta":"lo"}\n\n' +
                    'event: turn_complete\ndata: {"conversation":{"id":"' +
                    conversationId +
                    '"},"assistant_message":{"id":"m1","content":"Hello"},"proposal":null}\n\n',
                ),
              );
              controller.close();
            };
          },
        });
        return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Hel')).toBeInTheDocument();
    });

    releaseSecondChunk?.();

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('clears stale pending proposal when turn_complete carries proposal null', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    window.__SENTRA_STREAMING_ENABLED__ = true;
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const encoder = new TextEncoder();

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
            inserted_at: '2026-02-24T00:00:00Z',
            updated_at: '2026-02-24T00:00:00Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes(`/v1/conversations/${conversationId}/messages/stream`)) {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                'event: turn_start\ndata: {"conversation":{"id":"' + conversationId + '"}}\n\n' +
                  'event: proposal_ready\ndata: {"proposal":{"id":"p1","conversation_id":"' +
                  conversationId +
                  '","version":1,"normalized_query":"Sentiment around pension reform in Romania last 7 days","filters_json":{"country":"Romania","time_range":"7d"},"status":"pending","inserted_at":"2026-02-24T00:00:00Z","updated_at":"2026-02-24T00:00:00Z"}}\n\n' +
                  'event: turn_complete\ndata: {"conversation":{"id":"' +
                  conversationId +
                  '"},"assistant_message":{"id":"m1","content":"Hello"},"proposal":null}\n\n',
              ),
            );
            controller.close();
          },
        });
        return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    expect(screen.queryByText(/confirm query/i)).not.toBeInTheDocument();
  });

  it('transitions directly to results when turn_complete indicates auto reuse', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    window.__SENTRA_STREAMING_ENABLED__ = true;
    const user = userEvent.setup();

    const conversationId = '7d6ea2bc-5cc8-49b7-9077-150f2f5ca4c2';
    const existingJobId = '6c1884a4-6441-4de5-a4a9-89db53400d2e';
    const encoder = new TextEncoder();

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
            inserted_at: '2026-02-24T00:00:00Z',
            updated_at: '2026-02-24T00:00:00Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes(`/v1/conversations/${conversationId}/messages/stream`)) {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                'event: turn_start\ndata: {"conversation":{"id":"' +
                  conversationId +
                  '"}}\n\n' +
                  'event: turn_complete\ndata: {"conversation":{"id":"' +
                  conversationId +
                  '"},"assistant_message":{"id":"m1","content":"I found a high-confidence completed job match and opened it."},"proposal":null,"decision_mode":"auto_reused_existing","auto_reused_job":{"job_id":"' +
                  existingJobId +
                  '","matched_query":"Sentiment around pension reform in Romania last 7 days","similarity_score":0.97}}\n\n',
              ),
            );
            controller.close();
          },
        });
        return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
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

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/confirm query/i)).not.toBeInTheDocument();
  });

  it('clears stale pending proposal when clarification arrives', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    window.__SENTRA_STREAMING_ENABLED__ = true;
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const encoder = new TextEncoder();
    let releaseSecondChunk: (() => void) | null = null;

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
            inserted_at: '2026-02-24T00:00:00Z',
            updated_at: '2026-02-24T00:00:00Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes(`/v1/conversations/${conversationId}/messages/stream`)) {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                'event: turn_start\ndata: {"conversation":{"id":"' + conversationId + '"}}\n\n' +
                  'event: proposal_ready\ndata: {"proposal":{"id":"p1","conversation_id":"' +
                  conversationId +
                  '","version":1,"normalized_query":"Sentiment around pension reform in Romania last 7 days","filters_json":{"country":"Romania","time_range":"7d"},"status":"pending","inserted_at":"2026-02-24T00:00:00Z","updated_at":"2026-02-24T00:00:00Z"}}\n\n' +
                  'event: clarification\ndata: {"clarification":{"question":"Which topic should I monitor?"}}\n\n',
              ),
            );
            releaseSecondChunk = () => {
              controller.enqueue(
                encoder.encode(
                  'event: turn_complete\ndata: {"conversation":{"id":"' +
                    conversationId +
                    '"},"assistant_message":{"id":"m1","content":"Which topic should I monitor?"},"proposal":null}\n\n',
                ),
              );
              controller.close();
            };
          },
        });
        return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await user.type(screen.getByRole('textbox', { name: /query/i }), 'hello');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/which topic should i monitor/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/confirm query/i)).not.toBeInTheDocument();

    releaseSecondChunk?.();

    await waitFor(() => {
      expect(screen.getByText(/which topic should i monitor/i)).toBeInTheDocument();
    });
  });
});
