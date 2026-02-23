import { SentraState } from '@/features/sentra/types';

type Event = { type: 'GET_STARTED' } | { type: 'AUTH_SUCCESS' };

export function createInitialState(): SentraState {
  return {
    currentView: 'landing',
    appState: 'idle',
    query: '',
    investigations: [],
  };
}

export function transition(state: SentraState, event: Event): SentraState {
  switch (event.type) {
    case 'GET_STARTED':
      return { ...state, currentView: 'auth' };
    case 'AUTH_SUCCESS':
      return { ...state, currentView: 'app' };
    default:
      return state;
  }
}
