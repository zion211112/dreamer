# APT-LABS: Evidence-Based Product Understanding

**Date:** 2026-11-07
**Branch:** `feat/console-commons-assets-workbench-simulation`
**Status:** Analysis and recommendations only — no implementation performed
**Repository:** `c:\Users\zION\Documents\dreamer` (package name `zeptepi`, v0.0.1)

---

## Evidence Classification

Every claim in this document carries one of four evidence labels:

| Label | Meaning |
|-------|---------|
| **VERIFIED** | Confirmed by reading implementation code, tests, or authoritative project docs |
| **INFERRED** | Strongly suggested by code structure, naming, or architecture — not explicitly stated |
| **PROPOSED** | Stated in plans, memos, or design direction documents but not implemented |
| **UNKNOWN** | Not determinable from current evidence |

**Method:** All implementation claims were ground-truthed by reading `src/lib/*`, `src/pages/workspace/*`, `src/components/*`, `src/tokens.css`, `src/App.tsx`, git log, and test output. No code was changed, built, or run except `npm run test:unit -- --run` (17 files, 123 tests passed, 2026-11-07 17:31). `npm run build` fails only in this sandbox due to an esbuild parent-directory access restriction (environment issue, not a code defect).

---

## 1. Core Thesis

**Claim:** APT-LABS is a system for making fragmented productive capacity — people, crews, assets, institutions, work, and evidence — legible and actionable through a durable entity-relationship core, local-first field workflows (Commons → Workbench → Roll), and an intelligence layer that remains deliberately unimplemented pending preconditions. ([`src/lib/people-network.ts`](src/lib/people-network.ts), [`src/lib/workbench-simulation.ts`](src/lib/workbench-simulation.ts), [`src/lib/local-workflows.ts`](src/lib/local-workflows.ts), [`src/lib/db/roll.ts`](src/lib/db/roll.ts), [`src/pages/workspace/AptCoinLab.tsx`](src/pages/workspace/AptCoinLab.tsx))

- **VERIFIED:** The durable core is an entity/relationship graph: `EntityType {person, crew, project, asset, work, institution, evidence}` and `RelationshipKind {membership, affiliation, work, stewardship, contribution, evidence, owns, operates, stewards, funds, contributes_to, attests, issues}`. `RecordBasis {illustrative, local-profile, project-reported}` tags every record's provenance.
- **VERIFIED:** `PortablePeopleRecord` format `aptlabs.people-network` v1, anchor `APT-LABS`, with `localStorage` import/export — records are portable, not siloed.
- **VERIFIED:** The activity flow is Commons (signals → opportunities → steward-governed proposals) → Workbench (simulation pipeline: candidate→tender review→assembly→delivery evidence→acceptance→roll preview) → Roll (hash-anchored ledger with evidence layers and participant roles).
- **VERIFIED:** The intelligence layer (`AptCoinLab`) is an explicit placeholder: "no interactive UI exists yet", listing preconditions (unified event stream, authority model, matching engine, forecasting baseline, graph analysis) before any coin balances, transfers, rewards, wages, or gated access can exist.
- **INFERRED:** The product's differentiator is not a new blockchain or token but a *provenance-first operating layer* over local/fixture/demo data: every record carries `recordBasis`, every roll entry carries `hash_anchor` and evidence layers, and every simulation is explicitly labeled "simulated."
- **UNKNOWN:** Whether APT-LABS targets a specific geography/sector (Kenyan shilling `amountKes` appears in School Console, suggesting East Africa; no market sizing or ICP found in code).
- **UNKNOWN:** Whether the "productive capacity" framing is economic (wages, jobs) or operational (asset deployment, crew assignment) — both are present but neither is prioritized in code.

---

## 2. Problems and Participants

**Problems (evidence):**

