import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestHistoryPage } from '@/features/sentra/components/requests/RequestHistoryPage';

const listFormRequestsMock = vi.fn();

vi.mock('@/features/sentra/api/formRequests', () => ({
  listFormRequests: (...args: unknown[]) => listFormRequestsMock(...args),
}));

describe('request history page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders only form requests in request history', async () => {
    listFormRequestsMock.mockResolvedValue([
      {
        id: 'request-1',
        owner_user_id: 'owner-1',
        status: 'submitted',
        query: 'Acme sentiment in Romania last 7 days',
        form_payload_json: { organization_name: 'Acme' },
        normalization_json: null,
        job_id: 'job-1',
        inserted_at: '2026-03-06T10:00:00Z',
        updated_at: '2026-03-06T10:00:00Z',
      },
    ]);

    render(
      <MemoryRouter>
        <RequestHistoryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /form requests/i })).toBeInTheDocument();
    expect(screen.getByText(/acme sentiment in romania/i)).toBeInTheDocument();
    await waitFor(() => expect(listFormRequestsMock).toHaveBeenCalledTimes(1));
  });
});
