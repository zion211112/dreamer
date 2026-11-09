# Premium Local-Demo Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the premium shared workspace shell and five complete demo-mode workflows without implying external work or authority.

**Architecture:** Keep the five-module Preact/Wouter shell and each domain's existing data boundary. Add the capacity-matching flow with its own validated draft store, expose the existing opportunity application flow, and connect Commons and School Console to Workbench with explicit source IDs. The engine dock remains disconnected; no model, MCP, backend, or autonomous action is added.

**Tech Stack:** Preact 10, TypeScript, Wouter, Vite, Vitest, existing CSS tokens, localStorage, IndexedDB, and demo-mode fixtures.

**Spec:** [2026-11-07-engine-first-workspace-shell-design.md](../specs/2026-11-07-engine-first-workspace-shell-design.md)

## Global Constraints

- Keep exactly five primary modules in charter order: Commons, Network, Workbench, Records, Intelligence.
- Reuse existing Preact/Wouter routes, shared shell, domain entities, evidence, and local-workflow patterns; do not introduce a new UI framework, backend, or dependency.
- Keep each demo's data source and store separate; do not merge them into a synthetic shared dataset.
- Keep the illustrative capacity scenario isolated and visibly labeled; do not mix it into real profiles or silently mutate People Network seed data.
- In demo mode, keep Records on its existing demo fixtures/local Roll store; preserve its configured Records API behavior.
- Do not present illustrative values as observed distance, availability, provenance, or history; label synthetic scenario data. Never fabricate run state, online state, or successful writes.
- Keep Person, Crew, Asset, Work, Institution, and Evidence distinct. Capabilities and capacity are claims with scope and provenance, not verification badges.
- Local application, authorization, delivery, acceptance, and settlement states remain distinct; local states never imply external contact, payment, or legally effective authorization.
- The agent cannot contact a provider, represent consent, commit capacity, authorize or execute work, accept delivery, or settle payment.
- Preserve visible focus, keyboard operation, reduced-motion behavior, sufficient contrast, and the 320px no-horizontal-overflow requirement.
- Run `npm run build` and `npm run test:unit -- --run` after each implementation task.

## Review Focus

