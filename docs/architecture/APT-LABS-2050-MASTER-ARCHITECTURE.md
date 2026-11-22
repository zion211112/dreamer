# APT-LABS 2050 — Master Architecture & Product Constitution

**Version:** 1.0
**Date:** 2026-11-22
**Status:** Active — governs all implementation work
**Author:** lead (root agent)
**Reference:** REQ-2026-003

---

## 1. Purpose

This document is the single authoritative specification for APT-LABS as **the operating, trust and economic infrastructure for productive capacity**. Every implementation decision, architectural choice, and product feature must trace back to this constitution. It supersedes all prior design memos, module specs, and feature proposals.

**Core thesis:** African productive intelligence already exists in people, institutions, relationships, work and local knowledge. The infrastructure gap is that much of it is fragmented, difficult to verify and difficult to connect. APT-LABS makes it visible, connectable, governable and cumulative.

---

## 2. Canonical Productive Reality Graph (The Immutable Backbone)

### 2.1 Six Structures (Never Separated)

| Structure | Holds | Canonical Distinctions |
|-----------|-------|------------------------|
| **Actors** | People, crews, enterprises, institutions | Person ≠ Asset; Person ≠ Crew; Institution ≠ Venture |
| **Resources** | Skills, assets, capital, knowledge, data | Asset ≠ Capability; Ownership ≠ Custody ≠ Operational Control |
| **Intentions** | Needs, offers, objectives, problems, plans | Claim ≠ Evidence; Declared capability ≠ Verified capability |
| **Commitments** | Agreements, responsibilities, allocations, mandates | Promise ≠ Completed work; Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement |
| **Activity** | Work, production, service delivery, maintenance, transactions | Activity is the bridge between commitments and knowledge |
| **Knowledge** | Evidence, outcomes, institutional memory, credentials | Evidence record ≠ Proof of legal title; Contribution ≠ Entitlement to profit |

**These six structures are one graph.** No module owns a structure. Every completed activity updates all six simultaneously.

### 2.2 Three Transversal Dimensions (Cut Through All Six)

| Dimension | Question | Lives In |
|-----------|----------|----------|
| **Proof** | What can be substantiated? | Record envelope, evidence store, attestations, audit trail, Roll |
| **Governance** | Who has authority to do what? | Authz roles/permissions, agent intents, policy gate, commit→execute→receipt |
| **Value** | Who contributed, what was created, who holds economic rights? | Contribution tokens, investment pledges, outcome allocation, economic instruments |

**Compounding mechanism:** A completed activity updates all six structures AND all three dimensions simultaneously. That single-point, multi-dimensional update is the moat.

---

## 3. Workspace Architecture (Five Destinations, Not Nine Modules)

### 3.1 Five Primary Workspace Destinations

Per Charter B1: Home is the personal shell context where a user chooses quick acts and selects a productive module.

| Destination | Route | Purpose | Ontology Primitive |
|-------------|-------|---------|-------------------|
| **Home / Focus** | `/workspace` | My work, opportunities, commitments, decisions, alerts, outcomes | The chain, not the type |
| **Commons / Discover** | `/workspace/commons` | Needs, offers, opportunities, knowledge, collaborators, capacity | INTENTION |
| **Work / Operations** | `/workspace/workbench` | Commitments, projects, tasks, delivery, coordination, evidence | WORK |
| **Network** | `/workspace/network` | People, crews, organizations, institutions, memberships, relationships | ACTOR · CAPABILITY · RESOURCE |
| **Assets & Value** | `/workspace/value` | Assets, resources, capacity, utilization, procurement, capital readiness | OUTCOME · VALUE |

### 3.2 Universal Capabilities (Accessible Everywhere)

- Universal search across all six structures
- Object history (Canon / Annals / Roll lenses)
- Evidence and verification states
- Embedded intelligence (matching, forecasting, agents)
- Agent dock (governed verbs, propose-never-executes)

### 3.3 Role-Sensitive Workspace (Not Tiered Access)

Different people see different operational surfaces, but share the same underlying reality graph.

