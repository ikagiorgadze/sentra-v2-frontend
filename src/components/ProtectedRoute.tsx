import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '@/contexts/UserStateContext';
import { determineUserRoute } from '@/hooks/useUserStateRouting';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { userState, isLoading } = useUserState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!userState.isAuthenticated) {
      navigate('/login');
      return;
    }

    const correctRoute = determineUserRoute(userState);
    const currentPath = window.location.pathname + window.location.search;

    if (currentPath !== correctRoute && !currentPath.startsWith(correctRoute.split('?')[0])) {
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

  if (!userState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
