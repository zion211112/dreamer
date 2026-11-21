# DSH Plugin & Capability Audit

_DSH 0.2.2-rc.5 · profile `desktop` · audited 2026-11-21 · supervisor = DSH, inference = FCC `:8082`, specialists = Claude Code + Codex_

Authority for "what is installed" in this document is `cordis_inspect_query` → `Config.listConfigs`
(218 live loader entries) plus the installed generated catalogue
`references/packages.md`. Third-party claims come from each project's repo/npm metadata and are
labelled as such; nothing below is inferred from a plugin's reputation.

---

## 1. Installed capability inventory

### 1.1 Profile bundles (from `package.json` → `dsh.profile.bundles`)

| Bundle | Role |
|---|---|
| `@deepseek-ai/dsh-base` | core (agent loop, tools, session, sandbox, skills, subagents, web, MCP) |
| `@deepseek-ai/dsh-web-app` | browser surface |
| `@deepseek-ai/dsh-experimental-plugin-market-bundle` | plugin discovery |
| `@marsken/dsh-studio` | third-party business workflow board (`studio_*` tools) |
| `dsh-ui-ux-pro-max` | design-intelligence tools |
| `dsh-better-sidebar` | third-party enhanced sidebar |
| `@deepseek-ai/dsh-experimental-session-titles-bundle` | session titles |
| `@deepseek-ai/dsh-experimental-cot-translation-bundle` | reasoning translation |
| `@deepseek-ai/dsh-experimental-auto-review` | per-tool LLM authorization review |
| `@deepseek-ai/dsh-subagent-codex` | **specialist worker: Codex** |
| `@deepseek-ai/dsh-subagent-claude-code` | **specialist worker: Claude Code** |

### 1.2 Native capabilities that already answer the brief (no plugin needed)

| Need | Native package(s) | Live status |
|---|---|---|
| Agent Teams (shared task DAG) | `dsh-agent-team`, `dsh-tool-agent-team`, `dsh-client-ui-agent-team` | **schema** (now enabled) |
| Token measurement | `dsh-token-meter` (`ctx.tokenMeter`, replay-aware) | **schema** |
| Context/cost table UI | `dsh-experimental-client-ui-stats` | not mounted (optional) |
| Planning | `dsh-plan-mode`, `dsh-tool-todo`, `dsh-goal` | present |
| Memory/continuity | `dsh-session-projection(+cache)`, `dsh-compaction-basic`, `dsh-compaction-tool-result-pruner`, `dsh-spill-policy`, `dsh-session-reference`, `dsh-session-query-sqlite` | schema |
| `@` file/session references | `dsh-client-ui-reference`, `dsh-file-reference-local` | schema (live) |
| Code intelligence | `dsh-lsp`, `dsh-lsp-stdio`, `dsh-tool-lsp` | in catalogue |
| Browser automation | `dsh-experimental-browser-use-playwright-mcp` (wraps `@playwright/mcp`) | not mounted |
| MCP | `dsh-mcp-manager`, `dsh-mcp-client`, `dsh-mcp-resources` | **schema** |
| GitHub forge | `dsh-experimental-forge-github` | not mounted — **useless here, `gh` absent** |
| Subagent control | `dsh-tool-subagent-control` (messaging, interrupt, discovery) | present |
| Deliverables / diff review | `dsh-workspace-changes`, `dsh-tool-present` | schema |

### 1.3 Config anomalies found in the live tree

| Entry | Status | Meaning |
|---|---|---|
| `include:ui-ux-pro-max` | **`unsupported`** | bundle loads but the loader rejects its row; its `design_*` tools still respond. Pre-existing, not introduced here. |
| `include:dsh-studio` | `absent` | bundle listed, loader entry not in tree, yet `studio_*` tools are exposed. Pre-existing inconsistency. |
| `include:auto-review` | `absent` | listed as a bundle but not mounted. |

---

## 2. Recommended and rejected register

### 2.1 Installed / enabled in this audit

| Item | Why | Cost |
|---|---|---|
| Native **Agent Teams** (`defaultEnabled: true`) | Official shared task DAG + change waits for subagent trees. Was shipped **off**. Zero install. | 0 bytes, no deps |
| **Context7 MCP** (remote HTTP) | Version-pinned library docs; kills stale-API errors. Verified 200 + handshake. | 0 local footprint |
| `subagent-claude-code` + `subagent-codex` routing to FCC | Standing requirement from Phase I–IV | 0 (config only) |

### 2.2 Rejected (with reason)

