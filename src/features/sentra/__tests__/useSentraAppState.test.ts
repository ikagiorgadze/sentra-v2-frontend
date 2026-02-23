import { describe, expect, it } from 'vitest';
import { createInitialState, transition } from '@/features/sentra/hooks/useSentraAppState';

describe('sentra app state', () => {
  it('moves landing -> auth -> app', () => {
    const s0 = createInitialState();
    const s1 = transition(s0, { type: 'GET_STARTED' });
    const s2 = transition(s1, { type: 'AUTH_SUCCESS' });

    expect(s0.currentView).toBe('landing');
    expect(s1.currentView).toBe('auth');
    expect(s2.currentView).toBe('app');
  });
});
