# APT-LABS — Final Build Design

**Status:** Proposed — awaiting your approval before any code is written.  
**Date:** 2026-11-19  
**Author:** Claude Code (with you as product authority)  
**Related:** `docs/ontology.md`, `docs/design/charter.md`, `AGENTS.md`, `docs/architecture.md`

---

## 1. Intent & why

You asked to (1) pick where to start the final build with **Vue.js + n8n**, (2) synthesize the final APT-LABS **ontology**, **aetiology**, and **ontometry** from the pasted APT-LABS ontology document, and (3) update the codebase to match.

This document is the single written description of that work. Per the build discipline, nothing gets built until you approve this description. Once approved, the next step is an implementation plan (`superpowers:writing-plans`) then execution.

**Governing question** (charter A1 / ontology.md): *Does this make the productive network more capable of creating, coordinating, retaining, and multiplying real economic value? If not, why does it belong in APT-LABS?*

---

## 2. Stack decision (needs your confirmation)

| Layer | Existing (AGENTS.md) | Your directive | Source doc (pasted ontology) | Proposed |
|-------|----------------------|----------------|------------------------------|----------|
| UI framework | Preact 10.24 | **Vue.js** (you said "not angular but vue js") | Vue 3 + TypeScript | **Vue 3 + TypeScript** |
| Build tool | Vite 6.4.5 | (keep) | — | Vite 6.4.5 |
| Styling | Tailwind CSS v4 (tokens.css) | fused design system | Tailwind 4 + APT design system | Tailwind 4 + fused design tokens |
| Routing | Wouter | — | — | Wouter (keep) or Vue Router |
| Testing | Vitest 5.0.5 | — | — | Vitest (keep) |
| Auth/DB | Supabase demo mode | — | — | Supabase demo mode (keep) |
| Workflow automation | — | **n8n** | kinetic/action layer | **n8n (self-hosted)** |

**Open call for you:** The codebase today is Preact. You want Vue.js. Do you want me to:
- **(a) Migrate** the frontend from Preact to Vue 3 now (components, shell, routes), or
- **(b) Keep Preact** for the existing UI and add the ontology/n8n layer as framework-agnostic TypeScript, building new screens in Vue alongside?

Either way, the **ontology core** (types, relationships, kinetic actions, event ledger) will be framework-agnostic TypeScript in `src/lib/ontology/` so it survives any UI-framework choice.

**n8n hosting:** I assume self-hosted n8n (Docker) so APT-LABS actions (commit, assign, verify, settle) can call back into the APT-LABS API. Confirm or correct.

---

## 3. Where to start the final build

**Beachhead (charter §VII.1):** institutional readiness and delivery — one vertical workflow for schools/technical institutions/county facilities:

> Institution → Need → Capacity → Commitment → Work → Evidence → Outcome → Institutional Memory

**Start here, in order:**

1. **Ontology registry** (`src/lib/ontology/`) — canonical TypeScript definitions of the 13 semantic families (Actor, Capability, Resource, Place, Intention, Commitment, Work, Activity, Output & Outcome, Exchange, Evidence, Knowledge, Governance) + typed relationship vocabulary + cardinalities. This is the single canonical language; migrations, API schemas, permissions, and UI property definitions derive from it.
2. **APT Universal Object** — one object interface (identity, state, relationships, activity, evidence, permissions, available actions) reusable across person, institution, asset, commitment, work item, evidence record, knowledge asset.
3. **n8n workflow nodes** for kinetic actions — commit, assign, verify, settle, produce. Each node validates authorization and writes an event-ledger record.
4. **First complete vertical** — the beachhead workflow above, wired end-to-end in Vue, with the fused design system tokens and the Structural Emergence design language (charter B4).

**Do not build first:** a continental social network, an all-purpose marketplace, an AI-first platform, or a token-first system (charter §XII).

---

## 4. Synthesized ontology (APTO — APT Core Ontology)

Consolidates the pasted 13-family ontology with the existing 6-structure ontology (`docs/ontology.md`). The pasted document is authoritative for the 13 families; the existing file remains the quick reference.

### 4.1 The thirteen canonical object families

