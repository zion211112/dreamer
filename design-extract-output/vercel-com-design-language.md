# Design Language: Geist

> Extracted from `https://vercel.com/geist` on November 19, 2026
> 665 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#0072f5` | rgb(0, 114, 245) | hsl(212, 100%, 48%) | 4 |
| Secondary | `#ff0000` | rgb(255, 0, 0) | hsl(0, 100%, 50%) | 2 |
| Accent | `#ff990a` | rgb(255, 153, 10) | hsl(35, 100%, 52%) | 1 |

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| primary | `#bff8ff` | `#aeecff` | `#95daff` | `#71c0ff` | `#429cff` | **`#0072f5`** | `#0064df` | `#004ebc` | `#003ea0` | `#003087` | `#001854` |
| secondary | `#ffccb8` | `#ffbba6` | `#ffa28d` | `#ff7c67` | `#ff4535` | **`#ff0000`** | `#d60000` | `#b40000` | `#980000` | `#7f0000` | `#4e0000` |
| accent | `#ffe7ac` | `#ffda98` | `#ffc77b` | **`#ff990a`** | `#e58500` | `#c66500` | `#aa4f00` | `#8d3c00` | `#772e00` | `#622300` | `#3b0f00` |
| neutral | `#f5f5f5` | `#eaeaea` | `#d9d9d9` | `#c0c0c0` | `#9f9f9f` | `#828282` | `#6c6c6c` | `#575757` | **`#4d4d4d`** | `#393939` | `#1f1f1f` |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#ffffff` | `#000000` | 21:1 | AAA |
| `surface.raised` | `#fafafa` | `#000000` | 20.12:1 | AAA |
| `action.primary` | `#0072f5` | `#000000` | 4.73:1 | AA |
| `action.secondary` | `#ff0000` | `#000000` | 5.25:1 | AA |
| `action.accent` | `#ff990a` | `#000000` | 9.81:1 | AAA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#ffffff` — 100%
- `#000000` — 0%
- `#171717` — 0%
- `#ebebeb` — 0%
- `#7d7d7d` — 0%
- `#0062d1` — 0%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#ebebeb` | hsl(0, 0%, 92%) | 627 |
| `#171717` | hsl(0, 0%, 9%) | 474 |
| `#4d4d4d` | hsl(0, 0%, 30%) | 159 |
| `#8f8f8f` | hsl(0, 0%, 56%) | 40 |
| `#ffffff` | hsl(0, 0%, 100%) | 30 |
| `#000000` | hsl(0, 0%, 0%) | 12 |
| `#7d7d7d` | hsl(0, 0%, 49%) | 1 |

### Background Colors

Used on large-area elements: `#ffffff`, `#fafafa`

### Text Colors

Text color palette: `#4d4d4d`, `#171717`, `#8f8f8f`, `#ffffff`, `#ff0000`, `#000000`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#ebebeb` | border, background | 627 |
| `#171717` | text, border, background | 474 |
| `#4d4d4d` | text | 159 |
| `#8f8f8f` | text | 40 |
| `#ffffff` | background, text | 30 |
| `#000000` | border, text, background | 12 |
| `#0072f5` | border | 4 |
| `#ff0000` | text, border | 2 |
| `#7d7d7d` | background | 1 |
| `#0062d1` | background | 1 |
| `#8e4ec6` | background | 1 |
| `#df2670` | background | 1 |
| `#da2f35` | background | 1 |
| `#ff990a` | background | 1 |
| `#398e4a` | background | 1 |
| `#0d8c7d` | background | 1 |

## Typography

### Font Families

- **GeistSans** — used for all (119 elements)
- **GeistSerif** — used for body (1 elements)
- **GeistPixelSquare** — used for body (1 elements)
- **Geist Mono** — used for mono (3 elements)

### Type System

- **Scale ratio** — 1.2 (minor third), anchored at 14px · 86% of sizes sit on the ladder
- **Measure** — ~48 characters per line (comfortable, medium confidence from 4 samples)
- **Fluid type** — 4 clamp/viewport font sizes, 1px → 58px

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `h1` | 40px / 2.5rem | 600 | 48px | -2.4px |
| `title-1` | 24px / 1.5rem | 600 | 32px | -0.96px |
| `title-2` | 20px / 1.25rem | 400 | 30px | normal |
| `title-3` | 16px / 1rem | 400 | 24px | normal |
| `body` | 14px / 0.875rem | 400 | 20px | normal |
| `body-sm` | 13px / 0.8125rem | 400 | 20px | normal |
| `micro` | 12px / 0.75rem | 400 | 20.4px | normal |

### Fluid Declarations

```css
.max-\[600px\]\:text-\[4\.5vw\] { font-size: 4.5vw; }
.max-\[960px\]\:text-\[3vw\] { font-size: 3vw; }
.max-\[1500px\]\:text-\[2\.5vw\] { font-size: 2.5vw; }
.text-\[length\:clamp\(1px\,1\.75vw\,30px\)\] { font-size: clamp(1px, 1.75vw, 30px); }
```

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 40px | 2.5rem | 600 | 48px | -2.4px | h1 |
| 24px | 1.5rem | 600 | 32px | -0.96px | p |
| 20px | 1.25rem | 400 | 30px | normal | p |
| 16px | 1rem | 400 | 24px | normal | html, head, style, meta |
| 14px | 0.875rem | 400 | 20px | normal | button, span, svg, path |
| 13px | 0.8125rem | 400 | 20px | normal | pre, span |
| 12px | 0.75rem | 400 | 20.4px | normal | kbd, span, div, svg |

### Heading Scale

```css
h1 { font-size: 40px; font-weight: 600; line-height: 48px; }
```

### Body Text

```css
body { font-size: 14px; font-weight: 400; line-height: 20px; }
```

### Font Weights in Use

