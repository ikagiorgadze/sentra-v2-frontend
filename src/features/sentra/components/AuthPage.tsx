import { useState } from 'react';

import { loginWithBackend, signupWithBackend } from '@/features/sentra/api/auth';
import { setAccessToken } from '@/lib/auth/tokenStorage';

interface AuthPageProps {
  onAuthenticate: () => void;
}

export function AuthPage({ onAuthenticate }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!isLogin) {
        await signupWithBackend(email, password);
      }
      const token = await loginWithBackend(email, password);
      setAccessToken(token.access_token);
      onAuthenticate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#3FD6D0]" />
            <span className="text-lg tracking-wider text-foreground">SENTRA</span>
          </div>
          <h1 className="text-2xl" style={{ fontWeight: 400 }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'Access your intelligence dashboard' : 'Start tracking sentiment and narratives'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@organization.com"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 transition-all focus:outline-none focus:ring-1 focus:ring-[#3FD6D0]"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 transition-all focus:outline-none focus:ring-1 focus:ring-[#3FD6D0]"
              required
              disabled={isSubmitting}
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-border text-[#3FD6D0] focus:ring-[#3FD6D0]"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-[#3FD6D0] hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#3FD6D0] px-4 py-3 text-[#0F1113] transition-colors hover:bg-[#3FD6D0]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin((value) => !value)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-[#3FD6D0]">{isLogin ? 'Sign up' : 'Sign in'}</span>
          </button>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Trusted by political campaigns, communications teams, and strategic advisors
          </p>
        </div>
      </div>
    </div>
  );
}
