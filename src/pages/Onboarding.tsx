import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { useUserState } from "@/contexts/UserStateContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateConfiguration } = useUserState();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    leaders: "",
    party: "",
    topics: "",
    opposition: "",
    dataSources: [] as string[],
    region: "",
    metrics: [] as string[],
    reportType: "detailed",
    frequency: "weekly",
    timeOfDay: "",
    recipients: "",
    language: "english",
    deliveryMethod: "pdf",
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    updateConfiguration(config);
    toast.success("Configuration saved. Data collection started.");
    navigate('/dashboard?state=pending');
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-graphite text-off-white">
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        <div className="mb-12">
          <Logo size="md" className="mb-8" />
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 ${
                  s <= step ? "bg-signal-cyan" : "bg-graphite border border-signal-cyan/20"
                }`}
              />
            ))}
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">
            Configuration — Step {step} of 4
          </h1>
        </div>

        {/* Step 1: Define Focus */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Leaders / Candidates</Label>
              <Input
                placeholder="Enter names (comma-separated)"
                className="bg-charcoal border-signal-cyan/20"
                value={config.leaders}
                onChange={(e) => setConfig({ ...config, leaders: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Party</Label>
              <Input
                placeholder="Party name"
                className="bg-charcoal border-signal-cyan/20"
                value={config.party}
                onChange={(e) => setConfig({ ...config, party: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Topics of Interest</Label>
              <Input
                placeholder="Enter topics (comma-separated)"
                className="bg-charcoal border-signal-cyan/20"
                value={config.topics}
                onChange={(e) => setConfig({ ...config, topics: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Opposition Figures</Label>
              <Input
                placeholder="Enter names (comma-separated)"
                className="bg-charcoal border-signal-cyan/20"
                value={config.opposition}
                onChange={(e) => setConfig({ ...config, opposition: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Data Sources */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Select Data Sources</Label>
              <div className="grid grid-cols-2 gap-4">
                {["Facebook", "YouTube", "News Sites", "X (Twitter)", "Telegram", "TikTok"].map((source) => (
                  <div key={source} className="flex items-center space-x-2 p-4 border border-signal-cyan/20 hover:border-signal-cyan/40 transition-colors">
                    <Checkbox
                      id={source}
                      checked={config.dataSources.includes(source)}
                      onCheckedChange={() =>
                        setConfig({ ...config, dataSources: toggleArrayItem(config.dataSources, source) })
                      }
                      className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:border-signal-cyan"
                    />
                    <Label htmlFor={source} className="cursor-pointer flex-1">{source}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Region</Label>
              <Select value={config.region} onValueChange={(value) => setConfig({ ...config, region: value })}>
                <SelectTrigger className="bg-charcoal border-signal-cyan/20">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-graphite border-signal-cyan/20">
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="latam">Latin America</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="oceania">Oceania</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Metrics */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Select Metrics</Label>
              <div className="space-y-3">
                {[
                  "Net Sentiment",
                  "Mentions & Visibility",
                  "Engagement Quality",
                  "Bot Activity Detection",
                  "Media Balance",
                  "Opposition Comparison",
                  "Risk Events"
                ].map((metric) => (
                  <div key={metric} className="flex items-center space-x-2 p-4 border border-signal-cyan/20 hover:border-signal-cyan/40 transition-colors">
                    <Checkbox
                      id={metric}
                      checked={config.metrics.includes(metric)}
                      onCheckedChange={() =>
                        setConfig({ ...config, metrics: toggleArrayItem(config.metrics, metric) })
                      }
                      className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:border-signal-cyan"
                    />
                    <Label htmlFor={metric} className="cursor-pointer flex-1">{metric}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Report Type</Label>
              <Select value={config.reportType} onValueChange={(value) => setConfig({ ...config, reportType: value })}>
                <SelectTrigger className="bg-charcoal border-signal-cyan/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-graphite border-signal-cyan/20">
                  <SelectItem value="short">Short Summary</SelectItem>
                  <SelectItem value="detailed">Detailed PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 4: Delivery */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Frequency</Label>
              <Select value={config.frequency} onValueChange={(value) => setConfig({ ...config, frequency: value })}>
                <SelectTrigger className="bg-charcoal border-signal-cyan/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-graphite border-signal-cyan/20">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice-weekly">Twice per week</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Time of Day</Label>
              <Input
                type="time"
                className="bg-charcoal border-signal-cyan/20"
                value={config.timeOfDay}
                onChange={(e) => setConfig({ ...config, timeOfDay: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Recipients (Email)</Label>
              <Input
                placeholder="Enter emails (comma-separated)"
                className="bg-charcoal border-signal-cyan/20"
                value={config.recipients}
                onChange={(e) => setConfig({ ...config, recipients: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Language</Label>
              <Select value={config.language} onValueChange={(value) => setConfig({ ...config, language: value })}>
                <SelectTrigger className="bg-charcoal border-signal-cyan/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-graphite border-signal-cyan/20">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Delivery Method</Label>
              <Select value={config.deliveryMethod} onValueChange={(value) => setConfig({ ...config, deliveryMethod: value })}>
                <SelectTrigger className="bg-charcoal border-signal-cyan/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-graphite border-signal-cyan/20">
                  <SelectItem value="pdf">PDF Attachment</SelectItem>
                  <SelectItem value="dashboard">Web Dashboard</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-signal-cyan/20">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="border-signal-cyan/20 text-off-white hover:border-signal-cyan hover:text-signal-cyan"
          >
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-signal-cyan text-charcoal hover:bg-signal-cyan/90 font-semibold uppercase tracking-wide"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-signal-cyan text-charcoal hover:bg-signal-cyan/90 font-semibold uppercase tracking-wide"
            >
              Complete Configuration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
