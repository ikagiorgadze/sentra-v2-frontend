# Request Form Redesign

## Overview

Redesign the intelligence request form into a two-card single-page layout that separates user data collection fields from analysis configuration fields, with a dynamic price calculator.

## Approach

Two-Panel Card Layout on a single scrollable page. Full redesign of `RequestFormPage.tsx`.

## Page Structure

**Page title:** "New Intelligence Request"

### Card 1: Your Details (User Data Collection)

| Field | Type | Required |
|-------|------|----------|
| Organization / Client Name | Text input | Yes |
| Department / Team | Dropdown (Corporate Affairs, PR/Communications, Marketing, Research/Academic, Other) | Yes |
| Primary Contact: Name | Text input | Yes |
| Primary Contact: Email | Text input (email) | Yes |
| Primary Contact: Phone | Text input | No |
| Project / Campaign Name | Text input | No |
| Additional Context | Textarea | No |

### Card 2: Analysis Configuration

| Field | Type | Required |
|-------|------|----------|
| Monitoring Objective | Checkboxes (at least one required) | Yes |
| Key Question | Textarea | Yes |
| Keywords / Phrases | Tag input (at least one) | Yes |
| Country | Text input | Yes |
| Time Range | Radio (Last 24h, Last 7d, Last 30d, Custom range) | Yes |
| Compare with previous period | Toggle | No |
| Intelligence Depth | Radio (Basic, Advanced, Strategic) | Yes |

### Card 3: Price Calculator

Dynamic summary showing cost per selected item and total.

## Monitoring Objectives

Available checkboxes with pricing behavior:

- **Brand sentiment monitoring** — included in base price
- **Campaign performance analysis** (+$XX) — when checked, inline expansion:
  - Campaign name or hashtag (text input)
  - Campaign launch date (date picker)
  - What metrics matter most? (checkboxes: Reach, Engagement, Conversions, Brand lift)
- **Competitor analysis** (+$XX) — when checked, inline expansion:
  - Competitor names (tag input, multiple)
  - What to compare? (checkboxes: Sentiment, Share of voice, Messaging strategy)
- **Industry / sector analysis** (+$XX) — when checked, inline expansion:
  - Industry / sector (text input)
  - Focus area (checkboxes: Market trends, Regulatory sentiment, Public perception)
- **Other** — free text input

## Intelligence Depth Tiers

Radio button selection, each with different pricing:

- **Basic** ($XX) — Mentions volume, Sentiment distribution, Top posts
- **Advanced** ($XX) — + Emotion analysis, Influencer mapping
- **Strategic Intelligence** ($XX) — + Coordinated behavior signals, Competitor positioning, Strategic recommendations

## Time Range

- Radio options: Last 24 hours, Last 7 days, Last 30 days, Custom range
- Custom range: Start date + End date pickers (inline expansion)
- Compare with previous period toggle: when on, inline expansion:
  - Radio: Same length prior period, Custom range
  - If custom: start date + end date pickers

## Price Calculator

Dynamically updates as user selects options. Shows:

- Intelligence depth tier and its price
- Each selected monitoring objective with its price ($0 for brand sentiment)
- Horizontal divider
- Estimated total

All prices are placeholder values to be replaced later.

## Conditional Inline Expansions

All conditional fields expand inline below their parent checkbox/toggle with smooth animation. Fields are visually indented under their parent.

## Validation

- Zod schema with React Hook Form
- Inline validation errors on blur and on submit
- Conditional validation (e.g., competitor names required only when competitor analysis checkbox is selected)

## Submission

- POST to `/v1/form-requests`
- Payload includes all fields + price breakdown
- Redirect to request history on success

## Removed from Original Spec

- Success Criteria section
- Deliverables section
- Narrative shift detection (from objectives and intelligence depth)
- Product launch feedback objective
- "Primary Brand" field (removed entirely)
- Confirmation checkbox

## Tech Stack

- React Hook Form + Zod
- shadcn/ui components (Card, Input, Checkbox, RadioGroup, Select, Textarea, Badge, Button)
- TailwindCSS for layout and spacing
- Existing API client at `features/sentra/api/formRequests.ts`
