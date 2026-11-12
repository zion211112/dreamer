# School Console Nested Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the core local School Console as a refined nested app opened from the School Management Console asset.

**Architecture:** Add Preact-native console domain/storage modules that preserve the historical IndexedDB snapshot contract and deterministic marking rules. Build one focused responsive console surface with teacher and principal modes, then route the Institutions asset directly into it and retire only the temporary Workbench-specific console intake.

**Tech Stack:** Vite, Preact, TypeScript, Wouter, IndexedDB, existing CSS tokens and components.

**Spec:** [2026-10-30-school-console-port-design.md](../specs/2026-10-30-school-console-port-design.md)

## Global Constraints

- The active application remains Vite + Preact + TypeScript + Wouter; do not reintroduce Next.js or a backend.
- The School Console database remains `apt-labs-school-console`, object store `local-work`, snapshot key `school-console-v1`.
- School/classroom records remain local and separate from Commons and Workbench; no implicit synchronization or learner payload handoff.
- Auto-Marking is deterministic, typed-data-only, provisional, and teacher-reviewed; no Fikra API or model calls.
- Tender records are local unpublished drafts; no publication, contributor assignment, or live opportunity state.
- Do not add a dependency unless implementation demonstrates a concrete need. The active package currently has no test runner; use build and focused browser verification rather than introducing tooling for this slice.
- Keep the asset record modest and avoid fabricated school data, metrics, live status, or service connections.
- Meet the spec's “luxury pro-enterprise” requirements through hierarchy, legibility, interaction finish, and responsive density; do not add decorative excess or expand features.

## Review Focus

- **Unrendered legacy snapshot fields:** verify mutations to My Day or marks preserve `lessonDraft`, `inspectionChecks`, `feeNotes`, and unrendered tender data.
- **Malformed or older records:** verify missing optional fields default safely while malformed database content is surfaced instead of silently overwritten.
- **Marking boundaries:** verify blank, case-only canonical-answer variation, accent variation, accepted-keyword-substring, invalid-scheme, and malformed-import behavior remains deterministic and reviewable.
- **Persistence failure:** verify a blocked/unavailable or malformed IndexedDB load disables writes and never displays a saved confirmation.
- **Route and viewport transitions:** verify direct refresh, return navigation, role switching, and small-screen navigation preserve context without overflow.

---

### Task 1: Console domain and local persistence

**Files:**
- Create: `src/lib/school-console-storage.ts`
- Create: `src/lib/school-marking.ts`

**Interfaces:**
- `ConsoleSnapshot`: preserve the historical fields `markedPapers`, `lessonDraft`, `completedTasks`, `inspectionChecks`, `tenderDrafts`, and `feeNotes`.
- `ConsoleSnapshot` field types: `MarkedPaper[]`, `string`, `string[]`, `string[]`, `SchoolTenderDraft[]`, and `LocalFeeNote[]`, respectively. `SchoolTenderDraft` retains its historical quote, crew-allocation, and Blueprint fields; `LocalFeeNote` retains `id`, `description`, and numeric `amountKes`.
- `loadConsoleSnapshot(): Promise<ConsoleSnapshot>` reads the historical IndexedDB database/store/key and normalizes missing legacy fields without dropping known stored fields.
- `saveConsoleSnapshot(snapshot: ConsoleSnapshot): Promise<void>` writes the complete snapshot and rejects on open, transaction, or blocked-database errors.
- `SchemeQuestion`, `Paper`, and `MarkedPaper` match the historical typed-marking contract.
- `markPaper(questions: SchemeQuestion[], paper: Paper): MarkedPaper`, `parseCsvPapers(text: string, questions: SchemeQuestion[]): Paper[]`, and `parseJsonPapers(text: string, questions: SchemeQuestion[]): Paper[]` are pure functions with no browser/network dependency.

- [ ] **Step 1: Port and type the historical domain contracts**

  Reuse the archived implementation's field names and scoring behavior, including the accepted-keyword substring rule, but write Preact-compatible TypeScript modules in active `src/lib`. Keep the initial snapshot empty and do not seed real learner identities.

- [ ] **Step 2: Implement defensive IndexedDB compatibility**

  Open database `apt-labs-school-console`, store `local-work`, version `1`, and key `school-console-v1`. Default absent optional fields. Preserve the known historical fields that are not rendered in this release. Reject malformed snapshot roots or storage failures rather than silently saving an empty replacement; expose a load-failure state that blocks persistence-affecting actions for that session.

