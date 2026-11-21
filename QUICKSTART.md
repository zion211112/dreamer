# APT-LABS — Coding Session Quickstart

Single source of truth for tools, skills, MCPs, and setup. Read this before starting any coding session.

> **Verified 2026-11-21.** Frontend is **Vue 3** (ADR B9 completed the Preact migration; Preact and
> `wouter` are gone). Counts below are measured, not remembered.

## Canonical locations

| What | Where | Notes |
|------|-------|-------|
| Agent instructions | `AGENTS.md` | Guardrails, commands, architecture |
| Design constitution | `docs/design/charter.md` | Principles + decisions B1–B9 |
| Design system | `docs/design/superior-fusion-design-system.md` | 11-source fusion; tokens in `src/assets/css/apt-tokens.css` |
| Skills (all agents) | `.agents/skills/` | 10 skills (canonical) |
| MCP servers (shared) | `.mcp.json` | better-design, codebase-memory, sakaniui, systembridge, designlang |
| MCP servers (Kilo) | `.kilo/kilo.jsonc` | playwright, context7 |
| Codebase index | `.codebase-memory/` | codebase-memory-mcp (index_repository, search_graph, …) |
| DSH design engine | `scripts/apt-dsh-tools.mjs` | drives dsh-ui-ux-pro-max offline (see below) |
| Engine (Python) | `engine/` | llm-exec-engine, venv at `engine/.venv/` |

> **Junctions:** `.claude/skills`, `.github/skills`, `.kilo/skills` are Windows junctions pointing to
> `.agents/skills/`. Edit `.agents/skills/`, never the junctions.

## Fast setup (30 seconds)

```bash
# 1. Install frontend deps
npm install

# 2. Run dev server
npm run dev          # Vite on :3000, auto-opens browser

# 3. Build gate — app only (fast; does NOT rebuild the React deck)
npm run build:app    # tsc + vite build → dist/

# 4. Test gate
npm run test:unit -- --run   # 34 files, 318 tests

# 5. Type check
npx tsc --noEmit
```

`npm run build` = `build:app` **+ investor-deck build + copy**. The deck is a separate React
(Open Slide) app under `investor-deck/open-slide`. Use `build:app` while iterating on the Vue app;
use `build` only when the deck or a deploy is involved.

## Engine (Python) quick setup

```bash
python -m venv engine/.venv            # skip if engine/.venv/ exists
uv pip install --python engine/.venv/Scripts/python.exe httpx pydantic pyyaml rich
engine/.venv/Scripts/python.exe -m engine.cli
engine/.venv/Scripts/python.exe engine/bench_models.py   # needs FCC at 127.0.0.1:8082
```

## Skills — what's available

| Skill | Use when |
|-------|----------|
| `impeccable` | UI/UX design, front-end polish, audit, critique |
| `diagram-design` | Architecture, flowchart, state machine, ER diagram |
| `ui-workflow` | Web UI build/design/test in this repo |
| `design-taste-frontend` | Design direction, palettes, motion, component recipes |
| `agent-md-refactor` | Refactor bloated AGENTS.md / CLAUDE.md |
| `webapp-testing` | Playwright-based web app testing |
| `ponytail` | Lazy senior dev mode — smallest change that ships |
| `caveman` / `megacave` / `ultracave` | Terse caveman voice (3 compression levels) |

## DSH design engine — offline, local, deeper than any hosted MCP

The DeepSeek Harness plugin `dsh-ui-ux-pro-max` is installed in the DSH profile and carries a
4,319-line offline knowledge base: **88 design styles, 192 palettes, 74 font pairings, 195 UX
rules, 25 chart types, 192 product recipes** — plus `dsh-design` (design discipline) and
`dsh-commercial-ui-ux` (commercial product quality gates).

`scripts/apt-dsh-tools.mjs` drives it directly from the repo, no DSH host and no network:

```bash
node scripts/apt-dsh-tools.mjs list
node scripts/apt-dsh-tools.mjs recommend "operational ontology dashboard dark institutional" \
  --project "APT-LABS" --stack vue --variance 7 --motion 4 --density 8
node scripts/apt-dsh-tools.mjs review "workspace rail navigation, dense table, empty states" --max 10
node scripts/apt-dsh-tools.mjs search "data-dense dashboard" --domain style --max 5
```

Use it for style selection, palette and type pairings, UX rule lookup, and chart-type choice.
**This repo already has its own design system** (`apt-tokens.css` + the fusion doc) — the engine
supplies the *vocabulary and rules*, the repo's tokens supply the *identity*.

## MCP servers

| Server | Transport | Purpose |
|--------|-----------|---------|
| `better-design` | HTTP (`better-design.com/api/mcp`) | Design principles, review rules, comprehension, spacing |
| `codebase-memory` | stdio (VS Code extension binary) | Code graph indexing, symbol search, ADR management |
| `systembridge-mcp` | stdio (global bin) | Design-token management, transformation, validation |
| `designlang` | stdio (global bin) | Extract a site's design language to tokens |
| `sakaniui` | stdio (global bin) | SakaniUI component reference (Vue) |

All stdio servers call **globally installed binaries** so no session pays a cold `npx` download.
If one times out at startup, check the global install rather than the config.

## Build & test

`npm run build:app` and `npm run test:unit -- --run` should be green before shipping. Run them as
needed — not as a gate that blocks every edit.

## Known conflicts

- **Design tokens:** governed by `docs/design/charter.md`; implementation in
  `src/assets/css/apt-tokens.css`. Any token change needs a charter update.
- **Investor deck is React; the app is Vue.** They share no components. `build:investor-deck`
  installs its own `node_modules` — do not add deck packages to the root `package.json`.
