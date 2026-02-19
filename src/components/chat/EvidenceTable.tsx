import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Evidence {
  source: string;
  date: string;
  snippet: string;
  sentiment: string;
  engagement: number;
}

interface EvidenceTableProps {
  evidence: Evidence[];
}

const sentimentColor = (s: string) => {
  if (s === "Positive") return "text-signal-cyan";
  if (s === "Negative") return "text-severe-red";
  if (s === "Mixed") return "text-amber";
  return "text-muted-foreground";
};

export const EvidenceTable = ({ evidence }: EvidenceTableProps) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? evidence : evidence.slice(0, 3);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-signal-cyan font-mono">
          Evidence Table
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
        >
          {expanded ? "Collapse" : `Show all (${evidence.length})`}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider">Source</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Snippet</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Sentiment</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Engagement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs whitespace-nowrap">{e.source}</TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap">{e.date}</TableCell>
                <TableCell className="text-xs max-w-xs truncate">{e.snippet}</TableCell>
                <TableCell className={`font-mono text-xs ${sentimentColor(e.sentiment)}`}>{e.sentiment}</TableCell>
                <TableCell className="font-mono text-xs text-right">{e.engagement.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
