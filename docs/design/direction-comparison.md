# APT-LABS — Design Direction Comparison (Condition 5)

**Status:** Specification. Three light-mode design directions rendered as
production HTML using APT's structural emergence tokens (warm ivory base,
earthy neutrals, serif record names, sans/mono interface). Rendered and
validated in a real browser at 1440px.

**Constraint honored:** None of the three reproduces Linear's black
precision, Palantir's enterprise gray, or Airtable's consumer pastel.
None is a generic SaaS dashboard. All three share the same shell contract
(charter B3), page-head hierarchy (charter B6), and evidence standing as
a named state (never a score).

---

## Shared foundation (all three directions)

| Element | Specification |
|---------|---------------|
| Shell | Six regions (topbar, rail, sidebar, main, inspector, dock) + separate statusbar |
| Base | Warm ivory (`#faf8f2` / `#f7f5f0` / `#fafaf9`), never pure white |
| Text | Deep ink/forest on ivory; editorial serif for record names; mono for IDs/counts |
| Standing | Named-state ladder chips (unassessed→reported→supported→verified→disputed→rejected→expired), never a score |
| Accents | Direction-specific: forest (#2e4a3a), forest+violet (#4a6b5a/#7d8f9a), sage (#7d8f78) |
| Responsive | 1440 / 1024 / 768 / 390px (rail hides, inspector becomes bottom sheet, topbar hides context) |
| Artifacts | `direction-1-ledger.html`, `direction-2-floor.html`, `direction-3-desk.html` |

---

## Direction 1 — The Ledger (evidence & proof first)

**File:** `direction-1-ledger.html`
**Best for:** Auditors, verification officers, institutional stewards.

### Organizing metaphor
Evidence standing and provenance are the first-class material. The page leads with the evidence standing ladder; the coordination chain and typed relationships are secondary sections below.

### Key characteristics
- **Card list mode** — dense but scannable records with type chips, stats, and "Open" actions.
- **Vertical standing ladder** — seven named-state chips with the active state highlighted in forest.
- **Chain as vertical list** — Intention → Commitment → Outcome, each a live step.
- **Relationships as a vertical list** — kind → target pairs under the chain.
- **Palette:** Warm ivory `#faf8f2`, deep ink `#1a1f1a`, deep forest `#2e4a3a`, sage `#7d8f78`.

### Readability
High. Serif record names give institutional gravity; the standing ladder is unmissable; metrics (open/committed/delivered) sit at the top per B6 L3 rules (max 3, first in teal/forest).

### Information density
Medium-high. Cards show type, institution, location, date, deliverables, evidence count, and action in one row.

### Visual distinction
The forest accent + serif record names make it feel institutional but warm — distinct from Linear's near-monochrome black and Foundry's enterprise gray.

### Accessibility
All text tokens pass WCAG AA (per `docs/design/contrast-results.json`). Standing chips use color + text (not color alone). Focus-visible states on buttons.

### Long-session usability
Good for verification-heavy work; the standing ladder keeps the user oriented on what's substantiated and what's disputed.

---

## Direction 2 — The Floor (relation/ontology first)

**File:** `direction-2-floor.html`
**Best for:** Sociologists, developers auditing government software, system thinkers.

### Organizing metaphor
The relationship graph is the default canvas. Selecting any node opens the inspector with that entity's typed relationships, standing, and cycle position.

### Key characteristics
- **Graph as default canvas** — SVG force-directed rendering of INTENTION → COMMITMENT → OUTCOME → EVIDENCE with typed edges (COMMITTED_TO, FULFILLS, SUPPORTED_BY).
- **Horizontal flow rail** — productive-reality cycle stages as a horizontal chain with gate authority markers.
- **Inspector panel** — entity meta + typed relationships, opens on node selection.
- **Palette:** Warm paper `#f7f5f0`, forest-ink `#242b21`, forest `#4a6b5a`, muted violet `#7d8f9a` for relationship edges.

### Readability
Medium-high. The graph makes relationships immediately legible; the legend explains node/edge semantics. The flow rail shows cycle position at a glance.

### Information density
High on relationships (the graph shows the whole journey at once), lower on record detail (delegated to the inspector on selection).

### Visual distinction
Most distinct of the three — a graph canvas as the default view is unusual for operational tools and directly expresses APT's ontology (relationships are first-class, versioned records, not bare foreign keys).

### Accessibility
Graph nodes have labels; edges have kind labels; color is supplemented by position and labels. Not fully keyboard-navigable in this static render (would need node focus management in the Angular implementation).

### Long-session usability
Excellent for relationship-heavy work (auditing, sociology, system design); less suited to high-volume transaction processing.

---

## Direction 3 — The Desk (workflow/action first)

**File:** `direction-3-desk.html`
**Best for:** Coordinators, crew leads, institution administrators running real work cycles.

### Organizing metaphor
The workbench desk: high-density operational view with cycle progress, dense tables, and contextual actions on every row.

### Key characteristics
- **Dense table** — undertakings as table rows with institution, status, deliverables, evidence, and contextual actions (Open/Verify) per row.
- **Compact standing chips** — smaller chips for high-density contexts.
- **Compact chain** — vertical chain with minimal vertical footprint.
- **Palette:** Near-white `#fafaf9`, near-black `#111827`, sage `#7d8f78`, sage-dark `#5c6b5e`.

### Readability
High for tabular data; the table headers (mono, uppercase) and status chips (color + text) make scanning fast.

### Information density
Highest of the three — the table shows six columns per row with actions inline.

### Visual distinction
Clean and operational without being a generic SaaS dashboard: sage accents instead of blue, serif record names, no glassmorphism, no decorative shadows.

### Accessibility
Table structure with proper th/td; status chips use color + text; buttons have focus states.

### Long-session usability
Excellent for high-volume coordination work; the dense table minimizes scrolling and clicking.

---

## Comparison summary

| Criterion | Direction 1: The Ledger | Direction 2: The Floor | Direction 3: The Desk |
|-----------|------------------------|------------------------|----------------------|
| Primary user | Auditor / verification officer | Sociologist / system thinker | Coordinator / crew lead |
| Default canvas | Card list | Relationship graph | Dense table |
| Relationship visibility | Secondary (list below chain) | Primary (graph is the view) | Secondary (inspector on selection) |
| Evidence prominence | Highest (standing ladder leads) | High (node in graph) | Medium (compact chips) |
| Cycle visibility | Vertical chain | Horizontal flow rail | Compact vertical chain |
| Information density | Medium-high | High (relationships) | Highest (table) |
| Best long-session fit | Verification work | Auditing / system design | High-volume coordination |

---

## Recommendation

**No single direction is selected yet.** The three directions address different user jobs within the same ontology. The recommended path forward:

1. **User-test all three** with representative actors (coordinator, auditor, sociologist) before locking a direction.
2. **Consider a hybrid:** Direction 3's dense table for the workbench home + Direction 2's graph as an alternate lens per module (density toggle, per the improvement plan).
3. **Lock the shell contract first** (already implemented), then apply the chosen direction as a theme overlay — the six regions, page-head hierarchy, and standing ladder are invariant across all three.

**Evidence label:** VERIFIED — all three directions rendered in real browser at 1440px with zero page errors; console errors limited to pre-existing missing landing image assets (not app failures).
