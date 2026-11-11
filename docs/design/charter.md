# APT-LABS — Constitution and Charter

**Captured and refounded, 2026-11-10.** This document governs APT-LABS design and architecture work. It is organised into four conceptual layers: enduring constitutional principles (A), mutable product and design decisions (B), engineering and working discipline (C), and active assignments (D). Principles endure; decisions evolve; instructions remain scoped.

---

## A. Enduring Constitutional Principles

These are foundational principles, not arbitrary implementation prohibitions. They give APT-LABS its identity and do not change without explicit constitutional amendment.

### A1. Product purpose

APT-LABS is infrastructure for making fragmented productive capacity visible, connectable, governable, locally retained, and cumulative. It makes relationships between people, crews, institutions, assets, skills, needs, opportunities, work, and evidence legible and actionable.

The underlying progression:

**Reality → structured records → relationships → coordinated work → verified outcomes → reusable intelligence → economic value.**

APT-LABS is not fundamentally a social network, conventional job board, generic marketplace, collection of institutional dashboards, blockchain or SBT product, generic project-management application, or AI chatbot with business-themed screens. Those may describe isolated features or distribution channels. None describes the core.

### A2. Productive cooperation and local capacity

The workspace organises productive cooperation. People must remain agents, not be reduced to assets, scores, or inventory. Local capability should accumulate rather than disappear into an external platform. African productive capacity should become visible without being extracted from its owners.

### A3. Canonical entity distinctions

The foundational entities are Person, Crew, Institution, Venture, Asset, Capability, Opportunity, Work, Evidence, and Economic Instruments. These remain meaningfully distinct:

- **Person ≠ Asset:** a person is an individual with agency, not a resource.
- Relationships do not automatically establish ownership or authority.
- A crew performs work; an institution commissions or authorises work; work requires capabilities and uses assets; evidence substantiates delivery.

### A4. Record integrity and provenance

Records are typed, attributable, time-aware, and correctable. Claims do not automatically become facts. The Roll preserves successful and unsuccessful outcomes, supporting correction, contestability, partial outcomes, failure, and cancellation.

### A5. Evidence versus claims

Evidence matters more than claims, badges, or popularity. Credentials attest to bounded claims under defined issuers and conditions. A hash is evidence of integrity for covered content, not evidence that the underlying claim is true. Public, participant, and restricted refer to access classifications, not levels of evidence quality.

### A6. Authority distinctions

Never silently equate:

- Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement
- Recommendation ≠ Approval
- AI suggestion ≠ institutional decision

The system must show who has authority at each stage of the economic flow: Need → discovery → capability matching → work definition → review → authorization → execution → evidence → acceptance → settlement → learning.

### A7. Independently timed flows

Delivery, financial obligation and settlement, and contribution attribution and recognition proceed on independently timed flows. They connect through an undertaking reference but do not inherit one another's statuses. A rejected undertaking may still contain valid contributions. Accepted work may remain unpaid. A payment may occur before final acceptance under agreed terms.

### A8. Participant autonomy, privacy, portability, and fair attribution

Trust is contextual. Never invent a universal reputation score that collapses different forms of trust into one number. Preserve issuer accountability, provenance, consent and permissions, correction and dispute mechanisms, revocation and expiry, portability and interoperability, privacy and data minimization. Never place sensitive personal information on a public blockchain. Never make blockchain ownership a prerequisite for participating in productive work.

### A9. Value plurality

Contribution is distinct from acceptance and compensation. Contribution is distinct from monetary worth. Economic instruments and tokens are conditional, separately governed mechanisms — APT Coin has no assumed purpose or universal-value function.

### A10. Honest representation

Representations must not imply functionality or evidence that does not exist. No fake functionality, no invented data presented as real, no demo disclaimer theater.

---

## B. Mutable Product and Design Decisions

These are reasoned, revisable decisions. Each carries a decision identifier, date, rationale, scope, status, dependencies, and supersession history. A decision may be binding for a particular release but is not an eternal product principle.

