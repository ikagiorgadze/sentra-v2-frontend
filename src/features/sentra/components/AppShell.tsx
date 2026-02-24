import { useCallback, useEffect, useState } from 'react';

import {
  confirmConversationJob,
  createConversation,
  getConversationSnapshot,
  listConversations,
  postConversationMessage,
} from '@/features/sentra/api/conversations';
import { streamConversationMessage } from '@/features/sentra/api/conversationStream';
import { getJob } from '@/features/sentra/api/jobs';
import { ConversationPanel, type ChatBubble } from '@/features/sentra/components/chat/ConversationPanel';
import { AuthPage } from '@/features/sentra/components/AuthPage';
import { IntelligenceBrief } from '@/features/sentra/components/IntelligenceBrief';
import { LandingPage } from '@/features/sentra/components/LandingPage';
import { RightPanel } from '@/features/sentra/components/RightPanel';
import { RunningState } from '@/features/sentra/components/RunningState';
import { Sidebar } from '@/features/sentra/components/Sidebar';
import { AdminDemoPage } from '@/features/sentra/components/AdminDemoPage';
import { getTokenRole, isTokenUnexpired } from '@/features/sentra/auth/tokenClaims';
import { useBackendSession } from '@/features/sentra/hooks/useBackendSession';
import type { ConversationMessageRecord, ConversationProposalRecord } from '@/features/sentra/types/conversation';
import { AppState, AppView, RecentChat } from '@/features/sentra/types';
import { clearAccessToken, getAccessToken } from '@/lib/auth/tokenStorage';

interface AppShellProps {
  initialView?: AppView;
  processingDelayMs?: number;
  adminDemoMode?: boolean;
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

function syncPath(path: string): void {
  if (window.location.pathname === path) {
    return;
  }
  window.history.replaceState({}, '', path);
}

function isAuthPath(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register' || pathname === '/registration-notice';
}

function conversationStateLabel(state: string): string {
  return state.replaceAll('_', ' ');
}

function deriveConversationTitle(title: string | null, fallback: string): string {
  const normalized = title?.trim();
  if (normalized) {
    return normalized;
  }
  return fallback;
}

function mapConversationMessageToBubble(message: ConversationMessageRecord): ChatBubble {
  return {
    id: message.id,
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.content,
  };
}

declare global {
  interface Window {
    __SENTRA_STREAMING_ENABLED__?: boolean;
  }
}

function isStreamingEnabled(): boolean {
  if (typeof window !== 'undefined' && typeof window.__SENTRA_STREAMING_ENABLED__ === 'boolean') {
    return window.__SENTRA_STREAMING_ENABLED__;
  }
  const flag = String(import.meta.env.VITE_CHAT_STREAMING_ENABLED ?? '').trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'off') {
    return false;
  }
  return true;
}

