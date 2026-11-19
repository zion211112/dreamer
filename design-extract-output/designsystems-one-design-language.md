# Design Language: Vercel Geist Design System | DesignSystems.one

> Extracted from `https://designsystems.one/design-systems/vercel-geist` on November 19, 2026
> 830 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#82182e` | rgb(130, 24, 46) | hsl(348, 69%, 30%) | 1 |
| Secondary | `#0070f3` | rgb(0, 112, 243) | hsl(212, 100%, 48%) | 2 |
| Accent | `#ee0000` | rgb(238, 0, 0) | hsl(0, 100%, 47%) | 1 |

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| primary | `#ffdfe3` | `#ffd1d6` | `#ffbdc3` | `#ffa0a7` | `#e67a84` | `#c75a66` | `#ab4652` | `#8e3340` | **`#82182e`** | `#621c27` | `#3b0a13` |
| secondary | `#c0f8ff` | `#aeecff` | `#96daff` | `#72c0ff` | `#439cff` | **`#0070f3`** | `#0064df` | `#004ebc` | `#003ea0` | `#003087` | `#001854` |
| accent | `#ffcfbc` | `#ffbeaa` | `#ffa691` | `#ff816d` | `#ff4e3d` | **`#ee0000`** | `#d20000` | `#b00000` | `#940000` | `#7c0000` | `#4c0000` |
| neutral | `#f7f5f2` | `#ece9e6` | `#dbd8d5` | **`#ccc8c3`** | `#a39f9a` | `#85817d` | `#6f6b67` | `#595652` | `#494643` | `#3b3835` | `#201e1c` |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#f0eae2` | `#020817` | 16.74:1 | AAA |
| `surface.raised` | `#e7f0ee` | `#020817` | 17.24:1 | AAA |
| `action.primary` | `#82182e` | `#ffffff` | 9.91:1 | AAA |
| `action.secondary` | `#0070f3` | `#ffffff` | 4.55:1 | AA |
| `action.accent` | `#ee0000` | `#ffffff` | 4.53:1 | AA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#f6f1ea` — 43%
- `#e7f0ee` — 13%
- `#0070f3` — 7%
- `#000000` — 7%
- `#ffffff` — 7%
- `#333333` — 4%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#ccc8c3` | hsl(33, 8%, 78%) | 657 |
| `#62626e` | hsl(240, 6%, 41%) | 188 |
| `#000000` | hsl(0, 0%, 0%) | 71 |
| `#ffffff` | hsl(0, 0%, 100%) | 5 |
| `#e7f0ee` | hsl(167, 23%, 92%) | 5 |
| `#333333` | hsl(0, 0%, 20%) | 1 |
| `#737373` | hsl(0, 0%, 45%) | 1 |

### Background Colors

Used on large-area elements: `#f0eae2`, `#e7f0ee`

### Text Colors

Text color palette: `#0f0f14`, `#62626e`, `#020817`, `#f6f1ea`, `#737373`, `#ffffff`, `#000000`

### Gradients

```css
background-image: linear-gradient(135deg, oklab(0.916198 -0.0186325 0.0145608) 0%, oklab(0.965398 -0.00488419 0.00717835) 55%, lab(98.833 0.667602 1.32728) 100%);
```

```css
background-image: linear-gradient(135deg, oklab(0.923399 0.0102491 0.0265405) 0%, oklab(0.967798 0.00474301 0.0111716) 55%, lab(98.833 0.667602 1.32728) 100%);
```

```css
background-image: linear-gradient(135deg, oklab(0.910797 0.00815206 -0.0214785) 0%, oklab(0.963598 0.00404399 -0.00483477) 55%, lab(98.833 0.667602 1.32728) 100%);
```

```css
background-image: linear-gradient(135deg, oklab(0.951834 0.0194831 0.0200415) 0%, oklab(0.977276 0.007821 0.00900525) 55%, lab(98.833 0.667602 1.32728) 100%);
```

```css
background-image: linear-gradient(135deg, oklab(0.919797 -0.0174934 -0.00226269) 0%, oklab(0.966598 -0.00450449 0.00157051) 55%, lab(98.833 0.667602 1.32728) 100%);
```

