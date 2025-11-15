import { useNavigate } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import { Database, Activity, TrendingUp, Clock, FileText, Settings } from "lucide-react";

const PendingDashboard = () => {
  const navigate = useNavigate();
  const { userState, logout } = useUserState();

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const getExpectedTime = () => {
    if (userState.dataReadyAt) {
      return new Date(userState.dataReadyAt).toLocaleString();
    }
    const future = new Date();
    future.setHours(future.getHours() + 48);
    return future.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-signal-cyan/10 border border-signal-cyan/30 rounded-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-signal-cyan rounded-full animate-pulse" />
            <h2 className="text-sm uppercase tracking-wider font-mono">Collecting Data</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Your intelligence platform is now gathering data from configured sources.
            First report expected: <span className="text-signal-cyan font-mono">{getExpectedTime()}</span>
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Initialization Progress</span>
              <span className="text-signal-cyan font-mono">33%</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 border-border/50 bg-charcoal/20">
            <div className="flex items-start justify-between mb-4">
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Entities Tracked</h3>
            <p className="text-3xl font-mono text-muted-foreground">--</p>
            <p className="text-xs text-muted-foreground/70 mt-2">Awaiting data collection</p>
          </Card>

          <Card className="p-6 border-border/50 bg-charcoal/20">
            <div className="flex items-start justify-between mb-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Data Sources</h3>
            <p className="text-3xl font-mono text-muted-foreground">--</p>
            <p className="text-xs text-muted-foreground/70 mt-2">Initializing connections</p>
          </Card>

          <Card className="p-6 border-border/50 bg-charcoal/20">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Metrics Enabled</h3>
            <p className="text-3xl font-mono text-muted-foreground">--</p>
            <p className="text-xs text-muted-foreground/70 mt-2">Processing baseline</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <FileText className="w-10 h-10 text-signal-cyan" />
              <div>
                <h3 className="text-xl font-semibold mb-2 uppercase tracking-wide">Sample Report Available</h3>
                <p className="text-muted-foreground text-sm">
                  Explore a demo report to understand the format and insights you'll receive once data collection is complete.
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => navigate("/sample-report")}>
              View Sample Report
            </Button>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Settings className="w-10 h-10 text-signal-cyan" />
              <div>
                <h3 className="text-xl font-semibold mb-2 uppercase tracking-wide">Edit Configuration</h3>
                <p className="text-muted-foreground text-sm">
                  Review or modify your tracking parameters, data sources, and report preferences.
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/onboarding")}>
              Edit Configuration
            </Button>
          </Card>
        </div>

        <Card className="p-6 mt-8 border-border/50">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-signal-cyan mt-1 shrink-0" />
            <div>
              <h4 className="font-semibold mb-2 uppercase tracking-wide text-sm">What's Happening Now</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Establishing connections to {userState.configuration?.dataSources?.length || 0} data sources</li>
                <li>• Indexing historical data for baseline analysis</li>
                <li>• Calibrating sentiment and engagement metrics</li>
                <li>• Preparing personalized dashboards and alerts</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PendingDashboard;
