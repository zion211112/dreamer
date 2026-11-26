# APT-LABS — Ontology

Single source of truth for what APT-LABS is, why it exists, how it thinks, and what it is not. Read this before touching domain code, designing a module, or arguing with a schema.

---

## Status and evidence

Evidence label: **PLANNED** — this document describes product and domain direction. It does not assert implementation unless independently confirmed. Demo or synthetic data is never presented as real.

## 1. Thesis

Productive intelligence exists in African communities and institutions. It is fragmented, not absent.

APT-LABS is infrastructure for making productive capacity visible, connectable, governable, locally retained, and cumulative. It structures relationships between people, collectives, institutions, resources, needs, opportunities, work, and knowledge so they can be understood and acted on by participants and institutions.

In shorthand: **structure African intelligence so it can be used by Africans.**

APT-LABS is not a generic social network, job board, marketplace, collection of institutional dashboards, blockchain product, or AI chatbot. Those may be experiences or bounded capabilities where justified; none describes the shared productive network itself.

## 2. Fundamental premise

Living reality precedes its representation. People and collectives pursue intentions, use resources, make commitments, perform activities, encounter consequences, learn, adapt, and generate knowledge before a platform records or represents them.

Therefore:

- **Data is a trace of reality, not reality itself.** A record of a repair is not the repair.
- **Models interpret reality; they are not reality.** A schema that classifies a person as an asset misrepresents what a person is.
- **AI may augment human capability; it does not replace accountable human or institutional judgment.** The system may propose; authorized people decide.
- **Intelligence emerges through situated activity, relationships, experience, evidence, feedback, and coordination.** It is not extracted from data alone.
- **Knowledge retains context, provenance, and the distinction between observation, interpretation, and proposal.**

A system that records activity without understanding its context accumulates data while producing little intelligence. A system that models people without respecting their agency misunderstands the reality it claims to represent.

## 3. Shared network orientation

APT-LABS uses six high-level structures to connect records across domains. They are a shared grammar, not an exhaustive database enum and not a required sequence of screens or lifecycle stages.

| Structure | Holds | Illustrative examples |
|---|---|---|
| **Actors** | Participants with agency and their collectives | Person, crew, enterprise, cooperative, institution, public body |
| **Resources** | Capabilities and things available, required, controlled, or stewarded | Skill, operational capacity, equipment, facility, land, dataset |
| **Intentions** | Situated needs, opportunities, objectives, proposals, constraints | Repair need, research question, procurement opportunity |
| **Commitments** | Agreements, obligations, roles, scoped authority | Accepted offer, work assignment, mandate, delivery obligation |
| **Activity** | Work and events through which people coordinate and change conditions | Production run, inspection, lesson, repair, delivery |
| **Knowledge** | Evidence, outcomes, findings, methods, and institutional memory | Observation, test result, accepted deliverable, correction, lesson |

The detailed type vocabulary remains governed in `libs/ontology`; it includes families such as `ACTOR`, `CAPABILITY`, `RESOURCE`, `PLACE`, `INTENTION`, `COMMITMENT`, `WORK`, `ACTIVITY`, `EVENT`, `OUTPUT_OUTCOME`, `EXCHANGE`, `VALUE`, `EVIDENCE`, `KNOWLEDGE`, and `GOVERNANCE`. The six structures orient people; the more granular families type records and relationships within and across them. A domain protocol may define bounded subtypes and mappings, but must not create a competing family taxonomy or silently redefine shared meanings.

Identity, relationships, permissions, provenance, time, history, privacy, and explicit economic records cut across the six structures. A record may participate in multiple conceptual lenses through typed relationships without duplicating its identity or changing its meaning.

### Canonical distinctions

Never silently equate:

1. **Person ≠ Account** — a person is not an authentication credential.
2. **Person ≠ Asset** — a person is not inventory, a score, or an interchangeable resource.
3. **Person ≠ Crew** — a person may participate in a collective; they are not the collective.
4. **Institution ≠ Venture** — an institution may authorize work; a venture is a bounded undertaking.
5. **Asset ≠ Capability** — a thing and the ability to use it are different.
6. **Membership ≠ Mandate** — belonging does not automatically confer authority to act.
7. **Claim ≠ Evidence ≠ Assessment** — an assertion, its support, and a judgment are distinct.
8. **Community observation ≠ Official finding** — source and standing remain explicit.
9. **Recommendation ≠ Decision** — AI suggestions do not become institutional acts.
10. **Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement** — separate actors and times may apply.
11. **Contribution ≠ Compensation ≠ Credential ≠ Economic instrument** — none implies another.
12. **Investment ≠ Donation ≠ Payment** — distinct intentions and obligations.

### Graph-shaped reality, not a pipeline

The network is graph-shaped: actors, resources, intentions, commitments, activity, and knowledge connect through typed, attributable, governed relationships. A farmer may begin with a resource; a cooperative with a commitment; a public body with a need; a researcher with evidence. Reality can branch, recur, pause, conflict, fail, or be corrected. It does not have to begin at one designated screen or pass through one universal lifecycle.

