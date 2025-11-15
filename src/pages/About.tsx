import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-off-white dark:bg-graphite">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-foreground hover:text-signal-cyan"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Logo size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-24 max-w-4xl">
        {/* Nine-dot watermark */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] z-0">
          <div className="grid grid-cols-3 gap-4 w-64 h-64">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-full bg-signal-cyan rounded-sm"
                style={{ opacity: i === 4 ? 1 : 0.6 }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-24">
          {/* Hero */}
          <div className="space-y-6">
            <div className="w-16 h-[1px] bg-signal-cyan mb-8"></div>
            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tight text-foreground">
              Where Signals Become Strategy
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Sentra is a political intelligence platform that converts digital noise into analytical clarity.
            </p>
          </div>

          {/* Three Sections */}
          <div className="space-y-16">
            {/* Section 1 */}
            <div className="space-y-4 pl-8 border-l-2 border-signal-cyan/20">
              <h2 className="text-2xl font-semibold uppercase tracking-wide text-foreground">
                Neutral Observation
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Sentra observes public digital discourse without bias. It does not interpret intent.
                It does not filter by ideology. It collects signals as they appear—X posts, news articles,
                Facebook threads—and converts them into structured data. The platform identifies patterns,
                not narratives.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4 pl-8 border-l-2 border-signal-cyan/20">
              <h2 className="text-2xl font-semibold uppercase tracking-wide text-foreground">
                Analytical Discipline
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Every metric is calculated. Every trend is measured. Sentiment analysis, engagement velocity,
                bot detection, and opposition tracking operate on established computational models.
                Sentra does not speculate. It quantifies. Reports are built from data aggregates, not assumptions.
                Accuracy is prioritized over speed.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-4 pl-8 border-l-2 border-signal-cyan/20">
              <h2 className="text-2xl font-semibold uppercase tracking-wide text-foreground">
                Quiet Strategy
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Sentra delivers intelligence, not instructions. It provides weekly or daily reports configured
                to each client's requirements. The platform does not advise on messaging, tactics, or public relations.
                It supplies clarity so strategists can make informed decisions independently.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="space-y-6 pt-8">
            <h2 className="text-2xl font-semibold uppercase tracking-wide text-foreground">
              Mission
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              Sentra exists to remove ambiguity from political communication analysis. Campaigns operate
              in environments saturated with competing signals—partisan media, algorithmic distortion,
              astroturfed trends. Sentra cuts through the noise. It does not promise influence.
              It promises measurement.
            </p>
          </div>

          {/* Brand Positioning */}
          <div className="border-t-2 border-signal-cyan/20 pt-12">
            <blockquote className="text-2xl md:text-3xl font-light italic text-foreground leading-relaxed">
              "Sentra does not campaign. Sentra does not shape public opinion. Sentra measures it."
            </blockquote>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-32">
        <div className="container mx-auto px-8 py-8">
          <p className="text-xs text-muted-foreground font-mono">
            Sentra provides analytical estimates based on public digital content.
            Reports and dashboards reflect aggregated signals, not verified facts.
            Sentra does not guarantee accuracy of third-party data, nor does it provide legal, strategic, or political advice.
            All outputs are confidential and intended for internal use only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
