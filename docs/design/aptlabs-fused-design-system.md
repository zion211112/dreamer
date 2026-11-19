# APT-LABS — Transcendent Sublime Fusion Design System

**Usable from now to 2099.** One ontology. Five pillars. Multiple role-specific workspaces. One coherent visual language.

---

## 1. The Pillar: Stewardship (Continuity)

**Recommended pillar, usable from now to 2099: Stewardship.**

Of the five productive pillars — Knowledge, Capacity, Production, Exchange, Stewardship — **Stewardship** is the only one that is truly timeless. It does not depend on any particular technology, economic model, or political arrangement. It answers the eternal civilizational question: *How do we preserve what we build, verify what we claim, govern what we control, and transmit what we learn across generations?*

### Why Stewardship endures to 2099

| Challenge | Stewardship response | Why it's timeless |
|-----------|---------------------|-------------------|
| Knowledge decay | Records & provenance, institutional memory | Civilizations have always needed to remember |
| Trust erosion | Verification, certification, compliance | Trust is the substrate of all exchange |
| Asset entropy | Maintenance, risk, resilience | Physical and digital assets always degrade |
| Power concentration | Governance, permissions, evidence | Accountability never becomes obsolete |
| Disaster | Risk & resilience, continuity planning | Shocks are a constant of history |

The other four pillars are necessary, but they are **means**. Stewardship is the **end** — it makes today's achievements tomorrow's starting point. Without Stewardship, nothing compounds. Without continuity, every generation starts from zero.

**APT-LABS should be built around Stewardship as the foundational pillar, with Knowledge, Capacity, Production, and Exchange as the productive capabilities it preserves and compounds.**

---

## 2. The Fusion: Ten Design Languages, One System

Design was extracted from ten reference design systems using `design-extract` (CLI), direct token-file fetching, and npm package inspection, then fused into a single transcendent sublime design system. Each source contributed what it does best:

| Source | What it contributes | Extracted metrics |
|--------|--------------------|-------------------|
| **Palantir Foundry** (Object Explorer) | Ontology-visible navigation, object discovery, institutional green brand, object views | 18 colors, Alliance No.1/No.2 fonts, 76 CSS vars, score 90/100 (A) |
| **Linear** | Command navigation, minimal black precision, compact data, keyboard-first interaction | 5 colors, Inter Variable, 634 CSS vars, score 85/100 (B) |
| **GitHub Projects** | Board/table views, linked records, cyan brand, extensive shadow system, Mona Sans | 30 colors, Mona Sans VF/Sans/Mono, 2213 CSS vars, score 88/100 (B) |
| **Airtable** | Accessible record interfaces, blue accents, nontechnical data manipulation, 91/100 | 21 colors, Inter Display, 225 CSS vars, score 91/100 (A) |
| **Retool** | Operational consoles, dark mode, warm neutrals, **highest score 95/100**, entity drill-down | 10 colors, saansFont/pxGroteskFont, 534 CSS vars, score 95/100 (A) |
| **Databricks** (Reprise) | Analytical workspace, governed data, AI-integrated environment | 5 colors, system-ui, 199 CSS vars, score 85/100 (B) |
| **Vercel Geist** | Geometric precision typography, 2px base spacing, 8 shadow levels, 3 font families | #0072f5 brand, GeistSans/Serif/Mono, 2px-48px spacing, score 87/100 |
| **designsystems.one Geist** | Figtree typeface, warm neutral ramp, 4px base spacing, layered shadows | #0070f3/#82182e, Figtree, 4px-64px spacing, score 84/100 |
| **Supabase UI** | 20 color families, Tailwind-native sizing, semantic theming, display-p3 colors | 20 families (brand/scale/gray/slate/etc.), s0-s22, score 86/100 |
| **Twenty UI** | 25-level spacing grid, 4-tier motion system (instant→slow), component primitives | 4px base, 25 spacing levels, animation 0.075s-1.5s, score 89/100 |
| **PostHog Quill** | Primitive→semantic→component token layers, OKLCH color space, Inter typeface, continuous spacing model, runtime-overridable theme hue | Layered token architecture, score 83/100 |

