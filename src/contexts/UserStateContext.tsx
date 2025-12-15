import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserState, DEFAULT_USER_STATE, OnboardingConfig, OpponentProfile } from '@/types/user';

const CONFIG_STORAGE_KEY = 'sentra_user_config';

interface UserStateContextType {
  userState: UserState;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Configuration stored in localStorage until profiles table is ready
  const [localConfig, setLocalConfig] = useState<{
    configuration: OnboardingConfig | null;
    hasCompletedOnboarding: boolean;
    dataCollectionStatus: 'none' | 'collecting' | 'ready';
    dataReadyAt: string | null;
  }>(() => {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.configuration) {
          parsed.configuration = migrateOldConfig(parsed.configuration);
        }
        return parsed;
      } catch {
        return {
          configuration: null,
          hasCompletedOnboarding: false,
          dataCollectionStatus: 'none',
          dataReadyAt: null,
        };
      }
    }
    return {
      configuration: null,
      hasCompletedOnboarding: false,
      dataCollectionStatus: 'none',
      dataReadyAt: null,
    };
  });

  // Derive userState from real session + local config
  const userState: UserState = {
    isAuthenticated: !!session,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    subscriptionStatus: session ? 'trial' : 'inactive', // Hardcoded until profiles table
    hasCompletedOnboarding: localConfig.hasCompletedOnboarding,
    dataCollectionStatus: localConfig.dataCollectionStatus,
    trialEndsAt: session ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : null,
    dataReadyAt: localConfig.dataReadyAt,
    configuration: localConfig.configuration,
  };

  // Setup auth state listener
  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist local config to localStorage
  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(localConfig));
  }, [localConfig]);

  const logout = async () => {
    await supabase.auth.signOut();
    setLocalConfig({
      configuration: null,
      hasCompletedOnboarding: false,
      dataCollectionStatus: 'none',
      dataReadyAt: null,
    });
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  };

  const updateUserState = (updates: Partial<UserState>) => {
    // Only update local config fields
    if ('hasCompletedOnboarding' in updates || 'dataCollectionStatus' in updates || 
        'dataReadyAt' in updates || 'configuration' in updates) {
      setLocalConfig(prev => ({
        ...prev,
        ...(updates.hasCompletedOnboarding !== undefined && { hasCompletedOnboarding: updates.hasCompletedOnboarding }),
        ...(updates.dataCollectionStatus !== undefined && { dataCollectionStatus: updates.dataCollectionStatus }),
        ...(updates.dataReadyAt !== undefined && { dataReadyAt: updates.dataReadyAt }),
        ...(updates.configuration !== undefined && { configuration: updates.configuration }),
      }));
    }
  };

  const updateConfiguration = (config: OnboardingConfig) => {
    const dataReadyAt = new Date();
    dataReadyAt.setMinutes(dataReadyAt.getMinutes() + 2);
    
    setLocalConfig(prev => ({
      ...prev,
      configuration: config,
      hasCompletedOnboarding: true,
      dataCollectionStatus: 'collecting',
      dataReadyAt: dataReadyAt.toISOString(),
    }));

    setTimeout(() => {
      setLocalConfig(prev => ({
        ...prev,
        dataCollectionStatus: 'ready',
      }));
    }, 120000);
  };

  return (
    <UserStateContext.Provider value={{ 
      userState, 
      session, 
      user, 
      isLoading, 
      logout, 
      updateUserState, 
      updateConfiguration 
    }}>
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
