import { API_BASE_URL } from '@/lib/api/config';
import { getAccessToken } from '@/lib/auth/tokenStorage';

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
}
