# APT-LABS — DSH Agent Workforce Implementation Report

_DSH 0.2.2-rc.5 · profile `desktop` · repo `C:\Users\zION\Documents\dreamer` · branch `fix/vite-vue-router-peer-conflict` · 2026-11-21_

State vocabulary is used strictly throughout: **Installed** (on disk) → **Enabled** (`enabled`/`defaultEnabled`) → **Mounted** (loaded by the runtime) → **Available** (tools visible) → **Verified** (a test produced evidence).

---

## 1. Infrastructure retained, with state

| Component | Installed | Enabled | Mounted | Available | Verified | Evidence / note |
|---|---|---|---|---|---|---|
| Native Agent Teams (`dsh-agent-team`) | yes | **yes** (`defaultEnabled: true`, this change) | yes | n/a | **yes** | `team_task_*` tools appeared; claim/complete lifecycle exercised |
| `dsh-tool-agent-team` | yes | yes | yes | **yes** | **yes** | 4 tools on the surface |
| `dsh-token-meter` | yes | yes | yes | service only | not exercised | `ctx.tokenMeter`, replay-aware |
| Context7 MCP | yes | yes | yes | **yes** | **yes** | `resolve-library-id` returned 5 libs; handshake 200 |
| Claude Code specialist | yes | yes | yes | **yes** | **yes** | wrote `docs/probe-claude.md`, `ANTHROPIC_BASE_URL=:8082` |
| Codex specialist | yes | yes | yes | **yes** | **yes** | `CODEX_FCC_OK`; wrote `docs/probe-codex.md` |
| `dsh-better-sidebar` | yes | yes | yes | UI only | not exercised | 0.32.1, requires ≥0.2.2-rc.2 ✓ |
| Codex sandbox (`~/.codex/.sandbox-bin`) | — | — | — | — | **repaired** | ownership reset; shell + file writes now work |
| `dsh-context-governor` 0.4.5 | **yes** | **yes** | **no (`absent`)** | no | **no** | installed mid-session; needs a restart to mount |

### Deliberately rejected
- **pi2dsh** — incompatible at both 0.27.1 (needs DSH `0.2.1-rc.2|rc.3`) and 0.28.0-next.1 (needs `0.2.2-alpha.3`); host is `0.2.2-rc.5`. Refused by the plugin manager. **No version exemption granted** — that requires the operator's explicit acceptance of crash/data-loss risk.
- **pi-quiet-tools** — declares no `dsh`/`dsh.bundle` field, so it is a **Pi extension, not a DSH plugin**; it can only run through the pi2dsh bridge. Its function (compact large tool output, keep full output recoverable) is already native: `dsh-spill-policy` + `dsh-compaction-tool-result-pruner`.

## 2. Configuration changes (diff)

`~/.dsh/profiles/desktop/cordis.patch.yml` — two additive rows (backup: `cordis.patch.yml.bak-fcc-20261121-002852`):

```diff
+- id: agent-team
+  config:
+    defaultEnabled: true          # Agent Teams shipped OFF; this was the actual blocker
+
+- id: mcp-manager
+  config:
+    servers:
+      context7:
+        transport: streamable-http
+        url: https://mcp.context7.com/mcp
+        startupTimeoutMs: 30000
```

`AGENTS.md` — added an **Agent workforce** section (canonical pointer + 4 operating invariants). No existing content removed.

Repository worktree is unchanged apart from docs; `git status` shows only ` M AGENTS.md`, `?? docs/agents/`, `?? docs/DSH-*.md`, and probe files.

## 3. Integrations added or repaired

1. **Agent Teams** — enabled; `blocked_by` proven hard (below).
2. **Context7 MCP** — configured via native `mcp-manager`; hot-reloaded, no restart.
3. **Codex sandbox** — repaired. Root cause: `.sandbox-bin` owned by `BUILTIN\Administrators` while Codex runs at Medium integrity (Administrators = deny-only), so `SetNamedSecurityInfoW` failed with `5`. `icacls /grant` also failed (exit 5). Renaming the directory let Codex recreate it owned by `zION`; DACL write then succeeds.

