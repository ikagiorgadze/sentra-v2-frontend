import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { IntelligenceBrief } from '@/features/sentra/components/IntelligenceBrief';
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

describe('intelligence brief backend', () => {
  it('renders backend summary and sentiment data', async () => {
    clearAccessToken();
    setAccessToken(makeToken(3600));

    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
            total_mentions: 1200,
            engagement_rate: 0.41,
            summary: 'Backend summary: pension reform sentiment turned negative this week.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
            positive: 120,
            neutral: 180,
            negative: 900,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
            items: [
              { date: '2026-02-20', positive: 40, neutral: 50, negative: 160 },
              { date: '2026-02-21', positive: 35, neutral: 45, negative: 190 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
            items: [
              { topic: 'Economic impact', positive: 20, neutral: 30, negative: 90 },
              { topic: 'Public trust', positive: 10, neutral: 20, negative: 80 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job_id: '120d6e13-9f74-42bb-9fff-395a7f4f5f00',
            items: [
              {
                text: 'Pension reform hurts low-income workers.',
                sentiment: 'negative',
                score: -0.82,
                source: 'post',
                source_url: 'https://facebook.com/post/1',
                timestamp: '2026-02-21T10:30:00Z',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(
      <IntelligenceBrief
        query="Pension reform sentiment Romania"
        jobId="120d6e13-9f74-42bb-9fff-395a7f4f5f00"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/backend summary: pension reform sentiment turned negative this week\./i),
      ).toBeInTheDocument();
    });
  });
});
