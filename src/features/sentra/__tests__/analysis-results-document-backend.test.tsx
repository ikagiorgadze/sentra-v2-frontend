import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AnalysisResultsDocument } from '@/features/sentra/components/AnalysisResultsDocument';
import { clearAccessToken, setAccessToken } from '@/lib/auth/tokenStorage';

function makeToken(expOffsetSeconds: number): string {
  const payload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `header.${encoded}.sig`;
}

describe('analysis results document backend', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all required analysis document section headers from backend payload', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
          meta: { campaign_name: 'Tesla Model Y Launch Campaign' },
          sections: {
            cover: {},
            executive_key_metrics: {},
            sentiment_emotional_distribution: {},
            stance_distribution_analysis: {},
            stance_drivers: {},
            negative_reception_analysis: {},
            topic_cluster_analysis: {},
            engagement_decay_curve: {},
            influencer_impact_analysis: {},
            audience_behavior_insights: {},
            ai_strategic_insight_summary: {},
            campaign_predictions: {},
            strategic_conclusion: {},
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(
      <AnalysisResultsDocument
        query="Tesla model y sentiment"
        jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00"
      />,
    );

    expect(await screen.findByText(/executive key metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/campaign predictions/i)).toBeInTheDocument();
  });

  it('shows inline retry control when analysis-document request fails', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    const validPayload = {
      job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
      meta: { campaign_name: 'Tesla Model Y Launch Campaign' },
      sections: {
        cover: {},
        executive_key_metrics: {},
        sentiment_emotional_distribution: {},
        stance_distribution_analysis: {},
        stance_drivers: {},
        negative_reception_analysis: {},
        topic_cluster_analysis: {},
        engagement_decay_curve: {},
        influencer_impact_analysis: {},
        audience_behavior_insights: {},
        ai_strategic_insight_summary: {},
        campaign_predictions: {},
        strategic_conclusion: {},
      },
    };

    const fetchMock = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: 'boom' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(validPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    render(
      <AnalysisResultsDocument
        query="Tesla model y sentiment"
        jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00"
      />,
    );

    expect(await screen.findByText(/could not load analysis results document/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText(/executive key metrics/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('collapses long concrete quote examples behind a read more toggle', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    const longQuote =
      'This is a long representative quote used for testing truncation behavior in the analysis results document. '
      + 'It should be collapsed initially so the section stays compact, and only reveal the full content after '
      + 'the user explicitly expands it using the read more toggle control. END-MARKER';

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
          meta: { campaign_name: 'Tesla Model Y Launch Campaign' },
          sections: {
            cover: {},
            executive_key_metrics: {},
            sentiment_emotional_distribution: {},
            stance_distribution_analysis: {},
            stance_drivers: {
              support_themes: [],
              opposition_themes: [],
              representative_quotes: [{ text: longQuote, sentiment: 'neutral', source: 'post' }],
            },
            negative_reception_analysis: {
              top_negative_topics: [],
              outlier_signals: [],
            },
            topic_cluster_analysis: {},
            engagement_decay_curve: {},
            influencer_impact_analysis: {},
            audience_behavior_insights: {},
            ai_strategic_insight_summary: {},
            campaign_predictions: {},
            strategic_conclusion: {},
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(
      <AnalysisResultsDocument
        query="Tesla model y sentiment"
        jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00"
      />,
    );

    expect(await screen.findByText(/executive key metrics/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /read more/i })).toBeInTheDocument();
    expect(screen.queryByText(/END-MARKER/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /read more/i }));

    expect(screen.getByText(/END-MARKER/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /read less/i })).toBeInTheDocument();
  });

  it('collapses strategic summary and long strategic list items with read more toggles', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));
    const user = userEvent.setup();
    const longSummary =
      'Summary text is intentionally long so it should be collapsed by default in the strategic insight card. '
      + 'When users click read more, the hidden part should become visible. '
      + 'Additional repeated filler text ensures this fixture exceeds the preview threshold and exercises truncation behavior reliably across test runs. '
      + 'Additional repeated filler text ensures this fixture exceeds the preview threshold and exercises truncation behavior reliably across test runs. '
      + 'SUMMARY-END-MARKER';
    const longOpportunity =
      'Opportunity text is intentionally long and should stay constrained in card layout while collapsed. '
      + 'After expansion it must reveal the final token. '
      + 'Additional repeated filler text ensures this fixture exceeds the preview threshold and exercises truncation behavior reliably across test runs. '
      + 'OPPORTUNITY-END-MARKER';
    const longRisk =
      'Risk text is intentionally long and should stay constrained in card layout while collapsed. '
      + 'After expansion it must reveal the final token. '
      + 'Additional repeated filler text ensures this fixture exceeds the preview threshold and exercises truncation behavior reliably across test runs. '
      + 'RISK-END-MARKER';

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
          meta: { campaign_name: 'Tesla Model Y Launch Campaign' },
          sections: {
            executive_key_metrics: {},
            sentiment_emotional_distribution: {},
            stance_distribution_analysis: {},
            stance_drivers: {},
            negative_reception_analysis: {},
            topic_cluster_analysis: {},
            engagement_decay_curve: {},
            influencer_impact_analysis: {},
            audience_behavior_insights: {},
            ai_strategic_insight_summary: {
              summary: longSummary,
              top_opportunities: [longOpportunity],
              top_risks: [longRisk],
            },
            campaign_predictions: {},
            strategic_conclusion: {},
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(
      <AnalysisResultsDocument
        query="Tesla model y sentiment"
        jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00"
      />,
    );

    expect(await screen.findByText(/ai strategic insight summary/i)).toBeInTheDocument();
    expect(screen.queryByText(/SUMMARY-END-MARKER/)).not.toBeInTheDocument();
    expect(screen.queryByText(/OPPORTUNITY-END-MARKER/)).not.toBeInTheDocument();
    expect(screen.queryByText(/RISK-END-MARKER/)).not.toBeInTheDocument();

    const readMoreButtons = screen.getAllByRole('button', { name: /read more/i });
    await user.click(readMoreButtons[0]);
    await user.click(readMoreButtons[1]);
    await user.click(readMoreButtons[2]);

    expect(screen.getByText(/SUMMARY-END-MARKER/)).toBeInTheDocument();
    expect(screen.getByText(/OPPORTUNITY-END-MARKER/)).toBeInTheDocument();
    expect(screen.getByText(/RISK-END-MARKER/)).toBeInTheDocument();
  });

  it('renders strategic summary, opportunities, and risks as a vertical stack', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
          meta: { campaign_name: 'Tesla Model Y Launch Campaign' },
          sections: {
            executive_key_metrics: {},
            sentiment_emotional_distribution: {},
            stance_distribution_analysis: {},
            stance_drivers: {},
            negative_reception_analysis: {},
            topic_cluster_analysis: {},
            engagement_decay_curve: {},
            influencer_impact_analysis: {},
            audience_behavior_insights: {},
            ai_strategic_insight_summary: {
              summary: 'Summary',
              top_opportunities: ['Opportunity'],
              top_risks: ['Risk'],
            },
            campaign_predictions: {},
            strategic_conclusion: {},
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(
      <AnalysisResultsDocument
        query="Tesla model y sentiment"
        jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00"
      />,
    );

    expect(await screen.findByText(/ai strategic insight summary/i)).toBeInTheDocument();
    const strategicSection = screen.getByTestId('analysis-section-ai-strategic-insight-summary');
    const layout = within(strategicSection).getByTestId('strategic-insight-layout');
    expect(layout.className).toContain('space-y-4');
    expect(layout.className).not.toContain('lg:grid-cols-3');
  });
});