1. **Cross-flow IDs are missing, stale, or mismatched:** show an unresolved-reference error and do not silently select a replacement; Task 5 tests encoded links and manually verifies stale-source behavior.
2. **Browser storage is blocked, over quota, malformed, or unsupported:** report the failing operation, preserve input, and never overwrite invalid saved bytes; Tasks 3 and 6 test these cases.
3. **Demo mode and configured Records mode differ:** render only the relevant source's data and surface query errors instead of showing a false empty state; Task 7 covers the demo/query contract.
4. **Application and work states are advanced out of order:** reject invalid transitions and keep selection distinct from authorization and acceptance; Task 6 tests the full lifecycle and invalid transitions.
5. **Narrow viewport, keyboard selection, or dismissible panels:** retain navigation, restore focus, and avoid horizontal overflow; Task 8 verifies 1440px, 768px, 390px, and 320px.

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/workspace-activity.ts` and `.test.ts` | Engine run-state types and exact status-label mapping. |
| `src/components/EngineActivityStrip.tsx` | Truthful shared activity/status strip and dismissible tray. |
| `src/components/EngineCommandDock.tsx` | Disconnected command surface with request controls unavailable. |
| `src/components/WorkspaceQuickSearch.tsx` | Accessible topbar search over implemented module and task destinations. |
| `src/lib/workspace-search.ts` and `.test.ts` | Searchable destination registry and case-insensitive filtering. |
| `src/components/WorkspaceShell.tsx` | Mount the strip across modules, replace the static status footer, preserve inspector/dock and Records hash behavior. |
| `src/components/StudioNavigation.tsx` | Semantic module icons, active state, Workbench task navigation, responsive sidebar behavior. |
| `src/lib/studio-navigation.ts` and `.test.ts` | Five primary destinations and real Workbench task/view contexts. |
| `src/lib/workbench-capacity.ts` and `.test.ts` | Isolated illustrative need/candidate/evidence data and pure filter/sort projection. |
| `src/lib/workbench-capacity-drafts.ts` and `.test.ts` | Draft validation and versioned browser-local storage. |
| `src/components/workbench/CapacityCandidateList.tsx` | Search/filter/sort controls and keyboard-operable result rows. |
| `src/components/workbench/CapacityRecordInspector.tsx` | Candidate evidence, fit, missing checks, and reversible shortlist action. |
| `src/components/workbench/CapacityDraftForm.tsx` | Editable local draft and field-level validation. |
| `src/components/workbench/WorkbenchCapacity.tsx` | Capacity flow view state and saved-draft presentation. |
| `src/pages/workspace/WorkbenchCapacityFinder.tsx` | Capacity landing route and draft-store boundary. |
| `src/pages/workspace/WorkbenchFinder.tsx` | Preserve local examples and approved-proposal brief at `/examples`. |
| `src/lib/local-workflows.ts` and `.test.ts` | Tested School-Console-to-Workbench simulation URL builder. |
| `src/modules/assets/school-console/index.tsx` | Link a saved local need into Workbench simulation without changing its source. |
| `src/pages/workspace/FieldDesk.tsx` and `field-desk/useWorkbench.ts` | Preserve source IDs on simulation entry and return to capacity matching. |
| `src/pages/workspace/WorkbenchApplications.tsx` | Shared-shell routes for opportunities, review/authorization, and delivery review. |
| `src/pages/workspace/WorkbenchOpportunityFlow.tsx` | Existing local application/review/delivery lifecycle UI with phase filtering. |
| `src/lib/local-workbench.ts` and `src/lib/local-workbench.test.ts` | Testable local opportunity state transitions and storage validation. |
| `src/components/workbench/WorkbenchOpportunityBrowser.tsx` | Preserve local-example discovery and point simulation navigation at the real route. |
| `src/pages/workspace/Commons.tsx` | Open approved proposals into the preserved work-brief route. |
| `src/pages/workspace/Records.tsx` | Preserve Records data behavior and report loading/query errors distinctly from empty data. |
| `src/lib/db/roll.test.ts` | Existing demo Roll fixture/query behavior. |
| `src/App.tsx` | Capacity, plan, examples, field-desk, opportunities, review, and delivery routes. |
| `src/styles.css` | Shared shell, activity strip, and workflow-specific premium responsive styling. |

## Task 1: Refine the Shared Shell and Activity Surface

**Files:**
- Create: `src/lib/workspace-activity.ts`
- Test: `src/lib/workspace-activity.test.ts`
- Create: `src/lib/workspace-search.ts`
- Test: `src/lib/workspace-search.test.ts`
- Create: `src/components/EngineActivityStrip.tsx`
- Create: `src/components/EngineCommandDock.tsx`
- Create: `src/components/WorkspaceQuickSearch.tsx`
- Modify: `src/components/WorkspaceShell.tsx`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces `EngineRunStatus = 'queued' | 'running' | 'completed' | 'blocked' | 'failed' | 'cancelled'`.
- Produces `EngineRunSummary { id: string; status: EngineRunStatus; summary: string; pendingProposalCount: number }`.
- Produces `getEngineActivityStatus(status: EngineRunStatus | null): string`; `null` returns `No active runs`, and each status returns its title-cased label.
- `EngineActivityStrip` receives `{ runs: readonly EngineRunSummary[]; agentAvailable: boolean; runtimeLabel: string; storageLabel: string; ledgerHeadHash: string | null }`. This implementation passes `runs=[]` and `agentAvailable=false`; runtime and storage labels are derived from the current environment and module context, not guessed from a generic demo flag. It preserves the existing Records ledger-head value in the status strip.
- `WorkspaceSearchDestination` is `{ id: string; label: string; module: string; href: string }`; `filterWorkspaceDestinations(query: string, destinations: readonly WorkspaceSearchDestination[]): WorkspaceSearchDestination[]` searches label/module case-insensitively without changing destination order.
- Search is a client-side navigation search over implemented modules/tasks only, not a record-content search or cross-domain data fetch. Add destinations in Tasks 4 and 6 only when their routes exist.

- [ ] **Step 1: Write failing status/search tests** named `reportsNoActiveRunsForNull`, `labelsEachRunState`, `searchesDestinationLabelsAndModuleNames`, and `returnsNoMatchesForUnknownDestination`.
- [ ] **Step 2: Run the focused activity test** and verify it fails because the helper is not exported.

Run: `npm run test:unit -- --run src/lib/workspace-activity.test.ts src/lib/workspace-search.test.ts`

Expected: FAIL because both new helpers are missing.

- [ ] **Step 3: Implement the status/search helpers.** Count only queued/running runs as active and sum `pendingProposalCount` for review; filter the destination registry case-insensitively while preserving order.
- [ ] **Step 4: Implement the activity strip, disconnected dock, and quick search.** With no adapter, show truthful zero counts and an “Agent not connected” dock whose input/submission are unavailable. A nonzero pending-proposal count opens the review tray; live/status text is screen-reader announced. The topbar search returns only implemented module/task destinations, has no-results feedback, opens via its button or Ctrl/Cmd+K, closes on Escape, and restores focus. Replace, do not duplicate, the static footer; preserve the Records hash display and existing inspector/change-set behavior.
- [ ] **Step 5: Refine shared navigation and shell styling.** Replace the generic Workbench tile and Intelligence clock glyphs with semantic line icons. Align icon, active marker, module accent, and sidebar heading; provide discoverable names and hover/focus tooltips. Keep the product identity, workspace context, global navigation search, and user affordance visible in Workbench without adding an environment switcher. Show truthful runtime and module-specific storage context in the bottom strip (including demo fixtures/local Roll versus configured Records API), without implying all modules share a backend. Use existing design tokens, visible focus, and responsive strip/tray/dock layouts.
- [ ] **Step 6: Run focused and repository gates.**

Run: `npm run test:unit -- --run src/lib/workspace-activity.test.ts src/lib/workspace-search.test.ts`

Expected: PASS all null/state-label cases.

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS.

- [ ] **Step 7: Commit the shell increment.**

```bash
git add src/lib/workspace-activity.ts src/lib/workspace-activity.test.ts src/lib/workspace-search.ts src/lib/workspace-search.test.ts src/components/EngineActivityStrip.tsx src/components/EngineCommandDock.tsx src/components/WorkspaceQuickSearch.tsx src/components/WorkspaceShell.tsx src/components/StudioNavigation.tsx src/styles.css
git commit -m "feat: refine shared workspace shell" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 2: Add the Isolated Capacity Scenario and Projection

