# Workspace Economy and Flow Rethink

## Status

This design was developed with the user and is approved for specification.
The user later selected a six-destination, flat workspace navigation; the
APT Coin Lab is a research-only destination with no operational coin behavior.

## Goal

Strengthen the existing APT-LABS workspace into a coherent instrument for
accountable cooperation. Preserve its visual identity and useful module
surfaces, but clarify what each module does, how records move between them,
who has authority at each transition, and how contribution claims and the
APT Coin fit without becoming substitutes for evidence or consent.

The education workflow is an example of the system, not its only use case.
People, institutions, commons decisions, undertakings, and durable records
must each retain their own purpose and be improved as connected but distinct
flows.

## Product principle

APT-LABS helps people move from a situated claim or need to accountable
collective work and a correctable memory of what happened:

**notice → discover → decide → agree → act → accept or contest → remember →
selectively disclose**

Evidence, authority, money, contribution, credentials, and tokens are
different kinds of information. The interface and data model must not collapse
them into one reputation score or imply that recording a claim makes it true.

## Scope

### Included

- Reframe and connect the existing workspace flows across People,
  Institutions, Commons, Workbench, and Roll.
- Establish explicit authority, terms, evidence, correction, and dispute
  boundaries between those flows.
- Define an optional, selectively disclosed contribution SBT-like attestation
  for accepted work.
- Include APT Coin Lab as a separate, non-operational research destination.
- Preserve the current Vite + Preact application and visual language while
  clarifying its navigation and information hierarchy.
- Design for a desktop-first coordination experience with responsive,
  low-bandwidth participation.
- Treat 10,000 active Kenyan users as an operating-service aspiration, not a
  claim that the current demo supports that scale.

### Excluded

- Issuing, transferring, or holding APT Coin.
- Live payments, token rewards, token voting, or token-gated access.
- Public-chain SBTs or permanent public identity links.
- Replacing the current application shell with the visual mockup.
- Rewriting all routes or collapsing all records into one generic object.
- Claiming that browser-local examples are shared, live, or authoritative.
- Choosing a blockchain, token economics, production backend vendor, or
  regulatory classification in this design.

## Workspace modules

Keep the current shell geometry and visual identity. Use six flat destinations:

1. **Radar** — the current Commons surface. Capture observations, proposals,
   steward decisions, and the status of a concern. “Being checked” and
   “work planning” are not verification or authorization.
2. **People** — participant-controlled profiles, consent, availability, and
   scoped capability claims. The Capability Directory is a People view.
3. **Institutions** — organizations, assets, record basis, and delegated
   authority. A title or relationship alone does not authorize work.
4. **Undertakings** — the current Workbench surface. Discover, compose, agree
   terms for, authorize, deliver, review, and if needed dispute work.
5. **Roll** — durable records of outcomes, evidence, acceptance, cost
   disclosure, attribution, and visible revisions. It is an accountable memory,
   not an infallible ledger.
6. **APT Coin Lab** — a research-only area for comparing hypothetical
   accounting, incentive, and governance models. No coin role is selected.

People and Institutions are independent peers, not nested views. Existing
routes remain compatible while navigation is evolved. The School Console is
one source of needs and work, not the canonical entry point for every
undertaking. APT Coin Lab is visible as a module but remains outside operational
workflows: no balances, transfers, rewards, access, votes, or authority.

Use the mockup only as a limited interaction reference: make source, state,
uncertainty, authorization, and a useful next action easy to scan. Do not copy
its replacement rail, example content, or overall styling. Visual quality
should come from precision, hierarchy, typography, and restraint—not trading
imagery, crypto-gold tropes, or exclusivity. Craft may feel premium; access
must not be elitist.

## Shared record model

Records remain typed and independently understandable, connected through
explicit references rather than flattened into a universal object:

- **Signal:** an observation or reported need, with source, location, consent,
  evidence on hand, missing checks, and current review state.
- **Proposal/decision:** a governance request and its attributable decision
  history, separate from authority to commission or fund work.
- **Network record:** a person, crew, institution, or asset with record basis,
  relationships, roles, and separately scoped capability claims.
- **Undertaking:** scope, deliverables, participants, authority, terms, safety,
  evidence requirements, and acceptance criteria.
