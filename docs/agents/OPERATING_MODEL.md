# APT-LABS — Agent Operating Model

How agent work is structured in this repository: the six roles, how the Build Director
decomposes and dispatches work, how workers are isolated, and what each task may spend.

This document is subordinate to `docs/design/charter.md` and `docs/ontology.md`. Mechanical
repository rules live in `AGENTS.md`, role boundaries in `ROLE_CARDS.md`, and acceptance in
`QUALITY_GATES.md`. None of those documents override the charter.

---

## 1. What the work serves

APT-LABS is an operating and economic network for productive activity. Agent work exists to
connect real-world capacity, work, institutions, evidence, and reusable knowledge — not to
produce screens, demos, or documents that merely resemble that network.

Every task names the conceptual structures and domain entities it touches:

- **Structures:** Actors, Resources, Intentions, Commitments, Activity, Knowledge.
- **Entities:** Person, Crew, Asset, Work, Institution, Evidence.

A task that cannot name them is not yet understood. A task that collapses them — person into
asset, institution into venture, claim into evidence — is mis-specified and returns to
decomposition.

| Invariant | Consequence for agent work |
|-----------|----------------------------|
| **Operating and economic network for productive activity** | Work must increase the network's capacity to create, coordinate, retain, and multiply real economic value. Feature volume is not the measure. |
| **Six structures, six domain entities** | Tasks name what they change and preserve the canonical distinctions. Person ≠ Asset; Person ≠ Crew; Institution ≠ Venture; Asset ≠ Capability; Claim ≠ Evidence; AI suggestion ≠ institutional decision. |
| **Evidence before certainty** | Every claim in a task report, artifact, or status carries one label: `VERIFIED`, `PROTOTYPE`, `TARGET`, `PLANNED`, or `UNKNOWN`. |
| **Single-workspace product direction** | One workspace, one shared graph. No new primary module, route, shell pane, or navigation system without a recorded decision (charter B1, B3). |
| **Preserve existing implementation** | Working functionality is not deleted, rewritten, or silently replaced. Replacement requires a task, a migration note, and independent verification. |
| **Never invent features** | `TARGET` and `PLANNED` work is never described as delivered. Demo data is labelled as demo data. |
| **No new architecture or dependencies without demonstrated need** | A new dependency, storage engine, service boundary, or runtime requires demonstrated need, a recorded decision, and human authorization. |
| **Honest representation** | No fake functionality, no invented data presented as real, no unverified status. |

---

## 2. Team structure

Six roles. Five produce or integrate work; one verifies it independently. The Build Director
orchestrates and does not implement.

| Role | Mandate | Produces | Does not |
|------|---------|----------|----------|
| **Build Director** (orchestrator) | Own the objective, the decomposition, the shared state, and the integrated result | Task graph, dispatch briefs, integration commits, final diff review, budget record | Write product code, tests, schemas, or design documents; substitute self-review for independent verification |
| **Domain Intelligence Architect** | Own semantic fidelity to the ontology and the evidence model | Domain types, ontology and domain-model amendments, canonical distinction rulings, domain ADR proposals | Touch UI, storage, integrations, or accepted ADRs unilaterally |
| **Systems & Data Architect** | Own data model, persistence boundaries, module contracts, and technical decisions | Data and storage changes, architecture and state-machine docs, ADRs, migration notes | Change domain semantics, UI, or production infrastructure |
| **Product Interface Engineer** | Own the workspace interface: routes, components, design language, accessibility | Vue/Preact pages and components, styles, interaction states, UI tests, screenshots | Change domain types, persistence, engine contracts, or the Preact entry during Vue migration |
| **Backend & Integration Engineer** | Own services, persistence flows, engine behavior, and external integration adapters | `src/lib` services, Python engine code, Supabase/n8n adapters, integration tests | Change UI, ontology semantics, or live infrastructure without authorization |
| **Verification & Security Engineer** | Independently establish whether claimed work meets its criteria | Evidence ledger, pass/fail verdicts, security and regression findings | Modify the working tree, fix defects, or verify work it authored or helped author |

Role boundaries are contracts, not job descriptions. The exact fields and path scopes for each
role are in `ROLE_CARDS.md`.

### The Build Director does not implement

The Build Director's output is coordinated work, not code. Its hands-on actions are limited to:

1. Creating, claiming, assigning, and completing shared tasks.
2. Writing dispatch briefs and acceptance criteria.
3. Recording write scopes, dependencies, and budgets on the task board.
4. Merging worker branches in dependency order and resolving only mechanical conflicts.
5. Re-running build and tests on the merged tree.
6. Reviewing the final diff for scope compliance and integration correctness.
7. Recording outcomes, spend, and reusable lessons.

If the Build Director finds itself editing a product file, the decomposition failed. It should
create a task for the owning role instead.

