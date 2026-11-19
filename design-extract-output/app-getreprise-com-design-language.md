# Design Language: Unknown Site

> Extracted from `https://app.getreprise.com/launch/BXZjxEX/?itm_category=home` on November 19, 2026
> 72 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| neutral | `#f3f5fa` | `#e8eaee` | **`#cbced5`** | `#bec0c6` | `#9da0a6` | `#7f8288` | `#696c72` | `#54575c` | `#45474b` | `#37393d` | `#1e1f21` |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#ffffff` | `#000000` | 21:1 | AAA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#ffffff` — 100%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#cbced5` | hsl(222, 11%, 82%) | 72 |
| `#0a0a0a` | hsl(0, 0%, 4%) | 41 |
| `#000000` | hsl(0, 0%, 0%) | 30 |
| `#ffffff` | hsl(0, 0%, 100%) | 5 |
| `#646875` | hsl(226, 8%, 43%) | 1 |

### Background Colors

Used on large-area elements: `#ffffff`

### Text Colors

Text color palette: `#000000`, `#0a0a0a`, `#646875`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#cbced5` | border | 72 |
| `#0a0a0a` | text | 41 |
| `#000000` | text | 30 |
| `#ffffff` | background | 5 |
| `#646875` | text | 1 |

## Typography

### Type System

- **Scale ratio** — irregular (2 distinct sizes, no modular ratio fits)
- **Fluid type** — none; sizes are fixed per breakpoint

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `body-sm` | 16px / 1rem | 400 | 24px | normal |
| `micro` | 14px / 0.875rem | 400 | 21px | normal |

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 16px | 1rem | 400 | 24px | normal | html, head, base, link |
| 14px | 0.875rem | 400 | 21px | normal | body, div, svg, path |

### Font Weights in Use

`400` (72x)

## Spacing

| Token | Value | Rem |
|-------|-------|-----|
| spacing-16 | 16px | 1rem |

## CSS Custom Properties

### Colors

```css
--border: hsl(0 0% 89.8%);
--tw-ring-shadow: 0 0 #0000;
--border-transparent: #ffffff00;
--card: hsl(0 0% 100%);
--primary-foreground: #ffffff;
--secondary-hover: #ebeef4;
--card-foreground: hsl(0 0% 3.9%);
--tw-border-spacing-x: 0;
--muted: hsl(0 0% 96.1%);
--icon-selected-color: #4c49f3;
--accent-foreground: hsl(0 0% 9%);
--tw-ring-color: rgb(66 153 225 / .5);
--rguide-btn-secondary-hover-border-color: #9ca0ad;
--popover: hsl(0 0% 100%);
--ring: #4c49f3;
--rguide-btn-primary-bg: #ffe000;
--tw-ring-offset-color: #fff;
--rguide-btn-primary-hover-bg: #d1b800;
--rguide-border-color: transparent;
--primary-accent: #4c49f3;
--primary-hover: #2421ee;
--popover-foreground: hsl(0 0% 3.9%);
--rguide-btn-primary-border-color: #ffe000;
--tw-ring-offset-width: 0px;
--border-bold: #27292e99;
--rguide-btn-secondary-border-color: #4a4d57;
--tw-shadow-colored: 0 0 #0000;
--context-menu-bg-color: #cbced5;
--destructive-border: #e53e3e;
--destructive-foreground: #ffffff;
--secondary-border: #9ca0ad70;
--rguide-btn-secondary-color: #cbced5;
--tw-ring-offset-shadow: 0 0 #0000;
--icon-base-color: #9ca0ad;
--text-secondary: #646875;
--accent: hsl(0 0% 96.1%);
--primary-accent-muted: #f0f0ff;
--destructive-hover: #c53030;
--rguide-container-color: #cbced5;
--tw-ring-inset: ;
--rguide-bg-color: #27292e;
--border-subtle: #9ca0ad4d;
--secondary-foreground: #27292e;
--context-menu-color: #27292e;
--border-translucent: #1f232829;
--rguide-color: #cbced5;
--q-primary: #7370FF;
--q-secondary: #F2F4F9;
--primary-border: #1f232829;
--q-accent: #9C27B0;
--muted-foreground: hsl(0 0% 45.1%);
--icon-darkened-color: #646875;
--disabled-foreground: #9ca0ad;
--text-primary: #27292e;
--destructive: #e53e3e;
--rguide-btn-secondary-bg: transparent;
--tw-border-spacing-y: 0;
--rguide-btn-border-width: 2px;
--primary: #4c49f3;
--rguide-btn-primary-color: #000000;
--foreground: hsl(0 0% 3.9%);
--context-menu-border-color: transparent;
--rpulse-color: #7370ff;
--secondary: #f2f4f9;
--border-base: #9ca0ad70;
```

