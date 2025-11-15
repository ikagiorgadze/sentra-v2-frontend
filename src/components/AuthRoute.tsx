import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '@/contexts/UserStateContext';
import { determineUserRoute } from '@/hooks/useUserStateRouting';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { userState } = useUserState();
  const navigate = useNavigate();

  useEffect(() => {
    if (userState.isAuthenticated) {
      const correctRoute = determineUserRoute(userState);
      navigate(correctRoute);
    }
  }, [userState, navigate]);

  if (userState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