```css
background-image: linear-gradient(135deg, oklab(0.9267 0.0313728 0.0114449) 0%, oklab(0.968899 0.0117842 0.00613971) 55%, lab(98.833 0.667602 1.32728) 100%);
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#ccc8c3` | border | 657 |
| `#0f0f14` | text, border, background | 489 |
| `#62626e` | text, background | 188 |
| `#000000` | text, background | 71 |
| `#020817` | text, border, background | 67 |
| `#f6f1ea` | text, background | 14 |
| `#009494` | border | 6 |
| `#bb7400` | border | 5 |
| `#ffffff` | text, background | 5 |
| `#e7f0ee` | background | 5 |
| `#e05667` | border, background | 5 |
| `#6b62bf` | border | 4 |
| `#348f4f` | border | 3 |
| `#ff986b` | border | 2 |
| `#0070f3` | background | 2 |
| `#82182e` | background | 1 |
| `#333333` | background | 1 |
| `#ee0000` | background | 1 |
| `#f5a623` | background | 1 |
| `#7928ca` | background | 1 |
| `#737373` | text | 1 |

## Typography

### Font Families

- **Figtree** — used for all (219 elements)
- **Nanum Pen Script** — used for body (2 elements)

### Type System

- **Scale ratio** — 1.125 (major second), anchored at 14px · 100% of sizes sit on the ladder
- **Measure** — ~52 characters per line (comfortable)
- **Fluid type** — 1 clamp/viewport font sizes, 48px → 150px

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `h2` | 44px / 2.75rem | 600 | 52.8px | -1.54px |
| `h1` | 41.716px / 2.6073rem | 600 | 38.3787px | -1.66864px |
| `title-1` | 40px / 2.5rem | 600 | 40px | -0.32px |
| `title-2` | 36px / 2.25rem | 600 | 40px | -1.26px |
| `title-3` | 28px / 1.75rem | 600 | 28px | -0.32px |
| `title-4` | 24px / 1.5rem | 400 | 28.8px | normal |
| `title-5` | 20px / 1.25rem | 600 | 28px | -0.4px |
| `title-6` | 18px / 1.125rem | 400 | 28px | -0.32px |
| `title-7` | 16px / 1rem | 400 | 24px | normal |
| `title-8` | 15px / 0.9375rem | 500 | 22.5px | -0.15px |
| `body` | 14px / 0.875rem | 500 | 20px | -0.32px |
| `body-sm` | 13px / 0.8125rem | 600 | 19.5px | -0.13px |
| `h3` | 12px / 0.75rem | 600 | 14.4px | 0.96px |
| `micro` | 11px / 0.6875rem | 500 | 16.5px | -0.32px |
| `sm-3` | 10px / 0.625rem | 600 | 15px | -0.32px |

### Fluid Declarations

```css
.text-\[clamp\(48px\,9\.4vw\,150px\)\] { font-size: clamp(48px, 9.4vw, 150px); }
```

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 44px | 2.75rem | 600 | 52.8px | -1.54px | h2 |
| 41.716px | 2.6073rem | 600 | 38.3787px | -1.66864px | h1 |
| 40px | 2.5rem | 600 | 40px | -0.32px | span, h2 |
| 36px | 2.25rem | 600 | 40px | -1.26px | h2 |
| 28px | 1.75rem | 600 | 28px | -0.32px | span |
| 24px | 1.5rem | 400 | 28.8px | normal | p, span |
| 20px | 1.25rem | 600 | 28px | -0.4px | span, p |
| 18px | 1.125rem | 400 | 28px | -0.32px | p, span |
| 16px | 1rem | 400 | 24px | normal | html, head, meta, link |
| 15px | 0.9375rem | 500 | 22.5px | -0.15px | a, svg, path |
| 14px | 0.875rem | 500 | 20px | -0.32px | a, button, svg, path |
| 13px | 0.8125rem | 600 | 19.5px | -0.13px | a |
| 12px | 0.75rem | 600 | 14.4px | 0.96px | a, svg, path, span |
| 11px | 0.6875rem | 500 | 16.5px | -0.32px | span, p |
| 10px | 0.625rem | 600 | 15px | -0.32px | span, p |

### Heading Scale

```css
h2 { font-size: 44px; font-weight: 600; line-height: 52.8px; }
h1 { font-size: 41.716px; font-weight: 600; line-height: 38.3787px; }
h2 { font-size: 40px; font-weight: 600; line-height: 40px; }
h2 { font-size: 36px; font-weight: 600; line-height: 40px; }
h3 { font-size: 12px; font-weight: 600; line-height: 14.4px; }
```

### Body Text

```css
body { font-size: 14px; font-weight: 500; line-height: 20px; }
```

### Font Weights in Use

`400` (600x), `500` (147x), `600` (80x), `700` (3x)

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
| spacing-28 | 28px | 1.75rem |
| spacing-32 | 32px | 2rem |
| spacing-40 | 40px | 2.5rem |
| spacing-48 | 48px | 3rem |
| spacing-56 | 56px | 3.5rem |
| spacing-64 | 64px | 4rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| md | 6px | 1 |
| lg | 12px | 1 |
| lg | 16px | 17 |
| xl | 20px | 15 |
| xl | 24px | 31 |
| full | 999px | 5 |

