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

        {/* Step 2: Channels & Source Filters */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">Channels & Source Filters</h2>
              <p className="text-sm text-muted-foreground">Select channels and configure text-based filters to shape incoming data.</p>
            </div>

            {/* X (Twitter) */}
            <div className="border border-signal-cyan/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="channel-x"
                  checked={config.channels.x.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, channels: { ...config.channels, x: { ...config.channels.x, enabled: !!checked }}})}
                  className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                />
                <Label htmlFor="channel-x" className="text-lg uppercase cursor-pointer">X (Twitter)</Label>
              </div>
              {config.channels.x.enabled && (
                <div className="ml-8 space-y-4 pt-4 border-t border-signal-cyan/10">
                  <div><Label className="text-sm uppercase tracking-wide">Include posts containing</Label>
                    <Input placeholder="e.g. candidate name, party name, campaign slogan" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.x.includeTerms} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, x: { ...config.channels.x, includeTerms: e.target.value }}})} />
                  </div>
                  <div><Label className="text-sm uppercase tracking-wide">Exclude posts containing (optional)</Label>
                    <Input placeholder="e.g. unrelated brand names, noise words" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.x.excludeTerms} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, x: { ...config.channels.x, excludeTerms: e.target.value }}})} />
                  </div>
                  <div><Label className="text-sm uppercase tracking-wide">Language (optional)</Label>
                    <Input placeholder="e.g. en, es, fr" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.x.language} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, x: { ...config.channels.x, language: e.target.value }}})} />
                  </div>
                </div>
              )}
            </div>

            {/* Facebook */}
            <div className="border border-signal-cyan/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="channel-facebook"
                  checked={config.channels.facebook.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, channels: { ...config.channels, facebook: { ...config.channels.facebook, enabled: !!checked }}})}
                  className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                />
                <Label htmlFor="channel-facebook" className="text-lg uppercase cursor-pointer">Facebook</Label>
              </div>
              {config.channels.facebook.enabled && (
                <div className="ml-8 space-y-4 pt-4 border-t border-signal-cyan/10">
                  <div><Label className="text-sm uppercase tracking-wide">Include posts containing</Label>
                    <Input placeholder="e.g. candidate name, party name, campaign slogan" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.facebook.includeTerms} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, facebook: { ...config.channels.facebook, includeTerms: e.target.value }}})} />
                  </div>
                  <div><Label className="text-sm uppercase tracking-wide">Exclude posts containing (optional)</Label>
                    <Input placeholder="e.g. unrelated brand names, noise words" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.facebook.excludeTerms} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, facebook: { ...config.channels.facebook, excludeTerms: e.target.value }}})} />
                  </div>
                  <div><Label className="text-sm uppercase tracking-wide">Language (optional)</Label>
                    <Input placeholder="e.g. en, es, fr" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.facebook.language} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, facebook: { ...config.channels.facebook, language: e.target.value }}})} />
                  </div>
                </div>
              )}
            </div>

            {/* News & Online Media */}
            <div className="border border-signal-cyan/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="channel-news"
                  checked={config.channels.news.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, channels: { ...config.channels, news: { ...config.channels.news, enabled: !!checked }}})}
                  className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                />
                <Label htmlFor="channel-news" className="text-lg uppercase cursor-pointer">News & Online Media</Label>
              </div>
              {config.channels.news.enabled && (
                <div className="ml-8 space-y-4 pt-4 border-t border-signal-cyan/10">
                  <div><Label className="text-sm uppercase tracking-wide">Include posts containing</Label>
                    <Input placeholder="e.g. candidate name, party name, campaign slogan" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.news.includeTerms} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, news: { ...config.channels.news, includeTerms: e.target.value }}})} />
                  </div>
                  <div><Label className="text-sm uppercase tracking-wide">Exclude posts containing (optional)</Label>
                    <Input placeholder="e.g. unrelated brand names, noise words" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.news.excludeTerms} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, news: { ...config.channels.news, excludeTerms: e.target.value }}})} />
                  </div>
                  <div><Label className="text-sm uppercase tracking-wide">Language (optional)</Label>
                    <Input placeholder="e.g. en, es, fr" className="bg-charcoal border-signal-cyan/20 mt-2"
                      value={config.channels.news.language} onChange={(e) => setConfig({ ...config, channels: { ...config.channels, news: { ...config.channels.news, language: e.target.value }}})} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: PDF Content Configuration */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">PDF Content Configuration</h2>
              <p className="text-sm text-muted-foreground">Choose which metrics and sections appear in your intelligence report.</p>
            </div>

            {/* PDF Sections */}
            <div className="space-y-4">
              <Label className="text-lg uppercase tracking-wide">Include These Sections</Label>
              <div className="space-y-3">
                {[
                  { key: 'totalMentions' as const, label: 'Total Mentions' },
                  { key: 'netSentiment' as const, label: 'Net Sentiment' },
                  { key: 'botShare' as const, label: 'Bot Share' },
                  { key: 'engagementRate' as const, label: 'Engagement Rate' },
                  { key: 'dominantTopic' as const, label: 'Dominant Topic' },
                  { key: 'trendDashboard' as const, label: 'Trend Dashboard (Time Series)' },
                  { key: 'topKeywords' as const, label: 'Top Keywords' },
                  { key: 'topInfluencers' as const, label: 'Top Influencers' },
                  { key: 'oppositionComparison' as const, label: 'Opposition Comparison' }
                ].map((section) => (
                  <div key={section.key} className="flex items-center space-x-3 p-4 border border-signal-cyan/20 hover:border-signal-cyan/40 transition-colors rounded">
                    <Checkbox
                      id={section.key}
                      checked={config.pdfContent.sections[section.key]}
                      onCheckedChange={(checked) => setConfig({ ...config, pdfContent: { ...config.pdfContent, sections: { ...config.pdfContent.sections, [section.key]: !!checked }}})}
                      className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                    />
                    <Label htmlFor={section.key} className="cursor-pointer flex-1 text-sm uppercase tracking-wide">{section.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Summary Selection */}
            <div className="space-y-4 pt-6 border-t border-signal-cyan/10">
              <div className="mb-4">
                <Label className="text-lg uppercase tracking-wide">Executive Summary Panel</Label>
                <p className="text-xs text-muted-foreground mt-1">Select 4–6 metrics to display in the top panel on page 1</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'totalMentions', label: 'Total Mentions' },
                  { key: 'netSentiment', label: 'Net Sentiment' },
                  { key: 'botShare', label: 'Bot Share' },
                  { key: 'engagementRate', label: 'Engagement Rate' },
                  { key: 'dominantTopic', label: 'Dominant Topic' },
                  { key: 'oppositionComparison', label: 'Opposition Comparison' }
                ].map((metric) => (
                  <div key={metric.key} className="flex items-center space-x-3 p-4 border border-signal-cyan/20 hover:border-signal-cyan/40 transition-colors rounded">
                    <Checkbox
                      id={`exec-${metric.key}`}
                      checked={config.pdfContent.executiveSummaryMetrics.includes(metric.key)}
                      onCheckedChange={(checked) => {
                        const current = config.pdfContent.executiveSummaryMetrics;
                        let updated: string[];
                        if (checked) {
                          if (current.length >= 6) {
                            toast.error("Maximum 6 metrics allowed in Executive Summary");
                            return;
                          }
                          updated = [...current, metric.key];
                        } else {
                          updated = current.filter(k => k !== metric.key);
                        }
                        setConfig({ ...config, pdfContent: { ...config.pdfContent, executiveSummaryMetrics: updated }});
                      }}
                      className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                    />
                    <Label htmlFor={`exec-${metric.key}`} className="cursor-pointer flex-1 text-sm uppercase tracking-wide">{metric.label}</Label>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Selected: {config.pdfContent.executiveSummaryMetrics.length} / 6
              </div>
            </div>

            {/* AI Summary Toggle */}
            <div className="space-y-4 pt-6 border-t border-signal-cyan/10">
              <div className="flex items-center space-x-3 p-4 border border-signal-cyan/20 rounded-lg">
                <Checkbox
                  id="ai-summary"
                  checked={config.pdfContent.aiSummaryEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, pdfContent: { ...config.pdfContent, aiSummaryEnabled: !!checked }})}
                  className="border-signal-cyan/20 data-[state=checked]:bg-signal-cyan data-[state=checked]:text-charcoal"
                />
                <div className="flex-1">
                  <Label htmlFor="ai-summary" className="cursor-pointer text-base uppercase tracking-wide">Include AI Summary Paragraph</Label>
                  <p className="text-xs text-muted-foreground mt-1">Generate a neutral AI-written summary at the top of the PDF</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Report Delivery */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold uppercase mb-2">Report Delivery</h2>
              <p className="text-sm text-muted-foreground">Configure when and how you receive your intelligence reports.</p>
            </div>

            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Frequency</Label>
              <Select value={config.delivery.frequency} onValueChange={(value) => setConfig({ ...config, delivery: { ...config.delivery, frequency: value }})}>
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

            {(config.delivery.frequency === 'weekly' || config.delivery.frequency === 'monthly') && (
              <div className="space-y-4">
                <Label className="text-sm uppercase tracking-wide">
                  {config.delivery.frequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
                </Label>
                <Select value={config.delivery.dayOfWeek || ''} onValueChange={(value) => setConfig({ ...config, delivery: { ...config.delivery, dayOfWeek: value }})}>
                  <SelectTrigger className="bg-charcoal border-signal-cyan/20">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="bg-graphite border-signal-cyan/20">
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Time of Day</Label>
              <Input type="time" className="bg-charcoal border-signal-cyan/20"
                value={config.delivery.timeOfDay} onChange={(e) => setConfig({ ...config, delivery: { ...config.delivery, timeOfDay: e.target.value }})} />
            </div>

            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Timezone</Label>
              <Input placeholder="e.g. Europe/Belgrade, America/New_York" className="bg-charcoal border-signal-cyan/20"
                value={config.delivery.timezone} onChange={(e) => setConfig({ ...config, delivery: { ...config.delivery, timezone: e.target.value }})} />
              <p className="text-xs text-muted-foreground">Use IANA timezone format (e.g. Europe/Paris, Asia/Tokyo)</p>
            </div>

            <div className="space-y-4">
              <Label className="text-sm uppercase tracking-wide">Recipients</Label>
              <Input placeholder="Enter emails, comma-separated" className="bg-charcoal border-signal-cyan/20"
                value={config.delivery.recipients.join(', ')}
                onChange={(e) => setConfig({ ...config, delivery: { ...config.delivery, recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }})} />
              <p className="text-xs text-muted-foreground">PDF will be sent to these email addresses</p>
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
