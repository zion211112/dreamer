# Workbench School Simulation Implementation Plan
# Workbench School Simulation Implementation Plan

> **Superseded:** The approved scope now covers the Console → Commons → optional Assets → Workbench flow. Use `2026-10-31-console-commons-assets-workbench.md` instead.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect a school Console need through an optional Commons observation and optional asset context into a manually runnable, isolated Tender → Assembly → Acceptance → Roll-preview simulation.

**Architecture:** Keep `/workspace/workbench` and the Field Desk alias. Add an explicit Console-to-Commons handoff with an optional `sourceConsoleDraftId`, optional stable-ID Commons/Institutions context, and an isolated simulation store. Add a pure state-machine module and a compact dossier UI; preserve existing Console, Commons, Institutions, and Workbench records, with no backend or model calls.

**Tech Stack:** Vite, Preact, TypeScript, Wouter, existing `src/styles.css`, Vitest for domain tests, Playwright for browser flows.

**Spec:** `docs/superpowers/specs/2026-10-31-workbench-school-simulation-design.md`

## Global Constraints

- Keep the active app Vite + Preact + TypeScript + Wouter; do not reintroduce Next.js.
- Keep the current Workbench route and `/workspace/field-desk` alias.
- Do not add a backend, authentication, Page Agent model call, model API key, or Page Agent package in this slice.
- Select only one School Console need draft and project only `assetName`, `need`, and optional `assetBuildCost`; never treat `assetName` as an asset ID.
- A Console-to-Commons handoff is user-reviewed and requires selecting an existing institution; if none fits, the need stays Console-local.
- Commons may have no asset link. Optional asset context must resolve to an existing registry ID; no ownership, provider, or authority is inferred from a link.
- Remove the Mwea school-solar sample asset and edge; retain the school institution and recast the school-power case as asset-unresolved.
- Never expose `markedPapers`, learner/student names or identifiers, answers, grades, fee notes, lesson draft content, or unselected Console data to the simulation or agent panel.
- Never write simulation output to the School Console IndexedDB snapshot, Commons, People, Institutions, current Workbench drafts/applications, or any production record store.
- Keep Tender candidates, simulated authority, simulated evidence, and Roll previews visibly distinct from real records and actions.
- A physical Roll preview is allowed only after simulated acceptance and deployment; non-physical work ends at accepted-work simulation with Roll marked not applicable.
- Preserve existing Console and Workbench local storage formats and records; do not silently migrate, overwrite, or delete them.
- No fabricated prices, provider identities, capabilities, credentials, authority, payment, or evidence.

## Review Focus

- Malformed or unreadable Console IndexedDB snapshot: show an actionable source error, disable selection, and never write back to the snapshot.
- Draft with empty/whitespace title, need, or invalid cost: reject or omit optional cost without creating a partial simulation.
- Excluded fields present in a Console snapshot: selected-source projection contains only `assetName`, `need`, and `assetBuildCost`; excluded values never appear in simulation serialization.
- Non-physical need or incomplete acceptance/deployment gates: simulation cannot emit a Roll preview.
- Corrupt simulation storage, repeated events, cancellation, or out-of-order transitions: preserve the last valid record and never report a completed run.

---

