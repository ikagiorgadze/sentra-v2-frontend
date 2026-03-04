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

  it('plays pinned job flow and renders report in normal chat bubble', async () => {
    const user = userEvent.setup();

    render(<AdminDemoPage />);

    await user.selectOptions(screen.getByLabelText(/scenario/i), 'job-047b7d78-50a8-4027-84eb-7979356949bf');
    expect(screen.getByRole('option', { name: 'არ გაჩერდე' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/sentra რა არის\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));

    expect(screen.getByText(/confirm query/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^confirm$/i }));
    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/საჯარო დისკურსის შეგროვება/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByTestId('chat-analysis-results-document')).toBeInTheDocument();
  });
});
