import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiFetch } from '@/lib/api/http';
import { clearAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

describe('apiFetch', () => {
  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it('adds bearer token when present', async () => {
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
    expect(headers.Authorization).toBe('Bearer abc.jwt');
  });
});
