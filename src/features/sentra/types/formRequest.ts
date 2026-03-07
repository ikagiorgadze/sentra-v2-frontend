import type { JobRecord } from '@/features/sentra/api/jobs';

export type FormRequestStatus = 'submitted' | 'running' | 'completed' | 'failed';

export interface FormRequestRecord {
  id: string;
  owner_user_id: string;
  status: FormRequestStatus;
  query: string;
  organization_name: string | null;
  department: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  project_name: string | null;
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
  organization_name?: string;
  department?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  project_name?: string;
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