| # | Family | Canonical types (examples) | Role |
|---|--------|---------------------------|------|
| 01 | **ACTOR** | Person, Organization, Collective, Institution, Enterprise, Cooperative, Government Unit, Software Agent | Who can act |
| 02 | **CAPABILITY** | Skill, Competence, Qualification, Experience, Technical Capability, Operational Capacity, Availability | What can be done |
| 03 | **RESOURCE** | Asset, Facility, Equipment, Material, Inventory, Land, Energy, Capital, Dataset, IP | What can be mobilized |
| 04 | **PLACE** | Country, Region, County, Locality, Site, Facility, Geographic Area, Jurisdiction | Where reality occurs |
| 05 | **INTENTION** | Need, Demand, Opportunity, Objective, Proposal, Hypothesis, Constraint | What needs to change |
| 06 | **COMMITMENT** | Obligation, Assignment, Agreement, Contractual Promise, Reservation, Funding Commitment | Who has undertaken to do what |
| 07 | **WORK** | Programme, Initiative, Project, Work Package, Work Order, Task, Service Case, Experiment, Production Run | What must be executed |
| 08 | **ACTIVITY** | Inspection, Meeting, Training, Experiment Step, Service Event, Production Event, Transfer, Delivery | What actually happened |
| 09 | **OUTPUT & OUTCOME** | Deliverable, Product, Service, Result, Outcome, Impact, Indicator | What was produced and what changed |
| 10 | **EXCHANGE** | Offer, Request, Quote, Procurement, Purchase Order, Invoice, Payment, Shipment, Settlement | How value circulates |
| 11 | **EVIDENCE** | Claim, Document, Observation, Measurement, Test Result, Attestation, Verification, Audit Record | What supports the claims |
| 12 | **KNOWLEDGE** | Method, Protocol, Standard, Dataset, Model, Finding, Design, Curriculum, Lesson, Research | What can be understood and reused |
| 13 | **GOVERNANCE** | Mandate, Identity, Membership, Role, Permission, Consent, Policy, Jurisdiction, Data Classification | Under whose authority and rules |

**Operational core:** Actor, Capability, Resource, Intention, Commitment, Work.  
**Continuity & learning layer:** Activity, Output & Outcome, Evidence, Knowledge.  
**Value & legitimacy:** Exchange, Governance.  
**Context:** Place, Time (every event carries `occurredAt` and `recordedAt`).

### 4.2 Canonical distinctions (enforced in schema + UI)

Person ≠ Account; Organization ≠ Institution; Skill ≠ Qualification; Capability ≠ Capacity; Asset ≠ Resource; Need ≠ Demand; Intention ≠ Commitment; Commitment ≠ Work; Work ≠ Activity; Output ≠ Outcome; Claim ≠ Evidence; Evidence ≠ Verification; Knowledge ≠ Document; Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement.

### 4.3 Relationship vocabulary (first-class, versioned records)

`AFFILIATED_WITH`, `ACTS_ON_BEHALF_OF`, `HOLDS_CAPABILITY`, `SUPPORTED_BY_EVIDENCE`, `OFFERS_CAPACITY`, `CONTROLS_RESOURCE`, `CUSTODIES`, `OPERATES`, `LOCATED_AT`, `RESPONDS_TO`, `AUTHORIZED_BY`, `COMMITTED_TO`, `ASSIGNED_TO`, `REQUIRES`, `USES`, `PRODUCES`, `FULFILLS`, `SUPPORTED_BY`, `VERIFIED_BY`, `DERIVED_FROM`, `DEPENDS_ON`, `GOVERNED_BY`, `SETTLES`.

Each relationship carries its own metadata (role, start/end dates, authority, consent, verification, status) — never a bare foreign key.

### 4.4 Kinetic / runtime layer

| Mechanism | Responsibility |
|-----------|----------------|
| Object registry | Canonical entity types & properties |
| Relationship engine | Typed relationships, cardinality, traversal |
| Action engine | Validates & executes authorized changes |
| Workflow engine | Coordinates multi-step processes |
| Event ledger | Append-only history of meaningful activity & transitions |
| Evidence engine | Links claims, artifacts, verification, provenance |

**Event envelope:** `eventId, eventType, schemaVersion, subjectId, actorId, organizationId?, occurredAt, recordedAt, placeId?, correlationId?, causationId?, source{system,method}, evidenceIds[], payload`. Corrections create corrective/superseding events — never silent rewrites.

**Two evidence-standing dimensions:** Maturity (planned, prototype, operational, retired) × Evidence standing (unassessed, reported, supported, verified, disputed, rejected, expired).

### 4.5 Five pillars (the menu, not the ontology)

| Pillar | Verb | Contents |
|--------|------|----------|
| 01 KNOWLEDGE | Discover | Research, learning, methods, science, engineering, skills, IP |
| 02 CAPACITY | Organize | People, institutions, capabilities, assets, facilities, availability |
| 03 PRODUCTION | Produce | Needs, initiatives, commitments, workflows, experiments, manufacturing, services, outcomes |
| 04 EXCHANGE | Circulate | Demand, markets, procurement, supply chains, logistics, contracts, capital, settlement |
| 05 STEWARDSHIP | Compound | Governance, evidence, verification, maintenance, standards, institutional memory, impact |

