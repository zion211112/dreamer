# APT-LABS: Complete Synthesis (Three-Layer Correction)

> **Source 1:** Codebase audit (current implementation)
> **Source 2:** First correction — Marketplace → Record System (Roll as primary artifact)
> **Source 3:** Second correction — Replacement Engine as commercial engine, coordinator bottleneck, timing problem
> **Source 4:** Superior middle ground — Three products (Explore/Work/Roll), open entry + progressive trust, commercially honest MVP

---

## THE ARCHITECTURE (All Layers Integrated)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE ROLL (Long-term Asset / Moat)                    │
│  Immutable, attributable close-out records of COMPLETED undertakings        │
│  Generates: Blueprints (forkable) + Capability Upgrades + Capital Legibility│
│  Revenue: Evidence certification (dev finance queries) — Year 4+            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   EXPLORE     │           │     WORK      │           │  REPLACEMENT  │
│  (Network)    │           │  (Workbench)  │           │   ENGINE      │
│               │           │               │           │  (Commercial) │
│ Join          │           │ Organise      │           │               │
│ Present       │──────────▶│ Deliver       │──────────▶│ Procurement   │
│ Discover      │           │ Record        │           │ Routing       │
│               │           │               │           │ 3-5% fee      │
└───────────────┘           └───────────────┘           └───────────────┘
        ▲                           ▲                           ▲
        └───────────────────────────┼───────────────────────────┘
                                    ▼
                         ┌───────────────────────┐
                         │  INSTITUTIONS & ASSETS │
                         │     (Node Registry)    │
                         └───────────────────────┘
