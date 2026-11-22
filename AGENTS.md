# APT-LABS — Canonical Agent Instructions

Single source of truth for agents working in this repository. Replaces duplicated instruction files. Where this file conflicts with `docs/design/charter.md`, the charter governs.

## Stack

Vue 3 (Composition API) + Pinia + Vue Router + Vite 6.4.x + TypeScript 5.6 strict + Vitest 5.x.
Browser-local demo with Supabase fallback when env vars are unset.

Single entry (verified 2026-11-21): `index.html` → `src/main-vue.ts` (Vue 3, mounted at `#app-vue`).
`index-vue.html` is a legacy duplicate of the same entry. There is **no** Preact entry and no
`src/main.tsx` / `src/App.tsx` — the Vue migration permitted by ADR B9 has completed, and Preact is
no longer a dependency. Route table: `src/modules/router.ts`.

## Key commands

- `npm run dev` — dev server
- `npm run build` — `tsc && vite build`
- `npm run test:unit -- --run` — vitest (34 files, 318 tests — verified 2026-11-21)
- `npx tsc --noEmit` — type check

## Where things live

```
src/
  main-vue.ts          — single entry: Vue app + Pinia + router
  modules/router.ts    — full route table (source of truth for routes)
  assets/css/          — design tokens & global styles (NOT src/tokens.css)
  pages/
    Landing.vue, Auth.vue, DesignLab.vue
    workspace/         — WorkspaceOverview, Coordination, Commons, Network,
                         People, Institutions, Records, AptCoinLab  (all .vue)
  lib/
    actors.ts              — Actor + membership, ActorType (individual/crew/institution)
    identity.ts            — IdentityRecord; separates Person from Account
    asset-registry.ts      — RESOURCE family, registerAsset/retireAsset
    capability-registry.ts — CAPABILITY family, what an actor can do
    commitment-journey.ts  — postNeed → acceptCommitment → fulfilCommitment
    matching.ts            — declarative need↔capability matching (no opaque scoring)
    evidence-store.ts      — EVIDENCE family + unverified→verified transition
    knowledge-store.ts     — distillKnowledge (accepted outcome → Lesson)
    record-envelope.ts     — versioned, append-only records + supersede
    audit.ts               — append-only audit trail
    authz.ts               — RBAC permission families
    ontology/              — types.ts, relationships.ts, actions.ts, evidence.ts
    db/roll.ts             — RollEntry, hash_anchor, evidence layers
    people-network.ts      — demo graph (illustrative, not real people)
  modules/
    workbench/         — pilot routes; live work items are localStorage JSON
    intelligence/      — matching / intelligence surface
    kemetos1/          — Kemetos1 coordinator layer
    assets/, benben-os/ — benben-os is a separate prototype, not an APT-LABS module
```

**Not in this repo** (previously documented, deleted): `src/App.tsx`, `src/main.tsx`,
`src/components/*.tsx`, `src/lib/local-workbench.ts`, `src/lib/workbench-simulation.ts`,
`src/lib/agent-host.ts`, `docs/STATE_MACHINES.md` references all of them.

## Workspace modules

| Module | Job | Route |
|--------|-----|-------|
| Commons | Discover needs, offers, resources, opportunities | `/workspace/commons` |
| Network | People, crews, institutions, assets, capabilities | `/workspace/network/{people,institutions,capabilities}` |
| Workbench | Scope, assemble, coordinate productive work | `/workspace/workbench`, `/workspace/workbench/:pilot` |
| Records | Canon, Annals, Roll lenses | `/workspace/records/{canon,annals,roll}` |
| Intelligence | Agents, matching, forecasting, analytics | `/workspace/intelligence` |
| Tenders | Government and institutional tenders — who bids, who wins, what was delivered | `/workspace/tenders` |
| Failed Projects | Audit and reclaim abandoned public works | `/workspace/failed-projects` |
| Investment | Fund founders and innovators — pledges release on verified outcomes | `/workspace/investment` |
| University | Universities post research needs, host students, issue credentials | `/workspace/university` |
| High School | Students learn skills on real community projects | `/workspace/highschool` |

School Console is nested under Workbench, not a primary module.

## Auth

Demo mode (localStorage) when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset. Platform roles: `public`, `authenticated`, `admin`, `moderator`, `trustAdmin`, `credentialIssuerAdmin`. Actor roles: `owner`, `administrator`, `manager`, `member`, `contributor`, `viewer`, `authorizedRepresentative`. Actor types: `individual` (includes `graduate`, `developer`, `sociologist`, `politician`, `student`), `crew`, `institution` (includes `university`, `school`, `hospital`, `cooperative`, `government body`).

No universal reputation score (charter A8). No blockchain prerequisite for participation (charter A8).

## Guardrails

1. **Read the file before changing it.**
2. **Preserve user-owned and unrelated changes.**
3. **Report failures honestly.**

## Build & test

Run `npm run build` and `npm run test:unit -- --run` before shipping. Not a gate that blocks every edit.

## Agent workforce

Multi-agent work in this repo is governed by three canonical documents. Read them before
orchestrating or delegating:

- `docs/agents/OPERATING_MODEL.md` — team structure, delegation lifecycle, write-scope policy, budgets
- `docs/agents/ROLE_CARDS.md` — six roles, each with a boundary contract (scope, protected areas, escalation)
- `docs/agents/QUALITY_GATES.md` — evidence-gated completion, verification protocol, evidence ledger

Operating invariants that override convenience:

1. **Decompose by context boundary and write scope, not by role type alone.** Splitting purely by role
   creates a telephone game where every handoff loses fidelity. A sub-agent that constantly needs
   another's in-context state was a bad split. Give each worker fresh context, a bounded write scope,
   and the shared task board as the only state the orchestrator mutates directly.
2. **Never verify your own work.** A completion claim is a claim until a different agent, with fresh
   context, confirms it against current evidence. Block without proof.
3. **One owner per task, disjoint write scopes.** The orchestrator merges; workers do not write across scopes.
4. **Evidence is labelled.** VERIFIED / PROTOTYPE / TARGET / PLANNED / UNKNOWN — never blur them.

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
