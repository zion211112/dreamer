# Design Language: posthog/packages/quill at master · PostHog/posthog · GitHub

> Extracted from `https://github.com/PostHog/posthog/tree/master/packages/quill` on November 19, 2026
> 3963 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#0969da` | rgb(9, 105, 218) | hsl(212, 92%, 45%) | 124 |
| Secondary | `#9a6700` | rgb(154, 103, 0) | hsl(40, 100%, 30%) | 8 |

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| primary | `#c5f8ff` | `#b4edff` | `#9cdbff` | `#7ac1ff` | `#4e9eff` | `#287ef1` | **`#0969da`** | `#0051b1` | `#004196` | `#00337e` | `#001b4e` |
| secondary | `#fff0c2` | `#ffe3b0` | `#fbd298` | `#e6b775` | `#c89548` | `#aa7620` | **`#9a6700`** | `#774c00` | `#633d00` | `#523100` | `#301900` |
| neutral | `#f2f6fa` | `#e6eaef` | `#d5d9df` | `#bcc1c6` | `#9ba0a6` | `#7e8289` | `#686d72` | `#53575c` | `#43474b` | `#36393d` | **`#1f2328`** |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#ffffff` | `#1f2328` | 15.8:1 | AAA |
| `surface.raised` | `#0d1117` | `#ffffff` | 18.92:1 | AAA |
| `action.primary` | `#0969da` | `#ffffff` | 5.19:1 | AA |
| `action.secondary` | `#9a6700` | `#ffffff` | 4.87:1 | AA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#ffffff` — 91%
- `#000000` — 7%
- `#818b98` — 2%
- `#0d1117` — 0%
- `#d1d9e0` — 0%
- `#0969da` — 0%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#1f2328` | hsl(213, 13%, 14%) | 4458 |
| `#59636e` | hsl(211, 11%, 39%) | 1515 |
| `#ffffff` | hsl(0, 0%, 100%) | 873 |
| `#a4aea6` | hsl(132, 6%, 66%) | 149 |
| `#818b98` | hsl(214, 10%, 55%) | 130 |
| `#d1d9e0` | hsl(208, 19%, 85%) | 108 |
| `#000000` | hsl(0, 0%, 0%) | 13 |
| `#545454` | hsl(0, 0%, 33%) | 8 |
| `#f0f6fc` | hsl(210, 67%, 96%) | 2 |
| `#353d37` | hsl(135, 7%, 22%) | 2 |
| `#7c8980` | hsl(138, 5%, 51%) | 1 |

### Background Colors

Used on large-area elements: `#ffffff`, `#0d1117`, `#000000`, `#f6f8fa`

### Text Colors

Text color palette: `#1f2328`, `#59636e`, `#a4aea6`, `#ffffff`, `#0a3069`, `#953800`, `#cf222e`, `#0969da`, `#0550ae`, `#6639ba`

### Gradients

```css
background-image: linear-gradient(rgb(255, 248, 197), rgb(255, 248, 197));
```

```css
background-image: linear-gradient(rgb(255, 235, 233), rgb(255, 235, 233));
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#1f2328` | text, border, background | 4458 |
| `#59636e` | text, border, background | 1515 |
| `#ffffff` | background, text, border | 873 |
| `#54aeff` | text, border | 340 |
| `#a4aea6` | text, border | 149 |
| `#818b98` | background | 130 |
| `#0969da` | background, text, border | 124 |
| `#d1d9e0` | background, border | 108 |
| `#0550ae` | text, border | 106 |
| `#1a7f37` | text, border | 72 |
| `#cf222e` | text, border | 64 |
| `#953800` | text, border | 52 |
| `#0a3069` | text, border | 48 |
| `#000000` | background, text, border | 13 |
| `#23ea57` | text, border | 8 |
| `#9a6700` | text, border | 8 |
| `#6639ba` | text, border | 8 |
| `#545454` | text, border | 8 |
| `#f0f6fc` | text, border | 2 |
| `#353d37` | border | 2 |
| `#0d1117` | background | 1 |
| `#7c8980` | background | 1 |
| `#d4a72c` | border | 1 |
| `#ff8182` | border | 1 |

## Typography

### Font Families

- **Mona Sans VF** — used for all (434 elements)
- **Mona Sans** — used for all (70 elements)
- **Mona Sans Mono** — used for mono (16 elements)

### Type System

- **Scale ratio** — 1.125 (major second), anchored at 11px · 100% of sizes sit on the ladder
- **Measure** — ~108 characters per line (wide)
- **Fluid type** — none; sizes are fixed per breakpoint

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `h2` | 32px / 2rem | 600 | 48px | normal |
| `title-1` | 24px / 1.5rem | 600 | 36px | normal |
| `h3` | 20px / 1.25rem | 600 | 25px | normal |
| `title-2` | 16px / 1rem | 400 | normal | normal |
| `body` | 14px / 0.875rem | 400 | 21px | normal |
| `body-sm` | 13.6px / 0.85rem | 400 | 20.4px | normal |
| `micro` | 12px / 0.75rem | 400 | 19.5px | normal |
| `sm-3` | 11px / 0.6875rem | 400 | 10px | 0.21px |

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 32px | 2rem | 600 | 48px | normal | h2, h3, h1 |
| 24px | 1.5rem | 600 | 36px | normal | h2 |
| 20px | 1.25rem | 600 | 25px | normal | h3, code |
| 16px | 1rem | 400 | normal | normal | html, head, style, meta |
| 14px | 0.875rem | 400 | 21px | normal | body, div, a, span |
| 13.6px | 0.85rem | 400 | 20.4px | normal | code, pre, span |
| 12px | 0.75rem | 400 | 19.5px | normal | tool-tip, style, slot, span |
| 11px | 0.6875rem | 400 | 10px | 0.21px | kbd, span |

### Heading Scale

```css
h2 { font-size: 32px; font-weight: 600; line-height: 48px; }
h2 { font-size: 24px; font-weight: 600; line-height: 36px; }
h3 { font-size: 20px; font-weight: 600; line-height: 25px; }
h2 { font-size: 16px; font-weight: 400; line-height: normal; }
h2 { font-size: 14px; font-weight: 400; line-height: 21px; }
```

### Body Text

```css
body { font-size: 14px; font-weight: 400; line-height: 21px; }
```

### Font Weights in Use

`400` (3547x), `500` (315x), `600` (95x), `700` (6x)

## Spacing

| Token | Value | Rem |
|-------|-------|-----|
| spacing-2 | 2px | 0.125rem |
| spacing-3 | 3px | 0.1875rem |
| spacing-4 | 4px | 0.25rem |
| spacing-5 | 5px | 0.3125rem |
| spacing-6 | 6px | 0.375rem |
| spacing-7 | 7px | 0.4375rem |
| spacing-8 | 8px | 0.5rem |
| spacing-10 | 10px | 0.625rem |
| spacing-12 | 12px | 0.75rem |
| spacing-13 | 13px | 0.8125rem |
| spacing-16 | 16px | 1rem |
| spacing-20 | 20px | 1.25rem |
| spacing-24 | 24px | 1.5rem |
| spacing-32 | 32px | 2rem |
| spacing-40 | 40px | 2.5rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| sm | 3px | 1 |
| md | 6px | 480 |
| xl | 20px | 3 |
| xl | 24px | 5 |
| full | 50px | 3 |

## Elevation

1 levels from 6 raw shadows · colored tint

**xs** — blur 0px, y 1px, used 4× · tinted (hue 213°)
```css
box-shadow: rgba(31, 35, 40, 0.04) 0px 1px 0px 0px;
```

## Inset Shadows

```css
box-shadow: rgb(25, 31, 27) 0px -1px 0px 0px inset;
```

```css
box-shadow: rgb(209, 217, 224) 0px -1px 0px 0px inset;
```

```css
box-shadow: rgba(209, 217, 224, 0.7) 0px -1px 0px 0px inset;
```

```css
box-shadow: rgba(31, 35, 40, 0.04) 0px 1px 0px 0px inset;
```

## CSS Custom Properties

### Colors

