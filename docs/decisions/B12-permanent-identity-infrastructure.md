# B12 — Permanent Identity Infrastructure

| Field | Value |
|---|---|
| Decision ID | B12 |
| Date | 2026-11-25 |
| Status | Accepted |
| Scope | Authentication, canonical person identity, PostgreSQL schema/migrations, and tenant-scoped application authorization |
| Decision | PostgreSQL is the authoritative system of record. Better Auth owns authentication and session lifecycle. Drizzle ORM owns application schemas and migrations. Domain logic remains provider-independent. Supabase is not an application runtime dependency or requirement. |
| Supersedes | The Better Auth + Supabase Postgres/RLS deployment requirement in B11 and the conditional Supabase pilot proposal in the 2026-11-25 productive-network architecture. B11's identity/participation principles remain in force. |

## Context

The active application is an Angular 22 standalone, zoneless client. Its sign-in form validates input and then navigates to the workspace using a timer; it has no server, auth provider, session restoration, or route guard. Coordination state is browser-memory-only. Existing `supabase/schema.sql`, `supabase/migrations/0001_init.sql`, and `supabase/seed.sql` belong to a legacy implementation; they include broad shared access policies and synthetic records and are not a safe tenant boundary.

There is no configured PostgreSQL service, database URL, Better Auth secret, or production-ready tenant isolation proof in the inspected environment. Installing libraries or writing schema files does not prove a service is reachable or secure.

## Decision

1. PostgreSQL is canonical storage. Better Auth uses PostgreSQL through its Drizzle adapter for users, accounts, sessions, and verification records. Drizzle owns application schema and forward migrations.
2. `apt_persons.id` is a stable APT person identifier, distinct from the Better Auth user ID. A unique mapping connects the authenticated user to the canonical person. Authentication proves account control only.
3. Organization membership is an explicit, revocable, person-to-organization relationship with a scoped role. A selected organization ID or client-supplied actor ID never grants permission.
4. Protected application requests resolve the session from Better Auth on the server, resolve the canonical person from that trusted user ID, and require active membership in the target organization in the same query/transaction as protected access. No client-provided person, role, membership, or tenant claim is authoritative.
5. Tenant-facing APIs use provider-independent domain contracts and repository operations. No provider/database SDK enters domain logic. PostgreSQL constraints enforce referential integrity and active-membership uniqueness; service authorization is deny-by-default. Any future direct-to-database or background access must establish an equivalent boundary before use.
6. The existing local form is not a supported mock-auth fallback. With missing/invalid configuration, the server fails closed and the client reports auth unavailable; it never routes a fabricated identity into the workspace.
7. Do not apply migrations to production, reset/drop a schema, delete legacy data, or make production-readiness claims without explicit authorization and executable evidence.

## Identity and authorization records

- Better Auth tables: `user`, `session`, `account`, and `verification`.
- `apt_persons`: stable canonical person ID, unique Better Auth user mapping, display name, timestamps.
- `organizations`: tenant identity, creator person, provisional standing, timestamps/version.
- `organization_memberships`: person, organization, scoped role, grantor, active/revoked timestamps; an active membership is unique per person/organization.
- `opportunities`: organization-owned records, private by default, author, version and timestamps. Public discovery is not enabled by this schema until an explicit safe projection is implemented.

No global role is introduced. Person ≠ organization, account ≠ person, membership ≠ authority outside its scope, and authentication ≠ institutional verification.

## Migration and recovery policy

Migrations are additive, versioned, and generated from Drizzle schema. Never edit the legacy Supabase schema as part of this decision. Never auto-run a destructive down migration. Recovery requires a verified backup/restore rehearsal or an approved point-in-time recovery procedure before production use. A rollback that drops populated identity or tenant tables requires a separate explicit approval; the default response to a bad deployment is to stop writes, preserve evidence, and roll forward or restore an approved backup.

## Consequences

- A Node server is required alongside the Angular client for Better Auth and authorization. The server owns secrets and database connections; the browser receives only same-origin session cookies.
- Local/demo sign-in is removed rather than silently offered when the service is unavailable.
- PostgreSQL isolation is enforced through authenticated server-side repository queries and constraints. No Supabase RLS or service key is part of this architecture.
- Until a clean PostgreSQL database, migrations, two-account adversarial tests, recovery evidence, and operational controls are actually exercised, the integrated stack is `PROTOTYPE` or `BLOCKED`, not production-ready.

## Implementation and verification status (2026-11-25)

The architecture is accepted and the first local implementation is `PROTOTYPE`: Better Auth/Drizzle/PostgreSQL dependencies, an additive initial migration, local-only compose definition, same-origin development proxy, sign-up/sign-in UI integration, a fail-closed workspace guard, provider-independent identity contracts, and organization-scoped opportunity API routes are present. Organization membership resolution and protected reads/writes run within a serializable transaction. The API is bound to loopback for local development. `npm start` runs API and Angular; `.env.example` documents local settings. The legacy Supabase SQL remains untouched.

Verified in this checkout: `npm run typecheck`; `npm test -- --watch=false` (15 tests); `npm run build`; migration generation from Drizzle schema; API starts with explicit local-only environment settings; health endpoint returns `503`/`database: unavailable` when PostgreSQL is absent; unauthenticated requests are not granted tenant access by the implemented route flow. Docker Compose could not start because the Docker daemon is unavailable. No migration was applied and no live registration/session flow was exercised.

Still `BLOCKED`: executable PostgreSQL migration application, independent accounts, live session and cookie behavior, membership cross-tenant adversarial tests against the database/API, email delivery, password recovery, migration rollback/recovery rehearsal, backups, and production deployment/security controls. Email verification/recovery are explicitly not configured. Unit authorization tests prove only the pure contract, not database isolation. A build is not security proof, and this prototype is not production-ready.
