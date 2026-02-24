import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AdminDemoPage } from '@/features/sentra/components/AdminDemoPage';

describe('admin demo page', () => {
  it('renders scenario controls and shared conversation UI', async () => {
    render(<AdminDemoPage />);

    expect(screen.getByLabelText(/scenario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    expect(screen.getByText(/sentra conversational analyst/i)).toBeInTheDocument();
  });

  it('shows proposal card and transitions to running/results based on demo steps', async () => {
    const user = userEvent.setup();

    render(<AdminDemoPage />);

    await user.selectOptions(screen.getByLabelText(/scenario/i), 'iphone-rival-campaign');
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    expect(screen.getByText(/confirm query/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^confirm$/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/collecting public discourse/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();

  });
});
