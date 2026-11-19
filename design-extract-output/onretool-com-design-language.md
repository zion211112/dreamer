# Design Language: Explore a Logistics Dispatch Monitor | Retool

> Extracted from `https://onretool.com/app-gallery/logistics-dispatch-monitor` on November 19, 2026
> 904 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#e9ebdf` | rgb(233, 235, 223) | hsl(70, 23%, 90%) | 1318 |

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| primary | `#f5f6ef` | **`#e9ebdf`** | `#d9dad1` | `#c0c1b8` | `#9fa196` | `#818378` | `#6c6d63` | `#56584f` | `#464740` | `#383933` | `#1f1f1b` |
| neutral | `#f5f6f1` | `#eaeae5` | `#d9dad4` | **`#cbccc4`** | `#9fa099` | `#82837b` | `#6c6d66` | `#575751` | `#464742` | `#393935` | `#1f1f1c` |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#151515` | `#ffffff` | 18.26:1 | AAA |
| `surface.raised` | `#0e0e0e` | `#ffffff` | 19.3:1 | AAA |
| `action.primary` | `#e9ebdf` | `#151515` | 15.14:1 | AAA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#151515` — 94%
- `#242424` — 3%
- `#433e38` — 3%
- `#e9ebdf` — 0%
- `#000000` — 0%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#ffffff` | hsl(0, 0%, 100%) | 152 |
| `#cbccc4` | hsl(68, 7%, 78%) | 135 |
| `#151515` | hsl(0, 0%, 8%) | 133 |
| `#433e38` | hsl(33, 9%, 24%) | 17 |
| `#242424` | hsl(0, 0%, 14%) | 12 |
| `#b6b8af` | hsl(73, 6%, 70%) | 12 |
| `#f7f8f4` | hsl(75, 22%, 96%) | 6 |
| `#8b867f` | hsl(35, 5%, 52%) | 3 |
| `#000000` | hsl(0, 0%, 0%) | 2 |

### Background Colors

Used on large-area elements: `#151515`, `#0e0e0e`, `#433e38`, `#242424`

### Text Colors

Text color palette: `#e9ebdf`, `#cbccc4`, `#151515`, `#b6b8af`, `#f7f8f4`, `#ffffff`

### Gradients

```css
background-image: linear-gradient(90deg, rgb(121, 51, 37) 0%, rgb(45, 76, 113) 20%, rgb(61, 22, 61) 100%);
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#e9ebdf` | text, border, background | 1318 |
| `#ffffff` | text, border | 152 |
| `#cbccc4` | text, border | 135 |
| `#151515` | background, text, border | 133 |
| `#433e38` | border, background | 17 |
| `#242424` | background | 12 |
| `#b6b8af` | text, border | 12 |
| `#f7f8f4` | text, border | 6 |
| `#8b867f` | border | 3 |
| `#000000` | background | 2 |

## Typography

### Font Families

- **saansFont** — used for all (66 elements)
- **pxGroteskFont** — used for body (62 elements)

### Type System

- **Scale ratio** — 1.125 (major second), anchored at 44.9231px · 100% of sizes sit on the ladder
- **Measure** — ~65 characters per line (comfortable)
- **Fluid type** — 8 clamp/viewport font sizes, 10px → 72px

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `h2` | 44.9231px / 2.8077rem | 300 | 47.1693px | -0.449231px |
| `title-1` | 32.9231px / 2.0577rem | 300 | 34.5693px | -0.329231px |
| `h1` | 28.9231px / 1.8077rem | 300 | 30.3693px | -0.289231px |
| `h3` | 22.4615px / 1.4038rem | 380 | 26.9538px | -0.224615px |
| `title-2` | 18px / 1.125rem | 300 | 27px | 0.18px |
| `title-3` | 16px / 1rem | 400 | 24px | normal |
| `title-4` | 14px / 0.875rem | 570 | 16.8px | 0.28px |
| `body` | 13.2308px / 0.8269rem | 400 | 13.2308px | 0.132308px |
| `body-sm` | 12px / 0.75rem | 400 | 14.4px | 0.12px |
| `micro` | 11.3846px / 0.7115rem | 400 | 13.6615px | 0.113846px |

### Fluid Declarations

```css
.headline-xl { font-size: clamp(4rem, 2.76923rem + 1.92308vw, 4.5rem); }
.headline-lg { font-size: clamp(3.25rem, 2.01923rem + 1.92308vw, 3.75rem); }
.headline-md { font-size: clamp(2.5rem, 1.26923rem + 1.92308vw, 3rem); }
.headline-sm { font-size: clamp(1.75rem, 0.519231rem + 1.92308vw, 2.25rem); }
.headline-xs { font-size: clamp(1.5rem, 0.269231rem + 1.92308vw, 2rem); }
.\!headline-xxs { font-size: clamp(1.25rem, 0.634615rem + 0.961538vw, 1.5rem); }
.gjOgsG_hubspotFormContent form .hs-submit input[type="submit"] { font-size: clamp(0.75rem, 0.442308rem + 0.480769vw, 0.875rem); }
.text-caption-sm { font-size: clamp(0.65rem, 0.403846rem + 0.384615vw, 0.75rem); }
```

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 44.9231px | 2.8077rem | 300 | 47.1693px | -0.449231px | h2 |
| 32.9231px | 2.0577rem | 300 | 34.5693px | -0.329231px | h2 |
| 28.9231px | 1.8077rem | 300 | 30.3693px | -0.289231px | h1 |
| 22.4615px | 1.4038rem | 380 | 26.9538px | -0.224615px | p, h3, a, div |
| 18px | 1.125rem | 300 | 27px | 0.18px | p |
| 16px | 1rem | 400 | 24px | normal | html, head, meta, link |
| 14px | 0.875rem | 570 | 16.8px | 0.28px | h2, p, span |
| 13.2308px | 0.8269rem | 400 | 13.2308px | 0.132308px | span, a, button, svg |
| 12px | 0.75rem | 400 | 14.4px | 0.12px | button, svg, path, span |
| 11.3846px | 0.7115rem | 400 | 13.6615px | 0.113846px | span, a, p, code |

### Heading Scale

```css
h2 { font-size: 44.9231px; font-weight: 300; line-height: 47.1693px; }
h2 { font-size: 32.9231px; font-weight: 300; line-height: 34.5693px; }
h1 { font-size: 28.9231px; font-weight: 300; line-height: 30.3693px; }
h3 { font-size: 22.4615px; font-weight: 380; line-height: 26.9538px; }
h2 { font-size: 14px; font-weight: 570; line-height: 16.8px; }
```

### Body Text

```css
body { font-size: 13.2308px; font-weight: 400; line-height: 13.2308px; }
```

### Font Weights in Use

`400` (565x), `380` (304x), `300` (32x), `570` (3x)

## Spacing

**Base unit:** 4px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-4 | 4px | 0.25rem |
| spacing-8 | 8px | 0.5rem |
| spacing-12 | 12px | 0.75rem |
| spacing-16 | 16px | 1rem |
| spacing-20 | 20px | 1.25rem |
| spacing-24 | 24px | 1.5rem |
| spacing-32 | 32px | 2rem |
| spacing-36 | 36px | 2.25rem |
| spacing-40 | 40px | 2.5rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| sm | 4px | 2 |
| md | 8px | 5 |
| lg | 12px | 1 |
| xl | 20px | 1 |
| full | 36px | 2 |

## Elevation

1 levels from 1 raw shadows · neutral tint

**xs** — blur 15px, y 10px, used 1× · 6 layers
```css
box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px;
```

## CSS Custom Properties

### Colors

