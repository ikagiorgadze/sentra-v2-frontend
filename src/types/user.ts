export interface OnboardingConfig {
  leaders: string;
  party: string;
  topics: string;
  opposition: string;
  dataSources: string[];
  region: string;
  metrics: string[];
  reportType: string;
  frequency: string;
  timeOfDay: string;
  recipients: string;
  language: string;
  deliveryMethod: string;
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