```css
--borderWidth-thick: .125rem;
--borderWidth-thicker: .25rem;
--borderWidth-thin: .0625rem;
--borderWidth-default: var(--borderWidth-thin);
--borderRadius-full: 624.938rem;
--borderRadius-large: .75rem;
--borderRadius-medium: .375rem;
--borderRadius-small: .1875rem;
--borderRadius-default: var(--borderRadius-medium);
--overlay-borderRadius: .375rem;
--zIndex-popover: 500;
--diffBlob-hunkNum-bgColor-rest: #b6e3ff;
--data-yellow-color-emphasis: #b88700;
--brand-Label-color-green-blue-start: #08872b;
--base-color-scale-teal-9: #052b2c;
--control-danger-fgColor-hover: #d1242f;
--button-danger-borderColor-rest: #d1d9e0;
--display-orange-borderColor-emphasis: #b8500f;
--data-coral-color-muted: #ffe5db;
--progressBar-bgColor-neutral: #59636e;
--brand-Tabs-list-borderWidth-active: max(1px, .0625rem);
--brand-TextCursorAnimation-cursor-deleteColor: #3094ff;
--brand-Icon-color-lemon: #a98906;
--brand-Eyebrowbanner-fgColor-green-blue-end: #0377ff;
--header-borderColor-divider: #818b98;
--brand-videoPlayer-title-fgColor: #f2f5f3;
--label-orange-fgColor-hover: #8d3c11;
--brand-videoPlayer-playButton-bgColor-rest: #0377ff;
--brand-Testimonial-quote-color-default: #000;
--base-color-scale-yellow-1: #ffe777;
--label-gray-fgColor-hover: #4e535a;
--button-danger-borderColor-active: #1f232826;
--label-gray-bgColor-rest: #e8ecf2;
--bgColor-white: #fff;
--controlKnob-borderColor-rest: #d1d9e0;
--brand-Eyebrowbanner-fgColor-purple-red-end: #cf2230;
--brand-color-text-emphasized: #08872b;
--label-yellow-borderColor: #fff0;
--bgColor-open-emphasis: #1f883d;
--brand-Accordion-toggle-color-end: #0d6731;
--bgColor-neutral-emphasis: #59636e;
--base-color-scale-pink-5: #ef2aa4;
--brand-FeatureComparisonTable-refreshIndicator-fgColor: #8534f3;
--color-prettylights-syntax-markup-ignored-text: #d1d9e0;
--brand-LogoSuite-color-control-hover: #e4ebe6;
--fgColor-white: #fff;
--label-red-fgColor-active: #880c27;
--brand-Label-color-yellow: #be7d00;
--brand-VideoPlayer-range-borderRadius: .1875rem;
--brand-Label-color-teal: #197b7b;
--display-plum-borderColor-muted: #f0cdfe;
--button-outline-bgColor-hover: #0969da;
--bgColor-draft-muted: #818b981f;
--display-plum-fgColor: #961edc;
--label-orange-bgColor-rest: #ffe7d1;
--contribution-winter-bgColor-4: #0a3069;
--brand-Eyebrowbanner-fgColor-default-end: #cf2230;
--base-color-scale-lime-3: #d1f441;
--color-project-gradient-in: #fff;
--brand-Eyebrowbanner-fgColor-blue-purple-end: #8534f3;
--control-transparent-bgColor-disabled: #eff2f5;
--diffBlob-expander-iconColor: #59636e;
--brand-Label-color-orange: #b85b06;
--button-danger-bgColor-active: #a40e26;
--controlKnob-borderColor-disabled: #eff2f5;
--label-teal-fgColor-hover: #0d5b63;
--button-outline-borderColor-active: #1f232826;
--fgColor-onEmphasis: #fff;
--control-borderColor-selected: #f6f8fa;
--base-color-scale-yellow-3: #fabf21;
--brand-control-color-fg-disabled: #b6bfb8;
--codeMirror-matchingBracket-fgColor: #1f2328;
--bgColor-success-emphasis: #1f883d;
--base-color-scale-gray-3: #c4ccc6;
--control-transparent-bgColor-selected: #818b9826;
--control-checked-bgColor-active: #0757ba;
--display-green-bgColor-emphasis: #2c8141;
--buttonKeybindingHint-primary-borderColor-disabled: #818b981a;
--border-muted: .0625rem solid #d1d9e0b3;
--brand-Accordion-toggle-color-red: #cf2230;
--label-pink-borderColor: #fff0;
--display-auburn-borderColor-muted: #e6d6d5;
--base-color-scale-orange-3: #f08a3a;
--label-olive-borderColor: #fff0;
--base-color-scale-teal-8: #083d3d;
--codeMirror-syntax-fgColor-support: #0550ae;
--border-done-emphasis: .0625rem solid #8250df;
--brand-PricingOptions-item-bgColor-gradient-start: #f2f5f3;
--display-lime-fgColor: #476c28;
--brand-LogoSuite-color-control-rest: #f9fbf9;
--base-color-scale-pink-1: #ffc9f2;
--display-lemon-bgColor-emphasis: #866e04;
--diffBlob-additionWord-fgColor: #1f2328;
--codeMirror-selection-bgColor: #54aeff66;
--base-color-scale-pink-8: #651643;
--brand-FeatureComparisonTable-label-accentColor: #08872b;
--border-success-muted: .0625rem solid #4ac26b66;
--label-purple-fgColor-rest: #783ae4;
--control-checked-fgColor-rest: #fff;
--controlTrack-bgColor-disabled: #818b98;
--brand-Label-color-lime: #92c219;
--brand-borderInset-thick: inset 0 0 0 max(2px, .125rem);
--brand-Eyebrowbanner-fgColor-pink-blue-end: #0377ff;
--label-olive-bgColor-rest: #f0f0ad;
--codeMirror-syntax-fgColor-keyword: #cf222e;
--buttonKeybindingHint-default-fgColor-disabled: #818b98;
--base-color-scale-teal-2: #6ee5dc;
--controlKnob-bgColor-checked: #fff;
--brand-Eyebrowbanner-fgColor-default-start: #8534f3;
--label-orange-borderColor: #fff0;
--data-orange-color-emphasis: #eb670f;
--avatar-bgColor: #fff;
--display-orange-fgColor: #a24610;
--label-cyan-borderColor: #fff0;
--fgColor-black: #1f2328;
--label-olive-bgColor-hover: #dbe170;
--color-ansi-white-bright: #818b98;
--display-blue-bgColor-muted: #d1f0ff;
--brand-Label-color-purple: #8534f3;
--display-orange-bgColor-emphasis: #b8500f;
--diffBlob-deletionNum-bgColor: #ffcecb;
--base-color-scale-green-3: #5fed83;
--base-color-scale-pink-2: #f67ed2;
--base-color-scale-lemon-5: #a98906;
--base-color-scale-blue-6: #0055d5;
--button-primary-borderColor-active: #1f232826;
--overlay-bgColor: #fff;
--brand-Accordion-toggle-color-lemon: #a98906;
--brand-button-subtle-fgColor-rest: #000;
--button-invisible-fgColor-active: #25292e;
--button-danger-iconColor-hover: #fff;
--label-lime-fgColor-hover: #3a5b25;
--buttonKeybindingHint-danger-bgColor-active: #1f232866;
--brand-color-neutral-emphasis: #77827a;
--brand-borderWidth-thicker: max(4px, .25rem);
--brand-Label-color-indigo: #4956e5;
--button-outline-fgColor-rest: #0969da;
--label-auburn-bgColor-hover: #e6d6d5;
--control-iconColor-rest: #59636e;
--base-color-scale-indigo-1: #d4dbff;
--buttonKeybindingHint-default-bgColor-disabled: #eff2f5;
--display-pine-borderColor-muted: #80efb9;
--brand-SubNav-overflowMenu-toggle-bgColor-active: #e4ebe6;
--brand-Testimonial-quoteMarkColor-yellow: #be7d00;
--brand-button-subtle-bgColor-rest: #00000003;
--color-mktg-btn-shadow-outline: #00000026 0 0 0 1px inset;
--data-gray-color-emphasis: #808fa3;
--base-color-scale-green-9: #0d3024;
--border-accent-emphasis: .0625rem solid #0969da;
--brand-Label-color-purple-red-start: #8534f3;
--brand-Bento-item-borderRadius-medium: 1.5rem;
--brand-Testimonial-quoteMarkColor-pink: #ef2aa4;
--button-danger-iconColor-rest: #d1242f;
--brand-color-border-subtle: #d2d9d4;
--buttonKeybindingHint-default-borderColor-rest: #d1d9e0b3;
--base-color-scale-teal-1: #a4efe8;
--button-invisible-fgColor-disabled: #818b98;
--color-ansi-blue: #0969da;
--brand-Label-color-blue: #0377ff;
--label-coral-bgColor-hover: #fecebe;
--contribution-halloween-bgColor-1: #f0db3d;
--button-default-bgColor-active: #e6eaef;
--display-gray-borderColor-muted: #d2dae4;
--buttonCounter-danger-bgColor-hover: #fff3;
--button-danger-fgColor-active: #fff;
--progressBar-track-bgColor: #d1d9e0;
--brand-color-accent-primary: #0d6731;
--color-prettylights-syntax-sublimelinter-gutter-mark: #818b98;
--base-color-scale-coral-3: #ff7b56;
--brand-FrostedGlassVFX-bgColor: #ffffffb3;
--brand-color-border-muted: #e4ebe6;
--brand-tiles-highlightColor: #08872b;
--brand-CarouselPagination-indicator-active-bgColor: #58635b;
--headerSearch-bgColor: #25292e;
--control-checked-bgColor-rest: #0969da;
--fgColor-draft: #59636e;
--counter-bgColor-emphasis: #59636e;
--base-color-scale-transparent: #fff0;
--brand-Icon-color-orange: #b85b06;
--label-red-bgColor-rest: #ffe2e0;
--brand-button-primary-borderColor-rest: transparent;
--brand-borderWidth-thick: max(2px, .125rem);
--borderColor-upsell-muted: #c297ff66;
--label-lemon-bgColor-active: #d8bd0e;
--display-purple-bgColor-emphasis: #894ceb;
--buttonKeybindingHint-inactive-bgColor: #eff2f5;
--base-color-scale-blue-9: #001c4d;
--diffBlob-deletionLine-bgColor: #ffebe9;
--buttonKeybindingHint-invisible-fgColor-rest: #59636e;
--label-indigo-fgColor-active: #2d2db4;
--fgColor-accent: #0969da;
--base-color-scale-red-9: #420011;
--brand-VideoPlayer-closedCaption-text-fgColor: #fff;
--brand-Token-bgColor-invisible: #e4ebe6;
--display-indigo-borderColor-muted: #d2d7fe;
--label-green-bgColor-hover: #9ceda0;
--data-purple-color-muted: #f1e5ff;
--border-open-muted: .0625rem solid #4ac26b66;
--border-attention-emphasis: .0625rem solid #9a6700;
--base-color-scale-green-8: #0e4a2e;
--base-color-scale-lime-2: #dcfa67;
--base-color-scale-blue-5: #0377ff;
--data-green-color-emphasis: #30a147;
--buttonKeybindingHint-danger-bgColor-hover: #1f232833;
--diffBlob-hunkNum-fgColor-rest: #1f2328;
--base-color-scale-teal-6: #136061;
--brand-control-radio-border-checked: #b6bfb8;
--brand-control-checkbox-border-checked-hover: #08872b;
--base-color-scale-yellow-7: #824800;
--label-coral-bgColor-active: #fcab92;
--button-invisible-borderColor-disabled: #fff0;
--display-lemon-fgColor: #786002;
--color-prettylights-syntax-carriage-return-text: #f6f8fa;
--brand-ToggleSwitch-thumb-on-bgColor-hover: color-mix(in srgb, #08872b, black 16%);
--prettylights-syntax-carriage-return-bg: #cf222e;
--base-color-scale-lime-9: #182c01;
--brand-Accordion-toggle-color-green: #08872b;
--label-indigo-fgColor-hover: #393cd5;
--diffBlob-hunkNum-fgColor-hover: #fff;
--brand-Eyebrowbanner-borderColor-rest: #b6bfb8;
--brand-color-danger-subtle: #ffebe9;
--button-danger-iconColor-disabled: #d1242f80;
--brand-FeatureComparisonTable-includedIndicator-bgColor: #08872b33;
--marketing-navigation-theme-trigger-active-bg: #e4ebe6;
--borderColor-done-muted: #c297ff66;
--base-color-scale-orange-5: #b85b06;
--color-prettylights-syntax-constant-other-reference-link: #0a3069;
--brand-color-border-default: #b6bfb8;
--button-invisible-iconColor-hover: #59636e;
--display-plum-bgColor-emphasis: #a830e8;
--brand-color-success-muted: #8cf2a699;
--display-lime-borderColor-muted: #c7e580;
--base-color-scale-pink-0: #fff0fc;
--display-yellow-borderColor-emphasis: #946a00;
--color-notifications-row-bg: #fff;
--color-workflow-card-header-shadow: #0000;
--data-pink-color-muted: #ffe5f1;
--display-olive-borderColor-emphasis: #64762d;
--display-purple-borderColor-emphasis: #894ceb;
--codeMirror-activeline-bgColor: #818b981f;
--button-invisible-borderColor-rest: #fff0;
--brand-control-color-fg-default: #000;
--label-pink-fgColor-active: #6e2b53;
--brand-CarouselPagination-arrowButton-inactive-fgColor: #c4ccc6;
--base-color-scale-lime-1: #e8fc97;
--label-brown-fgColor-rest: #755f43;
--codeMirror-gutters-bgColor: #fff;
--brand-TextCursorAnimation-cursor-color: #8534f3;
--brand-Testimonial-quoteMarkColor-red: #cf2230;
--brand-CTABanner-color-heading-emphasis: #0d6731;
--brand-TextCursorAnimation-cursor-finalColor: #08872b;
--display-orange-borderColor-muted: #fecfaa;
--border-upsell-muted: .0625rem solid #c297ff66;
--bgColor-severe-emphasis: #bc4c00;
--display-pine-bgColor-emphasis: #167e53;
--brand-control-checkbox-bg-indeterminate-hover: color-mix(in srgb, #08872b, #000 26%);
--base-color-scale-indigo-9: #12144f;
--base-color-scale-blue-4: #3094ff;
--brand-control-checkbox-border-checked: #08872b;
--brand-color-canvas-invert: #000;
--base-color-scale-yellow-0: #fff8c5;
--label-brown-fgColor-active: #51412f;
--brand-SubNav-overflowMenu-toggle-bgColor-hover: #e4ebe6;
--brand-Accordion-toggle-color-green-blue-start: #08872b;
--brand-color-error-fg: #cf2230;
--label-indigo-bgColor-active: #b1b9fb;
--borderColor-draft-muted: #d1d9e0b3;
--data-plum-color-muted: #f8e5ff;
--brand-Spinner-fgColor: #58635b;
--label-teal-bgColor-hover: #89ebe1;
--button-primary-borderColor-disabled: #95d8a6;
--label-red-fgColor-rest: #c50d28;
--borderColor-attention-muted: #d4a72c66;
--brand-Testimonial-quoteMarkColor-gray: #96a199;
--skeletonLoader-bgColor: #818b981a;
--display-red-bgColor-muted: #ffe2e0;
--buttonKeybindingHint-inactive-borderColor: #d1d9e0b3;
--border-severe-emphasis: .0625rem solid #bc4c00;
--button-invisible-bgColor-active: #818b9826;
--brand-InlineLink-color-pressed: #002f7a;
--display-lemon-borderColor-muted: #f0db3d;
--brand-Eyebrowbanner-fgColor-red: #cf2230;
--label-pine-fgColor-rest: #156f4b;
--display-lemon-borderColor-emphasis: #866e04;
--buttonKeybindingHint-danger-fgColor-disabled: #818b98;
--color-marketing-icon-primary: #218bff;
--contribution-default-borderColor-3: #1f23280d;
--border-translucent: .0625rem solid #1f232826;
--data-auburn-color-emphasis: #9d615c;
--brand-IconButton-danger-borderColor-rest: #d2d9d4;
--label-plum-fgColor-hover: #7d1eb8;
--label-purple-bgColor-active: #d1b1fc;
--base-color-scale-green-6: #08872b;
--brand-color-danger-fg: #cf2230;
--prettylights-syntax-string: #0a3069;
--brand-color-accent-secondary: #be7d00;
--button-outline-borderColor-hover: #1f232826;
--brand-ToggleSwitch-track-borderWidth: max(1px, .0625rem);
--avatarStack-fade-bgColor-muted: #dae0e7;
--label-auburn-fgColor-rest: #8a5551;
--brand-button-subtle-bgColor-hover: #0000001e;
--brand-ActionMenu-color-item-hover: #e4ebe6;
--brand-borderInset-thin: inset 0 0 0 max(1px, .0625rem);
--base-color-scale-purple-9: #160048;
--brand-FeatureComparisonTable-unlimitedIndicator-bgColor: #08872b33;
--page-header-bgColor: #f6f8fa;
--buttonKeybindingHint-danger-borderColor-active: #1f232826;
--display-brown-borderColor-emphasis: #856d4c;
--base-color-scale-red-3: #ff8182;
--display-coral-fgColor: #ba2e12;
--data-blue-color-emphasis: #006edb;
--brand-Card-padding-inline: 1.25rem;
--base-color-scale-blue-1: #bcecff;
--display-teal-borderColor-muted: #89ebe1;
--display-cyan-fgColor: #006a80;
--base-color-scale-pink-3: #ff80d2;
--bgColor-transparent: #fff0;
--base-color-scale-coral-9: #500a00;
--color-prettylights-syntax-brackethighlighter-angle: #59636e;
--brand-SubNav-overflowMenu-bgColor-rest: #fff;
--brand-Icon-color-gray: #77827a;
--brand-PricingOptions-featureList-group-heading-color: #000;
--label-lime-bgColor-rest: #e3f2b5;
--brand-CTABanner-bgColor: #f2f5f3;
--buttonCounter-outline-fgColor-rest: #0550ae;
--brand-color-canvas-inset: #f2f5f3;
--brand-IconButton-danger-fgColor-hover: #fff;
--color-prettylights-syntax-markup-ignored-bg: #0550ae;
--border-success-emphasis: .0625rem solid #1a7f37;
--brand-color-text-error: #cf222e;
--brand-Label-color-green-blue-purple-2: #096bde;
--prettylights-syntax-markup-inserted-bg: #dafbe1;
--brand-Accordion-toggle-color-default: #000;
--brand-Testimonial-quoteMarkColor-green: #08872b;
--overlay-backdrop-bgColor: #c8d1da66;
--label-purple-bgColor-hover: #e6d2fe;
--brand-color-canvas-overlay: #fff;
--brand-Eyebrowbanner-fgColor-red-orange-start: #cf2230;
--borderColor-done-emphasis: #8250df;
--label-teal-bgColor-rest: #c7f5ef;
--base-color-scale-lime-7: #425e13;
--base-color-scale-pink-9: #3d0a28;
--treeViewItem-leadingVisual-iconColor-rest: #54aeff;
--control-checked-borderColor-hover: #0860ca;
--brand-Eyebrowbanner-fgColor-pink-blue-start: #ef2aa4;
--brand-IconButton-danger-fgColor-rest: #cf2230;
--brand-Label-color-lemon: #a98906;
--base-color-scale-gray-7: #58635b;
--color-prettylights-syntax-constant: #0550ae;
--base-color-scale-lime-6: #698e17;
--bgColor-success-muted: #dafbe1;
--color-prettylights-syntax-markup-deleted-text: #82071e;
--brand-control-checkbox-border-unchecked-disabled: #e4ebe6;
--brand-CarouselPagination-bgColor: #f2f5f3;
--borderColor-default: #d1d9e0;
--label-purple-fgColor-active: #4f21ab;
--base-color-scale-coral-1: #ffcab8;
--bgColor-sponsors-muted: #ffeff7;
--label-plum-bgColor-rest: #f8e5ff;
--base-color-scale-pink-4: #ff4ac0;
--base-color-scale-green-0: #ebf9f4;
--brand-SubNav-bgColor: #fff;
--brand-button-secondary-fgColor-rest: #000;
--base-color-scale-white-0: #fff;
--data-teal-color-emphasis: #179b9b;
--display-brown-bgColor-emphasis: #856d4c;
--menu-bgColor-active: #fff0;
--prettylights-syntax-string-regexp: #116329;
--brand-FAQ-color-tabLabel-selected: #000;
--color-prettylights-syntax-string: #0a3069;
--bgColor-done-emphasis: #8250df;
--button-invisible-bgColor-hover: #818b981a;
--label-olive-bgColor-active: #b9c832;
--border-sponsors-emphasis: .0625rem solid #bf3989;
--brand-Accordion-toggle-color-start: #0d6731;
--brand-Tabs-item-default-borderColor-active: #b6bfb8;
--brand-Eyebrowbanner-fgColor-pink: #ef2aa4;
--brand-color-success-subtle: #bfffd1;
--label-green-bgColor-rest: #caf7ca;
--display-red-bgColor-emphasis: #df0c24;
--color-prettylights-syntax-markup-changed-bg: #ffd8b5;
--brand-control-radio-bg-default: #fff;
--data-olive-color-muted: #f0f0ad;
--color-ansi-blue-bright: #218bff;
--base-color-scale-lemon-3: #e1c50f;
--label-brown-bgColor-hover: #dfd7c8;
--brand-borderRadius-large: 1rem;
--base-color-scale-gray-6: #77827a;
--label-blue-fgColor-active: #003d99;
--base-color-scale-orange-2: #f4a876;
--brand-Label-color-default: #000;
--brand-Testimonial-borderMask-default: linear-gradient(180deg, #0009, #0000004d);
--data-lemon-color-muted: #f7eea1;
--brand-button-secondary-borderColor-active: #d2d9d4;
--base-color-scale-lemon-1: #f5e36b;
--brand-borderRadius-full: 624.938rem;
--controlTrack-bgColor-active: #dae0e7;
--display-plum-bgColor-muted: #f8e5ff;
--button-invisible-bgColor-rest: #fff0;
--fgColor-severe: #bc4c00;
--button-primary-bgColor-rest: #1f883d;
--color-user-mention-fg: #1f2328;
--brand-CTABanner-color-logo-filter-muted: brightness(0) saturate(100%) invert(37%) sepia(7%) saturate(778%) hue-rotate(171deg) brightness(96%) contrast(91%);
--brand-Accordion-toggle-color-coral: #e13f1b;
--brand-control-checkbox-border-hover: #b6bfb8;
--display-brown-fgColor: #755f43;
--display-pine-bgColor-muted: #bff8db;
--progressBar-bgColor-danger: #cf222e;
--brand-RiverStoryScroll-content-inactive-bgColor: #fff;
--brand-Accordion-toggle-color-pink-blue-end: #0377ff;
--label-pink-bgColor-rest: #ffe5f1;
--base-color-scale-indigo-6: #2d3dd7;
--brand-Testimonial-quote-color-emphasis: #0d6731;
--base-color-scale-blue-3: #5fb9ff;
--display-lemon-bgColor-muted: #f7eea1;
--brand-Eyebrowbanner-fgColor-lemon: #a98906;
--buttonCounter-outline-fgColor-disabled: #0969da80;
--base-color-scale-orange-4: #da7210;
--base-color-scale-lemon-4: #c7a60b;
--button-primary-bgColor-disabled: #95d8a6;
--buttonKeybindingHint-default-bgColor-rest: #eff2f5;
--bgColor-attention-muted: #fff8c5;
--display-yellow-borderColor-muted: #ffd642;
--reactionButton-selected-bgColor-rest: #ddf4ff;
--control-borderColor-success: #1a7f37;
--diffBlob-deletionLine-fgColor: #1f2328;
--display-teal-bgColor-muted: #c7f5ef;
--borderColor-neutral-muted: #d1d9e0b3;
--brand-Label-color-red: #cf2230;
--brand-control-color-border-disabled: #d2d9d4;
--brand-color-canvas-muted: #f9fbf9;
--brand-Label-color-blue-purple-start: #0377ff;
--controlTrack-fgColor-disabled: #fff;
--underlineNav-borderColor-hover: #d1d9e0b3;
--data-brown-color-emphasis: #856d4c;
--fgColor-disabled: #818b98;
--label-green-fgColor-rest: #2b6e3f;
--color-prettylights-syntax-invalid-illegal-bg: #ffebe9;
--contribution-winter-bgColor-2: #54aeff;
--control-transparent-bgColor-rest: #fff0;
--buttonKeybindingHint-invisible-bgColor-rest: #eff2f5;
--base-color-scale-purple-6: #6619e1;
--brand-Eyebrowbanner-fgColor-default-middle: #ef2aa4;
--base-color-scale-indigo-5: #4956e5;
--control-bgColor-disabled: #eff2f5;
--bgColor-upsell-emphasis: #8250df;
--controlKnob-borderColor-checked: #0969da;
--button-primary-fgColor-disabled: #fffc;
--brand-videoPlayer-title-bgColor: linear-gradient(180deg, #000000e6, #00000073 66%, transparent);
--button-outline-fgColor-active: #fff;
--borderColor-translucent: #1f232826;
--base-color-scale-lemon-9: #322400;
--brand-control-checkbox-bg-checked: #08872b;
--header-fgColor-logo: #fff;
--display-orange-bgColor-muted: #ffe7d1;
--brand-videoPlayer-closedCaption-fgColor-enabled: #000;
--codeMirror-syntax-fgColor-entity: #8250df;
--display-olive-borderColor-muted: #dbe170;
--diffBlob-deletionWord-fgColor: #1f2328;
--base-color-scale-orange-6: #954502;
--borderColor-open-muted: #4ac26b66;
--button-invisible-fgColor-rest: #25292e;
--brand-IconButton-inactive-fgColor: #58635b;
--label-red-bgColor-active: #fda5a7;
--label-auburn-fgColor-hover: #744744;
--brand-control-checkbox-border-default: #b6bfb8;
--buttonCounter-danger-bgColor-disabled: #cf222e0d;
--buttonKeybindingHint-invisible-borderColor-rest: #fff0;
--display-coral-borderColor-muted: #fecebe;
--border-draft-muted: .0625rem solid #d1d9e0b3;
--progressBar-bgColor-sponsors: #bf3989;
--button-default-fgColor-disabled: #818b98;
--display-purple-borderColor-muted: #e6d2fe;
--brand-Label-color-pink-blue-start: #ef2aa4;
--display-cyan-borderColor-emphasis: #007b94;
--brand-Icon-color-teal: #197b7b;
--base-color-scale-indigo-7: #262dae;
--display-pink-borderColor-emphasis: #ce2c85;
--brand-control-color-border-default: #b6bfb8;
--brand-ActionMenu-color-splitButton-divider-default: #e4ebe6;
--label-brown-borderColor: #fff0;
--control-borderColor-rest: #d1d9e0;
--border-disabled: .0625rem solid #818b981a;
--brand-Label-color-green: #08872b;
--brand-InlineLink-color-rest: #0055d5;
--label-yellow-fgColor-active: #5c3d00;
--label-olive-fgColor-active: #3b4927;
--color-prettylights-syntax-comment: #59636e;
--brand-color-neutral-subtle: #e4ebe6fe;
--label-yellow-fgColor-hover: #704d00;
--control-transparent-borderColor-rest: #fff0;
--brand-button-primary-bgColor-active: linear-gradient(0deg, #0000003d 0%, #0000003d 100%), #08872b;
--button-danger-bgColor-disabled: #eff2f5;
--brand-Card-background-overlay: #f2f5f333;
--brand-Testimonial-quoteMarkColor-lime: #92c219;
--label-orange-fgColor-active: #70300f;
--control-fgColor-rest: #25292e;
--base-color-scale-coral-4: #fe4c25;
--brand-color-error-subtle: #ffebe9;
--color-ansi-white: #59636e;
--brand-Icon-color-pink: #ef2aa4;
--label-blue-bgColor-hover: #ade1ff;
--brand-button-subtle-bgColor-active: #00000036;
--data-coral-color-emphasis: #d43511;
--display-indigo-bgColor-emphasis: #5a61e7;
--brand-color-error-emphasis: #cf2230;
--buttonKeybindingHint-default-borderColor-disabled: #818b981a;
--brand-Token-bgColor-outline: transparent;
--borderColor-danger-muted: #ff818266;
--label-lemon-fgColor-hover: #654f01;
--brand-ToggleSwitch-thumb-borderWidth: .9px;
--borderColor-accent-emphasis: #0969da;
--buttonCounter-invisible-bgColor-rest: #818b981f;
--brand-Token-bgColor-accent: #08872b;
--base-color-scale-coral-6: #c53211;
--progressBar-bgColor-success: #1f883d;
--brand-Testimonial-quoteMarkColor-lemon: #a98906;
--bgColor-default: #fff;
--control-checked-fgColor-disabled: #fff;
--color-ansi-yellow: #4d2d00;
--label-gray-fgColor-rest: #5c6570;
--brand-button-secondary-bgColor-hover: #0000001e;
--brand-Accordion-toggle-color-pink-blue-start: #ef2aa4;
--brand-tiles-bgColor-hover: #f2f5f3;
--label-pine-fgColor-hover: #135d41;
--buttonCounter-danger-fgColor-rest: #c21c2c;
--base-color-scale-purple-3: #b870ff;
--label-lemon-borderColor: #fff0;
--display-red-fgColor: #c50d28;
--base-color-scale-coral-0: #fff0eb;
--brand-breadcrumbs-separator-borderColor: #77827a;
--button-danger-fgColor-rest: #d1242f;
--color-prettylights-syntax-entity: #6639ba;
--brand-Icon-color-blue: #0377ff;
--brand-Accordion-toggle-color-purple-red-start: #8534f3;
--progressBar-bgColor-attention: #9a6700;
--bgColor-inverse: #25292e;
--avatarStack-fade-bgColor-default: #c8d1da;
--label-auburn-bgColor-rest: #f2e9e9;
--color-prettylights-syntax-markup-italic: #1f2328;
--brand-IconButton-inactive-borderColor: #f2f5f3;
--display-teal-bgColor-emphasis: #127e81;
--label-cyan-bgColor-hover: #7ae9ff;
--label-red-borderColor: #fff0;
--diffBlob-additionNum-bgColor: #aceebb;
--brand-control-checkbox-border-checked-disabled: color-mix(in srgb, #08872b, #fff 65%);
--brand-Accordion-toggle-color-indigo: #4956e5;
--brand-Accordion-toggle-color-purple: #8534f3;
--brand-Link-color-accent: #0055d5;
--button-primary-bgColor-active: #197935;
--label-indigo-fgColor-rest: #494edf;
--border-upsell-emphasis: .0625rem solid #8250df;
--brand-Accordion-toggle-color-pink: #ef2aa4;
--label-pink-bgColor-active: #f8a5cf;
--brand-FeatureComparisonTable-unlimitedIndicator-fgColor: #08872b;
--brand-Eyebrowbanner-fgColor-green: #08872b;
--display-indigo-bgColor-muted: #e5e9ff;
--codeMirror-syntax-fgColor-comment: #1f2328;
--brand-color-text-link-rest: #0055d5;
--base-color-scale-green-1: #bfffd1;
--display-coral-bgColor-emphasis: #d43511;
--data-olive-color-emphasis: #64762d;
--button-invisible-iconColor-rest: #59636e;
--color-ansi-magenta: #8250df;
--border-neutral-emphasis: .0625rem solid #59636e;
--controlTrack-fgColor-rest: #59636e;
--diffBlob-hunkNum-bgColor-hover: #0969da;
--brand-Icon-color-default: #08872b;
--label-auburn-fgColor-active: #5d3937;
--brand-Eyebrowbanner-fgColor-teal: #197b7b;
--codeMirror-fgColor: #1f2328;
--borderColor-danger-emphasis: #cf222e;
--base-color-scale-teal-5: #197b7b;
--brand-videoPlayer-closedCaption-bgColor-enabled: #f2f5f3;
--data-gray-color-muted: #e8ecf2;
--brand-Icon-color-indigo: #4956e5;
--buttonKeybindingHint-danger-bgColor-disabled: #eff2f5;
--brand-Token-fgColor-outline: #000;
--fgColor-onInverse: #fff;
--display-olive-bgColor-emphasis: #64762d;
--control-transparent-bgColor-active: #818b9826;
--brand-control-radio-bg-disabled: #fff;
--brand-Eyebrowbanner-fgColor-indigo: #4956e5;
--brand-ToggleSwitch-thumb-disabled-bgColor: #b6bfb8;
--border-closed-emphasis: .0625rem solid #cf222e;
--brand-Accordion-toggle-color-gray: #96a199;
--label-cyan-fgColor-hover: #00596b;
--display-green-borderColor-emphasis: #2c8141;
--base-color-scale-red-5: #cf2230;
--buttonCounter-outline-bgColor-disabled: #0969da0d;
--brand-Grid-column-bgColor-overlay: #fb51544d;
--brand-IconButton-danger-bgColor-active: #cf2230;
--timelineBadge-bgColor: #f6f8fa;
--brand-color-danger-muted: #ffaba899;
--bgColor-danger-muted: #ffebe9;
--brand-Label-color-green-blue-purple-1: #000aff;
--brand-Testimonial-quoteMarkColor-coral: #e13f1b;
--card-bgColor: #fff;
--color-prettylights-syntax-keyword: #cf222e;
--buttonCounter-primary-bgColor-rest: #002d1133;
--base-color-scale-green-4: #23ea57;
--brand-Accordion-toggle-color-green-blue-end: #0377ff;
--button-invisible-borderColor-hover: #fff0;
--borderColor-upsell-emphasis: #8250df;
--progressBar-bgColor-accent: #0969da;
--display-auburn-fgColor: #8a5551;
--brand-Label-color-gray: #96a199;
--brand-Token-bgColor-hover-default: #e4ebe6;
--control-danger-bgColor-active: #ffebe966;
--label-plum-fgColor-active: #651d96;
--display-indigo-borderColor-emphasis: #5a61e7;
--button-outline-bgColor-rest: #f6f8fa;
--brand-Testimonial-quoteMarkColor-orange: #b85b06;
--codeMirror-lines-bgColor: #fff;
--brand-color-error-muted: #ffaba899;
--brand-videoPlayer-closedCaption-fgColor-disabled: #f2f5f3;
--data-orange-color-muted: #ffe7d1;
--base-color-scale-blue-8: #002f7a;
--brand-PricingOptions-actionsMessage-accentColor: #0377ff;
--button-danger-bgColor-hover: #cf222e;
--brand-Label-color-pink-blue-end: #0377ff;
--display-blue-bgColor-emphasis: #006edb;
--brand-Eyebrowbanner-fgColor-orange: #b85b06;
--buttonCounter-outline-bgColor-hover: #fff3;
--label-brown-fgColor-hover: #64513a;
--label-teal-fgColor-active: #0a4852;
--display-lime-bgColor-muted: #e3f2b5;
--button-primary-iconColor-disabled: #fffc;
--button-outline-fgColor-disabled: #0969da80;
--bgColor-black: #1f2328;
--brand-ToggleSwitch-track-borderRadius: 624.938rem;
--button-default-bgColor-selected: #e6eaef;
--label-orange-bgColor-hover: #fecfaa;
--buttonKeybindingHint-invisible-borderColor-disabled: #818b981a;
--brand-color-text-muted: #58635b;
--label-plum-borderColor: #fff0;
--display-cyan-bgColor-emphasis: #007b94;
--control-checked-borderColor-active: #0757ba;
--brand-SubNav-color-link-bgColor: #e4ebe6;
--button-default-bgColor-rest: #f6f8fa;
--brand-Icon-color-coral: #e13f1b;
--label-olive-fgColor-hover: #495a2b;
--progressBar-track-borderColor: #fff0;
--prettylights-syntax-carriageReturn-bg: #cf222e;
--buttonKeybindingHint-invisible-bgColor-active: #818b9826;
--brand-control-radio-border-disabled: #b6bfb8;
--button-invisible-bgColor-disabled: #fff0;
--button-primary-borderColor-hover: #1f232826;
--base-color-scale-teal-4: #23b1ae;
--fgColor-success: #1a7f37;
--border-severe-muted: .0625rem solid #fb8f4466;
--brand-PricingOptions-item-bgColor-solid: #f2f5f3;
--contribution-halloween-bgColor-2: #ffd642;
--brand-IconButton-danger-bgColor-hover: #cf2230;
--color-prettylights-syntax-meta-diff-range: #8250df;
--color-ansi-yellow-bright: #633c01;
--brand-Testimonial-quoteMarkColor-indigo: #4956e5;
--bgColor-open-muted: #dafbe1;
--brand-Eyebrowbanner-fgColor-purple: #8534f3;
--brand-borderRadius-small: .25rem;
--brand-CTABanner-shadow-color-start: #08872b;
--color-project-gradient-out: #fff0;
--color-prettylights-syntax-variable: #953800;
--base-color-scale-indigo-4: #6b7bef;
--brand-Label-color-red-orange-end: #b85b06;
--label-coral-fgColor-rest: #ba2e12;
--data-pine-color-emphasis: #167e53;
--brand-Bento-item-borderRadius-large: 1.5rem;
--label-coral-bgColor-rest: #ffe5db;
--brand-button-primary-bgColor-rest: #08872b;
--base-color-scale-yellow-9: #471f00;
--buttonKeybindingHint-primary-fgColor-disabled: #fffc;
--label-purple-borderColor: #fff0;
--color-ansi-red: #cf222e;
--control-bgColor-selected: #f6f8fa;
--base-color-scale-pink-7: #952866;
--label-lime-fgColor-rest: #476c28;
--brand-ToggleSwitch-thumb-borderColor: #00000014;
--buttonKeybindingHint-default-fgColor-rest: #59636e;
--label-pink-bgColor-hover: #fdc9e2;
--button-default-borderColor-disabled: #818b981a;
--contribution-winter-bgColor-1: #b6e3ff;
--brand-Testimonial-borderMask-subtle: linear-gradient(180deg, #0009, #0000004d);
--label-pink-fgColor-rest: #b12f79;
--base-color-scale-lemon-6: #806803;
--label-blue-bgColor-rest: #d1f0ff;
--brand-button-secondary-borderColor-hover: #d2d9d4;
--label-lime-bgColor-active: #9bd039;
--brand-CTABanner-color-logo-emphasis: #000;
--codeMirror-bgColor: #fff;
--display-cyan-borderColor-muted: #7ae9ff;
--buttonKeybindingHint-danger-borderColor-rest: #d1d9e0b3;
--brand-color-text-onEmphasis: #fff;
--brand-Tooltip-color-default: #fff;
--color-ansi-red-bright: #a40e26;
--button-default-borderColor-rest: #d1d9e0;
--label-lemon-fgColor-rest: #786002;
--display-gray-bgColor-emphasis: #647182;
--brand-Accordion-toggle-color-orange: #b85b06;
--data-blue-color-muted: #d1f0ff;
--bgColor-closed-muted: #ffebe9;
--base-color-scale-gray-2: #d2d9d4;
--base-color-scale-purple-5: #8534f3;
--bgColor-draft-emphasis: #59636e;
--brand-Testimonial-quoteMarkColor-teal: #197b7b;
--base-color-scale-yellow-2: #ffd743;
--brand-control-radio-bg-checked: #fff;
--brand-ActionMenu-color-splitButton-divider-primary: #0d6731;
--contribution-default-bgColor-2: #4ac26b;
--fgColor-muted: #59636e;
--prettylights-syntax-markup-ignored-bg: #0550ae;
--brand-IconButton-inactive-bgColor: #f2f5f3;
--brand-Icon-color-purple: #8534f3;
--display-teal-borderColor-emphasis: #127e81;
--brand-control-radio-border-hover: #b6bfb8;
--selection-bgColor: #0969da33;
--border-danger-emphasis: .0625rem solid #cf222e;
--color-prettylights-syntax-markup-inserted-text: #116329;
--brand-Token-bgColor-hover-outline: #0000000f;
--display-pink-bgColor-muted: #ffe5f1;
--label-coral-borderColor: #fff0;
--base-color-scale-lemon-2: #f2da3b;
--buttonKeybindingHint-danger-borderColor-hover: #1f232826;
--button-default-bgColor-disabled: #eff2f5;
--diffBlob-hunkLine-bgColor: #ddf4ff;
--base-color-scale-coral-8: #801e0f;
--button-primary-borderColor-rest: #1f232826;
--diffBlob-additionNum-fgColor: #1f2328;
--button-primary-iconColor-rest: #fffc;
--borderColor-closed-emphasis: #cf222e;
--color-workflow-card-bg: #fff;
--label-lemon-bgColor-rest: #f7eea1;
--base-color-scale-gray-4: #b6bfb8;
--color-prettylights-syntax-markup-changed-text: #953800;
--borderColor-accent-muted: #54aeff66;
--csstools-color-scheme--light: ;
--display-yellow-fgColor: #805900;
--buttonKeybindingHint-invisible-fgColor-disabled: #818b98;
--brand-button-subtle-borderColor-rest: #d2d9d4;
--button-invisible-iconColor-disabled: #818b98;
--control-fgColor-disabled: #818b98;
--brand-ToggleSwitch-thumb-on-bgColor-rest: #08872b;
--data-red-color-muted: #ffe2e0;
--brand-IconButton-subtle-fgColor: #58635b;
--brand-Label-color-purple-red-end: #cf2230;
--controlTrack-bgColor-rest: #e6eaef;
--brand-Card-background-default: #fff;
--brand-button-primary-borderColor-hover: transparent;
--codeMirror-syntax-fgColor-variable: #953800;
--brand-button-subtle-fgColor-disabled: #c4ccc6;
--data-plum-color-emphasis: #a830e8;
--base-color-scale-orange-1: #fcceab;
--base-color-scale-indigo-2: #b3c1fd;
--brand-Eyebrowbanner-fgColor-coral: #e13f1b;
--base-color-scale-blue-0: #ddf4ff;
--codeMirror-cursor-fgColor: #1f2328;
--label-plum-bgColor-hover: #f0cdfe;
--brand-InlineCode-color-fg-heading: #000;
--brand-videoPlayer-playButton-fgColor-rest: #f2f5f3;
--brand-SubNav-overflowMenu-fgColor-hover: #000;
--label-red-bgColor-hover: #fecdcd;
--color-diff-blob-selected-line-highlight-mix-blend-mode: multiply;
--dashboard-bgColor: #fff;
--label-green-fgColor-active: #254b34;
--base-color-scale-red-0: #ffebe9;
--bgColor-attention-emphasis: #9a6700;
--border-default: .0625rem solid #d1d9e0;
--button-primary-shadow-selected: inset 0 1px 0 0 #002d114d;
--label-purple-fgColor-hover: #6223d7;
--brand-CTABanner-color-logo-muted: #58635b;
--display-pine-fgColor: #156f4b;
--fgColor-neutral: #59636e;
--contribution-default-bgColor-1: #aceebb;
--label-teal-borderColor: #fff0;
--brand-Label-color-green-blue-purple-4: #8250df;
--display-olive-bgColor-muted: #f0f0ad;
--brand-CTABanner-shadow-color-end: #0377ff;
--marketing-navigation-theme-card-hover-bg: #e4ebe6;
--prettylights-syntax-invalidIllegal-bg: #ffebe9;
--borderColor-sponsors-emphasis: #bf3989;
--base-color-scale-purple-7: #43179e;
--display-green-borderColor-muted: #9ceda0;
--border-transparent: .0625rem solid #fff0;
--display-gray-borderColor-emphasis: #647182;
--brand-videoPlayer-range-bgColor-progress: #3094ff;
--button-inactive-bgColor: #e6eaef;
--brand-ToggleSwitch-loading-fgColor: #58635b;
--label-lemon-fgColor-active: #523f00;
--brand-ToggleSwitch-track-bgColor: #f2f5f3;
--brand-videoPlayer-range-bgColor-default: #f2f5f3;
--base-color-scale-orange-7: #703100;
--buttonCounter-danger-fgColor-disabled: #d1242f80;
--highlight-neutral-bgColor: #fff8c5;
--brand-EyebrowBanner-borderRadius: 6.25rem;
--borderColor-sponsors-muted: #ff80c866;
--display-teal-fgColor: #106e75;
--display-auburn-borderColor-emphasis: #9d615c;
--brand-FrostedGlassVFX-borderMask: linear-gradient(to bottom, #d8dee480, #d8dee45e 100%);
--base-color-scale-teal-3: #39dad2;
--brand-ToggleSwitch-thumb-off-bgColor-hover: color-mix(in srgb, #77827a, black 8%);
--brand-Accordion-toggle-color-red-orange-start: #cf2230;
--label-pink-fgColor-hover: #8e2e66;
--brand-Token-bgColor-hover-accent: #0d6731;
--base-color-scale-red-7: #860620;
--color-prettylights-syntax-brackethighlighter-unmatched: #82071e;
--progressBar-bgColor-severe: #bc4c00;
--controlTrack-borderColor-disabled: #818b98;
--brand-Eyebrowbanner-fgColor-blue: #0377ff;
--brand-videoPlayer-closedCaption-borderColor-enabled: #f2f5f3;
--brand-color-focus: #0377ff;
--brand-LogoSuite-color-logo-filter-muted: brightness(0) saturate(100%) invert(37%) sepia(7%) saturate(778%) hue-rotate(171deg) brightness(96%) contrast(91%);
--buttonKeybindingHint-primary-bgColor-disabled: #002d111a;
--codeMirror-gutterMarker-fgColor-muted: #59636e;
--color-text-white: #fff;
--border-closed-muted: .0625rem solid #ff818266;
--brand-Token-fgColor-invisible: #000;
--border-danger-muted: .0625rem solid #ff818266;
--base-color-scale-gray-5: #96a199;
--data-lime-color-muted: #e3f2b5;
--control-borderColor-disabled: #818b981a;
--reactionButton-selected-fgColor-rest: #0969da;
--label-cyan-bgColor-rest: #bdf4ff;
--brand-Eyebrowbanner-fgColor-yellow: #be7d00;
--brand-Accordion-toggle-color-yellow: #be7d00;
--brand-color-neutral-emphasisPlus: #353d37;
--diffBlob-additionLine-bgColor: #dafbe1;
--brand-Accordion-toggle-color-lime: #92c219;
--label-plum-fgColor-rest: #961edc;
--brand-control-checkbox-bg-default: #fff;
--brand-LogoSuite-color-logo-emphasis: #000;
--brand-PricingOptions-item-bgColor-gradient-end: #fff;
--focus-outlineColor: #0969da;
--color-prettylights-syntax-markup-list: #3b2300;
--borderColor-emphasis: #818b98;
--data-teal-color-muted: #c7f5ef;
--brand-FeatureComparisonTable-refreshIndicator-bgColor: #8534f333;
--brand-color-text-subtle: #58635b;
--brand-SubNav-overflowMenu-toggle-bgColor-rest: transparent;
--buttonKeybindingHint-danger-fgColor-hover: #fff;
--tooltip-bgColor: #25292e;
--color-prettylights-syntax-carriage-return-bg: #cf222e;
--brand-color-text-link-pressed: #002f7a;
--base-color-scale-red-8: #730019;
--fgColor-default: #1f2328;
--brand-control-radio-bg-hover: #f2f5f3;
--brand-VideoPlayer-closedCaption-text-bgColor: #000000bf;
--color-prettylights-syntax-string-regexp: #116329;
--fgColor-link: #0969da;
--brand-Token-border-outline: #e4ebe6;
--borderColor-success-muted: #4ac26b66;
--base-color-scale-purple-4: #9f51fa;
--base-color-scale-black-0: #000;
--buttonKeybindingHint-primary-fgColor-rest: #fff;
--brand-InlineCode-bgColor: #e4ebe6;
--brand-Token-fgColor-accent: #fff;
--display-green-bgColor-muted: #caf7ca;
--prettylights-syntax-markup-deleted-bg: #ffebe9;
--brand-color-neutral-muted: #c4ccc6fe;
--brand-control-checkbox-bg-checked-hover: color-mix(in srgb, #08872b, #000 26%);
--control-fgColor-placeholder: #59636e;
--button-primary-fgColor-rest: #fff;
--color-ansi-green-bright: #1a7f37;
--brand-button-subtle-borderColor-active: #d2d9d4;
--display-pink-fgColor: #b12f79;
--control-bgColor-active: #e6eaef;
--brand-Label-color-blue-purple-end: #8534f3;
--header-fgColor-default: #ffffffb3;
--display-brown-borderColor-muted: #dfd7c8;
--color-prettylights-syntax-markup-bold: #1f2328;
--label-auburn-borderColor: #fff0;
--selectMenu-bgColor-active: #b6e3ff;
--borderColor-disabled: #818b981a;
--brand-button-primary-fgColor-rest: #fff;
--brand-Eyebrowbanner-subHeading-fgColor: #58635b;
--contribution-default-borderColor-4: #1f23280d;
--label-coral-fgColor-active: #7e2011;
--display-pink-borderColor-muted: #fdc9e2;
--brand-Token-bgColor-default: #f2f5f3;
--buttonKeybindingHint-primary-borderColor-rest: #1f232826;
--buttonKeybindingHint-danger-fgColor-rest: #59636e;
--base-color-scale-orange-9: #471700;
--display-lime-borderColor-emphasis: #527a29;
--brand-Accordion-toggle-color-red-orange-end: #b85b06;
--topicTag-borderColor: #fff0;
--codeMirror-syntax-fgColor-storage: #cf222e;
--label-pine-bgColor-rest: #bff8db;
--border-attention-muted: .0625rem solid #d4a72c66;
--base-color-scale-coral-5: #e13f1b;
--display-coral-borderColor-emphasis: #d43511;
--label-yellow-fgColor-rest: #805900;
--display-red-borderColor-emphasis: #df0c24;
--label-indigo-borderColor: #fff0;
--data-yellow-color-muted: #ffec9e;
--brand-IconButton-danger-borderColor-active: #cf2230;
--brand-Label-color-green-blue-end: #0377ff;
--label-pine-borderColor: #fff0;
--label-cyan-bgColor-active: #00d0fa;
--button-danger-fgColor-hover: #fff;
--buttonKeybindingHint-danger-fgColor-active: #fff;
--brand-control-radio-bg-checked-hover: #f2f5f3;
--bgColor-neutral-muted: #818b981f;
--display-blue-fgColor: #005fcc;
--bgColor-accent-emphasis: #0969da;
--codeMirror-syntax-fgColor-string: #0a3069;
--bgColor-done-muted: #fbefff;
--color-prettylights-syntax-invalid-illegal-text: #d1242f;
--brand-IconButton-invisible-fgColor: #58635b;
--brand-SubNav-color-link-rest: #000;
--contribution-default-bgColor-4: #116329;
--brand-color-text-default: #000;
--borderColor-attention-emphasis: #9a6700;
--base-color-scale-purple-1: #dbbffd;
--borderColor-muted: #d1d9e0b3;
--brand-color-success-fg: #08872b;
--brand-control-color-focus: #0055d5;
--brand-Label-color-red-orange-start: #cf2230;
--base-color-scale-teal-0: #daf9f5;
--base-color-scale-lime-5: #92c219;
--base-color-scale-purple-2: #c898fd;
--color-prettylights-syntax-markup-deleted-bg: #ffebe9;
--button-outline-bgColor-active: #0757ba;
--brand-tiles-bgColor-rest: #fafafa;
--brand-PricingOptions-borderMask: linear-gradient(180deg, #0009, #0000004d);
--color-prettylights-syntax-markup-inserted-bg: #dafbe1;
--color-ansi-black: #1f2328;
--fgColor-closed: #d1242f;
--base-color-scale-lemon-0: #fdf5b3;
--data-pink-color-emphasis: #ce2c85;
--contribution-default-borderColor-0: #1f23280d;
--control-bgColor-rest: #f6f8fa;
--label-orange-fgColor-rest: #a24610;
--button-invisible-fgColor-hover: #25292e;
--brand-IconButton-secondary-fgColor: #58635b;
--label-olive-fgColor-rest: #56682c;
--contribution-default-bgColor-0: #eff2f5;
--border-sponsors-muted: .0625rem solid #ff80c866;
--display-brown-bgColor-muted: #eeeae2;
--buttonCounter-outline-bgColor-rest: #0969da1a;
--controlTrack-borderColor-rest: #d1d9e0;
--base-color-scale-coral-7: #a22710;
--color-prettylights-syntax-storage-modifier-import: #1f2328;
--brand-MediaPlaylist-bgColor: linear-gradient(180deg, #f2f5f380 0%, #f2f5f300 100%), #fff;
--prettylights-syntax-markup-changed-bg: #ffd8b5;
--data-green-color-muted: #caf7ca;
--sideNav-bgColor-selected: #fff;
--brand-control-radio-border-default: #b6bfb8;
--brand-button-subtle-borderColor-hover: #d2d9d4;
--codeMirror-lineNumber-fgColor: #59636e;
--label-pine-fgColor-active: #114b36;
--label-gray-bgColor-hover: #d2dae4;
--bgColor-disabled: #eff2f5;
--base-color-scale-lime-4: #b2de28;
--brand-control-radio-border-checked-hover: #b6bfb8;
--brand-IconButton-danger-fgColor-active: #fff;
--diffBlob-additionLine-fgColor: #1f2328;
--base-color-scale-red-1: #ffcecb;
--label-blue-fgColor-rest: #005fcc;
--buttonCounter-danger-bgColor-rest: #cf222e1a;
--base-color-scale-indigo-3: #8e9df7;
--diffBlob-deletionWord-bgColor: #ffcecb;
--control-transparent-borderColor-hover: #fff0;
--base-color-scale-red-6: #ae0b29;
--control-borderColor-danger: #cf222e;
--display-lime-bgColor-emphasis: #527a29;
--brand-IconButton-invisible-bgColor-rest: transparent;
--brand-Accordion-toggle-color-blue: #0377ff;
--base-color-scale-lime-8: #2c440b;
--label-blue-fgColor-hover: #004db3;
--brand-Eyebrowbanner-fgColor-green-blue-start: #08872b;
--color-ansi-cyan-bright: #3192aa;
--bgColor-muted: #f6f8fa;
--brand-button-secondary-bgColor-rest: #0000000f;
--control-bgColor-hover: #eff2f5;
--bgColor-emphasis: #25292e;
--brand-Token-bgColor-hover-invisible: #0000000f;
--contribution-default-borderColor-2: #1f23280d;
--underlineNav-borderColor-active: #fd8c73;
--data-lime-color-emphasis: #527a29;
--brand-CarouselPagination-arrowButton-borderColor: #d2d9d4;
--border-accent-muted: .0625rem solid #54aeff66;
--brand-CarouselPagination-arrowButton-fgColor: #000;
--color-ansi-cyan: #1b7c83;
--brand-control-color-validation-error: #ae0b29;
--buttonKeybindingHint-danger-bgColor-rest: #eff2f5;
--color-project-sidebar-bg: #fff;
--brand-Eyebrowbanner-heading-fgColor: #000;
--contribution-halloween-bgColor-4: #1f2328;
--buttonKeybindingHint-inactive-fgColor: #59636e;
--label-gray-borderColor: #fff0;
--base-color-scale-coral-2: #ffa387;
--label-green-bgColor-active: #54d961;
--brand-Label-color-pink: #ef2aa4;
--brand-borderRadius-medium: .5rem;
--brand-Link-color-default: #000;
--label-yellow-bgColor-rest: #ffec9e;
--brand-LogoSuite-color-logo-filter-emphasis: brightness(0) saturate(100%) invert(12%) sepia(20%) saturate(450%) hue-rotate(172deg) brightness(100%) contrast(91%);
--control-borderColor-warning: #9a6700;
--counter-borderColor: #fff0;
--fgColor-danger: #d1242f;
--brand-Eyebrowbanner-fgColor-gray: #96a199;
--prettylights-syntax-invalid-illegal-bg: #ffebe9;
--brand-borderRadius-xlarge: 1.5rem;
--buttonKeybindingHint-primary-bgColor-rest: #002d1133;
--control-transparent-borderColor-active: #fff0;
--button-danger-fgColor-disabled: #d1242f80;
--base-color-scale-lemon-8: #413200;
--base-color-scale-gray-9: #191f1b;
--data-brown-color-muted: #eeeae2;
--brand-Token-fgColor-default: #000;
--label-pine-bgColor-active: #1dd781;
--label-auburn-bgColor-active: #d4b7b5;
--brand-Accordion-toggle-color-purple-red-end: #cf2230;
--underlineNav-iconColor-rest: #59636e;
--label-cyan-fgColor-rest: #006a80;
--brand-Accordion-border-color-default: #e4ebe6;
--button-danger-bgColor-rest: #f6f8fa;
--data-purple-color-emphasis: #894ceb;
--base-color-scale-orange-0: #fff1e5;
--borderColor-severe-emphasis: #bc4c00;
--codeMirror-gutterMarker-fgColor-default: #fff;
--base-color-scale-green-7: #0d6731;
--fgColor-upsell: #8250df;
--brand-control-checkbox-bg-indeterminate: #08872b;
--brand-RiverStoryScroll-pagination-fgColor: #77827a;
--display-blue-borderColor-muted: #ade1ff;
--display-yellow-bgColor-emphasis: #946a00;
--base-color-scale-lime-0: #f3fec8;
--brand-button-primary-shadow-active: none;
--color-ansi-green: #116329;
--brand-IconButton-danger-bgColor-rest: #0000000f;
--brand-Label-color-coral: #e13f1b;
--base-color-scale-gray-8: #353d37;
--brand-button-primary-fgColor-disabled: #d2d9d4;
--label-plum-bgColor-active: #e2a7fb;
--color-prettylights-syntax-entity-tag: #0550ae;
--base-color-scale-yellow-5: #be7d00;
--brand-FAQ-color-heading: #000;
--display-plum-borderColor-emphasis: #a830e8;
--control-checked-bgColor-hover: #0860ca;
--base-color-scale-purple-8: #26115f;
--display-pine-borderColor-emphasis: #167e53;
--label-cyan-fgColor-active: #004857;
--brand-control-checkbox-bg-hover: #f2f5f3;
--button-default-borderColor-hover: #d1d9e0;
--brand-IconButton-danger-borderColor-hover: #cf2230;
--brand-ToggleSwitch-track-borderColor: #77827a;
--prettylights-syntax-stringRegexp: #116329;
--label-yellow-bgColor-hover: #ffd642;
--brand-Accordion-toggle-color-blue-purple-end: #8534f3;
--label-green-borderColor: #fff0;
--display-green-fgColor: #2b6e3f;
--brand-Eyebrowbanner-fgColor-lime: #92c219;
--brand-button-primary-bgColor-disabled: #b6bfb8;
--buttonKeybindingHint-invisible-bgColor-hover: #818b981a;
--selectMenu-borderColor: #fff0;
--brand-Eyebrowbanner-fgColor-red-orange-end: #b85b06;
--bgColor-inset: #f6f8fa;
--display-olive-fgColor: #56682c;
--brand-Testimonial-quoteMarkColor-purple: #8534f3;
--brand-control-checkbox-bg-checked-disabled: color-mix(in srgb, #08872b, #fff 65%);
--display-auburn-bgColor-muted: #f2e9e9;
--header-bgColor: #25292e;
--base-color-scale-purple-0: #f0e5ff;
--brand-Card-padding-block: 2rem;
--bgColor-sponsors-emphasis: #bf3989;
--base-color-scale-gray-0: #f2f5f3;
--color-prettylights-syntax-markup-heading: #0550ae;
--border-done-muted: .0625rem solid #c297ff66;
--controlKnob-bgColor-disabled: #eff2f5;
--label-gray-bgColor-active: #b4c0cf;
--base-color-scale-green-2: #8cf2a6;
--progressBar-bgColor-done: #8250df;
--label-lime-borderColor: #fff0;
--border-neutral-muted: .0625rem solid #d1d9e0b3;
--brand-borderInset-thicker: inset 0 0 0 max(4px, .25rem);
--borderColor-draft-emphasis: #59636e;
--display-purple-fgColor: #783ae4;
--display-blue-borderColor-emphasis: #006edb;
--bgColor-closed-emphasis: #cf222e;
--controlTrack-bgColor-hover: #e0e6eb;
--border-emphasis: .0625rem solid #818b98;
--brand-Testimonial-quoteMarkColor-blue: #0377ff;
--base-color-scale-red-4: #fa4549;
--brand-Card-animation-duration: .4s;
--label-teal-fgColor-rest: #106e75;
--button-default-borderColor-active: #d1d9e0;
--brand-button-secondary-borderColor-rest: #d2d9d4;
--control-transparent-bgColor-hover: #818b981a;
--brand-color-canvas-subtle: #f2f5f3;
--label-gray-fgColor-active: #424448;
--control-danger-fgColor-rest: #d1242f;
--avatar-borderColor: #1f232826;
--brand-Tabs-item-accent-fgColor-rest: #fff;
--data-lemon-color-emphasis: #866e04;
--brand-color-success-emphasis: #0fbf3e;
--base-color-scale-lemon-7: #614d01;
--brand-Card-animation-easing: cubic-bezier(.01, .73, .08, .93);
--label-green-fgColor-hover: #285c3b;
--brand-Eyebrowbanner-fgColor-blue-purple-start: #0377ff;
--brand-InlineCode-color-fg-default: #58635b;
--button-outline-bgColor-disabled: #eff2f5;
--control-borderColor-emphasis: #818b98;
--base-color-scale-green-5: #0fbf3e;
--reactionButton-selected-fgColor-hover: #0550ae;
--bgColor-danger-emphasis: #cf222e;
--brand-CTABanner-color-logo-filter-emphasis: brightness(0) saturate(100%) invert(12%) sepia(20%) saturate(450%) hue-rotate(172deg) brightness(100%) contrast(91%);
--borderColor-neutral-emphasis: #59636e;
--control-checked-borderColor-rest: #0969da;
--brand-Timeline-line-color: #b6bfb8;
--color-project-header-bg: #24292f;
--brand-FeatureComparisonTable-highlightedColumn-bgColor: #f2f5f3;
--color-ansi-gray: #59636e;
--brand-SubNav-overflowMenu-bgColor-hover: #f2f5f3;
--brand-button-secondary-fgColor-disabled: #c4ccc6;
--brand-button-primary-bgColor-hover: color-mix(in srgb, #08872b, #000 16%);
--label-purple-bgColor-rest: #f1e5ff;
--label-lime-bgColor-hover: #c7e580;
--brand-Eyebrowbanner-fgColor-purple-red-start: #8534f3;
--brand-Eyebrowbanner-bgColor-rest: #fff9;
--brand-IconButton-invisible-borderColor-rest: transparent;
--base-color-scale-indigo-0: #eff2ff;
--bgColor-upsell-muted: #fbefff;
--border-draft-emphasis: .0625rem solid #59636e;
--color-ansi-black-bright: #393f46;
--brand-button-primary-borderColor-disabled: transparent;
--brand-SubNav-color-link-active: #000;
--control-checked-bgColor-disabled: #818b98;
--borderColor-closed-muted: #ff818266;
--base-color-scale-yellow-4: #db9d00;
--brand-Icon-color-green: #08872b;
--brand-videoPlayer-controls-bgColor: #000;
--brand-ToggleSwitch-thumb-borderRadius: 624.938rem;
--fgColor-attention: #9a6700;
--base-color-scale-yellow-8: #653200;
--display-indigo-fgColor: #494edf;
--label-brown-bgColor-rest: #eeeae2;
--brand-FeatureComparisonTable-rowHighlight-bgColor: #f9fbf9;
--color-ansi-magenta-bright: #a475f9;
--brand-color-text-danger: #cf222e;
--color-marketing-icon-secondary: #54aeff;
--brand-SubNav-overflowMenu-fgColor-rest: #58635b;
--label-lemon-bgColor-hover: #f0db3d;
--codeMirror-syntax-fgColor-constant: #0550ae;
--base-color-scale-yellow-6: #a06100;
--button-star-iconColor: #eac54f;
--label-indigo-bgColor-hover: #d2d7fe;
--brand-videoPlayer-controls-fgColor: #f2f5f3;
--diffBlob-emptyLine-bgColor: #f6f8fa;
--color-notifications-row-read-bg: #f6f8fa;
--display-purple-bgColor-muted: #f1e5ff;
--buttonCounter-default-bgColor-rest: #818b981f;
--color-bg-discussions-row-emoji-box: #d1d5da80;
--label-teal-bgColor-active: #22d3c7;
--borderColor-severe-muted: #fb8f4466;
--border-open-emphasis: .0625rem solid #1a7f37;
--brand-Bento-item-borderRadius-small: 1rem;
--brand-control-checkbox-border-indeterminate-hover: #08872b;
--brand-color-canvas-default: #fff;
--display-yellow-bgColor-muted: #ffec9e;
--data-auburn-color-muted: #f2e9e9;
--buttonCounter-outline-fgColor-hover: #fff;
--button-outline-fgColor-hover: #fff;
--display-gray-fgColor: #5c6570;
--label-orange-bgColor-active: #fbaf74;
--base-color-scale-teal-7: #024b4d;
--reactionButton-selected-bgColor-hover: #caecff;
--buttonKeybindingHint-invisible-bgColor-disabled: #fff0;
--brand-control-color-canvas-disabled: #e4ebe6;
--brand-Tabs-item-default-bgColor-active: linear-gradient(180deg, #ffffff1f 0%, #9999991f 100%);
--diffBlob-emptyNum-bgColor: #f6f8fa;
--brand-Card-maxWidth: 26.25rem;
--brand-Accordion-toggle-color-blue-purple-start: #0377ff;
--base-color-scale-blue-2: #8dd6ff;
--controlKnob-bgColor-rest: #fff;
--display-red-borderColor-muted: #fecdcd;
--control-danger-bgColor-hover: #ffebe9;
--brand-ToggleSwitch-thumb-off-bgColor-rest: color-mix(in srgb, #77827a, black 4%);
--base-color-scale-gray-1: #e4ebe6;
--brand-PricingOptions-actionsMessage-bgColor: color-mix(in srgb, #3094ff 10%, transparent);
--brand-Tabs-item-accent-bgColor-rest: #08872b;
--bgColor-severe-muted: #fff1e5;
--brand-LogoSuite-color-logo-muted: #58635b;
--borderColor-transparent: #fff0;
--contribution-halloween-bgColor-3: #f68c41;
--brand-Accordion-toggle-color-teal: #197b7b;
--headerSearch-borderColor: #818b98;
--label-pine-bgColor-hover: #80efb9;
--brand-PricingOptions-actionsMessage-borderColor: color-mix(in srgb, #0055d5 20%, transparent);
--button-primary-bgColor-hover: #1c8139;
--fgColor-done: #8250df;
--display-cyan-bgColor-muted: #bdf4ff;
--label-brown-bgColor-active: #cbbda4;
--borderColor-open-emphasis: #1a7f37;
--control-checked-borderColor-disabled: #818b98;
--brand-Prose-code-bgColor: #eff2ff;
--diffBlob-deletionNum-fgColor: #1f2328;
--data-red-color-emphasis: #df0c24;
--base-color-scale-red-2: #ffaba8;
--brand-borderWidth-thin: max(1px, .0625rem);
--diffBlob-hunkLine-fgColor: #59636e;
--display-pink-bgColor-emphasis: #ce2c85;
--base-color-scale-pink-6: #ca2186;
--base-color-scale-orange-8: #5c2300;
--tooltip-fgColor: #fff;
--brand-FeatureComparisonTable-includedIndicator-fgColor: #08872b;
--overlay-borderColor: #d1d9e080;
--focus-outline-color: #0969da;
--label-blue-bgColor-active: #75c8ff;
--label-coral-fgColor-hover: #9b2712;
--button-default-fgColor-rest: #25292e;
--bgColor-accent-muted: #ddf4ff;
--brand-Icon-color-red: #cf2230;
--display-gray-bgColor-muted: #e8ecf2;
--label-lime-fgColor-active: #2f4a21;
--brand-button-primary-borderColor-active: #0d6731;
--brand-control-checkbox-border-indeterminate: #08872b;
--contribution-winter-bgColor-3: #0969da;
--buttonKeybindingHint-danger-borderColor-disabled: #818b981a;
--base-color-scale-indigo-8: #212183;
--label-yellow-bgColor-active: #ebb400;
--brand-Label-color-green-blue-purple-3: #08872b;
--display-coral-bgColor-muted: #ffe5db;
--display-auburn-bgColor-emphasis: #9d615c;
--brand-Testimonial-quoteMarkColor-default: #000;
--data-pine-color-muted: #bff8db;
--contribution-default-borderColor-1: #1f23280d;
--brand-color-danger-emphasis: #cf2230;
--brand-Icon-color-lime: #92c219;
--label-indigo-bgColor-rest: #e5e9ff;
--button-danger-borderColor-hover: #1f232826;
--button-inactive-fgColor: #59636e;
--brand-CarouselPagination-indicator-bgColor: #77827a;
--brand-ActionMenu-color-scrollbar-thumb-bg: #f2f5f3;
--contribution-default-bgColor-3: #2da44e;
--brand-button-secondary-bgColor-active: #00000036;
--fgColor-open: #1a7f37;
--button-default-bgColor-hover: #eff2f5;
--fgColor-sponsors: #bf3989;
--borderColor-success-emphasis: #1a7f37;
--buttonCounter-danger-fgColor-hover: #fff;
--label-red-fgColor-hover: #a60c29;
--brand-Icon-color-yellow: #be7d00;
--base-color-scale-blue-7: #0040a7;
--diffBlob-additionWord-bgColor: #aceebb;
--label-blue-borderColor: #fff0;
--counter-bgColor-muted: #818b981f;
```