### Fusion principles

1. **One ontology, visible in navigation** (from Palantir) — Every surface shows what kind of object you're looking at, its relationships, and its position in the productive graph.
2. **Complexity without clutter** (from Linear) — Dense information is navigable via command palette, keyboard shortcuts, and progressive disclosure.
3. **Ordinary people manipulate structured data** (from Airtable) — Records, filters, views, and expansions are intuitive without requiring technical training.
4. **Institutional work has ownership and state** (from Retool/ServiceNow lineage) — Every record has an owner, a status, a history, and explicit transitions.
5. **Intelligence integrated, not bolted on** (from Databricks) — AI agents, analytics, and simulation live inside the working environment, not as a chat sidebar.
6. **Typographic precision** (from Geist) — Geometric type with optical sizes across serif, sans, mono, and pixel variants.
7. **Semantic theming architecture** (from Supabase) — Color families map to semantic roles; theming is Tailwind-native and mode-aware.
8. **Motion as system** (from Twenty UI) — Animation is a first-class token layer with instant/fast/normal/slow tiers.
9. **Component-layered tokens** (from PostHog Quill) — Primitive → semantic → component → block layers prevent token sprawl.
10. **Warm operational neutrality** (from Retool + designsystems.one) — Dark modes that feel warm, not clinical; neutrals with character.
11. **OKLCH color space + runtime theming** (from PostHog Quill) — Perceptually uniform color with theme hue/tint overridable at runtime via CSS custom properties.

---

## 3. Fused Design Tokens

All tokens are DTCG v1 compliant. File: `src/lib/aptlabs-fused-design-tokens.json`

### Color system

**Brand anchor:** Stewardship green `#2b5945` (Palantir) — the enduring civilizational color.

**Pillar colors** (each pillar maps to a color from the extracted sources):

| Pillar | Color | Source | Meaning |
|--------|-------|--------|---------|
| Knowledge | `#166ee1` | Airtable blue | Clarity, learning, discovery |
| Capacity | `#818378` | Retool warm neutral | Assembly, organization, people |
| Production | `#549543` | GitHub green | Making, building, delivering |
| Exchange | `#2dced6` | GitHub cyan | Flow, markets, circulation |
| Stewardship | `#2b5945` | Palantir green | Preservation, verification, continuity |

**Neutral ramp:** 11 levels from `#ffffff` to `#000000`, synthesizing GitHub's 30-color system with Airtable's and Retool's warm neutrals.

**Backgrounds:**
- Light: `#F4F1E9` (Palantir parchment — warm, inviting)
- Dark: `#151515` (Retool obsidian — operational, focused)
- Elevated: `#FDFCF8` (light) / `#0e0e0e` (dark)

### Typography

| Role | Font | Source | Use |
|------|------|--------|-----|
| Display / Headings | Alliance No.1 + GeistSerif | Palantir + Geist | Institutional gravitas, page titles |
| UI / Body | Inter Variable + GeistSans | Linear + Airtable + Geist | Clarity, readability, dense data |
| Mono / Data | Mona Sans Mono + Geist Mono | GitHub + Geist | Codes, numbers, terminal, IDs |
| Pixel / Readout | GeistPixelSquare | Geist | Technical codes, IDs, data readouts |

### Spacing

**4px base grid** — consensus across GitHub, Airtable, Retool, and Supabase. Expanded to 25 levels (0–96px) incorporating Twenty UI's 25-step scale and Geist's 2px base increment for fine-grained control.

### Radius

11 levels from `2px` (controls) to `9999px` (pills), fusing Retool's operational precision, GitHub's component softness, and Geist's expressive curve range.

### Shadows

