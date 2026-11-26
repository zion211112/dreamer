# B13 — Shared Network Kernel, Domain Protocols, and Focused Experiences

| Field | Value |
|---|---|
| Decision ID | B13 |
| Date | 2026-11-25 |
| Status | Accepted |
| Scope | Durable product architecture for representing and coordinating multiple forms of productive, economic, and institutional activity |
| Decision | APT-LABS is one shared productive network: a typed, connected kernel of actors, resources, intentions, commitments, activity, and knowledge, with shared identities, relationships, permission, provenance, history, privacy, and governed economic records. Versioned domain protocols specialize lifecycle, terminology, validation, evidence, and authorization requirements. Focused experiences present the appropriate tools and views over the same authorized records. There are no isolated domain truths. |
| Supersedes | None. Refines charter B1: the six current workspace surfaces remain the present navigation, not a permanent limit on future experiences. |
| Related | B11 identity and access principles; B12 PostgreSQL + Better Auth + Drizzle technical infrastructure. |

## Context

APT-LABS intends to serve many participants, institutions, and domains across Kenya and beyond. A single universal workflow would erase meaningful differences between such contexts. Independent mini-apps would duplicate identities, memberships, records, and authority, fragmenting cooperation and provenance.

The user's approved direction is one productive network capable of expressing many forms of economic and institutional activity. PostgreSQL + Better Auth + Drizzle are technical infrastructure choices, not the product architecture. The current six surfaces are useful experiences, but cannot be the permanent limit of how the network is used.

## Decision

1. **One shared network kernel.** Preserve the six structures—Actors, Resources, Intentions, Commitments, Activity, and Knowledge—plus shared identity, relationships, permissions, provenance, temporal context, history, privacy, and explicit economic records. Keep the distinctions and agency requirements in the ontology and charter.
2. **Graph-shaped product model; relational storage today.** Reality may begin at any point and connect through typed, attributable, governed relationships. It can branch, recur, conflict, pause, fail, or be corrected; no universal linear lifecycle is imposed. “Graph” is a domain/product property, not a requirement for graph-database technology. B12 remains the current technical choice of PostgreSQL with explicit relational entities, relationships, and constraints.
3. **Versioned domain protocols.** Domains may define bounded schemas, vocabulary, lifecycles, transitions, validation, evidence rules, and role/authority requirements. They reuse the kernel's identities, actors, relationships, permissions, and records. They cannot fork identity, weaken kernel guarantees, or relabel a domain decision as universal truth. Protocol evolution is versioned, stewarded, and migration-aware.
4. **One record reality; many experiences.** General and specialist experiences may be role-, task-, or context-shaped. They show authorized projections and actions over shared records; they do not create independent identities, canonical stores, or authority sources. The six present workspace surfaces are not a product ceiling.
5. **No false singular truth.** A canonical authoritative store preserves attributable records; it does not erase disagreement or make every observation an established fact. Claims, evidence, assessments, official findings, corrections, and disputes remain distinguishable and source-linked.
6. **Durability through change.** Favor stable semantics, identifiers, versioned contracts, exportability, replaceable technical edges, and non-destructive migration paths. Design for Kenyan operating contexts including low bandwidth, intermittent connectivity, mobile access, localization, privacy, consent, accessibility, plural institutions, and accountable stewardship. These are design/release obligations, not claims that such capabilities are implemented.
7. **Evidence before scale claims.** “Ready through 2050,” nationwide coverage, and superiority over public or commercial systems are aspirations to test, not guarantees. Claims of scale, security, and comparative quality require independently reproducible operational evidence.

## Consequences

- The canonical contract lives in `docs/architecture/network-kernel-and-domain-protocols.md` and governs future domain/workspace design without prescribing one interface or physical database topology forever.
- Changes to shared semantic meaning require ontology/decision review and a compatibility plan. Domain-specific changes can evolve under their versioned protocol if they stay within kernel invariants.
- A protocol registry, plugin marketplace, generic workflow builder, graph database, and independent mini-app backends are not authorized or implied. Build the smallest protocol/runtime capability that supports an approved, real workflow.
- Existing domain types, relationship vocabularies, and workflow helpers are inputs to review, not proof of contract conformance or runtime authorization.
- Current implementation remains a prototype as described in B12. No nationwide multi-domain workflow, database-backed two-account isolation, email recovery, offline synchronization, localization, or production operation is asserted as delivered.

## Acceptance

This product architecture is accepted. The contract's schemas, APIs, technical extensions, domain protocols, implementations, and production releases each require their own scoped design and evidence. This decision does not authorize production changes, data deletion, a new dependency, or a claim of readiness.
