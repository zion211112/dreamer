# APT-LABS — Ontology Architecture Specification (OAS)

**Version:** 1.0 (frozen canonical)
**Status:** PLANNED — formal specification; every agent builds against this, not against its own interpretation
**Last updated:** 2026-11-22

This document is the single source of truth for APT-LABS's canonical ontology: entity types, relationships, lifecycles, permissions, evidence semantics, event model, and domain-extension rules. It supersedes prior ontology sections of `docs/ontology.md` and `docs/architecture/APT-LABS-2050-MASTER-ARCHITECTURE.md`; those files now cross-reference here.

---

## 1. Doctrine

**APT-LABS is the operating infrastructure through which productive reality becomes legible, connected, coordinated, verifiable, and capable of accumulating value.**

It is not an ERP, marketplace, social network, project-management platform, government information system, workforce platform, or AI agent environment. It is a deeper layer on which many of those applications become specialised, replaceable interfaces.

**The governing principle:** No productive capacity should remain unnecessarily invisible, disconnected, inaccessible, or incapable of contributing to coordinated value.

**The institutional principle:** Participants retain agency, rights, and legitimate control over their resources and information while participating in a shared productive network.

**The technical principle:** One interoperable ontology, a federated operational graph, accountable execution, verifiable evidence, and reusable intelligence.

**The economic principle:** Value should emerge from actual productive contribution, not merely from participation, speculation, or ownership of information.

---

## 2. Fundamental ontological inversion

APT-LABS does not model the world primarily as a collection of people, companies, assets, and documents.

It models the world as **agents producing transformations through coordinated commitments under real-world constraints.** Everything else exists in relation to that productive process.

**The productive reality cycle** (stages branch, overlap, repeat — not a mandatory linear workflow):

| Stage | Meaning |
|-------|---------|
| 1. Intent | A need, opportunity, problem, or desired state |
| 2. Capability Assembly | Actors, capabilities, resources, and relationships assembled |
| 3. Commitment | Agreement, authority, obligations, and allocation accepted |
| 4. Execution | Work, processes, activities, and events |
| 5. Evidence | Records, observations, measurements, verification |
| 6. Outcome | A demonstrated change in real-world conditions |
| 7. Value | Economic, social, ecological, institutional value created/distributed |
| 8. Knowledge | Reusable intelligence derived from actual experience → improves the next cycle |

The plumber is not the end of the transaction. The verified transformation is.

---

## 3. Canonical ontology (11 primitives)

Two governing dimensions apply to every primitive: **Context** (place, time, domain, jurisdiction, environmental conditions) and **Governance** (identity, authority, ownership, custody, consent, access, responsibility, contractual rights, security, dispute resolution).

| # | Primitive | Represents | Critical distinctions (never silently equated) |
|---|-----------|-----------|------------------------------------------------|
| 1 | **Actor** | Anything with agency or delegated agency | Person, crew, cooperative, business, institution, government unit, AI agent. Person ≠ Asset; Person ≠ Crew; Institution ≠ Venture. |
| 2 | **Capability** | What an actor can reliably do | Skills, services, production capacity, qualifications, technical abilities. Capability ≠ Resource. A skill is not a badge; it is a capability only through an actor, context, evidence, and demonstrated applicability. |
| 3 | **Resource** | What can be accessed, allocated, or consumed | Assets, equipment, materials, land, infrastructure, funds, data. Resource ≠ Capability. Ownership ≠ Custody ≠ Operational Control. A machine is not a resource until it has an availability relationship, location, legitimate controller, and a requirement. |
| 4 | **Intent** | A desired transformation or unresolved condition | Need, problem, opportunity, objective, request, mandate. Claim ≠ Evidence — an intent is bounded by subject, predicate, scope. |
| 5 | **Commitment** | An accepted obligation, authorization, or allocation | Agreement, contract, offer acceptance, assignment, funding commitment. A promise ≠ a fulfilled commitment. Commitment connects intent to accountable action. |
| 6 | **Work** | An undertaking to achieve a defined transformation | Project, intervention, service delivery, task, operation, production. |
| 7 | **Event** | An actual occurrence or state transition | Delivery, inspection, approval, payment, movement, completion. |
| 8 | **Claim and Evidence** | Assertions and information supporting/disputing them | Documents, observations, photographs, measurements, attestations, provenance. A document is not evidence until it supports or contradicts a specific claim. |
| 9 | **Outcome** | A demonstrated change resulting from work | Completed infrastructure, delivered service, increased production, resolved problem. A task is not an outcome; a payment is not proof the intended result occurred. |
| 10 | **Value** | What is created, recognised, allocated, or transferred | Monetary, material, social, ecological, institutional value. Value flow allocates value to actors. |
| 11 | **Knowledge** | Reusable intelligence acquired through experience | Methods, procedures, lessons, templates, models, validated patterns. Knowledge is derived from Evidence / Outcomes. |

