# Unified Workspace Shell Design

## ⚠️ SUPERSEDED â€” DO NOT IMPLEMENT

This spec (dated 2026-11-05) proposed a dual-environment "Main / Branch" workspace shell with an `[Main | Branch]` environment switcher, six primary modules, and separate per-environment palettes. It was superseded by **Workspace Direction v2** (see `docs/design/workspace-direction-v2.md`) and the four user rulings captured in `docs/design/charter.md` §12.

**Key changes from v1 to v2:**
1. **Removed** `[Main | Branch]` environment switcher â€” branch is a change-set, not a separate workspace.
2. **Collapsed** seven labels into five charter modules: Commons, Network, Workbench, Records, Intelligence.
3. **Dark signature** (`#0A0F0C`) is the default palette; light luxury is a variant via `[data-skin="light"]`.
4. **Information-driven page head hierarchy** replaces identical four-metric headers.
5. **Inspector and dock are contextual** â€” mount only on record selection / change-set existence.
6. **No demo disclaimer theater** â€” honest "Local demo" boundary only.

Do not use this spec for implementation. Refer to `docs/design/workspace-direction-v2.md` for the S0-S15 build order.

**Status:** Approved for implementation  
**Date:** 2026-11-05  
**Source:** Distilled from `.superpowers/brainstorm/main-shell-v1.html`, `.superpowers/brainstorm/branch-shell-v1.html`, `bin/design-archive/people-design-comparison.html`, `bin/design-archive/workspace-benchmark-analysis.md`, and semantic architecture (user-provided).

---

## Semantic Architecture (Locked)

| Concept | Meaning | Environment |
|---------|---------|-------------|
| **CANON** | Authoritative identity and entity registry | Main |
| **MAIN** | Canonical sequence of accepted historical events | Main |
| **ANNALS** | Chronological query layer over event records | Branch |
| **BRANCHES** | Independent timelines derived from a Main snapshot | Branch |
| **THE ROLL** | Evidence, attestations, and provenance | Both |
| **WORKBENCH** | Execution and production (simulation, tender, delivery) | Branch |

**Rules:**
1. Main is canonical, never silently rewritten.
2. Branches inherit a specific Main snapshot and its event history.
3. Branch commits remain distinguishable from verified real-world events.
4. Merging requires conflict resolution, authorization, and evidence checks.
5. Annals is a chronological view/query layer, not a second database.

---

## Environment Definitions

### Main / Canon (Light Theme)
**Purpose:** Authoritative view of enduring records  
**Modules (rail icons):**
- **Main Sequence** — accepted event ledger (M-001 → M-042)
- **Canon Registry** — People & Institutions, Assets, Relationships, Identity & Authority
- **Annals** — chronological query (link to Branch environment)
- **The Roll** — evidence and provenance sources

**Visual language:** Light paper, sage/canon teal accents, Georgia serif headlines, Cascadia Mono labels, subtle shadows, glassmorphism topbar.

### Branch / Annals (Dark Theme)
**Purpose:** Default working environment for exploration and production  
**Modules (rail icons):**
- **Branches** — fork explorer, timeline comparison, commit list
- **Annals** — chronological reconstruction across Main and branches
- **The Roll** — evidence and attestations
- **Workbench** — execution, simulation, tender composition, delivery

**Visual language:** Deep charcoal, lime/teal/coral accents, Georgia serif headlines, Cascadia Mono labels, grid background on timeline, elevated panels.

---

## Unified Shell Layout (Both Environments)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR (54px)                                                               │
│ [Brand] [Divider] [Workspace Name] [Environment Switch] [Spacer]           │
│ [Head State] [Search] [Queue Action] [Avatar]                              │
├────┬─────────────┬────────────────────────┬───────────────┐                │
│    │ SIDEBAR     │ MAIN                   │ INSPECTOR     │                │
│RAIL│ (collapsible)│ (flexible)             │ (collapsible) │                │
│56px│ ~220px      │ 1fr                    │ ~300px        │                │
│    │             │                        │               │                │
│    │ Context     │ Breadcrumbs            │ Record/       │                │
│    │ Side-nav    │ Page head              │ Branch        │                │
│    │ Footer      │ Content (ledger,       │ Details       │                │
│    │             │  timeline, overview)   │ Actions       │                │
├────┴─────────────┴────────────────────────┴───────────────┤                │
│ DOCK (collapsible, spans Main + Inspector)                │                │
│ [Inbox/Commits] [Conflicts] [Evidence] [Integrity]        │                │
├────────────────────────────────────────────────────────────┤                │
│ STATUSBAR (24-25px)                                       │                │
│ [APT-LABS] [/] [Environment] [Head/Branch Status] [Spacer]│                │
│ [Layout Status] [Local Demo Labels]                       │                │
└────────────────────────────────────────────────────────────┘
```

**Responsive breakpoints:**
- ≤1180px: Sidebar/Inspector compress
- ≤900px: Inspector becomes drawer (right), Dock compresses
- ≤640px: Rail hidden, Sidebar becomes top tab bar, single-column stack

---

## CSS Token System (Unified)

```css
:root {
  /* Shared semantic tokens — environment-specific values set via [data-env] */
  --rail: 56px;
  --sidebar: clamp(196px, 17vw, 252px);
  --inspector: clamp(286px, 23vw, 360px);
  --dock: clamp(132px, 18vh, 174px);
  --header: 54px;
  --status: 25px;
  --mono: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
  --sans: "Segoe UI Variable", "Segoe UI", sans-serif;
  --serif: Georgia, "Times New Roman", serif;
}

