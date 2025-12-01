import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
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
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground font-mono mb-16">Last updated: January 2025</p>

        <div className="space-y-12 text-charcoal">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">Information We Collect</h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p>
                Sentra collects only the data necessary to operate the platform and deliver intelligence reports.
                We do not sell user data. We do not share it with third parties for marketing purposes.
              </p>
            </div>
          </section>

          {/* Account Info */}
          <section className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
            <h3 className="text-xl font-semibold uppercase tracking-wide">Account Information</h3>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>Email address</li>
              <li>Full name</li>
              <li>Organization name</li>
              <li>Role / title</li>
              <li>Country</li>
              <li>Password (encrypted)</li>
            </ul>
          </section>

          {/* Configuration Data */}
          <section className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
            <h3 className="text-xl font-semibold uppercase tracking-wide">Configuration Data</h3>
            <p className="text-base leading-relaxed">
              Your onboarding preferences are stored to generate reports:
            </p>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>Principal name, role, party affiliation, region</li>
              <li>Opponent profiles (name, role, party, region)</li>
              <li>Monitored channels (X, Facebook, News)</li>
              <li>PDF report preferences</li>
              <li>Delivery frequency and recipient email addresses</li>
            </ul>
          </section>

          {/* Public Data Sources */}
          <section className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
            <h3 className="text-xl font-semibold uppercase tracking-wide">Public Data Sources</h3>
            <p className="text-base leading-relaxed">
              Sentra collects publicly available content from:
            </p>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>X (Twitter) — public posts, hashtags, engagement metrics</li>
              <li>Facebook — public pages and posts</li>
              <li>News websites — published articles and metadata</li>
            </ul>
            <p className="text-base leading-relaxed">
              This data is processed to generate metrics such as sentiment, engagement, and topic distribution.
              We do not access private messages or non-public content.
            </p>
          </section>

          {/* Usage Data */}
          <section className="space-y-4 pl-6 border-l-2 border-signal-cyan/20">
            <h3 className="text-xl font-semibold uppercase tracking-wide">Usage Data</h3>
            <p className="text-base leading-relaxed">
              We collect minimal usage data to maintain platform stability:
            </p>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>Login timestamps</li>
              <li>Dashboard interactions (page views, report downloads)</li>
              <li>Error logs (for debugging)</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">How We Use Data</h2>
            <p className="text-base leading-relaxed">
              Data collected by Sentra is used exclusively to:
            </p>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>Generate intelligence reports</li>
              <li>Deliver scheduled PDF reports via email</li>
              <li>Maintain user accounts and authentication</li>
              <li>Improve platform performance and fix bugs</li>
            </ul>
            <p className="text-base leading-relaxed">
              We do not use your data for advertising, profiling, or resale.
            </p>
          </section>

          {/* Data Processing & Storage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">Data Processing & Storage</h2>
            <p className="text-base leading-relaxed">
              All data is stored securely on encrypted servers. Access is restricted to authorized personnel.
              We use industry-standard security protocols including SSL/TLS encryption for data transmission.
            </p>
            <p className="text-base leading-relaxed">
              Report data is retained for the duration of your active subscription. Upon account cancellation,
              data is deleted within 30 days unless legally required to retain it.
            </p>
          </section>

          {/* Report Delivery */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">Report Delivery</h2>
            <p className="text-base leading-relaxed">
              PDF reports are delivered via email to addresses you specify. Email delivery uses third-party
              email service providers. These providers are contractually bound to data protection standards
              and do not access report content for purposes other than delivery.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">Third-Party Services</h2>
            <p className="text-base leading-relaxed">
              Sentra integrates with the following third-party services:
            </p>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>Email delivery providers (for PDF report distribution)</li>
              <li>Payment processors (for subscription billing)</li>
              <li>Cloud infrastructure providers (for hosting and storage)</li>
            </ul>
            <p className="text-base leading-relaxed">
              These services operate under strict data processing agreements and do not have access to
              your intelligence reports or configuration data beyond what is necessary for their function.
            </p>
          </section>

          {/* User Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">User Rights (GDPR Compatible)</h2>
            <p className="text-base leading-relaxed">
              You have the right to:
            </p>
            <ul className="space-y-2 text-base leading-relaxed list-disc list-inside">
              <li>Access all data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your configuration data in a portable format</li>
              <li>Withdraw consent for data processing (results in account termination)</li>
            </ul>
            <p className="text-base leading-relaxed">
              To exercise these rights, contact <span className="font-mono">privacy@sentra.it.com</span>
            </p>
          </section>

          {/* Policy Updates */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">Policy Updates</h2>
            <p className="text-base leading-relaxed">
              This Privacy Policy may be updated periodically. Significant changes will be communicated
              via email to your registered address. Continued use of the platform after updates constitutes
              acceptance of the revised policy.
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

export default Privacy;
