import type { ReactNode } from 'react';

import type { RequestAnalysisDocumentRecord, RequestAnalysisSectionRecord } from '@/features/sentra/types/formRequest';

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asObjectList(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null) : [];
}

function asString(value: unknown, fallback = '—'): string {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

function toLabel(key: string): string {
  const normalized = key.replace(/[_-]+/g, ' ').trim();
  if (!normalized) {
    return 'Value';
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function renderMarkdownInline(text: string, keyPath: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  const segments = text.split(pattern).filter((segment) => segment.length > 0);
  return segments.map((segment, index) => {
    const key = `${keyPath}-inline-${index}`;
    if (
      (segment.startsWith('**') && segment.endsWith('**')) ||
      (segment.startsWith('__') && segment.endsWith('__'))
    ) {
      return <strong key={key}>{segment.slice(2, -2)}</strong>;
    }
    if (
      (segment.startsWith('*') && segment.endsWith('*')) ||
      (segment.startsWith('_') && segment.endsWith('_'))
    ) {
      return <em key={key}>{segment.slice(1, -1)}</em>;
    }
    return <span key={key}>{segment}</span>;
  });
}

function renderMarkdownText(text: string, keyPath: string): ReactNode {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const blocks: ReactNode[] = [];
  let bulletGroup: string[] = [];
  let paragraphGroup: string[] = [];

  const flushParagraphGroup = () => {
    if (paragraphGroup.length === 0) {
      return;
    }
    blocks.push(
      <p key={`${keyPath}-p-${blocks.length}`} className="whitespace-pre-wrap">
        {renderMarkdownInline(paragraphGroup.join(' '), `${keyPath}-p-${blocks.length}`)}
      </p>,
    );
    paragraphGroup = [];
  };

  const flushBulletGroup = () => {
    if (bulletGroup.length === 0) {
      return;
    }
    blocks.push(
      <ul key={`${keyPath}-ul-${blocks.length}`} className="list-disc space-y-1 pl-5">
        {bulletGroup.map((item, index) => (
          <li key={`${keyPath}-li-${index}`}>{renderMarkdownInline(item, `${keyPath}-li-${index}`)}</li>
        ))}
      </ul>,
    );
    bulletGroup = [];
  };

  for (const line of lines) {
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraphGroup();
      bulletGroup.push(bulletMatch[1]);
      continue;
    }
    flushBulletGroup();
    paragraphGroup.push(line);
  }

  flushParagraphGroup();
  flushBulletGroup();

  return <div className="space-y-2">{blocks}</div>;
}

interface EngagementPoint {
  date: string;
  label: string;
  value: number;
}

type EngagementMetric = 'engagement_rate' | 'engagement' | 'mentions';

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toShortDateLabel(raw: string): string {
  const normalized = raw.trim();
  if (!normalized) {
    return '—';
  }
  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[2]}-${isoMatch[3]}`;
  }
  return normalized;
}

interface EngagementSeriesResult {
  metric: EngagementMetric;
  series: EngagementPoint[];
}

function extractEngagementSeries(payload: Record<string, unknown>): EngagementSeriesResult {
  const rows = asObjectList(payload.daily_metrics);
  const normalizedRows = rows
    .map((row) => {
      const date = asString(row.date, '').trim();
      if (!date) {
        return null;
      }
      return {
        date,
        label: toShortDateLabel(date),
        engagement_rate: toFiniteNumber(row.engagement_rate),
        engagement: toFiniteNumber(row.engagement),
        mentions: toFiniteNumber(row.mentions),
      };
    })
    .filter((row): row is { date: string; label: string; engagement_rate: number | null; engagement: number | null; mentions: number | null } => row !== null);

  const hasPositiveEngagementRate = normalizedRows.some((row) => (row.engagement_rate ?? 0) > 0);
  const hasPositiveEngagement = normalizedRows.some((row) => (row.engagement ?? 0) > 0);
  const metric: EngagementMetric = hasPositiveEngagementRate
    ? 'engagement_rate'
    : hasPositiveEngagement
      ? 'engagement'
      : 'mentions';

  const output: EngagementPoint[] = [];
  for (const row of normalizedRows) {
    const value = row[metric];
    if (value === null || value < 0) {
      continue;
    }
    output.push({
      date: row.date,
      label: row.label,
      value,
    });
  }
  return {
    metric,
    series: output.sort((a, b) => a.date.localeCompare(b.date)),
  };
}

function formatMetricValue(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2);
}

function renderEngagementDecaySection(payload: Record<string, unknown>): ReactNode {
  const { metric, series } = extractEngagementSeries(payload);
  const longestLastingTopic = asString(payload.longest_lasting_topic);
  const fastestFadingTopic = asString(payload.fastest_fading_topic);
  const durabilityScore = asString(payload.virality_durability_score);
  const metricLabel =
    metric === 'engagement_rate' ? 'Engagement Rate' : metric === 'engagement' ? 'Engagement' : 'Mentions';

  if (series.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">No engagement time series available.</p>
        <dl className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded border border-border/70 px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Longest Lasting Topic</dt>
            <dd className="mt-1">{longestLastingTopic}</dd>
          </div>
          <div className="rounded border border-border/70 px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Fastest Fading Topic</dt>
            <dd className="mt-1">{fastestFadingTopic}</dd>
          </div>
          <div className="rounded border border-border/70 px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Virality Durability Score</dt>
            <dd className="mt-1">{durabilityScore}</dd>
          </div>
        </dl>
      </div>
    );
  }

  const width = 720;
  const height = 260;
  const marginTop = 12;
  const marginRight = 14;
  const marginBottom = 38;
  const marginLeft = 44;
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const minValue = Math.min(...series.map((point) => point.value), 0);
  const maxValue = Math.max(...series.map((point) => point.value), 1);
  const valueRange = maxValue - minValue || 1;

  const xAt = (index: number): number => {
    if (series.length === 1) {
      return marginLeft + plotWidth / 2;
    }
    return marginLeft + (index / (series.length - 1)) * plotWidth;
  };
  const yAt = (value: number): number => marginTop + ((maxValue - value) / valueRange) * plotHeight;

  const linePath = series
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xAt(index).toFixed(2)} ${yAt(point.value).toFixed(2)}`)
    .join(' ');

  const midTick = minValue + valueRange / 2;
  const yTicks = [maxValue, midTick, minValue];
  const xLabelIndexes = Array.from(new Set([0, Math.floor((series.length - 1) / 2), series.length - 1]));

  return (
    <div className="space-y-3">
      <div className="rounded border border-border/70 bg-background/40 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">Engagement Trend</p>
        <p className="mb-2 text-xs text-muted-foreground">Metric: {metricLabel}</p>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Engagement Decay Curve"
          data-testid="request-engagement-decay-graph"
          className="h-64 w-full"
        >
          <line
            x1={marginLeft}
            y1={marginTop + plotHeight}
            x2={marginLeft + plotWidth}
            y2={marginTop + plotHeight}
            stroke="currentColor"
            className="text-border/80"
          />
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={marginLeft}
            y2={marginTop + plotHeight}
            stroke="currentColor"
            className="text-border/80"
          />

          {yTicks.map((tick) => {
            const y = yAt(tick);
            return (
              <g key={`y-${tick}`}>
                <line x1={marginLeft} y1={y} x2={marginLeft + plotWidth} y2={y} stroke="currentColor" className="text-border/30" />
                <text x={marginLeft - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {formatMetricValue(tick)}
                </text>
              </g>
            );
          })}

          <path d={linePath} fill="none" stroke="hsl(176 66% 54%)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          {series.map((point, index) => (
            <circle key={`${point.date}-${index}`} cx={xAt(index)} cy={yAt(point.value)} r={3.5} fill="hsl(176 66% 54%)" />
          ))}

          {xLabelIndexes.map((index) => {
            const point = series[index];
            if (!point) {
              return null;
            }
            return (
              <text
                key={`x-${point.date}-${index}`}
                x={xAt(index)}
                y={marginTop + plotHeight + 18}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {point.label}
              </text>
            );
          })}
        </svg>
      </div>

      <dl className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded border border-border/70 px-3 py-2">
          <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Longest Lasting Topic</dt>
          <dd className="mt-1">{longestLastingTopic}</dd>
        </div>
        <div className="rounded border border-border/70 px-3 py-2">
          <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Fastest Fading Topic</dt>
          <dd className="mt-1">{fastestFadingTopic}</dd>
        </div>
        <div className="rounded border border-border/70 px-3 py-2">
          <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Virality Durability Score</dt>
          <dd className="mt-1">{durabilityScore}</dd>
        </div>
      </dl>
    </div>
  );
}