- **Event and decision:** who did what, under which recorded authority, when,
  and with what rationale.
- **Roll entry/revision:** the outcome record and append-only correction or
  restriction history.
- **Attestation:** an optional claim derived from a recorded contribution,
  identifying its issuer, scope, supporting evidence, date, and current status.
- **Coin scenario:** a hypothetical model with explicit assumptions; it is
  never a balance, transaction, or entitlement.

The same real-world item may be referenced in several modules, but the
interface must show which record is the source and what that reference does
and does not establish.

## Module flows and boundaries

### Radar

1. A participant submits an observation or need and its source.
2. A steward or responsible reviewer may triage it, request evidence, return
   it for clarification, or close it with a recorded reason.
3. A proposal may be approved, rejected, or returned under its stated
   governance rule.
4. A sufficiently described signal may be linked to a draft undertaking.

An observation is not a verified condition. Triage is not commissioning.
Proposal approval does not grant spending or work-authorization authority.

### Network

- People control profile availability, contact sharing, and the visibility of
  capability claims.
- Capability claims distinguish self-declaration, attribution, and
  independently supported evidence; evidence scope is stated.
- Institutions and assets retain source and record-basis information.
- A directory entry does not prove that an institution controls an asset, that
  an asset is operating, or that a listed person is available.
- Authority is a scoped, attributable delegation, not an inference from a
  profile, relationship, title, or SBT.

### Undertakings

The work lifecycle is:

**draft → terms disclosed and published → interest/applications →
review/selection → participant agreement → authorization pending →
authorized → in progress → delivered → accepted, changes requested, or
disputed → closed and recorded**

Selection is not agreement or authorization. Scope, compensation or explicitly
unpaid status, amount or basis, expenses, payment trigger, rights, safety
conditions, and acceptance criteria must be disclosed before someone expresses
interest. Material term changes require renewed participant agreement.
Authorization then records the institution's authority and funding. Delivery
and acceptance are separate decisions. A dispute or requested change must
remain visible and attributable.

The lifecycle applies to education and other forms of cooperation. Each
undertaking may omit irrelevant fields only with an explicit reason; it must
not silently imply that omitted terms are agreed.

### Roll and contribution attestations

- Record accepted outcomes with participants, attributed roles, supporting
  evidence, disclosed cost where applicable, and the accepting authority.
- A hash match demonstrates that covered fields match a digest. It does not
  prove identity, evidence, acceptance, or the truth of a claim.
- Keep corrections and access changes as visible revisions; do not silently
  rewrite the record.
- A contribution attestation is optional, non-transferable, scoped to the
  accepted contribution, and issued only with the participant’s consent.
- Use selective disclosure by default. The participant chooses when and with
  whom to share a verifiable claim.
- A claim must identify its issuer and basis and support dispute, correction,
  revocation, and expiry semantics. It is not a universal reputation score,
  proof of character, or automatic eligibility/access rule.
- Model SBT semantics off-chain first. Do not publish identity-linked
  attestations to a public chain until privacy, recovery, issuer accountability,
  and legal review are complete.

### APT Coin Lab

- Model possible accounting, incentive, and governance interpretations as
  separate scenarios with assumptions, failure cases, and distributional
  effects.
- Keep ordinary money and cost disclosure (including KES) distinct from
  contribution, value, evidence, credentials, and hypothetical token units.
- Do not issue coin, create balances, move value, award work, authorize
  undertakings, or grant votes in the operational workspace.
- Do not require coin ownership to discover work, participate, or receive an
  optional contribution attestation.

## Authority, privacy, and inclusion

- A named institutional actor with recorded delegated authority must approve
  the undertaking’s scope, terms, and funding before work begins.
- Commons stewards can decide Commons proposals but cannot commission work or
  spend institutional funds without a separate, recorded delegation.
- A person’s participation or credential is consent-based; private information
  is not made public merely because a related record is public.
- No public-by-default identity graph, universal contribution ranking, or
  immutable public record of a person’s participation.
- Provide a visible path to challenge a record, correct an error, restrict
  evidence, and learn what changed and why.
- Initial pilot language is English only, as selected by the user. Keep text
  localizable so language support can change without rewriting workflows.