`400` (624x), `500` (31x), `600` (10x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-2 | 2px | 0.125rem |
| spacing-4 | 4px | 0.25rem |
| spacing-6 | 6px | 0.375rem |
| spacing-8 | 8px | 0.5rem |
| spacing-10 | 10px | 0.625rem |
| spacing-12 | 12px | 0.75rem |
| spacing-16 | 16px | 1rem |
| spacing-24 | 24px | 1.5rem |
| spacing-32 | 32px | 2rem |
| spacing-48 | 48px | 3rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| sm | 4px | 4 |
| full | 30px | 2 |
| full | 50px | 10 |

## Elevation

2 levels from 8 raw shadows · neutral tint

**xs** — blur 2px, y 2px, used 2× · 7 layers
```css
box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px 0px, rgb(250, 250, 250) 0px 0px 0px 1px;
```

**sm** — blur 8px, y 4px, used 1× · 9 layers
```css
box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.02) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 8px 0px, rgb(250, 250, 250) 0px 0px 0px 1px, rgb(255, 255, 255) 0px 0px 0px 1px;
```

## Inset Shadows

```css
box-shadow: rgb(250, 250, 250) 0px 0px 8px 8px inset;
```

## CSS Custom Properties

### Colors

```css
--ds-shadow-border-large: 0 0 0 1px #00000014, 0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a, 0 0 0 1px hsla(0, 0%, 98%, 1);
--ds-focus-ring-outline: 2px solid hsla(212, 100%, 48%, 1);
--geist-console-text-color-default: #000;
--tw-inset-ring-shadow: 0 0 #0000;
--accents-6: #444;
--geist-secondary-lighter: #eaeaea;
--ds-popover-row-radius: 6px;
--header-border-bottom: 0 1px 0 0 #0000001a;
--ds-shadow-border: 0 0 0 1px #00000014, 0 0 0 1px hsla(0, 0%, 98%, 1);
--geist-secondary-dark: #333;
--geist-violet-background-secondary: #291c3a;
--ds-focus-ring: 0 0 0 2px hsla(0, 0%, 100%, 1), 0 0 0 4px hsla(212, 100%, 48%, 1);
--ds-overlay-backdrop-color: hsla(0, 0%, 95%, 1);
--ds-shadow-border-base: 0 0 0 1px #00000014;
--ds-popover-row-padding: 0 8px;
--accents-3: #999;
--geist-selection-text-color: hsla(0, 0%, 95%, 1);
--accents-8: #111;
--accents-2: #eaeaea;
--ds-shadow-border-inset: inset 0 0 0 1px #00000014;
--ds-shadow-border-small: 0 0 0 1px #00000014, 0px 2px 2px #0000000a, 0 0 0 1px hsla(0, 0%, 98%, 1);
--tw-border-style: solid;
--animate-fadeOutPopover: fadeOut cubic-bezier(.175, .885, .32, 1.1) .2s;
--ds-focus-color: hsla(212, 100%, 48%, 1);
--tw-ring-shadow: 0 0 #0000;
--accents-7: #333;
--ds-shadow-background-border: 0 0 0 1px hsla(0, 0%, 98%, 1);
--geist-foreground-rgb: 0, 0, 0;
--geist-console-text-color-blue: #0070f3;
--geist-console-text-color-purple: #7928ca;
--tw-ring-offset-color: #fff;
--geist-console-text-color-pink: #eb367f;
--accents-1: #fafafa;
--tw-ring-offset-width: 0px;
--accents-4: #888;
--color-indigo-600: lab(38.4009% 52.6132 -92.3857);
--ds-popover-row-height: 36px;
--geist-secondary: #666;
--tw-ring-offset-shadow: 0 0 #0000;
--ds-popover-padding: 6px;
--geist-secondary-light: #999;
--ds-motion-popover-timing: cubic-bezier(.175, .885, .32, 1.1);
--ds-focus-border: 0 0 0 1px #00000057, 0px 0px 0px 4px #00000029;
--accents-5: #666;
--geist-foreground: #000;
--ds-motion-popover-duration: .2s;
--color-gray-200: hsla(0, 0%, 92%, 1);
--next-icon-border: #000;
--geist-link-color: hsla(212, 100%, 48%, 1);
--ds-shadow-border-medium: 0 0 0 1px #00000014, 0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a, 0 0 0 1px hsla(0, 0%, 98%, 1);
```

### Spacing

```css
--geist-space-64x: 256px;
--geist-space-gap: 24px;
--geist-space-small-negative: -32px;
--geist-space-gap-negative: -24px;
--geist-space-4x: 16px;
--geist-space-medium: 36px;
--geist-space-gap-quarter: 8px;
--geist-space-24x-negative: -96px;
--tw-space-x-reverse: 0;
--geist-space-48x: 192px;
--geist-space-16x: 64px;
--geist-gap-section: 32px;
--spacing: .25rem;
--geist-space-large-negative: -40px;
--geist-space-gap-half-negative: -12px;
--geist-gap-half: 12px;
--geist-space-24x: 96px;
--geist-space-2x-negative: -8px;
--geist-space-gap-half: 12px;
--geist-space-gap-quarter-negative: -8px;
--geist-space-large: 40px;
--geist-gap-half-negative: -12px;
--geist-space-32x-negative: -128px;
--tw-space-y-reverse: 0;
--geist-space-8x-negative: -32px;
--geist-gap-quarter: 8px;
--ds-size-medium: 36px;
--geist-space-3x: 12px;
--geist-space: 4px;
--geist-gap-negative: -24px;
--geist-space-32x: 128px;
--geist-gap-quarter-negative: -8px;
--geist-gap-double-negative: -40px;
--geist-space-small: 32px;
--geist-gap: 24px;
--geist-page-margin: 24px;
--geist-space-6x: 24px;
--geist-space-8x: 32px;
--geist-space-48x-negative: -192px;
--geist-space-4x-negative: -16px;
--ds-size-large: 40px;
--geist-space-negative: -4px;
--geist-space-64x-negative: -256px;
--ds-page-width-with-margin: calc(1400px + calc(2 * 24px));
--geist-space-10x: 40px;
--ds-size-small: 32px;
--geist-page-width-with-margin: calc(1200px + calc(2 * 24px));
--geist-gap-double: 40px;
--geist-space-16x-negative: -64px;
--geist-space-medium-negative: -36px;
--geist-space-2x: 8px;
--ds-control-decoration-size: 14px;
```

### Typography

```css
--font-sans: var(--font-geist-sans), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
--font-mono: "Geist Mono", Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
--ship-text: #ff5b4f;
--preview-text: #de1d8d;
--text-base--line-height: calc(1.5 / 1);
--geist-text-gradient: linear-gradient(180deg, #000c 0%, #000 100%);
--font-weight-bold: 700;
--text-xs--line-height: calc(1 / .75);
--text-xl: 1.25rem;
--geist-form-line-height: 1.25rem;
--text-xl--line-height: calc(1.75 / 1.25);
--text-sm: .875rem;
--font-mono-fallback: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
--geist-form-font: .875rem;
--geist-form-small-font: .875rem;
--font-geist-sans: "GeistSans", "GeistSans Fallback";
--geist-form-large-line-height: 1.5rem;
--geist-form-large-font: 1rem;
--text-lg: 1.125rem;
--leading-normal: 1.5;
--geist-form-small-line-height: .875rem;
--text-lg--line-height: calc(1.75 / 1.125);
--default-font-family: "GeistSans", "GeistSans Fallback";
--develop-text: #0a72ef;
--font-weight-semibold: 600;
--tracking-normal: 0em;
--text-sm--line-height: calc(1.25 / .875);
--text-xs: .75rem;
--font-weight-normal: 400;
--font-sans-fallback: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
--font-weight-medium: 500;
--text-base: 1rem;
--default-mono-font-family: "Geist Mono", Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
```

### Shadows

```css
--tw-inset-shadow-alpha: 100%;
--ds-shadow-2xl: 0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f;
--tw-inset-shadow: 0 0 #0000;
--dropdown-box-shadow: 0 4px 4px 0 #00000005;
--tw-shadow-alpha: 100%;
--ds-shadow-large: 0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a;
--shadow-smallest: 0px 2px 4px #0000001a;
--shadow-sticky: 0 12px 10px -10px #0000001f;
--tw-drop-shadow-alpha: 100%;
--ds-shadow-tooltip: 0 0 0 1px #00000014, 0px 1px 1px #00000005, 0px 4px 8px #0000000a, 0 0 0 1px hsla(0, 0%, 98%, 1);
--ds-shadow-xs: 0px 1px 2px #0000000a;
--shadow-large: 0 30px 60px #0000001f;
--ds-shadow-2xs: 0px 1px 1px #0000000a;
--shadow-small: 0 5px 10px #0000001f;
--ds-shadow-fullscreen: 0 0 0 1px #00000014, 0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f, 0 0 0 1px hsla(0, 0%, 98%, 1);
--ds-shadow-small: 0px 2px 2px #0000000a;
--shadow-medium: 0 8px 30px #0000001f;
--shadow-extra-small: 0px 4px 8px #0000001f;
--ds-shadow-menu: 0 0 0 1px #00000014, 0px 1px 1px #00000005, 0px 4px 8px -4px #0000000a, 0px 16px 24px -8px #0000000f, 0 0 0 1px hsla(0, 0%, 98%, 1);
--ds-shadow-modal-elevated: 0px 0px 0px 1px #00000014, 0px 32px 72px -12px #0000000f, 0px 8px 32px -12px #00000014, 0px 8px 24px -12px #0000001f;
--ds-shadow-xl: 0px 1px 1px #00000005, 0px 4px 8px -4px #0000000a, 0px 16px 24px -8px #0000000f;
--ds-shadow-modal: 0 0 0 1px #00000014, 0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f, 0 0 0 1px hsla(0, 0%, 98%, 1);
--ds-shadow-medium: 0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a;
--tw-shadow: 0 0 #0000;
--shadow-hover: 0 30px 60px #0000001f;
```

### Radii

```css
--geist-radius: 6px;
--geist-marketing-radius: 8px;
--radius-3xl: 1.5rem;
```

### Other

```css
--container-md: 28rem;
--header-height: 64px;
--ds-pink-600-value: 341, 75%, 73%;
--ds-teal-100: hsla(169, 70%, 96%, 1);
--develop-line-end: #019ae9;
--ds-green-1000-value: 128, 29%, 15%;
--ds-blue-600: hsla(208, 100%, 66%, 1);
--animate-loading: loading 8s ease-in-out infinite;
--tw-animation-delay: 0s;
--geist-cyan-lighter: #aaffec;
--ds-amber-700: hsla(39, 100%, 57%, 1);
--ds-pink-300-value: 340, 82%, 94%;
--ds-green-800-value: 132, 43%, 39%;
--ds-amber-500-value: 38, 100%, 71%;
--geist-success-light: #3291ff;
--tw-outline-style: solid;
--ease-in: cubic-bezier(.4, 0, 1, 1);
--geist-error: #e00;
--geist-warning-light: #f7b955;
--geist-cyan-dark: #29bc9b;
--ds-amber-900: hsla(30, 100%, 32%, 1);
--ds-green-200: hsla(120, 60%, 95%, 1);
--geist-success-dark: #0761d1;
--tw-enter-scale: 1;
--geist-form-small-height: 32px;
--ds-red-800-value: 358, 70%, 52%;
--header-import-flow-background: #fafafacc;
--ds-black: lab(0% 0 0);
--ds-pink-200-value: 340, 90%, 96%;
--ds-blue-200: hsla(210, 100%, 96%, 1);
--geist-violet-lighter: #d8ccf1;
--ds-green-1000: hsla(128, 29%, 15%, 1);
--tw-gradient-from: rgba(0, 0, 0, 0);
--ds-red-1000: hsla(355, 49%, 15%, 1);
--tw-gradient-to: rgba(0, 0, 0, 0);
--ds-amber-800-value: 35, 100%, 52%;
--wv-orange: #ffa400;
--ds-gray-alpha-600: #00000057;
--animate-cmdkScaleIn: cmdkScaleIn .3s cubic-bezier(.175, .885, .32, 1.1);
--ds-pink-300: hsla(340, 82%, 94%, 1);
--develop-start-gradient: #007cf0;
--geist-violet-background-tertiary: #eae5f4;
--ds-pink-600: hsla(341, 75%, 73%, 1);
--ds-gray-800: hsla(0, 0%, 49%, 1);
--ds-gray-alpha-100: #0000000d;
--geist-violet-light: #8a63d2;
--ds-teal-1000: hsla(171, 80%, 13%, 1);
--ds-gray-300: hsla(0, 0%, 90%, 1);
--ds-teal-700-value: 173, 80%, 36%;
--ds-purple-600: hsla(273, 72%, 73%, 1);
--tw-exit-translate-y: 0;
--tw-gradient-via-position: 50%;
--ds-blue-1000: hsla(211, 100%, 15%, 1);
--ds-amber-1000: hsla(20, 79%, 17%, 1);
--ds-amber-200: hsla(44, 100%, 92%, 1);
--tw-gradient-to-position: 100%;
--ds-teal-300-value: 168, 70%, 90%;
--default-transition-duration: .15s;
--ds-amber-600: hsla(36, 90%, 62%, 1);
--ds-white: lab(100% 0 0);
--ds-pink-700-value: 336, 80%, 58%;
--container-xs: 20rem;
--ds-background-200: hsla(0, 0%, 98%, 1);
--ds-gray-1000: hsla(0, 0%, 9%, 1);
--ds-purple-200-value: 277, 87%, 97%;
--ds-red-500-value: 0, 82%, 85%;
--ds-teal-400-value: 170, 70%, 85%;
--ds-green-600-value: 125, 60%, 64%;
--dropdown-triangle-stroke: #fff;
--ds-blue-400: hsla(209, 100%, 90%, 1);
--banner-height: 0px;
--ds-red-200-value: 0, 100%, 96%;
--ds-teal-700: hsla(173, 80%, 36%, 1);
--ds-green-800: hsla(132, 43%, 39%, 1);
--ds-red-200: hsla(0, 100%, 96%, 1);
--geist-highlight-magenta: #eb367f;
--ds-purple-1000: hsla(276, 100%, 15%, 1);
--vh100-offset: calc(64px + 0px);
--ds-green-100-value: 120, 60%, 96%;
--ds-gray-500: hsla(0, 0%, 79%, 1);
--default-transition-timing-function: cubic-bezier(.4, 0, .2, 1);
--tw-animation-iteration-count: 1;
--scroller-start: #fff;
--tw-exit-opacity: 1;
--ds-teal-500-value: 170, 70%, 72%;
--ds-purple-800: hsla(272, 47%, 45%, 1);
--ds-blue-900-value: 211, 100%, 42%;
--ds-motion-overlay-timing: cubic-bezier(.175, .885, .32, 1.1);
--ds-pink-800-value: 336, 74%, 51%;
--ds-z-drawer: 200;
--tw-translate-z: 0;
--ds-purple-300: hsla(274, 78%, 95%, 1);
--tw-gradient-via: rgba(0, 0, 0, 0);
--ds-pink-400: hsla(341, 76%, 91%, 1);
--tw-scale-y: 1;
--animate-cmdkFadeIn: cmdkFadeIn .3s cubic-bezier(.175, .885, .32, 1.1);
--scroller-end: #fff0;
--ds-red-700-value: 358, 75%, 59%;
--ds-z-menu: 2001;
--ds-amber-500: hsla(38, 100%, 71%, 1);
--geist-background-rgb: 255, 255, 255;
--geist-violet-dark: #4c2889;
--breakpoint-lg: 961px;
--tw-exit-translate-x: 0;
--container-3xl: 48rem;
--tw-translate-y: 0;
--ds-pink-500-value: 340, 75%, 84%;
--ease-out: cubic-bezier(0, 0, .2, 1);
--ds-z-tooltip: 99999;
--ds-blue-1000-value: 211, 100%, 15%;
--ds-blue-200-value: 210, 100%, 96%;
--header-zindex: 75;
--ds-gray-100: hsla(0, 0%, 95%, 1);
--ship-start-gradient: #ff4d4d;
--ds-page-width: 1400px;
--tw-content: "";
--ds-teal-100-value: 169, 70%, 96%;
--ds-gray-500-value: 0, 0%, 79%;
--ds-purple-500-value: 274, 70%, 82%;
--ds-blue-100: hsla(212, 100%, 97%, 1);
--ds-teal-300: hsla(168, 70%, 90%, 1);
--tw-translate-x: 0;
--ds-gray-700: hsla(0, 0%, 56%, 1);
--ds-teal-800-value: 173, 83%, 30%;
--ds-teal-200-value: 167, 70%, 94%;
--ds-amber-700-value: 39, 100%, 57%;
--tw-enter-rotate: 0;
--ds-gray-100-value: 0, 0%, 95%;
--ds-purple-400-value: 276, 71%, 92%;
--ds-gray-alpha-1000: #000000e8;
--ds-contrast-fg: #fff;
--geist-error-lighter: #f7d4d6;
--tw-enter-blur: 0;
--animate-cmdkScaleOut: cmdkScaleOut .3s cubic-bezier(.175, .885, .32, 1.1);
--ds-amber-1000-value: 20, 79%, 17%;
--ds-red-300: hsla(0, 100%, 95%, 1);
--ds-purple-900: hsla(274, 71%, 43%, 1);
--ds-red-700: hsla(358, 75%, 59%, 1);
--ds-background-100: hsla(0, 0%, 100%, 1);
--geist-highlight-purple: #f81ce5;
--ds-gray-alpha-300: #0000001a;
--ds-red-400-value: 0, 90%, 92%;
--animate-fadeInTooltip: fadeInTooltip .1s ease-in .4s forwards;
--ds-red-400: hsla(0, 90%, 92%, 1);
--geist-marketing-gray: #fafbfc;
--ds-teal-500: hsla(170, 70%, 72%, 1);
--geist-code: #000;
--ds-red-600: hsla(359, 90%, 71%, 1);
--ds-blue-300-value: 210, 100%, 94%;
--ds-teal-900-value: 174, 91%, 25%;
--ds-motion-timing-swift: cubic-bezier(.175, .885, .32, 1.1);
--ds-gray-1000-value: 0, 0%, 9%;
--ds-teal-1000-value: 171, 80%, 13%;
--ds-pink-400-value: 341, 76%, 91%;
--ds-blue-800-value: 212, 100%, 41%;
--ds-z-toast: 5000;
--ds-pink-1000-value: 333, 74%, 15%;
--geist-warning-lighter: #ffefcf;
--ds-purple-400: hsla(276, 71%, 92%, 1);
--ds-blue-800: hsla(212, 100%, 41%, 1);
--ds-amber-900-value: 30, 100%, 32%;
--geist-form-large-height: 40px;
--tw-animation-direction: normal;
--ds-blue-400-value: 209, 100%, 90%;
--ds-pink-900-value: 336, 65%, 45%;
--geist-warning: #f5a623;
--geist-error-dark: #c50000;
--animate-feedbackFadeIn: feedbackFadeIn .1s cubic-bezier(.16, 1, .3, 1);
--geist-page-width: 1200px;
--ds-purple-800-value: 272, 47%, 45%;
--wv-red: #ff4e42;
--ds-gray-alpha-900: #000000b3;
--ds-motion-overlay-duration: .3s;
--ds-gray-200-value: 0, 0%, 92%;
--ds-gray-900: hsla(0, 0%, 30%, 1);
--ds-purple-100: hsla(276, 100%, 97%, 1);
--geist-violet: #7928ca;
--ship-line-end: #f9cb28;
--geist-console-header: #efe7ed;
--ds-red-500: hsla(0, 82%, 85%, 1);
--tw-divide-x-reverse: 0;
--geist-success-lighter: #d3e5ff;
--ds-red-100-value: 0, 100%, 97%;
--ds-blue-600-value: 208, 100%, 66%;
--ds-purple-100-value: 276, 100%, 97%;
--geist-error-light: #ff1a1a;
--preview-end-gradient: #ff0080;
--tw-exit-rotate: 0;
--tw-scale-z: 1;
--develop-end-gradient: #00dfd8;
--ds-purple-600-value: 273, 72%, 73%;
--ds-red-800: hsla(358, 70%, 52%, 1);
--ds-purple-300-value: 274, 78%, 95%;
--ds-blue-700: hsla(212, 100%, 48%, 1);
--ds-amber-600-value: 36, 90%, 62%;
--container-sm: 24rem;
--ds-purple-700-value: 272, 51%, 54%;
--animate-feedbackAppear: feedbackAppear .5s .1s ease forwards;
--ds-gray-alpha-800: #00000082;
--ds-amber-300: hsla(43, 96%, 90%, 1);
--ds-green-100: hsla(120, 60%, 96%, 1);
--animate-loading-skeleton: loading-skeleton 1.5s ease-in-out infinite reverse;
--ds-gray-900-value: 0, 0%, 30%;
--header-sub-menu-height: 46px;
--ds-background-200-value: 0, 0%, 98%;
--ds-green-500: hsla(124, 60%, 75%, 1);
--container-lg: 32rem;
--geist-highlight-yellow: #fff500;
--ds-gray-200: hsla(0, 0%, 92%, 1);
--ds-green-400-value: 122, 60%, 86%;
--ds-pink-100: hsla(330, 100%, 96%, 1);
--ds-blue-700-value: 212, 100%, 48%;
--ds-overlay-backdrop-opacity: .8;
--ds-blue-500-value: 209, 100%, 80%;
--ds-green-700: hsla(131, 41%, 46%, 1);
--ds-z-modal: 300;
--ds-teal-600: hsla(170, 70%, 57%, 1);
--ds-amber-100-value: 39, 100%, 95%;
--geist-success: #0070f3;
--ds-pink-200: hsla(340, 90%, 96%, 1);
--tw-gradient-from-position: 0%;
--ds-green-500-value: 124, 60%, 75%;
--ds-gray-alpha-200: #00000014;
--ds-pink-700: hsla(336, 80%, 58%, 1);
--ds-blue-300: hsla(210, 100%, 94%, 1);
--ds-gray-400: hsla(0, 0%, 92%, 1);
--ease-in-out: cubic-bezier(.4, 0, .2, 1);
--animate-cmdkFadeOut: cmdkFadeOut .3s cubic-bezier(.175, .885, .32, 1.1);
--ds-gray-700-value: 0, 0%, 56%;
--wv-green: #0cce6b;
--ds-gray-alpha-700: #00000070;
--ds-gray-600-value: 0, 0%, 66%;
--ds-pink-1000: hsla(333, 74%, 15%, 1);
--ds-red-300-value: 0, 100%, 95%;
--ds-gray-alpha-400: #00000014;
--ds-gray-300-value: 0, 0%, 90%;
--geist-console-purple: #7928ca;
--preview-start-gradient: #7928ca;
--ds-purple-900-value: 274, 71%, 43%;
--ds-gray-400-value: 0, 0%, 92%;
--ds-teal-900: hsla(174, 91%, 25%, 1);
--tw-animation-fill-mode: none;
--tw-exit-blur: 0;
--animate-feedbackFadeOut: feedbackFadeOut .2s cubic-bezier(.16, 1, .3, 1) forwards;
--ds-amber-100: hsla(39, 100%, 95%, 1);
--ds-red-900-value: 358, 66%, 48%;
--ds-pink-500: hsla(340, 75%, 84%, 1);
--ds-red-900: hsla(358, 66%, 48%, 1);
--ds-pink-100-value: 330, 100%, 96%;
--geist-background: #fff;
--footer-height: 79px;
--geist-cyan-light: #79ffe1;
--geist-highlight-pink: #ff0080;
--ds-red-600-value: 359, 90%, 71%;
--ds-background-100-value: 0, 0%, 100%;
--ds-red-1000-value: 355, 49%, 15%;
--ds-green-600: hsla(125, 60%, 64%, 1);
--geist-selection: hsla(0, 0%, 9%, 1);
--geist-cyan: #50e3c2;
--ds-green-900: hsla(133, 50%, 32%, 1);
--ds-pink-900: hsla(336, 65%, 45%, 1);
--ds-teal-400: hsla(170, 70%, 85%, 1);
--ds-purple-700: hsla(272, 51%, 54%, 1);
--tw-enter-translate-x: 0;
--geist-warning-dark: #ab570a;
--container-4xl: 56rem;
--ds-purple-1000-value: 276, 100%, 15%;
--ds-amber-800: hsla(35, 100%, 52%, 1);
--ds-gray-800-value: 0, 0%, 49%;
--ds-blue-100-value: 212, 100%, 97%;
--tw-divide-y-reverse: 0;
--ds-green-700-value: 131, 41%, 46%;
--preview-line-end: #9a1fb8;
--ds-amber-400-value: 42, 100%, 78%;
--ds-teal-200: hsla(167, 70%, 94%, 1);
--ds-gray-alpha-500: #00000036;
--ds-green-300: hsla(120, 60%, 91%, 1);
--animate-fadeInTooltipFaster: fadeInTooltip .1s ease-in .1s forwards;
--tw-exit-scale: 1;
--ds-green-300-value: 120, 60%, 91%;
--ds-blue-900: hsla(211, 100%, 42%, 1);
--ds-purple-200: hsla(277, 87%, 97%, 1);
--ds-gray-600: hsla(0, 0%, 66%, 1);
--tw-enter-translate-y: 0;
--tw-scale-x: 1;
--ds-amber-200-value: 44, 100%, 92%;
--ds-purple-500: hsla(274, 70%, 82%, 1);
--ds-green-400: hsla(122, 60%, 86%, 1);
--ds-pink-800: hsla(336, 74%, 51%, 1);
--ds-blue-500: hsla(209, 100%, 80%, 1);
--ds-green-900-value: 133, 50%, 32%;
--ds-amber-300-value: 43, 96%, 90%;
--animate-blink: blink 1.4s infinite both;
--ds-teal-600-value: 170, 70%, 57%;
--ds-amber-400: hsla(42, 100%, 78%, 1);
--ds-green-200-value: 120, 60%, 95%;
--ship-end-gradient: #f9cb28;
--tw-enter-opacity: 1;
--ds-motion-overlay-scale: .96;
--ds-red-100: hsla(0, 100%, 97%, 1);
--geist-violet-background: #fff;
--ds-teal-800: hsla(173, 83%, 30%, 1);
--blur-sm: 8px;
--animate-cmdkLoading: cmdkLoading 1.1s cubic-bezier(.455, .03, .515, .955) infinite;
--geist-form-height: 36px;
```

### Dependencies

```css
0: --font-geist-sans;
```

### Semantic

```css
--ds-green-1000-value: 128, 29%, 15%;
--ds-green-800-value: 132, 43%, 39%;
--geist-success-light: #3291ff;
--ds-green-200: hsla(120, 60%, 95%, 1);
--geist-success-dark: #0761d1;
--ds-green-1000: hsla(128, 29%, 15%, 1);
--ds-green-600-value: 125, 60%, 64%;
--ds-green-800: hsla(132, 43%, 39%, 1);
--ds-green-100-value: 120, 60%, 96%;
--geist-success-lighter: #d3e5ff;
--ds-green-100: hsla(120, 60%, 96%, 1);
--ds-green-500: hsla(124, 60%, 75%, 1);
--ds-green-400-value: 122, 60%, 86%;
--ds-green-700: hsla(131, 41%, 46%, 1);
--geist-success: #0070f3;
--ds-green-500-value: 124, 60%, 75%;
--wv-green: #0cce6b;
--ds-green-600: hsla(125, 60%, 64%, 1);
--ds-green-900: hsla(133, 50%, 32%, 1);
--ds-green-700-value: 131, 41%, 46%;
--ds-green-300: hsla(120, 60%, 91%, 1);
--ds-green-300-value: 120, 60%, 91%;
--ds-green-400: hsla(122, 60%, 86%, 1);
--ds-green-900-value: 133, 50%, 32%;
--ds-green-200-value: 120, 60%, 95%;
--ds-amber-700: hsla(39, 100%, 57%, 1);
--ds-amber-500-value: 38, 100%, 71%;
--geist-warning-light: #f7b955;
--ds-amber-900: hsla(30, 100%, 32%, 1);
--ds-amber-800-value: 35, 100%, 52%;
--ds-amber-1000: hsla(20, 79%, 17%, 1);
--ds-amber-200: hsla(44, 100%, 92%, 1);
--ds-amber-600: hsla(36, 90%, 62%, 1);
--ds-amber-500: hsla(38, 100%, 71%, 1);
--ds-amber-700-value: 39, 100%, 57%;
--ds-amber-1000-value: 20, 79%, 17%;
--geist-warning-lighter: #ffefcf;
--ds-amber-900-value: 30, 100%, 32%;
--geist-warning: #f5a623;
--ds-amber-600-value: 36, 90%, 62%;
--ds-amber-300: hsla(43, 96%, 90%, 1);
--geist-highlight-yellow: #fff500;
--ds-amber-100-value: 39, 100%, 95%;
--ds-amber-100: hsla(39, 100%, 95%, 1);
--geist-warning-dark: #ab570a;
--ds-amber-800: hsla(35, 100%, 52%, 1);
--ds-amber-400-value: 42, 100%, 78%;
--ds-amber-200-value: 44, 100%, 92%;
--ds-amber-300-value: 43, 96%, 90%;
--ds-amber-400: hsla(42, 100%, 78%, 1);
--geist-error: #e00;
--ds-red-800-value: 358, 70%, 52%;
--geist-space-small-negative: -32px;
--geist-space-gap-negative: -24px;
--ds-red-1000: hsla(355, 49%, 15%, 1);
--geist-space-24x-negative: -96px;
--ds-red-500-value: 0, 82%, 85%;
--ds-red-200-value: 0, 100%, 96%;
--ds-red-200: hsla(0, 100%, 96%, 1);
--geist-space-large-negative: -40px;
--ds-red-700-value: 358, 75%, 59%;
--geist-space-gap-half-negative: -12px;
--geist-space-2x-negative: -8px;
--geist-space-gap-quarter-negative: -8px;
--geist-gap-half-negative: -12px;
--geist-error-lighter: #f7d4d6;
--geist-space-32x-negative: -128px;
--ds-red-300: hsla(0, 100%, 95%, 1);
--ds-red-700: hsla(358, 75%, 59%, 1);
--ds-red-400-value: 0, 90%, 92%;
--geist-space-8x-negative: -32px;
--ds-red-400: hsla(0, 90%, 92%, 1);
--ds-red-600: hsla(359, 90%, 71%, 1);
--geist-gap-negative: -24px;
--geist-error-dark: #c50000;
--geist-gap-quarter-negative: -8px;
--geist-gap-double-negative: -40px;
--wv-red: #ff4e42;
--ds-red-500: hsla(0, 82%, 85%, 1);
--ds-red-100-value: 0, 100%, 97%;
--geist-error-light: #ff1a1a;
--ds-red-800: hsla(358, 70%, 52%, 1);
--geist-space-48x-negative: -192px;
--geist-space-4x-negative: -16px;
--geist-space-negative: -4px;
--geist-space-64x-negative: -256px;
--ds-red-300-value: 0, 100%, 95%;
--ds-red-900-value: 358, 66%, 48%;
--ds-red-900: hsla(358, 66%, 48%, 1);
--ds-red-600-value: 359, 90%, 71%;
--geist-space-16x-negative: -64px;
--ds-red-1000-value: 355, 49%, 15%;
--geist-space-medium-negative: -36px;
--ds-red-100: hsla(0, 100%, 97%, 1);
--ds-blue-600: hsla(208, 100%, 66%, 1);
--ds-blue-200: hsla(210, 100%, 96%, 1);
--ds-blue-1000: hsla(211, 100%, 15%, 1);
--ds-blue-400: hsla(209, 100%, 90%, 1);
--ds-blue-900-value: 211, 100%, 42%;
--ds-blue-1000-value: 211, 100%, 15%;
--ds-blue-200-value: 210, 100%, 96%;
--ds-blue-100: hsla(212, 100%, 97%, 1);
--ds-blue-300-value: 210, 100%, 94%;
--ds-blue-800-value: 212, 100%, 41%;
--geist-console-text-color-blue: #0070f3;
--ds-blue-800: hsla(212, 100%, 41%, 1);
--ds-blue-400-value: 209, 100%, 90%;
--ds-blue-600-value: 208, 100%, 66%;
--ds-blue-700: hsla(212, 100%, 48%, 1);
--ds-blue-700-value: 212, 100%, 48%;
--ds-blue-500-value: 209, 100%, 80%;
--ds-blue-300: hsla(210, 100%, 94%, 1);
--ds-blue-100-value: 212, 100%, 97%;
--ds-blue-900: hsla(211, 100%, 42%, 1);
--ds-blue-500: hsla(209, 100%, 80%, 1);
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| 400px | 400px | max-width |
| 401px | 401px | min-width |
| sm | 470px | min-width |
| sm | 600px | max-width |
| sm | 601px | min-width |
| sm | 640px | max-width |
| sm | 670px | max-width |
| md | 768px | max-width |
| md | 769px | min-width |
| lg | 960px | max-width |
| lg | 961px | min-width |

## Transitions & Animations

**Easing functions:** `cubic-bezier(0.4, 0, 0.2, 1)`, `cubic-bezier(0, 0, 0.2, 1)`, `cubic-bezier(0.3, 0.57, 0.07, 0.95)`

**Durations:** `0.2s`, `0.15s`

### Common Transitions

```css
transition: all;
transition: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), scale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), outline-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), fill 0.15s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.15s cubic-bezier(0.4, 0, 0.2, 1), --tw-gradient-from 0.15s cubic-bezier(0.4, 0, 0.2, 1), --tw-gradient-via 0.15s cubic-bezier(0.4, 0, 0.2, 1), --tw-gradient-to 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transition: box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transition: height 0.15s cubic-bezier(0, 0, 0.2, 1), width 0.15s cubic-bezier(0, 0, 0.2, 1), border-radius 0.15s cubic-bezier(0, 0, 0.2, 1), transform 0.15s cubic-bezier(0, 0, 0.2, 1), background-color 0.15s cubic-bezier(0, 0, 0.2, 1);
transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
transition: fill 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), translate 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

