import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Sidebar } from '@/features/sentra/components/Sidebar';

const chat = {
  id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
  title: 'Romania pension sentiment',
  timestamp: '2 minutes ago',
  state: 'awaiting confirmation',
  updatedAt: '2026-02-26T00:00:00Z',
};

describe('sidebar request links', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/chat');
  });

  it('shows links to request form/history without mixing recent chats', async () => {
    const user = userEvent.setup();

    render(
      <Sidebar
        recentChats={[chat]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
      />,
    );

    expect(screen.getByText(/recent chats/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /new request form/i }));
    expect(window.location.pathname).toBe('/request-form');
    await user.click(screen.getByRole('button', { name: /request history/i }));
    expect(window.location.pathname).toBe('/request-history');
  });
});
