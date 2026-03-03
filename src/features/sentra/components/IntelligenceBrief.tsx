import { AlertTriangle, ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getOverview,
  getSentimentByTopic,
  getSentimentExamples,
  getSentimentOverview,
  getSentimentTimeseries,
  SentimentByTopicItem,
  SentimentExampleItem,
  SentimentTimeseriesPoint,
} from '@/features/sentra/api/analytics';

interface IntelligenceBriefProps {
  query: string;
  jobId?: string;
}

interface SentimentDistributionItem {
  name: 'Negative' | 'Positive' | 'Neutral';
  value: number;
  color: string;
}

interface NarrativeCluster {
  title: string;
  share: number;
  trend: 'up' | 'down' | 'stable';
  claims: string[];
}

interface EvidenceRow {
  source: string;
  timestamp: string;
  language: string;
  snippet: string;
  label: 'Positive' | 'Neutral' | 'Negative';
}

interface RiskSignal {
  title: string;
  detail: string;
}

const COLORS = {
  negative: '#FFC043',
  positive: '#3FD6D0',
  neutral: '#6B7280',
};

function normalizeTrend(points: SentimentTimeseriesPoint[]) {
  return points.map((point) => ({
    date: point.date,
    positive: point.positive,
    negative: point.negative,
    neutral: point.neutral,
  }));
}

function toDistribution(positive: number, neutral: number, negative: number): SentimentDistributionItem[] {
  const total = positive + neutral + negative;
  if (total <= 0) {
    return [];
  }

  return [
    { name: 'Negative', value: Math.round((negative / total) * 100), color: COLORS.negative },
    { name: 'Positive', value: Math.round((positive / total) * 100), color: COLORS.positive },
    { name: 'Neutral', value: Math.round((neutral / total) * 100), color: COLORS.neutral },
  ];
}

function sentimentIndex(positive: number, neutral: number, negative: number): number | null {
  const total = positive + neutral + negative;
  if (total <= 0) {
    return null;
  }
  return Math.round(((positive - negative) / total) * 100);
}

function sentimentIndexFromPoint(point: SentimentTimeseriesPoint): number | null {
  return sentimentIndex(point.positive, point.neutral, point.negative);
}

function computeIndexDelta(points: SentimentTimeseriesPoint[]): number | null {
  if (points.length < 2) {
    return null;
  }
  const latest = sentimentIndexFromPoint(points[points.length - 1]);
  const previous = sentimentIndexFromPoint(points[points.length - 2]);
  if (latest === null || previous === null) {
    return null;
  }
  return latest - previous;
}

function titleFromTopic(topic: string): string {
  const normalized = topic.trim();
  if (!normalized || normalized.toLowerCase() === 'unknown') {
    return 'Unclassified Narrative';
  }
  return normalized;
}

function toNarrativeClusters(items: SentimentByTopicItem[]): NarrativeCluster[] {
  const usable = items.filter((item) => item.topic.trim().length > 0);
  const totals = usable.map((item) => ({
    ...item,
    mentions: item.positive + item.neutral + item.negative,
  }));
  const allMentions = totals.reduce((sum, item) => sum + item.mentions, 0);
  if (allMentions <= 0) {
    return [];
  }

  return totals
    .filter((item) => item.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 6)
    .map((item) => {
      const negativeShare = item.mentions > 0 ? Math.round((item.negative / item.mentions) * 100) : 0;
      const positiveShare = item.mentions > 0 ? Math.round((item.positive / item.mentions) * 100) : 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (negativeShare - positiveShare >= 10) {
        trend = 'up';
      } else if (positiveShare - negativeShare >= 10) {
        trend = 'down';
      }

      return {
        title: titleFromTopic(item.topic),
        share: Math.round((item.mentions / allMentions) * 100),
        trend,
        claims: [
          `${item.mentions} topic-labeled mentions in this job.`,
          `Sentiment split: ${positiveShare}% positive, ${negativeShare}% negative.`,
        ],
      };
    });
}

function formatTimestamp(value?: string | null): string {
  if (!value) {
    return '—';
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }
  return new Date(parsed).toISOString().replace('T', ' ').replace('Z', ' UTC');
}

function toEvidenceRows(items: SentimentExampleItem[]): EvidenceRow[] {
  const rows = items
    .map((item) => {
      const sentiment = String(item.sentiment || 'neutral').toLowerCase();
      const label: EvidenceRow['label'] =
        sentiment === 'positive' ? 'Positive' : sentiment === 'negative' ? 'Negative' : 'Neutral';
      return {
        source: item.source || 'unknown',
        timestamp: formatTimestamp(item.timestamp),
        language: '—',
        snippet: item.text || '',
        label,
      };
    })
    .filter((row) => row.snippet.trim().length > 0);
  return rows.slice(0, 20);
}

