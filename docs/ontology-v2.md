# APT-LABS — Ontology v2: The Agency-to-Outcome Model

**Status: DRAFT for ratification.** This document supersedes nothing yet. It is the
candidate final form of `docs/ontology.md` and requires (a) decision record **B11**
(module set + primitive set; `B9` and `B10` are already taken by the Vue migration and
n8n orchestration records in `docs/decisions/`), then (b) a rewrite of `docs/ontology.md`,
then (c) code changes listed in §10. Until ratified, `docs/design/charter.md` and
`docs/ontology.md` remain in force.

---

## 1. Purpose

APT-LABS is a federated operating infrastructure for making fragmented productive capacity
visible, connectable, governable, locally retained and cumulative (charter A1), so that
individuals, enterprises, communities and public institutions can discover what exists,
organise what is possible, coordinate what must happen, verify what actually happened,
preserve what was learned, and govern how created value circulates.

It represents the relationships between **agency, capability, resources, intention,
authority, commitment, work, evidence, outcomes, knowledge and value**.

**Governing question:** *Who can do what, with which capabilities and resources, under
whose authority, for what purpose, through which commitments, producing what evidence,
outcomes and distributable value?*

**Progression:** the charter A1 chain stands unchanged —
**Reality → structured records → relationships → coordinated work → verified outcomes →
reusable intelligence → economic value.** The Agency-to-Outcome reading of that chain is:

Reality → Legibility → Agency → Coordination → Execution → Proof → Value → Memory

This is a *naming refinement* of A1, not an amendment; B11 must confirm that reading or
amend A1 explicitly.

---

## 2. The eleven primitives

These are the complete foundational vocabulary. Sector, product and workflow differences
are expressions of these primitives, not new foundations.

| # | Primitive | What it holds | Code family (`src/lib/ontology/types.ts`) |
|---|-----------|---------------|------------------------------------------|
| 01 | **ACTOR** | Person, crew, enterprise, institution, collective or machine agent. Agency, identity, roles, responsibilities. *A person is an agent, never an asset.* | `ACTOR` |
| 02 | **CAPABILITY** | What an actor can reliably accomplish. Claimed, demonstrated, assessed, independently verified. | `CAPABILITY` |
| 03 | **RESOURCE** | What can be mobilised. Land, equipment, capital, materials, software, energy, time. Ownership, custody, availability, stewardship, access conditions. | `RESOURCE` |
| 04 | **KNOWLEDGE** | What has been learned, discovered, inherited, documented or demonstrated. Institutional memory, technique, research, procedure. | `KNOWLEDGE` |
| 05 | **INTENTION** | Why something should happen. Need, opportunity, problem, objective, desired change. | `INTENTION` |
| 06 | **AUTHORITY** | The legitimate basis for action. Law, mandate, consent, delegation, contract, jurisdiction, ownership rights, community authorisation. | `GOVERNANCE` *(no code rename — see note)* |
| 07 | **COMMITMENT** | An undertaking binding an actor to another actor, purpose or outcome. Responsibility, promise, contract, obligation, deadline, acceptance condition. | `COMMITMENT` |
| 08 | **WORK** | Execution of productive activity. Projects, processes, transactions, production, services, learning activities, institutional operations. | `WORK` (+ `ACTIVITY` as sub-kind) |
| 09 | **EVIDENCE** | What establishes that something happened and how well. Documents, measurements, attestations, observations, tests, audits, counterevidence. Provenance + verification status always attached. | `EVIDENCE` |
| 10 | **OUTCOME** | What changed as a consequence of work. Deliverables, services received, production achieved, problems resolved, capabilities acquired. | `OUTPUT_OUTCOME` |
| 11 | **VALUE** | What was created, consumed, protected, captured or distributed. Financial, economic, social, institutional, ecological, human value. Attribution, rights, costs, benefits, compensation, distribution. | `EXCHANGE` *(settlement records only — see note)* |

