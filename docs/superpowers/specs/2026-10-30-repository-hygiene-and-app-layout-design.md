# Repository Hygiene and Active App Layout

## Status

Approved direction for design review: preserve the active source layout and
make only non-destructive repository-hygiene changes. No files are moved or
deleted as part of this phase.

## Current Application

APT-LABS is an active Vite + Preact application. Wouter routes in `src/App.tsx`
connect the landing and browser-local auth pages to the Studio workspaces:

- `/` renders the landing page.
- `/sign-in` and `/sign-up` render the auth page.
- `/workspace/people` renders the People network.
- `/workspace/institutions` renders the institution and asset register.
- `/workspace/commons` renders local observations and steward decisions.
- `/workspace/workbench` renders Workbench.
- `/workspace/field-desk` remains an alias for Workbench.

`src/pages/workspace/WorkspaceLayout.tsx` provides the shared Studio shell.
`src/components/StudioNavigation.tsx` contains the responsive navigation and
`src/components/IdentityCabinet.tsx` contains the browser-local identity
surface. General-purpose controls are in `src/components/`; People-specific
visualizations are in `src/components/people/`.

The local data boundaries are intentionally left in place for this phase:

- `src/lib/people-network.ts` owns People entities, relationships, and portable
  record handling. The People page, its network visualizations, and the identity
  cabinet use this record.
- `src/lib/local-workflows.ts` owns browser-local field signals, Commons
  governance, and work-brief drafts. Commons creates or updates records that
  Workbench consumes; Institutions reads signal counts.
- `src/lib/local-workbench.ts` owns browser-local applications and work
  lifecycle records. It uses `createLocalId` from `local-workflows.ts`.
- `src/pages/workspace/WorkbenchOpportunityFlow.tsx` presents the separate
  opportunity and application lifecycle.

Shared visual tokens and page styles remain in `src/styles.css`. Splitting or
rewriting that stylesheet is outside this hygiene phase.

## Repository Boundaries

- `src/` is the active Vite + Preact application.
- `docs/superpowers/specs/` contains current design specifications.
- `bin/` is the tracked historical implementation and design archive. It is
  not part of the active Vite build and remains unchanged.
- `.kilo/` and `.superpowers/` contain local planning, visual mockups, and
  session state; they are not application source.
- `scripts/.build/` and `scripts/.verify/` contain generated build output.
- `supabase/.temp/` contains local Supabase CLI metadata, not active migrations.
- Root `.tmp-*` files and logs are ignored local scratch artifacts. Their names
  indicate a mix of SQL, setup scripts, generated records, and logs; they must
  not be bulk-deleted or archived without separate review.
- `.env.local` is ignored and must remain local. Its contents are not part of
  this document or any commit.

## Approved Hygiene Scope

The next implementation phase may:

1. Update `README.md` to document the current routes, browser-local behavior,
   and active directory boundaries.
2. Add narrow `.gitignore` entries for local planning/session state and
   generated script/Supabase CLI output, so these artifacts are not accidentally
   staged.

The implementation must not move active source files, alter routes or runtime
behavior, remove any scratch or session files, change `bin/`, inspect or expose
environment-file contents, or enable a backend. Scratch-file cleanup requires
its own candidate list and explicit approval.

## Git Remote State

The local `origin` now points to `https://github.com/zion211112/dreamer.git`.
The duplicate local `dreamer-upstream` alias was removed; this did not delete
any GitHub repository. The separate `sparkle` remote was left unchanged. Five
commits that were ahead of `origin/master` were pushed successfully.

## Verification

For the hygiene implementation, review the README and ignore-rule diff, run
`git diff --check`, and run `npm run build` to confirm no application behavior
or build configuration was disturbed. Confirm that local-only paths remain
untracked/ignored and that no scratch, environment, generated, or archive
contents were staged.
