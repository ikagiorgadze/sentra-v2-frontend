import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';

afterEach(() => {
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
    window.history.pushState({}, '', '/request-form');
    render(<App />);
    expect(screen.getByRole('heading', { name: /sentra intelligence request form/i })).toBeInTheDocument();
  });
});
