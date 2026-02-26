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

describe('sidebar delete chat', () => {
  it('opens confirm modal and calls onDeleteChat when confirmed', async () => {
    const user = userEvent.setup();
    const onDeleteChat = vi.fn();

    render(
      <Sidebar
        recentChats={[chat]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={onDeleteChat}
      />,
    );

    await user.click(screen.getByRole('button', { name: /delete romania pension sentiment/i }));
    expect(screen.getByText(/delete chat/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onDeleteChat).toHaveBeenCalledWith(chat.id);
  });

  it('cancels delete without invoking callback', async () => {
    const user = userEvent.setup();
    const onDeleteChat = vi.fn();

    render(
      <Sidebar
        recentChats={[chat]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={onDeleteChat}
      />,
    );

    await user.click(screen.getByRole('button', { name: /delete romania pension sentiment/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onDeleteChat).not.toHaveBeenCalled();
  });

  it('disables delete confirmation while selected chat is deleting', async () => {
    const user = userEvent.setup();

    render(
      <Sidebar
        recentChats={[chat]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
        onDeleteChat={vi.fn()}
        isDeletingChatId={chat.id}
      />,
    );

    await user.click(screen.getByRole('button', { name: /delete romania pension sentiment/i }));
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
  });
});
