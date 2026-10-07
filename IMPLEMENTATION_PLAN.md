# APT-LABS v2 Implementation Plan

## Current State Analysis

### Existing Routes (app/(site)/)
- `/page.tsx (Home)`
- `/contact/page.tsx`
- `/control/page.tsx`
- `/evidence/page.tsx`
- `/intelligence/page.tsx`
- `/lattice/page.tsx`
- `/product/page.tsx`
- `/register/page.tsx`
- `/stack/page.tsx`

### Console Route (app/(console)/console/)
- `/console` - School Console prototype

### Missing Routes Required by APT-LABS v2
- `/work` - APT Fab, APT Studio, selected work/prototypes, explicit evidence states
- `/roll` - Public evidence methodology + actual public records
- `/benben` - Associated product track, School Console prototype

### Routes to Remove/Restructure (per §02)
- `/lattice` - Not in minimum IA; architecture for architecture's sake
- `/register` - Architecture route, not commercial surface
- `/intelligence` - Architecture route, not commercial surface
- `/control` - Architecture route, not commercial surface
- `/evidence` - Architecture route, not commercial surface
- `/stack` - Architecture route, not commercial surface
- `/product` - Should be integrated into `/work` as 'School Console'

### Key Corrections Needed (from v2)
- §01: Public site = COMMERCIAL SURFACE (Problem → Capability → Proof → CONTACT)
- §02: Minimum IA: /, /work, /roll, /benben, /contact (5 pages max)
- §03: School Console under /benben, NOT flagship APT-LABS product
- §04: SBT/cryptographic primitives hidden (implementation infrastructure only)
- §05: APT Signal removed from public nav (product hypothesis only)
- §06: The Roll = evidence system, not decorative dashboard; honest empty state
- §07: Data model migration - map consumers first, migrate one cluster at a time
- §08: Evidence language: VERIFIED, PROTOTYPE, TARGET, PLANNED, UNKNOWN (5 states, DEMONSTRATION removed)
- §09: Customer language: 'APT-LABS builds locally owned institutional infrastructure systems'
- §10: First customer = UNKNOWN; invite institutions to bring real problems
- §11: 60-second test: What/What/Real/Proto/Why/How
- §12: Build protocol - plan before implement, verify each slice

---

## §12A: Final Reduced IA ✓
Produced: `FINAL_IA.md`
- 5-page site map: /, /work, /roll, /benben, /contact
- Navigation: Work, Roll, BenBen, Contact
- Home: Problem→Capability→Proof→CTA + HowWeWork + CurrentProof + StackSummary + ContactCTA
- Evidence states: 5 (VERIFIED, PROTOTYPE, TARGET, PLANNED, UNKNOWN) — DEMONSTRATION removed
- Customer language per §09
- First customer: UNKNOWN per §10

## §12B: Data Migration Map ✓
Produced: `DATA_MIGRATION_MAP.md`
- 9 clusters, sequential, one dependency cluster at a time
- Foundation: Evidence states & rules (5 states)
- Home: Company proposition + Stack visual
- New pages: /work, /roll, /benben
- Cleanup: Delete 7 architecture routes + 4+ epistem components

## §12C: File-Level Change Plan ✓
Produced: `FILE_CHANGE_PLAN.md`
- 36+ specific file actions (create/modify/delete)
- 5-phase execution order with verification gates
- Phase 1: Foundation (evidence states, scripts, StateTag)
- Phase 2: Home page transformation
- Phase 3: New pages (/work, /roll, /benben)
- Phase 4: Cleanup (delete routes, update nav)
- Phase 5: Final verification (all acceptance tests)

## §12D: Deletion Candidates ✓
Produced: `DELETION_CANDIDATES.md`
- 7 route pages to delete
- 4+ epistem components to delete
- 1 conditional Stack.tsx deletion
- 16+ data structures to remove/restructure in lib/system.ts
- Safety protocol: verify zero imports before delete

## §12E: Acceptance Tests ✓
Produced: `ACCEPTANCE_TESTS.md`
- 8 test categories with automated + manual checks
- 60-second test with specific criteria per page
- Evidence state audit (grep for 5 states, 0 DEMONSTRATION)
- Customer language audit (forbidden/required terms)
- Cryptographic boundary audit
- Product boundary audit
- IA completeness (5 routes, 4 nav items)
- Technical quality (typecheck, lint, build, route tests)
- Visual inspection checklist

## §12F: Implementation Protocol
### Phase 1: Foundation ✓ COMPLETED
- Updated lib/system.ts: EVIDENCE_STATES (5 states), STATE_ORDER, STATE_RULES (5 rules), CONTRACT_RULES (5 rules), CONSOLE.dataState=PROTOTYPE
- Updated scripts/check-contrast.mjs: 5-state temperature scale, removed DEMONSTRATION token
- Updated components/site/StateTag.tsx: 5-state documentation
- Updated components/site/StatusBand.tsx: PROTOTYPE instead of DEMONSTRATION
- Updated lib/system.ts: MEASURES entry state=PROTOTYPE
- All checks pass: typecheck, lint, build, check:scale, check:contrast, check:lexicon, check:epistemic

### Phase 2: Home Page Transformation ✓ COMPLETED
- Updated lib/system.ts: COMPANY (customer language, buyers), STACK (removed aliases, simplified provenance)
- Created components/site/HomeHero.tsx (PROBLEM→CAPABILITY→PROOF→CONTACT)
- Created components/site/HowWeWork.tsx (DISCOVER→DIAGNOSE→PROVE→RECORD→REPEAT)
- Created components/site/CurrentProof.tsx (products, stack, customers with evidence states)
- Created components/site/StackSummary.tsx (visual 5-layer stack)
- Updated app/(site)/page.tsx to use new components
- Added CSS styles to app/globals.css
- All checks pass: typecheck, lint, build, check:scale, check:contrast, check:lexicon, check:epistemic

### Phase 3: New Pages - /work, /roll, /benben ✓ COMPLETED
- Created app/(site)/work/page.tsx with WorkPage component (APT Fab, APT Studio, Selected work, Stack evidence)
- Created app/(site)/roll/page.tsx with RollPage component (Methodology, honest empty state, stack/product evidence)
- Created app/(site)/benben/page.tsx with BenBenPage component (School Console boundary, Build Studio, Allocation track)
- Added CSS styles for all three pages to app/globals.css
- All checks pass: typecheck, lint, build, check:scale, check:contrast, check:lexicon, check:epistemic
- New routes verified in build output: /benben, /roll, /work

### Phase 4: Cleanup - Delete architecture routes, update nav ✓ COMPLETED
- Deleted 7 architecture routes: /control, /evidence, /intelligence, /lattice, /product, /register, /stack
- Updated CompanyWorkspace.tsx navigation to 5-page IA (Company: Home, Work, The Roll, BenBen; Organization: Contact)
- Fixed profile menu: replaced /console + TENDER_SYSTEM with /work, /benben, /roll links
- Removed /console conditional from tree rendering
- Fixed footer link: /lattice → /roll (The Roll)
- Cleared .next cache, all checks pass: typecheck, lint, build, check:scale, check:contrast, check:lexicon, check:epistemic
- Build output shows 5 public routes: /, /benben, /contact, /roll, /work (+ /console dynamic)

### Phase 5: Acceptance Tests - IN PROGRESS