Universal surfaces: Commons (discovery), Network (relationship graph), Work engine (execution), Records (memory), Intelligence (cross-cutting analysis). These are NOT modules — they cut across all five pillars.

---

## 5. UI/UX reference layer & elite design bar

**Ambition:** beat Palantir Foundry, Linear, Retool, Airtable, GitHub Projects, ArcGIS Dashboards, ServiceNow, Databricks, Salesforce Lightning, and Stripe — not by copying any of them, but by extracting one thing each and unifying it under one coherent visual language.

**Design language:** Structural Emergence (charter B4) — warm ivory base, earthy neutrals, restrained sage, deep forest/ink, selective lilac/peach accents. Editorial serif for record names; precise operational sans/mono for interface and readouts. Six emergence operations: indeterminacy, differentiation, polarity, recursion, identity, emergence.

**Elite design principles (design-taste-frontend tasteskill 2.5):**
- **One system:** one button pair, one card style, one radius scale, one link look; one heading scale; `sharp` radius for fintech/developer tools.
- **Equal edges:** equal left and right content edges; nothing off-grid, no sideways scroll.
- **Dealt moments:** one hero entrance (`data-enter`) on load; one dealt moment per page, two on long pages; never fade-in on scroll, no tilt, no carousels, no timed tabs.
- **Quiet micro-interactions:** card lifts 2px on hover, buttons step on hover and press on click, underlines draw; card loops 2.5–4 s.
- **Real product UI:** software's own UI as live HTML showing what it works on, in an `app-frame`; never a generic dashboard or only fragments on panels.
- **Finish gate:** copy-lint + consistency.mjs + check.mjs + gate.mjs at 1440, 1024, 768, 390; `GATE: PASS` required before shipping.

**Module → reference mapping (per your interface research):**

| APT-LABS surface | Primary reference | What to extract |
|---|---|---|
| Commons | Linear | Command navigation, sidebar hierarchy, compact data presentation, keyboard navigation, project & issue relationships — discovery without clutter |
| Network | Palantir Object Explorer | Ontology visible in navigation; object discovery, relationship exploration, universal object views |
| Work | ServiceNow | Role-specific workspaces, work queues, assigned obligations, approvals, explicit institutional workflow states |
| Records | Palantir Object Views + Stripe | Universal record pages, object relationships, related lists, activity timelines, precise transaction/metadata states |
| Intelligence | Databricks | Analytical workspace composition, governed data, AI-assisted analysis integrated into the working environment |
| Internal builder | Retool + Palantir Workshop | Entity drill-down, operational tables, monitoring panels, contextual details, action-oriented dashboards |

**Five extracts to defend:**
1. **Palantir:** the ontology must be visible in the way users navigate and understand reality.
2. **Linear:** complexity must not translate into interface clutter.
3. **Airtable:** ordinary people should manipulate structured information naturally.
4. **ServiceNow:** institutional work must have ownership, continuity and explicit states.
5. **Databricks:** intelligence and automation must be integrated into the working environment, not bolted on as a chatbot.

**One ontology. Five pillars. Multiple role-specific workspaces. One coherent visual language.**

---

## 6. Synthesized aetiology (why APT-LABS exists)

**The conversion problem.** Africa does not principally lack people, ideas, resources, institutions, or entrepreneurial activity. It lacks conversion of fragmented capacity into coordinated production. Wage jobs are ~24% of Sub-Saharan employment; Africa is <2% of global manufacturing output despite MVA growing $285B→$351B (2020→2025).

**Fragmented capacity → Coordinated production → Verified value → Cumulative intelligence.** That is the transformation APT-LABS owns.

**Why existing categories fail:**
- Not another ERP (department-organized, not reality-organized)
- Not an AI chatbot (intelligence requires trustworthy organizational context first)
- Not a digital marketplace (supply/demand directories are easy to imitate)
- Not an employment portal (24% wage jobs is not the problem to solve)
- Not merely a data platform (the value is in relationships that make things productive)

**African-rooted but interoperable.** Locally authored canonical ontology (informal groups, cooperatives, apprenticeship, communal stewardship, multiple languages) with explicit mappings to international standards: W3C PROV-O (provenance), OWL 2 (semantics), SHACL (validation), OCDS (public procurement), GS1 EPCIS (supply chain), HSDS (human services), ILO ISCO/ESCO (skills). PostgreSQL as canonical store with RDF/OWL export and SHACL as the semantic interoperability layer — not a day-one graph database.

