import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFormPage } from '@/features/sentra/components/requests/RequestFormPage';

const createFormRequestMock = vi.fn();

vi.mock('@/features/sentra/api/formRequests', () => ({
  createFormRequest: (...args: unknown[]) => createFormRequestMock(...args),
}));

describe('request form page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required fields and submits form request', async () => {
    const user = userEvent.setup();
    createFormRequestMock.mockResolvedValue({
      request: { id: 'request-1' },
      job: { id: 'job-1' },
    });

    render(
      <MemoryRouter>
        <RequestFormPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /submit request/i }));
    expect(screen.getByText(/organization\/client name is required/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/organization \/ client name/i), 'Acme');
    await user.type(screen.getByLabelText(/primary brand \/ organization/i), 'Acme Telecom');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(createFormRequestMock).toHaveBeenCalledTimes(1);
    });
  });
});
