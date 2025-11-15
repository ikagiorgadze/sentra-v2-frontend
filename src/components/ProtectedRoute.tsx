import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '@/contexts/UserStateContext';
import { determineUserRoute } from '@/hooks/useUserStateRouting';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { userState } = useUserState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }

    const correctRoute = determineUserRoute(userState);
    const currentPath = window.location.pathname + window.location.search;

    if (currentPath !== correctRoute && !currentPath.startsWith(correctRoute.split('?')[0])) {
      navigate(correctRoute);
    }
  }, [userState, navigate]);

  if (!userState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
