# APT-LABS — Existing System Map

**Purpose:** Baseline map of the current APT-LABS repository, produced as mandated reconnaissance (§2) before the Preact→Vue migration and n8n/orchestration layer are introduced. Describes what exists; does not define what should exist.

**Status:** Current repository HEAD (master). Generated 2026-11-19.

---

## 1. Stack (current)

| Layer | Tool | Version |
|-------|------|---------|
| Build | Vite | 6.4.5 |
| UI framework | Preact | 10.24 |
| Type safety | TypeScript | 5.6 strict |
| Routing | Wouter | 3.3.5 |
| Styling | Tailwind CSS | v4 |
| Auth/DB | Supabase | client + demo-mode fallback |
| Testing | Vitest | 5.0.5 |
| Signals | @preact/signals | ^1.3.0 |
| Icons | lucide-preact | ^1.72.0 |
| Validation | zod | ^4.6.7 |

Package name: `zeptepi` v0.0.1. Engines: Node ^20.19.0 || >=22.12.0.

Build command: `npm run build` → `tsc && vite build && npm run build:investor-deck && npm run copy:investor-deck`.
Test command: `npm run test:unit` → vitest.

## 2. Route inventory (canonical)

Source: `src/App.tsx` (wouter `Switch`/`Route`).

| Route | Component | Module | Notes |
|-------|-----------|--------|-------|
| `/` | Landing | Public | Landing page |
| `/sign-in` | Auth | Auth | Sign in |
| `/sign-up` | Auth | Auth | Sign up |
| `/workspace/workbench/:pilot` | WorkbenchApp | Workbench | Pilot-specific workbench page |
| `/workspace/workbench` | WorkbenchApp | Workbench | Workbench home |
| `/workspace/kemetos1` | Kemetos1App | Kemetos1 | Coordinator layer (not one of the 5 core modules) |
| `/workspace` | WorkspaceOverview | Home | Personal shell context / module selection |
| `/workspace/commons` | Commons | Commons | Field signals, proposals, stewards |
| `/workspace/network` | Network | Network | People, entities, relationships |
| `/workspace/network/people` | People | Network | People directory |
| `/workspace/network/institutions` | Institutions | Network | Institution directory |
| `/workspace/network/capabilities` | Network | Network | Capabilities view |
| `/workspace/records` | Records | Records | Canon / Annals / Roll entry lens |
| `/workspace/records/canon` | Records | Records | Canon lens |
| `/workspace/records/annals` | Records | Records | Annals lens |
| `/workspace/records/roll` | Records | Records | Roll lens (hash-anchored entries) |
| `/workspace/intelligence` | IntelligenceApp | Intelligence | Agents, matching, forecasting |
| `/workspace/intelligence/coin-lab` | AptCoinLab | Intelligence | APT Coin Lab (static page) |
| `/benben-os` | BenbenOS (lazy) | — | Separate school-management prototype; NOT an APT-LABS module |
| `/design-lab` | DesignLab | — | Design sandbox |

Six-module navigation scope (charter B1): Home + Commons, Network, Workbench, Records, Intelligence. School Console is nested under Workbench, not a primary module.

## 3. Source layout (src/)