**Canonical distinctions (never silently equated):**

1. Person ≠ Asset
2. Person ≠ Crew
3. Institution ≠ Venture
4. Asset ≠ Capability
5. Claim ≠ Evidence
6. Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement (each distinct, separately timed)
7. AI suggestion ≠ institutional decision
8. Investment ≠ Donation ≠ Payment
9. A task is not an outcome
10. A promise is not a fulfilled commitment
11. A payment is not proof of result

---

## 4. Relationship grammar (first-class edges)

Objects must not become isolated database tables. Their relationships are the real intelligence. Every relationship is a **first-class, versioned, append-only edge** — never a bare foreign key.

Illustrative canonical relations:

| Source | Relation | Target |
|--------|----------|--------|
| Actor | expresses | Intent |
| Actor | offers | Capability |
| Capability | is supported by | Resource |
| Intent | is addressed by | Work |
| Commitment | authorizes and binds | Actors / Work |
| Work | uses | Capabilities / Resources |
| Work | decomposes into | Activities |
| Event | records | Actual occurrence |
| Evidence | supports or disputes | Claim |
| Verification | assesses | Claim |
| Outcome | fulfills | Intent |
| Value flow | allocates value to | Actors |
| Knowledge | is derived from | Evidence / Outcomes |

Every edge carries: kind, source id, target id, source role, target role, actor context, status (active/terminated), version, supersedes id (corrections), evidence ids, audit event ids, recorded at, created by.

---

## 5. Evidence as first-class infrastructure

APT-LABS accumulates **traceable evidence of productive reality**, not just data.

**Evidence lifecycle:**
1. `unverified` — registered, attached to a record it supports
2. `verified` — assessed by a trusted principal (`evidence:admin`), with method, time, scope recorded
3. `rejected` — assessed and found insufficient

**Epistemic labels (preserved from existing practice):**
- `VERIFIED` — independently checked against current evidence
- `PROTOTYPE` — exists and runs in limited/demo scope
- `TARGET` — intended future behavior; not implemented
- `PLANNED` — scheduled or designed; work not started
- `UNKNOWN` — not established; must not be guessed

These labels describe epistemic standing, not merely work status. TARGET and PLANNED work is never described as delivered.

Verification records: verifier, method, time, scope, disputes. Evidence does not automatically establish truth.

---

## 6. Transformation chain / production grammar (8 stages)

Not every stage runs in every cycle; the grammar names what each stage does when it runs.

| Stage | What happens | Ontology anchor |
|-------|-------------|-----------------|
| 01 Intake | Receive and structure demand | Intent |
| 02 Diagnose | Understand the actual problem | Claim + Evidence |
| 03 Compose | Design the solution and resources | Capability Assembly |
| 04 Authorise | Establish authority and commitments | Commitment |
| 05 Produce | Coordinate and execute work | Work + Event |
| 06 Inspect | Test against defined requirements | Evidence + Verification |
| 07 Settle | Resolve obligations and exchange | Value + Commitment |
| 08 Learn | Preserve evidence and improve | Knowledge |

**Compounding mechanism:** One completed activity updates all eleven primitives and both governing dimensions simultaneously. That single-point, multi-dimensional update is the moat.

---

## 7. Architecture (7 layers)

One shared operating foundation; multiple interoperable experiences. Layers are not seven mandatory applications.

| Layer | Responsibility |
|-------|---------------|
| L01 Trust & Infrastructure | Identity, access, governance, APIs, event history, data custody |
| L02 Ontology | Actors, capabilities, resources, intentions, commitments, work, knowledge |
| L03 Economic | Value flows, obligations, allocations, payments, settlement integrations |
| L04 Assurance | Evidence, verification, provenance, outcomes, audit |
| L05 Coordination | Workflows, commitments, permissions, orchestration, automation |
| L06 Intelligence | AI agents, models, forecasting, optimisation, decision support |
| L07 Experience | Workspaces, portals, interfaces, industry applications |

**Three architectural rules:**