/* Main / Canon — Light */
[data-env="main"] {
  color-scheme: light;
  --paper: #eef1ed;
  --paper-deep: #e6ece7;
  --surface: #fafbf9;
  --surface-raised: #ffffff;
  --surface-subtle: #e5eae5;
  --ink: #1d2925;
  --muted: #64736d;
  --dim: #88948e;
  --line: rgba(29, 41, 37, .13);
  --line-strong: rgba(29, 41, 37, .24);
  --canon: #286375;
  --canon-wash: #e3eef0;
  --verified: #3d7158;
  --verified-wash: #e6efe8;
  --exception: #a5533d;
  --exception-wash: #f3e8e3;
  --shadow-soft: 0 12px 28px rgba(25, 45, 38, .06);
  --shadow-card: 0 18px 36px rgba(25, 45, 38, .05);
}

/* Branch / Annals — Dark */
[data-env="branch"] {
  color-scheme: dark;
  --paper: #0b110f;
  --paper-alt: #101910;
  --panel: rgba(17, 25, 20, 0.9);
  --panel-elevated: rgba(23, 31, 26, 0.96);
  --panel-strong: rgba(30, 40, 33, 0.98);
  --line: rgba(200, 213, 197, 0.11);
  --line-strong: rgba(200, 213, 197, 0.18);
  --ink: #edf4ec;
  --muted: #aab8a7;
  --dim: #758175;
  --lime: #c8f292;
  --lime-strong: #dff7b2;
  --lime-wash: rgba(200, 242, 146, 0.11);
  --coral: #ea9d7b;
  --coral-wash: rgba(234, 157, 123, 0.1);
  --teal: #87c8c0;
  --teal-wash: rgba(135, 200, 192, 0.1);
  --amber: #d0b87d;
  --shadow-soft: 0 14px 28px rgba(6, 10, 8, 0.28);
  --shadow-card: 0 18px 40px rgba(6, 10, 8, 0.18);
}
```

---

## Module Navigation Mapping

| Environment | Rail Items (top→bottom) | Sidebar Sections |
|-------------|-------------------------|------------------|
| **Main** | Main Sequence, Canon Registry, Annals, The Roll, [Toggle Sidebar], Settings | Authoritative Record (Main Sequence), Canon/Registry (People, Assets, Relationships, Identity), Cross-Record Views (Annals, The Roll) |
| **Branch** | Branches, Annals, The Roll, Workbench, [Toggle Sidebar], Settings | Branch Explorer (list with glyphs), Canonical Origin, Quick Actions |

---

## Key Components to Implement

1. **WorkspaceShell** — root layout with env-aware tokens, responsive grid, splitters
2. **Topbar** — brand, workspace name, environment switch, search, queue action, avatar
3. **Rail** — icon-only module switcher with selection indicator
4. **Sidebar** — collapsible, context header, side-nav with counts, footer policy
5. **Main** — breadcrumbs, page head, content area (ledger/timeline/overview)
6. **Inspector** — collapsible drawer on mobile, record/branch details, actions
7. **Dock** — collapsible bottom panel spanning Main+Inspector, tabs for Inbox/Conflicts/Evidence/Integrity
8. **Statusbar** — environment indicator, head/branch status, layout state, demo labels
9. **MobileNav** — horizontal tab bar at ≤640px

---

## Visual Distinctions (Per Benchmark Analysis)

**Avoid (from workspace-benchmark-analysis.md):**
- Generic numbered sections (01/02/03) except for actual sequences
- Cream/paper + sage default palette
- Uniform card grids with border-radius
- Tracked ALL-CAPS eyebrows everywhere
- → appended to buttons
- Meta strings with middle dots

**Adopt:**
- Domain-specific rail glyphs (surveyor's transit, fracture mark, gate, seal, wax impression)
- Environment-owned palettes (no bleeding)
- Semantic state badges: DRAFT = wax seal, ACCEPTED = embossed, PROPOSED = dashed outline
- Metrics that drive decisions: "3 tenders awaiting capital", "1 Anchor sign-off pending"
- Real graph visualization or honest table (no decorative SVG)
- Progressive disclosure in forms
- Inspector = contextual actions + evidence gaps + navigable relations + gate status

---

## Implementation Plan

1. **Tokens** — Add unified token system to `src/styles.css` with `[data-env]` selectors
2. **WorkspaceShell.tsx** — Replace `WorkspaceLayout.tsx` with full shell component
3. **Topbar.tsx** — Environment switch, search, queue action
4. **Rail.tsx** — Icon navigation with selection state
5. **Sidebar.tsx** — Collapsible, context-aware, responsive
6. **Inspector.tsx** — Collapsible, drawer on mobile
7. **Dock.tsx** — Bottom panel with tabs
8. **Statusbar.tsx** — Environment status, layout state
9. **MobileNav.tsx** — Horizontal tabs at ≤640px
10. **Splitters** — Resizable panes with keyboard support
11. **Integration** — Update all workspace pages to use new shell
12. **Verify** — Run tests, build, manual browser check

---

## Acceptance Criteria

- [ ] Both environments render correctly with distinct visual languages
- [ ] Environment switch in topbar toggles `[data-env]` on root
- [ ] Rail navigation switches modules within environment
- [ ] Sidebar/Inspector/Dock collapse/expand with splitters
- [ ] Responsive behavior at 1180px, 900px, 640px breakpoints
- [ ] Keyboard accessible (Tab, Arrow keys on splitters, Escape to close drawers)
- [ ] All existing workspace pages work within new shell
- [ ] `npm run build` succeeds, `npm run test:unit -- --run` passes
- [ ] Browser-local demo boundary explicit in statusbar
