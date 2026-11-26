# APT-LABS — Canonical Agent Instructions

Single source of truth for agents working in this repository. Replaces duplicated instruction
files. Where this file conflicts with `docs/design/charter.md` or `docs/ontology.md`, the charter
and ontology govern.

This file anchors **facts about the current tree** and **how to run it**. It does not pin design
decisions: the stack, layout, and module set below are *descriptive as of today* and are free to
evolve. Design intent lives in `docs/design/charter.md` (constitution and current decisions) and
`docs/ontology.md`; durable structural decisions are recorded as ADRs in `docs/decisions/`. Read
those before treating anything this file implies as a constraint.

## Stack

**What it is today** (not a ceiling): Angular 22.3, **zoneless** (`provideZonelessChangeDetection`),
standalone-component app at the repository root. TypeScript strict. Signal-based reactive state.

- App: `src/` — single entry `main.ts` → `app.ts`, router in `app/app.routes.ts`.
- Libraries: `@apt-labs/ontology`, `@apt-labs/domain`, `@apt-labs/shared/{state,ui}`, `@apt-labs/shell`.
- The Workbench undertaking journey — publish scope, submit interest, issue an offer, accept it,
  report, and review by a different person — is **server-backed and shared across accounts**
  (`undertakings`, `undertaking_interests`, `undertaking_offers`, `undertaking_participants`,
  `work_reports`, `work_reviews`, plus an append-only audit trail). Commons, Network, Records and
  Workbench read the same authorized records through `WorkspaceDataService`.
- **Studio is the workspace's read layer, not a module.** The typed object registry
  (`libs/domain/src/studio-ontology.ts`), the shared zod query contract
  (`libs/domain/src/studio-query.ts`), and `/api/studio`, `/api/studio/query`, `/api/studio/graph`
  expose the same work records as objects and authorized neighborhoods. It is surfaced inside
  Ontology (`/workspace/ontology`); do not add a `/workspace/studio` route or nav item.
- Still local or simulated: capability claims and the Intelligence surfaces. Network shows only what the signed-in person may see.
- Server APIs otherwise cover Better Auth identity, organizations/memberships, organization-scoped
  opportunities, and the `/api/benbenos` school console.
- Better Auth + PostgreSQL/Drizzle is the active prototype. There is no supported localStorage auth
  fallback; Supabase files are legacy and are not a runtime fallback.

The stack can evolve: any move (e.g. changing state strategy, adding a framework concern, or
replacing a library) is an ADR decision in `docs/decisions/`, not a breakage of this file. The
retired Vite/Vue application and investor deck have been removed; historical references in archive
material are not active product code.

## Key commands (from the repository root)

- `npm start` — `ng serve` dev server
- `npm run build` — `ng build`
- `npm test` — `ng test --watch=false`
- `npm run typecheck` — `tsc -p tsconfig.app.json --noEmit` (the solution-style `tsc --noEmit` checks nothing)
- `npm run test:workbench-api` — journey and isolation regression against a running local API
- `npm run test:studio-api` — typed studio query, validation and graph isolation against a running local API

(These are the commands for the Angular app today; if the tree changes, the commands may change too
— check the root `package.json` scripts rather than trusting this list verbatim.)

On shared Windows hosts, run builds and tests sequentially. If Vitest reports worker-startup
timeouts under `npm test -- --watch=false`, run each spec separately with
`npm test -- --watch=false --include=src/app/path/to/file.spec.ts`; do not change runner
configuration for a transient worker-pool failure.

## Where things live

Descriptive map of the Angular tree **as it is today**. It will drift as the app grows — trust the
tree over this list when they disagree.

```
src/
  main.ts              — entry
  app.ts               — root component
  app/
    app.routes.ts      — route table (source of truth for routes)
    app.config.ts      — provideZonelessChangeDetection + browser config
    features/          — one folder per screen, standalone components
      landing/ commons/ network/ records/ workbench/ value/ intelligence/
      ontology/ sovereignty/ workspace/ auth/
libs/
  ontology/            — @apt-labs/ontology: domain types, cycles, commitment lifecycle,
                         evidence standing
  domain/              — @apt-labs/domain
  shared/
    state/             — @apt-labs/shared/state: Angular services and signal projections;
                         WorkspaceDataService reads authorized network/record state from the API,
                         CoordinationService still holds local drafting state
    ui/                — @apt-labs/shared/ui: shared UI primitives
  shell/               — @apt-labs/shell: app shell / layout
public/                — static assets (only configured assets are copied to the build)
```

Older Vue/Preact implementation paths and the migration decision B9 are historical, not active
application code or constraints. The active application and its UI workflow are Angular; use the
actual `src/app/` and `libs/` tree.

## Workspace modules (intended set — not a fixed contract)

The *intended* module set. Today's Angular features (`src/app/features/`) cover a subset
of it; the rest are targets to build out. Add, merge, or drop modules as the charter directs — this
describes intent, not a lock. (Check `app.routes.ts` for what's actually wired right now.)

| Module | Job | Intended route |
|--------|-----|-------|
| Commons | Discover needs, offers, resources, opportunities | `/workspace/commons` |
| Network | People, crews, institutions, assets, capabilities | `/workspace/network/{people,institutions,capabilities}` |
| Workbench | Scope, assemble, coordinate productive work | `/workspace/workbench`, `/workspace/workbench/:undertakingId` |
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

Better Auth provides the current prototype sign-in/session path; PostgreSQL/Drizzle are the
canonical infrastructure decision (B12). Do not present localStorage or legacy Supabase behavior as
a real fallback. Database-backed registration/session behavior, two-account tenant isolation,
recovery, email delivery, backups, and production operations are not yet verified. Platform and
actor role/type vocabulary is governed by the identity contract and current code; do not assume a
client role or actor label confers authority.

No universal reputation score (charter A8). No blockchain prerequisite for participation (charter A8).

## Guardrails

1. **Read the file before changing it.**
2. **Preserve user-owned and unrelated changes.**
3. **Report failures honestly.**

## Build & test

Before shipping, run `npm run build` and `npm test` from the repository root (or whatever
`package.json` scripts name them today). This is a check to run before you call something done —
not a gate that blocks every edit.

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
- `docs/decisions/` — accepted ADRs (including B12/B13); check each decision's status and supersession notice
- `docs/design/charter.md` — constitution (principles + decisions, including current B13)

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
