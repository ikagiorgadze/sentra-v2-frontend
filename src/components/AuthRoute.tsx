import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '@/contexts/UserStateContext';
import { determineUserRoute } from '@/hooks/useUserStateRouting';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { userState, isLoading } = useUserState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (userState.isAuthenticated) {
      const correctRoute = determineUserRoute(userState);
      navigate(correctRoute);
    }
  }, [userState, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-off-white">Loading...</div>
      </div>
    );
  }

  if (userState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
