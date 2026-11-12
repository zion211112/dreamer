# APT-LABS — Accepted Architectural Decisions (ADRs)

All decisions below are from `docs/design/charter.md` Layer B (mutable product and design decisions, dated 2026-11-10 / 2026-11-11). They are revisable, not eternal principles.

## B1 — Five-module navigation scope (Active, 2026-11-10)

One workspace, one shared graph, five distinct user jobs: Commons, Network, Workbench, Records, Intelligence. School Console remains a nested operational boundary under Workbench, not a primary module. No sixth primary module unless a genuinely independent user job cannot fit into the five.

**Routes:** `/workspace/commons` | `/workspace/network/{people,institutions,capabilities}` | `/workspace/workbench`, `/workspace/workbench/:pilot` | `/workspace/records/{canon,annals,roll}` | `/workspace/intelligence`

Supersedes charter §4 "Hard navigation constraints."

## B2 — No Main/Branch workspace modes (Active, 2026-11-10)

A branch is a change-set or proposed state, not a separate workspace. No Main/Branch workspace modes. The fork glyph (└─) may remain as an identity element in proposed-state contexts only.

Supersedes user ruling #1 on v1 memo (2026-11-05).

## B3 — Shell pane ownership (Active, 2026-11-10)

Each shell pane has one job; no duplicate navigation systems.

| Pane | Job |
|------|-----|
| Topbar | Working-context identity |
| Rail | Module switching (exactly five icons) |
| Sidebar | Within-module context only |
| Main | Work surface |
| Inspector | Contextual, opens on selection |
| Dock | Contextual per-module change-set / evidence strip |
| Statusbar | Single boundary line + ledger head state |

Supersedes fixed panel and shell assumptions from prior direction memos.

## B4 — Visual design direction: Structural Emergence (Active, 2026-11-11)

Active design language: **Structural Emergence** — warm ivory base, earthy neutrals, restrained sage, deep forest/ink, selective lilac/peach accents. Editorial serif for record names; precise operational sans/mono for interface and readouts.

**Six emergence operations:** Indeterminacy, Differentiation, Polarity, Recursion, Identity, Emergence.

**Hard anti-patterns (no exception):** generic SaaS dashboards, endless card grids, decorative gradients/glows, unnecessary glassmorphism, arbitrary rounded corners, fake spatial depth, unexplained visual metaphors, excessive animation, decorative graphs without operational meaning, beautiful screens with incomplete functionality.

Supersedes prior B4 "Signature Dark Instrument" (2026-11-10); Light Luxury default in APT-LABS-SYSTEM.md §7.

## B5 — Anti-slop converted to design tests (Active, 2026-11-10)

Do not ban a component merely because it can be misused. Do not use it without a clear semantic or interaction purpose. Former anti-slop items are converted into design tests: each pattern must achieve a clear semantic or interaction purpose, communicate meaning rather than decorate, and pass WCAG AA.

Dependencies: B4. Supersedes charter §8 "Anti-slop rules."

## B6 — Page-head hierarchy (Active, 2026-11-10)

Pattern: eyebrow (module/context, mono 8px) → h1 (record/page name, serif) → subtitle (one sentence, operational) → primary action → quiet actions → L3 metrics (only when they drive the current decision, max 3, 2px left border, first in teal).

Supersedes fixed four-metric header ritual from prior direction memos.

## B7 — Canon, Annals, Roll as Records lenses (Active, 2026-11-10)

Canon, Annals and Roll are conceptually distinct lenses within the Records module, not independent navigation modules.

| Lens | What it answers |
|------|----------------|
| Canon | What is structurally recorded: entities, identities, typed relationships, accepted state |
| Annals | What happened over time: chronological events, changes, decisions, transitions |
| Roll | Why a claim can be substantiated: evidence, provenance, attestations, verification |

Supersedes separate Annals/Roll/Canon page assumptions from prior direction memos.

## B8 — Build and test gates (Active, 2026-11-10)

`npm run build` (tsc + vite build) and `npm run test:unit -- --run` must be green before starting the next phase. Small, reversible changes preferred over broad rewrites.
