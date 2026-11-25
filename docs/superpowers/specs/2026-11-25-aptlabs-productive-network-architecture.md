# APT-LABS — Productive Network Architecture and First Pilot

**Status:** Proposed for review; not an implementation claim
**Date:** 2026-11-25
**Evidence label:** Architecture is `PLANNED`; current-state statements below are `VERIFIED` from the inspected repository; unproven external integrations are `UNKNOWN`.

## 1. Product direction

APT-LABS is shared productive infrastructure through which people and institutions make capability legible, organise real work, preserve attributable evidence, learn from outcomes, and direct value with explicit authority. “Ready for 2099” means adaptable without betraying participants: durable identity and provenance, privacy, correction, portability, human agency, and replaceable technical edges—not a frozen product or a forecast of market leadership.

The product is one shared productive reality with permission-scoped views. Its six primary surfaces remain **Home, Commons, Network, Workbench, Records, and Intelligence**. They are lenses over connected records, not separate products or siloed demo datasets. Home uses the approved **Capability record** composition: claims, supporting evidence, and assessment are distinct; credentials are not a condition of participation; a clear route into real opportunities remains visible.

### Product invariants

- People are participants with agency, never assets, inventory, or scores.
- Identity, membership, capability, evidence, institutional standing, and authority are distinct.
- A claim is not evidence; a community observation is not an official finding; a recommendation is not a decision.
- Approval, authorization, execution, acceptance, compensation, and settlement are separately attributable and timed.
- Credentials attest to bounded accomplishments; economic instruments represent separately governed value. Neither expresses inherent human worth.
- No universal reputation score, opaque participant-worth ranking, or blockchain prerequisite.
- Deterministic rules and the authoritative store own state. n8n and AI can be unavailable without preventing core work.
- No invented people, institutions, work, capabilities, evidence, balances, or activity presented as real.

## 2. Verified current state and readiness boundary

| Area | Current evidence | Consequence |
|---|---|---|
| App | `VERIFIED`: Angular 22 standalone, zoneless, strict TypeScript at the repository root. | Retain the existing stack and six surfaces. |
| Authentication | `VERIFIED`: sign-in/sign-up currently simulate success and route to the workspace; no provider/session integration or route guard exists. | Do not describe the current sign-in as real. |
| Persistence | `VERIFIED`: the coordination spine is in-memory and seeds `OPERATIONAL_PILOTS`; Network derives records from the same synthetic corpus. | A local demo is not shared multi-user collaboration. |
| Legacy Supabase schema | `VERIFIED`: broad authenticated-user policies permit shared reads/writes; the schema documents that tenant isolation is future work. | Do not deploy or reuse it as authorization. Write a new least-privilege migration and prove isolation. |
| Runtime configuration | `VERIFIED`: no Supabase project URL/key, Better Auth secret, or local Postgres/Supabase CLI is configured in the inspected environment. | Real account and cross-user tests require later service setup; do not claim those tests passed here. |
| AI/n8n | `VERIFIED`: no tested app integration; Docker CLI is installed but its daemon is not running, and `localhost:5678` is unreachable in the inspected environment. | Neither is a core-pilot dependency or source of truth. |
| Regulatory/payment services | `UNKNOWN`: no licensed provider, legal classification, custody, payments, or production token issuance is configured. | Keep these capabilities disabled and non-transactional. |

A build or local browser session does not establish production authentication, database policy safety, email delivery, backups, availability, or operational readiness.

## 3. First release: 29-person onboarding target

### Outcome

Within one week of deployment prerequisites being met, up to 29 invited participants can create independent accounts and begin one real, shared undertaking with persistent records. This is an onboarding target, not a claim of validated scale or guaranteed deployment date.

### First complete workflow

1. A person creates an individual account, establishes a private profile, and may submit a capability claim and private evidence.
2. A second account creates an institution/enterprise actor and publishes a clearly scoped opportunity. Account creation does not verify an institution.
3. The person can discover the published opportunity and submit an expression of interest. Private profile settings and private evidence remain private.
4. An authorized institutional member offers a named role/commitment. The person accepts or declines. A browser-selected organization does not grant authority.
5. Participants record work updates, deliverables, and evidence in the same persistent undertaking, visible only to authorized participants (with any explicitly published opportunity/public fields remaining discoverable).
6. An authorized reviewer records acceptance, rejection, or a dispute separately from completion and payment. No automatic credential, payment, or token is implied.
7. Each consequential action has actor, time, subject, and prior/current state recorded; corrections append history rather than silently rewriting consequential history.

