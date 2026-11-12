# Commons Signal Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the existing Commons signal and opportunity views while preserving the local-only prototype boundary, signal provenance, and steward authority.

**Architecture:** Keep signal and governance persistence in the existing browser-local stores. Update the Commons presentation and clearly illustrative fixtures without changing the Workbench route or introducing a provider integration, backend, or new record store.

**Tech Stack:** Vite, Preact, TypeScript, existing `src/styles.css`, and the repository's existing Vitest setup; no added dependency.

**Spec:** `docs/superpowers/specs/2026-10-30-commons-workbench-relay-design.md`

## Global Constraints

- Keep the active app Vite + Preact; do not add a backend or browser-side provider call.
- Commons remains a local prototype; do not imply signals, opportunities, authority, or transactions are live.
- Preserve existing browser-local signal, proposal, and draft records.
- Keep illustrative examples distinguishable from reports and verified evidence.
- Only an approved steward decision may seed a linked Workbench draft; Commons presentation changes do not authorize work.
- Limit source changes to Commons and its example fixtures/styles; leave Workbench behavior unchanged.

## Review Focus

- Existing browser-local records omit optional fields or reference missing records: continue loading them without destructive fallback.
- An illustrative signal has no registered asset: show its institution/place context without inventing an asset ID or relationship.
- A signal is illustrative, unresolved, or lacks steward authority: do not expose live/verified copy or an action that implies authorization.
- A proposal is rejected/returned or the actor is not a steward: do not create or present an authorized Workbench draft.
- Shared stylesheet changes overlap other routes: retain only the Commons-specific rules needed by this scope.

---

### Task 1: Refine Commons view hierarchy and local examples

**Files:**
- Modify: `src/pages/workspace/Commons.tsx`
- Modify: `src/lib/ecosystem-examples.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Commons views remain `signals`, `opportunities`, and `decisions`; they select presentation only and do not change the underlying signal or governance records.
- Signal context may show institution, supplied location, and a supplied asset name. Only an existing explicit `assetId` links to an asset record.
- Example opportunities remain example paths, not application openings; no application, assignment, or transaction is created.

- [x] **Step 1: Review the exact Commons and fixture diff** against the approved relay spec. Keep the queue, search, status/institution filtering, evidence context, local report form, and steward-gated decisions intact.
- [x] **Step 2: Correct fixture provenance and context** in `ecosystem-examples.ts`; keep the school crossing and power examples illustrative, asset-unresolved unless an explicit asset ID exists, and free of invented measurements or authority.
- [x] **Step 3: Refine Commons view and signal presentation** in `Commons.tsx`; keep the opportunity detail explicitly closed to applications, distinguish examples from local reports, and preserve the selected signal and existing query context on state changes.
- [x] **Step 4: Keep CSS changes scoped** to Commons and the shared controls actually used by it; do not remove or redesign Institutions, Workbench, People, or authentication styles.
- [x] **Step 5: Run `npm run test:unit -- --run` and `npm run build`.** Confirm all existing domain tests pass and TypeScript/Vite build succeeds.
- [x] **Step 6: Verify the Commons route** at 320px, 768px, 1024px, and 1440px. Check old local records still load, asset-unresolved examples show only supplied place context, signal search/filter/selection, opportunity disclosure, approved-only draft gating, rejected/returned proposal reasons, keyboard focus, and no horizontal overflow.
- [x] **Step 7: Review the staged Commons diff** and commit only `Commons.tsx`, `ecosystem-examples.ts`, Commons-specific stylesheet hunks, and this plan as a separate Commons commit.
