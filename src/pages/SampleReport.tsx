import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { TrendBarChart } from "@/components/charts/TrendBarChart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const SampleReport = () => {
  const navigate = useNavigate();

  // Chart data from campaign-3.pdf
  const commentersData = [
    { day: "Mar 1", value: 15 },
    { day: "Mar 4", value: 25 },
    { day: "Mar 7", value: 35 },
    { day: "Mar 9", value: 28 },
    { day: "Mar 12", value: 32 },
    { day: "Mar 15", value: 22 },
  ];

  const mentionsData = [
    { day: "Mar 1", value: 8 },
    { day: "Mar 4", value: 15 },
    { day: "Mar 7", value: 22 },
    { day: "Mar 9", value: 18 },
    { day: "Mar 12", value: 20 },
    { day: "Mar 15", value: 12 },
  ];

  const botActivityData = [
    { day: "Mar 1", value: 2 },
    { day: "Mar 4", value: 3 },
    { day: "Mar 7", value: 4 },
    { day: "Mar 9", value: 3 },
    { day: "Mar 12", value: 2 },
    { day: "Mar 15", value: 1 },
  ];

  const engagementData = [
    { day: "Mar 1", value: 450 },
    { day: "Mar 4", value: 380 },
    { day: "Mar 7", value: 520 },
    { day: "Mar 9", value: 410 },
    { day: "Mar 12", value: 480 },
    { day: "Mar 15", value: 350 },
  ];

  // Sentiment Distribution by Age Group
  const sentimentByAge = [
    { age: "18-25", sentiment: "Dismissive", value: 12 },
    { age: "26-32", sentiment: "Angry", value: 18 },
    { age: "33-39", sentiment: "Concerned", value: 28 },
    { age: "40-46", sentiment: "Critical", value: 35 },
    { age: "47-53", sentiment: "Curious", value: 58 },
    { age: "54-60", sentiment: "Neutral", value: 50 },
    { age: "61-67", sentiment: "Humorous", value: 65 },
    { age: "68-74", sentiment: "Enthusiastic", value: 92 },
    { age: "75-81", sentiment: "Hopeful", value: 78 },
    { age: "82-88", sentiment: "Supportive", value: 85 },
  ];

  // Sentiment Matrix Over Time events
  const sentimentEvents = [
    {
      date: "Mar 1",
      title: "Bridge Repair Blitz",
      source: "Press Pool Notes",
      sentiment: "Supportive",
      keywords: "jobs, safety",
      strength: 0.85,
    },
    {
      date: "Mar 4",
      title: "Clean Energy Corridor",
      source: "Regional TV Segment",
      sentiment: "Hopeful",
      keywords: "grid, renewables",
      strength: 0.78,
    },
    {
      date: "Mar 6",
      title: "Transit Upgrade Plan",
      source: "Transit Blog Recap",
      sentiment: "Critical",
      keywords: "delays, funding",
      strength: 0.35,
    },
    {
      date: "Mar 9",
      title: "Water System Renewal",
      source: "Local Radio Commentary",
      sentiment: "Concerned",
      keywords: "pipes, funding",
      strength: 0.28,
    },
  ];

  // Bot data
  const botSentiment = [
    { sentiment: "Supportive", percentage: 26 },
    { sentiment: "Angry", percentage: 24 },
    { sentiment: "Critical", percentage: 22 },
    { sentiment: "Curious", percentage: 16 },
    { sentiment: "Dismissive", percentage: 12 },
  ];

  const botTopics = [
    { topic: "Emergency declaration", percentage: 34 },
    { topic: "Budget oversight panels", percentage: 28 },
    { topic: "Election integrity debates", percentage: 24 },
    { topic: "Infrastructure appropriations", percentage: 22 },
    { topic: "Security briefings", percentage: 18 },
  ];

  const botKeywords = [
    { keyword: "BREAKING", uses: 64 },
    { keyword: "ALERT", uses: 58 },
    { keyword: "VOTE", uses: 52 },
    { keyword: "AMENDMENT", uses: 47 },
    { keyword: "OVERSIGHT", uses: 42 },
    { keyword: "URGENT", uses: 39 },
    { keyword: "HEARING", uses: 34 },
    { keyword: "BRIEFING", uses: 29 },
    { keyword: "BALLOT", uses: 26 },
    { keyword: "CAUCUS", uses: 24 },
  ];

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      Supportive: "bg-green-500",
      Hopeful: "bg-green-400",
      Enthusiastic: "bg-green-600",
      Curious: "bg-blue-400",
      Neutral: "bg-gray-400",
      Humorous: "bg-yellow-400",
      Critical: "bg-red-500",
      Concerned: "bg-orange-500",
      Angry: "bg-red-600",
      Dismissive: "bg-red-400",
    };
    return colors[sentiment] || "bg-gray-400";
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

      {/* PDF Content */}
      <div className="container mx-auto px-8 py-12 max-w-5xl">
        {/* Confidential Badge */}
        <div className="flex justify-end mb-4">
          <div className="bg-severe-red text-off-white px-4 py-2 text-xs uppercase tracking-wide font-semibold">
            Confidential - Internal
          </div>
        </div>

        {/* PAGE 1: Cover Page */}
        <div className="bg-white p-16 mb-8 border border-charcoal/10 page-break">
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
          </div>
        </div>

        {/* PAGE 2: Key Metrics Panel */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Key Metrics Panel
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Mentions</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">165</p>
            </div>

            <div className="border border-charcoal/10 p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Engagement</p>
              <p className="text-4xl font-mono font-bold text-charcoal mb-1">27.2</p>
              <p className="text-xs text-muted-foreground mt-2">/ post</p>
            </div>

            <div className="border border-charcoal/10 p-6 col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Dominant Theme</p>
              <p className="text-2xl font-mono font-bold text-charcoal mb-1">Infrastructure Modernization</p>
              <p className="text-xs text-muted-foreground mt-2">Prevailing storyline</p>
            </div>
          </div>

          {/* Top Keywords */}
          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Top Keywords</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-600"></span>
                <span className="font-semibold">Infrastructure modernization</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">140 engagement — ENTHUSIASTIC</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="font-semibold">Workforce pipelines</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">110 engagement — HOPEFUL</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-semibold">Budget oversight hearings</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">95 engagement — CRITICAL</span>
            </div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="font-semibold">Ethics inquiry response</span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">70 engagement — NEUTRAL</span>
            </div>
          </div>
        </div>

        {/* PAGE 3-4: Daily Metrics */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Daily Metrics
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Commenters</p>
              <div className="h-56">
                <TrendBarChart 
                  data={commentersData} 
                  color="hsl(var(--signal-cyan))" 
                  domain={[0, 40]}
                />
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Suspected Bots</p>
              <div className="h-56">
                <TrendLineChart 
                  data={botActivityData} 
                  color="hsl(var(--amber))" 
                  domain={[0, 5]}
                />
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Daily Mentions</p>
              <div className="h-56">
                <TrendBarChart 
                  data={mentionsData} 
                  color="hsl(var(--charcoal))" 
                  domain={[0, 25]}
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
        </div>

        {/* PAGE 5: Distribution Charts */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Distribution Charts
          </h2>
          
          <h3 className="text-xl font-bold uppercase tracking-wider mb-4">Sentiment Distribution by Age Group</h3>
          <div className="mb-8">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sentimentByAge} layout="vertical" margin={{ left: 60, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="age" type="category" tick={{ fontSize: 11 }} />
                <Bar dataKey="value" fill="hsl(var(--signal-cyan))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {sentimentByAge.map((item) => (
                <div key={item.age} className="flex items-center gap-2 text-xs">
                  <span className="font-mono">{item.age}:</span>
                  <span className="font-semibold">{item.sentiment}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAGE 6: Sentiment Matrix Over Time */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Sentiment Matrix Over Time
          </h2>
          
          <div className="space-y-6">
            {sentimentEvents.map((event) => (
              <div key={event.date} className="border-l-4 border-signal-cyan pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono mb-1">{event.date}</p>
                    <h4 className="text-xl font-bold mb-1">{event.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getSentimentColor(event.sentiment)}`}></span>
                    <span className="text-sm font-semibold">{event.sentiment}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Source: {event.source}</p>
                <p className="text-sm">Keywords: <span className="font-mono">{event.keywords}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* PAGE 7: Sub-Campaign & Leader Sentiment Matrices */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Sub-Campaign Sentiment Matrix
          </h2>
          
          <div className="space-y-6 mb-12">
            <div className="border border-charcoal/10 p-4">
              <h4 className="font-bold mb-2">Infrastructure Comms Desk</h4>
              <p className="text-sm text-muted-foreground mb-1">Source: Press Pool Notes</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-semibold">Sentiment: Supportive</span>
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <h4 className="font-bold mb-2">Capital Projects Cell</h4>
              <p className="text-sm text-muted-foreground mb-1">Source: Project Briefs</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span className="text-sm font-semibold">Sentiment: Curious</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Leader-Specific Sentiment Matrix
          </h2>
          
          <div className="space-y-6">
            <div className="border border-charcoal/10 p-4">
              <h4 className="font-bold mb-2">Campaign Lead Chen</h4>
              <p className="text-sm text-muted-foreground mb-1">Source: Press Pool Notes</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-semibold">Sentiment: Supportive</span>
              </div>
            </div>

            <div className="border border-charcoal/10 p-4">
              <h4 className="font-bold mb-2">Campaign Lead Nguyen</h4>
              <p className="text-sm text-muted-foreground mb-1">Source: Project Briefs</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span className="text-sm font-semibold">Sentiment: Curious</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 8: Bot Intelligence */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Bot Intelligence
          </h2>
          
          <div className="mb-8">
            <div className="border border-charcoal/10 p-6 mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Bots Share</p>
              <p className="text-4xl font-mono font-bold text-charcoal">1.5%</p>
              <p className="text-sm text-muted-foreground mt-2">of total commenting accounts</p>
            </div>

            <h3 className="text-xl font-bold uppercase tracking-wider mb-4">Bots Sentiment</h3>
            <div className="grid grid-cols-5 gap-4">
              {botSentiment.map((item) => (
                <div key={item.sentiment} className="border border-charcoal/10 p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-charcoal mb-1">{item.percentage}%</p>
                  <p className="text-xs text-muted-foreground uppercase">{item.sentiment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAGE 9: Bot Engagement Topics & Keywords */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Bot Engagement Topics
          </h2>
          
          <div className="space-y-3 mb-12">
            {botTopics.map((item) => (
              <div key={item.topic} className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <span className="font-semibold">{item.topic}</span>
                <span className="text-sm text-muted-foreground font-mono">{item.percentage}%</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Bot Keywords
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {botKeywords.map((item) => (
              <div key={item.keyword} className="flex items-center justify-between border border-charcoal/10 p-3">
                <span className="font-bold uppercase tracking-wider">{item.keyword}</span>
                <span className="text-sm text-muted-foreground font-mono">{item.uses} USES</span>
              </div>
            ))}
          </div>
        </div>

        {/* PAGE 10: Top Influencers */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            Top Influencers
          </h2>
          
          <div className="space-y-6">
            <div className="border border-charcoal/10 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">1.</span>
                  <h3 className="text-xl font-bold">Regional Editorial Desk</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm font-semibold uppercase tracking-wide">Critical</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-mono font-bold text-charcoal">15</p>
                  <p className="text-xs text-muted-foreground uppercase">Mentions / Posts</p>
                </div>
                <div>
                  <p className="text-3xl font-mono font-bold text-charcoal">11,200</p>
                  <p className="text-xs text-muted-foreground uppercase">Engagement / Interactions</p>
                </div>
              </div>
            </div>

            <div className="border border-charcoal/10 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">2.</span>
                  <h3 className="text-xl font-bold">Civic Engineering Forum</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm font-semibold uppercase tracking-wide">Supportive</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-mono font-bold text-charcoal">13</p>
                  <p className="text-xs text-muted-foreground uppercase">Mentions / Posts</p>
                </div>
                <div>
                  <p className="text-3xl font-mono font-bold text-charcoal">9,400</p>
                  <p className="text-xs text-muted-foreground uppercase">Engagement / Interactions</p>
                </div>
              </div>
            </div>

            <div className="border border-charcoal/10 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">3.</span>
                  <h3 className="text-xl font-bold">Transit Rider Coalition</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  <span className="text-sm font-semibold uppercase tracking-wide">Curious</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-mono font-bold text-charcoal">11</p>
                  <p className="text-xs text-muted-foreground uppercase">Mentions / Posts</p>
                </div>
                <div>
                  <p className="text-3xl font-mono font-bold text-charcoal">7,800</p>
                  <p className="text-xs text-muted-foreground uppercase">Engagement / Interactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 11: AI Insights Summary */}
        <div className="bg-white p-12 mb-8 border border-charcoal/10 page-break">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 pb-4 border-b-2 border-charcoal">
            AI Insights Summary
          </h2>
          
          <div className="bg-graphite/5 border-l-4 border-signal-cyan p-8 mb-8">
            <p className="text-base leading-relaxed mb-6">
              Infrastructure messaging lifted supportive sentiment, with Clean Energy and Bridge Repair lines earning sustained engagement while transit critiques persisted.
            </p>
          </div>

          <h3 className="text-2xl font-bold uppercase tracking-wider mb-6">Recommendations</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 border-l-2 border-signal-cyan pl-4">
              <span className="text-signal-cyan font-bold text-lg">•</span>
              <span className="text-base">Lead with visible job creation and safety milestones in all infrastructure hits.</span>
            </li>
            <li className="flex items-start gap-4 border-l-2 border-signal-cyan pl-4">
              <span className="text-signal-cyan font-bold text-lg">•</span>
              <span className="text-base">Keep Clean Energy Corridor benefits in rotation to reinforce hopeful tone.</span>
            </li>
            <li className="flex items-start gap-4 border-l-2 border-signal-cyan pl-4">
              <span className="text-signal-cyan font-bold text-lg">•</span>
              <span className="text-base">Prepare concise rebuttals on transit delays to contain critical sentiment.</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="bg-white p-6 border border-charcoal/10 flex justify-between items-center text-sm text-muted-foreground">
          <p className="font-mono">https://sentra.it.com/sample-report</p>
          <p className="font-mono">Confidential - Internal</p>
        </div>
      </div>
    </div>
  );
};

export default SampleReport;
