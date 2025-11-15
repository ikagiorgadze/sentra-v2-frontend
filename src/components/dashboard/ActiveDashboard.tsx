import { useNavigate } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Database, Activity, TrendingUp, Clock, Calendar, CheckCircle2, FileText } from "lucide-react";

const ActiveDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useUserState();

  const handleSignOut = () => {
    logout();
    navigate("/");
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
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide">Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring and analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Database className="w-8 h-8 text-signal-cyan" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Entities Tracked</h3>
            <p className="text-3xl font-mono">{userState.configuration?.leader?.name ? 1 : 0}</p>
            <p className="text-xs text-signal-cyan mt-2">{userState.configuration?.leader?.name || 'No configuration'}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Activity className="w-8 h-8 text-signal-cyan" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Data Sources</h3>
            <p className="text-3xl font-mono">8</p>
            <p className="text-xs text-signal-cyan mt-2">All sources active</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-signal-cyan" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Metrics Enabled</h3>
            <p className="text-3xl font-mono">15</p>
            <p className="text-xs text-signal-cyan mt-2">Full suite active</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Clock className="w-8 h-8 text-amber" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Frequency</h3>
            <p className="text-3xl font-mono">Weekly</p>
            <p className="text-xs text-muted-foreground mt-2">Every Monday at 08:00</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Calendar className="w-8 h-8 text-ice-blue" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Next Report</h3>
            <p className="text-3xl font-mono text-sm">Jan 20, 08:00</p>
            <p className="text-xs text-muted-foreground mt-2">2 days remaining</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-signal-cyan" />
            </div>
            <h3 className="text-sm uppercase tracking-wider mb-2 text-muted-foreground">Status</h3>
            <p className="text-3xl font-mono text-sm">ACTIVE</p>
            <p className="text-xs text-signal-cyan mt-2">All systems operational</p>
          </Card>
        </div>

        <Card className="p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 uppercase tracking-wide">Recent Reports</h2>
              <p className="text-muted-foreground">Your latest intelligence briefings</p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <FileText className="w-10 h-10 text-signal-cyan" />
                <div>
                  <h3 className="text-lg font-semibold mb-1 uppercase tracking-wide">Weekly Intelligence Report</h3>
                  <p className="text-sm text-muted-foreground mb-2">Generated: January 15, 2025 08:00</p>
                  <p className="text-sm">Comprehensive analysis of political sentiment, media coverage, and engagement metrics.</p>
                </div>
              </div>
              <Button onClick={() => navigate("/sample-report")}>View Report</Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide">Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/onboarding")}>
                Edit Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/sample-report")}>
                View Sample Report
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-signal-cyan/30 bg-signal-cyan/5">
            <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide">System Status</h3>
            <p className="text-sm text-muted-foreground mb-4">All monitoring systems are operational</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Data Collection</span>
                <span className="text-signal-cyan font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Analysis Engine</span>
                <span className="text-signal-cyan font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Report Generation</span>
                <span className="text-signal-cyan font-mono">READY</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ActiveDashboard;
