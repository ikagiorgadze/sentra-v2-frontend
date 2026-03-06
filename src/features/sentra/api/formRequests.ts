import { apiFetch } from '@/lib/api/http';
import type {
  CreateFormRequestInput,
  RequestAnalysisDocumentRecord,
  CreateFormRequestRecord,
  FormRequestRecord,
} from '@/features/sentra/types/formRequest';

interface FormRequestsListResponse {
  items: FormRequestRecord[];
  next_cursor?: string | null;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: string };
    if (payload.detail) {
      return payload.detail;
    }
  } catch {
    // no-op
  }

  return response.statusText || 'Request failed';
}

export async function createFormRequest(payload: CreateFormRequestInput): Promise<CreateFormRequestRecord> {
  const response = await apiFetch('/v1/form-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as CreateFormRequestRecord;
}

export async function listFormRequests(): Promise<FormRequestRecord[]> {
  const response = await apiFetch('/v1/form-requests');
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as FormRequestsListResponse;
  return payload.items ?? [];
}

export async function getFormRequest(requestId: string): Promise<FormRequestRecord> {
  const response = await apiFetch(`/v1/form-requests/${requestId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as FormRequestRecord;
}

export async function getFormRequestAnalysisDocument(requestId: string): Promise<RequestAnalysisDocumentRecord> {
  const response = await apiFetch(`/v1/form-requests/${requestId}/analysis-document`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as RequestAnalysisDocumentRecord;
}
