import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";

const STEPS = [
  "Scraping public sources...",
  "Analyzing sentiment...",
  "Clustering narratives...",
  "Generating briefing...",
];

interface ProgressStepsProps {
  onComplete: () => void;
}

export const ProgressSteps = ({ onComplete }: ProgressStepsProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const timer = setTimeout(() => setCurrentStep((s) => s + 1), 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="space-y-3 py-4">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-3 font-mono text-sm">
          {i < currentStep ? (
            <Check className="w-4 h-4 text-signal-cyan" />
          ) : i === currentStep ? (
            <Loader2 className="w-4 h-4 text-signal-cyan animate-spin" />
          ) : (
            <div className="w-4 h-4 border border-border rounded-full" />
          )}
          <span className={i <= currentStep ? "text-foreground" : "text-muted-foreground"}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};
