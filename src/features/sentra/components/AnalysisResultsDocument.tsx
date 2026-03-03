import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { getAnalysisDocument, type AnalysisDocumentResponse } from '@/features/sentra/api/analytics';

interface AnalysisResultsDocumentProps {
  query: string;
  jobId?: string;
}

const SECTION_DEFS = [
  { key: 'cover', title: 'Cover' },
  { key: 'executive_key_metrics', title: 'Executive Key Metrics' },
  { key: 'sentiment_emotional_distribution', title: 'Sentiment Emotional Distribution' },
  { key: 'stance_distribution_analysis', title: 'Stance Distribution Analysis' },
  { key: 'stance_drivers', title: 'Stance Drivers' },
  { key: 'negative_reception_analysis', title: 'Negative Reception Analysis' },
  { key: 'topic_cluster_analysis', title: 'Topic Cluster Analysis' },
  { key: 'engagement_decay_curve', title: 'Engagement Decay Curve' },
  { key: 'audience_behavior_insights', title: 'Audience Behavior Insights' },
  { key: 'ai_strategic_insight_summary', title: 'AI Strategic Insight Summary' },
  { key: 'campaign_predictions', title: 'Campaign Predictions' },
  { key: 'strategic_conclusion', title: 'Strategic Conclusion' },
] as const;

type SectionKey = (typeof SECTION_DEFS)[number]['key'];

const STANCE_BUCKETS: Array<{ key: string; label: string }> = [
  { key: 'strongly_support', label: 'Strongly Support' },
  { key: 'support', label: 'Support' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'oppose', label: 'Oppose' },
  { key: 'strongly_oppose', label: 'Strongly Oppose' },
];

const EMOTION_BUCKETS: Array<{ key: string; label: string }> = [
  { key: 'supportive', label: 'Supportive' },
  { key: 'curious', label: 'Curious' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'critical', label: 'Critical' },
  { key: 'concerned', label: 'Concerned' },
  { key: 'dismissive', label: 'Dismissive' },
  { key: 'angry', label: 'Angry' },
  { key: 'humorous', label: 'Humorous' },
  { key: 'hopeful', label: 'Hopeful' },
];

interface ChartDatum {
  label: string;
  value: number;
}

const TEXT_PREVIEW_CHARS = 220;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function asObjectList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord);
}

function asString(value: unknown, fallback = '—'): string {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
}

function formatPercent(value: unknown): string {
  const parsed = asNumber(value);
  return `${Math.round(parsed)}%`;
}

function shouldCollapseText(text: string): boolean {
  return text.length > TEXT_PREVIEW_CHARS;
}

function textPreview(text: string): string {
  if (!shouldCollapseText(text)) {
    return text;
  }
  return `${text.slice(0, TEXT_PREVIEW_CHARS).trimEnd()}...`;
}

function sectionMetrics(section: Record<string, unknown>): Record<string, unknown> {
  const nested = asRecord(section.metrics);
  return Object.keys(nested).length > 0 ? nested : section;
}

function createDefaultSections(query: string): Record<SectionKey, Record<string, unknown>> {
  return {
    cover: {
      title: 'Analysis Results Document',
      campaign_name: query || 'Campaign Analysis',
    },
    executive_key_metrics: {
      total_mentions: 0,
      engagement_rate: 0,
      net_sentiment_score: 0,
      dominant_topic: 'unknown',
      summary: 'No summary available yet.',
    },
    sentiment_emotional_distribution: {
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      emotion: Object.fromEntries(EMOTION_BUCKETS.map((item) => [item.key, 0])),
    },
    stance_distribution_analysis: {
      strongly_support: 0,
      support: 0,
      neutral: 0,
      oppose: 0,
      strongly_oppose: 0,
      support_vs_opposition_ratio: { support: 0, opposition: 0 },
      net_stance_score: 0,
    },
    stance_drivers: {
      support_themes: [],
      opposition_themes: [],
      representative_quotes: [],
    },
    negative_reception_analysis: {
      top_negative_topics: [],
      outlier_signals: [],
    },
    topic_cluster_analysis: {
      topics: [],
      total_topics: 0,
    },
    engagement_decay_curve: {
      daily_metrics: [],
      sentiment_timeseries: [],
    },
    audience_behavior_insights: {
      platform_sentiment: [],
      high_intent_signals: [],
    },
    ai_strategic_insight_summary: {
      summary: 'No strategic summary available yet.',
      top_opportunities: [],
      top_risks: [],
    },
    campaign_predictions: {
      engagement_outlook: 'stable',
      risk_tier: 'low',
      projected_drivers: [],
    },
    strategic_conclusion: {
      narrative: 'No conclusion available yet.',
      recommendations: [],
    },
  };
}

