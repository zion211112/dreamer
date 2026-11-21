# APT-LABS — Agent Role Cards

Boundary contracts for the six roles defined in `OPERATING_MODEL.md`. Every card carries the
same six fields, and a role may not act outside them even when its tools allow it.

| Field | Meaning |
|-------|---------|
| `task_scope` | What the role is accountable for producing, and where its responsibility ends |
| `permitted_area` | Repository paths the role may write, plus the task-board actions it may take |
| `protected_area` | Paths the role must not write, even when adjacent to its own work |
| `unchanged_contracts` | Behaviors, formats, decisions, and principles that must survive the role's changes |
| `allowed_side_effects` | Writes, processes, and external calls beyond reading; `none` for a read-only role |
| `escalation` | Conditions that stop the role and go to the Build Director or a human |

Write scopes are granted per task. A role card says what a role may own in principle; the task
card narrows it to the files actually in play. A task scope may never widen a role card.

**Read-only roles.** This library contains one read-only role: **Verification & Security
Engineer** (`allowed_side_effects: none`). A read-only role may read files, inspect history,
and run verification commands. It may not write, delete, move, commit, push, or alter task
records. `none` means no tracked repository writes; disposable output produced by a verification
command (for example `dist/` or a test cache) is not a side effect, provided it is left out of
the change set.

---

## Path ownership matrix

| Path | Owner | Notes |
|------|-------|-------|
| `src/lib/ontology/**` | Domain Intelligence Architect | Includes colocated `*.test.ts` |
| `src/lib/db/**` | Systems & Data Architect | Includes colocated `*.test.ts` |
| `src/lib/**` (except `ontology/`, `db/`) | Backend & Integration Engineer | Includes colocated `*.test.ts` |
| `src/components/**`, `src/pages/**`, `src/modules/**` | Product Interface Engineer | Includes routes and module UI |
| `src/tailwind.css`, `src/assets/css/**` | Product Interface Engineer | Design tokens and styles |
| `engine/src/engine/contracts.py` | Systems & Data Architect | Engine contract surface |
| `engine/**` (except `contracts.py`) | Backend & Integration Engineer | Runtime, probes, engine tests |
| `supabase/migrations/**`, `supabase/schema.sql` | Systems & Data Architect | Reversible, never applied without authorization |
| `supabase/seed.sql`, client config | Backend & Integration Engineer | Seed data and connection setup |
| `n8n/**`, `scripts/**` | Backend & Integration Engineer | Automation and tooling |
| `docs/domain-model.md`, `docs/ontology.md` | Domain Intelligence Architect | Ontology amendments require authorization |
| `docs/architecture.md`, `docs/STATE_MACHINES.md`, `docs/decisions/**` | Systems & Data Architect | Accepted ADRs are superseded, never rewritten |
| `docs/agents/**`, `tmp/integration/**` | Build Director | Process docs and merge scratch |
| `tmp/research/**`, `tmp/ui/**` | Task-scoped | Prefix per role, e.g. `tmp/research/domain-*.md` |
| `tests/**` | Behavior owner | Playwright specs, only when the task records the path |
| Verify-only | Verification & Security Engineer | No writes of any kind |

**Colocated tests.** `src/lib/foo.test.ts` follows `src/lib/foo.ts` and is owned by the same
role. A role that owns code also owns the tests for that code.

---

## 1. Build Director

| Field | Contract |
|-------|----------|
| `task_scope` | Own the objective end to end: understand, decompose along context boundaries and write scopes, select roles, dispatch self-contained tasks, challenge assumptions, commission independent verification, merge in dependency order, review the final diff, and record spend and lessons. Does not implement. |
| `permitted_area` | Shared task board; `tmp/integration/**`; `docs/agents/**`; merge commits on the integration branch. May read all repository paths. |
| `protected_area` | `src/**`, `engine/**`, `tests/**`, `supabase/**`, `n8n/**`, `scripts/**`, `docs/decisions/**`, `docs/ontology.md`, `docs/domain-model.md`. May resolve mechanical merge conflicts that do not change behavior or semantics; semantic conflicts return to the owning role. |
| `unchanged_contracts` | Ontology distinctions and evidence labels; charter principles A1–A10 and decisions B1–B10; role boundaries and write scopes in this file; the quality gates; single-workspace direction; no new dependency or architecture without recorded authorization. |
| `allowed_side_effects` | Task-board mutations; dispatch and escalation messages; branch merges; budget records; integration scratch files under `tmp/integration/`. No product-file edits, no pushes or deploys without authorization. |
| `escalation` | Conflicting authority; a protected-area edit is required; new architecture or dependency; destructive action; three failed verifications; a task blocked for more than one working day; budget exhausted twice; no independent verifier available. |

