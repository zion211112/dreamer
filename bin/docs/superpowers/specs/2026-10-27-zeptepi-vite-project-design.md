# zeptepi — Vite + Preact + Wouter Project Design

**Date:** 2026-10-27
**Status:** Approved for implementation

---

## 1. Project Overview

Create a new clean Vite project called "zeptepi" at the repository root, containing:
- Landing page (ported from current Next.js front page)
- Minimal authentication page (sign-in / sign-up with magic link flow)
- Three workspace context routes: `/workspace/people`, `/workspace/institutions`, `/workspace/commons`
- Fresh minimal design tokens (colors, type scale, spacing only)
- Archive all existing Next.js code to `bin/` for research reference

---

## 2. Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build | Vite | Fast, minimal config, native ESM |
| UI | Preact (3kb) | React-compatible API, tiny bundle |
| Router | Wouter (1.5kb) | Minimal hooks-based routing |
| State | @preact/signals | Fine-grained reactivity |
| Styling | Vanilla CSS + CSS Custom Properties | No build-time CSS, portable tokens |
| Language | TypeScript | Type safety |

---

## 3. Project Structure

The new Vite project lives at the **repository root** (replacing current Next.js structure). The `bin/` archive sits alongside it.

```
# Repository root after migration
├── index.html              # Vite entry HTML
├── package.json            # Vite + Preact + Wouter deps
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx           # Entry point, renders <App />
│   ├── App.tsx            # Routes with Wouter Switch/Route
│   ├── styles.css         # Fresh minimal design tokens
│   ├── components/
│   │   ├── BrandMark.tsx       # APT—LABS wordmark
│   │   ├── Button.tsx          # Button variants (inline styles)
│   │   ├── Input.tsx           # Form inputs (inline styles)
│   │   ├── Card.tsx            # Panel/card wrapper (inline styles)
│   │   └── WorkspaceContextSwitcher.tsx
│   ├── pages/
│   │   ├── Landing.tsx         # Front page (Hero + Orbit only)
│   │   ├── Auth.tsx            # Sign-in / Sign-up (mode toggle)
│   │   └── workspace/
│   │       ├── People.tsx
│   │       ├── Institutions.tsx
│   │       └── Commons.tsx
│   ├── hooks/
│   │   └── useAuth.ts          # Auth state (localStorage for demo)
│   └── lib/
│       └── auth.ts             # Magic link simulation
└── bin/                        # Research archive (old Next.js code)
    ├── app/
    ├── components/
    ├── lib/
    ├── styles/
    ├── docs/
    ├── public/
    └── package.json            # Original Next.js package.json
```

---

## 4. Landing Page (`/`)

**Port from current `app/page.tsx` — Hero + Orbit only**

### Structure
1. **SiteHeader** — APT—LABS wordmark + "Enter the studio" link → `/sign-in?next=/workspace/people`
2. **Hero Section** (grid: copy left, orbit right)
   - Eyebrow: `APT-LABS / SOVEREIGN COORDINATION ENGINE` + signal dot (terrain)
   - H1: `Make good work` / `find its people.` ("find its people" in terrain)
   - Lede: `A practical network for people who build what their communities need.`
   - Body: `APT-LABS brings local knowledge, capable hands, and committed capital into the same place—so ideas can move from intention to work in the world.`
   - CTA: Primary button `Enter the studio →` → `/sign-in?next=/workspace/people`
   - Coordinate bar: `BUILT FOR REAL-WORLD EXECUTION` | `PROTOTYPE · 001`
3. **Orbit Graphic** (SVG recreation)
   - Concentric rings (dashed outer, solid inner)
   - Cross hairs
   - Core: Orbit icon + `APT`
   - Three orbit points with labels:
     - 01 / PEOPLE — Skill in motion (terrain)
     - 02 / CAPITAL — Purposeful backing (brass)
     - 03 / EVIDENCE — Work that stands (water)
   - Stamp: `A NETWORK / BUILT TO DO`
   - Caption: `COORDINATION IS INFRASTRUCTURE`

**Excluded:** Principle section, Footer

---

## 5. Auth Pages (`/sign-in`, `/sign-up`)

### Routes
- `/sign-in?next=/workspace/people` → Auth page in sign-in mode
- `/sign-up?next=/workspace/people` → Auth page in sign-up mode

### Layout
- Centered card (max-width 420px) on subtle grid background
- Terminal-style header bar with window dots (red/amber/green)
- Brand mark: APT—LABS wordmark (editorial manuscript style)
- Eyebrow: `AUTHENTICATION · MINIMAL`
- Headline: `Enter the studio` (sign-in) / `Join the network` (sign-up)
- Intro: `We'll send a magic link. No password required.`

### Form Fields
1. **Email** (required, type=email, autocomplete="username")
2. **Workspace Context** (required, select):
   - People — Skill in motion
   - Institutions — Purposeful backing
   - Commons — Work that stands
3. Hidden: `intent` (sign-in | sign-up), `next` (redirect target)

### Actions
- Primary: `Send Magic Link` (terrain) — simulates magic link, stores context, redirects to `next`
- Divider: `Or continue with`
- Ghost: `Continue with Google` (placeholder for future)
- Footer toggle: "Already have an account? Sign in" / "New to the network? Create an account"
- Local notice: `Workspace context stored locally for demo`

---

## 6. Workspace Context Pages

### Routes (separate routes per context)
- `/workspace/people` — People context
- `/workspace/institutions` — Institutions context
- `/workspace/commons` — Commons context