The loop must work for two independent identities across separate browser contexts and after refresh. The same records must not be accessible to unrelated accounts. It supports participation without claiming independent capability assessment or formal institutional verification.

### Pilot non-goals

No live APTCOIN, transfers, balances represented as money, custody, exchange, token sale, investment subscriptions, crowdfunding, payment settlement, SSO, automated credential issuance, public works data ingestion, automated allegations, universal scoring, or autonomous AI/n8n decisions. Profile images and evidence files can be enabled only with tested object-storage policies, type/size limits, and owner/participant visibility controls.

## 4. Domain and technical shape

Retain the ontology's six structures: Actors, Resources, Intentions, Commitments, Activity, and Knowledge. The pilot's minimum records are:

- **Identity:** provider-neutral APT person identifier mapped to the authentication subject; private personal profile.
- **Actor and membership:** person, provisional institution/enterprise, scoped role, active/revoked membership; membership conveys only defined permissions.
- **Capability claim and evidence:** claimant, bounded assertion, evidence reference/access class, standing, assessor and assessment history where present.
- **Opportunity:** publishing actor, scope, required capability claims, visibility, status, creator, and timestamps.
- **Expression of interest and offer:** submitting person, opportunity, response state, authorizing membership, named role/scope, and timestamps.
- **Undertaking/commitment:** accepted opportunity, participants, state transitions, deliverables, work updates, and evidence references.
- **Audit history:** append-only events for security-relevant and consequential actions; never a universal activity score.

Use the existing `IdentityRecord`, Actor, membership, and mandate contracts as inputs where they fit; do not treat types as implemented authorization. Keep a modular monolith and PostgreSQL as canonical storage. Use relational constraints, indexes, and relationship-scoped RLS before considering a graph database. Keep evidence objects in controlled object storage, not public-chain payloads. Authentication provider subject IDs map to stable APT person IDs; APT authorization stays in APT records/policies.

### Access boundary

- Every tenant/private table has RLS enabled and explicit `USING` and `WITH CHECK` rules. Default is deny.
- Public discovery is a deliberate projection of published opportunity fields, not broad reads of profiles, member lists, evidence, or work records.
- A user may read/write their own private profile and claims; authorized participants access only records shared with them; institution actions require active membership and scoped permission.
- Membership revocation takes effect on subsequent requests. Client context, route visibility, and role labels are not authorization.
- No client-side service-role secret. Authenticated client calls use the least-privilege public/publishable credential; any privileged server operation is separately scoped and audited.
- Security tests use distinct accounts/roles to prove both intended access and denied cross-account/cross-tenant access, including insert/update policy checks.

### Minimum relational record set

This is a proposed logical model, not yet an applied schema. Physical names and migrations require the provider ADR and schema review. Prefer extending compatible existing domain contracts over duplicate identity, actor, membership, mandate, and evidence models.

| Record | Required relationships and invariants |
|---|---|
| `persons` / private profile | Stable APT person ID; one-to-one mapping to authenticated subject; private by default; no global role. |
| `actors` | Person or provisional institution/enterprise; owner/creator; standing explicitly provisional until separately assessed. |
| `actor_memberships` | Person ↔ actor; scoped role and permissions; active/revoked state; inviter/grantor and timestamps. Unique active membership per person/actor as policy requires. |
| `capability_claims` | Person/crew subject; bounded claim and scope; visibility; claim state. Claim alone never asserts verification. |
| `evidence_items` | Owner/submitter, claim or work relationship, object metadata/path, access class, provenance, review standing; object contents remain private unless explicitly shared. |
| `opportunities` | Publishing actor, title/scope/requirements, explicit public fields, status, creator and timestamps. Only published safe projection is discoverable. |
| `expressions_of_interest` | Person, opportunity, optional proposal, state, idempotency key; unique active submission per person/opportunity unless resubmission rules say otherwise. |
| `offers` / commitments | Opportunity, offered person, named role/scope/terms, issuing membership, response and status timestamps. Issuer must hold the required active actor permission. |
| `undertakings` / participants | Opportunity reference, parties, authorized participant set, state/version. Membership does not imply participation in every undertaking. |
| `work_updates` / `deliverables` | Undertaking, author, structured description, status/version/time; participant-scoped access. |
| `reviews` / disputes | Deliverable, reviewer, decision/standing, criteria, rationale, conflict/appeal state. Author cannot satisfy a required independent review of their own work. No automatic credential or payment. |
| `audit_events` | Append-only actor, action, subject, organization context, timestamp, request/idempotency correlation, state/version reference; exclude secrets and unnecessary personal payloads. |

