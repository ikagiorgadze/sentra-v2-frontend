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

describe('recent chats hydration', () => {
  it('loads recent chats and hydrates selected conversation from snapshot', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();

    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';

    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith('/v1/conversations')) {
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

      if (url.endsWith(`/v1/conversations/${conversationId}/snapshot`)) {
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
                id: 'c80da9d4-bad6-4637-9ee6-ab6fef53e8ab',
                conversation_id: conversationId,
                role: 'user',
                content: 'Track pension reform sentiment in Romania',
                tool_trace_ref: null,
                inserted_at: '2026-02-24T00:00:01Z',
                updated_at: '2026-02-24T00:00:01Z',
              },
              {
                id: '6ccdbecf-d86f-4dc5-aeb6-fd35045fdb18',
                conversation_id: conversationId,
                role: 'assistant',
                content: 'Please confirm this query before I create the job.',
                tool_trace_ref: null,
                inserted_at: '2026-02-24T00:00:02Z',
                updated_at: '2026-02-24T00:00:02Z',
              },
            ],
            pending_proposal: {
              id: '0534fd84-f4bd-4f4a-a961-a8ecefbaed62',
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

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell initialView="app" processingDelayMs={10} />);

    await waitFor(() => {
      expect(screen.getByText(/recent chats/i)).toBeInTheDocument();
      expect(screen.getByText(/awaiting confirmation/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /awaiting confirmation/i }));

    await waitFor(() => {
      expect(screen.getByText(/please confirm this query/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm query/i)).toBeInTheDocument();
    });
  });
});
