import { useState } from 'react';
import { ChevronRight, Clock, Plus, Search, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  onDeleteChat?: (id: string) => void | Promise<void>;
  isDeletingChatId?: string | null;
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
  onDeleteChat,
  isDeletingChatId = null,
}: SidebarProps) {
  const [pendingDeleteChat, setPendingDeleteChat] = useState<RecentChat | null>(null);
  const isDeletePending = !!pendingDeleteChat && isDeletingChatId === pendingDeleteChat.id;
  const handleOpenPricing = () => {
    window.history.pushState({}, '', '/pricing');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const handleOpenRequestForm = () => {
    window.history.pushState({}, '', '/request-form');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const handleOpenRequestHistory = () => {
    window.history.pushState({}, '', '/request-history');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="flex min-h-screen w-64 shrink-0 self-stretch flex-col border-r border-border bg-[#0F1113]">
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
        <button
          type="button"
          onClick={handleOpenPricing}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-card/80"
        >
          Pricing
        </button>
        <button
          type="button"
          onClick={handleOpenRequestForm}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-card/80"
        >
          New Request Form
        </button>
        <button
          type="button"
          onClick={handleOpenRequestHistory}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-card/80"
        >
          Request History
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
              <div
                key={chat.id}
                className={`group relative rounded transition-colors ${
                  currentChatId === chat.id ? 'bg-card' : 'hover:bg-card'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full rounded px-3 py-2.5 pr-10 text-left"
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
                {onDeleteChat && (
                  <button
                    type="button"
                    aria-label={`Delete ${chat.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingDeleteChat(chat);
                    }}
                    className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-card/80 hover:text-red-300 focus:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingDeleteChat !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingDeleteChat(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat</AlertDialogTitle>
            <AlertDialogDescription>
              {`Delete "${pendingDeleteChat?.title ?? ''}" from recent chats? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDeleteChat || !onDeleteChat) {
                  return;
                }
                void onDeleteChat(pendingDeleteChat.id);
                if (!isDeletePending) {
                  setPendingDeleteChat(null);
                }
              }}
              disabled={isDeletePending}
              className="bg-red-600 hover:bg-red-500"
            >
              {isDeletePending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
