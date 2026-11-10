# APT-LABS — Workspace Direction v2 (SUPERSEDED)

**This document is superseded.** Superseded by the APT-LABS Constitution refoundation (`docs/design/charter.md`, 2026-11-10). The design direction it describes (dark signature as default, dark palette in `:root`) was replaced by the **Light Luxury** default implemented in `src/tokens.css` (light mode is `:root` default, dark moved to `[data-skin="dark"]`).

The Signature Dark Instrument direction from this document is now carried as a mutable product and design decision (Decision B4) in the charter, with implementation requiring separate authorization. See `docs/APT-LABS-SYSTEM.md` for the current consolidated system reference.

This document is historical reference only; it does not define current authority.

---

## 1. VERDICT ON THE V1 MEMO

The v1 "Signature Dark Instrument" memo (approved 8/10 direction, 9/10 potential) correctly identified the visual language and token system but over-engineered the shell into competing navigation systems and forced identical headers across asymmetric jobs. The four user rulings supersede its dual-environment model, Main/Branch switcher, six-module rail, and four-metric ritual. The v2 direction collapses seven current labels into five charter modules, retires the environment switcher, makes every shell pane single-job, replaces the metric ritual with an information-driven hierarchy, and treats the palette as a perceptual instrument for the real identity: economic records, temporal continuity, evidence, relationships, and operational precision. **Score: 8/10** — strong foundation, corrected by rulings.

---

## 2. COMPREHENSION MAP