**Files:**
- Create: `src/lib/workbench-capacity.ts`
- Test: `src/lib/workbench-capacity.test.ts`

**Interfaces:**
- Produces `CapacityNeed`, `CapacityCandidate`, `CapacityEvidence`, `CapacityFilters`, `CapacitySort`, `KIRINYAGA_CAPACITY_SCENARIO`, and `filterCapacityCandidates(candidates, filters)`.
- `CapacityCandidate.recordBasis` and `CapacityEvidence.recordBasis` are the literal `'illustrative'`.
- `CapacityFilters` is `{ query: string; hasEvidence: boolean; withinKm: number | null; sortBy: 'distance' | 'capacity' }`. Trim query; blank is unfiltered; `hasEvidence: true` requires evidence; `withinKm: null` adds no distance restriction.
- `filterCapacityCandidates(candidates: readonly CapacityCandidate[], filters: CapacityFilters): CapacityCandidate[]` returns a new array without mutating input.
- Scenario capacity values use one comparable unit/period. Sort distance nearest-first and capacity highest-first; preserve source order for ties.

- [ ] **Step 1: Write failing projection tests** named `searchesCandidateNameLocationAndCapability`, `requiresEvidenceOnlyWhenRequested`, `filtersByMaximumDistance`, `sortsByDistanceOrReportedCapacity`, `returnsSourceOrderForSortTies`, `returnsNoMatchesForUnknownQuery`, and `doesNotMutateScenarioRecords`. Assert case-insensitive search, combined filters, and no fabricated “verified” status.
- [ ] **Step 2: Run the focused test** and verify the projection export is missing.

