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
            Self-Registration Not Active
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            This feature is currently unavailable. To request access to the Sentra platform, 
            please contact our team directly.
          </p>
        </div>

        <div className="bg-graphite border border-signal-cyan/20 rounded-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide">Contact Information</h2>
          
          <div className="space-y-4">
            <a
              href="mailto:support@sentra.it.com"
              className="flex items-center justify-center gap-3 text-lg font-mono text-signal-cyan hover:text-signal-cyan/80 transition-colors"
            >
              <Mail className="w-5 h-5" />
              support@sentra.it.com
            </a>
            
            <a
              href="mailto:info@sentra.it.com"
              className="flex items-center justify-center gap-3 text-lg font-mono text-signal-cyan hover:text-signal-cyan/80 transition-colors"
            >
              <Mail className="w-5 h-5" />
              info@sentra.it.com
            </a>
          </div>

          <p className="text-sm text-muted-foreground pt-4 border-t border-signal-cyan/10">
            Response within 48 hours
          </p>
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
