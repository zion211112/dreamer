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

## Codebase Memory MCP

**MANDATORY: use Codebase Memory MCP graph tools FIRST — before reading files or making code changes.**

This rule applies to every request involving this codebase.

Always call `list_projects` first when you do not already know the project name, then use the `display_name` or exact `name` returned by that tool.

```json
// Step 0 — discover project names
mcp_codebase-memo_list_projects()

// Step 1 — use the project identifier returned above
mcp_codebase-memo_get_architecture({ "project": "<display_name>" })
```

### Workflow

1. Call `list_projects` to discover the correct project name.
2. Call `get_architecture(project)` to understand the codebase structure.
3. Use `search_graph` to find relevant symbols, `trace_call_path` for call chains.
4. Use `get_code_snippet` to read specific function implementations.
5. Only use `read_file` when you need exact raw content to edit a specific line.

### Available Tools (14 MCP tools)

**Indexing:**
- `index_repository(repo_path)` — Index a repository into the knowledge graph
- `list_projects` — List all indexed projects with node/edge counts
- `delete_project(project)` — Remove a project and all its graph data
- `index_status(project)` — Check indexing status

**Querying:**
- `search_graph(name_pattern, name_scope, label, file_pattern, exclude_file_pattern)` — Structured search by label, name/qualified_name, include/exclude file globs
- `trace_call_path(function_name, direction, depth)` — BFS call chain traversal
- `detect_changes(project)` — Map git diff to affected symbols + risk
- `query_graph(query)` — Execute Cypher-like graph queries (read-only)
- `get_graph_schema(project)` — Node/edge counts, relationship patterns
- `get_code_snippet(qualified_name)` — Read source code for a function
- `get_architecture(project)` — Codebase overview: languages, packages, routes, hotspots
- `search_code(pattern, project)` — Grep-like text search within indexed files
- `manage_adr(action)` — CRUD for Architecture Decision Records
- `ingest_traces(traces)` — Ingest runtime traces to validate HTTP edges
