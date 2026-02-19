import type { BriefingData } from "@/lib/mock/chatMockData";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { SentimentChart } from "./SentimentChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { NarrativeClusters } from "./NarrativeClusters";
import { EntityInsights } from "./EntityInsights";
import { RiskSignals } from "./RiskSignals";
import { EvidenceTable } from "./EvidenceTable";
import { SuggestionChips } from "./SuggestionChips";
import { Card } from "@/components/ui/card";

interface BriefingResponseProps {
  data: BriefingData;
  onSuggestionSelect: (suggestion: string) => void;
}

export const BriefingResponse = ({ data, onSuggestionSelect }: BriefingResponseProps) => (
  <div className="space-y-4 w-full max-w-3xl">
    <ExecutiveSummary summary={data.executiveSummary} />
    <SentimentChart data={data.sentiment} />
    <Card className="p-6">
      <h3 className="text-xs uppercase tracking-widest text-signal-cyan font-mono mb-4">
        Sentiment Trend
      </h3>
      <div className="h-48">
        <TrendLineChart data={data.trendLine} color="hsl(var(--signal-cyan))" domain={[0, 100]} />
      </div>
    </Card>
    <NarrativeClusters clusters={data.narrativeClusters} />
    <EntityInsights entities={data.entityInsights} />
    <RiskSignals risks={data.riskSignals} />
    <EvidenceTable evidence={data.evidenceTable} />
    <SuggestionChips suggestions={data.suggestions} onSelect={onSuggestionSelect} />
  </div>
);
