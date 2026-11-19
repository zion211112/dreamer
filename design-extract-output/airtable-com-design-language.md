# Design Language: Airtable: What's new - Airtable

> Extracted from `https://airtable.com/embed/appL2oaKxSWg9qz8y/shrQ0LMjBK4Sq8JHC` on November 19, 2026
> 1601 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#166ee1` | rgb(22, 110, 225) | hsl(214, 82%, 48%) | 2 |
| Secondary | `#88dbff` | rgb(136, 219, 255) | hsl(198, 100%, 77%) | 3 |
| Accent | `#a0c6ff` | rgb(160, 198, 255) | hsl(216, 100%, 81%) | 4 |

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| primary | `#c5f8ff` | `#b4ecff` | `#9ddbff` | `#7bc1ff` | `#4f9eff` | `#2a7ef2` | **`#166ee1`** | `#0051b2` | `#004197` | `#00337f` | `#001a4e` |
| secondary | `#cefeff` | `#bef3ff` | **`#88dbff`** | `#87cbe9` | `#5cabcc` | `#388dae` | `#227695` | `#0e5f7b` | `#014e67` | `#003f54` | `#002332` |
| accent | `#e0f7ff` | `#d2ecff` | `#bedbff` | **`#a0c6ff`** | `#7ea1d6` | `#6083b8` | `#4c6d9e` | `#3a5783` | `#2d476d` | `#23395a` | `#101f36` |
| neutral | `#f2f6fd` | `#e6eaf2` | `#d5d9e2` | `#bcc0ca` | `#9ba0aa` | `#7d828d` | **`#616670`** | `#52575f` | `#43474e` | `#35393f` | `#1d1f23` |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#ffffff` | `#1d1f25` | 16.47:1 | AAA |
| `surface.raised` | `#f2f4f8` | `#1d1f25` | 14.96:1 | AAA |
| `action.primary` | `#166ee1` | `#ffffff` | 4.83:1 | AA |
| `action.secondary` | `#88dbff` | `#1d1f25` | 10.69:1 | AAA |
| `action.accent` | `#a0c6ff` | `#1d1f25` | 9.42:1 | AAA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#ffffff` — 73%
- `#f2f4f8` — 25%
- `#41454d` — 0%
- `#616670` — 0%
- `#cff5d1` — 0%
- `#c4c7cd` — 0%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#ffffff` | hsl(0, 0%, 100%) | 434 |
| `#616670` | hsl(220, 7%, 41%) | 42 |
| `#000000` | hsl(0, 0%, 0%) | 39 |
| `#c4c7cd` | hsl(220, 8%, 79%) | 31 |
| `#41454d` | hsl(220, 8%, 28%) | 24 |
| `#808080` | hsl(0, 0%, 50%) | 2 |
| `#aaaaaa` | hsl(0, 0%, 67%) | 1 |
| `#dde1e3` | hsl(200, 10%, 88%) | 1 |

### Background Colors

Used on large-area elements: `#ffffff`, `#f2f4f8`

### Text Colors

Text color palette: `#1d1f25`, `#ffffff`, `#616670`, `#c4c7cd`, `#808080`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#1d1f25` | text, border, background | 2753 |
| `#ffffff` | background, text, border | 434 |
| `#616670` | text, border, background | 42 |
| `#000000` | border, background | 39 |
| `#c4c7cd` | text, border, background | 31 |
| `#f2f4f8` | background | 27 |
| `#41454d` | background | 24 |
| `#e5e9f0` | background | 21 |
| `#cff5d1` | background | 11 |
| `#bfaefc` | background | 7 |
| `#9ae095` | background | 4 |
| `#a0c6ff` | background | 4 |
| `#88dbff` | background | 3 |
| `#f797ef` | background | 3 |
| `#d1e2ff` | background | 2 |
| `#ffeab6` | background | 2 |
| `#166ee1` | background, border | 2 |
| `#808080` | text, border | 2 |
| `#74ebe1` | background | 1 |
| `#aaaaaa` | background | 1 |
| `#dde1e3` | border | 1 |

## Typography

### Font Families

- **Inter Display** — used for headings (24 elements)

### Type System