### Shared Layout (`WorkspaceLayout`)
- Header: APT—LABS wordmark + Context Switcher (People | Institutions | Commons)
- Main content area
- Minimal footer

### Context Switcher
- Shows current context highlighted
- Click navigates to other context route
- Persists choice in localStorage

### Page Content (placeholder for v1)
| Route | Heading | Subtitle | Placeholder |
|-------|---------|----------|-------------|
| `/workspace/people` | People — Skill in motion | Network directory coming soon | Mock list of 3 people |
| `/workspace/institutions` | Institutions — Purposeful backing | Institution registry coming soon | Mock list of 3 institutions |
| `/workspace/commons` | Commons — Work that stands | Shared resources coming soon | Mock list of 3 resources |

---

## 7. Fresh Minimal Design Tokens

**Only core tokens — no component classes**

### Colors
```css
:root {
  --ink: #1a1d18;
  --ink-strong: #0f110d;
  --paper: #f5f3ee;
  --paper-raw: #ebe7df;
  --paper-elev: #ffffff;
  --muted: #6b7066;
  --faint: #969b90;
  --line: rgba(26,29,24,.12);
  --line-strong: rgba(26,29,24,.22);
  --hairline: rgba(26,29,24,.08);

  --terrain: #5d7a5c;
  --terrain-pale: #e4ebe3;
  --terrain-ink: #2e3d2d;
  --brass: #b8955a;
  --brass-pale: #f2eadc;
  --water: #3a6b8c;
  --phosphor: #8fd98f;
  --bg-term: #0d110e;
}
```

### Typography
```css
--serif: Georgia, "Times New Roman", serif;
--sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;

--step--2: clamp(9px, 0.64rem, 10px);
--step--1: clamp(10px, 0.8rem, 11px);
--step-0:  clamp(12.5px, 1rem, 13px);
--step-1:  clamp(15.6px, 1.25rem, 16px);
--step-2:  clamp(19.5px, 1.56rem, 20px);
--step-3:  clamp(24.4px, 1.95rem, 25px);
--step-4:  clamp(30.5px, 2.44rem, 31px);
--step-5:  clamp(38.1px, 3.05rem, 39px);
```

### Spacing (Baseline Grid 8px + Fibonacci)
```css
--baseline: 8px;
--space-1: 8px;   --space-2: 16px;  --space-3: 24px;
--space-4: 32px;  --space-5: 40px;  --space-6: 48px;
--space-7: 56px;  --space-8: 64px;  --space-9: 72px;
--space-10: 80px; --space-11: 88px; --space-12: 96px;

--fib-1: 8px;  --fib-2: 13px; --fib-3: 21px;
--fib-4: 34px; --fib-5: 55px; --fib-6: 89px; --fib-7: 144px;
```

### Border Radius
```css
--radius-1: 3px; --radius-2: 6px; --radius-3: 8px; --radius-4: 12px; --radius-pill: 999px;
```

### Shadows
```css
--shadow-1: 0 1px 2px rgba(26,29,24,.06), 0 1px 4px rgba(26,29,24,.04);
--shadow-2: 0 4px 8px rgba(26,29,24,.08), 0 2px 4px rgba(26,29,24,.05);
--shadow-3: 0 8px 24px rgba(26,29,24,.1), 0 4px 12px rgba(26,29,24,.06);
```

### Dark Mode (Terminal aesthetic)
```css
.dark {
  --ink: #e8ebe5; --ink-strong: #f4f3ee;
  --paper: #0d110e; --paper-raw: #141a15; --paper-elev: #1a221c;
  --muted: #6d7d6e; --faint: #4a554b;
  --line: rgba(109,125,110,.3); --line-strong: rgba(109,125,110,.5);
  --terrain: #8fd98f; --terrain-pale: #1a2d1a; --terrain-ink: #f0fff0;
  --brass: #e8c87d; --brass-pale: #3d341a;
  --water: #7dd3fc; --phosphor: #8fd98f; --bg-term: #0d110e;
}
```

---

## 8. Bin/Research Archive

Move all existing Next.js code to `bin/` at repository root:
```
bin/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Library code (supabase, tender, workspace-access, etc.)
├── styles/           # Full styles.css (current 2942 lines)
├── docs/             # Design specs and documentation
├── public/           # Static assets
└── package.json      # Original package.json
```

This preserves all research/history while keeping the new Vite project clean.

---

## 9. Implementation Sequence

1. Create `bin/` at repository root and move all existing Next.js code there
2. Initialize Vite + Preact + Wouter + TypeScript project at repository root (new package.json, vite.config.ts, tsconfig.json, index.html)
3. Create `src/styles.css` with minimal design tokens
4. Build shared components: BrandMark, Button, Input, Card, WorkspaceContextSwitcher
5. Build Landing page (Hero + Orbit)
6. Build Auth page (sign-in/sign-up with context selector)
7. Build WorkspaceLayout + three context pages
8. Wire up routing in App.tsx
9. Test all routes, verify styling
10. Commit and push

---

## 10. Success Criteria

- [ ] Vite project runs with `npm run dev` at repository root
- [ ] Landing page renders Hero + Orbit matching current design
- [ ] Auth page works for both sign-in and sign-up modes
- [ ] Three workspace routes accessible and switchable
- [ ] Context persists in localStorage
- [ ] Design tokens apply consistently (light + dark mode)
- [ ] Old code archived in `bin/` at repository root
- [ ] Clean git history, pushed to remote