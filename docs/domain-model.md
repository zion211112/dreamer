# APT-LABS — Domain Model (Six Structures)

The full ontology — thesis, aetiology, six structures, transformation chain, factory
readiness, design principles, and what-this-is-NOT — lives in `docs/ontology.md`.

This file is a quick-reference index to the six structures and canonical distinctions.

## The six structures

| Structure | What it holds |
|-----------|--------------|
| **Actors** | People, crews, enterprises, institutions |
| **Resources** | Skills, assets, capital, knowledge |
| **Intentions** | Needs, opportunities, proposals |
| **Commitments** | Agreements, roles, obligations, authority |
| **Activity** | Events, work, exchange, delivery |
| **Knowledge** | Evidence, credentials, outcomes, lessons |

## Canonical entity distinctions

See `docs/ontology.md` §"Shared network orientation" for the full list.
Quick reference: Person ≠ Asset, Person ≠ Crew, Institution ≠ Venture,
Asset ≠ Capability, Claim ≠ Evidence,
Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement,
AI suggestion ≠ institutional decision.

## Modules and lenses

| Module | Job | Route |
|--------|-----|-------|
| Commons | Discover and express needs, offers, resources, opportunities, knowledge, problems | `/workspace/commons` |
| Network | Understand and connect people, crews, institutions, assets, capabilities, relationships | `/workspace/network/{people,institutions,capabilities}` |
| Workbench | Scope, assemble, coordinate, manage productive work | `/workspace/workbench` |
| Records | Inspect durable history, provenance, evidence, credentials, attestations | `/workspace/records/{canon,annals,roll}` |
| Intelligence | Agents, graph analysis, matching, forecasting, analytics | `/workspace/intelligence` |

**School Console** — nested operational boundary under Workbench, not a primary module.

**Canon / Annals / Roll** — three lenses within Records:
- **Canon** — what is structurally recorded: entities, identities, typed relationships, accepted state
- **Annals** — what happened over time: chronological events, changes, decisions, transitions
- **Roll** — why a claim can be substantiated: evidence, provenance, attestations, verification

## Governing question

Does this make the productive network more capable of creating, coordinating, retaining,
and multiplying real economic value? If not, why does it belong in APT-LABS?
