import { apiFetch } from '@/lib/api/http';

export interface OverviewResponse {
  job_id: string;
  total_mentions: number;
  engagement_rate: number;
  summary: string;
}

export interface SentimentOverviewResponse {
  job_id: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentTimeseriesPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentTimeseriesResponse {
  job_id: string;
  items: SentimentTimeseriesPoint[];
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

async function getJson<T>(path: string): Promise<T> {
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return (await response.json()) as T;
}

export const getOverview = (jobId: string): Promise<OverviewResponse> =>
  getJson<OverviewResponse>(`/v1/jobs/${jobId}/overview`);

export const getSentimentOverview = (jobId: string): Promise<SentimentOverviewResponse> =>
  getJson<SentimentOverviewResponse>(`/v1/jobs/${jobId}/sentiment-overview`);

export const getSentimentTimeseries = (jobId: string): Promise<SentimentTimeseriesResponse> =>
  getJson<SentimentTimeseriesResponse>(`/v1/jobs/${jobId}/sentiment-timeseries`);
