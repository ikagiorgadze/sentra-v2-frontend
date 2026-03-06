import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AdminUsersUsagePage } from '@/features/sentra/components/AdminUsersUsagePage';
import { AdminUserUsageDetailPage } from '@/features/sentra/components/AdminUserUsageDetailPage';

describe('admin usage pages', () => {
  it('renders all users usage list and allows opening detail route', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              user_id: '11111111-1111-1111-1111-111111111111',
              email: 'candidate@example.com',
              total_resolved_usd: 0.25,
              unresolved_events_count: 1,
              apify_resolved_usd: 0.15,
              apify_unresolved_events_count: 1,
              llm_resolved_usd: 0.1,
              llm_unresolved_events_count: 0,
              request_pipeline_resolved_usd: 0.05,
              request_pipeline_unresolved_events_count: 0,
              request_pipeline_events_count: 1,
              total_events_count: 4,
              last_activity_at: '2026-03-03T10:15:00Z',
            },
          ],
          range: '30d',
          from_date: null,
          to_date: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(
      <MemoryRouter initialEntries={['/admin/users/usage']}>
        <Routes>
          <Route path="/admin/users/usage" element={<AdminUsersUsagePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('candidate@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
  });

  it('renders user detail summary and event drilldown rows', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          summary: {
            user_id: '11111111-1111-1111-1111-111111111111',
            email: 'candidate@example.com',
            total_resolved_usd: 0.25,
            unresolved_events_count: 1,
            apify_resolved_usd: 0.15,
            apify_unresolved_events_count: 1,
            llm_resolved_usd: 0.1,
            llm_unresolved_events_count: 0,
            request_pipeline_resolved_usd: 0.05,
            request_pipeline_unresolved_events_count: 0,
            request_pipeline_events_count: 1,
            total_events_count: 4,
            last_activity_at: '2026-03-03T10:15:00Z',
          },
          events: [
            {
              id: '22222222-2222-2222-2222-222222222222',
              inserted_at: '2026-03-03T10:15:00Z',
              source: 'apify',
              provider: 'apify',
              operation: 'actor.run.search',
              model_or_actor: 'danek/facebook-search-ppr',
              pipeline: 'request',
              status: 'resolved',
              cost_usd: 0.15,
              input_tokens: null,
              output_tokens: null,
            },
          ],
          limit: 50,
          offset: 0,
          range: '7d',
          from_date: null,
          to_date: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(
      <MemoryRouter initialEntries={['/admin/users/usage/11111111-1111-1111-1111-111111111111?range=7d']}>
        <Routes>
          <Route path="/admin/users/usage/:userId" element={<AdminUserUsageDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('candidate@example.com')).toBeInTheDocument();
    expect(screen.getByText('actor.run.search')).toBeInTheDocument();
    expect(screen.getByText('danek/facebook-search-ppr')).toBeInTheDocument();
  });
});
