# APT-LABS v1 Codebase Audit

> **Goal:** Map every current file to v1 decision: KEEP / ARCHIVE / REFACTOR / BUILD NEW

**v1 Scope (from corrected direction):**
- **5 Modules:** Commons, Network, Institutions & Assets, Workbench, The Roll
- **3 Users:** Institutions/customers, Founders/businesses/crews, APT-LABS coordinators
- **Workflow:** Register → Discover → Create Project → Compose Team → Track Delivery → Roll
- **Tech Foundation:** Shared auth, shared DB, permissions, ownership, revisions, evidence storage

---

## Audit Decision Matrix

### ROUTES (App.tsx)

| Current Route | v1 Module | Decision | Notes |
|--------------|-----------|----------|-------|
| `/` (Landing) | — | **KEEP** | Update copy to v1 language |
| `/sign-in` `/sign-up` (Auth) | Register | **REFACTOR** | Replace localStorage auth with shared auth (Supabase/Auth.js) |
| `/workspace/people` | Network | **REFACTOR** | Rename to `/workspace/network`; capability directory + service offers |
| `/workspace/institutions` | Institutions & Assets | **KEEP** | Refactor: remove "starter register" framing, add relationships UI |
| `/workspace/institutions/school-console` | — | **ARCHIVE** | Move to `bin/design-archive/` — separate BenBen Builds product |
| `/workspace/commons` | Commons | **REFACTOR** | Signals → project briefs; remove illustrative/scenario logic |
| `/workspace/workbench` (WorkbenchFinder) | Workbench | **REFACTOR** | Merge with FieldDesk → single project-delivery engine |
| `/workspace/field-desk` (FieldDesk) | Workbench | **ARCHIVE** | Simulation engine → archive; merge logic into Workbench |

---

### PAGES (src/pages/workspace/)

| File | Lines | v1 Module | Decision | Refactor Notes |
|------|-------|-----------|----------|----------------|
| `People.tsx` | 301 | Network | **REFACTOR** | Rename Network.tsx; editorial list (not cards); service offers inline; evidence basis visual; "Invite to project" action |
| `Institutions.tsx` | 321 | Institutions & Assets | **KEEP** | Remove "starter network" language; add asset condition/availability fields; link to Workbench |
| `SchoolConsole.tsx` | 425 | — | **ARCHIVE** | Move to `bin/design-archive/school-console/` |
| `Commons.tsx` | 846 | Commons | **REFACTOR** | Three tabs: Signals (observations), Briefs (work briefs from signals), Decisions (governance); remove scenario/illustrative logic |
| `WorkbenchFinder.tsx` | 141 | Workbench | **REFACTOR** | Merge with FieldDesk → single Workbench page with tabs: Browse / My Projects / Create |
| `FieldDesk.tsx` | 481 | Workbench | **ARCHIVE** | Simulation logic → `bin/design-archive/workbench-simulation/`; keep Roll preview concept for v1 Roll module |
| `WorkspaceLayout.tsx` | 25 | — | **KEEP** | Minimal wrapper; update navigation to 5 modules |

---

### COMPONENTS (src/components/)

| File | Lines | v1 Module | Decision | Notes |
|------|-------|-----------|----------|-------|
| `IdentityCabinet.tsx` | 264 | Register | **REFACTOR** | Becomes "My Profile" — attributed record, revisions, evidence, service offers; no portable JSON export |
| `StudioNavigation.tsx` | 266 | — | **REFACTOR** | 5 modules (add Roll); remove numbered badges (01/02/03/04); remove "BROWSER-LOCAL" badge |
| `WorkspaceLayout.tsx` | 25 | — | **KEEP** | Thin wrapper |
| `WorkbenchOpportunityBrowser.tsx` | — | Workbench | **REFACTOR** | Becomes project browser in Workbench |
| `WorkbenchStageNav.tsx` | — | Workbench | **REFACTOR** | Becomes project lifecycle navigator (6 gates) |
| `SimulationTrace.tsx` | — | — | **ARCHIVE** | Simulation only |
| `SimulationRunControls.tsx` | — | — | **ARCHIVE** | Simulation only |
| `TenderCandidateForm.tsx` | — | Workbench | **REFACTOR** | Becomes "Compose Team" form |
| `SchoolNeedSourcePicker.tsx` | — | — | **ARCHIVE** | School Console only |
| `ExistingLocalActivity.tsx` | — | — | **ARCHIVE** | Simulation only |
| `PageAgentPanel.tsx` | — | — | **ARCHIVE** | AGI not v1 |
| `NetworkMap.tsx` | — | Network | **ARCHIVE** | SVG topology — secondary in v1, can return later |
| `PeopleDirectory.tsx` | — | Network | **REFACTOR** | Becomes capability directory (editorial list) |
| `PeopleProfileEditor.tsx` | — | Register | **REFACTOR** | Profile editing for attributed records |
| `EntityInspector.tsx` | — | Institutions & Assets | **KEEP** | Generic inspector for entities |
| `BrandMark.tsx` | — | — | **KEEP** | Logo |
| `Button.tsx` | — | — | **KEEP** | Base component |
| `Input.tsx` | — | — | **KEEP** | Base component |
| `Card.tsx` | — | — | **REFACTOR** | Remove uniform card grid default; use purpose-driven layout |
| `ContextBackLink.tsx` | — | — | **KEEP** | Utility |

