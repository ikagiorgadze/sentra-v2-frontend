import { AnalysisResultsDocument } from '@/features/sentra/components/AnalysisResultsDocument';

interface IntelligenceBriefBubbleProps {
  query: string;
  jobId?: string;
}

export function IntelligenceBriefBubble({ query, jobId }: IntelligenceBriefBubbleProps) {
  return (
    <div className="rounded-lg border border-border bg-card" data-testid="chat-analysis-results-document">
      <AnalysisResultsDocument query={query} jobId={jobId} />
    </div>
  );
}
