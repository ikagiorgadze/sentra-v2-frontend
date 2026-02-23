import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('landing/auth flow', () => {
  it('opens auth when get started is clicked', async () => {
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getAllByRole('button', { name: /get started/i })[0]);

    expect(screen.getByRole('heading', { name: /welcome back|create your account/i })).toBeInTheDocument();
  });
});
