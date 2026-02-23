import type { ConversationProposalRecord } from '@/features/sentra/types/conversation';

interface ProposalConfirmationCardProps {
  proposal: ConversationProposalRecord;
  onConfirm: () => Promise<void> | void;
  onEdit: () => void;
  disabled?: boolean;
}

export function ProposalConfirmationCard({
  proposal,
  onConfirm,
  onEdit,
  disabled = false,
}: ProposalConfirmationCardProps) {
  const filterEntries = Object.entries(proposal.filters_json ?? {});

  return (
    <div className="rounded-lg border border-[#3FD6D0]/30 bg-[#3FD6D0]/5 p-4">
      <div className="mb-2 text-xs uppercase tracking-wider text-[#3FD6D0]">Confirm Query</div>
      <p className="text-sm text-foreground">{proposal.normalized_query}</p>

      {filterEntries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filterEntries.map(([key, value]) => (
            <span key={key} className="rounded border border-border/60 bg-card/60 px-2 py-1 text-xs text-muted-foreground">
              {key}: {value}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => void onConfirm()}
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
    </div>
  );
}
