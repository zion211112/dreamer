# Network Module UI Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Network module's CapabilityDirectory and DirectoryEntry components with a Card/Table toggle — the primary discovery interface for APT-LABS's local work network, where evidence visibility = trust signal.

**Architecture:** Two view modes sharing the same data layer (DirectoryEntry from network.ts). Card view = default for browsing; Table view = coordinator density mode. Both use the same filter/search state.

**Tech Stack:** Vite + Preact + TypeScript + Wouter + CSS Modules (or styled-components if preferred), using existing `src/styles.css` tokens and `src/components/` primitives.

**Spec:** This document.

---

## Global Constraints

- **No SaaS card kit:** No identical rounded cards, no soft grey shadows, no gradient washes as decoration.
- **No templated typography:** No ALL-CAPS eyebrows, no middle-dot meta strings, no 'WORD — fragment' labels, no '→' on buttons.
- **Evidence-first:** Evidence count (EVD:N) and basis (●●○) are first-class visual elements, not hidden in modals.
- **Keyboard-first:** Table mode fully navigable; Card mode arrow-key navigable.
- **Responsive:** Card view stacks on mobile; Table view horizontal scroll with sticky name column.
- **Demo mode aware:** Works with empty/localStorage data; no Supabase required.
- **Existing tokens:** Extend `src/styles.css` — do not create new token files.
- **Existing components:** Reuse `Button`, `Input`, `BrandMark` from `src/components/`.

---

## Design Tokens (Extend src/styles.css)

```css
/* === NETWORK MODULE TOKENS === */

/* Base palette — distinct from generic defaults */
--net-ink: #0B0D12;           /* near-black, not pure #000 */
--net-paper: #FAF9F6;         /* warm off-white, not clinical */
--net-ink-muted: #3D4048;     /* muted text */
--net-ink-faint: #6B6E76;     /* faint text/labels */

/* Evidence basis — semantic, not decorative */
--net-basis-declared: #7A8490;      /* cool grey — self-reported */
--net-basis-supported: #3A86C8;     /* cerulean — peer-backed */
--net-basis-counterparty: #C8963E;  /* brass — counterparty confirmed */
--net-basis-independent: #2E7D32;   /* forest — independently verified */

/* Evidence layers — access control visible */
--net-layer-public: transparent;
--net-layer-participant: #3A86C8;   /* cerulean left border */
--net-layer-restricted: #C8963E;    /* brass left border */

/* Availability states */
--net-available: #2E7D32;           /* forest — available now */
--net-busy: #C8963E;                /* brass — limited capacity */
--net-unavailable: #7A8490;         /* grey — not taking work */

/* Type — single family, distinctive weights */
--net-font: 'Space Grotesk', system-ui, sans-serif;
--net-font-mono: 'JetBrains Mono', monospace;

/* Scale — clamp-based, responsive */
--net-text-xs: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
--net-text-sm: clamp(0.8125rem, 0.775rem + 0.2vw, 0.875rem);
--net-text-base: clamp(0.9375rem, 0.875rem + 0.3vw, 1rem);
--net-text-lg: clamp(1.125rem, 1.025rem + 0.5vw, 1.25rem);
--net-text-xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.75rem);
--net-text-2xl: clamp(2rem, 1.75rem + 1.25vw, 2.5rem);

/* Spacing — 4px base unit */
--net-space-1: 4px;
--net-space-2: 8px;
--net-space-3: 12px;
--net-space-4: 16px;
--net-space-5: 20px;
--net-space-6: 24px;
--net-space-8: 32px;
--net-space-10: 40px;
--net-space-12: 48px;

/* Radius — intentional, not uniform */
--net-radius-tight: 4px;    /* chips, badges, inputs */
--net-radius-card: 8px;     /* cards */
--net-radius-pane: 12px;    /* panels, modals */

/* Shadows — single elevation, purposeful */
--net-shadow-card: 0 1px 3px rgba(11,13,18,0.08), 0 4px 12px rgba(11,13,18,0.05);
--net-shadow-elevated: 0 4px 16px rgba(11,13,18,0.1), 0 8px 32px rgba(11,13,18,0.06);

/* Transitions — respect reduced motion */
--net-transition-fast: 120ms ease-out;
--net-transition-base: 200ms ease-out;

/* Z-index */
--net-z-dropdown: 100;
--net-z-modal: 200;
--net-z-toast: 300;
```