### Spacing

```css
--tab-size-preference: 4;
--base-size-112: 7rem;
--base-size-12: .75rem;
--base-size-128: 8rem;
--base-size-16: 1rem;
--base-size-2: .125rem;
--base-size-20: 1.25rem;
--base-size-24: 1.5rem;
--base-size-28: 1.75rem;
--base-size-32: 2rem;
--base-size-36: 2.25rem;
--base-size-4: .25rem;
--base-size-40: 2.5rem;
--base-size-44: 2.75rem;
--base-size-48: 3rem;
--base-size-6: .375rem;
--base-size-64: 4rem;
--base-size-8: .5rem;
--base-size-80: 5rem;
--base-size-96: 6rem;
--base-size-negative-12: -.75rem;
--base-size-negative-16: -1rem;
--base-size-negative-2: -.125rem;
--base-size-negative-20: -1.25rem;
--base-size-negative-24: -1.5rem;
--base-size-negative-28: -1.75rem;
--base-size-negative-32: -2rem;
--base-size-negative-36: -2.25rem;
--base-size-negative-4: -.25rem;
--base-size-negative-40: -2.5rem;
--base-size-negative-44: -2.75rem;
--base-size-negative-48: -3rem;
--base-size-negative-6: -.375rem;
--base-size-negative-8: -.5rem;
--base-text-size-2xl: 2.5rem;
--base-text-size-lg: 1.25rem;
--base-text-size-md: 1rem;
--base-text-size-sm: .875rem;
--base-text-size-xl: 2rem;
--base-text-size-xs: .75rem;
--control-large-paddingBlock: .625rem;
--control-medium-paddingBlock: .375rem;
--control-xlarge-paddingBlock: .875rem;
--control-xsmall-paddingBlock: .125rem;
--control-large-gap: .5rem;
--control-large-paddingInline-condensed: .5rem;
--control-large-paddingInline-normal: .75rem;
--control-large-paddingInline-spacious: 1rem;
--control-large-size: 2.5rem;
--control-medium-gap: .5rem;
--control-medium-paddingInline-condensed: .5rem;
--control-medium-paddingInline-normal: .75rem;
--control-medium-paddingInline-spacious: 1rem;
--control-medium-size: 2rem;
--control-small-gap: .25rem;
--control-small-paddingBlock: .25rem;
--control-small-paddingInline-condensed: .5rem;
--control-small-paddingInline-normal: .75rem;
--control-small-paddingInline-spacious: 1rem;
--control-small-size: 1.75rem;
--control-xlarge-gap: .5rem;
--control-xlarge-paddingInline-condensed: .5rem;
--control-xlarge-paddingInline-normal: .75rem;
--control-xlarge-paddingInline-spacious: 1rem;
--control-xlarge-size: 3rem;
--control-xsmall-gap: .25rem;
--control-xsmall-paddingInline-condensed: .25rem;
--control-xsmall-paddingInline-normal: .5rem;
--control-xsmall-paddingInline-spacious: .75rem;
--control-xsmall-size: 1.5rem;
--controlStack-large-gap-auto: .5rem;
--controlStack-large-gap-condensed: .5rem;
--controlStack-large-gap-spacious: .75rem;
--controlStack-medium-gap-auto: .5rem;
--controlStack-medium-gap-condensed: .5rem;
--controlStack-medium-gap-spacious: .75rem;
--controlStack-small-gap-auto: .5rem;
--controlStack-small-gap-condensed: .5rem;
--controlStack-small-gap-spacious: 1rem;
--overlay-padding-condensed: .5rem;
--overlay-padding-normal: 1rem;
--overlay-paddingBlock-condensed: .25rem;
--overlay-paddingBlock-normal: .75rem;
--spinner-size-large: 4rem;
--spinner-size-medium: 2rem;
--spinner-size-small: 1rem;
--stack-gap-condensed: .5rem;
--stack-gap-normal: 1rem;
--stack-gap-spacious: 1.5rem;
--stack-padding-condensed: .5rem;
--stack-padding-normal: 1rem;
--stack-padding-spacious: 1.5rem;
--space-lg: 1rem;
--space-md: .75rem;
--space-sm: .5rem;
--space-xl: 1.5rem;
--space-xs: .25rem;
--space-xxs: .125rem;
--fontStack-monospace: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
--text-codeBlock-size: .8125rem;
--text-codeInline-size: .9285em;
--text-body-size-large: var(--base-text-size-md);
--text-body-size-medium: var(--base-text-size-sm);
--text-body-size-small: var(--base-text-size-xs);
--text-caption-size: var(--base-text-size-xs);
--text-display-size: var(--base-text-size-2xl);
--text-subtitle-size: var(--base-text-size-lg);
--text-title-size-large: var(--base-text-size-xl);
--text-title-size-medium: var(--base-text-size-lg);
--text-title-size-small: var(--base-text-size-md);
--h00-size-mobile: 2.5rem;
--h0-size-mobile: 2rem;
--h1-size-mobile: 1.625rem;
--h2-size-mobile: 1.375rem;
--h3-size-mobile: 1.125rem;
--h00-size: 3rem;
--h0-size: 2.5rem;
--h1-size: 2rem;
--h2-size: 1.5rem;
--h3-size: 1.25rem;
--h4-size: 1rem;
--h5-size: .875rem;
--h6-size: .75rem;
--body-font-size: .875rem;
--font-size-small: .75rem;
--Layout-column-gap: var(--base-size-16);
--Layout-row-gap: var(--base-size-16);
--Layout-outer-spacing-x: 0px;
--Layout-outer-spacing-y: 0px;
--Layout-inner-spacing-min: 0px;
--Layout-inner-spacing-max: 0px;
--actionListContent-paddingBlock: var(--control-medium-paddingBlock);
--brand-RiverBreakout-variant-gridline-spacing-outerBlock: 4rem;
--brand-Button-icon-size-large: 1.25rem;
--brand-Prose-blockquote-spacing: 1.5rem;
--brand-text-letterSpacing-100: .21px;
--brand-Grid-spacing-margin: 1rem;
--brand-text-size-700: 2.5rem;
--brand-River-label-margin: 1rem;
--brand-stack-gap-spacious: 3rem;
--brand-text-subhead-size-medium: 1rem;
--brand-control-large-paddingBlock-condensed: .75rem;
--brand-text-letterSpacing-700: 0;
--brand-controlStack-large-gap-spacious: .75rem;
--brand-VideoPlayer-closedCaption-margin: 0 auto 15px auto;
--brand-box-spacing-condensed: 1rem;
--brand-RiverBreakout-variant-gridline-spacing-outerInline: 4rem;
--brand-Section-variant-gridline-paddingInline: 4rem;
--brand-Spinner-size-large: 1.5rem;
--brand-text-size-800: 3rem;
--brand-Timeline-bullet-size: .5rem;
--brand-FAQ-heading-marginBottom: 6rem;
--brand-Testimonial-expressive-quote-fontSize: 2rem;
--brand-controlStack-small-gap-condensed: .5rem;
--brand-RiverBreakout-variant-gridline-spacing-outerBlockEnd: 5rem;
--brand-Grid-spacing-row: 3rem;
--brand-PricingOptions-items1-container-paddingInline: 2rem;
--brand-text-subhead-letterSpacing-large: .1px;
--brand-ToggleSwitch-thumb-size-medium: calc(1.25rem - .125rem);
--brand-IconButton-control-size-small: 2rem;
--brand-Statistic-spacing-spacious: 2rem;
--brand-IconButton-icon-size-small: 1rem;
--brand-IconButton-control-size-medium: 2.6875rem;
--brand-text-letterSpacing-800: 0;
--brand-LogoSuite-logobar-marquee-gap-condensed: 2.5rem;
--brand-River-variant-gridline-visual-padding: 4rem;
--brand-box-spacing-spacious: 3rem;
--brand-control-large-gap: 1rem;
--brand-control-small-size: 2rem;
--brand-Prose-img-spacing: 3rem;
--brand-Button-icon-size-small: 1rem;
--brand-Section-padding-condensed: 3rem;
--brand-Testimonial-quote-letterSpacing-large: 0;
--brand-ToggleSwitch-label-fontSize: 1rem;
--brand-stack-padding-spacious: 3rem;
--brand-River-spacing-innerY: 2rem;
--brand-control-medium-paddingInline-normal: 1rem;
--brand-text-subhead-letterSpacing-medium: .24px;
--brand-River-variant-gridline-spacing-outerBlock: 4rem;
--brand-control-large-paddingInline-condensed: 1rem;
--brand-control-large-paddingBlock-normal: 1.25rem;
--brand-ToggleSwitch-loading-gap: .5rem;
--brand-EyebrowBanner-spacing-inner-inline: 1.25rem;
--brand-RiverBreakout-spacing-inner: 4rem;
--brand-Hero-narrow-padding: 6rem 0;
--brand-Testimonial-expressive-quote-letterSpacing: -.02em;
--brand-heading-letterSpacing-900: 0;
--brand-text-size-500: 1.75rem;
--brand-PricingOptions-items3-container-padding-inline: 1.5rem;
--brand-controlStack-small-gap-spacious: 1rem;
--brand-PricingOptions-items2-gap: 6rem;
--brand-Button-control-size-large: 3.75rem;
--brand-EyebrowBanner-subHeading-size: 1rem;
--brand-IconButton-icon-size-large: 1.25rem;
--brand-text-size-200: 1rem;
--brand-heading-letterSpacing-700: 0;
--brand-text-letterSpacing-200: .24px;
--brand-controlStack-medium-gap-condensed: .5rem;
--brand-text-letterSpacing-900: 0;
--brand-Bento-content-padding-normal: 1.5rem;
--brand-Bento-content-padding-condensed: 1rem;
--brand-heading-letterSpacing-500: 0;
--brand-text-subhead-size-large: 1.25rem;
--brand-text-letterSpacing-400: 0;
--brand-text-size-1000: 4rem;
--brand-Tabs-container-padding: .25rem;
--brand-LogoSuite-logobar-columnGap-condensed: 2.5rem;
--brand-text-letterSpacing-600: 0;
--brand-stack-gap-condensed: 1rem;
--brand-control-large-paddingInline-spacious: 2rem;
--brand-Testimonial-quote-fontSize-default: 1.375rem;
--brand-PricingOptions-items2-container-padding-inline: 3rem;
--base-size-88: 5.5rem;
--brand-control-large-size: 3.75rem;
--brand-heading-letterSpacing-400: 0;
--brand-Testimonial-expressive-name-letterSpacing: .0107em;
--brand-Button-icon-size-medium: 1rem;
--brand-Timeline-bullet-spacing: .125rem;
--brand-text-size-350: 1.25rem;
--brand-River-heading-margin: 1rem;
--brand-control-medium-paddingInline-condensed: .75rem;
--brand-control-medium-paddingInline-spacious: 1.75rem;
--brand-control-large-paddingInline-normal: 1.25rem;
--brand-RiverAccordion-variant-gridline-spacing-outerInline: 4rem;
--brand-VideoPlayer-closedCaption-text-padding: .625rem;
--brand-box-spacing-normal: 1.5rem;
--brand-text-letterSpacing-500: 0;
--brand-RiverAccordion-variant-gridline-spacing-outerBlock: 4rem;
--brand-Spinner-size-medium: 1rem;
--brand-River-spacing-outerBlock: 3rem;
--brand-IconButton-control-size-large: 3.75rem;
--brand-Tiles-item-maxSize: 11.5rem;
--brand-text-size-100: .875rem;
--brand-River-variant-gridline-spacing-outerInline: 4rem;
--brand-text-size-900: 3.5rem;
--brand-Bento-gap-medium: 2rem;
--brand-PricingOptions-items4-gap: 3rem;
--brand-fontStack-monospace: "Mona Sans Mono", monospace;
--brand-ToggleSwitch-loading-size: .75rem;
--brand-Testimonial-quote-letterSpacing-default: 0;
--brand-Statistic-spacing-condensed: 1rem;
--brand-VideoPlayer-tooltip-padding-inline: .3125rem;
--brand-controlStack-large-gap-auto: .5rem;
--brand-RiverBreakout-variant-gridline-spacing-contentGap: 1.5rem;
--brand-control-small-paddingInline-normal: .75rem;
--brand-heading-letterSpacing-1000: -.014rem;
--brand-control-small-paddingInline-spacious: 1.5rem;
--brand-ToggleSwitch-label-gap: .75rem;
--brand-text-size-400: 1.375rem;
--brand-text-letterSpacing-300: .18px;
--brand-ToggleSwitch-thumb-size-small: .75rem;
--brand-IconButton-control-size: 2.6875rem;
--brand-Grid-spacing-column-gap: 3rem;
--brand-control-medium-paddingBlock-normal: 1rem;
--brand-heading-letterSpacing-600: 0;
--brand-Button-control-size-medium: 2.6875rem;
--brand-text-size-600: 2.125rem;
--brand-control-small-paddingBlock: .5rem;
--brand-EyebrowBanner-heading-size: 1rem;
--brand-Button-control-size-small: 2rem;
--brand-control-medium-gap: .75rem;
--brand-IconButton-icon-size: 1.25rem;
--brand-stack-padding-normal: 1.5rem;
--brand-text-letterSpacing-350: .18px;
--brand-controlStack-medium-gap-spacious: .75rem;
--brand-RiverAccordion-variant-gridline-spacing-contentGap: 4rem;
--brand-Bento-content-padding-spacious: 3.5rem;
--brand-River-spacing-inner: 1.5rem;
--brand-Hero-regular-padding: 8rem 0;
--brand-LogoSuite-logobar-rowGap: 2.5rem;
--brand-Testimonial-minimal-quote-fontSize-large: 2rem;
--brand-Section-padding-normal: 6rem;
--brand-EyebrowBanner-spacing-inner-block: .875rem;
--brand-control-medium-size: 2.6875rem;
--brand-text-size-300: 1.125rem;
--brand-LogoSuite-logobar-marquee-gap-default: 6rem;
--brand-IconButton-icon-size-medium: 1.25rem;
--brand-Statistic-spacing-normal: 1.5rem;
--brand-control-small-gap: .5rem;
--brand-Bento-gap-small: 1.25rem;
--brand-LogoSuite-logobar-columnGap-default: 5rem;
--brand-Bento-gap-large: 2rem;
--brand-PricingOptions-items4-container-padding-inline: 1.5rem;
--base-size-60: 3.75rem;
--brand-PricingOptions-items3-gap: 4rem;
--brand-Testimonial-expressive-position-letterSpacing: .01em;
--brand-Section-padding-spacious: 8rem;
--brand-controlStack-large-gap-condensed: .5rem;
--brand-Testimonial-quote-fontSize-large: 1.75rem;
--brand-heading-letterSpacing-800: 0;
--brand-EyebrowBanner-label-size: 1rem;
--brand-stack-gap-normal: 1.5rem;
--brand-control-small-paddingInline-condensed: .5rem;
--brand-control-medium-paddingBlock-condensed: .375rem;
--brand-PricingOptions-items-gap: 1.5rem;
--brand-stack-padding-condensed: 1rem;
--brand-Timeline-spacing: 1rem;
--brand-text-letterSpacing-1000: -.035em;
--brand-Spinner-size-small: .75rem;
--brand-VideoPlayer-tooltip-padding-block: .3125rem;
```

