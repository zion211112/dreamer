# Workspace Shell Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename and regroup the existing Studio navigation as Radar, Network, Undertakings, and Roll without replacing the shell or changing module workflows.

**Architecture:** Add a pure, typed navigation model for module labels, routes, and active views, then consume it in the existing desktop sidebar and mobile drawer. Keep every current route and page component; only the capability-directory page receives a distinct Network context so the correct group and view are highlighted.

**Tech Stack:** Vite, Preact, TypeScript, Wouter, Vitest, existing CSS.

**Spec:** `docs/superpowers/specs/2026-11-04-workspace-economy-and-flow-rethink-design.md`

## Global Constraints

- Keep the current Vite + Preact application and its visual language.
- Keep the current shell geometry and visual identity.
- Use four operational destinations: Radar, Network, Undertakings, and Roll.
- People and Institutions remain intact as Network views; neither capability is removed.
- Do not replace the shell with the visual mockup.
- Keep APT Coin Lab separate from the operational navigation.
- Do not claim that browser-local examples are shared, live, or authoritative.
- The initial pilot language is English only; keep text localizable.
- Keep desktop-first coordinator work and responsive, low-bandwidth contributor use.

## Review Focus

- **Existing `field-desk` compatibility alias:** it must continue to highlight Undertakings; pin the mapping in `studio-navigation.test.ts`.
- **Network route distinctions:** People, Institutions, and Capability Directory must share the Network group while only the matching child view is selected; pin each context in `studio-navigation.test.ts`.
- **Direct links and refreshes:** each existing route must load with the correct active module and child; verify with the browser smoke steps in Task 2.
- **Collapsed sidebar discoverability:** every icon-only destination must retain an accessible name and title; verify keyboard focus and accessible names in Task 2.
- **Mobile drawer behavior:** selecting any module or Network child must navigate and close the drawer; verify with the browser smoke steps in Task 2.

---

## File Structure

- Create `src/lib/studio-navigation.ts` for typed module and subview metadata plus context-mapping helpers.
- Create `src/lib/studio-navigation.test.ts` for pure route, label, and active-view behavior.
- Modify `src/components/StudioNavigation.tsx` to render the four modules and Network’s two secondary destinations using existing links, identity behavior, and mobile drawer.
- Modify `src/pages/workspace/WorkspaceLayout.tsx` to use the typed context and show the parent module label in the existing footer.
- Modify `src/pages/workspace/Network.tsx` to pass the distinct `network` context.
- Modify `src/pages/workspace/FieldDesk.tsx` to distinguish the compatibility
  route’s exact page context from the Workbench finder.
- Modify `src/styles.css` only for nested Network destinations and their active, focus, collapsed, and mobile-drawer states.
- Do not modify `src/App.tsx`; all current route paths remain unchanged.

## Task 1: Define and Test the Studio Navigation Model

**Files:**
- Create: `src/lib/studio-navigation.ts`
- Test: `src/lib/studio-navigation.test.ts`

**Interfaces:**
- Produces `StudioContext = 'people' | 'institutions' | 'network' | 'commons' | 'workbench' | 'field-desk' | 'roll'`.
- Produces `StudioModuleId = 'radar' | 'network' | 'undertakings' | 'roll'`.
- Produces `StudioNetworkViewId = 'people' | 'institutions' | 'capabilities'`.
- Produces `StudioNavigationModule` with `id: StudioModuleId`, `label: string`,
  `href: string`, and `contexts: readonly StudioContext[]`.
- Produces `StudioNetworkDestination` with `id: 'institutions' | 'capabilities'`,
  `label: string`, `href: string`, and `context: StudioContext`.
- Produces `STUDIO_MODULES: readonly StudioNavigationModule[]`, ordered as:
  - Radar → `/workspace/commons`
  - Network → `/workspace/people` (the existing People view is the module’s
    default)
  - Undertakings → `/workspace/workbench`
  - Roll → `/workspace/roll`
- Produces `STUDIO_NETWORK_VIEWS: readonly StudioNetworkDestination[]`, with
  Institutions → `/workspace/institutions` and Capability Directory →
  `/workspace/institutions/network`.
- Produces `getStudioModuleForContext(context: StudioContext): StudioModuleId`.
- Produces `getStudioModuleLabel(context: StudioContext): string`.
- Produces `getStudioNetworkView(context: StudioContext): StudioNetworkViewId | null`.

- [ ] **Step 1: Write failing tests** in `src/lib/studio-navigation.test.ts`.

Test exact destination order, labels, and paths; test that `commons` maps to
`radar`, `people` / `institutions` / `network` map to `network`, both
`workbench` and `field-desk` map to `undertakings`, and `roll` maps to `roll`.
Test that the Network view helper maps `people`, `institutions`, and `network`
to `people`, `institutions`, and `capabilities`, respectively, and returns
`null` for non-Network contexts.

- [ ] **Step 2: Run the focused test and verify it fails.**

Run: `npm run test:unit -- --run src/lib/studio-navigation.test.ts`
Expected: FAIL because the navigation model has not been implemented.

- [ ] **Step 3: Implement the typed navigation model** in
`src/lib/studio-navigation.ts`.

Use exhaustive `switch` statements for context mapping so TypeScript reports a
new or unsupported context rather than silently selecting a default module.
Keep route definitions in one place; do not move icons or page behavior into
this pure model.

- [ ] **Step 4: Run the focused test and verify it passes.**

Run: `npm run test:unit -- --run src/lib/studio-navigation.test.ts`
Expected: PASS for all destination, alias, module, and Network-view cases.

- [ ] **Step 5: Commit the model and tests.**