```
src/
  App.tsx              — route switch (wouter)
  tokens.css           — design tokens (:root light luxury, [data-skin="dark"])
  tailwind.css         — 242KB design-system CSS
  main.tsx             — entry point

  lib/
    supabase/client.ts         — createClient, isDemoMode flag, getSupabase()
    auth/types.ts              — UserRole, Profile, AuthState, SignUpData, SignInData
    auth/hooks.ts              — useAuth (demo localStorage + Supabase session)
    people-network.ts          — 31 entities, 34 relationships; portable record format
    local-workflows.ts         — FieldSignal, WorkBriefDraft, ProposalStatus, GovernanceEvent
    db/roll.ts                 — RollEntry, hash_anchor, evidence layers, access control
    db/roll-hash.ts            — hash anchor computation
    db/network.ts              — network db layer
    db/work.ts                 — work db layer
    db/index.ts                — db barrel
    school-console-storage.ts  — IndexedDB ConsoleSnapshot (tender drafts, fee notes)
    sbt-attestations.ts        — mint/list/verify/export SBT attestations (localStorage)
    roll-sbt-bridge.ts         — accepted Workbench handoff to Roll entries + SBT
    agent-host.ts              — AgentHost class; proposes-never-executes
    demo-seed.ts               — seedDemoData(), 3 synthetic local scenarios
    local-workbench.ts         — applications, workStatus state machine
    workbench-simulation.ts    — 6-stage simulation pipeline, RollPreview
    workbench-simulation-store.ts — persistence for simulations
    storage/evidence.ts        — evidence storage
    storage/index.ts           — storage barrel
    studio-navigation.ts       — StudioContext, getStudioContextLabel
    workspace-overview.ts      — workspace overview data
    workspace-activity.ts      — workspace activity
    workspace-search.ts        — workspace search
    people-discovery.ts        — people discovery
    people-profiles.ts         — people profiles
    ecosystem-examples.ts      — ecosystem examples
    intelligence/registry.ts   — intelligence registry
    intelligence/types.ts      — intelligence types
    radar-view.ts              — radar view
    records-view.ts            — records view
    school-marking.ts          — MarkedPaper type

  components/
    WorkspaceShell.tsx         — app shell: sidebar, inspector, dock, statusbar, skin toggle
    PageHead.tsx               — page-head hierarchy (eyebrow→h1→subtitle→actions→metrics)
    StudioNavigation.tsx       — module switching rail
    RecordInspector.tsx        — contextual record inspector
    ChangeSetDock.tsx          — per-module change-set / evidence dock
    EngineCommandDock.tsx      — scoped "Ask engine" request dialog
    NetworkMap.tsx             — network relationship map
    RollDirectory.tsx          — roll directory
    RollEntryCard.tsx          — roll entry card
    RollEntryRow.tsx           — roll entry row
    RollFilterBar.tsx          — roll filter bar
    RollViewToggle.tsx         — roll view toggle
    DirectoryEntryCard.tsx     — directory entry card
    DirectoryEntryRow.tsx      — directory entry row
    FilterBar.tsx              — filter bar
    ViewToggle.tsx             — view toggle
    BrandMark.tsx              — brand mark
    Button.tsx                 — button
    Card.tsx                   — card
    Input.tsx                  — input
    ui/Button.tsx              — shadcn-style button
    ui/Input.tsx               — shadcn-style input
    ui/Select.tsx              — shadcn-style select
    ui/index.ts                — ui barrel
    landing/OperatingMap.tsx   — landing operating map
    people/EntityInspector.tsx — people entity inspector
    people/PeopleDirectory.tsx — people directory
    people/PeopleProfileEditor.tsx — people profile editor
    workbench/PageAgentPanel.tsx — page agent panel

  pages/
    Auth.tsx                   — sign in / sign up
    Landing.tsx                — landing
    workspace/
      WorkspaceLayout.tsx      — workspace layout
      WorkspaceOverview.tsx    — workspace overview (home)
      Annals.tsx               — annals page
      AptCoinLab.tsx           — coin lab page
      Commons.tsx              — commons page
      Institutions.tsx         — institutions page
      Network.tsx              — network page
      People.tsx               — people page
      Records.tsx              — records page
      Roll.tsx                 — roll page
      commons/CommonsExchange.tsx
      commons/CommonsSignalDetail.tsx
      commons/CommonsSignalQueue.tsx
      commons/GovernancePanel.tsx
      commons/OpportunitiesPanel.tsx
      commons/ReportForm.tsx
      commons/useCommons.ts
      institutions/InstitutionInspector.tsx

  modules/
    workbench/                 — Home, Pilot pages, data, styles
      pages/Home.tsx           — workbench home (pilot lanes, metrics)
    kemetos1/                  — Kemetos1 coordinator layer
    benben-os/                 — separate prototype (not an APT-LABS module)

  vite-env.d.ts
```

## 4. Core data model (existing)

### 4.1 People network (`src/lib/people-network.ts`)