**Economic Instruments are NOT the VALUE primitive.** They are conditional, separately
governed mechanisms (charter A3, A9) that may represent or settle value — Kemet Coin,
APT Coin, vouchers, credit. They sit *above* the eleven primitives as instruments, never
as the foundation, and are never a prerequisite for participation. Authority to mint,
issue or settle them is an `AUTHORITY` record; their integrity evidence is `EVIDENCE`.

**Code-family note — no renames in this decision.** The eleven primitives are the
*foundational vocabulary*; the thirteen code families in `src/lib/ontology/types.ts` are
the *implementation registry*. They are not required to be one-to-one:

- `GOVERNANCE` already carries the authority-bearing types (Mandate, Consent, Policy,
  Jurisdiction, Role) **plus** access-control facets (Identity, Membership, Permission,
  DataClassification). Those facets implement sovereignty invariants 2 and 7 and must not
  be renamed away. Authority is therefore a *reading* of `GOVERNANCE`, not a replacement
  of it.
- `EXCHANGE` carries the settlement vocabulary (Offer, Quote, Procurement,
  PurchaseOrder, Invoice, Payment, Shipment, Settlement). Charter A7 requires settlement
  to stay on its own timed flow, so this family stays as it is — it is the *settlement
  record* side of the VALUE primitive, not the whole of it. Value attribution, rights and
  distribution live in `COMMITMENT`, `EVIDENCE`, `KNOWLEDGE` records and their
  relationships. Note that `Offer`/`Quote`/`Procurement`/`PurchaseOrder`/`Invoice` are
  *pre-delivery commercial records*; they do not constitute delivery, and A7's delivery
  flow stays in `WORK`/`ACTIVITY` records.
- `ACTIVITY` remains a **distinct family**, not a sub-kind of `WORK`: `WORK` is the
  bounded undertaking (`src/lib/ontology/types.ts:322-330` keeps `Work ≠ Activity`).
  Granular delivery/transfer events (`WorkType`/`ActivityType`, `types.ts:126-134`)
  belong to `ACTIVITY`; the undertaking they serve belongs to `WORK`.
- `PLACE` remains a family and is **not** demoted to an attribute: `Location` and
  `Jurisdiction` are distinct code concepts (`types.ts:88-96`), and jurisdiction is
  *also* an authority-bearing type (`GovernanceType.Jurisdiction`, `types.ts:178-187`).
  The eleven primitives do not need a geography primitive; the registry keeps both
  placements because scope and authority are different questions.

Renaming `GOVERNANCE`→`AUTHORITY` or `EXCHANGE`→`VALUE` would require edits in
`types.ts`, `types.test.ts`, `relationships.ts` (6 cardinality rows), `workflow.ts`,
`WorkspaceOverview.vue`, `FamilyGlyph.vue` and `ontology/index.ts` — for no semantic gain,
and it would break persisted record-envelope family strings
(`src/lib/record-envelope.ts:33,133,317`) with no migration path.
Recommendation: **do not rename.** Record the primitive↔family mapping in
`docs/ontology.md` and let the registry keep its own names.

**Reconciliation with the current six structures** (`docs/ontology.md`) — nothing is lost:

| Six structure | v2 primitives |
|---------------|---------------|
| Actors | 01 Actor |
| Resources | 02 Capability, 03 Resource, 04 Knowledge *(split: ability ≠ thing ≠ knowing)* |
| Intentions | 05 Intention, 06 Authority *(split: wanted ≠ permitted)* |
| Commitments | 07 Commitment, 06 Authority *(split: undertaken ≠ authorised)* |
| Activity | 08 Work, 10 Outcome *(split: activity ≠ consequence)* |
| Knowledge | 09 Evidence, 10 Outcome, 11 Value *(split: proof ≠ result ≠ benefit)* |

**Reconciliation with charter A3** (canonical entity distinctions) — preserved, not
collapsed. Charter-level: Person/Crew/Institution/Venture → Actor (with Venture as a
Work+Commitment pair); Asset/Opportunity → Resource / Intention; Work → Work; Evidence →
Evidence; Economic Instruments → a conditional instrument layer, separately governed
(charter A9 still binds — Kemet Coin / APT Coin has no assumed universal-value function).
Code-level distinctions that survive in `src/lib/ontology/types.ts` and are **not**
replaced by the eleven primitives: `Person ≠ Account`, `Organization ≠ Institution`,
`Asset ≠ Resource`, `Work ≠ Activity`.