---

## Component API

### CapabilityDirectory (Main Entry Point)

```tsx
interface CapabilityDirectoryProps {
  initialFilters?: SearchFilters;
  initialView?: 'card' | 'table';
  onEntrySelect?: (entry: DirectoryEntry) => void;
  className?: string;
}

// Renders:
// - ViewToggle (Card/Table)
// - FilterBar (capabilities, basis, location, availability, query)
// - ResultsCount
// - CardGrid OR TableView (switched by view state)
// - EmptyState / LoadingState / ErrorState
```

### DirectoryEntryCard (Card View Item)

```tsx
interface DirectoryEntryCardProps {
  entry: DirectoryEntry;
  onSelect?: () => void;
  onAction?: (action: 'view' | 'message' | 'save') => void;
  compact?: boolean;
  className?: string;
}

// Renders:
// - Avatar + Name + Role + Location
// - Headline (truncated)
// - CapabilityChips (max 3 visible, +N overflow)
// - EvidenceSummary (EVD:N / SBT:N rings)
// - PrimaryAction + SecondaryAction
// - Hover/Focus: expand to show top evidence, offers
```

### DirectoryEntryRow (Table View Item)

```tsx
interface DirectoryEntryRowProps {
  entry: DirectoryEntry;
  onSelect?: () => void;
  onAction?: (action: 'view' | 'message' | 'save') => void;
  expanded?: boolean;
  onExpand?: () => void;
  columns?: ('capabilities' | 'evidence' | 'offers' | 'rate' | 'actions')[];
  className?: string;
}

// Renders:
// - Name (sticky) + Role + Location
// - Capabilities column (chips with basis dots)
// - Evidence column (EVD:N / SBT:N)
// - Offers column (titles, truncated)
// - Rate column (from first offer)
// - Actions column (View, Message, Save)
// - Expandable row detail (evidence list, offers, contact)
```

### FilterBar (Shared)

```tsx
interface FilterBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  availableCapabilities: string[];
  availableCategories: string[];
  availableLocations: string[];
  className?: string;
}

// Renders:
// - Search input (debounced)
// - Capability multi-select (with category grouping)
// - Basis filter (4 checkboxes with colored dots)
// - Location input (with suggestions)
// - Availability select
// - Clear filters button
// - Mobile: collapsible drawer
```

### ViewToggle

```tsx
interface ViewToggleProps {
  view: 'card' | 'table';
  onChange: (view: 'card' | 'table') => void;
  className?: string;
}

// Renders: Two-button segmented control with icons
// Card: 4-square grid icon
// Table: 4-line list icon
// Active state: brass underline + bold label
```

---

## Layout Specs

### Card View (Default)

