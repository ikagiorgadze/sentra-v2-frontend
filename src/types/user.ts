export interface OpponentProfile {
  id: string;
  name: string;
  role: string;
  party: string;
  region: string;
}

export interface ChannelConfig {
  enabled: boolean;
  includeTerms: string;
  excludeTerms: string;
  language: string;
}

export interface OnboardingConfig {
  leader: {
    name: string;
    role: string;
    party: string;
    region: string;
  };
  opponents: OpponentProfile[];
  topics: string[];
  channels: {
    x: ChannelConfig;
    facebook: ChannelConfig;
    news: ChannelConfig;
  };
  pdfContent: {
    sections: {
      totalMentions: boolean;
      netSentiment: boolean;
      botShare: boolean;
      engagementRate: boolean;
      dominantTopic: boolean;
      trendDashboard: boolean;
      topKeywords: boolean;
      topInfluencers: boolean;
      oppositionComparison: boolean;
    };
    executiveSummaryMetrics: string[];
    aiSummaryEnabled: boolean;
  };
  delivery: {
    frequency: string;
    dayOfWeek?: string;
    timeOfDay: string;
    timezone: string;
    recipients: string[];
    attachPdf: boolean;
    dashboardLink: boolean;
  };
}

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';
export type DataCollectionStatus = 'none' | 'collecting' | 'ready';

export interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  subscriptionStatus: SubscriptionStatus;
  hasCompletedOnboarding: boolean;
  dataCollectionStatus: DataCollectionStatus;
  trialEndsAt: string | null;
  dataReadyAt: string | null;
  configuration: OnboardingConfig | null;
}

export const DEFAULT_USER_STATE: UserState = {
  isAuthenticated: false,
  userId: null,
  email: null,
  subscriptionStatus: 'inactive',
  hasCompletedOnboarding: false,
  dataCollectionStatus: 'none',
  trialEndsAt: null,
  dataReadyAt: null,
  configuration: null,
};
