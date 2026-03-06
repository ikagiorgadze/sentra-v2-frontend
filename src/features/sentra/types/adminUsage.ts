export type UsageRange = '7d' | '30d' | '90d' | 'all-time';

export interface AdminUsageSummaryRow {
  user_id: string;
  email: string;
  total_resolved_usd: number;
  unresolved_events_count: number;
  apify_resolved_usd: number;
  apify_unresolved_events_count: number;
  llm_resolved_usd: number;
  llm_unresolved_events_count: number;
  request_pipeline_resolved_usd: number;
  request_pipeline_unresolved_events_count: number;
  request_pipeline_events_count: number;
  total_events_count: number;
  last_activity_at: string | null;
}

export interface AdminUsageEventRow {
  id: string;
  inserted_at: string;
  source: string;
  provider: string;
  operation: string;
  model_or_actor: string;
  pipeline: string;
  status: string;
  cost_usd: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
}

export interface AdminUsageListResponse {
  items: AdminUsageSummaryRow[];
  range: UsageRange;
  from_date: string | null;
  to_date: string | null;
}

export interface AdminUserUsageDetailResponse {
  summary: AdminUsageSummaryRow;
  events: AdminUsageEventRow[];
  limit: number;
  offset: number;
  range: UsageRange;
  from_date: string | null;
  to_date: string | null;
}

export interface AdminUsageFilters {
  range?: UsageRange;
  from?: string;
  to?: string;
}

export interface AdminUsageDetailFilters extends AdminUsageFilters {
  limit?: number;
  offset?: number;
}
