# APT-LABS Two-User Productive Network Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after the spec and provider decision are approved.

**Goal:** Enable independent people and an institutional participant to discover, accept, and record a real undertaking using shared, persistent, least-privilege data.

**Architecture:** Preserve the Angular modular monolith and six workspace surfaces. After an explicit identity-provider ADR and a successful database isolation proof, use provider-neutral APT person IDs, managed authentication, relational Postgres records, database-enforced row-level authorization, and private object storage. Keep the local demo separate from production mode and fail closed when live configuration is incomplete.

**Tech Stack:** Angular 22.3, strict TypeScript, existing domain/ontology packages, PostgreSQL/Supabase candidate (conditional; see spec §5), Vitest/Angular CLI tests, database authorization tests. No new runtime, database, or auth dependency before the ADR and human approval.

**Spec:** `docs/superpowers/specs/2026-11-25-aptlabs-productive-network-architecture.md`

## Global Constraints

- People are participants with agency, never assets, inventory, or scores.
- Identity, membership, capability, evidence, institutional standing, and authority are distinct.
- A claim is not evidence; a community observation is not an official finding; a recommendation is not a decision.
- Approval, authorization, execution, acceptance, compensation, and settlement are separately attributable and timed.
- The authoritative store owns state; n8n and AI are optional.
- No fabricated workspace records presented as real; preserve user-created data and schema.
- APTCOIN issuance, regulated capital transactions, money custody/settlement, and external civic data integrations remain gated.
- Do not deploy or write to a live service without explicit human authorization.

## Review Focus

- Missing or partial runtime config: app shows an actionable unavailable state and never silently authenticates via demo fallback.
- Cross-user and cross-tenant access: database policies deny private reads and unauthorized inserts/updates even with forged client context.
- Membership revocation: subsequent reads and writes are denied without requiring a UI refresh or trusting cached role claims.
- Duplicate submissions, retries, and stale versions: operations do not create duplicate commitments or overwrite concurrent edits silently.
- Empty or unverified identity: participant can join without capability evidence, and institutional/account verification is never implied.

---

## File Map (anticipated; reconcile after provider ADR)

- `docs/decisions/B12-pilot-auth-and-persistence.md` — approved provider choice and proof criteria; create only after user decision.
- `supabase/migrations/<timestamp>_pilot_productive_network.sql` — new schema/RLS; never modify a hosted DB without authorization.
- `supabase/tests/` — database policy assertions for user/role isolation.
- `libs/domain/src/` — provider-independent opportunity, participation, and work contracts/pure transitions.
- `libs/shared/state/src/` — repository interface and adapters; no UI-owned authorization.
- `src/app/app.config.ts`, `src/app/app.routes.ts`, auth/shell features — session provider, guards, fail-closed real mode and sign out.
- `src/app/features/workspace/overview.component.ts`, Commons, Network, Workbench — capability-first Home, discovery, institution/membership and workflow UI.
- `libs/domain/src/demo-seed.ts`, `libs/shared/state/src/coordination.service.ts`, `network.service.ts`, workspace projections — remove fabricated operational data only; preserve user-created data/reference content.
- Targeted specs beside changed code; an independent-account browser test only after service credentials/deployment are available.

## Phase 0: Provider and schema proof (blocked on decision and service access)

### Task 0.1: Resolve authentication provider

- [ ] Review the conditional Supabase Auth pilot proposal against accepted B11.
- [ ] Decide Better Auth vs Supabase Auth for the first cohort; record rationale and supersession in a new ADR before adding dependencies.
- [ ] Define stable APT person mapping, sign-in/recovery behavior, and migration/backout policy.
- [ ] Obtain a test project/configuration through the user without placing secrets in chat, source, or committed `.env` files.

### Task 0.2: Prove Postgres/RLS identity and isolation

- [ ] Define table/column public/private matrix and per-operation policy.
- [ ] Implement only the minimal identity/profile, actor/membership, opportunity, interest/offer, undertaking/participants, deliverable/evidence metadata, and audit records.
- [ ] Add policy tests for own profile, published opportunity projection, member-only details, membership-scoped writes, revocation, and cross-account isolation.
- [ ] Verify no privileged service key ships to browser; test incomplete config fails closed.
- [ ] Run migration on isolated test database and demonstrate two different accounts in two browser contexts.

