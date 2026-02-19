import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-t border-border bg-card">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask about any topic, entity, or region..."
        disabled={disabled}
        className="flex-1 bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-signal-cyan font-mono"
      />
      <Button type="submit" disabled={disabled || !value.trim()} size="icon" className="h-11 w-11 bg-signal-cyan text-charcoal hover:bg-ice-blue">
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
