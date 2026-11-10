# APT-LABS Workspace Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved light Quiet Brutal shell and truthful personal Home while keeping every module interior outside scope.

**Architecture:** Keep Wouter routes as the source of navigation state and use one canonical module registry for the labeled primary rail, context navigation, and shell destination search. Recompose the existing shell with adaptive CSS Grid/Flex regions; keep the inspector and evidence/activity dock contextual, and remove the always-mounted engine strip. Home uses only the authenticated profile fields already available and an honest empty state until a permission-aware work feed exists.

**Tech Stack:** Preact 10.24, TypeScript 5.6 strict, Wouter, existing CSS tokens, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-10-workspace-shell-design.md`

## Global Constraints

- Preserve the approved light **Quiet Brutal** direction; do not switch to the dark variant.
- The target primary destinations are Home, Commons, Network, Workbench, and The Roll; this approved partial implementation includes Home, Commons, Network, and The Roll only until a real Workbench route is mounted. School Console stays outside APT-LABS.
- Workbench's interior is out of scope. Do not add a dead link or shell-owned stub: the Workbench owner must supply its real mounted route and context before its clickable rail/search destination is added.
- Keep the work surface primary; use `minmax(0, 1fr)` and `min-width: 0`; context navigation, inspector, and activity/evidence surfaces are adaptive and optional.
- Keep module names visible under their icons at every viewport. Validate 320, 360, 390, 430, 768, 1024, 1280, 1440, and 1920 CSS px.
- Preserve the light token values: work canvas `#f5f3ee`, raised surface `#ffffff`, primary text `#1a1d18`, strong text `#0f110d`, interactive accent `#295d70`, terrain `#5d7a5c`, caution `#b8955a`, and risk `#a84632`.
- Use Georgia for editorial identity, sans for interface content, and mono only for genuine readouts. Keep the 8px spacing baseline, `--radius-1: 3px`, and `--radius-2: 6px`.
- Home may use only the real profile name, role, and organisation when present. Do not invent work, activity, permissions, counts, due dates, or sync state.
- `isDemoMode` may identify local demo versus configured environment; it does not prove shared/production or synchronisation.
- Keep the search a clearly labeled route/destination search unless authorised record search is actually wired.
- Keep the search reachable at narrow widths; if the full control cannot fit, use a labeled control that opens the existing search rather than hiding the capability.
- Use existing dependencies and icon assets; do not add packages or design module interiors.
- Keep keyboard focus visible, support zoom/text resizing and reduced motion/transparency, and use at least 44px touch targets. Target WCAG 2.2 AA.
- Measure Core Web Vitals before claiming success: LCP ≤ 2.5s, INP < 200ms, CLS < 0.1 at p75.
- Treat 10,000 monthly active users as a planning scenario, not concurrent load; do not add architecture for hypothetical bottlenecks.
- The worktree already has unrelated and shell-adjacent uncommitted changes. Re-read each touched file at implementation time and preserve all changes not made by that task.
- After every task, `npm run build` and `npm run test:unit -- --run` must pass before starting the next task.

## Review Focus

1. **Workbench route absent:** verify that no rail/search link points to an unmounted destination; record the five-destination acceptance criterion as blocked until the route is provided.
2. **Missing identity or work-feed data:** test anonymous/profile-loading and absent organisation/work-feed cases; Home must remain useful without fabricating a queue or identity context.
3. **Narrow navigation and long labels:** manually test all five labels at 320/360/390/430px, including long organisation names; no primary destination or action may be clipped or unreachable.
4. **Unknown versus empty inspector data:** test `undefined` relationship/evidence data separately from an empty list; render “not available” versus “none” accurately.
5. **Unknown sync and configured environment:** test local-demo and configured labels independently; no state may imply “synced” or “shared” without an authoritative source.

---

## File Structure