| Candidate | Verdict | Reason (evidence) |
|---|---|---|
| **Aegis** (`GanyuanRan/Aegis`) | **Skip** | MIT, maintained (2026-11-14), thin by design — but ships 19 skills that duplicate `brainstorming`, `writing-plans`, `executing-plans`, `requesting-code-review` already in this session; adds a per-session router prompt. Duplicate process, not new capability. |
| **planning-with-files** | **Skip** | MIT, very active (28k★), but injects ~70 lines **every prompt** and leaves native `/plan` running alongside → two plan systems. Its DSH plugin is pinned at 1.0.1 (2026-10-06) vs master 6 weeks newer, and its own doc targets `0.1.5-rc.2`. Standing token tax. |
| **dsh-context** | **Skip (borderline)** | Apache-2.0, clean (1 dep `zod`, no declared network), best compatibility story of the five. Rejected only because native `dsh-token-meter` + `dsh-experimental-client-ui-stats` cover the same question with zero third-party code. **Reconsider if the native stats view proves insufficient.** |
| **dsh-cost-meter** | **Reject** | Declares **31 outbound hosts**, peer-depends on `dsh-credentials` (reads stored provider keys), ships 2 executables and a JS parser (`acorn`) for a readout. Duplicates dsh-context. Name collision with `@guojinpeng/dsh-cost-meter`. |
| **dsh-mnemon** | **Reject** | A second complete memory system: resident per-turn injection, 22 own sub-packages, background review agents burning gateway quota, and by its own README its sources/strategies are "trusted in-process JavaScript, **not sandboxed**". Direct duplicate of native session/compaction/query stack. |
| **dsh-at-file** | **Drop** | Author's own README: *"The latest official DeepSeek Harness release now includes built-in @file and @session reference… Prefer the official implementation."* Native `ui-reference` is live here. |
| **ModLens** (`@liustack/modlens`) | **Conditional** | Real product (vision bridge for text-only models), but native `read_image` already exists. Only load-bearing if the active route refuses images — untested, so not installed. Also can silently reuse other harnesses' logins (quota/privacy). |
| **DeepSec** (`Unclecheng-li/DeepSec`) | **Reject** | 53 MB multi-language platform (Python + TS + Rust), its **own** orchestration, TUI, MCP server and skill packs on top of DSH's. Offensive tooling needs `nmap`/`sqlmap` etc. — `nmap` not installed. Signature check is now optional. Duplicates four native surfaces. |
| `@deepseek-ai/dsh-session-memory` | **Does not exist** | npm 404; no `memory` group in the official 542-line catalogue. |
| `dsh-better-sidebar` | **Keep (already installed)** | MIT, SLSA-attested, version matrix matches host (needs ≥0.2.2-rc.2). Real gain: editable CodeMirror + git graph + terminal tabs. Cost: 20.8 MB / 543 files. **Caveat from its README: since v0.23.0 its `/sidebar/api/fs` routes do no workspace containment** — treat as unfenced. |
| GitHub MCP | **Blocked, not rejected** | Remote `api.githubcopilot.com/mcp/` answers **401**; needs a PAT. `gh` is genuinely **absent** on this machine, so this is a real gap — awaiting a token. |
| Playwright MCP | **Deferred to native** | Prefer enabling official `dsh-experimental-browser-use-playwright-mcp` over hand-registering a raw MCP server (same underlying `@playwright/mcp`). Not enabled this round — untested against this host, and `playwright` is already in the workspace. |

---

## 3. Compatibility and security report

| Concern | Finding |
|---|---|
| Host line | DSH **0.2.2-rc.5**, Node from Desktop bundle; `pnpm` not on PATH (irrelevant — installs go through `plugin_manager`). |
| Third-party compat risk | Only `dsh-better-sidebar` publishes a real version matrix (0.32.1 → ≥0.2.2-rc.2 ✓). Aegis, ModLens, DeepSec publish **none**. |
| Supply-chain | Prefer exact names: `dsh-cost-meter` collides with `@guojinpeng/dsh-cost-meter`; `aegis-method-pack` is a third-party republish (real one is `@ganyuan_ran/aegis`). |
| Credential exposure | Rejected `dsh-cost-meter` (reads `dsh-credentials`, 31 hosts) and `dsh-mnemon` (unsandboxed in-process JS). Context7 takes network egress only, no credentials. |
| Filesystem fencing | `dsh-better-sidebar`'s fs routes are **unfenced by its own admission**. `dsh-subagent-agents` run under the session sandbox (`workspace-write`). |
| Secrets handling | No token was written to any config by this audit. FCC provider key stays in `$DSH_HOME/.credentials.yaml`; the subagent env uses a non-secret placeholder. |
| Resource footprint | No new local packages installed. Net additions: 2 YAML config entries. |

---

## 4. Installation and configuration records

All changes are additive rows in `~/.dsh/profiles/desktop/cordis.patch.yml`
(backup: `cordis.patch.yml.bak-fcc-20261121-002852`). YAML re-parsed with `yaml` after every edit.

