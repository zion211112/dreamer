# APT-LABS — Capability Preservation Register

**Purpose:** Register of capabilities, behaviors, and guarantees that must be preserved during the Preact→Vue migration and n8n orchestration layer introduction, per mandate §4 (preserve list). This register is the authority for what must not change; anything not listed here may change only with an explicit superseding decision.

**Source:** Mandate §4 preserve list + existing codebase (`src/lib/auth/hooks.ts`, `src/lib/supabase/client.ts`, `src/lib/people-network.ts`, `src/lib/db/roll.ts`, `src/modules/workbench/data.ts`, `src/lib/school-console-storage.ts`, `src/lib/sbt-attestations.ts`).

**Status:** Current repository HEAD (master). Generated 2026-11-19.

---

## 1. Mandate §4 preserve requirements

The mandate §4 explicitly lists these as non-negotiable:

| # | Preserve requirement | Current implementation | Location |
|---|---------------------|----------------------|----------|
| P1 | Authentication semantics | Demo mode (localStorage) when Supabase env vars unset; Supabase session otherwise; `useAuth` hook | `src/lib/auth/hooks.ts`, `src/lib/supabase/client.ts` |
| P2 | Existing RLS protections | Supabase RLS on profiles table (demonstrated in hooks) | `src/lib/auth/hooks.ts` |
| P3 | Demo mode disclosures and behavior | `isDemoMode` flag; `getSupabase()` throws if not configured; environment label "Local demo" / "Configured" | `src/lib/supabase/client.ts`, `src/components/WorkspaceShell.tsx` |
| P4 | Data ownership and isolation | Profile per user; organization_name, location, service_area; demo user `demo-user` | `src/lib/auth/types.ts`, `src/lib/auth/hooks.ts` |
| P5 | Portable export/import formats | `aptlabs.people-network v1` (format, version, anchor, exportedAt); `PortablePeopleRecord` interface | `src/lib/people-network.ts` |
| P6 | Append-only history guarantees | Roll entries with hash_anchor; RollRevision (correction|restriction_change|evidence_added); never silent rewrites | `src/lib/db/roll.ts` |

## 2. Additional existing capabilities to preserve

Beyond the mandate §4 list, the following capabilities are part of the current system and must continue to function after migration:

### A. Authentication and identity

| Capability | Description | Location |
|------------|-------------|----------|
| Demo-mode sign in / sign up | localStorage-backed `authUser`; demo-user id; role default founder on sign-in | `src/lib/auth/hooks.ts` |
| Supabase sign in / sign up | `supabase.auth.signInWithPassword`, `signUp`; profile insert on sign-up | `src/lib/auth/hooks.ts` |
| Profile management | `updateProfile`; version increment; `updated_at` | `src/lib/auth/hooks.ts` |
| Sign out | localStorage clear (demo) / `supabase.auth.signOut` | `src/lib/auth/hooks.ts` |
| Session refresh | `refreshProfile` on auth state change | `src/lib/auth/hooks.ts` |
| Role model | `institution` \| `founder` \| `coordinator` \| `admin` | `src/lib/auth/types.ts` |
| Profile fields | id, role, display_name, avatar_url, organization_name, location, service_area[], timestamps, version, created_by, updated_by | `src/lib/auth/types.ts` |

### B. People network and portable records

| Capability | Description | Location |
|------------|-------------|----------|
| Entity registry | 7 entity types (person, crew, project, asset, work, institution, evidence); 31 fixture entities | `src/lib/people-network.ts` |
| Relationship registry | 14 relationship kinds; 34 fixture relationships; metadata-bearing (not bare FK) | `src/lib/people-network.ts` |
| Portable record export | `exportPortableRecord` → `aptlabs.people-network v1` JSON | `src/lib/people-network.ts` |
| Portable record import | `importPortableRecord` with validation (`isPortablePeopleRecord`) | `src/lib/people-network.ts` |
| Entity validation | `isNetworkEntity` | `src/lib/people-network.ts` |
| Persistence | localStorage `aptlabs:people-network:v1` | `src/lib/people-network.ts` |