- **Scale ratio** — 1.125 (major second), anchored at 12.8px · 100% of sizes sit on the ladder
- **Measure** — ~61 characters per line (comfortable, low confidence from 1 sample)
- **Fluid type** — none; sizes are fixed per breakpoint

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `h2` | 24px / 1.5rem | 400 | 30px | normal |
| `h3` | 17px / 1.0625rem | 675 | 25.5px | -0.16px |
| `title-1` | 16px / 1rem | 400 | normal | normal |
| `title-2` | 15px / 0.9375rem | 400 | 18.75px | normal |
| `title-3` | 14px / 0.875rem | 400 | 17.5px | normal |
| `body` | 13px / 0.8125rem | 500 | 19.5px | normal |
| `body-sm` | 12.8px / 0.8rem | 400 | 16px | normal |
| `micro` | 11px / 0.6875rem | 400 | 13.75px | normal |

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 24px | 1.5rem | 400 | 30px | normal | h2, svg, use, span |
| 17px | 1.0625rem | 675 | 25.5px | -0.16px | h3 |
| 16px | 1rem | 400 | normal | normal | html, head, meta, title |
| 15px | 0.9375rem | 400 | 18.75px | normal | span |
| 14px | 0.875rem | 400 | 17.5px | normal | div |
| 13px | 0.8125rem | 500 | 19.5px | normal | span, div, p, button |
| 12.8px | 0.8rem | 400 | 16px | normal | body, div, main, svg |
| 11px | 0.6875rem | 400 | 13.75px | normal | div, a, svg, use |

### Heading Scale

```css
h2 { font-size: 24px; font-weight: 400; line-height: 30px; }
h3 { font-size: 17px; font-weight: 675; line-height: 25.5px; }
```

### Body Text

```css
body { font-size: 13px; font-weight: 500; line-height: 19.5px; }
```

### Font Weights in Use

`400` (1574x), `675` (24x), `500` (2x), `600` (1x)

## Spacing

**Base unit:** 4px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-4 | 4px | 0.25rem |
| spacing-8 | 8px | 0.5rem |
| spacing-12 | 12px | 0.75rem |
| spacing-16 | 16px | 1rem |
| spacing-24 | 24px | 1.5rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| xs | 2px | 2 |
| md | 6px | 54 |
| md | 10px | 1 |
| full | 9999px | 143 |

## Elevation

2 levels from 6 raw shadows · neutral tint

**xs** — blur 0px, y 1px, used 1×
```css
box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 0px 0px;
```

**sm** — blur 4px, y 2px, used 25× · 3 layers
```css
box-shadow: rgba(0, 0, 0, 0.24) 0px 0px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px, rgba(0, 0, 0, 0.08) 0px 2px 4px 0px;
```

## Inset Shadows

```css
box-shadow: rgba(0, 0, 0, 0) 4px 0px 0px 0px inset;
```

## CSS Custom Properties

### Colors

```css
--colors-hyperlink-default: rgb(29, 31, 37);
--colors-background-raised-surface-hover: rgb(255, 255, 255);
--colors-foreground-accent-success: rgb(0, 100, 0);
--colors-background-switch-track: rgb(145, 149, 156);
--colors-background-notice: rgb(255, 246, 221);
--colors-background-default: rgb(255, 255, 255);
--colors-background-selected: rgba(0, 0, 0, 0.05);
--colors-background-informational: rgb(241, 245, 255);
--colors-foreground-subtler: rgb(145, 149, 156);
--colors-background-raised-control: rgb(255, 255, 255);
--colors-border-success: rgb(0, 100, 0);
--colors-border-focus: rgb(22, 110, 225);
--colors-hyperlink-primary-hover: rgb(13, 82, 172);
--colors-background-checked-control: rgb(22, 110, 225);
--colors-background-workflow-find-records: rgb(255, 236, 227);
--colors-hyperlink-primary: rgb(22, 110, 225);
--colors-foreground-subtle: rgb(97, 102, 112);
--colors-foreground-subtlest: rgb(196, 199, 205);
--colors-border-emphasis: rgb(145, 149, 156);
--colors-background-switch-handle: rgb(255, 255, 255);
--colors-foreground-accent-informational: rgb(13, 82, 172);
--colors-foreground-accent-notice: rgb(175, 96, 2);
--cell-borderColor: hsl(202, 10%, 88%);
--pane-borderColor-separator: #cccccc;
--colors-background-raised-popover: rgb(255, 255, 255);
--colors-background-subtler: rgb(246, 248, 252);
--colors-background-success: rgb(230, 252, 232);
--colors-border-subtle: rgba(0, 0, 0, 0.05);
--colors-foreground-default: rgb(29, 31, 37);
--colors-foreground-accent-negative: rgb(177, 15, 65);
--colors-background-raised-surface: rgb(255, 255, 255);
--colors-background-inset-surface: rgb(255, 255, 255);
--colors-background-translucent: rgba(255, 255, 255, 0.1);
--colors-background-raised-control-hover: rgb(229, 233, 240);
--colors-background-selected-blue: rgba(22, 110, 225, 0.05);
--cell-borderColor-header: hsl(0, 0%, 82%);
--colors-background-primary-control: rgb(22, 110, 225);
--colors-border-subtler: rgb(145, 149, 156);
--colors-border-negative: rgb(177, 15, 65);
--colors-foreground-accent-ai: rgb(171, 10, 131);
--cell-borderColor-cursor: rgb(22, 110, 225);
--colors-background-inset-control-hover: rgb(229, 233, 240);
--colors-background-inset-control: rgb(242, 244, 248);
--colors-background-selected-blue-hover: rgba(22, 110, 225, 0.1);
--colors-foreground-accent-workflow-custom-script: rgb(98, 49, 174);
--colors-background-negative: rgb(255, 242, 250);
--colors-background-subtle: rgb(242, 244, 248);
--colors-background-modal-backdrop: rgba(0, 0, 0, 0.25);
--colors-border-focus-emphasis: rgb(13, 82, 172);
--colors-hyperlink-subtle: rgb(97, 102, 112);
--colors-border-default: rgba(0, 0, 0, 0.1);
--colors-foreground-accent-workflow-find-records: rgb(170, 45, 0);
--colors-background-primary-control-emphasis: rgb(13, 82, 172);
--colors-background-workflow-custom-script: rgb(252, 243, 255);
```

