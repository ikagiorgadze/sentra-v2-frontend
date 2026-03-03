import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
  beforeEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = false;
  });

  afterEach(() => {
    window.__SENTRA_STREAMING_ENABLED__ = undefined;
  });

  it('opens auth when get started is clicked', async () => {
    window.history.pushState({}, '', '/');
    clearAccessToken();
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getAllByRole('button', { name: /get started/i })[0]);

    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('forces auth when app route is opened without a backend token', () => {
    window.history.pushState({}, '', '/chat');
    clearAccessToken();
    render(<AppShell initialView="app" />);
    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
    return waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('keeps app view for authenticated users', () => {
    window.history.pushState({}, '', '/chat');
    setAccessToken(makeToken(3600));
    render(<AppShell initialView="app" />);
    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/chat');
  });

  it('redirects authenticated users away from auth view', () => {
    window.history.pushState({}, '', '/login');
    setAccessToken(makeToken(3600));
    render(<AppShell initialView="auth" />);
    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
    return waitFor(() => {
      expect(window.location.pathname).toBe('/chat');
    });
  });

  it('navigates to sample-report route when sample is opened', async () => {
    window.history.pushState({}, '', '/about');
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole('button', { name: /view sample report/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/sample-report');
    });
  });

  it('redirects authenticated users from root route to chat', async () => {
    window.history.pushState({}, '', '/');
    setAccessToken(makeToken(3600));

    render(<AppShell />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/chat');
    });
    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
  });

  it('opens auth modal and auto-sends queued landing message after authentication', async () => {
    window.history.pushState({}, '', '/');
    clearAccessToken();
    const user = userEvent.setup();
    const conversationId = '20d6f6d2-8105-4f20-8151-2bdadf7a9a31';
    const sentMessages: string[] = [];

    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);

      if (url.includes('/v1/auth/login')) {
        return new Response(
          JSON.stringify({
            access_token: makeToken(3600),
            token_type: 'bearer',
            expires_in: 3600,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith('/v1/conversations') && init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            id: conversationId,
            user_id: 'user-1',
            title: null,
            state: 'collecting_intent',
            active_proposal_version: 0,
            inserted_at: '2026-02-23T20:00:00Z',
            updated_at: '2026-02-23T20:00:00Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes(`/v1/conversations/${conversationId}/messages`) && init?.method === 'POST') {
        const body = JSON.parse(String(init.body ?? '{}')) as { content?: string };
        if (body.content) {
          sentMessages.push(body.content);
        }
        return new Response(
          JSON.stringify({
            conversation: {
              id: conversationId,
              user_id: 'user-1',
              title: null,
              state: 'collecting_intent',
              active_proposal_version: 0,
              inserted_at: '2026-02-23T20:00:00Z',
              updated_at: '2026-02-23T20:00:00Z',
            },
            assistant_message: {
              id: 'assistant-msg-1',
              conversation_id: conversationId,
              role: 'assistant',
              content: 'Thanks, I can help with that.',
              inserted_at: '2026-02-23T20:00:01Z',
              updated_at: '2026-02-23T20:00:01Z',
            },
            pending_proposal: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.endsWith('/v1/conversations') && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify({ items: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<AppShell />);

    const queryInput = screen.getByRole('textbox', { name: /query/i });
    await user.type(queryInput, 'Track pension reform sentiment in Romania this week');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByRole('heading', { name: /sign in to continue/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/chat');
    });

    await waitFor(() => {
      expect(sentMessages).toEqual(['Track pension reform sentiment in Romania this week']);
    });
  });

  it('prefills landing query input when example chip is clicked', async () => {
    window.history.pushState({}, '', '/');
    clearAccessToken();
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole('button', { name: /track pension reform sentiment in romania this week/i }));

    expect(screen.getByRole('textbox', { name: /query/i })).toHaveValue(
      'Track pension reform sentiment in Romania this week',
    );
  });
});
