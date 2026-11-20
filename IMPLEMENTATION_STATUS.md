# APT-LABS — Implementation Status

Tracks progress against the 7-gate execution order from the Master Implementation
Directive. Updated after each gate increment.

Last updated: 2026-11-20

## Gate 0 — Discover and Preserve ✅

Audit the existing codebase before touching it. Stack, routes, pages, components,
auth, ontology, design tokens, and tests all inventoried. No reinvention: new work
builds on the existing Vue 3 + Pinia + Supabase/demo stack and the 13-family
APTO ontology in `src/lib/ontology/`.

## Gate 1 — Foundations ✅ (complete)

| Item | Status | Location |
|---|---|---|
| Identity (Supabase + demo) | ✅ done | `src/lib/auth/`, `src/lib/supabase/` |
| Multi-Actor model | ✅ done + tests | `src/lib/actors.ts` |
| Authorization layer | ✅ done + tests | `src/lib/authz.ts` |
| Record envelopes | ✅ done + tests | `src/lib/record-envelope.ts` |
| Relationship store (DB relationships) | ✅ done + tests | `src/lib/relationship-store.ts` |
| Audit event log | ✅ done + tests | `src/lib/audit.ts` |
| Storage abstraction (browser/localStorage ⇄ node/memory) | ✅ done | `src/lib/storage.ts` |
| Coordination journey (need → commitment → fulfilment) | ✅ done + tests | `src/lib/commitment-journey.ts` |
| File / asset permissions | ✅ done + tests | `src/lib/asset-registry.ts` |
| Identity: verify, recovery, account settings | ✅ done + tests | `src/lib/identity.ts` |

**Verification:** `tsc --noEmit` clean. `vitest run` green (268 tests, 28 files).

Design notes for Gate 1:
- Corrections are append-only everywhere: records are *superseded* (a new version
  that references the old), relationships are *terminated* (kept and marked), audit
  is an append-only ledger with supersession. No silent rewrites.
- Every record/relationship mutation is gated by the permission layer when an
  `AuthzContext` is supplied and logged to the audit log. This is where "the
  permissions hold."
- `PLATFORM_PERMISSIONS.authenticated` carries platform-level defaults only;
  actor-scoped access comes from the account's role inside a selected actor.
- **Asset permissions:** assets are the `RESOURCE` family, governed by the
  `resource:*` permission family. The asset registry is the boundary — it gates
  itself on `resource:write`/`resource:admin` and owns a first-class `HOLDS`
  ownership edge, so assets are actor-scoped and never bare foreign keys.
- **Identity flows:** an account's identity is its own versioned, provenance-
  carrying store (distinct `account.*` audit actions), tracking *verification
  state* and *settings* the platform owns. Recovery is a real one-time, expiring
  token lifecycle; demo mode returns the token directly instead of sending a
  fake email (the credential backend applies the secret in production).

## Gate 2 — Productive Entry 🟢 (core done)

Onboarding, Commons, Build Briefs, resource registration, asset ingestion.

| Item | Status | Location |
|---|---|---|
| Capability registry (what an actor can do) | ✅ done + tests | `src/lib/capability-registry.ts` |
| Productive entry / onboarding journey | ✅ done + tests | `src/lib/onboarding-journey.ts` |
| Commons surface (posted needs + matching) | ✅ done | `src/pages/workspace/Commons.vue` |

An actor entering the platform now registers a complete productive profile —
who they are, what they *have* (assets), what they can *do* (capabilities) —
as one audited, permission-gated flow. That profile is the discoverable unit
every later gate builds on.

## Gate 3 — Coordination 🟢 (matching done)

Network, Workbench, opportunities, collaboration, commitments.

| Item | Status | Location |
|---|---|---|
| Commitment journey (need → commitment → fulfilment) | ✅ done + tests | `src/lib/commitment-journey.ts` |
| Coordination matching (reveals what is missing) | ✅ done + tests | `src/lib/matching.ts` |
| **Coordination Workbench** (the transcendent unified view) | ✅ done | `src/pages/workspace/Coordination.vue` + `src/stores/coordination.ts` |
| Per-module surfaces (Network / People / Institutions / Commons / Records / Intelligence) | ✅ done | `src/pages/workspace/{Network,People,Institutions,Commons,Records}.vue` + `src/modules/intelligence/pages/Intelligence.vue`, driven by the real `src/lib/*` modules via `src/stores/network.ts` — no mock data |

The matching engine answers, per open need, *which registered providers can
answer it and which cannot* — declarative (needs name the capability
categories they require; a provider matches by offering one), so the result is
inspectable and trustworthy, not opaque. `findMissingNeeds` is the concrete,
actionable "what has not been built yet" surface.

The **Coordination Workbench** (`src/pages/workspace/Coordination.vue`, driven
by the real-integration layer `src/stores/coordination.ts`) composes the whole
loop into one view: System state → Open needs / In flight / Capacity →
Onboard a provider / Post a need / Evidence / Audit trail. It drives the actual
coordination modules — `actors`, `onboarding-journey`, `commitment-journey`,
`matching`, `evidence-store`, `record-envelope`, `audit` — with no mock data:
seeding through the real UI writes real records, matching reads them back, and
every mutation lands in the audit ledger. Better Design review complete:
`get-review-rules`, `check-comprehension` (0 findings, both panels),
`review-dashboard-structure` (NOT APPLICABLE — one-file HTML), and
`inspect-spacing` (0 critical / 0 serious; 19 moderate off-scale micro-paddings
left as-is).

