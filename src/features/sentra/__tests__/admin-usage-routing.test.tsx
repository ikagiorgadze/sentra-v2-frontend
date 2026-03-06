import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '@/App';
import { clearAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

function makeToken(role: string, expOffsetSeconds = 3600): string {
  const payload = {
    sub: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    role,
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.sig`;
}

afterEach(() => {
  clearAccessToken();
});

describe('admin usage routing', () => {
  it('redirects non-admin users from /admin/users/usage to /request-history', async () => {
    setAccessToken(makeToken('user'));
    window.history.pushState({}, '', '/admin/users/usage');

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/request-history');
    });
    expect(screen.queryByText(/admin usage - all users/i)).not.toBeInTheDocument();
  });

  it('allows admin users to open /admin/users/usage/:userId', async () => {
    setAccessToken(makeToken('admin'));
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          summary: {
            user_id: '11111111-1111-1111-1111-111111111111',
            email: 'admin@example.com',
            total_resolved_usd: 1.5,
            unresolved_events_count: 0,
            apify_resolved_usd: 1.0,
            apify_unresolved_events_count: 0,
            llm_resolved_usd: 0.5,
            llm_unresolved_events_count: 0,
            request_pipeline_resolved_usd: 0.2,
            request_pipeline_unresolved_events_count: 0,
            request_pipeline_events_count: 1,
            total_events_count: 2,
            last_activity_at: null,
          },
          events: [],
          limit: 50,
          offset: 0,
          range: '30d',
          from_date: null,
          to_date: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    window.history.pushState({}, '', '/admin/users/usage/11111111-1111-1111-1111-111111111111');

    render(<App />);

    expect(await screen.findByText(/admin usage - user detail/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/admin/users/usage/11111111-1111-1111-1111-111111111111');
  });
});