Run: `npm run test:unit -- --run src/lib/workbench-capacity.test.ts`

Expected: FAIL because the new API is not implemented.

- [ ] **Step 3: Implement the typed illustrative scenario and projection.** Include need institution, quantity/unit, date range and location; candidate entity type, name, location, capabilities, reported capacity/unit/period, illustrative scenario distance, unknown availability unless explicitly supplied by the fixture, and evidence source/date. Label every seed record illustrative and never present scenario values as observed real-world facts. Search only candidate name, type, location, and capabilities.
- [ ] **Step 4: Run focused and repository gates.**

Run: `npm run test:unit -- --run src/lib/workbench-capacity.test.ts`

Expected: PASS all projection tests.

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS.

- [ ] **Step 5: Commit the scenario.**

```bash
git add src/lib/workbench-capacity.ts src/lib/workbench-capacity.test.ts
git commit -m "feat: add illustrative capacity scenario" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 3: Validate and Persist Capacity Drafts

**Files:**
- Create: `src/lib/workbench-capacity-drafts.ts`
- Test: `src/lib/workbench-capacity-drafts.test.ts`
- Consume: `src/lib/workbench-capacity.ts`

**Interfaces:**
- Produces `WorkbenchCapacityDraftInput { title: string; targetVolume: number; startDate: string; endDate: string; candidateIds: string[] }`.
- Produces `WorkbenchCapacityDraft`, adding a local `id`, literal `status: 'draft'`, and ISO `createdAt`/`updatedAt`.
- Produces `WorkbenchCapacityDraftErrors = Partial<Record<'title' | 'targetVolume' | 'startDate' | 'endDate' | 'candidateIds', string>>`.
- `validateWorkbenchCapacityDraft(input): WorkbenchCapacityDraftErrors` returns an empty object only when valid.
- `readWorkbenchCapacityDrafts(): WorkbenchCapacityDraft[]` returns `[]` only when the key is absent; `saveWorkbenchCapacityDraft(input): WorkbenchCapacityDraft` validates before writing and returns the saved record.
- Persist `{ version: 1, drafts: [...] }` only under `aptlabs:workbench-capacity-drafts:v1`.

- [ ] **Step 1: Write failing tests** named `requiresTrimmedTitleAndPositiveFiniteVolume`, `rejectsImpossibleOrReversedDates`, `requiresKnownUniqueCandidateIds`, `roundTripsUsingDedicatedVersionedKey`, `rejectsMalformedOrUnsupportedDataWithoutOverwriting`, and `reportsBlockedReadsAndQuotaWrites`.
- [ ] **Step 2: Run the focused test** and verify the draft API is missing.

Run: `npm run test:unit -- --run src/lib/workbench-capacity-drafts.test.ts`

Expected: FAIL because the new API is not implemented.

- [ ] **Step 3: Implement validation and storage.** Validate actual `YYYY-MM-DD` dates with `endDate >= startDate`; require a trimmed non-empty title, finite positive volume, at least one candidate ID, and IDs present in the illustrative scenario. Parse saved JSON as `unknown`; on malformed, unsupported, blocked, or quota errors, throw descriptive errors and preserve stored bytes.
- [ ] **Step 4: Run focused and repository gates.**

Run: `npm run test:unit -- --run src/lib/workbench-capacity-drafts.test.ts`

Expected: PASS validation, versioning, round-trip, and storage-error tests.

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS.

- [ ] **Step 5: Commit the draft store.**

```bash
git add src/lib/workbench-capacity-drafts.ts src/lib/workbench-capacity-drafts.test.ts
git commit -m "feat: persist local capacity drafts" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 4: Build Capacity Matching and the Workbench Landing Route

