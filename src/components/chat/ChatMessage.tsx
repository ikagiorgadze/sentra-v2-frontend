import { useState, useCallback } from "react";
import type { BriefingData } from "@/lib/mock/chatMockData";
import { ProgressSteps } from "./ProgressSteps";
import { BriefingResponse } from "./BriefingResponse";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content?: string;
  briefing?: BriefingData;
}

interface ChatMessageProps {
  message: Message;
  onSuggestionSelect: (suggestion: string) => void;
}

export const ChatMessage = ({ message, onSuggestionSelect }: ChatMessageProps) => {
  const [showBriefing, setShowBriefing] = useState(!!message.briefing && message.content === undefined);
  const handleComplete = useCallback(() => setShowBriefing(true), []);

  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-signal-cyan/10 border border-signal-cyan/30 px-4 py-3 max-w-xl">
          <p className="text-sm text-foreground">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="w-full">
        {!showBriefing && message.briefing && (
          <ProgressSteps onComplete={handleComplete} />
        )}
        {showBriefing && message.briefing && (
          <BriefingResponse data={message.briefing} onSuggestionSelect={onSuggestionSelect} />
        )}
      </div>
    </div>
  );
};
