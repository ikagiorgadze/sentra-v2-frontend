import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from '@/App';

describe('pricing and checkout routes', () => {
  it('renders pricing route with paid plan placeholder', () => {
    window.history.pushState({}, '', '/pricing');
    render(<App />);

    expect(screen.getByRole('heading', { name: /paid plan/i })).toBeInTheDocument();
    expect(screen.getByText('$20/mo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to checkout/i })).toBeInTheDocument();
  });

  it('navigates from pricing to checkout placeholder', async () => {
    window.history.pushState({}, '', '/pricing');
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /continue to checkout/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/checkout');
    });
    expect(screen.getByRole('heading', { name: /checkout placeholder/i })).toBeInTheDocument();
  });
});
