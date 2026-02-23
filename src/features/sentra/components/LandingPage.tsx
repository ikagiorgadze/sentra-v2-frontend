import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Download,
  Eye,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewSample: () => void;
}

export function LandingPage({ onGetStarted, onViewSample }: LandingPageProps) {
  const personas = [
    {
      icon: Users,
      title: 'CANDIDATES',
      description: 'Real-time perception tracking',
    },
    {
      icon: BarChart3,
      title: 'CAMPAIGN MANAGERS',
      description: 'Strategic intelligence dashboards',
    },
    {
      icon: MessageSquare,
      title: 'COMMS TEAMS',
      description: 'Early warning & response',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: LinkIcon,
      title: 'CONNECT SOURCES',
      description: 'Link social media, news, and digital channels',
    },
    {
      number: '02',
      icon: Brain,
      title: 'ANALYZE',
      description: 'AI processes sentiment, visibility, and risk signals',
    },
    {
      number: '03',
      icon: FileText,
      title: 'DELIVER',
      description: 'Receive structured PDF reports on schedule',
    },
  ];

  const features = [
    {
      icon: Activity,
      title: 'CROSS-CHANNEL SENTIMENT',
      description: 'Unified sentiment tracking',
    },
    {
      icon: Shield,
      title: 'BOT DETECTION',
      description: 'Identify inauthentic activity',
    },
    {
      icon: TrendingUp,
      title: 'OPPONENT BENCHMARKS',
      description: 'Comparative analysis',
    },
    {
      icon: AlertTriangle,
      title: 'RISK SIGNALS',
      description: 'Early warning system',
    },
    {
      icon: Download,
      title: 'WEEKLY PDF REPORTS',
      description: 'Structured intelligence delivery',
    },
    {
      icon: Eye,
      title: 'ENTITY TRACKING',
      description: 'Monitor multiple figures',
    },
  ];

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#3FD6D0]" />
            <span className="text-lg tracking-wider text-foreground">SENTRA</span>
          </div>
          <button
            type="button"
            onClick={onGetStarted}
            className="rounded border border-border px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
          >
            Sign in
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#3FD6D0]" />
              <span className="text-sm uppercase tracking-wider text-muted-foreground">
                Sentra Intelligence Platform
              </span>
            </div>

            <h1 className="mb-6 text-5xl leading-tight md:text-6xl lg:text-7xl" style={{ fontWeight: 300 }}>
              KNOW THE MOOD
              <br />
              BEFORE THE
              <br />
              HEADLINES HIT
            </h1>

            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Data identifies shifts in sentiment, visibility, and influence across social and media channels.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onGetStarted}
                className="flex items-center gap-2 rounded bg-[#3FD6D0] px-6 py-3 text-[#0F1113] transition-colors hover:bg-[#3FD6D0]/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onViewSample}
                className="rounded border border-border px-6 py-3 transition-colors hover:border-[#3FD6D0]"
              >
                View Sample Report
              </button>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/2 opacity-5">
          <div className="absolute right-20 top-20 h-96 w-96 rounded-full bg-[#3FD6D0] blur-3xl" />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Who It's For</div>
            <h2 className="text-3xl" style={{ fontWeight: 400 }}>
              Built for decision-makers who need
              <br />
              real-time intelligence
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {personas.map((persona) => (
              <div
                key={persona.title}
                className="group rounded-lg border border-border bg-card p-8 transition-colors hover:border-[#3FD6D0]"
              >
                <persona.icon className="mb-6 h-10 w-10 text-[#3FD6D0]" />
                <h3 className="mb-2 text-sm font-medium tracking-wider">{persona.title}</h3>
                <p className="text-muted-foreground">{persona.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">How It Works</div>
            <h2 className="text-3xl" style={{ fontWeight: 400 }}>
              Intelligence in three steps
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="space-y-4">
                  <div className="font-mono text-5xl text-[#3FD6D0]/20">{step.number}</div>
                  <step.icon className="h-8 w-8 text-[#3FD6D0]" />
                  <h3 className="text-sm font-medium tracking-wider">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="absolute left-full top-12 hidden h-px w-full bg-border md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Features</div>
            <h2 className="text-3xl" style={{ fontWeight: 400 }}>
              Complete intelligence toolkit
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-[#3FD6D0]"
              >
                <feature.icon className="mb-4 h-6 w-6 text-[#3FD6D0]" />
                <h3 className="mb-2 text-xs font-medium tracking-wider">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <h2 className="text-4xl" style={{ fontWeight: 400 }}>
              Ready to turn signals into strategy?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join political campaigns and communications teams using Sentra to stay ahead.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={onGetStarted}
                className="flex items-center gap-2 rounded bg-[#3FD6D0] px-8 py-4 text-[#0F1113] transition-colors hover:bg-[#3FD6D0]/90"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#3FD6D0]" />
              <span className="text-sm tracking-wider text-foreground">SENTRA</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2026 Sentra Intelligence. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
