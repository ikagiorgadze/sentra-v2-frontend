import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProposalConfirmationCard } from '@/features/sentra/components/chat/ProposalConfirmationCard';

describe('ProposalConfirmationCard', () => {
  it('renders nested object filter values without crashing', () => {
    render(
      <ProposalConfirmationCard
        proposal={{
          id: 'p1',
          conversation_id: 'c1',
          version: 1,
          normalized_query: 'Track sentiment',
          filters_json: {
            target: 'iphoneShopTbilisi',
            collection_plan: {
              source: 'facebook',
              country: 'Georgia',
              keywords: ['iphoneShopTbilisi'],
              timeframe: 'last month',
            },
          },
          status: 'pending',
          inserted_at: '2026-02-25T12:00:00Z',
          updated_at: '2026-02-25T12:00:00Z',
        }}
        onStartNew={vi.fn()}
        onUseExisting={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText(/confirm query/i)).toBeInTheDocument();
    expect(screen.getByText(/target: iphoneShopTbilisi/i)).toBeInTheDocument();
    expect(screen.getByText(/collection_plan: source=facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/keywords=iphoneShopTbilisi/i)).toBeInTheDocument();
  });

  it('does not show reuse choices unless reuse is explicitly requested', () => {
    render(
      <ProposalConfirmationCard
        proposal={{
          id: 'p2',
          conversation_id: 'c2',
          version: 1,
          normalized_query: 'Track sentiment',
          filters_json: {
            target: 'iphoneShopTbilisi',
          },
          reuse_candidates: [
            {
              job_id: 'j1',
              query: 'Older completed query',
              updated_at: '2026-02-25T12:00:00Z',
              similarity_score: 0.9,
            },
          ],
          status: 'pending',
          inserted_at: '2026-02-25T12:00:00Z',
          updated_at: '2026-02-25T12:00:00Z',
        }}
        onStartNew={vi.fn()}
        onUseExisting={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /use existing/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });
});
