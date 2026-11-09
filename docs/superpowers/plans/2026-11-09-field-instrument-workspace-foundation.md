# Field Instrument Workspace Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a premium, token-led workspace overview at `/workspace` and refine the shared shell without changing existing module workflows.

**Architecture:** Keep Wouter, the five-module navigation registry, and `WorkspaceShell` as the single workspace frame. Add an explicit overview context and static, truthful module-entry content; keep `/` public and retain existing module routes, data stores, and workflow components.

**Tech Stack:** Preact, TypeScript, Wouter, CSS custom properties, Vitest, Vite.

**Spec:** [2026-11-09-field-instrument-workspace-foundation-design.md](../specs/2026-11-09-field-instrument-workspace-foundation-design.md)

## Global Constraints

- “`/` continues to render the public `Landing` page.”
- “`/workspace` renders a new workspace overview inside the shared `WorkspaceShell`.”
- “The module rail remains exactly five entries in charter order: Commons, Network, Workbench, Records, Intelligence.”
- “Existing module and task routes remain stable.”
- “Use existing semantic palette, typography, spacing, radius, shadow, and motion tokens in `src/tokens.css`.”
- “Do not invent customer names, records, events, counts, completion percentages, or operational health.”
- “Until a functional adapter is actually connected, show the disconnected state and keep request input/submission unavailable.”
- “Support 320px-wide viewports, keyboard-only navigation, and `prefers-reduced-motion`.”
- “Run `npm run build` and `npm run test:unit -- --run` pass before the next redesign cycle begins.”
- Do not overwrite or revert existing user changes in `src/styles.css`, `src/tokens.css`, or unrelated untracked documentation.
- Do not add a dependency, replace a workflow, or begin a module-interior redesign in this cycle.
- Every implementation task ends with both `npm run build` and `npm run test:unit -- --run` passing before its commit.
- Include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` in each commit message.

## Review Focus

1. `/workspace` or a workspace brand link accidentally resolves to `/` or a legacy route; verify Wouter navigation and preserve the public home route in Task 3.
2. The overview context is coerced to Commons or another active module; pin `getStudioModuleForContext('overview') === null` and verify no rail item is selected in Task 1.
3. Overview module links drift from registered destinations; test the complete ordered destination list against `STUDIO_FLOW_MODULES` in Task 2 and smoke-test each link in Task 3.
4. The shell reports a connected agent or accepts a no-op request as real work; verify the disconnected dock and unavailable controls in Task 4.
5. Narrow layouts hide destinations, lose keyboard focus, or overflow horizontally; verify the mobile drawer and 320px, 390px, tablet, and desktop layouts in Task 4.

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/studio-navigation.ts` | Add the explicit `overview` context and a context-label helper while preserving module mapping. |
| `src/lib/studio-navigation.test.ts` | Pin overview's null module mapping and all existing module mappings. |
| `src/components/StudioNavigation.tsx` | Render overview context without a selected module or irrelevant task links; preserve current module navigation and identity behavior. |
| `src/components/WorkspaceShell.tsx` | Label overview context/storage accurately and report the engine as disconnected until an adapter exists. |
| `src/lib/workspace-overview.ts` | Provide five ordered, static module summaries joined to the canonical navigation registry. |
| `src/lib/workspace-overview.test.ts` | Verify exact module coverage, ordering, unique entries, and route registry consistency. |
| `src/pages/workspace/WorkspaceOverview.tsx` | Render the overview in `WorkspaceLayout`, with working links and no fabricated state. |
| `src/App.tsx` | Register the exact `/workspace` route without changing existing paths. |
| `src/components/BrandMark.tsx` | Accept an optional home destination; preserve `/` as the public default. |
| `src/pages/Landing.tsx` | Point the public workspace entry and stale audience continuation URLs to valid workspace routes. |
| `src/styles.css` | Refine the shared shell and overview presentation using existing tokens and responsive behavior; preserve existing local edits. |

## Task 1: Model the Overview Context in the Shared Shell

