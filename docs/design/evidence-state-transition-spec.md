# APT-LABS — Evidence State-Transition Specification

**Status:** Specification (Condition 3). Governs all evidence standing transitions
in the APT-LABS system of record. Implemented on top of `libs/ontology/src/evidence.ts`
(MATURITY × EVIDENCE_STANDING), `libs/ontology/src/events.ts` (append-only event
envelope), and `libs/ontology/src/actions.ts` (authority-gated verify action).

**Not a frontend-only concern.** Transitions are enforced by the domain/action
layer; the UI renders states and offers transitions but does not invent
enforcement.

---

## 1. Dimensions

Every evidence claim carries two independent dimensions:

| Dimension | Values | Meaning |
|-----------|--------|---------|
| **Maturity** | `planned`, `prototype`, `operational`, `retired` | Lifecycle stage of the underlying claim |
| **Evidence standing** | `unassessed`, `reported`, `supported`, `verified`, `disputed`, `rejected`, `expired` | How well the claim is supported |

Per charter A5, access classification (`public` / `participant` / `restricted`) is
**not** evidence quality. Per charter A8, standing is never averaged into a score.

---

## 2. Initial state

| Context | Maturity | Standing |
|---------|----------|----------|
| Newly recorded evidence claim | `planned` | `unassessed` |
| Evidence imported from an external record | `prototype` | `reported` |
| Evidence created via roll entry | `operational` | `reported` (pending verification) |

An evidence claim starts at `unassessed` / `planned` unless it arrives with a
pre-existing standing from a trusted source, in which case it enters at
`reported` / `prototype`.

---

## 3. Permissible states and transitions

The standing ladder is directional but **not** a simple ordinal climb. A claim may
move up (toward verified), down (toward disputed/rejected), or expire, subject to
the transition rules below.

### 3.1 Transition table

| From → To | Condition (guard) | Authorized actor | Required reason | Required supporting evidence | Audit event |
|-----------|-------------------|------------------|-----------------|------------------------------|-------------|
| `unassessed` → `reported` | Evidence record created with at least one artefact reference | Any authenticated actor | "Initial recording" | None (artefact reference suffices) | `EVIDENCE_ADDED` |
| `reported` → `supported` | At least one supporting artefact present and reviewed | Coordinator, institution, admin | "Supporting artefact reviewed" | 1+ evidence IDs (`evidenceIds`) | `EVIDENCE_ADDED` |
| `supported` → `verified` | Formal verification completed against defined criteria | Coordinator, institution, admin | "Verification complete" | Verification report/artefact | `EVIDENCE_VERIFIED` |
| `reported` → `disputed` | A credible challenge has been raised | Any authenticated actor | "Dispute: <specific grounds>" | Challenge artefact or testimony reference | `EVIDENCE_ADDED` (with dispute flag) |
| `supported` → `disputed` | New information undermines prior support | Any authenticated actor | "Dispute: <specific grounds>" | Contradicting evidence IDs | `EVIDENCE_ADDED` |
| `verified` → `disputed` | New information overturns prior verification | Coordinator, institution, admin | "Dispute: <specific grounds>" | Overturning evidence IDs | `EVIDENCE_ADDED` |
| `disputed` → `supported` | Dispute resolved in favour of original claim | Coordinator, institution, admin | "Dispute resolved" | Resolution artefact | `EVIDENCE_ADDED` |
| `disputed` → `rejected` | Dispute resolved against the claim | Coordinator, institution, admin | "Claim rejected" | Rejection rationale + evidence | `EVIDENCE_ADDED` |
| `rejected` → `reported` | New evidence re-opens the claim | Any authenticated actor | "Re-opened with new evidence" | New evidence IDs | `EVIDENCE_ADDED` |
| `verified` → `expired` | Conditions under which the claim held have changed | Coordinator, institution, admin | "Expired: <reason>" | Expiry justification | `EVENT_TYPE.ENTITY_CORRECTED` (corrective) |
| `supported` → `expired` | Conditions under which the claim held have changed | Coordinator, institution, admin | "Expired: <reason>" | Expiry justification | `EVENT_TYPE.ENTITY_CORRECTED` |
| `rejected` → `expired` | Claim is no longer relevant | Coordinator, institution, admin | "Expired: <reason>" | Expiry justification | `EVENT_TYPE.ENTITY_CORRECTED` |
| `expired` → `reported` | New circumstances revive the claim | Any authenticated actor | "Re-activated" | Revival evidence IDs | `EVIDENCE_ADDED` |

