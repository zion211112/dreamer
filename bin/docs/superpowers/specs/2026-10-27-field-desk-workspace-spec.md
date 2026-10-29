# APT-LABS Field Desk Workspace Specification

**Status:** Implementation Ready
**Date:** 2026-10-27
**Product:** APT-LABS
**Replaces:** WorkspaceShell (IDE-style 4-floor metaphor)

---

## 1. Purpose

Replace the IDE-style WorkspaceShell (1061 lines, 4-floor lift metaphor, 3-panel layout) with a **Field Desk** — a role-aware, context-first, mobile-first workspace that serves the core loop: **Demand → Tender → Assembly → Roll**.

The Field Desk is a **single-column progressive-disclosure surface** that adapts to the user's verified context (network, school, crew, funder) and shows only what's actionable.

---

## 2. Design Principles

| Principle | Application |
|-----------|-------------|
| **Context over chrome** | No persistent sidebars, no inspector panel, no floor lift. Context switcher in header drives entire view. |
| **Role-aware by default** | Server-verified context (network/school/crew/funder) determines available views and data. |
| **Active work first** | "Active Work" view surfaces tenders needing *your* action today. |
| **Mobile-first, desktop-enhanced** | Single column < 1024px; inspector sidebar ≥ 1024px only. |
| **Progressive disclosure** | Tender cards expand inline; full dossier in modal; no 3-panel fixed layout. |
| **Truthful boundaries** | Illustrative data marked; local drafts stay local; no implied capabilities. |
| **Field Atlas visual language** | Uses existing design tokens from `src/styles.css` — no new design system. |

---

## 3. Information Architecture

### 3.1 Views (Tabs) — Role-Gated

| View | Key | Kicker | Roles | Purpose |
|------|-----|--------|-------|---------|
| Active Work | `active` | `01 / YOUR DESK` | all | Tenders needing *your* action today |
| My Tenders | `mine` | `02 / YOUR TENDERS` | school, crew, funder, network | Published/draft tenders in this context |
| Market | `market` | `03 / OPEN MARKET` | funder, network, school, crew | Browse open tenders, signal intent |
| Commons | `commons` | `04 / WORKSHOP NOTES` | network, school, crew, funder | Field notes, resources, polls |
| The Roll | `roll` | `05 / PROOF LEDGER` | network, crew, school, funder | Verified deployments only |

**Role gating**: Each view declares `roles: ContextKind[]`. If current context's kind not in list, view is hidden and user redirected to first available view on context switch.

### 3.2 Context Kinds (from `get_workspace_contexts()`)

| Kind | Label | Icon | Typical User | Data Scope |
|------|-------|------|--------------|------------|
| `network` | APT-LABS Network | Network | Any authenticated member | All public tenders, illustrative examples |
| `school` | [Org Name] | Building2 | Principal/Issuer | Org's tenders, publication actions |
| `crew` | [Asset Name] | Hammer | Anchor/Builder/Apprentice | Assigned tender only |
| `funder` | Capital Intent | Radio | Funder | Open tenders, signaled intent |

**Context switcher** in header (replaces floor switcher). Single click changes entire workspace view.

---

## 4. Component Architecture

### 4.1 File Structure

```
src/components/
├── workspace-desk.tsx          # Main component (replaces workspace-shell.tsx)
├── workspace-context-switcher.tsx  # Context selector in header
└── (existing components reused)
    ├── user-profile-menu.tsx
    └── ui/* (btn, panel, badge, etc.)
```

### 4.2 Main Component: `WorkspaceDesk`

**Props** (from `app/workspace/page.tsx`):
```typescript
interface WorkspaceDeskProps {
  initialTenders: Tender[];           // From getMarketTenders()
  initialBriefs: unknown[];           // From listProblemBriefs()
  userEmail: string;
  profileData: UserProfileData | null;
  localMode: boolean;
  workspaceContexts: WorkspaceContext; // Full context from getWorkspaceContext()
}
```

**State**:
- `view: DeskView` — active tab
- `currentContext: WorkspaceContextOption | null` — selected context
- `profileOpen, profileSection, profileAssetContext` — delegated to UserProfileMenu
- `minimal: boolean` — focus mode (hides inspector sidebar)
- `selectedTender, tenderDetailOpen` — modal dossier
- `composerOpen, composerMode, form` — local draft composer

