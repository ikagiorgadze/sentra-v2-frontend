import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Cookies = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-off-white dark:bg-off-white text-charcoal">
      {/* Header */}
      <header className="border-b border-charcoal/10">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-charcoal hover:text-signal-cyan"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Logo size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground font-mono mb-16">Last updated: January 2025</p>

        <div className="space-y-12 text-charcoal">
          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-base leading-relaxed">
              This Cookie Policy explains how Sentra ("we", "our", "the platform") uses cookies and similar technologies.
              Our objective is to maintain clarity while ensuring stable operation of the Service.
            </p>
          </section>

          {/* What Are Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">1. What Are Cookies</h2>
            <p className="text-base leading-relaxed">
              Cookies are small text files stored on your device by the browser. They perform functions such as
              maintaining your session, remembering preferences, and helping ensure platform reliability.
            </p>
            <p className="text-base leading-relaxed">
              Sentra uses cookies strictly for operational and analytical purposes.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">2. Types of Cookies We Use</h2>

            <div className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
              <h3 className="text-xl font-semibold uppercase tracking-wide">2.1 Essential Cookies</h3>
              <p className="text-base leading-relaxed">Required for the platform to function. Used for:</p>
              <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
                <li>Authentication</li>
                <li>Session management</li>
                <li>Security and access control</li>
                <li>Load balancing</li>
              </ul>
              <p className="text-base leading-relaxed">
                You cannot disable these without disrupting the Service.
              </p>
            </div>

            <div className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
              <h3 className="text-xl font-semibold uppercase tracking-wide">2.2 Performance Cookies</h3>
              <p className="text-base leading-relaxed">Used to improve stability and detect errors. We may collect:</p>
              <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
                <li>Page load times</li>
                <li>API error codes</li>
                <li>General interaction logs</li>
              </ul>
              <p className="text-base leading-relaxed">
                These cookies do not track personal browsing outside Sentra.
              </p>
            </div>

            <div className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
              <h3 className="text-xl font-semibold uppercase tracking-wide">2.3 Preference Cookies</h3>
              <p className="text-base leading-relaxed">If enabled, these store:</p>
              <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
                <li>Language selection</li>
                <li>Timezone</li>
                <li>Interface layout preferences</li>
              </ul>
              <p className="text-base leading-relaxed">
                They exist only to streamline your workflow.
              </p>
            </div>

            <div className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
              <h3 className="text-xl font-semibold uppercase tracking-wide">2.4 Analytics Cookies</h3>
              <p className="text-base leading-relaxed">
                Used to understand aggregate usage patterns. Do not identify individual users. Data may include:
              </p>
              <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
                <li>Page interactions</li>
                <li>Duration of use</li>
                <li>High-level navigation paths</li>
              </ul>
              <p className="text-base leading-relaxed">
                We do not use cookies for advertising or profiling.
              </p>
            </div>
          </section>

          {/* Cookies We Do Not Use */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">3. Cookies We Do Not Use</h2>
            <p className="text-base leading-relaxed">Sentra does not use:</p>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>Tracking cookies</li>
              <li>Advertising cookies</li>
              <li>Third-party retargeting tools</li>
              <li>Social media tracking pixels</li>
              <li>Behavioral profiling systems</li>
            </ul>
            <p className="text-base leading-relaxed">
              Our approach is minimal and operational.
            </p>
          </section>

          {/* Managing Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">4. Managing Cookies</h2>
            <p className="text-base leading-relaxed">
              You may disable non-essential cookies via your browser settings. If you block essential cookies,
              Sentra may not operate correctly.
            </p>
          </section>

          {/* Updates */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">5. Updates to This Policy</h2>
            <p className="text-base leading-relaxed">
              We may revise this Cookie Policy. Changes will be reflected in the update date above.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal/10 mt-32">
        <div className="container mx-auto px-8 py-8">
          <p className="text-xs text-muted-foreground font-mono">
            Sentra provides analytical estimates based on public digital content.
            Reports and dashboards reflect aggregated signals, not verified facts.
            All outputs are confidential and intended for internal use only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Cookies;
