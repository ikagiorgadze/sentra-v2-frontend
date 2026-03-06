import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from '@/features/sentra/components/Sidebar';

const chat = {
  id: '20d6f6d2-8105-4f20-8151-2bdadf7a9a31',
  title: 'Romania pension sentiment',
  timestamp: '2 minutes ago',
  state: 'awaiting confirmation',
  updatedAt: '2026-02-26T00:00:00Z',
};

describe('sidebar request links', () => {
  it('shows links to request form/history without mixing recent chats', async () => {
    const user = userEvent.setup();
    const onOpenRequestForm = vi.fn();
    const onOpenRequestHistory = vi.fn();

    render(
      <Sidebar
        recentChats={[chat]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
        onOpenRequestForm={onOpenRequestForm}
        onOpenRequestHistory={onOpenRequestHistory}
      />,
    );

    expect(screen.getByText(/recent chats/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /new request form/i }));
    await user.click(screen.getByRole('button', { name: /request history/i }));

    expect(onOpenRequestForm).toHaveBeenCalledTimes(1);
    expect(onOpenRequestHistory).toHaveBeenCalledTimes(1);
  });
});