```css
--raw-blue-primary: #518dd2;
--raw-gray-primary: #8b867f;
--raw-green-primary: #4d9987;
--raw-neutral-dark-black-2-primary: #151515;
--raw-neutral-light-white-2-primary: #e9ebdf;
--raw-orange-primary: #e8765e;
--raw-pink-primary: #cc64ce;
--raw-purple-primary: #9874d2;
--raw-red-primary: #ef4444;
--raw-yellow-primary: #eca438;
--raw-lime-primary: #e0d643;
--btn-secondary-red-hover-text: #e9ebdf;
--tw-mask-bottom-from-color: black;
--btn-secondary-pink-active-icon: #e9ebdf;
--btn-secondary-gray-active-icon: #e9ebdf;
--tw-inset-ring-shadow: 0 0 #0000;
--btn-secondary-blue-active-icon: #e9ebdf;
--btn-secondary-green-active-icon: #e9ebdf;
--btn-secondary-orange-default-text: #e9ebdf;
--nav-items-inactive-stroke-accent: #e9ebdf66;
--btn-secondary-gray-default-icon: #e9ebdf;
--btn-secondary-blue-hover-text: #e9ebdf;
--btn-secondary-gray-default-stroke: #8b867f;
--color-white: #fff;
--color-gray-400: lab(65.9269% -.832707 -8.17473);
--btn-secondary-green-default-icon: #e9ebdf;
--color-input-hover-label-required: #e9ebdf99;
--color-surface-background-base: #151515;
--btn-secondary-green-default-stroke: #4d9987;
--btn-secondary-yellow-hover-icon: #e9ebdf;
--color-surface-details-neutral-alpha-12: #e9ebdf1f;
--btn-secondary-pink-hover-icon: #e9ebdf;
--btn-secondary-green-hover-text: #e9ebdf;
--color-input-default-background: #e9ebdf00;
--btn-secondary-blue-default-stroke: #518dd2;
--surface-accent-muted-yellow: #f6d6a0;
--surface-accent-background-orange: #491f16;
--surface-accent-focused-purple: #9874d2;
--btn-secondary-blue-default-text: #e9ebdf;
--subnav-inactive-stroke-accent: #e9ebdf1f;
--nav-items-active-stroke-accent: #e9ebdf66;
--subnav-hover-stroke-accent: #e9ebdf1f;
--gradient-item-color: rgb(45, 76, 113);
--btn-secondary-yellow-active-text: #e9ebdf00;
--surface-accent-focused-lime: #e0d643;
--footer-text-muted: #b6b8af;
--btn-secondary-orange-active-icon: #e9ebdf;
--btn-secondary-gray-hover-icon: #e9ebdf;
--surface-accent-base-yellow: #7c481c;
--btn-secondary-green-default-text: #e9ebdf;
--surface-accent-base-lime: #8d8737;
--btn-secondary-pink-default-text: #e9ebdf;
--surface-accent-background-gray: #282522;
--tw-ring-shadow: 0 0 #0000;
--btn-secondary-orange-active-stroke: #f5c2b2;
--color-yellow-600: lab(62.7799% 22.4197 86.1544);
--surface-accent-focused-gray: #8b867f;
--btn-secondary-pink-default-icon: #e9ebdf;
--btn-secondary-purple-active-stroke: #d0c1ea;
--btn-secondary-gray-active-stroke: #c8bfb5;
--btn-secondary-purple-default-icon: #e9ebdf;
--surface-accent-muted-purple: #d0c1ea;
--tw-border-spacing-x: 0px;
--surface-details-logo-bg: #e9ebdf;
--surface-accent-background-purple: #3f2a68;
--surface-accent-base-purple: #53397c;
--nav-items-hover-stroke-accent: #e9ebdf66;
--btn-secondary-red-hover-stroke: #fca9a9;
--btn-secondary-blue-active-stroke: #b0ccea;
--surface-accent-focused-blue: #518dd2;
--color-purple-100: lab(93.3333% 6.97437 -9.83434);
--btn-secondary-yellow-active-stroke: #f6d6a0;
--surface-accent-base-pink: #652466;
--btn-secondary-purple-hover-text: #e9ebdf;
--color-input-default-stroke: #e9ebdf10;
--btn-secondary-yellow-active-icon: #e9ebdf;
--color-red-500: lab(55.4814% 75.0732 48.8528);
--surface-accent-muted-gray: #c8bfb5;
--btn-secondary-red-default-text: #e9ebdf;
--tw-ring-offset-width: 0px;
--btn-primary-active-icon: #151515;
--app-frame-card-glow-spread: 1;
--btn-secondary-green-active-text: #e9ebdf00;
--color-surface-text-primary: #e9ebdf;
--btn-secondary-green-hover-stroke: #afd1c6;
--tw-mask-top-from-color: black;
--tw-ring-offset-shadow: 0 0 #0000;
--surface-accent-base-gray: #433e38;
--surface-accent-muted-blue: #b0ccea;
--btn-secondary-blue-active-text: #e9ebdf00;
--accent-muted-color: #c8bfb5;
--surface-background-muted: #0e0e0e;
--btn-secondary-yellow-hover-stroke: #f6d6a0;
--btn-primary-hover-icon: #151515;
--btn-primary-active-text: #15151500;
--surface-accent-focused-green: #4d9987;
--btn-secondary-gray-default-text: #e9ebdf;
--color-red-700: lab(40.4273% 67.2623 53.7441);
--color-gray-900: lab(8.11897% .811279 -12.254);
--color-gray-700: lab(27.1134% -.956401 -12.3224);
--btn-secondary-purple-hover-icon: #e9ebdf;
--app-frame-card-glow-alpha: 0.4;
--surface-accent-background-lime: #56521e;
--btn-secondary-gray-hover-stroke: #c8bfb5;
--surface-text-muted: #cbccc4;
--btn-secondary-yellow-hover-text: #e9ebdf;
--surface-accent-muted-lime: #f7eda9;
--btn-secondary-pink-default-stroke: #cc64ce;
--surface-accent-focused-pink: #cc64ce;
--tw-mask-bottom-to-color: transparent;
--accent-background-color: #282522;
--btn-secondary-orange-default-stroke: #e8765e;
--surface-accent-background-yellow: #4a2b11;
--surface-accent-muted-red: #fca9a9;
--btn-secondary-orange-active-text: #e9ebdf00;
--btn-secondary-orange-hover-icon: #e9ebdf;
--btn-secondary-red-hover-icon: #e9ebdf;
--btn-secondary-purple-hover-stroke: #d0c1ea;
--surface-accent-muted-pink: #e8bae8;
--btn-secondary-purple-default-text: #e9ebdf;
--surface-accent-muted-orange: #f5c2b2;
--btn-primary-default-background: #e9ebdf;
--btn-secondary-gray-active-text: #e9ebdf00;
--surface-accent-focused-orange: #e8765e;
--btn-secondary-pink-active-stroke: #e8bae8;
--btn-secondary-blue-default-icon: #e9ebdf;
--color-green-600: lab(59.0978% -58.6621 41.2579);
--subnav-default-stroke-accent: #e9ebdf1f;
--btn-secondary-yellow-default-icon: #e9ebdf;
--surface-accent-base-blue: #2d4c71;
--nav-items-default-stroke-accent: #e9ebdf66;
--surface-accent-background-blue: #1b2e44;
--surface-details-header-bg: #fff;
--surface-accent-background-pink: #3d163d;
--surface-accent-muted-green: #afd1c6;
--accent-base-color: #433e38;
--btn-secondary-green-active-stroke: #afd1c6;
--surface-accent-focused-red: #ef4444;
--color-gray-600: lab(35.6337% -1.58697 -10.8425);
--color-yellow-200: lab(94.3433% -5.00429 52.9663);
--tw-mask-top-to-color: transparent;
--color-surface-details-neutral-alpha-6: #e9ebdf10;
--tw-border-style: solid;
--btn-primary-hover-background: #fff;
--color-red-600: lab(48.4493% 77.4328 61.5452);
--surface-accent-background-green: #0e352c;
--color-black: #000;
--surface-text-primary: #e9ebdf;
--btn-secondary-green-hover-icon: #e9ebdf;
--btn-secondary-purple-active-text: #e9ebdf00;
--tw-border-spacing-y: 0px;
--btn-secondary-red-default-icon: #e9ebdf;
--btn-secondary-orange-default-icon: #e9ebdf;
--btn-secondary-red-default-stroke: #ef4444;
--surface-details-neutral-muted: #cbccc4;
--btn-primary-default-text: #151515;
--color-surface-accent-focused-gray: #8b867f;
--btn-primary-hover-text: #151515;
--color-red-200: lab(86.017% 19.8815 7.75869);
--btn-secondary-purple-active-icon: #e9ebdf;
--accent-focused-color: #8b867f;
--btn-secondary-yellow-default-stroke: #eca438;
--btn-secondary-pink-hover-text: #e9ebdf;
--surface-accent-focused-yellow: #eca438;
--tw-ring-offset-color: #fff;
--btn-secondary-pink-active-text: #e9ebdf00;
--surface-accent-base-red: #832424;
--btn-secondary-blue-hover-stroke: #b0ccea;
--surface-accent-background-red: #531717;
--btn-secondary-purple-default-stroke: #9874d2;
--color-surface-accent-focused-blue: #518dd2;
--btn-secondary-pink-hover-stroke: #e8bae8;
--btn-primary-default-icon: #151515;
--btn-secondary-gray-hover-text: #e9ebdf;
--btn-secondary-orange-hover-text: #e9ebdf;
--color-gray-800: lab(16.1051% -1.18239 -11.7533);
--surface-accent-base-orange: #793325;
--btn-primary-active-background: #fff;
--btn-secondary-red-active-icon: #e9ebdf;
--btn-secondary-red-active-text: #e9ebdf00;
--color-blue-500: lab(54.1736% 13.3369 -74.6839);
--btn-secondary-blue-hover-icon: #e9ebdf;
--btn-secondary-yellow-default-text: #e9ebdf;
--color-yellow-900: lab(32.3865% 21.1273 38.5959);
--color-purple-50: lab(97.1627% 2.99937 -4.13398);
--color-red-50: lab(96.5005% 4.18508 1.52328);
--surface-accent-base-green: #185849;
--color-gray-200: lab(91.6229% -.159115 -2.26791);
--btn-secondary-red-active-stroke: #fca9a9;
--footer-border: #e9ebdf99;
--btn-secondary-orange-hover-stroke: #f5c2b2;
```