| Verified Role/Context | Workspace Emphasizes |
|----------------------|---------------------|
| Individual contributor | Capabilities, opportunities, tasks, commitments, credentials |
| Crew leader | Crew availability, deployment, work allocation, delivery |
| Business operator | Assets, staff, customer work, supply, performance, cash-flow records |
| Cooperative steward | Members, productive resources, allocations, production, distributions |
| Institutional manager | Programs, procurement, providers, resources, budgets, accountability |
| Verifier | Claims awaiting examination, evidence, issuer records, disputes |
| Capital partner | Due diligence, asset dossiers, financing requests, portfolio monitoring |
| Auditor | Scoped read-only records, approvals, decisions, audit trails |
| Developer/integrator | APIs, schemas, permissions, events, connected systems |

A user switches between legitimate contexts, not between separate applications.

### 3.4 Four Concepts That Must Never Collapse

1. **Identity assurance:** Is this person/organization who they claim to be?
2. **Capability verification:** Can they demonstrably perform a particular activity?
3. **Authority:** Are they authorized to perform this action for this organization/project?
4. **Performance:** What have they actually delivered, and how reliably?

No universal reputation score. Build role authorization around scoped memberships, delegated mandates, expiry, revocation, object-level permissions. Combine RBAC with contextual policy checks.

---

## 4. Trust & Credential Fabric (Not "SBT Platform")

### 4.1 Eight Credential Families

| Credential | What It Establishes |
|------------|---------------------|
| Identity credential | Identity claim verified by appropriate issuer |
| Affiliation credential | Membership/association with an organization |
| Capability credential | Specific skill/competency verified by assessor |
| Mandate credential | Authority to act within defined scope and period |
| Work credential | Evidence-backed completion of specified work |
| Asset credential | Issuer-verified claim about asset, inspection, ownership |
| Institutional credential | Recognition, accreditation, compliance status |
| Contribution credential | Documented contribution to project/collective undertaking |

### 4.2 Architecture Principles

- **Start with signed, portable verifiable credentials (W3C VC Data Model 2.0)**
- **Keep sensitive personal information off-chain**
- **Allow holders to present only relevant claims (selective disclosure)**
- **Give credentials expiry, revocation, dispute states**
- **Support SBT-style non-transferable attestations where they add real value**
- **Make blockchain anchoring optional, not mandatory**
- **Keep credentials usable without crypto wallet**
- **APT-LABS does not appoint itself the unquestionable source of truth** — provides infrastructure for credible issuers, evidence, verification policies to work together

### 4.3 Portable Productive Passport

Each participant accumulates a controlled, evidence-backed history:
- What they can do (capabilities)
- Which organizations they're affiliated with (affiliations)
- Which credentials they hold
- What work they've completed (work credentials)
- What outcomes were accepted
- Which mandates they've been granted
- Which assets/resources they're authorized to operate
- Which claims are verified, disputed, expired

---

## 5. Asset Intelligence & Economic Architecture

### 5.1 Asset Passport (Every Registered Asset)

| Dimension | What It Captures |
|-----------|-----------------|
| Ownership | Legal owner, beneficial owner, evidence |
| Custody | Who holds/operates it |
| Condition | Inspection history, current state |
| Capacity | Declared vs verified, availability windows |
| Utilization | Actual use, idle periods, bottlenecks |
| Maintenance | Schedule, history, costs, qualified operators |
| Liabilities | Financing obligations, liens, encumbrances |
| Evidence | All supporting documents, verification states |
| Performance | Revenue/savings generated, work supported |

### 5.2 Five Economic Mechanisms (Interconnected)

| System | Purpose |
|--------|---------|
| **Capacity Exchange** | Makes machinery, storage, transport, facilities, energy, specialist capacity discoverable and usable |
| **Asset Utilization Engine** | Reveals idle assets, bottlenecks, opportunities to improve productive utilization |
| **Procurement & Supply Coordination** | Connects requirements, suppliers, capacity, delivery, accepted evidence |
| **Financing Readiness** | Compiles verified asset, operational, contractual, performance evidence for financial partners |
| **Capital Participation Register** | Tracks approved financing terms, obligations, rights, allocations, disbursements, returns |

### 5.3 Asset Yield Engine

Uses verified utilization and capacity information to identify:
- Available capacity → Potential counterparties → Possible rental/leasing/service arrangements
- Maintenance requirements → Expected operational costs → Unmet demand
- Financing needs to increase capacity → Produces opportunity brief for asset owner

**Does not promise returns or autonomously create financial products.** Identifies and substantiates possible economic use.

### 5.4 Financing Instrument Registry (Not Tokenization)

