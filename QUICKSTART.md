# APT-LABS — Coding Session Quickstart

Single source of truth for tools, skills, MCPs, and setup. Read this before starting any coding session.

## Canonical locations

| What | Where | Notes |
|------|-------|-------|
| Agent instructions | `AGENTS.md` | Guardrails, commands, architecture |
| Design constitution | `docs/design/charter.md` | Principles + decisions B1–B8 |
| Skills (all agents) | `.agents/skills/` | 9 skills: caveman, diagram-design, impeccable, megacave, ponytail, ui-workflow, ultracave, agent-md-refactor, webapp-testing |
| MCP servers (shared) | `.mcp.json` | better-design (HTTP) |
| MCP servers (Kilo) | `.kilo/kilo.jsonc` | playwright, context7 |
| MCP servers (Claude) | `.claude/settings.json` | better-design hooks |
| MCP servers (Cursor) | `.cursor/mcp.json` | better-design (if present) |
| Codebase index | `.codebase-memory/` | codebase-memory-mcp (index_repository, search_graph, etc.) |
| Engine (Python) | `engine/` | llm-exec-engine, venv at `engine/.venv/` |

> **Junctions:** `.claude/skills`, `.github/skills`, `.kilo/skills` are Windows junctions pointing to `.agents/skills/`. Do not edit them directly — edit `.agents/skills/`.

## Fast setup (30 seconds)

```bash
# 1. Install frontend deps
npm install

# 2. Run dev server
npm run dev          # Vite on :3000, auto-opens browser

# 3. Build gate
npm run build        # tsc + vite build → dist/

# 4. Test gate
npm run test:unit -- --run   # 12 files, 74 tests

# 5. Type check
npx tsc --noEmit
```

## Engine (Python) quick setup

```bash
# Create venv (skip if engine/.venv/ exists)
python -m venv engine/.venv

# Install packages
uv pip install --python engine/.venv/Scripts/python.exe httpx pydantic pyyaml rich

# Run the engine CLI
engine/.venv/Scripts/python.exe -m engine.cli

# Bench models (needs FCC gateway at 127.0.0.1:8082)
engine/.venv/Scripts/python.exe engine/bench_models.py
```

## Skills — what's available

| Skill | Use when |
|-------|----------|
| `impeccable` | UI/UX design, front-end polish, audit, critique |
| `diagram-design` | Architecture, flowchart, state machine, ER diagram |
| `ui-workflow` | Web UI build/design/test in this repo |
| `agent-md-refactor` | Refactor bloated AGENTS.md / CLAUDE.md |
| `webapp-testing` | Playwright-based web app testing |
| `ponytail` | Lazy senior dev mode — smallest change that ships |
| `caveman` / `megacave` / `ultracave` | Terse caveman voice (3 compression levels) |

## MCP servers

| Server | Transport | Purpose |
|--------|-----------|---------|
| `better-design` | HTTP (`better-design.com/api/mcp`) | Design tokens, UI principles, review rules, comprehension checks |
| `context7` | local (npx) | Live library/framework docs |
| `playwright` | local (npx) | Browser automation for testing |
| `codebase-memory` | stdio (extension) | Code graph indexing, ADR management |

## Design gates (must pass before shipping UI)

1. `get-ui-principle` — load visual principles before styling
2. `get-ux-principle` — load behavior principles before interaction
3. `get-review-rules` — self-review against a11y + visual + content rules
4. `check-comprehension` — mom test / 15-second / screenshot test on copy
5. `inspect-spacing` — geometry check (capture → measure → report)
6. `finalize-dashboard-review` — required for any dashboard built on a Better Design kit

## Build & test gates (B8)

`npm run build` **and** `npm run test:unit -- --run` must be green before starting the next phase. Small reversible changes preferred.

## Known conflicts

- **Taipy** cannot install on Windows (pyarrow needs cmake). Use WSL2 or a build-tools machine.
- **Preact vs React:** repo uses Preact 10.24 (leaner than React). Do not switch without a global ADR.
- **Design tokens:** governed by `docs/design/charter.md`. `tokens.css` is the implementation. Any token change needs a charter update.