- `src/lib/studio-navigation.ts` — canonical module IDs, routes, contexts, and labels.
- `src/lib/studio-navigation.test.ts` — route/context/label invariants, including Home and The Roll.
- `src/components/StudioNavigation.tsx` — APT-LABS topbar, labeled primary rail, context navigation, and responsive navigation controls.
- `src/lib/workspace-search.ts` / `src/lib/workspace-search.test.ts` — truthful shell destination search; no fabricated record search.
- `src/App.tsx` — add a Workbench route only after its owner supplies the real page/route integration.
- `src/tokens.css` — semantic shell focus and rail sizing aliases, retaining existing palette meanings.
- `src/styles/workspace-foundation.css` / `src/styles/shell.css` — responsive shell geometry, Quiet Brutal visual treatment, and Home presentation.
- `src/components/WorkspaceShell.tsx` — adaptive shell composition, known environment status, and conditional inspector/dock visibility.
- `src/components/EngineActivityStrip.tsx` — no longer mounted as permanent shell chrome; do not remove or alter its module behavior as part of this task.
- `src/components/RecordInspector.tsx` — selected-record identity, known/unknown contextual data, dismissal, and mobile detail behavior.
- `src/components/ChangeSetDock.tsx` — contextual collapsible evidence/activity surface, shown only with relevant data.
- `src/pages/workspace/WorkspaceOverview.tsx` — personal Home composition and truthful first-use state.
- `src/lib/workspace-overview.ts` / `src/lib/workspace-overview.test.ts` — replace the duplicate module-directory model with a Home-specific list of real starting destinations.

## External prerequisite

The current `src/App.tsx` does not mount `/workspace/workbench`, and existing uncommitted changes remove former Workbench navigation contexts. The user chose to proceed with the other shell destinations and defer Workbench. Keep Workbench absent from the rail and search; do not invent a URL, restore deleted module interiors, or create a shell stub. The final five-destination acceptance check remains blocked until the Workbench owner supplies a real mounted route and context.

### Task 1: Canonical destinations and route/search wiring

**Files:**
- Modify: `src/lib/studio-navigation.ts`
- Modify: `src/lib/studio-navigation.test.ts`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/lib/workspace-search.ts`
- Modify: `src/lib/workspace-search.test.ts`
- Conditional modify: `src/App.tsx` only for the owner-confirmed Workbench route

**Interfaces:**
- `StudioModuleId` retains the internal `records` ID for existing ledger consumers and adds `home`; visible module labels are Home, Commons, Network, and The Roll.
- `StudioContext` retains real module subviews; `overview` maps to `home`, and existing `records:*` contexts map to internal `records`. Intelligence remains a routable context but is not a primary rail destination.
- `STUDIO_FLOW_MODULES` is the canonical ordered list for this partial delivery: Home (`/workspace`), Commons (`/workspace/commons`), Network (`/workspace/network/people`), The Roll (`/workspace/records/roll`).
- `getStudioModuleForContext(context)` returns the corresponding primary module for every supported route context.
- Search destinations include only real, mounted shell routes; record search remains an explicit future integration.

- [ ] **Step 1: Write navigation registry tests.** Update `src/lib/studio-navigation.test.ts` to assert the exact partial-delivery order Home, Commons, Network, The Roll; verify each existing Records subview maps to The Roll and neither Intelligence nor an unmounted Workbench link is exposed.
- [ ] **Step 2: Run the focused tests and verify failure.** Run `npm run test:unit -- --run src/lib/studio-navigation.test.ts`; expect failure on the current primary module set and missing Home mapping.
- [ ] **Step 3: Implement the canonical registry.** Add Home to `StudioModuleId` and the registry, retain internal `records` for existing ledger consumers while labeling it The Roll, and map `overview` to Home. Keep Workbench and Intelligence out of the primary registry; preserve Intelligence's existing direct-route context.
- [ ] **Step 4: Wire the existing rail to the registry.** In `StudioNavigation.tsx`, add icon mappings for Home and The Roll, derive active module state from the canonical context mapping, and change the product identity from “Field Studio” to APT-LABS. Defer the visible-label layout to Task 2.
- [ ] **Step 5: Align shell search.** Update `WORKSPACE_SEARCH_DESTINATIONS` to the four canonical mounted destinations; remove Intelligence and Workbench. Preserve the existing query filter and do not imply authorised record search.
- [ ] **Step 6: Run focused and project checks.** Run `npm run test:unit -- --run src/lib/studio-navigation.test.ts src/lib/workspace-search.test.ts`, then `npm run build` and `npm run test:unit -- --run`; all must pass.

### Task 2: Quiet Brutal shell geometry and responsive navigation

**Files:**
- Modify: `src/tokens.css`
- Modify: `src/styles/workspace-foundation.css`
- Modify: `src/styles/shell.css`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/components/WorkspaceShell.tsx`

