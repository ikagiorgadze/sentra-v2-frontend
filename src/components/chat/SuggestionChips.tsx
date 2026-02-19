interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SuggestionChips = ({ suggestions, onSelect }: SuggestionChipsProps) => (
  <div className="flex flex-wrap gap-2 pt-2">
    {suggestions.map((s) => (
      <button
        key={s}
        onClick={() => onSelect(s)}
        className="px-3 py-1.5 text-xs font-mono border border-border text-muted-foreground hover:text-signal-cyan hover:border-signal-cyan transition-colors bg-card"
      >
        {s}
      </button>
    ))}
  </div>
);
