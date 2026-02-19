

# Sentra Intelligence Chat

A new `/chat` route accessible from the dashboard that provides a conversational intelligence interface. The user types a query (e.g., "Sentiment about infrastructure reform in Poland last 7 days") and receives a structured intelligence briefing with mock data, rendered as structured output blocks in a chat UI.

---

## What Gets Built

### New Route: `/chat`
- Protected route, accessible to authenticated users
- Full-screen chat interface with dark theme, minimal chrome
- Header with Sentra logo + "Back to Dashboard" link

### Chat Interface
- Bottom-anchored input bar with placeholder: *"Ask about any topic, entity, or region..."*
- Messages rendered as a scrollable conversation thread
- User messages styled as right-aligned text bubbles
- Assistant responses rendered as structured intelligence blocks (not plain text)

### Structured Output Blocks (mock data)
Each assistant response contains these sections, rendered as distinct cards/blocks:

1. **Progress Indicator** -- Animated steps while "processing": Scraping sources... Analyzing sentiment... Clustering narratives... Generating briefing... (simulated 3-4 second delay)
2. **Executive Summary** -- 3-4 sentence overview card with signal-cyan left border
3. **Sentiment Distribution** -- Horizontal bar chart (Recharts) showing Positive / Neutral / Negative / Mixed percentages
4. **Trend Line** -- Line chart showing sentiment over the queried time period (reuses existing TrendLineChart component)
5. **Narrative Clusters** -- 3-4 cards, each with a cluster label, description, and mention count
6. **Entity Insights** -- Table with entity name, mention count, sentiment, and influence score
7. **Risk Signals** -- Amber-bordered cards for flagged anomalies (bot activity, coordinated amplification, etc.)
8. **Evidence Table** -- Expandable table with source, date, snippet, sentiment, and engagement metrics

### Follow-Up Suggestion Chips
After each response, display 3-4 clickable chips like:
- "Compare with opposition"
- "Show bot activity breakdown"
- "Narrow to X (Twitter) only"
- "Extend to 30 days"

Clicking a chip sends it as the next user message.

### Dashboard Integration
- Add a prominent "Intelligence Chat" button/card on the ActiveDashboard page linking to `/chat`

---

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `src/pages/Chat.tsx` | Page component, manages conversation state and message list |
| `src/components/chat/ChatInput.tsx` | Bottom-anchored input bar with send button |
| `src/components/chat/ChatMessage.tsx` | Renders a single user or assistant message |
| `src/components/chat/BriefingResponse.tsx` | Orchestrates all structured output blocks for one response |
| `src/components/chat/ExecutiveSummary.tsx` | Summary card |
| `src/components/chat/SentimentChart.tsx` | Horizontal bar chart for sentiment distribution |
| `src/components/chat/NarrativeClusters.tsx` | Cluster cards |
| `src/components/chat/EntityInsights.tsx` | Entity table |
| `src/components/chat/RiskSignals.tsx` | Risk alert cards |
| `src/components/chat/EvidenceTable.tsx` | Expandable evidence table |
| `src/components/chat/ProgressSteps.tsx` | Animated processing state |
| `src/components/chat/SuggestionChips.tsx` | Follow-up suggestion buttons |
| `src/lib/mock/chatMockData.ts` | Mock data generators for all briefing sections |

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/chat` route (protected) |
| `src/components/dashboard/ActiveDashboard.tsx` | Add "Intelligence Chat" card/button |

### Architecture

```text
Chat.tsx (page)
  +-- ChatMessage[] (scrollable list)
  |     +-- User message (text bubble)
  |     +-- Assistant message
  |           +-- ProgressSteps (during loading)
  |           +-- BriefingResponse (after loaded)
  |                 +-- ExecutiveSummary
  |                 +-- SentimentChart (Recharts BarChart)
  |                 +-- TrendLineChart (existing component)
  |                 +-- NarrativeClusters
  |                 +-- EntityInsights
  |                 +-- RiskSignals
  |                 +-- EvidenceTable
  |                 +-- SuggestionChips
  +-- ChatInput (fixed bottom)
```

### Mock Data Strategy
- A function `generateMockBriefing(query: string)` extracts keywords from the user's query and uses them to populate realistic-looking mock data
- Data is generated client-side with a simulated delay (3-4 seconds with animated progress steps)
- All charts use the existing Recharts setup and Sentra color palette (signal-cyan, ice-blue, amber for warnings)

### Styling
- Dark theme (inherits existing `.dark` class)
- Font: Space Grotesk for headings, IBM Plex Mono for data values
- Cards use `bg-card` with `border-border` (existing tokens)
- Signal Cyan accents for key data points
- Amber for risk signals
- No border-radius (existing `--radius: 0rem`)

### Sequence of Implementation
1. Create mock data generator
2. Build atomic chat components (input, message, progress)
3. Build briefing sub-components (summary, charts, tables)
4. Build BriefingResponse orchestrator
5. Build Chat page with conversation state management
6. Add route to App.tsx
7. Add entry point on ActiveDashboard