### Spacing

```css
--letter-spacing-headline-xl: -.022em;
--tw-space-x-reverse: 0;
--tw-space-y-reverse: 0;
--spacing-hairline: .0625rem;
--letter-spacing-headline-md: -.01em;
--letter-spacing-headline-xs: -.01em;
--letter-spacing-headline-lg: -.02em;
--letter-spacing-body: .01em;
--letter-spacing-title: .02em;
--spacing-half-hairline: .03125rem;
--spacing: .25rem;
--letter-spacing-headline-xxs: -.01em;
--letter-spacing-headline-xxl: -.031em;
--letter-spacing-headline-sm: -.01em;
```

### Typography

```css
--font-mono: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
--subnav-inactive-text: #e9ebdf66;
--nav-items-default-text: #e9ebdf;
--input-focused-value-text: #151515;
--input-focused-placeholder-text: #15151599;
--btn-tertiary-default-text: #e9ebdf;
--cursor-default-context-guide: #fff;
--text-sm: .875rem;
--subnav-default-text: #e9ebdf;
--btn-tertiary-active-text: #e9ebdf00;
--subnav-hover-text: #e9ebdf;
--font-weight-headline: 300;
--text-lg: 1.125rem;
--input-hover-placeholder-text: #e9ebdf99;
--input-hover-value-text: #e9ebdf;
--cursor-hover-context-guide-stroke: #8b867f;
--cursor-active-context-guide-stroke: #c8bfb5;
--cursor-active-text: #e9ebdf;
--default-font-family: ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
--font-weight-headline-xxs: 380;
--surface-text-opacity-alpha-60: #e9ebdf99;
--nav-items-inactive-text: #e9ebdf66;
--nav-items-active-text: #cbccc4;
--input-focused-label-text: #e9ebdf;
--font-weight-title: 570;
--text-sm--line-height: calc(1.25/.875);
--text-3xl--line-height: calc(2.25/1.875);
--text-3xl: 1.875rem;
--text-xs: .75rem;
--font-weight-normal: 400;
--cursor-message-context-guide-stroke: #e9ebdf00;
--input-default-placeholder-text: #e9ebdfcc;
--default-mono-font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
--input-hover-error-text: #f15264;
--font-weight-bold: 700;
--text-xs--line-height: calc(1/.75);
--input-default-error-text: #f15264;
--text-xl: 1.25rem;
--cursor-hover-context-guide: #0009;
--leading-relaxed: 1.625;
--surface-text-opacity-alpha-40: #e9ebdf66;
--leading-snug: 1.375;
--text-2xl--line-height: calc(2/1.5);
--cursor-default-text: #fff;
--text-xl--line-height: calc(1.75/1.25);
--cursor-default-context-guide-stroke: #000;
--leading-tight: 1.25;
--input-default-label-text: #e9ebdf;
--text-4xl--line-height: calc(2.5/2.25);
--tracking-tight: -.025em;
--text-2xl: 1.5rem;
--footer-text: #cbccc4;
--leading-normal: 1.5;
--eyebrow-text: #b6b8af;
--text-lg--line-height: calc(1.75/1.125);
--cursor-active-context-guide: #15151599;
--font-sans: ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
--font-weight-body: 300;
--cursor-message-text: #fff;
--input-hover-label-text: #e9ebdf;
--cursor-hover-text: #fff;
--surface-text-opacity-alpha-20: #e9ebdf33;
--tracking-wide: .025em;
--font-weight-semibold: 600;
--nav-items-hover-text: #f7f8f4;
--text-4xl: 2.25rem;
--cursor-message-context-guide: #0009;
--input-focused-error-text: #c72844;
--input-default-value-text: #e9ebdf;
--btn-tertiary-hover-text: #e9ebdf;
```

### Shadows

```css
--tw-inset-shadow: 0 0 #0000;
--tw-shadow-alpha: 100%;
--tw-drop-shadow-alpha: 100%;
--tw-shadow: 0 0 #0000;
--tw-inset-shadow-alpha: 100%;
```

### Radii

```css
--radius-sm: .25rem;
--radius-md: .375rem;
--radius-lg: .5rem;
--radius-8: .5rem;
--radius-6: .375rem;
--radius-2xl: 1rem;
--radius-3xl: 1.5rem;
--radius-xl: .75rem;
```

### Other