function buildRiskSignals(
  trend: SentimentTimeseriesPoint[],
  distribution: { positive: number; neutral: number; negative: number } | null,
  evidenceRows: EvidenceRow[],
): RiskSignal[] {
  const signals: RiskSignal[] = [];

  if (trend.length >= 2) {
    const latest = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    if (previous.negative > 0) {
      const delta = Math.round(((latest.negative - previous.negative) / previous.negative) * 100);
      if (delta >= 10) {
        signals.push({
          title: 'Negative momentum spike',
          detail: `Negative mentions rose ${delta}% versus the prior day in the tracked window.`,
        });
      }
    }

    const idxDelta = computeIndexDelta(trend);
    if (idxDelta !== null && Math.abs(idxDelta) >= 8) {
      signals.push({
        title: 'Sentiment inversion risk',
        detail: `Sentiment index moved ${idxDelta > 0 ? '+' : ''}${idxDelta} points since the previous sample.`,
      });
    }
  }

  if (distribution) {
    const total = distribution.positive + distribution.neutral + distribution.negative;
    if (total > 0) {
      const negativeShare = Math.round((distribution.negative / total) * 100);
      if (negativeShare >= 60) {
        signals.push({
          title: 'High negative concentration',
          detail: `${negativeShare}% of labeled content is currently negative.`,
        });
      }
    }
  }

  if (evidenceRows.length > 0) {
    const buckets = new Map<string, number>();
    for (const row of evidenceRows) {
      const key = row.snippet.slice(0, 80).toLowerCase();
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const repeated = [...buckets.values()].filter((count) => count > 1).reduce((sum, count) => sum + count, 0);
    if (repeated >= 3) {
      const concentration = Math.round((repeated / evidenceRows.length) * 100);
      signals.push({
        title: 'Potential coordination cluster',
        detail: `${concentration}% of sampled evidence shares repeated phrasing patterns.`,
      });
    }
  }

  return signals.slice(0, 3);
}

export function IntelligenceBrief({ query, jobId }: IntelligenceBriefProps) {
  const [expandedEvidence, setExpandedEvidence] = useState(false);
  const [backendSummary, setBackendSummary] = useState<string | null>(null);
  const [backendTrend, setBackendTrend] = useState<SentimentTimeseriesPoint[]>([]);
  const [backendDistribution, setBackendDistribution] = useState<{
    positive: number;
    neutral: number;
    negative: number;
  } | null>(null);
  const [backendTopics, setBackendTopics] = useState<SentimentByTopicItem[]>([]);
  const [backendExamples, setBackendExamples] = useState<SentimentExampleItem[]>([]);

  useEffect(() => {
    if (!jobId) {
      setBackendSummary(null);
      setBackendTrend([]);
      setBackendDistribution(null);
      setBackendTopics([]);
      setBackendExamples([]);
      return;
    }

    let isCancelled = false;

    const load = async () => {
      const [overviewResult, sentimentOverviewResult, timeseriesResult, topicResult, examplesResult] =
        await Promise.allSettled([
          getOverview(jobId),
          getSentimentOverview(jobId),
          getSentimentTimeseries(jobId),
          getSentimentByTopic(jobId),
          getSentimentExamples(jobId, 20),
        ]);

      if (isCancelled) {
        return;
      }

      if (overviewResult.status === 'fulfilled') {
        setBackendSummary(overviewResult.value.summary || null);
      } else {
        setBackendSummary(null);
      }

      if (sentimentOverviewResult.status === 'fulfilled') {
        setBackendDistribution({
          positive: sentimentOverviewResult.value.positive,
          neutral: sentimentOverviewResult.value.neutral,
          negative: sentimentOverviewResult.value.negative,
        });
      } else {
        setBackendDistribution(null);
      }

      if (timeseriesResult.status === 'fulfilled') {
        setBackendTrend(timeseriesResult.value.items || []);
      } else {
        setBackendTrend([]);
      }

      if (topicResult.status === 'fulfilled') {
        setBackendTopics(topicResult.value.items || []);
      } else {
        setBackendTopics([]);
      }

      if (examplesResult.status === 'fulfilled') {
        setBackendExamples(examplesResult.value.items || []);
      } else {
        setBackendExamples([]);
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [jobId]);

  const sentimentTrend = useMemo(() => normalizeTrend(backendTrend), [backendTrend]);
  const sentimentDistribution = useMemo(() => {
    if (!backendDistribution) {
      return [];
    }
    return toDistribution(
      backendDistribution.positive,
      backendDistribution.neutral,
      backendDistribution.negative,
    );
  }, [backendDistribution]);

  const currentIndex = useMemo(() => {
    if (!backendDistribution) {
      return null;
    }
    return sentimentIndex(backendDistribution.positive, backendDistribution.neutral, backendDistribution.negative);
  }, [backendDistribution]);

  const indexDelta = useMemo(() => computeIndexDelta(backendTrend), [backendTrend]);

  const narrativeClusters = useMemo(() => toNarrativeClusters(backendTopics), [backendTopics]);
  const narrativeShare = useMemo(
    () => narrativeClusters.map((cluster) => ({ name: cluster.title, value: cluster.share })),
    [narrativeClusters],
  );

  const evidenceData = useMemo(() => toEvidenceRows(backendExamples), [backendExamples]);

  const riskSignals = useMemo(
    () => buildRiskSignals(backendTrend, backendDistribution, evidenceData),
    [backendTrend, backendDistribution, evidenceData],
  );

  return (
    <div className="space-y-8 px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-sm text-muted-foreground">
          <span className="opacity-50">Query:</span> {query}
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Executive Summary</div>
          <p className="leading-relaxed text-foreground">{backendSummary ?? 'Summary is not available yet for this job.'}</p>
          {currentIndex !== null && (
            <div className="flex items-baseline gap-3 pt-4">
              <div className="font-mono text-5xl text-[#FFC043]">{currentIndex > 0 ? `+${currentIndex}` : currentIndex}</div>
              <div className="space-y-0.5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Sentiment Index</div>
                {indexDelta !== null && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {indexDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {indexDelta > 0 ? '+' : ''}
                    {indexDelta} pts vs previous sample
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {(sentimentDistribution.length > 0 || sentimentTrend.length > 0 || narrativeShare.length > 0) && (
          <div className="grid grid-cols-2 gap-6">
            {sentimentDistribution.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Sentiment Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={sentimentDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                      {sentimentDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2D3033',
                        border: '1px solid #3D3F43',
                        borderRadius: '6px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center gap-4 text-xs">
                  {sentimentDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-mono">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sentimentTrend.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Sentiment Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sentimentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3D3F43" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8B8B8D' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#8B8B8D' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2D3033',
                        border: '1px solid #3D3F43',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {narrativeShare.length > 0 && (
              <div className="col-span-2 rounded-lg border border-border bg-card p-6">
                <div className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Narrative Share</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={narrativeShare} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#3D3F43" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#8B8B8D' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8B8B8D' }} width={220} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2D3033',
                        border: '1px solid #3D3F43',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill={COLORS.positive} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {narrativeClusters.length > 0 && (
          <div className="space-y-6 rounded-lg border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">What's Driving It</div>
            <div className="space-y-4">
              {narrativeClusters.map((narrative, index) => (
                <div key={index} className="space-y-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-foreground">{narrative.title}</h4>
                        {narrative.trend === 'up' && <TrendingUp className="h-4 w-4 text-[#FFC043]" />}
                        {narrative.trend === 'down' && <TrendingDown className="h-4 w-4 text-[#3FD6D0]" />}
                      </div>
                    </div>
                    <div className="font-mono text-sm text-muted-foreground">{narrative.share}%</div>
                  </div>
                  <div className="space-y-2">
                    {narrative.claims.map((claim, claimIndex) => (
                      <div key={claimIndex} className="border-l-2 border-border pl-4 text-sm text-muted-foreground">
                        {claim}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {riskSignals.length > 0 && (
          <div className="space-y-4 rounded-lg border border-[#FFC043]/30 bg-card p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#FFC043]">
              <AlertTriangle className="h-4 w-4" />
              Risk Signals
            </div>
            <div className="space-y-3 text-sm">
              {riskSignals.map((signal) => (
                <div key={signal.title} className="flex items-start gap-3">
                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FFC043]" />
                  <div>
                    <span className="text-foreground">{signal.title}:</span>
                    <span className="ml-2 text-muted-foreground">{signal.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {evidenceData.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setExpandedEvidence((value) => !value)}
              className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-card/80"
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Evidence ({evidenceData.length} rows)</div>
              {expandedEvidence ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {expandedEvidence && (
              <div className="border-t border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Source</th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Lang</th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Snippet</th>
                        <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Label</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {evidenceData.map((item, index) => (
                        <tr key={index} className="transition-colors hover:bg-muted/10">
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{item.source}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{item.timestamp}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{item.language}</td>
                          <td className="max-w-md truncate px-6 py-4 text-foreground">{item.snippet}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded px-2 py-1 text-xs ${
                                item.label === 'Negative'
                                  ? 'bg-[#FFC043]/20 text-[#FFC043]'
                                  : item.label === 'Positive'
                                    ? 'bg-[#3FD6D0]/20 text-[#3FD6D0]'
                                    : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {item.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            className="rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Compare vs previous period
          </button>
          <button
            type="button"
            className="rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Show top narratives
          </button>
          <button
            type="button"
            className="rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Explain latest shift
          </button>
          <button
            type="button"
            className="rounded border border-[#3FD6D0] px-4 py-2 text-sm transition-colors hover:bg-[#3FD6D0] hover:text-[#0F1113]"
          >
            Export PDF brief
          </button>
        </div>
      </div>
    </div>
  );
}
