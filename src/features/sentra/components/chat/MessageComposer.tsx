import { FormEvent, useState } from 'react';
import { Send } from 'lucide-react';

interface MessageComposerProps {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled = false }: MessageComposerProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    await onSend(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border bg-card p-4">
      <input
        aria-label="Query"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask your monitoring question..."
        disabled={disabled}
        className="flex-1 rounded border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#3FD6D0]"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="inline-flex h-11 w-11 items-center justify-center rounded bg-[#3FD6D0] text-black transition-colors hover:bg-[#72E4DF] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
