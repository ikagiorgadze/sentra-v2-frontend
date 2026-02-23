import { AlertTriangle, ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
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

interface IntelligenceBriefProps {
  query: string;
}

export function IntelligenceBrief({ query }: IntelligenceBriefProps) {
  const [expandedEvidence, setExpandedEvidence] = useState(false);

  const sentimentTrend = [
    { date: 'Feb 4', positive: 42, negative: 35, neutral: 23 },
    { date: 'Feb 5', positive: 38, negative: 40, neutral: 22 },
    { date: 'Feb 6', positive: 35, negative: 48, neutral: 17 },
    { date: 'Feb 7', positive: 32, negative: 52, neutral: 16 },
    { date: 'Feb 8', positive: 28, negative: 58, neutral: 14 },
    { date: 'Feb 9', positive: 25, negative: 62, neutral: 13 },
    { date: 'Feb 10', positive: 22, negative: 66, neutral: 12 },
  ];

  const sentimentDistribution = [
    { name: 'Negative', value: 66, color: '#FFC043' },
    { name: 'Positive', value: 22, color: '#3FD6D0' },
    { name: 'Neutral', value: 12, color: '#6B7280' },
  ];

  const narrativeClusters = [
    {
      title: 'Economic Impact Concerns',
      share: 42,
      trend: 'up',
      claims: [
        'Policy will burden small businesses with increased costs',
        'Unemployment projections revised upward by independent analysts',
      ],
    },
    {
      title: 'Institutional Trust Erosion',
      share: 28,
      trend: 'up',
      claims: [
        'Government transparency questioned by civic groups',
        'Previous reform promises remain unfulfilled',
      ],
    },
    {
      title: 'Social Equity Arguments',
      share: 18,
      trend: 'stable',
      claims: [
        'Vulnerable populations disproportionately affected',
        'Regional disparities in policy implementation expected',
      ],
    },
    {
      title: 'Implementation Skepticism',
      share: 12,
      trend: 'down',
      claims: [
        'Timeline deemed unrealistic by industry experts',
        'Infrastructure readiness concerns raised',
      ],
    },
  ];

  const narrativeShare = narrativeClusters.map((n) => ({
    name: n.title,
    value: n.share,
  }));

  const evidenceData = [
    {
      source: 'reddit.com/r/romania',
      timestamp: '2026-02-10 14:23',
      language: 'RO',
      snippet: 'Reforma asta va distruge micile afaceri. Costurile vor exploda și...',
      label: 'Negative',
    },
    {
      source: 'facebook.com/public',
      timestamp: '2026-02-10 13:45',
      language: 'RO',
      snippet: 'Am zero încredere că guvernul va implementa asta corect bazat pe...',
      label: 'Negative',
    },
    {
      source: 'twitter.com',
      timestamp: '2026-02-10 12:18',
      language: 'EN',
      snippet: 'Romania pension reform showing similar patterns to failed Czech attempt...',
      label: 'Negative',
    },
    {
      source: 'hotnews.ro/comments',
      timestamp: '2026-02-10 11:52',
      language: 'RO',
      snippet: 'În sfârșit o decizie bună pentru pensionari. E timpul să...',
      label: 'Positive',
    },
    {
      source: 'forum.softpedia.com',
      timestamp: '2026-02-10 10:34',
      language: 'RO',
      snippet: 'Neutru față de reformă dar îngrijorat de timing și execuție...',
      label: 'Neutral',
    },
  ];

  return (
    <div className="space-y-8 px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-sm text-muted-foreground">
          <span className="opacity-50">Query:</span> {query}
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Executive Summary</div>
          <p className="leading-relaxed text-foreground">
            Public sentiment shows strong negative shift regarding pension reform in Romania over the past 7 days.
            Primary concerns center on economic impact and implementation credibility.
          </p>
          <div className="flex items-baseline gap-3 pt-4">
            <div className="font-mono text-5xl text-[#FFC043]">-44</div>
            <div className="space-y-0.5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Sentiment Index</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                -18 pts from last week
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
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

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Sentiment Trend (7 Days)</div>
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
                <Line type="monotone" dataKey="positive" stroke="#3FD6D0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="negative" stroke="#FFC043" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Narrative Share</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={narrativeShare} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#3D3F43" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8B8B8D' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8B8B8D' }} width={180} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2D3033',
                    border: '1px solid #3D3F43',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#3FD6D0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
                      "{claim}"
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-[#FFC043]/30 bg-card p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#FFC043]">
            <AlertTriangle className="h-4 w-4" />
            Risk Signals
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FFC043]" />
              <div>
                <span className="text-foreground">Anomaly detected:</span>
                <span className="ml-2 text-muted-foreground">
                  43% surge in negative posts from new accounts (created {'<'}30 days)
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FFC043]" />
              <div>
                <span className="text-foreground">Coordination likelihood:</span>
                <span className="ml-2 text-muted-foreground">
                  Medium (67%) — Similar phrasing detected across 12 distinct sources
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FFC043]" />
              <div>
                <span className="text-foreground">Sudden inversion risk:</span>
                <span className="ml-2 text-muted-foreground">
                  Monitoring for reversal patterns in next 48-72 hours
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <button
            type="button"
            onClick={() => setExpandedEvidence((value) => !value)}
            className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Evidence ({evidenceData.length} sources)</div>
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

        <div className="flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            className="rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Compare vs last month
          </button>
          <button
            type="button"
            className="rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Split by region
          </button>
          <button
            type="button"
            className="rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Show top sources
          </button>
          <button
            type="button"
            className="rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Explain why sentiment dropped
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