**disV0a_fadeIn**
```css
@keyframes disV0a_fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**HXqoSW_fadeIn**
```css
@keyframes HXqoSW_fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**soft-fade-in**
```css
@keyframes soft-fade-in {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}
```

**show**
```css
@keyframes show {
  0% { transform: translate3d(0, var(--translate-y-start), 0); opacity: 0; }
  100% { transform: translate3d(0, var(--translate-y-end), 0); opacity: 1; }
}
```

**hide**
```css
@keyframes hide {
  0% { transform: translate3d(0, var(--translate-y-end), 0); opacity: 1; }
  100% { transform: translate3d(0, var(--translate-y-start), 0); opacity: 0; }
}
```

**fade-in**
```css
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**fade-out**
```css
@keyframes fade-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

**spinner-opacity**
```css
@keyframes spinner-opacity {
  0% { opacity: 1; }
  100% { opacity: 0.15; }
}
```

**soft-fade-in**
```css
@keyframes soft-fade-in {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}
```

**show**
```css
@keyframes show {
  0% { transform: translate3d(0, var(--translate-y-start), 0); opacity: 0; }
  100% { transform: translate3d(0, var(--translate-y-end), 0); opacity: 1; }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (15 instances)

```css
.buttons {
  background-color: rgb(255, 255, 255);
  color: rgb(77, 77, 77);
  font-size: 16px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 50%;
}
```

### Cards (8 instances)

```css
.cards {
  background-color: rgb(255, 255, 255);
  border-radius: 0px;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px 0px, rgb(250, 250, 250) 0px 0px 0px 1px;
  padding-top: 32px;
  padding-right: 32px;
}
```

### Inputs (8 instances)

```css
.inputs {
  background-color: rgb(255, 255, 255);
  color: rgb(23, 23, 23);
  border-color: rgb(235, 235, 235);
  border-radius: 0px;
  font-size: 16px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Links (94 instances)

```css
.links {
  color: rgb(23, 23, 23);
  font-size: 16px;
  font-weight: 400;
}
```

### Navigation (2 instances)

```css
.navigation {
  color: rgb(23, 23, 23);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: sticky;
}
```

### Badges (1 instances)

```css
.badges {
  color: rgb(77, 77, 77);
  font-size: 12px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Tooltips (1 instances)

```css
.tooltips {
  background-color: rgb(255, 255, 255);
  color: rgb(23, 23, 23);
  font-size: 16px;
  border-radius: 6px;
  padding-top: 0px;
  padding-right: 0px;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.02) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 8px 0px, rgb(250, 250, 250) 0px 0px 0px 1px, rgb(255, 255, 255) 0px 0px 0px 1px;
}
```

### Switches (2 instances)

```css
.switches {
  background-color: rgb(242, 242, 242);
  border-radius: 4px;
  border-color: rgb(235, 235, 235);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(77, 77, 77);
  padding: 0px 6px 0px 8px;
  border-radius: 4px;
  border: 1px solid rgb(235, 235, 235);
  font-size: 14px;
  font-weight: 400;
```

### Link — 4 instances, 1 variant

**Variant 1** (4 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(23, 23, 23);
  padding: 32px 32px 32px 32px;
  border-radius: 0px;
  border: 0px solid rgb(235, 235, 235);
  font-size: 16px;
  font-weight: 400;
```

### Button — 3 instances, 3 variants

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(143, 143, 143);
  padding: 0px 0px 0px 0px;
  border-radius: 6px;
  border: 0px solid rgb(235, 235, 235);
  font-size: 14px;
  font-weight: 500;
```

**Variant 2** (1 instance)

```css
  background: rgb(255, 255, 255);
  color: rgb(23, 23, 23);
  padding: 0px 0px 0px 0px;
  border-radius: 6px;
  border: 0px solid rgb(235, 235, 235);
  font-size: 14px;
  font-weight: 500;
```

**Variant 3** (1 instance)

```css
  background: rgb(23, 23, 23);
  color: rgb(255, 255, 255);
  padding: 0px 6px 0px 6px;
  border-radius: 6px;
  border: 0px solid rgb(235, 235, 235);
  font-size: 14px;
  font-weight: 500;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(255, 255, 255);
  color: rgb(143, 143, 143);
  padding: 0px 10px 0px 10px;
  border-radius: 6px;
  border: 0px solid rgb(235, 235, 235);
  font-size: 14px;
  font-weight: 500;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(255, 255, 255);
  color: rgb(23, 23, 23);
  padding: 0px 12px 0px 12px;
  border-radius: 0px;
  border: 0px none rgb(235, 235, 235);
  font-size: 14px;
  font-weight: 400;
```

### Button — 4 instances, 1 variant

**Variant 1** (4 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(77, 77, 77);
  padding: 0px 0px 0px 0px;
  border-radius: 50%;
  border: 0px none rgb(235, 235, 235);
  font-size: 16px;
  font-weight: 400;
```

### Input — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  padding: 10px 12px 10px 12px;
  border-radius: 0px;
  border: 0px none rgb(235, 235, 235);
  font-size: 14px;
  font-weight: 400;
```

## Layout System

**5 grid containers** and **186 flex containers** detected.

### The System

- **Content column** — 1220px wide, 22px gutters (2% edge density)
  - Width ladder: 959px · 1220px
- **Column system** — 2 columns
- **Gap scale** — 1px · 4px · 8px · 10px · 16px · 24px
- **Fluid layout** — 11 clamp/viewport declarations

```css
.disV0a_logoutScreen { width: 100vw; }
body { max-width: 100vw; }
.geist-overlay { width: 100vw; }
.w-screen { width: 100vw; }
.max-w-\[calc\(100vw-32px\)\] { max-width: calc(-32px + 100vw); }
.max-w-\[min\(420px\,calc\(100vw-2\*var\(--geist-gap\)\)\)\] { max-width: min(420px, calc(100vw - 2 * var(--geist-gap))); }
```

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 1280px | 0px |
| 1220px | 0px |
| 1200px | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 2-column | 3x |
| 1-column | 2x |

### Grid Templates

```css
grid-template-columns: 260px 960px;
grid-template-columns: 479.5px 479.5px;
grid-template-columns: 959px;
grid-template-columns: 206.25px 206.25px;
grid-template-columns: 14px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 172x |
| column/nowrap | 12x |
| row/wrap | 2x |

**Gap values:** `1px`, `4px`, `8px`, `10px`, `16px`, `24px`

## Accessibility (WCAG 2.1)

**Overall Score: 0%** — 0 passing, 1 failing color pairs

### Failing Color Pairs

| Foreground | Background | Ratio | Level | Used On |
|------------|------------|-------|-------|---------|
| `#8f8f8f` | `#fafafa` | 3.1:1 | FAIL | label (1x) |

## Design System Score

**Overall: 71/100 (Grade: C)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 50/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 90/100 |
| Border Radius Consistency | 100/100 |
| Accessibility | 0/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Good CSS variable tokenization

**Issues:**
- 4 font families — consider limiting to 2 (heading + body)
- 1 WCAG contrast failures
- 387 !important rules — prefer specificity over overrides
- 4331 duplicate CSS declarations

## Z-Index Map

**7 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 100000,999999999 | div.i.n.s.e.t.-.0. .p.o.i.n.t.e.r.-.e.v.e.n.t.s.-.n.o.n.e. .f.i.x.e.d. .z.-.[.1.0.0.0.0.0.]. .h.-.f.u.l.l. .w.-.f.u.l.l, div.b.g.-.b.a.c.k.g.r.o.u.n.d.-.1.0.0. .d.a.r.k.-.t.h.e.m.e.:.[.-.-.c.o.n.t.e.x.t.-.c.a.r.d.-.t.i.p.-.s.t.r.o.k.e.:.#.2.5.2.5.2.5.]. .p.o.i.n.t.e.r.-.e.v.e.n.t.s.-.n.o.n.e. .a.b.s.o.l.u.t.e. .z.-.[.1.0.0.0.0.0.0.]. .w.-.f.i.t. .o.v.e.r.f.l.o.w.-.v.i.s.i.b.l.e. .r.o.u.n.d.e.d.-.[.6.p.x.]. .b.g.-.c.l.i.p.-.p.a.d.d.i.n.g. .s.h.a.d.o.w.-.[.v.a.r.(.-.-.d.s.-.s.h.a.d.o.w.-.t.o.o.l.t.i.p.).,.0._.0._.0._.1.p.x._.v.a.r.(.-.-.d.s.-.b.a.c.k.g.r.o.u.n.d.-.1.0.0.).]. .[.-.-.c.o.n.t.e.x.t.-.c.a.r.d.-.t.i.p.-.s.t.r.o.k.e.:.#.D.B.D.B.D.B.]. .!.t.r.a.n.s.i.t.i.o.n.-.n.o.n.e, div.a.b.s.o.l.u.t.e. .z.-.[.9.9.9.9.9.9.9.9.9.]. .g.r.i.d. .h.-.[.7.p.x.]. .w.-.[.1.4.p.x.]. .o.r.i.g.i.n.-.c.e.n.t.e.r. .p.l.a.c.e.-.c.o.n.t.e.n.t.-.c.e.n.t.e.r. .t.o.p.-.f.u.l.l. .-.t.r.a.n.s.l.a.t.e.-.x.-.1./.2. .r.o.t.a.t.e.-.0. .!.t.r.a.n.s.i.t.i.o.n.-.n.o.n.e |
| dropdown | 100,100 | div.z.-.1.0.0. .p.o.i.n.t.e.r.-.e.v.e.n.t.s.-.n.o.n.e. .a.b.s.o.l.u.t.e. .i.n.s.e.t.-.0. .b.o.r.d.e.r. .b.o.r.d.e.r.-.b.l.u.e.-.7.0.0. .o.p.a.c.i.t.y.-.0. .g.r.o.u.p.-.f.o.c.u.s.-.v.i.s.i.b.l.e.:.o.p.a.c.i.t.y.-.1.0.0, div.z.-.1.0.0. .p.o.i.n.t.e.r.-.e.v.e.n.t.s.-.n.o.n.e. .a.b.s.o.l.u.t.e. .i.n.s.e.t.-.0. .b.o.r.d.e.r. .b.o.r.d.e.r.-.b.l.u.e.-.7.0.0. .o.p.a.c.i.t.y.-.0. .g.r.o.u.p.-.f.o.c.u.s.-.v.i.s.i.b.l.e.:.o.p.a.c.i.t.y.-.1.0.0, div.z.-.1.0.0. .p.o.i.n.t.e.r.-.e.v.e.n.t.s.-.n.o.n.e. .a.b.s.o.l.u.t.e. .i.n.s.e.t.-.0. .b.o.r.d.e.r. .b.o.r.d.e.r.-.b.l.u.e.-.7.0.0. .o.p.a.c.i.t.y.-.0. .g.r.o.u.p.-.f.o.c.u.s.-.v.i.s.i.b.l.e.:.o.p.a.c.i.t.y.-.1.0.0 |
| sticky | 10,10 | header.z.-.1.0.0. .f.i.x.e.d. .t.o.p.-.0. .m.x.-.a.u.t.o. .w.-.f.u.l.l. .m.a.x.-.w.-.[.1.2.2.0.p.x.]. .m.d.:.s.t.i.c.k.y. .-.Y.N.6.X.W._.h.e.a.d.e.r |
| base | 1,2 | span.r.e.l.a.t.i.v.e. .z.-.[.1.]. .s.i.z.e.-.4, span.r.e.l.a.t.i.v.e. .z.-.[.1.]. .s.i.z.e.-.4, span.r.e.l.a.t.i.v.e. .z.-.[.1.]. .s.i.z.e.-.4 |

**Issues:**
- Very high z-index values: 100000, 1000000, 999999999

## SVG Icons

**17 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| xs | 3 |
| sm | 11 |
| md | 3 |

**Icon colors:** `currentColor`, `rgb(0, 0, 0)`, `var(--ds-blue-700)`, `var(--ds-amber-800)`, `var(--ds-gray-700)`, `var(--ds-background-100)`, `white`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| GeistPixelCircle | self-hosted | 500 | normal |
| GeistPixelGrid | self-hosted | 500 | normal |
| GeistPixelLine | self-hosted | 500 | normal |
| GeistPixelTriangle | self-hosted | 500 | normal |
| Geist Mono | self-hosted | 100 900 | normal |
| GeistSans | self-hosted | 100 900 | normal |
| GeistPixelSquare | self-hosted | 500 | normal |
| GeistSerif | self-hosted | 400 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 6 | objectFit: fill, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (3x), 2.1:1 (1x), 3.19:1 (1x), 3.65:1 (1x)

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `150ms` | 150 |
| `sm` | `200ms` | 200 |

### Easing Families

- **custom** (38 uses) — `cubic-bezier(0.4, 0, 0.2, 1)`
- **ease-out** (3 uses) — `cubic-bezier(0, 0, 0.2, 1)`, `cubic-bezier(0.3, 0.57, 0.07, 0.95)`

### Keyframes In Use

| name | kind | properties | uses |
|---|---|---|---|
| `HXqoSW_fadeIn` | fade | opacity | 1 |

## Component Anatomy

### button — 10 instances

**Slots:** label
**Variants:** outline
**Sizes:** sm · medium

### link — 4 instances


## Brand Voice

**Tone:** technical · **Pronoun:** third-person · **Headings:** Title Case (tight)

### Top CTA Verbs

- **search** (1)
- **download** (1)
- **create** (1)
- **collaborate** (1)
- **colors** (1)
- **geist** (1)
- **send** (1)

### Button Copy Patterns

- "search geist
ctrl
k" (1×)
- "brand assets

download official vercel logos and brand assets." (1×)
- "npx create-next-app
collaborate
label

components

building blocks for react applications." (1×)
- "collaborate" (1×)
- "colors

a high contrast, accessible color system." (1×)
- "geist sans

geist mono

geist serif

geist pixel

typeface

specifically designed for developers and designers." (1×)
- "send" (1×)

### Sample Headings

> Geist Design System
> Geist Design System

## Page Intent

**Type:** `unknown` (confidence 0)
**Description:** Vercel's design system called Geist. Made for building consistent and delightful web experiences.

## Section Roles

Reading order (top→bottom): nav → content → hero → sidebar → feature-grid → nav

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | nav | — | 0.4 |
| 1 | hero | Geist Design System | 0.85 |
| 2 | content | Geist Design System | 0.3 |
| 3 | feature-grid | — | 0.8 |
| 4 | nav | — | 0.9 |
| 5 | sidebar | — | 0.4 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.48 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 50px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Imagery Style

**Label:** `mixed` (confidence 0.333)
**Counts:** total 6, svg 6, icon 9, screenshot-like 0, photo-like 0
**Dominant aspect:** square-ish
**Radius profile on images:** square

## Component Library

**Detected:** `shadcn/ui` (confidence 0.65)

Evidence:
- shadcn css tokens

Also considered: tailwindcss (0.3)

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `GeistSans` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