---

### LIB / DATA LAYER (src/lib/)

| File | Lines | v1 Module | Decision | Notes |
|------|-------|-----------|----------|-------|
| `people-network.ts` | — | Network | **REFACTOR** | Core data model for Network module; add `createdBy`, `updatedBy`, `version`; remove portable JSON export/import |
| `people-profiles.ts` | — | Register/Network | **REFACTOR** | CapabilityClaim, Evidence, ServiceOffer, ContactMethod → v1 Network model; add ownership/revisions |
| `people-discovery.ts` | — | Network | **REFACTOR** | Directory projection + search/filter → Network module query layer |
| `local-workflows.ts` | — | Commons | **REFACTOR** | FieldSignal → Observation; WorkBriefDraft → WorkBrief; CommonsProposal → Decision; add shared DB persistence |
| `local-workbench.ts` | — | Workbench | **REFACTOR** | WorkOpportunity → Project; LocalWorkApplication → Application; 7-stage lifecycle → 6 gates; shared DB |
| `workbench-simulation.ts` | — | — | **ARCHIVE** | Move to `bin/design-archive/workbench-simulation/` |
| `workbench-simulation-store.ts` | — | — | **ARCHIVE** | Simulation only |
| `workbench-interest.ts` | — | Workbench | **REFACTOR** | Becomes "Express Interest" on projects |
| `school-console-storage.ts` | — | — | **ARCHIVE** | IndexedDB for School Console |
| `school-marking.ts` | — | — | **ARCHIVE** | School Console only |
| `ecosystem-examples.ts` | — | — | **ARCHIVE** | Example data only |
| `institutions-register.test.ts` | — | Institutions | **KEEP** | Tests for register |

---

### STYLES (src/styles.css)

| Aspect | Current | v1 Decision |
|--------|---------|-------------|
| Design tokens | 8151 lines — comprehensive | **KEEP** token system; **REFACTOR** usage to v1 modules |
| Semantic colors | `--terrain/--water/--contour/--brass/--phosphor/--amber/--rust` | **KEEP** — maps to v1: terrain=work/ground, water=evidence/flow, brass=capital/covenant, contour=detection/signals |
| Typography | Georgia (serif) / Inter (sans) / JetBrains Mono | **KEEP** — serif for headlines/gravity, sans for UI, mono for technical |
| Spacing | 8px baseline, Fibonacci, modular scale 1.25 | **KEEP** |
| AI-default traps | Numbered sections, ALL-CAPS eyebrows, cream/sage, card grids, → on buttons | **REMOVE** — see design plan |

---

### DESIGN ARCHIVE (bin/design-archive/)

| File | v1 Decision |
|------|-------------|
| `task1.txt` (7 entities, 4 roles, flywheel) | **ARCHIVE** — old ontology |
| `design-2-field-atlas-command.html` (4 floors) | **ARCHIVE** — spatial metaphor not v1 |
| `people-design-comparison.html` (3 directions) | **REFERENCE** — Direction 1 (Capability Directory) is v1 Network |
| `workspace-benchmark-analysis.md` | **REFERENCE** — Visual traps to avoid |

---

## Summary: Files to Archive (Move to bin/design-archive/)

```
src/pages/workspace/SchoolConsole.tsx
src/pages/workspace/FieldDesk.tsx
src/lib/workbench-simulation.ts
src/lib/workbench-simulation-store.ts
src/lib/school-console-storage.ts
src/lib/school-marking.ts
src/lib/ecosystem-examples.ts
src/components/workbench/SimulationTrace.tsx
src/components/workbench/SimulationRunControls.tsx
src/components/workbench/SchoolNeedSourcePicker.tsx
src/components/workbench/ExistingLocalActivity.tsx
src/components/workbench/PageAgentPanel.tsx
src/components/people/NetworkMap.tsx
bin/design-archive/task1.txt
bin/design-archive/design-2-field-atlas-command.html
```