### Task 1: Add focused test infrastructure

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/lib/workbench-simulation.test.ts` (initial smoke test)

**Interfaces:**
- Unit test command: `npm run test:unit -- --run`.

- [ ] Add Vitest as a dev dependency and configure unit tests for pure TypeScript modules. Do not add Page Agent, Playwright, XState, Zod, or a component library.
- [ ] Add the `test:unit` script and Vitest config.
- [ ] Add a passing smoke test for the simulation domain.
- [ ] Run `npm run test:unit -- --run`.
- [ ] Run `npm run build`.

### Task 2: Define and test the simulation domain

**Files:**
- Create: `src/lib/workbench-simulation.ts`
- Modify: `src/lib/workbench-simulation.test.ts`
- Read: `src/lib/school-console-storage.ts`

**Interfaces:**
- Export `SimulationStage = 'candidate_drafted' | 'tender_review_simulated' | 'assembly_simulated' | 'delivery_simulated' | 'acceptance_simulated' | 'roll_preview'` and `SimulationPlanSource = 'manual' | 'page-agent'`; this release only creates `manual` plans.
- Export `WorkbenchViewStage = 'need' | SimulationStage`. `need` is a pre-simulation UI step and is not persisted as a simulation event or stage.
- Export `SimulationStatus = 'active' | 'paused' | 'blocked' | 'completed' | 'cancelled'` and `SimulationWorkKind = 'physical-asset' | 'non-physical'`.
- `SimulationSource` has exactly `draftId: string`, `assetName: string`, `need: string`, and `assetBuildCost: string | null`.
- `SimulationPackage` has `id`, `title`, `deliverables: string[]`, `roleType: string`, and `dependsOn: string[]`.
- `SimulationPlan` has `workKind`, `institutionLabel`, `scope`, `packages: SimulationPackage[]`, `costAssumptions: { amount: string; currency: string; basis: string } | null`, `compensationTerms`, `rightsTerms`, `safetyRequirements`, `acceptanceCriteria: string[]`, and `unresolvedFacts: string[]`.
- `SimulationAction` is a discriminated union: `tender-review` (`outcome: 'proceed' | 'blocked'`, `note`), `assembly` (`outcome: 'proceed' | 'blocked'`, `note`), `delivery` (`evidence: string[]`), `acceptance` (`outcome: 'accepted' | 'returned' | 'rejected'`, `note`), `deployment` (`note`), `pause`, `resume`, and `cancel` (`note`). A paused run accepts only `resume` or `cancel`; blocked/returned/rejected/cancelled runs cannot advance and may be discarded/restarted.
- `SimulationEvent` has `id`, `action`, `stage`, `actorRole: 'user' | 'simulated-role'`, `note`, and `createdAt`.
- `WorkbenchSimulation` has `id`, `schemaVersion: 1`, `source`, `plan`, `planSource`, `status`, `stage`, `events`, `createdAt`, `updatedAt`, and `rollPreview: RollPreview | null`.
- `RollPreview` has `assetName`, `scope`, `simulatedRoles: string[]`, `evidence: string[]`, and `simulatedAt`; it is not assignable to any production Roll type.
- `selectSchoolNeedSource(snapshot: ConsoleSnapshot, draftId: string): SimulationSource` returns only `draftId`, `assetName`, `need`, and nullable `assetBuildCost`; blank cost maps to `null`.
- `selectSchoolNeedSource` rejects missing drafts and drafts with blank `assetName` or `need`; optional `assetBuildCost` must be a finite non-negative decimal string or `null`.
- `createWorkbenchSimulation(source: SimulationSource, plan: SimulationPlan): WorkbenchSimulation` creates `status: 'active'`, `stage: 'candidate_drafted'`, `planSource: 'manual'` without changing the source.
- `advanceWorkbenchSimulation(simulation: WorkbenchSimulation, action: SimulationAction): WorkbenchSimulation` returns a new record or throws on invalid/replayed transitions; pause/resume changes `status`, blocked/returned/rejected actions set `status: 'blocked'`, cancellation sets `status: 'cancelled'`, non-physical acceptance completes at `acceptance_simulated`, and a physical run completes only at `roll_preview` after accepted evidence and an explicit deployment action.
- `isRollApplicable(plan: SimulationPlan): boolean` is true only for physical-asset work.

- [ ] Write tests for source allowlisting, excluded-field redaction, source immutability, valid transition order, duplicate transition rejection, and no Roll for non-physical work.
- [ ] Run `npm run test:unit -- --run src/lib/workbench-simulation.test.ts` and confirm the new tests fail.
- [ ] Implement the typed source projection and pure state-transition functions.
- [ ] Test that a physical case reaches Roll preview only after simulated acceptance and deployment, while creative/software cases end at acceptance with Roll not applicable.
- [ ] Run the focused unit tests and `npm run build`.

### Task 3: Add isolated simulation persistence

**Files:**
- Create: `src/lib/workbench-simulation-store.ts`
- Create: `src/lib/workbench-simulation-store.test.ts`
- Modify: `src/lib/workbench-simulation.test.ts`

**Interfaces:**
- Storage key: `aptlabs:workbench-simulations:v1`.
- Export `readWorkbenchSimulations(): WorkbenchSimulation[]`, `writeWorkbenchSimulations(records: WorkbenchSimulation[]): void`, and `deleteWorkbenchSimulation(id: string): void`.
- Validate the serialized schema on read and write; malformed storage throws an actionable error without overwriting existing bytes.

- [ ] Test empty storage, valid round-trip, unsupported schema version, malformed JSON, and deletion of one run only.
- [ ] Test that simulation writes leave the existing keys `aptlabs:workbench-drafts:v1`, `aptlabs:workbench-local-flow:v1`, `aptlabs:commons-signals:v1`, and `aptlabs:commons-governance:v1` untouched.
- [ ] Implement the versioned simulation store using only its own localStorage key.
- [ ] Run `npm run test:unit -- --run src/lib/workbench-simulation-store.test.ts` and `npm run build`.

### Task 4: Build the Workbench stage and source-selection surface

**Files:**
- Create: `src/components/workbench/WorkbenchStageNav.tsx`
- Create: `src/components/workbench/SchoolNeedSourcePicker.tsx`
- Create: `src/components/workbench/SimulationTrace.tsx`
- Create: `src/components/workbench/ExistingLocalActivity.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/styles.css`
- Modify: `README.md`
- Modify: `tests/e2e/workbench-simulation.spec.ts`

**Interfaces:**
- `WorkbenchStageNav({ stage, status, rollApplicable, onSelect })` presents the five stages using `WorkbenchViewStage` and current gate state. Completed stages may be reopened for inspection; future stages cannot be selected before their gate.
- `SchoolNeedSourcePicker({ drafts, selectedId, onSelect })` only exposes existing Console Tender drafts and reports an empty/unavailable state without changing them.
- `SimulationTrace({ events, stage, planSource })` renders the ordered simulation-only event history.
- `ExistingLocalActivity({ briefs, applications })` renders prior Workbench drafts and applications read-only.
- `FieldDesk.tsx` loads the Console snapshot, passes only `snapshot.tenderDrafts` to the source picker, and remains the route component exported as `Workbench`; `App.tsx` routes do not change.

- [ ] Add browser assertions for stage navigation, no-source empty state, source preview fields, and source-draft preservation after selection.
- [ ] Replace the old default three-opportunity cards and local application form as the primary Workbench surface with a one-case simulation workspace.
- [ ] Add the five-stage path, a focused source dossier, a simulation trace, and a visible persistent `SIMULATION` state.
- [ ] Add a read-only “Existing local activity” disclosure using `readWorkBriefDrafts()` and `readLocalWorkbench()` so prior drafts and application records remain accessible and unchanged; do not mount the old mutating opportunity-flow component.
- [ ] Update README's Workbench route description to explain the isolated simulation and retained local activity without claiming live publication or execution.
- [ ] Keep mobile stage navigation scroll-safe; keep the dossier first and the trace after it.
- [ ] Run the focused browser test and `npm run build`.

### Task 5: Implement the manual Tender candidate and simulation runner

**Files:**
- Create: `src/components/workbench/TenderCandidateForm.tsx`
- Create: `src/components/workbench/SimulationRunControls.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/lib/workbench-simulation.ts`
- Modify: `src/lib/workbench-simulation.test.ts`
- Modify: `tests/e2e/workbench-simulation.spec.ts`

**Interfaces:**
- `TenderCandidateForm({ source, plan, onChange, onStart })` edits a user-reviewed manual plan and lists missing facts/gates.
- `SimulationRunControls({ simulation, onAdvance, onPause, onResume, onCancel })` exposes only the next legal simulation action.
- Simulation records use `planSource: 'manual'` in this release.

- [ ] Test that blank source fields, invalid costs, incomplete required terms, skipped stages, cancellation, and repeated actions cannot produce a completed simulation.
- [ ] Add candidate fields for scope/outcome, packages, responsibilities by role type, dependencies, cost assumptions, compensation/rights/safety, and acceptance criteria.
- [ ] Add a review step that shows the complete plan and explicit `Run simulation` confirmation before starting.
- [ ] Implement manual stage progression through Tender review, Assembly simulation, delivery evidence, acceptance simulation, and physical Roll preview; keep hypothetical values explicitly scoped as scenario assumptions.
- [ ] End non-physical plans at accepted-work simulation with Roll not applicable.
- [ ] Persist each valid transition separately; cancellation leaves an incomplete trace and does not change the source draft.
- [ ] Run focused unit and browser tests and `npm run build`.

### Task 6: Add the unavailable Page Agent panel and guarded behavior

**Files:**
- Create: `src/components/workbench/PageAgentPanel.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/styles.css`
- Modify: `tests/e2e/workbench-simulation.spec.ts`

**Interfaces:**
- `PageAgentPanel({ sourcePreview })` explains that Page Agent is unavailable until protected model infrastructure exists; it exposes no retry/run action and makes no fetch/request.
- Do not create an API route, model config, API key setting, or Page Agent dependency in this plan.

- [ ] Add a browser test that intercepts network requests and proves rendering the unavailable panel makes no model request and sends no source payload externally.
- [ ] Add responsive side-panel/drawer presentation with source-scope summary and clear manual-planning alternative; do not add disabled controls that imply a retry path exists.
- [ ] Verify keyboard focus and reduced-motion behavior; if the mobile panel is modal, verify Escape closes it and focus returns to its trigger.
- [ ] Run the focused browser test and `npm run build`.

### Task 7: Complete route-level and isolation verification

**Files:**
- Modify: `tests/e2e/workbench-simulation.spec.ts`
- Modify: `src/components/workbench/*` only for defects found by tests
- Modify: `src/styles.css` only for responsive/accessibility defects found by tests

**Interfaces:**
- Preserve `/workspace/workbench` and `/workspace/field-desk` route behavior.
- No test may write simulation output to the School Console snapshot or existing Workbench/Commons keys.

- [ ] Exercise one physical school need from source preview through a Roll preview and assert all stages are labeled simulated.
- [ ] Exercise a non-physical need and assert the flow ends at acceptance with no Roll preview.
- [ ] Exercise malformed source storage, malformed simulation storage, unavailable model mode, cancel/restart, and legacy activity visibility.
- [ ] Verify excluded fields never appear in the rendered source preview or serialized simulation data.
- [ ] Review at phone, tablet, desktop, and wide desktop; check keyboard-only stage and form use.
- [ ] Run `npm run test:unit -- --run`, `npm run test:e2e`, and `npm run build`.

## Handoff

No implementation or commit is included in this plan. After review and approval, execute task-by-task using the user's chosen execution method and retain the current browser-local product boundary.
