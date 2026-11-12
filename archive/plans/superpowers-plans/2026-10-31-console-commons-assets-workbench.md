# Console–Commons–Assets–Workbench Simulation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Core implementation complete; 19 unit tests and production build pass. Manual browser review remains pending. The secondary composition view presents dependencies accessibly as text rather than adding a graph library.

**Goal:** Connect a selected School Console need draft to an optional Commons observation and optional asset record, then demonstrate its work-package composition through an isolated simulation in Workbench.

**Architecture:** Keep Vite + Preact and the existing routes. Treat the Console draft as the canonical need, Commons as the observation/review record, and Institutions as the asset/entity registry. Carry only stable references across modules; store simulation state under a new key and never write simulation output to source or production records. Page Agent is an unavailable, no-request panel until a protected model service is separately designed.

**Tech Stack:** Vite, Preact, TypeScript, Wouter, existing CSS tokens, Vitest for pure validation/state-transition tests. Use the existing shared browser for responsive/manual workflow review; do not add Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-workbench-school-simulation-design.md`

**Supersedes:** The earlier Workbench-only draft at `docs/superpowers/plans/2026-10-31-workbench-school-simulation.md`.

## Global Constraints

- Keep the active app Vite + Preact + TypeScript + Wouter; do not reintroduce Next.js.
- Keep `/workspace/workbench` and `/workspace/field-desk` as the existing Workbench routes.
- Do not add a backend, authentication, Page Agent package, model call, API key, or full school-management module.
- Console is canonical for the need; Commons and Institutions records remain authoritative in their own modules.
- The Console projection is limited to one selected draft's `assetName`, `need`, and optional `assetBuildCost`; `assetName` is never an asset ID.
- Learner names/IDs, marks, answers, grades, fee notes, lesson content, and unselected Console data never enter the Commons handoff, simulation, or agent panel.
- Commons signals may have no asset; Console handoff requires the user to select an existing institution. If none applies, keep the need Console-local.
- Optional Commons, institution, and asset context use separate stable IDs. Do not copy records or infer ownership, stewardship, provider availability, authority, or verification from a link.
- Remove the Mwea school-solar sample asset and edge; retain the school institution and recast the school-power example as asset-unresolved. Do not reuse the removed asset ID.
- Simulation data is isolated from School Console IndexedDB, Commons, People, Institutions, and existing Workbench drafts/applications.
- A Roll preview is physical-work-only and simulated; non-physical work ends at accepted-work simulation.
- Preserve existing records and storage formats. No generated prices, provider identities, capabilities, approvals, evidence, settlement, or deployed assets.

## Review Focus

- Legacy Commons signals missing `sourceConsoleDraftId` or with populated `assetName`: they still load and render without migration.
- New asset-free signal: it shows “Asset not identified,” creates no asset edge, and does not break search or Workbench context.
- Console IndexedDB read failure or malformed draft: source selection fails safely and never writes to the Console snapshot.
- Mismatched/unknown Commons or asset IDs: show unresolved context; never substitute a similarly named record.
- Simulation interruption, rejection, cancellation, corrupt storage, or non-physical work: preserve the last valid simulation and never emit a real-looking Roll.

---

### Task 1: Add focused domain tests

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/lib/local-workflows.test.ts`
- Create: `src/lib/workbench-simulation.test.ts`

**Interfaces:**
- Unit command: `npm run test:unit -- --run`.
- Unit tests cover pure data validation and simulation transitions; no DOM test environment is needed.

- [x] Add Vitest as a dev dependency and configure a single `test:unit` script. Do not add Playwright or any agent/state-machine/UI framework.
- [x] Add failing tests for backwards-compatible `FieldSignal` validation, source draft IDs, optional asset references, and a no-Roll non-physical simulation.
- [x] Run `npm run test:unit -- --run` and verify the new tests fail for the missing behavior.
- [x] Run `npm run build` to confirm test configuration does not alter production compilation.

### Task 2: Make Commons handoff and asset-free needs explicit

