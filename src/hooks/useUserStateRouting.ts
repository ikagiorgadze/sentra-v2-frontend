import { UserState } from '@/types/user';

export const determineUserRoute = (userState: UserState): string => {
  if (!userState.isAuthenticated) {
    return '/login';
  }

  if (userState.subscriptionStatus !== 'active' && userState.subscriptionStatus !== 'trial') {
    return '/chat';
  }

  if (!userState.hasCompletedOnboarding) {
    return '/onboarding';
  }

  if (userState.dataCollectionStatus === 'collecting') {
    return '/dashboard?state=pending';
  }

  return '/dashboard';
};
