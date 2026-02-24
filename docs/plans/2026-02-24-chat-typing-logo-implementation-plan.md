# Chat Typing Indicator Logo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder-like typing indicator mark with the real Sentra tab logo in the chat typing bubble.

**Architecture:** Keep the existing typing indicator state flow unchanged (`showAssistantTyping`), and only adjust the presentational markup in `ConversationPanel`. Add a focused UI test that verifies the logo source and label during typing state. Do not change streaming, routing, or backend behavior.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Tailwind utility classes.

---

### Task 1: Add Focused Failing Test For Typing Logo

**Files:**
- Create: `src/features/sentra/__tests__/conversation-panel-typing-indicator.test.tsx`
- Read: `src/features/sentra/components/chat/ConversationPanel.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConversationPanel } from '@/features/sentra/components/chat/ConversationPanel';

describe('conversation panel typing indicator', () => {
  it('renders Sentra logo in typing bubble', () => {
    render(
      <ConversationPanel
        messages={[]}
        pendingProposal={null}
        onSend={() => {}}
        onConfirmProposal={() => {}}
        onEditProposal={() => {}}
        showAssistantTyping
      />,
    );

    const logo = screen.getByAltText('Sentra logo') as HTMLImageElement;
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toBe('/favicon.svg');
    expect(screen.getByText(/sentra is thinking/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/features/sentra/__tests__/conversation-panel-typing-indicator.test.tsx`
Expected: FAIL because logo image is not rendered yet.

**Step 3: Commit test-only red state (optional checkpoint)**

```bash
git add src/features/sentra/__tests__/conversation-panel-typing-indicator.test.tsx
git commit -m "test: add failing typing indicator logo coverage"
```

---

### Task 2: Implement Minimal UI Change

**Files:**
- Modify: `src/features/sentra/components/chat/ConversationPanel.tsx`
- Test: `src/features/sentra/__tests__/conversation-panel-typing-indicator.test.tsx`

**Step 1: Write minimal implementation**

Update the typing indicator block to include a logo image and horizontal alignment:

```tsx
{showAssistantTyping && (
  <div className="mr-auto max-w-[80%]">
    <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      <img src="/favicon.svg" alt="Sentra logo" className="h-4 w-4" />
      <span>Sentra is thinking...</span>
    </div>
  </div>
)}
```

**Step 2: Run targeted test to verify it passes**

Run: `npm test -- --run src/features/sentra/__tests__/conversation-panel-typing-indicator.test.tsx`
Expected: PASS.

**Step 3: Run related regression subset**

Run: `npm test -- --run src/features/sentra/__tests__/chat-streaming-flow.test.tsx src/features/sentra/__tests__/chat-confirmation-flow.test.tsx`
Expected: PASS, no regression in chat flow behavior.

**Step 4: Commit implementation**

```bash
git add src/features/sentra/components/chat/ConversationPanel.tsx src/features/sentra/__tests__/conversation-panel-typing-indicator.test.tsx
git commit -m "feat: use favicon logo in typing indicator"
```

---

### Task 3: Final Verification and Documentation Sync

**Files:**
- Read: `README.md`
- Read: `docs/plans/2026-02-24-chat-typing-logo-design.md`

**Step 1: Manual verification checklist**

- Open app and trigger typing state by sending a message.
- Confirm the typing bubble shows the actual Sentra logo from `/favicon.svg`.
- Confirm text and spacing remain visually stable.

**Step 2: Decide if docs updates are needed**

- If README has a visual/UX section referencing typing indicator visuals, update it.
- If not, no doc changes (YAGNI).

**Step 3: Commit docs (only if changed)**

```bash
git add README.md
git commit -m "docs: update typing indicator logo note"
```

