import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RequestTemplateAnalysisDocument } from '@/features/sentra/components/requests/RequestTemplateAnalysisDocument';
import type { RequestAnalysisDocumentRecord } from '@/features/sentra/types/formRequest';

const SAMPLE_DOCUMENT: RequestAnalysisDocumentRecord = {
  meta: {
    request_id: 'request-1',
    job_id: 'job-1',
    report_contract: 'request_template_v1',
    generated_at: '2026-03-06T12:00:00Z',
    primary_entity: 'Acme Telecom',
  },
  sections: [
    { key: 'cover_page', title: 'Cover Page', payload: {} },
    { key: 'executive_key_metrics_panel', title: 'Executive Key Metrics Panel', payload: {} },
    { key: 'sentiment_emotional_distribution', title: 'Sentiment & Emotional Distribution', payload: {} },
    {
      key: 'stance_distribution_analysis',
      title: 'Stance Distribution Analysis',
      payload: {
        stance_breakdown: { strongly_support: 1, support: 2, neutral: 3, oppose: 4, strongly_oppose: 5 },
      },
    },
    { key: 'negative_reception_analysis', title: 'Negative Reception Analysis', payload: {} },
    {
      key: 'topic_cluster_analysis',
      title: 'Topic Cluster Analysis',
      payload: {
        topic_ranking_table: [{ topic: 'pricing', engagement: 20, sentiment: 'critical', share_of_volume_pct: 40 }],
      },
    },
    { key: 'engagement_decay_curve', title: 'Engagement Decay Curve', payload: {} },
    { key: 'influencer_impact_analysis', title: 'Influencer Impact Analysis', payload: {} },
    { key: 'audience_behavior_insights', title: 'Audience Behavior Insights', payload: {} },
    { key: 'ai_strategic_insight_summary', title: 'AI Strategic Insight Summary', payload: {} },
    { key: 'campaign_predictions', title: 'Campaign Predictions', payload: {} },
    { key: 'strategic_conclusion', title: 'Strategic Conclusion', payload: {} },
  ],
};

describe('request template analysis document', () => {
  it('renders all template sections in strict order', () => {
    render(<RequestTemplateAnalysisDocument document={SAMPLE_DOCUMENT} />);

    const headings = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent?.trim() ?? '');
    expect(headings).toEqual(SAMPLE_DOCUMENT.sections.map((section) => section.title));
  });

  it('renders stance and topic ranking interactive blocks', () => {
    render(<RequestTemplateAnalysisDocument document={SAMPLE_DOCUMENT} />);

    const stanceSection = screen.getByTestId('request-template-section-stance_distribution_analysis');
    expect(within(stanceSection).getByText(/strongly support/i)).toBeInTheDocument();
    const topicSection = screen.getByTestId('request-template-section-topic_cluster_analysis');
    expect(within(topicSection).getByText(/pricing/i)).toBeInTheDocument();
  });
});