export function AppShell({ initialView = 'landing', processingDelayMs = 3000, adminDemoMode = false }: AppShellProps) {
  const { isAuthenticated } = useBackendSession();
  const accessToken = getAccessToken();
  const isAdminUser =
    !!accessToken && isTokenUnexpired(accessToken) && getTokenRole(accessToken) === 'admin';
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (initialView === 'app') {
      return isAuthenticated ? 'app' : 'auth';
    }
    if (initialView === 'auth') {
      return isAuthenticated ? 'app' : 'auth';
    }
    return initialView;
  });
  const [state, setState] = useState<AppState>('idle');
  const [query, setQuery] = useState('');
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [activeJobId, setActiveJobId] = useState<string | undefined>();
  const [currentJobId, setCurrentJobId] = useState<string | undefined>();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [chatMessages, setChatMessages] = useState<ChatBubble[]>([]);
  const [pendingProposal, setPendingProposal] = useState<ConversationProposalRecord | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isAwaitingFirstToken, setIsAwaitingFirstToken] = useState(false);
  const [isConfirmingProposal, setIsConfirmingProposal] = useState(false);
  const [recentChatsError, setRecentChatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminDemoMode) {
      return;
    }

    const token = getAccessToken();
    if (!token || !isTokenUnexpired(token)) {
      clearAccessToken();
      syncPath('/login');
      setCurrentView('auth');
      return;
    }

    if (getTokenRole(token) !== 'admin') {
      syncPath('/chat');
      setCurrentView('app');
      return;
    }

    syncPath('/admin/demo');
    setCurrentView('app');
  }, [adminDemoMode]);

  useEffect(() => {
    if (currentView === 'app' && !isAuthenticated) {
      setCurrentView('auth');
    }
    if (currentView === 'auth' && isAuthenticated) {
      setCurrentView('app');
    }
  }, [currentView, isAuthenticated]);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (currentView === 'auth' && !isAuthPath(pathname)) {
      syncPath('/login');
      return;
    }
    if (currentView === 'app' && isAuthPath(pathname)) {
      syncPath('/chat');
    }
  }, [currentView]);

  const refreshRecentChats = useCallback(async () => {
    try {
      const items = await listConversations();
      setRecentChatsError(null);
      setRecentChats(
        items.map((item) => {
          const updatedAtMillis = Date.parse(item.updated_at);
          return {
            id: item.id,
            title: deriveConversationTitle(item.title, `Chat ${item.inserted_at.slice(0, 10)}`),
            timestamp: Number.isNaN(updatedAtMillis) ? 'Just now' : getRelativeTime(updatedAtMillis),
            state: conversationStateLabel(item.state),
            updatedAt: item.updated_at,
          };
        }),
      );
    } catch (error) {
      setRecentChatsError(resolveErrorMessage(error, 'Could not load recent chats.'));
    }
  }, []);

  useEffect(() => {
    if (currentView !== 'app' || !isAuthenticated) {
      return;
    }
    void refreshRecentChats();
  }, [currentView, isAuthenticated, refreshRecentChats]);

  const handleGetStarted = () => {
    syncPath('/login');
    setCurrentView('auth');
  };

  const handleAuthenticate = () => {
    syncPath('/chat');
    setCurrentView('app');
  };

  const handleViewSample = () => {
    syncPath('/sample-report');
    setCurrentView('app');
    const sampleQuery = 'Sentiment about pension reform in Romania last 7 days';
    setQuery(sampleQuery);
    setState('results');
    setCurrentJobId(undefined);
    setConversationId(undefined);
    setPendingProposal(null);
    setChatMessages([]);
    setCurrentChatId(undefined);
  };

  const handleOpenDemo = () => {
    syncPath('/admin/demo');
  };

  const handleSendMessage = async (message: string) => {
    setIsSendingMessage(true);
    setIsAwaitingFirstToken(false);
    setChatMessages((prev) => [...prev, userBubble(message)]);

    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const conversation = await createConversation(message.slice(0, 120));
        activeConversationId = conversation.id;
        setConversationId(activeConversationId);
        setCurrentChatId(activeConversationId);
      } else {
        setCurrentChatId(activeConversationId);
      }

      if (isStreamingEnabled()) {
        const draftBubbleId = crypto.randomUUID();
        setChatMessages((prev) => [...prev, { id: draftBubbleId, role: 'assistant', content: '' }]);
        setIsAwaitingFirstToken(true);

        try {
          await streamConversationMessage(activeConversationId, message, {
            onEvent: (event) => {
              if (event.event === 'turn_start') {
                return;
              }

              if (event.event === 'assistant_token') {
                const delta = String(event.payload.delta ?? '');
                if (!delta) {
                  return;
                }
                setIsAwaitingFirstToken(false);
                setChatMessages((prev) =>
                  prev.map((item) => (item.id === draftBubbleId ? { ...item, content: `${item.content}${delta}` } : item)),
                );
                return;
              }

              if (event.event === 'clarification') {
                const clarification = event.payload.clarification as { question?: string } | undefined;
                const question = clarification?.question?.trim();
                if (question) {
                  setChatMessages((prev) =>
                    prev.map((item) => (item.id === draftBubbleId ? { ...item, content: question } : item)),
                  );
                }
                return;
              }

              if (event.event === 'proposal_ready') {
                const pending = event.payload.proposal as ConversationProposalRecord | undefined;
                if (pending) {
                  setPendingProposal(pending);
                  setQuery(pending.normalized_query);
                }
                return;
              }

              if (event.event === 'turn_complete') {
                setIsAwaitingFirstToken(false);
                const payloadConversation = event.payload.conversation as { id?: string } | undefined;
                if (payloadConversation?.id) {
                  setConversationId(payloadConversation.id);
                  setCurrentChatId(payloadConversation.id);
                }
                const finalAssistant = event.payload.assistant_message as { id?: string; content?: string } | undefined;
                if (finalAssistant?.id) {
                  setChatMessages((prev) =>
                    prev.map((item) =>
                      item.id === draftBubbleId
                        ? { id: finalAssistant.id ?? draftBubbleId, role: 'assistant', content: finalAssistant.content ?? item.content }
                        : item,
                    ),
                  );
                }
                const pending = (event.payload.proposal ?? null) as ConversationProposalRecord | null | undefined;
                if (pending) {
                  setPendingProposal(pending);
                  setQuery(pending.normalized_query);
                }
                return;
              }

              if (event.event === 'error') {
                setIsAwaitingFirstToken(false);
                const fallback = String(event.payload.message ?? 'I could not process that message right now. Please try again.');
                setChatMessages((prev) =>
                  prev.map((item) => (item.id === draftBubbleId ? { ...item, content: fallback } : item)),
                );
              }
            },
          });
          void refreshRecentChats();
          return;
        } catch {
          setIsAwaitingFirstToken(false);
          setChatMessages((prev) => prev.filter((item) => item.id !== draftBubbleId));
        }
      }

      const turn = await postConversationMessage(activeConversationId, message);
      setConversationId(turn.conversation.id);
      setCurrentChatId(turn.conversation.id);
      const resolvedProposal = turn.proposal ?? turn.pending_proposal ?? null;
      setPendingProposal(resolvedProposal);
      setChatMessages((prev) => [
        ...prev,
        {
          id: turn.assistant_message.id,
          role: 'assistant',
          content: turn.assistant_message.content,
        },
      ]);

      if (resolvedProposal) {
        setQuery(resolvedProposal.normalized_query);
      }
      void refreshRecentChats();
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        assistantBubble(resolveErrorMessage(error, 'I could not process that message right now. Please try again.')),
      ]);
    } finally {
      setIsSendingMessage(false);
      setIsAwaitingFirstToken(false);
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
    setQuery(pendingProposal.normalized_query);

    try {
      const confirmed = await confirmConversationJob(conversationId, {
        proposalVersion: pendingProposal.version,
        idempotencyKey: crypto.randomUUID(),
      });
      setActiveJobId(confirmed.job_id);
      setPendingProposal(null);
      setChatMessages((prev) => [...prev, assistantBubble('Confirmed. Creating your monitoring job now.')]);
      void refreshRecentChats();
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
    syncPath('/chat');
    setState('idle');
    setQuery('');
    setCurrentChatId(undefined);
    setActiveJobId(undefined);
    setCurrentJobId(undefined);
    setConversationId(undefined);
    setPendingProposal(null);
    setChatMessages([]);
  };

  const handleSelectChat = async (id: string) => {
    setCurrentChatId(id);
    try {
      const snapshot = await getConversationSnapshot(id);
      const lastUserMessage = [...snapshot.messages].reverse().find((message) => message.role === 'user');
      setConversationId(snapshot.conversation.id);
      setChatMessages(snapshot.messages.map(mapConversationMessageToBubble));
      setPendingProposal(snapshot.pending_proposal ?? null);
      setQuery(snapshot.pending_proposal?.normalized_query ?? lastUserMessage?.content ?? '');

      if (snapshot.active_job_id) {
        setState('running');
        setCurrentJobId(undefined);
        setActiveJobId(snapshot.active_job_id);
      } else {
        setState('idle');
        setCurrentJobId(undefined);
        setActiveJobId(undefined);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        assistantBubble(resolveErrorMessage(error, 'Could not load that chat. Try again.')),
      ]);
    }
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
          void refreshRecentChats();
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
  }, [state, activeJobId, processingDelayMs, refreshRecentChats]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentChats((prev) =>
        prev.map((chat) => {
          const updatedAtMillis = Date.parse(chat.updatedAt);
          if (Number.isNaN(updatedAtMillis)) {
            return chat;
          }
          return {
            ...chat,
            timestamp: getRelativeTime(updatedAtMillis),
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

  if (adminDemoMode) {
    return <AdminDemoPage />;
  }

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar
        recentChats={recentChats}
        onNewInvestigation={handleNewInvestigation}
        onOpenDemo={handleOpenDemo}
        isAdminUser={isAdminUser}
        currentChatId={currentChatId}
        onSelectChat={(id) => void handleSelectChat(id)}
        errorMessage={recentChatsError}
        onRetryRecentChats={() => void refreshRecentChats()}
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
            showAssistantTyping={isSendingMessage && isAwaitingFirstToken}
          />
        )}
        {state === 'running' && <RunningState />}
        {state === 'results' && <IntelligenceBrief query={query} jobId={currentJobId} />}
      </div>

      <RightPanel />
    </div>
  );
}