### Spacing

```css
--font-size-heading-xxsmall: 13px;
--font-size-heading-xxxlarge: 35px;
--font-size-heading-small: 17px;
--spacing-2-and-half: 1.5rem;
--spacing-3: 2rem;
--spacing-1-and-three-quarters: 0.875rem;
--font-size-heading-default: 21px;
--spacing-1-and-half: 0.75rem;
--spacing-quarter: 0.125rem;
--spacing-3-and-quarter: 2.5rem;
--spacing-2-and-three-quarters: 1.75rem;
--spacing-5: 8rem;
--font-size-body-xsmall: 9px;
--spacing-3-and-half: 3rem;
--spacing-4: 4rem;
--spacing-1: 0.5rem;
--spacing-three-quarters: 0.375rem;
--spacing-0: 0;
--font-size-body-small: 11px;
--spacing-1-and-quarter: 0.625rem;
--spacing-2: 1rem;
--font-size-body-default: 13px;
--font-size-heading-large: 23px;
--spacing-2-and-quarter: 1.25rem;
--font-size-heading-xlarge: 27px;
--font-size-heading-xxlarge: 31px;
--font-size-body-large: 15px;
--font-size-heading-xsmall: 15px;
--spacing-half: 0.25rem;
```

### Typography

```css
--font-family-body: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol';
--font-family-heading-legacy: 'GT Eesti Display', -apple-system, system-ui, BlinkMacSystemFont,
        'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
--font-family-mono: 'IBM Plex Mono', Menlo, Courier, monospace;
--font-family-heading: 'Inter Display', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol';
--strongFontWeightWithGeckoFallback: 500;
```

### Radii

```css
--radius-round-big: 6px;
--radius-round-huge: 12px;
--radius-round-default: 3px;
```

### Other