| Problem | Evidence | Classification |
|---------|----------|----------------|
| Fragmented productive capacity is illegible | Entity graph with 7 entity types + 13 relationship kinds; `PEOPLE_NETWORK` has 31 entities, 34 relationships | VERIFIED (code: `src/lib/people-network.ts`, `src/pages/workspace/Network.tsx`) |
| No portable record across field contexts | `PortablePeopleRecord` v1 with `localStorage` import/export | VERIFIED |
| Field signals don't convert to governed work | `FieldSignal → WorkBriefDraft → CommonsProposal` steward-gated flow | VERIFIED (`src/lib/local-workflows.ts`) |
| Simulation has no durable roll record | Workbench `rollPreview` (hash-anchored) only for physical-asset `workKind`; Annals lens is placeholder | VERIFIED (`src/lib/workbench-simulation.ts`, [`src/lib/db/roll.ts`](src/lib/db/roll.ts)) |
| Intelligence layer exists in name only | `AptCoinLab.tsx` placeholder listing preconditions | VERIFIED |
| School Console placement is contradictory | Decision memo says `/workspace/workbench/school-console`; assets memo claims `/workspace/assets/school-console`; code uses `/workspace/workbench/school-console` | VERIFIED (code + conflicting memos) |

**Participants / roles (evidence):**

| Role | Evidence | Classification |
|------|----------|----------------|
| Institution | `UserRole {institution, founder, coordinator, admin}`; institution/asset register | VERIFIED (`src/lib/auth/types.ts`, `src/pages/workspace/Institutions.tsx`) |
| Founder | Same `UserRole` enum | VERIFIED |
| Coordinator | Same `UserRole` enum; Commons steward gating | VERIFIED |
| Admin | Same `UserRole` enum | VERIFIED |
| Anchor / Builder / Apprentice / Coordinator (roll participants) | `getRollAccess`, roll entry participant roles | VERIFIED (`src/lib/db/roll.ts`) |
| Steward (Commons governance) | `isSteward`, `registerInitialSteward`, `addSteward`, proposal approval | VERIFIED (`src/pages/workspace/commons/`, `src/lib/local-workflows.ts`) |
| Agent / Engine | `PageAgentPanel agentAvailable=false`; `EngineActivityStrip agentAvailable={false}`; "disconnected command dock" | VERIFIED (UI shows agent unavailable) |

**Gap:** No external participant types (banks, regulators, insurers, buyers) appear in the model. All roles are internal to the APT-LABS workspace.

---

## 3. Operating Logic

**Commons (signals → governance):**
- `useCommons()` manages signals, opportunities, proposals, governance. Field signals are triaged into opportunities; steward-gated proposals move `proposed → approved | rejected | returned`. Approved proposals link to `/workspace/workbench/examples?proposal=<id>`. ([`src/pages/workspace/Commons.tsx`](src/pages/workspace/Commons.tsx), [`src/lib/local-workflows.ts`](src/lib/local-workflows.ts))

**Workbench (simulation pipeline):**
- 6 stages: `candidate_drafted → tender_review_simulated → assembly_simulated → delivery_simulated → acceptance_simulated → roll_preview`. Actions: `tender-review, assembly, delivery, acceptance, deployment, pause, resume, cancel`. Stage gates auto/blocked/proceed. `rollPreview` only for physical-asset `workKind`. Source links to School Console draft + optional `commonsSignalId`/`institutionId`/`assetRecordId`. ([`src/lib/workbench-simulation.ts`](src/lib/workbench-simulation.ts), [`src/components/workbench/WorkbenchBlockFlow.tsx`](src/components/workbench/WorkbenchBlockFlow.tsx))

**School Console (need drafting):**
- IndexedDB `apt-labs-school-console`. `ConsoleSnapshot` with `SchoolTenderDraft` (assetName, need, assetBuildCost, crewWageAllocation anchor/builder/apprentice, blueprintLines) and `LocalFeeNote amountKes`. Saved drafts link into Workbench simulation via `createWorkbenchSimulationLink`. ([`src/lib/school-console-storage.ts`](src/lib/school-console-storage.ts), [`src/modules/assets/school-console/`](src/modules/assets/school-console/))

**Roll (durable ledger):**
- `RollEntry` with `hash_anchor` via canonical JSON. Evidence layers `public | participant | restricted`. Participant roles `anchor | builder | apprentice | coordinator`. `getRollAccess`, `verifyRollEntry`. Annals lens is placeholder awaiting unified event stream. ([`src/lib/db/roll.ts`](src/lib/db/roll.ts))

**Records (three lenses):**
- Canon (qualified PEOPLE_NETWORK state), Annals (placeholder), Roll (queryRollEntries, evidence layers, acceptance, hash anchor, revisions). ([`src/pages/workspace/Records.tsx`](src/pages/workspace/Records.tsx))