## Elevation

2 levels from 3 raw shadows · neutral tint

**xs** — blur 4px, y 2px, used 1×
```css
box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px 0px;
```

**sm** — blur 30px, y 8px, used 1×
```css
box-shadow: rgba(0, 0, 0, 0.12) 0px 8px 30px 0px;
```

## CSS Custom Properties

### Colors

```css
--foreground: #020817;
--card: #fefbf9;
--card-foreground: #000;
--popover: #fefbf9;
--popover-foreground: #000;
--primary: #0f172a;
--primary-foreground: #fff;
--secondary: #f4f1ee;
--secondary-foreground: #000;
--muted: #f4f1ee;
--muted-foreground: #737373;
--accent: #f4f1ee;
--accent-foreground: #000;
--brand-foreground: #fff;
--destructive: #ef4444;
--destructive-foreground: #fff;
--success-foreground: #fff;
--warning-foreground: #000;
--info-foreground: #fff;
--border: #e7e4e1;
--ring: #82182e;
--chart-1: #bc3f53;
--chart-2: #b97500;
--chart-3: #009393;
--chart-4: #6b62bf;
--chart-5: #348f4f;
--chart-1-soft: #ffe8e9;
--chart-2-soft: #ffebd4;
--chart-3-soft: #d8f5f5;
--chart-4-soft: #ececff;
--chart-5-soft: #e1f5e4;
--sidebar-foreground: #000;
--sidebar-primary: #4f46e5;
--sidebar-primary-foreground: #fff;
--sidebar-accent: #f59e0b;
--sidebar-accent-foreground: #000;
--sidebar-border: #000;
--sidebar-ring: #a5b4fc;
--swiss-muted: #62626e;
--swiss-card: #fbf8f4;
--swiss-accent: var(--swiss-burgundy);
--color-amber-400: lab(80.1641% 16.6016 99.2089);
--tw-ring-shadow: 0 0 #0000;
--color-slate-200: lab(91.7353% -.998765 -4.76968);
--color-yellow-600: lab(62.7799% 22.4197 86.1544);
--color-amber-600: lab(60.3514% 40.5624 87.1228);
--tw-inset-ring-shadow: 0 0 #0000;
--color-blue-300: lab(77.5052% -6.4629 -36.42);
--color-gray-500: lab(47.7841% -.393182 -10.0268);
--color-green-500: lab(70.5521% -66.5147 45.8073);
--color-emerald-600: lab(55.0481% -49.9246 15.93);
--color-gray-50: lab(98.2596% -.247031 -.706708);
--tw-ring-offset-color: #fff;
--color-white: #fff;
--color-red-400: lab(63.7053% 60.745 31.3109);
--color-accent: lab(95.3512% .836015 1.65995);
--color-rose-400: lab(64.4125% 63.0291 19.2068);
--tw-ring-offset-width: 0px;
--color-zinc-300: lab(84.9837% .601262 -2.17986);
--color-background: lab(98.833% .667602 1.32728);
--color-indigo-600: lab(38.4009% 52.6132 -92.3857);
--color-neutral-50: lab(98.26% 0 0);
--color-info: #3c83f6;
--color-neutral-900: lab(7.78201% -.0000149012 0);
--tw-ring-offset-shadow: 0 0 #0000;
--color-neutral-100: lab(96.52% -.0000298023 .0000119209);
--color-blue-100: lab(92.0301% -2.24757 -11.6453);
--color-green-600: lab(59.0978% -58.6621 41.2579);
--color-red-300: lab(76.5514% 36.422 15.5335);
--color-amber-500: lab(72.7183% 31.8672 97.9407);
--color-warning: #f59f0a;
--color-success: #21c45d;
--color-brand: lab(28.8386% 45.2999 16.0014);
--color-rose-500: lab(56.101% 79.4328 31.4532);
--color-emerald-500: lab(66.9756% -58.27 19.5419);
--color-blue-500: lab(54.1736% 13.3369 -74.6839);
--color-gray-900: lab(8.11897% .811279 -12.254);
--color-blue-900: lab(26.1542% 15.7545 -51.5504);
--color-muted: lab(95.3512% .836015 1.65995);
--color-gray-600: lab(35.6337% -1.58697 -10.8425);
--color-blue-600: lab(44.0605% 29.0279 -86.0352);
--color-ring: lab(28.8386% 45.2999 16.0014);
--tw-border-style: solid;
--color-red-600: lab(48.4493% 77.4328 61.5452);
--color-border: lab(90.7112% .836313 1.66013);
--color-red-50: lab(96.5005% 4.18508 1.52328);
--color-primary: #0f172a;
--color-gray-200: lab(91.6229% -.159115 -2.26791);
--color-black: #000;
--color-foreground: #020817;
--color-emerald-400: lab(75.0771% -60.7313 19.4147);
--color-amber-100: lab(95.916% -1.21653 23.111);
--color-neutral-800: lab(15.204% 0 -.00000596046);
--color-yellow-500: lab(76.3898% 14.5258 98.4589);
```

