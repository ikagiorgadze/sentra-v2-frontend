import { useNavigate } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

const Billing = () => {
  const navigate = useNavigate();
  const { userState, updateUserState, logout } = useUserState();

  const handleReactivate = () => {
    updateUserState({ subscriptionStatus: 'active' });
    toast.success("Subscription reactivated successfully");
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-mono uppercase tracking-wider">SENTRA</h1>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-amber/10 border border-amber/30 rounded-lg p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Access Paused</h2>
            <p className="text-muted-foreground">
              Your subscription status: <span className="text-amber font-mono uppercase">{userState.subscriptionStatus}</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Please update your subscription to continue accessing your dashboard and reports.
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-6 uppercase tracking-wide">Select a Plan</h3>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6 border-border hover:border-signal-cyan/50 transition-colors">
            <h4 className="text-lg font-semibold mb-2 uppercase tracking-wide">Pilot Package</h4>
            <p className="text-3xl font-bold mb-4 font-mono">€2,500<span className="text-sm text-muted-foreground">/mo</span></p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">3 entities tracked</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Weekly intelligence reports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Core metrics suite</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Email support</span>
              </li>
            </ul>
            <Button className="w-full" variant="outline" onClick={handleReactivate}>
              Select Pilot
            </Button>
          </Card>

          <Card className="p-6 border-signal-cyan/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal-cyan text-charcoal px-4 py-1 text-xs font-mono uppercase tracking-wider rounded">
              Recommended
            </div>
            <h4 className="text-lg font-semibold mb-2 uppercase tracking-wide">Campaign Suite</h4>
            <p className="text-3xl font-bold mb-4 font-mono">€5,000<span className="text-sm text-muted-foreground">/mo</span></p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">10 entities tracked</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Daily intelligence reports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Full metrics suite</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Real-time alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            <Button className="w-full" onClick={handleReactivate}>
              Select Campaign
            </Button>
          </Card>

          <Card className="p-6 border-border hover:border-signal-cyan/50 transition-colors">
            <h4 className="text-lg font-semibold mb-2 uppercase tracking-wide">Enterprise</h4>
            <p className="text-3xl font-bold mb-4 font-mono">Custom</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Unlimited entities</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Custom report frequency</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
                <span className="text-sm">24/7 support</span>
              </li>
            </ul>
            <Button className="w-full" variant="outline">
              Contact Sales
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
