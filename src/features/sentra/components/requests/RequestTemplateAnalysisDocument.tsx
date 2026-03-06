import type { ReactNode } from 'react';

import type { RequestAnalysisDocumentRecord, RequestAnalysisSectionRecord } from '@/features/sentra/types/formRequest';

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asObjectList(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null) : [];
}

function asString(value: unknown, fallback = '—'): string {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
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
          <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{key.replace(/_/g, ' ')}</dt>
          <dd className="mt-1 break-words">{asString(value)}</dd>
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
