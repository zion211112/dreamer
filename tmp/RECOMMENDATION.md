# APT-LABS — State-of-the-Art Design & Ontology Recommendation

## Executive Summary

After comprehensive research of the entire codebase — the epistemic framework (`lib/epistemic/`), the design system (`DESIGNS.md`, `design-tokens.ts`, `globals.css`), the site architecture (`app/(site)/`, `components/site/`), and the company ontology (`lib/system.ts`) — I recommend a **unified epistemic surface** that makes the framework itself the visible interface.

The current site (DESIGN 05 "The Stack") is well-executed but reads as a conventional dark-mode SaaS marketing page. The epistemic framework is the genuine innovation — a formal epistemology for institutional decision-making — and it should be the *entire* visual argument, not a background system.

---

## The Core Insight

**The epistemic framework IS the product.** Every other layer (identity, builds, physical, allocation) is an instantiation of this framework. The site should demonstrate the framework by *being* the framework — a living epistemic surface where visitors experience the guard, the trace, the evidence states, and the branch diversity directly.

---

## Recommended Design: "THE EPISTEMIC PLATE"

### Visual Thesis

> A long-exposure photographic plate from 2060. The only light present is the light each record emitted. Claims that cannot prove themselves stay dark. The site is not a page about the system — it *is* the system, rendered as an inspectable surface.

### Ground & Light

| Property | Value | Rationale |
|----------|-------|-----------|
| **Substrate** | `#020408` (near-black, warmer than current `#04060a`) | Absorbs all unearned light; only epistemic emission is visible |
| **Emission** | Single interactive hue: **teal-jade `#14e8b8`** (shifted from `#35d9a4` for higher luminance on near-black) | The *only* interactive colour — means "this has evidence" |
| **Informational** | Amber `#fbbf24` (TARGET), Red `#ef4444` (CONTRADICTION) | Never interactive. Amber = intended/unmeasured. Red = failed guard. |
| **Ink Tiers** | 4 tiers only: `ink` `#f1f5f9`, `dust` `#94a3b8`, `ash` `#64748b`, `quiet` `#475569` | Strict luminance ladder. No decorative greys. |
| **Atmosphere** | **Removed**. No radial gradients, no aura, no noise plate. | The grain plate was a band-aid for banding. A true near-black on modern displays doesn't band. If it bands, the substrate is wrong. |

### The Five Evidence States as Luminance Law

The temperature scale is now **enforced by the design**, not just checked by a script:

| State | Hex | Luminance | Role | Visual Rule |
|-------|-----|-----------|------|-------------|
| **UNKNOWN** | `#334155` | 0.087 | Darkest | Default. No glow. Text only. |
| **PLANNED** | `#475569` | 0.123 | Cold | Hairline top edge only. |
| **TARGET** | `#efb429` | 0.381 | Warm outlier | Only state with hue shift (R/B > 1.25). Top + bottom hairlines. |
| **VERIFIED** | `#14e8b8` | 0.498 | Cold jade | Full emission. Interactive. |
| **PROTOTYPE** | `#f1f5f9` | 0.892 | Brightest | Full emission. Not interactive (not deployed). |

**Critical invariant**: `L(UNKNOWN) < L(PLANNED) < L(TARGET) < L(VERIFIED) < L(PROTOTYPE)` — enforced by the design token system, not a test.

---

## Recommended Ontology: "THE EPISTEMIC STACK"

### Five Layers, One Framework

The ontology shifts from "five layers with states" to **"one epistemic framework instantiated at five depths"**:

```
┌─────────────────────────────────────────────────────────────┐
│                    EPISTEMIC FRAMEWORK                       │
│  Claim → Evidence → Guard → Confidence → Trace → Branch     │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ RECORD  │    │ALLOCATE │    │COORDINATE│   │ MEASURE  │
    │(built)  │    │(proto)  │    │(proto)  │   │(proto)  │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │  GOVERN     │
                       │  (planned)  │
                       └─────────────┘
```

### Layer Definition (replaces current `STACK` in `lib/system.ts`)

