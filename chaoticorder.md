# ChaoticOrder — Handoff Summary

**Date:** 2026-11-06  
**Agent:** Claude Opus 5.5  
**Session:** Syncing `/home/zion/projects/dreamer/` with `/mnt/c/Users/zION/Documents/dreamer/`

---

## What I Was Doing

Systematically copying the complete actual project (in Windows Documents via WSL) into the working directory. The actual project is far more complete — it has Supabase integration, network data model, School Console IndexedDB, 15 workspace routes, 30+ components, portable record formats, local governance workflows.

**Progress:** Copied ~20 lib files (~60% of lib directory), created directory structure. Still need: remaining lib files, all components (including subdirectories), all workspace pages, styles.css, App.tsx updates.

---

## Project Essence (as I grasp it)

**APT-LABS / Dreamer** — A local-first "Field Studio" for community infrastructure work. Five-module flow:

1. **Commons** — Signals, governance, shared resources
2. **Network** — People, institutions, capabilities (31 entities, 34 relationships, 17 kinds)
3. **Workbench** — Field Desk (Tender simulation engine), School Console (IndexedDB, local-first)
4. **Records** — Canon, Annals, Roll (immutable, hash-anchored)
5. **Intelligence** — AptCoin Lab

**Core domain:** TENDER as primary entity (Issuer + Commons Ref + Crew + Spec), lifecycle: draft → submitted → funded → deployed

**Stack:** Preact 10.24 + Vite 5.4 + Wouter 3.3 + @preact/signals 1.3 + TypeScript 5.6 strict + Vitest 2.1  
**Auth:** Demo mode (localStorage) + Supabase production with RLS  
**Data:** All local-first (localStorage/IndexedDB), no external sync without explicit provider

**Design system:** CSS variables in styles.css (384KB) — color primitives, semantic roles, modular scale 1.25, baseline 8px + Fibonacci spacing, dark/light variants

---

## Where We Are

| Area | Status |
|------|--------|
| `src/lib/constants.ts` | ✅ Created (shared types for People/FieldDesk) |
| `src/lib/people-network.ts` | ✅ Copied |
| `src/lib/people-profiles.ts` | ✅ Copied |
| `src/lib/school-console-storage.ts` | ✅ Copied |
| `src/lib/workbench-simulation.ts` | ✅ Copied |
| `src/lib/workbench-simulation-store.ts` | ✅ Copied |
| `src/lib/workbench-interest.ts` | ✅ Copied |
| `src/lib/local-workflows.ts` | ✅ Copied |
| `src/lib/local-workbench.ts` | ✅ Copied |
| `src/lib/radar-view.ts` | ✅ Copied |
| `src/lib/school-marking.ts` | ✅ Copied |
| `src/lib/mock-radar-map-provider.ts` | ✅ Copied |
| `src/lib/ecosystem-examples.ts` | ✅ Copied |
| `src/lib/people-discovery.ts` | ✅ Copied |
| `src/lib/studio-navigation.ts` | ✅ Copied |
| `src/lib/db/roll-hash.ts` | ✅ Copied |
| `src/lib/db/roll.ts` | ✅ Copied |
| `src/lib/db/network.ts` | ❌ Not yet |
| `src/lib/db/work.ts` | ❌ Not yet |
| `src/lib/db/index.ts` | ❌ Not yet |
| `src/lib/storage/evidence.ts` | ❌ Not yet |
| `src/lib/storage/index.ts` | ❌ Not yet |
| `src/lib/supabase/client.ts` | ❌ Not yet |
| `src/lib/supabase/index.ts` | ❌ Not yet |
| `src/lib/auth/hooks.ts` | ❌ Not yet |
| `src/lib/auth/types.ts` | ❌ Not yet |
| Components (30+) | ❌ Not yet |
| Workspace pages (15) | ❌ Not yet |
| styles.css (384KB) | ❌ Not yet |
| App.tsx routes | ❌ Not yet |
| FieldDesk.tsx imports | ❌ Not yet |

---

## My Weaknesses (for next agent)

- **Too slow** — writing files one-by-one instead of batching or using shell cp
- **No verification** — didn't run `npm run build` or `tsc` to confirm compiles
- **Incomplete context** — haven't read all components/pages yet, so imports may break
- **Perfectionism** — writing full file contents instead of streaming copies

---

## Direction for Next Agent

1. **Fast-copy remaining lib files** — use `cp -r` for directories, then verify
2. **Copy components & pages in bulk** — shell commands, not Write tool
3. **Copy styles.css** — it's 384KB, don't write manually
4. **Update App.tsx** — add all 15 workspace routes
5. **Fix FieldDesk.tsx imports** — use constants.ts
6. **Run build & tests** — `npm run build && npx vitest run`
7. **Push to remote** — keep branch working for Lovable sync

---

## Key Files to Reference

- `/mnt/c/Users/zION/Documents/dreamer/` — SOURCE OF TRUTH (complete project)
- `/home/zion/projects/dreamer/` — WORKING DIRECTORY (in progress)
- `src/lib/constants.ts` — Shared types (InstitutionId, CommonsId, CrewRole, Archetype, MOCK_PEOPLE)
- `src/lib/supabase/client.ts` — Demo/production switch via `isDemoMode`
- `src/lib/auth/hooks.ts` — useAuth with demo fallback
- `src/pages/workspace/FieldDesk.tsx` — Workbench simulation engine (main complex component)
- `src/components/StudioNavigation.tsx` — Module rail + sidebar + identity cabinet

---

**Next agent:** Start with `cp -r /mnt/c/Users/zION/Documents/dreamer/src/lib/* /home/zion/projects/dreamer/src/lib/` then verify, then components/pages/styles. Don't write files manually — copy them.