**Files:**
- Modify: `src/lib/studio-navigation.ts`
- Test: `src/lib/studio-navigation.test.ts`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/components/WorkspaceShell.tsx`

**Interfaces:**
- `StudioContext` gains `'overview'`.
- `getStudioModuleForContext(context: StudioContext): StudioModuleId | null` returns `null` for `'overview'` and preserves the existing module mapping for every other context.
- Add `getStudioContextLabel(context: StudioContext): string`, returning `'Overview'` for `'overview'` and the existing module label otherwise.
- The overview context destination uses heading `'Overview'`, has no module-task links, and displays a useful prompt to choose one of the five modules rather than the generic “No destinations in this context.”

- [ ] **Step 1: Test context labeling and module selection**

Add tests to `src/lib/studio-navigation.test.ts` asserting:
- `getStudioModuleForContext('overview')` is `null`.
- `getStudioContextLabel('overview')` is `'Overview'`.
- All currently tested module contexts retain their existing module IDs and labels.

- [ ] **Step 2: Run the targeted navigation test and verify it fails**

Run: `npm run test:unit -- --run src/lib/studio-navigation.test.ts`
Expected: FAIL because the overview context and context-label helper are not yet implemented.

- [ ] **Step 3: Add the explicit overview context**

Update `src/lib/studio-navigation.ts` and `src/lib/studio-navigation.test.ts` to implement the interfaces above. Do not assign overview to Commons or add it to `STUDIO_FLOW_MODULES`.

- [ ] **Step 4: Integrate overview semantics into the shell**

Update `src/components/StudioNavigation.tsx` and `src/components/WorkspaceShell.tsx` so:
- the topbar and sidebar use `getStudioContextLabel`;
- the module rail has no active item when the context maps to `null`;
- the identity cabinet receives the real context instead of falling back to Commons;
- the overview sidebar displays `Choose a module to begin.`;
- overview storage text reports `Workspace overview · no module data queried`, separate from the actual runtime label;
- `EngineActivityStrip` receives `agentAvailable={false}` because no request adapter is connected.

- [ ] **Step 5: Run navigation tests and project gates**

Run: `npm run test:unit -- --run src/lib/studio-navigation.test.ts`
Expected: PASS.

Run: `npm run build`
Expected: TypeScript and Vite build succeed.

Run: `npm run test:unit -- --run`
Expected: All unit tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/studio-navigation.ts src/lib/studio-navigation.test.ts src/components/StudioNavigation.tsx src/components/WorkspaceShell.tsx
git commit -m "feat: add overview context to workspace shell" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 2: Define and Test Overview Module Entries

**Files:**
- Create: `src/lib/workspace-overview.ts`
- Test: `src/lib/workspace-overview.test.ts`

**Interfaces:**
- Export `WORKSPACE_OVERVIEW_ITEMS`, a readonly ordered array derived from `STUDIO_FLOW_MODULES`, with each item containing its `moduleId`, `label`, `href`, and a plain-language `summary`.
- Export `WorkspaceOverviewItem` as the item type for the page.
- There is exactly one summary for each primary module, in charter order. Summaries describe the module's user job without implying unimplemented functionality.

- [ ] **Step 1: Test exact overview coverage and link provenance**

Create `src/lib/workspace-overview.test.ts` with tests asserting:
- the item IDs are exactly `['commons', 'network', 'workbench', 'records', 'intelligence']` in order;
- every ID is unique;
- each item's label and `href` equal the matching `STUDIO_FLOW_MODULES` entry;
- summaries equal the exact five strings specified in Step 3, including the disconnected-tools caveat for Intelligence.

- [ ] **Step 2: Run the targeted test and verify it fails**

Run: `npm run test:unit -- --run src/lib/workspace-overview.test.ts`
Expected: FAIL because the overview model does not exist.

- [ ] **Step 3: Implement static summaries from the charter**

Create `src/lib/workspace-overview.ts` with these exact summaries:
- Commons: `Surface needs, offers, resources, opportunities, and problems for shared stewardship.`
- Network: `Understand people, crews, institutions, assets, capabilities, and relationships.`
- Workbench: `Scope, assemble, coordinate, and manage productive work.`
- Records: `Inspect structural records, event history, provenance, and supporting evidence.`
- Intelligence: `Explore the research surface; analytic tools are not connected in this workspace yet.`

Derive labels and routes from `STUDIO_FLOW_MODULES`; do not duplicate route strings or query module data.

- [ ] **Step 4: Run targeted test and project gates**

Run: `npm run test:unit -- --run src/lib/workspace-overview.test.ts`
Expected: PASS.

Run: `npm run build`
Expected: TypeScript and Vite build succeed.

Run: `npm run test:unit -- --run`
Expected: All unit tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/workspace-overview.ts src/lib/workspace-overview.test.ts
git commit -m "feat: define workspace overview destinations" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 3: Add the Workspace Overview Route and Brand Entry

**Files:**
- Create: `src/pages/workspace/WorkspaceOverview.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/BrandMark.tsx`
- Modify: `src/components/StudioNavigation.tsx`
- Modify: `src/pages/Landing.tsx`

**Interfaces:**
- `WorkspaceOverview` renders `WorkspaceLayout` with `currentContext="overview"` and consumes `WORKSPACE_OVERVIEW_ITEMS`.
- `BrandMark` gains an optional `href?: string` prop defaulting to `'/'`; the workspace shell passes `href="/workspace"`, while public uses retain the default.
- `/workspace` is an exact route to `WorkspaceOverview`; all existing module routes remain unchanged.

- [ ] **Step 1: Build the overview page from canonical entries**

Create `src/pages/workspace/WorkspaceOverview.tsx` with:
- one editorial heading and concise explanation of the APT-LABS workspace;
- five module destinations, each with its summary and one actual route link from `WORKSPACE_OVERVIEW_ITEMS`;
- no metric cards, fake activity, or duplicate task navigation;
- semantic headings and link names that identify the destination.

- [ ] **Step 2: Register `/workspace` and make the brand destination contextual**

Add the `/workspace` route in `src/App.tsx`.
Add the optional `href` prop to `BrandMark` and pass `'/workspace'` only from `StudioNavigation`. Keep public `Landing` brand behavior at `/`.

- [ ] **Step 3: Correct public continuation targets**

In `src/pages/Landing.tsx`, update the primary “Open the workspace” continuation to encode `/workspace`. Correct stale People and Institutions continuation paths to `/workspace/network/people` and `/workspace/network/institutions`; keep the valid Commons route and preserve the investor memo destination.

- [ ] **Step 4: Verify route behavior in the browser**

Run the app with `npm run dev -- --host 127.0.0.1`. Verify:
- `/` still renders `Landing`;
- `/workspace` renders the overview and shell;
- all five overview links open the exact destinations from `STUDIO_FLOW_MODULES`;
- the workspace brand mark returns to `/workspace`, and the public brand mark returns to `/`;
- the public workspace and audience links enter sign-in with the intended `next` query path.

- [ ] **Step 5: Run project gates**

Run: `npm run build`
Expected: TypeScript and Vite build succeed.

Run: `npm run test:unit -- --run`
Expected: All unit tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/workspace/WorkspaceOverview.tsx src/App.tsx src/components/BrandMark.tsx src/components/StudioNavigation.tsx src/pages/Landing.tsx
git commit -m "feat: add workspace overview route" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 4: Refine Shared-Shell and Overview Visuals

**Files:**
- Create: `src/styles/workspace-foundation.css`
- Modify: `src/main.tsx`
- Modify as needed: `src/components/StudioNavigation.tsx`
- Modify as needed: `src/components/WorkspaceShell.tsx`
- Modify as needed: `src/pages/workspace/WorkspaceOverview.tsx`

**Interfaces:**
- No new runtime or data interface. Use the existing tokens and shell components.
- The shared shell remains usable by all existing module screens; this task must not redesign their interior content.

- [ ] **Step 1: Inspect and preserve current stylesheet work**

Before editing, inspect and note the current working-tree diff for `src/styles.css` and `src/tokens.css`, then read the relevant `.field-studio-shell`, topbar, rail, sidebar, content, status, and responsive rules. Integrate the existing changes; do not replace either stylesheet wholesale or revert user edits.

- [ ] **Step 2: Refine the shared shell with existing tokens**

Load a focused workspace-foundation stylesheet after `src/styles.css` to establish the approved Field Instrument treatment without staging the existing user-owned stylesheet changes:
- warm paper content and deep field-green navigation;
- restrained semantic teal/brass accents and editorial/sans/mono hierarchy;
- precise rhythm and subtle, token-based surfaces;
- visible focus and equivalent hover/focus affordances;
- no new local copy of the palette and no decorative false status.

Use existing `src/tokens.css` values; do not change it.

- [ ] **Step 3: Complete responsive and accessibility behavior**

Ensure the five-module rail, overview context, sidebar/drawer, search, and profile controls remain discoverable and operable across wide desktop, tablet, and mobile layouts. Preserve focus restoration when closing/navigating the drawer, keep reduced-motion behavior, and avoid horizontal overflow.

- [ ] **Step 4: Verify visual behavior and disconnected state**

Run the app and inspect the overview at 1440px, 768px, 390px, and 320px. Also inspect one existing route per module to confirm the shared shell remains coherent. Verify:
- no horizontal page overflow at any target width;
- keyboard focus remains visible and the drawer can be opened, navigated, and dismissed;
- reduced motion disables nonessential animation;
- no module is falsely active on `/workspace`;
- the command dock reports “Agent not connected” and does not accept a request.

- [ ] **Step 5: Run project gates**

Run: `npm run build`
Expected: TypeScript and Vite build succeed.

Run: `npm run test:unit -- --run`
Expected: All unit tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/styles/workspace-foundation.css src/main.tsx src/components/StudioNavigation.tsx src/components/WorkspaceShell.tsx src/pages/workspace/WorkspaceOverview.tsx
git diff --cached --stat
git commit -m "style: refine field instrument workspace shell" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Before committing, confirm neither `src/styles.css` nor `src/tokens.css` is staged; preserve all pre-existing edits in both files.

## Completion Gate

- `/` remains public; `/workspace` opens the overview in the shared shell.
- The five module links and all existing module/task routes remain valid.
- Overview contains no fabricated records, metrics, activity, or connected-agent claim.
- Existing module interiors and data boundaries are unchanged.
- Desktop/mobile visual checks, build, and the full unit suite pass.
- Only after this foundation is complete should a separate design cycle begin for Commons, followed by Network, Workbench, Records, and Intelligence.
