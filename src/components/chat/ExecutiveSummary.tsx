import { Card } from "@/components/ui/card";

interface ExecutiveSummaryProps {
  summary: string;
}

export const ExecutiveSummary = ({ summary }: ExecutiveSummaryProps) => (
  <Card className="p-6 border-l-4 border-l-signal-cyan">
    <h3 className="text-xs uppercase tracking-widest text-signal-cyan font-mono mb-3">
      Executive Summary
    </h3>
    <p className="text-sm leading-relaxed text-card-foreground">{summary}</p>
  </Card>
);