### 3.2 Transitions that are NOT permitted

- `unassessed` → `verified` (cannot skip assessment/support)
- `reported` → `verified` (must pass through supported)
- Any standing → `unassessed` (no regress to unassessed once assessed)
- `expired` → `verified` (must pass through reported/supported first)
- `disputed` → `verified` (must resolve through supported first)

### 3.3 Maturity × standing actionability matrix

| Maturity | Standing | Actionable? | Notes |
|----------|----------|-------------|-------|
| `planned` | any | No | Not yet real |
| `prototype` | `supported` | Conditional | May be actionable with conditions |
| `operational` | `verified` / `supported` | Yes | Basis for commitments and settlement |
| `operational` | `disputed` / `rejected` / `expired` | No | Not actionable until resolved |
| `retired` | any | No | Superseded |

Source: `libs/ontology/src/evidence.ts` `isActionableEvidence()` / `isVerifiedEvidence()`.

---

## 4. Dispute and resolution semantics

### 4.1 Raising a dispute

Any authenticated actor may move a claim from `reported`/`supported`/`verified`
to `disputed` by providing:
- A specific reason (free text, required)
- Supporting evidence IDs (challenge artefact, testimony, or contradicting record)

The disputed claim remains visible with its prior standing shown alongside the
dispute flag — **never silently overwritten or hidden**.

### 4.2 Resolving a dispute

Only coordinator/institution/admin may resolve:
- **Resolve in favour** → `disputed` → `supported` (or `verified` if re-verified)
- **Resolve against** → `disputed` → `rejected`

Resolution requires a resolution artefact and a reason. The original dispute
event and the resolution event are both retained in the append-only ledger.

### 4.3 Disputed state visibility

A disputed claim:
- Remains on the record (never deleted)
- Is not actionable (`isActionableEvidence()` returns false)
- Shows its prior standing plus the dispute flag in the inspector/ledger
- Blocks dependent commitments from advancing to fulfilment (gate enforcement)

---

## 5. Expiry and revision behaviour

### 5.1 Expiry

A claim may expire when the conditions under which it held have changed.
Expiry is a corrective event (`ENTITY_CORRECTED`) with:
- `correctsEventId` pointing to the original evidence event
- `correctionReason` explaining why conditions changed
- Standing set to `expired`

An expired claim:
- Is not actionable
- Remains visible with standing `expired`
- May be re-activated (`expired` → `reported`) with new evidence

### 5.2 Revision lineage

Corrections create corrective events, never silent rewrites:
- Original event: `EVENT_ID_A` (standing: `verified`)
- Corrective event: `EVENT_ID_B` with `correctsEventId: EVENT_ID_A`, standing: `expired`
- Both events retained; the ledger is append-only

The current standing is derived by replaying events in `recordedAt` order for
the subject, taking the last non-superseded standing. Superseded events remain
readable for audit.

### 5.3 Historical decisions never disappear

Per charter A4: "Records are typed, attributable, time-aware, and correctable."
Per CAPABILITY_PRESERVATION_REGISTER P6: "Append-only history guarantees — Roll
entries with hash_anchor; RollRevision (correction|restriction_change|evidence_added);
never silent rewrites."

No transition may delete or overwrite a prior event. Every state change writes a
new append-only event with `occurredAt` (when in reality) and `recordedAt`
(when entered into APT-LABS).

