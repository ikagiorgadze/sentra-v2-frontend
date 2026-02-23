import { apiFetch } from '@/lib/api/http';

interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AuthErrorPayload {
  detail?: string;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as AuthErrorPayload;
    if (payload?.detail) {
      return payload.detail;
    }
  } catch {
    // no-op: fall back to status text
  }

  return response.statusText || 'Request failed';
}

export async function loginWithBackend(email: string, password: string): Promise<AuthTokenResponse> {
  const response = await apiFetch('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AuthTokenResponse;
}

export async function signupWithBackend(email: string, password: string): Promise<void> {
  const response = await apiFetch('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