- `EntityType`: person \| crew \| project \| asset \| work \| institution \| evidence
- `RelationshipKind`: membership \| affiliation \| work \| stewardship \| contribution \| evidence \| owns \| operates \| stewards \| funds \| contributes_to \| attests \| issues
- `RecordBasis`: illustrative \| local-profile \| project-reported
- `NetworkEntity`, `NetworkRelationship`, `PeopleNetworkRecord`, `PortablePeopleRecord`
- 31 entities + 34 relationships hardcoded as fixtures
- Persistence: localStorage key `aptlabs:people-network:v1`
- Functions: read/import/create/export portable record; validation `isNetworkEntity`, `isPortablePeopleRecord`
- Portable format: `aptlabs.people-network v1` (format, version, anchor, exportedAt)

### 4.2 Local workflows (`src/lib/local-workflows.ts`)

- `FieldSignal`: status (new|triaged|brief|resolved), urgency (routine|soon|urgent), verification fields
- `WorkBriefDraft`: compensationType (paid|unpaid|''), payment terms
- `ProposalStatus`: proposed \| approved \| rejected \| returned
- `CommonsGovernanceRecord`: stewards, proposals
- `GovernanceEvent`
- Steward authorization: `assignLocalSteward`, `createCommonsProposal`, `decideCommonsProposal`
- Persistence: localStorage keys `aptlabs:commons-signals:v1`, `aptlabs:workbench-drafts:v1`, `aptlabs:commons-governance:v1`
- `createLocalId` helper

### 4.3 Roll (`src/lib/db/roll.ts`)

- `RollEntry`: undertaking_id, undertaking_type (physical|digital|creative|hybrid), title, scope, deliverables, commissioned_by, participants (role_type: anchor|builder|apprentice|coordinator), evidence (layer: public|participant|restricted), acceptance, maintenance_obligations, recorded_at, recorded_by, hash_anchor, version
- `RollRevision`: change_type (correction|restriction_change|evidence_added)
- `RollEvidenceFile`
- Functions: createRollEntry, getRollEntry, queryRollEntries, addRollRevision, getRollRevisions, addRollEvidenceFile, getRollEvidenceFiles, verifyRollEntry, getRollAccess, filterRollEntryByAccess
- Demo mode: localStorage keys `demo_roll_entries`, `demo_roll_evidence_files`, `demo_roll_revisions`; 3 DEMO_ROLL_ENTRIES fixtures
- Hash-anchor provenance via `createCanonicalRollJson` / `computeHashAnchor`

### 4.4 Auth (`src/lib/auth/`)

- `UserRole`: 'institution' \| 'founder' \| 'coordinator' \| 'admin'
- `Profile`: id, role, display_name, avatar_url, organization_name, location, service_area[], created_at, updated_at, version, created_by, updated_by
- `useAuth`: demo mode (localStorage key `authUser`) when Supabase env vars unset; Supabase session otherwise
- Demo mode disclosures present; browser-local only, no live authentication

### 4.5 School Console (`src/lib/school-console-storage.ts`)

- IndexedDB database `apt-labs-school-console`, object store `local-work`, key `school-console-v1`
- `ConsoleSnapshot`: markedPapers, lessonDraft, completedTasks, inspectionChecks, tenderDrafts, feeNotes
- `SchoolTenderDraft`: assetName, need, assetBuildCost, projectedAnnualYield, localSpendPercentage, crewWageAllocation (anchor/builder/apprentice), blueprintLines[], economicModelNote, createdAt
- `LocalFeeNote`: description, amountKes
- Nested operational boundary under Workbench (workplace where people take jobs), not a primary module

### 4.6 Workbench data (`src/modules/workbench/data.ts`)

- `PilotKey`: benbenos \| kemetos \| minihydro \| mwea-animation-box \| open
- 5 pilot lanes (4 published + 1 open/illustrative), KES currency
- `WorkItem`: gate state machine (draft→proposed→in_review→pending_authorization→authorized→in_execution→pending_acceptance→accepted), evidence layers (public|participant|restricted), capital (financial KES, materials, conditions, deployed, escrowed), crew (anchor/builder/apprentice/coordinator + person ids), callSheet, credential, verification, settlement, learning, lifecycle events
- `createUndertakingFromProposal`, `registerUndertaking`, `advanceGate`, `assignCrewMember`, lifecycle/settlement/learning event recording
- Persistence: localStorage key `aptlabs:workbench-items:v1`, seed work items (wi-01…wi-08)

