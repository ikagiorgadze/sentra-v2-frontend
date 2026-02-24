import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDemoConversation } from '@/features/sentra/demo/useDemoConversation';

describe('useDemoConversation', () => {
  it('adds user messages instantly and streams assistant messages incrementally', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDemoConversation());

    await act(async () => {
      result.current.setScenario('policy-sentiment-watch');
      await result.current.nextStep();
    });

    expect(result.current.messages.at(-1)?.role).toBe('user');
    const beforeAssistantCount = result.current.messages.length;

    await act(async () => {
      await result.current.nextStep();
      vi.advanceTimersByTime(30);
    });

    expect(result.current.messages.length).toBe(beforeAssistantCount + 1);
    const partial = result.current.messages.at(-1)?.content ?? '';
    expect(partial.length).toBeGreaterThan(0);

    await act(async () => {
      vi.runAllTimers();
    });

    const full = result.current.messages.at(-1)?.content ?? '';
    expect(full.length).toBeGreaterThanOrEqual(partial.length);
    expect(full).toContain('I can do that');
    vi.useRealTimers();
  });

  it('supports pause/resume and deterministic nextStep/reset', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDemoConversation());

    await act(async () => {
      result.current.setScenario('policy-sentiment-watch');
      result.current.play();
      vi.advanceTimersByTime(10);
      result.current.pause();
    });

    const pausedMessageCount = result.current.messages.length;

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.messages.length).toBe(pausedMessageCount);

    await act(async () => {
      await result.current.nextStep();
    });

    expect(result.current.messages.length).toBeGreaterThan(pausedMessageCount);

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.appState).toBe('idle');
    vi.useRealTimers();
  });
});
