import { Loader2 } from 'lucide-react';

interface JobProgressCardProps {
  statusLabel: string;
  stageLabel?: string | null;
  warningMessage?: string | null;
  errorMessage?: string | null;
  canRetry?: boolean;
  onTryAgain?: () => Promise<void> | void;
  isRetrying?: boolean;
}

function formatLabel(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    return fallback;
  }
  return normalized;
}

export function JobProgressCard({
  statusLabel,
  stageLabel = null,
  warningMessage = null,
  errorMessage = null,
  canRetry = false,
  onTryAgain,
  isRetrying = false,
}: JobProgressCardProps) {
  const status = formatLabel(statusLabel, 'running').replaceAll('_', ' ');
  const stage = formatLabel(stageLabel, status).replaceAll('_', ' ');
  const isTerminalFailure = status.toLowerCase() === 'failed';
  const isBusy = status.toLowerCase() === 'queued' || status.toLowerCase() === 'running';

  return (
    <div className="mr-auto max-w-[80%]">
      <div className="space-y-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin text-[#3FD6D0]" /> : null}
          <span>Status: {stage}</span>
        </div>
        {warningMessage ? <p className="text-xs text-[#FFC043]">{warningMessage}</p> : null}
        {errorMessage ? <p className="text-xs text-[#FF7F7F]">{errorMessage}</p> : null}
        {isTerminalFailure && canRetry && onTryAgain ? (
          <button
            type="button"
            onClick={() => void onTryAgain()}
            disabled={isRetrying}
            className="rounded bg-[#3FD6D0] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#72E4DF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRetrying ? 'Preparing...' : 'Try again'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