`PLACE` remains a **scoping attribute** of actors, resources and work, not a twelfth
primitive. The model is about agency and value, not geography.

**Non-negotiable distinctions carried forward from the charter (A3, A5, A6, A7, A9).**
The eleven primitives sharpen these; they never collapse them:

- Person ≠ Asset; Person ≠ Crew; Institution ≠ Venture; Asset ≠ Capability; Claim ≠ Evidence.
- Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement. Recommendation ≠ Approval. AI suggestion ≠ institutional decision.
- **Delivery, financial obligation/settlement, and contribution attribution run on independently timed flows**, connected by undertaking reference but never inheriting one another's statuses. A rejected undertaking may still contain valid contributions; accepted work may remain unpaid.
- No universal reputation score. Trust stays contextual and issuer-attributed.
- Economic instruments (Kemet Coin, APT Coin) are conditional, separately governed mechanisms with no assumed universal-value function.

---

## 3. The Proof-Carrying Work Unit

The centre of gravity is not the object; it is the undertaking. Every significant
undertaking can be represented as one unit:

**INTENTION** (problem / desired outcome)
→ **AUTHORITY + COMMITMENT** (who may act, who is accountable, what is promised)
→ **CAPABILITY + RESOURCES + WORK** (means and activity)
→ **EVIDENCE + VERIFICATION** (what demonstrates completion and quality)
→ **OUTCOME + VALUE** (what changed, who benefits)
→ **KNOWLEDGE** (what the next operation reuses and improves)

This is **aligned with** the existing eight-stage production grammar
(Intake, Diagnose, Compose, Authorise, Produce, Inspect, Settle, Learn), not a
one-to-one mapping: Acceptance and Settlement stay separate gates (charter A6) and are
*not* collapsed into "OUTCOME + VALUE" — they are the acts that determine whether an
outcome is admitted and whether value transfers. The unit is the canonical object
exchanged between modules. The cycle may branch, repeat, fail, be disputed or be
reversed; it is a grammar, not a mandatory pipeline.

---

## 4. Four doctrines

**A. Agency sovereignty.** People are participants, not inventory. Each person controls
their permitted participation, representation, personal records and delegation of
authority, subject to legitimate legal obligations. Every organisation knows which
records it controls, which it accesses, and which it is responsible for maintaining.
Communities govern shared knowledge.

**B. Proof pluralism.** Useful knowledge is not confined to formal education, academic
publication, Western credentials, government databases or corporate records. A farmer's
demonstrated competence, a craftsperson's technique, a community's ecological
observation, a professional's certification and a laboratory's measurement are all
representable — with distinct, not flattened, verification status. Provenance, method of
observation, attesting party, verification level, context, limitations, contradictory
evidence and right of challenge are preserved.

**C. Value circulation.** Attribution and distribution are explicit. Who contributed
what, which rights apply, what benefit was created and how it is allocated under
agreement and law are first-class records. Value does not silently flow to whoever owns
the software.

**D. Institutional legibility.** Institutions can understand and demonstrate their own
functioning: why a process exists, under what authority, who is responsible, where it is
delayed, what was delivered, who benefited, on what evidence, and with what recourse.
Not anti-government — inspection-capable government and industry.

---

## 5. Seven sovereignty invariants

1. **Data portability** — participants obtain their records in usable, machine-readable form.
2. **Scoped permissions** — access is purpose-specific, time-bounded where appropriate, auditable, revocable where legally possible.
3. **Provenance preservation** — knowledge, work and contributions retain origin and attribution.
4. **Federated authority** — APT-LABS acquires no automatic ownership or decision power over institutions and communities it connects.
5. **Transparent value allocation** — economic entitlements and benefit-sharing are explicit.
6. **Interoperability** — no participant is imprisoned by proprietary formats.
7. **Contestability** — inaccurate claims can be challenged, corrected and reviewed by a human.

