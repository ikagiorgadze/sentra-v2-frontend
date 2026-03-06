import { Navigate } from 'react-router-dom';

import { getAccessToken } from '@/lib/auth/tokenStorage';
import { getTokenRole, isTokenUnexpired } from '@/features/sentra/auth/tokenClaims';
import { TopNavbar } from '@/features/sentra/components/TopNavbar';

interface AppLayoutProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function AppLayout({ children, adminOnly = false }: AppLayoutProps) {
  const token = getAccessToken();
  const authenticated = !!token && isTokenUnexpired(token);
  const isAdmin = authenticated && getTokenRole(token!) === 'admin';

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/request-history" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
