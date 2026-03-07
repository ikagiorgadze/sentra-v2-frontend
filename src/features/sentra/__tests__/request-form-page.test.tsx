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

    // Submit without filling required fields — should show validation errors
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(screen.getByText(/organization name is required/i)).toBeInTheDocument();
    });

    // Fill required fields
    await user.type(screen.getByLabelText(/organization \/ client name/i), 'Acme Telecom');
    await user.type(screen.getByPlaceholderText(/contact name/i), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@acme.com');

    // Select an objective
    await user.click(screen.getByText(/brand sentiment monitoring/i));

    // Fill key question
    await user.type(screen.getByLabelText(/key question/i), 'How is the public reacting?');

    // Add a keyword
    const keywordInput = screen.getByPlaceholderText(/add keyword/i);
    await user.type(keywordInput, 'acme{Enter}');

    // Fill country
    await user.type(screen.getByLabelText(/country/i), 'Georgia');

    // Submit
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(createFormRequestMock).toHaveBeenCalledTimes(1);
    });

    const payload = createFormRequestMock.mock.calls[0]?.[0] as {
      query: string;
      organization_name?: string;
      contact_name?: string;
      contact_email?: string;
      form_payload: Record<string, unknown>;
    };
    expect(payload.query).toContain('acme');
    // User info is persisted as top-level fields (dedicated DB columns)
    expect(payload.organization_name).toBe('Acme Telecom');
    expect(payload.contact_name).toBe('John Doe');
    expect(payload.contact_email).toBe('john@acme.com');
    // Analysis data stays in form_payload JSONB
    expect(payload.form_payload).toHaveProperty('objectives');
    expect(payload.form_payload).toHaveProperty('key_question', 'How is the public reacting?');
  });

  it('shows calendar inputs when custom range is selected', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RequestFormPage />
      </MemoryRouter>,
    );

    // Click the "Custom range" radio
    await user.click(screen.getByText(/custom range/i));

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });
});
