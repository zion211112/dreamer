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
- `/workspace/institutions/network` — People capability directory
- `/workspace/institutions/school-console` — browser-local School Console prototype
- `/workspace/commons` — local observations and steward decisions
- `/workspace/workbench` — browse local work examples and save or remove non-binding interest in this browser
- `/workspace/workbench/simulate` — compose a school need into an isolated, manually run Tender → Assembly → Acceptance → Roll-preview simulation
- `/workspace/field-desk` — compatibility alias for the Workbench simulation
- `/workspace/apt-coin-lab` — research-only area; no coin balances, transfers, rewards, access, voting, or authority

Authentication and workspace workflows are browser-local demo functionality,
not connected services. Passwords are not stored; there is no live
authentication, external service connection, or live transaction.

Workbench examples are static and not live opportunities. Interest is saved
only in this browser; it is non-binding and does not contact an institution.
The finder does not negotiate terms or start work.

The separate simulation reads a selected School Console need draft and can
reference an existing Commons observation or Institutions asset by ID.
Simulation records are stored separately in this browser; they do not publish
work, assign providers, authorize delivery, create registry assets, or create
a real Roll. Page Agent is unavailable until protected model infrastructure
exists.

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
