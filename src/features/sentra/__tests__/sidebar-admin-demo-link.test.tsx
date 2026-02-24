import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from '@/features/sentra/components/Sidebar';

describe('sidebar admin demo link', () => {
  it('shows Demo nav item only for admin users', () => {
    const onOpenDemo = vi.fn();

    const { rerender } = render(
      <Sidebar
        recentChats={[]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
        onOpenDemo={onOpenDemo}
        isAdminUser={false}
      />,
    );

    expect(screen.queryByRole('button', { name: /demo/i })).not.toBeInTheDocument();

    rerender(
      <Sidebar
        recentChats={[]}
        onNewInvestigation={vi.fn()}
        onSelectChat={vi.fn()}
        onOpenDemo={onOpenDemo}
        isAdminUser
      />,
    );

    expect(screen.getByRole('button', { name: /demo/i })).toBeInTheDocument();
  });
});
