import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserState, DEFAULT_USER_STATE, OnboardingConfig } from '@/types/user';

const STORAGE_KEY = 'sentra_user_state';

interface UserStateContextType {
  userState: UserState;
  login: (email: string) => void;
  logout: () => void;
  updateUserState: (updates: Partial<UserState>) => void;
  updateConfiguration: (config: OnboardingConfig) => void;
}

const UserStateContext = createContext<UserStateContextType | undefined>(undefined);

export const UserStateProvider = ({ children }: { children: ReactNode }) => {
  const [userState, setUserState] = useState<UserState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_USER_STATE;
      }
    }
    return DEFAULT_USER_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
  }, [userState]);

  const login = (email: string) => {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    
    setUserState({
      ...DEFAULT_USER_STATE,
      isAuthenticated: true,
      userId: `user_${Date.now()}`,
      email,
      subscriptionStatus: 'trial',
      trialEndsAt: trialEndsAt.toISOString(),
    });
  };

  const logout = () => {
    setUserState(DEFAULT_USER_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUserState = (updates: Partial<UserState>) => {
    setUserState(prev => ({ ...prev, ...updates }));
  };

  const updateConfiguration = (config: OnboardingConfig) => {
    const dataReadyAt = new Date();
    dataReadyAt.setMinutes(dataReadyAt.getMinutes() + 2);
    
    setUserState(prev => ({
      ...prev,
      configuration: config,
      hasCompletedOnboarding: true,
      dataCollectionStatus: 'collecting',
      dataReadyAt: dataReadyAt.toISOString(),
    }));

    setTimeout(() => {
      setUserState(prev => ({
        ...prev,
        dataCollectionStatus: 'ready',
      }));
    }, 120000);
  };

  return (
    <UserStateContext.Provider value={{ userState, login, logout, updateUserState, updateConfiguration }}>
      {children}
    </UserStateContext.Provider>
  );
};

export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error('useUserState must be used within UserStateProvider');
  }
  return context;
};