```css
--cell-background-header: #f4f4f4;
--cell-background-fillCandidate-foundCursor: #f0c965;
--mainNavHeight: 79px;
--palette-red-redDusty: rgb(153, 69, 90);
--palette-opacity-darken3: rgba(0, 0, 0, 0.25);
--elevation-medium-right: 0px 0px 1px 0px rgba(0, 0, 0, 0.24),
        0px 0px 2px 0px rgba(0, 0, 0, 0.08), 2px 0px 4px 0px rgba(0, 0, 0, 0.08);
--palette-gray-gray700: rgb(49, 53, 62);
--palette-opacity-lighten1: rgba(255, 255, 255, 0.05);
--palette-green-greenLight2: rgb(207, 245, 209);
--palette-blue-blueDusty: rgb(59, 102, 163);
--palette-cyan-cyan: rgb(57, 202, 255);
--motion-decelerate-default: cubic-bezier(0, 0, 0, 1) 250ms;
--motion-accelerate-fast: cubic-bezier(0.4, 0, 1, 1) 100ms;
--palette-purple-purpleLight1: rgb(191, 174, 252);
--motion-decelerate-slow: cubic-bezier(0, 0, 0, 1) 800ms;
--palette-cyan-cyanLight1: rgb(136, 219, 255);
--palette-pink-pinkDark1: rgb(171, 10, 131);
--palette-gray-gray300: rgb(196, 199, 205);
--cell-background-selected: #f1f6ff;
--palette-green-greenLight1: rgb(154, 224, 149);
--palette-purple-purple: rgb(124, 55, 239);
--palette-yellow-yellowLight3: rgb(255, 246, 221);
--elevation-low: 0px 0px 1px rgba(0, 0, 0, 0.32), 0px 0px 2px rgba(0, 0, 0, 0.08),
        0px 1px 3px rgba(0, 0, 0, 0.08);
--palette-neutral-quiet: rgb(97, 102, 112);
--palette-gray-grayDusty: rgb(83, 89, 101);
--palette-purple-purpleDusty: rgb(99, 73, 141);
--palette-yellow-yellowLight1: rgb(255, 214, 107);
--palette-red-redLight1: rgb(255, 166, 193);
--palette-neutral-lightGray2: rgb(242, 244, 248);
--palette-gray-gray100: rgb(229, 233, 240);
--palette-neutral-quietest: rgb(196, 199, 205);
--palette-neutral-quieter: rgb(145, 149, 156);
--cell-background-foundCursor-selected: #f1cf6b;
--palette-purple-purpleLight3: rgb(252, 243, 255);
--palette-green-greenDusty: rgb(64, 124, 74);
--palette-opacity-darken5: rgba(0, 0, 0, 0.6);
--cell-background-searchMatch: #ffd66b;
--palette-green-greenLight3: rgb(230, 252, 232);
--palette-teal-teal: rgb(1, 221, 213);
--palette-opacity-lighten2-tinted: rgba(195, 212, 249, 0.18);
--palette-neutral-trueBlack: rgb(0, 0, 0);
--motion-standard-slow: cubic-bezier(0.2, 0.1, 0.2, 1) 1000ms;
--palette-red-red: rgb(220, 4, 59);
--palette-gray-gray500: rgb(97, 102, 112);
--palette-neutral-lightGray1: rgb(246, 248, 252);
--palette-neutral-dark: rgb(49, 53, 62);
--palette-blue-blueLight3: rgb(241, 245, 255);
--cell-background-ghost-row-number-hover: hsl(200, 18%, 95%);
--palette-orange-orangeLight1: rgb(255, 182, 142);
--cell-background-rightPane-header: hsla(0, 0%, 100%, 0.5);
--palette-pink-pink: rgb(221, 4, 168);
--palette-blue-blueLight1: rgb(160, 198, 255);
--elevation-low-subtle: 0px 0px 2px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0, 0, 0, 0.08);
--palette-neutral-lightGray3: rgb(229, 233, 240);
--motion-standard-default: cubic-bezier(0.2, 0.1, 0.2, 1) 300ms;
--palette-gray-gray50: rgb(246, 248, 252);
--motion-accelerate-slow: cubic-bezier(0.4, 0, 1, 1) 700ms;
--palette-gray-gray75: rgb(242, 244, 248);
--elevation-low-hover: 0px 0px 1px rgba(0, 0, 0, 0.32), 0px 0px 3px rgba(0, 0, 0, 0.11),
        0px 1px 4px rgba(0, 0, 0, 0.12);
--palette-cyan-cyanLight2: rgb(196, 236, 255);
--palette-blue-blue: rgb(22, 110, 225);
--cell-background-leftPane-header: #f2f2f2;
--palette-red-redLight2: rgb(255, 212, 224);
--palette-orange-orangeDusty: rgb(148, 77, 55);
--palette-yellow-yellow: rgb(255, 186, 5);
--mainNavWidth: 702px;
--palette-opacity-lighten2: rgba(255, 255, 255, 0.1);
--cell-background-header-selected: #e7edf6;
--palette-neutral-lightGray4: rgb(218, 222, 230);
--motion-decelerate-fast: cubic-bezier(0, 0, 0, 1) 100ms;
--palette-gray-gray25: rgb(249, 250, 251);
--row-background-cursor: #f8f8f8;
--palette-opacity-darken2: rgba(0, 0, 0, 0.1);
--palette-gray-gray600: rgb(65, 69, 77);
--palette-cyan-cyanDark1: rgb(15, 104, 162);
--motion-standard-fast: cubic-bezier(0.2, 0.1, 0.2, 1) 150ms;
--palette-purple-purpleLight2: rgb(224, 218, 253);
--palette-pink-pinkDusty: rgb(140, 63, 120);
--palette-orange-orange: rgb(213, 68, 1);
--palette-orange-orangeDark1: rgb(170, 45, 0);
--palette-orange-orangeLight2: rgb(255, 224, 204);
--palette-gray-gray200: rgb(218, 222, 230);
--cell-background-foundCursor: #ffd66b;
--palette-opacity-lighten4: rgba(255, 255, 255, 0.5);
--cell-background-found: #fff3d3;
--palette-teal-tealLight3: rgb(228, 251, 251);
--palette-teal-tealDark1: rgb(23, 114, 110);
--palette-yellow-yellowDark1: rgb(175, 96, 2);
--palette-pink-pinkLight3: rgb(255, 241, 255);
--cell-background-found-selected: #f1ebd3;
--cell-background-fillCandidate: #f0f0f0;
--palette-green-green: rgb(4, 138, 14);
--motion-linear-default: cubic-bezier(0, 0, 1, 1) 1000ms;
--motion-accelerate-medium: cubic-bezier(0.4, 0, 1, 1) 300ms;
--palette-teal-tealLight2: rgb(193, 245, 240);
--palette-gray-gray900: rgb(17, 18, 21);
--palette-teal-tealLight1: rgb(116, 235, 225);
--elevation-medium: 0px 0px 1px 0px rgba(0, 0, 0, 0.24), 0px 0px 2px 0px rgba(0, 0, 0, 0.08),
        0px 2px 4px 0px rgba(0, 0, 0, 0.08);
--palette-pink-pinkLight2: rgb(250, 210, 252);
--palette-cyan-cyanDusty: rgb(16, 125, 163);
--cell-background-row-number-hover: hsl(200, 18%, 95%);
--palette-cyan-cyanLight3: rgb(227, 250, 253);
--motion-linear-slow: cubic-bezier(0, 0, 1, 1) 5000ms;
--palette-neutral-white: rgb(255, 255, 255);
--palette-teal-tealDusty: rgb(13, 127, 120);
--cell-background-base: rgb(255, 255, 255);
--palette-neutral-black: rgb(29, 31, 37);
--palette-gray-gray400: rgb(145, 149, 156);
--palette-red-redDark1: rgb(177, 15, 65);
--palette-gray-gray800: rgb(29, 31, 37);
--palette-opacity-lighten3-tinted: rgba(221, 230, 252, 0.26);
--palette-red-redLight3: rgb(255, 242, 250);
--palette-yellow-yellowDusty: rgb(162, 104, 17);
--cell-background-fillCandidate-found: #f0e4c6;
--palette-opacity-darken4: rgba(0, 0, 0, 0.5);
--palette-opacity-lighten3: rgba(255, 255, 255, 0.25);
--elevation-medium-hover: 0px 0px 1px 0px rgba(0, 0, 0, 0.48),
        0px 0px 2px 0px rgba(0, 0, 0, 0.08), 0px 2px 4px 0px rgba(0, 0, 0, 0.12),
        0px 2px 8px 0px rgba(0, 0, 0, 0.08);
--palette-yellow-yellowLight2: rgb(255, 234, 182);
--palette-blue-blueDark1: rgb(13, 82, 172);
--motion-accelerate-default: cubic-bezier(0.4, 0, 1, 1) 200ms;
--motion-standard-medium: cubic-bezier(0.2, 0.1, 0.2, 1) 500ms;
--palette-pink-pinkLight1: rgb(247, 151, 239);
--palette-opacity-darken1: rgba(0, 0, 0, 0.05);
--palette-green-greenDark1: rgb(0, 100, 0);
--palette-orange-orangeLight3: rgb(255, 236, 227);
--palette-blue-blueLight2: rgb(209, 226, 255);
--motion-linear-medium: cubic-bezier(0, 0, 1, 1) 2000ms;
--motion-decelerate-medium: cubic-bezier(0, 0, 0, 1) 400ms;
--palette-purple-purpleDark1: rgb(98, 49, 174);
--elevation-high: 0px 0px 1px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.16),
        0px 3px 4px rgba(0, 0, 0, 0.06), 0px 6px 8px rgba(0, 0, 0, 0.06),
        0px 12px 16px rgba(0, 0, 0, 0.08), 0px 18px 32px rgba(0, 0, 0, 0.06);
```