**Files:**
- Modify: `src/lib/local-workflows.ts`
- Modify: `src/lib/local-workflows.test.ts`
- Modify: `src/lib/ecosystem-examples.ts`
- Modify: `src/lib/people-network.ts`
- Modify: `src/pages/workspace/SchoolConsole.tsx`
- Modify: `src/pages/workspace/Commons.tsx`
- Modify: `src/pages/workspace/Institutions.tsx` only if a specific stale reference remains
- Modify: `src/styles.css`

**Interfaces:**
- Extend `FieldSignal` with optional `sourceConsoleDraftId?: string` and make `assetName?: string`; keep existing `institutionId` required.
- Add `createConsoleSignalLink(draftId: string): string`, returning `/workspace/commons?sourceConsoleDraftId=<encoded-id>` without creating a signal.
- Commons report submit stores the optional `sourceConsoleDraftId` only after user review and submit; the chosen `institutionId` must resolve against existing institution records.
- `ExampleFieldSignal.assetId` and `assetName` become optional only where the example describes an unlinked school need; no generic inferred asset fallback.

- [x] Test old saved signals with asset names, new signals without asset identity, optional Console source reference parsing, and required institution selection.
- [x] Add a **Review in Commons** link to each saved School Console need draft. It opens the prefilled editable Commons composer; it does not create the signal or change the draft.
- [x] Update Commons to accept/validate the source query parameter, prefill title/details from the selected Console draft through the allowlisted projection, and retain the reference on submit. Populate the institution selector only from registered institution records; require an explicit selection. When the draft or institution is unavailable, show an actionable error and do not create a signal.
- [x] Make asset/place optional on the Commons observation form and show “Asset not identified” in queue/detail displays when absent. Existing signals keep their current display.
- [x] Remove `asset-school-solar-classroom-system` and `asset-school-solar-school` from `PEOPLE_NETWORK` / `PEOPLE_RELATIONSHIPS`. Keep `mwea-school`.
- [x] Change the example signal builder so `scenario-school-power` has no `assetId` or `assetName`; keep its school context and uncertainty. Remove any derived Institutions asset result and dangling reference. Keep all other sample asset IDs stable.
- [x] Run focused unit tests and `npm run build`.

### Task 3: Define linked simulation provenance and state

**Files:**
- Create: `src/lib/workbench-simulation.ts`
- Create: `src/lib/workbench-simulation-store.ts`
- Modify: `src/lib/workbench-simulation.test.ts`
- Modify: `src/lib/workbench-simulation-store.test.ts`
- Read: `src/lib/school-console-storage.ts`
- Read: `src/lib/people-network.ts`

**Interfaces:**
- `SimulationSource` has `consoleDraftId`, the allowlisted Console fields `{ assetName, need, assetBuildCost }`, and optional `commonsSignalId`, `institutionId`, `assetRecordId`.
- The `assetName` in Console fields is source title only; `assetRecordId` is a separately resolved registry ID.
- `SimulationPlan` includes `workKind`, `scope`, optional `proposedOutputAssetName`, packages, cost assumptions, compensation/rights/safety, acceptance criteria, and unresolved facts.
- Export pure `selectSchoolNeedSource(snapshot, draftId, context?)`, `createWorkbenchSimulation(source, plan)`, `advanceWorkbenchSimulation(simulation, action)`, and `isRollApplicable(plan)` functions.
- Simulation storage key: `aptlabs:workbench-simulations:v1`; schema version `1`; plan source is `manual` in this release.

- [x] Test Console source allowlisting, stable-ID resolution, unresolved optional links, malformed context, source immutability, and absence of excluded Console fields in serialization.
- [x] Test valid Tender-review → Assembly → delivery → acceptance → deployment order; pause/resume; blocked/returned/rejected/cancelled terminal behavior; duplicate/skip rejection; and non-physical completion without Roll.
- [x] Test isolated-store round trip, unsupported version, malformed JSON, delete-one behavior, and preservation of existing Console/Commons/Workbench storage keys.
- [x] Implement the pure domain/state machine and versioned store. A proposed output name remains simulation-only and is never added to Institutions.
- [x] Run `npm run test:unit -- --run` and `npm run build`.

### Task 4: Redesign Workbench around the connected need