- Desktop-first for institutional and coordinator work; responsive, low-
  bandwidth screens for contributors. Offline-first and SMS workflows are
  deferred until synchronization, privacy, and support requirements are
  validated.

## Application and service architecture

- Retain Vite + Preact and the existing module components and routes as the
  application foundation.
- Connect module records through typed identifiers and explicit transitions.
- A future shared service must be authoritative for identity, permissions,
  institutional delegation, and consequential workflow transitions. Client
  state must not enforce trust or imply a successful shared action.
- Review the existing Supabase path as a candidate; this design does not select
  a production backend or authorize a migration.
- Keep the browser-local demo boundary explicit. Local demo storage must not
  appear to be a shared multi-user record or transaction.
- Store evidence with access controls that match its visibility; avoid placing
  sensitive evidence or identity metadata on a public chain.
- Preserve a durable, attributable event history for decisions, status
  changes, corrections, and disclosure.

## Failure behavior

- Missing authority, terms, evidence, or acceptance criteria block only the
  transition that requires them and explain what is missing.
- Save, authorization, upload, review, and persistence errors are explicit;
  failure never appears as success and never falls back to local-only behavior
  without clear labeling.
- Retried consequential actions must be idempotent and must not duplicate
  undertakings, deliveries, attestations, or records.
- Loading failure, empty results, access denial, validation error, and stale
  data are distinct states.
- A failed or disputed operation leaves an inspectable history and a supported
  recovery path; corrections do not erase the original decision.

## Feasibility and rollout

The 10,000-active-user goal requires an operating service, not just a refined
shell. Before claiming that scale, the system needs shared identity and
permissions, durable shared records, protected evidence storage, moderation
and recourse, backups and recovery, security/privacy operations, participant
support, and a tested cost model.

Roll out in stages: validate a bounded, real pilot with accountable
participants; measure the entire undertaking lifecycle, time to decision,
terms clarity, delivery/acceptance, disputes, correction requests, and
participation patterns; then expand only when reliability and operating
capacity support it. Do not claim readiness for 10,000 users based on this
design or the current browser-local demo.

## Success criteria

- Users can distinguish a report from a verified fact, a proposal from
  authorization, selection from agreement, delivery from acceptance, and a
  hash match from truth.
- Every consequential transition has an attributable actor, authority basis,
  stated terms where required, and recoverable event history.
- People can make scoped capability claims without being forced into a
  universal score or public identity profile.
- A participant can opt into a contribution attestation and disclose it
  selectively; the claim can be challenged and corrected or revoked.
- APT Coin Lab is discoverable as a research destination but isolated from
  balances, payments, access, authorization, and real governance in the
  operational flow.
- All module routes preserve their distinct jobs and connect through explicit,
  understandable references.
- The current visual language is preserved while hierarchy and naming become
  clearer; the shell is not replaced by the mockup.
- English-only initial language, desktop-first coordination, and usable
  low-bandwidth contributor paths are reflected in the design.

## Validation required before implementation is considered complete

- Unit/domain tests for each module’s permitted and blocked transitions.
- Permission tests for institutional delegation, Commons stewardship, and
  review/acceptance roles.
- Tests that missing terms and authority block authorization and that retries
  do not duplicate consequential records.
- Tests for provenance, correction history, dispute handling, evidence access,
  attestation consent, selective disclosure, expiry, and revocation.
- Tests proving Coin Lab scenarios cannot mutate operational balances,
  permissions, or undertaking state.
- Browser checks for module navigation, keyboard/accessibility states,
  responsive layouts, low-bandwidth behavior, clear local-demo labels, and
  error/recovery states.
- Staged load, backup/restore, and incident-recovery exercises before expanding
  toward 10,000 active users.

## Open decisions for later design or operational review

- What APT Coin is meant to represent, if anything, and which accounting,
  incentive, or governance scenarios merit deeper study.
- Who may issue, countersign, dispute, and revoke each contribution
  attestation type.
- The pilot institution, location, participants, funding, compensation model,
  support plan, and legal/data-governance obligations.
- Backend selection, evidence retention, data residency, and exact
  availability and recovery targets.
- Whether later language or offline support is needed and what participant
  evidence should drive those decisions.
