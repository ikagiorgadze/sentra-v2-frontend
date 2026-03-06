import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAdminUsageList } from '@/features/sentra/api/adminUsage';
import type { AdminUsageSummaryRow, UsageRange } from '@/features/sentra/types/adminUsage';

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
});

function formatUsd(value: number): string {
  return USD_FORMATTER.format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Never';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function toOptionalDateString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function AdminUsersUsagePage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<UsageRange>('30d');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState<AdminUsageSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const payload = await getAdminUsageList({
          range,
          from: toOptionalDateString(fromDate),
          to: toOptionalDateString(toDate),
        });
        if (!isCancelled) {
          setRows(payload.items ?? []);
          setError(null);
        }
      } catch (fetchError) {
        if (!isCancelled) {
          const message =
            fetchError instanceof Error && fetchError.message.trim()
              ? fetchError.message
              : 'Could not load usage data.';
          setError(message);
          setRows([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, [range, fromDate, toDate]);

  const detailQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set('range', range);
    const from = toOptionalDateString(fromDate);
    const to = toOptionalDateString(toDate);
    if (from) {
      params.set('from', from);
    }
    if (to) {
      params.set('to', to);
    }
    return params.toString();
  }, [range, fromDate, toDate]);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-wide">Admin Usage - All Users</h1>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded border border-border bg-card p-4">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-muted-foreground">
            Preset
            <select
              aria-label="Range preset"
              value={range}
              onChange={(event) => setRange(event.target.value as UsageRange)}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all-time">All time</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-muted-foreground">
            From
            <input
              aria-label="From date"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-muted-foreground">
            To
            <input
              aria-label="To date"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>

        {error && <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

        <div className="overflow-x-auto rounded border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Resolved</th>
                <th className="px-3 py-2">Unresolved</th>
                <th className="px-3 py-2">Apify</th>
                <th className="px-3 py-2">Apify Unres.</th>
                <th className="px-3 py-2">LLM</th>
                <th className="px-3 py-2">LLM Unres.</th>
                <th className="px-3 py-2">Request</th>
                <th className="px-3 py-2">Req. Unres.</th>
                <th className="px-3 py-2">Req. Events</th>
                <th className="px-3 py-2">Events</th>
                <th className="px-3 py-2">Last Activity</th>
                <th className="px-3 py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rows.map((row) => (
                  <tr key={row.user_id} className="border-t border-border/70">
                    <td className="px-3 py-2">{row.email}</td>
                    <td className="px-3 py-2">{formatUsd(row.total_resolved_usd)}</td>
                    <td className="px-3 py-2">{row.unresolved_events_count}</td>
                    <td className="px-3 py-2">{formatUsd(row.apify_resolved_usd)}</td>
                    <td className="px-3 py-2">{row.apify_unresolved_events_count}</td>
                    <td className="px-3 py-2">{formatUsd(row.llm_resolved_usd)}</td>
                    <td className="px-3 py-2">{row.llm_unresolved_events_count}</td>
                    <td className="px-3 py-2">{formatUsd(row.request_pipeline_resolved_usd)}</td>
                    <td className="px-3 py-2">{row.request_pipeline_unresolved_events_count}</td>
                    <td className="px-3 py-2">{row.request_pipeline_events_count}</td>
                    <td className="px-3 py-2">{row.total_events_count}</td>
                    <td className="px-3 py-2">{formatDateTime(row.last_activity_at)}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/usage/${row.user_id}?${detailQuery}`)}
                        className="rounded border border-border px-2 py-1 text-xs hover:bg-background"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {loading && <p className="px-3 py-3 text-sm text-muted-foreground">Loading usage data...</p>}
          {!loading && rows.length === 0 && !error && <p className="px-3 py-3 text-sm text-muted-foreground">No users found.</p>}
        </div>
      </div>
    </div>
  );
}
