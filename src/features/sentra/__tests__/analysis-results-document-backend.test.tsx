import { render, screen } from '@testing-library/react';
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
});