“One canonical record system” means connected, addressable records under access policy—not one unquestionable truth or a globally readable dataset. Preserve provenance, disputed accounts, correction, privacy, and the distinction between a stored assertion and an established fact.

## 4. Product architecture: kernel, protocols, experiences

APT-LABS is one productive network capable of expressing many forms of economic and institutional activity. Its architecture has three layers:

1. **Shared network kernel** — stable identities, typed records and relationships, permissions, provenance, temporal context, history, privacy, and explicitly governed economic records.
2. **Domain protocols** — versioned contracts that specialize bounded terminology, records, lifecycles, evidence standards, validation, and scoped authority.
3. **Focused experiences** — role-, task-, or domain-shaped interfaces over the same authorized records and actions.

A domain experience may have its own interface and workflow without becoming a separate application truth. It must not fork identity, membership, authority, record history, or canonical storage. The six current surfaces—Home, Commons, Network, Workbench, Records, and Intelligence—are useful present navigation, not a permanent topology or ceiling.

The full product contract is in [`docs/architecture/network-kernel-and-domain-protocols.md`](architecture/network-kernel-and-domain-protocols.md), accepted by decision B13. PostgreSQL + Better Auth + Drizzle are current technical infrastructure under B12, not the product architecture and not permanent vendor guarantees.

## 5. Domain protocols

A domain protocol is a bounded, versioned, governable specification for expressing activity in a context using the shared kernel. Candidate domains may include agriculture and cooperatives, public works, education, research, health, enterprise, or local services. These are examples for investigation—not approved implementation scope, deployed programs, or a claim that one protocol can standardize diverse local practice.

A protocol may define:

- stable identifier and namespace, semantic version, steward, status, effective period, jurisdiction/context, and source basis;
- kernel record families and relationship kinds used, extended, or constrained, including mappings to local terminology;
- typed domain records, field validation, classification, retention, and sensitive-data minimization;
- allowed lifecycle states and transitions, with initiating actor, permission/mandate, preconditions, evidence, decision owner, attributable event, and applicable correction, cancellation, appeal, dispute, or expiry path;
- status mappings that do not collapse unlike meanings—for example, community observation is not a statutory inspection, and completed work is not formal acceptance;
- compatibility and migration rules that keep prior records interpretable and support non-destructive evolution.

### Protocol guardrails

- Protocols may specialize shared concepts, but cannot redefine person, identity, membership, authority, evidence, acceptance, settlement, or other kernel invariants locally.
- Protocols may strengthen validation for their scope but cannot weaken kernel privacy, consent, security, accessibility, attribution, or correction requirements.
- Naming a role or actor type does not grant authority. Server-side policy must resolve current membership and scoped mandate.
- AI and automation may assist within an approved scope; authoritative decisions require separately attributable actions by authorized people.
- Cross-domain work may link multiple protocols. Each domain state remains attributable; aggregate views must not hide disagreement or independently timed delivery, review, and economic flows.
- A protocol is not active merely because a schema exists. Activation requires a named steward, documented rule basis, tested authorization and privacy behavior, and conformance evidence.

A protocol registry, generic lifecycle engine, authoring platform, plugin marketplace, or federation system is not implied. Build only the runtime needed by an approved, real workflow.

## 6. Relationships, provenance, and time

A relationship is a meaningful record, not an arbitrary edge. Its kind, source type, target type, scope, lifecycle, and authority must be defined by the core ontology or an accepted domain protocol. Connectivity alone never grants permission.

- Use stable identifiers and preserve actor attribution, source, relevant version, classification, and lineage.
- Where delayed or retrospective entry matters, distinguish **valid time** (when something applied in reality) from **recorded time** (when the system received it).
- Preserve who asserted, observed, performed, decided, or corrected a fact. Do not replace an original source with an unattributed summary.
- Corrections to consequential records append or supersede with reason and lineage. Ordinary descriptive fields need not all become immutable event logs.
- Domain fields are typed and validated against versioned schemas; arbitrary unvalidated properties cannot bypass protocol rules.
- Sharing policy is enforced on the server-side data access path, not just communicated by a UI label.

## 7. Economic records and value

Economic activity belongs in the network, but work does not automatically create a financial obligation or instrument. Contribution, agreed compensation, invoice, payment, funding, investment, donation, settlement, and recognition require distinct records, terms, responsible parties, evidence, authority, and lifecycle. None is inferred from participation, work updates, acceptance, or a credential.

Any future funding or investment protocol requires separate approval and instrument-specific legal, governance, accounting, custody, provider, and operational review. No current ability to solicit or accept investment, hold or transfer funds, settle payments, promise returns, operate a marketplace, or issue tokens is asserted. APTCOIN and similar mechanisms remain proposals; this ontology enables no balances or issuance.

The strategic economic progression is:

**Existing African productive capacity → structured and connected intelligence → coordinated commitments and activity → substantiated outcomes and institutional memory → reusable knowledge and productive capacity → locally retained and distributed economic value.**

