import { Loader2 } from 'lucide-react';

interface RunningStateProps {
  statusLabel: string;
  warningMessage?: string | null;
}

function formatStatusLabel(statusLabel: string): string {
  return statusLabel.replaceAll('_', ' ');
}

export function RunningState({ statusLabel, warningMessage = null }: RunningStateProps) {
  const label = formatStatusLabel(statusLabel);

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-[#3FD6D0]" />
          <span className="text-sm">Status: {label}</span>
        </div>
        {warningMessage && <p className="text-sm text-[#FFC043]">{warningMessage}</p>}
      </div>
    </div>
  );
}
