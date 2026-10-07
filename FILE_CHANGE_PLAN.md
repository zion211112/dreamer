# APT-LABS v2 — File-Level Change Plan

## §12C: File-Level Change Plan

### Files to CREATE

#### New Route Pages
1. `app/(site)/work/page.tsx` — Portfolio & Build Tracks
2. `app/(site)/roll/page.tsx` — Evidence System
3. `app/(site)/benben/page.tsx` — Associated Product Track

#### New Components (if needed)
4. `components/site/WorkTracks.tsx` — Renders /work content
5. `components/site/RollSystem.tsx` — Renders /roll content
6. `components/site/BenBenTrack.tsx` — Renders /benben content
7. `components/site/HomeHero.tsx` — Problem → Capability → Proof → CTA
6. `components/site/HowWeWork.tsx` — 5-step operating method
7. `components/site/CurrentProof.tsx` — Evidence states of what exists
8. `components/site/StackSummary.tsx` — Visual 5-layer stack on Home

#### Updated Components
9. `components/site/StateTag.tsx` — Update to 5 states (remove DEMONSTRATION)
10. `components/site/Navigation.tsx` (or wherever nav lives) — 4-item nav: Work, Roll, BenBen, Contact

### Files to MODIFY (in migration order)

#### Cluster 1: Evidence States & Rules (Foundation)
1. `lib/system.ts`
   - EVIDENCE_STATES: remove DEMONSTRATION (5 entries)
   - STATE_ORDER: 5 states
   - STATE_RULES: 5 entries (remove RULE-06)
   - CONTRACT_RULES: 5 entries (align with 5 states)
   - CONSOLE.dataState: "PROTOTYPE" (was "DEMONSTRATION")
   - CONSOLE.dataNote: explicit note about invented data
   - Remove DEMONSTRATION from all STATE_RULES references

2. `scripts/check-contrast.mjs`
   - Update temperature scale to 5 states
   - Remove DEMONSTRATION expectations

3. `scripts/check-lexicon.mjs`
   - Update lexicon to 5 states

4. `scripts/check-epistemic.mjs`
   - Update epistemic checks to 5 states

#### Cluster 2: Company & Proposition (Home)
5. `lib/system.ts`
   - COMPANY.primary: "APT-LABS builds locally owned institutional infrastructure systems"
   - COMPANY.kind: customer-facing (e.g., "Sovereign infrastructure")
   - COMPANY.mantra: keep "Sovereignty, from record to allocation"
   - COMPANY.supporting: custody/contribution/allocation definition
   - COMPANY.buyers: §10 invitation language
   - COMPANY.profile.products: remove CONSOLE (moved to /benben)

6. `app/(site)/page.tsx`
   - Import new components: HomeHero, HowWeWork, CurrentProof, StackSummary
   - Remove imports of WorkflowHero, ValueChain (or refactor them)

7. `components/site/WorkflowHero.tsx`
   - REFACTOR to `components/site/HomeHero.tsx` with commercial structure
   - Remove architecture canvas metaphor
   - Implement: Problem → Capability → Proof → CTA

8. `components/site/ValueChain.tsx`
   - REFACTOR to `components/site/HowWeWork.tsx`
   - 5 steps: DISCOVER → DIAGNOSE → PROVE → RECORD → REPEAT
   - Customer-facing language

9. `components/site/CompanyHome.tsx`
   - Likely remove or significantly simplify
   - Home page now assembled in page.tsx from components

#### Cluster 3: Stack Visual (Home)
10. `lib/system.ts`
    - STACK[]: simplify provenance/built/settles to customer language
    - Layer states: record=PROTOTYPE, identity=PLANNED, build=PLANNED, infrastructure=PLANNED, allocation=PLANNED

11. `components/site/Stack.tsx`
    - REFACTOR to `components/site/StackSummary.tsx`
    - Visual summary only (not full /stack page component)
    - 5 layers, honest states, no internal aliases in labels

#### Cluster 4: Work Tracks (/work)
12. `lib/system.ts`
    - Add WORK_TRACKS[] array (or repurpose PRODUCTS[])
    - APT Fab (infrastructure, PLANNED)
    - APT Studio (open builds, PLANNED)
    - School Console (management-system, PROTOTYPE, dataNote)
    - Commissioned MVP (mvp, PLANNED)
    - Build Studio (studio, PLANNED)
    - Each: name, kind, buyer, unit, state, provenance, evidenceState

13. `app/(site)/work/page.tsx` (NEW)
    - Import WorkTracks component
    - Metadata, layout

14. `components/site/WorkTracks.tsx` (NEW)
    - Render tracks with explicit evidence states
    - StateTag for each