### Typography

```css
--base-text-lineHeight-loose: 1.75;
--base-text-lineHeight-normal: 1.5;
--base-text-lineHeight-relaxed: 1.625;
--base-text-lineHeight-snug: 1.375;
--base-text-lineHeight-tight: 1.25;
--base-text-weight-light: 300;
--base-text-weight-medium: 500;
--base-text-weight-normal: 400;
--base-text-weight-semibold: 600;
--fontStack-sansSerif: "Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Backtick Fix", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--fontStack-sansSerifDisplay: "Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Backtick Fix", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--fontStack-system: "Mona Sans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Backtick Fix", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--text-body-lineHeight-large: var(--base-text-lineHeight-normal);
--text-body-lineHeight-medium: var(--base-text-lineHeight-normal);
--text-body-lineHeight-small: var(--base-text-lineHeight-relaxed);
--text-body-weight: var(--base-text-weight-normal);
--text-caption-lineHeight: var(--base-text-lineHeight-tight);
--text-caption-weight: var(--base-text-weight-normal);
--text-codeBlock-lineHeight: var(--base-text-lineHeight-normal);
--text-codeBlock-weight: var(--base-text-weight-normal);
--text-codeInline-weight: var(--base-text-weight-normal);
--text-display-lineHeight: var(--base-text-lineHeight-snug);
--text-display-weight: var(--base-text-weight-medium);
--text-subtitle-lineHeight: var(--base-text-lineHeight-relaxed);
--text-subtitle-weight: var(--base-text-weight-normal);
--text-title-lineHeight-large: var(--base-text-lineHeight-normal);
--text-title-lineHeight-medium: var(--base-text-lineHeight-relaxed);
--text-title-lineHeight-small: var(--base-text-lineHeight-normal);
--text-title-weight-large: var(--base-text-weight-semibold);
--text-title-weight-medium: var(--base-text-weight-semibold);
--text-title-weight-small: var(--base-text-weight-semibold);
--text-body-shorthand-large: var(--text-body-weight) var(--text-body-size-large) / var(--text-body-lineHeight-large) var(--fontStack-sansSerif);
--text-body-shorthand-medium: var(--text-body-weight) var(--text-body-size-medium) / var(--text-body-lineHeight-medium) var(--fontStack-sansSerif);
--text-body-shorthand-small: var(--text-body-weight) var(--text-body-size-small) / var(--text-body-lineHeight-small) var(--fontStack-sansSerif);
--text-caption-shorthand: var(--text-caption-weight) var(--text-caption-size) / var(--text-caption-lineHeight) var(--fontStack-sansSerif);
--text-codeBlock-shorthand: var(--text-codeBlock-weight) var(--text-codeBlock-size) / var(--text-codeBlock-lineHeight) var(--fontStack-monospace);
--text-codeInline-shorthand: var(--text-codeInline-weight) var(--text-codeInline-size) var(--fontStack-monospace);
--text-display-shorthand: var(--text-display-weight) var(--text-display-size) / var(--text-display-lineHeight) var(--fontStack-sansSerifDisplay);
--text-subtitle-shorthand: var(--text-subtitle-weight) var(--text-subtitle-size) / var(--text-subtitle-lineHeight) var(--fontStack-sansSerifDisplay);
--text-title-shorthand-large: var(--text-title-weight-large) var(--text-title-size-large) / var(--text-title-lineHeight-large) var(--fontStack-sansSerifDisplay);
--text-title-shorthand-medium: var(--text-title-weight-medium) var(--text-title-size-medium) / var(--text-title-lineHeight-medium) var(--fontStack-sansSerifDisplay);
--text-title-shorthand-small: var(--text-title-weight-small) var(--text-title-size-small) / var(--text-title-lineHeight-small) var(--fontStack-sansSerif);
--diff-line-height: 24px;
--brand-text-weight-300: 400;
--brand-TextCursorAnimation-cursor-animationDuration: .833s;
--brand-text-weight-350: 400;
--base-text-weight-regular: 400;
--brand-text-lineHeight-900: 1.1;
--brand-text-weight-800: 400;
--brand-text-weight-extralight: 400;
--brand-text-weight-500: 400;
--brand-text-lineHeight-500: 1.35;
--base-text-weight-extrabold: 800;
--brand-text-lineHeight-700: 1.2;
--base-text-weight-bold: 700;
--prettylights-syntax-carriageReturn-text: #f6f8fa;
--brand-text-weight-200: 400;
--brand-fontStack-sansSerifAlt: "Hubot Sans", "Hubot SansHeaderFallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--brand-text-subhead-lineHeight-large: 1.3;
--prettylights-syntax-markup-deleted-text: #82071e;
--prettylights-syntax-markup-ignored-text: #d1d9e0;
--brand-text-style-italic-3: "ital" 3;
--brand-text-style-italic-10: "ital" 10;
--brand-text-weight-900: 400;
--brand-text-style-italic-7: "ital" 7;
--brand-text-style-italic-1: "ital" 1;
--brand-text-lineHeight-200: 1.5;
--brand-text-weight-heavy: 550;
--brand-heading-fontFamilyAlt: "Hubot Sans", "Hubot SansHeaderFallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--brand-text-lineHeight-600: 1.3;
--brand-Testimonial-expressive-quote-fontWeight: 425;
--brand-text-weight-normal: 400;
--brand-body-fontFamily: "Mona Sans", "MonaSansFallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--brand-text-lineHeight-100: 1.5;
--brand-text-lineHeight-800: 1.18;
--brand-text-style-italic-8: "ital" 8;
--brand-text-weight-regular: 400;
--brand-heading-fontFamily: "Mona Sans", "MonaSansFallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--brand-text-style-italic-4: "ital" 4;
--brand-text-style-italic-2: "ital" 2;
--brand-Testimonial-quote-fontWeight-default: 425;
--brand-text-weight-medium: 500;
--brand-text-subhead-weight-medium: 550;
--base-text-weight-extralight: 200;
--brand-text-style-italic-6: "ital" 6;
--brand-text-weight-bold: 537;
--base-text-weight-heavy: 900;
--brand-text-weight-700: 400;
--prettylights-syntax-markup-inserted-text: #116329;
--brand-body-fontFamilyAlt: "Hubot Sans", "Hubot SansHeaderFallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--brand-text-weight-light: 400;
--brand-text-subhead-weight-large: 500;
--brand-text-style-italic-9: "ital" 9;
--prettylights-syntax-invalid-illegal-text: #d1242f;
--prettylights-syntax-carriage-return-text: #f6f8fa;
--prettylights-syntax-invalidIllegal-text: #d1242f;
--brand-text-weight-semibold: 525;
--brand-text-weight-1000: 400;
--brand-text-subhead-lineHeight-medium: 1.3;
--brand-text-lineHeight-1000: 1.08;
--brand-text-lineHeight-350: 1.5;
--brand-fontStack-system: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--brand-text-weight-100: 400;
--brand-Testimonial-quote-fontWeight-large: 460;
--brand-text-weight-extrabold: 543;
--brand-fontStack-sansSerif: "Mona Sans", "MonaSansFallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--brand-text-weight-400: 400;
--prettylights-syntax-markup-changed-text: #953800;
--brand-text-lineHeight-400: 1.4;
--brand-text-lineHeight-300: 1.5;
--brand-text-weight-600: 400;
--brand-text-style-italic-5: "ital" 5;
```

