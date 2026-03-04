import { useCallback, useEffect, useState } from 'react';

import {
  confirmConversationJob,
  createConversation,
  deleteConversation,
  getConversationSnapshot,
  listConversations,
  postConversationMessage,
  retryConversationProposal,
} from '@/features/sentra/api/conversations';
import { streamConversationMessage } from '@/features/sentra/api/conversationStream';
import { getJob } from '@/features/sentra/api/jobs';
import { ConversationPanel, type ChatBubble } from '@/features/sentra/components/chat/ConversationPanel';
import { AuthDialog } from '@/features/sentra/components/AuthDialog';
import { AuthPage } from '@/features/sentra/components/AuthPage';
import { LandingPage } from '@/features/sentra/components/LandingPage';
import {
  createDefaultAdvancedFilters,
  RightPanel,
  type AdvancedFilters,
} from '@/features/sentra/components/RightPanel';
import { Sidebar } from '@/features/sentra/components/Sidebar';
import { AdminDemoPage } from '@/features/sentra/components/AdminDemoPage';
import { AdminUsersUsagePage } from '@/features/sentra/components/AdminUsersUsagePage';
import { AdminUserUsageDetailPage } from '@/features/sentra/components/AdminUserUsageDetailPage';
import { getTokenRole, isTokenUnexpired } from '@/features/sentra/auth/tokenClaims';
import { useBackendSession } from '@/features/sentra/hooks/useBackendSession';
import type {
  ConversationMessageRecord,
  ConversationProposalRecord,
  ConversationState,
} from '@/features/sentra/types/conversation';
import { AppState, AppView, RecentChat } from '@/features/sentra/types';
import { clearAccessToken, getAccessToken } from '@/lib/auth/tokenStorage';

interface AppShellProps {
  initialView?: AppView;
  processingDelayMs?: number;
  adminDemoMode?: boolean;
  adminUsageMode?: 'list' | 'detail';
}

interface JobProgressState {
  statusLabel: string;
  stageLabel: string;
  warningMessage: string | null;
  errorMessage: string | null;
  canRetry: boolean;
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
    kind: 'text',
    role: 'assistant',
    content,
  };
}

function userBubble(content: string): ChatBubble {
  return {
    id: crypto.randomUUID(),
    kind: 'text',
    role: 'user',
    content,
  };
}

