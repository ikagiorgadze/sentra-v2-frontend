import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppShell } from '@/features/sentra/components/AppShell';

describe('query lifecycle', () => {
  it(
    'moves idle -> running -> results',
    async () => {
      const user = userEvent.setup();

      render(<AppShell initialView="app" />);

      await user.type(screen.getByRole('textbox'), 'Sentiment about pension reform');
      await user.keyboard('{Enter}');

      expect(screen.getByText(/collecting public discourse/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
      }, { timeout: 4000 });
    },
    10000
  );
});