```

**Three Sources of Truth (not one database):**
1. **NETWORK RECORDS** — Who participates, what they offer, claims, resources
2. **WORK RECORDS** — Authoritative project lifecycle: requirements, agreements, participants, changes, costs, delivery status
3. **ROLL RECORDS** — Durable, attributable close-out snapshot referencing accepted work + evidence

**Linked through stable IDs + explicit permissions. They do not overwrite each other.**

---

## THE FOUR EVIDENCE STATES (Open Entry → Progressive Trust)

| State | Meaning | Who Can Enter | Visual Weight |
|-------|---------|---------------|---------------|
| **Declared** | Participant says they can do it | Anyone (self-serve) | Light — dashed underline |
| **Supported** | Supplied relevant evidence (work samples, refs) | Participant uploads | Medium — dotted underline |
| **Counterparty-confirmed** | Customer/partner confirms specific contribution | Institution/coordinator marks | Strong — solid underline |
| **Independently verified** | Qualified independent party assessed claim | Third-party verifier | Maximum — bold + seal |

**Critical:** These are *claim statuses*, not human rankings. A new welder enters at **Declared**. After first delivery → **Counterparty-confirmed**. After third-party audit → **Independently verified**.

**The Roll strengthens profiles. It does not determine who is allowed to have a profile.**

---

## ROLL DESIGN (Corrected from Six-Field Rigid Model)

### What Triggers a Roll Entry
- Completed undertaking reaches documented close-out
- NOT: profile creation, enquiry, application, simulation

### Delivery Types Supported
| Type | Evidence Required | Roll Record Type |
|------|-------------------|------------------|
| Physical (bridge, pump, solar) | Inspection report, commissioning photos, acceptance doc | `physical-delivery` |
| Digital (software, research) | Repo link, demo, acceptance criteria met | `digital-delivery` |
| Creative (animation, design) | Delivered files, client acceptance | `creative-delivery` |
| Hybrid | Combination | `hybrid-delivery` |

### Three-Layer Information Architecture
| Layer | Content | Access |
|-------|---------|--------|
| **Public Record** | Undertaking scope, participants (roles), acceptance, reusable designs, cost (if disclosed) | Public query |
| **Participant Record** | Attributable contributions, evidence participant owns | Participant export (portable) |
| **Restricted Evidence** | Confidential docs, personal data, commercial details, protected institutional info | Permissioned (institution + participant) |

### Roll Entry Fields (Flexible, Not Six-Field Fixed)
```typescript
interface RollEntry {
  id: string;
  undertaking: {
    type: 'physical' | 'digital' | 'creative' | 'hybrid';
    title: string;
    scope: string;
    deliverables: string[];
    reusableDesigns?: BlueprintRef[];
  };
  commissionedBy: { institutionId: string; name: string; coordinatorId: string };
  participants: RollParticipant[];
  evidence: EvidenceRef[];              // Links to restricted/participant/public layers
  acceptance: {
    acceptedBy: string;                 // Coordinator/institution
    acceptedAt: string;
    inspectionReportId?: string;
    costDisclosed?: { amount: number; currency: string };
  };
  maintenanceObligations?: MaintenanceItem[];
  recordedAt: string;
  recordedBy: string;
  hashAnchor: string;                   // Detects subsequent changes
  revisions: RollRevision[];            // Corrections are detectable, not prevented
}
```

---

## COMMERCIAL MODEL (Honest Numbers)

### Revenue Streams (Prioritized by Commercial Leverage)

| Stream | Payer | Year 1-2 | Year 3-5 | Year 6-10 | Notes |
|--------|-------|----------|----------|-----------|-------|
| **Replacement Engine** (Primary) | Institutions procuring locally | 3-5% transaction fee on routed procurement | Scales across counties/countries | Continental procurement infrastructure | **B2B procurement play — Coupa/Jaggaer model** |
| Project Coordination | Institution/customer | Per-project fee | Recurring as trust builds | Institutional subscription | Wedge: schools, cooperatives, small enterprises |
| Technical Integration | Project owner | APT Fab/Studio services | Productized fabrication/media | APT Fab as capacity | In-kind contribution to Roll |
| Evidence Certification | Dev finance, banks, insurers | — | Query access to Roll | Data product at density | Requires Roll density (Year 4+) |
| Coordinator Certification | Individuals/institutions | — | Training revenue | Professional pipeline | Cost center that unlocks geography |

**Replacement Engine = Commercial Engine. Roll = Defensibility Layer.**
- Replacement Engine routes procurement through verified local producers
- Roll makes verified-producer routing impossible to replicate cheaply
- Together = $1B architecture. Separately = small business or useful tool without trust.

### Business Wedge (First 90 Days)
**Customer:** Schools, cooperatives, community orgs, small enterprises
**Need:** Equipment repair, fabrication, installation, maintenance, minor infrastructure
**Why:** Real needs, local providers exist, tangible evidence, repeat purchases, same mechanism scales

**NOT:** Major bridges, hydro, high-regulation — those are Year 3+ applications.

---

## COORDINATOR BOTTLENECK (Named and Priced)

| Reality | Implication |
|---------|-------------|
| Training/certifying humans is slow, expensive, non-compounding | S-shaped scaling curve, higher capital requirements |
| Every geographic expansion = new human cohort | Cannot be software-first capitalized |
| Coordinators are **cost center** unlocking revenue, not revenue stream | Must be funded from Replacement Engine margins |
| Coordinator = only role that can compose team from Roll + close to Roll standard | Workbench UI must be coordinator-native |

**Workbench = Coordinator's terminal.** Not a generic project dashboard.

---

## TIMING PROBLEM (Honest)

| Phase | Timeline | Risk | Mitigation |
|-------|----------|------|------------|
| First authentic Roll entry | Month 3-4 | Replicable by county IT/NGO | Speed to density; first-mover in wedge |
| Roll consulted before procurement | Year 7-10 | Investor horizon mismatch | Replacement Engine revenue from Year 2 |
| Cross-border blueprint forking | Year 5+ | Network effect delay | Design for forking from Day 1 |

**Capitalization must survive Year 3 without $1B traction.** Replacement Engine fees + coordination fees fund the compounding period.

---

## MVP (Six Capabilities — Build Order)

| # | Capability | Implementation | Roll Integration |
|---|------------|----------------|------------------|
| 1 | **Join** | Auth + Network Records (profiles, claims, resources) | Profile created; no Roll entry |
| 2 | **Present** | Institution posts need → Work Record created | Need = Work Record (not Roll) |
| 3 | **Discover** | Query Network Records (filter by evidence state) | Shows evidence state, not just claims |
| 4 | **Organise** | Coordinator creates brief, selects team, agrees scope/costs | Work Record → agreement |
| 5 | **Deliver** | Milestones, evidence upload, cost tracking, acceptance gate | Evidence → Restricted layer |
| 6 | **Record** | Close-out → **Roll Entry created** (public + participant + restricted) | **First authentic Roll entry** |

**Success Condition:** Customer pays again; providers value participating again.

---

## SOVEREIGNTY AS PROPERTIES (Not Promises)

| Property | Implementation |
|----------|----------------|
| Export own records | `GET /roll/participant/:id` → portable JSON |
| IP ownership retained | Blueprint fork = explicit license; default = maker retains |
| Confidential control | Three-layer Roll; institution controls restricted layer |
| Interoperable formats | JSON-LD / W3C VC compatible; documented schemas |
| Replaceable providers | No platform lock-in; Roll entries reference external IDs |
| Independent businesses | Network Records ≠ APT-LABS employees |
| Independent evidence | Roll accepts third-party verification; not APT-LABS monopoly |

---

## WHAT TO STOP (Confirmed Across All Layers)

| Stop | Reason |
|------|--------|
| Four spatial floors | Metaphor, not product |
| Two tender engines | One Work flow |
| Capital dashboards (6 capitals) | Year 4+; Roll density needed first |
| AGI/AI center | Not v1; Page Agent = distraction |
| Credentials/tokens/SBT | Roll entries ARE the credential; no parallel system |
| Universal economic graph | Three sources of truth; no grand unification |
| Coordinator accreditation profession | Cost center; certify when geography demands it |
| Automatic savings reinvestment | Not real until Treasury exists (physical nodes) |
| Blockchain/tokenization | Hash anchor sufficient; crypto when needed |
| Public personal evidence | Three-layer model protects privacy |
| National procurement engine | Replacement Engine starts at wedge |

---

## IMPLEMENTATION PRIORITY (Revised from Audit)

### Phase 1: Foundation (Weeks 1-3) — **Seed Crystal**
```
1. Shared Auth (Supabase) + PostgreSQL + Permissions + Revisions
2. Three DB schemas: network_records, work_records, roll_records
3. Roll Core: createRollEntry() with three-layer evidence, hash anchor, revisions
4. Institutions Register + Need Presentation (Work Record creation)
```

### Phase 2: Explore (Weeks 4-6) — **Network Records Live**
```
5. Network Profiles: Join (register), Claims (Declared), Evidence upload (Supported)
6. Discover: Query Network Records with evidence-state filters
7. Service Offers: Structured offers linked to claims
```

### Phase 3: Work (Weeks 7-10) — **Coordinator Workbench**
```
8. Workbench: Coordinator composes team FROM Network Records (Roll queries)
9. Work Record lifecycle: Brief → Agreement → Milestones → Evidence → Acceptance
10. Evidence Pipeline: Upload → S3/R2 → signed URL → linked to Work Record
```

### Phase 4: Roll (Weeks 11-12) — **First Authentic Entry**
```
11. Acceptance Gate: Coordinator + Institution sign → createRollEntry()
12. Roll Read API: Public query + Participant export + Restricted access control
13. Blueprint Generation: From Roll entry → forkable markdown + BOM + roles
```

### Phase 5: Compounding (Weeks 13-14) — **Network Effects Begin**
```
14. Capability Upgrade: Roll entry → updates Network Profile evidence states
15. Replacement Engine MVP: Procurement routing query → verified local producers
16. First Delivery Experiment: 1 institution, 3 providers, 1 Roll entry, paid
```

---

## DESIGN LANGUAGE (Per Module — No AI Defaults)

| Module | Visual Language | Key Principle |
|--------|----------------|---------------|
| **EXPLORE** | Editorial density — compact lists, serif names, evidence state visible | "Show me verified capacity" |
| **WORK** | Ceremonial Terminal — REPL density, gate thresholds, Roll preview before acceptance | "Coordinator's command surface" |
| **ROLL** | Wax Seal / Hash Chain — monospace hash, timestamp, anchor sig, evidence grid | "Immutable, attributable, queryable" |
| **INSTITUTIONS** | Topology Map — nodes with Roll connectivity, not org chart | "Show me productive network" |

**Zero:** Numbered sections, ALL-CAPS eyebrows, cream/sage, uniform card grids, → on buttons, mono labels + serif headlines as default.

---

## THE ONE SENTENCE

> **APT-LABS is a local production network that helps institutions get real work done through local enterprises, and every completed undertaking generates a verified Roll entry that compounds into the trusted evidence substrate making African productive capacity legible on its own terms — with the Replacement Engine as the commercial engine and the Roll as the defensibility moat.**

---

## IMMEDIATE NEXT ACTION

**Phase 1 Foundation Plan** — I'll write the detailed implementation plan with:
- Exact DB migrations (three schemas)
- Auth integration (Supabase)
- Permissions model (institution/founder/coordinator)
- Roll core write path with three-layer evidence
- Institutions register + need presentation API

This is the seed crystal. The first authentic Roll entry is the proof.

Want me to write the Phase 1 plan with exact file signatures, DB migrations, and test cases?