### 4.7 Workspace shell (`src/components/WorkspaceShell.tsx`)

- Skin mode: light \| observatory (localStorage `studioSkin`)
- Sidebar collapsed preference (localStorage `studioSidebarCollapsed`)
- Record inspector, change-set dock, statusbar with module label + environment label (Local demo / Configured)
- `isDemoMode` from supabase client

## 5. Design system

- `src/lib/aptlabs-fused-design-tokens.json` — "APT-LABS — Transcendent Sublime Fusion Design System v2.0" v2.0.0, ~25KB, fused from 10 sources (Palantir Foundry, Linear, GitHub Projects, Airtable, Retool, Databricks, Vercel Geist, PostHog Quill, Supabase UI, Twenty UI). Brand: primary #2b5945 (stewardship green), secondary #2dced6 (exchange cyan), accent #000000 (command black), exchange #166ee1 (markets blue), geist #0072f5, geist-alert #ff0000.
- `src/tailwind.css` — 242KB design-system CSS.
- Active design language: Structural Emergence (charter B4) — warm ivory base, earthy neutrals, restrained sage, deep forest/ink, selective lilac/peach accents. Editorial serif for record names; sans/mono for interface.
- Page-head hierarchy (charter B6): eyebrow → h1 (serif) → subtitle → primary action → quiet actions → L3 metrics.

## 6. Test suite (current)

Per `docs/architecture.md`: 13 test files, 78 tests. Per `AGENTS.md`: 12 files, 74 tests (discrepancy — see TECHNICAL_DEBT_REGISTER.md).

Test files:
- src/lib/db/roll.test.ts
- src/lib/institutions-register.test.ts
- src/lib/intelligence.test.ts (deleted in working tree)
- src/lib/intelligence/registry.test.ts
- src/lib/mock-radar-map-provider.test.ts
- src/lib/people-discovery.test.ts
- src/lib/people-profiles.test.ts
- src/lib/radar-view.test.ts
- src/lib/records-view.test.ts
- src/lib/studio-navigation.test.ts
- src/lib/workspace-activity.test.ts
- src/lib/workspace-overview.test.ts
- src/lib/workspace-search.test.ts

## 7. Git state (start of session)

Branch: master. User: APT-LABS.

Modified: .claude/settings.json, .mcp.json, .vscode/settings.json, package-lock.json, package.json, src/App.tsx, src/tailwind.css
Deleted: src/lib/intelligence.test.ts, src/lib/intelligence.ts, src/pages/workspace/Intelligence.tsx
Untracked: .agent/, .agents/skills/design-taste-frontend/, .claude/skills/design-taste-frontend/, .github/skills/design-taste-frontend/, _shoot.mjs, design-extract-output/, docs/design/aptlabs-fused-design-system.md, docs/design/commons-mockups/, docs/design/imagesinspo/, docs/design/network-preview-option-1.html, docs/design/network-preview-option-2.html, docs/design/palantir-ontology-images/, docs/design/superior-fusion-design-system.md, docs/superpowers/specs/2026-11-19-aptlabs-final-build-design.md, shots/, src/lib/aptlabs-fused-design-tokens.json, src/modules/intelligence/

## 8. Governing documents

- `docs/design/charter.md` — constitution (principles A1–A10, decisions B1–B8, discipline C, assignments D)
- `AGENTS.md` — canonical agent instructions (stack, routes, modules, auth, guardrails, build/test)
- `docs/architecture.md` — verified current technical architecture
- `docs/ontology.md` — APT-LABS ontology thesis, aetiology, six structures
- `docs/domain-model.md` — six-structure quick reference
- `docs/decisions/` — accepted ADRs (B1–B8)

---

**Next:** This map is the baseline for the Preact→Vue migration (mandate §5) and the n8n quality-orchestration layer. See `ROUTE_INVENTORY.md`, `CAPABILITY_PRESERVATION_REGISTER.md`, `TECHNICAL_DEBT_REGISTER.md`, `INITIAL_QUALITY_BASELINE.md` for the companion reconnaissance artifacts.
