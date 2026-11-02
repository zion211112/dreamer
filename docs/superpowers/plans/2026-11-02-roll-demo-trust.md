# Roll Demo Trust Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Roll's demo records, browser-local writes, and SHA-256 integrity check inspectable without implying real-world authority or independent verification.

**Architecture:** Keep `roll-hash.ts` as the single canonicalization/hash layer. Keep demo fixtures immutable in memory and persist user-created demo entries separately in localStorage; have `queryRollEntries` merge, hash, and filter both. The Roll page remains a scan-friendly directory and opens a focused verification dialog with canonical JSON, hashes, and qualified integrity language.

**Tech Stack:** Vite, Preact, TypeScript, Vitest, Web Crypto API, browser localStorage.

**Spec:** `docs/superpowers/specs/2026-11-02-roll-demo-trust-design.md`

## Global Constraints

- Make the Roll evidence and hash mechanics inspectable in browser-local demo mode without presenting sample data as authoritative or independently verified.
- A persistent demo notice identifies fixtures and browser-local entries as synthetic, local to this browser, and non-authoritative.
- Evidence visibility (`public`, `participant`, `restricted`) is presented separately from hash integrity.
- A matching hash says only that the selected canonical fields currently hash to the stored digest.
- Creation and verification use one canonical JSON function.
- Supabase authorization or production immutability guarantees are out of scope.
- Workbench simulation integration, participant exports, blueprint generation, independent/counterparty verification, revision workflows, and changing the undertaking taxonomy are out of scope.
- Do not add dependencies; run `npm run build` and `npm run test:unit -- --run`.

## Review Focus

- Malformed or unavailable localStorage must surface as a load/write error, never a false empty state.
- Repeated reads must not mutate fixture objects or change their hash anchors.
- Tampering with a committed field must yield a mismatch; changing an excluded metadata field must not be described as committed.
- A matching digest must not be labeled as proof that the entry or its claims are valid, accepted, or independently verified.
- Long canonical JSON, errors, and dialog controls must remain readable and keyboard-operable at narrow viewport widths.

---

### Task 1: Canonical hash contract and demo data access

**Files:**
- Modify: `src/lib/db/roll.ts`
- Test: `src/lib/db/roll.test.ts`
- Use: `src/lib/db/roll-hash.ts`

**Interfaces:**
- Consumes: `createCanonicalRollJson(entry)` and `computeHashAnchor(canonicalJson)` from `roll-hash.ts`.
- Produces: `verifyRollEntry(entry: RollEntry): Promise<{ valid: boolean; canonicalJson: string; computedHash: string; storedHash: string }>`; a demo `queryRollEntries(filters?)` that returns fixture plus persisted entries.

- [x] **Step 1: Add failing tests** named `canonicalizes deliverables and participants deterministically`, `verifies matching and detects committed-field tampering`, `loads all synthetic fixture types with all visibility layers`, and `reports malformed demo storage`.
- [x] **Step 2: Run** `npm run test:unit -- --run src/lib/db/roll.test.ts`; confirm the new behavioral tests fail before implementation.
- [x] **Step 3: Implement** robust local demo-entry parsing and export the shared `verifyRollEntry`; compute fixture digests from canonical data without mutating constants. Keep fixtures synthetic, with no identifiable individuals, live-service claims, or live links.
- [x] **Step 4: Run** `npm run test:unit -- --run src/lib/db/roll.test.ts`; confirm deterministic serialization, match/mismatch behavior, fixture shape, and malformed-storage errors pass.

### Task 2: Browser-local demo writes and merged query

**Files:**
- Modify: `src/lib/db/roll.ts`
- Test: `src/lib/db/roll.test.ts`

**Interfaces:**
- Consumes: Task 1 canonical/hash functions and demo storage parser.
- Produces: `createRollEntry(data, userId)` persists only user-created demo records at `demo_roll_entries`; demo `queryRollEntries` merges those with immutable fixtures, sorted newest-first and filtered using existing `RollQueryFilters`.

- [x] **Step 1: Add failing tests** named `persists a demo entry with a canonical hash`, `merges persisted entries with immutable fixtures`, and `keeps fixture data unchanged across reads`.
- [x] **Step 2: Run** the focused test file and confirm the demo persistence and merge expectations fail.
- [x] **Step 3: Implement** storage parsing/writing with explicit errors for invalid JSON and storage failures; do not silently fall back to `[]`.
- [x] **Step 4: Run** the focused test file; confirm persisted records receive a UUID, timestamp, version 1, and hash matching `createCanonicalRollJson`.

### Task 3: Scan-first directory and honest verification

**Files:**
- Modify: `src/pages/workspace/Roll.tsx`
- Modify: `src/components/RollDirectory.tsx`
- Modify: `src/components/RollEntryCard.tsx`
- Modify: `src/components/RollEntryRow.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: Task 1 `verifyRollEntry`, Task 2 demo fixture/query behavior.
- Produces: persistent synthetic-demo notice; retryable load error distinct from empty/filter-empty; verification dialog with canonical JSON, stored and computed hashes, and accurate match/mismatch copy.

- [x] **Step 1: Remove misleading claims** by replacing card/table “Verified” indicators with neutral hash-anchor wording until a check is run.
- [x] **Step 2: Add** a persistent demo-only notice explaining the fixtures and local records are synthetic, local to this browser, and non-authoritative; explain evidence visibility separately from hash integrity.
- [x] **Step 3: Refine** the verification dialog so match copy says the current canonical fields match the stored SHA-256, while explicitly stating this does not verify claims, identity, acceptance, or authority. Show computation errors visibly instead of leaving a blank dialog.
- [x] **Step 4: Preserve** distinct loading, load-error-with-retry, no-record, and filtered-empty states; ensure retry clears the previous error and performs a new request.
- [x] **Step 5: Validate** keyboard close/focus behavior and responsive overflow for the dialog and canonical JSON at 320px, 768px, and desktop width using the browser.

### Task 4: End-to-end verification

**Files:**
- Validate: `src/lib/db/roll.test.ts`, Roll route in production preview.

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: verified production build, unit suite, and browser behavior evidence.

- [x] **Step 1: Run** `npm run test:unit -- --run`; expected: all unit tests pass.
- [x] **Step 2: Run** `npm run build`; expected: TypeScript and Vite production build pass.
- [x] **Step 3: Smoke-test** `/workspace/roll` in a production preview: fixtures render, verify opens canonical JSON, a matching digest is described narrowly, a tampered committed field shows mismatch, and load failure differs from empty state.
- [x] **Step 4: Run** `git diff --check`; confirm no whitespace errors or unrelated changes.
