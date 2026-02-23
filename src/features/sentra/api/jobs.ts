import { apiFetch } from '@/lib/api/http';

export interface JobRecord {
  id: string;
  query: string;
  status: string;
  inserted_at: string;
  updated_at: string;
  error_message?: string | null;
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

export async function createJob(query: string): Promise<JobRecord> {
  const response = await apiFetch('/v1/jobs', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as JobRecord;
}

export async function getJob(jobId: string): Promise<JobRecord> {
  const response = await apiFetch(`/v1/jobs/${jobId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as JobRecord;
}

export async function listJobs(): Promise<JobRecord[]> {
  const response = await apiFetch('/v1/jobs');
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as { items?: JobRecord[] };
  return payload.items ?? [];
}
