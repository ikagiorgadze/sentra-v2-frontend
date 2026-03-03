import type { ConversationProposalRecord } from '@/features/sentra/types/conversation';

interface ProposalConfirmationCardProps {
  proposal: ConversationProposalRecord;
  onStartNew: () => Promise<void> | void;
  onUseExisting: (jobId: string) => Promise<void> | void;
  onEdit: () => void;
  disabled?: boolean;
}

export function ProposalConfirmationCard({
  proposal,
  onStartNew,
  onUseExisting,
  onEdit,
  disabled = false,
}: ProposalConfirmationCardProps) {
  const filterEntries = Object.entries(proposal.filters_json ?? {}).filter(([key]) => key !== 'reuse_requested');
  const reuseCandidates = proposal.reuse_candidates ?? [];
  const shouldShowReuseChoices = reuseCandidates.length > 0;

  const formatFilterValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) => formatFilterValue(item)).join(', ');
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) {
        return '{}';
      }
      return entries.map(([key, nestedValue]) => `${key}=${formatFilterValue(nestedValue)}`).join(', ');
    }
    return String(value);
  };

  return (
    <div className="rounded-lg border border-[#3FD6D0]/30 bg-[#3FD6D0]/5 p-4">
      <div className="mb-2 text-xs uppercase tracking-wider text-[#3FD6D0]">Confirm Query</div>
      <p className="text-sm text-foreground">{proposal.normalized_query}</p>

      {filterEntries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filterEntries.map(([key, value]) => (
            <span key={key} className="rounded border border-border/60 bg-card/60 px-2 py-1 text-xs text-muted-foreground">
              {key}: {formatFilterValue(value)}
            </span>
          ))}
        </div>
      )}

      {shouldShowReuseChoices ? (
        <>
          <div className="mt-4 text-xs uppercase tracking-wider text-[#3FD6D0]">Similar Completed Jobs</div>
          <div className="mt-2 space-y-2">
            {reuseCandidates.map((candidate) => (
              <div key={candidate.job_id} className="rounded border border-border/60 bg-card/60 p-3">
                <p className="text-xs text-foreground">{candidate.query}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Match: {Math.round(candidate.similarity_score * 100)}%
                </p>
                <button
                  type="button"
                  onClick={() => void onUseExisting(candidate.job_id)}
                  disabled={disabled}
                  className="mt-2 rounded bg-[#3FD6D0] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#72E4DF] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Use Existing
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void onStartNew()}
              disabled={disabled}
              className="rounded bg-[#3FD6D0] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#72E4DF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start New
            </button>
            <button
              type="button"
              onClick={onEdit}
              disabled={disabled}
              className="rounded border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void onStartNew()}
            disabled={disabled}
            className="rounded bg-[#3FD6D0] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#72E4DF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="rounded border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
