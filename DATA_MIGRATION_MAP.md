# APT-LABS v2 — Data Migration Map

## §12B: Data Migration Map

### Current State: lib/system.ts Analysis

The single source of truth is `lib/system.ts` (1441 lines). It contains:

**Exported Constants (consumed by routes):**
- COMPANY (name, kind, primary, mantra, supporting, buyers, geography, contact)
- CONSOLE (name, kind, oneLine, state, dataState, dataNote, localFirst, commercial, provenance)
- TENDER_SYSTEM (name, summary, state)
- PRODUCTS[] (3 products: School Console, Commissioned MVP, Build Studio)
- STACK[] (5 layers: record, identity, build, infrastructure, allocation)
- PLANE[] (5 nodes: field, register, intelligence, control, evidence)
- VALUE_CHAIN[] (7 stages)
- REGISTERS[] (6 register specs)
- SIGNALS[] (3 signals)
- CONTRIBUTION[] (4 rules)
- MEASURES[] (4 measures)
- CONTRACT_RULES[] (6 rules)
- UNKNOWN_FACTS[] (5 unknowns)
- TARGETS[] (4 targets)
- EVIDENCE_STATES (6 states including DEMONSTRATION)
- STATE_RULES (permits/forbids per state)
- STATE_ORDER (narrative order)
- CONSOLE_VOCABULARY / CONSOLE_VOCABULARY_SCOPED
- BUILT_LAYERS, LIVE_BUILDS, PLANNED_BUILDS (derived)
- MEASURED_MODULE_COUNT
- tally() function

### Migration Strategy: One Dependency Cluster at a Time (§07)

#### Cluster 1: Evidence States & Rules (Foundation)
**Files affected:** lib/system.ts, scripts/check-contrast.mjs, scripts/check-lexicon.mjs, scripts/check-epistemic.mjs
**Changes:**
1. Remove DEMONSTRATION from EVIDENCE_STATES (now 5 states)
2. Update STATE_ORDER to 5 states
3. Update STATE_RULES to 5 entries (remove RULE-06)
4. Update CONTRACT_RULES to 5 entries
5. Update contrast/lexicon/epistemic checkers to expect 5 states
6. Update CONSOLE.dataState from "DEMONSTRATION" to "PROTOTYPE" with dataNote explaining invented data

**Consumers to update:**
- components/site/StateTag.tsx
- All pages using StateTag
- check-contrast.mjs (temperature scale)
- check-lexicon.mjs
- check-epistemic.mjs

#### Cluster 2: Company & Proposition (Home Page)
**Files affected:** lib/system.ts, app/(site)/page.tsx, components/site/CompanyHome.tsx, components/site/WorkflowHero.tsx, components/site/ValueChain.tsx
**Changes:**
1. Update COMPANY.primary to customer language (§09)
2. Update COMPANY.kind to "Sovereign infrastructure" (or similar customer-facing)
3. Update COMPANY.mantra to "Sovereignty, from record to allocation" (keep)
4. Update COMPANY.supporting to custody/contribution/allocation definition
5. Update COMPANY.buyers to §10 invitation language
6. Remove CONSOLE from COMPANY.profile products (moved to /benben)
7. Update WorkflowHero to reflect commercial proposition, not architecture canvas
8. Simplify ValueChain to customer-facing transformation

#### Cluster 3: Stack & Layers (Visual Summary on Home)
**Files affected:** lib/system.ts, components/site/Stack.tsx, components/site/WorkflowHero.tsx
**Changes:**
1. Keep STACK[] but simplify provenance/built/settles to customer language
2. Stack visual on Home only (not separate /stack route)
3. Layer states: record=PROTOTYPE, identity=PLANNED, build=PLANNED, infrastructure=PLANNED, allocation=PLANNED
4. Remove alias "The Roll", "The Studio", "The Fab", "BenBen" from public labels (internal only)

#### Cluster 4: Products & Tracks (/work page)
**Files affected:** lib/system.ts, new app/(site)/work/page.tsx
**Changes:**
1. PRODUCTS[] → rename to WORK_TRACKS[] or keep as PRODUCTS but render differently
2. School Console: kind="management-system", state=PROTOTYPE, dataNote=invented data
3. Commissioned MVP: kind="mvp", state=PLANNED
4. Build Studio: kind="studio", state=PLANNED
5. APT Fab: add as track (infrastructure), state=PLANNED
6. APT Studio: add as track (open builds), state=PLANNED
7. Each track: name, kind, buyer, unit, state, provenance, evidenceState

#### Cluster 5: Roll / Evidence System (/roll page)
**Files affected:** lib/system.ts, new app/(site)/roll/page.tsx
**Changes:**
1. Define ROLL_METHODOLOGY (public evidence methodology)
2. Define PUBLIC_RECORDS[] (empty initially, honest empty state)
3. Define EVIDENCE_REQUIREMENTS[] (what would populate Roll)
4. No SBT/DID/merkle exposure (§04)

#### Cluster 6: BenBen / Associated Products (/benben page)
**Files affected:** lib/system.ts, new app/(site)/benben/page.tsx
**Changes:**
1. Define BENBEN_TRACKS[] (allocation board PLANNED, School Console PROTOTYPE)
2. Clear boundary messaging: "BenBen Builds product, not APT-LABS flagship"
3. School Console prototype link (to /console or embedded)

#### Cluster 7: Contact (already exists, minor updates)
**Files affected:** app/(site)/contact/page.tsx, lib/system.ts
**Changes:**
1. Verify COMPANY.contact matches
2. Ensure three enquiry types match §01 sequence

#### Cluster 8: Remove Architecture Routes
**Files to DELETE:**
- app/(site)/lattice/page.tsx
- app/(site)/register/page.tsx
- app/(site)/intelligence/page.tsx
- app/(site)/control/page.tsx
- app/(site)/evidence/page.tsx
- app/(site)/stack/page.tsx
- app/(site)/product/page.tsx
- components/site/Stack.tsx (if only used by /stack)
- components/epistem/ (ControlSurface, RegisterSurface, IntelligenceSurface) — if only used by removed routes

#### Cluster 9: Console Route Relocation
**Files affected:** app/(console)/console/page.tsx (keep but relocate access)
**Changes:**
1. Keep console as-is (local prototype)
2. Access via /benben link, not primary nav
3. Ensure console vocabulary ban still respected (CONSOLE_VOCABULARY_SCOPED)

### Migration Order (per §07):

1. **Evidence States & Rules** (foundation — all else depends on this)
2. **Company & Proposition** (Home page content)
3. **Stack Visual** (Home page component)
4. **Work Tracks** (new /work page)
5. **Roll System** (new /roll page)
6. **BenBen Track** (new /benben page)
7. **Contact** (verify existing)
8. **Delete Architecture Routes** (after new pages verified)
9. **Console Relocation** (update nav/linking)
10. **Verification** (typecheck, lint, build, route test, visual inspection)

### Verification After Each Cluster:
- npm run typecheck
- npm run lint
- npm run build
- Route test (visit each affected route)
- Visual inspection
