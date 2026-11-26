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

## Path ownership matrix (active Angular tree)

| Path | Owner | Notes |
|------|-------|-------|
| `libs/ontology/**` | Domain Intelligence Architect | Includes colocated specs; semantic changes require review |
| `libs/domain/**` | Domain Intelligence Architect | Provider-independent domain contracts and transitions |
| `libs/shared/state/**` | Systems & Data Architect | Shared state/repository boundaries; UI consumes this surface |
| `src/server/db/**`, `src/server/authorization.ts` | Systems & Data Architect | PostgreSQL/Drizzle schema and server authorization; migrations never applied to production without authorization |
| `src/server/**` (except DB schema/migrations and authorization contracts) | Backend & Integration Engineer | API/auth runtime; no production secrets in source |
| `src/app/features/**`, `src/app/app.routes.ts`, `src/styles.css` | Product Interface Engineer | Angular screens, routes and visual language; task-scoped |
| `src/app/auth/**` | Backend & Integration Engineer | Better Auth client/session integration; coordinate UI work via task scope |
| `n8n/**`, `scripts/**` | Backend & Integration Engineer | Optional automation/tooling; no implied production execution |
| Legacy `supabase/**` | Systems & Data Architect | Historical/legacy; not active auth/runtime; preserve unless explicitly tasked |
| `docs/domain-model.md`, `docs/ontology.md` | Domain Intelligence Architect | Ontology amendments require authorization |
| `docs/architecture.md`, `docs/STATE_MACHINES.md`, `docs/decisions/**` | Systems & Data Architect | Accepted decisions are superseded with notes, never silently rewritten |
| `docs/agents/**`, `tmp/integration/**` | Build Director | Process docs and integration scratch |
| `tmp/research/**`, `tmp/ui/**` | Task-scoped | Prefix per role, e.g. `tmp/research/domain-*.md` |
| `tests/**`, colocated specs | Behavior owner | Browser tests only when task records the path |
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
| `task_scope` | Own semantic correctness: keep kernel structures and domain entities distinct, define provider-independent types, and rule on evidence/provenance. Does not implement UI, persistence, or integrations. |
| `permitted_area` | `libs/ontology/**` and `libs/domain/**` when task-scoped; `docs/domain-model.md`; `docs/ontology.md` only for human-authorized amendments with a decision ID. |
| `protected_area` | `src/app/**`, `src/server/**`, `libs/shared/**`, migrations, external integrations, tests outside task scope, and accepted ADRs. |
| `unchanged_contracts` | Person ≠ Asset/Crew; Institution ≠ Venture; Asset ≠ Capability; Claim ≠ Evidence; AI suggestion ≠ institutional decision; no universal reputation score; provenance and evidence labels remain explicit. |
| `allowed_side_effects` | Scoped source/docs writes, local type check and targeted tests. No production/runtime state or external service changes. |
| `escalation` | A shared semantic or accepted decision must change; a new kernel family is proposed; evidence standing cannot be determined; implementation conflicts with ontology. |

---

## 3. Systems & Data Architect

| Field | Contract |
|-------|----------|
| `task_scope` | Own PostgreSQL/Drizzle data architecture, persistence boundaries, migration strategy, server authorization contracts, and technical ADRs. Does not own domain semantics or UI. |
| `permitted_area` | `src/server/db/**`, `src/server/authorization.ts`, `docs/architecture.md`, and `docs/decisions/**` for new decisions/supersession notes. |
| `protected_area` | `libs/ontology/**`, `libs/domain/**`, `src/app/features/**`, production infrastructure/data, and accepted ADR decisions outside an explicit supersession note. |
| `unchanged_contracts` | Stable identity and provenance; server-side fail-closed authorization; additive migration/recovery policy; B12 PostgreSQL + Better Auth + Drizzle; B13 shared network contract. |
| `allowed_side_effects` | Scoped source/docs writes; local type/test/build; local-only reversible migrations. No production DB writes or infrastructure changes. |
| `escalation` | Data-loss/irreversible migration, production DB or infrastructure change, new storage/dependency, contract break, or conflict with accepted ADR/ontology. |

---

## 4. Product Interface Engineer

| Field | Contract |
|-------|----------|
| `task_scope` | Own the active Angular workspace interface: build and repair routes, standalone components, interaction states, accessibility, and the Structural Emergence design language. Does not change domain types, persistence, or server behavior. |
| `permitted_area` | `src/app/features/**`; `src/app/auth/**` only for client presentation/integration; `src/app/app.routes.ts` when task-scoped; `src/styles.css`; colocated UI tests. `tests/**` only when the task records that path. |
| `protected_area` | `libs/ontology/**`, `libs/domain/**`, `libs/shared/state/**`, `src/server/**`, database migrations, production credentials, `docs/decisions/**`, accepted ADRs outside an explicitly scoped supersession note. |
| `unchanged_contracts` | Current charter decisions including B13; Structural Emergence and B5 design tests; B6 page-head hierarchy; fail-closed Better Auth prototype; existing working routes remain reachable; client code never owns authorization. |
| `allowed_side_effects` | File writes only inside `permitted_area`; local dev server, build, type check, and test runs; screenshots and visual artifacts under `tmp/ui/`. No analytics, external calls, or user-data mutation. |
| `escalation` | A new route, experience, shell pane, or navigation system; a new UI dependency; a design decision outside active charter decisions; a change to a shared component other owners depend on; a missing API or domain contract; an accessibility or contrast failure that needs a token change. |

---

## 5. Backend & Integration Engineer

| Field | Contract |
|-------|----------|
| `task_scope` | Own server/API/auth runtime behavior and optional external adapters against existing domain and data contracts. Does not change domain semantics or UI. |
| `permitted_area` | Task-scoped `src/server/**` excluding data schema/migrations and authorization contract; `n8n/**` and `scripts/**` where explicitly assigned; related tests only when recorded. |
| `protected_area` | `libs/ontology/**`, `libs/domain/**`, `libs/shared/state/**`, `src/app/features/**`, database migrations, production secrets and infrastructure, accepted ADR decisions. |
| `unchanged_contracts` | Better Auth server owns session resolution; domain remains provider-independent; deny-by-default authorization; no secrets in source; AI/n8n are optional and never authoritative. |
| `allowed_side_effects` | Scoped source writes and local service/test runs. No production data/service calls, deployment, push, or infrastructure changes. |
| `escalation` | A secret/live endpoint, schema/migration, new dependency/service, production change, data-loss risk, or domain/storage contract conflict is required. |

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
