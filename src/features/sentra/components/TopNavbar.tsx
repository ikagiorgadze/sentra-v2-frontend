import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';

import { clearAccessToken, getAccessToken } from '@/lib/auth/tokenStorage';
import { getTokenRole, isTokenUnexpired } from '@/features/sentra/auth/tokenClaims';

const NAV_LINKS = [
  { to: '/request-history', label: 'Request History' },
  { to: '/pricing', label: 'Pricing' },
] as const;

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getAccessToken();
  const isAdmin = !!token && isTokenUnexpired(token) && getTokenRole(token) === 'admin';

  const handleLogout = () => {
    clearAccessToken();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-[#0F1113] px-6">
      <div className="flex items-center gap-8">
        <Link to="/request-history" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#3FD6D0]" />
          <span className="text-sm tracking-wider text-foreground">SENTRA</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                location.pathname.startsWith(link.to)
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin/demo"
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/request-form"
          className="flex items-center gap-1.5 rounded bg-[#3FD6D0] px-3 py-1.5 text-sm font-medium text-[#0F1113] transition-colors hover:bg-[#3FD6D0]/90"
        >
          <Plus className="h-3.5 w-3.5" />
          New Request
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
