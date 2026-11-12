# APT-LABS — Canonical Agent Instructions

Single source of truth for agents working in this repository. Replaces duplicated instruction files. Where this file conflicts with `docs/design/charter.md`, the charter governs.

## Stack

Preact 10.24 + Vite 6.4.5 + TypeScript 5.6 strict + Wouter routing + Vitest 5.0.5. Browser-local demo with Supabase fallback when env vars are unset.

## Key commands

- `npm run dev` — dev server
- `npm run build` — `tsc && vite build`
- `npm run test:unit -- --run` — vitest (12 files, 74 tests)
- `npx tsc --noEmit` — type check

## Where things live

```
src/
  App.tsx              — route switch (wouter)
  tokens.css           — design tokens (:root light luxury, [data-skin="dark"])
  lib/
    demo-seed.ts           — seedDemoData(), 3 scenarios
    roll-sbt-bridge.ts     — Roll → SBT bridge
    sbt-attestations.ts    — SBT attestations (localStorage)
    agent-host.ts          — AgentHost, proposes-never-executes
    local-workbench.ts     — applications, workStatus state machine
    local-workflows.ts     — field signals, work opportunities
    people-network.ts      — 31 entities, 34 relationships
    db/roll.ts             — RollEntry, hash_anchor, evidence layers
    school-console-storage.ts — tender drafts, IndexedDB
    workbench-simulation.ts — 6-stage simulation pipeline
  components/
    WorkspaceShell.tsx     — app shell, agentAvailable flag
    EngineCommandDock.tsx  — scoped request dialog ("Ask engine")
  pages/workspace/
    workspace routes (Commons, Network, Workbench, Records, Intelligence)
  modules/
    workbench/         — pilot routes under shared shell
    kemetos1/          — Kemetos1 coordinator layer
    benben-os/         — separate prototype (not an APT-LABS module)
```

## Five modules

| Module | Job | Route |
|--------|-----|-------|
| Commons | Discover needs, offers, resources, opportunities | `/workspace/commons` |
| Network | People, crews, institutions, assets, capabilities | `/workspace/network/{people,institutions,capabilities}` |
| Workbench | Scope, assemble, coordinate productive work | `/workspace/workbench`, `/workspace/workbench/:pilot` |
| Records | Canon, Annals, Roll lenses | `/workspace/records/{canon,annals,roll}` |
| Intelligence | Agents, matching, forecasting, analytics | `/workspace/intelligence` |

School Console is nested under Workbench, not a primary module.

## Auth

Demo mode (localStorage) when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset. Roles: `institution`, `founder`, `coordinator`, `admin`.

## Guardrails

1. **Read the file before changing it.**
2. **Preserve user-owned and unrelated changes.**
3. **Report failures honestly.**

## Build & test

Run `npm run build` and `npm run test:unit -- --run` before shipping. Not a gate that blocks every edit.

## Reference docs

- `docs/ontology.md` — APT-LABS ontology: thesis, aetiology, six structures, transformation chain, design principles, what-this-is-NOT (read first for domain work)
- `QUICKSTART.md` — tools, skills, MCPs, setup, design gates (read first for coding sessions)
- `docs/architecture.md` — current technical architecture
- `docs/domain-model.md` — six-structure quick reference (points to ontology.md)
- `docs/decisions/` — accepted ADRs (B1–B8)
- `docs/design/charter.md` — constitution (principles + decisions)

## Tool / skill / MCP layout

- **Skills** live in `.agents/skills/` (canonical). `.claude/skills`, `.github/skills`, `.kilo/skills` are junctions to it.
- **MCP** — `.mcp.json` is the shared config; tool-specific configs (`.kilo/kilo.jsonc`, `.claude/settings.json`, etc.) override per-tool.
- **Codebase index** — `.codebase-memory/` (codebase-memory-mcp). Run `index_repository` once after major refactors.
- **Engine (Python)** — `engine/` with `.venv/`. Install via `uv pip install --python engine/.venv/Scripts/python.exe <pkg>`.
