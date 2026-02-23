import { useEffect, useState } from 'react';

import {
  confirmConversationJob,
  createConversation,
  postConversationMessage,
} from '@/features/sentra/api/conversations';
import { getJob } from '@/features/sentra/api/jobs';
import { ConversationPanel, type ChatBubble } from '@/features/sentra/components/chat/ConversationPanel';
import { AuthPage } from '@/features/sentra/components/AuthPage';
import { IntelligenceBrief } from '@/features/sentra/components/IntelligenceBrief';
import { LandingPage } from '@/features/sentra/components/LandingPage';
import { RightPanel } from '@/features/sentra/components/RightPanel';
import { RunningState } from '@/features/sentra/components/RunningState';
import { Sidebar } from '@/features/sentra/components/Sidebar';
import { useBackendSession } from '@/features/sentra/hooks/useBackendSession';
import type { ConversationProposalRecord } from '@/features/sentra/types/conversation';
import { AppState, AppView, Investigation } from '@/features/sentra/types';

interface AppShellProps {
  initialView?: AppView;
  processingDelayMs?: number;
}

function getRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function detectDomain(query: string): string {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('bank') || lowerQuery.includes('financial')) return 'Banking';
  if (lowerQuery.includes('brand') || lowerQuery.includes('outage') || lowerQuery.includes('company')) return 'Brand';
  if (
    lowerQuery.includes('election') ||
    lowerQuery.includes('candidate') ||
    lowerQuery.includes('reform') ||
    lowerQuery.includes('policy')
  ) {
    return 'Politics';
  }
  return 'General';
}

function assistantBubble(content: string): ChatBubble {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
  };
}

function userBubble(content: string): ChatBubble {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content,
  };
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
}

