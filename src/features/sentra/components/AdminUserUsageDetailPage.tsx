import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { getAdminUserUsageDetail } from '@/features/sentra/api/adminUsage';
import type { AdminUsageEventRow, AdminUserUsageDetailResponse, UsageRange } from '@/features/sentra/types/adminUsage';

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
});

const DEFAULT_LIMIT = 50;

function formatUsd(value: number | null): string {
  if (value === null) {
    return '-';
  }
  return USD_FORMATTER.format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function getQueryRange(value: string | null): UsageRange {
  if (value === '7d' || value === '30d' || value === '90d' || value === 'all-time') {
    return value;
  }
  return '30d';
}

function toOptionalDateString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function AdminUserUsageDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const [range, setRange] = useState<UsageRange>(() => getQueryRange(searchParams.get('range')));
  const [fromDate, setFromDate] = useState(searchParams.get('from') ?? '');
  const [toDate, setToDate] = useState(searchParams.get('to') ?? '');
  const [offset, setOffset] = useState(0);
  const [payload, setPayload] = useState<AdminUserUsageDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOffset(0);
  }, [range, fromDate, toDate]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPayload(null);
      setError('Missing user id.');
      return;
    }

    let isCancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminUserUsageDetail(userId, {
          range,
          from: toOptionalDateString(fromDate),
          to: toOptionalDateString(toDate),
          limit: DEFAULT_LIMIT,
          offset,
        });
        if (!isCancelled) {
          setPayload(response);
          setError(null);
        }
      } catch (fetchError) {
        if (!isCancelled) {
          const message =
            fetchError instanceof Error && fetchError.message.trim()
              ? fetchError.message
              : 'Could not load usage details.';
          setError(message);
          setPayload(null);
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
  }, [userId, range, fromDate, toDate, offset]);

  const events: AdminUsageEventRow[] = payload?.events ?? [];
  const hasPrev = offset > 0;
  const hasNext = events.length >= DEFAULT_LIMIT;

  const backQuery = useMemo(() => {
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
    <div className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-wide">Admin Usage - User Detail</h1>
          <button
            type="button"
            onClick={() => navigate(`/admin/users/usage?${backQuery}`)}
            className="rounded border border-border bg-card px-3 py-2 text-sm hover:bg-card/80"
          >
            Back to All Users
          </button>
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

        {payload?.summary && (
          <div className="grid gap-3 rounded border border-border bg-card p-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">User</p>
              <p className="text-sm">{payload.summary.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Resolved USD</p>
              <p className="text-sm">{formatUsd(payload.summary.total_resolved_usd)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Unresolved Events</p>
              <p className="text-sm">{payload.summary.unresolved_events_count}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Last Activity</p>
              <p className="text-sm">{formatDateTime(payload.summary.last_activity_at)}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/20 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Inserted</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Operation</th>
                <th className="px-3 py-2">Model/Actor</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Cost</th>
                <th className="px-3 py-2">Input Tokens</th>
                <th className="px-3 py-2">Output Tokens</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                events.map((event) => (
                  <tr key={event.id} className="border-t border-border/70">
                    <td className="px-3 py-2">{formatDateTime(event.inserted_at)}</td>
                    <td className="px-3 py-2">{event.source}</td>
                    <td className="px-3 py-2">{event.provider}</td>
                    <td className="px-3 py-2">{event.operation}</td>
                    <td className="px-3 py-2">{event.model_or_actor}</td>
                    <td className="px-3 py-2">{event.status}</td>
                    <td className="px-3 py-2">{formatUsd(event.cost_usd)}</td>
                    <td className="px-3 py-2">{event.input_tokens ?? '-'}</td>
                    <td className="px-3 py-2">{event.output_tokens ?? '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {loading && <p className="px-3 py-3 text-sm text-muted-foreground">Loading usage detail...</p>}
          {!loading && events.length === 0 && !error && (
            <p className="px-3 py-3 text-sm text-muted-foreground">No events in this range.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setOffset((prev) => Math.max(0, prev - DEFAULT_LIMIT))}
            disabled={!hasPrev}
            className="rounded border border-border bg-card px-3 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setOffset((prev) => prev + DEFAULT_LIMIT)}
            disabled={!hasNext}
            className="rounded border border-border bg-card px-3 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
