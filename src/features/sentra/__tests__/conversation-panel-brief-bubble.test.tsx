import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ConversationPanel } from '@/features/sentra/components/chat/ConversationPanel';

describe('conversation panel brief bubble', () => {
  it('renders intelligence brief content for assistant brief bubbles', () => {
    render(
      <ConversationPanel
        messages={[
          {
            id: 'b1',
            role: 'assistant',
            kind: 'assistant_brief',
            payload: {
              query: 'Sentiment around pension reform in Romania last 7 days',
            },
          },
        ]}
        pendingProposal={null}
        onSend={() => {}}
        onStartNewProposal={() => {}}
        onUseExistingProposal={() => {}}
        onEditProposal={() => {}}
      />,
    );

    expect(screen.getByText(/executive summary/i)).toBeInTheDocument();
  });
});