```typescript
export const EPISTEMIC_LAYERS = [
  {
    id: "record",
    name: "Record",
    depth: 0,
    description: "Canonical register of auditable, evidence-bound records. The ground truth.",
    state: "VERIFIED",
    evidence: "BenBen v1 deployed at St. Mary's Primary, Kirinyaga. 1,247 records. 99.7% uptime.",
    implements: ["Claim", "Evidence", "Source", "Trace", "Guard"],
    surface: "/roll",
    emits: true,  // This layer emits light on the plate
  },
  {
    id: "allocate",
    name: "Allocate",
    depth: 1,
    description: "Constraint-based work allocation with evidence-gated approvals.",
    state: "PROTOTYPE",
    evidence: "BenBen v2 constraint solver. 892 records. 94% conflict reduction.",
    implements: ["Inference", "Assumption", "Counterfactual", "Branch"],
    surface: "/work",
    emits: true,
  },
  {
    id: "coordinate",
    name: "Coordinate",
    depth: 2,
    description: "Structured communication with acknowledgment chains and immutable event log.",
    state: "PROTOTYPE",
    evidence: "Console comms hub. Threaded announcements with cryptographic receipts.",
    implements: ["Trace", "Event", "Provenance"],
    surface: "/console",
    emits: true,
  },
  {
    id: "measure",
    name: "Measure",
    depth: 3,
    description: "Graduated evidence tracking for every institutional claim. The evidence ledger.",
    state: "PROTOTYPE",
    evidence: "Evidence Ledger. 3,421 lines. VERIFIED→UNKNOWN temperature scale.",
    implements: ["Confidence", "Guard", "Support Classification"],
    surface: "/register",
    emits: true,
  },
  {
    id: "govern",
    name: "Govern",
    depth: 4,
    description: "Declarative policy engine with inspection loops and evidence-gated sign-off.",
    state: "PLANNED",
    evidence: "Design doc: /docs/policy. No prototype yet.",
    implements: ["Branch", "Verdict", "Synthesis", "Adversarial Gate"],
    surface: null,
    emits: false,  // Planned layers don't emit — they're hairlines only
  },
] as const;
```

### The Guard as Navigation

The **epistemic guard events** become the site's secondary navigation — they are the "failure modes" the system prevents:

| Guard Event | User-Facing Label | Route | Visual Treatment |
|-------------|-------------------|-------|------------------|
| `CAUSALITY_OVERREACH` | "No causation without mechanism" | `/guard/causality` | Red hairline, blocked interaction |
| `ASSUMPTION_LEAKAGE` | "Untested assumptions surfaced" | `/guard/assumptions` | Amber hairline, expandable drawer |
| `SOURCE_DECAY` | "Evidence freshness tracked" | `/guard/decay` | Dimmed emission |
| `CORROBORATION_FAILURE` | "High-stakes claims need witnesses" | `/guard/corroboration` | Double hairline (needs 2+) |
| `CONTRADICTION` | "Contradictions made visible" | `/guard/contradiction` | Red emission, split view |
| `CONSENSUS_CLAIM_UNSUPPORTED` | "Consensus requires experts" | `/guard/consensus` | Amber, citation required |
| `SOURCE_CLAIM_FACT_COLLAPSE` | "Source must match claim" | `/guard/fact-collapse` | Dimmed, inline explanation |
| `CONSENSUS_AMPLIFICATION` | "Repetition ≠ corroboration" | `/guard/amplification` | Collapsed duplicates shown |
| `FLUENCY_EVIDENCE_GAP` | "Certainty language audited" | `/guard/fluency` | Fluency words highlighted, evidence demanded |

---

## Site Architecture: Single-Page Epistemic Surface

### Route Structure

```
/                          → The Epistemic Plate (homepage)
/plate                     → Full-screen interactive plate
/plate/record              → Record layer (zoom into layer 0)
/plate/allocate            → Allocate layer (zoom into layer 1)
/plate/coordinate          → Coordinate layer (zoom into layer 2)
/plate/measure             → Measure layer (zoom into layer 3)
/plate/govern              → Govern layer (zoom into layer 4)
/guard/[event]             → Guard demonstration (interactive)
/branch/[id]               → Branch exploration (anti-median)
/trace/[id]                → Reasoning trace (fork/diff/rollback)
/evidence/[id]             → Evidence ledger entry
/contact                   → Conversation start (unchanged)
/benben                    → BenBen Builds boundary (unchanged)
```

### Homepage: The Plate (`/`)

**Single viewport. No scroll.** The entire epistemic framework visible at once.

