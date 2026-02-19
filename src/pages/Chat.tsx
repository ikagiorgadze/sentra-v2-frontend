import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage, type Message } from "@/components/chat/ChatMessage";
import { generateMockBriefing } from "@/lib/mock/chatMockData";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const briefing = generateMockBriefing(text);
    const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", briefing };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsProcessing(true);
    // Processing state is visual-only via ProgressSteps; unlock input after delay
    setTimeout(() => setIsProcessing(false), 3600);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <Logo />
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Intelligence Chat</h1>
            <p className="text-muted-foreground text-sm max-w-md">
              Ask about any topic, entity, or region to receive a structured intelligence briefing with sentiment analysis, narrative clusters, and risk signals.
            </p>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onSuggestionSelect={sendMessage} />
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isProcessing} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
