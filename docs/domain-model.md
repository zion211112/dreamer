# APT-LABS — Domain Model (Six Structures)

Approved domain model extracted from the APT-LABS ontology and constitution. Single authoritative definition of the six underlying structures.

## The six structures

Every product, sector, and workflow in APT-LABS expresses the same six underlying structures; none is forced into a single rigid role.

| Structure | What it holds | Examples |
|-----------|--------------|----------|
| **Actors** | People, crews, enterprises, institutions | A mason, a fabrication crew, a school, a hospital |
| **Resources** | Skills, assets, capital, knowledge | Welding skill, a micro-hydro rig, savings, a blueprint |
| **Intentions** | Needs, opportunities, proposals | "We need a workshop bench", "An animation asset for investment" |
| **Commitments** | Agreements, roles, obligations, authority | A tender, a crew role, a payment term, an authorisation |
| **Activity** | Events, work, exchange, delivery | Pouring concrete, rendering a frame, signing off a build |
| **Knowledge** | Evidence, credentials, outcomes, lessons | A Roll entry, an SBT attestation, a dispute record |

## Canonical entity distinctions (never silently equated)

- **Person ≠ Asset:** a person is an individual with agency, not inventory.
- **Person ≠ Crew:** a crew performs work; a person is a member.
- **Institution ≠ Venture:** an institution commissions or authorises work; a venture is a bounded undertaking.
- **Asset ≠ Capability:** an asset is a thing; a capability is the ability to use it.
- **Claim ≠ Evidence:** an assertion is bounded by subject, predicate, and scope; evidence substantiates it.
- **Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement:** each is a distinct, separately timed flow.
- **AI suggestion ≠ institutional decision:** the system proposes; people decide.

## Economic progression

Every completed cycle follows the same underlying movement:

**Reality → structured records → relationships → coordinated work → verified outcomes → reusable intelligence → economic value**

Steps can repeat, branch, be skipped, or terminate without success. Not a mandatory linear workflow.

## Recursion

Each completed cycle improves conditions for the next:

1. **Discover** capacity and demand
2. **Compose** cooperation
3. **Execute** production
4. **Capture evidence**
5. **Create recognition** (attestations, institutional memory)
6. **Improve future coordination**

## Factory readiness (production grammar)

| Stage | What happens |
|-------|-------------|
| 01 Intake | Receive and structure demand |
| 02 Diagnose | Understand the actual problem |
| 03 Compose | Design the solution and resources |
| 04 Authorise | Establish authority and commitments |
| 05 Produce | Coordinate and execute work |
| 06 Inspect | Test against defined requirements |
| 07 Settle | Resolve obligations and exchange |
| 08 Learn | Preserve evidence and improve |

## Modules and lenses

| Module | Job | Route |
|--------|-----|-------|
| Commons | Discover and express needs, offers, resources, opportunities, knowledge, problems | `/workspace/commons` |
| Network | Understand and connect people, crews, institutions, assets, capabilities, relationships | `/workspace/network/people`, `/workspace/network/institutions`, `/workspace/network/capabilities` |
| Workbench | Scope, assemble, coordinate, manage productive work | `/workspace/workbench` |
| Records | Inspect durable history, provenance, evidence, credentials, attestations | `/workspace/records/{canon,annals,roll}` |
| Intelligence | Agents, graph analysis, matching, forecasting, analytics | `/workspace/intelligence` |

**School Console** — nested operational boundary under Workbench, not a primary module.

**Canon / Annals / Roll** — three lenses within Records:
- **Canon** — what is structurally recorded: entities, identities, typed relationships, accepted state
- **Annals** — what happened over time: chronological events, changes, decisions, transitions
- **Roll** — why a claim can be substantiated: evidence, provenance, attestations, verification

## Governing question

Does this make the productive network more capable of creating, coordinating, retaining, and multiplying real economic value? If not, why does it belong in APT-LABS?
