# DSH × FCC — Cognitive Production Environment State

_Last updated: 2026-11-21T00:35 +03:00 (Africa/Nairobi)_

## Architecture (as built, not as proposed)

```
DSH Desktop (sole supervisor)
   ├── llm-pi-ai provider "free-claude-code" ──► FCC :8082  (/v1 openai-responses)
   ├── subagent-claude-code  ──► claude CLI ──► FCC :8082  (/v1/messages, anthropic wire)
   └── subagent-codex        ──► codex CLI  ──► FCC :8082  (/v1 responses)
                                      │
                          FCC = single model economy
                          MODEL_FALLBACKS = shared 7-model / 6-provider pool
```

Fallback lives in FCC, not in each tool. Every consumer (DSH root agent,
Claude Code, Codex) that routes through :8082 inherits the identical pool
and identical ordered fallback chain. There is no per-tool routing drift.

## VERIFIED FACTS (executed, with evidence)

| # | Claim | Evidence |
|---|---|---|
| 1 | FCC healthy, 1436 models catalogued | `/health` → `{"status":"healthy"}`; `/v1/models` count = 1436 |
| 2 | FCC Anthropic wire works | `POST /v1/messages` → 200, content `"OK"` |
| 3 | FCC OpenAI-responses wire wired into DSH | provider `free-claude-code`, baseURL `http://127.0.0.1:8082/v1`, api `openai-responses` |
| 4 | **Claude Code routes through FCC** | `claude -p` with `ANTHROPIC_BASE_URL=:8082` → returned `FCC_OK`, exit 0 |
| 5 | **Codex routes through FCC** | `~/.codex/config.toml`: `model_provider="fcc"`, `base_url=http://127.0.0.1:8082/v1`, `wire_api="responses"`, auth via `fcc-codex --print-proxy-auth-token` |
| 6 | Fallback pool is real and cross-provider | `MODEL_FALLBACKS` = agnes → llm7 → groq → zenmux → llm7 → zenmux → custom(gonka) |
| 7 | Concurrency + rate limits enforced by FCC | `PROVIDER_MAX_CONCURRENCY=10`, `PROVIDER_RATE_LIMIT=100` / `PROVIDER_RATE_WINDOW=60` |
| 8 | DSH FCC integration connected natively | `/admin/api/integrations/dsh-desktop` → connected, writes this profile's patch + credentials |
| 9 | Patch config valid YAML, both providers registered | YAML parse OK, 8 entries incl. `subagent-claude-code`, `subagent-codex` |
| 10 | Model id form accepted end-to-end | `--model anthropic/llm7/deepseek-v4-pro` → `FCC_OK` exit 0 (emits benign `unrecognized_model` warning) |

## ASSUMPTIONS (not yet verified)

- A1: Both new subagent config entries take effect **only after DSH restarts** —
  providers register at boot. Not yet proven by a live `subagent_claude_code` call.
- A2: `llm7/deepseek-v4.1-flash` is a valid id in `~/.fcc/codex-model-catalog.json`
  (mirrors current working `~/.codex/config.toml`, but not independently exercised).
- A3: DSH's `subagent` tool model allowlist is limited to `deepseek-account`
  (confirmed by `list_subagent_models`); native subagents therefore cannot yet
  select FCC models directly — only the external Claude/Codex backends can.

## OPEN RISK — HIGHEST VALUE FIX

**Dead provider in the fallback chain causes hard 401, not a fallback.**
Attempt with `--model claude-sonnet-5-5` produced:

```
501 Upstream provider custom_ef6850b1eca24c4ea21dc340a540513b returned HTTP 401
API key is paused or access disabled (app.gonkabroker.com/api-keys)
```

The `custom_ef6850b1...` (gonka) provider is the **last** entry in
`MODEL_FALLBACKS` and its key is paused. FCC treated it as fatal instead of
continuing. Action: remove that entry from `MODEL_FALLBACKS` via
`POST /admin/api/config` + `/admin/api/config/apply`, or reset the key.

## Claude Code model-selection nuance

- `ANTHROPIC_MODEL=<fcc-id>` → **fails** (`unrecognized_model`, aborts).
- `settings.json "model"` or `--model <fcc-id>` → **works** (warning only).
- Therefore the DSH plugin's `config.model` (passed SDK-side) is the correct lever,
  and `ANTHROPIC_MODEL` must **not** be set in the subagent env.

## Next actions

1. Restart DSH, then call `subagent_claude_code` and `subagent_codex` on a real task to close A1/A2.
2. Remove dead gonka key from `MODEL_FALLBACKS`.
3. Measure aggregate tokens/sec with N concurrent subagents; raise provider
   concurrency only against measured headroom (start at 3–4 on a 10-slot budget).
4. Benchmark the pool per capability (reasoning / coding / long-context / cheap-fast)
   and write the matrix back here.
