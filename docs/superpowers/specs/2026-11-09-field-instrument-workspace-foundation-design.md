# Field Instrument Workspace Foundation

**Status:** Draft — pending user review  
**Date:** 2026-11-09  
**Scope:** Shared workspace shell and the `/workspace` overview only

## Context

APT-LABS is a local-first operating workspace for making productive capacity visible,
connectable, governable, and cumulative. Its five primary user jobs are Commons, Network,
Workbench, Records, and Intelligence. They share domain records and evidence boundaries; they
are not separate products.

The user approved the Field Instrument direction—warm, token-led, enterprise-luxury with gentle
warmth—and expanded the request to redesign the shared shell and all module screens. To keep the
work reviewable and protect working workflows, this first design cycle covers only the shared
shell and the workspace overview. Each module interior will receive a separate design and
implementation cycle afterward.

The existing public landing route remains separate. The overview becomes the canonical workspace
entry at `/workspace`.

## Goals

- Make the workspace feel like one coherent, premium instrument rather than a collection of
  screens.
- Establish a calm, legible shell that can support later module redesigns without prescribing
  their internal workflows.
- Give users a useful workspace overview that routes to real, existing destinations.
- Use the current APT-LABS design tokens and preserve the existing Preact, Wouter, and domain
  boundaries.
- Keep demo, configured, illustrative, and unavailable states truthful.

## Non-goals

- Redesigning the interior of Commons, Network, Workbench, Records, or Intelligence in this cycle.
- Reworking module data models, stores, APIs, permissions, or authentication behavior.
- Adding a new primary module, a second navigation system, a new UI framework, or a dependency.
- Adding fabricated metrics, activity, online states, evidence, or workflow progress.
- Replacing or redesigning the public marketing experience at `/`.

## Architecture and routes

- `/` continues to render the public `Landing` page.
- `/workspace` renders a new workspace overview inside the shared `WorkspaceShell`.
- The overview is a workspace context, not a sixth module. The module rail remains exactly five
  entries in charter order: Commons, Network, Workbench, Records, Intelligence.
- No module is selected while the overview is active. The shell must not use a Commons fallback
  for module-specific labels or identity context.
- The APT-LABS brand mark inside the workspace returns to `/workspace`; the public-page brand mark
  continues to return to `/`.
- Existing module and task routes remain stable. The overview links only to registered,
  implemented destinations, using the existing navigation registry where possible:

  | Module | Entry destination |
  |---|---|
  | Commons | `/workspace/commons` |
  | Network | `/workspace/network/people` |
  | Workbench | `/workspace/workbench` |
  | Records | `/workspace/records/roll` |
  | Intelligence | `/workspace/intelligence/coin-lab` |

- Keep module-specific task links in the context sidebar. The overview may expose the five module
  entry points, but it does not duplicate each module's internal navigation.
- The public “Open the workspace” entry should target the canonical workspace route through the
  existing sign-in continuation behavior. Other public audience links are outside this cycle
  unless they must be corrected to avoid linking to a removed route.

## Shared shell

Each persistent shell region has one job:

1. **Topbar:** APT-LABS workspace identity, current context, existing global search, and the
   current identity affordance.
2. **Module rail:** The five primary modules, with a clear and accessible selected state.
3. **Context sidebar:** Destinations and tasks for the current context only. The overview context
   may identify “Overview” but must not present itself as a module.
4. **Main surface:** The current page; shell navigation must not compete with page-level workflow
   controls.
5. **Inspector and change/activity surfaces:** Remain contextual. They appear only when real
   record selection or activity data requires them; no empty permanent pane is added to the
   overview.
6. **Status/activity region:** Reports actual runtime, storage, and activity state without
   implying shared storage or live engine work.

Preserve working behaviors including module navigation, global search, identity access, sidebar
collapse, focus handling, and contextual inspector/dock behavior. The shell's responsive
navigation remains discoverable and operable without hover.

### Engine availability

The current `WorkspaceShell` passes `agentAvailable={true}`, while the command dock does not call
an agent adapter and its send action only clears the draft text. The redesigned shell must not
present that as a connected agent or successful request.

- Until a functional adapter is actually connected, show the disconnected state and keep request
  input/submission unavailable.
- Do not create a run or proposal from a disabled or disconnected command surface.
- Do not add a simulated run, pending-review count, or “online” state to make the overview look
  active.

## Overview content

The overview is a quiet starting point, not an analytics dashboard.

