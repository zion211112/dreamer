# APT-LABS — Agent Context

This file is open context for any agent working in the dreamer codebase. It is intentionally not a directive — it describes what exists, where things live, and how the system behaves so you can make your own judgments. Treat it as a starting point, not a contract.

## Quick orientation

**Stack:** Preact 10.24 + Vite 6.4.5 + TypeScript 5.6 strict + Wouter client routing + Vitest 5.0.5. Browser-local demo with Supabase fallback when env vars are unset.

**Key commands:**
- `npm run dev` — dev server
- `npm run build` — tsc + vite build
- `npm run test:unit -- --run` — 17 files, 123 tests
- `npx tsc --noEmit` — type check

**Demo seed:** `window.seedAPTLabsDemo()` in the browser console populates 3 scenarios (school workshop, Kemetos AGI1, Thiba Hydro) across School Console, Commons, and local Workbench.

## Where things live

```
src/
  App.tsx              — route switch (wouter)
  tokens.css           — design tokens: light luxury default, [data-skin="dark"] variant
  lib/
    demo-seed.ts           — seedDemoData(), 3 demo scenarios
    roll-sbt-bridge.ts     — createRollFromSimulation(), mintSBTForAcceptedLocalWork()
    sbt-attestations.ts    — mint/list/verify/export SBT attestations
    agent-host.ts          — AgentHost class, proposes-never-executes
    local-workbench.ts     — applications, workStatus state machine
    local-workflows.ts     — field signals, work opportunities
    school-console-storage.ts — tender drafts, IndexedDB snapshots
    people-network.ts      — 31 entities, 34 relationships
    db/roll.ts             — RollEntry, hash_anchor, evidence layers
    workbench-simulation.ts — 6-stage simulation pipeline, RollPreview
    workbench-simulation-store.ts — persistence for simulations
  components/
    WorkspaceShell.tsx           — app shell, agentAvailable flag
    workbench/PageAgentPanel.tsx — agent proposals per stage
    EngineCommandDock.tsx        — scoped request dialog
  pages/workspace/
    field-desk/useWorkbench.ts   — simulation state, advance → Roll + SBT
```

## Entity types

person, crew, project, asset, work, institution, evidence. RelationshipKind has 13 kinds.

## Workbench simulation

6 stages: candidate_drafted → tender_review_simulated → assembly_simulated → delivery_simulated → acceptance_simulated → roll_preview. rollPreview only for physical-asset workKind.

## Roll ledger

RollEntry with hash_anchor (SHA-256 canonical JSON), evidence layers (public|participant|restricted), acceptance block.

## SBT attestations

localStorage `aptlabs:sbt-attestations:v1`. Portable format `aptlabs.sbt.v1`. Roles: anchor, builder, apprentice, coordinator. Mock signatures (SHA-256 digest).

## Agent host

proposes-never-executes. localStorage `aptlabs:agent-proposals:v1`. Singleton `agentHost` exported from `src/lib/agent-host.ts`.

## Design tokens

Light luxury default (`:root`): #F7F5F0 cream, #1A1D18 ink. Dark variant `[data-skin="dark"]`: #0A0F0C green-black, #E9F1E8 bone.

Semantic state colors: --state-canon (teal), --state-proposed (green), --state-risk (coral), --state-caution (amber).

## Guardrails (from root AGENTS.md)

- Speed and wit: smallest change that ships. Delete before refactor; refactor before add.
- Never break the build: `npm run build` and `npm run test:unit -- --run` must be green before starting the next phase.

## What's implemented vs conceptual

**Implemented:** simulation pipeline, Roll → SBT bridge, agent host proposals, demo seed data, workbench local flow, school console tender drafts, commons field signals.

**Conceptual / not built:** Records module UI (Canon/Annals/Roll lenses), Intelligence module UI, unified event stream, School Console as primary module.

## How to extend

1. Read the file you're about to change — don't infer from memory.
2. Check existing implementations before creating replacements.
3. Make the smallest change that ships.
4. Run `npm run build` and `npm run test:unit -- --run` before starting the next phase.
5. Update this file if you add new modules, storage keys, or routes.

## Open areas

- Local workbench acceptance → SBT: `mintSBTForAcceptedLocalWork()` now creates a Roll entry if rollEntryId/hashAnchor aren't supplied, then mints SBT. Wire into UI as needed.
- Records module: Canon/Annals/Roll lenses are defined but no UI page exists.
- Intelligence module: static page at `/workspace/apt-coin-lab`, no matching/forecasting UI.

*This document is open — extend it as the system evolves.*