# Asset Chains and Ecosystem Maturation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the active Studio share one coherent illustrative entity catalog and three read-only, typed asset journeys without presenting local examples as live operations.

**Architecture:** Keep `people-network.ts` as the source for the canonical sample relationship graph while preserving imported portable People records as a separate user-selected dataset. Add a dedicated immutable example-fixture module consumed by Commons and Workbench, and a small contextual return-link component for routes entered from another Studio surface. Domain workflows and local user records remain separate from fixture journeys.

**Tech Stack:** Vite, Preact, TypeScript, Wouter, existing localStorage models and CSS tokens.

**Spec:** [2026-10-31-asset-chains-and-ecosystem-maturation-design.md](../specs/2026-10-31-asset-chains-and-ecosystem-maturation-design.md)

## Global Constraints

- The active application remains Vite + Preact + TypeScript + Wouter; do not add a backend, chain, wallet, payment rail, Fikra API, or issuer.
- The sample catalog has exactly 9 people, 5 crews, and 9 assets; `Zuri Kamau`, `Learning Media Crew`, and `EX-AS-01` through `EX-AS-09` are explicitly illustrative.
- The canonical sample registry and imported `aptlabs:people-network:v1` records remain separate, readable, and unmodified by fixture display.
- Example decisions, applications, work, briefs, funding, Roll, and credential data never enter user localStorage or workflow transitions.
- Preserve the distinct physical Tender/Assembly/Roll path and creative/software contribution path; do not flatten them into one state machine.
- Do not add a test runner or dependency; the active package has no configured automated test command. Validate with `npm run build` and direct browser checks.
- Show only contextual return links when origin is known; keep the Studio rail as primary navigation.
- No demo content may imply real ownership, staffing, activity, authority, settlement, deployment, credential, investment, or traction.

## Review Focus

- **Imported graph collision:** confirm an imported record with IDs matching sample entities remains stored and separately selectable; sample entities retain canonical labels and references.
- **Dangling or duplicate registry links:** verify every relationship, signal, decision, opportunity, application, work sample, and brief resolves to a stable entity/opportunity ID exactly once.
- **Scenario leakage:** verify read-only sample decisions/applications/briefs do not change Commons proposals, saved-application counts, Workbench localStorage, or the real Kemoly local profile.
- **Authority confusion:** verify an illustrative approved decision cannot seed an authorized brief and a sample evidence chain cannot create Roll or credentials.
- **Contextual return correctness:** verify signal/proposal context returns to Commons, asset/project context returns to Institutions, and unscoped routes do not show a redundant back link.

---

### Task 1: Canonical sample registry and People data boundary

**Files:**
- Modify: `src/lib/people-network.ts`
- Modify: `src/pages/workspace/People.tsx`
- Modify: `src/components/people/EntityInspector.tsx`
- Modify: `src/components/people/NetworkMap.tsx` only if needed to expose sample asset references/provenance accessibly

**Interfaces:**
- `RecordBasis = 'illustrative' | 'local-profile' | 'project-reported'` records the basis without asserting verification.
- `NetworkEntity` gains optional `assetReference?: string` and `recordBasis?: RecordBasis`; existing portable version 1 imports remain valid when these fields are absent.
- `PEOPLE_NETWORK` and `PEOPLE_RELATIONSHIPS` remain the canonical sample graph and retain their existing stable IDs where possible.
- `readImportedPeopleNetworkRecord(): PeopleNetworkRecord | null` reads and validates the stored portable record without modifying it.
- `People` defaults to the sample graph and exposes the imported portable graph as a separate selectable dataset when one exists. Import switches to that dataset; it does not merge or replace the sample constants.
- `createPortablePeopleRecord(record?: PeopleNetworkRecord): string` continues exporting the selected graph while preserving the existing format/version envelope.

- [ ] **Step 1: Expand the canonical graph and mark provenance**

  Retain existing person, crew, asset, work, institution, evidence, and relationship IDs where possible. Add Zuri Kamau and Learning Media Crew as illustrative; add the nine asset register references `EX-AS-01` through `EX-AS-09`. Add only relationships supported by the design spec and label unsupported membership/capability claims illustrative or project-reported.