## 4. Persistent agent instructions

| File | Bytes | Contents |
|---|---|---|
| `docs/agents/OPERATING_MODEL.md` | 16,764 | six-role structure, non-implementing Build Director, context-boundary/write-scope decomposition invariant, task-board state ownership, parallelism, budgets, 10-stage lifecycle |
| `docs/agents/ROLE_CARDS.md` | 12,967 | six boundary contracts (`task_scope`, `permitted_area`, `protected_area`, `unchanged_contracts`, `allowed_side_effects`, `escalation`) + path-ownership matrix; verification role is read-only with `allowed_side_effects: none` |
| `docs/agents/QUALITY_GATES.md` | 13,585 | evidence-gated completion, independent verification protocol, self-attestation failure rule, evidence-ledger table, real repo commands, authorization prohibitions |
| `AGENTS.md` (edited) | +~1.2 KB | workforce pointer + 4 invariants |

All three encode: the APT-LABS purpose, Actors/Resources/Intentions/Commitments/Activity/Knowledge, the Person/Crew/Asset/Work/Institution/Evidence domain, the five evidence labels, single-workspace direction, preservation rules, and the ban on reporting targets as delivered.

## 5. Roles and boundary contracts

Six roles, each with all six contract fields, per `ROLE_CARDS.md`: Build Director (orchestrator, non-implementing), Domain Intelligence Architect (read-heavy), Systems & Data Architect (migrations + interfaces only), Product Interface Engineer (frontend paths only), Backend & Integration Engineer (backend paths only), Verification & Security Engineer (read-only, `allowed_side_effects: none`, must be a different agent).

## 6. Agent Teams validation

| Mechanic | Test | Observed |
|---|---|---|
| Claim → complete lifecycle | `task-1` claimed by `agent-10` at rev 1, completed at rev 3 | `status: completed`, `owner: agent-10` |
| `blocked_by` releases on completion | `task-2` blocked by completed `task-1` | `ready: true` |
| **`blocked_by` is a hard gate** | `task-3` blocked by pending `task-2`; claim attempted at rev 1 | **refused**: `team task "task-3" is not ready to claim`; `ready: false` |
| `inactive` ≠ complete | `agent-10` is `inactive`; its completion is only knowable from `task-1.status === completed` | confirmed — status is the source of truth, not liveness |

**Nuance on the error code:** the surface returned `team task "task-3" is not ready to claim`, not the literal string `TEAM_TASK_BLOCKED`. The refusal is unambiguous, but the typed code was not surfaced verbatim here — do not claim otherwise.

## 7. Codex/FCC latency — measured, and the premise corrected

| Component | Measurement |
|---|---|
| `fcc-codex --print-proxy-auth-token` ×3 | **2806 ms, 2236 ms, 2313 ms** (token length 6) |
| `codex --version` (startup overhead) | **293 ms** |
| Full `codex exec "reply OK"` | **44,506 ms** |
| Auth share of total | **≈ 5 %** |

**Finding:** authentication is *not* the bottleneck. Auth averages ~2.3 s against a ~44.5 s call. The 5000 ms timeout is therefore marginal rather than causal — it can trip intermittently (`provider auth command fcc-codex timed out after 5000 ms`), but fixing it recovers at most ~5 %. The dominant cost is per-call overhead + inference (`Model metadata for llm7/deepseek-v4.1-flash not found. Defaulting to fallback metadata` also signals a catalog gap worth closing).

**No retry plugin was added** — retries prevent loss, they do not reduce successful-call latency. Before/after: no change was applied because the measurement did not support the proposed fix. Establishing the real 42 s is the deliverable.

## 8. Build and test results (measured 2026-11-21T02:28 +03:00)

| Command | Result | Duration |
|---|---|---|
| `npx tsc --noEmit` | **exit 0**, no diagnostics | 24.5 s |
| `npm run test:unit -- --run` | **34 test files passed (34) · 318 tests passed (318)**, exit 0 | 9.09 s test time / 25.7 s wall |

Baseline **existing functionality is intact** before any agent work begins.

