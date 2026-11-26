# APT-LABS Network Kernel and Domain Protocol Contract

**Status:** `ACCEPTED` product architecture; v0.1 contract is the design baseline for review and conformance, not a claim of implementation

**Version:** 0.1.0

**Date:** 2026-11-25

**Evidence:** Product architecture is `ACCEPTED`; this contract is `PLANNED`; runtime conformance is `UNKNOWN` unless independently tested.

## Purpose

APT-LABS is one productive network capable of expressing many forms of economic and institutional activity. It is neither one universal app with one lifecycle nor a collection of domain applications with separate identities and records.

This contract separates three things that must not be conflated:

1. **Product architecture:** shared network kernel, domain protocols, and focused experiences.
2. **Technical infrastructure:** currently PostgreSQL as system of record, Better Auth for authentication/session lifecycle, and Drizzle for application schema and migrations (decision B12). These choices implement the architecture; they are not the architecture itself.
3. **Product outcome:** useful productive cooperation and locally retained, attributable knowledge and value. The architecture does not prove that outcome has occurred.

## 1. Shared network kernel

The kernel defines stable meanings and common guarantees. It is a typed, connected record model, not a required sequence of screens or lifecycle stages.

| Structure | Meaning | Examples (not exhaustive) |
|---|---|---|
| **Actors** | Participants with agency and their legitimate collectives | Person, crew, cooperative, institution, enterprise, public body |
| **Resources** | Capabilities and things available, required, controlled, or stewarded | Skill, operational capacity, equipment, facility, land, dataset |
| **Intentions** | Situated needs, opportunities, objectives, proposals, or constraints | Repair need, research question, procurement opportunity |
| **Commitments** | Agreements, obligations, roles, and scoped authority | Accepted offer, work assignment, mandate, delivery obligation |
| **Activity** | Work and events through which people coordinate and change conditions | Production run, inspection, lesson, repair, delivery |
| **Knowledge** | Evidence, outcomes, findings, methods, and institutional memory | Observation, test result, accepted deliverable, correction, lesson |

Identity, relationships, permissions, provenance, history, privacy, and economic records cut across these structures. Economic records are not a reward layer attached to every action; they exist only when an explicit, governed economic record exists.

The six structures are the **high-level network orientation**, not an exclusive database enum. The ontology's more granular object families—such as `ACTOR`, `CAPABILITY`, `RESOURCE`, `PLACE`, `INTENTION`, `COMMITMENT`, `WORK`, `ACTIVITY`, `EVENT`, `OUTPUT_OUTCOME`, `EXCHANGE`, `VALUE`, `EVIDENCE`, `KNOWLEDGE`, and `GOVERNANCE`—provide detailed typed vocabulary within and across those structures. Keep that detailed vocabulary governed in the ontology; do not invent a parallel family list in each domain protocol. A domain protocol may define bounded subtypes and mappings, but a subtype must identify its kernel family and preserve the family’s invariants. A record may participate in several conceptual lenses through explicit typed relationships without duplicating its identity or silently changing its family.

### Kernel invariants

- A person is never an asset, inventory item, score, or interchangeable account. Person, account, organisation, institution, crew, and membership are distinct.
- Authentication proves control of an account, not capability, identity assurance beyond the configured method, institutional standing, membership, mandate, or authority.
- Membership is scoped, attributable, and revocable. A selected context, client role, relationship, or graph edge by itself grants no permission.
- Claims, observations, evidence, assessments, and official findings remain distinguishable. Conflicting or disputed accounts can coexist with provenance; the canonical store is not a declaration that one source is universally true.
- Approval, authorization, execution, acceptance, compensation, and settlement are separate acts and states.
- Contribution, credentials, compensation, and economic instruments are distinct. No universal person-worth score, automatic payment, or token issuance is implied.
- Records and relationships retain stable identifiers, source/provenance, relevant time, version, actor attribution, access classification, and a correction/supersession path appropriate to their type.
- Privacy and authorization constrain retrieval and projection. “One network” means connected records under policy, not one globally readable dataset.

## 2. Graph-shaped reality, relational implementation

