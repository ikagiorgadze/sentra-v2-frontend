import { IntelligenceBrief } from '@/features/sentra/components/IntelligenceBrief';

interface IntelligenceBriefBubbleProps {
  query: string;
  jobId?: string;
}

export function IntelligenceBriefBubble({ query, jobId }: IntelligenceBriefBubbleProps) {
  return (
    <div className="rounded-lg border border-border bg-card" data-testid="chat-intelligence-brief">
      <IntelligenceBrief query={query} jobId={jobId} />
    </div>
  );
}
