import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    organization: "",
    role: "",
    country: "",
    password: "",
    confirmPassword: "",
    authorized: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to onboarding after registration
    navigate('/onboarding');
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
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Registration</h1>
            <p className="text-sm text-muted-foreground">Authorized personnel only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm uppercase tracking-wide">Work Email</Label>
            <Input
              id="email"
              type="email"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm uppercase tracking-wide">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization" className="text-sm uppercase tracking-wide">Organization / Party</Label>
            <Input
              id="organization"
              type="text"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm uppercase tracking-wide">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-graphite border-signal-cyan/20">
                <SelectItem value="candidate">Candidate</SelectItem>
                <SelectItem value="campaign-manager">Campaign Manager</SelectItem>
                <SelectItem value="communications">Communications Director</SelectItem>
                <SelectItem value="strategist">Political Strategist</SelectItem>
                <SelectItem value="analyst">Policy Analyst</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm uppercase tracking-wide">Country</Label>
            <Input
              id="country"
              type="text"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm uppercase tracking-wide">Password</Label>
            <Input
              id="password"
              type="password"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm uppercase tracking-wide">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              className="bg-graphite border-signal-cyan/20 focus:border-signal-cyan"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="authorized"
              checked={formData.authorized}
              onCheckedChange={(checked) => setFormData({ ...formData, authorized: checked as boolean })}
              className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:border-signal-cyan"
            />
            <Label htmlFor="authorized" className="text-sm leading-tight cursor-pointer">
              I confirm I am authorized to receive political analytics.
            </Label>
          </div>

          <Button 
            type="submit"
            className="w-full bg-signal-cyan text-charcoal hover:bg-signal-cyan/90 font-semibold uppercase tracking-wide"
            disabled={!formData.authorized}
          >
            Register
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have access?{" "}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-signal-cyan hover:underline font-semibold"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
