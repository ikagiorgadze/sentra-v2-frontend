import { useEffect, useRef } from 'react';

import type { ConversationProposalRecord, JobProgressSnapshot } from '@/features/sentra/types/conversation';
import { IntelligenceBriefBubble } from '@/features/sentra/components/chat/IntelligenceBriefBubble';
import { MessageComposer } from '@/features/sentra/components/chat/MessageComposer';
import { JobProgressCard } from '@/features/sentra/components/chat/JobProgressCard';
import { ProposalConfirmationCard } from '@/features/sentra/components/chat/ProposalConfirmationCard';

export interface TextChatBubble {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  kind?: 'text';
}

export interface IntelligenceBriefChatBubble {
  id: string;
  role: 'assistant';
  kind: 'assistant_brief';
  payload: {
    query: string;
    jobId?: string;
  };
}

export type ChatBubble = TextChatBubble | IntelligenceBriefChatBubble;

interface ConversationPanelProps {
  messages: ChatBubble[];
  pendingProposal: ConversationProposalRecord | null;
  jobProgress?: {
    statusLabel: string;
    stageLabel?: string | null;
    warningMessage?: string | null;
    errorMessage?: string | null;
    canRetry?: boolean;
    progress?: JobProgressSnapshot | null;
  } | null;
  onSend: (message: string) => Promise<void> | void;
  onStartNewProposal: () => Promise<void> | void;
  onUseExistingProposal: (jobId: string) => Promise<void> | void;
  onEditProposal: () => void;
  onRetryJob?: () => Promise<void> | void;
  isRetryingJob?: boolean;
  disabled?: boolean;
  showAssistantTyping?: boolean;
  hideComposer?: boolean;
}

export function ConversationPanel({
  messages,
  pendingProposal,
  jobProgress = null,
  onSend,
  onStartNewProposal,
  onUseExistingProposal,
  onEditProposal,
  onRetryJob,
  isRetryingJob = false,
  disabled = false,
  showAssistantTyping = false,
  hideComposer = false,
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
          {messages.map((message) => {
            if (message.kind === 'assistant_brief') {
              return (
                <div key={message.id} className="mr-auto w-full">
                  <IntelligenceBriefBubble query={message.payload.query} jobId={message.payload.jobId} />
                </div>
              );
            }

            return (
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
            );
          })}

          {pendingProposal && (
            <ProposalConfirmationCard
              proposal={pendingProposal}
              onStartNew={onStartNewProposal}
              onUseExisting={onUseExistingProposal}
              onEdit={onEditProposal}
              disabled={disabled}
            />
          )}

          {jobProgress && (
            <JobProgressCard
              statusLabel={jobProgress.statusLabel}
              stageLabel={jobProgress.stageLabel}
              warningMessage={jobProgress.warningMessage}
              errorMessage={jobProgress.errorMessage}
              canRetry={jobProgress.canRetry}
              progress={jobProgress.progress}
              onTryAgain={onRetryJob}
              isRetrying={isRetryingJob}
            />
          )}

          {showAssistantTyping && (
            <div className="mr-auto max-w-[80%]">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <img src="/favicon.svg" alt="Sentra logo" className="h-4 w-4" />
                <span>Sentra is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hideComposer && (
        <div className="mx-auto w-full max-w-3xl px-6 pb-6">
          <MessageComposer onSend={onSend} disabled={disabled} />
        </div>
      )}
    </div>
  );
}
