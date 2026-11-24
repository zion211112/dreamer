# Angular-Only Root Application Design

**Status:** Approved in chat; awaiting written-spec review

**Date:** 2026-11-25

## Context

The Angular application currently lives in `apt-labs/`. The repository root still
contains a separate Vite/Vue setup whose `index.html` points to the missing
`src/main-vue.ts`. The current architecture documentation also describes a retired
Preact application and is not an accurate map of the current source tree.

The Angular route table is the active route source. Its comment reports 19 routes,
but the table contains 21 route records: a root redirect, three public routes, the
workspace shell, and 16 workspace children. The workspace currently exposes more
top-level navigation items than the active charter's six contexts.

The investor deck is a separate Open Slide/Vite workspace under
`investor-deck/open-slide/`, with `/investor-memo/*` deployment rewrites, copy/build
scripts, and a Playwright test. It is explicitly out of the product scope and is to
be deleted, not migrated.

## Goals

- Make the repository root the only Angular application and source of truth.
- Remove the investor deck and all active build, test, and deployment wiring for it.
- Remove the retired root Vite/Vue site configuration and dependencies.
- Keep existing implemented public and workspace URLs working, except the removed
  investor-deck URL space.
- Align primary workspace navigation with the active charter: Home, Commons,
  Network, Workbench, Records, and Intelligence.
- Preserve unrelated files and pre-existing user changes.

## Non-goals

- Creating screens for planned-but-unwired modules such as Tenders, Failed Projects,
  Investment, University, or High School.
- Changing domain models, backend integrations, authentication behavior, or
  persistence.
- Reworking the product's visual direction beyond changes necessary for the agreed
  navigation and route behavior.
- Rewriting historical archive material merely because it mentions the retired
  stack.

## Architecture and cutover

1. Promote the existing Angular project to the repository root. Move its `src/`,
   `libs/`, Angular `public/` assets, and Angular CLI/TypeScript configuration into
   the root. Audit existing root public assets; include only assets referenced by
   the Angular app in its build, and preserve unrelated assets rather than
   silently deleting them. Resolve file-name collisions explicitly.
2. Consolidate the root package manifest and lockfile around the Angular app and
   tools still required by repository scripts and tests. Retain a root-level
   development/build/test entry point; it must not invoke Vite or Vue.
3. Update Vercel to build and serve the root Angular output, keeping the SPA
   fallback for Angular routes. Remove the `/investor-memo/*` rewrite.
4. Delete the `investor-deck/` workspace, its root build/copy/test scripts, the
   deck-copy script and test, and the Vite/Vue-specific root HTML/configuration
   files. Remove their obsolete dependency declarations and lockfile entries.
5. Update current setup and architecture documentation to describe the root
   Angular project. Historical references in archive material may remain.

## Routing and workspace navigation

- Preserve the existing landing, sign-in, sign-up, workspace overview, Commons,
  Network, Workbench and pilot-detail, Value, Records, Intelligence, Ontology, and
  Sovereignty paths.
- Keep the existing Network and Records subpaths addressable, and ensure the URL
  selects the corresponding view/filter rather than rendering a generic default.
- Remove the redundant all-modules list from the within-module sidebar. The
  primary rail exposes exactly the six charter contexts; the sidebar provides
  contextual links. Value, Ontology, and Sovereignty remain accessible as
  secondary pages, not primary modules.
- Add an explicit not-found route for unrecognized paths.
- Remove every active route or deployment reference to `/investor-memo/*`.

## Validation and acceptance

- A clean root install/build no longer depends on the nested `apt-labs/` project
  manifest or lockfile; unrelated files left there are preserved.
- Root Angular development, production build, and unit-test commands work.
- Playwright smoke tests verify every retained route renders its expected page,
  Records and Network subroutes select the correct view, and unknown paths render
  the not-found page.
- Vercel output points at the root Angular build and all Angular deep links use
  the app fallback.
- Active application manifests, scripts, and deployment configuration contain no
  Vite/Vue runtime or investor-deck build/test/deploy dependency. Historical
  documentation is not treated as active configuration.
- The app can be opened locally from the repository root on the existing
  development URL/port.

## Risks and mitigations

- **Root file collisions during flattening:** inspect both trees first, preserve
  existing root assets and unrelated files, and resolve collisions before moving.
- **Deep-link regressions:** test direct navigation to each retained route, not
  only navigation from the landing page.
- **Package-lock churn:** regenerate the root lockfile from the consolidated
  manifest and validate with a clean install; do not hand-edit lock entries.
- **Pre-existing dirty worktree:** keep unrelated modifications untouched and
  include only task-owned files in any later commit.
