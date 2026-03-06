import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestDetailPage } from '@/features/sentra/components/requests/RequestDetailPage';

const getFormRequestMock = vi.fn();
const getJobMock = vi.fn();

vi.mock('@/features/sentra/api/formRequests', () => ({
  getFormRequest: (...args: unknown[]) => getFormRequestMock(...args),
}));

vi.mock('@/features/sentra/api/jobs', () => ({
  getJob: (...args: unknown[]) => getJobMock(...args),
}));

describe('request detail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads request detail with linked job status', async () => {
    getFormRequestMock.mockResolvedValue({
      id: 'request-1',
      owner_user_id: 'owner-1',
      status: 'running',
      query: 'Acme sentiment in Romania last 7 days',
      form_payload_json: { organization_name: 'Acme' },
      normalization_json: null,
      job_id: 'job-1',
      inserted_at: '2026-03-06T10:00:00Z',
      updated_at: '2026-03-06T10:00:00Z',
    });
    getJobMock.mockResolvedValue({
      id: 'job-1',
      query: 'Acme sentiment in Romania last 7 days',
      status: 'running',
      stage_code: 'sentiment',
      stage_label: 'Sentiment',
      progress: {
        overall: {
          stages_completed: 1,
          stages_total: 4,
          current_stage_code: 'sentiment',
        },
        stages: {
          sentiment: {
            posts_done: 10,
            posts_total: 100,
            comments_done: 40,
            comments_total: 400,
          },
        },
      },
      inserted_at: '2026-03-06T10:00:00Z',
      updated_at: '2026-03-06T10:01:00Z',
      error_message: null,
    });

    render(
      <MemoryRouter initialEntries={['/request-history/request-1']}>
        <Routes>
          <Route path="/request-history/:requestId" element={<RequestDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /request details/i })).toBeInTheDocument();
    expect(screen.getByText(/acme sentiment in romania/i)).toBeInTheDocument();
    await waitFor(() => expect(getFormRequestMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getJobMock).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText(/running/i).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText(/overall: 1\/4 stages/i)).toBeInTheDocument();
    expect(screen.getByText(/sentiment: posts 10\/100, comments 40\/400/i)).toBeInTheDocument();
  });
});
