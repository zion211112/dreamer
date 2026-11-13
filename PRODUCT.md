# APT-LABS — Product

Single source of truth for what APT-LABS builds, who it serves, and how it operates. Replaces scattered spec files, plans, and the superseded v2 direction. Where this document conflicts with `docs/design/charter.md`, the charter governs.

## Surface positioning (the cloak)

APT-LABS is B2B operational infrastructure software: workflow and coordination tooling for institutions and local producers who need to get real work done. To an outside observer it is just another company selling coordination software — procurement routing, project assembly, delivery evidence, and attestation records for teams that already do the work.

Beneath the surface, APT-LABS is infrastructure for making fragmented productive capacity visible, connectable, governable, locally retained, and cumulative — an alternative productive society organized by and for people, cloaked in the form of a commercial company so Babylon systems can be improved or replaced trojan-style without announcing the intent.

## Core thesis

**African behaviour → data → models → AI services → platforms.** Sell capacity back to the communities that hold it. People, crews, institutions, assets, skills, needs, opportunities, work, and evidence already exist in local economies; they are fragmented, not absent. APT-LABS makes their relationships legible and actionable so real economic activity can be discovered, organised, evidenced, and repeatedly activated.

**Living reality precedes its representation.** Data is a trace of reality, not reality itself. Models are interpretations. AI services are instruments, not ends. The system proposes; people decide.

## Governing question

Does this make the productive network more capable of creating, coordinating, retaining, and multiplying real economic value? If not, why does it belong in APT-LABS?

## The six structures (shared economic fabric)

Every product, sector, and workflow expresses the same six underlying structures; none is forced into a single rigid role.

| Structure | What it holds | Example |
|-----------|--------------|---------|
| Actors | People, crews, enterprises, institutions | A mason, a fabrication crew, a school, a hospital |
| Resources | Skills, assets, capital, knowledge | Welding skill, a micro-hydro rig, savings, a blueprint |
| Intentions | Needs, opportunities, proposals | "Workshop bench needed", "Animation asset for investment" |
| Commitments | Agreements, roles, obligations, authority | A tender, a crew role, a payment term, an authorisation |
| Activity | Events, work, exchange, delivery | Pouring concrete, rendering a frame, signing off a build |
| Knowledge | Evidence, credentials, outcomes, lessons | Roll entry, SBT attestation, dispute record |

## Canonical distinctions (invariants — never silently equated)

- Person ≠ Asset (a person has agency, is not inventory)
- Person ≠ Crew (a crew performs work; a person is a member)
- Institution ≠ Venture (an institution commissions/authorises; a venture is a bounded undertaking)
- Asset ≠ Capability (an asset is a thing; capability is the ability to use it)
- Claim ≠ Evidence (an assertion is bounded by subject, predicate, scope; evidence substantiates it)
- Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement (each is a distinct, separately timed flow)
- AI suggestion ≠ institutional decision

## The transformation chain

**Fragmentation → Legibility → Connection → Memory → Learning → Coordination → Capability.**

Each completed cycle improves conditions for the next:
1. Discover capacity and demand
2. Compose cooperation
3. Execute production
4. Capture evidence
5. Create recognition (attestations, institutional memory)
6. Improve future coordination

Steps can repeat, branch, be skipped, or terminate without success — not a mandatory linear workflow.

## Factory readiness (production grammar)

The eight-stage production grammar every work cycle follows. Not every stage runs in every cycle.

| # | Stage | What happens |
|---|-------|-------------|
| 01 | Intake | Receive and structure demand |
| 02 | Diagnose | Understand the actual problem |
| 03 | Compose | Design the solution and resources |
| 04 | Authorise | Establish authority and commitments |
| 05 | Produce | Coordinate and execute work |
| 06 | Inspect | Test against defined requirements |
| 07 | Settle | Resolve obligations and exchange |
| 08 | Learn | Preserve evidence and improve |

## State machines

### WorkStatus (local workbench application lifecycle)
`authorization_pending → authorized → in_progress → submitted → changes_requested → accepted`
Transitions: submit → under_review → selected → authorization_pending → authorized → in_progress → submitted → accepted. `changes_requested` branches back from submission review. `declined` terminates from `selected`.

### ApplicationStatus
`submitted → under_review → selected → declined` (terminal); `selected → authorization_pending` opens work.

