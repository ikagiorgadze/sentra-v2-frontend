import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, Shield, AlertTriangle, FileText, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-charcoal text-off-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <Logo size="lg" />
              
              <h1 className="text-5xl lg:text-6xl font-bold tracking-wider uppercase leading-tight">
                KNOW THE MOOD<br />
                BEFORE THE<br />
                HEADLINES HIT
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Data identifies shifts in sentiment, visibility, and influence across social and media channels.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal transition-all duration-300 hover:shadow-glow-cyan"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-off-white hover:text-signal-cyan transition-colors"
                  onClick={() => navigate('/sample-report')}
                >
                  View Sample Report
                </Button>
              </div>
            </div>

            {/* Right: Animated Grid */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <div className="grid grid-cols-3 gap-4 w-64 h-64">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-full bg-graphite border border-signal-cyan/20 animate-pulse"
                      style={{
                        animationDelay: `${i * 100}ms`,
                        animationDuration: '2s',
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div 
                          className="w-2 h-2 bg-signal-cyan rounded-full"
                          style={{
                            opacity: i === 4 ? 1 : 0.4,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 bg-graphite">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-16 text-center">
            Who It's For
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Candidates", desc: "Real-time perception tracking" },
              { icon: BarChart3, title: "Campaign Managers", desc: "Strategic intelligence dashboards" },
              { icon: Shield, title: "Comms Teams", desc: "Early warning & response" }
            ].map((item, i) => (
              <div 
                key={i}
                className="p-8 border border-signal-cyan/10 hover:border-signal-cyan/30 transition-all duration-300"
              >
                <item.icon className="w-12 h-12 text-signal-cyan mb-4" strokeWidth={1} />
                <h3 className="text-xl font-semibold mb-2 uppercase tracking-wide">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-charcoal">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-16 text-center">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { num: "01", title: "Connect Sources", desc: "Link social media, news, and digital channels" },
              { num: "02", title: "Analyze", desc: "AI processes sentiment, visibility, and risk signals" },
              { num: "03", title: "Deliver", desc: "Receive structured PDF reports on schedule" }
            ].map((step, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="font-mono text-5xl font-bold text-signal-cyan">{step.num}</div>
                <h3 className="text-xl font-semibold uppercase tracking-wide">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-graphite">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-16 text-center">
            Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: TrendingUp, title: "Cross-Channel Sentiment", desc: "Unified sentiment tracking" },
              { icon: Shield, title: "Bot Detection", desc: "Identify inauthentic activity" },
              { icon: BarChart3, title: "Opponent Benchmarks", desc: "Comparative analysis" },
              { icon: AlertTriangle, title: "Risk Signals", desc: "Early warning system" },
              { icon: FileText, title: "Weekly PDF Reports", desc: "Structured intelligence delivery" },
              { icon: Users, title: "Entity Tracking", desc: "Monitor multiple figures" }
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-6 border border-signal-cyan/10 hover:border-signal-cyan/30 transition-all duration-300 group"
              >
                <feature.icon className="w-8 h-8 text-signal-cyan mb-3 group-hover:scale-110 transition-transform" strokeWidth={1} />
                <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot CTA */}
      <section className="py-24 bg-charcoal">
        <div className="container mx-auto px-8">
          <div className="max-w-2xl mx-auto border border-signal-cyan/20 p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold uppercase tracking-wider">Pilot Package</h2>
            <p className="text-muted-foreground">
              Limited availability for political organizations seeking objective intelligence.
            </p>
            <Button 
              variant="outline"
              size="lg"
              className="border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal transition-all duration-300 hover:shadow-glow-cyan"
              onClick={() => navigate('/register')}
            >
              Request Access
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-graphite border-t border-signal-cyan/10">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo size="sm" />
            
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-signal-cyan transition-colors">About</a>
              <a href="#" className="hover:text-signal-cyan transition-colors">Privacy</a>
              <a href="#" className="hover:text-signal-cyan transition-colors">Terms</a>
              <a href="#" className="hover:text-signal-cyan transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-muted-foreground font-mono">
            Sentra — Confidential political analytics.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