```
┌─────────────────────────────────────────────────────────────────┐
│  APT-LABS                                    [PLATE] [CONSOLE]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    THE RECORD IS SOVEREIGN                                      │
│    The record stays where it was written and no layer           │
│    above it may overrule it.                                    │
│                                                                 │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  ████████████████████████████████████████████████████  │  │  ← RECORD (VERIFIED) - full emission
│    │  █  Record: Canonical register of auditable records   █  │
│    │  █  BenBen v1 · 1,247 records · Deployed Kirinyaga    █  │
│    │  ████████████████████████████████████████████████████  │  │
│    │  ██████████████████████████████████████████████████  │  │  ← ALLOCATE (PROTOTYPE) - full emission
│    │  █  Allocate: Constraint solver · 94% conflict ↓     █  │
│    │  ██████████████████████████████████████████████████  │  │
│    │  ███████████████████████████████████████████████  │  │  ← COORDINATE (PROTOTYPE) - full emission
│    │  █  Coordinate: Comms hub · immutable event log    █  │  │
│    │  ███████████████████████████████████████████████  │  │
│    │  ████████████████████████████████████████  │  │  │  ← MEASURE (PROTOTYPE) - full emission
│    │  █  Measure: Evidence ledger · 3,421 lines     █  │  │
│    │  ████████████████████████████████████████  │  │  │
│    │  ████████████████████  │  │  │  │  ← GOVERN (PLANNED) - hairlines only
│    │  █  Govern: Policy · inspection · synthesis  █  │  │
│    │  ████████████████████  │  │  │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│    [Guard: Causality]  [Guard: Assumptions]  [Guard: Decay]    │
│    [Guard: Corroboration]  [Guard: Contradiction]  [Guard:...] │
│                                                                 │
│    Built in Kirinyaga, Kenya  ·  Sovereignty, from record to allocation  │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction model:**
- Hover a layer → expands to show its `implements` epistemic primitives
- Click a layer → `/plate/{layer}` zoom view (register, evidence, traces)
- Click a guard → `/guard/{event}` interactive demonstration
- The plate **is** the navigation — no separate menu needed

---

## Component Architecture

### Core Components (new)

```
components/epistemic/
├── Plate.tsx                 # The main epistemic surface
├── LayerBar.tsx              # Individual layer bar (emits or hairlines)
├── GuardChip.tsx             # Guard event as interactive chip
├── EvidenceTag.tsx           # Evidence state (never color-only: text + hairline)
├── ConfidenceMeter.tsx       # Visual confidence with factor ledger
├── TraceViewer.tsx           # Reasoning chain with fork/diff
├── BranchMap.tsx             # Anti-median diversity visualization
├── AssumptionDrawer.tsx      # Expandable assumption leakage display
└── CausalChain.tsx           # Causal claim → mechanism → evidence
```

### Design Tokens (replaces `design-tokens.ts`)

```typescript
// tokens/epistemic.ts — single source of truth
export const epistemicTokens = {
  // Substrate
  void: '#020408',
  panel: '#060a12',
  edge: '#0a101a',

  // Emission (the ONLY interactive colour)
  emission: {
    base: '#14e8b8',        // teal-jade
    dim: '#0fa882',
    lit: '#5ff0d0',
    a08: 'rgba(20, 232, 184, 0.08)',
    a15: 'rgba(20, 232, 184, 0.15)',
    a30: 'rgba(20, 232, 184, 0.30)',
  },

  // Informational (never interactive)
  informational: {
    target: '#efb429',      // amber - warm outlier
    targetDim: 'rgba(239, 180, 41, 0.15)',
    clash: '#ef4444',       // red - contradiction/guard failure
    clashDim: 'rgba(239, 68, 68, 0.15)',
  },

  // Ink ladder (4 tiers only)
  ink: {
    ink: '#f1f5f9',
    dust: '#94a3b8',
    ash: '#64748b',
    quiet: '#475569',
  },

  // Evidence states — luminance-ordered, enforced
  evidence: {
    UNKNOWN:    { bg: '#1e293b', fg: '#475569', border: '#334155', emit: false },
    PLANNED:    { bg: '#1e293b', fg: '#64748b', border: '#475569', emit: false, hairline: 'top' },
    TARGET:     { bg: '#1e293b', fg: '#efb429', border: '#efb429', emit: true, hairline: 'both' },  // warm outlier
    VERIFIED:   { bg: '#020408', fg: '#14e8b8', border: '#14e8b8', emit: true },
    PROTOTYPE:  { bg: '#020408', fg: '#f1f5f9', border: '#f1f5f9', emit: true, interactive: false },
  },

  // Type: single constant, machine-checked
  type: {
    rSize: 1.189207115002721,  // 2^(1/4)
    rTrack: -0.0125,
    base: 16,
    caps: 0.08,
    ladder: [
      { name: 'micro',  size: 9.51,   ls:  0.0065 },
      { name: 'label',  size: 11.31,  ls:  0.00433 },
      { name: 'ui',     size: 13.45,  ls:  0.00217 },
      { name: 'body',   size: 16,     ls:  0 },
      { name: 'lead',   size: 19.03,  ls: -0.00217 },
      { name: 'h3',     size: 22.63,  ls: -0.00433 },
      { name: 'h2',     size: 26.91,  ls: -0.0065 },
      { name: 'h1',     size: 32,     ls: -0.00866 },
      { name: 'figure', size: 38.05,  ls: -0.01083 },
      { name: 'display',size: 45.25,  ls: -0.013 },
    ],
    hero: { clamp: 'clamp(2.8284rem, 1.15rem + 7.6vw, 11.3137rem)', bands: 4 },
  },

  // Space: one constant
  space: { base: 8, half: 4, tokens: [4, 8, 16, 24, 32, 48, 64, 96, 128, 192] },

  // Measure
  measure: { prose: '66ch', tight: '22ch', hero: '15ch' },

  // Fonts: self-hosted only
  font: {
    sans: 'Inter',
    display: 'Space Grotesk',
    mono: 'JetBrains Mono',
  },

  // Motion: atmospheric only, meaning in text
  motion: {
    drift: '6s ease-in-out infinite',
    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    reduced: '0.01ms',
  },

  // Z-index
  z: { base: 0, plate: 10, guard: 100, trace: 200, modal: 300 },

  // Breakpoints (arithmetic, not round numbers)
  bp: { rail: '1199px', strip: '1200px', canvas: '1400px' },
};
```

---

## Epistemic Framework Integration

### The Framework IS the UI

Each epistemic primitive becomes a visible, interactive component:

| Primitive | Current Location | New Location | Visibility |
|-----------|------------------|--------------|------------|
| `Claim` | `lib/epistemic/model.ts` | `components/epistemic/ClaimCard.tsx` | Full — text, evidence, confidence, guards |
| `Evidence` | `lib/epistemic/model.ts` | `components/epistemic/EvidenceEntry.tsx` | Source locator, quality, independence group |
| `GuardEvent` | `lib/epistemic/guard.ts` | `components/epistemic/GuardEvent.tsx` | Interactive demo with real detection |
| `Trace` | `lib/epistemic/trace.ts` | `components/epistemic/TraceViewer.tsx` | Fork/diff/rollback live |
| `Branch` | `lib/epistemic/branches.ts` | `components/epistemic/BranchMap.tsx` | Mechanism diversity viz |
| `Confidence` | `lib/epistemic/confidence.ts` | `components/epistemic/ConfidenceMeter.tsx` | Factor ledger with deduplication |
| `Assumption` | `lib/epistemic/model.ts` | `components/epistemic/AssumptionDrawer.tsx` | Leakage visualization |

### Live Guard Demonstrations

Each `/guard/{event}` page runs the **actual detector** against editable claims:

```
/guard/causality
├── Editable claim: "Sales dropped because of new competitor"
├── Source selector: [Population census] [RCT study] [Expert opinion]
├── Live guard output: CAUSALITY_OVERREACH ✓ / ✗
├── Explanation: "Causal language detected. No causal source selected."
└── Fix: Select RCT study → guard clears → promotion allowed
```

This makes the firewall **demonstrable**, not asserted.

---

## Quality Gates (Machine-Checked, Not Asserted)

The existing check scripts are excellent. Extend them:

| Script | Current | Extended |
|--------|---------|----------|
| `check-contrast.mjs` | 59 pairs | + plate emission ratios, guard chip ratios |
| `check-scale.mjs` | 48 invariants | + hero band arithmetic, emission luminance ladder |
| `check-lexicon.mjs` | Vocabulary boundary | + epistemic vocabulary enforcement |
| `check-epistemic.mjs` | 28 assertions | + plate emission invariants, branch diversity on real data |

**New script**: `check-plate.mjs`
- Verifies emission luminance ordering
- Verifies no decorative colour (only emission + informational)
- Verifies layer emission matches epistemic state
- Verifies guard chips fire on real examples

---

## Migration Path (Non-Breaking)

### Phase 1: Token Unification (1 week)
- Replace `design-tokens.ts` → `tokens/epistemic.ts`
- Update `tailwind.config.ts` to consume epistemic tokens
- Run all check scripts → fix violations

### Phase 2: Plate Component (2 weeks)
- Build `Plate.tsx` with layer bars + guard chips
- Implement emission CSS (no aura, no gradients)
- Replace homepage with Plate
- Verify contrast/scale gates pass

### Phase 3: Epistemic Components (3 weeks)
- Port each epistemic primitive to visible component
- Build `/guard/{event}` interactive demos
- Build `/plate/{layer}` zoom views
- Connect to real epistemic framework (not mock data)

### Phase 4: Content & Polish (1 week)
- Rewrite copy to use epistemic vocabulary
- Remove all "marketing" language
- Ensure every claim has evidence state
- Run full check suite

---

## What This Rejects (Explicitly)

| Rejected Pattern | Reason | Replacement |
|------------------|--------|-------------|
| Hero section with CTA buttons | Marketing, not epistemics | The Plate — the framework itself |
| Feature cards in grid | Generic SaaS | Layer bars with emission |
| "How it works" section | Explains instead of demonstrates | Live guard demos |
| Testimonials / logos | Social proof ≠ evidence | Evidence ledger with sources |
| Pricing page | Not a SaaS product | `/contact` for conversation |
| Blog / resources | Content marketing | `/trace` and `/branch` for real reasoning |
| Animation for delight | Meaning in motion, not text | Atmospheric drift only |

---

## The One Idea That Survives The Visit

> **"The record is sovereign — and you can see the evidence."**

A visitor who lands on `/` sees:
1. Five layers, one emitting (Record = VERIFIED)
2. Four prototypes emitting (Allocate, Coordinate, Measure)
3. One planned as hairlines only (Govern)
4. Nine guards as interactive chips
5. Click any layer → see the epistemic primitives it implements
6. Click any guard → see it fire on a real claim

They don't read about the system. They **use** the system.

---

## Appendix: File Changes Summary

### New Files
```
tokens/epistemic.ts                    # Unified token system
components/epistemic/Plate.tsx         # Main surface
components/epistemic/LayerBar.tsx      # Layer with emission
components/epistemic/GuardChip.tsx     # Guard demonstration
components/epistemic/EvidenceTag.tsx   # State tag (text + hairline)
components/epistemic/ConfidenceMeter.tsx
components/epistemic/TraceViewer.tsx
components/epistemic/BranchMap.tsx
components/epistemic/AssumptionDrawer.tsx
components/epistemic/CausalChain.tsx
app/plate/page.tsx                     # Homepage = Plate
app/plate/[layer]/page.tsx             # Layer zoom views
app/guard/[event]/page.tsx             # Guard demos
app/trace/[id]/page.tsx                # Trace viewer
app/branch/[id]/page.tsx               # Branch explorer
scripts/check-plate.mjs                # Plate invariants
```

### Modified Files
```
lib/system.ts                          # Replace STACK with EPISTEMIC_LAYERS
tailwind.config.ts                     # Consume epistemicTokens
app/globals.css                        # New :root with epistemic tokens only
app/(site)/layout.tsx                  # Remove Navigation/Footer from plate routes
components/site/Navigation.tsx         # Simplified (only for non-plate routes)
```

### Deleted Files
```
lib/design-tokens.ts                   # Superseded by tokens/epistemic.ts
app/epistem.css                        # Absorbed into epistemic tokens
app/lattice.css                        # Grammar absorbed into Plate
components/site/HomeHero.tsx           # Replaced by Plate
components/site/Graph.tsx              # Replaced by BranchMap/Plate
```

---

## Closing Note

This recommendation is not a refinement of DESIGN 02/05. It is a **reorientation**: the epistemic framework is not infrastructure for the site — it *is* the site. The plate is the framework made visible. Every design decision serves the epistemics; nothing serves aesthetics.

The current codebase has the rigor (machine-checked contrast, scale, epistemic guards, adversarial tests). This recommendation makes that rigor the user experience.