**Engineering rule:** ontology registry generates or validates TypeScript contracts, DB migrations, API schemas, relationship metadata, permissions, and UI property definitions. One canonical language, not five independently maintained versions.

---

## 7. Synthesized ontometry (how we measure being)

APT-LABS measures the ontology through verified outcomes, not vanity metrics. Forget total accounts, AI requests, page views, registered organizations.

| Indicator | What it tells us |
|-----------|------------------|
| Active institutional records | Whether institutions are actually using the system |
| Verified capacity coverage | Whether known capacity has reliable evidence |
| Need-to-commitment conversion | Whether the network mobilizes resources |
| Commitment fulfilment | Whether promises become delivery |
| Verified completion rate | Whether delivered work is evidenced |
| Asset availability | Whether physical capacity is maintained |
| Resource utilization | Whether previously idle capacity is being used |
| Repeat cross-institution transactions | Whether network effects are emerging |
| Paid work generated | Whether economic opportunity is materializing |
| Institutional retention | Whether the system provides recurring value |

Establish baselines before targets; measure outcomes, not claims.

**Defensibility model:** Defensibility = Trust × Workflow Integration × Network Density × Verified History.

---

## 8. Codebase update plan

### 7.1 Docs (authoritative, update now)

| File | Change |
|------|--------|
| `docs/ontology.md` | Fold in 13-family APTO ontology, relationship vocabulary, kinetic layer, two evidence-standing dimensions; keep as single source of truth |
| `docs/domain-model.md` | Point to the 13-family synthesis (currently 6 structures) |
| `docs/design/charter.md` | Add decision: frontend = Vue 3 + TypeScript (or keep Preact per your call); add n8n as workflow-automation decision |
| `AGENTS.md` | Update stack section (Vue 3 vs Preact), add n8n + ontology module location |
| `docs/architecture.md` | Add ontology layer + n8n integration diagram |
| `docs/superpowers/specs/2026-11-19-aptlabs-final-build-design.md` | This document (done once approved) |

### 7.2 New code (framework-agnostic TypeScript)

```
src/lib/ontology/
  types.ts              — 13 families, entity base, relationship base
  relationships.ts      — canonical relationship vocabulary + cardinality
  events.ts             — AptEvent envelope, occurredAt/recordedAt
  evidence.ts           — maturity × evidence-standing dimensions
  actions.ts            — action engine: commit, assign, verify, settle, produce
  registry.ts           — object registry (types, properties, state machines)
  workflow.ts           — workflow engine coordination
```

### 7.3 n8n

- `n8n/workflows/` — APT-LABS action workflows (commit, assign, verify, settle) calling back to APT-LABS API
- `n8n/nodes/` — custom APT-LABS action nodes if needed

### 7.4 UI (per your stack call — Vue or Preact)

- Beachhead vertical screens: Institution → Need → Capacity → Commitment → Work → Evidence → Outcome
- Fused design system tokens + Structural Emergence language (charter B4)
- Page-head hierarchy (charter B6): eyebrow → h1 (serif) → subtitle → primary action → quiet actions → L3 metrics

### 7.5 What stays untouched

Existing modules (Commons, Network, Workbench, Records, Intelligence), School Console under Workbench, existing tests, existing auth/roles (institution, founder, coordinator, admin), existing Supabase/localStorage persistence.

---

## 9. Acceptance criteria (completion)

- [ ] Ontology types compile under `tsc --noEmit` (strict)
- [ ] 13 families + relationship vocabulary represented in `src/lib/ontology/types.ts` and `relationships.ts`
- [ ] Event envelope (`occurredAt` vs `recordedAt`) implemented
- [ ] n8n workflow(s) for at least one kinetic action (commit OR verify) defined
- [ ] Beachhead vertical end-to-end in the agreed UI framework
- [ ] `npm run build` and `npm run test:unit -- --run` green
- [ ] Docs updated (`docs/ontology.md`, `AGENTS.md`, `charter.md` stack decision)

---

## 10. What I need from you before I write code

1. **Stack:** Migrate Preact → Vue 3 (option a), or keep Preact + build ontology/n8n layer framework-agnostic (option b)?
2. **n8n:** Self-hosted (Docker) or cloud?
3. **Approval:** If this description is correct, say "go" and I'll produce the implementation plan and start writing code.

Nothing is written to code yet — this document is the only change so far.