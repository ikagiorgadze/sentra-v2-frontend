import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent. Response within 48 hours.");
    setFormData({ name: "", email: "", message: "" });
  };

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
      <main className="container mx-auto px-8 py-24 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left Column - Contact Info */}
          <div className="space-y-16">
            <div>
              <div className="w-16 h-[1px] bg-signal-cyan mb-8"></div>
              <h1 className="text-4xl font-bold uppercase tracking-tight mb-6">Contact Sentra</h1>
              <p className="text-sm text-muted-foreground font-mono">Response within 48 hours</p>
            </div>

            {/* Email Sections */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wide text-muted-foreground">General Inquiries</h3>
                <a
                  href="mailto:info@sentra.ai"
                  className="flex items-center gap-3 text-lg font-mono text-foreground hover:text-signal-cyan transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  info@sentra.ai
                </a>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Support</h3>
                <a
                  href="mailto:support@sentra.ai"
                  className="flex items-center gap-3 text-lg font-mono text-foreground hover:text-signal-cyan transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@sentra.ai
                </a>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Privacy Requests</h3>
                <a
                  href="mailto:privacy@sentra.ai"
                  className="flex items-center gap-3 text-lg font-mono text-foreground hover:text-signal-cyan transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  privacy@sentra.ai
                </a>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Press</h3>
                <a
                  href="mailto:press@sentra.ai"
                  className="flex items-center gap-3 text-lg font-mono text-foreground hover:text-signal-cyan transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  press@sentra.ai
                </a>
              </div>
            </div>

            {/* Business Address */}
            <div className="space-y-3 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Business Address</h3>
              <address className="text-base text-foreground not-italic font-mono leading-relaxed">
                Sentra Intelligence Ltd.<br />
                Kneza Miloša 12<br />
                11000 Belgrade<br />
                Serbia
              </address>
            </div>

            {/* Nine-dot mark */}
            <div className="grid grid-cols-3 gap-[2px] w-16 h-16 opacity-30">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-full bg-signal-cyan rounded-[1px]"
                  style={{ opacity: i === 4 ? 1 : 0.6 }}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold uppercase tracking-wide">Send a Message</h2>
              <p className="text-sm text-muted-foreground">
                For immediate assistance, use the specific email addresses listed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm uppercase tracking-wide">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background border-border focus:border-signal-cyan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background border-border focus:border-signal-cyan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm uppercase tracking-wide">
                  Message
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-background border-border focus:border-signal-cyan resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full border-signal-cyan text-signal-cyan hover:bg-signal-cyan hover:text-charcoal transition-all shadow-none hover:shadow-glow-cyan"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-32">
        <div className="container mx-auto px-8 py-8">
          <p className="text-xs text-muted-foreground font-mono">
            Sentra provides analytical estimates based on public digital content.
            All outputs are confidential and intended for internal use only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