### Spacing

```css
--q-size-md: 1024px;
--rguide-btn-margin: 0rem 0rem 0rem 0.5rem;
--q-size-xl: 1920px;
--tw-numeric-spacing: ;
--q-size-xs: 0;
--tw-contain-size: ;
--q-size-sm: 600px;
--rguide-btn-font-size: 11px;
--rguide-font-size: 16px;
--q-size-lg: 1440px;
--rguide-container-padding: 1.25rem;
--rguide-btn-padding: 0.25rem 0.75rem 0.25rem 0.75rem;
```

### Typography

```css
--fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 6 Duotone";
--fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";
--fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
--fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 6 Sharp Duotone";
--fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 6 Sharp Duotone";
--fa-font-light: normal 300 1em/1 "Font Awesome 6 Pro";
--fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 6 Sharp Duotone";
--fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";
--rguide-font-family-url: ;
--control-text-placeholder: #27292e99;
--fa-font-solid: normal 900 1em/1 "Font Awesome 6 Pro";
--rguide-btn-font-weight: 700;
--fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 6 Sharp Duotone";
--text-tertiary: #9ca0ad;
--fa-font-regular: normal 400 1em/1 "Font Awesome 6 Pro";
--rguide-btn-text-transform: uppercase;
--rguide-line-height: 1.5;
--rguide-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
--text-white: #ffffff;
--fa-font-duotone-light: normal 300 1em/1 "Font Awesome 6 Duotone";
--fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";
--fa-font-thin: normal 100 1em/1 "Font Awesome 6 Pro";
--fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 6 Duotone";
--rguide-h-line-height: 1.2;
--text-subtle: #16161a66;
--fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 6 Sharp";
--fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";
--rguide-btn-line-height: 1.5;
```

### Shadows

```css
--rguide-container-shadow: 0 1px 2px rgb(8 5 62 / 45%),
    0 5px 10px rgba(0, 0, 0, 0.5);
--tw-drop-shadow: ;
--tw-shadow: 0 0 #0000;
```

### Radii

```css
--rguide-container-radius: 12px;
--radius: .5rem;
--rguide-btn-radius: 0.25rem;
```

### Other

```css
--fa-style-family-classic: "Font Awesome 6 Pro";
--tw-backdrop-sepia: ;
--tw-sepia: ;
--tw-ordinal: ;
--tw-contain-style: ;
--tw-backdrop-invert: ;
--rguide-width: 50px;
--tw-backdrop-grayscale: ;
--tw-hue-rotate: ;
--tw-pan-y: ;
--surface-default: #ffffff;
--gray-600: #3c3f47;
--gray-700: #33363d;
--tw-rotate: 0;
--fa-style-family-sharp: "Font Awesome 6 Sharp";
--input-hover: #27292e99;
--fa-style-family-duotone: "Font Awesome 6 Duotone";
--q-dark-page: #121212;
--q-dark: #1d1d1d;
--gray-100: #f2f4f9;
--tw-gradient-via-position: ;
--tw-saturate: ;
--tw-scroll-snap-strictness: proximity;
--red-100: #fff5f5;
--red-400: #fc8181;
--tw-backdrop-hue-rotate: ;
--gray-50: #f9f9fa;
--tw-gradient-to-position: ;
--tw-grayscale: ;
--tw-numeric-fraction: ;
--q-transition-duration: .3s;
--surface-overlay: #ffffff;
--tw-skew-y: 0;
--tw-slashed-zero: ;
--tw-backdrop-opacity: ;
--tw-gradient-from-position: ;
--tw-pinch-zoom: ;
--tw-contain-paint: ;
--gray-900: #16161a;
--menuRow-hover: #f2f4f9;
--q-negative: #E53E3E;
--tw-backdrop-saturate: ;
--white: #ffffff;
--red-800: #5b1111;
--animate-delay: .3s;
--background: hsl(0 0% 100%);
--tw-brightness: ;
--fa-style-family-sharp-duotone: "Font Awesome 6 Sharp Duotone";
--q-warning: #F2C037;
--animate-duration: .3s;
--rguide-headline: #cbced5;
--tw-scale-y: 1;
--tw-backdrop-contrast: ;
--tw-backdrop-brightness: ;
--red-900: #360909;
--red-500: #f56565;
--tw-pan-x: ;
--tw-translate-y: 0;
--gray-300: #9ca0ad;
--gray-500: #4a4d57;
--tw-contrast: ;
--tw-skew-x: 0;
--red-300: #feb2b2;
--red-600: #e53e3e;
--tw-backdrop-blur: ;
--tw-translate-x: 0;
--input: #9ca0ad70;
--gray-400: #646875;
--surface-sunken: #f2f4f9;
--red-700: #881919;
--disabled: #e3e5e9;
--gray-200: #e3e5e9;
--gray-800: #27292e;
--tw-scale-x: 1;
--surface-raised: #f2f4f9;
--q-positive: #21BA45;
--q-info: #31CCEC;
--tw-blur: ;
--tw-invert: ;
--red-200: #fed7d7;
--fa-style-family-brands: "Font Awesome 6 Brands";
--tw-numeric-figure: ;
--animate-repeat: 1;
--tw-contain-layout: ;
```

