# Workbench Contributor Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Workbench default with a compact contributor finder and browser-local, non-binding interest flow while preserving the manual simulation as a secondary lane.

**Architecture:** Add an isolated, versioned interest store and a focused finder page that reuses the static opportunity examples without reusing the existing application records. Keep the simulation component intact at a new secondary route and its existing alias. Hide the shared profile entry only on Workbench routes.

**Tech Stack:** Vite, Preact, TypeScript, Wouter, existing CSS tokens, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-01-workbench-contributor-finder-design.md`

## Global Constraints

- The current app is a browser-local demo. Its example listings and interest records are not connected services, live opportunities, or messages sent to an institution.
- This demo ends at local interest and cannot negotiate terms, contact an institution, receive a response, or authorize work.
- For a future connected workflow, work must not start until finalized terms are defined, both sides accept them, and the institution explicitly authorizes the start.
- Keep the Console → manual simulation composer as a separate, secondary *Create / simulate* destination.
- Use `/workspace/workbench` for the contributor finder; use `/workspace/workbench/simulate` for the simulation composer and preserve `/workspace/field-desk` as its compatibility alias.
- Do not revive the unused, multi-step application/review workflow in `WorkbenchOpportunityFlow`.
- Do not change, migrate, or write to existing application, simulation, Console, Commons, People, or Institutions stores.
- Do not store contributor identity, profile evidence, pitch, or other identifying information in interest records.
- Hide the shared profile/identity entry on Workbench routes; leave unrelated Studio routes unchanged.
- Clearly label every listing as a local example, not a live opportunity. Do not invent missing terms or imply institutional response.
- Run `npm run build` and focused unit tests before shipping.

## Review Focus

1. **Corrupt, malformed, or unsupported interest storage:** reads must report an error and never silently reset or overwrite data. Pin in Task 1 storage validation tests.
2. **Unavailable browser storage on read/write/remove:** preserve the prior UI state and show an error instead of success. Pin read/write/remove failure tests in Task 1 and verify the UI response in Task 2.
3. **Repeated interest or removal:** one opportunity must have at most one local signal; removal must not affect other interests. Pin in Task 1 idempotency/removal tests.
4. **Existing application and simulation data:** adding or removing interest must leave both old storage values unchanged. Pin in Task 1 isolation test.
5. **Stale opportunity ID in a saved interest:** show a safe unresolved local-example label and allow local removal; never imply submission or acceptance. Verify with a seeded stale record in Task 2 browser check.

---

### Task 1: Add isolated local interest storage

**Files:**
- Create: `src/lib/workbench-interest.ts`
- Create: `src/lib/workbench-interest.test.ts`
- Reference: `src/lib/local-workflows.ts` for `createLocalId`
- Reference: `src/lib/workbench-simulation-store.test.ts` for localStorage stubbing

**Interfaces:**
- Produces:
  - `LocalWorkInterest`: `{ id: string; opportunityId: string; createdAt: string }`
  - `readLocalWorkInterests(): LocalWorkInterest[]`
  - `expressLocalWorkInterest(opportunityId: string): LocalWorkInterest[]`
  - `removeLocalWorkInterest(opportunityId: string): LocalWorkInterest[]`
- Use the isolated key `aptlabs:workbench-interests:v1`.
- Validate the exact record fields and ISO timestamps; allow an unknown `opportunityId` in valid persisted data so the UI can report a stale reference safely.
- `expressLocalWorkInterest` is idempotent by `opportunityId`; `removeLocalWorkInterest` removes only that opportunity’s signal.
- Storage access and invalid data throw descriptive errors. Write failures must not produce a success-shaped return.

- [x] **Step 1: Write failing tests** in `src/lib/workbench-interest.test.ts` for round-trip records with only `id`, `opportunityId`, and `createdAt`; reject malformed JSON, unsupported fields, and invalid timestamps; confirm a repeated express call does not duplicate; confirm removal leaves another opportunity’s record intact; and confirm unknown opportunity IDs remain readable for safe UI handling.
- [x] **Step 2: Run the focused tests and verify failure.** Run `npm run test:unit -- --run src/lib/workbench-interest.test.ts`. Expected: FAIL because the interest store module and functions do not exist.
- [x] **Step 3: Implement the store** in `src/lib/workbench-interest.ts`. Use `createLocalId('work-interest')`, ISO timestamps, and a distinct storage key; keep store parsing independent of static opportunity data.
- [x] **Step 4: Add failure and isolation tests.** Stub `localStorage` so `getItem` throws on reads and `setItem` throws during both express and remove; seed `aptlabs:workbench-local-flow:v1` and `aptlabs:workbench-simulations:v1` with sentinel values and assert they are unchanged after express/remove.
- [x] **Step 5: Run focused tests.** Run `npm run test:unit -- --run src/lib/workbench-interest.test.ts`. Expected: PASS, including explicit errors for storage failures and invalid stored data.
- [x] **Step 6: Commit** the store and tests with `feat: add local Workbench interest storage` and the required Copilot co-author trailer.

### Task 2: Build the focused Workbench finder and preserve simulation routes

**Files:**
- Create: `src/pages/workspace/WorkbenchFinder.tsx`
- Create: `src/components/workbench/WorkbenchOpportunityBrowser.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes Task 1’s `LocalWorkInterest` and store functions.
- Reuse `WORK_OPPORTUNITIES` and `WorkOpportunity` from `src/lib/local-workbench.ts`; do not call `createLocalApplication` or read `authUser`.
- `WorkbenchFinder` owns load/save/remove state, current view (`'find' | 'interest'`), selected opportunity ID, and search query.
- `WorkbenchFinder` also owns `mobileDetailOpen: boolean`, initially `false`; selecting a result sets it to `true`, and `onBackToList` sets it to `false`.
- `WorkbenchOpportunityBrowser` props:
  - `view: 'find' | 'interest'`
  - `opportunities: readonly WorkOpportunity[]`
  - `interests: readonly LocalWorkInterest[]`
  - `selectedOpportunityId: string | null`
  - `mobileDetailOpen: boolean`
  - `query: string`
  - `error: string`
  - `notice: string`
  - `onViewChange(view: 'find' | 'interest'): void`
  - `onSearchChange(query: string): void`
  - `onSelectOpportunity(opportunityId: string): void`
  - `onExpressInterest(opportunityId: string): void`
  - `onRemoveInterest(opportunityId: string): void`
  - `onBackToList(): void`
