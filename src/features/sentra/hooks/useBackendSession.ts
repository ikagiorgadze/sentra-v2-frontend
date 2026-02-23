import { clearAccessToken, getAccessToken } from '@/lib/auth/tokenStorage';

interface JwtPayload {
  exp?: number;
}

function decodePayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

function hasValidToken(): boolean {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  const payload = decodePayload(token);
  if (!payload?.exp) {
    clearAccessToken();
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    clearAccessToken();
    return false;
  }

  return true;
}

export function useBackendSession(): { isAuthenticated: boolean } {
  return { isAuthenticated: hasValidToken() };
}
