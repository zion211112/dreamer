# CODEBASE — dreamer

APT-LABS workspace simulation. Preact + Vite + TypeScript, Wouter routing, Supabase (demo mode fallback).

## Stack
- **Vite 6.4.5** — build tool
- **Preact 10.24** — UI framework
- **TypeScript 5.6** — type safety
- **Wouter 3.3.5** — client-side routing
- **Supabase** — auth/database (demo mode when env vars missing)
- **Vitest 5.0.5** — unit testing

## Architecture

```
src/
  App.tsx              — route switch (wouter Switch/Route)
  tokens.css           — design tokens: light luxury default (:root), dark variant [data-skin="dark"]
  lib/
    demo-seed.ts               — seedDemoData(), 3 demo scenarios (school workshop, Kemetos AGI1, Thiba Hydro)
    roll-sbt-bridge.ts         — createRollFromSimulation(), mintSBTForAcceptedLocalWork()
    sbt-attestations.ts        — mint/list/verify/export SBT attestations (localStorage)
    agent-host.ts              — AgentHost class, proposes-never-executes
    people-network.ts          — network entity/relationship types + mock data (31 entities, 34 relationships)
    people-discovery.ts
    people-profiles.ts
    local-workbench.ts         — applications, workStatus state machine
    local-workflows.ts         — field signals, work opportunities
    school-console-storage.ts  — tender drafts, IndexedDB snapshots
    workbench-simulation.ts    — 6-stage simulation pipeline, RollPreview
    workbench-simulation-store.ts — persistence for simulations
    supabase/
      client.ts        — Supabase client + demo-mode flag
    auth/
      types.ts         — UserRole, Profile, AuthState, etc.
  components/
    WorkspaceShell.tsx         — app shell, agentAvailable flag
    workbench/PageAgentPanel.tsx — agent proposals per simulation stage
    EngineCommandDock.tsx      — scoped request dialog ("Ask engine")
    people/            — (NetworkMap.tsx removed — deduped into components/)
  pages/workspace/
    field-desk/useWorkbench.ts   — simulation state, advance → Roll + SBT
    SchoolConsole.tsx          — School Console tender drafts
    WorkbenchFinder.tsx
    Records.tsx
    Annals.tsx
    AptCoinLab.tsx
    Commons.tsx
    Institutions.tsx
    People.tsx
```

## Domain modules
- **Commons** — field signals, proposals, stewards
- **Network** — people, entities, relationships
- **Workbench** — opportunities, applications, delivery, simulation
- **Records** — canon / annals / roll lenses
- **Intelligence** — APT Coin Lab research (static page)

## School Console (nested operational boundary under Workbench)
Tender drafts for three demo scenarios: Kibera Makerspace workshop bench (physical-asset), Kemetos AGI1 research station (digital), Thiba Hydro fabrication rig (hybrid fabrication). Not a primary module — belongs under Workbench as an operational boundary.

## Routing (src/App.tsx)
Canonical routes under `/workspace/{module}`. Wouter `Switch` renders first match.

Key routes:
- `/workspace/commons` — Commons field signals
- `/workspace/people` — People network
- `/workspace/institutions` — Institutions & assets
- `/workspace/institutions/network` — Capability directory
- `/workspace/institutions/school-console` — School Console (nested under Workbench)
- `/workspace/workbench` — Workbench finder
- `/workspace/workbench/simulate` — Workbench simulation (Field Desk)
- `/workspace/field-desk` — alias for workbench/simulate
- `/workspace/roll` — Roll ledger
- `/workspace/annals` — Annals chronology
- `/workspace/apt-coin-lab` — Intelligence research page

## Auth
Demo mode (localStorage) when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset, or `VITE_DEMO_MODE=true`. Roles: `institution` | `founder` | `coordinator` | `admin`.

## Build
`npm run build` → `tsc` + `vite build` → `dist/`

## Tests
`npm run test:unit -- --run` → Vitest, 17 files, 123 tests.

## Known cleanup candidates (deferred)
1. **styles.css** — split into `tokens.css` / `reset.css` / `utilities.css` / `auth.css` / `shell.css` / `components.css`; remove dead legacy color aliases
2. **Button.tsx / Card.tsx / Input.tsx** — migrate inline `style` objects to CSS classes
3. **Commons.tsx / FieldDesk.tsx / SchoolConsole.tsx / Institutions.tsx / People.tsx** — split into sub-components <300 lines each
4. **CODEBASE.md** — this file; keep in sync with structural changes

## Guardrails (AGENTS.md)
- Speed and wit: smallest change that ships. Delete before refactor; refactor before add.
- Never break the build: `npm run build` and `npm run test:unit -- --run` must be green before starting the next phase.

## Known cleanup candidates (deferred)
1. **styles.css** — split into `tokens.css` / `reset.css` / `utilities.css` / `auth.css` / `shell.css` / `components.css`; remove dead legacy color aliases (`--terrain`, `--brand-main`, `--steel`, `--oxide`)
2. **Button.tsx / Card.tsx / Input.tsx** — migrate inline `style` objects to CSS classes
3. **Commons.tsx / FieldDesk.tsx / SchoolConsole.tsx / Institutions.tsx / People.tsx** — split into sub-components <300 lines each
4. **CODEBASE.md** — this file; keep in sync with structural changes

## Guardrails (AGENTS.md)
- Speed and wit: smallest change that ships. Delete before refactor; refactor before add.
- Never break the build: `npm run build` and `npm run test:unit -- --run` must be green before starting the next phase.
