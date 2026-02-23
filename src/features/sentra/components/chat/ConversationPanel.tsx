import { useEffect, useRef } from 'react';

import type { ConversationProposalRecord } from '@/features/sentra/types/conversation';
import { MessageComposer } from '@/features/sentra/components/chat/MessageComposer';
import { ProposalConfirmationCard } from '@/features/sentra/components/chat/ProposalConfirmationCard';

export interface ChatBubble {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationPanelProps {
  messages: ChatBubble[];
  pendingProposal: ConversationProposalRecord | null;
  onSend: (message: string) => Promise<void> | void;
  onConfirmProposal: () => Promise<void> | void;
  onEditProposal: () => void;
  disabled?: boolean;
}

export function ConversationPanel({
  messages,
  pendingProposal,
  onSend,
  onConfirmProposal,
  onEditProposal,
  disabled = false,
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof el.scrollTo !== 'function') {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, pendingProposal]);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 && (
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-2 text-3xl tracking-tight">Sentra Conversational Analyst</h1>
            <p className="text-sm text-muted-foreground">
              Describe the topic, geography, and timeframe. I will draft the monitoring query and ask for confirmation before creating a job.
            </p>
          </div>
        )}

        <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}
            >
              <div
                className={
                  message.role === 'user'
                    ? 'rounded-lg border border-[#3FD6D0]/30 bg-[#3FD6D0]/10 px-4 py-3 text-sm'
                    : 'rounded-lg border border-border bg-card px-4 py-3 text-sm'
                }
              >
                {message.content}
              </div>
            </div>
          ))}

          {pendingProposal && (
            <ProposalConfirmationCard
              proposal={pendingProposal}
              onConfirm={onConfirmProposal}
              onEdit={onEditProposal}
              disabled={disabled}
            />
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-6">
        <MessageComposer onSend={onSend} disabled={disabled} />
      </div>
    </div>
  );
}