**Self-review is not verification.** The Build Director reviews the integration for coherence,
scope, and completeness. That review never produces a `VERIFIED` label; only an independent
verifier can do that.

---

## 3. The decomposition invariant

> **Decompose by context boundary and write scope, not by role type alone.**

Splitting work purely by role type — "frontend task", "backend task", "test task" — creates a
telephone game. Each handoff re-explains context the previous worker already held, and fidelity
drops at every hop. A sub-agent that constantly needs another worker's in-context state is not
a worker; it is a remote control for the Build Director's memory.

Each dispatch unit must satisfy all four conditions:

- **Fresh-context completable.** The brief, the task card, and the referenced repository files
  are sufficient. The worker does not need the Build Director's reasoning, chat history, or
  another worker's unsent state.
- **Bounded write scope.** The worker can name every file it may create or change before it
  starts. Scopes are disjoint from every concurrently running task.
- **Independently acceptable.** The result can be judged against explicit criteria without
  reconstructing the worker's intent.
- **Single-layer enough to verify.** The unit produces one reviewable artifact, not a
  cross-cutting change that only its author can assess.

**Bad-split tests.** A decomposition is wrong when:

- Two workers write the same file, directory prefix, or shared type.
- A worker cannot finish without asking another worker for a value, decision, or partial output.
- Acceptance depends on conversation history rather than the task card.
- The unit mixes semantic definition, persistence, interface, and verification in one task.
- The task title is a role ("frontend work") rather than a bounded change ("add the Commons
  signal detail route with empty and error states").

When a split fails these tests, re-cut it along context and file boundaries before dispatch.
Do not patch a bad split with more messages.

---

## 4. Shared state and the task board

The shared task board is the only state the Build Director mutates directly.

| Item | Owner | Rule |
|------|-------|------|
| Task status, owner, dependencies, write scopes, budgets | Build Director | Set at dispatch; updated only by the Build Director or by the assigned worker on its own task |
| Worker findings, intermediate output, blockers | Worker | Returned in the result and recorded on the task; not written into another worker's task |
| Integration branch, merge order, final diff | Build Director | Workers never merge or rebase shared branches |
| Product files, tests, docs | Role owner | Each file has exactly one writer at a time |

Workers do not coordinate through side channels. If worker A needs something from worker B,
that dependency belongs on the task board as `blocked_by`, and the Build Director sequences it.
A worker that discovers an out-of-scope problem reports it and stops; it does not fix it.

---

## 5. Write-scope policy

Every task records its write scopes before execution. A write scope is a file path, a file
pattern, or a directory prefix.

1. **Isolation by path prefix.** Each worker writes only inside its granted scope. Example: a
   research fan-out grants each researcher `tmp/research/<role>-*.md`; no researcher writes
   another's file, and none writes `docs/`.
2. **One writer per file.** Concurrent tasks must not share a file, a generated type, or a
   barrel export. If two tasks need the same file, serialize them or split the file by context.
3. **The Build Director merges.** Workers commit to their own branch or produce a patch. The
   Build Director performs the merge, resolves mechanical conflicts, and validates the result.
4. **Overlap is advisory, not a lock.** The filesystem does not prevent two workers from editing
   the same path. The Build Director is responsible for checking scopes for overlap before
   dispatch and for reviewing the final diff for out-of-scope edits.
5. **No opportunistic edits.** A worker that sees an unrelated defect or improvement reports it;
   it does not fix it in the same task. Unrelated edits are rejected at integration.
6. **Protected areas are off-limits even inside a permitted area.** Each role card lists protected
   paths; a scope grant never overrides a protected-area rule.

---

## 6. Parallelism policy

Fan out only for independent work. Serialize anything that depends on another worker's output.

- **Independent:** disjoint write scopes, no shared artifact, no ordering requirement. Dispatch
  together.
- **Dependent:** one task's input is another's output, or both write the same contract. Create a
  `blocked_by` edge and dispatch the successor only after the predecessor is complete and
  reviewed.
- **Integration:** always serial. The Build Director merges in dependency order, not arrival
  order.

**DSH Agent Teams semantics.** `blocked_by` is enforced at claim time: a claim on a blocked task
fails with `TEAM_TASK_BLOCKED`. It is not advisory. Readiness does not start an owner either —
a ready task stays idle until the Build Director sends an explicit activation message. Budget for
that: readiness is a precondition, not a dispatch.

Default ceiling: **four concurrent workers**. Exceeding it requires a recorded rationale and
evidence that write scopes remain disjoint. More concurrency is not more throughput when merges
serialize at the end.

---

## 7. Budget envelopes

Every task carries a budget. Budgets are per task, not per session, and are recorded on the task
card at dispatch.

| Task class | Wall-clock | Output tokens | Tool calls | Typical use |
|------------|-----------|---------------|------------|-------------|
| Research / analysis | 20 min | 40,000 | 60 | Reading, mapping, options, decision input |
| Implementation | 45 min | 80,000 | 120 | Code, tests, docs for one bounded change |
| Verification | 20 min | 30,000 | 60 | Independent evidence gathering and ledger |
| Integration | 30 min | 40,000 | 80 | Merge, conflict resolution, merged-tree checks |

Rules:

1. **The envelope is a stop condition.** On reaching any ceiling, the worker stops and returns
   partial output, the blocker, and the spend. It does not silently continue.
2. **One extension by the Build Director**, recorded with a reason. A second extension requires
   human approval; repeated overruns mean the task was mis-sized and must be re-decomposed.
3. **Verification is not compressible.** A short verification budget that forces sampling is a
   failed gate, not a cheap pass.
4. **Spend is recorded at completion.** Wall-clock, output tokens, and tool calls belong on the
   task record even when the task fails.
5. **Budget does not excuse evidence.** Running out of budget never converts `UNVERIFIED` into
   `PASS`.

---

## 8. Delegation lifecycle

Ten stages. The Build Director owns the stages it can perform; workers own `execute`; the
verifier owns the verdict.

| Stage | What happens | Output |
|-------|--------------|--------|
| **1. Understand** | Restate the objective, authority, constraints, affected structures and entities, and what "done" would mean. Resolve ambiguity before splitting. | One-paragraph brief and acceptance criteria |
| **2. Decompose** | Cut along context boundaries and write scopes. Name each artifact and its owner. Apply the bad-split tests. | Task graph with write scopes, dependencies, budgets |
| **3. Select** | Choose the role for each unit, confirm the role's permitted area covers the work, and reserve a different agent for verification. | Assignment and independence check |
| **4. Dispatch** | Write the self-contained brief, create or claim the task, record scope and budget, and send the activation message. | Task board entry and dispatch message |
| **5. Execute** | The worker works in fresh context, reads the referenced files, stays inside its scope, and returns claimed outputs. | Patch, branch, or artifact plus a result summary |
| **6. Challenge** | Attack the assumptions before accepting: scope creep, invented functionality, targets reported as done, unapproved dependency, missing evidence label. | Findings and required changes |
| **7. Verify** | An independent verifier checks every criterion with actual evidence, per `QUALITY_GATES.md`, and completes the evidence ledger. | Ledger with `PASS` / `FAIL` / `UNVERIFIED` per criterion and a `verified` verdict |
| **8. Integrate** | Merge in dependency order, resolve mechanical conflicts, rerun build and tests on the merged tree, review the final diff. | Integrated result and merged-tree evidence |
| **9. Reflect** | Record what was learned: reusable procedure, failed assumption, cost, defects, and whether a skill should be saved. | Reflection note and optional skill update |
| **10. Update** | Close the task with its evidence and spend, update dependent tasks, record decisions, and escalate anything unresolved. | Updated board and, when warranted, an ADR or doc amendment |

Stages 6 and 7 are separate. Challenge is adversarial review by the Build Director or a peer;
verification is independent evidence by an agent that did not produce the work. Neither replaces
the other.

---

## 9. Escalation and stop conditions

The Build Director stops and escalates to a human when any of the following is true:

- Authority is unclear or two governing documents conflict (charter, ontology, ADR).
- The work requires a destructive action, a new architecture, or a new dependency.
- A task needs to modify a protected area or a file owned by another role.
- Verification fails three times for the same task.
- A task is blocked on a human decision or missing external access for more than one working day.
- Budget is exhausted twice or the decomposition has been re-cut for the same objective twice.
- A security concern, credential exposure, or production-data risk is found.
- The only available verifier is the implementer or a close collaborator.

A blocked card stays in its current column with a concrete reason. It is not silently dropped,
reassigned, or marked done. Only a human decision or the removal of the stated blocker clears it.

The following always require explicit human authorization before any agent acts:

- Pushing to a remote, opening a merge request against a protected branch, or merging to main.
- Deploying, publishing, or promoting any build.
- Deleting important data, records, seeds, or user-owned files.
- Modifying production infrastructure, live Supabase projects, or live n8n workflows.
- Adding a dependency, service, runtime, or storage engine.

---

## 10. Document map

| Document | Answers |
|----------|---------|
| `AGENTS.md` | Stack, commands, repository layout, mechanical rules |
| `docs/design/charter.md` | Enduring principles and mutable decisions; highest project authority |
| `docs/ontology.md` | What APT-LABS is and how it thinks |
| `docs/agents/OPERATING_MODEL.md` | Who works, how work is split, dispatched, and budgeted |
| `docs/agents/ROLE_CARDS.md` | Per-role boundary contracts and path ownership |
| `docs/agents/QUALITY_GATES.md` | Evidence standard, verification protocol, and release prohibitions |
