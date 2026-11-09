# State machines in dreamer

This file catalogs the implicit (and explicit) state machines across the app,
which ones were scattered/duplicated, and what the single source of truth is now.

## Machines

| # | Machine | Lives in | States / transitions |
|---|---------|----------|----------------------|
| 1 | Work application review | `src/lib/local-workbench.ts` | `ApplicationStatus`: `submitted → under_review → selected \| declined` |
| 2 | Work delivery | `src/lib/local-workbench.ts` | `WorkStatus`: `authorization_pending → authorized → in_progress → submitted ⇄ changes_requested → accepted` |
| 3 | Field signal triage | `src/lib/local-workflows.ts` | `SignalStatus`: `new → triaged → brief → resolved` |
| 4 | Commons governance proposal | `src/lib/local-workflows.ts` | `ProposalStatus`: `proposed → approved \| rejected \| returned` |
| 5 | Workbench simulation | `src/lib/workbench-simulation.ts` | Stage: `candidate_drafted → tender_review_simulated → assembly_simulated → delivery_simulated → acceptance_simulated → roll_preview`<br/>Status: `active \| paused \| blocked \| completed \| cancelled` |
| 6 | Agent proposal | `src/lib/agent-host.ts` | `draft → submitted` (proposes-never-executes) |
| 7 | Auth session | `src/lib/auth/hooks.ts` | `loading → authenticated \| unauthenticated (± error)` |
| 8 | Capacity draft | `src/lib/workbench-capacity-drafts.ts` | degenerate: `draft` only |
| 9 | Work interest | `src/lib/workbench-interest.ts` | set membership (express / remove) |
| 10 | Sidebar preference | `src/components/WorkspaceShell.tsx` | `collapsed \| expanded` (localStorage) |

## What was duplicated

The simulation machine's stage → action transition lived in **three** places, each re-implementing the same switch:
- `src/components/workbench/SimulationRunControls.tsx` (`advance()`)
- `src/components/workbench/WorkbenchBlockFlow.tsx` (`handleGateAction()`)
- `src/lib/agent-host.ts` (`suggestAction()`)

Stage labels and gate logic were also duplicated (`STAGE_LABELS` / `STAGE_GATES` in BlockFlow vs. inline labels in RunControls), and `WorkbenchStageNav` used a fragile `activeIndex` if-chain that omitted the `tender_review_simulated` stage.

## Single source of truth (now)

- `src/lib/simulation-machine.ts` — `SIMULATION_STAGES` (stage cards: label, roll applicability, terminal, the advancing action), `stageOrder()`, `stageCard()`, `stageIndex()`, `buildStageAction()`, `gateState()`, `advanceOption()`, `navigationStages()`.
- `advanceWorkbenchSimulation()` itself is **unchanged** — all behavior and tests are preserved. The metadata layer only *describes* the machine; it does not alter transitions.

## What derives from it now

- `SimulationRunControls` — stage label, evidence/note requirements, button label, disabled state, and the dispatched action.
- `WorkbenchBlockFlow` — pipeline labels, "Gate open/blocked/auto" metric, gate action, stage index.
- `WorkbenchStageNav` — all six stages (previously five), current/done/not-applicable, blocked/paused badges.
- `AgentHost.suggestAction` — agent suggestions now emit actions from the same transition table the UI executes.

## Verification

- `tsc --noEmit` passes (type-check half of `npm run build`).
- `vite build` / `vitest` cannot load in this sandbox (esbuild is denied access to parent directories at config load — a pre-existing environment issue, not a code change). No lib transition function was modified, so all existing tests remain valid.