### 4.3 Sub-Components (internal to workspace-desk.tsx)

| Component | Responsibility |
|-----------|----------------|
| `DeskHeader` | Brand, context switcher, profile menu, minimal toggle |
| `DeskFooter` | Session indicator, version, context reminder |
| `ActiveWorkSection` | Actionable tenders (prioritized by lifecycle.permitted) |
| `MineSection` | Context-filtered tender list |
| `MarketSection` | Open tenders + illustrative, with filter/search placeholders |
| `CommonsSection` | Briefs list + compose action |
| `RollSection` | Deployed-only tenders (illustrative excluded) |
| `TenderCard` | Reusable tender display (compact/expanded variants) |
| `StatusBadge` | Status + capital allocation state |
| `EmptyState` | Consistent empty states with CTAs |

### 4.4 Context Switcher: `WorkspaceContextSwitcher`

**Props**:
```typescript
interface WorkspaceContextSwitcherProps {
  contexts: WorkspaceContextOption[];
  currentContext: WorkspaceContextOption | null;
  onChange: (key: string) => void;
}
```

**Behavior**: Dropdown menu (same pattern as floor switcher). Shows context label, kind badge, current marker. Click → `onChange(key)` → parent updates `currentContext` + resets view.

---

## 5. Data Flow

```
getWorkspaceContext() (server)
    │
    ├── contexts: WorkspaceContextOption[]  ──→ Context Switcher
    │       ├── kind: 'network' | 'school' | 'crew' | 'funder'
    │       ├── label, role, organizationId
    │       ├── tenderId, tenderSlug, tenderStatus, assetName
    │       └── isIllustrative: boolean
    │
    ├── defaultContextKey  ──→ Initial context selection
    │
    └── (email, localMode, authenticated)  ──→ Header, ProfileMenu

getMarketTenders() (server)
    │
    └── Tender[]  ──→ All sections (filtered per view + context)

listProblemBriefs() (server action)
    │
    └── briefs[]  ──→ CommonsSection
```

### 5.1 Filtering Logic

```typescript
// Active Work: prioritize tenders where user has permitted transitions
const actionable = tenders.filter(t => 
  tenderLifecycle(t).permitted.length > 0 
  && t.status !== 'deployed' 
  && t.status !== 'cancelled'
);

// Mine: context-specific
//   school: org's published tenders (non-illustrative)
//   crew: assigned tender only (via context.tenderId)
//   funder: tenders where user signaled intent

// Market: status === 'open' || isIllustrative

// Roll: status === 'deployed' && !isIllustrative
```

---

## 6. Visual Design (uses existing `src/styles.css` tokens)

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Brand | Context Switcher | Profile | Minimal Toggle    │
├─────────────────────────────────────────────────────────────────┤
│ MAIN (flex: 1)                    │ INSPECTOR (≥1024px, 320px) │
│ ┌─────────────────────────────┐   │ ┌─────────────────────────┐ │
│ │ KICKER / TITLE / SUBTITLE   │   │ │ CONTEXT HEADER          │ │
│ │ [View Tabs: Active│Mine...] │   │ │ Role badge, kind, label │ │
│ │                             │   │ │ Quick actions (links)   │ │
│ │ SECTION (Active/Mine/...)   │   │ │ Selected tender summary │ │
│ │   TenderCard × N            │   │ │                         │ │
│ │                             │   │ │                         │ │
│ └─────────────────────────────┘   │ └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER: ● LOCAL/SIGNED-IN | APT-LABS · FIELD DESK 01.0 | ...   │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile (< 1024px)**: Inspector hidden. Single column.
**Desktop (≥ 1024px)**: Inspector sidebar 320px fixed.

### 6.2 New CSS Classes (added to `src/styles.css`)

