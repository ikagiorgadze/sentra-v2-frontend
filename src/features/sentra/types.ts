export type AppView = 'landing' | 'auth' | 'app';
export type AppState = 'idle' | 'running' | 'results';

export interface Investigation {
  id: string;
  title: string;
  timestamp: string;
  domain: string;
  query: string;
  jobId?: string;
}

export interface RecentChat {
  id: string;
  title: string;
  timestamp: string;
  state: string;
  updatedAt: string;
}

export interface SentraState {
  currentView: AppView;
  appState: AppState;
  query: string;
  investigations: Investigation[];
  currentInvestigationId?: string;
}