- Lead with a concise workspace identity and a plain-language explanation of APT-LABS' purpose.
- Show the five modules as clear destinations with their real user job and one direct entry action.
- Offer a small set of task shortcuts only when each shortcut points to an existing, working
  route. Keep them secondary to the module destinations.
- Use content from the product charter and navigation model; do not invent customer names,
  records, events, counts, completion percentages, or operational health.
- If an existing illustrative scenario is ever surfaced, label it as illustrative at the point of
  use. This foundation does not need to fetch module data to render the overview.
- Show environment/storage status only from existing runtime signals. An empty activity state is
  a valid state and should remain visually calm.

## Visual direction

- Use the approved Field Instrument concept: warm paper surfaces, a deep field-green navigation
  signature, restrained teal and brass accents, editorial headings, and precise information
  hierarchy.
- Use existing semantic palette, typography, spacing, radius, shadow, and motion tokens in
  `src/tokens.css`. Prefer semantic tokens over copied hex values or a second local palette.
- Keep the serif for display hierarchy, sans for reading and controls, and mono for compact
  metadata only.
- Interpret “cute” as gentle warmth—small rounded details and considerate microcopy—not toy-like
  illustrations, oversized pills, or decorative status.
- Reuse the product's existing line-icon and brand-mark language. Do not introduce unrelated
  stock imagery or new icon dependencies.
- The design SVGs under `docs/diagrams/` describe product flow and system structure, not UI
  screenshots. Use them to understand information relationships. Legacy school-dashboard assets
  are not a workspace-shell design system.
- Preserve visible focus, readable contrast, reduced-motion behavior, and meaningful hover/focus
  parity.

## Responsive behavior

- **Wide desktop:** Keep the five-module rail, context sidebar, and main content distinct. Avoid
  compressing the overview into a dashboard-card grid.
- **Tablet:** Reduce navigation width before shrinking text or main content below usable measure.
  Keep module and context navigation available.
- **Mobile:** Use the existing accessible navigation-drawer pattern, stack overview content, and
  keep every primary destination reachable. No hover-only controls or horizontal page overflow.
- Support 320px-wide viewports, keyboard-only navigation, and `prefers-reduced-motion`.

## Data flow and failure behavior

- The overview is driven by static product/navigation metadata, not by a new query or persistence
  layer.
- Module actions navigate to their actual Wouter routes. A destination must not be shown as
  available if its route is not registered.
- Preserve errors and data-source distinctions in existing module workflows; the overview must
  not convert a failed query into a healthy or empty-success state.
- Keep local/demo, configured, illustrative, and disconnected labels grounded in their current
  source. No broad catch or success-shaped fallback is introduced.

## Compatibility and migration

- Existing module routes and page components remain mounted through the same shared shell.
- Existing local storage keys and domain stores remain unchanged.
- The workspace logo target changes only within the workspace shell; public-page branding remains
  unchanged.
- Existing user work in `src/styles.css` and `src/tokens.css` must be read and preserved before
  any implementation edits to those files.
- Future module cycles are separate specifications and plans. Proposed order is charter order:
  Commons, Network, Workbench, Records, then Intelligence. Do not start a later module redesign
  in the foundation cycle.

## Verification

The implementation cycle for this foundation must verify:

- `/` still renders the public landing page and `/workspace` renders the overview in the shared
  shell.
- The overview context does not select or label a primary module as active.
- Every module entry links to a registered destination; no overview action is decorative.
- Existing module contexts still select the correct rail item and retain their task navigation.
- The engine remains visibly disconnected unless a real request adapter is wired.
- Keyboard navigation, focus visibility, reduced motion, and the mobile drawer remain usable.
- No horizontal overflow at 320px, 390px, tablet, and desktop widths.
- `npm run build` and `npm run test:unit -- --run` pass before the next redesign cycle begins.
- Inspect the rendered app at desktop and mobile widths; automated build/tests alone do not verify
  the visual acceptance criteria.

## Implementation surface

Expected touchpoints, subject to a focused implementation plan:

- `src/App.tsx` — register `/workspace`.
- `src/pages/workspace/WorkspaceOverview.tsx` — new overview content.
- `src/lib/studio-navigation.ts` and its tests — explicit overview context and route metadata.
- `src/components/WorkspaceShell.tsx` and `src/components/StudioNavigation.tsx` — shell context
  and navigation behavior.
- `src/components/BrandMark.tsx` — configurable destination while preserving `/` by default.
- `src/pages/Landing.tsx` — align the public workspace-entry continuation with `/workspace`.
- `src/styles.css` and, only if required, `src/tokens.css` — token-led shared shell and overview
  styling, preserving all existing user changes.
