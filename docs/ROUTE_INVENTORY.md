# APT-LABS — Route Inventory

**Purpose:** Complete inventory of all application routes, their components, modules, parameters, and preservation status. Produced as mandated reconnaissance (§2) before the Preact→Vue migration.

**Source of truth:** `src/App.tsx` (wouter `Switch`/`Route`), cross-referenced with `AGENTS.md` and `docs/architecture.md`.

**Status:** Current repository HEAD (master). Generated 2026-11-19.

---

## 1. Route table

| # | Route | Component | Module | Params | Auth required | Preservation notes |
|---|-------|-----------|--------|--------|---------------|-------------------|
| 1 | `/` | Landing | Public | — | No | Landing page; entry point |
| 2 | `/sign-in` | Auth | Auth | — | No | Sign in; demo mode + Supabase |
| 3 | `/sign-up` | Auth | Auth | — | No | Sign up; demo mode + Supabase |
| 4 | `/workspace/workbench/:pilot` | WorkbenchApp | Workbench | `:pilot` (benbenos\|kemetos\|minihydro\|mwea-animation-box\|open) | No (demo) | Pilot-specific workbench page; shared shell |
| 5 | `/workspace/workbench` | WorkbenchApp | Workbench | — | No (demo) | Workbench home; pilot lanes |
| 6 | `/workspace/kemetos1` | Kemetos1App | Kemetos1 | — | No (demo) | Coordinator layer; NOT one of the 5 core modules |
| 7 | `/workspace` | WorkspaceOverview | Home | — | No (demo) | Personal shell context; module selection |
| 8 | `/workspace/commons` | Commons | Commons | — | No (demo) | Field signals, proposals, stewards |
| 9 | `/workspace/network` | Network | Network | — | No (demo) | People, entities, relationships |
| 10 | `/workspace/network/people` | People | Network | — | No (demo) | People directory |
| 11 | `/workspace/network/institutions` | Institutions | Network | — | No (demo) | Institution directory |
| 12 | `/workspace/network/capabilities` | Network | Network | — | No (demo) | Capabilities view (shares Network component) |
| 13 | `/workspace/records` | Records | Records | — | No (demo) | Canon / Annals / Roll entry lens |
| 14 | `/workspace/records/canon` | Records | Records | — | No (demo) | Canon lens |
| 15 | `/workspace/records/annals` | Records | Records | — | No (demo) | Annals lens |
| 16 | `/workspace/records/roll` | Records | Records | — | No (demo) | Roll lens; hash-anchored entries |
| 17 | `/workspace/intelligence` | IntelligenceApp | Intelligence | — | No (demo) | Agents, matching, forecasting, analytics |
| 18 | `/workspace/intelligence/coin-lab` | AptCoinLab | Intelligence | — | No (demo) | APT Coin Lab (static page) |
| 19 | `/benben-os` | BenbenOS (lazy) | — | — | No (demo) | Separate school-management prototype; NOT an APT-LABS module |
| 20 | `/design-lab` | DesignLab | — | — | No (demo) | Design sandbox |

Total: 20 routes across 19 path patterns (`/workspace/network/capabilities` shares the `Network` component with `/workspace/network`).

## 2. Module grouping

| Module | Routes | Description |
|--------|--------|-------------|
| Public | `/` | Landing |
| Auth | `/sign-in`, `/sign-up` | Sign in / sign up |
| Home | `/workspace` | Personal shell context; module selection |
| Commons | `/workspace/commons` | Discover needs, offers, resources, opportunities |
| Network | `/workspace/network`, `/workspace/network/people`, `/workspace/network/institutions`, `/workspace/network/capabilities` | People, crews, institutions, assets, capabilities |
| Workbench | `/workspace/workbench`, `/workspace/workbench/:pilot` | Scope, assemble, coordinate productive work |
| Records | `/workspace/records`, `/workspace/records/canon`, `/workspace/records/annals`, `/workspace/records/roll` | Canon, Annals, Roll lenses |
| Intelligence | `/workspace/intelligence`, `/workspace/intelligence/coin-lab` | Agents, matching, forecasting, analytics |
| (external) | `/benben-os` | BenbenOS prototype — not an APT-LABS module |
| (sandbox) | `/design-lab` | DesignLab sandbox |

Six-module navigation scope (charter B1): Home + Commons, Network, Workbench, Records, Intelligence. School Console is nested under Workbench, not a primary module.

## 3. Shell and layout

All `/workspace/*` routes render inside `WorkspaceShell` (`src/components/WorkspaceShell.tsx`), which provides:

- `StudioNavigation` rail (module switching)
- Main work surface (`studio-content`)
- Optional `RecordInspector` (opens on record selection)
- Optional `ChangeSetDock` (per-module change-set / evidence queue)
- `field-studio-statusbar` footer with module label + environment label (Local demo / Configured)
- Skin toggle (light \| observatory), persisted to `localStorage` key `studioSkin`
- Sidebar collapse toggle, persisted to `localStorage` key `studioSidebarCollapsed`

`WorkbenchApp` (`src/modules/workbench/App.tsx`) wraps pilot pages in `WorkspaceLayout(currentContext="workbench")` with a wouter `Switch` for `/workspace/workbench/:pilot` → Pilot and `/workspace/workbench` → Workbench.

## 4. Page-head hierarchy (charter B6)

Pattern used across workspace pages: eyebrow (module/context, mono 8px) → h1 (record/page name, serif) → subtitle (one sentence, operational) → primary action → quiet actions → L3 metrics (only when they drive the current decision, max 3, 2px left border, first in teal).

Example: `src/modules/workbench/pages/Home.tsx` uses `PageHead` with eyebrow="APT-LABS / Workbench", illustrative metrics (publishedLanes, totalCapital in KES, activeCount), pilot lanes with illustrative/published status.

## 5. Preservation implications for migration

Every route listed above must continue to exist after the Preact→Vue migration (mandate §5), with the same path and same functional behavior. The migration must not remove or merge routes unless a superseding decision explicitly authorizes it. In particular:

- `/workspace/workbench/:pilot` and `/workspace/workbench` share `WorkbenchApp` — pilot-specific and home views must both be preserved.
- `/workspace/records/{canon,annals,roll}` are lenses within one Records module (charter B7), not independent modules — preserve as three routes under one module.
- `/benben-os` is explicitly NOT an APT-LABS module — preserve as-is (lazy-loaded, separate prototype).
- `/design-lab` is a design sandbox — preserve as-is.
- `/workspace/kemetos1` is the Kemetos1 coordinator layer — not one of the 5 core modules — preserve as-is.

## 6. Routing library decision

Current: Wouter (v3.3.5), framework-agnostic, works with Preact. The mandate §5 stacks Vue 3 + Vite + Vue Router or Wouter. The route inventory above is framework-agnostic; the migration ADR will decide whether to keep Wouter or switch to Vue Router, but all 20 routes must survive either choice.
