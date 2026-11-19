# APT-LABS — Initial Quality Baseline

**Purpose:** Establish the current build, test, type-check, and design-gate baseline before the Preact→Vue migration and n8n orchestration layer are introduced. All future quality measurements are compared against this baseline.

**Source:** `npm run build` (`tsc && vite build`), `npm run test:unit` (vitest), `npx tsc --noEmit`, `docs/architecture.md`, `AGENTS.md`, git status.

**Status:** Current repository HEAD (master). Generated 2026-11-19.

**Note:** Baseline has NOT been executed in this session (vitest harness reportedly needs `npm ci`). Values below are from documentation; execution is required to confirm.

---

## 1. Build

| Check | Command | Expected | Status |
|-------|---------|----------|--------|
| Type check | `npx tsc --noEmit` | Clean, strict | Pending execution |
| Vite build | `vite build` | `dist/` produced | Pending execution |
| Full build | `npm run build` | `tsc && vite build && investor-deck build/copy` | Pending execution |
| Dev server | `npm run dev` | Vite dev server on localhost | Pending execution |

**Build script:** `tsc && vite build && npm run build:investor-deck && npm run copy:investor-deck`. The investor-deck build is coupled to the main build (see TD-14 in TECHNICAL_DEBT_REGISTER.md).

## 2. Tests

| Check | Command | Expected | Status |
|-------|---------|----------|--------|
| Unit tests | `npm run test:unit -- --run` | All test files pass | Pending execution |
| Test count | — | 12–13 files, 74–78 tests (discrepancy: TD-03) | Pending execution |

**Test files (per `docs/architecture.md`):**
1. src/lib/db/roll.test.ts
2. src/lib/institutions-register.test.ts
3. src/lib/intelligence.test.ts (deleted in working tree)
4. src/lib/intelligence/registry.test.ts
5. src/lib/mock-radar-map-provider.test.ts
6. src/lib/people-discovery.test.ts
7. src/lib/people-profiles.test.ts
8. src/lib/radar-view.test.ts
9. src/lib/records-view.test.ts
10. src/lib/studio-navigation.test.ts
11. src/lib/workspace-activity.test.ts
12. src/lib/workspace-overview.test.ts
13. src/lib/workspace-search.test.ts

**Discrepancy (TD-03):** `docs/architecture.md` says 13 files / 78 tests; `AGENTS.md` says 12 files / 74 tests. One file (`src/lib/intelligence.test.ts`) is deleted in the working tree, which may explain the difference. Execution required to establish true baseline.

**Known issue (TD-04):** Vitest harness reportedly broken, needs `npm ci`. Must run `npm ci` before tests can execute.

## 3. Design gates (Better Design)

| Check | Tool | Expected | Status |
|-------|------|----------|--------|
| Copy lint | `copy-lint.mjs` | Pass | Not yet run |
| Consistency check | `consistency.mjs` | Pass | Not yet run |
| Check | `check.mjs` | Pass | Not yet run |
| Gate | `gate.mjs --start ... --kind software --category ... --primary ...` | `GATE: PASS` at 1440, 1024, 768, 390 | Not yet run |
| inspect-spacing | DOM evidence | Pass | Not yet run |

These gates come from the design-taste-frontend skill (tasteskill 2.5). They have not been run on this codebase yet (TD-10). Required before shipping any new UI screen.

## 4. Code quality indicators

| Indicator | Value | Source |
|-----------|-------|--------|
| TypeScript | strict mode | `tsconfig` (inferred from AGENTS.md "TypeScript 5.6 strict") |
| Package manager | npm (lockfile present) | `package-lock.json` modified |
| Node engines | ^20.19.0 || >=22.12.0 | `package.json` |
| ESLint | Not listed in devDependencies | `package.json` |
| Prettier | Not listed in devDependencies | `package.json` |

## 5. Security posture (baseline)

| Item | Value | Source |
|------|-------|--------|
| Demo mode | localStorage when Supabase env vars unset | `src/lib/supabase/client.ts` |
| Auth roles | institution, founder, coordinator, admin | `src/lib/auth/types.ts` |
| Agent host | proposes-never-executes | `src/lib/agent-host.ts` |
| No blockchain prerequisite | Confirmed (charter A8) | `docs/design/charter.md` |
| n8n | Not yet integrated | No `n8n/` directory |

## 6. Known gaps at baseline

| Gap | ID | Severity |
|-----|----|----------|
| Vue 3 foundation not yet created | TD-01 | High |
| Ontology layer (`src/lib/ontology/`) does not exist | TD-06 | High |
| n8n workflows directory does not exist | TD-07/TD-13 | High |
| Migration ADR not written | TD-11 | Medium |
| Stale docs (`architecture.md`, `AGENTS.md`) | TD-08/TD-09 | Medium |
| Deleted intelligence file references | TD-02 | High |
| Vitest harness not verified | TD-03/TD-04 | High |

## 7. Definition of "green" for migration

The migration is considered to have preserved quality when all of the following hold:

1. `npx tsc --noEmit` passes (strict) on the migrated codebase.
2. `npm run build` produces `dist/` without errors.
3. `npm run test:unit -- --run` passes (equivalent test count to baseline, or higher with Vue Test Utils tests).
4. Existing localStorage keys and IndexedDB database remain functional (demo mode unchanged).
5. Portable record export/import round-trips without data loss.
6. Roll hash-anchor verification produces valid anchors.
7. Design gates pass (`GATE: PASS` at 1440, 1024, 768, 390) for any new UI screen.
8. No P1–P6 preserve-register capability is degraded (see `CAPABILITY_PRESERVATION_REGISTER.md`).

## 8. Next steps

1. Run `npm ci` to restore the test harness (TD-04).
2. Run `npm run test:unit -- --run` to establish true test baseline (TD-03).
3. Run `npx tsc --noEmit` to establish type-check baseline.
4. Run `npm run build` to establish build baseline.
5. Create the frontend migration ADR (mandate §5 step B).
6. Create `src/lib/ontology/` (mandate §7.2).
7. Create `n8n/workflows/` (mandate §5 step C/D).