9 levels, from hairline border (`sh0`) to observatory dark depth (`sh8`), combining Retool's console elevation, GitHub's layered board shadows, Geist's hairline border, and designsystems.one's deep elevation.

---

## 4. How to Apply This to APT-LABS

### Immediate next steps

1. **Import the tokens** — `src/lib/aptlabs-fused-design-tokens.json` is DTCG v1 and can be consumed by Style Dictionary, Figma Variables, or Tailwind.

2. **Map to existing APT-LABS modules** — The current `src/tailwind.css` already has an olive/umber/brass/clay/sage palette. Fuse the extracted pillar colors into the module accent themes:

```css
[data-module="commons"]   { --accent: #166ee1; } /* Knowledge — Airtable blue */
[data-module="network"]   { --accent: #2dced6; } /* Exchange — GitHub cyan */
[data-module="workbench"] { --accent: #2b5945; } /* Production — Stewardship green */
[data-module="records"]   { --accent: #A8B0A0; } /* Stewardship — Palantir sage */
[data-module="intelligence"] { --accent: #000000; } /* Intelligence — Linear black */
```

3. **Apply the pillar visual language** — Each pillar's color should appear in its rail icons, active states, record badges, and status indicators.

4. **Use the 13 downloaded Palantir ontology images** in `docs/design/palantir-ontology-images/` as visual references when designing object views, property editors, and navigation.

---

## 5. Extraction Inventory

All design was extracted via `design-extract` CLI, direct token-file fetching, and npm package inspection:

| # | Source | URL | Output | Files |
|---|--------|-----|--------|-------|
| 1 | Palantir Foundry | palantir.com/docs/foundry/object-explorer/ | `design-extract-output/` | design-tokens.json, tailwind.config.js, brand.html, ... |
| 2 | Linear | linear.app | `design-extract-output/` | linear-app-design-tokens.json, ... |
| 3 | GitHub Projects | github.com/orgs/github/projects/ | `design-extract-output/` | github-com-design-tokens.json, ... |
| 4 | Airtable | airtable.com/embed/ | `design-extract-output/` | airtable-com-design-tokens.json, ... |
| 5 | Retool | onretool.com/app-gallery/ | `design-extract-output/` | onretool-com-design-tokens.json, ... |
| 6 | Databricks | app.getreprise.com/launch/ | `design-extract-output/` | app-getreprise-com-design-tokens.json, ... |
| 7 | Vercel Geist | vercel.com/geist | `design-extract-output/` | vercel-com-design-tokens.json, ... |
| 8 | designsystems.one Geist | designsystems.one/design-systems/vercel-geist | `design-extract-output/` | designsystems-one-design-tokens.json, ... |
| 9 | Supabase UI | github.com/supabase/supabase/packages/ui | npm + raw token fetch | constants.ts (color/size config) |
| 10 | Twenty UI | github.com/twentyhq/twenty/packages/twenty-ui | raw token fetch | theme-light.css, theme-dark.css, themeCssVariables.ts |
| 11 | PostHog Quill | github.com/PostHog/posthog/packages/quill/packages/tokens/src | raw token fetch | colors.ts, spacing.ts, border-radius.ts, shadow.ts, typography.ts |

Plus 13 Palantir ontology UI screenshots in `docs/design/palantir-ontology-images/`.

---

## 6. The Ultimate Test

Before accepting any design decision in this system, ask:

1. **Does it represent a fundamental productive capability?**
2. **Can multiple sectors use it?**
3. **Does it connect ordinary people with institutions and enterprises?**
4. **Does it generate real-world outcomes?**
5. **Does its output strengthen future productive capacity?**
6. **Will it still be legible and usable in 2099?**

If it fails these tests, it belongs as a feature, tool, or service — not as a pillar or a design primitive.

---

**Built with design-extract** — 11 sources extracted, fused into 1 unified transcendent sublime design system.
