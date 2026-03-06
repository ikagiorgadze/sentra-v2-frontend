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
