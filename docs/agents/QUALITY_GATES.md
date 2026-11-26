# APT-LABS — Quality Gates

Completion in this repository is **evidence-gated, not claim-gated**. A build that compiles, a
file that exists, or an implementer's summary is not completion. A state like "tested",
"working", or "done" is a claim until an independent verifier reproduces the evidence and
records it.

These gates apply when a task is proposed as complete, when work is integrated, and before
shipping. They do not block every edit (charter B8). `OPERATING_MODEL.md` defines who may act;
`ROLE_CARDS.md` defines where; this document defines what counts as proof.

---

## 1. Claims and evidence

- **A status word is a claim.** "Done", "complete", "fixed", "tested", and "works" carry no
  authority on their own.
- **`verified = true` only when every completion criterion has reproducible evidence and a
  `PASS` verdict from an independent verifier.**
- **A green build proves compilation, not correctness.** A passing test proves the tested path
  under the tested conditions, not general completion.
- **A demo proves a demo.** Demo data is labelled as demo data; it is never evidence of
  production behavior.
- **Evidence carries a label.**

| Label | Meaning | May support |
|-------|---------|-------------|
| `VERIFIED` | Independently checked against current evidence, with the ledger recorded | A completed criterion or task |
| `PROTOTYPE` | Exists and runs in a limited or demo scope; not production-ready | Exploration, design feedback |
| `TARGET` | Intended future behavior; not implemented | Planning, acceptance criteria |
| `PLANNED` | Scheduled or designed; work not started | Roadmap |
| `UNKNOWN` | Not established; must not be guessed | An open question |

`TARGET` and `PLANNED` work is never described as delivered. Demo or synthetic data is never
presented as real. `UNKNOWN` is a legitimate answer; a guess labelled `VERIFIED` is not.

---

## 2. Gate sequence

| Gate | Question | Required evidence | Cleared by |
|------|----------|-------------------|------------|
| **G0 — Scope and authorization** | Is the work inside a recorded write scope, with no protected path, new dependency, or architecture change? | Task card with write scope; `git diff --name-only`; authorization record for any exception | Build Director |
| **G1 — Artifact completeness** | Do the claimed outputs exist, contain real content, and avoid placeholders? | File listing with non-zero sizes; placeholder scan; rendered artifact where applicable | Verifier |
| **G2 — Static correctness** | Does the repository type-check and lint under its configured tooling? | `npx tsc --noEmit` output; lint result or an explicit "not configured" record | Verifier |
| **G3 — Tests** | Do the relevant tests pass on the current tree? | `npm test` output; targeted or end-to-end runs where the task requires them | Verifier |
| **G4 — Independent verification** | Does every criterion have evidence and a `PASS` verdict from an agent that did not produce the work? | Complete evidence ledger; `verified = true` | Verification & Security Engineer |
| **G5 — Integration** | Does the merged tree still build and test, and does the final diff stay in scope? | Merged-tree build and test output; final diff review | Build Director |
| **G6 — Release authorization** | Has a human authorized the irreversible action? | Explicit authorization for push, deploy, data deletion, or infrastructure change | Human |

A task may not skip G0–G4. G5 applies to every task that is merged. G6 applies only when a
release, deployment, or destructive operation is proposed.

### 2.1 Verification tiers — match the check to the size of the change

Running the whole gate suite after every small edit is waste, and a process that is expensive
gets skipped. Verification is therefore **tiered by blast radius**. The gate *sequence* never
changes; only *which checks* run at each tier.

| Tier | When it applies | Required checks | Explicitly NOT required |
|------|-----------------|-----------------|--------------------------|
| **T0 — Per edit** | Every individual change an agent makes while working | Read back the file you changed; placeholder scan on **touched files only**; `git diff --name-only` stays in scope | Full test suite, full type check, build |
| **T1 — Per task** | When a task's own work is complete | Targeted tests for the touched modules (`npx vitest run <path>`); `npx tsc --noEmit` | Full suite, build |
| **T2 — Integration** | Before merge / at a lifecycle gate | Full `npm test`, full `npx tsc --noEmit`, `npm run build`, full scope review | — |
| **T3 — Release** | Irreversible action proposed | T2 plus human authorization (G6) | — |

Rules for applying tiers:

- **A tier may always escalate, never silently de-escalate.** If a T0 change touches a shared
  contract, a schema, a public interface, or more than one module, it is verified at T2.
- **Targeted tests are evidence, not a substitute.** A T1 targeted pass supports a criterion; the
  full suite at T2 is what clears integration. Record which tier produced each ledger row.
- **Never claim a tier you did not run.** A ledger row must state its tier; a `PASS` recorded from
  a T1 run must not be presented as a T2 result.