```
┌─────────────────────────────────────────────────────────────────┐
│  Network Directory                                    [Card][Table]│
├─────────────────────────────────────────────────────────────────┤
│  [Search...]  [Capabilities ▼] [Basis ▼] [Location ▼] [Avail ▼] │
├─────────────────────────────────────────────────────────────────┤
│  Showing 12 of 47  •  3 filtered  •  [Clear]                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐  │
│  │ [M] Maya R.  │ │ [O] Omar H.  │ │ [L] Lin C.   │ │ [P]... │  │
│  │ Carpenter    │ │ Electrician  │ │ HVAC Tech    │ │        │  │
│  │ ●●● Carpentry│ │ ●●○ Electrical│ │ ●○○ HVAC     │ │        │  │
│  │ ●○○ Proj Mgmt│ │ ●○○ Code     │ │ ●○○ Sheet Mtl│ │        │  │
│  │ EVD:3  SBT:1 │ │ EVD:2        │ │ EVD:0        │ │        │  │
│  │ [View] [Msg] │ │ [View] [Msg] │ │ [View] [Msg] │ │        │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ [J]...       │ │ [A]...       │ │ [K]...       │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

**Responsive:** 1 col < 480px, 2 col < 768px, 3 col < 1024px, 4 col ≥ 1024px

**Hover/Focus Expand (Card):**
```
┌─────────────────────────────────────────────────────────────────┐
│  [M] Maya R.          Carpenter • Oakland, CA        [×]       │
│  "Residential renovation specialist, 12+ years"                │
├─────────────────────────────────────────────────────────────────┤
│  Capabilities:                                                    │
│  ████ Carpentry ●●●  ████ Project Mgmt ●○○  ████ Design ●○○     │
│  ████ Client Comm ●○○  ████ Permitting ●○○                       │
├─────────────────────────────────────────────────────────────────┤
│  Evidence (3):  [SBT] Journeyman '23  [EVD] 12 Maple Reno       │
│                 [EVD] 8 Oak Remodel  [EVD] Ref: J. Torres       │
├─────────────────────────────────────────────────────────────────┤
│  Offers:  Renovation $65-95/hr  •  Consulting $120/hr           │
│           Available Mon-Thu • 2 week lead                        │
├─────────────────────────────────────────────────────────────────┤
│  [View Profile]          [Message]          [Save]              │
└─────────────────────────────────────────────────────────────────┘
```

### Table View (Coordinator Mode)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Network Directory                                    [Card][Table]            │
├──────────────────────────────────────────────────────────────────────────────┤
│  [Search...]  [Capabilities ▼] [Basis ▼] [Location ▼] [Avail ▼] [Columns ▼]  │
├──────────────────────────────────────────────────────────────────────────────┤
│  ▼ Maya R.          Carpenter      Oakland, CA    ●●● Carpentry  EVD:3  $65  [→] │
│       ▲             ●○○ Proj Mgmt  ●○○ Design     SBT:1    $120              │
│  ▼ Omar H.          Electrician    Berkeley, CA   ●●○ Electrical EVD:2  $85  [→] │
│       ▲             ●○○ Code Comp  ●○○ Inspect    SBT:0    $95               │
│  ► Lin C.           HVAC Tech      Richmond, CA   ●○○ HVAC     EVD:0  $75  [→] │
│  ► Priya S.         Plumber        San Leandro    ●●○ Plumbing EVD:1  $80  [→] │
│       ▲             ●○○ Pipefit    ●○○ Gas        SBT:1    $90               │
└──────────────────────────────────────────────────────────────────────────────┘
  ↑ Sticky name column on horizontal scroll
  ▼ = expanded row (shows evidence list, full offers, contact)
```

