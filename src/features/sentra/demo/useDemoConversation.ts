import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ChatBubble } from '@/features/sentra/components/chat/ConversationPanel';
import { DEMO_SCENARIOS } from '@/features/sentra/demo/scenarios';
import type { DemoAnalysisPayload, DemoScenario, DemoStep } from '@/features/sentra/demo/types';
import type { ConversationProposalRecord } from '@/features/sentra/types/conversation';
import type { AppState } from '@/features/sentra/types';

interface StreamState {
  messageId: string;
  content: string;
  cursor: number;
}

function makeAssistantBubble(content: string): ChatBubble {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
  };
}

function makeUserBubble(content: string): ChatBubble {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content,
  };
}

function toPendingProposal(step: Extract<DemoStep, { type: 'proposal_ready' }>): ConversationProposalRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    conversation_id: 'demo-conversation',
    version: 1,
    normalized_query: step.normalizedQuery,
    filters_json: step.filters ?? {},
    collection_plan: step.collectionPlan ?? {},
    status: 'pending',
    inserted_at: now,
    updated_at: now,
  };
}

export interface DemoConversationController {
  scenarios: DemoScenario[];
  scenario: DemoScenario;
  messages: ChatBubble[];
  query: string;
  appState: AppState;
  pendingProposal: ConversationProposalRecord | null;
  currentJobId?: string;
  isPlaying: boolean;
  validationError: string | null;
  isScenarioValid: boolean;
  play: () => void;
  pause: () => void;
  nextStep: () => Promise<void>;
  reset: () => void;
  restartScenario: () => void;
  setScenario: (scenarioId: string) => void;
  confirmProposal: () => void;
  analysisPayload: DemoAnalysisPayload;
}

interface DemoConversationOptions {
  scenarios?: DemoScenario[];
}

function validateScenario(scenario: DemoScenario | undefined): string | null {
  if (!scenario) {
    return 'No demo scenario is available.';
  }
  if (!scenario.script?.length) {
    return 'Selected demo scenario has no scripted steps.';
  }
  if (!scenario.analysisPayload?.query || !scenario.analysisPayload?.summary) {
    return 'Selected demo scenario is missing required analysis payload.';
  }
  return null;
}