**Documentation drift found by this run:** `AGENTS.md` claimed "vitest (12 files, 74 tests)". Reality is **34 files / 318 tests**. The stale claim is corrected in `AGENTS.md` by this report. This is exactly the class of statement that must be evidence-checked rather than trusted.

## 9. Verification evidence

### Evidence ledger — independent verification of `task-1` (verifier `agent-11`, fresh context, read-only)

| criterion | evidence (command) | observed result | verdict | timestamp |
|---|---|---|---|---|
| 1. file exists, non-zero | `Test-Path -PathType Leaf`; `Get-Item .Length`; `ReadAllBytes` | Leaf=True; Length=54; bytes=54 (3 independent reads) | PASS | 2026-11-21T02:23:46+03:00 |
| 2. contains `FIXTURE_OK` | `[regex]::Matches`; `Select-String -AllMatches` | exactly 1 match, index 27, line 2 | PASS | 2026-11-21T02:24:05+03:00 |
| 3. `nonce:` = 8 hex chars | regex `^nonce:\s*(\S*)` + `^[0-9a-f]{8}$` + per-char range check | `ab2dcd16`, length 8, no uppercase | PASS | 2026-11-21T02:24:05+03:00 |
| 4. no placeholders | `Select-String TODO/TBD/FIXME/\[INSERT\]` (case-insensitive) + broad scan | 0 hits across all markers | PASS | 2026-11-21T02:24:07+03:00 |
| audit integrity | `LastWriteTime`; `Get-FileHash SHA256` | mtime 02:22:45 (before review); `C4849E…0D91` | PASS | 2026-11-21T02:24:16+03:00 |

**Claim A (implementer, full provenance) → `verified = true`.**
**Claim B (deliberately incomplete: no nonce, no byte size, no command, no per-criterion mapping) → `verified = false`, BLOCKED.**

> Negative test result: **it refused the unproven claim.** The verifier explicitly noted the artifact itself passed its own inspection, yet refused to promote Claim B, because verification is **provenance-bound, not artifact-bound**. A bare "all criteria satisfied" did not borrow credibility from a checkable file. This is the correct outcome.

## 10. Remaining blockers and unresolved decisions

1. **`dsh-context-governor` not mounted** — instance `absent`; requires a DSH restart to load. Installed ≠ working.
2. **pi2dsh / pi-quiet-tools** — blocked on incompatible DSH line. A version exemption is the operator's decision, not mine.
3. **GitHub MCP** — remote `api.githubcopilot.com/mcp/` returns 401; needs a repository-scoped PAT. `gh` is absent, so the native forge provider is not an option.
4. **Codex real cost** — ~44.5 s/call is dominated by non-auth overhead; unusable for high-frequency fan-out until reduced.
5. **LSP not verified** — servers were not exercised against the project's languages; an LSP that mounts without diagnostics is not verified.
6. **`ui-ux-pro-max`** — the profile's only `unsupported` row (pre-existing).
7. **Repo hygiene** — the working tree carries pre-existing untracked probe files (`fcc_probe.ps1`, `docs/probe-*.md`) that should be deleted or gitignored before the next commit.

## 11. Recommended first production development task

**Make the Intelligence module's matching logic trustworthy enough to demo to an institution.**