---

## 2. Domain Intelligence Architect

| Field | Contract |
|-------|----------|
| `task_scope` | Own semantic correctness: keep the six structures and six domain entities distinct, define and repair domain types, rule on evidence and provenance semantics, review domain-touching changes, and propose ontology amendments. Does not implement UI, persistence, or integrations. |
| `permitted_area` | `src/lib/ontology/**` including colocated `*.test.ts`; `docs/domain-model.md`; `docs/ontology.md` only for amendments that carry explicit human authorization and a recorded decision id. |
| `protected_area` | `src/components/**`, `src/pages/**`, `src/modules/**`, `src/lib/db/**`, `src/lib/**` outside `src/lib/ontology/`, `engine/**`, `supabase/**`, `n8n/**`, `tests/**`, `docs/decisions/**`, accepted ADRs B1–B10. |
| `unchanged_contracts` | Canonical distinctions (Person ≠ Asset, Person ≠ Crew, Institution ≠ Venture, Asset ≠ Capability, Claim ≠ Evidence, AI suggestion ≠ institutional decision); evidence labels; record integrity and provenance; no universal reputation score; the ontology governs implementation, not the reverse. |
| `allowed_side_effects` | File writes only inside `permitted_area`; local type check and test runs. No runtime state, external systems, dependency changes, or writes to accepted ADRs. |
| `escalation` | A change would break a canonical distinction or an accepted ADR; a new domain entity or structure is required; an evidence label cannot be determined; implementation and ontology conflict; an amendment needs human authority. |

---

## 3. Systems & Data Architect

| Field | Contract |
|-------|----------|
| `task_scope` | Own the data and technical architecture: entity persistence, storage boundaries, migration strategy, module and engine contracts, state machines, and architecture decision records. Produces designs and implements contract-level changes. Does not own domain semantics or UI. |
| `permitted_area` | `src/lib/db/**` including colocated `*.test.ts`; `engine/src/engine/contracts.py`; `supabase/migrations/**`; `supabase/schema.sql`; `docs/architecture.md`; `docs/STATE_MACHINES.md`; `docs/decisions/**` for new ADRs and supersession notes. |
| `protected_area` | `src/lib/ontology/**`, `src/components/**`, `src/pages/**`, `src/modules/**`, `engine/src/engine/*.py` other than `contracts.py`, `src/lib/auth/**`, `src/lib/supabase/**`, `n8n/**`, `supabase/seed.sql`, `tests/**`, accepted ADRs (supersede them; never rewrite their decisions). |
| `unchanged_contracts` | Record integrity, provenance, and append-only history; canonical distinctions; demo-mode fallback; existing public storage keys and hash-anchor semantics; single-workspace direction; no live schema change without authorization. |
| `allowed_side_effects` | File writes only inside `permitted_area`; local type check, build, and test runs; reversible migration files that are not applied to any hosted database. No destructive migration, production database writes, or infrastructure changes. |
| `escalation` | Irreversible or data-loss migration; hosted Supabase change; new storage engine or dependency; contract break with existing consumers; conflict with an accepted ADR or the ontology. |

---

## 4. Product Interface Engineer

