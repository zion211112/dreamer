# APT-LABS — Architecture Reference

Verified current technical architecture. Describes what exists; does not define intent.

## Stack

| Layer | Tool | Version |
|-------|------|---------|
| Build | Vite | 6.4.5 |
| UI framework | Preact | 10.24 |
| Type safety | TypeScript | 5.6 strict |
| Routing | Wouter | 3.3.5 |
| Testing | Vitest | 5.0.5 |
| Auth/DB | Supabase | demo mode fallback |

## Build & test

- `npm run build` → `tsc && vite build` → `dist/`
- `npm run test:unit -- --run` → 12 test files, 74 tests
- `npx tsc --noEmit` → type check

## Architecture

```
src/
  App.tsx              — route switch (wouter Switch/Route), canonical routes under /workspace/{module}
  tokens.css           — design tokens (:root light luxury default, [data-skin="dark"] variant)
  styles.css           — shared visual tokens and application styles
  src/styles/*.css     — module-scoped styles (commons, institutions, network, people, records, shell, workbench, workspace-foundation)
  main.tsx             — entry point

  lib/
    demo-seed.ts               — seedDemoData(), 3 demo scenarios (school workshop, Kemetos AGI1, Thiba Hydro)
    roll-sbt-bridge.ts         — createRollFromSimulation(), mintSBTForAcceptedLocalWork()
    sbt-attestations.ts        — mint/list/verify/export SBT attestations (localStorage)
    agent-host.ts              — AgentHost class, proposes-never-executes
    people-network.ts          — 31 entities, 34 relationships
    people-discovery.ts
    people-profiles.ts
    local-workbench.ts         — applications, workStatus state machine
    local-workflows.ts         — field signals, work opportunities
    school-console-storage.ts  — tender drafts, IndexedDB snapshots
    workbench-simulation.ts    — 6-stage simulation pipeline, RollPreview
    workbench-simulation-store.ts — persistence for simulations
    supabase/client.ts         — Supabase client + demo-mode flag
    auth/types.ts              — UserRole, Profile, AuthState
    auth/hooks.ts
    auth/index.ts
    auth/permissions.ts
    db/roll.ts                 — RollEntry, hash_anchor, evidence layers
    db/roll-hash.ts
    db/network.ts
    db/work.ts
    db/index.ts
    storage/evidence.ts
    storage/index.ts
    ecosystem-examples.ts
    intelligence/registry.ts
    intelligence/types.ts
    radar-view.ts
    records-view.ts
    school-marking.ts
    studio-navigation.ts
    workspace-activity.ts
    workspace-overview.ts
    workspace-search.ts

  components/
    WorkspaceShell.tsx         — app shell, agentAvailable flag
    WorkspaceContextSwitcher.tsx
    WorkspaceQuickSearch.tsx
    PageHead.tsx
    StudioNavigation.tsx
    EngineCommandDock.tsx      — scoped request dialog ("Ask engine")
    NetworkMap.tsx
    RecordInspector.tsx
    RollDirectory.tsx
    RollEntryCard.tsx
    RollEntryRow.tsx
    RollFilterBar.tsx
    RollViewToggle.tsx
    DirectoryEntryCard.tsx
    DirectoryEntryRow.tsx
    FilterBar.tsx
    ViewToggle.tsx
    BrandMark.tsx
    Button.tsx
    Card.tsx
    Input.tsx
    ChangeSetDock.tsx
    ContextBackLink.tsx
    EngineActivityStrip.tsx
    ForkGlyph.tsx
    IdentityCabinet.tsx
    RadarSpatialPanel.tsx
    RingedEvidenceMarker.tsx
    ui/Button.tsx
    ui/Input.tsx
    ui/Select.tsx
    ui/index.ts
    landing/OperatingMap.tsx
    people/EntityInspector.tsx
    people/PeopleDirectory.tsx
    people/PeopleProfileEditor.tsx
    workbench/PageAgentPanel.tsx

  pages/
    Auth.tsx
    Landing.tsx
    InvestorMemo.tsx
    workspace/
      WorkspaceLayout.tsx
      WorkspaceOverview.tsx
      Annals.tsx
      AptCoinLab.tsx
      Commons.tsx
      Institutions.tsx
      Network.tsx
      People.tsx
      Records.tsx
      Roll.tsx
      commons/CommonsExchange.tsx
      commons/CommonsSignalDetail.tsx
      commons/CommonsSignalQueue.tsx
      commons/GovernancePanel.tsx
      commons/OpportunitiesPanel.tsx
      commons/ReportForm.tsx
      commons/useCommons.ts
      institutions/InstitutionInspector.tsx

  modules/
    workbench/          — Home, Pilot pages, data, styles
    kemetos1/           — Coordinator layer (App, coordinator, llm, styles)
    benben-os/          — separate school-management prototype (NOT an APT-LABS module)

  vite-env.d.ts
```

## Domain modules

- **Commons** — field signals, proposals, stewards
- **Network** — people, entities, relationships
- **Workbench** — opportunities, applications, delivery, simulation
- **Records** — canon / annals / roll lenses
- **Intelligence** — APT Coin Lab research (static page)

## School Console

Nested operational boundary under Workbench (workplace where people take jobs), not a primary module. Tender drafts for three demo scenarios: Kibera Makerspace workshop bench, Kemetos AGI1 research station, Thiba Hydro fabrication rig.

## Auth

Demo mode (localStorage) when Supabase env vars unset. Roles: `institution` | `founder` | `coordinator` | `admin`. No live authentication; browser-local only.

## Persistence

Browser storage: localStorage keys `aptlabs:sbt-attestations:v1`, `aptlabs:agent-proposals:v1`, `aptlabs:workbench-local-flow:v1`, `demo_roll_entries`; IndexedDB for school-console-storage.

## Test files (verified, 12 files / 74 tests)

`src/lib/db/roll.test.ts`, `src/lib/institutions-register.test.ts`, `src/lib/intelligence/registry.test.ts`, `src/lib/mock-radar-map-provider.test.ts`, `src/lib/people-discovery.test.ts`, `src/lib/people-profiles.test.ts`, `src/lib/radar-view.test.ts`, `src/lib/records-view.test.ts`, `src/lib/studio-navigation.test.ts`, `src/lib/workspace-activity.test.ts`, `src/lib/workspace-overview.test.ts`, `src/lib/workspace-search.test.ts`