**Files:**
- Create: `src/components/workbench/CapacityCandidateList.tsx`
- Create: `src/components/workbench/CapacityRecordInspector.tsx`
- Create: `src/components/workbench/CapacityDraftForm.tsx`
- Create: `src/components/workbench/WorkbenchCapacity.tsx`
- Create: `src/pages/workspace/WorkbenchCapacityFinder.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/studio-navigation.ts`
- Modify: `src/lib/studio-navigation.test.ts`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/lib/workspace-search.ts`
- Modify: `src/lib/workspace-search.test.ts`
- Modify: `src/pages/workspace/WorkbenchFinder.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/components/workbench/WorkbenchOpportunityBrowser.tsx`
- Modify: `src/styles.css`
- Add route: `/workspace/workbench/plan`
- Consume: `src/lib/workbench-capacity.ts`, `src/lib/workbench-capacity-drafts.ts`

**Interfaces:**
- `CapacityCandidateListProps` is `{ candidates: readonly CapacityCandidate[]; query: string; onQueryChange(query: string): void; hasEvidence: boolean; onHasEvidenceChange(value: boolean): void; within15Km: boolean; onWithin15KmChange(value: boolean): void; sortBy: CapacitySort; onSortChange(value: CapacitySort): void; selectedId: string | null; shortlistedIds: ReadonlySet<string>; onSelect(id: string): void; onToggleShortlist(id: string): void }`.
- `CapacityRecordInspectorProps` is `{ candidate: CapacityCandidate | null; shortlisted: boolean; onToggleShortlist(): void; onClose(): void }`.
- `CapacityDraftFormProps` is `{ candidateIds: readonly string[]; onSave(input: WorkbenchCapacityDraftInput): void; onBack(): void; saving: boolean; saveError: string }`.
- `WorkbenchCapacityProps` is `{ view: 'matching' | 'plan'; planCandidateIds: readonly string[]; savedDrafts: readonly WorkbenchCapacityDraft[]; onSaveDraft(input: WorkbenchCapacityDraftInput): void; saving: boolean; storageError: string; saveError: string }`.
- `WorkbenchCapacityFinder({ view }: { view: 'matching' | 'plan' })` mounts at `/workspace/workbench` and `/workspace/workbench/plan`; the plan route reads repeated `candidateId` query parameters and explicitly reports unknown IDs.
- Continue-to-plan encodes the shortlisted IDs as repeated `candidateId` parameters. Opening the plan route without IDs shows a useful empty state and a link back to Find capacity; it does not persist or invent a shortlist.
- Preserve `/workspace/workbench/examples` for `WorkbenchFinder` and `/workspace/workbench/field-desk` for simulation.

- [ ] **Step 1: Extend navigation tests** for `workbench:examples` and `workbench:plan` while asserting exactly five primary module destinations.
- [ ] **Step 2: Implement route and navigation mapping.** Route capacity at `/workspace/workbench`, route its plan view at `/workspace/workbench/plan`, preserve `WorkbenchFinder` at `/workspace/workbench/examples`, set active contexts, and expose only implemented destinations: Find capacity, Build a work plan, Local examples, Field desk, and School Console. Point the generic Local examples “Create / simulate” action to the real Field desk route, which retains its existing source-selection/saved-simulation behavior. Add destinations to global search only with their real route; use exact/specific Wouter routes so the root capacity route does not capture nested routes.
- [ ] **Step 3: Implement candidate rows and inspector.** Each compact row shows entity type, name, location, reported capacity/unit, and the most useful source or gap. Use semantic controls and pressed state; show issuer/date where known, missing availability, and fit reasons traceable to candidate attributes/evidence. Provide a reversible shortlist action. Do not add a match score or a dead full-record action.
- [ ] **Step 4: Implement matching and draft navigation.** Keep the need summary visible; derive result count and rows from the pure projection; show a meaningful no-results state; keep selected and shortlisted IDs separate; continue is disabled for an empty shortlist. Continue encodes shortlisted IDs into the plan route. The plan view reports stale IDs rather than substituting candidates, and an empty shortlist state links back to Find capacity. The narrow-screen inspector opens only after row selection and restores focus on close. Align the preserved Local examples route to the same shell hierarchy without replacing its interest behavior.
- [ ] **Step 5: Wire the draft store.** Load and render saved local drafts; keep matching usable if a read fails; save only shortlisted IDs; expose unresolved availability/evidence checks; preserve form values and show errors on validation/write failure. Report local success without implying authorization.
- [ ] **Step 6: Run navigation/projection/draft tests and repository gates.**

Run: `npm run test:unit -- --run src/lib/studio-navigation.test.ts src/lib/workspace-search.test.ts src/lib/workbench-capacity.test.ts src/lib/workbench-capacity-drafts.test.ts`

Expected: PASS all targeted tests.

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS.

- [ ] **Step 7: Commit matching and route integration.**

```bash
git add src/components/workbench/CapacityCandidateList.tsx src/components/workbench/CapacityRecordInspector.tsx src/components/workbench/CapacityDraftForm.tsx src/components/workbench/WorkbenchCapacity.tsx src/pages/workspace/WorkbenchCapacityFinder.tsx src/App.tsx src/lib/studio-navigation.ts src/lib/studio-navigation.test.ts src/components/StudioNavigation.tsx src/lib/workspace-search.ts src/lib/workspace-search.test.ts src/pages/workspace/WorkbenchFinder.tsx src/pages/workspace/FieldDesk.tsx src/components/workbench/WorkbenchOpportunityBrowser.tsx src/styles.css
git commit -m "feat: add Workbench capacity matching" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 5: Connect Commons and School Console to Workbench