| Layer | Statement | Tag |
|-------|-----------|-----|
| **Problem** | APT-LABS makes fragmented African productive capacity visible, connectable, governable, locally retained, and cumulative. | VERIFIED |
| **Core progression** | Reality → structured records → relationships → coordinated work → verified outcomes → reusable intelligence → economic value. | VERIFIED (charter §2) |
| **Canonical entities** | Person, Crew, Asset, Work, Institution, Evidence — never silently equated (12 distinctions). | VERIFIED (charter §3) |
| **Five modules** | Commons, Network, Workbench, Records, Intelligence — one workspace, one shared graph, one permission model. | VERIFIED (charter §4) |
| **Navigation constraints** | No Main/Branch, no sixth module, no duplicate nav, no workspace-within-workspace without operational boundary. | VERIFIED (charter §4) |
| **Three lenses** | Canon (structural), Annals (temporal), Roll (evidential) — conceptually distinct, navigable together. | VERIFIED (charter §5) |
| **Trust model** | Evidence before badges; no universal reputation score; issuer accountability, provenance, consent, dispute, revocation, portability, privacy. | VERIFIED (charter §6) |
| **Economic flow** | Need → discovery → capability matching → work definition → review → authorization → execution → evidence → acceptance → settlement → learning. Stages distinct; authority visible at each. | VERIFIED (charter §7) |
| **Design system** | Dark signature (#0A0F0C base); bone/moss/teal/lime/coral/amber semantic accents; Georgia/Inter/JetBrains Mono tiers; surveyor grid, fork glyph, ringed evidence markers, 24px lines. | PROPOSED (v1 memo + charter §8) |
| **Current routes** | 13 routes including /workspace/{commons,people,institutions,institutions/network,institutions/school-console,workbench,workbench/simulate,field-desk,roll,annals,apt-coin-lab}. | VERIFIED (repo-facts) |
| **Current shell** | WorkspaceShell.tsx (untracked, ~280 lines): StudioNavigation (topbar+rail+sidebar) → main → conditional inspector (only roll/apt-coin-lab) → static dock tabs (Source/Related/History + link tray) → static statusbar. No splitters, no record inspector, no change-set dock. | VERIFIED |
| **Current tokens** | Light-first "field atlas" (--paper #f5f3ee, --ink #1a1d18, --brand-main #295d70, --brand-branch #c6d68e, .dark override). No [data-env], no dark signature palette. --info-bg defect (referenced undefined). | VERIFIED |
| **Domain data** | people-network.ts: 31 entities, 34 relationships (17 kinds), recordBasis {illustrative,local-profile,project-reported}. workbench-simulation: 6-stage pipeline, RollPreview with hash_anchor. roll.ts: RollEntry (evidence layers, acceptance, hash_anchor). network.ts: Supabase-backed, empty in demo. | VERIFIED |
| **Absences** | No Intelligence module (AptCoinLab static). No unified event stream. No graph explorer (NetworkMap is People-specific). No splitters, fork glyph, surveyor grid in src. Prototype.tsx empty. | VERIFIED |
| **Build discipline** | Vite+Preact+Wouter+vitest; AGENTS.md: one small change, npm run build gate, no new deps, no Next.js/backend. Auth is browser-local demo (localStorage). | VERIFIED |

---

## 3. THE DIRECTION

### 3.1 Five-Module IA & Naming Migration

| Current Label | Current Route(s) | New Module | New Route(s) | StudioContext |
|---|---|---|---|---|
| Radar | /workspace/commons | **Commons** | /workspace/commons | `commons` |
| Network (People/Institutions/Capabilities) | /workspace/people, /workspace/institutions, /workspace/institutions/network | **Network** | /workspace/network/{people,institutions,capabilities} | `network:people` \| `network:institutions` \| `network:capabilities` |
| Undertakings | /workspace/workbench, /workspace/workbench/simulate, /workspace/field-desk | **Workbench** | /workspace/workbench/{field-desk} | `workbench` \| `workbench:field-desk` |
| Roll | /workspace/roll | **Records** (Roll lens) | /workspace/records/roll | `records:roll` |
| Annals | /workspace/annals | **Records** (Annals lens) | /workspace/records/annals | `records:annals` |
| — (new) | — | **Records** (Canon lens) | /workspace/records/canon | `records:canon` |
| APT Coin Lab | /workspace/apt-coin-lab | **Intelligence** (sub-view) | /workspace/intelligence/coin-lab | `intelligence:coin-lab` |
| School Console | /workspace/institutions/school-console | **Workbench** (nested boundary) | /workspace/workbench/school-console | `workbench:school-console` |

**Rail:** Exactly five module icons — Commons, Network, Workbench, Records, Intelligence.
**School Console** remains an operational boundary (local-first teaching workflow) entered from Workbench sidebar, not a primary module.
**Intelligence** has one sub-view (coin-lab) today; no UI until its user job exists (see §3.6).

### 3.2 Records Model: Canon / Annals / Roll as Three Lenses

**Shared foundation (not a single ledger service — three data sources):**
- **Canon** — entity registry from `people-network.ts` (31 entities, 34 typed relationships, `recordBasis` values) + `RollEntry.hash_anchor` for accepted state.
- **Annals** — chronological `WorkEvent[]` from `local-workflows.ts` (submitted→under_review→selected/declined) + `workbench-simulation.ts` (6 simulation stages). *No unified cross-module event stream exists yet — Annals lens ships as prototype with explicit gaps.*
- **Roll** — `RollEntry` (participants with `capability_claims[]` + `evidence_ids[]`; evidence layers public/participant/restricted; acceptance block; `hash_anchor` via canonical JSON + `computeHashAnchor`; `RollRevision` with previous/new hash). **Most complete data model — ships first.**

**Lens navigation:** Inline segmented control in Records module content area (not page-head fixture). Deep links: `/workspace/records?lens=canon|annals|roll`.

**Changeset state machine** (per record/proposal, derived from simulation stages + workflow states + Roll acceptance):
```
draft → proposed → in_review → pending_authorization → authorized → in_execution → pending_acceptance → accepted → (amended | rejected | cancelled)
```
**Fork glyph** (└─) attaches at `proposed` as identity mark for the proposed change-set — never in shell chrome, never as environment switcher (user ruling #1).

**Never-equate distinctions kept visible** in state labels and evidence presentation:
- Claim ≠ Evidence (evidence layers in Roll)
- Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement (state machine)
- Person ≠ Asset (entity type in Canon)
- AI suggestion ≠ institutional decision (authority field in WorkEvent)

### 3.3 Shell Ownership Rules — One Job Per Pane

| Pane | One Job | What Gets Deleted |
|---|---|---|
| **Topbar** | Working-context identity: brand, active module breadcrumb, global search (Ctrl+K), user avatar. | Environment switcher, workspace-within-workspace, queue badge, module label duplication. |
| **Rail** | Module switching: exactly five icons (Commons, Network, Workbench, Records, Intelligence). | Annals, APT Coin Lab, School Console as rail items; secondary module list. |
| **Sidebar** | Within-module context only: filtered views, scoped navigation, local filters. Collapses to 0 on mobile. | Cross-module link tray (duplicates rail); contextDestinations that mirror module switching. |
| **Main** | Work surface: page head (hierarchy, not ritual) + hero surface per module. | Fixed four-metric header; page-specific kicker/eyebrow drift. |
| **Inspector** | **Contextual** record/detail primitive — opens on selection, closes on deselect. Shows relationships, evidence gaps, context actions, gate status for the selected entity. Only mounts for modules with record-level inspection (Records, Intelligence, Workbench during simulation). | Static per-module text panels (`contextDetails` object); `moduleOwnsInspector` logic; inspector shown only for roll/apt-coin-lab. |
| **Dock** | **Contextual** per-module live change-set / evidence strip — shows pending commits, evidence gaps, reconciliation queue for the active module. Only mounts when a change-set exists. | Static three-tab link tray (Source/Related modules/History + ↗ tray duplicating rail). |
| **Statusbar** | Single boundary line + ledger head state (canonical head, pending count, sync status). | Static "APT-LABS / {module} · BROWSER-LOCAL WORKSPACE DEMO · No shared workspace service connected". |

**Responsive:** Sidebar/dock collapse persist to localStorage. On mobile, rail becomes bottom tab bar; sidebar/dock are sheets.

### 3.4 Visual System

**Token mapping (current → v2):**

| Current (light-first) | v2 Dark Signature (default, :root) | v2 Light Variant ([data-skin=light]) |
|---|---|---|
| --paper #f5f3ee | --bg #0A0F0C (green-black) | --bg #EEF1ED (paper) |
| --ink #1a1d18 | --fg #E9F1E8 (bone, 16.8:1) | --fg #1D2925 (ink) |
| --terrain #5d7a5c | --muted #8FA08C (moss, 7.0:1) | --muted #5C6B5E |
| — | --dim #5C6B5E (dim, 3.4:1 decorative-only) | — |
| --brand-main #295d70 | --state-canon #7FC5BC (teal, 9.8:1) | --state-canon #286375 |
| --brand-branch #c6d68e | --state-proposed #C9F292 (lime, 15.3:1) | --state-proposed #3D7158 |
| --danger #a84632 | --state-risk #E89670 (coral, 8.3:1) | --state-risk #A5533D |
| --brass #b8955a | --state-caution #CBAF6E (amber, 9.1:1) | --state-caution #B8955A |
| --water #3a6b8c | --water-pale (defined, fixes --info-bg) | --water-pale |
| .dark class override | **Retired** — replaced by [data-skin] on <html> | **Retired** |

**Skin approach:** Dark is default (:root). Light is explicit variant via `[data-skin="light"]` on `<html>` (JS toggle). No `.dark` class, no `[data-env]`. Landing/Auth pages use semantic tokens (--fg, --muted, --state-*) so they work in both skins without modification.

**Semantic alias table** (replaces ok/warn/info/danger):
- `canonical` / `verified` / `accepted` → --state-canon (teal)
- `proposed` / `draft` / `active` → --state-proposed (lime)
- `risk` / `exception` / `unresolved` / `amendment` → --state-risk (coral)
- `caution` / `gap` / `attention` → --state-caution (amber)

**Type tiers (enforced):**
1. **Record serif** — Georgia: page/record names (L1), inspector titles, entity names.
2. **System sans** — Inter: all interface text, body copy, buttons, labels.
3. **Instrument mono** — JetBrains Mono: IDs, timestamps, counts, state labels, L2 readout, L3 metric values.
4. **Uppercase mono (8px, 0.12em tracking)** — ONLY for informational pane headers (rail tooltips, sidebar section labels, dock tab labels, statusbar). **Never** for content, buttons, page head, metric labels, or decorative eyebrows.

**Signature devices — KEEP:**
- Surveyor grid (24px = 3×8px baseline) as subtle background on work surfaces.
- Fork glyph (└─) as visual identity element in proposed-state contexts (Records revision lineage, Workbench simulation fork, Network relationship hypothesis).
- Ringed evidence markers (● with ring) on events/records.
- 24px survey lines as structural rhythm (2px left border on L3 metrics).
- Glassmorphic topbar (backdrop-filter blur) — only glass effect.

**Signature devices — CUT:**
- Gradients as primary background fills.
- All-caps micro-labels / decorative eyebrows.
- Motion not responding to user action (no auto-play, hover ripples).
- Generic AI dashboard layouts.
- Repeated rounded-card kits.
- Excessive glass beyond topbar.
- Decorative metrics with no operational meaning.
- Fake functionality / invented data presented as real.
- Demo disclaimer theater (repeated "BROWSER-LOCAL DEMO" banners).

**Contrast facts (WCAG AA on #0A0F0C):**
- bone #E9F1E8: 16.8:1 ✓ (primary text)
- teal #7FC5BC: 9.8:1 ✓ (canonical/verified)
- lime #C9F292: 15.3:1 ✓ (proposed/active)
- amber #CBAF6E: 9.1:1 ✓ (caution/gap)
- coral #E89670: 8.3:1 ✓ (risk/exception)
- moss #8FA08C: 7.0:1 ✓ (secondary)
- dim #5C6B5E: 3.4:1 — **decorative-only** (passes AA only for large text ≥18pt/14pt bold; never body copy)

**Defect fix:** `--info-bg` (referenced undefined at styles.css:39) → define `--water-pale` in both skins.

### 3.5 Page Head: L1 / L2 / L3 Hierarchy

**Pattern:** `eyebrow (module/context, mono 8px) → h1 (record/page name, serif) → subtitle (one sentence, operational, moss) → primary action (lime) → quiet action(s) → L3 metrics (only when they drive the current decision, max 3, 2px left border, first in teal).`

**Per-module examples:**

| Module | L1 | L2 (when facts exist) | L3 (decision-driving only) |
|---|---|---|---|
| **Commons** | Signals & decisions | 42 signals · 3 under review · HEAD R-017 | Review queue 3 (teal) · Evidence gaps 7 (amber) · Unresolved 2 (coral) |
| **Network** | People & crews | 128 entities · 246 relationships · HEAD N-042 | Verified 89 (teal) · Unverified claims 39 (amber) · Disputed 4 (coral) |
| **Workbench** | Undertakings | 12 active · 3 simulating · HEAD W-008 | Authorized 5 (teal) · Awaiting evidence 4 (amber) · Blocked 3 (coral) |
| **Records** | The Roll | 42 entries · 36 integrity-checked · HEAD M-042 | Complete 28 (teal) · Gaps 8 (amber) · Disputed 6 (coral) |
| **Intelligence** | Intelligence | Graph: 128 nodes · 246 edges · Last sync 04 NOV 16:42 | *(none — exploratory, no decision-driving metrics)* |

**Intelligence gets only L1+L2** — demonstrating "let information determine how much appears" (user ruling #3).

### 3.6 Hero Surfaces (One Per Module)

| Module | Hero Surface | Data Foundation |
|---|---|---|
| **Commons** | Spatial canvas over `EXAMPLE_FIELD_SIGNALS` + local drafts. Three panels: Signal map (geospatial schematic), Triage queue (SignalTriage: new→review→propose→authorize→archived, coral/amber/lime chips), Governance log (accepted proposals → Workbench). | ecosystem-examples.ts (2 illustrative signals), localStorage drafts. |
| **Network** | Force-directed graph explorer over PEOPLE_NETWORK (31 entities, 34 relationships, 17 kinds, 6 entity types). Entity-type colors: Person=teal, Crew=lime, Asset=amber, Institution=coral, Work=mono, Evidence=dim. Relationship-kind filters, search+focus+detail inspector, "evidence as of" time scrubber (requires Annals event stream — **precondition**, not yet built). | people-network.ts, NetworkMap.tsx (extend from column layout). |
| **Workbench** | Block-flow simulation builder unifying WorkbenchFinder + FieldDesk. 6-stage pipeline (tender-review→assembly→delivery→acceptance→deployment→roll-preview) with stage gates (blocked/proceed), version badge (sim-ID + hash anchor from RollPreview), drag predefined blocks (derived from SimulationPlan: PackageBlock, EvidenceGate, AcceptanceGate, DeploymentGate), zoom/pan canvas. | workbench-simulation.ts (6 stages, RollPreview), local-workflows.ts (application states). |
| **Records** | Three-lens ledger at `/workspace/records/{canon,annals,roll}` with cross-lens navigation. Canon: entity registry with hash-anchored state. Annals: chronological event stream with evidence links (prototype — gaps labeled). Roll: RollEntry list with acceptance blocks, hash anchors, revisions. Time-axis scrubs all three lenses together. | db/roll.ts (RollEntry, RollRevision), people-network.ts, local-workbench.ts (WorkEvent). |
| **Intelligence** | **Declared placeholder** — NO interactive UI. Page states: *User job that must exist first:* "An institution needs to allocate a budget across crews with verified capability matches, and wants a ranked shortlist with evidence trails and conflict-of-interest flags." *Preconditions (all must be met):* (1) unified cross-module event stream, (2) authority model for matching/forecasting, (3) matching engine with evidence trails, (4) forecasting baseline, (5) graph analysis capability. *Conceptual sub-jobs today (no UI):* matching (capability→work), forecasting (pipeline→capacity), graph analysis (network→structural gaps). | Charter §4, §7. AptCoinLab static research page becomes sub-view at `/workspace/intelligence/coin-lab`. |

### 3.7 Do-Not-Build List

- [Main \| Branch] environment switcher (retired per user ruling #1).
- Sixth primary module (Intelligence UI before its user job exists + preconditions met).
- Duplicate navigation in dock tabs (Source/Related/History → replaced by contextual change-set/evidence per module).
- Identical four-metric page heads on every page (replaced by hierarchy).
- Demo disclaimer theater (repeated "BROWSER-LOCAL DEMO" banners in chrome).
- Fake functionality: simulated merges, fake commits, invented data shown as real.
- School Console as primary module (remains nested operational boundary under Workbench).
- APT Coin Lab as primary module (becomes Intelligence sub-view).
- Radar/Undertakings/Roll/Annals as independent module labels (reconciled to five).
- Separate Annals page (merges into Records as Annals lens).
- Separate Roll page (merges into Records as Roll lens).
- Separate Canon page (new lens within Records).
- Light-first token system as default (inverted to dark signature default).
- Gradient washes, card kits, excessive glass, decorative eyebrows, arbitrary micro-labels, generic AI dashboard layouts, unnecessary animation, motion without user action.
- Intelligence sub-routes (/matching, /forecasting, /graph-analysis) until preconditions met.

---

## 4. BUILD ORDER (S0…S10)

Each step: one small reviewable change, `npm run build` gate, browser verification, depends only on earlier steps.

| Step | Name | Files Touched | Why | Verification Gate |
|---|---|---|---|---|
| **S0** | Docs reconciliation | `docs/superpowers/specs/2026-11-05-unified-workspace-shell-design.md` (mark superseded), `docs/design/charter.md` (append v2 ruling note) | Dual-environment spec is superseded by one-workspace ruling; record it. | `npm run build` passes; superseded marker present. |
| **S1** | Token audit & semantic aliases | `src/styles.css` (add semantic alias mapping table), token usage audit script | Map every `var(--)` usage to semantic aliases before flip; verify Auth/Landing use only semantic tokens. | Audit complete; no skin-specific tokens in Auth/Landing. |
| **S2** | Dark signature palette | `src/styles.css` (:root = dark palette, [data-skin=light] = light variant, define --water-pale, retire .dark) | Charter: dark is signature, light is variant. Fix --info-bg defect. | `npm run build`; sign-in/up render correctly in both skins; contrast script validates AA. |
| **S3** | PageHead component | `src/components/PageHead.tsx` (new), `src/styles.css` (L1/L2/L3 tokens) | Replace 5+ competing kicker/eyebrow patterns with single hierarchy primitive. | Component renders L1/L2/L3 slots with correct typography; `npm run build`. |
| **S4** | Route reconciliation | `src/App.tsx` (add 5 module routes + Records lenses, keep old routes as aliases), `src/lib/studio-navigation.ts` (update STUDIO_FLOW_MODULES to 5, contextDestinations) | Five canonical routes; old routes coexist with deprecation. No redirect dependency (wouter has none). | All 5 module routes load; old routes still work; rail shows 5 icons. |
| **S5** | Shell layout tokens & rail | `src/styles.css` (shell grid tokens), `src/components/StudioNavigation.tsx` (rail = 5 modules only) | Establish shell geometry; remove secondary modules from rail. | Rail has exactly 5 items; collapse persists; `npm run build`. |
| **S6** | Sidebar strict within-module | `src/components/StudioNavigation.tsx` (remove cross-module links from contextDestinations), `src/components/WorkspaceShell.tsx` | Sidebar must not duplicate rail's job. | Sidebar shows only within-module destinations; no cross-module links. |
| **S7** | Inspector & dock contextualization | `src/components/WorkspaceShell.tsx` (remove moduleOwnsInspector, make inspector/dock conditional on selection), `src/components/RecordInspector.tsx` (new primitive), `src/components/ChangeSetDock.tsx` (new) | Each pane one job; inspector/dock mount only when needed. | Inspector opens on record selection (simulated); dock shows change-set for active module; `npm run build`. |
| **S8** | Statusbar & boundary line | `src/components/WorkspaceShell.tsx` (replace static text with boundary + ledger head placeholder) | Real system state, not demo theater. | Statusbar shows boundary line + "BROWSER-LOCAL DEMO" (honest); ledger head placeholder for Roll. |
| **S9** | Records module + Roll lens | `src/pages/workspace/Records.tsx` (new), `src/pages/workspace/Records/*` (lens views), `src/lib/db/roll.ts` (reuse) | Most complete data model ships first. Three lenses with cross-navigation. | Roll lens renders with demo data; lens switcher works; cross-lens navigation; `npm run build`. |
| **S10** | Network module hero | `src/pages/workspace/Network.tsx` (new), `src/components/NetworkMap.tsx` (extend to force-directed, 6 entity types, kind filters) | Promote existing NetworkMap to module-level explorer. | Graph renders 6 entity types; kind filters work; search+legend; `npm run build`. |

**Remaining (post-v2 direction, authorized separately):**
- S11: Workbench block-flow builder (unify Finder + FieldDesk, drag canvas, stage gates).
- S12: Commons hero (signal map, triage queue, governance log).
- S13: Records Canon + Annals lenses (Annals blocked on unified event stream).
- S14: Intelligence placeholder page.
- S15: Global search (Ctrl+K), fork glyph component, ringed evidence markers, surveyor grid.

---

## 5. SIGN-OFF TESTS

**Per-step (objective, runnable):**
- S0: Superseded marker in 2026-11-05 spec; charter appendix updated.
- S1: Token audit CSV produced; zero skin-specific tokens in Auth/Landing.
- S2: `npm run build` exits 0; sign-in renders dark signature palette; contrast script outputs all AA ratios.
- S3: PageHead accepts L1/L2/L3 props; renders serif/mono correctly; no TypeScript errors.
- S4: 5 module routes + 3 Records lenses respond; old routes alias; studio-navigation labels match five modules.
- S5: Rail has exactly 5 icons; sidebar/dock collapse persists in localStorage; no console errors.
- S6: Sidebar shows zero cross-module links; Network sidebar shows only people/institutions/capabilities.
- S7: Inspector opens on selection (simulated) showing relationships/evidence gaps/actions/gates; dock renders change-set for active module; both conditional (hidden when no selection).
- S8: Statusbar shows boundary line + "BROWSER-LOCAL DEMO"; Roll shows head hash placeholder.
- S9: Records page shows three lenses; Roll lens displays 3 DEMO_ROLL_ENTRIES with hash_anchor, evidence layers, acceptance; time-axis scrubs; cross-lens nav works.
- S10: Network page renders force-directed graph with 6 entity colors; 17 kind filters; search+focus+inspector; legend pinned.

**Global coherence test:**
> Navigate all five modules in sequence → shell chrome consistent (rail 5, sidebar within-module, inspector/dock conditional, statusbar boundary); page heads follow hierarchy (eyebrow→h1→subtitle→action); metrics appear ONLY where they drive a decision; dark palette communicates state (teal=canonical, lime=proposed, coral=risk, amber=gap); zero demo disclaimer banners in chrome; no [Main\|Branch] switcher; no sixth module; fork glyph appears only in proposed-state contexts (Records revision, Workbench fork, Network hypothesis).

---

## 6. NEXT AUTHORIZED STEP

**S0: Docs reconciliation** — mark `docs/superpowers/specs/2026-11-05-unified-workspace-shell-design.md` as superseded with a banner referencing charter §12 user rulings; append the v2 ruling note to `docs/design/charter.md`; verify `npm run build` passes.

---

**Recommendation: APPROVE WITH CHANGES.** The v1 memo's visual language survives; its shell architecture, module map, and metric ritual are corrected by the four user rulings. The v2 direction is minimal, buildable in small steps, and grounded in the verified fact base.