### Shadows

```css
--boxShadow-thick: inset 0 0 0 var(--borderWidth-thick);
--boxShadow-thicker: inset 0 0 0 var(--borderWidth-thicker);
--boxShadow-thin: inset 0 0 0 var(--borderWidth-thin);
--shadow-floating-small: 0 0 0 1px #d1d9e040, 0 6px 12px -3px #25292e0a, 0 6px 18px 0 #25292e1f;
--shadow-inset: inset 0 1px 0 0 #1f23280a;
--brand-River-visual-shadow: 0px 100px 80px #00000004, 0px 41.7776px 33.4221px #00000006, 0px 22.3363px 17.869px #00000007, 0px 12.5216px 10.0172px #00000009, 0px 6.6501px 5.32008px #0000000b, 0px 2.76726px 2.21381px #00000012;
--brand-FrostedGlassVFX-boxShadow: 0 4px 10px 0 #00000005;
--shadow-floating-large: 0 0 0 1px #d1d9e000, 0 40px 80px 0 #25292e3d;
--shadow-floating-medium: 0 0 0 1px #d1d9e000, 0 8px 16px -4px #25292e14, 0 4px 32px -4px #25292e14, 0 24px 48px -12px #25292e14, 0 48px 96px -24px #25292e14;
--shadow-resting-small: 0 1px 1px 0 #1f23280a, 0 1px 2px 0 #1f232808;
--shadow-resting-medium: 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f;
--shadow-resting-xsmall: 0 1px 1px 0 #1f23280d;
--button-default-shadow-resting: 0 1px 0 0 #1f23280a;
--button-danger-shadow-selected: inset 0 1px 0 0 #4c001433;
--button-outline-shadow-selected: inset 0 1px 0 0 #00215533;
--brand-SubNav-shadow: 0px 100px 80px #00000003, 0px 41px 33px #00000005, 0px 22px 17px #00000005, 0px 12px 10px #00000008, 0px 6px 5px #0000000a, 0px 2px 2px #00000012;
--avatar-shadow: 0 0 0 2px #fffc;
--shadow-floating-xlarge: 0 0 0 1px #d1d9e000, 0 56px 112px 0 #25292e52;
```