#### Cluster 5: Roll System (/roll)
15. `lib/system.ts`
    - Add ROLL_METHODOLOGY object
    - Add PUBLIC_RECORDS[] array (empty)
    - Add EVIDENCE_REQUIREMENTS[] array
    - No SBT/DID/merkle exposure

16. `app/(site)/roll/page.tsx` (NEW)
    - Import RollSystem component

17. `components/site/RollSystem.tsx` (NEW)
    - Methodology section
    - Honest empty state: "No public records exist yet"
    - Evidence requirements section

#### Cluster 6: BenBen Track (/benben)
18. `lib/system.ts`
    - Add BENBEN_TRACKS[] array
    - BenBen Allocation Board (PLANNED)
    - School Console (PROTOTYPE, data=DEMONSTRATION note)
    - Boundary message constant

19. `app/(site)/benben/page.tsx` (NEW)
    - Import BenBenTrack component

20. `components/site/BenBenTrack.tsx` (NEW)
    - Allocation board (PLANNED state)
    - School Console prototype (PROTOTYPE state)
    - Clear boundary message

#### Cluster 7: Contact (Verify)
21. `app/(site)/contact/page.tsx`
    - Verify COMPANY.contact matches
    - Three routes: Demo, Pilot, Investor

22. `lib/system.ts`
    - COMPANY.contact.routes: verify three types

#### Cluster 8: Delete Architecture Routes
23. DELETE: `app/(site)/lattice/page.tsx`
24. DELETE: `app/(site)/register/page.tsx`
25. DELETE: `app/(site)/intelligence/page.tsx`
26. DELETE: `app/(site)/control/page.tsx`
27. DELETE: `app/(site)/evidence/page.tsx`
28. DELETE: `app/(site)/stack/page.tsx`
29. DELETE: `app/(site)/product/page.tsx`
30. DELETE: `components/site/Stack.tsx` (if only used by /stack)
31. DELETE: `components/epistem/ControlSurface.tsx` (if only used by /control)
32. DELETE: `components/epistem/RegisterSurface.tsx` (if only used by /register)
33. DELETE: `components/epistem/IntelligenceSurface.tsx` (if only used by /intelligence)
34. DELETE: `components/epistem/LatticeSurface.tsx` (if only used by /lattice)

#### Cluster 9: Console Relocation
35. `app/(site)/layout.tsx` (or nav component)
    - Remove Console from primary navigation
    - Ensure /benben links to console prototype

36. `app/(console)/console/page.tsx`
    - Keep as-is (local prototype)
    - No public nav link

### Files to CHECK/UPDATE for Consistency
- `components/site/CompanyWorkspace.tsx` — Verify layout still works with new pages
- `components/ui/` — Any UI components used
- `app/(site)/layout.tsx` — Navigation, metadata
- `app/layout.tsx` — Root layout

### Migration Execution Order (Critical)

**Phase 1: Foundation (no visual changes yet)**
1. Update lib/system.ts evidence states (5 states, CONSOLE.dataState=PROTOTYPE)
2. Update check scripts (contrast, lexicon, epistemic)
3. Update StateTag component
4. Run: typecheck, lint, build → VERIFY

**Phase 2: Home Page Transformation**
5. Update lib/system.ts COMPANY + STACK
3. Create HomeHero, HowWeWork, CurrentProof, StackSummary components
4. Update app/(site)/page.tsx to use new components
5. Run: typecheck, lint, build, route test /, visual inspect → VERIFY

**Phase 3: New Pages**
6. Add WORK_TRACKS to lib/system.ts
7. Create /work page + WorkTracks component
8. Run: typecheck, lint, build, route test /work, visual inspect → VERIFY

9. Add ROLL_METHODOLOGY, PUBLIC_RECORDS to lib/system.ts
10. Create /roll page + RollSystem component
11. Run: typecheck, lint, build, route test /roll, visual inspect → VERIFY

12. Add BENBEN_TRACKS to lib/system.ts
13. Create /benben page + BenBenTrack component
14. Run: typecheck, lint, build, route test /benben, visual inspect → VERIFY

**Phase 4: Cleanup**
15. Update contact page / verify
16. Delete architecture routes (lattice, register, intelligence, control, evidence, stack, product)
17. Delete unused epistem components
18. Update navigation to 4 items (Work, Roll, BenBen, Contact)
19. Run: typecheck, lint, build, all route tests, visual inspect → VERIFY

**Phase 5: Final Verification**
20. 60-second test (§11): Can new visitor answer 6 questions in 60s?
21. Evidence state audit: All public surfaces use VERIFIED/PROTOTYPE/TARGET/PLANNED/UNKNOWN
22. Customer language audit: No internal philosophical language on public pages
23. SBT/crypto audit: No cryptographic machinery exposed publicly
24. APT Signal audit: Not in public nav
25. School Console audit: Only under /benben, not flagship
