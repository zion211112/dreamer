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

All tokens are CSS custom properties defined on `:root` in `src/styles.css`, consumed directly by every feature, shell and shared UI component. No separate token JSON file or Tailwind config is used.

### Color system

Tokens live as `--apt-color-*`, `--apt-surface-*`, `--apt-text-*` and `--apt-border-*` custom properties on `:root` in `src/styles.css`.

**Colour primitives**
- Brand primary: `--apt-color-brand-primary` (`#2563eb`); brand accent: `--apt-color-brand-accent` (`#3b82f6`)
- Error base: `--apt-color-error-base` (`#b91c1c`); warning base: `--apt-color-warning-base` (`#92400e`)
- Success base: `--apt-color-success-base` (`#166534`); danger base: `--apt-color-danger-base` (`#991b1b`)
- Info base: `--apt-color-info-base` (`#1e40af`)
- Neutral ramp: `--apt-color-neutral-n0` (`#ffffff`) → `--apt-color-neutral-n950` (`#0f172a`)

**Semantic surfaces** (dark instrument)
- Default: `--apt-surface-default` (`#0f172a`); page: `--apt-surface-page` (`#1e293b`); raised: `--apt-surface-raised` (`#334155`)
- Success: `--apt-surface-success` (`#ecfdf5`); danger: `--apt-surface-danger` (`#fef2f2`)
- Info: `--apt-surface-info` (`#eff6ff`); warning: `--apt-surface-warning` (`#fefbeb`)

**Semantic text**
- Body: `--apt-text-body` (`#f1f5f9`); strong: `--apt-text-strong` (`#ffffff`)
- Muted: `--apt-text-muted` (`#94a3b8`); dim: `--apt-text-dim` (`#64748b`)
- State text: `--apt-text-success`, `--apt-text-danger`, `--apt-text-warning`, `--apt-text-info`

**Borders**
- `--apt-border` (`#334155`); `--apt-border-faint` (`#475569`)

### Typography

| Role | Font stack | Use |
|------|-----------|-----|
| Sans / UI | `--apt-font-sans` (system-ui, Segoe UI, Roboto, sans-serif) | Interface and dense data |
| Serif / Display | `--apt-font-serif` (Georgia, Times New Roman, serif) | Record names, page titles |
| Mono / Data | `--apt-font-mono` (ui-monospace, SF Mono, Consolas, monospace) | Codes, numbers, IDs, readouts |

Sizes run `--apt-font-size-micro` → `--apt-font-size-display-xl` with weights `--apt-font-weight-medium` / `--apt-font-weight-semibold` and line heights tight / normal / relaxed.

### Spacing

`--apt-spacing-s1` → `--apt-spacing-s22` (0.25rem → 5.5rem) on a 4px-consistent scale, plus `--apt-radius-r0` → `--apt-radius-r3` (0 → 14px).

### Radius

`--apt-radius-r0` (0) → `--apt-radius-r3` (14px): hairline controls, buttons/inputs, component containers, cards/panels.

### Shadows

`--apt-shadow-sh1` (soft elevated) and `--apt-shadow-sh2` (raised); hairline border via `--apt-border`.

---

## 4. How to Apply This to APT-LABS

### Immediate next steps

1. **Use the tokens** — `--apt-*` custom properties are defined on `:root` in `src/styles.css` and are available to every component with no fallback or import step.

2. **Map to modules** — module accent is `--apt-module-accent` (defaults to `--apt-color-brand-primary` `#2563eb`), applied per module via `[data-module]`:

```css
[data-module="commons"]   { --apt-module-accent: var(--apt-group-continuity); } /* Knowledge — blue */
[data-module="network"]   { --apt-module-accent: var(--apt-group-value); }      /* Exchange — green */
[data-module="workbench"] { --apt-module-accent: var(--apt-group-core); }       /* Production — violet */
[data-module="records"]   { --apt-module-accent: var(--apt-text-muted); }       /* Stewardship — muted */
[data-module="intelligence"] { --apt-module-accent: var(--apt-color-danger-base); } /* Intelligence — dark red */
```

3. **Apply the visual language** — each module's accent appears in rail icons, active states, record badges, and status indicators using `--apt-surface-*` / `--apt-text-*` pairs.

4. **Visual references** — the 13 Palantir ontology images in `docs/design/palantir-ontology-images/` remain references for object views, property editors, and navigation.

---

## 5. Extraction Inventory

Design was extracted from eleven sources and fused; the fused token output now lives as `--apt-*` custom properties in `src/styles.css` (the extraction sources below are retained for provenance).

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
