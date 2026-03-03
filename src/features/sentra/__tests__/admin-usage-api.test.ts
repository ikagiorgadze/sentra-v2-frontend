import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAdminUsageList, getAdminUserUsageDetail } from '@/features/sentra/api/adminUsage';

describe('admin usage api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches admin usage list with range and custom date filters', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [],
          range: '90d',
          from_date: '2026-01-01T00:00:00Z',
          to_date: '2026-02-01T00:00:00Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const payload = await getAdminUsageList({
      range: '90d',
      from: '2026-01-01',
      to: '2026-02-01',
    });

    expect(payload.range).toBe('90d');
    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]), 'http://localhost');
    expect(requestUrl.pathname).toContain('/v1/admin/users/usage');
    expect(requestUrl.searchParams.get('range')).toBe('90d');
    expect(requestUrl.searchParams.get('from')).toBe('2026-01-01');
    expect(requestUrl.searchParams.get('to')).toBe('2026-02-01');
  });

  it('fetches admin user usage detail with pagination', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          summary: {
            user_id: '11111111-1111-1111-1111-111111111111',
            email: 'admin@example.com',
            total_resolved_usd: 0.1,
            unresolved_events_count: 1,
            apify_resolved_usd: 0.06,
            apify_unresolved_events_count: 1,
            llm_resolved_usd: 0.04,
            llm_unresolved_events_count: 0,
            total_events_count: 3,
            last_activity_at: null,
          },
          events: [],
          limit: 20,
          offset: 40,
          range: '7d',
          from_date: null,
          to_date: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const payload = await getAdminUserUsageDetail('11111111-1111-1111-1111-111111111111', {
      range: '7d',
      limit: 20,
      offset: 40,
    });

    expect(payload.summary.email).toBe('admin@example.com');
    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]), 'http://localhost');
    expect(requestUrl.pathname).toContain('/v1/admin/users/usage/11111111-1111-1111-1111-111111111111');
    expect(requestUrl.searchParams.get('range')).toBe('7d');
    expect(requestUrl.searchParams.get('limit')).toBe('20');
    expect(requestUrl.searchParams.get('offset')).toBe('40');
  });

  it('throws backend detail for failed requests', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(getAdminUsageList()).rejects.toThrow('forbidden');
  });
});
