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
    expect(screen.getByText(/primary brand\/organization is required/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/primary brand \/ organization/i), 'Acme Telecom');
    await user.type(screen.getByLabelText(/keywords \/ phrases to track/i), 'არ გაჩერდე, #acme');
    expect(screen.queryByText(/monitoring objective/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/key question/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(createFormRequestMock).toHaveBeenCalledTimes(1);
    });

    const payload = createFormRequestMock.mock.calls[0]?.[0] as {
      query: string;
      form_payload: Record<string, unknown>;
    };
    expect(payload.query).toBe('Acme Telecom არ გაჩერდე #acme');
    expect(payload.form_payload).not.toHaveProperty('organization_name');
    expect(payload.form_payload).not.toHaveProperty('objectives');
    expect(payload.form_payload).not.toHaveProperty('key_question');
  });

  it('shows calendar inputs when custom range is selected', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RequestFormPage />
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByLabelText(/time range/i), 'Custom range');

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });
});
