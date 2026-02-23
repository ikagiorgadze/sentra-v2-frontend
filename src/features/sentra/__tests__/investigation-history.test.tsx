import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('investigation history', () => {
  it('adds completed query to sidebar and reopens it when selected', async () => {
    const user = userEvent.setup();
    render(<AppShell initialView="app" processingDelayMs={1} />);

    await user.type(screen.getByRole('textbox'), 'Pension reform Romania');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
    }, { timeout: 4000 });

    expect(screen.getByRole('button', { name: /pension reform romania/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new investigation/i }));
    await user.click(screen.getByRole('button', { name: /pension reform romania/i }));

    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
  });
});
