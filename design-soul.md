# APT-LABS Design Soul — Self-Learning Memory

> **Purpose**: Persistent context for rapid block-based development. Updated after every block. Read this first when resuming.

---

## 🧬 ONTOLOGY (The Trojan Core)

### Brand Identity
- **Package**: `zeptepi` (v0.0.1) — internal name
- **Runtime Brand**: **APT-LABS — Field Desk** (footer, styles.css, design tokens)
- **Tagline**: "Field Atlas + Terminal REPL + Workshop fusion"

### Four Quadrants (Workspace Contexts)
| Context | Route | Subtitle | Status | Soul |
|---------|-------|----------|--------|------|
| **People** | `/workspace/people` | "Skill in motion" | ✅ **Full** | 50-node force graph, 7 archetypes, 12 institutions, skills, links, filters, layout relaxation |
| **Institutions** | `/workspace/institutions` | "Purposeful backing" | 🟡 **Stub** | 3 mock cards, registry "coming soon" |
| **Commons** | `/workspace/commons` | "Work that stands" | 🟡 **Stub** | 3 mock cards, "coming soon" |
| **Field Desk** | `/workspace/field-desk` | "Atlas in hand" | ✅ **Full** | 4-step tender wizard: Issuer → Crew → Tender → Deploy |

### Primary Domain Entity: **TENDER**
```
Issuer (Institution) + Commons Ref + Crew (anchor/builder/apprentice from People) + Tender Spec (slug, asset_name, summary, category, location, local_bom_minor)
```
- Lifecycle: `draft` → `submitted` → `funded` → `deployed` (Roll)
- Validation: `src/lib/tender.ts` ↔ Supabase migration (per AGENTS.md)
- BOM in **minor units** (KES cents): `2400000` = 24,000 KES

### Anchored Entities (Real-World, Not Generic)
- `dev2027ke` — Nairobi dev collective
- `MWEA Animation Studio` — Nairobi creative collective
- `Cooperative Housing Trust` — Berlin housing co-op
- `Solar Commons Initiative` — Oaxaca energy co-op
- `Open Design Library` — Shared resources commons
- `Community Land Trust` — Land commons
- `Knowledge Repository` — Documentation commons

---

## 🎨 DESIGN SYSTEM (styles.css — Single Source of Truth)

### Color Primitives (5 × Light/Dark)
| Primitive | Light | Dark | Role |
|-----------|-------|------|------|
| **terrain** | `#5d7a5c` | `#8fd98f` | Primary actions, OK state, dev archetype |
| **brass** | `#b8955a` | `#e8c87d` | Warning, institutions, socializer archetype |
| **water** | `#3a6b8c` | `#7dd3fc` | Info, commons, graduate archetype |
| **contour** | `#c8b89a` | `#d4c4a0` | Neutral accent, builder archetype |
| **phosphor** | `#8fd98f` | `#8fd98f` | Highlight, researcher archetype |

### Semantic Roles (CSS Variables)
```css
--bg, --bg-elev, --bg-subtle, --bg-term
--text, --text-muted, --text-faint
--border, --border-strong, --hairline
--ok/--ok-bg, --warn/--warn-bg, --info/--info-bg
```

### Typography Scale (Modular 1.25)
`--step--2` (9-10px) → `--step-5` (38-39px) via `clamp()`

### Spacing
- Baseline grid: `--baseline: 8px` → `--space-1..12`
- Fibonacci: `--fib-1..7` (8, 13, 21, 34, 55, 89, 144)

### Shared Controls (Use These)
- `Button` — variants: `primary`, `ghost`, sizes: `sm`, `lg`
- `Input` — consistent styling
- `Card` / `CardBody` — elevated surfaces

---

## 🏗️ ARCHITECTURE

### Stack
- **Preact** + **Vite** + **Wouter** (router) + **@preact/signals** (state)
- **Vitest** + **jsdom** + **@testing-library/preact**
- **TypeScript** strict mode

### Key Patterns
1. **WorkspaceLayout** — Shell: Header + Main + Footer ("APT-LABS — Field Desk · PROTOTYPE · 001")
2. **WorkspaceHeader** — Brand + 4-context switcher + user menu (localStorage auth)
3. **WorkspaceContextSwitcher** — Alternate inline nav (used in workspace pages)
4. **Force Graph (People)** — D3-style simulation in Preact SVG, 200-frame relaxation
5. **Multi-step Wizard (FieldDesk)** — Signal-based form state, step validation

### Data Flow
```
localStorage (authUser, workspaceContext) → WorkspaceHeader → Routes → Pages
People.tsx: generatePeople() → MOCK_PEOPLE (50 nodes) → force simulation → SVG
FieldDesk.tsx: local constants (INSTITUTIONS, PEOPLE, COMMONS) → form → console.log tender
```

### Critical Divergence (Fix Next Block)
- `People.tsx` has `MOCK_PEOPLE` (50 generated) with full archetype/institution/skills
- `FieldDesk.tsx` has local `PEOPLE` (10 hardcoded) — **not the same data**
- **Fix**: Lift shared constants to `src/lib/` → single source for both

---

## ⚡ VELOCITY BASELINE