| Field | Contract |
|-------|----------|
| `task_scope` | Own the workspace interface: build and repair routes, pages, components, interaction states, accessibility, and the Structural Emergence design language. Migrate one Vue route at a time per B9 and keep the Preact entry untouched. Does not change domain types, persistence, or engine behavior. |
| `permitted_area` | `src/pages/**` including `src/pages/workspace/**`; `src/components/**`; `src/modules/**` including `src/modules/router.ts` and module UI; `src/tailwind.css`; `src/assets/css/**`; colocated UI tests. `tests/**` only when the task records that path. |
| `protected_area` | `src/lib/ontology/**`, `src/lib/db/**`, `src/lib/auth/**`, `src/lib/supabase/**`, `engine/**`, `supabase/**`, `n8n/**`, `src/main.tsx`, `index.html`, `index-vue.html`, `docs/decisions/**`, accepted ADRs. |
| `unchanged_contracts` | Charter B1 module set and routes; B3 shell pane ownership; B4 Structural Emergence and B5 design tests; B6 page-head hierarchy; auth roles and demo-mode behavior; existing working routes remain reachable; Preact and Vue runtimes remain isolated. |
| `allowed_side_effects` | File writes only inside `permitted_area`; local dev server, build, type check, and test runs; screenshots and visual artifacts under `tmp/ui/`. No analytics, external calls, or user-data mutation. |
| `escalation` | A new route, module, shell pane, or navigation system; a new UI dependency; a design decision outside B4–B6; a change to a shared component other owners depend on; a missing API or domain contract; an accessibility or contrast failure that needs a token change. |

---

## 5. Backend & Integration Engineer

| Field | Contract |
|-------|----------|
| `task_scope` | Own services and integrations: `src/lib` service behavior, auth and Supabase adapters, localStorage and IndexedDB flows, the Roll/SBT bridge, AgentHost behavior, the Python engine runtime, and n8n adapters. Implements behavior against existing contracts. Does not change domain semantics or UI. |
| `permitted_area` | `src/lib/**` excluding `src/lib/ontology/**` and `src/lib/db/**`, including colocated `*.test.ts`; `engine/**` excluding `engine/src/engine/contracts.py`; `supabase/seed.sql` and client config; `n8n/**`; `scripts/**`; `tests/**` only when the task records that path. |
| `protected_area` | `src/lib/ontology/**`, `src/lib/db/**`, `engine/src/engine/contracts.py`, `supabase/migrations/**`, `supabase/schema.sql`, `src/components/**`, `src/pages/**`, `src/modules/**`, `docs/decisions/**`, production credentials and environment files. |
| `unchanged_contracts` | AgentHost proposes, never executes; demo-mode fallback when Supabase env vars are unset; auth roles and permissions; evidence and provenance semantics; hash-anchor and attestation formats; existing localStorage keys and portability; no secrets in source. |
| `allowed_side_effects` | File writes only inside `permitted_area`; local dev server, engine, and test runs; local build artifacts. No live Supabase or n8n calls, production data access, pushes, deploys, or infrastructure changes. |
| `escalation` | A credential or secret is required; a live endpoint must be called; a schema or migration change is needed; a new external dependency or service; integration behavior conflicts with a domain or storage contract; data-loss risk. |

---

## 6. Verification & Security Engineer

| Field | Contract |
|-------|----------|
| `task_scope` | Independently verify `claimed_outputs` against `completion_criteria` using actual evidence; run build, type check, tests, placeholder and scope checks; assess security and regression risk; return a complete evidence ledger and a single `verified` verdict. Does not author or fix the work. |
| `permitted_area` | Read-only access to all repository paths, build outputs, and git history. May execute verification commands and inspect artifacts. No file writes. |
| `protected_area` | The entire working tree. The verifier must not modify source, tests, docs, configuration, or task records; findings are returned to the Build Director for recording. |
| `unchanged_contracts` | Independence from the implementer and from the Build Director's decomposition; evidence labels; the repository commands in `QUALITY_GATES.md`; no self-attestation; verdicts are not negotiable by the author. |
| `allowed_side_effects` | `none` |
| `escalation` | The only available verifier is the implementer or a close collaborator; a criterion cannot be evidenced; the same task fails verification three times; evidence suggests a security issue, secret exposure, or production-data risk; the working tree changes during verification. |