---

## Summary: Files to Refactor for v1

**High Priority (Core Workflow):**
1. `src/pages/Auth.tsx` → Shared auth (Supabase)
2. `src/pages/workspace/People.tsx` → `src/pages/workspace/Network.tsx` (Capability Directory)
3. `src/pages/workspace/Commons.tsx` → Signals → Briefs → Decisions
4. `src/pages/workspace/WorkbenchFinder.tsx` + `FieldDesk.tsx` → `src/pages/workspace/Workbench.tsx` (unified)
5. `src/lib/people-network.ts` + `people-profiles.ts` + `people-discovery.ts` → Network data model
6. `src/lib/local-workflows.ts` → Commons data model
7. `src/lib/local-workbench.ts` → Workbench data model
8. `src/components/IdentityCabinet.tsx` → My Profile (attributed, revisioned)
9. `src/components/StudioNavigation.tsx` → 5 modules, no numbers, no "BROWSER-LOCAL"
10. `src/App.tsx` → Updated routes

**Medium Priority:**
11. `src/pages/workspace/Institutions.tsx` → Remove "starter" framing
12. `src/components/people/PeopleDirectory.tsx` → Capability directory component
13. `src/components/people/PeopleProfileEditor.tsx` → Profile editor
14. `src/components/workbench/WorkbenchOpportunityBrowser.tsx` → Project browser
15. `src/components/workbench/WorkbenchStageNav.tsx` → Project lifecycle nav
16. `src/components/workbench/TenderCandidateForm.tsx` → Compose Team form

**Low Priority:**
17. `src/styles.css` → Audit token usage, remove AI-default patterns
18. `src/pages/Landing.tsx` → Update copy to v1 language

---

## Summary: Files to Build New (v1 Technical Foundation)

1. **Auth/Database Layer:**
   - `src/lib/auth.ts` — Supabase/Auth.js integration
   - `src/lib/db.ts` — Shared database client (PostgreSQL via Supabase)
   - `src/lib/permissions.ts` — Role-based access (institution, founder, coordinator)
   - `src/lib/revisions.ts` — Record versioning / audit trail

2. **Evidence Storage:**
   - `src/lib/evidence.ts` — S3/R2 upload, signed URLs, metadata

3. **v1 Modules (New Files):**
   - `src/pages/workspace/Roll.tsx` — Immutable delivery record
   - `src/lib/network.ts` — Network module queries (capability search, service offers)
   - `src/lib/commons.ts` — Commons module (observations, briefs, decisions)
   - `src/lib/workbench.ts` — Workbench module (projects, applications, delivery, roll)
   - `src/lib/institutions.ts` — Institutions & Assets module

4. **UI Components:**
   - `src/components/network/CapabilityDirectory.tsx`
   - `src/components/network/ServiceOfferCard.tsx`
   - `src/components/commons/ObservationForm.tsx`
   - `src/components/commons/WorkBriefForm.tsx`
   - `src/components/workbench/ProjectCard.tsx`
   - `src/components/workbench/ApplicationForm.tsx`
   - `src/components/workbench/DeliveryTracker.tsx`
   - `src/components/roll/RollEntry.tsx`

---

## Review Focus (v1 Failure Modes)

| Input/Condition | Expected Behavior | Owner Task |
|-----------------|-------------------|------------|
| Unauthenticated user accesses `/workspace/*` | Redirected to `/sign-in` with `next` param | Auth migration |
| Two users edit same institution record | Last-write-wins with conflict notice; revision history preserved | Revisions |
| Founder registers venture with same name as existing | Validation error: "Name already registered" | Network Register |
| Institution creates project without steward | Blocked: "Designate a steward before opening work brief" | Commons → Workbench |
| Contributor submits delivery evidence > 10MB | Chunked upload to R2; progress indicator; signed URL in Roll | Evidence storage |
| Coordinator views project they don't own | Read-only access to all fields; no edit actions | Permissions |
| Network search returns 0 results | Empty state: "No providers match. Broaden search or post a need in Commons." | Network Discover |
| Workbench project at "Accepted" gate without evidence | Blocked: "Attach delivery evidence before acceptance" | Workbench Track Delivery |