- [ ] **Step 2: Preserve portable-record separation**

  Add `readImportedPeopleNetworkRecord()` and route the People page between the canonical sample graph and the existing imported portable graph. Keep `aptlabs:people-network:v1` data untouched; tolerate older records without optional provenance/reference fields.

- [ ] **Step 3: Surface asset identity and provenance**

  In the People inspector, show sample asset reference and record basis as compact metadata. Show Kemoly's SBT count only as a reported claim with issuer/status unavailable; do not render it as a credential or badge.

- [ ] **Step 4: Validate registry counts and import compatibility**

  Run `npm run build`. In browser, confirm counts of 9 people, 5 crews, and 9 assets; import a portable record containing a colliding stable ID and a custom ID, switch between sample/imported datasets, and confirm neither dataset is rewritten or silently merged.

### Task 2: Institutions derived from the shared registry

**Files:**
- Modify: `src/pages/workspace/Institutions.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes `PEOPLE_NETWORK` and `PEOPLE_RELATIONSHIPS` from Task 1.
- Institution and asset rows resolve names, types, location, `assetReference`, and supported relationships from the canonical graph instead of duplicating those labels inline.
- Existing routes/actions remain: School Management Console opens its nested route; other asset actions retain their current destination; Fikra API remains profile-only.

- [ ] **Step 1: Replace duplicated records with registry-derived records**

  Build the displayed Institutions list from canonical institution and asset records. Preserve the existing three organization records, add repository-supported institutions such as Lacesse Co, Solar Commons Cooperative, Kibera Makerspace, and Open Design Library, and show all nine assets with their sample references. Do not invent owners or confirmed locations.

- [ ] **Step 2: Refine asset metadata presentation**

  Show asset reference as a sample register ID, distinct from asset title, physical serial, ownership, or live status. Retain the restrained editorial row layout and avoid adding valuation or status metrics.

- [ ] **Step 3: Validate shared identity consistency**

  Run `npm run build`. In browser, verify the nine asset labels/references match the People graph, Institution and Asset filters work, the School Console action still opens its route, and Fikra API has no unsupported action.

### Task 3: Five Commons signals and three example decisions

**Files:**
- Create: `src/lib/ecosystem-examples.ts`
- Modify: `src/lib/local-workflows.ts`
- Modify: `src/pages/workspace/Commons.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- `EXAMPLE_FIELD_SIGNALS: FieldSignal[]` contains five sample cases and references canonical `institutionId`/`assetId` values. Add optional `assetId?: string` to `FieldSignal` so older saved records remain valid.
- `ExampleDecision` is a distinct read-only type with `id`, `caseId`, `institutionId`, `outcome: 'approved' | 'returned' | 'declined'`, `scope`, `reason`, and `recordBasis: 'illustrative'`.
- `EXAMPLE_DECISIONS: ExampleDecision[]` contains three examples and is never returned by `readCommonsGovernance()` or written to its storage key.
- `readFieldSignals()` retains its current fallback semantics and existing user records; only the no-saved-record example set expands from three to five.

- [ ] **Step 1: Define the typed example case fixtures**

  Add the two additional observations for microgrid load behavior and tool-library condition. Keep all five as scenarios with no invented telemetry, measurements, or verified cause. Link each case to canonical institution and asset IDs.

- [ ] **Step 2: Render decisions separately from governance records**

  Add a clearly titled example-decision section to the Commons Decisions view. Keep the actual `CommonsProposal` register and its count/actions separate. The approved example is read-only and has no button or ID path that can authorize a Workbench brief.

- [ ] **Step 3: Validate isolation and provenance**

  Run `npm run build`. In browser, confirm five example signals resolve to registry labels, three sample decisions appear separately from zero/local real proposals, and clicking or refreshing examples creates no governance record or Workbench draft.