**Phase exit:** Provider ADR and two-account RLS proof pass. Until then, all following tasks are design/testable domain work or explicitly deferred; no live-auth claim.

## Phase 1: Trustworthy productive loop

### Task 1: Provider-independent domain lifecycle

- [ ] Add pure typed contracts for opportunity, expression of interest, scoped offer, acceptance, work update/deliverable, evidence reference, review/dispute, and append-only consequential event.
- [ ] Define allowed transitions, actor/authority preconditions, idempotency key, version conflict, and rejection/dispute outcomes.
- [ ] Test unauthorized transition, duplicate retry, revoked membership, invalid state transition, and correction without loss of prior history.

### Task 2: Persistence and authorization adapters

- [ ] Implement repository interfaces for reads/mutations; keep component state out of persistence rules.
- [ ] Implement provider SDK adapter only after Phase 0 ADR; return typed unavailable/unauthenticated/forbidden/conflict errors.
- [ ] Test repository behavior with isolated local test doubles and database policy tests; test both allow and deny paths.
- [ ] Ensure public discovery uses explicit safe projections; never select private profile/evidence fields for public views.

### Task 3: Authentication and personal/institutional context

- [ ] Replace simulated auth behavior in real mode with selected provider sign-up/sign-in/sign-out/recovery and session restoration.
- [ ] Preserve clearly labelled demo mode as separate optional local behavior; never use demo fallback when provider configuration exists but fails.
- [ ] Add route guard and post-auth session identity; no global role/workspace selector.
- [ ] Add personal profile, provisional institution/enterprise creation, membership invitation/acceptance or joining request, role-scoped permission checks, and revocation.
- [ ] Test independent users, no-membership access, private profile/evidence, and institution verification wording.

### Task 4: Remove synthetic workspace records safely

- [ ] Add regression tests for empty workspace projections while retaining domain/reference ontology content.
- [ ] Remove seed-driven sample pilots and separately hard-coded fake activity/counts from live workspace projections.
- [ ] Preserve `OPERATIONAL_PILOTS` or historical fixtures only if still used as explicitly labelled test/demo fixtures; do not delete user-created records or schemas.
- [ ] Verify Commons, Network, Workbench, Records, Value, Intelligence, and Home show honest empty states and real-created records only.

### Task 5: Capability-first Home and discovery/offer UI

- [ ] Update `/workspace` (existing route) to the approved Capability record structure with honest zero-claim state, optional capability/evidence entry, privacy explanation, and accessible opportunity next step.
- [ ] Implement publishing/discovery and interest, scoped offer, accept/decline, deliverable/evidence, and separate review/dispute screens using real repository records.
- [ ] Add loading, empty, error, forbidden, stale/conflict, success, and mobile keyboard states.
- [ ] Test each interaction and role-sensitive control; UI visibility is not used as the authorization boundary.

### Task 6: End-to-end two-account acceptance

- [ ] Create independent test accounts; run the complete opportunity → interest → role offer → acceptance → deliverable/evidence → review loop in separate contexts.
- [ ] Refresh/reopen both contexts and assert authorized shared state persists.
- [ ] Attempt cross-user private profile/evidence access, unjoined institution access, forged actor ID, revoked membership, duplicate submission, and unauthorized review; assert denial/no side effect.
- [ ] Run build, type check, full unit tests, database policy tests, and configured browser tests; record evidence and limitations.

**Phase exit:** The full loop passes on a deployed test/staging service with two real accounts, and release/privacy/support prerequisites in spec §8 have named evidence and owners. Otherwise label `PROTOTYPE`.

## Deferred phases (separate ADR/spec and implementation plans required)

- Contribution records, assessment/dispute, reward proposal, off-chain credentials, token-issuance gate.
- Permission-aware evidence graph and Intelligence Briefs.
- People's Public Works Observatory and source adapters.
- Non-transactional Capital Rooms, then separately authorized financing/provider work.
- Governance constitution, portability, offline sync, resilience and economic network.

Do not fold those systems into the first cohort implementation merely to make the screens appear complete.
