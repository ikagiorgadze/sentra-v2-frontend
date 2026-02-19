import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Risk {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface RiskSignalsProps {
  risks: Risk[];
}

export const RiskSignals = ({ risks }: RiskSignalsProps) => (
  <div>
    <h3 className="text-xs uppercase tracking-widest text-amber font-mono mb-3">
      Risk Signals
    </h3>
    <div className="space-y-3">
      {risks.map((r) => (
        <Card key={r.title} className="p-4 border-l-4 border-l-amber">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">{r.title}</span>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 ${r.severity === "high" ? "bg-severe-red/20 text-severe-red" : "bg-amber/20 text-amber"}`}>
                  {r.severity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