**Files:**
- Modify: `src/lib/local-workflows.ts`
- Test: `src/lib/local-workflows.test.ts`
- Modify: `src/pages/workspace/Commons.tsx`
- Modify: `src/pages/workspace/WorkbenchFinder.tsx`
- Modify: `src/modules/assets/school-console/index.tsx`
- Consume: `/workspace/workbench/examples` and `/workspace/workbench/field-desk`

**Interfaces:**
- Produces `createWorkbenchSimulationLink(sourceConsoleDraftId: string, signalId?: string): string`; it rejects a blank draft ID and URL-encodes each ID.
- Approved proposal links target `/workspace/workbench/examples?proposal=<encoded id>`.
- School Console draft links and approved-brief simulation links target `/workspace/workbench/field-desk` with `sourceConsoleDraftId` and optional `signal` query parameters.

- [ ] **Step 1: Write failing link-builder tests** named `buildsEncodedSimulationLinkWithDraftAndSignal`, `omitsMissingSignal`, and `rejectsBlankDraftId`.
- [ ] **Step 2: Run the focused test** and verify the helper is missing.

Run: `npm run test:unit -- --run src/lib/local-workflows.test.ts`

Expected: FAIL because `createWorkbenchSimulationLink` is not exported.

- [ ] **Step 3: Implement the route handoffs.** Update Commons' approved-proposal action to `/examples?proposal=…`; use the link helper from the approved work brief; add “Open in Workbench simulation” to each saved School Console need draft. Do not write to the source draft when opening simulation.
- [ ] **Step 4: Verify stale and mismatched references.** An unknown draft/signal remains an explicit unresolved error; an unknown or unapproved proposal remains an explicit error. No link silently chooses another record.
- [ ] **Step 5: Refine the handoff surfaces.** Place the simulation action with its saved Console draft and align the Commons proposal/Workbench brief transition with the shared evidence, local-state, and focus grammar; preserve the existing simulation save/resume behavior and do not rebuild either form.
- [ ] **Step 6: Run focused and repository gates.**

Run: `npm run test:unit -- --run src/lib/local-workflows.test.ts src/lib/workbench-simulation-store.test.ts`

Expected: PASS link encoding, existing Commons/work-brief, and simulation save/resume tests.

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS.

- [ ] **Step 7: Commit the cross-flow handoffs.**

