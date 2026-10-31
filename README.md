# APT-LABS

APT-LABS is an active Vite + Preact application. Its Studio brings together
People, Institutions, Commons, and Workbench in one workspace.

## Run locally

```sh
npm ci
npm run dev
```

Create a production build with:

```sh
npm run build
```

## Routes

- `/` — landing page
- `/sign-in` and `/sign-up` — browser-local demo authentication
- `/workspace/people` — People network
- `/workspace/institutions` — institution and asset register
- `/workspace/commons` — local observations and steward decisions
- `/workspace/workbench` — compose a school need into an isolated, manually run Tender → Assembly → Acceptance → Roll-preview simulation; existing local briefs and applications remain read-only
- `/workspace/field-desk` — Workbench alias

Authentication and workspace workflows are browser-local demo functionality,
not connected services. Passwords are not stored; there is no live
authentication, external service connection, or live transaction.

Workbench reads a selected School Console need draft and can reference an
existing Commons observation or Institutions asset by ID. Simulation records
are stored separately in this browser; they do not publish work, assign
providers, authorize delivery, create registry assets, or create a real Roll.
Page Agent is unavailable until protected model infrastructure exists.

Run domain and persistence tests with `npm run test:unit -- --run`.

## Project layout

- `src/` — active Vite + Preact application
- `src/pages/workspace/` — Studio workspace routes and shared shell
- `src/components/` — shared interface components
- `src/lib/` — browser-local workflow and domain data
- `src/styles.css` — shared visual tokens and application styles
- `docs/superpowers/specs/` — current design specifications
- `bin/` — historical source and design archive; not part of the active build

Local planning/session state, generated tool output, environment files,
dependencies, and build output are not application source and should not be
committed.
