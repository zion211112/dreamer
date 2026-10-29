# People Network Workspace

**Date:** 2026-10-28
**Status:** Approved in design conversation; awaiting written-spec review

## Goal and scope

Rethink the existing People workspace as an enterprise-readable map of
capability and contribution. Keep this iteration on the People route. It may
show connected crews, assets, work, institutions, and evidence as context, but
does not redesign those other workspaces or add backend behavior.

The current page generates 50 random people at runtime and connects them by
shared tags in a force simulation. Replace that unstable graph and its
overlapping fixed overlays with deterministic, explicitly illustrative
relationships. Do not present sample people, work, institutions, or evidence
as live records.

## Experience

- Keep the existing studio header.
- Introduce a compact People title/status area and six root lenses: **Person**,
  **Crew**, **Asset**, **Work**, **Institution**, and **Evidence**.
- Present a stable, navigable relationship atlas as the primary canvas. Use
  distinct node shapes for entity types, clear selection/focus, and relationship
  labels or a concise key. Do not rely on color alone.
- Put a contextual inspector alongside the canvas on wide screens. On narrow
  screens, show it as a bottom sheet; keep the root lenses horizontally usable.
- Use a dark ink map surface with restrained APT-LABS terrain, brass, and water
  accents inside the existing light studio frame. The reference material
  informs the connected-map structure and atmospheric depth, not its exact
  layout or styling.
- Mark the sample graph as **Illustrative network**.

## Interaction and information model

Root lenses change which entity types can anchor the same connected map. The
People lens is the initial view. Selecting a node focuses the map on that
entity and its direct relationships, and opens an inspector. Searching and
relationship filters narrow the same network rather than switching to a
separate card directory. Escape closes the inspector; keyboard users can reach
and select graph nodes.

Represent connections with explicit, directional relationship types, for
example:

- Person **member of** Crew
- Person **works at** Institution
- Crew **stewards** Asset
- Asset **held by** Institution
- Person or Crew **contributes to** Work, including Commons contributions
- Evidence **supports** Work or an Asset

These are example relation classes, not claims about actual people or
organizations. Model local sample entities and edges as typed, deterministic
fixtures. Show only explicitly authored edges; never infer a relationship from
coincident skills, names, or tags. Include useful capability, role, current
work, institutional/asset context, Commons contribution, and supporting
evidence in the selected entity's inspector when applicable.

Do not add nonfunctional “Connect,” “Send,” or other implied service actions.
No API calls, authentication changes, or persistence are part of this design.

## Implementation boundaries

- Replace the People page's random generator, inferred links, and force-layout
  simulation.
- Keep graph data and relationship types in a focused typed local module;
  separate reusable graph and inspector UI into focused People-workspace
  components.
- Add only People-scoped styles in `src/styles.css`; reuse existing shared
  design tokens and controls where appropriate.
- Do not change the workspace header, other workspace routes, design tokens,
  dependencies, or backend.

## Verification

1. Run `npm run build`.
2. In the browser, verify each of the six root lenses, node selection and
   focus, relationship filtering, search, and inspector content.
3. Verify keyboard focus/selection and Escape-to-close.
4. Inspect the wide and narrow layouts, including the inspector bottom sheet.
5. Confirm the graph is deterministic across reloads and remains clearly marked
   as illustrative.