| Class | Purpose |
|-------|---------|
| `.atlas-layout-desk` | Grid layout (1 col mobile, 2 col desktop) |
| `.atlas-main-desk` | Main content area |
| `.atlas-desk-tabs` | Horizontal tab bar (scrollable on mobile) |
| `.atlas-desk-tab` | Individual tab button |
| `.atlas-inspector-desk` | Right sidebar (≥1024px) |
| `.atlas-floor-trigger` | Context switcher trigger (reused floor style) |
| `.atlas-floor-menu` | Context switcher dropdown |
| `.atlas-floor-stop` | Context option in dropdown |

### 6.3 Tender Card Variants

```tsx
// Expanded (default in Active/Mine/Market)
<TenderCard tender={t} onClick={...} showContext={true} />

// Compact (secondary tenders in Active Work)
<TenderCard tender={t} onClick={...} compact={true} />
```

**Expanded**: Full spec-grid (location, category, build cost, funding target, funded bar, yield, gate)
**Compact**: Header + status badge + one-line meta (crew count, blueprint lines)

### 6.4 Status Badge System

```typescript
STATUS_CONFIG: Record<TenderStatus, { label, variant, dot }>
  draft → 'DRAFT', variant: 'draft', no dot
  open → 'OPEN', variant: 'open', green dot
  capitalized_pending_settlement → 'AWAITING SETTLEMENT', variant: 'warn', amber dot
  materials → 'MATERIALS', variant: 'info', blue dot
  fabrication → 'FABRICATION', variant: 'info', blue dot
  anchor_signed → 'ANCHOR SIGNED', variant: 'ok', no dot
  deployed → 'DEPLOYED', variant: 'ok', green dot
  cancelled → 'CANCELLED', variant: 'draft', no dot
```

**Capital State** (secondary line): UNFUNDED → SOFT COMMITTED → AWAITING SETTLEMENT → PARTIALLY SETTLED → FULLY CAPITALIZED

---

## 7. Interactions & Behaviors

### 7.1 Context Switch
1. User clicks context trigger → dropdown opens
2. User selects context → `onChange(key)` fires
3. Parent sets `currentContext`, resets `view` to first available for new context
4. All sections re-filter automatically

### 7.2 Tender Click
1. User clicks TenderCard → `setSelectedTender(tender)`, `setTenderDetailOpen(true)`
2. Modal opens with full dossier (economics, blueprint, crew, anchor sign-off)
3. Inspector sidebar (desktop) updates with quick summary + actions

### 7.3 Composer (Local Drafts)
- **Active Work view**: "Log friction" → `composerMode: 'friction'`
- **Commons view**: "Contribute" → `composerMode: 'problem'`
- Saves to session state only → toast confirmation
- **No network submission** — explicitly labeled

### 7.4 Minimal Mode (Focus)
- Toggle in header → `setMinimal(true)`
- Hides inspector sidebar entirely
- Main content expands full width
- Persists in session

### 7.5 Keyboard Shortcuts
- `/` → Open composer (unless editing input)
- `Escape` → Close modal/composer/dropdown
- Tab navigation through desk tabs

---

## 8. Empty States (Truthful)

| View | Condition | Message | CTA |
|------|-----------|---------|-----|
| Active | No actionable tenders | Context-specific guidance | "Browse Market" / "Publish Tender" |
| Mine | No tenders in context | Context-specific guidance | "Open Console" / "Browse Market" |
| Market | No open tenders | "Market is empty. Illustrative scenarios appear when no live tenders exist." | — |
| Commons | Not connected | "Commons not connected. Published posts appear after migration." | — |
| Roll | No deployments | "The Roll is empty. No deployments claimed yet. Illustrative examples can never enter this ledger." | — |

---

## 9. Accessibility

- **Tabs**: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-labelledby`
- **Context switcher**: `aria-haspopup="listbox"`, `aria-expanded`, `role="listbox"`, `role="option"`
- **Modals**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap
- **Focus visible**: All interactive elements use `.focus-ring` / `outline: 2px solid var(--terrain)`
- **Reduced motion**: Respected via existing media query
- **Color contrast**: Uses existing semantic tokens (`--ok`, `--warn`, `--err`, `--info`)

---

## 10. Integration Points

### 10.1 Page: `app/workspace/page.tsx`

```tsx
const workspace = await getWorkspaceContext();
if (!workspace.authenticated) redirect('/sign-in?next=%2Fworkspace');