### Spacing

```css
--tw-space-x-reverse: 0;
--spacing: .25rem;
--tw-space-y-reverse: 0;
```

### Typography

```css
--swiss-text: var(--swiss-ink);
--tracking-tight: -.025em;
--text-2xl: 1.5rem;
--text-7xl: 4.5rem;
--text-lg: 1.125rem;
--text-8xl--line-height: 1;
--text-5xl--line-height: 1;
--leading-normal: 1.5;
--text-base--line-height: calc(1.5/1);
--tracking-wider: .05em;
--font-mono: ui-monospace,SFMono-Regular,Menlo,Monaco,"Cascadia Mono",monospace;
--text-9xl--line-height: 1;
--text-lg--line-height: calc(1.75/1.125);
--font-sans: ;
--font-weight-bold: 700;
--text-6xl: 3.75rem;
--text-xs--line-height: calc(1/.75);
--default-font-family: ;
--text-7xl--line-height: 1;
--text-xl: 1.25rem;
--leading-relaxed: 1.625;
--leading-snug: 1.375;
--text-9xl: 8rem;
--tracking-tighter: -.05em;
--font-weight-black: 900;
--text-2xl--line-height: calc(2/1.5);
--text-8xl: 6rem;
--tracking-wide: .025em;
--text-xl--line-height: calc(1.75/1.25);
--font-weight-semibold: 600;
--text-sm: .875rem;
--leading-tight: 1.25;
--text-4xl: 2.25rem;
--tracking-normal: 0em;
--text-sm--line-height: calc(1.25/.875);
--text-3xl--line-height: calc(2.25/1.875);
--text-5xl: 3rem;
--text-xs: .75rem;
--text-3xl: 1.875rem;
--tracking-widest: .1em;
--font-weight-medium: 500;
--font-weight-normal: 400;
--text-6xl--line-height: 1;
--text-4xl--line-height: calc(2.5/2.25);
--text-base: 1rem;
--default-mono-font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,"Cascadia Mono",monospace;
```

### Shadows

```css
--tw-inset-shadow-alpha: 100%;
--tw-drop-shadow-alpha: 100%;
--tw-inset-shadow: 0 0 #0000;
--tw-shadow-alpha: 100%;
--tw-shadow: 0 0 #0000;
```

### Radii

```css
--radius: .25rem;
--radius-2xl: 1rem;
--radius-md: calc(.25rem - 2px);
--radius-lg: .25rem;
--radius-full: calc(infinity*1px);
--radius-xl: calc(.25rem + 4px);
```

### Other