### Other

```css
--base-duration-0: 0s;
--base-duration-100: .1s;
--base-duration-1000: 1s;
--base-duration-200: .2s;
--base-duration-300: .3s;
--base-duration-400: .4s;
--base-duration-50: 50ms;
--base-duration-500: .5s;
--base-duration-600: .6s;
--base-duration-700: .7s;
--base-duration-800: .8s;
--base-duration-900: .9s;
--base-easing-ease: cubic-bezier(.25, .1, .25, 1);
--base-easing-easeIn: cubic-bezier(.7, .1, .75, .9);
--base-easing-easeInOut: cubic-bezier(.6, 0, .2, 1);
--base-easing-easeOut: cubic-bezier(.3, .8, .6, 1);
--base-easing-linear: cubic-bezier(0, 0, 1, 1);
--base-zIndex-0: 0;
--base-zIndex-100: 100;
--base-zIndex-200: 200;
--base-zIndex-300: 300;
--base-zIndex-400: 400;
--base-zIndex-500: 500;
--base-zIndex-600: 600;
--motion-duration-long: var(--base-duration-500);
--motion-duration-medium: var(--base-duration-300);
--motion-duration-micro: var(--base-duration-100);
--motion-duration-short: var(--base-duration-200);
--motion-easing-enter: var(--base-easing-easeOut);
--motion-easing-exit: var(--base-easing-easeIn);
--motion-easing-hover: var(--base-easing-ease);
--motion-easing-linear: var(--base-easing-linear);
--motion-easing-move: var(--base-easing-easeInOut);
--motion-transition-enter: var(--motion-duration-medium) var(--motion-easing-enter);
--motion-transition-exit: var(--motion-duration-short) var(--motion-easing-exit);
--motion-transition-hover: var(--motion-duration-micro) var(--motion-easing-hover);
--motion-transition-stateChange: var(--motion-duration-short) var(--motion-easing-move);
--focus-outline-offset: -.125rem;
--focus-outline-width: .125rem;
--outline-focus-offset: var(--focus-outline-offset);
--outline-focus-width: var(--focus-outline-width);
--breakpoint-large: 63.25rem;
--breakpoint-medium: 48rem;
--breakpoint-small: 34rem;
--breakpoint-xlarge: 80rem;
--breakpoint-xsmall: 20rem;
--breakpoint-xxlarge: 87.5rem;
--overlay-height-large: 27rem;
--overlay-height-medium: 20rem;
--overlay-height-small: 16rem;
--overlay-height-xlarge: 37.5rem;
--overlay-offset: .25rem;
--overlay-width-large: 40rem;
--overlay-width-medium: 30rem;
--overlay-width-small: 20rem;
--overlay-width-xlarge: 60rem;
--overlay-width-xsmall: 12rem;
--spinner-strokeWidth-default: .125rem;
--control-minTarget-coarse: 2.75rem;
--control-minTarget-fine: 1rem;
--zIndex-behind: -1;
--zIndex-default: 0;
--zIndex-dropdown: 200;
--zIndex-modal: 400;
--zIndex-overlay: 300;
--zIndex-skipLink: 600;
--zIndex-sticky: 100;
--Layout-pane-width: 220px;
--Layout-content-width: 100%;
--Layout-template-columns: 1fr var(--Layout-pane-width);
--Layout-template-areas: "content pane";
--duration-fast: 80ms;
--easing-easeInOut: cubic-bezier(.65,0,.35,1);
--pr-toolbar-sticky-header-height: max(var(--observed-header-height,60px), 60px);
--line-number-cell-width: 44px;
--line-number-cell-width-unified: 88px;
--diff-line-minimum-height: 24px;
--diff-action-bar-position: 0;
--brand-control-radio-dot-checked-hover: color-mix(in srgb, #08872b, #000 26%);
--display-teal-scale-0: #c7f5ef;
--brand-breakpoint-xsmall: 20rem;
--brand-breakpoint-large: 63.25rem;
--display-orange-scale-3: #f68c41;
--brand-Eyebrowbanner-icon-background-teal: #daf9f5;
--display-red-scale-1: #fecdcd;
--display-auburn-scale-8: #5d3937;
--display-red-scale-4: #f85461;
--display-purple-scale-2: #d1b1fc;
--brand-InlineLink-transition-timing: .3s;
--display-olive-scale-2: #b9c832;
--display-yellow-scale-5: #946a00;
--brand-ToggleSwitch-label-lineHeight: 1rem;
--brand-animation-transition-default: opacity .6s cubic-bezier(.16, 1, .3, 1), transform .6s cubic-bezier(.16, 1, .3, 1);
--display-auburn-scale-6: #8a5551;
--display-pink-scale-1: #fdc9e2;
--display-lemon-scale-2: #d8bd0e;
--display-indigo-scale-4: #7a82f0;
--display-purple-scale-9: #391b79;
--brand-FAQGroup-buttonIndicator-active: #0d6731;
--display-pine-scale-7: #135d41;
--brand-animation-variant-scaleInLeft-start: .9;
--brand-Timeline-lineLength: 44ch;
--display-yellow-scale-1: #ffd642;
--brand-FrostedGlassVFX-blurIntensity-medium: 3rem;
--brand-control-animation-duration: 80ms;
--display-red-scale-0: #ffe2e0;
--display-indigo-scale-3: #979ff7;
--brand-Testimonial-quoteMarkBackground-coral: #fff0eb;
--display-teal-scale-7: #0d5b63;
--display-purple-scale-8: #4f21ab;
--display-lime-scale-8: #2f4a21;
--brand-FeatureComparisonTable-fourItems-featureColumnWidth: 20%;
--display-cyan-scale-2: #00d0fa;
--display-indigo-scale-2: #b1b9fb;
--display-pine-scale-2: #1dd781;
--prc-dialog-scrollgutter: 0px;
--brand-Testimonial-expressive-maxWidth: 73.5rem;
--display-olive-scale-0: #f0f0ad;
--display-brown-scale-7: #64513a;
--brand-VideoPlayer-playButton-width: 6rem;
--display-auburn-scale-4: #b4827e;
--display-plum-scale-5: #a830e8;
--display-gray-scale-8: #424448;
--display-coral-scale-5: #d43511;
--brand-FeatureComparisonTable-default-featureColumnWidth: 25%;
--display-lemon-scale-3: #c2a60a;
--display-green-scale-0: #caf7ca;
--display-coral-scale-0: #ffe5db;
--brand-SubNav-height-overflowMenuItemMin: 2.5rem;
--brand-ToggleSwitch-thumb-travel-medium: 1.25rem;
--display-coral-scale-4: #f25f3a;
--display-teal-scale-9: #073740;
--display-pink-scale-4: #e55da5;
--brand-Timeline-lineHeight: 1.5;
--brand-Testimonial-expressive-media-width: 19.5rem;
--display-purple-scale-6: #783ae4;
--display-olive-scale-8: #3b4927;
--brand-heading-weight-1000: 425;
--display-pink-scale-9: #4d233d;
--brand-TestimonialGroup-fadeInDuration: .475s;
--display-cyan-scale-6: #006a80;
--brand-animation-variant-scaleInUp-end: 1;
--display-orange-scale-2: #fbaf74;
--brand-animation-variant-scaleInDown-end: 1;
--display-brown-scale-1: #dfd7c8;
--brand-ToggleSwitch-focus-offset: .125rem;
--display-orange-scale-7: #8d3c11;
--display-yellow-scale-6: #805900;
--display-pink-scale-6: #b12f79;
--brand-heading-weight-900: 440;
--display-pine-scale-3: #1dbf76;
--prettylights-syntax-markup-bold: #1f2328;
--display-brown-scale-4: #a68b64;
--brand-Accordion-indicator-hover: #96a199;
--display-orange-scale-8: #70300f;
--display-gray-scale-7: #4e535a;
--brand-Testimonial-quoteMarkBackground-green: #ebf9f4;
--control-minTarget-auto: 1rem;
--prettylights-syntax-bracketHighlighterAngle: #59636e;
--display-green-scale-4: #30a147;
--brand-Testimonial-quoteMarkBackground-yellow: #fff8c5;
--ansi-magentaBright: #a475f9;
--display-cyan-scale-1: #7ae9ff;
--display-red-scale-5: #df0c24;
--prettylights-syntax-constantOtherReferenceLink: #0a3069;
--brand-FrostedGlassVFX-blurIntensity-low: .75rem;
--display-yellow-scale-7: #704d00;
--brand-Accordion-indicator-idle: #c4ccc6;
--display-indigo-scale-1: #d2d7fe;
--brand-ToggleSwitch-track-width-medium: 2.75rem;
--display-plum-scale-6: #961edc;
--brand-FAQGroup-buttonIndicator-idle: #c4ccc6;
--display-red-scale-6: #c50d28;
--brand-ToggleSwitch-target-minHeight: 1.5rem;
--brand-Eyebrowbanner-icon-background-lemon: #fdf5b3;
--display-auburn-scale-7: #744744;
--ansi-cyanBright: #3192aa;
--display-lime-scale-6: #476c28;
--brand-heading-lineHeight-800: 1.2;
--ansi-white: #59636e;
--display-orange-scale-5: #b8500f;
--brand-Testimonial-quoteMarkBackground-lime: #f3fec8;
--prettylights-syntax-entity: #6639ba;
--display-teal-scale-4: #179b9b;
--display-yellow-scale-3: #d19d00;
--brand-animation-duration-default: .6s;
--display-pine-scale-1: #80efb9;
--brand-Testimonial-quoteMarkBackground-gray: #f2f5f3;
--display-coral-scale-2: #fcab92;
--display-plum-scale-8: #651d96;
--display-plum-scale-1: #f0cdfe;
--display-lime-scale-2: #9bd039;
--prettylights-syntax-brackethighlighter-unmatched: #82071e;
--brand-Accordion-indicator-active: #0d6731;
--display-lime-scale-3: #80b530;
--display-cyan-scale-0: #bdf4ff;
--brand-animation-variant-scaleInDown-distance: -3.125rem;
--brand-Eyebrowbanner-icon-background-purple: #f0e5ff;
--brand-VideoPlayer-range-minWidth: 4.6875rem;
--brand-heading-weight-400: 480;
--display-orange-scale-1: #fecfaa;
--brand-animation-easing-glide: cubic-bezier(.33, 1, .68, 1);
--display-pink-scale-7: #8e2e66;
--display-plum-scale-7: #7d1eb8;
--display-indigo-scale-7: #393cd5;
--display-coral-scale-9: #5d180e;
--brand-animation-variant-scaleIn-end: 1;
--display-red-scale-8: #880c27;
--prettylights-syntax-constant-other-reference-link: #0a3069;
--brand-animation-variant-scaleInLeft-distance: 1.25rem;
--brand-Eyebrowbanner-icon-background-blue: #ddf4ff;
--brand-animation-easing-default: cubic-bezier(.16, 1, .3, 1);
--display-lemon-scale-6: #786002;
--brand-SubNav-width-overflowMenuInset: 2rem;
--display-pink-scale-0: #ffe5f1;
--brand-Icon-background-lemon: #fdf5b3;
--brand-Testimonial-quoteMarkBackground-purple: #f0e5ff;
--brand-Testimonial-minimal-quote-lineHeight: 1.35;
--brand-FAQ-maxWidth-list: 51rem;
--ansi-magenta: #8250df;
--display-teal-scale-8: #0a4852;
--display-brown-scale-0: #eeeae2;
--brand-Spinner-animationDuration-reducedMotion: 1.6s;
--brand-Testimonial-quoteMarkBackground-blue: #ddf4ff;
--prettylights-syntax-markup-list: #3b2300;
--display-green-scale-7: #285c3b;
--display-auburn-scale-2: #d4b7b5;
--display-red-scale-2: #fda5a7;
--display-auburn-scale-0: #f2e9e9;
--brand-ToggleSwitch-focus-width: .25rem;
--display-red-scale-7: #a60c29;
--brand-animation-variant-scaleInRight-start: .9;
--display-coral-scale-8: #7e2011;
--brand-heading-lineHeight-900: 1;
--display-purple-scale-0: #f1e5ff;
--ansi-redBright: #a40e26;
--brand-ToggleSwitch-track-height-medium: 1.5rem;
--display-pink-scale-2: #f8a5cf;
--ansi-greenBright: #1a7f37;
--brand-animation-variant-slideInRight-distance: -.9375rem;
--display-gray-scale-4: #808fa3;
--display-lime-scale-0: #e3f2b5;
--brand-Icon-background-teal: #daf9f5;
--brand-IconButton-spinner-animationDuration-reducedMotion: 1.6s;
--display-pine-scale-6: #156f4b;
--brand-Icon-background-green: #ebf9f4;
--brand-Eyebrowbanner-icon-background-coral: #fff0eb;
--brand-Icon-background-purple: #f0e5ff;
--display-brown-scale-3: #b8a484;
--display-blue-scale-8: #003d99;
--brand-Eyebrowbanner-icon-background-red: #ffebe9;
--brand-Icon-background-lime: #f3fec8;
--display-gray-scale-1: #d2dae4;
--ansi-whiteBright: #818b98;
--brand-LogoSuite-logobar-marquee-slow: 60s;
--ansi-cyan: #1b7c83;
--brand-control-minTarget-coarse: 2.75rem;
--display-yellow-scale-4: #b88700;
--brand-Icon-background-pink: #fff0fc;
--display-purple-scale-5: #894ceb;
--ansi-green: #116329;
--brand-Eyebrowbanner-icon-background-green: #ebf9f4;
--ansi-black: #1f2328;
--display-gray-scale-2: #b4c0cf;
--brand-breakpoint-xxlarge: 87.5rem;
--display-teal-scale-1: #89ebe1;
--brand-TestimonialGroup-fadeOutDuration: .25s;
--display-lemon-scale-8: #523f00;
--ansi-red: #cf222e;
--display-green-scale-5: #2c8141;
--display-cyan-scale-9: #003742;
--display-lemon-scale-4: #a68c07;
--brand-AnchorNav-link-underline-pressed: #000;
--brand-Testimonial-quoteMarkBackground-lemon: #fdf5b3;
--display-purple-scale-4: #a672f3;
--brand-ToggleSwitch-thumb-travel-small: .75rem;
--display-pink-scale-5: #ce2c85;
--brand-animation-variant-scaleInLeft-end: 1;
--brand-breakpoint-xlarge: 80rem;
--brand-Testimonial-quoteMarkBackground-teal: #daf9f5;
--prettylights-syntax-sublimelinter-gutter-mark: #818b98;
--display-auburn-scale-1: #e6d6d5;
--display-blue-scale-7: #004db3;
--brand-control-checkbox-fg-checked-disabled: #fff;
--display-yellow-scale-9: #422b00;
--brand-Tabs-item-underline-rest: #000;
--prettylights-syntax-metaDiffRange: #8250df;
--ansi-blackBright: #393f46;
--brand-control-medium-lineBoxHeight: 1rem;
--brand-animation-variant-scaleInRight-distance: -1.25rem;
--display-green-scale-8: #254b34;
--brand-Icon-background-coral: #fff0eb;
--brand-Testimonial-expressive-position-lineHeight: 1.6;
--ansi-blue: #0969da;
--display-pine-scale-8: #114b36;
--brand-Testimonial-quoteMarkBackground-red: #ffebe9;
--prettylights-syntax-brackethighlighter-angle: #59636e;
--brand-control-large-lineBoxHeight: 1.25rem;
--display-purple-scale-7: #6223d7;
--brand-heading-lineHeight-1000: 1;
--brand-control-checkbox-fg-checked: #fff;
--brand-Icon-background-red: #ffebe9;
--brand-Eyebrowbanner-icon-background-pink: #fff0fc;
--brand-Prose-lineLength: 68ch;
--ansi-yellow: #4d2d00;
--brand-heading-weight-800: 440;
--brand-Icon-background-blue: #ddf4ff;
--brand-ToggleSwitch-track-width-small: 1.75rem;
--brand-Testimonial-expressive-quote-maxWidth: 744px;
--brand-animation-variant-slideInUp-distance: .9375rem;
--display-teal-scale-3: #1db9b4;
--display-orange-scale-6: #a24610;
--ansi-blueBright: #218bff;
--display-cyan-scale-4: #0099b8;
--brand-breakpoint-medium: 48rem;
--brand-SubNav-width-subMenu: 18.75rem;
--display-lemon-scale-9: #3d2e00;
--brand-SubNav-height-overflowMenuInset: 8rem;
--display-coral-scale-7: #9b2712;
--prettylights-syntax-markup-italic: #1f2328;
--display-plum-scale-4: #c264f2;
--display-green-scale-6: #2b6e3f;
--brand-Eyebrowbanner-icon-background-lime: #f3fec8;
--brand-Timeline-strokeWidth: .125rem;
--brand-Spinner-animationDuration-default: .8s;
--brand-heading-lineHeight-700: 1.2;
--prettylights-syntax-keyword: #cf222e;
--display-cyan-scale-3: #00b7db;
--brand-VideoPlayer-transition: all .3s cubic-bezier(.16, 1, .3, 1);
--brand-Testimonial-quoteMarkBackground-indigo: #eff2ff;
--display-teal-scale-2: #22d3c7;
--brand-Eyebrowbanner-icon-background-indigo: #eff2ff;
--display-olive-scale-6: #56682c;
--brand-Eyebrowbanner-icon-background-gray: #f2f5f3;
--display-brown-scale-8: #51412f;
--display-gray-scale-9: #303031;
--display-teal-scale-6: #106e75;
--brand-heading-weight-700: 460;
--brand-heading-lineHeight-500: 1.3;
--prettylights-syntax-meta-diff-range: #8250df;
--brand-animation-duration-fast: .3s;
--display-indigo-scale-0: #e5e9ff;
--brand-animation-variant-slideInDown-distance: -.9375rem;
--display-indigo-scale-9: #25247b;
--display-olive-scale-1: #dbe170;
--brand-SubNav-width-overflowMenuMin: 10rem;
--display-brown-scale-6: #755f43;
--display-blue-scale-0: #d1f0ff;
--brand-IconButton-spinner-animationDuration-default: .8s;
--dialog-scrollgutter: 0px;
--prettylights-syntax-entity-tag: #0550ae;
--display-plum-scale-0: #f8e5ff;
--display-auburn-scale-3: #c59e9b;
--display-brown-scale-2: #cbbda4;
--display-green-scale-2: #54d961;
--brand-animation-duration-extended: .7s;
--display-brown-scale-5: #856d4c;
--display-purple-scale-3: #bc91f8;
--display-pink-scale-8: #6e2b53;
--brand-VideoPlayer-playButton-height: 6rem;
--brand-breakpoint-small: 34rem;
--brand-VideoPlayer-range-height: .375rem;
--marketing-navigation-light-image-display: block;
--display-olive-scale-3: #9bae32;
--prettylights-syntax-markup-heading: #0550ae;
--brand-control-radio-dot-checked: #08872b;
--brand-Icon-background-yellow: #fff8c5;
--brand-Eyebrowbanner-icon-background-orange: #fff1e5;
--brand-animation-variant-scaleInTop-distance: ;
--brand-ToggleSwitch-thumb-inset-small: .125rem;
--display-lime-scale-7: #3a5b25;
--display-blue-scale-6: #005fcc;
--brand-Eyebrowbanner-icon-background-default: #f2f5f3;
--display-lemon-scale-5: #866e04;
--brand-control-animation-easing: cubic-bezier(.33, 1, .68, 1);
--display-lime-scale-4: #6c9d2f;
--display-coral-scale-1: #fecebe;
--display-gray-scale-5: #647182;
--brand-animation-variant-scaleIn-start: .96;
--brand-Icon-background-default: #ebf9f4;
--display-indigo-scale-8: #2d2db4;
--brand-heading-lineHeight-400: 1.3;
--brand-FAQGroup-buttonIndicator-hover: #96a199;
--brand-FrostedGlassVFX-blurIntensity-high: 5rem;
--display-orange-scale-9: #54230d;
--brand-Testimonial-quoteMarkBackground-orange: #fff1e5;
--prettylights-syntax-storage-modifier-import: #1f2328;
--display-plum-scale-2: #e2a7fb;
--display-plum-scale-3: #d487f7;
--display-lemon-scale-0: #f7eea1;
--display-coral-scale-6: #ba2e12;
--display-cyan-scale-7: #00596b;
--display-green-scale-3: #31bf46;
--brand-Section-container-maxWidth: 80rem;
--display-auburn-scale-5: #9d615c;
--display-lemon-scale-7: #654f01;
--brand-Eyebrowbanner-icon-background-yellow: #fff8c5;
--display-gray-scale-3: #9ba9bb;
--prettylights-syntax-constant: #0550ae;
--display-indigo-scale-5: #5a61e7;
--display-olive-scale-4: #819532;
--brand-animation-variant-scaleInUp-start: .96;
--display-blue-scale-2: #75c8ff;
--display-gray-scale-0: #e8ecf2;
--brand-control-radio-dot-default: #000;
--brand-heading-weight-500: 480;
--brand-Icon-background-gray: #f2f5f3;
--brand-Icon-background-orange: #fff1e5;
--display-cyan-scale-8: #004857;
--display-cyan-scale-5: #007b94;
--display-indigo-scale-6: #494edf;
--brand-animation-duration-faster: .2s;
--display-green-scale-9: #1d3528;
--display-orange-scale-4: #eb670f;
--display-pine-scale-4: #1aa267;
--display-auburn-scale-9: #432928;
--display-orange-scale-0: #ffe7d1;
--display-yellow-scale-8: #5c3d00;
--brand-ToggleSwitch-loading-duration: 1s;
--brand-SubNav-offset-overflowMenu: .25rem;
--display-yellow-scale-0: #ffec9e;
--display-lime-scale-9: #213319;
--display-olive-scale-7: #495a2b;
--prettylights-syntax-comment: #59636e;
--display-pine-scale-9: #0d3627;
--display-plum-scale-9: #471769;
--display-coral-scale-3: #f88768;
--display-purple-scale-1: #e6d2fe;
--brand-Prose-unorderedList-imageUrl: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' focusable='false' role='img' viewBox='0 -3 16 16' width='16' height='16' fill='black' style='display: inline-block; vertical-align: text-bottom; overflow: visible;'%3e%3cpath d='M2 7.75A.75.75 0 0 1 2.75 7h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 2 7.75Z'%3e%3c/path%3e%3c/svg%3e ");
--marketing-navigation-dark-image-display: none;
--prettylights-syntax-storageModifierImport: #1f2328;
--brand-ToggleSwitch-track-height-small: 1rem;
--display-yellow-scale-2: #ebb400;
--brand-animation-variant-scaleInDown-start: 0;
--display-blue-scale-5: #006edb;
--brand-Icon-background-indigo: #eff2ff;
--display-blue-scale-9: #002b75;
--brand-animation-variant-scaleInUp-distance: 1.5rem;
--display-lime-scale-5: #527a29;
--ansi-gray: #59636e;
--display-lemon-scale-1: #f0db3d;
--brand-AnchorNav-link-underline-default: #b6bfb8;
--brand-ToggleSwitch-thumb-inset-medium: calc(.25rem - max(1px, .0625rem));
--brand-heading-lineHeight-600: 1.2;
--prettylights-syntax-bracketHighlighterUnmatched: #82071e;
--display-pine-scale-0: #bff8db;
--brand-heading-weight-600: 460;
--display-red-scale-3: #fb8389;
--prettylights-syntax-entityTag: #0550ae;
--prettylights-syntax-sublimeLinterGutterMark: #818b98;
--prettylights-syntax-variable: #953800;
--ansi-yellowBright: #633c01;
--display-lime-scale-1: #c7e580;
--display-brown-scale-9: #3a2e22;
--brand-animation-variant-slideInLeft-distance: .9375rem;
--display-olive-scale-9: #2a331f;
--brand-animation-variant-scaleInRight-end: 1;
--brand-control-small-lineBoxHeight: .75rem;
--display-teal-scale-5: #127e81;
--focus-outline: .125rem solid #0969da;
--display-blue-scale-1: #ade1ff;
--brand-control-minTarget-fine: 1rem;
--brand-LogoSuite-logobar-marquee-default: 30s;
--display-green-scale-1: #9ceda0;
--display-blue-scale-3: #47afff;
--display-olive-scale-5: #64762d;
--display-pink-scale-3: #f184bc;
--brand-Testimonial-quoteMarkBackground-default: #f2f5f3;
--display-pine-scale-5: #167e53;
--display-red-scale-9: #610a20;
--brand-Testimonial-quoteMarkBackground-pink: #fff0fc;
--display-gray-scale-6: #5c6570;
--display-blue-scale-4: #0f8fff;
```

