import { ChevronRight, Clock, Plus, Search } from 'lucide-react';
import type { RecentChat } from '@/features/sentra/types';

interface SidebarProps {
  recentChats: RecentChat[];
  onNewInvestigation: () => void;
  onOpenDemo?: () => void;
  isAdminUser?: boolean;
  currentChatId?: string;
  onSelectChat: (id: string) => void;
  errorMessage?: string | null;
  onRetryRecentChats?: () => void;
}

export function Sidebar({
  recentChats,
  onNewInvestigation,
  onOpenDemo,
  isAdminUser = false,
  currentChatId,
  onSelectChat,
  errorMessage,
  onRetryRecentChats,
}: SidebarProps) {
  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-[#0F1113]">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#3FD6D0]" />
          <span className="text-sm tracking-wider text-foreground">SENTRA</span>
        </div>
      </div>

      <div className="border-b border-border p-4">
        <button
          type="button"
          onClick={onNewInvestigation}
          className="flex w-full items-center justify-center gap-2 rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-card/80"
        >
          <Plus className="h-4 w-4" />
          New Investigation
        </button>
        {isAdminUser && onOpenDemo && (
          <button
            type="button"
            onClick={onOpenDemo}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-card/80"
          >
            Demo
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {errorMessage && (
          <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            <p>{errorMessage}</p>
            {onRetryRecentChats && (
              <button type="button" onClick={onRetryRecentChats} className="mt-2 underline underline-offset-2">
                Retry
              </button>
            )}
          </div>
        )}

        {recentChats.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              No chats yet.
              <br />
              Start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="px-2 py-2 text-xs uppercase tracking-wider text-muted-foreground">Recent Chats</div>
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={`group w-full rounded px-3 py-2.5 text-left transition-colors ${
                  currentChatId === chat.id ? 'bg-card' : 'hover:bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 truncate text-sm text-foreground">{chat.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{chat.timestamp}</span>
                      <span>•</span>
                      <span>{chat.state}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
