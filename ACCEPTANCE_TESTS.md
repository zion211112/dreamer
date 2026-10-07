# APT-LABS v2 — Acceptance Tests

## §12E: Acceptance Tests

### Test Categories
1. **60-Second Test** (§11) — Primary success criterion
2. **Evidence State Audit** (§08) — 5 states only, consistent
3. **Customer Language Audit** (§09) — No internal philosophy on public pages
4. **Cryptographic Boundary Audit** (§04) — No SBT/DID/merkle exposed
5. **Product Boundary Audit** (§03, §05) — School Console under /benben; APT Signal hidden
5. **IA Completeness** (§02) — Exactly 5 public routes
6. **Technical Quality** — typecheck, lint, build, no broken routes

---

### Test 1: 60-Second Test (§11)
**Procedure:** Load each page fresh, answer 6 questions in <60 seconds each.

#### Home Page (`/`)
| Question | Expected Answer Location | Pass Criteria |
|----------|-------------------------|---------------|
| 1. What is APT-LABS? | Hero headline + Company.kind | "APT-LABS builds locally owned institutional infrastructure systems" visible in <10s |
| 2. What does it actually do? | HowWeWork section | DISCOVER → DIAGNOSE → PROVE → RECORD → REPEAT visible in <15s |
| 3. What is real today? | CurrentProof section | One prototype (School Console, demo data); 0 customers stated |
| 4. What is prototype/planned? | StackSummary + CurrentProof | 4 layers PLANNED, 1 PROTOTYPE; MVP/Studio tracks PLANNED |
| 5. Why should an institution talk to it? | Hero proof + CTA | Lower cost, reduced downtime, local custody, measurable performance |
| 6. How do I start? | Contact CTA | Links to /contact with Demo/Pilot/Investor routes |

#### Work Page (`/work`)
| Question | Expected Answer | Pass Criteria |
|----------|----------------|---------------|
| What tracks exist? | 5 tracks listed | APT Fab, APT Studio, School Console, Commissioned MVP, Build Studio |
| What state is each? | StateTag on each | Each shows VERIFIED/PROTOTYPE/TARGET/PLANNED/UNKNOWN |
| Which is real? | School Console = PROTOTYPE | Only School Console has PROTOTYPE state |

#### Roll Page (`/roll`)
| Question | Expected Answer | Pass Criteria |
|----------|----------------|---------------|
| What happened? | Methodology section | Clear evidence methodology described |
| Any public records? | Empty state | "No public records exist yet" rendered honestly |
| What would populate it? | Requirements section | Named evidence requirements listed |

#### BenBen Page (`/benben`)
| Question | Expected Answer | Pass Criteria |
|----------|----------------|---------------|
| What is this? | Boundary message | "This is a BenBen Builds product, not the APT-LABS flagship" |
| What exists? | Allocation board + School Console | Allocation board = PLANNED; School Console = PROTOTYPE |
| Is School Console the flagship? | Explicit boundary | No APT-LABS hero promotion of School Console |

#### Contact Page (`/contact`)
| Question | Expected Answer | Pass Criteria |
|----------|----------------|---------------|
| How to start? | Three routes | Demo Access, Pilot Enquiry, Investor Diligence with mailto |
| Who to contact? | Organization email | COMPANY.contact.email visible |

---

### Test 2: Evidence State Audit (§08)
**Automated Check:** Search all public pages for state references
```bash
# Should find ONLY these 5 states:
grep -r "VERIFIED\|PROTOTYPE\|TARGET\|PLANNED\|UNKNOWN" app/(site)/ --include="*.tsx"
# Should find ZERO:
grep -r "DEMONSTRATION" app/(site)/ --include="*.tsx" && echo "FAIL"
```

**Manual Check:**
- Every track/product/work item has explicit StateTag
- StateTag component only renders 5 states
- No page invents a 6th state
- "Unknown" rendered explicitly, never omitted

---

### Test 3: Customer Language Audit (§09)
**Forbidden Terms on Public Pages** (grep should return 0):
```bash
grep -r "ontology\|architecture\|protocol\|primitives\|cryptographic\|merkle\|SBT\|DID\|issuance\|revocation" app/(site)/ --include="*.tsx" && echo "FAIL"
grep -r "epistem\|lattice\|register surface\|control surface\|intelligence surface" app/(site)/ --include="*.tsx" && echo "FAIL"
```

**Required Terms Present:**
```bash
grep -r "locally owned institutional infrastructure" app/(site)/page.tsx && echo "PASS"
grep -r "DISCOVER.*DIAGNOSE.*PROVE.*RECORD.*REPEAT" app/(site)/page.tsx && echo "PASS"
```

---

### Test 4: Cryptographic Boundary Audit (§04)
**Forbidden on Public Pages:**
```bash
grep -r "SBT\|soulbound\|DID\|merkle\|credential.*revoc\|cryptographic" app/(site)/ --include="*.tsx" && echo "FAIL"
```
**Allowed:** Only in lib/system.ts (implementation), app/(console)/ (prototype), scripts/

---

### Test 5: Product Boundary Audit (§03, §05)
**School Console:**
```bash
# Should appear ONLY in /benben and /console
grep -r "School Console" app/(site)/ --include="*.tsx" | grep -v "/benben" && echo "FAIL"
# Should NOT be in primary navigation
grep -r "School Console" app/(site)/layout.tsx && echo "FAIL"
```

**APT Signal:**
```bash
# Should NOT appear in public nav or pages
grep -r "APT Signal\|APT_SIGNAL" app/(site)/ --include="*.tsx" && echo "FAIL"
```

---

### Test 6: IA Completeness (§02)
**Route Count:**
```bash
find app/(site) -name "page.tsx" | wc -l
# Should equal 5: page.tsx, work/page.tsx, roll/page.tsx, benben/page.tsx, contact/page.tsx
```

**Navigation Items:**
```bash
# Primary nav should have exactly 4 links: Work, Roll, BenBen, Contact
grep -c "href.*work\|href.*roll\|href.*benben\|href.*contact" components/site/Navigation.tsx
# Should equal 4
```

---

### Test 7: Technical Quality
**Commands (all must pass):**
```bash
npm run typecheck   # Zero TypeScript errors
npm run lint        # Zero lint errors  
npm run build       # Successful production build
```

**Route Tests (all must return 200):**
```bash
# After build + start
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/          # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/work       # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/roll       # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/benben     # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/contact    # 200
# Deleted routes should 404:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/lattice    # 404
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/stack      # 404
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/product    # 404
```

---

### Test 8: Visual Inspection Checklist
- [ ] Home page: Hero → HowWeWork → CurrentProof → StackSummary → ContactCTA (in order)
- [ ] No architecture diagrams as primary content
- [ ] StateTags use correct colors per check-contrast.mjs
- [ ] Empty states render honestly (not "coming soon")
- [ ] Typography consistent, readable
- [ ] Mobile responsive
- [ ] Console accessible only via /benben link

---

### Test Execution Protocol
**After EACH migration cluster (per §12F):**
1. Run Test 7 (Technical Quality) — must pass
2. Run affected route tests — must pass
3. Visual inspection of affected pages

**At Completion (all clusters):**
1. Run ALL tests 1-8
2. Document any failures
3. Fix and re-run until all pass
4. Sign off