Reality may begin at any point: a capability, an asset, a need, a commitment, work already underway, an observation, or a piece of evidence. Records connect through typed, attributable relationships. They may branch, recur, pause, conflict, be corrected, or end without success. The productive progression is a useful explanation of compounding—not a mandatory pipeline, universal workflow, or assertion that later stages always occur.

“Graph” describes the **product and domain model**: nodes have typed identities; edges are meaningful, typed, governed records. It does not require a graph database. Under B12, PostgreSQL remains canonical: entities use normalized tables and explicit foreign keys; relationships are persisted as first-class rows where their authority, history, consent, provenance, temporal scope, or status matters. Queries may project connected views while enforcing access before data is returned.

A relationship is valid only when its kind, source type, target type, scope, and lifecycle are defined by the core ontology or an accepted domain protocol. “Connected” is not permission to connect anything to anything. Do not create a universal untyped edge or treat a convenient join as proof of authority.

### Network record rules

- Preserve the distinction between **valid time** (when a relationship, observation, or event applied in reality) and **recorded time** (when APT-LABS received it) wherever delayed or retrospective entry matters.
- Attribute who asserted, observed, decided, performed, or corrected a fact. Do not replace the original source with a later summary.
- Corrections append or supersede with a reason and lineage; preserve prior consequential history according to retention policy. Ordinary editable descriptive fields need not become immutable event logs unless the record's consequence requires it.
- Domain-specific fields must be typed and validated against a versioned schema. No arbitrary unvalidated property bag may become a side door around domain contracts or authorization.
- Data classification and sharing policy belong to records/relationships and the server-side access path, not merely to a UI label.

## 3. Domain protocols

A domain protocol is a versioned, governable specification for expressing a bounded kind of activity using the shared kernel. Examples may include agriculture, public works, education, research, health, or cooperative production. The examples are candidates, not endorsements, deployed capabilities, or a claim that one protocol can standardize all local practice.

A protocol may add domain-specific record types, vocabulary, evidence rules, lifecycle states, transitions, terminology, validation, and role-shaped tasks. It must use and link to kernel identities, actors, resources, intentions, commitments, activity, knowledge, and economic records rather than minting a parallel identity, membership, authority system, or disconnected canonical store.

Every protocol definition must declare:

- a stable protocol identifier, namespace, semantic version, human-readable name, steward/maintainer, status (`draft`, `pilot`, `active`, `deprecated`, or `superseded`), effective date, intended jurisdiction/context, and source/basis;
- which kernel record types and relationship kinds it uses, extends, or constrains, with explicit mappings for local terminology;
- typed domain record schemas, required/optional fields, validation, classification, retention expectations, and rules for sensitive data minimization;
- lifecycle states and allowed transitions, including initiating actor, required scoped permission/mandate, preconditions, evidence expected, decision owner, emitted attributable event, and correction, cancellation, dispute, appeal, or expiry path as applicable;
- how domain-specific statuses relate to kernel concepts without collapsing unlike meanings (for example, a community observation is not a statutory inspection; work completion is not formal acceptance);
- compatibility and migration rules for records created under earlier versions, including how old records remain readable and how non-destructive migration is evidenced.

### Protocol guardrails

- A protocol may specialize a kernel concept; it may not redefine the meaning of person, identity, membership, authority, evidence, acceptance, settlement, or another shared invariant locally.
- Protocol validation may be stricter for its scope, but may not weaken kernel privacy, consent, security, accessibility, or attribution guarantees.
- No protocol can grant authority merely by naming a role or actor type. Authority must resolve through current server-side membership and scoped mandate records.
- No AI recommendation or automation step is an authoritative decision unless a separately authorized human action records that decision.
- Cross-domain undertakings may reference multiple protocols. Their domain states remain separately attributable; an aggregate view must not invent one overall status that hides disagreement or independently timed delivery, review, and economic flows.
- A protocol is not “active” because its schema exists. Activation requires a named steward, documented rule basis, tested authorization and privacy behavior, and conformance evidence for its stated scope.

Protocol registry, lifecycle engine, authoring tools, federation, and a general plugin marketplace are **not implied by this contract**. Build only the minimum runtime needed for approved, real workflows.

## 4. Experiences