Use database constraints for referential integrity, allowed statuses, uniqueness/idempotency, and optimistic version checks. Multi-record transitions (for example issuing/accepting an offer and appending its event) must be atomic. Implement through a transaction-safe database function or server command with equivalent authorization; never rely on separate client writes to create authoritative state. Do not create an outbox until a real external consumer needs it.

### Permission boundary matrix

RLS and server-side authorization are additive; every table defaults to deny. “Public” below means an explicit published projection, not unrestricted reads of underlying rows.

| Principal | Private self profile/claims | Published opportunity | Interest / offer details | Undertaking, work, shared evidence | Institutional management |
|---|---|---|---|---|---|
| Anonymous | None | Read approved published projection only | None | None | None |
| Authenticated non-member | Own profile/claims only | Read approved published projection | Create/read own interest; read own offer only | None until participant | Create own provisional actor; no verified standing |
| Active opportunity publisher/member | Own private data | Read; manage only with scoped publish permission | Read/manage only in authorized publisher scope | Only if also an explicitly authorized participant | Membership-gated; no authority inferred from selected context |
| Accepted undertaking participant | Own private data; shared items by explicit access grant | Read | Own relevant interest/offer | Read/write allowed undertaking scope | No institution-wide access by participation alone |
| Revoked membership/non-participant | Own private data only | Read public projection | Own records only | Denied unless retained as explicit participant under a separate policy | Denied on subsequent requests |
| Platform operator | No routine content access | Operational metadata as needed | No implicit authority | No implicit content authority | Break-glass access only if designed, justified, time-limited, audited, and separately approved |

Negative tests must exercise `SELECT`, `INSERT`, `UPDATE`, and `DELETE`/revocation paths under real authenticated roles, including forged actor/organization IDs. Client-hidden buttons are not security controls. Public opportunity projections must not leak submitter email, private profile settings, membership, evidence paths, or unreleased work details.

### Consequential event envelope

Each domain transition appends an event in the same transaction as authoritative state. The minimum envelope is: `eventId`, `eventType`, `schemaVersion`, `subjectType`, `subjectId`, `actorPersonId`, optional `actorContextId`, optional `organizationId`, `occurredAt`, `recordedAt`, `idempotencyKey`, `correlationId`, `priorVersion`, `newVersion`, and a typed minimal payload. The authenticated identity is resolved server-side; an event never trusts a client-supplied actor ID without comparing it to the validated session and permissions. Keep personal/evidence content out of the event payload where a stable reference suffices. Corrections append an explicit correction/supersession event; they do not silently erase history. Delivery, review, compensation, credentials, and future value allocations have separate event types and state machines.

### Dependency graph

```text
Provider decision + test credentials
  └─ Identity mapping + schema/permission matrix
       └─ Migration + database isolation tests
            └─ Session/auth adapter + route guard
                 └─ Personal profile + provisional actor + membership
                      └─ Opportunity publication/discovery
                           └─ Interest + scoped offer + accept/decline
                                └─ Undertaking participants + work/deliverable/evidence
                                     └─ Separate review/dispute + two-account journey
                                          └─ Cohort release operations/privacy gate
```

Synthetic-record removal and the selected Home's empty-state UI can proceed independently of the provider decision. Live shared records, route protection, private file upload, and the end-to-end two-account claim depend on the completed provider and database proof.

## 5. Provider decision candidate (requires explicit review)

