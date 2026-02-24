interface JwtPayload {
  exp?: number;
  role?: string;
}

export function decodeTokenPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenRole(token: string): string | null {
  const payload = decodeTokenPayload(token);
  const role = payload?.role;
  if (!role || !role.trim()) {
    return null;
  }
  return role;
}

export function isTokenUnexpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}