### Dependencies

```css
0: --base-duration-500;
0: --base-duration-300;
0: --base-duration-100;
0: --base-duration-200;
0: --base-easing-easeOut;
0: --base-easing-easeIn;
0: --base-easing-ease;
0: --base-easing-linear;
0: --base-easing-easeInOut;
0: --motion-duration-medium;
1: --motion-easing-enter;
0: --motion-duration-short;
1: --motion-easing-exit;
0: --motion-duration-micro;
1: --motion-easing-hover;
0: --motion-duration-short;
1: --motion-easing-move;
0: --borderWidth-thin;
0: --borderWidth-thick;
0: --borderWidth-thicker;
0: --borderWidth-thin;
0: --focus-outline-offset;
0: --focus-outline-width;
0: --borderRadius-medium;
0: --base-text-lineHeight-normal;
0: --base-text-lineHeight-normal;
0: --base-text-lineHeight-relaxed;
0: --base-text-size-md;
0: --base-text-size-sm;
0: --base-text-size-xs;
0: --base-text-weight-normal;
0: --base-text-lineHeight-tight;
0: --base-text-size-xs;
0: --base-text-weight-normal;
0: --base-text-lineHeight-normal;
0: --base-text-weight-normal;
0: --base-text-weight-normal;
0: --base-text-lineHeight-snug;
0: --base-text-size-2xl;
0: --base-text-weight-medium;
0: --base-text-lineHeight-relaxed;
0: --base-text-size-lg;
0: --base-text-weight-normal;
0: --base-text-lineHeight-normal;
0: --base-text-lineHeight-relaxed;
0: --base-text-lineHeight-normal;
0: --base-text-size-xl;
0: --base-text-size-lg;
0: --base-text-size-md;
0: --base-text-weight-semibold;
0: --base-text-weight-semibold;
0: --base-text-weight-semibold;
0: --text-body-weight;
1: --text-body-size-large;
2: --text-body-lineHeight-large;
3: --fontStack-sansSerif;
0: --text-body-weight;
1: --text-body-size-medium;
2: --text-body-lineHeight-medium;
3: --fontStack-sansSerif;
0: --text-body-weight;
1: --text-body-size-small;
2: --text-body-lineHeight-small;
3: --fontStack-sansSerif;
0: --text-caption-weight;
1: --text-caption-size;
2: --text-caption-lineHeight;
3: --fontStack-sansSerif;
0: --text-codeBlock-weight;
1: --text-codeBlock-size;
2: --text-codeBlock-lineHeight;
3: --fontStack-monospace;
0: --text-codeInline-weight;
1: --text-codeInline-size;
2: --fontStack-monospace;
0: --text-display-weight;
1: --text-display-size;
2: --text-display-lineHeight;
3: --fontStack-sansSerifDisplay;
0: --text-subtitle-weight;
1: --text-subtitle-size;
2: --text-subtitle-lineHeight;
3: --fontStack-sansSerifDisplay;
0: --text-title-weight-large;
1: --text-title-size-large;
2: --text-title-lineHeight-large;
3: --fontStack-sansSerifDisplay;
0: --text-title-weight-medium;
1: --text-title-size-medium;
2: --text-title-lineHeight-medium;
3: --fontStack-sansSerifDisplay;
0: --text-title-weight-small;
1: --text-title-size-small;
2: --text-title-lineHeight-small;
3: --fontStack-sansSerif;
0: --Layout-pane-width;
0: --base-size-16;
0: --base-size-16;
0: --control-medium-paddingBlock;
0: --observed-header-height;
```

### Semantic

```css
--brand-Label-color-green-blue-start: #08872b;
--brand-Eyebrowbanner-fgColor-green-blue-end: #0377ff;
--bgColor-success-emphasis: #1f883d;
--display-green-bgColor-emphasis: #2c8141;
--border-success-muted: .0625rem solid #4ac26b66;
--base-color-scale-green-3: #5fed83;
--base-color-scale-green-9: #0d3024;
--display-green-scale-0: #caf7ca;
--label-green-bgColor-hover: #9ceda0;
--base-color-scale-green-8: #0e4a2e;
--data-green-color-emphasis: #30a147;
--brand-Accordion-toggle-color-green: #08872b;
--brand-color-success-muted: #8cf2a699;
--brand-Testimonial-quoteMarkBackground-green: #ebf9f4;
--display-green-scale-4: #30a147;
--brand-Accordion-toggle-color-green-blue-start: #08872b;
--base-color-scale-green-6: #08872b;
--border-success-emphasis: .0625rem solid #1a7f37;
--brand-Label-color-green-blue-purple-2: #096bde;
--brand-Testimonial-quoteMarkColor-green: #08872b;
--bgColor-success-muted: #dafbe1;
--base-color-scale-green-0: #ebf9f4;
--brand-color-success-subtle: #bfffd1;
--label-green-bgColor-rest: #caf7ca;
--control-borderColor-success: #1a7f37;
--label-green-fgColor-rest: #2b6e3f;
--color-prettylights-syntax-invalid-illegal-bg: #ffebe9;
--display-green-scale-7: #285c3b;
--brand-Label-color-green: #08872b;
--ansi-greenBright: #1a7f37;
--progressBar-bgColor-success: #1f883d;
--brand-Icon-background-green: #ebf9f4;
--brand-Eyebrowbanner-fgColor-green: #08872b;
--base-color-scale-green-1: #bfffd1;
--ansi-green: #116329;
--brand-Eyebrowbanner-icon-background-green: #ebf9f4;
--display-green-borderColor-emphasis: #2c8141;
--brand-Label-color-green-blue-purple-1: #000aff;
--base-color-scale-green-4: #23ea57;
--brand-Accordion-toggle-color-green-blue-end: #0377ff;
--display-green-scale-5: #2c8141;
--fgColor-success: #1a7f37;
--display-green-scale-8: #254b34;
--label-green-fgColor-active: #254b34;
--display-green-scale-6: #2b6e3f;
--brand-Label-color-green-blue-purple-4: #8250df;
--prettylights-syntax-invalidIllegal-bg: #ffebe9;
--display-green-borderColor-muted: #9ceda0;
--borderColor-success-muted: #4ac26b66;
--display-green-bgColor-muted: #caf7ca;
--color-ansi-green-bright: #1a7f37;
--prettylights-syntax-invalid-illegal-text: #d1242f;
--display-green-scale-2: #54d961;
--brand-Label-color-green-blue-end: #0377ff;
--color-prettylights-syntax-invalid-illegal-text: #d1242f;
--prettylights-syntax-invalidIllegal-text: #d1242f;
--brand-color-success-fg: #08872b;
--data-green-color-muted: #caf7ca;
--brand-Eyebrowbanner-fgColor-green-blue-start: #08872b;
--display-green-scale-3: #31bf46;
--brand-control-color-validation-error: #ae0b29;
--label-green-bgColor-active: #54d961;
--prettylights-syntax-invalid-illegal-bg: #ffebe9;
--base-color-scale-green-7: #0d6731;
--display-green-scale-9: #1d3528;
--color-ansi-green: #116329;
--label-green-borderColor: #fff0;
--display-green-fgColor: #2b6e3f;
--base-color-scale-green-2: #8cf2a6;
--brand-color-success-emphasis: #0fbf3e;
--label-green-fgColor-hover: #285c3b;
--base-color-scale-green-5: #0fbf3e;
--brand-Icon-color-green: #08872b;
--display-green-scale-1: #9ceda0;
--brand-Label-color-green-blue-purple-3: #08872b;
--borderColor-success-emphasis: #1a7f37;
--data-yellow-color-emphasis: #b88700;
--base-color-scale-yellow-1: #ffe777;
--label-yellow-borderColor: #fff0;
--brand-Label-color-yellow: #be7d00;
--display-yellow-scale-5: #946a00;
--base-color-scale-yellow-3: #fabf21;
--display-yellow-scale-1: #ffd642;
--brand-Testimonial-quoteMarkColor-yellow: #be7d00;
--base-color-scale-yellow-7: #824800;
--display-yellow-scale-6: #805900;
--display-yellow-borderColor-emphasis: #946a00;
--brand-Testimonial-quoteMarkBackground-yellow: #fff8c5;
--base-color-scale-yellow-0: #fff8c5;
--display-yellow-scale-7: #704d00;
--display-yellow-scale-3: #d19d00;
--display-yellow-borderColor-muted: #ffd642;
--label-yellow-fgColor-active: #5c3d00;
--label-yellow-fgColor-hover: #704d00;
--color-ansi-yellow: #4d2d00;
--display-yellow-scale-4: #b88700;
--display-yellow-scale-9: #422b00;
--color-ansi-yellow-bright: #633c01;
--base-color-scale-yellow-9: #471f00;
--ansi-yellow: #4d2d00;
--base-color-scale-yellow-2: #ffd743;
--display-yellow-fgColor: #805900;
--brand-Eyebrowbanner-fgColor-yellow: #be7d00;
--brand-Accordion-toggle-color-yellow: #be7d00;
--label-yellow-fgColor-rest: #805900;
--data-yellow-color-muted: #ffec9e;
--brand-Icon-background-yellow: #fff8c5;
--brand-Eyebrowbanner-icon-background-yellow: #fff8c5;
--label-yellow-bgColor-rest: #ffec9e;
--control-borderColor-warning: #9a6700;
--display-yellow-bgColor-emphasis: #946a00;
--base-color-scale-yellow-5: #be7d00;
--display-yellow-scale-8: #5c3d00;
--label-yellow-bgColor-hover: #ffd642;
--display-yellow-scale-0: #ffec9e;
--display-yellow-scale-2: #ebb400;
--base-color-scale-yellow-4: #db9d00;
--base-color-scale-yellow-8: #653200;
--base-color-scale-yellow-6: #a06100;
--ansi-yellowBright: #633c01;
--display-yellow-bgColor-muted: #ffec9e;
--label-yellow-bgColor-active: #ebb400;
--brand-Icon-color-yellow: #be7d00;
--base-size-negative-12: -.75rem;
--base-size-negative-16: -1rem;
--base-size-negative-2: -.125rem;
--base-size-negative-20: -1.25rem;
--base-size-negative-24: -1.5rem;
--base-size-negative-28: -1.75rem;
--base-size-negative-32: -2rem;
--base-size-negative-36: -2.25rem;
--base-size-negative-4: -.25rem;
--base-size-negative-40: -2.5rem;
--base-size-negative-44: -2.75rem;
--base-size-negative-48: -3rem;
--base-size-negative-6: -.375rem;
--base-size-negative-8: -.5rem;
--control-danger-fgColor-hover: #d1242f;
--button-danger-borderColor-rest: #d1d9e0;
--display-red-scale-1: #fecdcd;
--display-red-scale-4: #f85461;
--button-danger-borderColor-active: #1f232826;
--brand-Eyebrowbanner-fgColor-purple-red-end: #cf2230;
--color-prettylights-syntax-markup-ignored-text: #d1d9e0;
--label-red-fgColor-active: #880c27;
--button-danger-bgColor-active: #a40e26;
--brand-Accordion-toggle-color-red: #cf2230;
--display-red-scale-0: #ffe2e0;
--button-danger-iconColor-hover: #fff;
--buttonKeybindingHint-danger-bgColor-active: #1f232866;
--brand-Label-color-purple-red-start: #8534f3;
--button-danger-iconColor-rest: #d1242f;
--buttonCounter-danger-bgColor-hover: #fff3;
--button-danger-fgColor-active: #fff;
--label-red-bgColor-rest: #ffe2e0;
--base-color-scale-red-9: #420011;
--buttonKeybindingHint-danger-bgColor-hover: #1f232833;
--brand-color-danger-subtle: #ffebe9;
--button-danger-iconColor-disabled: #d1242f80;
--brand-Testimonial-quoteMarkColor-red: #cf2230;
--display-red-scale-5: #df0c24;
--brand-color-error-fg: #cf2230;
--label-red-fgColor-rest: #c50d28;
--display-red-scale-6: #c50d28;
--display-red-bgColor-muted: #ffe2e0;
--brand-Eyebrowbanner-fgColor-red: #cf2230;
--buttonKeybindingHint-danger-fgColor-disabled: #818b98;
--brand-IconButton-danger-borderColor-rest: #d2d9d4;
--brand-color-danger-fg: #cf2230;
--buttonKeybindingHint-danger-borderColor-active: #1f232826;
--base-color-scale-red-3: #ff8182;
--brand-IconButton-danger-fgColor-hover: #fff;
--color-prettylights-syntax-markup-ignored-bg: #0550ae;
--brand-color-text-error: #cf222e;
--brand-Eyebrowbanner-fgColor-red-orange-start: #cf2230;
--brand-IconButton-danger-fgColor-rest: #cf2230;
--display-red-bgColor-emphasis: #df0c24;
--progressBar-bgColor-danger: #cf222e;
--display-red-scale-8: #880c27;
--brand-Label-color-red: #cf2230;
--prettylights-syntax-markup-ignored-text: #d1d9e0;
--label-red-bgColor-active: #fda5a7;
--buttonCounter-danger-bgColor-disabled: #cf222e0d;
--brand-Spinner-animationDuration-reducedMotion: 1.6s;
--display-red-scale-2: #fda5a7;
--display-red-scale-7: #a60c29;
--button-danger-bgColor-disabled: #eff2f5;
--ansi-redBright: #a40e26;
--brand-color-error-subtle: #ffebe9;
--brand-color-error-emphasis: #cf2230;
--borderColor-danger-muted: #ff818266;
--brand-IconButton-spinner-animationDuration-reducedMotion: 1.6s;
--buttonCounter-danger-fgColor-rest: #c21c2c;
--display-red-fgColor: #c50d28;
--button-danger-fgColor-rest: #d1242f;
--brand-Accordion-toggle-color-purple-red-start: #8534f3;
--label-red-borderColor: #fff0;
--brand-Eyebrowbanner-icon-background-red: #ffebe9;
--borderColor-danger-emphasis: #cf222e;
--buttonKeybindingHint-danger-bgColor-disabled: #eff2f5;
--base-color-scale-red-5: #cf2230;
--brand-IconButton-danger-bgColor-active: #cf2230;
--brand-color-danger-muted: #ffaba899;
--bgColor-danger-muted: #ffebe9;
--ansi-red: #cf222e;
--control-danger-bgColor-active: #ffebe966;
--brand-color-error-muted: #ffaba899;
--button-danger-bgColor-hover: #cf222e;
--button-danger-shadow-selected: inset 0 1px 0 0 #4c001433;
--brand-IconButton-danger-bgColor-hover: #cf2230;
--brand-Label-color-red-orange-end: #b85b06;
--brand-Testimonial-quoteMarkBackground-red: #ffebe9;
--color-ansi-red: #cf222e;
--brand-Icon-background-red: #ffebe9;
--buttonKeybindingHint-danger-borderColor-rest: #d1d9e0b3;
--color-ansi-red-bright: #a40e26;
--prettylights-syntax-markup-ignored-bg: #0550ae;
--border-danger-emphasis: .0625rem solid #cf222e;
--buttonKeybindingHint-danger-borderColor-hover: #1f232826;
--data-red-color-muted: #ffe2e0;
--brand-Label-color-purple-red-end: #cf2230;
--label-red-bgColor-hover: #fecdcd;
--base-color-scale-red-0: #ffebe9;
--buttonCounter-danger-fgColor-disabled: #d1242f80;
--brand-Accordion-toggle-color-red-orange-start: #cf2230;
--base-color-scale-red-7: #860620;
--border-danger-muted: .0625rem solid #ff818266;
--buttonKeybindingHint-danger-fgColor-hover: #fff;
--base-color-scale-red-8: #730019;
--buttonKeybindingHint-danger-fgColor-rest: #59636e;
--brand-Accordion-toggle-color-red-orange-end: #b85b06;
--display-red-borderColor-emphasis: #df0c24;
--brand-IconButton-danger-borderColor-active: #cf2230;
--button-danger-fgColor-hover: #fff;
--buttonKeybindingHint-danger-fgColor-active: #fff;
--brand-Label-color-red-orange-start: #cf2230;
--brand-IconButton-danger-fgColor-active: #fff;
--base-color-scale-red-1: #ffcecb;
--buttonCounter-danger-bgColor-rest: #cf222e1a;
--base-color-scale-red-6: #ae0b29;
--control-borderColor-danger: #cf222e;
--buttonKeybindingHint-danger-bgColor-rest: #eff2f5;
--fgColor-danger: #d1242f;
--button-danger-fgColor-disabled: #d1242f80;
--brand-Accordion-toggle-color-purple-red-end: #cf2230;
--button-danger-bgColor-rest: #f6f8fa;
--brand-IconButton-danger-bgColor-rest: #0000000f;
--brand-IconButton-danger-borderColor-hover: #cf2230;
--brand-Eyebrowbanner-fgColor-red-orange-end: #b85b06;
--brand-Prose-unorderedList-imageUrl: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' aria-hidden='true' focusable='false' role='img' viewBox='0 -3 16 16' width='16' height='16' fill='black' style='display: inline-block; vertical-align: text-bottom; overflow: visible;'%3e%3cpath d='M2 7.75A.75.75 0 0 1 2.75 7h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 2 7.75Z'%3e%3c/path%3e%3c/svg%3e ");
--base-color-scale-red-4: #fa4549;
--control-danger-fgColor-rest: #d1242f;
--bgColor-danger-emphasis: #cf222e;
--brand-Eyebrowbanner-fgColor-purple-red-start: #8534f3;
--display-red-scale-3: #fb8389;
--brand-color-text-danger: #cf222e;
--display-red-borderColor-muted: #fecdcd;
--control-danger-bgColor-hover: #ffebe9;
--data-red-color-emphasis: #df0c24;
--base-color-scale-red-2: #ffaba8;
--brand-Icon-color-red: #cf2230;
--buttonKeybindingHint-danger-borderColor-disabled: #818b981a;
--brand-color-danger-emphasis: #cf2230;
--button-danger-borderColor-hover: #1f232826;
--display-red-scale-9: #610a20;
--buttonCounter-danger-fgColor-hover: #fff;
--label-red-fgColor-hover: #a60c29;
--brand-Eyebrowbanner-fgColor-blue-purple-end: #8534f3;
--brand-Eyebrowbanner-fgColor-pink-blue-end: #0377ff;
--display-blue-bgColor-muted: #d1f0ff;
--base-color-scale-blue-6: #0055d5;
--color-ansi-blue: #0969da;
--brand-Label-color-blue: #0377ff;
--base-color-scale-blue-9: #001c4d;
--base-color-scale-blue-5: #0377ff;
--base-color-scale-blue-4: #3094ff;
--data-blue-color-emphasis: #006edb;
--base-color-scale-blue-1: #bcecff;
--brand-Eyebrowbanner-fgColor-pink-blue-start: #ef2aa4;
--color-ansi-blue-bright: #218bff;
--label-blue-fgColor-active: #003d99;
--brand-Accordion-toggle-color-pink-blue-end: #0377ff;
--base-color-scale-blue-3: #5fb9ff;
--brand-Eyebrowbanner-icon-background-blue: #ddf4ff;
--brand-Label-color-blue-purple-start: #0377ff;
--brand-Label-color-pink-blue-start: #ef2aa4;
--brand-Testimonial-quoteMarkBackground-blue: #ddf4ff;
--label-blue-bgColor-hover: #ade1ff;
--brand-Accordion-toggle-color-pink-blue-start: #ef2aa4;
--brand-Icon-color-blue: #0377ff;
--display-blue-scale-8: #003d99;
--base-color-scale-blue-8: #002f7a;
--brand-Label-color-pink-blue-end: #0377ff;
--display-blue-bgColor-emphasis: #006edb;
--display-blue-scale-7: #004db3;
--ansi-blue: #0969da;
--label-blue-bgColor-rest: #d1f0ff;
--data-blue-color-muted: #d1f0ff;
--brand-Icon-background-blue: #ddf4ff;
--ansi-blueBright: #218bff;
--base-color-scale-blue-0: #ddf4ff;
--brand-Eyebrowbanner-fgColor-blue: #0377ff;
--display-blue-scale-0: #d1f0ff;
--brand-Label-color-blue-purple-end: #8534f3;
--display-blue-fgColor: #005fcc;
--display-blue-scale-6: #005fcc;
--label-blue-fgColor-rest: #005fcc;
--brand-Accordion-toggle-color-blue: #0377ff;
--label-blue-fgColor-hover: #004db3;
--display-blue-scale-2: #75c8ff;
--display-blue-borderColor-muted: #ade1ff;
--brand-Accordion-toggle-color-blue-purple-end: #8534f3;
--display-blue-borderColor-emphasis: #006edb;
--brand-Testimonial-quoteMarkColor-blue: #0377ff;
--display-blue-scale-5: #006edb;
--brand-Eyebrowbanner-fgColor-blue-purple-start: #0377ff;
--display-blue-scale-9: #002b75;
--display-blue-scale-1: #ade1ff;
--brand-Accordion-toggle-color-blue-purple-start: #0377ff;
--base-color-scale-blue-2: #8dd6ff;
--display-blue-scale-3: #47afff;
--label-blue-bgColor-active: #75c8ff;
--display-blue-scale-4: #0f8fff;
--base-color-scale-blue-7: #0040a7;
--label-blue-borderColor: #fff0;
```

