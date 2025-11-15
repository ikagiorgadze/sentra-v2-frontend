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
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        {/* Cover Page */}
        <div className="bg-white p-16 mb-8 border border-charcoal/10">
          <Logo size="md" className="mb-16" showWordmark={true} />
          
          <div className="border-l-4 border-signal-cyan pl-8 mb-16">
            <h1 className="text-5xl font-bold uppercase tracking-wider mb-4">
              Weekly Intelligence<br />Report
            </h1>
            <p className="text-xl text-muted-foreground font-mono">
              Period: January 6 – January 13, 2025
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground uppercase tracking-wide text-xs mb-1">Organization</p>
                <p className="font-semibold">Campaign Central</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wide text-xs mb-1">Report ID</p>
                <p className="font-mono">RPT-2025-W02</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Executive Summary
          </h2>
          
          <div className="bg-graphite/5 border-l-4 border-signal-cyan p-6 mb-8">
            <p className="text-sm leading-relaxed">
              Data indicates measurable shifts in public sentiment across monitored channels. 
              Net sentiment for primary entity increased 8.2% week-over-week. Opposition visibility 
              declined 12% on social platforms. Bot activity detected in 3.7% of interactions, 
              within normal parameters. No significant risk events identified.
            </p>
          </div>

          <h3 className="text-xl font-bold uppercase tracking-wide mb-4">Key Metrics</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-charcoal/10 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Net Sentiment</p>
                <p className="text-3xl font-mono font-bold text-signal-cyan">+64%</p>
                <p className="text-xs text-muted-foreground mt-1">↑ 8.2% vs last week</p>
              </div>
              
              <div className="border border-charcoal/10 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Mentions</p>
                <p className="text-3xl font-mono font-bold">18,472</p>
                <p className="text-xs text-muted-foreground mt-1">↑ 15.3% vs last week</p>
              </div>
              
              <div className="border border-charcoal/10 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Bot Activity</p>
                <p className="text-3xl font-mono font-bold text-amber">3.7%</p>
                <p className="text-xs text-muted-foreground mt-1">Within normal range</p>
              </div>
            </div>

            <div className="border border-charcoal/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10 bg-graphite/5">
                    <th className="text-left p-4 font-semibold uppercase tracking-wide text-xs">Channel</th>
                    <th className="text-right p-4 font-semibold uppercase tracking-wide text-xs">Mentions</th>
                    <th className="text-right p-4 font-semibold uppercase tracking-wide text-xs">Sentiment</th>
                    <th className="text-right p-4 font-semibold uppercase tracking-wide text-xs">Change</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-charcoal/10">
                    <td className="p-4">X (Twitter)</td>
                    <td className="text-right p-4">8,234</td>
                    <td className="text-right p-4 text-signal-cyan">+68%</td>
                    <td className="text-right p-4">↑ 12%</td>
                  </tr>
                  <tr className="border-b border-charcoal/10">
                    <td className="p-4">Facebook</td>
                    <td className="text-right p-4">5,891</td>
                    <td className="text-right p-4 text-signal-cyan">+62%</td>
                    <td className="text-right p-4">↑ 8%</td>
                  </tr>
                  <tr className="border-b border-charcoal/10">
                    <td className="p-4">News Sites</td>
                    <td className="text-right p-4">3,127</td>
                    <td className="text-right p-4 text-signal-cyan">+71%</td>
                    <td className="text-right p-4">↑ 19%</td>
                  </tr>
                  <tr>
                    <td className="p-4">YouTube</td>
                    <td className="text-right p-4">1,220</td>
                    <td className="text-right p-4 text-signal-cyan">+59%</td>
                    <td className="text-right p-4">↓ 3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Opposition Comparison */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Opposition Comparison
          </h2>
          
          <div className="border border-charcoal/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-graphite/5">
                  <th className="text-left p-4 font-semibold uppercase tracking-wide text-xs">Entity</th>
                  <th className="text-right p-4 font-semibold uppercase tracking-wide text-xs">Visibility</th>
                  <th className="text-right p-4 font-semibold uppercase tracking-wide text-xs">Sentiment</th>
                  <th className="text-right p-4 font-semibold uppercase tracking-wide text-xs">Trend</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-charcoal/10 bg-signal-cyan/5">
                  <td className="p-4 font-semibold">Your Campaign</td>
                  <td className="text-right p-4">18,472</td>
                  <td className="text-right p-4 text-signal-cyan">+64%</td>
                  <td className="text-right p-4 text-signal-cyan">↑ Strong</td>
                </tr>
                <tr className="border-b border-charcoal/10">
                  <td className="p-4">Opposition A</td>
                  <td className="text-right p-4">14,293</td>
                  <td className="text-right p-4">+42%</td>
                  <td className="text-right p-4">↓ Declining</td>
                </tr>
                <tr>
                  <td className="p-4">Opposition B</td>
                  <td className="text-right p-4">9,817</td>
                  <td className="text-right p-4">+38%</td>
                  <td className="text-right p-4">→ Stable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-graphite/5 p-8 border border-charcoal/10 text-center">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Confidential — For Internal Strategic Use Only
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Sentra Intelligence Platform • Report ID: RPT-2025-W02
          </p>
        </div>
      </div>
    </div>
  );
};

export default SampleReport;