- Keep the current simulation page implementation; route it at `/workspace/workbench/simulate` and `/workspace/field-desk`.

- [x] **Step 1: Implement the finder page** in `src/pages/workspace/WorkbenchFinder.tsx`. Load interest records on mount; show a loading state; on storage failure keep an alert and do not claim the list is empty; update displayed state only after the store operation succeeds. Provide the three destinations *Find work*, *My interest*, and *Create / simulate*.
- [x] **Step 2: Implement the browser UI** in `src/components/workbench/WorkbenchOpportunityBrowser.tsx`. Render the static examples in a compact list beside the selected summary; use a `<details>` disclosure for the full brief and open terms; provide a simple search over title, context, and discipline; label every item and saved-interest confirmation as browser-local, not live or sent.
- [x] **Step 3: Implement interest states.** Show *Express interest* before saving; after success say “Interest saved in this browser — no one was contacted”; show *Remove interest* for a saved signal. Handle an unknown saved opportunity ID with a neutral unresolved-example label and local removal action.
- [x] **Step 4: Add responsive and accessible styling** to `src/styles.css`. At desktop widths retain list and detail together. On mobile initially show the list; selecting an item shows detail and a visible back-to-list button returns to the list. Keep the selected detail available when returning to desktop width. Use semantic buttons, visible focus, labeled list/detail regions, and status/alert feedback.
- [x] **Step 5: Wire routes and identity boundary.** In `src/App.tsx`, make `/workspace/workbench` render `WorkbenchFinder`, add `/workspace/workbench/simulate` for the current simulation component, and retain `/workspace/field-desk` as its alias. In `src/pages/workspace/FieldDesk.tsx`, provide a clear return link to Find work. In `src/components/StudioNavigation.tsx`, omit the profile/identity entry when the active context is Workbench; leave other contexts unchanged.
- [x] **Step 6: Run a browser smoke check.** Verify the finder default route; list selection updates the desktop detail; narrow layout has a back action; interest saves once, survives reload, and can be removed; a seeded stale opportunity displays unresolved without claiming submission; Workbench routes omit the profile entry while People/Commons retain it; both simulation routes still open existing simulations.
- [x] **Step 7: Commit** the finder, route, shell, and styles with `feat: make Workbench a contributor finder` and the required Copilot co-author trailer.

### Task 3: Update route documentation and validate the complete change

**Files:**
- Modify: `README.md`
- Validate: `src/lib/workbench-interest.test.ts`
- Validate: existing `src/lib/workbench-simulation-store.test.ts`

**Interfaces:**
- Documentation must describe `/workspace/workbench` as the browser-local contributor finder; `/workspace/workbench/simulate` and `/workspace/field-desk` as the isolated simulation; and local interest as non-binding, saved only in this browser, and not sent to an institution.
- Do not describe sample listings, local interests, or simulation output as connected services or live transactions.

- [x] **Step 1: Update the route list and Workbench boundary text** in `README.md` to match the new routes and browser-local behavior.
- [x] **Step 2: Run focused domain tests.** Run `npm run test:unit -- --run src/lib/workbench-interest.test.ts src/lib/workbench-simulation-store.test.ts`. Expected: PASS; old simulation-store behavior remains unchanged.
- [x] **Step 3: Build the app.** Run `npm run build`. Expected: TypeScript and Vite production build succeed.
- [x] **Step 4: Commit** the README update with `docs: describe Workbench contributor finder` and the required Copilot co-author trailer.