- **The evidence bar is unchanged.** Tiering reduces redundant commands, not the obligation to
  produce real evidence for each claimed criterion.
- **Docs-only and instruction-only changes** need T0 plus a read-back; they never justify a full
  suite on their own, and they never justify a `verified = true` for any product behaviour.


---

## 3. Verification protocol

### 3.1 Independence

**NEVER verify your own work.**

A verifier is independent only when all of the following hold:

- It is a different agent from the implementer.
- It starts with fresh context and reads the task card, not the implementer's chat history.
- It did not author, co-author, or modify any claimed file.
- It did not write the completion criteria it is checking.
- Its verdict cannot be overridden by the implementer.

The Build Director's integration review is not independent verification. If no independent
agent is available, the task is blocked and escalated; it is not self-verified.

### 3.2 Handoff package

Before verification starts, the implementer submits three fields on the task:

| Field | Content |
|-------|---------|
| `claimed_outputs` | Exact repository paths or URLs produced or changed |
| `completion_criteria` | Numbered, observable, binary conditions that define done |
| `proof_references` | The commands, paths, or artifacts the verifier can reproduce to check each criterion |

Illustrative shape only — not an execution record:

```json
{
  "claimed_outputs": ["src/lib/ontology/types.ts"],
  "completion_criteria": [
    "Person and Asset remain distinct exported types",
    "The distinction is covered in src/lib/ontology/types.test.ts"
  ],
  "proof_references": ["src/lib/ontology/types.ts", "src/lib/ontology/types.test.ts"]
}
```

Criteria must be observable and binary. "Looks better", "improved", and "works" are not
criteria; they are rejected before verification. If a criterion cannot be evidenced, the
implementer declares it as a gap rather than letting the verifier discover it.

### 3.3 What the verifier checks

For **every** criterion, with actual evidence:

1. **Re-run the proof.** Do not accept pasted output, screenshots of terminal text, or the
   implementer's summary as evidence.
2. **File existence and content.** Each claimed output exists and is non-empty. A zero-byte file,
   a stub, or a missing path fails the criterion.
3. **Placeholder scan.** Search each claimed output for `TODO`, `TBD`, `FIXME`, `[INSERT]`, and
   obvious stubs. A match fails unless the task explicitly permits a tracked placeholder and the
   criterion says so.
4. **Compile.** Run `npx tsc --noEmit`. Any diagnostic fails G2.
5. **Lint.** Run the configured linter if one exists. If no linter is configured, record
   `UNVERIFIED — no linter configured` and escalate to the Build Director; never record `PASS`
   for a check that did not run.
6. **Tests.** Run `npm test`. All tests must pass. A skipped or filtered suite
   is not a full pass; the ledger records exactly what ran.
7. **Build.** Run `npm run build`. It must exit 0. The current package also builds the investor
   deck; a failure anywhere in that chain is a build failure and must be reported, not waived.
8. **Scope.** Compare `git diff --name-only` against the recorded write scope. Any edit outside
   the scope, or inside a protected area, is a failure even if the code is correct.
9. **Evidence labels.** Confirm that `TARGET`, `PLANNED`, and `PROTOTYPE` work is labelled and not
   described as delivered; confirm demo data is labelled.
10. **Security and blast radius.** Check that no secret, token, credential, live endpoint, or
    destructive command was introduced, and that no production data or infrastructure is touched.
11. **Record the ledger.** One row per criterion, with the command or path, the observed result,
    the verdict, and the timestamp.

### 3.4 Self-attestation is an automatic failure

Any of the following makes the verification invalid and the result `FAIL`:

- The verifier is the implementer, a co-author, or an agent that modified the claimed files.
- The verifier copies the implementer's claimed results without re-running them.
- A ledger row cites evidence that does not exist, is empty, or was not produced in this
  verification.
- A `PASS` is recorded for a check that was skipped, filtered, or blocked.
- The implementer edits the tree during verification.

The failure is recorded even if the underlying artifact later proves correct.

### 3.5 Repository commands

| Check | Command | Pass condition |
|-------|---------|----------------|
| Type check | `npx tsc --noEmit` | Exit 0, no diagnostics |
| Unit tests | `npm test` | Exit 0, every test passes |
| Targeted tests | `npx vitest run <path>` | Exit 0; supports a criterion but does not replace the full suite |
| Build | `npm run build` | Exit 0, no TypeScript or build errors, `dist/` produced |
| Placeholder scan | `git grep -n -E 'TODO\|TBD\|FIXME\|\[INSERT\]' -- <claimed paths>` | No matches (exit 1 with no output is the expected clean result) |
| Scope check | `git diff --name-only <base>...HEAD` | Every path is inside the recorded write scope |

Run commands from the repository root. Record the exact command and exit code; do not paraphrase
the output.