**Operating principle (verified from code):** Every flow is browser-local/demo-first. `isDemoMode` from `supabase/client.ts`; no live auth; localStorage/IndexedDB stores; "demo-mode fallback when env vars unset." No external writes, no backend, no MCP, no autonomous agent.

---

## 4. Foundational Concepts

| Concept | Definition (from code) | Evidence |
|---------|----------------------|----------|
| Entity | person / crew / project / asset / work / institution / evidence | VERIFIED (`EntityType`) |
| Relationship | 13 kinds incl. owns, operates, stewards, funds, attests, issues | VERIFIED (`RelationshipKind`) |
| Record basis | illustrative / local-profile / project-reported | VERIFIED (`RecordBasis`) |
| Portable record | `aptlabs.people-network` v1, anchor APT-LABS, localStorage import/export | VERIFIED |
| Simulation stage | 6-stage pipeline from candidate to roll preview | VERIFIED (`SimulationStage`) |
| Roll entry | hash-anchored, evidence-layered, participant-roled | VERIFIED (`RollEntry`) |
| Commons proposal | proposed → approved | rejected | returned, steward-gated | VERIFIED (`local-workflows.ts`) |
| Fee note | `LocalFeeNote amountKes` (Kenyan shillings) | VERIFIED (`school-console-storage.ts`) |
| Illustrative capacity | `recordBasis: 'illustrative'` for capacity scenario data | VERIFIED (`workbench-capacity.ts`, plan doc) |

**Missing concepts (UNKNOWN or PROPOSED):**
- No explicit "capacity" entity in the core model (capacity appears only as an illustrative scenario in the unmerged plan doc).
- No "wage," "payment," "settlement," or "invoice" concept anywhere — only `crewWageAllocation` (School Console draft) and `amountKes` (fee note).
- No "reputation," "attestation," or "credential" type beyond `RelationshipKind.attests` and `RelationshipKind.issues`.
- No "market," "matching," or "forecasting" concept implemented (listed as AptCoinLab preconditions).

---

## 5. Economic Model

**VERIFIED economic primitives:**
- `SchoolTenderDraft.assetBuildCost` and `crewWageAllocation {anchor, builder, apprentice}` — cost and wage structure within a school tender draft.
- `LocalFeeNote.amountKes` — a fee denominated in Kenyan shillings.
- `indicative_terms` (e.g. `$75/hr`) in capability directory sample data.
- `recordBasis: 'illustrative'` — capacity values are explicitly illustrative, not observed.

**NOT verified / absent:**
- No token economics implemented (APTCOIN exists only as a placeholder page with preconditions).
- No payment, settlement, escrow, or invoicing.
- No marketplace pricing, matching fees, or take rates.
- No currency beyond `amountKes` (KES) and sample `$75/hr` (USD) — multi-currency not addressed.
- No statement of who pays whom, when, or under what terms.

**INFERRED:** The economic model is currently *descriptive* (it records costs, wages, fees) rather than *operational* (it executes payments). Any monetary flow would be a major new capability.

---

## 6. SBTs and APTCOIN

**SBTs (Soulbound Tokens):**
- No SBT implementation exists in code. `RelationshipKind.attests` and `RelationshipKind.issues` are the closest primitives — they suggest attestation/issuance capability but nothing is wired.
- `PortablePeopleRecord` with `localStorage` import/export is a local-first analogue to portable credentials, but not an SBT.
- **Classification:** PROPOSED at best (relationship kinds hint at it), UNKNOWN whether any SBT design exists outside code.

**APTCOIN:**
- `src/pages/workspace/AptCoinLab.tsx` is an explicit placeholder: "no interactive UI exists yet", no coin balances/transfers/rewards/wages/gated access. Lists preconditions: unified event stream, authority model, matching engine, forecasting baseline, graph analysis.
- No coin contract, minting, burning, transfer, or gating logic anywhere in `src/`.
- **Classification:** PROPOSED (named, preconditions listed), UNKNOWN (no token design, no network, no standard).

**Consequence:** APTCOIN and SBTs are the highest-consequence *unbuilt* elements. If the product's value proposition depends on a token or credential layer, none of it exists yet and the preconditions (especially unified event stream) are themselves unimplemented.

---

## 7. Intelligence Opportunity

**VERIFIED:** `AptCoinLab` placeholder lists the exact preconditions for intelligence:
1. Unified event stream (Annals is currently a placeholder)
2. Authority model (who can advance simulation state)
3. Matching engine (capacity → need matching)
4. Forecasting baseline
5. Graph analysis (over the people-network entity/relationship graph)