## Transitions & Animations

**Easing functions:** `linear`, `cubic-bezier(0.65, 0, 0.35, 1)`, `ease`, `cubic-bezier(0.33, 1, 0.68, 1)`

**Durations:** `0.4s`, `0.2s`, `0.08s`, `0.3s`, `0.5s`

### Common Transitions

```css
transition: all;
transition: opacity 0.4s linear 0.4s;
transition: width 0.4s;
transition: background-color 0.2s, border-color 0.2s;
transition: color 0.08s cubic-bezier(0.65, 0, 0.35, 1), fill 0.08s cubic-bezier(0.65, 0, 0.35, 1), background-color 0.08s cubic-bezier(0.65, 0, 0.35, 1), border-color 0.08s cubic-bezier(0.65, 0, 0.35, 1);
transition: color 0.08s ease-in, background-color 0.08s ease-in, border-color 0.08s ease-in;
transition: margin 0.2s ease-in-out, opacity 0.2s ease-in-out, mask-position 0.2s ease-in-out, mask-size 0.2s ease-in-out;
transition: color 0.08s cubic-bezier(0.33, 1, 0.68, 1), background-color 0.08s cubic-bezier(0.33, 1, 0.68, 1), box-shadow 0.08s cubic-bezier(0.33, 1, 0.68, 1), border-color 0.08s cubic-bezier(0.33, 1, 0.68, 1);
transition: transform 0.3s;
transition: top 0.5s ease-in-out;
```

### Keyframe Animations

**AppFrame-a11yLink-focus**
```css
@keyframes AppFrame-a11yLink-focus {
  0% { color: var(--fgColor-accent,var(--color-accent-emphasis)); transform: scale(0.3, 0.25); }
  50% { color: var(--fgColor-accent,var(--color-accent-emphasis)); transform: scale(1); }
  55% { color: var(--fgColor-onEmphasis,var(--color-fg-on-emphasis)); }
  100% { transform: scaleX(1); }
}
```

**tooltip-appear**
```css
@keyframes tooltip-appear {
  0% { opacity: 0; }
  100% { opacity: 1; }
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

**fade-up**
```css
@keyframes fade-up {
  0% { opacity: 0.8; transform: translateY(100%); }
  100% { opacity: 1; transform: translateY(0px); }
}
```

**fade-down**
```css
@keyframes fade-down {
  0% { opacity: 1; transform: translateY(0px); }
  100% { opacity: 0.5; transform: translateY(100%); }
}
```

**grow-x**
```css
@keyframes grow-x {
  100% { width: 100%; }
}
```

**shrink-x**
```css
@keyframes shrink-x {
  100% { width: 0%; }
}
```

**scale-in**
```css
@keyframes scale-in {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}
```

**pulse**
```css
@keyframes pulse {
  0% { opacity: 0.3; }
  10% { opacity: 1; }
  100% { opacity: 0.3; }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (49 instances)

```css
.buttons {
  background-color: rgb(246, 248, 250);
  color: rgb(9, 105, 218);
  font-size: 14px;
  font-weight: 500;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 6px;
}
```

### Cards (5 instances)

```css
.cards {
  border-radius: 6px;
  padding-top: 12px;
  padding-right: 12px;
}
```

### Inputs (5 instances)

```css
.inputs {
  color: rgb(84, 84, 84);
  border-color: rgb(84, 84, 84);
  border-radius: 0px;
  font-size: 16px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Links (161 instances)

```css
.links {
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 400;
}
```

### Navigation (30 instances)

```css
.navigation {
  background-color: rgb(0, 0, 0);
  color: rgb(31, 35, 40);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: static;
  box-shadow: rgb(209, 217, 224) 0px -1px 0px 0px inset;
}
```

### Footer (3 instances)

```css
.footer {
  color: rgb(89, 99, 110);
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 12px;
}
```

### Modals (2 instances)

```css
.modals {
  background-color: rgb(246, 248, 250);
  border-radius: 6px;
  box-shadow: rgba(31, 35, 40, 0.04) 0px 1px 0px 0px;
  padding-top: 0px;
  padding-right: 12px;
}
```

### Dropdowns (8 instances)

```css
.dropdowns {
  background-color: rgb(0, 0, 0);
  border-radius: 0px;
  border-color: rgb(25, 31, 27) rgb(255, 255, 255);
  padding-top: 0px;
}
```

### Tables (3 instances)

```css
.tables {
  border-color: rgb(31, 35, 40);
  cell-style: [object Object];
}
```

### Badges (10 instances)

```css
.badges {
  background-color: rgba(129, 139, 152, 0.12);
  color: rgb(31, 35, 40);
  font-size: 14px;
  font-weight: 500;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Avatars (5 instances)

```css
.avatars {
  border-radius: 50%;
}
```

### Tooltips (14 instances)

```css
.tooltips {
  background-color: rgb(37, 41, 46);
  color: rgb(255, 255, 255);
  font-size: 12px;
  border-radius: 6px;
  padding-top: 4px;
  padding-right: 8px;
}
```

### ProgressBars (2 instances)

```css
.progressBars {
  background-color: rgb(9, 105, 218);
  color: rgb(31, 35, 40);
  border-radius: 6px;
  font-size: 14px;
}
```

### Switches (55 instances)

```css
.switches {
  border-radius: 6px 0px 0px 6px;
  border-color: rgb(89, 99, 110);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 11 instances, 4 variants

**Variant 1** (4 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 0px 8px 0px 8px;
  border-radius: 24px;
  border: 0px none rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 400;
```

**Variant 2** (1 instance)

```css
  background: rgba(129, 139, 152, 0.15);
  color: rgb(89, 99, 110);
  padding: 0px 0px 0px 0px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0);
  font-size: 14px;
  font-weight: 500;
```

**Variant 3** (2 instances)

```css
  background: rgb(246, 248, 250);
  color: rgb(89, 99, 110);
  padding: 0px 0px 0px 0px;
  border-radius: 6px;
  border: 1px solid rgb(209, 217, 224);
  font-size: 14px;
  font-weight: 400;
```

**Variant 4** (4 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(89, 99, 110);
  padding: 0px 8px 0px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0);
  font-size: 12px;
  font-weight: 500;
```

### Button — 3 instances, 2 variants

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(164, 174, 166);
  padding: 1px 4px 1px 12px;
  border-radius: 6px;
  border: 1px solid rgb(53, 61, 55);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (1 instance)

```css
  background: rgb(246, 248, 250);
  color: rgb(37, 41, 46);
  padding: 0px 12px 0px 12px;
  border-radius: 6px;
  border: 1px solid rgb(209, 217, 224);
  font-size: 14px;
  font-weight: 500;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(37, 41, 46);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(37, 41, 46);
  font-size: 14px;
  font-weight: 500;
```

### Input — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(31, 35, 40);
  padding: 1px 0px 1px 0px;
  border-radius: 0px;
  border: 0px none rgb(31, 35, 40);
  font-size: 14px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(89, 99, 110);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(89, 99, 110);
  font-size: 14px;
  font-weight: 400;
```

### Button — 17 instances, 1 variant

**Variant 1** (17 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(9, 105, 218);
  padding: 0px 0px 0px 0px;
  border-radius: 6px;
  border: 0px none rgb(9, 105, 218);
  font-size: 14px;
  font-weight: 500;
```

## Layout System

**211 grid containers** and **987 flex containers** detected.

### The System

- **Content column** — 861px wide
- **Column system** — 4 columns
- **Section rhythm** — 16px vertical padding (ladder: 16px · 32px · 48px)
- **Gap scale** — 4px · 6px · 8px · 10px · 12px · 16px · 20px · 24px
- **Fluid layout** — 12 clamp/viewport declarations

```css
.Overlay { width: min(var(--overlay-width),100vw - 2rem); }
.Overlay.Overlay--size-auto { max-width: calc(-2rem + 100vw); }
.Overlay.Overlay--size-full { width: 100vw; }
.Overlay.Overlay--width-small { width: min(256px, -2rem + 100vw); }
.Overlay.Overlay--width-medium { width: min(320px, -2rem + 100vw); }
.Overlay.Overlay--width-large { width: min(480px, -2rem + 100vw); }
```

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 100% | 0px |
| 1012px | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 5-column | 139x |
| 1-column | 59x |
| 4-column | 6x |
| 3-column | 3x |

### Grid Templates

```css
grid-template-columns: 520px 364px 364px;
grid-template-columns: 312px 312px 312px 312px;
grid-template-columns: 312px 312px 312px 312px;
grid-template-columns: 312px 312px 312px 312px;
grid-template-columns: 0px 0px 16px 257px 0px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 885x |
| column/nowrap | 96x |
| row/wrap | 6x |

**Gap values:** `3px`, `4px`, `4px 10px`, `6px`, `8px`, `10px`, `12px`, `16px`, `20px`, `24px`, `32px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 20 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#ffffff` | `#25292e` | 14.63:1 | AAA |
| `#1f2328` | `#f6f8fa` | 14.84:1 | AAA |
| `#ffffff` | `#0969da` | 5.19:1 | AA |

## Design System Score

**Overall: 84/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 80/100 |
| Spacing System | 70/100 |
| Shadow Consistency | 90/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 3751 !important rules — prefer specificity over overrides
- 28512 duplicate CSS declarations

## Gradients

**2 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | — | 2 | brand |
| linear | — | 2 | brand |

```css
background: linear-gradient(rgb(255, 248, 197), rgb(255, 248, 197));
background: linear-gradient(rgb(255, 235, 233), rgb(255, 235, 233));
```

## Z-Index Map

**13 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 1000,999999 | div, div.a.j.a.x.-.e.r.r.o.r.-.m.e.s.s.a.g.e. .f.l.a.s.h. .f.l.a.s.h.-.e.r.r.o.r, span.p.r.o.g.r.e.s.s.-.p.j.a.x.-.l.o.a.d.e.r. .P.r.o.g.r.e.s.s. .p.o.s.i.t.i.o.n.-.f.i.x.e.d. .w.i.d.t.h.-.f.u.l.l |
| dropdown | 100,101 | div.m.e.n.u._._.2.E.H.T.k.B, div.P.o.p.o.v.e.r. .j.s.-.h.o.v.e.r.c.a.r.d.-.c.o.n.t.e.n.t. .p.o.s.i.t.i.o.n.-.a.b.s.o.l.u.t.e, div.P.o.r.t.a.l.R.o.o.t._._.W.2.c.B.o.j |
| sticky | 99,99 | header.r.o.o.t._._.q.6.p.g.d.o. .H.e.a.d.e.r.M.k.t.g. .h.e.a.d.e.r.-.l.o.g.g.e.d.-.o.u.t. .f.u.l.l.W.i.d.t.h._._.R.5.B.A.b.e |
| base | 0,5 | div.b.o.t.t.o.m.B.o.r.d.e.r._._.3.8.-.D.2.c, div.b.a.r._._.c.F.4.m.1.O, div.s.c.r.o.l.l.M.a.r.k.s.C.o.n.t.a.i.n.e.r._._.S.T.m.j.R.v |

**Issues:**
- Very high z-index values: 99999, 999999

## SVG Icons

**38 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| xs | 4 |
| sm | 33 |
| lg | 1 |

**Icon colors:** `currentColor`, `rgb(31, 35, 40)`, `rgb(89, 99, 110)`

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 16 | objectFit: fill, borderRadius: 6px, shape: rounded |
| avatar | 3 | objectFit: fill, borderRadius: 50%, shape: circular |

**Aspect ratios:** 1:1 (15x), 3:2 (4x)

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `instant` | `80ms` | 80 |
| `sm` | `200ms` | 200 |
| `md` | `300ms` | 300 |
| `lg` | `500ms` | 500 |

### Easing Families

- **linear** (1 uses) — `linear`
- **custom** (16 uses) — `cubic-bezier(0.65, 0, 0.35, 1)`
- **ease-in-out** (5 uses) — `ease`
- **ease-out** (17 uses) — `cubic-bezier(0.33, 1, 0.68, 1)`

## Component Anatomy

### button — 33 instances

**Slots:** label, icon
**Variants:** link

| variant | count | sample label |
|---|---|---|
| default | 32 | Products |
| link | 1 | 3 people |

## Brand Voice

**Tone:** technical · **Pronoun:** third-person · **Headings:** Sentence case (tight)

### Top CTA Verbs

- **master** (2)
- **products** (1)
- **developers** (1)
- **businesses** (1)
- **resources** (1)
- **search** (1)
- **people** (1)

### Button Copy Patterns

- "master" (2×)
- "products" (1×)
- "developers" (1×)
- "businesses" (1×)
- "resources" (1×)
- "search
/" (1×)
- "3 people" (1×)

### Sample Headings

> Navigation Menu
> Repository navigation
> Files
> Breadcrumbs
> quill
> Repository navigation
> Breadcrumbs
> Breadcrumbs
> Footer
> Footer navigation

## Page Intent

**Type:** `unknown` (confidence 0)
**Description:** :hedgehog: PostHog is the leading platform for building self-driving products. Our developer tools – AI observability, analytics, session replay, flags, experiments, error tracking, logs, and more – c

## Section Roles

Reading order (top→bottom): cta → nav → footer → nav → nav → testimonials → nav → nav → nav → nav → nav

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | cta | Navigation Menu | 0.75 |
| 1 | nav | — | 0.9 |
| 2 | testimonials | Repository navigation | 0.4 |
| 3 | nav | Repository navigation | 0.4 |
| 4 | nav | — | 0.9 |
| 5 | nav | — | 0.9 |
| 6 | nav | — | 0.9 |
| 7 | nav | Breadcrumbs | 0.9 |
| 8 | nav | Breadcrumbs | 0.9 |
| 9 | footer | Footer | 0.95 |
| 10 | nav | Footer navigation | 0.9 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.474 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 50px |
| backdrop-filter in use | no |
| Gradients | 2 |

## Imagery Style

**Label:** `mixed` (confidence 0.105)
**Counts:** total 19, svg 12, icon 15, screenshot-like 0, photo-like 0
**Dominant aspect:** square-ish
**Radius profile on images:** soft

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Mona Sans VF` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