```css
--background: #fefbf9;
--brand: #82182e;
--brand-soft: #ffeded;
--success: #21c45d;
--warning: #f59f0a;
--info: #3c83f6;
--input: #e7e4e1;
--sidebar: #fafafa;
--swiss-paper: #f6f1ea;
--swiss-ink: #0f0f14;
--swiss-slate: #686874;
--swiss-burgundy: #82182e;
--swiss-coral: #e05667;
--swiss-peach: #ff986b;
--swiss-surface: var(--background);
--swiss-fill: #f0eae2;
--swiss-line: var(--swiss-ink);
--swiss-rule: var(--swiss-ink);
--swiss-shape-ink: var(--swiss-ink);
--swiss-shape-paper: var(--swiss-paper);
--swiss-depth-start: var(--swiss-ink);
--page-pad: 1rem;
--tone-coral: #e05667;
--tone-peach: #ff986b;
--tone-burgundy: #82182e;
--tone-amber: #b97500;
--tone-teal: #009393;
--tone-violet: #6b62bf;
--tone-green: #348f4f;
--verdict-avoid: #b42318;
--verdict-prefer: #067647;
--verdict-warning: #b54708;
--verdict-ink: #fefbf9;
--container-md: 28rem;
--aspect-video: 16/9;
--tw-animation-delay: 0s;
--tw-outline-style: solid;
--ease-in: cubic-bezier(.4,0,1,1);
--tw-animation-direction: normal;
--tw-enter-scale: 1;
--tw-divide-x-reverse: 0;
--tw-gradient-from: rgba(0, 0, 0, 0);
--tw-gradient-to: rgba(0, 0, 0, 0);
--blur-3xl: 64px;
--tw-exit-rotate: 0;
--tw-scale-z: 1;
--blur-2xl: 40px;
--container-sm: 24rem;
--tw-exit-translate-y: 0;
--tw-gradient-via-position: 50%;
--container-lg: 32rem;
--tw-gradient-to-position: 100%;
--default-transition-duration: .15s;
--animate-pulse: pulse 2s cubic-bezier(.4,0,.6,1)infinite;
--container-xs: 20rem;
--tw-gradient-from-position: 0%;
--ease-in-out: cubic-bezier(.4,0,.2,1);
--main-col: calc((min(100vw - 2*2rem,100vw) - 3.5rem)*.5455);
--default-transition-timing-function: cubic-bezier(.4,0,.2,1);
--tw-animation-iteration-count: 1;
--tw-exit-opacity: 1;
--tw-animation-fill-mode: none;
--container-5xl: 64rem;
--tw-exit-blur: 0;
--tw-translate-z: 0;
--tw-gradient-via: rgba(0, 0, 0, 0);
--tw-scale-y: 1;
--container-6xl: 72rem;
--breakpoint-lg: 64rem;
--tw-exit-translate-x: 0;
--container-3xl: 48rem;
--tw-translate-y: 0;
--blur-md: 12px;
--ease-out: cubic-bezier(0,0,.2,1);
--tw-enter-translate-x: 0;
--container-4xl: 56rem;
--tw-content: "";
--tw-divide-y-reverse: 0;
--breakpoint-md: 48rem;
--container-2xl: 42rem;
--tw-exit-scale: 1;
--tw-translate-x: 0;
--tw-enter-rotate: 0;
--tw-enter-translate-y: 0;
--tw-scale-x: 1;
--tw-enter-blur: 0;
--breakpoint-sm: 40rem;
--container-xl: 36rem;
--tw-enter-opacity: 1;
--container-7xl: 80rem;
--blur-sm: 8px;
```

### Dependencies

```css
0: --background;
0: --swiss-ink;
0: --swiss-ink;
0: --swiss-ink;
0: --swiss-burgundy;
0: --swiss-ink;
0: --swiss-paper;
0: --swiss-ink;
```

### Semantic

```css
--success: #21c45d;
--success-foreground: #fff;
--tone-green: #348f4f;
--color-green-500: lab(70.5521% -66.5147 45.8073);
--color-green-600: lab(59.0978% -58.6621 41.2579);
--color-success: #21c45d;
--warning: #f59f0a;
--warning-foreground: #000;
--tone-amber: #b97500;
--verdict-warning: #b54708;
--color-amber-400: lab(80.1641% 16.6016 99.2089);
--color-yellow-600: lab(62.7799% 22.4197 86.1544);
--color-amber-600: lab(60.3514% 40.5624 87.1228);
--color-amber-500: lab(72.7183% 31.8672 97.9407);
--color-warning: #f59f0a;
--color-amber-100: lab(95.916% -1.21653 23.111);
--color-yellow-500: lab(76.3898% 14.5258 98.4589);
--destructive: #ef4444;
--destructive-foreground: #fff;
--color-red-400: lab(63.7053% 60.745 31.3109);
--color-red-300: lab(76.5514% 36.422 15.5335);
--color-red-600: lab(48.4493% 77.4328 61.5452);
--color-red-50: lab(96.5005% 4.18508 1.52328);
--info: #3c83f6;
--info-foreground: #fff;
--color-blue-300: lab(77.5052% -6.4629 -36.42);
--color-info: #3c83f6;
--color-blue-100: lab(92.0301% -2.24757 -11.6453);
--color-blue-500: lab(54.1736% 13.3369 -74.6839);
--color-blue-900: lab(26.1542% 15.7545 -51.5504);
--color-blue-600: lab(44.0605% 29.0279 -86.0352);
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| sm | 640px | min-width |
| lg | 1024px | min-width |
| xl | 1280px | min-width |
| 1680px | 1680px | min-width |

## Transitions & Animations

**Easing functions:** `cubic-bezier(0.4, 0, 0.2, 1)`, `cubic-bezier(0, 0, 0.2, 1)`, `cubic-bezier(0.25, 1, 0.5, 1)`

**Durations:** `0.2s`, `0.15s`, `0.16s`

### Common Transitions

```css
transition: all;
transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), outline-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), fill 0.15s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.15s cubic-bezier(0.4, 0, 0.2, 1), --tw-gradient-from 0.15s cubic-bezier(0.4, 0, 0.2, 1), --tw-gradient-via 0.15s cubic-bezier(0.4, 0, 0.2, 1), --tw-gradient-to 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transition: color 0.2s cubic-bezier(0, 0, 0.2, 1), background-color 0.2s cubic-bezier(0, 0, 0.2, 1), border-color 0.2s cubic-bezier(0, 0, 0.2, 1), opacity 0.2s cubic-bezier(0, 0, 0.2, 1), transform 0.2s cubic-bezier(0, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0, 0, 0.2, 1);
transition: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transition: background-color 0.16s cubic-bezier(0.25, 1, 0.5, 1);
transition: color 0.16s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.16s cubic-bezier(0.25, 1, 0.5, 1);
transition: color 0.16s, text-decoration-color 0.16s;
transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), translate 0.15s cubic-bezier(0.4, 0, 0.2, 1), scale 0.15s cubic-bezier(0.4, 0, 0.2, 1), rotate 0.15s cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

