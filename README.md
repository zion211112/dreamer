# APT-LABS (dreamer)

Infrastructure for making fragmented productive capacity visible, connectable, governable, locally retained, and cumulative.

One workspace, one shared graph, five modules: **Commons, Network, Workbench, Records, Intelligence**. School Console is a nested operational boundary under Workbench.

## Stack

- Preact 10.24 + Vite 6.4.5 + TypeScript 5.6
- Wouter client-side routing
- Vitest 5.0.5 (unit tests)
- Supabase (demo mode fallback when env vars unset)

## Key commands

```sh
npm ci              # install dependencies
npm run dev         # start dev server (localhost:3000)
npm run build       # tsc + vite build → dist/
npm run test:unit -- --run  # vitest
npx tsc --noEmit    # type check
```

Seed demo data from the browser console: `window.seedAPTLabsDemo()`

## Routes

| Route | Module |
|-------|--------|
| `/` | Landing |
| `/sign-in`, `/sign-up` | Demo auth |
| `/workspace/commons` | Commons — field signals, steward decisions |
| `/workspace/network/people` | Network — people & crews |
| `/workspace/network/institutions` | Network — institution & asset register |
| `/workspace/network/capabilities` | Network — capability directory |
| `/workspace/workbench` | Workbench — scope, assemble, coordinate work |
| `/workspace/workbench/:pilot` | Workbench — pilot lane |
| `/workspace/workbench/school-console` | School Console (nested under Workbench) |
| `/workspace/records/canon` | Records — canon lens |
| `/workspace/records/annals` | Records — annals lens |
| `/workspace/records/roll` | Records — roll lens |
| `/workspace/intelligence` | Intelligence — research page |
| `/workspace/intelligence/coin-lab` | Intelligence — coin lab (research only) |
| `/benben-os` | BenbenOS (separate prototype, not an APT-LABS module) |

## Docs

- `docs/architecture.md` — verified current technical architecture
- `docs/domain-model.md` — approved six-structure domain model
- `docs/decisions/` — accepted architectural decisions (ADRs)
- `docs/design/charter.md` — constitution (enduring principles + mutable decisions)
- `docs/APT-LABS-SYSTEM.md` — system reference (what exists, how pieces fit)

## Guardrails

- Smallest change that ships. Read the file before changing it.
- `npm run build` and `npm run test:unit -- --run` must be green before the next phase.
- Never break the working build.