**Per-module surfaces, review complete.** All six pages render from the real
`src/lib/*` coordination modules (network store, matching, record envelopes,
audit, evidence, intelligence lib) through `src/stores/network.ts` — no mock
data. Better Design step 4 finished on all six at 1440 and 390:
`check-comprehension` passed every panel; `inspect-spacing` final scores:

| Surface | 1440 | 390 |
|---|---|---|
| Network | 90 | 90 |
| People | 90 | 90 |
| Institutions | 90 | 90 |
| Commons | 90 | 90 |
| Records | 95 | 95 |
| Intelligence | 95 | 95 |

Zero critical / zero serious across all twelve measurements. Fixes this round:
Records `overflow-wrap: break-word` + `.records-list { overflow-x: auto }`
containing scroll (390 viewport-overflow cleared → 95); Commons 44px touch
targets; Intelligence panel intros set on a 72px min-height floor so all three
cards align, with sibling gaps uniform at 8px (the auto-margin pin that
briefly regressed this was removed → 1440/390 both 95). The remaining
moderate off-scale tells are documented adjudications, not defects: 36px is
the shared app-shell token convention (`--apt-spacing-s13`), 2/6px are
intentional chip/pill micro-spacing, 72px is the Intelligence intro floor.
Visual approval via seeded screenshots under `.bd-check` (`shot-*.png`,
`drive-surface.mjs`).

## Gate 4 — Memory and Intelligence ✅ (complete)

Records, evidence, outcomes, knowledge, search, matching.

| Item | Status | Location |
|---|---|---|
| Coordination matching (reveals what is missing) | ✅ done + tests | `src/lib/matching.ts` |
| EVIDENCE store (files/documents backing records) | ✅ done + tests | `src/lib/evidence-store.ts` |
| KNOWLEDGE records | ✅ done + tests | `src/lib/knowledge-store.ts` |
| Record search | ✅ done + tests | `src/lib/record-search.ts` |

Matching is already delivered through the Gate 3 bridge (`src/lib/matching.ts`),
reading real need records and capability profiles. The evidence store
(`src/lib/evidence-store.ts`) makes "preserves what becomes known" concrete: a
piece of evidence is an EVIDENCE-family record with a `sourceUri` pointer to
where the bytes live, attaches to the records it supports through the
envelope's `evidenceIds` (never a bare link), and carries a trust transition
(`markEvidenceVerified`) gated to `evidence:admin` and logged as
`evidence.verify`. Files are governed by the `evidence:*` family,
actor-scoped and attributable — no fake storage integration. The evidence store
is now surfaced inside the Coordination Workbench ("Evidence" panel: add
evidence, attach to an in-flight outcome, verify) via `src/stores/coordination.ts`.

The **knowledge store** (`src/lib/knowledge-store.ts`) makes "preserves what
becomes known" concrete: a knowledge record (Method, Protocol, Standard,
Finding, Lesson, …) is a first-class KNOWLEDGE-family envelope — versioned,
attributable, corrected by supersession. It is created `proposed` and earns
`confirmed` through `markKnowledgeConfirmed`, the trust transition gated to
`knowledge:admin` and logged as `knowledge.update` (mirroring how evidence
earns `verified`). `distillKnowledge` is the bridge from the Roll into the
envelope store: an *accepted* outcome becomes a persistent, searchable Lesson
record with a `derivedFrom` pointer back to the entry — unaccepted or unknown
outcomes yield nothing, and distilling twice returns the same record.
**Record search** (`src/lib/record-search.ts`) queries the same persisted
envelopes across all 13 families (plus the audit ledger): case-insensitive,
and every hit reports *which fields it matched on*, so a search result is
inspectable, not an opaque score.

**Gate 4 UI increment — delivered surfaces.** Records search input padding is
symmetric (`var(--apt-spacing-s3) var(--apt-spacing-s6)`) with an opaque 44px
clear button; the Coordination Knowledge panel wraps `.ev-id` so family/source
chips no longer collide with status chips, and every grid track clamps via
`minmax(0, 1fr)` so nothing escapes at 390px.

**Better Design step 4:** 0 critical / 0 serious on all four surfaces — Records
search box 100 @1440 & 390; Coordination Knowledge panel 90 @1440 & 390 (the 2
moderate findings are 59x28px desktop Confirm buttons, adjudicated as pointer
targets; the ≤640px media rule enforces 44px, verified 59x44 at 390). `tsc
--noEmit` clean. `vitest run` green (318 tests, 34 files).

## Gate 5 — Trust and Minting ⬜

Issuer management, credential schemas, signing, verification.

## Gate 6 — Economic Readiness ⬜

Value records, budgets, APTCOIN architecture.

## Gate 7 — Operations and Launch ⬜

Security audit, end-to-end journeys, deployment.