**INFERRED:** The intelligence opportunity is layered:
- **Near-term (graph analysis):** The entity/relationship graph (31 entities, 34 relationships, 13 kinds) is queryable today. NetworkMap force-directed visualization exists. EntityInspector shows capabilities, location, recordBasis. This is the most immediate intelligence surface.
- **Mid-term (matching + forecasting):** The capacity scenario (KIRINYAGA_CAPACITY_SCENARIO in the plan doc) and `filterCapacityCandidates` are pure, testable projection functions — a foundation for matching, but not yet connected to live data.
- **Long-term (APTCOIN + unified event stream):** Requires Annals to stop being a placeholder, plus authority model + matching engine + forecasting baseline — all unimplemented.

**UNKNOWN:** What intelligence outputs are intended (recommendations? forecasts? risk scores? matches?). No UI or spec defines them.

---

## 8. Possible System Structures

**Current structure (VERIFIED):**
- Browser-local, demo-mode-first, no backend.
- 5 primary modules: Commons, Network, Workbench, Records, Intelligence.
- Data boundaries: localStorage (commons signals, workbench drafts, commons governance), IndexedDB (school console), local Roll store, demo Supabase fallback.
- Client routing via Wouter; 5 rail modules in StudioNavigation.

**Possible structure A — Stay local-first (current path):**
- Keep all data in browser storage; add IndexedDB roll persistence; keep demo-mode Supabase fallback.
- **Fit:** Matches existing architecture, tests, and constraints. Lowest implementation risk.
- **Classification:** VERIFIED as current direction; PROPOSED as continuation.

**Possible structure B — Add a backend / Supabase:**
- `supabase/client.ts` exists with demo-mode fallback, suggesting a backend path was considered.
- Would require auth (currently none live), API routes, row-level security, conflict resolution.
- **Fit:** Contradicts "no live auth (browser-local demo only)" constraint and the plan doc's "no backend" rule. Major architectural shift.
- **Classification:** PROPOSED (infra exists), HIGH consequence, UNRESOLVED.

**Possible structure C — Add capacity matching as a 6th module:**
- The plan doc proposes `WorkbenchCapacityFinder` at `/workspace/workbench/plan` + capacity drafts store `aptlabs:workbench-capacity-drafts:v1`.
- Would add `CapacityNeed`, `CapacityCandidate`, `CapacityEvidence` types, all `recordBasis: 'illustrative'`.
- **Fit:** Reuses existing patterns (localStorage draft store, pure filter/sort). Consistent with 5-module constraint if capacity lives under Workbench.
- **Classification:** PROPOSED (plan doc, not implemented).

**Possible structure D — Unify Annals + Roll into event stream:**
- Annals lens is placeholder; Roll has hash_anchor + evidence layers. Unifying them would satisfy AptCoinLab precondition #1 (unified event stream).
- **Fit:** Natural evolution of existing roll ledger.
- **Classification:** PROPOSED (implied by placeholder + preconditions).

---

## 9. Technical/Operational Feasibility

**Feasible today (VERIFIED, tests pass):**
- Entity/relationship graph CRUD and visualization (Network, People, Institutions pages).
- Commons signal/opportunity/proposal/governance flow (Commons page + useCommons + local-workflows).
- Workbench simulation 6-stage pipeline with gates (WorkbenchBlockFlow + useWorkbench).
- School Console need drafting → Workbench simulation link (school-console-storage + local-workflows).
- Roll ledger query, hash anchor verification, access control (db/roll + roll.test.ts).
- Records three-lens view (Canon populated, Annals placeholder, Roll queryable).
- Portable record import/export via localStorage.
- 123 tests pass across 17 files.

**Not feasible without new work:**
- `npm run build` fails in this sandbox (esbuild cannot read parent directory — environment restriction). **UNKNOWN** whether build passes outside sandbox; must be verified before any roadmap commitment.
- Live auth: none exists; `isDemoMode` gates everything. Adding auth is a new capability.
- Backend/Supabase writes: demo-mode fallback only; no API routes.
- APTCOIN/SBTs: preconditions unimplemented.
- Unified event stream: Annals placeholder.

