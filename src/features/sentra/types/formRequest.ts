import type { JobRecord } from '@/features/sentra/api/jobs';

export type FormRequestStatus = 'submitted' | 'running' | 'completed' | 'failed';

export interface FormRequestRecord {
  id: string;
  owner_user_id: string;
  status: FormRequestStatus;
  query: string;
  form_payload_json: Record<string, unknown>;
  normalization_json: Record<string, unknown> | null;
  job_id: string | null;
  inserted_at: string;
  updated_at: string;
}

export interface CreateFormRequestInput {
  query: string;
  form_payload: Record<string, unknown>;
  normalization_json?: Record<string, unknown> | null;
}

export interface CreateFormRequestRecord {
  request: FormRequestRecord;
  job: JobRecord;
}

export interface RequestAnalysisSectionRecord {
  key: string;
  title: string;
  payload: Record<string, unknown>;
}

export interface RequestAnalysisDocumentRecord {
  meta: {
    request_id: string;
    job_id: string;
    report_contract: string;
    generated_at: string;
    primary_entity?: string | null;
  };
  sections: RequestAnalysisSectionRecord[];
}