```yaml
- id: subagent-claude-code        # Claude Code → FCC
  config:
    providerName: claude-code
    model: anthropic/llm7/deepseek-v4-pro
    permissionMode: dontAsk
    env:
      ANTHROPIC_BASE_URL: http://127.0.0.1:8082
      ANTHROPIC_AUTH_TOKEN: fcc-dsh-desktop
      ANTHROPIC_API_KEY: fcc-dsh-desktop

- id: subagent-codex              # Codex → FCC
  config:
    providerName: codex
    model: llm7/deepseek-v4.1-flash

- id: agent-team                  # native Agent Teams ON
  config:
    defaultEnabled: true

- id: mcp-manager                 # Context7
  config:
    servers:
      context7:
        transport: streamable-http
        url: https://mcp.context7.com/mcp
        startupTimeoutMs: 30000
```

---

## 5. Functional test evidence

| # | Test | Result |
|---|---|---|
| 1 | FCC gateway health | `{"status":"healthy"}`, 1542 models |
| 2 | FCC Anthropic wire | `POST /v1/messages` → 200, `"OK"` |
| 3 | **Claude Code → FCC** | subagent wrote `docs/probe-claude.md`, nonce `a3f9c17d`, observed `ANTHROPIC_BASE_URL=http://127.0.0.1:8082`, model `anthropic/llm7/deepseek-v4-pro` |
| 4 | **Codex → FCC (reasoning)** | subagent replied `CODEX_FCC_OK` |
| 4b | **Codex → FCC (filesystem)** | subagent created `docs/probe-codex.md` → `CODEX_WRITE_OK` |
| 5 | Codex provider routing | CLI banner: `model: llm7/deepseek-v4.1-flash`, `provider: fcc` |
| 6 | Codex model slug valid | `llm7/deepseek-v4.1-flash` present in `~/.fcc/codex-model-catalog.json` |
| 7 | **Codex shell execution after ACL fix** | `SANDBOX_OK` returned; `.sandbox-bin` recreated owned by `DESKTOP-CDLAJ8C\zION` |
| 8 | **Context7 MCP reachable** | `POST /mcp` → 200, `serverInfo: Context7 4.7.3` |
| 9 | **Context7 MCP functional** | `resolve-library-id("Playwright")` returned 5 libraries, top `/microsoft/playwright` (10,358 snippets) |
| 10 | Patch YAML integrity | parses clean, 10 entries, `mcp servers: ['context7']` |
| 11 | MCP tools live without restart | `mcp__context7__*`, `list_mcp_resources`, `read_mcp_resource` appeared via HMR |

### Defect found, repaired, and verified (Codex)

Codex was **fully non-functional as a worker** before this audit — it could reason but not touch the
filesystem. Root cause:

```
helper_sandbox_lock_failed: lock sandbox bin dir C:\Users\zION\.codex\.sandbox-bin failed:
SetNamedSecurityInfoW sandbox dir failed: 5
```

`.sandbox-bin` was owned by `BUILTIN\Administrators` while Codex runs at **Medium integrity**
(Administrators is *deny-only* for this token), so it could not rewrite the directory DACL.
`icacls /grant` failed with exit 5. Renaming the directory let Codex recreate it owned by
`DESKTOP-CDLAJ8C\zION`; the DACL write then succeeds.

Verified after the repair — three independent paths all now work:

| Path | Evidence |
|---|---|
| Codex CLI shell execution | returned `SANDBOX_OK` |
| Codex CLI file write | created `docs/probe-codex-cli.md` (`CLI_WRITE_OK`), 8,952 tokens, exit 0 |
| **Codex subagent file write** | created `docs/probe-codex.md` (`CODEX_WRITE_OK`) |

**Status: resolved.** Codex is now a usable implementation worker, not just a reasoning worker.

---

## 6. Remaining capability gaps

1. **GitHub integration** — needs a PAT for `api.githubcopilot.com/mcp/` (currently 401); `gh` is absent so `forge-github` is not an option.
2. **Browser verification** — enable native `dsh-experimental-browser-use-playwright-mcp` when a UI task actually needs it (already have local `playwright`).
3. **Token/cost table UI** — add official `dsh-experimental-client-ui-stats` if the composer context ring is not enough.
4. **`ui-ux-pro-max` unsupported state** — decide whether to repair or remove; it is the only `unsupported` row in the profile.
5. **Codex auth latency (throughput blocker)** — `provider auth command fcc-codex timed out after 5000 ms`, and commands take ~50 s. Codex works, but is currently too slow to use as a high-throughput worker. Fix before scaling concurrency.
6. **Agent Teams tools not yet re-checked** — `defaultEnabled: true` was written and the YAML validated, but the `agent_team_*` tools were not observed on the tool surface pre-restart. Confirm after the next restart.

## Standing principle

The environment got **stronger, not larger**: two config rows and one re-ownership fix. Every candidate
that would have added a second memory system, a second planner, a second orchestration layer or a
credential-reading cost daemon was rejected on evidence. Native first; third-party only where native
provably lacks the capability.
