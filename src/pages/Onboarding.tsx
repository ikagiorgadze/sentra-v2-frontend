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
        dominantTopic: false, trendDashboard: true, topKeywords: false, topInfluencers: true, oppositionComparison: true,
      },
      executiveSummaryMetrics: [],
      aiSummaryEnabled: true,
    },
    delivery: {
      frequency: "weekly", dayOfWeek: "monday", timeOfDay: "08:00", timezone: "Europe/Belgrade",
      recipients: [], attachPdf: true, dashboardLink: true,
    },
  });

  const validateStep = (stepNum: number): boolean => {
    switch(stepNum) {
      case 1: {
        if (!config.leader.name.trim() || !config.leader.party.trim() || !config.leader.region.trim()) {
          toast.error("Principal name, party, and region are required");
          return false;
        }
        return true;
      }
      case 2: {
        const invalidOpponents = config.opponents.filter(
          o => o.name.trim() === '' || o.party.trim() === '' || o.region.trim() === ''
        );
        
        if (config.opponents.length > 0 && invalidOpponents.length > 0) {
          toast.error("Please complete all opponent information or remove incomplete entries");
          return false;
        }
        return true;
      }
      case 3: {
        const hasChannel = config.channels.x.enabled || config.channels.facebook.enabled || config.channels.news.enabled;
        if (!hasChannel) {
          toast.error("Please enable at least one data source");
          return false;
        }
        return true;
      }
      case 4: {
        const enabledSections = Object.values(config.pdfContent.sections).filter(Boolean).length;
        if (enabledSections === 0) {
          toast.error("Please select at least one PDF section");
          return false;
        }
        return true;
      }
      case 5:
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
    if (validateStep(5)) {
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
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {step} of 5</div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Step 1 - Who Are We Monitoring */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">Who Are We Monitoring?</h2>
              <p className="text-sm text-muted-foreground">Define the principal you want to track</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wide">Principal Name</Label>
                <Input
                  placeholder="e.g. John Doe"
                  className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan"
                  value={config.leader.name}
                  onChange={(e) => setConfig({ ...config, leader: { ...config.leader, name: e.target.value }})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wide">Role / Title</Label>
                <Input
                  placeholder="e.g. Presidential Candidate"
                  className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan"
                  value={config.leader.role}
                  onChange={(e) => setConfig({ ...config, leader: { ...config.leader, role: e.target.value }})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wide">Party / Organization</Label>
                <Input
                  placeholder="e.g. Progressive Alliance"
                  className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan"
                  value={config.leader.party}
                  onChange={(e) => setConfig({ ...config, leader: { ...config.leader, party: e.target.value }})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wide">Country / Region</Label>
                <Input
                  placeholder="e.g. Serbia"
                  className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan"
                  value={config.leader.region}
                  onChange={(e) => setConfig({ ...config, leader: { ...config.leader, region: e.target.value }})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Opponent Information */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">Opponent Information</h2>
              <p className="text-sm text-muted-foreground">
                Add information about your political opponents. You can add as many as needed.
              </p>
            </div>

            {config.opponents.map((opponent, index) => (
              <div key={opponent.id} className="border border-signal-cyan/20 rounded-lg p-6 space-y-4 bg-charcoal/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg uppercase tracking-wide">Opponent {index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setConfig({
                        ...config,
                        opponents: config.opponents.filter(o => o.id !== opponent.id)
                      });
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm uppercase tracking-wide">Principal Name</Label>
                    <Input
                      placeholder="e.g. Jane Smith"
                      className="bg-charcoal border-signal-cyan/20"
                      value={opponent.name}
                      onChange={(e) => {
                        const updated = [...config.opponents];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setConfig({ ...config, opponents: updated });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm uppercase tracking-wide">Role / Title</Label>
                    <Input
                      placeholder="e.g. Incumbent Mayor"
                      className="bg-charcoal border-signal-cyan/20"
                      value={opponent.role}
                      onChange={(e) => {
                        const updated = [...config.opponents];
                        updated[index] = { ...updated[index], role: e.target.value };
                        setConfig({ ...config, opponents: updated });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm uppercase tracking-wide">Party / Organization</Label>
                    <Input
                      placeholder="e.g. Rival Alliance"
                      className="bg-charcoal border-signal-cyan/20"
                      value={opponent.party}
                      onChange={(e) => {
                        const updated = [...config.opponents];
                        updated[index] = { ...updated[index], party: e.target.value };
                        setConfig({ ...config, opponents: updated });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm uppercase tracking-wide">Country / Region</Label>
                    <Input
                      placeholder="e.g. Serbia"
                      className="bg-charcoal border-signal-cyan/20"
                      value={opponent.region}
                      onChange={(e) => {
                        const updated = [...config.opponents];
                        updated[index] = { ...updated[index], region: e.target.value };
                        setConfig({ ...config, opponents: updated });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => {
                setConfig({
                  ...config,
                  opponents: [
                    ...config.opponents,
                    {
                      id: crypto.randomUUID(),
                      name: "",
                      role: "",
                      party: "",
                      region: ""
                    }
                  ]
                });
              }}
              className="w-full border-signal-cyan/20 text-signal-cyan hover:bg-signal-cyan/10"
            >
              + Add Another Opponent
            </Button>

            {config.opponents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No opponents added yet. Click "Add Another Opponent" to start.
              </div>
            )}
          </div>
        )}

        {/* Step 3 - Channels & Source Filters */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">Channels & Source Filters</h2>
              <p className="text-sm text-muted-foreground">Select which channels to monitor.</p>
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Data Sources</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border border-signal-cyan/20 rounded hover:border-signal-cyan/40 transition-colors">
                  <Checkbox
                    id="channel-x"
                    checked={config.channels.x.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      channels: { 
                        ...config.channels, 
                        x: { 
                          enabled: !!checked,
                          includeTerms: checked ? config.leader.name : "",
                          excludeTerms: "",
                          language: "en"
                        }
                      }
                    })}
                    className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                  />
                  <Label htmlFor="channel-x" className="cursor-pointer flex-1 text-lg uppercase">
                    X (Twitter)
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-signal-cyan/20 rounded hover:border-signal-cyan/40 transition-colors">
                  <Checkbox
                    id="channel-facebook"
                    checked={config.channels.facebook.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      channels: { 
                        ...config.channels, 
                        facebook: { 
                          enabled: !!checked,
                          includeTerms: checked ? config.leader.name : "",
                          excludeTerms: "",
                          language: "en"
                        }
                      }
                    })}
                    className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                  />
                  <Label htmlFor="channel-facebook" className="cursor-pointer flex-1 text-lg uppercase">
                    Facebook
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-signal-cyan/20 rounded hover:border-signal-cyan/40 transition-colors">
                  <Checkbox
                    id="channel-news"
                    checked={config.channels.news.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      channels: { 
                        ...config.channels, 
                        news: { 
                          enabled: !!checked,
                          includeTerms: checked ? config.leader.name : "",
                          excludeTerms: "",
                          language: "en"
                        }
                      }
                    })}
                    className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                  />
                  <Label htmlFor="channel-news" className="cursor-pointer flex-1 text-lg uppercase">
                    News & Online Media
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 - PDF Content Configuration */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">PDF Content Configuration</h2>
              <p className="text-sm text-muted-foreground">Choose which sections appear in your intelligence report.</p>
            </div>

            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Include These Sections</Label>
              <div className="space-y-3">
                {[
                  { key: 'totalMentions' as const, label: 'Total Mentions' },
                  { key: 'netSentiment' as const, label: 'Net Sentiment' },
                  { key: 'botShare' as const, label: 'Bot Share' },
                  { key: 'engagementRate' as const, label: 'Engagement Rate' },
                  { key: 'trendDashboard' as const, label: 'Trend Dashboard (Time Series)' },
                  { key: 'topInfluencers' as const, label: 'Top Influencers' },
                  { key: 'oppositionComparison' as const, label: 'Opposition Comparison' }
                ].map((section) => (
                  <div key={section.key} className="flex items-center space-x-3 p-4 border border-signal-cyan/20 hover:border-signal-cyan/40 transition-colors rounded">
                    <Checkbox
                      id={section.key}
                      checked={config.pdfContent.sections[section.key]}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        pdfContent: {
                          ...config.pdfContent,
                          sections: { ...config.pdfContent.sections, [section.key]: !!checked }
                        }
                      })}
                      className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                    />
                    <Label htmlFor={section.key} className="cursor-pointer flex-1 text-sm uppercase tracking-wide">
                      {section.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-signal-cyan/10">
              <div className="flex items-center space-x-3 p-4 border border-signal-cyan/20 rounded-lg">
                <Checkbox
                  id="ai-summary"
                  checked={config.pdfContent.aiSummaryEnabled}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    pdfContent: { ...config.pdfContent, aiSummaryEnabled: !!checked }
                  })}
                  className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                />
                <div className="flex-1">
                  <Label htmlFor="ai-summary" className="cursor-pointer text-base uppercase tracking-wide">
                    Include AI Summary Paragraph
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate a neutral AI-written summary at the top of the PDF
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 - Report Delivery */}
        {step === 5 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">Report Delivery</h2>
              <p className="text-sm text-muted-foreground">Configure when and how the intelligence reports are sent</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wide">Frequency</Label>
                <Select 
                  value={config.delivery.frequency} 
                  onValueChange={(value) => setConfig({ 
                    ...config, 
                    delivery: { ...config.delivery, frequency: value }
                  })}
                >
                  <SelectTrigger className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-graphite border-signal-cyan/20">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice-weekly">Twice Weekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(config.delivery.frequency === 'weekly' || config.delivery.frequency === 'monthly') && (
                <div className="space-y-2">
                  <Label className="text-sm uppercase tracking-wide">Day of Week</Label>
                  <Select 
                    value={config.delivery.dayOfWeek} 
                    onValueChange={(value) => setConfig({ 
                      ...config, 
                      delivery: { ...config.delivery, dayOfWeek: value }
                    })}
                  >
                    <SelectTrigger className="bg-charcoal border-signal-cyan/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-graphite border-signal-cyan/20">
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wide">Time of Day</Label>
                <Input
                  type="time"
                  className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan"
                  value={config.delivery.timeOfDay}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    delivery: { ...config.delivery, timeOfDay: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wide">Timezone</Label>
                <Input
                  placeholder="e.g. Europe/Belgrade"
                  className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan"
                  value={config.delivery.timezone}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    delivery: { ...config.delivery, timezone: e.target.value }
                  })}
                />
                <p className="text-xs text-muted-foreground">Use IANA timezone format</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wide">Recipients</Label>
              <Input
                placeholder="e.g. analyst@example.com, chief@example.com"
                className="bg-charcoal border-signal-cyan/20 focus:border-signal-cyan"
                value={config.delivery.recipients.join(', ')}
                onChange={(e) => setConfig({ 
                  ...config, 
                  delivery: { 
                    ...config.delivery, 
                    recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }
                })}
              />
              <p className="text-xs text-muted-foreground">Comma-separated email addresses</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="attach-pdf"
                  checked={config.delivery.attachPdf}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    delivery: { ...config.delivery, attachPdf: !!checked }
                  })}
                  className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                />
                <Label htmlFor="attach-pdf" className="cursor-pointer text-sm uppercase tracking-wide">
                  Attach PDF to Email
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="dashboard-link"
                  checked={config.delivery.dashboardLink}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    delivery: { ...config.delivery, dashboardLink: !!checked }
                  })}
                  className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                />
                <Label htmlFor="dashboard-link" className="cursor-pointer text-sm uppercase tracking-wide">
                  Include Dashboard Link
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="border-signal-cyan/20 text-signal-cyan hover:bg-signal-cyan/10">
              Previous
            </Button>
          )}
          {step < 5 ? (
            <Button onClick={handleNext} className="ml-auto bg-signal-cyan text-charcoal hover:bg-signal-cyan/90">
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete} className="ml-auto bg-signal-cyan text-charcoal hover:bg-signal-cyan/90">
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
