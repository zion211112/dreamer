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
  styles.css           — monolithic stylesheet (~16.5k lines, tokens + components)
  lib/
    people-network.ts  — network entity/relationship types + mock data
    people-discovery.ts
    people-profiles.ts
    supabase/
      client.ts        — Supabase client + demo-mode flag
    auth/
      types.ts         — UserRole, Profile, AuthState, etc.
  components/
    NetworkMap.tsx     — canonical network map (fixed layout + force simulation)
    Button.tsx         — inline styles (candidate for CSS-class migration)
    Card.tsx           — inline styles (candidate for CSS-class migration)
    Input.tsx          — inline styles (candidate for CSS-class migration)
    PageHead.tsx       — shared page header component
    people/            — (NetworkMap.tsx removed — deduped into components/)
  pages/
    Landing.tsx
    Auth.tsx
    InvestorMemo.tsx
    workspace/
      WorkspaceLayout.tsx  — app shell
      Network.tsx          — force-directed network graph + sidebar
      People.tsx           — directory + network tab view + EntityInspector
      Institutions.tsx
      Commons.tsx          — largest page (~875 lines, candidate for split)
      FieldDesk.tsx        — `export const FieldDesk = Workbench;` alias (~507 lines)
      SchoolConsole.tsx    (~425 lines, candidate for split)
      WorkbenchFinder.tsx
      Records.tsx
      Annals.tsx
      AptCoinLab.tsx
```

## Domain modules
- **Commons** — field signals, proposals, stewards
- **Network** — people, entities, relationships (force-directed graph)
- **Workbench** — opportunities, applications, delivery
- **Records** — canon / annals / roll lenses
- **Intelligence** — APT Coin Lab research

## Routing (src/App.tsx)
Canonical routes under `/workspace/{module}`. Old alias routes were removed (Phase 3). Wouter `Switch` renders first match.

## Auth
Demo mode (localStorage) when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset, or `VITE_DEMO_MODE=true`. Roles: `institution` | `founder` | `coordinator` | `admin`.

## Build
`npm run build` → `tsc` + `vite build` → `dist/` (~315 KB JS, ~305 KB CSS gzipped)

## Tests
`npm run test:unit -- --run` → Vitest, 11 files, 85 tests.

## Known cleanup candidates (deferred)
1. **styles.css** — split into `tokens.css` / `reset.css` / `utilities.css` / `auth.css` / `shell.css` / `components.css`; remove dead legacy color aliases (`--terrain`, `--brand-main`, `--steel`, `--oxide`)
2. **Button.tsx / Card.tsx / Input.tsx** — migrate inline `style` objects to CSS classes
3. **Commons.tsx / FieldDesk.tsx / SchoolConsole.tsx / Institutions.tsx / People.tsx** — split into sub-components <300 lines each
4. **CODEBASE.md** — this file; keep in sync with structural changes

## Guardrails (AGENTS.md)
- Speed and wit: smallest change that ships. Delete before refactor; refactor before add.
- Never break the build: `npm run build` and `npm run test:unit -- --run` must be green before starting the next phase.