### Task 4: Typed Workbench journeys, examples, and contextual return links

**Files:**
- Create: `src/components/ContextBackLink.tsx`
- Modify: `src/lib/ecosystem-examples.ts`
- Modify: `src/lib/local-workbench.ts`
- Modify: `src/pages/workspace/WorkbenchOpportunityFlow.tsx`
- Modify: `src/pages/workspace/FieldDesk.tsx`
- Modify: `src/pages/workspace/Commons.tsx`
- Modify: `src/pages/workspace/SchoolConsole.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- `WorkOpportunity` gains stable `institutionId`, `assetId`, and optional `crewId`; fixture records use only IDs from Task 1.
- `ExampleApplication` is a read-only fixture with `id`, `caseId`, `opportunityId`, `applicantId`, `applicationNote`, and `recordBasis: 'illustrative'`.
- `ExampleWorkRecord` is separate from `LocalWorkApplication` and has `id`, `caseId`, `assetId`, `summary`, `evidenceDescription`, and `recordBasis: 'illustrative'`.
- `ExampleBrief` is separate from `WorkBriefDraft` and has `id`, `caseId`, `preparedById`, `title`, `institutionId`, `assetId`, `scope`, `deliverables`, `rightsNote`, `compensationNote`, and `recordBasis: 'illustrative'`.
- `EXAMPLE_APPLICATIONS`, `EXAMPLE_WORK_RECORDS`, `EXAMPLE_BRIEF`, and three `EXAMPLE_ASSET_JOURNEYS` are exported from `src/lib/ecosystem-examples.ts`.
- `ContextBackLink` accepts `href: string` and `label: string`; it renders a compact accessible text link, not browser-history mutation.

- [ ] **Step 1: Reframe five Workbench contexts around registry entities**

  Link opportunities to the Community Solar Microgrid, School Management Console/Mwea school, Kemetos1, Community Tool Library, and Thiba Hydro Project. Use the physical-build, creative-work, and software-contribution paths as distinct types. Mark unknown location, terms, owner, or issuer as unknown; do not enable a real-submission claim where required terms are absent.

- [ ] **Step 2: Add isolated read-only application, work, and brief examples**

  Add a small set of examples, including a Kemetos1 example application by Kemoly Murage and one brief marked `EXAMPLE · DRAFT · NOT SAVED`. Display examples separately from local user application counts and lifecycle controls. No example fixture is written to `aptlabs:workbench-local-flow:v1`.

- [ ] **Step 3: Present three typed journey summaries**

  Link the microgrid physical-build case to the Commons observation/decision and show Tender/Blueprint, capital/settlement, Assembly, and Roll only as read-only illustrative stages. Link the school animation and Kemetos1 cases to their contribution paths, ending at acceptance/credential eligibility rather than physical Roll. Clearly state that all three are examples and that no live transition occurred.

- [ ] **Step 4: Add origin-aware return links**

  Workbench with `signal` or `proposal` returns to Commons; Workbench with `asset` returns to Institutions; institution-scoped Commons returns to Institutions; School Console reuses the shared component for its existing return action. Do not display the link on unscoped top-level views. Preserve `institution`, `signal`, `proposal`, and `asset` context where applicable.

- [ ] **Step 5: Validate separation and route behavior**

  Run `npm run build`. In browser, confirm example application/brief counts do not change user local records, no sample decision can create a real linked draft, each journey shows the correct distinct path, and back links target the correct parent with query context preserved.

### Final verification

- Run `npm run build` after all tasks.
- Confirm 9/5/9 catalog counts, five Commons example observations, three read-only decisions, five Workbench contexts, and three distinct journeys.
- Import an existing-format People record and confirm it remains available, unmodified, and separate from the shared sample catalog.
- Confirm no fixture writes to Commons governance, Workbench local applications/briefs, School Console IndexedDB, or any funding/credential store.
- Inspect at 320, 768, 1024, and 1440 px; verify keyboard access, visible provenance, contextual navigation, and no horizontal overflow.