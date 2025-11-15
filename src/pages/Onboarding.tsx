import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserState } from "@/contexts/UserStateContext";
import { toast } from "sonner";
import { OnboardingConfig } from "@/types/user";
import { Logo } from "@/components/Logo";

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateConfiguration } = useUserState();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<OnboardingConfig>({
    leader: { name: "", role: "", party: "", region: "" },
    opponents: [],
    topics: [],
    channels: {
      x: { enabled: false, includeTerms: "", excludeTerms: "", language: "en" },
      facebook: { enabled: false, includeTerms: "", excludeTerms: "", language: "en" },
      news: { enabled: false, includeTerms: "", excludeTerms: "", language: "en" },
    },
    pdfContent: {
      sections: {
        totalMentions: true, netSentiment: true, botShare: true, engagementRate: true,
        dominantTopic: true, trendDashboard: true, topKeywords: true, topInfluencers: true, oppositionComparison: true,
      },
      executiveSummaryMetrics: ["totalMentions", "netSentiment", "botShare", "engagementRate"],
      aiSummaryEnabled: true,
    },
    delivery: {
      frequency: "weekly", dayOfWeek: "monday", timeOfDay: "08:00", timezone: "Europe/Belgrade",
      recipients: [], attachPdf: true, dashboardLink: true,
    },
  });

  const validateStep = (stepNum: number): boolean => {
    switch(stepNum) {
      case 1:
        if (!config.leader.name.trim() || !config.leader.party.trim() || !config.leader.region.trim()) {
          toast.error("Leader name, party, and region are required");
          return false;
        }
        return true;
      case 2:
        const hasChannel = config.channels.x.enabled || config.channels.facebook.enabled || config.channels.news.enabled;
        if (!hasChannel) {
          toast.error("Please enable at least one data source");
          return false;
        }
        if ((config.channels.x.enabled && !config.channels.x.includeTerms.trim()) ||
            (config.channels.facebook.enabled && !config.channels.facebook.includeTerms.trim()) ||
            (config.channels.news.enabled && !config.channels.news.includeTerms.trim())) {
          toast.error("Include terms are required for enabled channels");
          return false;
        }
        return true;
      case 3:
        const count = config.pdfContent.executiveSummaryMetrics.length;
        if (count < 4 || count > 6) {
          toast.error("Select 4-6 metrics for Executive Summary");
          return false;
        }
        return true;
      case 4:
        if (!config.delivery.timeOfDay || !config.delivery.timezone.trim() || config.delivery.recipients.length === 0) {
          toast.error("Time, timezone, and recipients are required");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => { if (validateStep(step)) setStep(step + 1); };
  const handleComplete = () => {
    if (validateStep(4)) {
      updateConfiguration(config);
      toast.success("Configuration saved. Data collection started.");
      navigate('/dashboard?state=pending');
    }
  };

  return (
    <div className="min-h-screen bg-graphite text-foreground">
      <header className="border-b border-signal-cyan/10 bg-charcoal">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {step} of 4</div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">Who Are We Monitoring?</h2>
              <p className="text-sm text-muted-foreground">Define the principal entity and context</p>
            </div>
            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Leader / Principal Name</Label>
              <Input placeholder="e.g. John Doe" className="bg-charcoal border-signal-cyan/20"
                value={config.leader.name} onChange={(e) => setConfig({ ...config, leader: { ...config.leader, name: e.target.value }})} />
            </div>
            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Role / Title</Label>
              <Input placeholder="e.g. MP Candidate" className="bg-charcoal border-signal-cyan/20"
                value={config.leader.role} onChange={(e) => setConfig({ ...config, leader: { ...config.leader, role: e.target.value }})} />
            </div>
            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Party / Organization</Label>
              <Input placeholder="e.g. Future Alliance" className="bg-charcoal border-signal-cyan/20"
                value={config.leader.party} onChange={(e) => setConfig({ ...config, leader: { ...config.leader, party: e.target.value }})} />
            </div>
            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Country / Region</Label>
              <Input placeholder="e.g. Serbia" className="bg-charcoal border-signal-cyan/20"
                value={config.leader.region} onChange={(e) => setConfig({ ...config, leader: { ...config.leader, region: e.target.value }})} />
            </div>
            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Opponents (Optional)</Label>
              <Input placeholder="Comma-separated" className="bg-charcoal border-signal-cyan/20"
                value={config.opponents.join(', ')} onChange={(e) => setConfig({ ...config, opponents: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </div>
            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Topics (Optional)</Label>
              <Input placeholder="e.g. inflation, security" className="bg-charcoal border-signal-cyan/20"
                value={config.topics.join(', ')} onChange={(e) => setConfig({ ...config, topics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-signal-cyan/10">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Previous</Button>}
          {step < 4 ? (
            <Button onClick={handleNext} className="ml-auto bg-signal-cyan hover:bg-signal-cyan/80 text-charcoal">Next</Button>
          ) : (
            <Button onClick={handleComplete} className="ml-auto bg-signal-cyan hover:bg-signal-cyan/80 text-charcoal">Complete</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