function assistantBriefBubble(jobId: string, queryText: string): ChatBubble {
  return {
    id: `brief:${jobId}`,
    kind: 'assistant_brief',
    role: 'assistant',
    payload: {
      jobId,
      query: queryText,
    },
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

function isProposalAcknowledgement(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  if (/\b(edit|change|revise|update|instead|but)\b/.test(normalized)) {
    return false;
  }
  return (
    /^(yes|yep|yeah|sure|ok|okay|confirm|approved)\b/.test(normalized) ||
    /\b(i confirm|please confirm|go ahead|proceed|start (the )?job|create (the )?job)\b/.test(normalized)
  );
}

function deriveSnapshotAppState(
  conversationState: ConversationState,
  activeJobId: string | null | undefined,
): AppState {
  if (conversationState === 'completed') {
    return activeJobId ? 'results' : 'idle';
  }
  if (conversationState === 'monitoring' || conversationState === 'job_created') {
    return activeJobId ? 'running' : 'idle';
  }
  return 'idle';
}

function formatStageLabel(status: string | null | undefined, fallback = 'Running'): string {
  const normalized = status?.trim();
  if (!normalized) {
    return fallback;
  }
  return normalized.replaceAll('_', ' ');
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
    kind: 'text',
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

export function AppShell({
  initialView = 'landing',
  processingDelayMs = 3000,
  adminDemoMode = false,
  adminUsageMode,
}: AppShellProps) {
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
    if (initialView === 'landing' && window.location.pathname === '/' && isAuthenticated) {
      return 'app';
    }
    return initialView;
  });
  const [state, setState] = useState<AppState>('idle');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(() => createDefaultAdvancedFilters());
  const [jobProgress, setJobProgress] = useState<JobProgressState | null>(null);
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
  const [isRetryingJob, setIsRetryingJob] = useState(false);
  const [isDeletingChatId, setIsDeletingChatId] = useState<string | null>(null);
  const [recentChatsError, setRecentChatsError] = useState<string | null>(null);
  const [landingDraftMessage, setLandingDraftMessage] = useState('');
  const [pendingLandingSend, setPendingLandingSend] = useState<string | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const landingExamplePrompts = [
    'Track pension reform sentiment in Romania this week',
    'What narrative risks are rising around healthcare funding?',
    'Compare support sentiment for the top two mayoral candidates',
  ];
  const [, setRouteTick] = useState(0);

  const appendBriefBubbleForJob = useCallback((jobId?: string, queryText?: string) => {
    const resolvedJobId = String(jobId ?? '').trim();
    if (!resolvedJobId) {
      return;
    }
    const resolvedQuery = String(queryText ?? query).trim() || query;
    setChatMessages((prev) => {
      if (prev.some((bubble) => bubble.kind === 'assistant_brief' && bubble.payload.jobId === resolvedJobId)) {
        return prev;
      }
      return [...prev, assistantBriefBubble(resolvedJobId, resolvedQuery)];
    });
  }, [query]);

  useEffect(() => {
    if (!adminDemoMode && !adminUsageMode) {
      return;
    }

    const token = getAccessToken();
    if (!token || !isTokenUnexpired(token)) {
      clearAccessToken();
      syncPath('/login');
      setCurrentView('auth');
      return;
    }

    if (adminUsageMode && getTokenRole(token) !== 'admin') {
      syncPath('/chat');
      setCurrentView('app');
      return;
    }

    if (adminDemoMode) {
      syncPath('/admin/demo');
    } else if (adminUsageMode === 'list') {
      syncPath('/admin/users/usage');
    }
    setCurrentView('app');
  }, [adminDemoMode, adminUsageMode]);

  useEffect(() => {
    if (currentView === 'landing' && isAuthenticated && window.location.pathname === '/') {
      syncPath('/chat');
      setCurrentView('app');
      return;
    }
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
    if (currentView === 'app' && pathname === '/') {
      syncPath('/chat');
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
    setIsAuthDialogOpen(false);
    syncPath('/chat');
    setCurrentView('app');
    const queued = pendingLandingSend?.trim();
    setPendingLandingSend(null);
    if (queued) {
      setLandingDraftMessage('');
      void handleSendMessage(queued);
    }
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
    setJobProgress(null);
    setChatMessages([]);
    setCurrentChatId(undefined);
  };

  const handleLandingTrySend = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    if (!isAuthenticated) {
      setPendingLandingSend(trimmed);
      setIsAuthDialogOpen(true);
      return;
    }

    setPendingLandingSend(null);
    setLandingDraftMessage('');
    syncPath('/chat');
    setCurrentView('app');
    void handleSendMessage(trimmed);
  };

  const handleAuthDialogOpenChange = (open: boolean) => {
    setIsAuthDialogOpen(open);
    if (!open) {
      setPendingLandingSend(null);
    }
  };

  const handleOpenDemo = () => {
    syncPath('/admin/demo');
    setRouteTick((prev) => prev + 1);
  };

  const resetToNewInvestigation = useCallback(() => {
    syncPath('/chat');
    setState('idle');
    setQuery('');
    setCurrentChatId(undefined);
    setActiveJobId(undefined);
    setCurrentJobId(undefined);
    setJobProgress(null);
    setConversationId(undefined);
    setPendingProposal(null);
    setChatMessages([]);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (conversationId && pendingProposal && isProposalAcknowledgement(message)) {
      setChatMessages((prev) => [
        ...prev,
        userBubble(message),
        assistantBubble('Use the Confirm Query card to start the job, or tell me what to revise.'),
      ]);
      return;
    }

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
                setPendingProposal(null);
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
                const decisionMode = String(event.payload.decision_mode ?? '').trim();
                const autoReused = (event.payload.auto_reused_job ?? null) as
                  | { job_id?: string; matched_query?: string }
                  | null;
                if (decisionMode === 'auto_reused_existing' && autoReused?.job_id) {
                  setPendingProposal(null);
                  setState('results');
                  setActiveJobId(undefined);
                  setCurrentJobId(autoReused.job_id);
                  setJobProgress({
                    statusLabel: 'completed',
                    stageLabel: 'Completed',
                    warningMessage: null,
                    errorMessage: null,
                    canRetry: false,
                  });
                  if (typeof autoReused.matched_query === 'string' && autoReused.matched_query.trim()) {
                    setQuery(autoReused.matched_query);
                  }
                  appendBriefBubbleForJob(autoReused.job_id, autoReused.matched_query);
                } else {
                  const pending = (event.payload.proposal ?? null) as ConversationProposalRecord | null | undefined;
                  setPendingProposal(pending ?? null);
                  if (pending?.normalized_query) {
                    setQuery(pending.normalized_query);
                  }
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
      setChatMessages((prev) => [
        ...prev,
        {
          id: turn.assistant_message.id,
          role: 'assistant',
          content: turn.assistant_message.content,
        },
      ]);

      const autoReused = turn.auto_reused_job;
      if (turn.decision_mode === 'auto_reused_existing' && autoReused?.job_id) {
        setPendingProposal(null);
        setState('results');
        setActiveJobId(undefined);
        setCurrentJobId(autoReused.job_id);
        setJobProgress({
          statusLabel: 'completed',
          stageLabel: 'Completed',
          warningMessage: null,
          errorMessage: null,
          canRetry: false,
        });
        if (typeof autoReused.matched_query === 'string' && autoReused.matched_query.trim()) {
          setQuery(autoReused.matched_query);
        }
        appendBriefBubbleForJob(autoReused.job_id, autoReused.matched_query);
      } else {
        setPendingProposal(resolvedProposal);
        if (resolvedProposal) {
          setQuery(resolvedProposal.normalized_query);
        }
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
    setJobProgress({
      statusLabel: 'queued',
      stageLabel: 'Queued',
      warningMessage: null,
      errorMessage: null,
      canRetry: false,
    });
    setQuery(pendingProposal.normalized_query);

    try {
      const confirmed = await confirmConversationJob(conversationId, {
        proposalVersion: pendingProposal.version,
        idempotencyKey: crypto.randomUUID(),
        action: 'startNew',
        collectionPlanOverrides: advancedFilters,
      });
      setActiveJobId(confirmed.job_id);
      setJobProgress({
        statusLabel: confirmed.status,
        stageLabel: formatStageLabel(confirmed.status, 'Queued'),
        warningMessage: null,
        errorMessage: null,
        canRetry: false,
      });
      setPendingProposal(null);
      setChatMessages((prev) => [...prev, assistantBubble('Confirmed. Creating your monitoring job now.')]);
      void refreshRecentChats();
    } catch (error) {
      setState('idle');
      setJobProgress(null);
      setChatMessages((prev) => [
        ...prev,
        assistantBubble(resolveErrorMessage(error, 'I could not create the job from that confirmation. Please try again.')),
      ]);
    } finally {
      setIsConfirmingProposal(false);
    }
  };

  const handleUseExistingProposal = async (selectedJobId: string) => {
    if (!conversationId || !pendingProposal) {
      return;
    }

    setIsConfirmingProposal(true);
    setQuery(pendingProposal.normalized_query);

    try {
      const confirmed = await confirmConversationJob(conversationId, {
        proposalVersion: pendingProposal.version,
        idempotencyKey: crypto.randomUUID(),
        action: 'useExisting',
        selectedJobId,
      });
      setPendingProposal(null);
      setActiveJobId(undefined);
      setJobProgress({
        statusLabel: confirmed.status,
        stageLabel: formatStageLabel(confirmed.status, confirmed.status === 'completed' ? 'Completed' : 'Queued'),
        warningMessage: null,
        errorMessage: null,
        canRetry: false,
      });
      if (confirmed.status === 'completed') {
        setState('results');
        setCurrentJobId(confirmed.job_id);
        setChatMessages((prev) => [...prev, assistantBubble('Using the existing completed job from your history.')]);
        appendBriefBubbleForJob(confirmed.job_id, pendingProposal.normalized_query);
      } else {
        setState('running');
        setCurrentJobId(undefined);
        setActiveJobId(confirmed.job_id);
      }
      void refreshRecentChats();
    } catch (error) {
      setState('idle');
      setJobProgress(null);
      setChatMessages((prev) => [
        ...prev,
        assistantBubble(
          resolveErrorMessage(error, 'I could not reuse that completed job. Please choose another option.'),
        ),
      ]);
    } finally {
      setIsConfirmingProposal(false);
    }
  };

  const handleEditProposal = () => {
    setPendingProposal(null);
    setChatMessages((prev) => [...prev, assistantBubble('Tell me what should change, and I will revise the query.')]);
  };

  const handleRetryJob = async () => {
    if (!conversationId) {
      return;
    }

    setIsRetryingJob(true);
    try {
      const turn = await retryConversationProposal(conversationId);
      const restoredProposal = turn.proposal ?? turn.pending_proposal ?? null;
      setConversationId(turn.conversation.id);
      setCurrentChatId(turn.conversation.id);
      setPendingProposal(restoredProposal);
      if (restoredProposal?.normalized_query) {
        setQuery(restoredProposal.normalized_query);
      }
      setState('idle');
      setActiveJobId(undefined);
      setCurrentJobId(undefined);
      setJobProgress(null);
      setChatMessages((prev) => [
        ...prev,
        {
          id: turn.assistant_message.id,
          role: 'assistant',
          content: turn.assistant_message.content,
        },
      ]);
      void refreshRecentChats();
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        assistantBubble(resolveErrorMessage(error, 'I could not prepare a retry proposal. Please try again.')),
      ]);
    } finally {
      setIsRetryingJob(false);
    }
  };

  const handleNewInvestigation = () => {
    resetToNewInvestigation();
  };

  const handleDeleteChat = async (id: string) => {
    setIsDeletingChatId(id);
    try {
      await deleteConversation(id);
      setRecentChatsError(null);
      setRecentChats((prev) => prev.filter((chat) => chat.id !== id));
      if (currentChatId === id) {
        resetToNewInvestigation();
      }
      await refreshRecentChats();
    } catch (error) {
      setRecentChatsError(resolveErrorMessage(error, 'Could not delete chat.'));
    } finally {
      setIsDeletingChatId(null);
    }
  };

  const handleSelectChat = async (id: string) => {
    setCurrentChatId(id);
    try {
      const snapshot = await getConversationSnapshot(id);
      const lastUserMessage = [...snapshot.messages].reverse().find((message) => message.role === 'user');
      const resolvedProposal = snapshot.pending_proposal ?? snapshot.retry_proposal ?? null;
      const resolvedQuery = resolvedProposal?.normalized_query ?? lastUserMessage?.content ?? '';
      setConversationId(snapshot.conversation.id);
      setChatMessages(snapshot.messages.map(mapConversationMessageToBubble));
      setPendingProposal(resolvedProposal);
      setQuery(resolvedQuery);

      if (snapshot.latest_job) {
        const latest = snapshot.latest_job;
        const status = String(latest.status || '').trim().toLowerCase();
        const stageLabel = formatStageLabel(latest.stage_label, formatStageLabel(latest.stage_code, latest.status));
        if (status === 'completed') {
          setState('results');
          setCurrentJobId(latest.id);
          setActiveJobId(undefined);
          setJobProgress({
            statusLabel: latest.status,
            stageLabel,
            warningMessage: null,
            errorMessage: null,
            canRetry: false,
          });
          appendBriefBubbleForJob(latest.id, resolvedQuery);
          return;
        }
        if (status === 'failed') {
          setState('idle');
          setCurrentJobId(undefined);
          setActiveJobId(undefined);
          setJobProgress({
            statusLabel: latest.status,
            stageLabel,
            warningMessage: null,
            errorMessage: latest.error_message?.trim() || 'The job failed.',
            canRetry: true,
          });
          return;
        }
        setState('running');
        setCurrentJobId(undefined);
        setActiveJobId(latest.id);
        setJobProgress({
          statusLabel: latest.status,
          stageLabel,
          warningMessage: null,
          errorMessage: null,
          canRetry: false,
        });
        return;
      }

      const nextAppState = deriveSnapshotAppState(snapshot.conversation.state, snapshot.active_job_id);
      if (nextAppState === 'running') {
        setState('running');
        setJobProgress({
          statusLabel: 'running',
          stageLabel: 'Running',
          warningMessage: null,
          errorMessage: null,
          canRetry: false,
        });
        setCurrentJobId(undefined);
        setActiveJobId(snapshot.active_job_id);
      } else if (nextAppState === 'results' && snapshot.active_job_id) {
        setState('results');
        setJobProgress({
          statusLabel: 'completed',
          stageLabel: 'Completed',
          warningMessage: null,
          errorMessage: null,
          canRetry: false,
        });
        setActiveJobId(undefined);
        setCurrentJobId(snapshot.active_job_id);
        appendBriefBubbleForJob(snapshot.active_job_id, resolvedQuery);
      } else {
        setState('idle');
        setJobProgress(
          snapshot.conversation.state === 'failed'
            ? {
                statusLabel: 'failed',
                stageLabel: 'Failed',
                warningMessage: null,
                errorMessage: 'The job failed.',
                canRetry: true,
              }
            : null,
        );
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
    if (!activeJobId) {
      return undefined;
    }

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let consecutivePollErrors = 0;

    const poll = async () => {
      try {
        const job = await getJob(activeJobId);
        if (isCancelled) {
          return;
        }
        consecutivePollErrors = 0;
        const nextStatus = typeof job.status === 'string' ? job.status : 'running';
        setJobProgress({
          statusLabel: nextStatus,
          stageLabel: formatStageLabel(job.stage_label, formatStageLabel(job.stage_code, nextStatus)),
          warningMessage: null,
          errorMessage: null,
          canRetry: false,
        });

        if (nextStatus === 'completed') {
          setState('results');
          setCurrentJobId(activeJobId);
          setActiveJobId(undefined);
          appendBriefBubbleForJob(activeJobId, query);
          void refreshRecentChats();
          return;
        }

        if (nextStatus === 'failed') {
          setState('idle');
          setActiveJobId(undefined);
          setCurrentJobId(undefined);
          const detail = job.error_message?.trim() || 'The job failed.';
          setJobProgress({
            statusLabel: nextStatus,
            stageLabel: formatStageLabel(job.stage_label, formatStageLabel(job.stage_code, 'Failed')),
            warningMessage: null,
            errorMessage: detail,
            canRetry: true,
          });
          return;
        }
      } catch {
        consecutivePollErrors += 1;
        if (consecutivePollErrors >= 5) {
          const warning = 'Job status is temporarily unreachable. Retrying...';
          setJobProgress((prev) => {
            if (!prev) {
              return {
                statusLabel: 'running',
                stageLabel: 'Running',
                warningMessage: warning,
                errorMessage: null,
                canRetry: false,
              };
            }
            return {
              ...prev,
              warningMessage: warning,
            };
          });
          consecutivePollErrors = 0;
        }
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
  }, [activeJobId, appendBriefBubbleForJob, processingDelayMs, query, refreshRecentChats]);

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
    return (
      <>
        <LandingPage
          onGetStarted={handleGetStarted}
          onViewSample={handleViewSample}
          landingDraftMessage={landingDraftMessage}
          onLandingDraftChange={setLandingDraftMessage}
          onTrySend={handleLandingTrySend}
          examplePrompts={landingExamplePrompts}
          onSelectExample={setLandingDraftMessage}
        />
        <AuthDialog open={isAuthDialogOpen} onOpenChange={handleAuthDialogOpenChange} onAuthenticate={handleAuthenticate} />
      </>
    );
  }

  if (currentView === 'auth') {
    return <AuthPage onAuthenticate={handleAuthenticate} />;
  }

  const pathname = window.location.pathname;
  const shouldRenderAdminDemo = adminDemoMode || pathname === '/admin/demo';
  const shouldRenderAdminUsageList = adminUsageMode === 'list' && pathname === '/admin/users/usage';
  const shouldRenderAdminUsageDetail =
    adminUsageMode === 'detail' && pathname.startsWith('/admin/users/usage/');

  if (shouldRenderAdminDemo) {
    return <AdminDemoPage />;
  }
  if (shouldRenderAdminUsageList) {
    return <AdminUsersUsagePage />;
  }
  if (shouldRenderAdminUsageDetail) {
    return <AdminUserUsageDetailPage />;
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
        onDeleteChat={(id) => void handleDeleteChat(id)}
        isDeletingChatId={isDeletingChatId}
      />

      <div className="flex-1 overflow-y-auto">
        <ConversationPanel
          messages={chatMessages}
          pendingProposal={pendingProposal}
          jobProgress={jobProgress}
          onSend={handleSendMessage}
          onStartNewProposal={handleConfirmProposal}
          onUseExistingProposal={handleUseExistingProposal}
          onEditProposal={handleEditProposal}
          onRetryJob={handleRetryJob}
          isRetryingJob={isRetryingJob}
          disabled={isSendingMessage || isConfirmingProposal || !!activeJobId || isRetryingJob}
          showAssistantTyping={isSendingMessage && isAwaitingFirstToken}
        />
      </div>

      <RightPanel filters={advancedFilters} onChange={setAdvancedFilters} />
    </div>
  );
}