Rationale: it meets all three multi-agent conditions — genuinely parallelizable (domain model, scoring contract, UI surface), consequential (it is the product's core claim), and bounded (one module, no schema migration). Decompose by context boundary, not role:

- Systems & Data Architect → define the matching input/output contract + fixture shape (`src/lib/`), write scope that file only.
- Backend & Integration Engineer → implement scoring against the contract.
- Product Interface Engineer → render results in `src/pages/workspace/intelligence` only.
- Verification & Security Engineer → independent test with the evidence ledger, including empty/error/permission-denied states.

Domain and architecture run **serial** (`blocked_by`); the two implementers run **parallel** on disjoint scopes; verification gates the merge.

---

## 12. Revision — verification tiering and the ontology/visual stack

### 12.1 Verification waste, corrected

`QUALITY_GATES.md` now defines **tiered verification** (§2.1). The gate *sequence* is unchanged;
only *which checks* run per change:

| Tier | Required | Not required |
|---|---|---|
| **T0 per edit** | read back the changed file, placeholder scan on touched files, `git diff --name-only` in scope | full suite, full type check, build |
| **T1 per task** | targeted tests `npm run test:unit -- --run <path>`, `npx tsc --noEmit` | full suite, build |
| **T2 integration** | full `npm run test:unit -- --run`, full `tsc --noEmit`, `npm run build`, full scope review | — |
| **T3 release** | T2 + human authorization | — |

Rules: a tier may escalate but never silently de-escalate; a change touching a shared contract,
schema, interface or more than one module is verified at T2; targeted tests are evidence but never
a substitute for the integration run; **every ledger row states its tier**.

### 12.2 Ontology / visual plugins — evaluated and installed

| Plugin | Version | License | Size | State |
|---|---|---|---|---|
| `dsh-inline-visuals` | 1.2.0 | MIT | 281 KB, 0 deps | Installed · Enabled · **Mounted · Available (VERIFIED)** — `show_visual` / `edit_visual` appeared live |
| `dsh-ontology-builder` | 0.5.3 | Apache-2.0 | 1.2 MB | Installed · Enabled · Mounted (`schema`) · **not yet Available** — its tools are registered by the removed `dsh-ontology`, so a restart is required to expose them |
| `dsh-ontology` | 0.2.0 | MIT | 147 KB | **Removed** — see collision below |
| `clearai-dsh` | 0.6.0 | Apache-2.0 | 1.7 MB | Installed · Enabled · **not Mounted (`absent`)** — needs a restart |
| `dsh-a2ui` | 0.3.1 | MIT | 591 KB | Installed · Enabled · **Mounted · Available (VERIFIED)** — `a2ui` + `a2ui_catalog` appeared live |
| `dsh-genui` | 0.3.4 | MIT | 6.7 MB | **Removed** — see weakest-renderer decision below |

**Collision found (real, not hypothetical):** installing `dsh-ontology-builder` produced

```
ontology-builder (dsh-ontology-builder): Error: tool "ontology_assert" is already registered
```

`dsh-ontology` and `dsh-ontology-builder` are **competing implementations of the same tool
namespace**, not complementary layers. They cannot coexist. Resolution: keep the builder
(Foundry-style authoring, client UI, the stated goal), remove `dsh-ontology`.

**Renderer decision (resolved by operator choice):** the profile briefly carried four
renderers (`rich-ui`, `dsh-genui`, `dsh-inline-visuals`, `dsh-a2ui`). One was removed.

**Removed: `dsh-genui`** — the weakest on evidence, not on taste:

| | genui | inline-visuals | rich-ui | a2ui |
|---|---|---|---|---|
| Size | **6.7 MB** | 281 KB | small | 591 KB |
| Runtime deps | react, react-dom, client-ui-slots, client-ui-primitives | **none** | none | react only |
| Unique role | interactive forms / mini-apps w/ agent round-trip | 21 chart/board/flow kinds | entity lists, tables, diagrams, controls | A2UI **1.0 standard**, agent→UI→agent loop |
| Uniqueness after a2ui | **superseded** | unique | unique | standard-based |

genui was both the **largest** and the only one whose differentiating role (interactive surfaces
that call back into the model) is now covered by a *standard* (A2UI 1.0). Removing it loses the
least capability and frees the most surface. `dsh-a2ui` replaces it.

`clearai-dsh` was installed at the operator's direction. It is an **agent-preset bundle** (patches
agent composition and injects sidebar plugins), not a plain tool plugin, so its blast radius is
larger; its host entry is `absent` until a restart, and it has not been exercised.

**Recommended UI/UX stack after this revision:** `rich-ui` (structured answers) +
`dsh-inline-visuals` (charts/boards/flows) + `design_audit` (measured contrast/spacing/type audit)
+ `dsh-ui-ux-pro-max` (offline design intelligence). That combination is *measured*, not decorative.
