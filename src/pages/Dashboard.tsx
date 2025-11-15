import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { FileText, Settings, Calendar, Users, Database, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-graphite text-off-white">
      {/* Header */}
      <header className="border-b border-signal-cyan/20 bg-charcoal">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <Logo size="md" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-off-white hover:text-signal-cyan"
          >
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">Dashboard</h1>
          <p className="text-muted-foreground font-mono">Intelligence Control Panel</p>
        </div>

        {/* Summary Panel */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-charcoal border border-signal-cyan/20">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-signal-cyan" />
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Entities Tracked</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-signal-cyan">3</p>
            <p className="text-xs text-muted-foreground mt-1">Leaders, Opposition</p>
          </div>

          <div className="p-6 bg-charcoal border border-signal-cyan/20">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-signal-cyan" />
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Data Sources</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-signal-cyan">5</p>
            <p className="text-xs text-muted-foreground mt-1">Active Channels</p>
          </div>

          <div className="p-6 bg-charcoal border border-signal-cyan/20">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-signal-cyan" />
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Metrics Enabled</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-signal-cyan">7</p>
            <p className="text-xs text-muted-foreground mt-1">Active Analytics</p>
          </div>

          <div className="p-6 bg-charcoal border border-signal-cyan/20">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-signal-cyan" />
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Frequency</h3>
            </div>
            <p className="text-2xl font-mono font-bold">Weekly</p>
            <p className="text-xs text-muted-foreground mt-1">Every Monday, 08:00</p>
          </div>

          <div className="p-6 bg-charcoal border border-signal-cyan/20">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-signal-cyan" />
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Next Report</h3>
            </div>
            <p className="text-2xl font-mono font-bold">Jan 20, 2025</p>
            <p className="text-xs text-muted-foreground mt-1">5 days remaining</p>
          </div>

          <div className="p-6 bg-charcoal border border-signal-cyan/20">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-signal-cyan" />
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Status</h3>
            </div>
            <p className="text-2xl font-mono font-bold text-signal-cyan">Active</p>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </div>
        </div>

        {/* Last Report Card */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Recent Reports</h2>
          
          <div className="bg-charcoal border border-signal-cyan/20 p-8 hover:border-signal-cyan/40 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-signal-cyan" />
                  <h3 className="text-xl font-semibold uppercase tracking-wide">
                    Weekly Intelligence Report
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  Generated: January 13, 2025 08:00 UTC
                </p>
                <p className="text-sm text-muted-foreground">
                  Comprehensive sentiment analysis, visibility metrics, and risk assessments
                </p>
              </div>
              
              <Button
                variant="outline"
                className="border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal"
                onClick={() => navigate('/sample-report')}
              >
                View Report
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal"
            onClick={() => navigate('/onboarding')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Configuration
          </Button>
          
          <Button
            variant="outline"
            className="border-signal-cyan/20 text-off-white hover:border-signal-cyan hover:text-signal-cyan"
            onClick={() => navigate('/sample-report')}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Sample Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