These are architectural constraints, not policy statements: local storage alone is not
sovereignty; control over access, reuse, decision rights and benefit is.

---

## 6. Nine modules

Each module is one distinct user job over the same shared graph. No module owns a
private copy of the ontology.

| # | Module | Job | Route |
|---|--------|-----|-------|
| 01 | **Home** | Personal entry point: quick acts, my assignments, linked updates | `/workspace` |
| 02 | **Commons** | Discover and express demand, offers, opportunities, problems | `/workspace/commons` |
| 03 | **Network** | Actors, capabilities, resources, relationships | `/workspace/network/{people,institutions,capabilities}` |
| 04 | **Workbench** | Scope, assemble, execute and settle one productive work unit | `/workspace/workbench`, `/workspace/workbench/:pilot` |
| 05 | **Coordination** | Live coordination surface over the real store: capacity, needs, commitments in flight, evidence, audit | `/workspace/coordination` |
| 06 | **Records** | Canon / Annals / Roll lenses over durable history and provenance | `/workspace/records/{canon,annals,roll}` |
| 07 | **Intelligence** | Analysis across the graph: forecasting, analytics, pattern discovery, agent proposals | `/workspace/intelligence` |
| 08 | **School Console** | The education operating boundary — teacher/principal workflows, learner capability formation (Benben OS prototype promoted) | `/workspace/school-console` (from `/benben-os`) |
| 09 | **Kemet Coin** | Value, settlement and economic instruments — **the renamed AptCoin / Coin Lab** | `/workspace/kemet-coin` (from `/workspace/intelligence/coin-lab`) |

Module boundaries are jobs, not tables. Every module reads and writes the same records;
none may fork the ontology.

**Boundary discipline for the three contested slots**

- **Coordination vs Workbench** — Coordination is the *human* live surface over the shared
  store: post and answer needs, accept commitments, watch evidence and audit. It is
  plural and cross-project. Workbench is *one scoped work unit* from brief to settlement.
- **Matching lives in Coordination** (the live need↔capacity decision surface, backed by
  `src/lib/matching.ts`); Intelligence *analyses* matching outcomes and forecasts
  patterns. It does not own a second matcher.
- **Agents live in Intelligence** (analysis + proposals); Kemetos1 is the coordination
  engine that executes proposals against live work items. Neither proposes an
  institutional decision — humans decide (charter A6).
- **School Console (slot 08)** — the education boundary: capability formation from
  curriculum through assessment to verified competence. It is the same
  Proof-Carrying Work Unit as any other module, specialised for schools. The `benben-os`
  prototype supplies this surface; its name becomes **School Console**, freeing
  *Benben* as a legacy product name and avoiding any collision with Kemet Coin.
- **Kemet Coin (slot 09)** — value, settlement and economic instruments. It is a
  *conditional mechanism* over the Value primitive, never the ontology itself
  (charter A9): no assumed universal-value function, no blockchain prerequisite for
  participation.
- **Kemetos1** is therefore **not** a module: `src/modules/kemetos1/lib/coordinator.ts:3`
  states "Kemetos1 is a coordinator layer, not a destination page." It remains the
  agentic proposal engine inside Coordination/Workbench (it proposes; humans decide,
  charter A6).

---

## 7. Three proofs of superiority

Architecture claims are worthless without field evidence. APT-LABS must pass three
pilots — in Kirinyaga, on real work:

1. **Productive capacity** — a person with no formal visibility registers a real
   capability, demonstrates it, finds collaborators, accesses a resource and enters real
   work. *Measured by: verified capability converted into productive opportunity.*
2. **Institutional performance** — a public institution takes one real service or
   project from mandate through authorisation, execution, evidence, outcome and
   accountability. *Measured by: delivery time, cost, quality, transparency, citizen
   experience.*
3. **Sovereign value creation** — independent participants create value together, preserve provenance and rights, and allocate benefit transparently. *Measured by: value created, attributable, retained by legitimate contributors.*

One ontology must serve all three. If a pilot needs a new foundational model, the model
is wrong.

---

## 8. Prohibitions

