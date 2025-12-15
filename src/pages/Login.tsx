import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Your account is pending activation. Please contact support@sentra.it.com');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Session will be set by onAuthStateChange in UserStateContext
    // Navigation will be handled by AuthRoute detecting authenticated state
  };

  return (
    <div className="min-h-screen bg-charcoal text-off-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-off-white hover:text-signal-cyan mb-8"
          >
            ← Back to Home
          </Button>
          <div className="text-center">
            <Logo size="lg" className="justify-center mb-6" />
            <h1 className="text-2xl font-bold uppercase tracking-wider">Sign In</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm uppercase tracking-wide">Email</Label>
            <Input
              id="email"
              type="email"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan focus:ring-1 focus:ring-signal-cyan"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm uppercase tracking-wide">Password</Label>
            <Input
              id="password"
              type="password"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan focus:ring-1 focus:ring-signal-cyan"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-signal-cyan text-charcoal hover:bg-signal-cyan/90 font-semibold uppercase tracking-wide"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Need access?{" "}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-signal-cyan hover:underline font-semibold"
              disabled={isLoading}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
