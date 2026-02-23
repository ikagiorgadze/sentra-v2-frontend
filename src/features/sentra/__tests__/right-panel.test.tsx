import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('right panel', () => {
  it('expands and collapses advanced filters panel', async () => {
    const user = userEvent.setup();
    render(<AppShell initialView="app" />);

    const toggle = screen.getByRole('button', { name: /toggle filters panel/i });

    await user.click(toggle);
    expect(screen.getByText(/advanced filters/i)).toBeInTheDocument();

    await user.click(toggle);
    expect(screen.queryByText(/advanced filters/i)).not.toBeInTheDocument();
  });
});
