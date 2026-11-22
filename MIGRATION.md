# Migration Manifest: Vue 3 → Angular 21 (Nx monorepo, strangler-fig)

**Disjoint scope:** this file only. No changes to `src/`, `package.json`, `package-lock.json`, or anything else. Nothing committed.

## Evidence labels (per AGENTS.md)

`VERIFIED | PROTOTYPE | TARGET | PLANNED | UNKNOWN`
Default every phase and package to `TARGET` / `PLANNED`. Nothing is `VERIFIED` until it builds, passes tests, and is reviewed.

## Phases

**Phase 1 — Foundation** (PLANNED)
- `npx create-nx-workspace@latest apt-labs --preset=angular-standalone`
- Move the existing Vue app into `apps/legacy-vue/`
- Generate the Angular shell: `nx g @nx/angular:app apt-labs-shell`
- Rule: no new Vue or React code is written after Phase 1 begins. (TARGET)

**Phase 2 — Shell & shared libs** (PLANNED)
- Migrate the workspace shell first: 4-column layout, router, auth, global search.
- Extract shared UI primitives into `libs/shared/ui/` as one-component-per-library so the bundler tree-shakes per component. (TARGET)

**Phase 3 — Domain & feature migration, dependency order** (PLANNED)
ontology → commons → network → work → records → intelligence. Each domain lands behind `libs/features/{commons,network,work,records,intelligence}`.

**Phase 4 — Decommission & enforce boundaries** (PLANNED)
- Delete `apps/legacy-vue/`
- Add Nx tags + ESLint `@nx/enforce-module-boundaries` so shared libs can never import feature libs.

## Target library structure

- `libs/ontology`
- `libs/shared/ui`
- `libs/features/{commons,network,work,records,intelligence}`
- `libs/identity`
- `libs/proof`
- `libs/graph`

## Target package table

| Package | Label |
|---|---|
| Angular 21 | TARGET |
| @spartan-ng/brain + @spartan-ng/helm (Spartan/ui) | TARGET |
| @ng-agentic/core | TARGET |
| cytoscape-angular | TARGET |
| @ngxpert/cmdk | TARGET |
| shacl-ui | TARGET |
| @tanstack/angular-query-experimental | TARGET |
| energy-web-iam-client / anon-identity | TARGET |
| StellaOps Proof Spine | TARGET |

Every phase defaults to PLANNED; every package defaults to TARGET. Promote to VERIFIED only after build + test + review pass for that item.
