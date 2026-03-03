import { apiFetch } from '@/lib/api/http';
import type {
  AdminUsageDetailFilters,
  AdminUsageFilters,
  AdminUsageListResponse,
  AdminUserUsageDetailResponse,
} from '@/features/sentra/types/adminUsage';

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

function buildCommonParams(filters: AdminUsageFilters): URLSearchParams {
  const params = new URLSearchParams();
  params.set('range', filters.range ?? '30d');
  if (filters.from) {
    params.set('from', filters.from);
  }
  if (filters.to) {
    params.set('to', filters.to);
  }
  return params;
}

export async function getAdminUsageList(filters: AdminUsageFilters = {}): Promise<AdminUsageListResponse> {
  const params = buildCommonParams(filters);
  const response = await apiFetch(`/v1/admin/users/usage?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return (await response.json()) as AdminUsageListResponse;
}

export async function getAdminUserUsageDetail(
  userId: string,
  filters: AdminUsageDetailFilters = {},
): Promise<AdminUserUsageDetailResponse> {
  const params = buildCommonParams(filters);
  params.set('limit', String(filters.limit ?? 50));
  params.set('offset', String(filters.offset ?? 0));
  const response = await apiFetch(`/v1/admin/users/usage/${userId}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return (await response.json()) as AdminUserUsageDetailResponse;
}
