import { Card } from "@/components/ui/card";

interface Cluster {
  label: string;
  description: string;
  mentions: number;
}

interface NarrativeClustersProps {
  clusters: Cluster[];
}

export const NarrativeClusters = ({ clusters }: NarrativeClustersProps) => (
  <div>
    <h3 className="text-xs uppercase tracking-widest text-signal-cyan font-mono mb-3">
      Narrative Clusters
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {clusters.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">{c.label}</span>
            <span className="text-xs font-mono text-signal-cyan">{c.mentions.toLocaleString()} mentions</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
        </Card>
      ))}
    </div>
  </div>
);