**Files:**
- Create: `src/components/workbench/WorkbenchStageNav.tsx`
- Create: `src/components/workbench/SchoolNeedSourcePicker.tsx`
- Create: `src/components/workbench/TenderCandidateForm.tsx`
- Create: `src/components/workbench/SimulationRunControls.tsx`
- Create: `src/components/workbench/SimulationTrace.tsx`
- Create: `src/components/workbench/ExistingLocalActivity.tsx`
- Create: `src/components/workbench/PageAgentPanel.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/styles.css`
- Modify: `README.md`

**Interfaces:**
- `WorkbenchStageNav({ stage, status, rollApplicable })` shows Need → Tender → Assembly → Acceptance → Roll; future stages stay gated until valid transitions.
- `SchoolNeedSourcePicker({ drafts, selectedId, onSelect })` receives only `snapshot.tenderDrafts` and exposes source title, need, and optional cost.
- `TenderCandidateForm({ source, context, plan, onChange, onStart })` edits the simulation plan and lists missing facts/gates.
- `SimulationRunControls({ simulation, onAdvance, onPause, onResume, onCancel })` exposes only the next legal simulation action.
- `PageAgentPanel({ sourcePreview })` displays an unavailable state and manual-planning alternative; no fetch/request or dead retry control.
- `ExistingLocalActivity({ briefs, applications })` renders prior Workbench records read-only.

- [x] Add a focused dossier layout with a persistent SIMULATION boundary, five-stage stepper, source provenance, linked Commons/asset references, and one active work surface; preserve the Studio shell and mobile-first order.
- [x] Source Console drafts read-only through `loadConsoleSnapshot()`. Show optional Commons/asset selectors resolved by stable ID; an absent/missing asset remains unresolved.
- [x] Add role-package composition for teaching deliverables, school services (such as Wi-Fi installation/maintenance), and learning-environment work (such as floor-design proposals). These are scenario types, not claims of school demand or registered assets.
- [x] Show the package list by default; expose a keyboard-accessible secondary composition view that names package dependencies. Avoid KPI cards, fabricated providers, and generalized school-role dashboards.
- [x] Implement manual plan review/confirmation and stage progression, including incomplete gates, pause/cancel, physical Roll preview, and non-physical “Roll not applicable.”
- [x] Add the no-request Page Agent panel and read-only “Existing local activity” disclosure. Do not mount the old mutating opportunity/apply/review simulation flow.
- [x] Update README to describe the Console → Commons → optional asset → Workbench simulation and its local/provenance boundaries.
- [x] Run `npm run test:unit -- --run` and `npm run build`.

### Task 5: Validate the full module chain and presentation

**Files:**
- Modify: `src/lib/local-workflows.test.ts`
- Modify: `src/lib/workbench-simulation.test.ts`
- Manual browser verification: School Console, Commons, Institutions, Workbench

- [ ] Verify Console draft handoff prepopulates Commons but does not submit until the user reviews and confirms; confirm institution selection is required and learner fields never appear.
- [ ] Verify an asset-free Commons signal displays correctly, keeps its source Console ID, and creates no asset relationship.
- [ ] Verify the Institutions register no longer shows the Mwea solar sample asset and no relationships point to its removed ID; retain the Mwea school institution.
- [ ] Run the physical school-need scenario from source preview to Roll preview; verify every simulated state is labeled and no production data store changes.
- [ ] Run an asset-free, non-physical scenario and confirm it ends at accepted-work simulation without Roll.
- [ ] Verify old Commons signals, Console IndexedDB snapshots, Workbench drafts/applications, and `/workspace/field-desk` remain readable.
- [ ] Inspect desktop/mobile layout, keyboard/focus, no-source/empty/error states, and no-agent-request behavior in the shared browser.
- [x] Run `npm run test:unit -- --run` and `npm run build`.

## Handoff

The approved implementation is in the working tree and has not been committed. Automated unit tests and the production build pass. A manual browser pass for the complete handoff, responsive layout, and keyboard/focus behavior remains pending; do not add backend, authentication, or Page Agent model connectivity as part of this plan.