1. **Federated ownership.** APT-LABS identifies, relates, interprets, and coordinates across authorised records, including records held by independent institutions. It does not need to own every underlying record.
2. **Interoperability by design.** Existing ERP, CRM, accounting, payment rail, or government registry should be connectable. APT-LABS becomes the coordination layer above and between systems — not a recreation of each.
3. **Append-only operational history.** Important events and commitments have traceable histories. Corrections are recorded as corrections, never silent rewrites. Essential for trust, audits, and AI reasoning.

---

## 8. What APT-LABS must deliberately refuse to become

| Temptation | Decision |
|------------|----------|
| Register everyone as a profile | Represent agency, relationships, authority |
| Treat people as productive assets | Represent people as actors with rights and capabilities |
| Become another marketplace | Coordinate the full commitment-to-outcome cycle |
| Become another ERP | Integrate existing operational systems |
| Put AI at the centre | Put reality, evidence, authority at centre; AI as execution/reasoning capability |
| Make blockchain the foundation | Use portable verification/credentials where justified; no blockchain prerequisite |
| Make APTCOIN the economic centre | First establish real value creation and distribution |
| Score every person globally | Build contextual, evidence-backed trust (no universal reputation score — charter A8) |
| Build one enormous universal workflow | Maintain a common ontology with domain-specific workflows |
| Collect all institutional data centrally | Support federated custody and permissioned exchange |

SBTs and APTCOIN remain downstream possibilities, not foundational assumptions.

---

## 9. Extension rules (how domains extend without breaking the core)

The ontology is **universal in its grammar, not imperial in its implementation.** A school, farmer cooperative, software company, and county government do not use identical workflows — they communicate through compatible fundamental structures.

**Extension mechanism:**
- New **entity sub-types** may be added under any of the 11 primitives (e.g. Actor sub-type "School", Resource sub-type "Micro-hydro rig").
- New **relationship kinds** may be added, provided they follow the first-class edge schema.
- New **domain modules** may register under L07 Experience, reading/writing through L01–L05.
- No extension may collapse a canonical distinction (e.g. equating Person with Asset).

**Evidence labeling applies to all extensions.** Any claim about an extension carries a VERIFIED/PROTOTYPE/TARGET/PLANNED/UNKNOWN label.

---

## 10. What this means concretely (worked example)

County department has a school maintenance problem:

1. The school registers an **Intent** (need: roof repair).
2. Institutional authority and responsible **Actors** are identified.
3. The network discovers appropriate **Capabilities** and available **Resources**.
4. Suppliers submit offers; authorised parties establish a **Commitment**.
5. **Work** is allocated and coordinated; **Events** are recorded.
6. **Evidence** supports completion claims; **Verification** assesses them.
7. The authorised party verifies the **Outcome** (roof restored to spec).
8. **Value** is accounted for and distributed through connected financial systems.
9. The experience becomes reusable **Knowledge** informing the next cycle.

Same grammar applies to agricultural production, construction, software delivery, education, healthcare, manufacturing, procurement, research, logistics, and community initiatives.

---

## 11. Migration status & next actions

| Item | Status | Notes |
|------|--------|-------|
| Canonical ontology (11 primitives) | PLANNED | This document |
| Relationship grammar (first-class edges) | VERIFIED | `src/lib/relationship-store.ts` implemented |
| Record envelope (versioned, append-only) | VERIFIED | `src/lib/record-envelope.ts` implemented |
| Evidence store (unverified→verified) | VERIFIED | `src/lib/evidence-store.ts` implemented |
| Commitment journey (need→commitment→outcome) | VERIFIED | `src/lib/commitment-journey.ts` implemented |
| Declarative matching (need↔capability) | VERIFIED | `src/lib/matching.ts` implemented |
| Authorization (platform + actor roles) | VERIFIED | `src/lib/authz.ts` implemented |
| Multi-actor model | VERIFIED | `src/lib/actors.ts` implemented |
| Persistence: browser localStorage | VERIFIED (demo) | `src/lib/storage.ts` |
| Persistence: Supabase production | TARGET | Not yet implemented |
| 5-destination workspace shell | VERIFIED | Routes wired; Value module built |
| Pipeline (Bifrost/FCC multi-model) | VERIFIED | `engine/multi_model_pipeline.py` |
| N8n workflows | VERIFIED | commons-intake, evidence-verification, workbench-commitment |

**Immediate next actions:**
1. Replace `storage.ts` localStorage persistence with a Supabase-backed adapter (real backend).
2. Make each pilot lane real and usable (backend persistence + live data).
3. Freeze this OAS; all subsequent agents implement against it.

---

*End of Ontology Architecture Specification v1.0*
