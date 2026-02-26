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

describe('recent chat delete behavior', () => {
  it('resets active chat state after deleting the selected conversation', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    let deleted = false;

    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      const method = String(init?.method ?? 'GET').toUpperCase();

      if (url.endsWith('/v1/conversations') && method === 'GET') {
        return new Response(
          JSON.stringify({
            items: deleted
              ? []
              : [
                  {
                    id: conversationId,
                    user_id: '11111111-1111-1111-1111-111111111111',
                    title: 'Romania pension sentiment',
                    state: 'awaiting_confirmation',
                    active_proposal_version: 1,
                    inserted_at: '2026-02-24T00:00:00Z',
                    updated_at: '2026-02-24T00:10:00Z',
                  },
                ],
            next_cursor: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith(`/v1/conversations/${conversationId}/snapshot`) && method === 'GET') {
        return new Response(
          JSON.stringify({
            conversation: {
              id: conversationId,
              user_id: '11111111-1111-1111-1111-111111111111',
              title: 'Romania pension sentiment',
              state: 'awaiting_confirmation',
              active_proposal_version: 1,
              inserted_at: '2026-02-24T00:00:00Z',
              updated_at: '2026-02-24T00:10:00Z',
            },
            messages: [
              {
                id: 'message-user',
                conversation_id: conversationId,
                role: 'user',
                content: 'Track pension reform sentiment in Romania',
                tool_trace_ref: null,
                inserted_at: '2026-02-24T00:00:01Z',
                updated_at: '2026-02-24T00:00:01Z',
              },
              {
                id: 'message-assistant',
                conversation_id: conversationId,
                role: 'assistant',
                content: 'Please confirm this query before I create the job.',
                tool_trace_ref: null,
                inserted_at: '2026-02-24T00:00:02Z',
                updated_at: '2026-02-24T00:00:02Z',
              },
            ],
            pending_proposal: {
              id: 'proposal-id',
              conversation_id: conversationId,
              version: 1,
              normalized_query: 'Sentiment around pension reform in Romania last 7 days',
              filters_json: { country: 'Romania', time_range: '7d' },
              status: 'pending',
              inserted_at: '2026-02-24T00:00:02Z',
              updated_at: '2026-02-24T00:00:02Z',
            },
            active_job_id: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith(`/v1/conversations/${conversationId}`) && method === 'DELETE') {
        deleted = true;
        return new Response(null, { status: 204 });
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /awaiting confirmation/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /awaiting confirmation/i }));
    await waitFor(() => {
      expect(screen.getByText(/confirm query/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^delete romania pension sentiment$/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.getByText(/no chats yet/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/confirm query/i)).not.toBeInTheDocument();
  });

  it('shows delete errors without removing chat from sidebar', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';

    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      const method = String(init?.method ?? 'GET').toUpperCase();

      if (url.endsWith('/v1/conversations') && method === 'GET') {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: conversationId,
                user_id: '11111111-1111-1111-1111-111111111111',
                title: 'Romania pension sentiment',
                state: 'awaiting_confirmation',
                active_proposal_version: 1,
                inserted_at: '2026-02-24T00:00:00Z',
                updated_at: '2026-02-24T00:10:00Z',
              },
            ],
            next_cursor: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith(`/v1/conversations/${conversationId}`) && method === 'DELETE') {
        return new Response(JSON.stringify({ detail: 'Could not delete chat.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /awaiting confirmation/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^delete romania pension sentiment$/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not delete chat/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /awaiting confirmation/i })).toBeInTheDocument();
  });
});
