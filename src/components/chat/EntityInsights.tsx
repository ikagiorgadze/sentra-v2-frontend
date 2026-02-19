import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Entity {
  name: string;
  mentions: number;
  sentiment: string;
  influence: number;
}

interface EntityInsightsProps {
  entities: Entity[];
}

const sentimentColor = (s: string) => {
  if (s === "Positive") return "text-signal-cyan";
  if (s === "Negative") return "text-severe-red";
  if (s === "Mixed") return "text-amber";
  return "text-muted-foreground";
};

export const EntityInsights = ({ entities }: EntityInsightsProps) => (
  <Card className="p-6">
    <h3 className="text-xs uppercase tracking-widest text-signal-cyan font-mono mb-4">
      Entity Insights
    </h3>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs uppercase tracking-wider">Entity</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-right">Mentions</TableHead>
          <TableHead className="text-xs uppercase tracking-wider">Sentiment</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-right">Influence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entities.map((e) => (
          <TableRow key={e.name}>
            <TableCell className="font-medium text-sm">{e.name}</TableCell>
            <TableCell className="font-mono text-sm text-right">{e.mentions.toLocaleString()}</TableCell>
            <TableCell className={`font-mono text-sm ${sentimentColor(e.sentiment)}`}>{e.sentiment}</TableCell>
            <TableCell className="font-mono text-sm text-right">{e.influence}/100</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);
