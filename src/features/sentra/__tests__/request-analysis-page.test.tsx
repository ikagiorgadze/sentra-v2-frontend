import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestAnalysisPage } from '@/features/sentra/components/requests/RequestAnalysisPage';

const getFormRequestMock = vi.fn();
const getFormRequestAnalysisDocumentMock = vi.fn();

vi.mock('@/features/sentra/api/formRequests', () => ({
  getFormRequest: (...args: unknown[]) => getFormRequestMock(...args),
  getFormRequestAnalysisDocument: (...args: unknown[]) => getFormRequestAnalysisDocumentMock(...args),
}));

vi.mock('@/features/sentra/components/requests/RequestTemplateAnalysisDocument', () => ({
  RequestTemplateAnalysisDocument: ({ document }: { document: { meta: { report_contract: string } } }) => (
    <div data-testid="request-template-analysis-doc">
      <span>{document.meta.report_contract}</span>
    </div>
  ),
}));

describe('request analysis page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads request and renders request template analysis document', async () => {
    getFormRequestMock.mockResolvedValue({
      id: 'request-1',
      owner_user_id: 'owner-1',
      status: 'completed',
      query: 'Acme Telecom',
      form_payload_json: { primary_entity: 'Acme Telecom' },
      normalization_json: null,
      job_id: 'job-1',
      inserted_at: '2026-03-06T10:00:00Z',
      updated_at: '2026-03-06T10:00:00Z',
    });
    getFormRequestAnalysisDocumentMock.mockResolvedValue({
      meta: {
        request_id: 'request-1',
        job_id: 'job-1',
        report_contract: 'request_template_v1',
        generated_at: '2026-03-06T10:00:00Z',
        primary_entity: 'Acme Telecom',
      },
      sections: [{ key: 'cover_page', title: 'Cover Page', payload: {} }],
    });

    render(
      <MemoryRouter initialEntries={['/request-history/request-1/analysis']}>
        <Routes>
          <Route path="/request-history/:requestId/analysis" element={<RequestAnalysisPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /request analysis document/i })).toBeInTheDocument();
    expect(await screen.findByTestId('request-template-analysis-doc')).toBeInTheDocument();
    expect(screen.getByText('request_template_v1')).toBeInTheDocument();
    await waitFor(() => expect(getFormRequestMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getFormRequestAnalysisDocumentMock).toHaveBeenCalledTimes(1));
  });
});
