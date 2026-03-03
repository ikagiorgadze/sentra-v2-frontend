import { useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loginWithBackend, signupWithBackend } from '@/features/sentra/api/auth';
import { setAccessToken } from '@/lib/auth/tokenStorage';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticate: () => void;
}

export function AuthDialog({ open, onOpenChange, onAuthenticate }: AuthDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            Create an account or sign in to run your first Sentra query.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="dialog-email" className="text-sm text-foreground">
              Email
            </label>
            <input
              id="dialog-email"
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
            <label htmlFor="dialog-password" className="text-sm text-foreground">
              Password
            </label>
            <input
              id="dialog-password"
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
            disabled={isSubmitting}
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-[#3FD6D0]">{isLogin ? 'Sign up' : 'Sign in'}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
