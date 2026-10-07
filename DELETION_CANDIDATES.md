# APT-LABS v2 — Deletion Candidates

## §12D: Deletion Candidates

### Route Pages to DELETE (7 files)
These routes are architecture-for-architecture's-sake and violate §02 (minimum IA = 5 pages)

1. `app/(site)/lattice/page.tsx` (8,192 chars) — "Lattice" architecture page
2. `app/(site)/register/page.tsx` (11,119 chars) — "Register" architecture page
3. `app/(site)/intelligence/page.tsx` (9,751 chars) — "Intelligence" architecture page
4. `app/(site)/control/page.tsx` (12,486 chars) — "Control" architecture page
5. `app/(site)/evidence/page.tsx` (12,114 chars) — "Evidence" architecture page
6. `app/(site)/stack/page.tsx` (10,852 chars) — "Stack" architecture page (merged to Home)
7. `app/(site)/product/page.tsx` (13,779 chars) — "Product" page (merged to /work)

### Components to DELETE (4+ files)
These components are ONLY used by the deleted architecture routes above.

8. `components/epistem/ControlSurface.tsx` — Used only by /control
9. `components/epistem/RegisterSurface.tsx` — Used only by /register
10. `components/epistem/IntelligenceSurface.tsx` — Used only by /intelligence
11. `components/epistem/LatticeSurface.tsx` — Used only by /lattice
12. `components/epistem/EvidenceSurface.tsx` — Used only by /evidence (verify)

### Component to DELETE (conditional)
13. `components/site/Stack.tsx` — If ONLY used by /stack page (verify imports)

### Data in lib/system.ts to REMOVE/RESTRUCTURE (not delete file)
14. Remove DEMONSTRATION from EVIDENCE_STATES (6→5 states)
15. Remove RULE-06 from STATE_RULES
16. Remove corresponding entry from CONTRACT_RULES
17. Remove "The Roll", "The Studio", "The Fab", "BenBen" aliases from STACK layer labels (internal only)
18. Remove CONSOLE from COMPANY.profile.products (moved to /benben)
19. Restructure PRODUCTS[] → WORK_TRACKS[] with 5 tracks (APT Fab, APT Studio, School Console, MVP, Studio)
20. Remove PLANE[] (5 nodes) — architecture concept, not commercial surface
21. Remove REGISTERS[] (6 specs) — implementation detail, not public feature
22. Remove SIGNALS[] (3) — APT Signal is product hypothesis (§05), not public
22. Remove CONTRIBUTION[] rules — internal, not public
23. Remove MEASURES[] — internal, not public
24. Remove CONTRACT_RULES[] — internal, not public
25. Remove UNKNOWN_FACTS[] — keep only what's rendered as "UNKNOWN" state
26. Remove TARGETS[] — keep only what's rendered as "TARGET" state
27. Remove CONSOLE_VOCABULARY / CONSOLE_VOCABULARY_SCOPED — console-internal
28. Remove BUILT_LAYERS, LIVE_BUILDS, PLANNED_BUILDS derived arrays
29. Remove MEASURED_MODULE_COUNT
30. Remove tally() function if unused

### Verification Before Deletion
For each candidate above:
1. Search codebase for imports/usages: `grep -r "import.*<candidate>"` or `grep -r "<ComponentName>"`
2. Confirm zero usages outside the deleted routes
3. Only then delete

### Files to KEEP (but transform)
- `lib/system.ts` — Keep as data source, heavily restructure exports
- `app/(site)/page.tsx` — Keep, rewrite content
- `app/(site)/contact/page.tsx` — Keep, minor updates
- `app/(site)/layout.tsx` — Keep, update navigation
- `app/(site)/benben/page.tsx` — Keep, rewrite (exists but minimal)
- `app/(console)/console/page.tsx` — Keep as local prototype
- `components/site/CompanyWorkspace.tsx` — Keep, verify layout
- `components/site/StateTag.tsx` — Keep, update to 5 states
- `components/site/WorkflowHero.tsx` → REFACTOR to HomeHero
- `components/site/ValueChain.tsx` → REFACTOR to HowWeWork
- `components/ui/*` — Keep all UI primitives

### Safety Check
Before any deletion:
- Run full test suite (typecheck, lint, build)
- Verify no broken imports
- Commit working state before each deletion batch
