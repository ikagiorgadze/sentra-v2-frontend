export type DemoStep =
  | {
      type: 'user_message';
      content: string;
    }
  | {
      type: 'assistant_stream';
      content: string;
    }
  | {
      type: 'proposal_ready';
      normalizedQuery: string;
      filters?: Record<string, unknown>;
      collectionPlan?: Record<string, unknown>;
    }
  | {
      type: 'job_start';
      jobId?: string;
    }
  | {
      type: 'job_complete';
    };

export interface DemoAnalysisPayload {
  query: string;
  summary: string;
  sentimentOverview: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentimentTimeseries: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  tokenDelayMs?: number;
  stepDelayMs?: number;
  script: DemoStep[];
  analysisPayload: DemoAnalysisPayload;
}
