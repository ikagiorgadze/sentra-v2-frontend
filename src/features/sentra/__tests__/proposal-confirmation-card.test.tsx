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
        onConfirm={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText(/confirm query/i)).toBeInTheDocument();
    expect(screen.getByText(/target: iphoneShopTbilisi/i)).toBeInTheDocument();
    expect(screen.getByText(/collection_plan: source=facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/keywords=iphoneShopTbilisi/i)).toBeInTheDocument();
  });
});