**Interfaces:**
- Desktop rail width is 72px (within the spec's 72–76px target); context pane defaults to 200–240px and can collapse/restore.
- A desktop inspector is 286–360px only when content testing shows the main work surface retains its usable minimum; otherwise use an overlay/drawer.
- The work surface remains the flexible grid track; no fixed inspector column may reduce it below its tested usable width.
- At 768px and below, the labeled primary destinations become a horizontal strip; the context destinations open from a visible, keyboard-operable control.
- At narrow widths, search remains available from an explicitly labeled control even if the full search input is moved into a dialog.
- The topbar uses a slight translucency with an opaque/reduced-transparency fallback. Shell chrome uses warm canvas, ink, fine dividers, and mineral-lime selection.

- [ ] **Step 1: Implement the labeled navigation DOM contract.** Render each registry destination as a semantic link with icon and visible label directly beneath it, `aria-current` on the active route, and no title-only names. Provide an explicit context-navigation trigger at widths where the pane is not shown inline.
- [ ] **Step 2: Set semantic geometry tokens and reset behavior.** Set `--shell-rail` to 72px, align the context pane to 200–240px, and add `--shell-focus` using the existing high-contrast brand teal. Add an explicit reset-to-default callback for the collapsible context pane; primary navigation is never persisted as hidden. Preserve established state-color tokens; do not reuse selection lime as lifecycle or risk meaning.
- [ ] **Step 3: Implement desktop and laptop layouts.** In `workspace-foundation.css` and `shell.css`, use Grid/Flex with `minmax(0, 1fr)`, remove the all-route surveyor grid from shell chrome, use 32px Home insets at desktop and 16px at narrow widths, and retain main-work priority when context or inspector regions change.
- [ ] **Step 4: Implement responsive information architecture.** At 1280px and wider, show the vertical labeled rail and optional context pane; at 1024–1279px keep the rail and make context navigation collapsible/drawer-based; at 768px and below show the horizontal labeled rail and drawer-based context navigation. At 320–430px fit all available controls without clipping and maintain at least 44px touch height. Provide collapse, restore, and reset-to-default behavior for context navigation.
- [ ] **Step 5: Add visual states and preferences.** Style the selected link with a mineral-lime wash, slim edge marker, and `aria-current`; keep inactive links unboxed. Add visible focus, hover only for fine pointers, reduced-motion handling, and reduced-transparency/opaque topbar behavior.
- [ ] **Step 6: Verify responsive layouts.** At 320, 360, 390, 430, 768, 1024, 1280, 1440, and 1920px, check all available module labels, long titles, search access, context drawer access, no horizontal page overflow, and work-surface width. Repeat at browser zoom and with reduced motion/transparency enabled.
- [ ] **Step 7: Run project checks.** Run `npm run build` and `npm run test:unit -- --run`; both must pass.

### Task 3: Personal Home overview

**Files:**
- Modify: `src/pages/workspace/WorkspaceOverview.tsx`
- Modify: `src/styles/workspace-foundation.css` and/or `src/styles/shell.css`
- Modify or remove: `src/lib/workspace-overview.ts`
- Modify or remove: `src/lib/workspace-overview.test.ts`

**Interfaces:**
- Home reads the authenticated `Profile` fields already exposed by `useAuth`: `display_name`, `role`, and `organization_name`.
- Home has no fabricated assignment feed. Until a permission-aware source exists, `Your work` shows a plain honest empty state and a real Network next step.
- Home uses the existing `/workspace` route and does not render a duplicate directory of every module.

- [ ] **Step 1: Replace overview-directory assertions.** Update `workspace-overview.test.ts` to assert that Home starting actions use only existing real routes and do not enumerate a second primary-module directory.
- [ ] **Step 2: Run the focused test and verify failure.** Run `npm run test:unit -- --run src/lib/workspace-overview.test.ts`; expect the current full-module-directory assertion to fail.
- [ ] **Step 3: Implement the Home composition.** In `WorkspaceOverview.tsx`, render a stable Home heading while auth loads, then the real-profile greeting and organisation/role only when present; add an open editorial `Your work` region, an honest no-feed empty state, and only real permitted starting links. Make Network the obvious first entry for a new founder; do not show an undertaking action until a real Workbench route/action is confirmed.
- [ ] **Step 4: Remove duplicate module-directory data.** Replace `WORKSPACE_OVERVIEW_ITEMS` with `WORKSPACE_HOME_START_ACTIONS`, containing only the real, permitted Network entry action, and update the test to assert this bounded contract.
- [ ] **Step 5: Style desktop/mobile Home.** Use an open list and one optional narrow starting-actions area only when real actions exist; stack them in reading order on tablet/mobile. Use existing serif/sans tokens and the measured 32px/16px insets; avoid cards, hero decoration, grids, and fabricated counts.
- [ ] **Step 6: Verify Home cases.** Check signed-in profile with/without organisation, missing profile, first-use empty work state, long display name, and narrow-screen layout. Confirm that no assignment, due date, reviewer count, or activity is presented.
- [ ] **Step 7: Run project checks.** Run `npm run build` and `npm run test:unit -- --run`; both must pass.

### Task 4: Contextual status, inspector, and evidence/activity surfaces

**Files:**
- Modify: `src/components/WorkspaceShell.tsx`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/components/RecordInspector.tsx`
- Modify: `src/components/ChangeSetDock.tsx`
- Modify: `src/styles/workspace-foundation.css` and/or `src/styles/shell.css`
- Leave unmounted, but do not delete: `src/components/EngineActivityStrip.tsx`

**Interfaces:**
- The topbar may display only a verified environment label (`Local demo` or `Configured`); synchronisation remains unknown/hidden until a real source is connected.
- Inspector presence is driven by a selected record, not by whether optional relationship/action arrays happen to be non-empty. Its input distinguishes unknown (`undefined`) from known-empty (`[]`) data.
- The inspector has an explicit dismiss/restore affordance and, when a real route is supplied, a full-page record link; on narrow screens it behaves as a focus-managed drawer or dedicated detail view.
- The activity/evidence dock is rendered only with real contextual data, can collapse/restore on desktop, and becomes a contextual action/drawer on mobile.

- [ ] **Step 1: Capture baseline behavior.** Use the current app to confirm the always-mounted engine strip, empty selected-record inspector behavior, and dock behavior; record which acceptance cases fail before editing.
- [ ] **Step 2: Preserve record identity and provenance.** Add optional `href` and provenance metadata to `RecordSelection`; keep optional relationship/evidence data as `undefined` when unknown and `[]` when known-empty. Use labeled “Not available” versus “None recorded” treatments and show only authorized actions supplied by the owning module.
- [ ] **Step 3: Separate environment from activity.** Pass the known environment label to the topbar. Unmount `EngineActivityStrip` from `WorkspaceShell`; do not render sync as “synced” and do not retain its empty run/proposal state as shell chrome.
- [ ] **Step 4: Make the inspector truthful and optional.** Show selected-record identity/type, only applicable provenance/relationships/evidence/actions, the optional full-page link, and an explicit close/restore path. Never infer authority from profile or relationship data; consequential actions must identify their affected record, reversibility, and next step, and expose only owner-supplied permitted actions.
- [ ] **Step 5: Make the dock contextual and adaptive.** Keep `ChangeSetDock` absent without relevant records; add a desktop collapse/restore control and a mobile contextual drawer/action. Keep source-control terms only where the underlying operation truly has those semantics; otherwise use confirmed domain terms, not invented replacements.
- [ ] **Step 6: Verify interaction and states.** In the browser, test selected-record identity with unknown and empty relationship/evidence data, close and restore by keyboard, mobile drawer focus return, dock absent with empty data, dock collapse/restore with real data, configured/local environment, and absent sync source. Do not add render-test dependencies solely for this check.
- [ ] **Step 7: Run project checks.** Run `npm run build` and `npm run test:unit -- --run`; both must pass.

### Task 5: End-to-end shell acceptance review

**Files:**
- Modify only any shell files from Tasks 1–4 that fail acceptance checks.

**Interfaces:**
- The shell is considered complete only when its routes, visual states, responsive transformations, and truthful data boundaries match the approved spec.

- [ ] **Step 1: Verify URL behavior.** Open Home and each mounted primary route directly; confirm active module/subview indication, refresh persistence, and browser back/forward. Do not count Workbench as passed until its real route is mounted.
- [ ] **Step 2: Verify responsive behavior.** Repeat the nine specified widths (320, 360, 390, 430, 768, 1024, 1280, 1440, 1920 CSS px); test pointer and touch, long labels/titles/organisation names, and a narrow-screen record inspection. Mark Workbench as deferred, not passed.
- [ ] **Step 3: Verify accessibility.** Use keyboard-only navigation, visible unobscured focus, screen-reader landmark/control names, dialogs with focus return, zoom/text resizing, reduced motion, reduced transparency, and 44px touch targets.
- [ ] **Step 4: Verify truthful operational states.** Check empty Home, missing profile/organisation, empty/unknown inspector data, no activity, local demo, configured environment, and absent sync service. Do not report loading/offline/conflict/success UI unless the current flow can genuinely enter that state.
- [ ] **Step 5: Run release checks.** Run `npm run build` and `npm run test:unit -- --run`; record results and any Workbench route prerequisite still blocking the five-destination acceptance criterion. Measure Core Web Vitals only with representative measurement; do not claim the target thresholds without data.