### 3.6 Verdict

```
verified = true   iff   every completion criterion has verdict PASS
                        with evidence reproducible from the repository
```

- One `FAIL` or `UNVERIFIED` criterion makes `verified = false`.
- A partial result is not a pass. "Mostly done" is not done.
- A failed verification returns the task to the implementer with the ledger and the specific
  failed criteria.
- After **three failed verifications** of the same task, block the card and escalate to a human.
  Do not attempt a fourth round without a changed approach or human direction.

---

## 4. Evidence ledger

The evidence ledger is the durable record of verification. It is stored on the task card. The
verifier produces it; the Build Director records it; no one edits a verdict after submission
(corrections are appended as new rows with a reason).

| criterion | evidence command/path | observed result | verdict (PASS/FAIL/UNVERIFIED) | timestamp |
|-----------|-----------------------|-----------------|--------------------------------|-----------|
| Type check clean | `npx tsc --noEmit` | Exit 0, no diagnostics | PASS | `YYYY-MM-DDThh:mm:ssZ` |
| Unit suite green | `npm test` | Exit 0, all tests pass | PASS | `YYYY-MM-DDThh:mm:ssZ` |
| No placeholders in claimed files | Scan of `src/lib/...` | No matches for TODO/TBD/FIXME/[INSERT] | PASS | `YYYY-MM-DDThh:mm:ssZ` |
| Lint clean | Configured linter | No linter configured in `package.json` | UNVERIFIED | `YYYY-MM-DDThh:mm:ssZ` |

*Illustrative format only. The example is not an execution record; a real ledger records the
verifier's actual observations, exit codes, and run timestamps.*

Ledger rules:

1. **One row per criterion.** Do not batch multiple criteria into one row.
2. **Evidence is reproducible.** A command plus its output, or a path plus what was inspected.
3. **Observed result is factual.** Record exit codes and output, not an interpretation.
4. **`UNVERIFIED` is not a soft pass.** It blocks `verified = true` and must be resolved or
   escalated.
5. **Timestamp is when the check ran**, in ISO 8601 UTC.
6. **The ledger names the verifier and the tree state** (branch and commit) in its header.
7. **No secrets, credentials, personal data, or production identifiers** appear in evidence.
8. **Append, do not overwrite.** A re-run adds rows; it does not erase the earlier verdict.

---

## 5. Prohibitions

No agent may do any of the following without explicit human authorization:

- Push to a remote, or open or merge a merge request against a protected branch.
- Deploy, publish, promote, or release any build.
- Delete important data, records, seeds, migrations, or user-owned files.
- Modify production infrastructure, live Supabase projects, live n8n workflows, or
  environment/credential stores.

No agent may do any of the following at all:

- Fabricate evidence, timestamps, command output, or test results.
- Self-attest completion, or verify its own or a close collaborator's work.
- Mark a task done on a green build alone, or while any criterion is `UNVERIFIED`.
- Present `TARGET`, `PLANNED`, or `PROTOTYPE` work as delivered functionality.
- Present demo or synthetic data as real data.
- Weaken, skip, or rewrite a test to make a failure pass without a changed acceptance criterion.
- Hide a known failure, blocker, or out-of-scope edit.
- Put secrets or credentials in code, evidence, task comments, or logs.

A prohibited action is a freeze condition: stop, preserve the current state, and escalate.

---

## 6. Failure handling

1. **Return, do not patch around.** A failed criterion returns the task to the implementer with
   the ledger. The verifier does not fix the code.
2. **Re-verify from a fresh context.** A fixed task gets a new verification, not an annotation on
   the old one.
3. **Three failures stop the line.** Block the card, record the three ledgers, and escalate to a
   human with the changed approach or the decision needed.
4. **Regressions reopen work.** A change that breaks an earlier `VERIFIED` result reopens the
   affected task or creates a defect card; it is not silently absorbed into the new task.
5. **Defects are recorded, not whispered.** A defect found during verification or integration
   gets a defect card linked to the task that exposed it.
6. **Integration failure is a task failure.** A merged tree that does not build or test fails G5
   and returns to the owning role, even if each branch passed alone.

---

## 7. Document map

| Document | Answers |
|----------|---------|
| `AGENTS.md` | Stack, commands, repository layout, mechanical rules |
| `docs/design/charter.md` | Enduring principles and mutable decisions |
| `docs/ontology.md` | What APT-LABS is and how it thinks |
| `docs/agents/OPERATING_MODEL.md` | Roles, decomposition, write scopes, budgets |
| `docs/agents/ROLE_CARDS.md` | Per-role boundary contracts and path ownership |
| `docs/agents/QUALITY_GATES.md` | This document: evidence standard, verification, release prohibitions |