Accepted decision B11 prefers Better Auth when federation and account linking are required, while permitting reconsideration of Supabase Auth for early deployments that do not require them. The first 29-person pilot has no stated SAML/OIDC or cross-provider-linking requirement, and Supabase is the recommended low-operations candidate for managed Auth + Postgres/RLS + object storage.

**Proposal:** test Supabase Auth + Postgres RLS as the pilot provider, behind provider-independent APT person and authorization contracts. Accept it only after demonstrating stable APT person mapping and two-account cross-tenant isolation; revisit Better Auth before institutional SSO or identity-linking requirements. If that proof fails, do not release shared accounts. This proposal requires a recorded ADR superseding the applicable part of B11 before installing a runtime dependency or integrating the provider. The proof is not complete in the current environment.

## 6. Compounding architecture beyond the pilot

The following are architectural targets, not pilot features:

### Contribution and recognition

Keep a non-monetary, attributable contribution record now; later stages may add published contribution pools, claims, evidence, independent assessment, reward proposals, authorized decisions, and a transactionally consistent issuance ledger. APTCOIN is a proposed governed economic asset, not a login reward, arbitrary activity point, wage substitute, or measure of worth. Token issuance, transferability, custody, sale, exchange, redemption, and promotion remain disabled until Kenyan legal classification, authorization/licensing, treasury, governance, accounting, and operational controls are established.

APT credentials/SBT-compatible attestations remain separate from economic rewards. Keep credentials off-chain initially, bounded to a claim and issuer authority, evidence-linked, attributable, correctable, disputable, revocable/supersedable, and portable. No personal information on a public blockchain; no token ownership prerequisite.

### Capital Rooms

A future Capital Room is attached to a real undertaking and records its sponsor, plan, use of proceeds, evidence, risks, instrument, milestones, obligations, reporting, and history. Grants, donations, rewards, procurement, debt, equity, and asset-backed instruments are distinct. The pilot may not solicit or accept investment, collect funds, promise returns, or operate a financing marketplace. Any later regulated transactions require a correctly authorized operator/custodian and qualified legal review.

### People's Public Works Observatory

A later civic capability connects traceable public records about mandate, budget, release/disbursement, payment, procurement, contract, variations, physical delivery, outcome, audits, and community observations. These are separate facts and must never collapse into one progress percentage. Preserve original source, publisher, identifier, retrieval/publication dates, reporting period, snapshot/version, extraction status, and limitations. Label official records, verified documents, corroborated evidence, community observations, unverified reports, disputes, official audit findings, and resolutions separately. Flag a discrepancy for explanation; do not infer guilt. Verify data access/interfaces and permission before each source adapter; do not presume an API exists. Connect public opportunities to legitimate local capability and procurement pathways without creating a surveillance directory.

### Intelligence Fabric

Intelligence is a cross-surface analytical capability, not a chatbot or dashboard collection. Its future lenses are capability, operational, economic, civic, knowledge, foresight/scenario, and governance/decision intelligence. Begin with permission-aware, deterministic relational queries and provenance. Every material brief should show question/scope, findings, source references, whether each item is verified/claimed/inferred/unknown, conflicts, missing evidence, uncertainty, alternatives, next actions, and who may decide. Predictions expose assumptions and uncertainty; “insufficient evidence” is valid. AI may assist later, must not write authoritative records or decide/attest/pay, and must have replaceable providers and scoped tools.

### Governance and sovereignty

Keep platform, institutional, community, public-institution, and token governance distinct. Skills may qualify scoped technical review, never general political/financial authority; token balances do not automatically confer votes. Record proposals, eligibility, delegated authority, conflicts, deliberation, quorum, decision, appeal, and amendment under explicit policies.

Design for portable, documented exports; source and schema provenance; correction and access rights; encrypted backups and recovery; replaceable identity, storage, AI, and payment edges; offline field capture only when synchronization/conflict rules can preserve attribution and history. Do not add microservices, a graph database, a blockchain, or automation runtime for appearance alone.

## 7. Phased acceptance plan

