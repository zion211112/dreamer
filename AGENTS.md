# APT-LABS — Canonical Agent Instructions

Single source of truth for agents working in this repository. Replaces duplicated instruction
files. Where this file conflicts with `docs/design/charter.md` or `docs/ontology.md`, the charter
and ontology govern.

This file anchors **facts about the current tree** and **how to run it**. It does not pin design
decisions: the stack, layout, and module set below are *descriptive as of today* and are free to
evolve. Design intent lives in `docs/design/charter.md` (constitution, B1–B8) and
`docs/ontology.md`; durable structural decisions are recorded as ADRs in `docs/decisions/`. Read
those before treating anything this file implies as a constraint.

## Stack

**What it is today** (not a ceiling): Angular 22.3, **zoneless** (`provideZonelessChangeDetection`),
standalone-component monorepo under `apt-labs/`. TypeScript strict. Signal-based reactive state.

- App: `apt-labs/src/` — single entry `main.ts` → `app.ts`, router in `app.routes.ts`.
- Libraries: `@apt-labs/ontology`, `@apt-labs/domain`, `@apt-labs/shared/{state,ui}`, `@apt-labs/shell`.
- Feature screens read one shared spine — `CoordinationService` in `@apt-labs/shared/state` — so
  every view reflects the same live record instead of siloed demo data.
- Browser-local demo; Supabase fallback when env vars are set.

The stack can evolve: any move (e.g. changing state strategy, adding a framework concern, or
replacing a library) is an ADR decision in `docs/decisions/`, not a breakage of this file. Note the
root-level `vite.config.ts` / `vitest.config.ts` / `index.html` / `index-vue.html` are **leftovers
from a retired Vue app** (removed in `b622f5b`) — the product is the Angular tree; do not extend the
Vue leftovers.

## Key commands (in `apt-labs/`)

- `npm start` — `ng serve` dev server
- `npm run build` — `ng build`
- `npm test` — `ng test`
- `npx tsc --noEmit` — type check

(These are the commands for the Angular app today; if the tree changes, the commands may change too
— check `apt-labs/package.json` scripts rather than trusting this list verbatim.)

## Where things live

Descriptive map of the Angular tree **as it is today**. It will drift as the app grows — trust the
tree over this list when they disagree.

```
apt-labs/
  src/
    main.ts              — entry
    app.ts               — root component
    app.routes.ts        — route table (source of truth for routes)
    app.config.ts        — provideZonelessChangeDetection + browser config
    features/            — one folder per screen, standalone components
      landing/ commons/ network/ records/ workbench/ value/ intelligence/
      ontology/ sovereignty/ workspace/ auth/
  libs/
    ontology/            — @apt-labs/ontology: domain types, cycles, commitment lifecycle,
                           evidence standing
    domain/              — @apt-labs/domain
    shared/
      state/             — @apt-labs/shared/state: CoordinationService spine, zoneless signal
                           state (the shared record every feature reads)
      ui/                — @apt-labs/shared/ui: shared UI primitives
    shell/               — @apt-labs/shell: app shell / layout
  public/                — static assets
```

The retired Vue tree (`src/pages/*.vue`, `src/lib/*`, `src/modules/*`, `src/main-vue.ts`,
`src/components/*.tsx`) no longer exists in this repo — `docs/STATE_MACHINES.md` and a few older
notes still reference it; treat those references as historical, not live.

## Workspace modules (intended set — not a fixed contract)

The *intended* module set. Today's Angular features (`apt-labs/src/app/features/`) cover a subset
of it; the rest are targets to build out. Add, merge, or drop modules as the charter directs — this
describes intent, not a lock. (Check `app.routes.ts` for what's actually wired right now.)

| Module | Job | Intended route |
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

School Console currently sits under Workbench (an operational boundary — where people take jobs —
rather than a static record). That placement is a decision, not a law; revisit it per the charter
if the reasoning stops holding.

## Auth

Demo mode (localStorage) when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset. Platform roles: `public`, `authenticated`, `admin`, `moderator`, `trustAdmin`, `credentialIssuerAdmin`. Actor roles: `owner`, `administrator`, `manager`, `member`, `contributor`, `viewer`, `authorizedRepresentative`. Actor types: `individual` (includes `graduate`, `developer`, `sociologist`, `politician`, `student`), `crew`, `institution` (includes `university`, `school`, `hospital`, `cooperative`, `government body`).

No universal reputation score (charter A8). No blockchain prerequisite for participation (charter A8).

## Guardrails

1. **Read the file before changing it.**
2. **Preserve user-owned and unrelated changes.**
3. **Report failures honestly.**

## Build & test

Before shipping, run `npm run build` and `npm test` in `apt-labs/` (or whatever `package.json`
scripts name them today). This is a check to run before you call something done — not a gate that
blocks every edit.

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

**Preferred for structural questions, not mandatory.** The graph returns precise call/usage
structure in a few hundred tokens where grep costs tens of thousands — so when you don't already
know the answer structurally, reach for it first. It is a *preference*: fall back to a direct
read/grep when the task is small, when you need exact raw lines to edit, or when the graph is stale
(re-run `index_repository` after major refactors). No MCP or external tool is mandatory in this repo
(see `.claude/CLAUDE.md`).

When you do use it, call `list_projects` first if you don't already know the project name, then use
the `display_name` or exact `name` that tool returns.

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