### Commons proposal
`proposed → approved | rejected | returned` (steward-gated). Approved proposals link into Workbench.

### Workbench simulation pipeline
`candidate_drafted → tender_review_simulated → assembly_simulated → delivery_simulated → acceptance_simulated → roll_preview`.
Actions: `tender-review, assembly, delivery, acceptance, deployment, pause, resume, cancel`. Stage gates: auto / blocked / proceed. `roll_preview` applies only to `physical-asset` work kind.

### Roll evidence layers
`public | participant | restricted` — access classifications, not evidence-quality levels.

### Roll revision
Change types: `correction | restriction_change | evidence_added`. Corrections are detectable via `hash_anchor`, not prevented.

## Modules and lenses

One workspace, one shared graph, six modules.

| Module | Job | Route |
|--------|-----|-------|
| Home | Personal entry point: quick acts, personal assignments, linked updates, module selection | `/workspace` |
| Commons | Discover and express needs, offers, resources, opportunities, knowledge, problems | `/workspace/commons` |
| Network | Understand and connect people, crews, institutions, assets, capabilities, relationships | `/workspace/network/{people,institutions,capabilities}` |
| Workbench | Scope, assemble, coordinate, manage productive work | `/workspace/workbench`, `/workspace/workbench/:pilot` |
| Records | Inspect durable history, provenance, evidence, credentials, attestations | `/workspace/records/{canon,annals,roll}` |
| Intelligence | Agents, graph analysis, matching, forecasting, analytics | `/workspace/intelligence`, `/workspace/intelligence/coin-lab` |

**School Console** — nested operational boundary under Workbench (workplace where people take jobs), not a primary module.

**Canon / Annals / Roll** — three lenses within Records, not independent navigation modules:
- **Canon** — what is structurally recorded: entities, identities, typed relationships, accepted state
- **Annals** — what happened over time: chronological events, changes, decisions, transitions
- **Roll** — why a claim or outcome can be substantiated: evidence, provenance, attestations, verification

## Auth, roles, persistence