1. No new foundational module per industry — primitives plus sector applications.
2. Assets ≠ productive capacity. An idle machine, an expert and a functioning team are different.
3. Credentials ≠ capabilities. Require demonstrable evidence.
4. Activity ≠ outcome. Ten thousand recorded tasks are not ten thousand problems solved.
5. AI intelligence ≠ institutional authority. Agents need explicit permissions and escalation.
6. Tokens are not the ontology. Benben/APT Coin and blockchain are optional mechanisms for specific value, identity or provenance problems.
7. No central database claiming ownership of everyone's reality.
8. No module may fork the ontology; no module may ship without its evidence surface.

---

## 9. The founding statement

APT-LABS is not built on the assumption that Africa lacks intelligence, infrastructure,
institutions or productive capacity. It is built on the possibility that much of this
already exists but is inadequately represented, coordinated, recognised and connected.

A conventional platform asks how to bring people into its system. APT-LABS asks how the
system can become useful to people who already possess something worth doing.

**Not a monopoly over people. An enduring standard that gives people and institutions
more power to produce, coordinate and retain value.**

---

## 10. Ratification checklist

**Governance**
- [ ] Decision record **B11** in `docs/decisions/`: nine-module navigation scope (supersedes charter B1 six-module scope; updates charter B3 rail icon count), plus ratification of the eleven-primitive set as the canonical vocabulary.
- [ ] Rewrite `docs/ontology.md` to this content; update `docs/domain-model.md` cross-reference.
- [ ] Record in `docs/ontology.md` the primitive↔code-family mapping (§2 note). **No family renames** — `GOVERNANCE` and `EXCHANGE` keep their names.

**Code**
- [ ] `src/modules/router.ts`: add `/workspace/school-console` (from `/benben-os`) and `/workspace/kemet-coin`; keep `/workspace/intelligence/coin-lab` and `/benben-os` as redirects.
- [ ] `src/components/AppShell.vue`: rail becomes nine entries, Kemet Coin last.
- [ ] `src/lib/studio-navigation.ts` + `src/lib/studio-navigation.test.ts`: extend `StudioContext` / `StudioModuleId` with `coordination`, `school-console`, `kemet-coin`; `intelligence:coin-lab` maps to `kemet-coin` after the rename.
- [ ] Replace `src/pages/workspace/AptCoinLab.vue` with the Kemet Coin surface; page copy must state Kemet Coin has no assumed universal-value function (charter A9) **and** must label itself a simulation/prototype wherever it does not execute a real instrument (charter A10 — no implying functionality that does not exist). `AptCoinLab.vue:9` currently calls it a "Local currency simulation"; the new copy must keep that honesty while naming the module Kemet Coin.
- [ ] Rename the visible Benben OS heading to School Console (`src/modules/benben-os/pages/Dashboard.vue`); keep the directory name and `/benben-os` redirect so existing links keep working.
- [ ] No changes required in `src/lib/ontology/*` for this decision (no family renames). If a later decision *does* rename families, the affected set is: `types.ts`, `types.test.ts`, `relationships.ts` (6 cardinality rows), `workflow.ts`, `WorkspaceOverview.vue`, `FamilyGlyph.vue`, `ontology/index.ts`.

**Naming (resolved at drafting)**
- [x] *Kemet Coin* = the Value/economic-instruments module (formerly AptCoin / Coin Lab).
- [x] *Benben OS* = the School Console surface (slot 08), renamed in the UI; the directory `src/modules/benben-os/` and `/benben-os` route stay as implementation details with a redirect.
- [x] *Kemetos1* stays an engine (inside Coordination/Workbench), not a module.

**Verification**
- [ ] `npm run build` and `npm run test:unit -- --run` pass after the module changes.
- [ ] Re-index the codebase graph after the route/navigation changes.

---

*Drafted 2026-11-21 from the Agency-to-Outcome doctrine, reconciled against
`docs/design/charter.md`, `docs/ontology.md`, `src/lib/ontology/types.ts`,
`src/lib/ontology/relationships.ts` and `src/modules/router.ts`.*