### C. Roll (evidence and provenance)

| Capability | Description | Location |
|------------|-------------|----------|
| Roll entry creation | `createRollEntry` with undertaking_type, participants, evidence layers | `src/lib/db/roll.ts` |
| Roll entry query | `getRollEntry`, `queryRollEntries` | `src/lib/db/roll.ts` |
| Roll revision | `addRollRevision` (correction\|restriction_change\|evidence_added) | `src/lib/db/roll.ts` |
| Roll evidence files | `addRollEvidenceFile`, `getRollEvidenceFiles` | `src/lib/db/roll.ts` |
| Roll verification | `verifyRollEntry` via hash anchor (`createCanonicalRollJson` / `computeHashAnchor`) | `src/lib/db/roll.ts` |
| Roll access control | `getRollAccess`, `filterRollEntryByAccess` (public\|participant\|restricted layers) | `src/lib/db/roll.ts` |
| Hash-anchor provenance | `computeHashAnchor` over canonical roll JSON | `src/lib/db/roll-hash.ts` |
| Demo roll fixtures | 3 DEMO_ROLL_ENTRIES | `src/lib/db/roll.ts` |
| Demo persistence | localStorage `demo_roll_entries`, `demo_roll_evidence_files`, `demo_roll_revisions` | `src/lib/db/roll.ts` |

### D. Workbench (productive work coordination)

| Capability | Description | Location |
|------------|-------------|----------|
| Pilot registry | 5 pilots (benbenos, kemetos, minihydro, mwea-animation-box, open); 4 published + 1 illustrative | `src/modules/workbench/data.ts` |
| Work item registry | `WorkItem` with gate state machine, evidence layers, capital, crew, callSheet | `src/modules/workbench/data.ts` |
| Gate transitions | `advanceGate`; `NEXT_GATE` state machine; `GATE_LABELS`, `GATE_COLORS`, `GATE_FORK` | `src/modules/workbench/data.ts` |
| Crew assignment | `assignCrewMember` (anchor/builder/apprentice/coordinator + personId) | `src/modules/workbench/data.ts` |
| Proposal→undertaking | `createUndertakingFromProposal` (bidirectional traceability via sourceProposalId/sourceSignalId) | `src/modules/workbench/data.ts` |
| Lifecycle events | `recordLifecycleEvent` (gate_advance, settlement, learning, evidence_added, correction) | `src/modules/workbench/data.ts` |
| Settlement events | `recordSettlementEvent` (payment, materials_reconciliation, cost_adjustment, expense_settlement) | `src/modules/workbench/data.ts` |
| Learning events | `recordLearningEvent` (lesson, reusable_design, updated_criteria, dispute_resolution) | `src/modules/workbench/data.ts` |
| Persistence | localStorage `aptlabs:workbench-items:v1`; seed items wi-01…wi-08 | `src/modules/workbench/data.ts` |
| KES currency | Capital financial values in Kenyan Shillings | `src/modules/workbench/data.ts`, `src/modules/workbench/pages/Home.tsx` |

### E. Commons (field signals, proposals, governance)

| Capability | Description | Location |
|------------|-------------|----------|
| Field signals | `FieldSignal` (status new\|triaged\|brief\|resolved; urgency routine\|soon\|urgent) | `src/lib/local-workflows.ts` |
| Work brief drafts | `WorkBriefDraft` (compensationType paid\|unpaid\|''; payment terms) | `src/lib/local-workflows.ts` |
| Proposals | `ProposalStatus` (proposed\|approved\|rejected\|returned) | `src/lib/local-workflows.ts` |
| Steward authorization | `assignLocalSteward`, `createCommonsProposal`, `decideCommonsProposal` | `src/lib/local-workflows.ts` |
| Governance records | `CommonsGovernanceRecord` (stewards, proposals); `GovernanceEvent` | `src/lib/local-workflows.ts` |
| Persistence | localStorage `aptlabs:commons-signals:v1`, `aptlabs:workbench-drafts:v1`, `aptlabs:commons-governance:v1` | `src/lib/local-workflows.ts` |
| Local ID generation | `createLocalId` helper | `src/lib/local-workflows.ts` |

