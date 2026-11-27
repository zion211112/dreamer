# APT-LABS Preact Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development; execute task-by-task with independent verification before final cutover.

**Goal:** Replace the Angular browser UI with a Preact + TypeScript + Vite client while preserving authorized server APIs, database, domain contracts, and user-visible workflow semantics.

**Architecture:** Keep Express/Better Auth/PostgreSQL/Drizzle as the same-origin backend. Introduce a separate Vite/Preact browser root and typed API/session boundary; migrate screens incrementally while Angular remains the rollback path. Remove Angular only after route/auth/workflow parity and independent full verification.

**Tech Stack:** Preact, TypeScript, Vite, existing Zod contracts, existing Structural Emergence CSS, Express 5, Better Auth, PostgreSQL, Drizzle, Playwright/Vitest as currently supported.

**Spec:** `docs/superpowers/specs/2026-11-26-aptlabs-preact-workspace-design.md`

## Global Constraints

- Preserve docs/design/charter.md A1–A10, active B1–B8 and B13; Preact approval does not replace product architecture.
- Preserve PostgreSQL + Better Auth + Drizzle B12 and all server-side authorization/API boundaries.
- No attachment databases, credentials, server-action models, hard-coded persona roles, or client authority.
- Keep six ontology structures and framework-independent `libs/ontology` / `libs/domain` contracts.
- Do not delete Angular, routes, or source data until the exact replacement route passes documented tests and independent review.
- No new runtime/service/storage, generic workflow builder, offline sync, or speculative graph/AI framework.

## Review Focus

1. Unauthenticated, expired-session, and auth-service-unavailable requests never render protected data or act under a client-selected identity.
2. Cross-organization requests remain denied when routed through the new same-origin client.
3. Duplicate clicks, stale decisions, network interruption, and server validation conflicts preserve the existing recoverable error behavior.
4. Route refresh/deep links, keyboard focus, mobile navigation, and browser Back work without relying on Angular navigation state.
5. Reports, reviews, and event records stay distinct; no UI converts a report into verified truth or infers payment/value.

---

## File map

- `preact/index.html`, `preact/src/main.tsx`: Vite document and Preact entry point.
- `preact/src/app.tsx`, `preact/src/styles.css`: shared shell, URL routing, accessible route rendering, existing token consumption.
- `preact/src/api.ts`, `preact/src/auth.ts`: typed same-origin API and Better Auth session adapters; no authority decisions.
- `preact/src/features/*`: migrated feature slices; no cross-feature giant component.
- `vite.preact.config.ts`: development/build configuration with `/api` proxy to `127.0.0.1:3000`.
- `package.json`, `package-lock.json`: additive Preact/Vite scripts and direct dependencies during migration; Angular scripts remain until cutover.
- `tests/preact/**`, `playwright.config.ts`: component/route/auth/workbench regression tests as applicable.
- Final cutover only: `angular.json`, `src/main.ts`, Angular-only package entries and lockfile, Angular configs, agent docs describing the active stack. Preserve `src/server/**`, database migrations, `libs/ontology`, `libs/domain`, API tests, existing records, and Docker Compose data.

## Tasks

### Task 1: Reversible Preact/Vite foundation and shell — implemented


- Add only required Preact/Vite dependencies and scripts, retaining existing Angular build/dev scripts.
- Add Vite entry and accessible shell: Home, Commons, Workbench, Network, Records; secondary Reference; structural tokens; real route URLs; narrow-screen navigation and skip-to-main.
- Add typed same-origin request/session adapters that distinguish 401, 403, validation/conflict, and service-unavailable; no token/localStorage auth and no role inference.
- Check install, `npm run build:preact`, strict typecheck, narrow viewport, keyboard route operation, and API proxy against a running local server. If dependency registry access is unavailable, stop without faking a working migration.

### Task 2: Migrate sign-in/session and My Desk — implemented; browser checks partial

- Port the current Better Auth sign-in/up/session guard contract and preserve return URL/unavailable state.
- Port only real Workbench summary and authorized event data. Do not invent tasks/deadlines/metrics absent from the API.
- Test unauthenticated, expired/unavailable, loading, empty, error/retry, and authorized states; confirm API requests use same-origin cookies.

### Task 3: Migrate the existing undertaking journey — implemented; browser mutation flow not exercised

- Port Workbench queues and create flows, then undertaking detail, in manageable components.
- Preserve current server-computed actions and event/audit semantics: publish → interest → offer → acceptance → report → separate review.
- Re-run existing `npm run test:workbench-api` and add browser regression for participant, manager, reviewer, duplicate/stale action, and denial states.

### Task 4: Migrate supporting routes and Studio query surface — implemented; browser checks partial

- Port Commons, Network, Records lenses, Reference query/graph UI, and remaining reachable routes against existing APIs only.
- Preserve route redirects/deep links and studio query validation/isolation; run `npm run test:studio-api`, browser route tests, accessibility checks, and narrow/wide viewport review.

### Task 5: Independent gate and Angular removal — blocked on independent review and full parity evidence

- Freeze the migration tree and commission a fresh-context read-only verifier; do not self-attest.
- Require all supported routes, auth/session, API isolation, workbench/studio regression, typecheck, unit/browser tests, and Vite production build to pass on the same tree; review diff/scope and dependency graph.
- Only after the gate passes, remove Angular frontend runtime/config/packages; leave Angular out of final runtime and build graph. Do not alter backend or database. If any route or check fails, retain the reversible dual-build state and report the gap.
