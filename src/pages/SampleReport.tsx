import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { TrendBarChart } from "@/components/charts/TrendBarChart";

const SampleReport = () => {
  const navigate = useNavigate();

  // Chart data - Campaign Infrastructure
  const commentersData = [
    { day: 'Mar 1', value: 15 },
    { day: 'Mar 4', value: 22 },
    { day: 'Mar 7', value: 35 },
    { day: 'Mar 9', value: 28 },
    { day: 'Mar 12', value: 32 },
    { day: 'Mar 15', value: 30 }
  ];

  const mentionsData = [
    { day: 'Mar 1', value: 18 },
    { day: 'Mar 4', value: 20 },
    { day: 'Mar 7', value: 15 },
    { day: 'Mar 9', value: 22 },
    { day: 'Mar 12', value: 24 },
    { day: 'Mar 15', value: 20 }
  ];

  const botActivityData = [
    { day: 'Mar 1', value: 2 },
    { day: 'Mar 4', value: 3 },
    { day: 'Mar 7', value: 4 },
    { day: 'Mar 9', value: 3 },
    { day: 'Mar 12', value: 2 },
    { day: 'Mar 15', value: 3 }
  ];

  const engagementData = [
    { day: 'Mar 1', value: 320 },
    { day: 'Mar 4', value: 450 },
    { day: 'Mar 7', value: 580 },
    { day: 'Mar 9', value: 420 },
    { day: 'Mar 12', value: 510 },
    { day: 'Mar 15', value: 480 }
  ];

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-off-white text-charcoal">
      {/* Header */}
      <header className="bg-charcoal text-off-white border-b border-signal-cyan/20 print:hidden">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-off-white hover:text-signal-cyan"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* PDF Preview */}
      <div className="container mx-auto px-8 py-12 max-w-5xl">
        {/* Confidential Badge - Inside PDF */}
        <div className="flex justify-end mb-4">
          <div className="bg-severe-red text-off-white px-4 py-2 text-xs uppercase tracking-wide font-semibold">
            Confidential - Internal Use Only
          </div>
        </div>

        {/* Cover Page */}
        <div className="bg-white p-16 mb-8 border border-charcoal/10">
          <Logo size="md" className="mb-16" showWordmark={true} />
          
          <div className="border-l-4 border-signal-cyan pl-8 mb-16">
            <h1 className="text-5xl font-bold uppercase tracking-wider mb-4">
              Campaign Influence<br />Briefing - Infrastructure
            </h1>
            <p className="text-xl text-graphite font-mono mb-2">
              Campaign: Infrastructure Modernization
            </p>
            <p className="text-xl text-graphite font-mono mb-4">
              Campaign Period: March 1, 2025 - March 15, 2025
            </p>
            <p className="text-sm text-amber uppercase tracking-wide font-semibold">
              Confidential — Internal Use Only
            </p>
          </div>
        </div>

        {/* Key Metrics Panel */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Key Metrics Panel
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            {/* Total Mentions */}
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Mentions</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">165</p>
              <p className="text-xs text-muted-foreground mt-2">Cross-channel visibility</p>
            </div>

            {/* Total Engagement */}
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Engagement</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">27.2</p>
              <p className="text-xs text-muted-foreground mt-2">Interactions across owned + earned / post</p>
            </div>

            {/* Dominant Theme */}
            <div className="border border-charcoal/10 p-6 col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Dominant Theme</p>
              <p className="text-2xl font-mono font-bold text-charcoal mb-1">Infrastructure Modernization</p>
              <p className="text-xs text-muted-foreground mt-2">Prevailing storyline</p>
            </div>
          </div>

          {/* Trend Dashboard */}
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Daily Metrics</h3>
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Commenters</p>
              <div className="h-56">
                <TrendLineChart 
                  data={commentersData} 
                  color="hsl(var(--signal-cyan))" 
                  domain={[0, 40]}
                />
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Mentions</p>
              <div className="h-56">
                <TrendBarChart 
                  data={mentionsData} 
                  color="hsl(var(--charcoal))" 
                  domain={[0, 30]}
                />
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Suspected Bots</p>
              <div className="h-56">
                <TrendLineChart 
                  data={botActivityData} 
                  color="hsl(var(--amber))" 
                  domain={[0, 6]}
                />
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Engagement</p>
              <div className="h-56">
                <TrendLineChart 
                  data={engagementData} 
                  color="hsl(var(--ice-blue))" 
                  domain={[0, 600]}
                />
              </div>
            </div>
          </div>

          {/* Top Keywords */}
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Top Keywords</h3>
          <div className="space-y-3 mb-12">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="font-semibold">Infrastructure modernization</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">140 engagement — Enthusiastic</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="font-semibold">Workforce pipelines</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">110 engagement — Hopeful</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-semibold">Budget oversight hearings</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">95 engagement — Critical</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="font-semibold">Ethics inquiry response</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">70 engagement — Neutral</span>
            </div>
          </div>

          {/* Top Influencers */}
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Top Influencers</h3>
          <div className="space-y-4 mb-12">
            <div className="border border-charcoal/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-muted-foreground">1.</span>
                  <div>
                    <p className="font-semibold">Regional Editorial Desk</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm">Critical</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">15 Posts — 11,200 Interactions</p>
            </div>

            <div className="border border-charcoal/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-muted-foreground">2.</span>
                  <div>
                    <p className="font-semibold">Civic Engineering Forum</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">Supportive</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">13 Posts — 9,400 Interactions</p>
            </div>

            <div className="border border-charcoal/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-muted-foreground">3.</span>
                  <div>
                    <p className="font-semibold">Transit Rider Coalition</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span className="text-sm">Curious</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">11 Posts — 7,800 Interactions</p>
            </div>
          </div>

          {/* AI Insight Summary */}
          <div className="bg-graphite/5 border-l-4 border-signal-cyan p-8">
            <h3 className="text-2xl font-bold uppercase tracking-wider mb-4">AI Insights Summary</h3>
            <p className="text-sm leading-relaxed mb-6">
              Infrastructure messaging lifted supportive sentiment, with Clean Energy and Bridge Repair lines earning sustained engagement while transit critiques persisted.
            </p>
            <h4 className="text-lg font-bold uppercase tracking-wide mb-3">Recommendations</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-signal-cyan font-bold mt-1">•</span>
                <span>Lead with visible job creation and safety milestones in all infrastructure hits.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-signal-cyan font-bold mt-1">•</span>
                <span>Keep Clean Energy Corridor benefits in rotation to reinforce hopeful tone.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-signal-cyan font-bold mt-1">•</span>
                <span>Prepare concise rebuttals on transit delays to contain critical sentiment.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-6 border border-charcoal/10 flex justify-between items-center text-sm text-muted-foreground">
          <p className="font-mono">Page 1 of 1</p>
          <p className="font-mono">Generated by Sentra Analytics Engine</p>
        </div>
      </div>
    </div>
  );
};

export default SampleReport;
