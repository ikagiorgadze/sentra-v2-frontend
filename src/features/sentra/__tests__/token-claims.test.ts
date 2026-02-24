import { describe, expect, it } from 'vitest';

import { getTokenRole } from '@/features/sentra/auth/tokenClaims';

function makeToken(role: string): string {
  const payload = {
    sub: '11111111-1111-1111-1111-111111111111',
    email: 'admin@example.com',
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.sig`;
}

describe('token claims', () => {
  it('returns admin role when jwt payload contains role=admin', () => {
    expect(getTokenRole(makeToken('admin'))).toBe('admin');
  });

  it('returns null for malformed token payload', () => {
    expect(getTokenRole('bad.token')).toBeNull();
  });
});