Experiences are interfaces over the same authorized records and actions. They may be general, role-shaped, context-shaped, or specialist. The six current surfaces—Home, Commons, Network, Workbench, Records, and Intelligence—are a useful present navigation, not a permanent product topology or a requirement that every future user see six equal destinations.

A specialist public-works inspection desk or cooperative production view can have distinct language, sequence, layouts, and tools. It remains an experience over the shared network: no separate canonical identity, duplicate organization membership, alternate authority source, or silent fork of record history. Participants should see only the context and next action appropriate to their permissions and current task; specialist screens must retain links back to the shared record and its provenance.

Experience composition must not conceal consequential distinctions. State changes should communicate their consequence, authority, and evidence standing. Empty states must not be filled with fictional activity. Loading, offline, forbidden, conflict, correction, and service-unavailable states are product behavior, not edge-case decoration.

## 5. Durability and Kenyan operating context

“Enduring through 2050” is a design obligation, not a guarantee that code, schemas, vendors, or interfaces will never change. Preserve stable semantics and migration paths while letting technical edges and domain protocols evolve.

Design and implementation reviews must consider:

- low-bandwidth and intermittent-connectivity use, small-screen and lower-cost devices, clear recovery after interruption, and safe retry/idempotency;
- English and Kiswahili as first-class interface/localization needs, with a path for additional languages and locally meaningful terminology without changing canonical identifiers;
- multiple jurisdictions, community and institutional authority, differing evidence rules, and clear source attribution rather than one imposed process;
- privacy, consent, safeguarding, correction, export/portability, accessible interaction, security review, support, and accountable protocol stewardship;
- replaceable authentication, storage, search, analytics, AI, and delivery providers; portable records and versioned interfaces rather than provider-specific types in domain logic.

These are requirements for staged design and evidence, not assertions that offline synchronization, localization, federation, nationwide scale, or all safeguards are implemented today. Do not promise universal coverage or superiority over government or commercial systems without comparative, independently measured outcomes.

## 6. Economic progression and evidence boundary

The strategic progression is: **existing African productive capacity → structured and connected intelligence → coordinated commitments and activity → substantiated outcomes and institutional memory → reusable knowledge and productive capacity → locally retained and distributed economic value.**

This is a long-horizon proposition, not an automatic lifecycle. Participants may enter at different points; a cycle can stop, fail, be disputed, or create non-monetary value. Value is recorded only under explicit authority and policy. No funds, token, investment, payment, credential, or civic integration follows automatically from recording work.

## 7. Conformance and change

A product or domain implementation conforms only when it:

1. uses the shared identity and relationship foundation rather than a parallel truth;
2. declares protocol and schema versions for domain-specific meaning;
3. validates typed relationships and state transitions server-side;
4. enforces authorization and data classification before reads and writes;
5. preserves provenance, relevant temporal context, correction, and distinct claim/evidence/decision states;
6. provides an experience appropriate to the role and task without changing the underlying authority model;
7. documents migration, compatibility, localization, accessibility, and operational evidence appropriate to its release stage.

A change to shared semantics requires an ontology/decision review and a compatibility plan. A domain protocol may evolve independently when its changes remain inside the kernel contract. Technical infrastructure may be replaced through an approved ADR while preserving product-level invariants and record portability.

## Current implementation boundary

The provider-independent network-structure and domain-protocol declaration/validator now exist in `libs/ontology/src/network.ts` and `libs/ontology/src/protocols.ts`; their current conformance tests cover kernel mappings and activation evidence. This is a metadata contract, not a protocol registry, authorization engine, persistence layer, or domain workflow. No domain protocol is thereby active or operational.

B13 and this contract define product direction, not shipped breadth. As of this document, B12 records the PostgreSQL/Better Auth/Drizzle prototype; the identity API is limited, workspace records still include in-memory flows, and database-backed multi-account isolation, operational domain protocols, national scale, offline sync, localization, recovery/email delivery, backups, and production operations are not verified. The architecture must not be used to imply these capabilities exist.

## Related authority

- `docs/design/charter.md` — principles and decision B13.
- `docs/ontology.md` — canonical domain thesis and distinctions.
- `docs/decisions/B12-permanent-identity-infrastructure.md` — current technical identity/storage decision.