const [tenders, briefsResult, profileData] = await Promise.all([
  getMarketTenders().catch(() => []),
  listProblemBriefs(),
  getAuthenticatedUserProfileData(),
]);

return (
  <WorkspaceDesk
    initialTenders={tenders}
    initialBriefs={briefsResult.briefs ?? []}
    userEmail={workspace.email ?? ''}
    profileData={profileData}
    localMode={workspace.localMode}
    workspaceContexts={workspace}
  />
);
```

### 10.2 Reused Components
- `UserProfileMenu` — unchanged
- `formatMoney`, `fundedPercent`, `capitalAllocationState`, `tenderLifecycle` — from `@/lib/tender` and `@/lib/tender-data`
- `toast` from `sonner` — unchanged

### 10.3 Removed Dependencies
- `WorkspaceFloorSwitcher` — replaced by `WorkspaceContextSwitcher`
- `SchoolConsole` — no longer embedded (separate product at `/console`)
- `liftTrip` animation — removed
- `radarRoom`, `frictionPoints` — moved to Basement concept (future: separate `/radar` route)
- `recruitingAssets`, `workEngines` — moved to Market view

---

## 11. Migration Checklist

- [ ] Create `src/components/workspace-desk.tsx` (main component)
- [ ] Create `src/components/workspace-context-switcher.tsx` (context selector)
- [ ] Add CSS styles to `src/styles.css` (desk layout, tabs, inspector, context switcher)
- [ ] Update `app/workspace/page.tsx` to import `WorkspaceDesk`
- [ ] Run `npm run typecheck` — verify no TypeScript errors
- [ ] Run `npm run build` — verify production build
- [ ] Run `npm test` — verify tests pass (update any broken tests)
- [ ] Test in browser: local dev mode, context switching, view tabs, tender modal, composer
- [ ] Verify mobile responsiveness (< 760px, 460px)
- [ ] Verify dark mode
- [ ] Commit and push

---

## 12. Future Enhancements (Not in Scope)

| Enhancement | Rationale |
|-------------|-----------|
| `/radar` route | Basement friction signals deserve dedicated surface |
| Real-time Assembly updates | Requires Supabase Realtime + provider |
| Funder intent signaling UI | Requires payment/compliance design |
| Capability badges from Roll | Requires SBT/credential protocol |
| School Console → Tender publish flow | Requires Console integration work |

---

## 13. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails Here |
|--------------|-------------------|
| 3-panel fixed layout | Mobile hostile; inspector often empty |
| Floor metaphor | Doesn't map to user roles; lift animation is chrome |
| Persistent sidebar nav | Context switcher is the nav; context = view |
| Showing everything to everyone | Server auth gates anyway; wastes cognitive budget |
| Illustrative data unmarked | Violates core trust contract |
| Composer submitting to network | No backend endpoint; false affordance |

---

## 14. Acceptance Criteria

1. **Typecheck passes** — `npm run typecheck` zero errors
2. **Build passes** — `npm run build` completes
3. **Tests pass** — `npm test` (update snapshots for new component)
4. **Local dev works** — Sign in → `/workspace` loads Field Desk
5. **Context switcher works** — Dropdown shows contexts, selection changes view
6. **View tabs work** — All 5 views render, role-gated correctly
7. **Tender cards render** — Status badge, capital bar, specs, actions
8. **Tender modal opens** — Full dossier with economics, blueprint, crew, sign-off
9. **Composer works** — Local draft saved, toast shown, no network call
10. **Mobile responsive** — Single column, tabs scroll, inspector hidden
11. **Dark mode works** — All tokens resolve correctly
12. **Minimal mode works** — Inspector hidden, full-width main
13. **Empty states truthful** — No fake data, clear CTAs
14. **Pushed to remote** — `git push origin master` completes

---

## Appendix: Component Export

```typescript
// src/components/workspace-desk.tsx
export function WorkspaceDesk(props: WorkspaceDeskProps) { ... }

// src/components/workspace-context-switcher.tsx
export function WorkspaceContextSwitcher(props: WorkspaceContextSwitcherProps) { ... }
```

No other exports. No default export.