This is a long-horizon proposition, not an automatic lifecycle. Participants may enter at different points; work can stop, fail, be disputed, or create non-monetary value. Value accrues only through explicit records and governed authority, never by implication.

## 8. Civic, public, and community protocols (future design space)

Public works, procurement, service delivery, institutional software, and community priority-setting may require domain protocols. None is asserted as a live data integration, audit service, voting system, matching engine, or replacement for public institutions.

Any public-data protocol must retain publisher/source, identifier, jurisdiction, reporting period, version, retrieval/publication time, and limitations. Official records, verified documents, community observations, unverified reports, disputes, audit findings, and resolutions remain distinct. A discrepancy is a question for explanation, not proof of wrongdoing. Claims about named people, institutions, providers, or contracts require attributable, reviewable evidence and appropriate privacy, legal, and right-of-reply safeguards.

A future community decision protocol must define jurisdiction, eligibility, accessibility, representation, consent, conflicts of interest, quorum and decision semantics, transparency, correction/appeal, and whether an output is advisory or authorized. A vote or popularity count does not itself authorize procurement, work, expenditure, or settlement.

## 9. Participation contexts, not account types

A person establishes one persistent identity, then may participate in personal, collective, enterprise, educational, research, cooperative, public-institutional, and other contexts where appropriate. These are not mutually exclusive account categories, global roles, or automatic permissions. A person may join multiple actors; an institution, crew, and enterprise remain distinct actors with their own standing and members. Membership and authority must be established separately.

Examples such as learners, researchers, founders, practitioners, public stewards, and developers are possible participants, not a complete taxonomy or proof an associated program is operating. Participation should not require a credential unless a specific lawful and justified protocol requires a bounded qualification for a specific action. Safeguarding, consent, and privacy requirements are heightened where children or vulnerable participants are involved.

## 10. Long-horizon durability and Kenyan context

“Enduring through 2050” is a design obligation, not a guarantee that code, schemas, vendors, or interfaces never change. Preserve stable semantics and migration paths while allowing technical edges and domain protocols to evolve.

Design and implementation reviews must consider:

- low-bandwidth and intermittent connectivity, small screens and lower-cost devices, interruption recovery, and safe retries;
- English and Kiswahili as first-class localization needs, with a path for further languages and locally meaningful terminology that does not alter canonical identifiers;
- multiple jurisdictions, community and institutional authority, different evidence rules, and source attribution rather than one imposed process;
- privacy, consent, safeguarding, correction, export/portability, accessibility, security, support, and accountable protocol stewardship;
- replaceable authentication, storage, search, analytics, AI, and delivery providers; portable records and versioned interfaces rather than provider-specific types in domain logic.

These are design and release obligations, not assertions that offline synchronization, localization, federation, national coverage, or all safeguards are implemented. Do not promise nationwide scale or superiority over public or commercial systems without comparative, independently measured outcomes and affected-participant input.

## 11. What this is not

Do not reduce APT-LABS to:

- a generic SaaS product with African visual styling;
- a collection of unrelated applications or one universal workflow;
- a data extraction or surveillance platform;
- a database whose only purpose is storage, or a dashboard-heavy digitization project;
- an imported ontology imposed on diverse African realities;
- a universal reputation score that collapses contextual trust;
- a blockchain/SBT product at its core, or a system requiring blockchain ownership to participate;
- an investment marketplace, securities exchange, custody service, or payment rail;
- a job/gig board with opaque matching that treats people as inventory;
- an AI system empowered to make institutional decisions without accountable authority.

African context must exist in the understanding of relationships, institutions, knowledge, jurisdiction, language, and locally governed value—not merely in branding or decorative patterns.

## 12. Current implementation and evidence boundary

The architecture in this document is `ACCEPTED` product direction; the runtime is not thereby verified. B12 records a PostgreSQL + Better Auth + Drizzle prototype. The identity API is limited; workspace coordination still includes in-memory flows. Database-backed multi-account isolation, broad domain protocols, offline sync, localization, recovery/email delivery, backup restoration, national scale, and production operations are not verified. Do not use this ontology to imply those capabilities exist.

## 13. Evidence labels

| Label | Meaning |
|---|---|
| `VERIFIED` | Independently checked against current, reproducible evidence |
| `PROTOTYPE` | Exists and runs in limited scope; not production-ready |
| `TARGET` | Intended future behavior; not implemented |
| `PLANNED` | Designed or scheduled; work not complete |
| `UNKNOWN` | Not established; must not be guessed |

No claim is `VERIFIED` unless independently confirmed. `TARGET`, `PLANNED`, and `PROTOTYPE` work must not be described as delivered production capability. Synthetic data is never presented as real.

---

*Last updated: 2026-11-25. Supersedes the ontology sections of `docs/domain-model.md` and `APT-LABS-SYSTEM.md` §1–§3; those files now cross-reference here. Aligned with charter A1–A10, decisions B1–B8 and B13, and technical decision B12. Product direction is not implementation evidence.*
