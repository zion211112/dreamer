# APT-LABS — Current Architecture

This document describes the current software and links to the governing product architecture. It is not an implementation-readiness claim.

## Product architecture

APT-LABS is one shared productive network capable of expressing many forms of economic and institutional activity. Its product architecture is:

1. **Shared network kernel:** stable, typed concepts for Actors, Resources, Intentions, Commitments, Activity, and Knowledge, crossed by identity, relationships, permissions, provenance, history, privacy, and explicit economic records.
2. **Domain protocols:** versioned, stewarded contracts for domain-specific records, lifecycle, terminology, evidence, validation, and authority. They reuse the kernel rather than creating parallel identities or canonical stores.
3. **Focused experiences:** general and specialist interfaces over the same authorized records and actions. The six current surfaces—Home, Commons, Network, Workbench, Records, Intelligence—are today's navigation, not a permanent ceiling.

The product model is graph-shaped, not a universal linear workflow. Records can begin at different points, connect through typed and governed relationships, branch, recur, conflict, pause, fail, or be corrected. One canonical store preserves source provenance and disagreement; it does not make every claim true or every record globally visible.

See `docs/decisions/B13-shared-network-and-domain-protocols.md` and `docs/architecture/network-kernel-and-domain-protocols.md` for the accepted product decision and domain extension contract. `docs/ontology.md` is the domain vocabulary and must remain aligned with them.

## Technical infrastructure (current decision and prototype)

Decision B12 selects PostgreSQL as the authoritative system of record, Better Auth for authentication and session lifecycle, and Drizzle ORM for application schema and migrations. Domain contracts must not depend on provider SDK types. This is current infrastructure, not the product architecture or a permanent promise that these vendors can never change.

The codebase is Angular 22 standalone, zoneless, and strict TypeScript at the repository root, with a local Express API for Better Auth, organizations and opportunities, and the undertaking journey (publish, interest, offer, acceptance, report, review, audit). Commons, Network, Records and Workbench read those authorized records through `WorkspaceDataService`. Capability claims, Intelligence, and most overview tiles are still local projections, so the connected network architecture is implemented for one workflow, not yet across every surface.

### Verified boundaries

- Identity foundation, initial Drizzle schemas/migrations, Better Auth client/server, local PostgreSQL Compose configuration, session guard, and limited organization API routes exist as a `PROTOTYPE`.
- PostgreSQL local development uses `docker-compose.identity.yml`, `.env.example`, `npm run db:local:up`, `npm run db:migrate`, and `npm start`. Do not commit `.env` or real secrets.
- The Docker Compose database is local-only and bound to loopback. Starting the local service is not a production deployment.
- Current organization authorization is enforced in the application server. Database-backed two-account isolation is exercised for the undertaking journey by `npm run test:workbench-api` (three accounts, denial and conflict paths); adversarial isolation beyond that workflow is not established.
- Email verification, password recovery, email delivery, offline synchronization, localization, production backups/recovery, nationwide scale, and production operations are not verified or configured.
- Legacy Supabase SQL remains historical and is not the active runtime or an accepted tenant authorization boundary.

Do not claim live authentication, tenant isolation, recovery, production readiness, or Kenya-wide availability without current executable and operational evidence.

## Current stack

| Layer | Technology/status |
|---|---|
| Web app | Angular 22.3 standalone |
| Change detection | Zoneless (`provideZonelessChangeDetection`) |
| Language | Strict TypeScript |
| API | Express 5 / Node, local prototype |
| Authentication and sessions | Better Auth, prototype |
| Database and canonical store | PostgreSQL, local prototype; isolation evidence incomplete |
| Application schema/migrations | Drizzle ORM / Drizzle Kit |
| Unit tests | Angular CLI / Vitest |
| Browser tests | Playwright, when configured and run |

## Routes and current experiences

`src/app/app.routes.ts` is the route source of truth.

- Public: `/landing`, `/sign-in`, `/sign-up`
- Workspace shell (session guarded): `/workspace`
- Current primary surfaces: Home (`/workspace`), Commons, Network, Workbench, Records, Intelligence
- Additional current destinations: Value, Ontology, Sovereignty, and Network/Records subviews

The route list is descriptive. It does not define the permanent product topology; future focused experiences require product and domain-protocol design and must operate on the shared authorized network.

## Repository layout

```text
src/
  main.ts
  app.ts
  app/
    app.routes.ts        — route table
    app.config.ts        — browser and zoneless configuration
    auth/                — Better Auth browser client, service, and guard
    features/            — standalone screens
  server/
    auth.ts              — Better Auth server configuration
    authorization.ts     — organization authorization transaction boundary
    index.ts             — Express API
    db/                  — PostgreSQL client, Drizzle schema, migrations
libs/
  ontology/              — framework-independent families, relationships, events, workflows
  domain/                — provider-independent domain contracts
  shared/state/          — authorized server state (WorkspaceDataService) plus local drafting state
  shared/ui/             — shared UI primitives
  shell/                 — app shell components
docs/
  ontology.md            — canonical product/domain orientation
  architecture/
    network-kernel-and-domain-protocols.md — accepted network/protocol contract
```

## Commands

Run from the repository root:

- `npm start` — start local API and Angular development server (local `.env` required)
- `npm run db:local:up` — start the local-only PostgreSQL container
- `npm run db:migrate` — apply migrations to the configured `DATABASE_URL`; inspect the target before running
- `npm run typecheck` — strict TypeScript check
- `npm test -- --watch=false` — unit tests
- `npm run build` — production frontend build

A successful build or local browser session proves neither database isolation nor production readiness.