function renderFriendlyValue(value: unknown, keyPath: string): ReactNode {
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) {
      return <span className="text-muted-foreground">—</span>;
    }
    return renderMarkdownText(normalized, keyPath);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }
    return (
      <ol className="list-decimal space-y-2 pl-5">
        {value.map((item, index) => (
          <li key={`${keyPath}-${index}`} className="break-words">
            {renderFriendlyValue(item, `${keyPath}-${index}`)}
          </li>
        ))}
      </ol>
    );
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(asRecord(value));
    if (entries.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }
    return (
      <dl className="space-y-2">
        {entries.map(([nestedKey, nestedValue]) => (
          <div key={`${keyPath}-${nestedKey}`} className="rounded border border-border/50 px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{toLabel(nestedKey)}</dt>
            <dd className="mt-1 break-words">{renderFriendlyValue(nestedValue, `${keyPath}-${nestedKey}`)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return <span className="text-muted-foreground">—</span>;
}

function renderStanceSection(payload: Record<string, unknown>): ReactNode {
  const breakdown = asRecord(payload.stance_breakdown);
  const rows = [
    ['Strongly Support', breakdown.strongly_support],
    ['Support', breakdown.support],
    ['Neutral', breakdown.neutral],
    ['Oppose', breakdown.oppose],
    ['Strongly Oppose', breakdown.strongly_oppose],
  ];
  return (
    <div className="space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between rounded border border-border/70 px-3 py-2 text-sm">
          <span>{label}</span>
          <span>{asString(value, '0')}</span>
        </div>
      ))}
    </div>
  );
}

function renderTopicSection(payload: Record<string, unknown>): ReactNode {
  const topics = asObjectList(payload.topic_ranking_table);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/70 text-muted-foreground">
            <th className="px-2 py-1">Topic</th>
            <th className="px-2 py-1">Engagement</th>
            <th className="px-2 py-1">Sentiment</th>
            <th className="px-2 py-1">Share</th>
          </tr>
        </thead>
        <tbody>
          {topics.length === 0 && (
            <tr>
              <td className="px-2 py-2 text-muted-foreground" colSpan={4}>
                No topic rows.
              </td>
            </tr>
          )}
          {topics.map((row, index) => (
            <tr key={`${asString(row.topic, 'topic')}-${index}`} className="border-b border-border/50">
              <td className="px-2 py-2">{asString(row.topic)}</td>
              <td className="px-2 py-2">{asString(row.engagement, '0')}</td>
              <td className="px-2 py-2">{asString(row.sentiment)}</td>
              <td className="px-2 py-2">{asString(row.share_of_volume_pct, '0')}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderDefaultSection(payload: Record<string, unknown>): ReactNode {
  const entries = Object.entries(payload);
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No section details available.</p>;
  }
  return (
    <dl className="space-y-2 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded border border-border/70 px-3 py-2">
          <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{toLabel(key)}</dt>
          <dd className="mt-1 break-words">{renderFriendlyValue(value, key)}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderSection(section: RequestAnalysisSectionRecord): ReactNode {
  const payload = asRecord(section.payload);
  switch (section.key) {
    case 'stance_distribution_analysis':
      return renderStanceSection(payload);
    case 'topic_cluster_analysis':
      return renderTopicSection(payload);
    case 'engagement_decay_curve':
      return renderEngagementDecaySection(payload);
    default:
      return renderDefaultSection(payload);
  }
}

export function RequestTemplateAnalysisDocument({ document }: { document: RequestAnalysisDocumentRecord }) {
  return (
    <div className="space-y-4" data-testid="request-template-analysis-document">
      {document.sections.map((section) => (
        <section
          key={section.key}
          data-testid={`request-template-section-${section.key}`}
          className="rounded-lg border border-border bg-card p-4"
        >
          <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
          {renderSection(section)}
        </section>
      ))}
    </div>
  );
}
