# Radar Spatial Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the existing Radar signals view around a spatial-first desktop workspace while preserving its trust boundaries, local-demo honesty, and mobile list usability.

**Architecture:** Keep Commons as the owner of the existing signals, proposals, and decisions. Extract only the spatial panel and pure view helpers; the panel receives the currently scoped/filtered local records and never geocodes or infers coordinates from text. Because the current `FieldSignal` model has only a free-text location and no privacy-reviewed tile provider exists, the map surface must show an explicit no-mapped-locations/provider state rather than inventing points or contacting a third-party map service.

**Tech Stack:** Vite, Preact, TypeScript, Vitest, existing CSS and browser SVG capabilities. No new dependency or backend.

**Spec:** `docs/superpowers/specs/2026-11-04-radar-spatial-design.md`

## Global Constraints

- Preserve the current APT-LABS forest-and-paper visual language and workspace shell.
- Radar owns reports, Commons proposals and steward decisions; work applications, terms, selection, authorization, delivery, or acceptance belong to Undertakings.
- New signals are scoped to the relevant institution or community by default.
- Reporter identity and exact location are not displayed on the map by default.
- The current Radar implementation uses browser-local records and illustrative examples; it must not suggest shared, authoritative, or multi-user state.
- No map-tile or geocoding provider is selected.
- The interface must work in list mode and map/aggregate failures must be explicit.
- Production scale is not claimed until service controls and workload-based validation are implemented.

## Review Focus

- **Location strings without coordinates:** they must never be geocoded or positioned heuristically; the map must explain why no spatial records appear.
- **Empty or fully filtered scope:** map, counts, queue, and inspector must agree and distinguish no records from unavailable location data.
- **Large local record sets:** pagination must not hide the selected record or make counts imply server-wide totals.
- **Privacy scope changes:** map summary and queue must both follow the selected institution scope; no cross-scope or exact-location leakage.
- **Map/provider failure and narrow viewports:** list and record inspection remain usable, with explicit failure/empty states and no overflow.

---

## File Structure

- Create `src/lib/radar-view.ts` for typed signal summary, pagination, and spatial-state helpers.
- Create `src/lib/radar-view.test.ts` for pure helper behavior including empty, filtered, and large-list cases.
- Create `src/components/RadarSpatialPanel.tsx` for the accessible map stage, scope-aware summary, and honest no-coordinate/provider states.
- Modify `src/pages/workspace/Commons.tsx` to compose the panel with the existing signal list and inspector, preserve opportunities and governance views, and add local pagination.
- Modify `src/styles.css` for the Radar desktop spatial layout and mobile/list-first states.

## Task 1: Define Radar View Helpers

**Files:**
- Create: `src/lib/radar-view.ts`
- Test: `src/lib/radar-view.test.ts`

**Interfaces:**
- Consumes: `FieldSignal` and `SignalStatus` from `src/lib/local-workflows.ts`.
- Produces `RadarSignalSummary` with `total`, `new`, `triaged`, `brief`, and `resolved` counts, preserving the existing stored lifecycle vocabulary.
- Produces `getRadarSignalSummary(signals: readonly FieldSignal[]): RadarSignalSummary`.
- Produces `paginateRadarSignals<T>(items: readonly T[], page: number, pageSize: number): { items: T[]; page: number; pageCount: number; total: number }`; clamp page to the valid range and return page 0/pageCount 0 for an empty list.

- [x] **Step 1: Write failing tests** for empty and mixed signal summaries, pagination at first/last/out-of-range pages, and stable item order.
- [x] **Step 2: Run focused tests and verify failure.**

Run: `npm run test:unit -- --run src/lib/radar-view.test.ts`
Expected: FAIL because the helper module does not exist.

- [x] **Step 3: Implement the two typed helpers** without changing stored signal records or inventing geographic data.
- [x] **Step 4: Run focused tests and verify pass.**

Run: `npm run test:unit -- --run src/lib/radar-view.test.ts`
Expected: PASS for empty, mixed, and out-of-range cases.

## Task 2: Build the Spatial Panel