export function useDemoConversation(options: DemoConversationOptions = {}): DemoConversationController {
  const scenarios = options.scenarios ?? DEMO_SCENARIOS;
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? '');
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [query, setQuery] = useState('');
  const [pendingProposal, setPendingProposal] = useState<ConversationProposalRecord | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | undefined>(undefined);
  const [appState, setAppState] = useState<AppState>('idle');
  const [isPlaying, setIsPlaying] = useState(false);

  const cursorRef = useRef(0);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamStateRef = useRef<StreamState | null>(null);

  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId, scenarios]);
  const validationError = useMemo(() => validateScenario(scenario), [scenario]);
  const isScenarioValid = validationError === null;

  const clearStepTimer = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const clearTokenTimer = useCallback(() => {
    if (tokenTimerRef.current) {
      clearTimeout(tokenTimerRef.current);
      tokenTimerRef.current = null;
    }
  }, []);

  const scheduleAutoStep = useCallback(
    (nextStep: () => Promise<void>) => {
      clearStepTimer();
      const delay = scenario.stepDelayMs ?? 300;
      stepTimerRef.current = setTimeout(() => {
        void nextStep();
      }, delay);
    },
    [clearStepTimer, scenario.stepDelayMs],
  );

  const flushStreamToEnd = useCallback(() => {
    const stream = streamStateRef.current;
    if (!stream) {
      return;
    }
    setMessages((prev) => prev.map((item) => (item.id === stream.messageId ? { ...item, content: stream.content } : item)));
    streamStateRef.current = null;
    clearTokenTimer();
    cursorRef.current += 1;
  }, [clearTokenTimer]);

  const tickStream = useCallback(
    (nextStep: () => Promise<void>) => {
      clearTokenTimer();
      const stream = streamStateRef.current;
      if (!stream) {
        return;
      }

      if (stream.cursor >= stream.content.length) {
        streamStateRef.current = null;
        cursorRef.current += 1;
        if (isPlaying) {
          scheduleAutoStep(nextStep);
        }
        return;
      }

      const nextCursor = stream.cursor + 1;
      const nextContent = stream.content.slice(0, nextCursor);
      streamStateRef.current = {
        ...stream,
        cursor: nextCursor,
      };

      setMessages((prev) => prev.map((item) => (item.id === stream.messageId ? { ...item, content: nextContent } : item)));

      const tokenDelay = scenario.tokenDelayMs ?? 20;
      tokenTimerRef.current = setTimeout(() => {
        tickStream(nextStep);
      }, tokenDelay);
    },
    [clearTokenTimer, isPlaying, scenario.tokenDelayMs, scheduleAutoStep],
  );

  const nextStep = useCallback(async (): Promise<void> => {
    if (!isScenarioValid) {
      return;
    }
    const activeScenario = scenario;
    if (!activeScenario) {
      return;
    }

    if (streamStateRef.current) {
      flushStreamToEnd();
      if (isPlaying) {
        scheduleAutoStep(nextStep);
      }
      return;
    }

    if (pendingProposal) {
      return;
    }

    const step = activeScenario.script[cursorRef.current];
    if (!step) {
      setIsPlaying(false);
      return;
    }

    if (step.type === 'user_message') {
      setMessages((prev) => [...prev, makeUserBubble(step.content)]);
      setQuery(step.content);
      cursorRef.current += 1;
      if (isPlaying) {
        scheduleAutoStep(nextStep);
      }
      return;
    }

    if (step.type === 'assistant_stream') {
      const bubble = makeAssistantBubble('');
      setMessages((prev) => [...prev, bubble]);
      streamStateRef.current = {
        messageId: bubble.id,
        content: step.content,
        cursor: 0,
      };
      tickStream(nextStep);
      return;
    }

    if (step.type === 'proposal_ready') {
      setPendingProposal(toPendingProposal(step));
      setQuery(step.normalizedQuery);
      cursorRef.current += 1;
      setIsPlaying(false);
      return;
    }

    if (step.type === 'job_start') {
      setCurrentJobId(step.jobId ?? `demo-job-${crypto.randomUUID()}`);
      setAppState('running');
      cursorRef.current += 1;
      if (isPlaying) {
        scheduleAutoStep(nextStep);
      }
      return;
    }

    if (step.type === 'job_complete') {
      setAppState('results');
      cursorRef.current += 1;
      if (isPlaying) {
        scheduleAutoStep(nextStep);
      }
    }
  }, [flushStreamToEnd, isPlaying, isScenarioValid, pendingProposal, scenario, scheduleAutoStep, tickStream]);

  const reset = useCallback(() => {
    clearStepTimer();
    clearTokenTimer();
    streamStateRef.current = null;
    cursorRef.current = 0;
    setMessages([]);
    setQuery('');
    setPendingProposal(null);
    setCurrentJobId(undefined);
    setAppState('idle');
    setIsPlaying(false);
  }, [clearStepTimer, clearTokenTimer]);

  const restartScenario = useCallback(() => {
    reset();
  }, [reset]);

  const setScenario = useCallback(
    (nextScenarioId: string) => {
      setScenarioId(nextScenarioId);
      reset();
    },
    [reset],
  );

  const play = useCallback(() => {
    if (!isScenarioValid) {
      return;
    }
    if (isPlaying) {
      return;
    }
    setIsPlaying(true);
  }, [isPlaying, isScenarioValid]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearStepTimer();
    clearTokenTimer();
  }, [clearStepTimer, clearTokenTimer]);

  const confirmProposal = useCallback(() => {
    if (!isScenarioValid) {
      return;
    }
    setPendingProposal(null);
    setMessages((prev) => [...prev, makeAssistantBubble('Confirmed. Creating your monitoring job now.')]);
    setIsPlaying(true);
  }, [isScenarioValid]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    if (pendingProposal) {
      return;
    }
    if (streamStateRef.current) {
      tickStream(nextStep);
      return;
    }
    scheduleAutoStep(nextStep);
    return () => {
      clearStepTimer();
    };
  }, [clearStepTimer, isPlaying, nextStep, pendingProposal, scheduleAutoStep, tickStream]);

  useEffect(
    () => () => {
      clearStepTimer();
      clearTokenTimer();
    },
    [clearStepTimer, clearTokenTimer],
  );

  return {
    scenarios,
    scenario,
    messages,
    query,
    appState,
    pendingProposal,
    currentJobId,
    isPlaying,
    validationError,
    isScenarioValid,
    play,
    pause,
    nextStep,
    reset,
    restartScenario,
    setScenario,
    confirmProposal,
    analysisPayload: scenario?.analysisPayload ?? {
      query: 'Demo scenario unavailable',
      summary: 'Demo scenario configuration is invalid.',
      sentimentOverview: { positive: 0, neutral: 0, negative: 0 },
      sentimentTimeseries: [],
    },
  };
}
