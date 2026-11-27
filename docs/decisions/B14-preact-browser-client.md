# B14 — Preact Browser Client

| Field | Value |
|---|---|
| Decision ID | B14 |
| Date | 2026-11-26 |
| Status | Accepted direction; additive Preact slice is implemented, full route/session/workflow parity and runtime conformance remain `PLANNED` |
| Scope | Browser UI framework and frontend build only |
| Decision | Replace the Angular browser client incrementally with Preact + TypeScript + Vite, following the user-approved migration. Keep the current Express API, Better Auth, PostgreSQL, Drizzle, server authorization, domain contracts, and B13 shared-network model. Remove Angular frontend dependencies only after route, session, API, and workflow parity is independently verified. |
| Authority | Explicit user approval in the 2026-11-26 workspace redesign conversation |
| Related | Charter A1–A10 and B1–B8/B13; B12 permanent identity infrastructure; `docs/superpowers/specs/2026-11-26-aptlabs-preact-workspace-design.md` |

## Context

The active repository currently ships an Angular 22 standalone/zoneless frontend (`src/main.ts`, `angular.json`) with an Express API (`src/server/index.ts`), Better Auth, PostgreSQL/Drizzle, a same-origin API proxy, provider-independent ontology/domain libraries, and an implemented multi-account undertaking workflow. The frontend framework is an implementation choice, not the B13 product architecture. The user explicitly selected Preact as the future browser framework after reviewing three supplied prototypes and a product doctrine.

Those attachments are independent React/Next.js prototypes, not a drop-in client. They introduce separate Supabase or SQLite schemas, seed records, role models, action systems, server runtime assumptions, and speculative security/cryptographic/offline assertions. They are design references only and are not authority for APT-LABS semantics or runtime behavior.

## Decision details

1. Use Preact + TypeScript + Vite as the target browser stack. Keep views route-level and task-focused; use URL routes, small typed API/session boundaries, Preact-native primitives, semantic HTML, and the current Structural Emergence tokens. Framework choice does not itself reduce complexity; preserve clear boundaries and test real behavior.
2. Keep `libs/ontology` and `libs/domain` framework-independent. Existing product/domain meanings, evidence labels, stable records, and authorization contracts survive the renderer migration.
3. Keep Better Auth session resolution and all permissions on the existing server. Client role labels, selected organizations, route state, and visibility controls never confer authority.
4. Keep the same-origin Express API and PostgreSQL/Drizzle system of record. Do not import prototype SQLite files, Supabase fixtures, seeded personas, or demo database records.
5. Keep the present five primary destinations from B1: Home, Commons, Workbench, Network, Records. Workbench remains the real undertaking journey; Reference/object exploration stays supporting and secondary. Experiences may change, canonical stores and authority do not.
6. Migrate one route slice at a time with both frontends retained until its behavior is verified. Do not run two frontends simultaneously in one browser runtime as a permanent architecture. Final Angular removal is a separately reviewed cutover gated by route, auth, isolation, build, test, accessibility, and independent verification evidence.
7. No new database, auth service, workspace identity, workflow engine, global state framework, Nx, SSR, offline sync, graph backend, AI agent runtime, payment, credential, or deployment boundary follows from this choice. Dependencies beyond Preact and the Vite build/tooling require demonstrated need and review.

## Consequences

- Angular remains the established production/dev browser client until migration gates pass. The additive Preact/Vite client is installed and buildable but does not replace Angular or claim full parity.
- Migration work must preserve `npm start` backend semantics, cookies, route access, deep links, API isolation regressions, and Docker's local-only PostgreSQL role.
- Existing route behavior and server APIs are the baseline; prototype screens are not parity evidence.
- Node's version floor must remain compatible with the installed Vite release; direct dependencies and lockfile must state the chosen versions.
- Update `AGENTS.md`, `QUICKSTART.md`, architecture and role ownership maps only when the matching implementation/cutover is real. Never pre-label target paths as active implementation.

## Acceptance and verification gate

Angular may be removed only when all supported routes/deep links and session/sign-up/sign-in behavior pass on the new client; Workbench and Studio API regression suites plus browser and unit tests pass; strict typecheck and production Vite build pass; cross-organization denials still hold on the server; no Angular packages remain in the final runtime/build dependency graph; and a fresh-context independent verifier reviews the frozen tree and recorded evidence. A green frontend build alone is insufficient.

## Evidence boundary

- `VERIFIED`: Current repo contains the Angular route table, zoneless bootstrap, shared authorized data service, same-origin proxy config, Express/Better Auth/PostgreSQL/Drizzle implementation, and API regression scripts.
- `VERIFIED`: An additive Preact/Vite workspace slice builds and covers Home, Commons, Workbench, Network, Records, and Reference/Studio paths against the existing APIs; Preact client tests and existing Workbench/Studio API regressions pass.
- `PLANNED`: Full supported-route, auth and workflow parity, independent review, and any Angular removal/cutover.
- `UNKNOWN`: Production deployment topology, full production readiness, and attachment prototype authorization/security guarantees.
