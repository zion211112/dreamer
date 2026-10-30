# Workbench Opportunity and Credential Flow

## Status

Design approved on 2026-10-30. This specification is awaiting user review before implementation planning.

## Purpose

Make Workbench the place where a person discovers institution-defined work, applies on disclosed terms, and follows the work from authorization through accepted evidence. Keep it inside the existing Workbench route and connect it to People, Institutions, and Commons without adding another product module.

The product should make productive capacity legible: an institution states a need and its terms; a person offers relevant capability; an authorized institution reviewer decides; authorized work produces evidence; the institution decides whether that evidence satisfies the brief; and an authorized issuer may then issue a verifiable credential.

## Product boundaries

- People presents a person's capabilities and evidence.
- Institutions identifies organizations, assets, and the people authorized to act for them.
- Commons carries observations and proposals with source provenance. A Commons observation may inform a brief, but it does not itself authorize work.
- Workbench connects a published opportunity to applications, institution decisions, authorized work, delivery evidence, acceptance, and the optional credential offer.
- Fikra API remains a backend observation provider. Workbench must not imply a live sensor connection or display live sensor results without a real, attributable feed.
- APT-LABS provides workflow and credential infrastructure; it is not the universal issuer and does not independently attest that work happened or was good.

The active app remains Vite + Preact + TypeScript + Wouter. Workbench stays at `/workspace/workbench`; `/workspace/field-desk` remains its existing alias. Other routes and their behavior are out of scope.

## Workbench experience

Keep one Workbench with three connected views:

1. **Opportunity register** — searchable institution-published briefs, with discipline, scope, location or delivery mode where relevant, required capability, deadlines, and engagement terms visible before a person applies.
2. **Brief and application** — the complete scope, expected deliverables, rights/attribution, safety or access requirements, acceptance criteria, institution, reviewer route, and compensation terms. The person submits an application note and expressly chooses whether to share relevant profile evidence. Applying is not accepting an assignment.
3. **My work** — the person's applications and, only after authorization, assigned work. Show each decision and next action without collapsing application review, authorization, delivery, acceptance, and credential issuance into one status.

An institution-authorized reviewer may publish a brief, review applications, select a person, formally authorize the work, assess submitted evidence, and record acceptance if their current role grants that permission. The work is not authorized by selection alone. Required scope, rights, compensation, and start conditions must be agreed and recorded before the worker can begin.

The design uses School Console animation work, Kemetos AGI1 software contribution, and Thiba Hydro fabrication as concrete product contexts. These names do not establish that an opportunity has been published, that the named organizations have commissioned work, or that a user has applied. Show only opportunities, terms, and state transitions received from the authorized workflow records. Do not add a per-card “illustrative” label; equally, do not manufacture live status, compensation, applications, or credentials for presentation.

Kemoly Murage is the default profile requested for the concept. Profile skills are not credentials. The profile must show only verifiable credentials with issuer and status information as credentials; a self-reported or locally seeded record must not be presented as cryptographically verified. Do not invent SBTs, ranks, or badges.

## Opportunity and capital terms

The publishing institution owns the brief and defines its engagement terms. A published brief must clearly state whether work is paid or unpaid. For paid work, display amount, currency, payment milestones or trigger, and any material expense terms before application. For unpaid work, state that explicitly before application. Do not allow publication with ambiguous compensation terms.

Workbench records agreed terms and whether the institution records that a payment obligation was met; it does not move money or represent payment as complete without an external, attributable payment record. Payment processing, escrow, payroll, and financial custody are out of scope.

Accepted work may create a credential-eligible claim, but acceptance is not itself a credential. The institution's issuer authority must make a separate issuance decision. Credentials represent the institution's attestation, not a financial transaction or proof of payment.

## Workflow and state transitions

Every transition is authenticated, authorized against the relevant institution and record, validated server-side, and written to an append-only audit history with actor, action, timestamp, and relevant decision evidence.

### Brief

`draft → published → closed`

Only an authorized institution publisher can publish or close its brief. Closing a brief stops new applications but does not erase existing applications or authorized work. Published briefs require complete scope, application deadline or explicit open-ended window, acceptance criteria, rights/attribution, safety/access requirements as applicable, and explicit compensation terms.

### Application

`submitted → under_review → selected | declined`

`submitted | under_review → withdrawn`

An application is private to its applicant and authorized reviewers for that brief. Once submitted, it cannot be edited; the applicant may withdraw until formal work authorization. A selection does not authorize work. The institution records a decision and a rationale visible to the applicant.

### Work

`authorization_pending → authorized → in_progress → submitted → changes_requested → submitted`

`submitted → accepted`

After selecting an applicant, the authorized reviewer records the final scope, terms, start conditions, and authorization. The worker must accept that authorization before work becomes `in_progress`. The worker submits evidence against the brief's acceptance criteria. The institution may request changes or accept the delivery; only an authorized reviewer can accept it.

### Credential

`not_eligible → eligible → issuance_pending → issued | issuance_failed`

`issuance_failed → issuance_pending` (retry with the same idempotency key)

`issued → suspended | revoked`

`suspended → issued | revoked`

