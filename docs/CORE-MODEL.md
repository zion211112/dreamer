# APT-LABS — Core Model (implementation-grade synthesis)

**Authority:** derived from `docs/ontology.md` and `docs/design/charter.md`. On any conflict,
those documents win and this file changes. This file exists to resolve ambiguities the ontology
leaves open *at implementation altitude* — it adds no new doctrine.

Status: `PROPOSED` — not yet ratified. Decisions D1–D5 at the bottom need a ruling.

---

## 1. Why the structure felt incoherent

`ontology.md` contains **four progressions that are never mapped to each other**:

| Progression | Where | Count | Object |
|---|---|---|---|
| Thesis chain | `:10` | 5 | African behaviour → data → models → AI services → platforms |
| Transformation chain | `:99` | 7 | Fragmentation → … → Capability |
| Work cycle | `:103-108` | 6 | Discover … Improve |
| Production grammar | `:122-129` | 8 | Intake … Learn |

Nothing in the document states how the 7 terms, 6 steps and 8 stages correspond. Implementers
therefore picked one and invented the rest — which is exactly how a demo drifts from an ontology.
The resolution is that they live on **three different layers**:

- **Layer A — Data (nouns).** The six structures. What exists, at rest.
- **Layer B — Cycle (verbs).** The eight-stage grammar. What happens inside one undertaking.
- **Layer C — Maturity (accumulation).** The seven-term transformation chain. What improves
  *across* cycles. It is not a per-job sequence; it is the network's compounding state.

The six-step cycle is a **coarse view of Layer B** and is the only progression that is genuinely
*incomplete*: it omits any settlement stage. See §5.

---

## 2. Layer A — six structures mapped onto the 13 code families

The code declares 13 APTO families (`src/lib/ontology/types.ts`). They distribute exactly across
the six ontology structures, with no leftovers:

| Structure | Families | Note |
|---|---|---|
| **Actors** | `ACTOR` | |
| **Resources** | `RESOURCE`, `CAPABILITY`, `PLACE` | capital still unrepresented — see D2 |
| **Intentions** | `INTENTION` | |
| **Commitments** | `COMMITMENT`, `GOVERNANCE` | `GOVERNANCE` is where authority lives |
| **Activity** | `WORK`, `ACTIVITY`, `OUTPUT_OUTCOME`, `EXCHANGE` | `EXCHANGE` = settlement layer |
| **Knowledge** | `EVIDENCE`, `KNOWLEDGE` | |

Total: 1 + 3 + 1 + 2 + 4 + 2 = **13**. This mapping should be asserted in code, not left implicit.

---

## 3. Canonical distinctions — and the evidence they are not enforced

`ontology.md:84-90` is the binding list. The current code does not obey it:

- **Two `ActorType` enums exist.** `src/lib/actors.ts:16` — 15 lowercase values (`'individual'`,
  `'crew'`, …). `src/lib/ontology/types.ts:57` — 8 PascalCase values (`'Person'`, `'SoftwareAgent'`,
  no `'crew'`). Same concept, two vocabularies, no reconciliation. `VERIFIED`.
- `'Asset ≠ Resource'` is asserted while `ResourceType` contains `'Asset'`. `VERIFIED`.
- `'Person ≠ Account'` is asserted; no `Account` type exists. `VERIFIED`.
- Relationship kinds written by live code — `'HOLDS'`, `'PROVIDES'`, `'ANSWERS'`, `'MEMBER_OF'` —
  are absent from `RELATIONSHIP_KIND`, and `PersistedRelationship.kind` is an untyped `string`.
  **Nothing can catch an invalid edge.** `VERIFIED`.

**Rule for the rebuild:** a distinction that is not enforced by a validator is documentation, not
a guarantee. Every canonical distinction must map to a runtime guard or a closed union.

---

## 4. Record invariants (non-negotiable, per charter A4/A5)

1. Every record carries **both** `occurredAt` (when it happened in reality) and `recordedAt`
   (when we learned of it). Collapsing them destroys provenance.
2. Corrections are **append-only, attributable** — supersede, never rewrite.
3. Relationships are **first-class versioned records**, with a closed `kind` vocabulary and
   `status ∈ {active, inactive, superseded, terminated}`.
4. Evidence is labelled by **maturity** (`planned | prototype | operational | retired`) and
   **standing** (`unassessed … expired`) — separate axes. A hash proves integrity, never truth.
5. `Claim ≠ Evidence` and `Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement` must be
   representable as *distinct records on independently timed flows*, not collapsed fields.

---

## 5. Layer B — what each stage must emit

This is the anti-slop table. A stage that produces no record of the right family is not implemented.

| Stage | Must emit (family) | Today |
|---|---|---|
| 01 Intake | `INTENTION` | exists (`postNeed`) |
| 02 Diagnose | `INTENTION` refined + `KNOWLEDGE` | partial |
| 03 Compose | `RESOURCE`/`CAPABILITY` selection + draft `COMMITMENT` | partial |
| 04 Authorise | `COMMITMENT` + `GOVERNANCE` (approval, authorisation, mandate) | **missing** |
| 05 Produce | `WORK` + `ACTIVITY` | **missing** |
| 06 Inspect | `EVIDENCE` + `OUTPUT_OUTCOME` | exists (evidence), outcome thin |
| 07 Settle | `EXCHANGE` + `GOVERNANCE` | **missing** |
| 08 Learn | `KNOWLEDGE` + `EVIDENCE` | exists (`distillKnowledge`) |

**Finding:** the six-step cycle omits settlement entirely, and the code faithfully reproduced that
omission — `EXCHANGE` has no service, `economic-records.ts` performs no transfers and is imported
by nobody. The documentation gap and the implementation gap are the same gap. Any rebuild must
close it at the document level first, or it will be re-omitted.

---

## 6. Decisions needed before building

- **D1 — Which vocabulary is canonical?** Pick one `ActorType`. Either the PascalCase ontology set
  (with `Crew` added) or the lowercase operational set (with `Person`/`SoftwareAgent` added).
  Recommendation: ontology set + `'Crew'`; the operational set is a UI concern.
- **D2 — Is capital a Resource?** `ontology.md:76` lists capital; no family represents it.
  Options: new `FINANCIAL` family, or a `ResourceType` value. Recommend `ResourceType` first.
- **D3 — Does `PLACE` belong under Resources or is it a seventh structure?** It is the only
  `CONTEXT`-group family and sits awkwardly.
- **D4 — Is the six-step cycle retained?** It omits settlement and duplicates the grammar at lower
  fidelity. Recommendation: retire it as a *documentation* device and keep the 8-stage grammar as
  the single cycle definition.
- **D5 — `GOVERNANCE` scope.** Authority, approval, mandate and delegation all land here; define
  its records before Authorise is built, or Authorise will be faked.
