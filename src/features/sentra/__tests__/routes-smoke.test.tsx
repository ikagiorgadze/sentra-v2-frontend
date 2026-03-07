import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setAccessToken, clearAccessToken } from '@/lib/auth/tokenStorage';
import App from '@/App';

function makeToken(expOffsetSeconds: number): string {
  const payload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.sig`;
}

afterEach(() => {
  clearAccessToken();
  cleanup();
});

describe('route entry points', () => {
  it('renders landing flow on root route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByRole('heading', { name: /ask sentra what the public is saying now/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /query/i })).toBeInTheDocument();
  });

  it('renders auth flow on login route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
  });

  it('renders form request page on request-form route', () => {
    setAccessToken(makeToken(3600));
    window.history.pushState({}, '', '/request-form');
    render(<App />);
    expect(screen.getByRole('heading', { name: /new intelligence request/i })).toBeInTheDocument();
  });

  it('renders request analysis page route', () => {
    setAccessToken(makeToken(3600));
    window.history.pushState({}, '', '/request-history/request-1/analysis');
    render(<App />);
    expect(screen.getByRole('heading', { name: /request analysis document/i })).toBeInTheDocument();
  });
});
