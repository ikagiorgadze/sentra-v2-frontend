import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from '@/features/sentra/components/Sidebar';

describe('sidebar pricing link', () => {
  it('navigates to /pricing when Pricing is clicked', async () => {
    window.history.pushState({}, '', '/chat');
    const user = userEvent.setup();

    render(
      <Sidebar
        recentChats={[]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /pricing/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/pricing');
    });
  });
});