**fade-in-up**
```css
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0px); }
}
```

**hero-fly-in**
```css
@keyframes hero-fly-in {
  0% { translate: var(--fx,0)var(--fy,0); opacity: 0; }
  100% { opacity: 1; translate: 0px; }
}
```

**hero-float**
```css
@keyframes hero-float {
  0%, 100% { transform: translate(0px) rotate(0deg); }
  50% { transform: translate3d(var(--dx,0),var(--dy,0),0)rotate(var(--dr,0deg)); }
}
```

**swiss-dash**
```css
@keyframes swiss-dash {
  100% { stroke-dashoffset: -18px; }
}
```

**pulse**
```css
@keyframes pulse {
  50% { opacity: 0.5; }
}
```

**enter**
```css
@keyframes enter {
  0% { opacity: var(--tw-enter-opacity,1); transform: translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0)scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1))rotate(var(--tw-enter-rotate,0)); filter: blur(var(--tw-enter-blur,0)); }
}
```

**exit**
```css
@keyframes exit {
  100% { opacity: var(--tw-exit-opacity,1); transform: translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0)scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1))rotate(var(--tw-exit-rotate,0)); filter: blur(var(--tw-exit-blur,0)); }
}
```

**accordion-down**
```css
@keyframes accordion-down {
  0% { height: 0px; }
  100% { height: var(--radix-accordion-content-height,var(--bits-accordion-content-height,var(--reka-accordion-content-height,var(--kb-accordion-content-height,var(--ngp-accordion-content-height,auto))))); }
}
```