Explicit representation of legally meaningful arrangements:
- Grants, Equipment leasing, Asset financing, PO financing, Working-capital facilities
- Cooperative member contributions and shares
- Debt, Revenue-sharing agreements, Equity participation
- Asset-backed financing, Project and infrastructure finance

Each instrument: explicit rights, obligations, risk disclosures, eligibility, approvals, payment arrangements, settlement records, exit/maturity conditions.

**A token must not silently become ownership, equity, debt or a right to revenue.** The legal instrument establishes the rights. APT-LABS records and manages the relevant information and workflow.

### 5.5 Kenyan Regulatory Alignment

- Virtual Asset Service Providers Act 2025 + 2026 regulations in operation (CBK/CMA notice Nov 13, 2026)
- Capital Markets Authority framework for investment-based crowdfunding
- Start with asset intelligence, financing-readiness dossiers, partner workflows
- Integrate licensed lenders, custodians, payment providers where required
- Do not operate public securities, crowdfunding, custody, or virtual-asset service initially
- Get Kenyan legal advice on transaction structure before enabling public investment/token services

---

## 6. Proof-to-Capital Pipeline (Ontology + Economics = One System)

```
1. Productive entity registered (ownership, affiliations, capabilities, mandates)
2. Assets and capacity documented (condition, utilization, rights)
3. Work history accumulated (contracts, delivery, accepted milestones, counterparties)
4. Evidence verified (provenance, independent checks, exceptions)
5. Economic dossier generated (operations, asset info, performance, cash-flow evidence)
6. Financing opportunity prepared (partner evaluates under own criteria)
7. Capital deployed and monitored (disbursement, obligations, milestones, distributions, closeout)
```

This is infrastructure that makes productive activity more assessable and financeable — not a marketplace.

---

## 7. Eight Interconnected Engines (Not Isolated Modules)

| Engine | Responsibility | Updates On Every Completed Activity |
|--------|---------------|-------------------------------------|
| **1. Capacity Passport** | Portable, evidence-backed description of what a person, crew, org, or asset can contribute | ✓ |
| **2. Commitment Graph** | Maps promises, responsibilities, resources, dependencies, deadlines, acceptance across orgs | ✓ |
| **3. Opportunity Compiler** | Converts unstructured need → actionable brief → searches productive reality graph for matches | ✓ |
| **4. Evidence & Provenance Engine** | Tracks claim origin, attesters, reviewers, changes, disputes; corrections = attributable amendments | ✓ |
| **5. Asset Yield Engine** | Connects physical assets, availability, utilization, demand, maintenance, financial opportunities | ✓ |
| **6. Contribution & Value Attribution** | Records contributions, calculates allocations per accepted evidence and defined agreements | ✓ |
| **7. Institutional Memory Engine** | Cumulative, discoverable, permission-aware: methods, costs, lessons, standards, verified actors, asset histories | ✓ |
| **8. Decision Intelligence** | Finds capacity gaps, predicts dependencies, recommends counterparties, identifies overdue obligations, models scenarios | ✓ |

**Critical feature:** One completed activity updates several engines at once. A verified maintenance job updates asset condition, technician work history, supplier performance, institutional records, contractual obligation, future financing dossier.

---

## 8. Design System: Structural Emergence (African Design DNA as Generative Language)

### 8.1 Design Principles

| Principle | Required Expression |
|-----------|---------------------|
| Quiet authority | Strong typography, restrained earth/stone/forest palette, deliberate spacing |
| Visible provenance | Claims always have sources, dates, verification states |
| Relational intelligence | Connections and dependencies visually understandable |
| Progressive complexity | New users see simple actions; experts gain deeper controls |
| Material coherence | African design DNA through structure, reciprocity, continuity — not decorative prints |
| Operational clarity | One primary action per context, not a wall of competing controls |
| Human agency | Users understand what AI proposes, what it changed, who approved it |
| Sovereign ownership | Clear data rights, visibility controls, portability, transparent governance |

### 8.2 African Design Grammar (Generative, Not Decorative)

| Concept | Visual/Interaction Expression |
|---------|-------------------------------|
| **Interdependence** | Shared edges, connected timelines, mutual dependencies visible |
| **Weaving** | Overlapping timelines, braided relationship views, multi-thread narratives |
| **Continuity** | Persistent object identity across views, append-only history as default |
| **Witness** | Verification states as visible witnesses, attestation chains |
| **Lineage** | Provenance trails, derivation chains, ancestral records |
| **Collective agency** | Multi-actor workflows, shared mandates, consensus gates |