### Semantic

```css
--q-positive: #21BA45;
--q-warning: #F2C037;
--red-100: #fff5f5;
--red-400: #fc8181;
--tw-shadow-colored: 0 0 #0000;
--destructive-border: #e53e3e;
--destructive-foreground: #ffffff;
--q-negative: #E53E3E;
--destructive-hover: #c53030;
--red-800: #5b1111;
--red-900: #360909;
--red-500: #f56565;
--red-300: #feb2b2;
--red-600: #e53e3e;
--red-700: #881919;
--destructive: #e53e3e;
--red-200: #fed7d7;
--q-info: #31CCEC;
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| sm | 600px | min-width |
| sm | 640px | min-width |
| md | 768px | min-width |
| lg | 1024px | min-width |
| xl | 1280px | min-width |
| 1400px | 1400px | min-width |
| 1440px | 1440px | min-width |
| 2xl | 1536px | min-width |
| 1920px | 1920px | min-width |

## Transitions & Animations

**Easing functions:** `ease`

**Durations:** `2s`

### Common Transitions

```css
transition: all;
transition: 2s ease-in-out;
```

### Keyframe Animations

**fa-beat**
```css
@keyframes fa-beat {
  0%, 90% { transform: scale(1); }
  45% { transform: scale(var(--fa-beat-scale,1.25)); }
}
```

**fa-bounce**
```css
@keyframes fa-bounce {
  0% { transform: scale(1) translateY(0px); }
  10% { transform: scale(var(--fa-bounce-start-scale-x,1.1),var(--fa-bounce-start-scale-y,.9)) translateY(0); }
  30% { transform: scale(var(--fa-bounce-jump-scale-x,.9),var(--fa-bounce-jump-scale-y,1.1)) translateY(var(--fa-bounce-height,-.5em)); }
  50% { transform: scale(var(--fa-bounce-land-scale-x,1.05),var(--fa-bounce-land-scale-y,.95)) translateY(0); }
  57% { transform: scale(1) translateY(var(--fa-bounce-rebound,-.125em)); }
  64% { transform: scale(1) translateY(0px); }
  100% { transform: scale(1) translateY(0px); }
}
```

**fa-fade**
```css
@keyframes fa-fade {
  50% { opacity: var(--fa-fade-opacity,.4); }
}
```

**fa-beat-fade**
```css
@keyframes fa-beat-fade {
  0%, 100% { opacity: var(--fa-beat-fade-opacity,.4); transform: scale(1); }
  50% { opacity: 1; transform: scale(var(--fa-beat-fade-scale,1.125)); }
}
```

**fa-flip**
```css
@keyframes fa-flip {
  50% { transform: rotate3d(var(--fa-flip-x,0),var(--fa-flip-y,1),var(--fa-flip-z,0),var(--fa-flip-angle,-180deg)); }
}
```

**fa-shake**
```css
@keyframes fa-shake {
  0% { transform: rotate(-15deg); }
  4% { transform: rotate(15deg); }
  8%, 24% { transform: rotate(-18deg); }
  12%, 28% { transform: rotate(18deg); }
  16% { transform: rotate(-22deg); }
  20% { transform: rotate(22deg); }
  32% { transform: rotate(-12deg); }
  36% { transform: rotate(12deg); }
  40%, 100% { transform: rotate(0deg); }
}
```

**fa-spin**
```css
@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(1turn); }
}
```

**MoveUpDown**
```css
@keyframes MoveUpDown {
  0%,
  100% { transform: translateY(-3px); }
  50% { transform: translateY(3px); }
}
```

**pulse-effect**
```css
@keyframes pulse-effect {
  0% { box-shadow: 0 0 0 0 transparent, 0 0 0 0 var(--rpulse-color, #7370ff);
    opacity: 1;
    border: 1px solid var(--rpulse-color, #7370ff); }
  80% { box-shadow: 0 0 0 4px white, 0 0 0 9px var(--rpulse-color, #7370ff);
    border: 2px solid var(--rpulse-color, #7370ff);
    opacity: 0; }
  100% { box-shadow: 0 0 0 4px white, 0 0 0 9px var(--rpulse-color, #7370ff);
    border: 0 solid var(--rpulse-color, #7370ff);
    opacity: 0; }
}
```

## Layout System

**0 grid containers** and **2 flex containers** detected.

### The System

- **Fluid layout** — 11 clamp/viewport declarations

```css
/* … */ { max-width: 100vw; }
/* … */ { max-width: 95vw; }
/* … */ { width: 90vw!important; }
/* … */ { max-width: 90vw!important; }
/* … */ { width: 100vw; }
/* … */ { max-width: 95vw; }
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/wrap | 1x |
| column/wrap | 1x |

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 0 passing, 0 failing color pairs

## Design System Score

**Overall: 85/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 85/100 |
| Typography Consistency | 100/100 |
| Spacing System | 70/100 |
| Shadow Consistency | 85/100 |
| Border Radius Consistency | 100/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Consistent typography system, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- No clear primary brand color detected
- 840 !important rules — prefer specificity over overrides
- 98% of CSS is unused — consider purging
- 5722 duplicate CSS declarations

## Z-Index Map

**4 unique z-index values** across 2 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 99999,99999 | div.z.-.l.o.a.d.i.n.g. .f.l.e.x. .j.u.s.t.i.f.y.-.c.e.n.t.e.r. .i.t.e.m.s.-.c.e.n.t.e.r. .b.g.-.w.h.i.t.e. .d.a.r.k.:.b.g.-.g.r.a.y.-.9.0.0. .f.i.x.e.d. .i.n.s.e.t.-.0 |
| base | -200,-1 | div.b.g.-.w.h.i.t.e. .f.i.x.e.d. .i.n.s.e.t.-.0, div.b.g.-.w.h.i.t.e. .f.i.x.e.d. .i.n.s.e.t.-.0, div.a.b.s.o.l.u.t.e. .t.o.p.-.0. .w.-.f.u.l.l. .h.-.f.u.l.l. .l.e.f.t.-.1./.2. .t.r.a.n.s.f.o.r.m. .-.t.r.a.n.s.l.a.t.e.-.x.-.1./.2 |

**Issues:**
- Very high z-index values: 99999

## SVG Icons

**1 unique SVG icons** detected. Dominant style: **outlined**.

| Size Class | Count |
|------------|-------|
| xl | 1 |

**Icon colors:** `#16161a`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| FontAwesome | self-hosted | 400, normal | normal |
| Font Awesome 5 Brands | self-hosted | 400 | normal |
| Font Awesome 5 Pro | self-hosted | 300, 400, 900 | normal |
| Font Awesome 5 Duotone | self-hosted | 900 | normal |
| Font Awesome 6 Brands | self-hosted | 400 | normal |
| Font Awesome 6 Duotone | self-hosted | 100, 300, 400, 900 | normal |
| Font Awesome 6 Pro | self-hosted | 100, 300, 400, 900 | normal |
| Font Awesome 6 Sharp | self-hosted | 100, 300, 400, 900 | normal |
| Font Awesome 6 Sharp Duotone | self-hosted | 100, 300, 400, 900 | normal |
| Roboto | self-hosted | 100, 300, 400, 500, 700, 900 | normal |

## Motion Language

**Feel:** smooth · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xxl` | `2s` | 2000 |

### Easing Families

- **ease-in-out** (1 uses) — `ease`

## Page Intent

**Type:** `unknown` (confidence 0)

## Material Language

**Label:** `flat` (confidence 0.55)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.038 |
| Shadow profile | none |
| Avg shadow blur | 0px |
| Max radius | 0px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Component Library

**Detected:** `tailwindcss` (confidence 0.646)

Evidence:
- tailwind-like class density 64%

## Quick Start

To recreate this design in a new project:

2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