Acceptance moves the work to `eligible`; it does not issue anything. An authorized issuer separately approves issuance. Issuance must be idempotent and tied to the accepted work and an auditable issuer decision. Failed or unavailable issuance remains visibly pending or failed; the UI must not show a success state without a credential response that can be independently verified. Suspension and revocation are issuer actions and must be reflected from authoritative credential status.

## Architecture

- **Frontend:** retain the current Vite + Preact application and route structure. Use existing shared workspace controls and `src/styles.css` for shared tokens and Workbench styling.
- **Identity and workflow store:** Supabase Auth and Postgres hold authenticated principals, institution membership/roles, briefs, applications, work records, evidence metadata, decisions, and audit events. The existing browser-local identity is not sufficient authority for institutional actions.
- **Authorization:** enforce tenant and record access with Postgres RLS. Use narrow server-side functions/RPCs for state transitions so clients cannot directly set privileged statuses. Reject invalid transitions with explicit errors; do not silently accept or convert them into success-shaped defaults.
- **Credential issuance:** a server-side function calls walt.id Community Stack Issuer2 (not deprecated Issuer v1) only after accepted work and a separate, authorized issuer decision. Issuer-specific key material remains outside the browser, repository, and ordinary application tables. Keep Issuer2 endpoints and credentials server-only.
- **Credential profile:** target W3C VC Data Model 2.0, OID4VCI 1.0, an Issuer2-supported Ed25519-compatible credential format, and Bitstring Status List status. Before enabling issuance, prove the exact selected combination end-to-end: issue, deliver to a holder wallet, independently verify signature/issuer/status, and suspend or revoke. A list of individually supported features is not proof of profile interoperability.
- **Hosting:** frontend remains deployable on Vercel. Supabase functions mediate workflow authorization and Issuer2 calls. No signing key, service-role key, or issuer secret is sent to the browser.
- **External services:** payments and sensor feeds remain external. Any future integration requires source attribution, explicit status semantics, and server-side verification before it can affect a brief or work record.

Institution roles must distinguish at least brief publisher, work reviewer/authorizer, and credential issuer. A person or institution may hold multiple roles, but each privileged action is authorized independently and recorded. APT-LABS operators do not inherit an institution's issuer authority.

## Data access and privacy

- Anyone may read the public fields of published briefs; authenticated application is required to apply or access private workflow records.
- Applicants can read and change their own application while its state permits; they can read their own work and credential lifecycle.
- Institution reviewers can read applications and evidence only for briefs and work records within their institution and role.
- Evidence files are private by default and accessed using short-lived, authorized URLs. Store evidence references and integrity metadata, not public file URLs.
- Sharing profile evidence with an application requires a distinct, explicit applicant choice. Do not expose unrelated profile data to reviewers.
- Audit events are append-only for normal application roles and do not contain secrets or unnecessary personal data.

## UI honesty and failure behavior

- The interface distinguishes an application from a selection, selection from authorized work, submitted evidence from accepted work, and eligibility from issuance.
- Never present local fixture data, a demo identity, or a proposed work context as a live institutional record. Until Supabase identity and records are connected, label the browser-local sign-in/workflow as a local concept and disable actions that imply an external submission.
- Never store passwords, issuer keys, service-role keys, or signed credentials in localStorage.
- Show actionable errors for authentication, permission, validation, network, and issuer failures. Do not hide a failed transition or issue a fake credential to keep a demo moving.
- No live sensor, payment, accepted-work, or credential status is shown without a source record and provenance.

## Out of scope

- Reintroducing Next.js or adding a separate Workbench service/module.
- Payment transfer, wallet custody, escrow, payroll, or token issuance.
- Universal APT-LABS credentials or platform-issued attestations of institution work.
- Automatic acceptance, automatic credential issuance, or issuance merely because a brief is completed.
- Frontend-operated Fikra sensors or fabricated live observations.
- Changes to sign-in/sign-up, Commons, People, Institutions, or unrelated routes beyond the minimum identity/authorization interfaces needed for Workbench.

## Verification and release gates

### Workflow tests

- A person can browse a published brief, inspect all required terms, explicitly share or not share profile evidence, and submit an application.
- An institution member without the relevant role cannot publish, review, authorize, accept, or issue.
- A valid role can perform only its permitted transition; illegal or replayed transitions fail and leave the record and audit history consistent.
- Selecting an applicant does not start work; work cannot begin until terms and explicit authorization are recorded and accepted.
- Evidence is private to the worker and authorized institution reviewers; acceptance is an institution action with a recorded actor and rationale.
- Paid and unpaid briefs both display explicit terms before application; Workbench never represents an external payment as transferred without attributable evidence.
- Cross-institution access, direct client status changes, unauthenticated writes, and credential issuance without accepted work plus issuer approval are denied.

### Credential tests

- In a non-production environment, prove the exact configured Issuer2 profile through issuance, holder delivery, independent verification, and status suspension/revocation.
- Verify that wrong issuer, invalid signature, invalid status, or failed issuance is surfaced and never shown as a verified credential.
- Verify retries do not issue duplicate credentials for the same accepted work and issuer decision.
- Do not enable production issuance until institution issuer authority, key custody, credential claims, and the tested profile are configured.

### Release gate

Run the existing production build and focused tests after implementation. A release must not claim live opportunities, submitted applications, payment, sensor activity, accepted work, or issued credentials unless backed by the connected, authorized records described here.