### 8.3 Visual System (Charter B4)

- **Base:** Warm ivory (#F4F1E9 light / #151515 dark), earthy neutrals
- **Primary:** Deep forest/ink (#2B5945) — restraint, not saturation
- **Accent:** Selective lilac/peach — moments of emergence only
- **Typography:** Editorial serif for record names; precise sans/mono for interface
- **Anti-patterns:** Generic SaaS dashboards, endless card grids, decorative gradients/glows, unnecessary glassmorphism, arbitrary rounded corners, fake spatial depth, unexplained visual metaphors, excessive animation, decorative graphs without operational meaning

---

## 9. Sovereignty Principles (Infrastructure-Level)

| Principle | Meaning |
|-----------|---------|
| **Data sovereignty** | Users/orgs have clear rights over their records, access, corrections, exports. APT-LABS has defined processing rights, not unrestricted ownership. |
| **Institutional sovereignty** | Each org determines its own mandates, verification policies, decision rights within applicable law. |
| **Interoperability** | Records connect with external accounting, registries, payment platforms, business software, identity systems, sector-specific applications. |
| **Economic sovereignty** | African orgs represent their own assets, capabilities, agreements, contributions without surrendering all economic context to external marketplace. |
| **Knowledge sovereignty** | Local practices, methods, standards, institutional memory become structured and reusable, with attribution and appropriate access controls. |

**AfCFTA Digital Trade Protocol alignment:** Common principles, open standards, interoperable digital trade frameworks. One common ontology with configurable national/sector-specific rules. Do not hardcode one country's legal definitions, currencies, credentials, institutional structure.

---

## 10. Staged Build Sequence

### Stage 1 — Foundation (Months 1-6)
**Objective:** Make APT-LABS real for one organization running a real workflow.

| Deliverable | Evidence of Completion |
|-------------|----------------------|
| Canonical ontology implemented as single source of truth | All 6 structures queryable; no module owns a structure |
| 5-workspace-destination shell (Home, Commons, Work, Network, Assets & Value) | Navigation works; role-sensitive views render |
| Multi-tenant workspaces, identity, organizations, memberships, scoped roles | Org can invite members, assign roles, delegate mandates |
| Asset registry, capacity registry | Assets registered with passport dimensions |
| Intentions, commitments, work execution | Need → commitment → work → evidence flow works |
| Evidence & Provenance Engine | Claims have sources; corrections = amendments |
| Commitment Graph | Promises mapped with dependencies, deadlines, acceptance |
| Trust & Credential Fabric (8 families) | Issuers can issue; holders can present; verifiers can verify |

### Stage 2 — Network Effects (Months 6-12)
**Objective:** One participant's verified activity creates value for other legitimate participants.

| Deliverable | Evidence of Completion |
|-------------|----------------------|
| Opportunity Compiler | Unstructured need → actionable brief → graph matches |
| Decision Intelligence | Capacity gaps, dependency predictions, counterparty recommendations |
| Asset Passport & Capacity Exchange | Idle assets discoverable; utilization visible |
| Asset Utilization Engine | Bottlenecks identified; underused capacity surfaced |
| Portable credentials working across orgs | Credential issued in Org A verified in Org B |

### Stage 3 — Economic Intelligence (Months 12-18)
**Objective:** System helps institutions and enterprises unlock and improve productive capital.

| Deliverable | Evidence of Completion |
|-------------|----------------------|
| Proof-to-Capital Pipeline | Economic dossier generated from verified work history |
| Asset Yield Engine | Opportunity briefs produced for asset owners |
| Contribution & Value Attribution | Allocations calculated per evidence and agreements |
| Financing Instrument Registry | Instruments represent legal arrangements with explicit terms |
| Partner integrations (lenders, custodians, payments) | At least 2 licensed partners connected |

### Stage 4 — Ecosystem (Months 18-24)
**Objective:** Third parties build services on top of the common productive reality graph.

| Deliverable | Evidence of Completion |
|-------------|----------------------|
| Institutional Memory Engine | Methods, costs, lessons cumulative and discoverable |
| Extensibility Layer | Stable APIs, schemas, events, integration contracts |
| Partner application framework | 3+ partner apps in integration marketplace |
| Credential issuer network | 10+ independent issuers |
| Sector templates | At least 3 vertical templates (cooperative, institutional, SME) |

### Stage 5 — Continental Infrastructure (Months 24+)
**Objective:** APT-LABS becomes a network connecting productive capacity across organizations, sectors, countries.

| Deliverable | Evidence of Completion |
|-------------|----------------------|
| Country-specific policy frameworks | Configurable national rules without code changes |
| Currency and payment integrations | Multi-currency support with licensed partners |
| Regional trade workflows | Cross-border credentials, multi-jurisdiction governance |
| AfCFTA protocol alignment | Interoperable with other digital trade frameworks |

---

## 11. Success Metrics (Not Vanity MAU)

| Metric | What It Proves |
|--------|----------------|
| Active verified organizations | Real institutional adoption |
| Verified assets and available capacity | Visibility of productive resources |
| Commitments completed | Coordination effectiveness |
| Time from need to qualified match | Reduced transaction friction |
| Cost and time to verify | Trust infrastructure value |
| Asset utilization improvement | New productive value |
| Repeat inter-organizational activity | Network effects |
| Capital mobilized through partners | Economic leverage |
| Revenue retention and expansion | Commercial durability |
| API and partner activity | Platform adoption |

### First Pilot Targets
- 1 anchor institution
- 3-5 participating organizations/suppliers
- Manageable asset register (20-50 assets)
- 1 complete recurring workflow (need → commitment → work → evidence → outcome)
- Objective: Proof the entire cycle works

---

## 12. What We Will Not Build (Anti-Requirements)

| Tempting Idea | Decision | Reason |
|---------------|----------|--------|
| APTCOIN as universal currency | **Defer** | First establish actual economic rights, agreements, settlement |
| SBT for every user | **Reject** | Issue meaningful, evidence-backed credentials only |
| Public investment marketplace | **Defer** | Until regulated structure and partners established |
| Nine independent top-level modules | **Replace** | Five workspace destinations per Charter B1 |
| Global reputation score | **Reject** | Use contextual, attributable evidence (Charter A8) |
| Autonomous AI authority | **Reject** | AI assists; authorized actors decide (Charter A6) |
| Blockchain for all records | **Reject** | Conventional signed records + audit history first |
| All-sector product launch | **Reject** | One vertical to prove common architecture |
| Social feed, gamified engagement | **Defer** | Prioritize activity, decisions, commitments, outcomes |

---

## 13. Architectural Commitments (Frozen Boundaries)

These boundaries are architectural commitments. Do not redesign the codebase around words alone — map every existing module, database table, API, screen, and working workflow against them. Preserve things that already satisfy the architecture; refactor only where there is a real contradiction.

1. **One canonical productive reality graph** — Actors, Resources, Intentions, Commitments, Activity, Knowledge
2. **Three transversal systems** — Evidence/provenance, Governance/authority, Economic rights/value
3. **One context-aware workspace** — Shared underlying entities, different role-appropriate views/permissions
4. **One event and institutional memory system** — Every material action has attribution, time, scope, source, audit history
5. **One extensibility boundary** — Stable APIs, schemas, events, integration contracts
6. **One trust fabric** — Issuers, verifiers, credentials, revocation, disputes, portable attestations
7. **One economic architecture** — Asset passports, capacity utilization, financing-readiness, contractual rights, partner settlement

---

## 14. Governance

- This constitution is **active** and governs all implementation work.
- Changes require explicit architectural decision record (ADR) with rationale, scope, dependencies.
- Conflicts between this constitution and prior documents: **this constitution governs**.
- Implementation agents must reference the specific section and deliverable they are implementing.
- Evidence labels (VERIFIED/PROTOTYPE/TARGET/PLANNED/UNKNOWN) must be used honestly.

---

## 15. Next Actions

1. **DES-001:** Create this document as the living constitution (DONE)
2. **DES-002:** Design System implementation (Structural Emergence tokens, components, patterns)
3. **DEV-001:** Stage 1 Foundation — Canonical ontology, workspace shell, identity, orgs, roles
4. **DEV-002:** Stage 1 Foundation — Evidence & Provenance Engine + Commitment Graph
5. **DEV-003:** Stage 1 Foundation — Trust & Credential Fabric

---

*End of Master Architecture & Product Constitution v1.0*