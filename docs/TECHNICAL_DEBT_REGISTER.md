# APT-LABS — Technical Debt Register

**Purpose:** Register of known technical debt, inconsistencies, and gaps in the current codebase, produced as mandated reconnaissance (§2). This register informs the Preact→Vue migration and n8n orchestration layer work; it is not a license to refactor indiscriminately.

**Source:** Direct file reads + git status + `docs/architecture.md` + `AGENTS.md`.

**Status:** Current repository HEAD (master). Generated 2026-11-19.

---

## 1. Debt items

| ID | Item | Severity | Location | Impact | Suggested resolution |
|----|------|----------|----------|--------|---------------------|
| TD-01 | **Preact codebase must migrate to Vue 3** | High | All of `src/` | Mandate §5 requires Vue 3; running Preact and Vue simultaneously is prohibited without isolated integration design | Create frontend migration ADR; build Vue foundation separately; migrate routes incrementally |
| TD-02 | **Deleted intelligence files still referenced** | High | `src/lib/intelligence.ts`, `src/lib/intelligence.test.ts`, `src/pages/workspace/Intelligence.tsx` (deleted in working tree); `docs/architecture.md` still lists them | Broken references; `src/App.tsx` imports `IntelligenceApp` from `./modules/intelligence` (exists) but old paths are gone | Reconcile `docs/architecture.md` and `AGENTS.md`; confirm `src/modules/intelligence/` is the canonical location; remove stale references |
| TD-03 | **Test count discrepancy** | Medium | `docs/architecture.md` (13 files, 78 tests) vs `AGENTS.md` (12 files, 74 tests) | Uncertainty about actual test baseline | Run `npm run test:unit -- --run` to establish true count; update both docs |
| TD-04 | **Vitest harness reportedly broken** | High | Working tree / environment (memory: "vitest harness still broken (npm ci needed)") | Cannot verify quality baseline until tests run | Run `npm ci` then `npm run test:unit -- --run`; fix any failures |
| TD-05 | **`auth/permissions.ts` referenced but does not exist** | Medium | `docs/architecture.md` lists `src/lib/auth/permissions.ts`; file does not exist | Inconsistent documentation; no centralized permissions module | Document that auth logic lives in `auth/hooks.ts` + `auth/types.ts`; either create `permissions.ts` or remove from docs |
| TD-06 | **No ontology layer exists** | High | `src/lib/ontology/` does not exist | Mandate §5 requires canonical ontology types (13 families, relationships, events, actions, registry, workflow) | Create `src/lib/ontology/` per mandate §7.2 |
| TD-07 | **No n8n integration exists** | High | No `n8n/` directory; no workflow definitions | Mandate §5 requires self-hosted n8n with 5 quality orchestration workflows | Create `n8n/workflows/` with commit, assign, verify, settle, produce workflows |
| TD-08 | **`AGENTS.md` stack section is stale** | Medium | `AGENTS.md` says "Preact 10.24" | Misleads agents about current/future stack | Update to reflect Vue 3 migration decision (per migration ADR) |
| TD-09 | **`docs/architecture.md` is stale** | Medium | Lists deleted `intelligence.ts`; omits `src/modules/intelligence/`; omits `src/lib/aptlabs-fused-design-tokens.json` | Architecture reference does not match reality | Update after migration to reflect new layout |
| TD-10 | **Design-taste-frontend skill present but unintegrated** | Low | `.claude/skills/design-taste-frontend/`, `.agents/skills/design-taste-frontend/`, `.github/skills/design-taste-frontend/` | Elite design bar not yet applied to the app | Apply design-taste-frontend review (gate.mjs, consistency.mjs, check.mjs) at 1440/1024/768/390 during UI builds |
| TD-11 | **No ADR for Vue migration or n8n** | Medium | `docs/decisions/` has B1–B8 only | No recorded decision for the two biggest architectural changes | Create migration ADR (mandate §5 step B) and n8n hosting ADR |
| TD-12 | **Inconsistent persistence keys across modules** | Low | Multiple localStorage keys (`aptlabs:people-network:v1`, `aptlabs:commons-signals:v1`, `aptlabs:workbench-drafts:v1`, `aptlabs:commons-governance:v1`, `aptlabs:workbench-items:v1`, `demo_roll_entries`, `authUser`, `aptlabs:sbt-attestations:v1`, `aptlabs:agent-proposals:v1`, `aptlabs:workbench-local-flow:v1`) + IndexedDB `apt-labs-school-console` | Fragmented storage; no unified storage abstraction | Consider a storage layer abstraction during migration; preserve all existing keys for data continuity |
| TD-13 | **No n8n quality orchestration** | High | No `n8n/` directory; no quality gates automated | Mandate §12 requires quality gates in n8n | Create 5 n8n workflows (commit, assign, verify, settle, produce) |
| TD-14 | **Investor deck build coupled to main build** | Medium | `npm run build` runs investor-deck build + copy | Slows main app build; failure in deck blocks app | Consider decoupling; not blocking for migration |
| TD-15 | **`src/tailwind.css` is 242KB and not fully audited** | Low | `src/tailwind.css` | Design system CSS may contain unused or conflicting tokens | Audit during migration; re-express tokens from `aptlabs-fused-design-tokens.json` |

## 2. Severity definitions

| Severity | Meaning |
|----------|---------|
| High | Blocks mandate compliance or build/test; must be resolved before or during migration |
| Medium | Causes inconsistency or uncertainty; should be resolved during migration |
| Low | Polish or hygiene; resolve opportunistically |

## 3. Items blocking migration start

The following must be addressed before or as part of the first migration increment:

- **TD-01**: Create frontend migration ADR; set up Vue 3 foundation separately from Preact entry.
- **TD-06**: Create `src/lib/ontology/` (canonical types, relationships, events, evidence, actions, registry, workflow).
- **TD-07 / TD-13**: Create `n8n/workflows/` with at least one kinetic action workflow (commit or verify).

## 4. Items to resolve during migration

- TD-02, TD-03, TD-04, TD-05, TD-08, TD-09: Reconcile docs and restore green build/tests.
- TD-10: Apply design-taste-frontend finish gate to new Vue screens.
- TD-11: Create migration + n8n ADRs.
- TD-12: Evaluate storage abstraction; preserve all existing keys.
- TD-14, TD-15: Opportunistic.

## 5. Relation to preserve register

All debt resolutions must respect `CAPABILITY_PRESERVATION_REGISTER.md` (P1–P6). In particular:

- TD-01 (Preact→Vue) must not change authentication semantics, demo mode behavior, or portable record formats.
- TD-06 (ontology layer) is additive; it does not replace `people-network.ts` or `roll.ts`.
- TD-07/TD-13 (n8n) must not execute unreviewed arbitrary model-generated shell commands (mandate security constraint).