### F. School Console (nested under Workbench)

| Capability | Description | Location |
|------------|-------------|----------|
| Console snapshot | IndexedDB `apt-labs-school-console` / `local-work` / `school-console-v1` | `src/lib/school-console-storage.ts` |
| Marked papers | `MarkedPaper` with answers, marksByQuestion, score, maximum | `src/lib/school-console-storage.ts`, `src/lib/school-marking.ts` |
| Tender drafts | `SchoolTenderDraft` with BOM lines, crew wage allocation, economic model | `src/lib/school-console-storage.ts` |
| Fee notes | `LocalFeeNote` (description, amountKes) | `src/lib/school-console-storage.ts` |
| Snapshot validation | `normalizeSnapshot` with full field validation on load | `src/lib/school-console-storage.ts` |

### G. SBT attestations

| Capability | Description | Location |
|------------|-------------|----------|
| Mint/list/verify/export | SBT attestations (localStorage) | `src/lib/sbt-attestations.ts` |
| Roll→SBT bridge | `roll-sbt-bridge.ts` — accepted Workbench handoff to Roll entries + SBT | `src/lib/roll-sbt-bridge.ts` |
| Persistence | localStorage `aptlabs:sbt-attestations:v1` | `docs/architecture.md` |

### H. Agent host (proposes-never-executes)

| Capability | Description | Location |
|------------|-------------|----------|
| AgentHost | Proposes actions, never executes them autonomously | `src/lib/agent-host.ts` |
| Agent proposals | localStorage `aptlabs:agent-proposals:v1` | `docs/architecture.md` |

### I. Workspace shell and UI

| Capability | Description | Location |
|------------|-------------|----------|
| Workspace shell | Sidebar, inspector, dock, statusbar, skin toggle | `src/components/WorkspaceShell.tsx` |
| Page-head hierarchy | eyebrow → h1 → subtitle → primary action → quiet actions → L3 metrics | `src/components/PageHead.tsx` |
| Skin mode | light \| observatory (localStorage `studioSkin`) | `src/components/WorkspaceShell.tsx` |
| Demo environment label | "Local demo" \| "Configured" | `src/components/WorkspaceShell.tsx` |
| Design tokens | Fused design system v2.0 (10 sources) | `src/lib/aptlabs-fused-design-tokens.json` |
| Tailwind CSS v4 | 242KB design-system CSS | `src/tailwind.css` |

## 3. What is NOT in the preserve scope

The following may change without violating the preserve mandate, provided P1–P6 above are upheld:

- UI framework (Preact → Vue 3 per mandate §5)
- Build tool (Vite 6.4.5 — retained)
- Styling approach (Tailwind v4 — retained, tokens may be re-expressed)
- Routing library (Wouter — may be replaced with Vue Router per migration ADR)
- State management (@preact/signals → Pinia per mandate §5)
- Query library (TanStack Query — new addition per mandate §5)
- Component library (Reka UI / shadcn-vue — new addition per mandate §5)
- Workflow automation (n8n self-hosted — new addition per mandate §5)
- Ontology layer (src/lib/ontology/ — new addition per mandate §5)

## 4. Verification method

Each preserved capability must be verified after migration by:

1. Type-level: `tsc --noEmit` passes (strict)
2. Test-level: existing vitest suite passes (or equivalent Vue Test Utils tests)
3. Behavior-level: demo mode functions identically (localStorage fallback when Supabase env unset)
4. Portability: portable record export/import round-trips without data loss
5. Provenance: roll hash-anchor verification still produces valid anchors

## 5. Change control

Any change to a P1–P6 capability requires an explicit superseding decision recorded in `docs/decisions/` or an approved ADR. The preserve register is not itself a decision — it is a checklist derived from the mandate. If the migration requires modifying a preserved capability, document the change, the rationale, and the mitigation before proceeding.