**Expanded Row Detail:**
```
│  ▼ Maya R.          Carpenter      Oakland, CA    ●●● Carpentry  EVD:3  $65  [→] │
├──────────────────────────────────────────────────────────────────────────────────┤
│  Evidence:  [SBT] CA Journeyman Carpenter (2023)  Issuer: CSLB  Verified        │
│             [EVD] 12 Maple St Renovation — Complete kitchen remodel, 2024       │
│             [EVD] 8 Oak Ave Remodel — Bathroom + layout change, 2023            │
│             [EVD] Reference: James Torres, Torres Builders — "Reliable, clean"  │
│  Offers:    Renovation $65-95/hr • Design Consulting $120/hr • Permitting $85/hr│
│             Available: Mon-Thu • Lead time: 2 weeks • Service: East Bay         │
│  Contact:   maya.rodriguez@email.com • (510) 555-0199 • Prefers email          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Interaction Specs

### View Toggle
- Persisted in localStorage (`networkViewMode`)
- Keyboard: `V` toggles view (when not in input)
- Announced to screen readers: "Switched to card view" / "Switched to table view"

### FilterBar
- Search: 250ms debounce, searches name, headline, capabilities, location
- Capability multi-select: grouped by category, searchable within dropdown
- Basis filter: 4 checkboxes with colored ● indicators (matching basis tokens)
- Location: autocomplete from existing profile locations
- Availability: All / Available Now / This Week / Next 2 Weeks
- Clear filters: single action, announces "All filters cleared"

### Card Interactions
- Click card → navigate to `/workspace/people/:id` (or open detail panel)
- Hover/Focus (desktop) → expand inline (max height 320px, scroll if needed)
- Keyboard: Arrow keys navigate grid; Enter/Space selects; Escape collapses
- Touch: Tap to expand, tap outside to collapse

### Table Interactions
- Click row / Enter → expand/collapse detail row
- Arrow Up/Down → navigate rows
- Tab → moves through action buttons in expanded row
- Horizontal scroll with sticky name column (position: sticky; left: 0)
- Column visibility toggle in Columns dropdown

### Empty States
- No results: "No matches for [filters]. Try broadening your search."
- No data (demo): "No network profiles yet. Create a profile to appear here."
- Loading: Skeleton cards/rows (3-5 placeholders)

---

## Accessibility

- All interactive elements: focus-visible outline (2px brass, 2px offset)
- Color never sole indicator: basis dots have labels on hover/focus
- Table: proper `<th scope="col">`, `<td>` with headers attribute for expanded content
- Card: `role="article"`, `aria-labelledby` for name
- Expanded content: `aria-expanded`, `aria-controls`
- View toggle: `role="radiogroup"`, `aria-label="View mode"`
- Reduced motion: transitions disabled via `@media (prefers-reduced-motion: reduce)`

---

## Review Focus (5 failure modes most likely to bite)

| Input/Condition | Expected Behavior |
|-----------------|-------------------|
| 200+ entries, rapid filter typing | Debounced search, no layout thrash, skeleton while loading |
| Mobile viewport (375px) | Card view: single column, touch targets ≥ 44px, filters in drawer |
| Keyboard-only navigation | Table: full row/col navigation; Card: grid arrow keys; both: visible focus |
| Demo mode (no Supabase) | Shows localStorage profiles or empty state gracefully |
| Evidence basis = all 4 states | Each basis visually distinct (dot color + tooltip), not just color |

---

## Task Breakdown

### Task 1: Design Tokens & CSS Foundation
- [ ] Extend `src/styles.css` with network module tokens
- [ ] Add base styles for card/table containers, grid, table
- [ ] Add focus-visible, reduced-motion, print styles

### Task 2: ViewToggle Component
- [ ] Create `src/components/ViewToggle.tsx`
- [ ] Test: renders two buttons, toggles state, persists to localStorage
- [ ] Test: keyboard accessible, announces to screen readers

### Task 3: FilterBar Component
- [ ] Create `src/components/FilterBar.tsx`
- [ ] Test: all filter types work, debounced search, clear action
- [ ] Test: mobile drawer, keyboard navigation

### Task 4: DirectoryEntryCard Component
- [ ] Create `src/components/DirectoryEntryCard.tsx`
- [ ] Test: renders entry data, evidence rings, capability chips
- [ ] Test: hover/focus expand, keyboard navigation, actions

### Task 5: DirectoryEntryRow Component
- [ ] Create `src/components/DirectoryEntryRow.tsx`
- [ ] Test: renders row data, sticky name, expandable detail
- [ ] Test: horizontal scroll, column visibility, keyboard

### Task 6: CapabilityDirectory (Main Component)
- [ ] Create `src/components/CapabilityDirectory.tsx`
- [ ] Integrates ViewToggle, FilterBar, CardGrid/TableView
- [ ] Manages view state, filter state, selection
- [ ] Test: view toggle, filter → results, empty/loading/error states

### Task 7: Network Page Integration
- [ ] Create `src/pages/Network.tsx` (or update workspace route)
- [ ] Wire CapabilityDirectory with real data from network.ts
- [ ] Test: demo mode works, Supabase mode works, role-based visibility

### Task 8: Polish & Review
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Accessibility audit (axe, keyboard, screen reader)
- [ ] Performance: 60fps scroll, <100ms filter response
- [ ] Visual regression: compare card/table toggle, expanded states

---

## Self-Review Checklist

- [ ] **Spec coverage:** All sections above have corresponding tasks
- [ ] **Step scan:** Each step lets implementer write one reasonable thing
- [ ] **Type consistency:** Component props match DirectoryEntry from network.ts
- [ ] **Review Focus:** Each failure mode has a test in owning task
- [ ] **Proportion:** Plan is concise, code blocks only for algorithms/copy

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/specs/2026-11-02-network-module-design.md`.**

**Recommended approach: Subagent-driven** — 8 independent tasks with clear interfaces, each testable in isolation. Fresh context per task ensures each component meets the anti-slop standard before integration.