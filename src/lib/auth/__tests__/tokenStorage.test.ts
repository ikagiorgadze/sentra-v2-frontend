import { beforeEach, describe, expect, it } from 'vitest';

import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('stores token in localStorage for reload persistence', () => {
    setAccessToken('abc.jwt');
    expect(window.localStorage.getItem('sentra_access_token')).toBe('abc.jwt');
    expect(getAccessToken()).toBe('abc.jwt');
  });

  it('reads legacy token from sessionStorage when localStorage is empty', () => {
    window.sessionStorage.setItem('sentra_access_token', 'legacy.jwt');
    expect(getAccessToken()).toBe('legacy.jwt');
  });

  it('clears token from both localStorage and sessionStorage', () => {
    window.localStorage.setItem('sentra_access_token', 'local.jwt');
    window.sessionStorage.setItem('sentra_access_token', 'session.jwt');
    clearAccessToken();
    expect(window.localStorage.getItem('sentra_access_token')).toBeNull();
    expect(window.sessionStorage.getItem('sentra_access_token')).toBeNull();
  });
});