### B1. Five-module navigation scope

| Field | Value |
|-------|-------|
| Decision ID | B1 |
| Date | 2026-11-10 |
| Rationale | One workspace, one shared graph, five distinct user jobs (Commons, Network, Workbench, Records, Intelligence) |
| Scope | Module structure and navigation |
| Status | Active |
| Dependencies | None |
| Supersedes | charter §4 "Hard navigation constraints" (permanent bans converted to revisable decision) |

The five modules are Commons, Network, Workbench, Records, Intelligence. School Console remains a nested operational boundary under Workbench, not a primary module. No sixth primary module unless a genuinely independent user job cannot fit into the five.

### B2. Main/Branch prohibition

| Field | Value |
|-------|-------|
| Decision ID | B2 |
| Date | 2026-11-10 |
| Rationale | A branch is a change-set or proposed state, not a separate workspace |
| Scope | Shell navigation |
| Status | Active |
| Dependencies | None |
| Supersedes | User ruling #1 on v1 memo (2026-11-05) |

No Main/Branch workspace modes. The fork glyph (└─) may remain as an identity element in proposed-state contexts only.

### B3. Shell pane ownership

| Field | Value |
|-------|-------|
| Decision ID | B3 |
| Date | 2026-11-10 |
| Rationale | Each shell pane has one job; no duplicate navigation systems |
| Scope | Shell layout (topbar, rail, sidebar, main, inspector, dock, statusbar) |
| Status | Active |
| Dependencies | None |
| Supersedes | Fixed panel and shell assumptions from prior direction memos |

Topbar: working-context identity. Rail: module switching (exactly five icons). Sidebar: within-module context only. Main: work surface. Inspector: contextual, opens on selection. Dock: contextual per-module change-set/evidence strip. Statusbar: single boundary line + ledger head state.

### B4. Visual design direction

| Field | Value |
|-------|-------|
| Decision ID | B4 |
| Date | 2026-11-11 |
| Rationale | Structural Emergence Design Constitution supersedes Signature Dark Instrument |
| Scope | Visual system (tokens, typography, layout, devices) |
| Status | Active |
| Dependencies | None |
| Supersedes | Prior B4 "Signature Dark Instrument" (2026-11-10); Light Luxury default in APT-LABS-SYSTEM.md §7 |

Active design language: **Structural Emergence** — warm ivory base, earthy neutrals, restrained sage, deep forest/ink, selective lilac/peach accents. Editorial serif for record names; precise operational sans/mono for interface and readouts. Six emergence operations guide visual hierarchy and interaction:

1. **Indeterminacy** — clean, spacious field.
2. **Differentiation** — clear boundaries and hierarchy.
3. **Polarity** — meaningful relationships exposed.
4. **Recursion** — feedback, iteration, self-reference.
5. **Identity** — persistent, coherent structures.
6. **Emergence** — whole system greater than individual components.

Hard anti-patterns (no exception): generic SaaS dashboards, endless card grids, decorative gradients/glows, unnecessary glassmorphism, arbitrary rounded corners, fake spatial depth, unexplained visual metaphors, excessive animation, decorative graphs without operational meaning, beautiful screens with incomplete functionality.

Quality standard: every visual decision must have a structural or experiential reason. Every interaction must have a clear consequence. Every complex workflow must have an understandable entry point, progression, feedback, and completion state. The finished product should feel precise, warm, intelligent, quietly monumental, and unmistakably original.

### B5. Anti-slop converted to design tests

| Field | Value |
|-------|-------|
| Decision ID | B5 |
| Date | 2026-11-10 |
| Rationale | Do not ban a component merely because it can be misused. Do not use it without a clear semantic or interaction purpose. |
| Scope | Visual design and component selection |
| Status | Active |
| Dependencies | B4 |
| Supersedes | charter §8 "Anti-slop rules" (permanent bans) |