```bash
git add src/lib/local-workflows.ts src/lib/local-workflows.test.ts src/pages/workspace/Commons.tsx src/pages/workspace/WorkbenchFinder.tsx src/modules/assets/school-console/index.tsx
git commit -m "feat: connect local workflows across modules" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 6: Expose the Local Opportunity-to-Delivery Workflow

**Files:**
- Create: `src/pages/workspace/WorkbenchApplications.tsx`
- Create: `src/lib/local-workbench.test.ts`
- Modify: `src/lib/local-workbench.ts`
- Modify: `src/App.tsx`
- Modify: `src/lib/studio-navigation.ts`
- Modify: `src/lib/studio-navigation.test.ts`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/lib/workspace-search.ts`
- Modify: `src/lib/workspace-search.test.ts`
- Modify: `src/pages/workspace/WorkbenchOpportunityFlow.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Adds `workbench:applications`, `workbench:review`, and `workbench:delivery` to `StudioContext`, all mapped to the Workbench module.
- `WorkbenchApplications({ view }: { view: 'opportunities' | 'review' | 'delivery' })` wraps the existing flow in `WorkspaceLayout` at `/workspace/workbench/applications`, `/workspace/workbench/review`, and `/workspace/workbench/delivery`.
- `filterLocalWorkbenchApplications(applications: readonly LocalWorkApplication[], applicant: string, phase?: 'review' | 'delivery'): LocalWorkApplication[]` filters the current applicant's records without mutation. Delivery includes `workStatus` in-progress, submitted, changes-requested, and accepted; review includes the remaining submitted, under-review, selected, declined, authorization-pending, and authorized records.
- `WorkbenchOpportunityFlow({ view: 'opportunities' | 'my-work'; phase?: 'review' | 'delivery' })` remains the single local application/work UI and uses the selector for phase views.

- [ ] **Step 1: Write lifecycle and phase-filter tests** named `createsLocalApplicationWithoutExternalSubmission`, `requiresReviewBeforeDecision`, `keepsSelectionDistinctFromAuthorization`, `requiresAuthorizationBeforeWorkStarts`, `requiresDeliveryEvidenceAndReviewNote`, `recordsAcceptanceOrRequestedChangesSeparately`, `filtersReviewAndAuthorizationRecords`, and `filtersDeliveryRecords`. Assert phase filtering is immutable and includes every eligible state.
- [ ] **Step 2: Run the focused test** and verify lifecycle cases pass while phase-filter cases fail because the selector is not exported.

Run: `npm run test:unit -- --run src/lib/local-workbench.test.ts`

Expected: FAIL only for the missing phase selector.

- [ ] **Step 3: Implement `filterLocalWorkbenchApplications`** in `src/lib/local-workbench.ts`. Filter by applicant without mutating input; classify delivery first by `workStatus` in-progress, submitted, changes-requested, or accepted, then classify remaining submitted, under-review, selected, declined, authorization-pending, or authorized records as review. Do not duplicate delivery records in review.
- [ ] **Step 4: Add invalid-transition and storage-failure tests.** Name them `rejectsOutOfOrderTransitionsWithoutMutatingRecord` and `surfacesMalformedReadsAndStorageFailures`; change existing lifecycle functions only if a test exposes a defect.
- [ ] **Step 5: Implement the three Workbench views and nav.** Wrap the existing flow with the shared shell; route Opportunities, Review & authorize, and Track delivery to the real corresponding views; expose each sidebar/global-search destination only after its route exists. Keep opportunity scope, deliverables, acceptance criteria, terms, and payment context visible.
- [ ] **Step 6: Refine the application/delivery surface.** Add only the markup hooks or accessibility fixes needed to align hierarchy and status grammar with the premium shell; retain distinct Submitted, Under review, Selected, Authorization pending, Authorized (local), In progress, Delivery submitted, Changes requested, and Accepted (local) states. Keep every transition an explicit human action; do not add settlement or payment state.
- [ ] **Step 7: Run focused and repository gates.**

Run: `npm run test:unit -- --run src/lib/local-workbench.test.ts src/lib/studio-navigation.test.ts src/lib/workspace-search.test.ts`

Expected: PASS lifecycle, storage, and navigation tests.

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS.

- [ ] **Step 8: Commit the opportunity workflow.**

```bash
git add src/pages/workspace/WorkbenchApplications.tsx src/lib/local-workbench.ts src/lib/local-workbench.test.ts src/App.tsx src/lib/studio-navigation.ts src/lib/studio-navigation.test.ts src/components/StudioNavigation.tsx src/lib/workspace-search.ts src/lib/workspace-search.test.ts src/pages/workspace/WorkbenchOpportunityFlow.tsx src/styles.css
git commit -m "feat: expose local opportunity delivery workflow" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 7: Make Records Review Truthful and Resilient