**Files:**
- Create: `src/components/RadarSpatialPanel.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes `signals: readonly FieldSignal[]`, already narrowed to the active scope and filters.
- Uses `getRadarSignalSummary` from Task 1 and `getRadarSpatialState` from this task.
- Does not render a basemap, marker, or cluster without explicit approximate geometry; does not call external map or geocoding services.

- [x] **Step 1: Write failing pure tests** distinguishing an empty scope from records with only free-text locations. The repository has no Preact renderer/DOM test dependency, so verify component markup in the browser in Task 4 rather than adding tooling.
- [x] **Step 2: Run focused tests and verify failure.**
- [x] **Step 3: Implement the spatial panel** with map-stage hierarchy, scope-aware counts, signal-state summary, and a visible explanation that the map provider/geometry is not configured. Do not fabricate record counts or map positions; derive counts only from the provided scoped records.
- [x] **Step 4: Add the production-quality responsive styles** in the existing forest-and-paper visual language, including focus and reduced-motion-safe interaction states.
- [x] **Step 5: Run focused helper tests and verify pass.**

## Task 3: Integrate Radar Spatial Layout and Pagination

**Files:**
- Modify: `src/pages/workspace/Commons.tsx`
- Modify: `src/styles.css`
- Test: `src/pages/workspace/Commons.test.tsx` (create only if the existing test setup supports Preact DOM rendering; otherwise extend the closest existing Commons behavior test)

**Interfaces:**
- Consumes `RadarSpatialPanel` from Task 2 and pagination/summary helpers from Task 1.
- Keeps existing `commonsView` modes for signals, opportunities, and decisions.
- Adds a pure `filterRadarSignals` helper for institution scope, status, and search so the summary and queue use the same local-demo view.
- Adds a pure `getSelectedRadarSignal` helper to retain a selected match across pages and choose the first match when the current selection is filtered out.
- Maintains the selected signal across page changes when it remains in the filtered set; when filters exclude it, selects the first filtered item or no item. The map has no selection action until genuine approximate geometry exists.

- [x] **Step 1: Write failing tests** for the scoped filter, selected-signal resolution, and pagination; verify the test environment's UI interaction limitations before adding a component test.
- [x] **Step 2: Run focused tests and verify failure.**
- [x] **Step 3: Replace the signal-mode two-column queue/detail layout** with a spatial stage and synchronized paginated queue/inspector. Keep the existing report, note, proposal, decision, and work-brief flows intact.
- [x] **Step 4: Implement narrow-screen list-first behavior** and explicit map-unavailable state; do not hide the signal inspector or require a map tile to read or review a signal.
- [x] **Step 5: Run focused tests and then the full unit suite.**

Run: `npm run test:unit -- --run`
Expected: all existing and new tests pass; signals, proposals, decisions, opportunity links, and route behavior remain intact.

## Task 4: Validate the Radar Surface

**Files:** no additional source files.

- [x] **Step 1: Run `npm run build`.**

Expected: TypeScript and Vite production build succeed.

- [x] **Step 2: Run `git diff --check`.**

Expected: no whitespace errors.

- [x] **Step 3: Browser-check `/workspace/commons`** at desktop, tablet, and 390px mobile widths. Verify empty geometry is explicit, scope/filter/pagination states remain coherent, report/decision flows still work, and there is no horizontal overflow.
- [x] **Step 4: Inspect the final diff** and confirm no provider, external request, fabricated geography, backend, or unrelated module behavior was added.
- [x] **Step 5: Commit only Radar implementation files** with the commit trailer required by repository instructions.

## Completion Criteria

- Radar uses a spatial-first desktop composition and list-first narrow-screen experience.
- No signal is geocoded or placed from free-text location.
- Map counts derive only from currently scoped records and do not imply verified facts or global totals.
- The existing signal, proposal/decision, opportunity-to-Undertakings, and report flows remain available.
- The browser-local demo boundary is explicit; no backend or 10,000-user readiness claim is introduced.
- Focused/full tests, production build, browser checks, and whitespace validation pass.