```css
--raw-dark-black-0-alpha-80: #000c;
--raw-dark-black-0-alpha-60: #0009;
--raw-dark-black-2-alpha-0: #15151500;
--raw-dark-black-2-alpha-6: #15151510;
--raw-dark-black-2-alpha-12: #1515151f;
--raw-dark-black-2-alpha-24: #1515153d;
--raw-dark-black-2-alpha-40: #15151566;
--raw-dark-black-2-alpha-60: #15151599;
--raw-light-white-2-alpha-0: #e9ebdf00;
--raw-light-white-2-alpha-6: #e9ebdf10;
--raw-light-white-2-alpha-12: #e9ebdf1f;
--raw-light-white-2-alpha-20: #e9ebdf33;
--raw-light-white-2-alpha-40: #e9ebdf66;
--raw-light-white-2-alpha-60: #e9ebdf99;
--raw-light-white-2-alpha-80: #e9ebdfcc;
--raw-light-white-1-alpha-0: #f7f8f400;
--raw-light-white-1-alpha-6: #f7f8f410;
--raw-light-white-1-alpha-12: #f7f8f41f;
--raw-light-white-1-alpha-20: #f7f8f433;
--raw-light-white-1-alpha-40: #f7f8f466;
--raw-light-white-1-alpha-60: #f7f8f499;
--raw-light-white-1-alpha-80: #f7f8f4cc;
--raw-light-white-1-alpha-90: #f7f8f4dd;
--raw-light-white-0-alpha-60: #fff9;
--raw-light-white-0-alpha-80: #fffc;
--raw-blue-darkest: #101e2d;
--raw-blue-darker: #1b2e44;
--raw-blue-dark: #2d4c71;
--raw-blue-light: #71a2da;
--raw-blue-lighter: #b0ccea;
--raw-blue-lightest: #d8e6f3;
--raw-gray-darkest: #282522;
--raw-gray-darkened: #433e38;
--raw-gray-lightened: #c8bfb5;
--raw-gray-lightest: #ded9d3;
--raw-green-darkest: #081e19;
--raw-green-darker: #0e352c;
--raw-green-dark: #185849;
--raw-green-light: #6eac9c;
--raw-green-lighter: #afd1c6;
--raw-green-lightest: #d7e9e0;
--raw-neutral-dark-black-0: #000;
--raw-neutral-dark-black-1: #0e0e0e;
--raw-neutral-dark-black-3: #242424;
--raw-neutral-dark-black-4: #2e2f2d;
--raw-neutral-dark-black-5: #3f403d;
--raw-neutral-light-white-0: #fff;
--raw-neutral-light-white-1: #f7f8f4;
--raw-neutral-light-white-3: #cbccc4;
--raw-neutral-light-white-4: #b6b8af;
--raw-neutral-light-white-5: #94958e;
--raw-orange-darkest: #2b1713;
--raw-orange-darker: #491f16;
--raw-orange-dark: #793325;
--raw-orange-light: #ec8f7a;
--raw-orange-lighter: #f5c2b2;
--raw-orange-lightest: #fae1d6;
--raw-pink-darkest: #280d28;
--raw-pink-darker: #3d163d;
--raw-pink-dark: #652466;
--raw-pink-light: #d581d7;
--raw-pink-lighter: #e8bae8;
--raw-pink-lightest: #f4ddf2;
--raw-purple-darkest: #271c3f;
--raw-purple-darker: #3f2a68;
--raw-purple-dark: #53397c;
--raw-purple-light: #ab8eda;
--raw-purple-lighter: #d0c1ea;
--raw-purple-lightest: #e8e1f3;
--raw-red-darkest: #2f0909;
--raw-red-darker: #531717;
--raw-red-dark: #832424;
--raw-red-light: #ff7171;
--raw-red-lighter: #fca9a9;
--raw-red-lightest: #ffcfcf;
--raw-yellow-darkest: #301a08;
--raw-yellow-darker: #4a2b11;
--raw-yellow-dark: #7c481c;
--raw-yellow-light: #efb55b;
--raw-yellow-lighter: #f6d6a0;
--raw-yellow-lightest: #fbebcc;
--raw-lime-darkest: #272502;
--raw-lime-darker: #56521e;
--raw-lime-dark: #8d8737;
--raw-lime-light: #f9ec75;
--raw-lime-lighter: #f7eda9;
--raw-lime-lightest: #fcf8de;
--raw-semantic-critical-12: #651722;
--raw-semantic-critical-11: #c72844;
--raw-semantic-critical-10: #f15264;
--raw-semantic-critical-8: #e79295;
--raw-semantic-success-12: #1a3c32;
--raw-semantic-success-11: #008163;
--raw-semantic-success-10: #11997a;
--raw-semantic-success-8: #52bb9d;
--raw-semantic-warning-12: #4b371d;
--raw-semantic-warning-11: #aa6800;
--raw-semantic-warning-10: #f1a42e;
--raw-semantic-warning-8: #e0a24e;
--dvt-z-frame: 1500;
--surface-details-neutral-alpha-60: #e9ebdf99;
--blur-lg: 1rem;
--breakpoint-xxl: 1440px;
--dvt-ease-out: cubic-bezier(.12,1,.72,1);
--nav-items-active-selected: #518dd2;
--dvt-ease-in-out: cubic-bezier(.72,0,.12,1);
--tw-mask-conic: linear-gradient(#fff,#fff);
--cursor-message-cursor-stroke: #000;
--dvt-site-max-width: 2240px;
--btn-tertiary-default-icon: #e9ebdf;
--tw-mask-top-to-position: 100%;
--dvt-sticky-offset: 2.5rem;
--nav-items-inactive-icon: #e9ebdf66;
--nav-scrolled-background: #000c;
--interface-background: #f7f8f499;
--nav-default-background: #15151500;
--alert-default-background: #651722;
--dvt-nav-plus-sticky-offset-height: calc(5rem + 2.5rem);
--tw-mask-right: linear-gradient(#fff,#fff);
--tw-gradient-to-position: 100%;
--surface-details-neutral-alpha-20: #e9ebdf33;
--experimental-cursor-stroke: #fff;
--input-focused-stroke: #15151500;
--interface-stroke: #1515151f;
--dvt-banner-height: 2.5rem;
--ease-soft-ease-out: cubic-bezier(.24,.01,.36,1);
--btn-tertiary-hover-icon: #e9ebdf;
--tw-scale-y: 1;
--tw-mask-radial: linear-gradient(#fff,#fff);
--container-6xl: 72rem;
--subnav-hover-icon: #e9ebdf;
--nav-items-active-icon: #cbccc4;
--input-focused-background: #f7f8f4;
--input-default-error-stroke: #f15264;
--alert-default-icon: #e79295;
--container-xl: 36rem;
--cursor-active-cursor: #fff;
--dvt-ease-in-back: cubic-bezier(.12,0,.72,-.4);
--surface-lightbox-active: #000c;
--surface-details-neutral-alpha-12: #e9ebdf1f;
--cursor-hover-cursor: #fff;
--tw-divide-x-reverse: 0;
--subnav-inactive-selected: #518dd2;
--feature-group-mask-band: 0px;
--dvt-nav-height: 5rem;
--nav-items-default-selected: #518dd2;
--nav-items-inactive-selected: #518dd2;
--tw-gradient-from-position: 0%;
--ease-ease-out: cubic-bezier(.12,1,.72,1);
--dvt-grid-inner: calc(calc(min(100dvw,2240px)/36)*calc(36 - 2));
--dvt-grid-col: calc(min(100dvw,2240px)/36);
--surface-details-neutral-alpha-40: #e9ebdf66;
--container-2xs: 18rem;
--blur-md: .75rem;
--surface-lightbox-scrim: #0009;
--container-4xl: 56rem;
--nav-active-background: #000c;
--btn-tertiary-active-background: #2e2f2d;
--input-hover-error-stroke: #f15264;
--cursor-hover-cursor-stroke: #000;
--eyebrow-background: #000;
--tw-mask-top-from-position: 0%;
--dvt-nav-plus-banner-height: calc(5rem + 2.5rem);
--cursor-message-cursor: #fff;
--btn-tertiary-default-background: #242424;
--container-md: 28rem;
--input-hover-stroke: #e9ebdf1f;
--aspect-video: 16/9;
--dvt-grid-inner-max: 1440px;
--dvt-grid-items: 36;
--input-default-label-required: #e9ebdf99;
--tw-outline-style: solid;
--input-hover-background: #e9ebdf33;
--input-focused-error-stroke: #c72844;
--cursor-active-cursor-stroke: #fff;
--dvt-ease-out-back: cubic-bezier(.12,1.4,.72,1);
--tw-gradient-from: rgba(0, 0, 0, 0);
--dvt-ease-in: cubic-bezier(.12,0,.72,0);
--tw-gradient-to: rgba(0, 0, 0, 0);
--btn-tertiary-active-icon: #e9ebdf;
--experimental-ui-background: #fff;
--blur-2xl: 40px;
--dvt-ease-out-soft: cubic-bezier(.24,.01,.36,1);
--surface-details-neutral: #e9ebdf;
--tw-gradient-via-position: 50%;
--input-focused-label-required: #e9ebdf99;
--default-transition-duration: .15s;
--cursor-default-cursor-stroke: #000;
--animate-pulse: pulse 2s cubic-bezier(.4,0,.6,1)infinite;
--footer-logo: #e9ebdf;
--input-default-stroke: #e9ebdf10;
--surface-background-focused: #242424;
--default-transition-timing-function: cubic-bezier(.72,0,.12,1);
--tw-translate-z: 0;
--tw-gradient-via: rgba(0, 0, 0, 0);
--input-default-background: #e9ebdf00;
--container-3xl: 48rem;
--blur-xs: .1875rem;
--tw-translate-y: 0;
--cursor-hover-icon: #fff;
--tw-mask-top: linear-gradient(#fff,#fff);
--tw-content: "";
--btn-tertiary-hover-background: #2e2f2d;
--swipe-progress: 0;
--tw-translate-x: 0;
--input-hover-label-required: #e9ebdf99;
--subnav-default-selected: #518dd2;
--surface-background-base: #151515;
--tw-mask-linear: linear-gradient(#fff,#fff);
--subnav-inactive-icon: #e9ebdf00;
--dvt-ease-in-out-soft: cubic-bezier(.72,0,.36,1);
--surface-details-neutral-alpha-6: #e9ebdf10;
--dvt-document-width: min(100dvw,2240px);
--cursor-default-icon: #fff;
--subnav-hover-selected: #518dd2;
--dvt-grid-outer: calc((min(100dvw,2240px) - calc(calc(min(100dvw,2240px)/36)*calc(36 - 2)))/2);
--dvt-ease-in-soft: cubic-bezier(.64,0,.76,1);
--surface-lightbox-inactive: #15151500;
--subnav-default-icon: #e9ebdf00;
--nav-items-hover-selected: #518dd2;
--blur-xl: 1.375rem;
--tw-mask-bottom-to-position: 100%;
--tw-scale-z: 1;
--alert-default-stroke: #c72844;
--dvt-ease-in-out-back: cubic-bezier(.72,-.4,.36,1.4);
--cursor-default-cursor: #fff;
--footer-background: #151515;
--nav-items-hover-icon: #f7f8f4;
--experimental-cursor-fill: #000;
--cursor-active-icon: #fff;
--animate-spin: spin 1s linear infinite;
--dvt-sine: cubic-bezier(.36,0,.64,1);
--tw-mask-left: linear-gradient(#fff,#fff);
--tw-mask-bottom-from-position: 0%;
--nav-items-default-icon: #e9ebdf;
--tw-divide-y-reverse: 0;
--dvt-linear: cubic-bezier(0,0,1,1);
--container-2xl: 42rem;
--tw-scale-x: 1;
--tw-mask-bottom: linear-gradient(#fff,#fff);
--container-7xl: 80rem;
--blur-sm: .375rem;
```