**Files:**
- Modify: `src/pages/workspace/Records.tsx`
- Verify with: `src/lib/db/roll.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- `Records` keeps using `queryRollEntries({ limit: 50 })` and the existing demo/configured API behavior.
- The view distinguishes loading, query error, empty results, and populated history. A query error is not an empty success.

- [ ] **Step 1: Review existing Roll tests** and confirm demo fixtures, local entries, and demo storage/query errors are covered; do not duplicate them, change the data provider, or seed accepted history.
- [ ] **Step 2: Implement explicit Records error state.** Catch the query rejection, stop loading, show an alert with the existing error, and retain an honest empty state only when the successful query returns no rows. Derive the Roll count from loaded entries; hide or mark Canon/Annals counts unavailable rather than showing placeholder zeroes.
- [ ] **Step 3: Refine Records hierarchy within the shared design system.** Preserve evidence layers, acceptance details, revision history, and links back to related records where available; do not replace them with decorative metrics.
- [ ] **Step 4: Run focused and repository gates.**

Run: `npm run test:unit -- --run src/lib/db/roll.test.ts`

Expected: PASS demo fixtures, local entries, and demo storage/query-error tests.

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS.

- [ ] **Step 5: Commit the Records finish.**

```bash
git add src/pages/workspace/Records.tsx src/styles.css
git commit -m "fix: surface Records loading and query errors" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 8: Run the Five-Flow Visual and Interaction Finish Gate

**Files:**
- Modify only files exposed by failed checks in Tasks 1–7.

- [ ] **Step 1: Verify the five end-to-end flows in demo mode.** Commons signal→approved proposal→work brief; capacity→shortlist→saved draft; School Console need→saved simulation; opportunity→application→delivery review; Records evidence→acceptance/history.
- [ ] **Step 2: Verify shared shell behavior.** Confirm exactly five rail modules, module-specific sidebar links, semantic active icons, truthful runtime status, zero fake runs/proposals, and a disconnected command dock with no submission.
- [ ] **Step 3: Inspect every workflow at 1440px and representative routes at 768px, 390px, and 320px.** Capture local screenshots for review. Confirm compact evidence-first hierarchy, no generic hero/card-grid treatment, no horizontal overflow, discoverable rail links, accessible inspector/tray/dock, visible focus, and focus restoration.
- [ ] **Step 4: Verify keyboard-only operation, screen-reader status updates, reduced-motion, validation, empty, local-save, storage-error, and unresolved-source states.** Confirm identifiers survive Commons/School Console handoffs and any existing Opportunity/Records links; opening a simulation never mutates its source.
- [ ] **Step 5: Rerun the repository gates.**

Run: `npm run build` and `npm run test:unit -- --run`

Expected: both PASS; no unresolved route, state, rendering, or interaction errors.

- [ ] **Step 6: Commit only observed verification fixes** with the required Co-authored-by trailer.

## Implementation Handoff Notes

- This plan implements the approved shared shell and five local workflows; it does not add an AI provider, MCP, autonomous agent, or backend.
- Keep capacity claims illustrative and every other demo's local/fixture/API state explicit.
- Do not stage the repository's pre-existing untracked reference images.