**Operational constraints (from plan doc):**
- Do not add AI provider, MCP, backend, or autonomous action.
- Agent cannot contact providers, represent consent, commit capacity, authorize work, accept delivery, or settle payment.
- All states remain local and illustrative; never present synthetic data as observed fact.
- Preserve focus, keyboard, reduced motion, contrast, 320px no-overflow.

**Build/test gate:** `npm run test:unit -- --run` passes. `npm run build` is sandbox-blocked, not clearly a code defect. This must be resolved (or confirmed as environment-only) before any implementation phase.

---

## 10. UI Design Potential

**Current state (VERIFIED):**
- Design tokens: `src/tokens.css` — dark `#0A0F0C` green-black default, bone `#E9F1E8`, state colors (canon teal, proposed lime, risk coral, caution amber, water info), `[data-skin="light"]` luxury variant, Georgia serif / system-ui sans / JetBrains Mono, modular scale 1.25, 8px baseline + fibonacci.
- Approved direction: `docs/design/workspace-direction-v2.md` — "Signature Dark Instrument," ONE signature dark system (deep green-black #0A0F0C base), 2026-11-05.
- Shell: `WorkspaceShell.tsx` with `StudioNavigation` rail/sidebar, `RecordInspector`, `ChangeSetDock`, `EngineActivityStrip` (agentAvailable=false).
- Pages use `WorkspaceLayout` + `PageHead` with eyebrow/title/subtitle/metrics/quietActions pattern.
- 395KB `src/styles.css` (header scanned; full file not reviewed).

**Contradictions / risks:**
- Git commit `a02c375` "flip workspace palette from dark to light luxury" vs `tokens.css` default still dark with light as `[data-skin]` variant. **UNKNOWN** whether the flip was applied, reverted, or limited in scope.
- `docs/design/workspace-direction-v2.md` (2026-11-05) mandates dark; commit `a02c375` (later) claims light luxury. Tension unresolved.
- `styles.css` is 395KB — likely contains accumulated/duplicate styles; simplification candidate.

**UI potential (PROPOSED):**
- Premium local-demo shell with engine strip, command dock (disconnected), quick search (per plan doc Tasks 1-8).
- Capacity matching UI (candidate list, inspector, draft form) at `/workspace/workbench/plan`.
- Five-flow finish gate at 1440/768/390/320px with keyboard, screen-reader, reduced-motion verification.
- **UI critique** (independent): see Section 14.

**Immediate UI work:** Tokens exist and are consistent; the shell pattern (PageHead + WorkspaceLayout) is established. The main UI opportunity is applying the approved dark direction consistently and finishing the five flows per the plan doc.

---

## 11. Major Risks and Unanswered Questions

| Risk | Severity | Evidence | Classification |
|------|----------|----------|----------------|
| Build broken in sandbox; unclear if code defect or environment | Critical | esbuild "Access is denied" reading parent dir; tests pass | UNKNOWN (environment vs code) |
| School Console route contradiction | Serious | placement-decision.md (workbench) vs assets-module-complete.md (assets route) vs code (workbench) | VERIFIED inconsistency |
| Palette direction contradiction | Serious | commit "flip to light luxury" vs tokens.css dark default vs direction doc (dark) | VERIFIED inconsistency |
| APTCOIN/SBTs have no implementation; preconditions unimplemented | Serious | AptCoinLab placeholder; Annals placeholder | VERIFIED (absence) |
| No live auth; demo-mode only | Moderate | `isDemoMode`, no auth routes beyond /sign-in\|up | VERIFIED |
| No backend; all data browser-local | Moderate | localStorage/IndexedDB only; supabase demo fallback | VERIFIED |
| `styles.css` 395KB, potentially bloated/duplicate | Moderate | file size | INFERRED |
| CODEBASE.md stale (11 files/85 tests vs actual 17/123) | Low | file content vs test output | VERIFIED |
| `school-console-assets-module-complete.md` claims updates that code doesn't reflect | Low | memo vs code (StudioNavigation, InstitutionInspector, Commons, Auth) | VERIFIED contradiction |

**Unanswered questions:**
1. Is the build failure environmental only, or does it indicate a code defect that will surface outside sandbox?
2. Which is authoritative for School Console: workbench (code + placement decision) or assets (assets-module-complete memo)?
3. Which is authoritative for palette: dark (direction doc + tokens.css default) or light luxury (commit a02c375)?
4. Does APT-LABS intend a backend/Supabase path, or is browser-local permanent?
5. What are the APTCOIN tokenomics (supply, distribution, utility)? None specified.
6. What market/geography does the KES denomination target? No ICP stated.
7. What intelligence outputs are expected (matches, forecasts, risk scores)?

---

## 12. Highest-Leverage Next Decisions

Ranked by consequence (impact × irreversibility × dependency load).

### Decision 1 (Critical) — Resolve build status before any roadmap
**What:** Determine whether `npm run build` failure is purely environmental (sandbox parent-dir access) or a code defect (vite.config.ts resolution). Verify build outside sandbox.
**Why:** Everything downstream — implementation, testing, deployment — depends on a working build. Tests pass but build is the gate.
**Consequence:** Critical. If it's a code defect, it blocks all shipping. If environmental, no action needed but must be documented.
**Evidence:** `build.log` shows esbuild "Cannot read directory '../..': Access is denied." Classification: UNKNOWN (environment vs code).

### Decision 2 (Critical) — Resolve School Console placement (workbench vs assets)
**What:** Decide authoritatively whether School Console lives at `/workspace/workbench/school-console` (code + placement-decision.md) or `/workspace/assets/school-console` (assets-module-complete memo). Update the losing memo and any stale code links.
**Why:** This contradiction affects routing, navigation (StudioNavigation), Commons linking, and InstitutionInspector. It's an active inconsistency in the current branch.
**Consequence:** Critical. A misplaced module creates broken links, confused users, and duplicated effort.
**Evidence:** VERIFIED contradiction between code, placement-decision.md, and assets-module-complete.md.

### Decision 3 (Critical) — Resolve palette direction (dark vs light luxury)
**What:** Decide whether the product defaults to dark `#0A0F0C` (direction doc 2026-11-05 + tokens.css default) or light luxury (commit a02c375). Activate or remove `[data-skin="light"]` accordingly; remove the unused variant.
**Why:** Inconsistent theming across the app creates a broken brand experience. The design system cannot ship with two conflicting defaults.
**Consequence:** Critical. Affects every screen; wrong choice requires rework of all components.
**Evidence:** VERIFIED contradiction between direction doc, tokens.css, and git history.

### Decision 4 (High) — Decide backend vs permanent local-first
**What:** Confirm whether Supabase/backend is a future path or explicitly out of scope. The plan doc says "no backend"; `supabase/client.ts` has demo fallback suggesting it was considered.
**Why:** Determines auth strategy, data persistence, multi-user capability, and deployment model.
**Consequence:** High. Irreversible-ish; affects architecture, security, and the demo-mode promise.
**Evidence:** INFERRED (demo fallback exists but no backend code).

### Decision 5 (High) — Scope APTCOIN / SBTs
**What:** Decide whether APTCOIN and SBTs are in scope for v1, and if so, define tokenomics and the unified event stream (Annals) implementation.
**Why:** Currently all preconditions are unimplemented. If in scope, Annals + authority model + matching engine must be built first. If out of scope, remove the placeholder to avoid misleading stakeholders.
**Consequence:** High. APTCOIN is named in the product but doesn't exist; ambiguous scope creates expectation risk.
**Evidence:** VERIFIED (placeholder), UNKNOWN (tokenomics).

### Decision 6 (Medium) — Adopt capacity matching module (plan doc Task 2-4)
**What:** Decide whether to implement the `WorkbenchCapacityFinder` / capacity drafts store (`aptlabs:workbench-capacity-drafts:v1`) at `/workspace/workbench/plan`.
**Why:** Adds a concrete, testable, illustrative capacity scenario that demonstrates the product's value (matching capacity to need) without backend.
**Consequence:** Medium. Well-scoped, reuses existing patterns, low risk.
**Evidence:** PROPOSED (plan doc, not implemented).

### Decision 7 (Medium) — Simplify styles.css (395KB)
**What:** Audit `src/styles.css` for duplication/dead styles; consolidate into tokens.css where possible.
**Why:** 395KB is large for a token-based design system; indicates accumulated styles that conflict with the design-system direction.
**Consequence:** Medium. Reduces bundle size and styling inconsistency risk.
**Evidence:** INFERRED (file size only).

### Decision 8 (Low) — Update CODEBASE.md and stale memos
**What:** Fix CODEBASE.md (11 files/85 tests → 17/123). Retire or correct assets-module-complete.md (claims route changes not in code).
**Why:** Stale docs mislead new contributors and create the kind of contradiction found in Decisions 2-3.
**Consequence:** Low. Hygiene, not blocking.
**Evidence:** VERIFIED.

---

## 13. Independent Critique: "Signature Dark Instrument" UI Direction

**Source:** `docs/design/workspace-direction-v2.md` (approved 2026-11-05) + `src/tokens.css` + current UI implementation.

### What the direction says (VERIFIED)
- "ONE signature dark system (deep green-black #0A0F0C base)."
- Bone `#E9F1E8` as contrast.
- State colors: canon teal, proposed lime, risk coral, caution amber, water info.
- Georgia serif / system-ui sans / JetBrains Mono.
- Modular scale 1.25; 8px baseline + fibonacci spacing.

### What's implemented (VERIFIED)
- `tokens.css` defaults to dark `#0A0F0C` with `[data-skin="light"]` luxury variant (not activated anywhere in app code — no `data-skin` attribute found in App.tsx, index.html, or WorkspaceShell).
- State colors used in Network entity dots, WorkbenchBlockFlow gate states, PageHead metrics.
- `styles.css` (395KB) contains component styles; full content not reviewed in this session.

### Critique

**Strengths:**
1. **Coherent token foundation.** `tokens.css` is a real design system with primitives, semantics, scale, and spacing — not arbitrary hex values. (VERIFIED)
2. **Dark-first is distinctive.** A green-black "instrument" aesthetic fits the "field studio / workbench" product metaphor and differentiates from generic light SaaS. (INFERRED from product naming + direction)
3. **State color system is semantic.** canon/proposed/risk/caution/water map clearly to UI states (BlockFlow gates, Network dots, PageHead metrics). (VERIFIED)
4. **Typography is intentional.** Georgia serif for headings (instrumental, authoritative), system-ui sans for UI, JetBrains Mono for data/codes. (VERIFIED)

**Weaknesses / concerns:**

1. **Palette contradiction (Critical).** Commit `a02c375` "flip workspace palette from dark to light luxury" conflicts with the approved dark direction and `tokens.css` default. The `[data-skin="light"]` variant exists but is never activated. This is unresolved and ships as neither clean dark nor clean light. (VERIFIED)

2. **Unverified at render.** `inspect-spacing` and `check-comprehension` have not been run on rendered DOM (per Better Design rules). The design system exists in tokens but has not been visually verified at 390/768/1440/1728. (UNKNOWN)

3. **395KB styles.css risk (Medium).** A 395KB stylesheet alongside a token system suggests duplicated or orphaned styles. Without auditing, the "signature" look may be diluted by legacy overrides. (INFERRED)

4. **Light variant is dead code (Low).** `[data-skin="light"]` is defined but never applied. If light mode is not intended, remove it; if it is, activate it deliberately. (VERIFIED)

5. **No mobile/responsive evidence reviewed.** The plan doc requires 390/768/1440/320px verification but this has not been done for the current UI. (UNKNOWN per plan doc requirements)

**Recommendation:**
- **Adopt** the dark direction as approved (2026-11-05), commit to `#0A0F0C` default.
- **Remove** the unused `[data-skin="light"]` variant (or activate it deliberately if light luxury is the new decision — see Decision 3).
- **Audit** `styles.css` against `tokens.css` to eliminate duplication.
- **Run** `inspect-spacing`, `check-comprehension`, `get-review-rules` on rendered output at 390/768/1440/1728 before presenting any UI to stakeholders.

---

## 14. Evidence Inventory / Classification Register

### VERIFIED (implementation-grounded)
- Stack: Preact 10.24 + Vite 6.4.5 + TypeScript 5.6 strict + Wouter + Vitest 5.0.5
- Branch: `feat/console-commons-assets-workbench-simulation` with upstream
- Tests: 17 files, 123 tests passed (2026-11-07 17:31)
- Build: sandbox-blocked (esbuild parent-dir access), tests pass
- Entity types: person, crew, project, asset, work, institution, evidence
- Relationship kinds: membership, affiliation, work, stewardship, contribution, evidence, owns, operates, stewards, funds, contributes_to, attests, issues
- Record basis: illustrative, local-profile, project-reported
- PortablePeopleRecord `aptlabs.people-network` v1, anchor APT-LABS, localStorage import/export
- Workbench 6 simulation stages + 7 actions + rollPreview for physical-asset workKind
- Commons FieldSignal→WorkBriefDraft→CommonsProposal (proposed|approved|rejected|returned)
- RollEntry hash_anchor, evidence layers public|participant|restricted, roles anchor|builder|apprentice|coordinator
- School Console IndexedDB `apt-labs-school-console`, SchoolTenderDraft, LocalFeeNote amountKes
- Auth UserRole {institution, founder, coordinator, admin}; isDemoMode; no live auth
- Routes: /, /sign-in\|up, /investor-memo, /workspace/commons, /workspace/network/*, /workspace/workbench/{plan,examples,applications,review,delivery,field-desk,school-console}, /workspace/records/{canon,annals,roll}, /workspace/intelligence
- AptCoinLab placeholder listing 5 preconditions
- WorkbenchBlockFlow 6-stage UI, PageAgentPanel agentAvailable=false
- StudioNavigation school-console links = /workspace/workbench/school-console
- tokens.css: dark #0A0F0C default, bone #E9F1E8, state colors, [data-skin="light"] variant, Georgia/system-ui/JetBrains Mono, scale 1.25, 8px baseline
- 5 primary modules: Commons, Network, Workbench, Records, Intelligence
- Git commit a02c375 "flip workspace palette from dark to light luxury"
- CODEBASE.md stale (11 files/85 tests vs actual 17/123)
- school-console-placement-decision.md vs assets-module-complete.md route contradiction

### INFERRED (strongly suggested)
- Product differentiator is provenance-first operating layer over local/demo data
- Economic model is descriptive (records costs/wages/fees) not operational (no payments)
- Intelligence opportunity is layered: graph (near) → matching/forecasting (mid) → APTCOIN (long)
- 395KB styles.css indicates accumulated/duplicate styles
- Capacity scenario (KIRINYAGA) is illustrative and isolated per plan doc constraints

### PROPOSED (not implemented)
- Capacity matching module at /workspace/workbench/plan (plan doc Tasks 2-4)
- Capacity drafts store aptlabs:workbench-capacity-drafts:v1 (plan doc Task 3)
- WorkbenchCommandDock disconnected, EngineActivityStrip, WorkspaceQuickSearch (plan doc Task 1)
- Local opportunity-to-delivery workflow views (plan doc Task 6)
- Records truthful error states (plan doc Task 7)
- Five-flow finish gate (plan doc Task 8)
- APTCOIN tokenomics, SBT design, unified event stream (Annals implementation)
- Backend/Supabase path (infra exists as demo fallback only)
- Light luxury palette activation (commit a02c375)

### UNKNOWN
- Whether build failure is environmental or code defect
- Whether backend/Supabase is permanent local-first or future path
- APTCOIN tokenomics (supply, distribution, utility)
- SBT design existence outside code
- Target market/geography (KES hint suggests East Africa, unconfirmed)
- Intelligence output types (matches, forecasts, risk scores)
- Whether light or dark palette is authoritative
- School Console authoritative placement (workbench vs assets)

---

## 15. Consequence-Ranked Decision Summary

| Rank | Decision | Consequence | Blocker for |
|------|----------|-------------|-------------|
| 1 (Critical) | Resolve build status (environment vs code) | Critical | All shipping |
| 2 (Critical) | Resolve School Console placement | Critical | Routing, nav, links |
| 3 (Critical) | Resolve palette direction (dark vs light) | Critical | All UI, brand |
| 4 (High) | Backend vs permanent local-first | High | Architecture, auth, deployment |
| 5 (High) | Scope APTCOIN / SBTs | High | Expectation setting, roadmap credibility |
| 6 (Medium) | Adopt capacity matching module | Medium | Value demonstration |
| 7 (Medium) | Simplify styles.css | Medium | Bundle size, consistency |
| 8 (Low) | Update CODEBASE.md + stale memos | Low | Contributor onboarding |

**Preconditions for a credible roadmap:** Decisions 1-3 must be resolved first. They are contradictions in the current branch that make any implementation plan ambiguous. Decisions 4-5 determine architectural scope. Decisions 6-8 are execution priorities once scope is set.

---

**End of document.** Analysis and recommendations only — no code changes, mockups, cleanup, refactoring, or implementation were performed.