**accordion-up**
```css
@keyframes accordion-up {
  0% { height: var(--radix-accordion-content-height,var(--bits-accordion-content-height,var(--reka-accordion-content-height,var(--kb-accordion-content-height,var(--ngp-accordion-content-height,auto))))); }
  100% { height: 0px; }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (11 instances)

```css
.buttons {
  background-color: lab(98.833 0.667602 1.32728);
  color: rgb(15, 15, 20);
  font-size: 14px;
  font-weight: 500;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 3.35544e+07px;
}
```

### Cards (3 instances)

```css
.cards {
  background-color: lab(98.833 0.667602 1.32728);
  border-radius: 18px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Links (74 instances)

```css
.links {
  color: rgb(98, 98, 110);
  font-size: 14px;
  font-weight: 400;
}
```

### Navigation (2 instances)

```css
.navigation {
  color: rgb(15, 15, 20);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: static;
}
```

### Footer (1 instances)

```css
.footer {
  color: rgb(15, 15, 20);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 16px;
}
```

### Modals (1 instances)

```css
.modals {
  background-color: lab(98.833 0.667602 1.32728);
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px;
  padding-top: 20px;
  padding-right: 20px;
  max-width: 448px;
}
```

### Dropdowns (1 instances)

```css
.dropdowns {
  border-radius: 0px;
  border-color: oklab(0.833802 0.0025683 0.00721433);
  padding-top: 0px;
}
```

### Tabs (2 instances)

```css
.tabs {
  background-color: rgb(15, 15, 20);
  color: lab(98.833 0.667602 1.32728);
  font-size: 12px;
  font-weight: 500;
  padding-top: 4px;
  padding-right: 12px;
  border-color: oklab(0.833802 0.0025683 0.00721433);
  border-radius: 3.35544e+07px;
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: lab(98.833 0.667602 1.32728);
  color: rgb(98, 98, 110);
  padding: 0px 0px 0px 0px;
  border-radius: 3.35544e+07px;
  border: 1px solid oklab(0.833802 0.0025683 0.00721433);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(15, 15, 20);
  padding: 0px 0px 0px 0px;
  border-radius: 3.35544e+07px;
  border: 0px solid oklab(0.833802 0.0025683 0.00721433);
  font-size: 14px;
  font-weight: 500;
```

### Button — 4 instances, 1 variant

**Variant 1** (4 instances)

```css
  background: rgb(15, 15, 20);
  color: lab(98.833 0.667602 1.32728);
  padding: 4px 12px 4px 12px;
  border-radius: 3.35544e+07px;
  border: 0px solid oklab(0.833802 0.0025683 0.00721433);
  font-size: 12px;
  font-weight: 500;
```

## Layout System

**13 grid containers** and **124 flex containers** detected.

### The System

- **Content column** — 373px wide
  - Width ladder: 373px · 448px · 672px · 896px
- **Column system** — 2 columns
- **Section rhythm** — 24px vertical padding (ladder: 16px · 20px · 24px · 48px · 64px)
- **Gap scale** — 4px · 6px · 8px · 10px · 12px · 16px · 32px · 40px
- **Fluid layout** — 4 clamp/viewport declarations

```css
.w-\[92vw\] { width: 92vw; }
.w-\[calc\(100vw-var\(--ds-space-8\)\)\] { width: calc(100vw - var(--ds-space-8)); }
.w-screen { width: 100vw; }
.max-w-\[100vw\] { max-width: 100vw; }
```

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 100% | 0px |
| 448px | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 3-column | 6x |
| 2-column | 5x |
| 4-column | 1x |
| 5-column | 1x |

### Grid Templates

```css
grid-template-columns: 373.328px 746.672px;
gap: 64px;
grid-template-columns: 576px 576px;
gap: 32px;
grid-template-columns: 540px 564px;
gap: 80px;
grid-template-columns: 287px 287px 287px 287px;
gap: 12px;
grid-template-columns: 384px 384px 384px;
gap: 16px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 91x |
| column/nowrap | 20x |
| row/wrap | 13x |

**Gap values:** `4px`, `6px`, `8px`, `8px 24px`, `10px`, `12px`, `16px`, `32px`, `40px 32px`, `40px`, `56px`, `64px`, `80px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 10 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#f6f1ea` | `#0f0f14` | 17.01:1 | AAA |
| `#f6f1ea` | `#82182e` | 8.82:1 | AAA |

## Design System Score

**Overall: 92/100 (Grade: A)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 82/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 100/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 7 !important rules — prefer specificity over overrides
- 2697 duplicate CSS declarations

## Gradients

**6 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | 135deg | 3 | bold |
| linear | 135deg | 3 | bold |
| linear | 135deg | 3 | bold |
| linear | 135deg | 3 | bold |
| linear | 135deg | 3 | bold |
| linear | 135deg | 3 | bold |

```css
background: linear-gradient(135deg, oklab(0.916198 -0.0186325 0.0145608) 0%, oklab(0.965398 -0.00488419 0.00717835) 55%, lab(98.833 0.667602 1.32728) 100%);
background: linear-gradient(135deg, oklab(0.923399 0.0102491 0.0265405) 0%, oklab(0.967798 0.00474301 0.0111716) 55%, lab(98.833 0.667602 1.32728) 100%);
background: linear-gradient(135deg, oklab(0.910797 0.00815206 -0.0214785) 0%, oklab(0.963598 0.00404399 -0.00483477) 55%, lab(98.833 0.667602 1.32728) 100%);
background: linear-gradient(135deg, oklab(0.951834 0.0194831 0.0200415) 0%, oklab(0.977276 0.007821 0.00900525) 55%, lab(98.833 0.667602 1.32728) 100%);
background: linear-gradient(135deg, oklab(0.919797 -0.0174934 -0.00226269) 0%, oklab(0.966598 -0.00450449 0.00157051) 55%, lab(98.833 0.667602 1.32728) 100%);
```

## Z-Index Map

**2 unique z-index values** across 1 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| sticky | 50,60 | header.s.t.i.c.k.y. .t.o.p.-.0. .z.-.5.0. .w.-.f.u.l.l. .t.r.a.n.s.i.t.i.o.n.-.a.l.l. .d.u.r.a.t.i.o.n.-.2.0.0. .b.g.-.b.a.c.k.g.r.o.u.n.d, div.f.i.x.e.d. .i.n.s.e.t.-.x.-.4. .b.o.t.t.o.m.-.4. .z.-.[.6.0.]. .m.x.-.a.u.t.o. .m.a.x.-.w.-.m.d. .r.o.u.n.d.e.d.-.l.g. .b.o.r.d.e.r. .b.o.r.d.e.r.-.b.o.r.d.e.r. .b.g.-.b.a.c.k.g.r.o.u.n.d. .p.-.5. .s.h.a.d.o.w.-.x.l. .m.d.:.i.n.s.e.t.-.x.-.a.u.t.o. .m.d.:.r.i.g.h.t.-.6. .m.d.:.b.o.t.t.o.m.-.6 |

## SVG Icons

**15 unique SVG icons** detected. Dominant style: **outlined**.

| Size Class | Count |
|------------|-------|
| xs | 3 |
| sm | 9 |
| md | 3 |

**Icon colors:** `currentColor`, `rgb(0, 0, 0)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Space Grotesk | self-hosted | 300, 400, 500, 600, 700 | normal |
| Figtree | self-hosted | 300, 400, 500, 600, 700 | normal |
| Inter | self-hosted | 400, 500, 600, 700 | normal |
| Nanum Pen Script | self-hosted | 400 | normal |
| Clash Display | self-hosted | 500, 600, 700 | normal |
| Satoshi | self-hosted | 400, 500, 700 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 1 | objectFit: fill, borderRadius: 0px, shape: square |
| general | 1 | objectFit: fill, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (1x), 3:2 (1x)

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `150ms` | 150 |
| `sm` | `160ms` | 160 |

### Easing Families

- **custom** (82 uses) — `cubic-bezier(0.4, 0, 0.2, 1)`
- **ease-out** (10 uses) — `cubic-bezier(0, 0, 0.2, 1)`, `cubic-bezier(0.25, 1, 0.5, 1)`

## Component Anatomy

### button — 8 instances

**Slots:** label, icon
**Variants:** outline
**Sizes:** md · sm · xs · medium

| variant | count | sample label |
|---|---|---|
| default | 5 | design.md |
| outline | 3 | Toggle theme |

## Brand Voice

**Tone:** neutral · **Pronoun:** you-only · **Headings:** Sentence case (tight)

### Top CTA Verbs

- **toggle** (1)
- **design** (1)
- **tokens** (1)
- **copy** (1)
- **download** (1)
- **decline** (1)
- **accept** (1)

### Button Copy Patterns

- "toggle theme" (1×)
- "design.md" (1×)
- "tokens.css" (1×)
- "copy" (1×)
- "download design.md" (1×)
- "decline" (1×)
- "accept" (1×)

### Sample Headings

> Vercel Geist Design System
> origin
> governance
> what it’s known for, what’s underrated, what to watch out for.
> KNOWN FOR
> UNDERRATED
> WATCH OUT FOR
> token snapshot
> token structure
> PALETTE

## Page Intent

**Type:** `blog-post` (confidence 0.48)
**Description:** The dev-tooling design system that helped redefine premium developer surfaces.

Alternates: landing (0.3)

## Section Roles

Reading order (top→bottom): nav → nav → testimonial → testimonial → testimonial → testimonial → testimonial → testimonial → content → testimonial → testimonial → content → content → footer → nav

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | nav | — | 0.4 |
| 1 | nav | — | 0.9 |
| 2 | testimonial | Vercel Geist Design System | 0.8 |
| 3 | testimonial | — | 0.8 |
| 4 | testimonial | — | 0.8 |
| 5 | testimonial | origin | 0.8 |
| 6 | testimonial | what it’s known for, what’s underrated, what to watch out for. | 0.8 |
| 7 | testimonial | token snapshot | 0.8 |
| 8 | content | token structure | 0.3 |
| 9 | testimonial | the file, before you download it | 0.8 |
| 10 | testimonial | components worth studying | 0.8 |
| 11 | content | — | 0.3 |
| 12 | content | more design systems. | 0.3 |
| 13 | footer | — | 0.95 |
| 14 | nav | — | 0.9 |

## Material Language

**Label:** `material-you` (confidence 0.45)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.486 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 999px |
| backdrop-filter in use | no |
| Gradients | 6 |

## Imagery Style

**Label:** `icon-only` (confidence 0.6)
**Counts:** total 2, svg 1, icon 2, screenshot-like 0, photo-like 0
**Dominant aspect:** square-ish
**Radius profile on images:** square

## Component Library

**Detected:** `shadcn/ui` (confidence 0.65)

Evidence:
- shadcn css tokens

Also considered: tailwindcss (0.3)

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Figtree` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
