import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ConversationPanel } from '@/features/sentra/components/chat/ConversationPanel';

describe('conversation panel typing indicator', () => {
  it('renders Sentra logo in typing bubble', () => {
    render(
      <ConversationPanel
        messages={[]}
        pendingProposal={null}
        onSend={() => {}}
        onStartNewProposal={() => {}}
        onUseExistingProposal={() => {}}
        onEditProposal={() => {}}
        showAssistantTyping
      />,
    );

    const logo = screen.getByAltText('Sentra logo') as HTMLImageElement;
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toBe('/favicon.svg');
    expect(screen.getByText(/sentra is thinking/i)).toBeInTheDocument();
  });
});
