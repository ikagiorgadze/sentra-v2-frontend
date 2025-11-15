import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

const SampleReport = () => {
  const navigate = useNavigate();

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
            className="border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* PDF Preview */}
      <div className="container mx-auto px-8 py-12 max-w-5xl">
        {/* Cover Page */}
        <div className="bg-white p-16 mb-8 border border-charcoal/10">
          <Logo size="md" className="mb-16" showWordmark={true} />
          
          <div className="border-l-4 border-signal-cyan pl-8 mb-16">
            <h1 className="text-5xl font-bold uppercase tracking-wider mb-4">
              Weekly Influence &<br />Sentiment Report
            </h1>
            <p className="text-xl text-graphite font-mono mb-2">
              Leader: [Full Name]
            </p>
            <p className="text-xl text-graphite font-mono mb-4">
              Period: January 6 – January 13, 2025
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {/* Total Mentions */}
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Mentions</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">58,230</p>
              <p className="text-sm text-signal-cyan font-semibold">▲ +12%</p>
              <p className="text-xs text-muted-foreground mt-2">Visibility</p>
            </div>

            {/* Net Sentiment */}
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Net Sentiment</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">+18%</p>
              <p className="text-sm text-signal-cyan font-semibold">▲ +6%</p>
              <p className="text-xs text-muted-foreground mt-2">Public Mood</p>
            </div>

            {/* Bot Share */}
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Bot Share</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">22%</p>
              <p className="text-sm text-amber font-semibold">▼ –3%</p>
              <p className="text-xs text-muted-foreground mt-2">Stability</p>
            </div>

            {/* Engagement Rate */}
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Engagement Rate</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">4.2%</p>
              <p className="text-sm text-signal-cyan font-semibold">▲ +0.5%</p>
              <p className="text-xs text-muted-foreground mt-2">Interaction Quality</p>
            </div>

            {/* Dominant Topic */}
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Dominant Topic</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">"Inflation"</p>
              <p className="text-sm text-graphite font-semibold">Neutral</p>
              <p className="text-xs text-muted-foreground mt-2">Topic Momentum</p>
            </div>
          </div>

          {/* Trend Dashboard */}
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Trend Overview</h3>
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Sentiment Over Time (7 Days)</p>
              <div className="h-32 bg-graphite/5 flex items-end justify-around gap-1 p-4">
                <div className="bg-signal-cyan/60 w-full" style={{ height: '45%' }}></div>
                <div className="bg-signal-cyan/60 w-full" style={{ height: '55%' }}></div>
                <div className="bg-signal-cyan/60 w-full" style={{ height: '50%' }}></div>
                <div className="bg-signal-cyan/60 w-full" style={{ height: '70%' }}></div>
                <div className="bg-signal-cyan/60 w-full" style={{ height: '65%' }}></div>
                <div className="bg-signal-cyan/60 w-full" style={{ height: '80%' }}></div>
                <div className="bg-signal-cyan w-full" style={{ height: '85%' }}></div>
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Mentions Volume</p>
              <div className="h-32 bg-graphite/5 flex items-end justify-around gap-1 p-4">
                <div className="bg-graphite w-full" style={{ height: '60%' }}></div>
                <div className="bg-graphite w-full" style={{ height: '65%' }}></div>
                <div className="bg-graphite w-full" style={{ height: '55%' }}></div>
                <div className="bg-graphite w-full" style={{ height: '70%' }}></div>
                <div className="bg-graphite w-full" style={{ height: '75%' }}></div>
                <div className="bg-graphite w-full" style={{ height: '85%' }}></div>
                <div className="bg-charcoal w-full" style={{ height: '90%' }}></div>
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Bot Activity Trend</p>
              <div className="h-32 bg-graphite/5 flex items-end justify-around gap-1 p-4">
                <div className="bg-amber/60 w-full" style={{ height: '50%' }}></div>
                <div className="bg-amber/60 w-full" style={{ height: '45%' }}></div>
                <div className="bg-amber/60 w-full" style={{ height: '40%' }}></div>
                <div className="bg-amber/60 w-full" style={{ height: '35%' }}></div>
                <div className="bg-amber/60 w-full" style={{ height: '30%' }}></div>
                <div className="bg-amber/60 w-full" style={{ height: '25%' }}></div>
                <div className="bg-amber w-full" style={{ height: '22%' }}></div>
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Engagement Spikes</p>
              <div className="h-32 bg-graphite/5 flex items-end justify-around gap-1 p-4">
                <div className="bg-ice-blue w-full" style={{ height: '40%' }}></div>
                <div className="bg-ice-blue w-full" style={{ height: '35%' }}></div>
                <div className="bg-ice-blue w-full" style={{ height: '55%' }}></div>
                <div className="bg-ice-blue w-full" style={{ height: '45%' }}></div>
                <div className="bg-ice-blue w-full" style={{ height: '60%' }}></div>
                <div className="bg-ice-blue w-full" style={{ height: '50%' }}></div>
                <div className="bg-signal-cyan w-full" style={{ height: '70%' }}></div>
              </div>
            </div>
          </div>

          {/* Top Keywords */}
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Top Keywords</h3>
          <div className="space-y-3 mb-12">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-semibold">inflation</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">14,230 mentions — Negative</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="font-semibold">jobs</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">9,450 mentions — Positive</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="font-semibold">reforms</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">7,120 mentions — Positive</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-semibold">fuel prices</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">6,880 mentions — Negative</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="font-semibold">youth programs</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">4,310 mentions — Neutral</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-semibold">corruption</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">3,920 mentions — Negative</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="font-semibold">education</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">3,410 mentions — Neutral</span>
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
                    <p className="font-semibold">Ana Gelashvili</p>
                    <p className="text-sm text-muted-foreground">YouTube — 184K followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">Positive</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">Influence Score: 92</p>
            </div>

            <div className="border border-charcoal/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-muted-foreground">2.</span>
                  <div>
                    <p className="font-semibold">Political Insight (Channel)</p>
                    <p className="text-sm text-muted-foreground">Facebook — 92K followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span className="text-sm">Neutral</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">Influence Score: 78</p>
            </div>

            <div className="border border-charcoal/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-muted-foreground">3.</span>
                  <div>
                    <p className="font-semibold">Giorgi Tsiklauri</p>
                    <p className="text-sm text-muted-foreground">Telegram — 44K followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm">Negative</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">Influence Score: 74</p>
            </div>

            <div className="border border-charcoal/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-muted-foreground">4.</span>
                  <div>
                    <p className="font-semibold">Civic Watch</p>
                    <p className="text-sm text-muted-foreground">Twitter — 61K followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">Positive</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">Influence Score: 69</p>
            </div>

            <div className="border border-charcoal/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-muted-foreground">5.</span>
                  <div>
                    <p className="font-semibold">Independent Analyst</p>
                    <p className="text-sm text-muted-foreground">TikTok — 120K followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm">Negative</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono">Influence Score: 65</p>
            </div>
          </div>

          {/* AI Insight Summary */}
          <div className="bg-graphite/5 border-l-4 border-signal-cyan p-8">
            <h3 className="text-2xl font-bold uppercase tracking-wider mb-4">AI Insight Summary</h3>
            <p className="text-sm leading-relaxed mb-6">
              Public sentiment improved following the youth employment announcement. Negative chatter on 
              Telegram decreased by 20%, while YouTube discussions around economic reforms gained 30% more 
              positive commentary. A new disinformation cluster around fuel pricing has started to emerge, 
              but its spread is currently limited.
            </p>
            <h4 className="text-lg font-bold uppercase tracking-wide mb-3">Recommendations</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-signal-cyan font-bold mt-1">•</span>
                <span>Increase visibility on youth-focused platforms during the next two days.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-signal-cyan font-bold mt-1">•</span>
                <span>Prepare a counter-message addressing fuel price disinformation before amplification begins.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-signal-cyan font-bold mt-1">•</span>
                <span>Boost positive reform narratives through aligned influencers in the economic sector.</span>
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