### Measured (This Session)
| Task | Time | Notes |
|------|------|-------|
| Read full codebase (6 files) | ~3 min | Cold start |
| Create design-soul.md | ~2 min | This file |
| **Estimated: Login page (Auth.tsx exists)** | **~5-8 min** | Modify existing, test, commit, push |
| **Estimated: New page from scratch** | **~12-18 min** | Component + route + styles + test |

### Commit/Push Cycle
```bash
# Fast path (no force push — Lovable constraint)
git add -A && git commit -m "feat: <scope> — <description>" && git push origin master
# ~30-45 sec including network
```

### Block Size Target
- **Micro-block**: 5-10 min (single component, constant lift, style tweak)
- **Macro-block**: 20-35 min (feature slice: e.g., "wire FieldDesk crew picker to People data")
- **Always**: Test → Commit → Push within block

---

## 📦 BLOCK QUEUE (Prioritized)

### Block 0: **Shared Constants Lift** (Micro, ~8 min)
- Create `src/lib/constants.ts` with: `INSTITUTIONS`, `PEOPLE` (from People.tsx), `COMMONS`, `CREW_ROLES`, `CATEGORIES`, `ARCHETYPES`
- Update `People.tsx` and `FieldDesk.tsx` to import
- Test: both pages render, crew picker shows 50 people
- Commit: `refactor: lift shared constants to lib — single source for People + FieldDesk`

### Block 1: **Institutions Registry** (Macro, ~25 min)
- Replace `Institutions.tsx` mock cards with real registry component
- Add search/filter, detail view, create/edit (localStorage first)
- Connect FieldDesk issuer selector to registry data
- Commit: `feat: institutions registry — searchable, connects to FieldDesk`

### Block 2: **Commons Registry** (Macro, ~25 min)
- Same pattern as Institutions
- Connect FieldDesk commonsRef selector
- Commit: `feat: commons registry — connects to FieldDesk`

### Block 3: **Tender Persistence + Roll** (Macro, ~35 min)
- Create `src/lib/tender.ts` with validation + Supabase types
- Add Supabase client (env vars), table: `tenders`
- FieldDesk "Deploy to Roll" → insert tender, redirect to Roll view
- Roll view: list tenders with status, filter by issuer/crew
- Commit: `feat: tender persistence + roll view — Supabase backed`

### Block 4: **Auth Hardening** (Micro, ~10 min)
- `Auth.tsx` exists but uses localStorage only
- Add Supabase auth integration (email/password)
- Protect workspace routes
- Commit: `feat: supabase auth — protected workspace`

### Block 5: **School Console Scaffold** (Macro, ~30 min)
- New route `/workspace/school-console` (per AGENTS.md tender example)
- Local-first (IndexedDB), no Supabase for student records
- Connect to FieldDesk tender `school-console-v1`
- Commit: `feat: school console scaffold — local-first, tenders-linked`

---

## 🔄 SELF-LEARNING RULES (Update After Every Block)

1. **After each block**: Update this file — velocity actuals, new patterns, decisions, blockers
2. **Velocity tracking**: Log actual vs estimated time
3. **Pattern capture**: New component patterns → "Shared Controls" section
4. **Decision log**: Why X over Y → "Architecture Decisions" section
5. **Blocker log**: What slowed us → "Friction Points" section
6. **Ontology evolution**: New entities/relationships → "Ontology" section

---

## 📝 DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-28 | Preact over React | Smaller bundle, signals built-in, compatible |
| 2026-10-28 | Wouter over React Router | 1.5kb, hook-based, fits Preact |
| 2026-10-28 | @preact/signals over useState | Fine-grained reactivity, no re-render cascades |
| 2026-10-28 | localStorage auth (temp) | Speed to prototype; Supabase auth in Block 4 |
| 2026-10-28 | Inline styles + CSS variables | Zero config, design tokens in CSS, portable |
| 2026-10-28 | Force graph in SVG (not canvas) | DOM-accessible, CSS-stylable, accessible |

---

## ⚠️ FRICTION POINTS (Observed)

| Point | Impact | Mitigation |
|-------|--------|------------|
| No `src/lib/` yet | Constants duplicated | Block 0 fixes this |
| No Supabase client | All persistence blocked | Add `@supabase/supabase-js`, env vars |
| No codegraph | Navigation by grep | Consider `ctags` or `ts-morph` for large refactors |
| Lovable: no force push | Must keep history clean | Squash locally before push, never amend pushed |
| AGENTS.md: School Console local-only | Dual persistence model | IndexedDB for school, Supabase for tenders |
| **Over-baking constants file** | **8m 43s no push** | **Next time: create minimal constants.ts first (2 min), push, THEN expand in follow-up block. Rule: every block must end with commit+push.** |

---

## 🎯 NEXT ACTION (Immediate)

**Block 0: Shared Constants Lift** — Start now.

```bash
# 1. Create src/lib/constants.ts
# 2. Update People.tsx imports
# 3. Update FieldDesk.tsx imports  
# 4. npm run test (if tests exist)
# 5. git add -A && git commit -m "refactor: lift shared constants to lib" && git push origin master
```

**Target**: 8 min wall-clock. Go.

---

*Last updated: 2026-10-28 — Session start*
*Next read: Start of next session or after context loss*