### Semantic

```css
--raw-green-darkest: #081e19;
--raw-green-darker: #0e352c;
--raw-green-dark: #185849;
--raw-green-primary: #4d9987;
--raw-green-light: #6eac9c;
--raw-green-lighter: #afd1c6;
--raw-green-lightest: #d7e9e0;
--raw-semantic-success-12: #1a3c32;
--raw-semantic-success-11: #008163;
--raw-semantic-success-10: #11997a;
--raw-semantic-success-8: #52bb9d;
--btn-secondary-green-active-icon: #e9ebdf;
--btn-secondary-green-default-icon: #e9ebdf;
--btn-secondary-green-default-stroke: #4d9987;
--btn-secondary-green-hover-text: #e9ebdf;
--btn-secondary-green-default-text: #e9ebdf;
--btn-secondary-green-active-text: #e9ebdf00;
--btn-secondary-green-hover-stroke: #afd1c6;
--surface-accent-focused-green: #4d9987;
--color-green-600: lab(59.0978% -58.6621 41.2579);
--surface-accent-muted-green: #afd1c6;
--btn-secondary-green-active-stroke: #afd1c6;
--surface-accent-background-green: #0e352c;
--btn-secondary-green-hover-icon: #e9ebdf;
--surface-accent-base-green: #185849;
--raw-yellow-darkest: #301a08;
--raw-yellow-darker: #4a2b11;
--raw-yellow-dark: #7c481c;
--raw-yellow-primary: #eca438;
--raw-yellow-light: #efb55b;
--raw-yellow-lighter: #f6d6a0;
--raw-yellow-lightest: #fbebcc;
--raw-semantic-warning-12: #4b371d;
--raw-semantic-warning-11: #aa6800;
--raw-semantic-warning-10: #f1a42e;
--raw-semantic-warning-8: #e0a24e;
--btn-secondary-yellow-hover-icon: #e9ebdf;
--surface-accent-muted-yellow: #f6d6a0;
--btn-secondary-yellow-active-text: #e9ebdf00;
--surface-accent-base-yellow: #7c481c;
--color-yellow-600: lab(62.7799% 22.4197 86.1544);
--btn-secondary-yellow-active-stroke: #f6d6a0;
--btn-secondary-yellow-active-icon: #e9ebdf;
--btn-secondary-yellow-hover-stroke: #f6d6a0;
--btn-secondary-yellow-hover-text: #e9ebdf;
--surface-accent-background-yellow: #4a2b11;
--btn-secondary-yellow-default-icon: #e9ebdf;
--color-yellow-200: lab(94.3433% -5.00429 52.9663);
--btn-secondary-yellow-default-stroke: #eca438;
--surface-accent-focused-yellow: #eca438;
--btn-secondary-yellow-default-text: #e9ebdf;
--color-yellow-900: lab(32.3865% 21.1273 38.5959);
--raw-red-darkest: #2f0909;
--raw-red-darker: #531717;
--raw-red-dark: #832424;
--raw-red-primary: #ef4444;
--raw-red-light: #ff7171;
--raw-red-lighter: #fca9a9;
--raw-red-lightest: #ffcfcf;
--btn-secondary-red-hover-text: #e9ebdf;
--color-input-hover-label-required: #e9ebdf99;
--input-default-error-stroke: #f15264;
--btn-secondary-red-hover-stroke: #fca9a9;
--color-red-500: lab(55.4814% 75.0732 48.8528);
--btn-secondary-red-default-text: #e9ebdf;
--color-red-700: lab(40.4273% 67.2623 53.7441);
--input-hover-error-stroke: #f15264;
--input-default-label-required: #e9ebdf99;
--surface-accent-muted-red: #fca9a9;
--input-focused-error-stroke: #c72844;
--input-hover-error-text: #f15264;
--btn-secondary-red-hover-icon: #e9ebdf;
--input-focused-label-required: #e9ebdf99;
--input-default-error-text: #f15264;
--surface-accent-focused-red: #ef4444;
--color-red-600: lab(48.4493% 77.4328 61.5452);
--input-hover-label-required: #e9ebdf99;
--btn-secondary-red-default-icon: #e9ebdf;
--btn-secondary-red-default-stroke: #ef4444;
--color-red-200: lab(86.017% 19.8815 7.75869);
--surface-accent-base-red: #832424;
--surface-accent-background-red: #531717;
--btn-secondary-red-active-icon: #e9ebdf;
--btn-secondary-red-active-text: #e9ebdf00;
--input-focused-error-text: #c72844;
--color-red-50: lab(96.5005% 4.18508 1.52328);
--btn-secondary-red-active-stroke: #fca9a9;
--raw-blue-darkest: #101e2d;
--raw-blue-darker: #1b2e44;
--raw-blue-dark: #2d4c71;
--raw-blue-primary: #518dd2;
--raw-blue-light: #71a2da;
--raw-blue-lighter: #b0ccea;
--raw-blue-lightest: #d8e6f3;
--btn-secondary-blue-active-icon: #e9ebdf;
--btn-secondary-blue-hover-text: #e9ebdf;
--btn-secondary-blue-default-stroke: #518dd2;
--btn-secondary-blue-default-text: #e9ebdf;
--btn-secondary-blue-active-stroke: #b0ccea;
--surface-accent-focused-blue: #518dd2;
--surface-accent-muted-blue: #b0ccea;
--btn-secondary-blue-active-text: #e9ebdf00;
--btn-secondary-blue-default-icon: #e9ebdf;
--surface-accent-base-blue: #2d4c71;
--surface-accent-background-blue: #1b2e44;
--btn-secondary-blue-hover-stroke: #b0ccea;
--color-surface-accent-focused-blue: #518dd2;
--color-blue-500: lab(54.1736% 13.3369 -74.6839);
--btn-secondary-blue-hover-icon: #e9ebdf;
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| 400px | 400px | min-width |
| sm | 543px | max-width |
| sm | 544px | min-width |
| sm | 640px | max-width |
| md | 767px | max-width |
| md | 768px | min-width |
| lg | 1011px | max-width |
| lg | 1024px | min-width |
| 1200px | 1200px | min-width |
| xl | 1279px | max-width |
| xl | 1280px | min-width |
| 1440px | 1440px | min-width |
| 1441px | 1441px | min-width |

## Transitions & Animations

**Easing functions:** `cubic-bezier(0.72, 0, 0.12, 1)`, `cubic-bezier(0.24, 0.01, 0.36, 1)`, `cubic-bezier(0.64, 0, 0.76, 1)`

**Durations:** `0.4s`, `0.6s`, `0.3s`, `0.1s`, `0.2s`, `0.15s`

### Common Transitions

```css
transition: all;
transition: transform 0.4s cubic-bezier(0.72, 0, 0.12, 1), translate 0.4s cubic-bezier(0.72, 0, 0.12, 1), scale 0.4s cubic-bezier(0.72, 0, 0.12, 1), rotate 0.4s cubic-bezier(0.72, 0, 0.12, 1), margin 0.4s cubic-bezier(0.72, 0, 0.12, 1);
transition: transform 0.6s cubic-bezier(0.72, 0, 0.12, 1), translate 0.6s cubic-bezier(0.72, 0, 0.12, 1), scale 0.6s cubic-bezier(0.72, 0, 0.12, 1), rotate 0.6s cubic-bezier(0.72, 0, 0.12, 1), opacity 0.6s cubic-bezier(0.72, 0, 0.12, 1), color 0.6s cubic-bezier(0.72, 0, 0.12, 1), background-color 0.6s cubic-bezier(0.72, 0, 0.12, 1), border-color 0.6s cubic-bezier(0.72, 0, 0.12, 1), outline-color 0.6s cubic-bezier(0.72, 0, 0.12, 1), text-decoration-color 0.6s cubic-bezier(0.72, 0, 0.12, 1), fill 0.6s cubic-bezier(0.72, 0, 0.12, 1), stroke 0.6s cubic-bezier(0.72, 0, 0.12, 1), --tw-gradient-from 0.6s cubic-bezier(0.72, 0, 0.12, 1), --tw-gradient-via 0.6s cubic-bezier(0.72, 0, 0.12, 1), --tw-gradient-to 0.6s cubic-bezier(0.72, 0, 0.12, 1);
transition: transform 0.4s cubic-bezier(0.72, 0, 0.12, 1), translate 0.4s cubic-bezier(0.72, 0, 0.12, 1), scale 0.4s cubic-bezier(0.72, 0, 0.12, 1), rotate 0.4s cubic-bezier(0.72, 0, 0.12, 1), opacity 0.4s cubic-bezier(0.72, 0, 0.12, 1);
transition: transform 0.3s cubic-bezier(0.72, 0, 0.12, 1), translate 0.3s cubic-bezier(0.72, 0, 0.12, 1), scale 0.3s cubic-bezier(0.72, 0, 0.12, 1), rotate 0.3s cubic-bezier(0.72, 0, 0.12, 1);
transition: transform 0.4s cubic-bezier(0.72, 0, 0.12, 1);
transition: opacity 0.4s cubic-bezier(0.72, 0, 0.12, 1);
transition: transform 0.4s cubic-bezier(0.72, 0, 0.12, 1), translate 0.4s cubic-bezier(0.72, 0, 0.12, 1), scale 0.4s cubic-bezier(0.72, 0, 0.12, 1), rotate 0.4s cubic-bezier(0.72, 0, 0.12, 1);
transition: transform 0.4s cubic-bezier(0.72, 0, 0.12, 1) 0.1s, translate 0.4s cubic-bezier(0.72, 0, 0.12, 1) 0.1s, scale 0.4s cubic-bezier(0.72, 0, 0.12, 1) 0.1s, rotate 0.4s cubic-bezier(0.72, 0, 0.12, 1) 0.1s;
transition: 0.2s cubic-bezier(0.72, 0, 0.12, 1);
```

### Keyframe Animations

**_4rWgOW_slide-out-in**
```css
@keyframes _4rWgOW_slide-out-in {
  0% { transform-origin: 100% center; transform: scaleX(1); }
  50% { transform-origin: 100% center; transform: scaleX(0); }
  50.01% { transform-origin: 0px center; transform: scaleX(0); }
  100% { transform-origin: 0px center; transform: scaleX(1); }
}
```

**MfHUpW_slide-out-in**
```css
@keyframes MfHUpW_slide-out-in {
  0% { background-size: var(--underline-width) 1px; background-position: calc(100% - var(--arrow-space)) 100%; }
  50% { background-size: 0% 1px; background-position: calc(100% - var(--arrow-space)) 100%; }
  50.01% { background-position: 0px 100%; background-size: 0% 1px; }
  100% { background-size: var(--underline-width) 1px; background-position: 0px 100%; }
}
```

**_6_JPlG_gradient-shift**
```css
@keyframes _6_JPlG_gradient-shift {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
```

**_6_JPlG_chrome-gradient-shift**
```css
@keyframes _6_JPlG_chrome-gradient-shift {
  0% { background-position: 0% center; }
  100% { background-position: 400% center; }
}
```

**_6_JPlG_red-light-pulse**
```css
@keyframes _6_JPlG_red-light-pulse {
  0% { background-color: var(--raw-semantic-critical-10); }
  100% { background-color: var(--raw-semantic-critical-8); }
}
```

**R7J64a_gradient-border-pulse**
```css
@keyframes R7J64a_gradient-border-pulse {
  0% { background-position: -50% -50%; }
  50% { background-position: 150% 150%; }
  100% { background-position: -50% -50%; }
}
```

**xKxOKG_shimmer-text**
```css
@keyframes xKxOKG_shimmer-text {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

**bBHQva_shimmer-text**
```css
@keyframes bBHQva_shimmer-text {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

**QjkO4q_search-row-in**
```css
@keyframes QjkO4q_search-row-in {
  0% { opacity: 0; transform: translateY(4px) scale(0.995); }
  100% { opacity: 1; transform: none; }
}
```

**Aq7BIG_search-placeholder-roll**
```css
@keyframes Aq7BIG_search-placeholder-roll {
  0% { background-position: 100% 0px; }
  100% { background-position: 0px 0px; }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (31 instances)

```css
.buttons {
  background-color: rgb(233, 235, 223);
  color: rgb(233, 235, 223);
  font-size: 13.2308px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 3.35544e+07px;
}
```

### Cards (12 instances)

```css
.cards {
  background-color: rgb(21, 21, 21);
  border-radius: 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Inputs (1 instances)

```css
.inputs {
  color: rgb(233, 235, 223);
  border-color: rgb(203, 204, 196);
  border-radius: 0px;
  font-size: 12px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Links (89 instances)

```css
.links {
  color: rgb(233, 235, 223);
  font-size: 22.4615px;
  font-weight: 380;
}
```

### Navigation (24 instances)

```css
.navigation {
  background-color: rgb(21, 21, 21);
  color: rgb(233, 235, 223);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: relative;
}
```

### Footer (37 instances)

```css
.footer {
  background-color: rgb(21, 21, 21);
  color: rgb(203, 204, 196);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 12px;
}
```

### Modals (1 instances)

```css
.modals {
  background-color: rgb(36, 36, 36);
  border-radius: 12px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Badges (5 instances)

```css
.badges {
  color: rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Tooltips (2 instances)

```css
.tooltips {
  color: rgb(233, 235, 223);
  font-size: 16px;
  border-radius: 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Switches (1 instances)

```css
.switches {
  background-color: rgba(233, 235, 223, 0.063);
  border-radius: 6px;
  border-color: rgba(233, 235, 223, 0.063);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 8px 0px 8px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 12px;
  font-weight: 400;
```

### Button — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 4px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 13.2308px;
  font-weight: 400;
```

### Button — 4 instances, 2 variants

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(203, 204, 196);
  padding: 0px 0px 0px 0px;
  border-radius: 3.35544e+07px;
  border: 0px solid rgb(203, 204, 196);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (3 instances)

```css
  background: rgb(36, 36, 36);
  color: rgba(233, 235, 223, 0.6);
  padding: 4px 4px 4px 4px;
  border-radius: 6px;
  border: 1px solid rgba(233, 235, 223, 0.12);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(233, 235, 223, 0.063);
  color: rgb(233, 235, 223);
  padding: 2px 2px 2px 2px;
  border-radius: 6px;
  border: 1px solid rgba(233, 235, 223, 0.063);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
```

### Input — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px 0px 1px dashed rgb(203, 204, 196);
  font-size: 12px;
  font-weight: 400;
```

### Card — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgb(21, 21, 21);
  color: rgb(233, 235, 223);
  padding: 24px 24px 24px 24px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
```

### Card — 4 instances, 2 variants

**Variant 1** (2 instances)

```css
  background: rgb(36, 36, 36);
  color: rgb(233, 235, 223);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (2 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
```

### Card — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0.8);
  color: rgb(233, 235, 223);
  padding: 6px 6px 6px 6px;
  border-radius: 3.35544e+07px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
```

### Other — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 16px;
  font-weight: 400;
```

### Link — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(233, 235, 223);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px solid rgb(233, 235, 223);
  font-size: 22.4615px;
  font-weight: 380;
```

## Layout System

**16 grid containers** and **185 flex containers** detected.

### The System

- **Content column** — 1265px wide (full-bleed — no constrained container found)
  - Widest constrained block inside it: 644px
  - Width ladder: 644px · 1265px
- **Column system** — 2 columns
- **Section rhythm** — 40px vertical padding (ladder: 16px · 40px · 80px · 128px · 160px)
- **Gap scale** — 1px · 4px · 8px · 12px · 14px · 16px · 24px · 40px
- **Fluid layout** — 12 clamp/viewport declarations

```css
.VJd2Lq_globalNavigationContent { max-width: var(--dvt-site-max-width,100vw); }
.ky09dW_shimFill { width: 100vw; }
.grid-breakout { width: var(--dvt-document-width,100vw); }
.w-33vw { width: 33vw; }
.w-50vw { width: 50vw; }
.w-80vw { width: 80vw; }
```

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 2240px | 0px |
| 1440px | 0px |
| 100% | 0px |
| 672px | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 44-column | 12x |
| 30-column | 2x |
| 2-column | 1x |
| 36-column | 1x |

### Grid Templates

```css
grid-template-columns: [start-edge] 28.2031px [start-inner] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [start-third] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [center] 35.5469px 35.5469px [off-center] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [aside] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [end-inner] 28.2031px [end-edge];
grid-template-columns: [start-edge] 28.2031px [start-inner] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [start-third] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [center] 35.5469px 35.5469px [off-center] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [aside] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [end-inner] 28.2031px [end-edge];
grid-template-columns: [start-edge] 35.7031px [start-inner] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [start-third] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [center] 35.5469px 35.5469px [off-center] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [aside] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [end-inner] 35.7031px [end-edge];
grid-template-columns: subgrid [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [];
grid-template-columns: [start-edge] 35.7031px [start-inner] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [start-third] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [center] 35.5469px 35.5469px [off-center] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [aside] 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px 35.5469px [end-inner] 35.7031px [end-edge];
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 145x |
| row/wrap | 3x |
| column/nowrap | 37x |

**Gap values:** `normal 8px`, `normal 40px`, `normal 24px`, `normal 16px`, `1px`, `4px 8px`, `4px`, `8px`, `12px`, `14px`, `16px`, `24px`, `32px`, `40px`, `64px normal`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 3 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#e9ebdf` | `#242424` | 12.87:1 | AAA |
| `#151515` | `#e9ebdf` | 15.14:1 | AAA |

## Design System Score

**Overall: 95/100 (Grade: A)**

| Category | Score |
|----------|-------|
| Color Discipline | 100/100 |
| Typography Consistency | 90/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 100/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Consistent typography system, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 102 !important rules — prefer specificity over overrides
- 4060 duplicate CSS declarations

## Gradients

**1 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | 90deg | 3 | bold |

```css
background: linear-gradient(90deg, rgb(121, 51, 37) 0%, rgb(45, 76, 113) 20%, rgb(61, 22, 61) 100%);
```

## Z-Index Map

**6 unique z-index values** across 3 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 2000,3000 | header.V.J.d.2.L.q._.g.l.o.b.a.l.N.a.v.i.g.a.t.i.o.n.C.o.n.t.e.n.t. .f.i.x.e.d. .t.o.p.-.0. .z.-.n.a.v. .l.g.:.b.l.o.c.k, div.f.l.e.x. .i.t.e.m.s.-.c.e.n.t.e.r. .l.g.:.c.o.l.-.s.t.a.r.t.-.2. .l.g.:.c.o.l.-.s.p.a.n.-.4. .z.-.n.a.v. .m.i.n.-.h.-.9. .t.r.a.n.s.i.t.i.o.n.-.t.r.a.n.s.f.o.r.m.-.o.p.a.c.i.t.y. .d.u.r.a.t.i.o.n.-.4.0.0. .o.p.a.c.i.t.y.-.1.0.0. .t.r.a.n.s.f.o.r.m.-.n.o.n.e. .p.o.i.n.t.e.r.-.e.v.e.n.t.s.-.a.u.t.o, a.!.f.i.x.e.d. .t.o.p.-.4. .l.e.f.t.-.4. .z.-.m.o.d.a.l. .f.o.c.u.s.:.p.x.-.4. .f.o.c.u.s.:.p.y.-.2. .t.e.x.t.-.s.u.r.f.a.c.e.-.t.e.x.t.-.p.r.i.m.a.r.y. .b.g.-.s.u.r.f.a.c.e.-.b.a.c.k.g.r.o.u.n.d.-.f.o.c.u.s.e.d. .r.o.u.n.d.e.d.-.1.2. .b.o.r.d.e.r. .b.o.r.d.e.r.-.s.u.r.f.a.c.e.-.d.e.t.a.i.l.s.-.n.e.u.t.r.a.l.-.a.l.p.h.a.-.1.2. .s.r.-.o.n.l.y. .f.o.c.u.s.:.n.o.t.-.s.r.-.o.n.l.y. .f.o.c.u.s.-.v.i.s.i.b.l.e.:.o.u.t.l.i.n.e.-.2. .f.o.c.u.s.-.v.i.s.i.b.l.e.:.o.u.t.l.i.n.e.-.o.f.f.s.e.t.-.2. .f.o.c.u.s.-.v.i.s.i.b.l.e.:.o.u.t.l.i.n.e.-.s.u.r.f.a.c.e.-.t.e.x.t.-.p.r.i.m.a.r.y |
| sticky | 10,20 | span.r.e.l.a.t.i.v.e. .z.-.1.0. .l.e.a.d.i.n.g.-.n.o.n.e. .l.i.n.e.-.c.l.a.m.p.-.1. .p.y.-.1, span.r.e.l.a.t.i.v.e. .z.-.1.0. .l.e.a.d.i.n.g.-.n.o.n.e. .l.i.n.e.-.c.l.a.m.p.-.1. .p.y.-.1, span.r.e.l.a.t.i.v.e. .z.-.1.0. .l.e.a.d.i.n.g.-.n.o.n.e. .l.i.n.e.-.c.l.a.m.p.-.1. .p.y.-.1 |
| base | -10,0 | div.a.b.s.o.l.u.t.e. .i.n.s.e.t.-.0. .-.z.-.1.0. .o.p.a.c.i.t.y.-.0. .g.r.o.u.p.-.h.o.v.e.r.:.o.p.a.c.i.t.y.-.1.0.0. .g.r.o.u.p.-.a.c.t.i.v.e.:.o.p.a.c.i.t.y.-.1.0.0. .g.r.o.u.p.-.a.c.t.i.v.e.:.b.g.-.s.u.r.f.a.c.e.-.b.a.c.k.g.r.o.u.n.d.-.m.u.t.e.d. .g.r.o.u.p.-.h.a.s.-.[.a...a.p.p.-.g.a.l.l.e.r.y.-.c.a.r.d.-.l.i.n.k.:.f.o.c.u.s.-.v.i.s.i.b.l.e.].:.o.p.a.c.i.t.y.-.1.0.0. .t.r.a.n.s.i.t.i.o.n.-.o.p.a.c.i.t.y. .d.u.r.a.t.i.o.n.-.3.0.0. .m.o.t.i.o.n.-.r.e.d.u.c.e.:.d.u.r.a.t.i.o.n.-.0. .b.g.-.s.u.r.f.a.c.e.-.b.a.c.k.g.r.o.u.n.d.-.f.o.c.u.s.e.d, div.a.b.s.o.l.u.t.e. .i.n.s.e.t.-.0. .-.z.-.1.0. .o.p.a.c.i.t.y.-.0. .g.r.o.u.p.-.h.o.v.e.r.:.o.p.a.c.i.t.y.-.1.0.0. .g.r.o.u.p.-.a.c.t.i.v.e.:.o.p.a.c.i.t.y.-.1.0.0. .g.r.o.u.p.-.a.c.t.i.v.e.:.b.g.-.s.u.r.f.a.c.e.-.b.a.c.k.g.r.o.u.n.d.-.m.u.t.e.d. .g.r.o.u.p.-.h.a.s.-.[.a...a.p.p.-.g.a.l.l.e.r.y.-.c.a.r.d.-.l.i.n.k.:.f.o.c.u.s.-.v.i.s.i.b.l.e.].:.o.p.a.c.i.t.y.-.1.0.0. .t.r.a.n.s.i.t.i.o.n.-.o.p.a.c.i.t.y. .d.u.r.a.t.i.o.n.-.3.0.0. .m.o.t.i.o.n.-.r.e.d.u.c.e.:.d.u.r.a.t.i.o.n.-.0. .b.g.-.s.u.r.f.a.c.e.-.b.a.c.k.g.r.o.u.n.d.-.f.o.c.u.s.e.d, figure.a.b.s.o.l.u.t.e. .z.-.0. .w.-.f.u.l.l. .h.-.n.a.v.-.h.e.i.g.h.t. .t.r.a.n.s.i.t.i.o.n.-.c.o.l.o.r.s. .m.o.t.i.o.n.-.r.e.d.u.c.e.:.d.u.r.a.t.i.o.n.-.2.0.0. .o.p.a.c.i.t.y.-.0. .b.g.-.s.u.r.f.a.c.e.-.l.i.g.h.t.b.o.x.-.i.n.a.c.t.i.v.e. .t.r.a.n.s.i.t.i.o.n.-.t.r.a.n.s.f.o.r.m.-.o.p.a.c.i.t.y.-.c.o.l.o.r. .d.u.r.a.t.i.o.n.-.6.0.0 |

## SVG Icons

**13 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| xs | 4 |
| sm | 5 |
| md | 2 |
| lg | 1 |
| xl | 1 |

**Icon colors:** `currentColor`, `white`, `url(#ask-ai-icon-Rdlahacnlnb-band)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| saansFont | self-hosted | 100 900 | normal |
| pxGroteskFont | self-hosted | 400, 700 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 4 | objectFit: fill, borderRadius: 0px, shape: square |
| general | 3 | objectFit: cover, borderRadius: 0px, shape: square |
| hero | 1 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (3x), 5.12:1 (2x), 3:2 (2x), 16:9 (1x)

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `100ms` | 100 |
| `sm` | `200ms` | 200 |
| `md` | `300ms` | 300 |
| `lg` | `600ms` | 600 |

### Easing Families

- **custom** (192 uses) — `cubic-bezier(0.72, 0, 0.12, 1)`, `cubic-bezier(0.24, 0.01, 0.36, 1)`, `cubic-bezier(0.64, 0, 0.76, 1)`

## Component Anatomy

### button — 11 instances

**Slots:** label, icon
**Variants:** secondary · primary · outline
**Sizes:** md

| variant | count | sample label |
|---|---|---|
| default | 4 | BACK |
| primary | 4 |  |
| outline | 2 | Click to interact |
| secondary | 1 | Ask AI
⌘K |

### card — 8 instances

**Slots:** media, footer
**Variants:** link · outline
**Sizes:** md

| variant | count | sample label |
|---|---|---|
| link | 4 |  |
| default | 2 | FinOps application

A customer operation |
| outline | 2 |  |

### other — 2 instances


### link — 2 instances

**Variants:** link

## Brand Voice

**Tone:** neutral · **Pronoun:** you-only · **Headings:** Sentence case (tight)

### Top CTA Verbs

- **back** (1)
- **solution** (1)
- **audience** (1)
- **resources** (1)
- **ask** (1)
- **click** (1)
- **finops** (1)
- **security** (1)

### Button Copy Patterns

- "back" (1×)
- "solution" (1×)
- "audience" (1×)
- "resources" (1×)
- "ask ai
⌘k" (1×)
- "click to interact" (1×)
- "finops application" (1×)
- "security operations console" (1×)

### Sample Headings

> Logistics dispatch monitor
> App details
> Popular integrations
> Libraries
> Start from this app in your terminal
> Logistics dispatch monitor
> App details
> Popular integrations
> Libraries
> Start from this app in your terminal

## Page Intent

**Type:** `legal` (confidence 0.26)
**Description:** Explore a logistics dispatch monitor built in Retool. See active routes, stops, on-time rate, and per-route progress by driver.

Alternates: blog-post (0.35)

## Section Roles

Reading order (top→bottom): cta → steps → hero → nav → nav → testimonial → steps → feature-grid → feature-grid → footer

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | cta | — | 0.75 |
| 1 | nav | — | 0.9 |
| 2 | steps | Logistics dispatch monitor | 0.75 |
| 3 | hero | Logistics dispatch monitor | 0.85 |
| 4 | nav | — | 0.9 |
| 5 | testimonial | App details | 0.8 |
| 6 | steps | Start from this app in your terminal | 0.75 |
| 7 | feature-grid | Rapidly develop with pre-made apps | 0.8 |
| 8 | feature-grid | Build and secure your vibe‑coded apps | 0.8 |
| 9 | footer | — | 0.95 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.041 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 36px |
| backdrop-filter in use | no |
| Gradients | 1 |

## Imagery Style

**Label:** `flat-illustration` (confidence 0.229)
**Counts:** total 8, svg 5, icon 3, screenshot-like 0, photo-like 0
**Dominant aspect:** landscape
**Radius profile on images:** square

## Component Library

**Detected:** `tailwindcss` (confidence 0.598)

Evidence:
- tailwind-like class density 60%

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `saansFont` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
