import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFormRequest, getFormRequestAnalysisDocument } from '@/features/sentra/api/formRequests';

const NOW = '2026-03-06T09:00:00Z';

describe('form requests api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('posts form request payload and returns linked job', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          request: {
            id: '6fcf0c1d-f12b-4e24-aefe-d331465286f8',
            owner_user_id: '11111111-1111-1111-1111-111111111111',
            status: 'submitted',
            query: 'Acme sentiment in Romania last 7 days',
            form_payload_json: { organization_name: 'Acme' },
            normalization_json: null,
            job_id: 'f555f77f-7c9b-4be8-9130-c4e6f39fb418',
            inserted_at: NOW,
            updated_at: NOW,
          },
          job: {
            id: 'f555f77f-7c9b-4be8-9130-c4e6f39fb418',
            query: 'Acme sentiment in Romania last 7 days',
            status: 'queued',
            inserted_at: NOW,
            updated_at: NOW,
            error_message: null,
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await createFormRequest({
      query: 'Acme sentiment in Romania last 7 days',
      form_payload: { organization_name: 'Acme' },
      normalization_json: { timeframe: '7d' },
    });

    expect(result.request.id).toBe('6fcf0c1d-f12b-4e24-aefe-d331465286f8');
    expect(result.request.job_id).toBe('f555f77f-7c9b-4be8-9130-c4e6f39fb418');
    expect(result.job.status).toBe('queued');
  });

  it('gets request analysis document payload', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          meta: {
            request_id: 'request-1',
            job_id: 'job-1',
            report_contract: 'request_template_v1',
            generated_at: NOW,
            primary_entity: 'Acme Telecom',
          },
          sections: [
            { key: 'cover_page', title: 'Cover Page', payload: {} },
            { key: 'executive_key_metrics_panel', title: 'Executive Key Metrics Panel', payload: {} },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const payload = await getFormRequestAnalysisDocument('request-1');

    expect(payload.meta.report_contract).toBe('request_template_v1');
    expect(payload.sections[0].key).toBe('cover_page');
  });
});
