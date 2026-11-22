# APT-LABS — Vue → Angular Nx Migration Mapping

Status: TARGET / PLANNED (evidence-labelled per AGENTS.md). Flagship mapping produced by C
(codebase-memory-grounded, 2026-11-22), reconciled with A2's package verification. Do NOT
treat as VERIFIED. Source of truth: project `C-Users-zION-Documents-dreamer` (~27.9k nodes).
Open gating items at the bottom.

## Vue artifact → target Nx lib → Angular piece → owning package

| Current Vue artifact | Target Nx lib | Angular piece | Owning package | Status |
|---|---|---|---|---|
| src/lib/ontology/{actions,events,evidence,index,registry,relationships,types,workflow}.ts | libs/ontology | OntologyService + entity/relationship types | internal (root dep) | TARGET |
| src/shell/{WorkspaceShell,AgentDock,ModuleNav,ModuleRail,JobController,SessionReference}.vue + agent-intents/{registry,icons}.ts | libs/shell | shell components + SessionReferenceService | @spartan-ng/helm (Spartan/ui) | TARGET — pending A1 |
| src/pages/workspace/{UserDashboard,Commons,Network,Records,Value,WorkspaceOverview}.vue | libs/workbench/* | page components; NetworkPage → graph view | Spartan/ui + cytoscape-angular | TARGET — pending A1 |
| src/modules/intelligence/{lib/intelligence.ts,pages/Intelligence.vue} | libs/intelligence | IntelligenceService | @tanstack/angular-query-experimental v5.106.0 (VERIFIED) | pkg VERIFIED / wiring TARGET |
| src/modules/workbench/pages-vue/{Pilot,Home}.vue | libs/pilot | PilotPage | Spartan/ui | TARGET — pending A1 |
| src/pages/workspace/Coordination.vue + src/stores/coordination.ts | libs/coordination | CoordinationService | internal (Angular signals) | TARGET |
| src/lib/auth/* | libs/auth | AuthService | energywebfoundation/iam-client-lib (UNVERIFIED npm name); fallback = custom AuthService | UNVERIFIED |
| src/pages/workspace/Proof.vue | libs/proof | ProofPanel | SELF-BUILT on Spartan/ui + 4 evidence states (VERIFIED/PROTOTYPE/TARGET/PLANNED/UNKNOWN). Doc's "StellaOps Proof Spine" REFUTED by A2. | CORRECTED |
| src/lib/{record-search,record-envelope}.ts | libs/search | SearchService | @ngxpert/cmdk v3.0.0 (VERIFIED; Angular-18 base, v21 UNCONFIRMED) | TARGET |
| src/components/ui/{EmptyState,FlowRail,MetricTile,SectionHead,Button,Card,...}.vue | libs/shared/ui | primitives | @spartan-ng/helm (Spartan/ui) | TARGET — pending A1 |
| src/components/**/*.tsx (130 React BoardUI files) | DO NOT PORT | wrap in apps/legacy-vue OR replace with @ng-agentic/core + Spartan | @ng-agentic/core (pending A1) | DO-NOT-PORT |

## Phase 3 dependency-depth order

Serial chain: D0 libs/ontology → D1 libs/shared/ui + libs/shared/state → D2 libs/shell →
D3 (parallel) feature libs → D4 apps/legacy-vue (last).

- D3 parallel set: workbench, intelligence, pilot, coordination, network, records, value, commons, search, auth, proof.
- All D3 build in parallel AFTER D2 lands. apps/legacy-vue is built last, then deleted in Phase 4.

## Risk notes

1. 130 React .tsx files not 1:1 migratable — do-not-port; wrap in apps/legacy-vue or replace with @ng-agentic/core + Spartan.
2. Half-built WIP src/components/ui/{EmptyState,FlowRail,MetricTile,SectionHead}.vue have unstable APIs.
3. shell↔pages cross-imports risk import cycles when split into libs.
4. Dual workbench impls: data.ts vs data-vue.ts.
5. Pinia stores → Angular signals/services (not 1:1).
6. Vue Router (src/modules/router.ts; routes /workspace/commons, /workspace/coordination) → Angular Router.

## Open — gating the final target stack (pending A1)

- Angular 21 zoneless-by-default + standalone-only: unconfirmed.
- @spartan-ng/brain + @spartan-ng/helm (Spartan/ui): unconfirmed.
- @ng-agentic/core (agent surface): unconfirmed — load-bearing for the do-not-port React replacement.
- cytoscape-angular: unconfirmed.
- Identity lib publish name (energywebfoundation/iam-client-lib): unconfirmed.
- @ngxpert/cmdk Angular-21 compatibility: unconfirmed.

## Corrections applied vs. the strategy doc

- "StellaOps Proof Spine" → REFUTED (A2: no such Angular reference found). Replaced with a self-built ProofPanel on Spartan/ui driven by the 4 evidence states.
- "anon-identity" → not found (A2). Identity path now energywebfoundation/iam-client-lib (name unconfirmed).
- "shacl-ui" clarification: the mature lib is ULB-Darmstadt/shacl-form v4.0.1; Kurrawong/shacl-ui is pre-1.0.
- Skills: only `angular-migration` of the four claimed migration skills is real (see SKILLS_MIGRATION.md).