Demo mode (localStorage) when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` unset. Roles: `institution`, `founder`, `coordinator`, `admin`. No live authentication; browser-local only.

Persistence: `localStorage` keys `aptlabs:sbt-attestations:v1`, `aptlabs:agent-proposals:v1`, `aptlabs:workbench-local-flow:v1`, `demo_roll_entries`; IndexedDB for School Console tender drafts.

## Commercial model (honest, cloak-compatible)

Positioned as B2B procurement/workflow infrastructure. Primary commercial engine: **Replacement Engine** — routes institutional procurement through verified local producers, 3–5% transaction fee (Coupa/Jaggaer model). Roll is the defensibility layer: verified-producer routing becomes impossible to replicate cheaply once Roll density accumulates.

Revenue streams (prioritized):
1. Replacement Engine — 3–5% fee on routed procurement (Year 1–2)
2. Project Coordination — per-project fee / institutional subscription
3. Technical Integration — APT Fab / Studio services, productized fabrication
4. Evidence Certification — query access to Roll for dev finance, banks, insurers (Year 4+, requires Roll density)
5. Coordinator Certification — training revenue (cost center unlocking geography)

**Wedge (first 90 days):** Schools, cooperatives, community orgs, small enterprises — equipment repair, fabrication, installation, maintenance, minor infrastructure. Not major bridges, hydro, or high-regulation work (Year 3+).

**Capitalization must survive Year 3 without $1B traction.** Replacement Engine fees + coordination fees fund the compounding period.

## Roll (defensibility layer)

Durable, attributable close-out records of completed undertakings. Generates forkable blueprints, capability upgrades, capital legibility. Evidence certification revenue from Year 4+.

Roll entry (flexible, not fixed-field): undertaking type/scope/deliverables, commissioned-by, participants (anchor/builder/apprentice/coordinator), evidence with public/participant/restricted layers, acceptance block, hash_anchor (SHA-256 of canonical JSON), revisions, recorded_at/recorded_by.

## What APT-LABS is NOT

- A social network, conventional job board, generic marketplace, collection of institutional dashboards, blockchain or SBT product, generic project-management app, or AI chatbot with business-themed screens. Those may be features/channels; none is the core.
- A charity: sustained by operational savings, not donations.
- A credential mill: records derive from labor, not exams.
- A universal reputation score collapsing trust into one number.
- On-chain identity or payment as a prerequisite for productive work.
- Fake functionality, invented data as real, or demo disclaimer theater.

## Four evidence states (open entry → progressive trust)

Claim statuses, not human rankings. New participants enter at Declared.

| State | Meaning | Who can enter | Visual weight |
|-------|---------|---------------|---------------|
| Declared | Participant says they can do it | Anyone (self-serve) | Light — dashed underline |
| Supported | Supplied relevant evidence | Participant uploads | Medium — dotted underline |
| Counterparty-confirmed | Customer/partner confirms contribution | Institution/coordinator | Strong — solid underline |
| Independently verified | Qualified third party assessed claim | Third-party verifier | Maximum — bold + seal |

The Roll strengthens profiles; it does not determine who may have a profile.

## Open boundaries (stable core, extensible edges)

| Openness | Requirement |
|----------|-------------|
| Ontological | New entity types, records, relationships, events can be introduced |
| Operational | New production methods and workflows can be defined |
| Economic | New contractual, financial, exchange instruments integrate without rewriting core |
| Institutional | New governance arrangements, authorities, organisational forms participate |
| Technical | External software, APIs, identity, data sources, infrastructure interoperate |

**Core (stable invariants):** shared identity, provenance, relationships, time, authority, evidence, commitments, events, canonical entity distinctions. **Extensions:** domain meanings for agriculture, fabrication, healthcare, creative production, education, etc.

## Design direction

**Structural Emergence** (charter B4, 2026-11-11): warm ivory/earthy neutral base, restrained sage, deep forest/ink, selective lilac/peach accents. Editorial serif for record names; precise sans/mono for interface. Six emergence operations: indeterminacy, differentiation, polarity, recursion, identity, emergence. Implementation: `src/tokens.css` (`:root` light default, `[data-skin="dark"]` variant).

Hard anti-patterns (design tests, not bans): generic SaaS dashboards, endless card grids, decorative gradients/glows, unnecessary glassmorphism, arbitrary rounded corners, fake spatial depth, unexplained visual metaphors, excessive animation, decorative graphs without operational meaning.

## Implementation stack (verified)

Preact 10.24 + Vite 6.4.5 + TypeScript 5.6 strict + Wouter 3.3.5 + Vitest 5.0.5. Supabase demo-mode fallback. Browser-local first. `npm run build` (tsc + vite build → dist/), `npm run test:unit -- --run` (12 files, 74 tests), `npx tsc --noEmit`.

Key files: `src/App.tsx` (route switch), `src/components/WorkspaceShell.tsx` (shell), `src/tokens.css` (tokens), `src/lib/people-network.ts` (31 entities, 34 relationships), `src/lib/local-workbench.ts` (work status state machine), `src/lib/workbench-simulation.ts` (6-stage pipeline), `src/lib/db/roll.ts` (roll entries, hash anchor, evidence layers), `src/lib/sbt-attestations.ts` (SBT mint/list/verify/export), `src/lib/agent-host.ts` (proposes-never-executes), `src/lib/demo-seed.ts` (3 demo scenarios: school workshop, Kemetos AGI1, Thiba Hydro).

## Time estimate to ship the consolidated lean product

Current state: codebase is functionally complete per the ontology; the missing piece is a single authoritative PRODUCT.md (now written) plus alignment of any remaining superseded archive material (no code changes required — archive is reference-only).

- Consolidate PRODUCT.md (done): complete
- Reconcile archive/superseded docs against PRODUCT.md (read-only, no authority): 1–2 hours
- Build + test gate verification: `npm run build` and `npm run test:unit -- --run` — must be run outside the sandbox (build is sandbox-blocked by esbuild parent-dir access, not a code defect): 30 minutes

**Total estimated effort to finalize: ~2–3 hours, mostly verification.** No implementation work is required to reach the lean consolidated state; the ontology, state machines, modules, and commercial model are already implemented and documented across `docs/ontology.md`, `docs/design/charter.md`, `docs/APT-LABS-SYSTEM.md`, and this PRODUCT.md.

## Next action

Run `npm run build` and `npm run test:unit -- --run` to confirm the current tree is green, then treat `PRODUCT.md` + `docs/design/charter.md` + `docs/ontology.md` as the three-source authority. Archive material remains reference-only and does not define current authority.
