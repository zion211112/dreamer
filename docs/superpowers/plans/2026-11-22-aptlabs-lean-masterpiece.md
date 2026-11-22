# APT-LABS Lean Masterpiece — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native — single session, autonomous since human partner is gone) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate APT-LABS from 9 modules to 5 lean modules, integrate the multi-model pipeline as the agent dock brain, and ship a $3B-quality landing page as final scope — users sign in and start building "the sovereign Africa."

**Architecture:** Vue 3 + Pinia + Vue Router + Vite 6.4.x + TypeScript 5.6 strict. WorkspaceShell owns the frame (topbar · 64px rail · 232px nav · fluid content · 360px agent dock). Each module fills only the content column. Multi-model Python pipeline (engine/multi_model_pipeline.py) runs as agent dock brain via Bifrost (8080) / FCC (8082 rollback). Subagent parallel for throughput.

**Tech Stack:** Vue 3 Composition API, Pinia, Vue Router, TypeScript 5.6, Vitest 5.x, SCSS/CSS tokens (apt-tokens.css), Python pipeline engine.

**Spec:** docs/superpowers/specs/2026-11-22-aptlabs-lean-masterpiece-design.md — the plan argues from the spec; executors read both.

## Global Constraints

- No universal reputation score (charter A8)
- No blockchain prerequisite for participation (charter A8)
- Person ≠ Asset ≠ Crew ≠ Institution ≠ Venture — never silently equated
- Claim ≠ Evidence — assertion bounded by subject/predicate/scope
- Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement — separately timed flows
- AI suggestion ≠ institutional decision
- Editorial serif for record names; precise sans/mono for interface
- No generic SaaS dashboards, endless card grids, decorative gradients/glows, glassmorphism, arbitrary rounded corners, fake spatial depth, unexplained visual metaphors, excessive animation
- `npm run build` = `tsc && vite build` must be green
- `npm run test:unit -- --run` (34 files, 318 tests) must be green
- `npx tsc --noEmit` clean
- No mock data — all pages driven by real src/lib/* modules via src/stores/network.ts

## Review Focus

1. **Agent dock toggle (⌘J/Esc)** — dock slides in from right; content column owns full pane by default; Escape closes dock
2. **Bifrost down / circuit-break** — pipeline falls back to FCC on 8082; no silent failure
3. **Preferred model bypass** — SubagentConnector's preferred_model always included, bypasses quality_tier filter
4. **Module rail active state** — [data-module] accent drives whole frame; search placeholder module-aware
5. **Landing → sign in → workspace conversion** — no dead ends, no chatty copy

---

### Task 1: Workspace Shell — frame rebuild

**Files:**
- Modify: `src/shell/WorkspaceShell.vue` — rebuild as lean container
- Create: `src/shell/ModuleRail.vue` — 64px vertical module rail
- Create: `src/shell/ModuleNav.vue` — 232px module nav
- Modify: `src/shell/AgentDock.vue` — pipeline integration, slide-in on ⌘J/Esc
- Modify: `src/modules/router.ts` — update routes for 5 modules, remove DesignLab/BenbenOS/Proof

**Interfaces:**
- Consumes: `moduleForPath(path)` from `./registry`, `WORKSPACE_MODULES` from `./registry`, `iconSvg` from `./icons`
- Produces: `ws-app` four-column grid, `ws-agent-toggle` button, `ws-topbar` with search and actions

- [ ] **Step 1: Rewrite WorkspaceShell.vue** — 64px rail | 232px nav | fluid content | 360px agent dock under 54px topbar. Agent dock slides in on ⌘J, Esc closes. `[data-module]` accent on root.
- [ ] **Step 2: Create ModuleRail.vue** — vertical module icons, active state styling, click navigates
- [ ] **Step 3: Create ModuleNav.vue** — within-module navigation, active item highlighting
- [ ] **Step 4: Integrate AgentDock with pipeline** — dock slides in on ⌘J/Esc, hosts MultiModelPipeline subagent connector
- [ ] **Step 5: Update router.ts** — 5 modules only, remove /design-lab, /benben-os, /workspace/value/coin-lab redirect, /workspace/intelligence/coin-lab redirect
- [ ] **Step 6: Run type check and build** — `npx tsc --noEmit` clean, `npm run build` green
- [ ] **Step 7: Commit** — `git commit -m "feat: lean workspace shell — 5 module frame, agent dock pipeline brain"`

---

### Task 2: Home / Overview module

**Files:**
- Modify: `src/pages/workspace/WorkspaceOverview.vue` — personal entry point

**Interfaces:**
- Consumes: actor data from `src/lib/actors.ts`, commitments from `src/lib/commitment-journey.ts`
- Produces: quick acts list, personal assignments, linked updates, module selection grid

- [ ] **Step 1: Write failing test** — overview renders module grid with 5 modules, quick acts empty state
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement WorkspaceOverview.vue** — personal entry: what this actor can do right now, quick acts, personal assignments, linked updates, module selection
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Run full test suite** — `npm run test:unit -- --run` green
- [ ] **Step 6: Commit**

---

### Task 3: Commons / Network module

**Files:**
- Modify: `src/pages/workspace/Commons.vue` — needs, offers, resources, opportunities
- Modify: `src/pages/workspace/Network.vue` — people, crews, institutions
- Modify: `src/pages/workspace/People.vue` — actor directory
- Modify: `src/pages/workspace/Institutions.vue` — institution directory

**Interfaces:**
- Consumes: `src/stores/network.ts`, `src/lib/actors.ts`, `src/lib/capability-registry.ts`, `src/lib/asset-registry.ts`
- Produces: needs/offers listing, actor directory, capability browse, relationship view

- [ ] **Step 1: Rewrite Commons.vue** — discover needs, offers, resources, opportunities; no mock data
- [ ] **Step 2: Rewrite Network.vue** — people/crews/institutions/capabilities, relationship-driven
- [ ] **Step 3: Rewrite People.vue** — actor directory with who-can-act, resources, commitments
- [ ] **Step 4: Rewrite Institutions.vue** — institution directory with capabilities, assets
- [ ] **Step 5: Run type check and tests** — `npx tsc --noEmit`, `npm run test:unit -- --run`
- [ ] **Step 6: Commit**

---

### Task 4: Workbench module

**Files:**
- Modify: `src/modules/workbench/pages-vue/Home.vue` — workbench home with pilot lanes
- Modify: `src/modules/workbench/pages-vue/Pilot.vue` — pilot page with commitment journey

**Interfaces:**
- Consumes: `src/lib/commitment-journey.ts`, `src/lib/matching.ts`, `src/lib/evidence-store.ts`
- Produces: pilot lanes, scope/assemble/coordinate, commitment flow (need→commitment→fulfilment), evidence capture

- [ ] **Step 1: Rewrite Workbench Home.vue** — pilot lanes, quick acts, module selection from workbench context
- [ ] **Step 2: Rewrite Pilot.vue** — commitment journey stages, matching engine results, evidence capture per pilot
- [ ] **Step 3: Run type check and tests** — `npx tsc --noEmit`, `npm run test:unit -- --run`
- [ ] **Step 4: Commit**

---

### Task 5: Records / Intelligence module

**Files:**
- Modify: `src/pages/workspace/Records.vue` — canon, annals, roll lenses
- Modify: `src/modules/intelligence/pages/Intelligence.vue` — agents, matching, forecasting

**Interfaces:**
- Consumes: `src/lib/record-envelope.ts`, `src/lib/evidence-store.ts`, `src/lib/knowledge-store.ts`, `src/lib/record-search.ts`, `src/lib/matching.ts`
- Produces: canon (structure), annals (chronology), roll (evidence/provenance), agent list, matching surface, forecast

- [ ] **Step 1: Rewrite Records.vue** — canon/annals/roll three lenses, evidence layers, hash_anchor
- [ ] **Step 2: Rewrite Intelligence.vue** — agents, matching surface, forecasting, analytics
- [ ] **Step 3: Run type check and tests** — `npx tsc --noEmit`, `npm run test:unit -- --run`
- [ ] **Step 4: Commit**

---

### Task 6: Value module

**Files:**
- Modify: `src/pages/workspace/Value.vue` — economic settlement

**Interfaces:**
- Consumes: `src/lib/commitment-journey.ts`, `src/lib/evidence-store.ts`
- Produces: outcome settlement view, APTCOIN readiness, replacement engine routing

- [ ] **Step 1: Write Value.vue** — economic settlement, outcome tracking, APTCOIN readiness indicators
- [ ] **Step 2: Run type check and tests** — `npx tsc --noEmit`, `npm run test:unit -- --run`
- [ ] **Step 3: Commit**

---

### Task 7: Landing Page — final scope

**Files:**
- Rewrite: `src/pages/Landing.vue` — conversion funnel
- Modify: `src/pages/Auth.vue` — sign in page, aligned with landing design

**Interfaces:**
- Consumes: router links to workspace modules
- Produces: hero, path, six registers, modules, CTA — sign in → workspace

- [ ] **Step 1: Rewrite Landing.vue** — $3B quality, Structural Emergence, no slop, no chatty copy. Hero: "The common ground for African productive capacity." Path: 4 stages. Six registers. Modules: 5. CTA: Start building → sign in → workspace.
- [ ] **Step 2: Align Auth.vue** — sign in page matches landing design system, no investor links
- [ ] **Step 3: Run type check, build, and tests** — `npx tsc --noEmit`, `npm run build`, `npm run test:unit -- --run`
- [ ] **Step 4: Commit**

---

### Task 8: Pipeline integration verification

**Files:**
- Modify: `engine/multi_model_pipeline.py` — any fixes from integration
- Modify: `src/shell/AgentDock.vue` — pipeline subagent connector wiring

**Interfaces:**
- Consumes: `MultiModelPipeline.run()`, `SubagentConnector.execute()`
- Produces: agent dock with live subagent conversations, throughput telemetry

- [ ] **Step 1: Verify pipeline health** — Bifrost `/health` → ok, FCC `/health` → ok
- [ ] **Step 2: Run subagent parallel test** — 6 agents, measure combined tok/s
- [ ] **Step 3: Fix any integration issues** — pipeline model selection, fallback, circuit-break
- [ ] **Step 4: Commit**

---

### Task 9: Full build + test gate

**Files:**
- No file changes — verification only

**Interfaces:**
- Consumes: all built modules
- Produces: green build, green tests, clean type check

- [ ] **Step 1: Run `npx tsc --noEmit`** — expect clean
- [ ] **Step 2: Run `npm run build`** — expect green (tsc + vite build → dist/)
- [ ] **Step 3: Run `npm run test:unit -- --run`** — expect 34 files, 318 tests green
- [ ] **Step 4: Commit** — `git commit -m "feat: lean masterpiece build complete — 5 modules, pipeline, landing"`

---

**Plan self-review:**
1. Spec coverage: All 5 design sections mapped to tasks 1-7. Task 8 covers pipeline integration (section 3). Task 9 covers acceptance criteria.
2. Step scan: Every step is one actionable thing. No TBD lines. No transcript bodies.
3. Type consistency: Router, WorkspaceShell, module pages all reference same `moduleForPath`/`WORKSPACE_MODULES` interfaces.
4. Review Focus: All 5 items covered — agent dock toggle (Task 1), Bifrost fallback (Task 8), preferred model bypass (already in pipeline code), module rail accent (Task 1), landing conversion (Task 7).
5. Proportion: Plan is ~400 lines, spec is ~500 lines. Appropriate ratio.

**Execution method:** User is gone — proceeding with Native execution (I implement every task myself in this session).

Starting with Task 1: Workspace Shell.