function fallbackDocument(query: string): AnalysisDocumentResponse {
  const campaignName = query.trim() || 'Campaign Analysis';
  return {
    job_id: '',
    meta: {
      campaign_name: campaignName,
      generated_at: new Date().toISOString(),
      confidentiality_level: 'internal',
    },
    sections: createDefaultSections(campaignName),
  };
}

function normalizeDocument(payload: AnalysisDocumentResponse | null | undefined, query: string): AnalysisDocumentResponse {
  const fallback = fallbackDocument(query);
  if (!payload) {
    return fallback;
  }

  const normalizedMeta = {
    ...fallback.meta,
    ...asRecord(payload.meta),
  };

  const normalizedSections: Record<string, unknown> = {
    ...fallback.sections,
  };
  const incomingSections = asRecord(payload.sections);
  for (const section of SECTION_DEFS) {
    if (section.key in incomingSections) {
      normalizedSections[section.key] = incomingSections[section.key];
    }
  }

  return {
    job_id: asString(payload.job_id, ''),
    meta: normalizedMeta,
    sections: normalizedSections,
  };
}

function BarList({ items, barClassName = 'bg-[#3FD6D0]/70' }: { items: ChartDatum[]; barClassName?: string }) {
  const max = Math.max(...items.map((item) => item.value), 0);
  const safeMax = max > 0 ? max : 1;

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const widthPercent = (item.value / safeMax) * 100;
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className={`h-2 rounded-full ${barClassName}`} style={{ width: `${widthPercent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4" data-testid={`analysis-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function renderCover(section: Record<string, unknown>, campaignName: string): ReactNode {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{asString(section.title, 'Analysis Results Document')}</p>
      <p className="text-xl font-semibold text-foreground break-words">{asString(section.campaign_name, campaignName)}</p>
    </div>
  );
}

function CollapsibleText({
  text,
  fallback = '—',
  className = 'text-sm text-muted-foreground break-words',
}: {
  text: string;
  fallback?: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const normalized = text.trim();
  const safeText = normalized || fallback;
  const collapsible = shouldCollapseText(safeText);
  const displayText = collapsible && !expanded ? textPreview(safeText) : safeText;

  return (
    <div className="overflow-hidden">
      <p className={className}>{displayText}</p>
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 rounded border border-border px-2 py-1 text-xs text-foreground/80 hover:bg-background/80"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function CollapsibleStringList({
  items,
  emptyMessage,
}: {
  items: string[];
  emptyMessage: string;
}) {
  return (
    <ul className="space-y-1 text-sm">
      {items.length === 0 && <li className="text-muted-foreground">{emptyMessage}</li>}
      {items.map((item) => (
        <li key={item} className="break-words">
          <span aria-hidden="true">• </span>
          <CollapsibleText text={item} className="inline text-sm break-words" />
        </li>
      ))}
    </ul>
  );
}

function renderExecutive(section: Record<string, unknown>): ReactNode {
  const metrics = [
    { label: 'Total Mentions', value: asNumber(section.total_mentions).toLocaleString() },
    { label: 'Engagement Rate', value: formatPercent(section.engagement_rate) },
    { label: 'Net Sentiment', value: formatPercent(section.net_sentiment_score) },
    { label: 'Dominant Topic', value: asString(section.dominant_topic) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="overflow-hidden rounded-md border border-border bg-background/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{metric.label}</p>
            <p className="mt-1 break-words text-base font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
      <CollapsibleText text={asString(section.summary, 'No summary available.')} />
    </div>
  );
}

function renderSentimentEmotion(section: Record<string, unknown>): ReactNode {
  const sentiment = asRecord(section.sentiment);
  const emotion = asRecord(section.emotion);

  const sentimentItems: ChartDatum[] = [
    { label: 'Positive', value: asNumber(sentiment.positive) },
    { label: 'Neutral', value: asNumber(sentiment.neutral) },
    { label: 'Negative', value: asNumber(sentiment.negative) },
  ];

  const emotionItems: ChartDatum[] = EMOTION_BUCKETS.map((bucket) => ({
    label: bucket.label,
    value: asNumber(emotion[bucket.key]),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Sentiment</p>
        <BarList items={sentimentItems} barClassName="bg-[#3FD6D0]/70" />
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Emotion</p>
        <BarList items={emotionItems} barClassName="bg-[#FFC043]/70" />
      </div>
    </div>
  );
}

function renderStanceDistribution(section: Record<string, unknown>): ReactNode {
  const ratio = asRecord(section.support_vs_opposition_ratio);
  const items: ChartDatum[] = STANCE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    value: asNumber(section[bucket.key]),
  }));

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <BarList items={items} barClassName="bg-[#3FD6D0]/70" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Support</p>
          <p className="mt-1 text-base font-semibold">{asNumber(ratio.support)}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Opposition</p>
          <p className="mt-1 text-base font-semibold">{asNumber(ratio.opposition)}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Net Stance</p>
          <p className="mt-1 text-base font-semibold">{formatPercent(section.net_stance_score)}</p>
        </div>
      </div>
    </div>
  );
}

function QuoteList({
  rows,
  emptyMessage = 'No representative quotes available.',
}: {
  rows: Record<string, unknown>[];
  emptyMessage?: string;
}) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {rows.slice(0, 5).map((row, index) => {
        const fullText = asString(row.text, '').trim();
        const expanded = Boolean(expandedRows[index]);
        const collapsible = shouldCollapseText(fullText);
        const displayText = collapsible && !expanded ? textPreview(fullText) : fullText;
        return (
          <blockquote key={`${asString(row.text, '')}-${index}`} className="overflow-hidden rounded-md border border-border bg-background/60 p-3">
            <p className="break-words text-sm">{displayText || '—'}</p>
            {collapsible && (
              <button
                type="button"
                onClick={() => setExpandedRows((current) => ({ ...current, [index]: !current[index] }))}
                className="mt-2 rounded border border-border px-2 py-1 text-xs text-foreground/80 hover:bg-background/80"
              >
                {expanded ? 'Read less' : 'Read more'}
              </button>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {asString(row.sentiment, 'neutral')} · {asString(row.source, 'unknown')}
            </p>
          </blockquote>
        );
      })}
    </div>
  );
}

function renderStanceDrivers(section: Record<string, unknown>): ReactNode {
  const supportThemes = asStringList(section.support_themes);
  const oppositionThemes = asStringList(section.opposition_themes);
  const representativeQuotes = asObjectList(section.representative_quotes);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Support Themes</p>
        <CollapsibleStringList items={supportThemes} emptyMessage="No support themes available." />
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Opposition Themes</p>
        <CollapsibleStringList items={oppositionThemes} emptyMessage="No opposition themes available." />
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Representative Quotes</p>
        <QuoteList rows={representativeQuotes} />
      </div>
    </div>
  );
}

function renderNegativeReception(section: Record<string, unknown>): ReactNode {
  const topNegativeTopics = asObjectList(section.top_negative_topics);
  const outlierSignals = asObjectList(section.outlier_signals);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Top Negative Topics</p>
        <ul className="space-y-2 text-sm">
          {topNegativeTopics.length === 0 && <li className="text-muted-foreground">No negative topics available.</li>}
          {topNegativeTopics.slice(0, 5).map((topic, index) => (
            <li key={`${asString(topic.topic, 'unknown')}-${index}`} className="flex items-center justify-between gap-2">
              <span className="break-words">{asString(topic.topic, 'unknown')}</span>
              <span className="text-muted-foreground">{asNumber(topic.mentions)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Outlier Signals</p>
        <QuoteList rows={outlierSignals} emptyMessage="No outlier signals available." />
      </div>
    </div>
  );
}

function renderTopicCluster(section: Record<string, unknown>): ReactNode {
  const topics = asObjectList(section.topics);
  const chartItems: ChartDatum[] = topics.slice(0, 8).map((topic) => ({
    label: asString(topic.topic, 'unknown'),
    value: asNumber(topic.mentions),
  }));

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <BarList items={chartItems} barClassName="bg-[#3FD6D0]/70" />
      </div>
      <p className="text-sm text-muted-foreground">Total topics: {asNumber(section.total_topics)}</p>
    </div>
  );
}

function renderEngagement(section: Record<string, unknown>): ReactNode {
  const dailyMetrics = asObjectList(section.daily_metrics);
  const sentimentTimeseries = asObjectList(section.sentiment_timeseries);

  const mentionBars: ChartDatum[] = dailyMetrics.slice(0, 8).map((point) => ({
    label: asString(point.date, ''),
    value: asNumber(point.mentions),
  }));
  const netSentimentBars: ChartDatum[] = sentimentTimeseries.slice(0, 8).map((point) => ({
    label: asString(point.date, ''),
    value: asNumber(point.positive) - asNumber(point.negative),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Daily Mentions</p>
        <BarList items={mentionBars} barClassName="bg-[#3FD6D0]/70" />
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Net Sentiment by Day</p>
        <BarList items={netSentimentBars} barClassName="bg-[#FFC043]/70" />
      </div>
    </div>
  );
}

function renderAudienceBehavior(section: Record<string, unknown>): ReactNode {
  const platformSentiment = asObjectList(section.platform_sentiment);
  const highIntentSignals = asObjectList(section.high_intent_signals);
  const platformBars: ChartDatum[] = platformSentiment.map((row) => ({
    label: asString(row.source, 'unknown'),
    value: asNumber(row.positive) - asNumber(row.negative),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Platform Sentiment Balance</p>
        <BarList items={platformBars} barClassName="bg-[#3FD6D0]/70" />
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">High Intent Signals</p>
        <QuoteList rows={highIntentSignals} emptyMessage="No high intent signals available." />
      </div>
    </div>
  );
}

function renderStrategicInsight(section: Record<string, unknown>): ReactNode {
  const opportunities = asStringList(section.top_opportunities);
  const risks = asStringList(section.top_risks);

  return (
    <div className="space-y-4" data-testid="strategic-insight-layout">
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Summary</p>
        <CollapsibleText text={asString(section.summary, 'No strategic summary available.')} />
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Top Opportunities</p>
        <CollapsibleStringList items={opportunities} emptyMessage="No opportunities available." />
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Top Risks</p>
        <CollapsibleStringList items={risks} emptyMessage="No risks available." />
      </div>
    </div>
  );
}

function renderPredictions(section: Record<string, unknown>): ReactNode {
  const projectedDrivers = asStringList(section.projected_drivers);
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-border p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Engagement Outlook</p>
          <p className="mt-1 text-base font-semibold">{asString(section.engagement_outlook, 'stable')}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Risk Tier</p>
          <p className="mt-1 text-base font-semibold">{asString(section.risk_tier, 'low')}</p>
        </div>
      </div>
      <div className="rounded-md border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Projected Drivers</p>
        <CollapsibleStringList items={projectedDrivers} emptyMessage="No projected drivers available." />
      </div>
    </div>
  );
}

function renderConclusion(section: Record<string, unknown>): ReactNode {
  const recommendations = asStringList(section.recommendations);
  return (
    <div className="space-y-3">
      <CollapsibleText text={asString(section.narrative, 'No conclusion available.')} />
      <CollapsibleStringList items={recommendations} emptyMessage="No recommendations available." />
    </div>
  );
}

function renderSection(key: SectionKey, section: Record<string, unknown>, campaignName: string): ReactNode {
  const normalized = sectionMetrics(section);
  switch (key) {
    case 'cover':
      return renderCover(normalized, campaignName);
    case 'executive_key_metrics':
      return renderExecutive(normalized);
    case 'sentiment_emotional_distribution':
      return renderSentimentEmotion(normalized);
    case 'stance_distribution_analysis':
      return renderStanceDistribution(normalized);
    case 'stance_drivers':
      return renderStanceDrivers(normalized);
    case 'negative_reception_analysis':
      return renderNegativeReception(normalized);
    case 'topic_cluster_analysis':
      return renderTopicCluster(normalized);
    case 'engagement_decay_curve':
      return renderEngagement(normalized);
    case 'audience_behavior_insights':
      return renderAudienceBehavior(normalized);
    case 'ai_strategic_insight_summary':
      return renderStrategicInsight(normalized);
    case 'campaign_predictions':
      return renderPredictions(normalized);
    case 'strategic_conclusion':
      return renderConclusion(normalized);
    default:
      return null;
  }
}

export function AnalysisResultsDocument({ query, jobId }: AnalysisResultsDocumentProps) {
  const [documentPayload, setDocumentPayload] = useState<AnalysisDocumentResponse>(() => fallbackDocument(query));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!jobId) {
      setDocumentPayload(fallbackDocument(query));
      setIsLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        const payload = await getAnalysisDocument(jobId);
        if (isCancelled) {
          return;
        }
        setDocumentPayload(normalizeDocument(payload, query));
      } catch (caught) {
        if (isCancelled) {
          return;
        }
        const message = caught instanceof Error ? caught.message : 'Could not load analysis results document.';
        setError(message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [jobId, query, reloadToken]);

  const campaignName = useMemo(() => {
    const meta = asRecord(documentPayload.meta);
    return asString(meta.campaign_name, query || 'Campaign Analysis');
  }, [documentPayload.meta, query]);

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6" data-testid="analysis-document-error">
        <p className="text-sm text-muted-foreground">Could not load analysis results document.</p>
        <button
          type="button"
          onClick={() => setReloadToken((value) => value + 1)}
          className="mt-3 rounded border border-border px-3 py-1.5 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const sections = asRecord(documentPayload.sections);

  return (
    <div className="space-y-4 p-4" data-testid="analysis-results-document">
      <div className="rounded-lg border border-border bg-background/60 p-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Analysis Results Document</p>
        <p className="mt-1 break-words text-base font-semibold">{campaignName}</p>
        <p className="mt-1 break-words text-xs text-muted-foreground">{query || 'Query not provided'}</p>
        {isLoading && <p className="mt-2 text-xs text-muted-foreground">Loading latest analysis data...</p>}
      </div>

      {SECTION_DEFS.map((section) => {
        const sectionPayload = asRecord(sections[section.key]);
        return (
          <SectionCard key={section.key} title={section.title}>
            {renderSection(section.key, sectionPayload, campaignName)}
          </SectionCard>
        );
      })}
    </div>
  );
}