### Semantic

```css
--colors-foreground-accent-success: rgb(0, 100, 0);
--palette-green-greenLight2: rgb(207, 245, 209);
--palette-green-greenLight1: rgb(154, 224, 149);
--colors-border-success: rgb(0, 100, 0);
--palette-green-greenDusty: rgb(64, 124, 74);
--palette-green-greenLight3: rgb(230, 252, 232);
--colors-background-success: rgb(230, 252, 232);
--palette-green-green: rgb(4, 138, 14);
--palette-green-greenDark1: rgb(0, 100, 0);
--palette-yellow-yellowLight3: rgb(255, 246, 221);
--palette-yellow-yellowLight1: rgb(255, 214, 107);
--palette-yellow-yellow: rgb(255, 186, 5);
--palette-yellow-yellowDark1: rgb(175, 96, 2);
--palette-yellow-yellowDusty: rgb(162, 104, 17);
--palette-yellow-yellowLight2: rgb(255, 234, 182);
--palette-red-redDusty: rgb(153, 69, 90);
--palette-red-redLight1: rgb(255, 166, 193);
--palette-red-red: rgb(220, 4, 59);
--palette-red-redLight2: rgb(255, 212, 224);
--colors-foreground-accent-negative: rgb(177, 15, 65);
--colors-border-negative: rgb(177, 15, 65);
--colors-background-negative: rgb(255, 242, 250);
--palette-red-redDark1: rgb(177, 15, 65);
--palette-red-redLight3: rgb(255, 242, 250);
--palette-blue-blueDusty: rgb(59, 102, 163);
--colors-background-notice: rgb(255, 246, 221);
--colors-background-informational: rgb(241, 245, 255);
--palette-blue-blueLight3: rgb(241, 245, 255);
--palette-blue-blueLight1: rgb(160, 198, 255);
--colors-foreground-accent-informational: rgb(13, 82, 172);
--colors-foreground-accent-notice: rgb(175, 96, 2);
--palette-blue-blue: rgb(22, 110, 225);
--colors-background-selected-blue: rgba(22, 110, 225, 0.05);
--colors-background-selected-blue-hover: rgba(22, 110, 225, 0.1);
--palette-blue-blueDark1: rgb(13, 82, 172);
--palette-blue-blueLight2: rgb(209, 226, 255);
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| 0px | 0px | min-width |
| xs | 360px | min-width |
| sm | 500px | max-width |
| sm | 540px | min-width |
| sm | 600px | max-width |
| sm | 601px | min-width |
| sm | 640px | min-width |
| sm | 650px | max-width |
| sm | 680px | max-width |
| md | 736px | max-width |
| md | 760px | max-width |
| md | 768px | min-width |
| md | 800px | max-width |
| md | 820px | min-width |
| md | 832px | max-width |
| 870px | 870px | max-width |
| 900px | 900px | max-width |
| 928px | 928px | max-width |
| lg | 992px | min-width |
| lg | 1024px | min-width |
| lg | 1056px | max-width |
| 1152px | 1152px | min-width |
| 1178px | 1178px | max-width |
| 1200px | 1200px | max-width |
| xl | 1280px | max-width |
| xl | 1325px | max-width |
| 1399px | 1399px | max-width |
| 1400px | 1400px | max-width |
| 1407px | 1407px | max-width |
| 2xl | 1500px | max-width |
| 1664px | 1664px | min-width |
| 1675px | 1675px | max-width |

## Transitions & Animations

**Easing functions:** `ease`

**Durations:** `0.3s`, `0.2s`, `0.1s`, `0.085s`

### Common Transitions

```css
transition: all;
transition: height 0.3s ease-in-out, width 0.3s ease-in-out, transform 0.3s ease-in-out, margin 0.3s ease-in-out;
transition: width 0.3s ease-out;
transition: opacity 0.2s ease-out 0.1s;
transition: 0.085s ease-in;
transition: opacity 0.2s ease-in-out;
transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
transition: opacity 0.2s ease-out 0.2s;
transition: bottom 0.2s ease-out;
```

### Keyframe Animations

**bloom-in-inner-ring**
```css
@keyframes bloom-in-inner-ring {
  0% { rotate: -5.45455deg; scale: 0.95; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { rotate: 0deg; scale: 1; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-inner-ring**
```css
@keyframes bloom-in-inner-ring {
  0% { rotate: -5.45455deg; scale: 0.95; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { rotate: 0deg; scale: 1; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-inner-bit**
```css
@keyframes bloom-in-inner-bit {
  0% { color: var(--omni-color-subtlest); opacity: var(--omni-opacity-subtlest); scale: 0; translate: 0px 32px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { color: var(--omni-color-subtlest); opacity: var(--omni-opacity-subtlest); scale: 1; translate: 0px 32px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-inner-bit**
```css
@keyframes bloom-in-inner-bit {
  0% { color: var(--omni-color-subtlest); opacity: var(--omni-opacity-subtlest); scale: 0; translate: 0px 32px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { color: var(--omni-color-subtlest); opacity: var(--omni-opacity-subtlest); scale: 1; translate: 0px 32px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-middle-ring**
```css
@keyframes bloom-in-middle-ring {
  0% { rotate: 5.45455deg; scale: 0.95; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { rotate: 16.3636deg; scale: 1; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-middle-ring**
```css
@keyframes bloom-in-middle-ring {
  0% { rotate: 5.45455deg; scale: 0.95; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { rotate: 16.3636deg; scale: 1; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-middle-bit**
```css
@keyframes bloom-in-middle-bit {
  0% { color: var(--omni-color-subtle); opacity: var(--omni-opacity-subtle); scale: 0; translate: 0px 16px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { color: var(--omni-color-subtle); opacity: var(--omni-opacity-subtle); scale: 1; translate: 0px 16px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-middle-bit**
```css
@keyframes bloom-in-middle-bit {
  0% { color: var(--omni-color-subtle); opacity: var(--omni-opacity-subtle); scale: 0; translate: 0px 16px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { color: var(--omni-color-subtle); opacity: var(--omni-opacity-subtle); scale: 1; translate: 0px 16px; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-outer-ring**
```css
@keyframes bloom-in-outer-ring {
  0% { rotate: 16.3636deg; scale: 0.95; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { rotate: 32.7273deg; scale: 1; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

**bloom-in-outer-ring**
```css
@keyframes bloom-in-outer-ring {
  0% { rotate: 16.3636deg; scale: 0.95; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
  100% { rotate: 32.7273deg; scale: 1; animation-timing-function: cubic-bezier(0.17, 0.04, 0, 1); }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (32 instances)

```css
.buttons {
  background-color: rgb(255, 255, 255);
  color: rgb(29, 31, 37);
  font-size: 12.8px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Cards (25 instances)

```css
.cards {
  background-color: rgb(255, 255, 255);
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 0px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px, rgba(0, 0, 0, 0.08) 0px 2px 4px 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Inputs (1 instances)

```css
.inputs {
  color: rgb(29, 31, 37);
  border-radius: 2px;
  font-size: 13px;
  padding-top: 4px;
  padding-right: 0px;
}
```

### Links (2 instances)

```css
.links {
  color: rgb(29, 31, 37);
  font-size: 12.8px;
  font-weight: 400;
}
```

### Navigation (9 instances)

```css
.navigation {
  background-color: rgb(242, 242, 242);
  color: rgb(29, 31, 37);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: absolute;
}
```

### Modals (8 instances)

```css
.modals {
  border-radius: 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Dropdowns (3 instances)

```css
.dropdowns {
  border-radius: 0px;
  border-color: rgb(29, 31, 37);
  padding-top: 0px;
}
```

### Badges (133 instances)

```css
.badges {
  background-color: rgb(196, 199, 205);
  color: rgb(29, 31, 37);
  font-size: 13px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 10px;
  border-radius: 9999px;
}
```

### Tooltips (1 instances)

```css
.tooltips {
  background-color: rgb(255, 255, 255);
  color: rgb(128, 128, 128);
  font-size: 14px;
  border-radius: 0px;
  padding-top: 4px;
  padding-right: 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 0px 1px;
}
```

### Switches (1 instances)

```css
.switches {
  border-radius: 0px;
  border-color: rgb(29, 31, 37);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgb(255, 255, 255);
  color: rgb(29, 31, 37);
  padding: 0px 0px 0px 8px;
  border-radius: 6px;
  border: 0px none rgb(29, 31, 37);
  font-size: 13px;
  font-weight: 400;
```

### Button — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(29, 31, 37);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(29, 31, 37);
  font-size: 13px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(29, 31, 37);
  padding: 0px 8px 0px 8px;
  border-radius: 6px;
  border: 0px none rgb(29, 31, 37);
  font-size: 13px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(29, 31, 37);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(29, 31, 37);
  font-size: 13px;
  font-weight: 400;
```

## Layout System

**0 grid containers** and **496 flex containers** detected.

### The System

- **Content column** — 1236px wide
- **Section rhythm** — 16px vertical padding (ladder: 16px)
- **Gap scale** — 4px · 8px · 12px
- **Fluid layout** — 12 clamp/viewport declarations

```css
/* … */ { width: 100vw; }
/* … */ { width: calc(50vw); }
/* … */ { width: 100vw; }
/* … */ { max-width: min(24rem,100vw); }
/* … */ { max-width: min(32rem,100vw); }
/* … */ { max-width: min(48rem,100vw); }
```

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 1236px | 0px |

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 417x |
| column/nowrap | 6x |
| row/wrap | 72x |
| row-reverse/nowrap | 1x |

**Gap values:** `normal 12px`, `4px`, `8px`, `12px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 0 passing, 0 failing color pairs

## Design System Score

**Overall: 91/100 (Grade: A)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 90/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 90/100 |
| Border Radius Consistency | 100/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Consistent typography system, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 526 !important rules — prefer specificity over overrides
- 98% of CSS is unused — consider purging
- 14892 duplicate CSS declarations

## Z-Index Map

**8 unique z-index values** across 2 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| dropdown | 100,100 | i.n.o.e.v.e.n.t.s. .f.l.e.x. .i.t.e.m.s.-.c.e.n.t.e.r |
| base | 0,7 | div, div.d.a.t.a.R.i.g.h.t.P.a.n.e. .p.a.n.e. .n.o.-.e.v.e.n.t.s.-.w.h.e.n.-.c.e.l.l.-.s.e.l.e.c.t.i.o.n.-.d.i.s.a.b.l.e.d, div.f.l.e.x. .i.t.e.m.s.-.c.e.n.t.e.r. .j.u.s.t.i.f.y.-.c.e.n.t.e.r. .c.o.l.o.r.s.-.b.a.c.k.g.r.o.u.n.d.-.d.e.f.a.u.l.t. .d.a.r.k.-.m.o.d.e.-.d.a.r.k.e.n.-.a.p.p.-.c.o.l.o.r. .a.b.s.o.l.u.t.e. .l.e.f.t.-.0. .z.1. .c.s.s.-.1.9.p.i.v.k.t |

## SVG Icons

**7 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| sm | 6 |
| xl | 1 |

**Icon colors:** `currentColor`, `rgb(0, 0, 0)`, `var(--palette-neutral-white)`, `var(--colors-foreground-default)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| fontcustom | self-hosted | 400 | normal |
| ios7-style-font-icons | self-hosted | 400 | normal |
| IBM Plex Mono | self-hosted | 100 700 | normal |
| Inter Display | self-hosted | 400 675 | normal |
| GT Eesti Display | self-hosted | 400, 500, 700 | normal |
| HaasDisplay | self-hosted | 300 700 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| general | 24 | objectFit: fill, borderRadius: 0px, shape: square |

**Aspect ratios:** 4:3 (23x), 3:2 (1x)

## Motion Language

**Feel:** smooth · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `85ms` | 85 |
| `sm` | `200ms` | 200 |
| `md` | `300ms` | 300 |

### Easing Families

- **ease-in-out** (33 uses) — `ease`

## Component Anatomy

### button — 6 instances

**Slots:** label, icon
**Variants:** outline
**Sizes:** small

| variant | count | sample label |
|---|---|---|
| outline | 3 | Available on
Available on |
| default | 3 | Available on
Available on |

## Brand Voice

**Tone:** formal · **Pronoun:** third-person · **Headings:** Title Case (balanced)

### Top CTA Verbs

- **available** (2)
- **release** (2)
- **gallery** (2)

### Button Copy Patterns

- "available on
available on" (2×)
- "release month
release month" (2×)
- "gallery" (2×)

### Sample Headings

> Airtable
-
What's new
> Airtable Canvas
> Create Linked Records in Forms
> Full-page custom interfaces on iOS and Android
> Core Product Update: Nov '26

## Page Intent

**Type:** `blog-post` (confidence 0.35)
**Description:** Airtable is a low-code platform for building collaborative apps. Customize your workflow, collaborate, and achieve ambitious outcomes. Get started for free.

## Section Roles

Reading order (top→bottom): feature-grid

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | feature-grid | Airtable
-
What's new | 0.8 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.217 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 9999px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Imagery Style

**Label:** `mixed` (confidence 0)
**Counts:** total 24, svg 0, icon 0, screenshot-like 0, photo-like 0
**Dominant aspect:** square-ish
**Radius profile on images:** square

## Component Library

**Detected:** `tailwindcss` (confidence 0.351)

Evidence:
- tailwind-like class density 39%

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Inter Display` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