| Phase | Acceptance evidence | Gate |
|---|---|---|
| 0. Pilot decisions and service proof | Provider ADR approved; chosen auth provider is mapped to stable APT people; isolated Supabase/Postgres proof denies cross-tenant/private reads and writes under two independent identities; credentials/configuration available without committing secrets. | No real shared-account release before all pass. |
| 1. First productive loop | Independent sign-up/sign-in, recovery and session behavior; profile/institution/membership; published opportunity → interest → scoped offer → acceptance → deliverable/evidence → separate review; shared state persists across sessions; explicit empty/error/loading states; no synthetic workspace records. | All workflow, authorization, and migration tests pass; legal/privacy/operations checklist and support owner assigned. |
| 2. Contribution and credentials | Non-monetary contribution lifecycle with evidence, independent assessment, disputes/corrections; off-chain bounded attestations; separate reward proposal with issuance disabled. | Governance policy and issuer authority defined before issuance. |
| 3. Intelligence foundation | Permission-aware entity links, evidence provenance, source-backed briefs, uncertainty and outcome feedback. | Cross-tenant retrieval tests and human decision gates pass. |
| 4. Civic Observatory | Limited real source set with source snapshots, correction, status distinctions, observation/response/dispute workflow. | Data access and publication/privacy review for each source and record. |
| 5. Capital Rooms | Due-diligence and non-transactional discovery first; instrument-specific reports. | Authorized operator, custody, legal, accounting, and disclosure controls before monetary activity. |
| 6. Governed economic network | Contribution pools, token policy, controlled issuance/ledger, governance procedures, portability/interoperability. | Kenyan legal classification/licensing and constitutional/economic governance approvals before any live APTCOIN service. |

A phase advances only on its stated evidence. Future-phase architecture does not constitute implemented capability.

## 8. Release and operational acceptance for the first cohort

Before inviting 29 participants, a release owner must verify and record:

- Production URL, TLS, domain, environment separation, and secret handling; no service-role key in browser assets or repository history.
- Applied migration on the intended project, checked policy behavior, recovery path, and a second-person review of the security boundary.
- Email delivery and sign-up, sign-in, sign-out, recovery, session expiry/revocation, duplicate/invitation edge cases, and human-readable failures.
- Two independently created accounts used from separate browser contexts and confirmed to see the same authorized opportunity/work records after refresh.
- Denied access to another user's private settings/evidence and to an unjoined institution's restricted work; public opportunities expose only approved fields.
- Backup/PITR or documented export, restoration rehearsal, retention/deletion/correction handling, incident contact, and owner for support/moderation.
- Privacy notice, participant consent, data minimization, accessibility/mobile review, and applicable Kenyan counsel review before regulated or sensitive data use.
- Empty states with no synthetic activity, plus a separately labelled local demo mode; n8n/AI disabled without blocking the core workflow.

A green local build is necessary but insufficient. If any service, security, privacy, or operational item is missing, label the release `PROTOTYPE` and do not represent it as ready for the 29-user cohort.

## 9. Current code areas to preserve or replace deliberately

- Shared synthetic corpus: `libs/domain/src/demo-seed.ts` → `CoordinationService` and `NetworkService`, with projections in Commons, Workbench, Records, Value, Intelligence, and Overview. Remove only fake workspace records/hard-coded activity; preserve ontology/reference content, screens, create flows, useful empty states, and user-created records/schemas.
- Current overview: `src/app/features/workspace/overview.component.ts`; selected Home design should evolve this screen, not create another home route.
- Auth: `src/app/features/auth/auth.component.ts`; keep demo disclosure until real provider verification and make real-mode configuration fail closed.
- Current legacy SQL is historical/untrusted for tenant access: `supabase/migrations/0001_init.sql`, `supabase/schema.sql`. Do not weaken their warnings or reuse broad policies. Add a new migration only after the provider decision and schema review.

## 10. Decision record prerequisites

Before product-code implementation of shared accounts, record: selected pilot auth provider and why; whether the provider proof passed; migration/backout/roll-forward policy; canonical identity mapping; public/private field matrix; per-table RLS rules and negative tests; storage bucket/path policy; retention/correction/export policy; and the named operational owner. The proposed Supabase Auth pilot decision is not accepted until explicitly reviewed and recorded as an ADR.
