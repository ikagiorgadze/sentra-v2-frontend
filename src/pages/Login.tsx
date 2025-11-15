import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateContext";
import { determineUserRoute } from "@/hooks/useUserStateRouting";

const Login = () => {
  const navigate = useNavigate();
  const { login, userState } = useUserState();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData.email);
    const correctRoute = determineUserRoute(userState);
    navigate(correctRoute);
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
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-signal-cyan text-charcoal hover:bg-signal-cyan/90 font-semibold uppercase tracking-wide"
          >
            Sign In
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Need access?{" "}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-signal-cyan hover:underline font-semibold"
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