---

## 6. Hash verification and revision lineage

### 6.1 Hash anchor

Each evidence record may carry a `hashAnchor` (per `AptEvidence.hashAnchor` in
`libs/ontology/src/evidence.ts`). The hash is computed over the canonical
evidence JSON (`createCanonicalRollJson` / `computeHashAnchor` pattern from
`src/lib/db/roll-hash.ts`).

### 6.2 Verification

- `verifyRollEntry` recomputes the hash anchor and compares to the stored value
- Mismatch → evidence integrity compromised; flag as `disputed`
- Match → integrity intact for the covered content

### 6.3 Hash is not truth

Per charter A5: "A hash is evidence of integrity for covered content, not
evidence that the underlying claim is true." A verified hash means the content
has not been altered since recording; it does not validate the claim itself.

### 6.4 Revision lineage query

Given a subject ID, the ledger returns all events for that subject ordered by
`recordedAt`. The revision chain is:
```
EVENT_ID_1 (created) → EVENT_ID_2 (corrected, correctsEventId=EVENT_ID_1)
   → EVENT_ID_3 (corrected, correctsEventId=EVENT_ID_2)
```

The standing at any point in time is the standing of the last event up to that
time. Full lineage is always inspectable.

---

## 7. Authorization (who may transition)

| Role | May create evidence | May support | May verify | May dispute | May resolve dispute | May expire |
|------|--------------------|-------------|------------|-------------|---------------------|------------|
| Any authenticated | Yes | Yes | No | Yes | No | No |
| Coordinator | Yes | Yes | Yes | Yes | Yes | Yes |
| Institution | Yes | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes |

Source: `libs/ontology/src/actions.ts` `DEFAULT_ACTION_VALIDATIONS` (VERIFY requires
coordinator/institution/admin).

---

## 8. Audit events

Every transition writes an append-only `AptEvent`:

| Event type | Used for |
|------------|----------|
| `EVIDENCE_ADDED` | Evidence created, supported, disputed, re-opened, re-activated |
| `EVIDENCE_VERIFIED` | Formal verification (supported → verified) |
| `ENTITY_CORRECTED` | Expiry, correction (corrective event with `correctsEventId`) |

Each event carries: `eventId`, `eventType`, `subjectId`, `subjectFamily: 'EVIDENCE'`,
`actorId`, `occurredAt`, `recordedAt`, `source{system, method}`, `evidenceIds[]`,
`payload`, and for corrective events `correctsEventId` + `correctionReason`.

The caller of `DefaultActionEngine.execute()` is responsible for writing the
event to the ledger (per actions.ts: "the event is written to the ledger by the
caller"). n8n workflows (B10) or the vertical-slice UI implementation provide
that caller.

---

## 9. Enforcement boundary

The UI layer:
- Renders standing as named-state chips (never a score)
- Offers transition buttons gated by the actor's role
- Requires reason text before allowing a dispute/expiry transition
- Shows the full revision lineage on demand

The domain/action layer:
- Validates role authorization (`DefaultActionEngine.authorize()`)
- Validates transition permissibility (this spec's transition table)
- Requires evidence IDs where the table mandates them
- Builds append-only events

The persistence layer (future / n8n callback):
- Writes events append-only to the ledger
- Computes and verifies hash anchors
- Never performs silent overwrites

---

## 10. Relationship to the vertical slice (Condition 4)

The Intention → Commitment → Output/Outcome → Evidence slice implements:
- Evidence creation at the Outcome step (`EVIDENCE_ADDED`)
- Standing ladder rendered in the Inspector (named-state chips)
- Verify action (supported → verified) gated to coordinator/institution/admin
- Dispute flow (supported → disputed → resolved/rejected)
- Expiry and revision lineage visible in the Inspector history panel
- Hash anchor display where available

---

**Evidence label:** `PLANNED` — this specification describes intended behavior.
No claim here is asserted as implemented until the vertical slice is built and
browser-validated.
