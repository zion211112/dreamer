# B9 — Frontend Migration: Preact → Vue 3

| Field | Value |
|-------|-------|
| Decision ID | B9 |
| Date | 2026-11-19 |
| Rationale | User directive: "not angular but vue js". APT-LABS AUTONOMOUS TRANSFORMATION MANDATE §5 specifies Vue 3 + TypeScript as the frontend target. Preact 10.24 is the current UI framework; it must be migrated to Vue 3 to align with the mandate. |
| Scope | All UI components, routes, shell, state management, and the frontend entry point. The ontology layer (`src/lib/ontology/`) is framework-agnostic TypeScript and is not affected. Existing Preact code remains in place until each route is migrated incrementally. |
| Status | Accepted |
| Dependencies | Vue 3, TypeScript, Vite 6.4.5 (retained), Vue Router (or Wouter — TBD per route migration), Pinia, TanStack Query, Tailwind 4, APT fused design-system tokens, Reka UI / shadcn-vue, Lucide Vue icons, Zod, Vitest, Vue Test Utils |
| Supersedes | AGENTS.md §Stack ("Preact 10.24 + Vite 6.4.5 + TypeScript 5.6 strict + Wouter routing + Vitest 5.0.5") |

## Implementation approach

1. **Separate Vue entry point** — Build the Vue foundation alongside the existing Preact entry (`main.tsx`). Do not run Preact and Vue simultaneously in the same application runtime without a clearly justified, isolated integration design (mandate security constraint).
2. **Incremental route migration** — Migrate one representative route at a time (Workbench home → a pilot page → Commons, etc.). Each migrated route is verified with `tsc --noEmit`, `vite build`, and vitest/Vue Test Utils before the next route begins.
3. **Preserve register compliance** — All P1–P6 capabilities in `CAPABILITY_PRESERVATION_REGISTER.md` must continue to function after migration (auth semantics, demo mode, portable formats, append-only history, etc.).
4. **Design system** — Use the existing fused design-system tokens (`src/lib/aptlabs-fused-design-tokens.json`) and Structural Emergence design language (charter B4). Apply the design-taste-frontend finish gate (gate.mjs at 1440/1024/768/390) to each new Vue screen.

## What stays untouched

- Existing Preact modules not yet migrated (Commons, Network, Records, Intelligence pages)
- `src/lib/auth/` (demo mode + Supabase) — preserved per P1–P3
- `src/lib/people-network.ts` — preserved per P5
- `src/lib/db/roll.ts` — preserved per P6
- `src/lib/local-workflows.ts` — Commons signals, proposals, governance
- `src/lib/school-console-storage.ts` — IndexedDB school console
- `src/lib/sbt-attestations.ts` — SBT attestations
- `src/tailwind.css` — Tailwind v4 design-system CSS (retained)

## Verification

After each migration increment: `npm run build` (tsc + vite build) and `npm run test:unit -- --run` must be green. Design gates must pass for any new UI screen.