export function AppShell({ initialView = 'landing', processingDelayMs = 3000 }: AppShellProps) {
  const { isAuthenticated } = useBackendSession();
  const [currentView, setCurrentView] = useState<AppView>(() =>
    initialView === 'app' && !isAuthenticated ? 'auth' : initialView,
  );
  const [state, setState] = useState<AppState>('idle');
  const [query, setQuery] = useState('');
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [currentInvestigationId, setCurrentInvestigationId] = useState<string | undefined>();
  const [activeJobId, setActiveJobId] = useState<string | undefined>();
  const [currentJobId, setCurrentJobId] = useState<string | undefined>();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [chatMessages, setChatMessages] = useState<ChatBubble[]>([]);
  const [pendingProposal, setPendingProposal] = useState<ConversationProposalRecord | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isConfirmingProposal, setIsConfirmingProposal] = useState(false);

  useEffect(() => {
    if (currentView === 'app' && !isAuthenticated) {
      setCurrentView('auth');
    }
  }, [currentView, isAuthenticated]);

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleAuthenticate = () => {
    setCurrentView('app');
  };

  const handleViewSample = () => {
    setCurrentView('app');
    const sampleQuery = 'Sentiment about pension reform in Romania last 7 days';
    setQuery(sampleQuery);
    setState('results');
    setCurrentJobId(undefined);
    setConversationId(undefined);
    setPendingProposal(null);
    setChatMessages([]);

    const timestamp = Date.now();
    const newInvestigation: Investigation = {
      id: timestamp.toString(),
      title: 'Pension reform sentiment Romania',
      timestamp: 'Just now',
      domain: 'Politics',
      query: sampleQuery,
      jobId: undefined,
    };
    setInvestigations([newInvestigation]);
    setCurrentInvestigationId(newInvestigation.id);
  };

  const handleSendMessage = async (message: string) => {
    setIsSendingMessage(true);
    setCurrentInvestigationId(undefined);
    setChatMessages((prev) => [...prev, userBubble(message)]);

    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const conversation = await createConversation();
        activeConversationId = conversation.id;
        setConversationId(activeConversationId);
      }

      const turn = await postConversationMessage(activeConversationId, message);
      setConversationId(turn.conversation.id);
      setPendingProposal(turn.pending_proposal ?? null);
      setChatMessages((prev) => [
        ...prev,
        {
          id: turn.assistant_message.id,
          role: 'assistant',
          content: turn.assistant_message.content,
        },
      ]);

      if (turn.pending_proposal) {
        setQuery(turn.pending_proposal.normalized_query);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        assistantBubble(resolveErrorMessage(error, 'I could not process that message right now. Please try again.')),
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleConfirmProposal = async () => {
    if (!conversationId || !pendingProposal) {
      return;
    }

    setIsConfirmingProposal(true);
    setState('running');
    setActiveJobId(undefined);
    setCurrentJobId(undefined);
    setCurrentInvestigationId(undefined);
    setQuery(pendingProposal.normalized_query);

    try {
      const confirmed = await confirmConversationJob(conversationId, {
        proposalVersion: pendingProposal.version,
        idempotencyKey: crypto.randomUUID(),
      });
      setActiveJobId(confirmed.job_id);
      setPendingProposal(null);
      setChatMessages((prev) => [...prev, assistantBubble('Confirmed. Creating your monitoring job now.')]);
    } catch (error) {
      setState('idle');
      setChatMessages((prev) => [
        ...prev,
        assistantBubble(resolveErrorMessage(error, 'I could not create the job from that confirmation. Please try again.')),
      ]);
    } finally {
      setIsConfirmingProposal(false);
    }
  };

  const handleEditProposal = () => {
    setPendingProposal(null);
    setChatMessages((prev) => [...prev, assistantBubble('Tell me what should change, and I will revise the query.')]);
  };

  const handleNewInvestigation = () => {
    setState('idle');
    setQuery('');
    setCurrentInvestigationId(undefined);
    setActiveJobId(undefined);
    setCurrentJobId(undefined);
    setConversationId(undefined);
    setPendingProposal(null);
    setChatMessages([]);
  };

  const handleSelectInvestigation = (id: string) => {
    const investigation = investigations.find((inv) => inv.id === id);
    if (!investigation) return;
    setQuery(investigation.query);
    setState('results');
    setCurrentInvestigationId(id);
    setActiveJobId(undefined);
    setCurrentJobId(investigation.jobId);
    setPendingProposal(null);
  };

  useEffect(() => {
    if (state !== 'running' || !activeJobId) {
      return undefined;
    }

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const job = await getJob(activeJobId);
        if (isCancelled) {
          return;
        }

        if (job.status === 'completed') {
          setState('results');
          setCurrentJobId(activeJobId);
          setActiveJobId(undefined);

          if (!currentInvestigationId) {
            const timestamp = Date.now();
            const newInvestigation: Investigation = {
              id: timestamp.toString(),
              title: query,
              timestamp: getRelativeTime(timestamp),
              domain: detectDomain(query),
              query,
              jobId: activeJobId,
            };
            setInvestigations((prev) => [newInvestigation, ...prev]);
            setCurrentInvestigationId(newInvestigation.id);
          }
          return;
        }

        if (job.status === 'failed') {
          setState('idle');
          setActiveJobId(undefined);
          setCurrentJobId(undefined);
          setChatMessages((prev) => [...prev, assistantBubble('The job failed. You can edit and confirm a new query.')]);
          return;
        }
      } catch {
        // Keep polling when backend is temporarily unavailable.
      }

      timeoutId = setTimeout(poll, processingDelayMs);
    };

    timeoutId = setTimeout(poll, processingDelayMs);

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [state, activeJobId, currentInvestigationId, processingDelayMs, query]);

  useEffect(() => {
    const interval = setInterval(() => {
      setInvestigations((prev) =>
        prev.map((investigation) => {
          const timestamp = Number.parseInt(investigation.id, 10);
          if (Number.isNaN(timestamp)) {
            return investigation;
          }
          return {
            ...investigation,
            timestamp: getRelativeTime(timestamp),
          };
        }),
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} onViewSample={handleViewSample} />;
  }

  if (currentView === 'auth') {
    return <AuthPage onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar
        investigations={investigations}
        onNewInvestigation={handleNewInvestigation}
        currentInvestigationId={currentInvestigationId}
        onSelectInvestigation={handleSelectInvestigation}
      />

      <div className="flex-1 overflow-y-auto">
        {state === 'idle' && (
          <ConversationPanel
            messages={chatMessages}
            pendingProposal={pendingProposal}
            onSend={handleSendMessage}
            onConfirmProposal={handleConfirmProposal}
            onEditProposal={handleEditProposal}
            disabled={isSendingMessage || isConfirmingProposal}
            showAssistantTyping={isSendingMessage}
          />
        )}
        {state === 'running' && <RunningState />}
        {state === 'results' && <IntelligenceBrief query={query} jobId={currentJobId} />}
      </div>

      <RightPanel />
    </div>
  );
}
