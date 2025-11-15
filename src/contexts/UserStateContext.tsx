import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserState, DEFAULT_USER_STATE, OnboardingConfig, OpponentProfile } from '@/types/user';

const STORAGE_KEY = 'sentra_user_state';

interface UserStateContextType {
  userState: UserState;
  login: (email: string) => void;
  logout: () => void;
  updateUserState: (updates: Partial<UserState>) => void;
  updateConfiguration: (config: OnboardingConfig) => void;
}

const UserStateContext = createContext<UserStateContextType | undefined>(undefined);

const migrateOldConfig = (oldConfig: any): OnboardingConfig | null => {
  if (!oldConfig) return null;
  
  // If already new format with OpponentProfile[], return as-is
  if (oldConfig.leader && oldConfig.channels && oldConfig.opponents && oldConfig.opponents[0]?.id) {
    return oldConfig;
  }

  // If already has leader and channels but old string[] opponents
  if (oldConfig.leader && oldConfig.channels) {
    const migratedOpponents: OpponentProfile[] = (oldConfig.opponents || [])
      .filter((name: string | { name: string }) => typeof name === 'string' ? name.trim() : name.name?.trim())
      .map((name: string | { name: string }) => ({
        id: crypto.randomUUID(),
        name: typeof name === 'string' ? name.trim() : name.name || "",
        role: "",
        party: "",
        region: ""
      }));
    
    return {
      ...oldConfig,
      opponents: migratedOpponents
    };
  }

  // Migrate very old format to new
  return {
    leader: {
      name: oldConfig.leaders || "",
      role: "",
      party: oldConfig.party || "",
      region: oldConfig.region || "",
    },
    opponents: oldConfig.opposition ? oldConfig.opposition.split(',').map((s: string) => ({
      id: crypto.randomUUID(),
      name: s.trim(),
      role: "",
      party: "",
      region: ""
    })) : [],
    topics: oldConfig.topics ? oldConfig.topics.split(',').map((s: string) => s.trim()) : [],
    channels: {
      x: {
        enabled: oldConfig.dataSources?.includes('X (Twitter)') || false,
        includeTerms: oldConfig.leaders || "",
        excludeTerms: "",
        language: oldConfig.language || "en",
      },
      facebook: {
        enabled: oldConfig.dataSources?.includes('Facebook') || false,
        includeTerms: oldConfig.leaders || "",
        excludeTerms: "",
        language: oldConfig.language || "en",
      },
      news: {
        enabled: oldConfig.dataSources?.includes('News Sites') || false,
        includeTerms: oldConfig.leaders || "",
        excludeTerms: "",
        language: oldConfig.language || "en",
      },
    },
    pdfContent: {
      sections: {
        totalMentions: true,
        netSentiment: oldConfig.metrics?.includes('Net Sentiment') || true,
        botShare: oldConfig.metrics?.includes('Bot Activity Detection') || true,
        engagementRate: true,
        dominantTopic: true,
        trendDashboard: true,
        topKeywords: true,
        topInfluencers: true,
        oppositionComparison: oldConfig.metrics?.includes('Opposition Comparison') || true,
      },
      executiveSummaryMetrics: ["totalMentions", "netSentiment", "botShare", "engagementRate"],
      aiSummaryEnabled: true,
    },
    delivery: {
      frequency: oldConfig.frequency || "weekly",
      dayOfWeek: "monday",
      timeOfDay: oldConfig.timeOfDay || "08:00",
      timezone: "UTC",
      recipients: oldConfig.recipients ? oldConfig.recipients.split(',').map((s: string) => s.trim()) : [],
      attachPdf: true,
      dashboardLink: true,
    },
  };
};

export const UserStateProvider = ({ children }: { children: ReactNode }) => {
  const [userState, setUserState] = useState<UserState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migrate old configuration format if needed
        if (parsed.configuration) {
          parsed.configuration = migrateOldConfig(parsed.configuration);
        }
        return parsed;
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