- [ ] **Step 3: Verify the task slice**

  Run `npm run build`. In the browser console route once available, exercise blank answer, exact answer, keyword contained within a longer answer, malformed typed import, and legacy snapshot round-trip cases. Confirm malformed batches make no partial writes and no network request occurs.

**Review gate:** inspect that mark validation matches the historical case-insensitive, accent-sensitive canonical comparison and accepted-keyword substring behavior, and ensure the visible scheme warns that all results require teacher review.

### Task 2: Refined console experience

**Files:**
- Create: `src/pages/workspace/SchoolConsole.tsx`
- Modify: `src/styles.css`
- Modify: `src/components/Input.tsx` to support the native number input's minimum and step attributes.
- Reuse: `src/components/Button.tsx`, `src/components/Input.tsx`, and existing workspace navigation conventions where suitable.

**Interfaces:**
- Consumes the storage and marking contracts from Task 1.
- Exports `SchoolConsole()` as the route page component.
- Internal view state is `teacher | principal`; module state is scoped to the current view and is not an authorization claim.

- [ ] **Step 1: Build the product frame and view navigation**

  Create an unmistakable School Console identity, local-data disclosure, return-to-Institutions link, compact internal module rail on wide screens, and an accessible Teacher / Principal segmented control. Keep the active module and local-data boundary visible on mobile when the rail collapses.

- [ ] **Step 2: Add teacher My Day and Auto-Marking workflows**

  Implement reversible local My Day task completion and a visible deterministic answer scheme with typed practice entry. Show review-required/provisional language. If importing CSV/JSON, validate the entire file before persisting any marked paper; do not accept scans/images.

- [ ] **Step 3: Add principal local tender drafts**

  Create, list, and discard local drafts in the existing snapshot shape. Label every saved item `Local draft · unpublished`. Do not add a Workbench link that implies a handoff, or any publication/assignment action.

- [ ] **Step 4: Complete visual states and responsive styling**

  Add focused `sc-*` styles in `src/styles.css`, using the existing palette/type tokens, precise alignment and spacing, quiet dividers, deliberate form feedback, and subtle state transitions. Avoid nested cards, dashboard metrics, gradients, or placeholder activity. Honor reduced motion and visible focus.

- [ ] **Step 5: Verify the console workflows**

  Run `npm run build`. In browser, exercise empty, success, validation, load-error, and save-error states for teacher and principal views. Check keyboard navigation and 320px, 768px, 1024px, and 1440px widths; no horizontal overflow or obscured controls.

### Task 3: Asset entry and obsolete intake retirement

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/workspace/Institutions.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/pages/workspace/WorkbenchOpportunityFlow.tsx`
- Modify: `src/lib/local-workbench.ts` only if the school-console-specific tender model has no remaining active consumers
- Modify: `src/styles.css` to remove only obsolete school-console Workbench intake styles

**Interfaces:**
- `App` registers `/workspace/institutions/school-console` to `SchoolConsole`.
- The School Management Console asset action points directly to that route.
- General Workbench opportunity and application behavior remains unchanged.

- [ ] **Step 1: Wire the nested route and asset action**

  Add the Wouter route and replace the asset's `source=school-console` Workbench URL with the dedicated route. Adjust only the asset's action label and brief summary necessary to describe a local-first console prototype accurately.

- [ ] **Step 2: Retire the temporary Workbench capture path**

  Remove the `source=school-console` tender-capture UI and its route-specific query logic. Search active consumers before removing `SchoolTenderIssue` persistence helpers; retain any shared code still used elsewhere. Do not otherwise refactor Workbench.

- [ ] **Step 3: Verify navigation and non-regression**

  Run `npm run build`. From Institutions, open the asset and confirm the nested route, return link, and direct refresh all work. Open the ordinary Workbench route and verify its opportunities/application flow is unchanged.

### Final verification

- Run `npm run build` after all tasks.
- Verify an existing historical IndexedDB snapshot remains readable and retains unrendered legacy fields after a core workflow save.
- Confirm the console sends no requests and writes to no Commons or Workbench key.
- Recheck 320px, 768px, 1024px, and 1440px layouts, keyboard focus, reduced motion, and the explicit local/unpublished disclosures.