Former anti-slop items (gradient washes, rounded-card kits, all-caps eyebrows, arbitrary micro-labels, generic AI dashboard layouts, unnecessary animation, motion without user action, decorative metrics, fake functionality) are converted into design tests: each pattern must achieve a clear semantic or interaction purpose, communicate meaning rather than decorate, and pass WCAG AA. The agent must still challenge generic, decorative, inaccessible, or misleading implementations.

### B6. Page-head hierarchy

| Field | Value |
|-------|-------|
| Decision ID | B6 |
| Date | 2026-11-10 |
| Rationale | Let information determine how much appears; consistency must not become ceremony |
| Scope | Page layout and heading structure |
| Status | Active |
| Dependencies | None |
| Supersedes | Fixed four-metric header ritual from prior direction memos |

Pattern: eyebrow (module/context, mono 8px) → h1 (record/page name, serif) → subtitle (one sentence, operational) → primary action → quiet actions → L3 metrics (only when they drive the current decision, max 3, 2px left border, first in teal).

### B7. Canon, Annals, and Roll as lenses

| Field | Value |
|-------|-------|
| Decision ID | B7 |
| Date | 2026-11-10 |
| Rationale | Canon, Annals and Roll are temporal and institutional-memory concepts, not automatically additional navigation modules |
| Scope | Records module structure |
| Status | Active |
| Dependencies | None |
| Supersedes | Separate Annals/Roll/Canon page assumptions from prior direction memos |

Canon (what is structurally recorded), Annals (what happened over time), Roll (why a claim can be substantiated) remain conceptually distinct and navigable together, presented as lenses within the Records module, not as independent navigation modules.

### B8. Build and test gates

| Field | Value |
|-------|-------|
| Decision ID | B8 |
| Date | 2026-11-10 |
| Rationale | Never break the working build; every phase leaves build and tests green before starting the next |
| Scope | Engineering practice |
| Status | Active |
| Dependencies | None |
| Supersedes | None |

`npm run build` (tsc + vite build) and `npm run test:unit -- --run` must be green before starting the next phase. Small, reversible changes preferred over broad rewrites.

---

## C. Engineering and Working Discipline

Retained and modernised:

- Read the file you are about to change — do not infer from memory.
- Understand dependencies before modifying.
- Inspect Git status and existing work before proposing changes.
- Preserve user-owned and unrelated changes.
- Make scoped, minimal changes that ship.
- Run focused tests and builds before starting the next phase.
- Report failures honestly; do not claim integration without verification.
- Avoid destructive cleanup without explicit authority.
- Record meaningful changes and validation results.

### Rewritten authorisation rule

An explicit user instruction authorises work within its stated scope. Do not ask for duplicate permission to perform clearly authorised work.

If a proposed action materially exceeds that scope, is destructive, discards existing work, or changes an unrelated product boundary, stop and obtain the necessary authority.

Do not interpret a general design discussion as authorisation for unlimited repository modification.

A direction memo is not permission to edit code. A design review is not permission to build a mockup. A request for analysis is not permission to clean the repository.

---

## D. Active Assignments

Empty. Current tasks, temporary no-edit instructions, branch-specific limitations, and implementation handoff notes belong in separate task briefs. They expire when the task closes or is superseded. No active assignment restrictions are embedded in this constitution.

---

## Document Authority Hierarchy

1. **Explicit current user decisions and approved decision records** — highest authority.
2. **APT-LABS Constitution** (this document) — enduring principles + mutable decisions.
3. **Current approved Product Direction** — active design direction.
4. **Approved domain specifications** — domain model details.
5. **Implementation references** (code, AGENTS.md, APT-LABS-SYSTEM.md) — describe what exists; do not automatically define what should exist.
6. **Design studies, experiments, archived proposals** — reference only; no authority.

Where two governing sources conflict, record the conflict and obtain or apply the most recent explicit approved decision. Do not silently choose whichever document is easiest to follow. A superseded document must not be cited as current authority without identifying the superseding decision.

---

*End of charter. Original content preserved at `docs/archive/charter.md.pre-refoundation.bak`. Git history intact.*
