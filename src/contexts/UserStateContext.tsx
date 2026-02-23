import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserState, OnboardingConfig, OpponentProfile } from '@/types/user';
import { clearAccessToken, getAccessToken } from '@/lib/auth/tokenStorage';

const CONFIG_STORAGE_KEY = 'sentra_user_config';

interface UserStateContextType {
  userState: UserState;
  session: BackendSession | null;
  user: BackendUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUserState: (updates: Partial<UserState>) => void;
  updateConfiguration: (config: OnboardingConfig) => void;
}

const UserStateContext = createContext<UserStateContextType | undefined>(undefined);

type LegacyOpponent = string | { name?: string } | OpponentProfile;

interface LegacyConfig {
  leader?: OnboardingConfig['leader'];
  channels?: OnboardingConfig['channels'];
  opponents?: LegacyOpponent[];
  leaders?: string;
  party?: string;
  region?: string;
  opposition?: string;
  topics?: string;
  dataSources?: string[];
  language?: string;
  metrics?: string[];
  frequency?: string;
  timeOfDay?: string;
  recipients?: string;
}

interface BackendUser {
  id: string;
  email: string;
  role: string;
}

interface BackendSession {
  accessToken: string;
  expiresAt: string | null;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
};

const parseCsv = (value: string | undefined): string[] =>
  value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const migrateOpponentList = (opponents: LegacyOpponent[] | undefined): OpponentProfile[] =>
  (opponents ?? [])
    .map((opponent) => {
      if (typeof opponent === 'string') {
        const name = opponent.trim();
        if (!name) return null;
        return { id: crypto.randomUUID(), name, role: '', party: '', region: '' };
      }

      const name = opponent.name?.trim() ?? '';
      if (!name) return null;

      return {
        id: 'id' in opponent && typeof opponent.id === 'string' && opponent.id ? opponent.id : crypto.randomUUID(),
        name,
        role: 'role' in opponent && typeof opponent.role === 'string' ? opponent.role : '',
        party: 'party' in opponent && typeof opponent.party === 'string' ? opponent.party : '',
        region: 'region' in opponent && typeof opponent.region === 'string' ? opponent.region : '',
      };
    })
    .filter((opponent): opponent is OpponentProfile => opponent !== null);

const migrateOldConfig = (oldConfig: unknown): OnboardingConfig | null => {
  if (!isRecord(oldConfig)) return null;

  const config = oldConfig as LegacyConfig;

  if (
    config.leader &&
    config.channels &&
    Array.isArray(config.opponents) &&
    config.opponents.some((opponent) => typeof opponent === 'object' && opponent !== null && 'id' in opponent)
  ) {
    return oldConfig as OnboardingConfig;
  }

  if (config.leader && config.channels) {
    return {
      ...(oldConfig as OnboardingConfig),
      opponents: migrateOpponentList(config.opponents),
    };
  }

  const dataSources = asStringArray(config.dataSources);
  const metrics = asStringArray(config.metrics);

  return {
    leader: {
      name: config.leaders ?? '',
      role: '',
      party: config.party ?? '',
      region: config.region ?? '',
    },
    opponents: parseCsv(config.opposition).map((name) => ({
      id: crypto.randomUUID(),
      name,
      role: '',
      party: '',
      region: '',
    })),
    topics: parseCsv(config.topics),
    channels: {
      x: {
        enabled: dataSources.includes('X (Twitter)'),
        includeTerms: config.leaders ?? '',
        excludeTerms: '',
        language: config.language ?? 'en',
      },
      facebook: {
        enabled: dataSources.includes('Facebook'),
        includeTerms: config.leaders ?? '',
        excludeTerms: '',
        language: config.language ?? 'en',
      },
      news: {
        enabled: dataSources.includes('News Sites'),
        includeTerms: config.leaders ?? '',
        excludeTerms: '',
        language: config.language ?? 'en',
      },
    },
    pdfContent: {
      sections: {
        totalMentions: true,
        netSentiment: metrics.includes('Net Sentiment') || true,
        botShare: metrics.includes('Bot Activity Detection') || true,
        engagementRate: true,
        dominantTopic: true,
        trendDashboard: true,
        topKeywords: true,
        topInfluencers: true,
        oppositionComparison: metrics.includes('Opposition Comparison') || true,
      },
      executiveSummaryMetrics: ['totalMentions', 'netSentiment', 'botShare', 'engagementRate'],
      aiSummaryEnabled: true,
    },
    delivery: {
      frequency: config.frequency || 'weekly',
      dayOfWeek: 'monday',
      timeOfDay: config.timeOfDay || '08:00',
      timezone: 'UTC',
      recipients: parseCsv(config.recipients),
      attachPdf: true,
      dashboardLink: true,
    },
  };
};

export const UserStateProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<BackendSession | null>(null);
  const [user, setUser] = useState<BackendUser | null>(null);
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

  // Initialize backend-token-backed auth state once on mount.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const payload = parseJwtPayload(token);
    if (!payload?.sub || !payload?.email || !payload?.exp) {
      clearAccessToken();
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      clearAccessToken();
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setSession({
      accessToken: token,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    setUser({
      id: payload.sub,
      email: payload.email,
      role: payload.role ?? 'user',
    });
    setIsLoading(false);
  }, []);

  // Persist local config to localStorage
  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(localConfig));
  }, [localConfig]);

  const logout = async () => {
    clearAccessToken();
    setSession(null);
    setUser(null);
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
