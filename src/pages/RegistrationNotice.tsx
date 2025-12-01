import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const RegistrationNotice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-charcoal text-off-white flex items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center space-y-8">
        <Logo size="lg" className="justify-center" />
        
        <div className="space-y-4">
          <div className="w-24 h-[2px] bg-signal-cyan mx-auto"></div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">
            Thank You for Registering
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Sentra is currently in a private testing phase and is not yet available for public use.
          </p>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We appreciate your interest. Your registration helps us prioritize early access and future onboarding.
          </p>
        </div>

        <div className="bg-graphite border border-signal-cyan/20 rounded-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide">Contact Information</h2>
          
          <p className="text-sm text-muted-foreground">
            For any additional questions or partnership inquiries, please contact us at:
          </p>

          <a
            href="mailto:support@sentra.it.com"
            className="flex items-center justify-center gap-3 text-lg font-mono text-signal-cyan hover:text-signal-cyan/80 transition-colors"
          >
            <Mail className="w-5 h-5" />
            support@sentra.it.com
          </a>
        </div>

        <Button
          onClick={() => navigate('/')}
          className="bg-signal-cyan text-charcoal hover:bg-signal-cyan/90 font-semibold uppercase tracking-wide"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default RegistrationNotice;
