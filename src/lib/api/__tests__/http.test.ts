import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

describe('apiFetch', () => {
  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('adds bearer token when present', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    const { apiFetch } = await import('@/lib/api/http');
    setAccessToken('abc.jwt');
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await apiFetch('/v1/jobs');

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    const requestUrl = String(fetchMock.mock.calls[0][0]);

    expect(requestUrl).toBe('/v1/jobs');
    expect(headers.Authorization).toBe('Bearer abc.jwt');
  });
});