```bash
git add src/lib/studio-navigation.ts src/lib/studio-navigation.test.ts
git commit -m "feat: define Studio navigation model" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 2: Integrate the Four Modules into the Existing Shell

**Files:**
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/pages/workspace/WorkspaceLayout.tsx`
- Modify: `src/pages/workspace/Network.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/styles.css`
- Modify: `src/lib/studio-navigation.ts`
- Test: `src/lib/studio-navigation.test.ts` (extend only if a model behavior is added)

**Interfaces:**
- Consumes the `StudioContext`, `STUDIO_MODULES`, `STUDIO_NETWORK_VIEWS`,
  `getStudioModuleForContext`, `getStudioModuleLabel`, and
  `getStudioNetworkView` exports from Task 1.
- Extends `StudioNavigationModule` with `defaultContext: StudioContext` so
  `aria-current="page"` can identify the exact destination, not only its
  active module.
- Produces four top-level links, with Network opening the existing People view
  and secondary Institutions and Capability Directory links underneath it.
- Produces one active top-level module state across all existing subroutes;
  `Network.tsx` passes `currentContext="network"` so Capability Directory is
  distinguished from Institutions.
- Produces `aria-current="page"` only on the exact destination.
  `FieldDesk.tsx` passes `currentContext="field-desk"` so the compatibility
  alias remains active under Undertakings without falsely marking
  `/workspace/workbench` as the current page.
- Produces a footer label from `getStudioModuleLabel`; preserve the existing
  footer layout and secondary “Studio context” text.
- Preserves identity-cabinet visibility and open/close/return behavior. Its
  Network page context label changes from “institutions” to “network” to match
  the new module grouping.
- Preserves sidebar-collapse preference and error notice, existing route
  paths, mobile drawer close behavior, and all page-level navigation.

- [ ] **Step 1: Write a failing exact-destination test** in
`src/lib/studio-navigation.test.ts`.

Assert that each module’s `defaultContext` matches its link: Radar/`commons`,
Network/`people`, Undertakings/`workbench`, and Roll/`roll`. Assert that
`field-desk` still maps to Undertakings but is not its default context.

- [ ] **Step 2: Run the focused test and verify it fails.**

Run: `npm run test:unit -- --run src/lib/studio-navigation.test.ts`
Expected: FAIL because module destinations do not yet define `defaultContext`.

- [ ] **Step 3: Define default contexts and distinguish the compatibility route.**

Add `defaultContext: StudioContext` to each `STUDIO_MODULES` entry in
`studio-navigation.ts`. In `FieldDesk.tsx`, pass `currentContext="field-desk"`.
Do not change its route, Workbench state, or identity-cabinet visibility.

- [ ] **Step 4: Integrate the pure model into `StudioNavigation.tsx`.**

Replace the five-item `CONTEXTS` list with the four model destinations. Render
Network’s Institutions and Capability Directory views as secondary links
with their existing icons; the top-level Network link opens the People view.
Use the existing `Link` components and preserve exact `aria-current="page"`
behavior for the selected destination; mark the Network parent active for any
Network context. Keep accessible names and titles for icon-only destinations,
including the secondary links while the sidebar is collapsed.

- [ ] **Step 5: Update context typing and footer labels.**

In `WorkspaceLayout.tsx`, use the shared `StudioContext` type and render the
module label from `getStudioModuleLabel`. In `Network.tsx`, pass
`currentContext="network"`. Leave `App.tsx` and every route unchanged.

- [ ] **Step 6: Add the minimal nested-navigation styles** in `src/styles.css`.

Keep the existing sidebar width, palette, typography, spacing, collapse
behavior, mobile header, and modal drawer. Style the secondary Network links
as a restrained subordinate group. Ensure focus, hover, active, collapsed
icon-only, and mobile-drawer states remain legible without overflow. Add no
new visual cards or dashboard content.

- [ ] **Step 7: Run the focused navigation tests.**

Run: `npm run test:unit -- --run src/lib/studio-navigation.test.ts`
Expected: PASS; existing route contexts still map to the intended module and
Network subview.

- [ ] **Step 8: Run the production build.**

Run: `npm run build`
Expected: TypeScript and Vite production build complete successfully.

- [ ] **Step 9: Verify the shell in the browser.**

Open the app and check `/workspace/commons`, `/workspace/people`,
`/workspace/institutions`, `/workspace/institutions/network`,
`/workspace/institutions/school-console`,
`/workspace/workbench`, `/workspace/field-desk`, and `/workspace/roll`.
Verify the correct active module and Network child on direct navigation and
refresh. Check the expanded and collapsed desktop sidebar, keyboard access to
icon-only links, mobile drawer selection/closure, and that page-level content
and identity-cabinet behavior remain unchanged.

- [ ] **Step 10: Commit the integrated shell.**

```bash
git add src/components/StudioNavigation.tsx src/pages/workspace/WorkspaceLayout.tsx src/pages/workspace/Network.tsx src/pages/workspace/FieldDesk.tsx src/styles.css src/lib/studio-navigation.ts src/lib/studio-navigation.test.ts
git commit -m "feat: group Studio navigation into workspace modules" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Completion Criteria

- Four operational labels are visible in desktop navigation: Radar, Network,
  Undertakings, and Roll.
- People is the Network default; Institutions and Capability Directory are
  reachable as Network destinations.
- All current routes, aliases, page-level flows, and identity behavior remain
  intact.
- Active states are correct on direct loads, refreshes, desktop, collapsed
  desktop, and mobile.
- Focused tests and `npm run build` pass.
- No Coin Lab route, token action, new backend, or unrelated workflow change is
  introduced by this shell plan.
