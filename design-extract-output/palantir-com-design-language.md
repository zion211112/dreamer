# Design Language: Object Explorer • Getting started • Palantir

> Extracted from `https://www.palantir.com/docs/foundry/object-explorer/getting-started/` on November 19, 2026
> 1955 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#2b5945` | rgb(43, 89, 69) | hsl(154, 35%, 26%) | 74 |
| Secondary | `#3860be` | rgb(56, 96, 190) | hsl(222, 54%, 48%) | 4 |

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| primary | `#e0feef` | `#d2f3e2` | `#bfe3d1` | `#a2cbb7` | `#7eac96` | `#5f8e78` | `#4b7763` | `#39604e` | **`#2b5945`** | `#214032` | `#0e241a` |
| secondary | `#d6f6ff` | `#c8eaff` | `#b3d8ff` | `#95bfff` | `#709cfc` | `#527ddd` | **`#3860be`** | `#2f51a1` | `#234188` | `#1a3472` | `#0a1b46` |
| neutral | `#f3f6f8` | `#e7eaed` | `#d6d9dc` | `#bdc1c4` | `#9ca0a4` | `#7f8286` | `#696c70` | `#54575a` | `#44474a` | `#37393b` | **`#1e2124`** |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#ffffff` | `#1e2124` | 16.18:1 | AAA |
| `surface.raised` | `#2b5945` | `#ffffff` | 8.02:1 | AAA |
| `action.primary` | `#2b5945` | `#ffffff` | 8.02:1 | AAA |
| `action.secondary` | `#3860be` | `#ffffff` | 5.86:1 | AA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#ffffff` — 89%
- `#2b5945` — 10%
- `#ccaa11` — 1%
- `#f4f7f6` — 0%
- `#1e2124` — 0%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#1e2124` | hsl(210, 9%, 13%) | 2811 |
| `#636363` | hsl(0, 0%, 39%) | 838 |
| `#767676` | hsl(0, 0%, 46%) | 94 |
| `#ffffff` | hsl(0, 0%, 100%) | 64 |
| `#555555` | hsl(0, 0%, 33%) | 25 |
| `#000000` | hsl(0, 0%, 0%) | 22 |
| `#f4f7f6` | hsl(160, 16%, 96%) | 2 |
| `#bbbbbb` | hsl(0, 0%, 73%) | 1 |
| `#d8d8d8` | hsl(0, 0%, 85%) | 1 |

### Background Colors

Used on large-area elements: `#ffffff`, `#2b5945`, `#ccaa11`

### Text Colors

Text color palette: `#636363`, `#1e2124`, `#2b5945`, `#767676`, `#ffffff`, `#4e8af7`, `#8c7847`, `#a6f2cc`, `#f2c4bf`, `#000000`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#1e2124` | text, border, background | 2811 |
| `#636363` | text, border | 838 |
| `#767676` | text, border | 94 |
| `#2b5945` | border, text, background | 74 |
| `#ffffff` | background, text, border | 64 |
| `#555555` | text, border | 25 |
| `#000000` | text, border, background | 22 |
| `#4e8af7` | border, text | 6 |
| `#3860be` | text, border, background | 4 |
| `#8c7847` | border, text | 3 |
| `#a6f2cc` | border, text | 3 |
| `#f2c4bf` | border, text | 3 |
| `#f4f7f6` | background | 2 |
| `#ccaa11` | background, border | 2 |
| `#32ae88` | border | 1 |
| `#468254` | background | 1 |
| `#bbbbbb` | border | 1 |
| `#d8d8d8` | border | 1 |

## Typography

### Font Families

- **Alliance No.1** — used for all (602 elements)
- **Alliance No.2** — used for all (35 elements)

### Type System

- **Scale ratio** — 1.125 (major second), anchored at 14px · 100% of sizes sit on the ladder
- **Measure** — ~83 characters per line (wide)
- **Fluid type** — none; sizes are fixed per breakpoint

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `h1` | 40px / 2.5rem | 400 | 64px | normal |
| `h2` | 28px / 1.75rem | 400 | 44.8px | normal |
| `title-1` | 27px / 1.6875rem | 600 | 33.75px | normal |
| `title-2` | 24.66px / 1.5413rem | 600 | 29.592px | normal |
| `h3` | 24px / 1.5rem | 400 | 38.4px | normal |
| `title-3` | 20px / 1.25rem | 400 | 28.572px | normal |
| `title-4` | 18px / 1.125rem | 400 | normal | normal |
| `title-5` | 16.2px / 1.0125rem | 400 | 38px | 0.162px |
| `body` | 16px / 1rem | 400 | 14px | normal |
| `body-sm` | 15.75px / 0.9844rem | 700 | 22.05px | normal |
| `micro` | 15.3px / 0.9563rem | 400 | 30.6px | normal |
| `sm-3` | 14.634px / 0.9146rem | 400 | normal | normal |
| `sm-4` | 14.4px / 0.9rem | 400 | normal | normal |
| `sm-5` | 14px / 0.875rem | 400 | 14px | normal |
| `sm-6` | 13.5px / 0.8438rem | 400 | normal | normal |

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 40px | 2.5rem | 400 | 64px | normal | h1, a, svg, path |
| 28px | 1.75rem | 400 | 44.8px | normal | h2, a, svg, path |
| 27px | 1.6875rem | 600 | 33.75px | normal | h2 |
| 24.66px | 1.5413rem | 600 | 29.592px | normal | h2 |
| 24px | 1.5rem | 400 | 38.4px | normal | h3, a, svg, path |
| 20px | 1.25rem | 400 | 28.572px | normal | span |
| 18px | 1.125rem | 400 | normal | normal | html, head, meta, link |
| 16.2px | 1.0125rem | 400 | 38px | 0.162px | button, svg, title, g |
| 16px | 1rem | 400 | 14px | normal | input, a, h2, ul |
| 15.75px | 0.9844rem | 700 | 22.05px | normal | h3, h4 |
| 15.3px | 0.9563rem | 400 | 30.6px | normal | div, svg, path, span |
| 14.634px | 0.9146rem | 400 | normal | normal | p, br, a, div |
| 14.4px | 0.9rem | 400 | normal | normal | input, span |
| 14px | 0.875rem | 400 | 14px | normal | div, svg, title, circle |
| 13.5px | 0.8438rem | 400 | normal | normal | span, a, img |

### Heading Scale

```css
h1 { font-size: 40px; font-weight: 400; line-height: 64px; }
h2 { font-size: 28px; font-weight: 400; line-height: 44.8px; }
h2 { font-size: 27px; font-weight: 600; line-height: 33.75px; }
h2 { font-size: 24.66px; font-weight: 600; line-height: 29.592px; }
h3 { font-size: 24px; font-weight: 400; line-height: 38.4px; }
h3 { font-size: 18px; font-weight: 400; line-height: normal; }
h2 { font-size: 16px; font-weight: 400; line-height: 14px; }
h3 { font-size: 15.75px; font-weight: 700; line-height: 22.05px; }
h2 { font-size: 10px; font-weight: 400; line-height: 10px; }
```

### Body Text

```css
body { font-size: 16px; font-weight: 400; line-height: 14px; }
```

### Font Weights in Use

`400` (1904x), `700` (33x), `600` (18x)

## Spacing

**Base unit:** 5px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-5 | 5px | 0.3125rem |
| spacing-10 | 10px | 0.625rem |
| spacing-15 | 15px | 0.9375rem |
| spacing-20 | 20px | 1.25rem |
| spacing-25 | 25px | 1.5625rem |
| spacing-30 | 30px | 1.875rem |
| spacing-40 | 40px | 2.5rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| xs | 2px | 12 |
| xl | 17px | 1 |
| xl | 20px | 1 |
| full | 50px | 1 |

## Elevation

2 levels from 3 raw shadows · neutral tint

**xs** — blur 5px, y -3px, used 1×
```css
box-shadow: rgb(199, 197, 199) -3px -3px 5px -2px;
```

**sm** — blur 14px, y 7px, used 1× · 2 layers · tinted (hue 240°)
```css
box-shadow: rgba(0, 0, 0, 0) 0px 2px 4px 0px, rgba(50, 50, 93, 0.1) 0px 7px 14px 0px;
```

## CSS Custom Properties

### Colors

```css
--border-color: currentColor;
--input-border-color: var(--text-color-medium);
--error-color: #ff4136;
--accent-color: #2b5945;
--accent10-color: rgba(43,89,69,.1);
--accent05-color: rgba(43,89,69,.05);
--accent05-opaque-color: #f4f7f6;
--body-color: #fff;
--body-color-medium: #f3f3f3;
--body-color-light: #f9f9f9;
--text-color: #1e2124;
--text-color-medium: #636363;
--text-color-light: #767676;
--hover-color: rgba(30,33,36,var(--hover-opacity));
```

### Spacing

```css
--headline-100-size: 1.8888888889rem;
--headline-200-size: 1.8888888889rem;
--headline-300-size: 1.8888888889rem;
--body-100-size: 0.8888888889rem;
--body-200-size: 1rem;
--body-300-size: 1rem;
--body-400-size: 1.1111111111rem;
--details-captions-size: 0.5555555556rem;
--form-placeholder-size: 0.7777777778rem;
--h-spacing: 1.1111111111rem;
--section-v-spacing: 3.3333333333rem;
--spacing-tiny: 0.1666666667rem;
--spacing-xs: 0.5555555556rem;
--spacing-s: 1.1111111111rem;
--spacing-m: calc(var(--gutter) * 2);
--spacing-l: calc(var(--gutter) * 4);
```

### Typography

```css
--headline-100-letter: normal;
--headline-200-letter: normal;
--headline-300-letter: normal;
--details-captions-letter: 0.05em;
```

### Other

```css
--hover-opacity: 0.33;
--qualitative-default: #a7b6c2;
--qualitative-0: #147eb3;
--qualitative-1: #29a634;
--qualitative-2: #d1980b;
--qualitative-3: #d13913;
--qualitative-4: #634dbf;
--qualitative-5: #d17e09;
--qualitative-6: #9f1239;
--qualitative-7: #00a396;
--qualitative-8: #5642a6;
--qualitative-9: #728c23;
--headline-100-line: 1;
--headline-100-family: "Alliance No.1",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
--headline-200-line: 1.1765;
--headline-200-family: "Alliance No.1",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
--headline-300-line: 1.1765;
--headline-300-family: "Alliance No.1",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
--body-100-line: 1.4286;
--body-200-line: 1.3889;
--body-300-line: 1.3;
--body-400-line: 1.3;
--details-captions-line: 1.6;
--details-captions-family: "Alliance No.2","Alliance No.1",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
--details-earmark-family: "Alliance No.2","Alliance No.1",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
--zero: 0 * 1rem;
--max-width: 80rem;
--grid: repeat(12,minmax(10px,1fr));
--gutter: 0.5555555556rem;
--v-gutter: 1.1111111111rem;
--h-contain: max(calc((100% - var(--max-width)) / 2),var(--h-spacing));
--h-contain-no-bleed: max(calc((100% - var(--max-width)) / 2),var(--zero));
```

### Dependencies

```css
0: --text-color-medium;
0: --hover-opacity;
0: --gutter;
0: --gutter;
0: --max-width;
1: --h-spacing;
0: --max-width;
1: --zero;
```

### Semantic

```css
--error-color: #ff4136;
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| xs | 374px | max-width |
| 400px | 400px | min-width |
| sm | 425px | max-width |
| sm | 426px | min-width |
| sm | 530px | max-width |
| 550px | 550px | min-width |
| 559px | 559px | max-width |
| 560px | 560px | min-width |
| sm | 600px | max-width |
| sm | 640px | max-width |
| md | 759px | max-width |
| md | 760px | min-width |
| md | 767px | max-width |
| md | 768px | min-width |
| 896px | 896px | max-width |
| 959px | 959px | max-width |
| lg | 960px | min-width |
| 1200px | 1200px | min-width |
| 1440px | 1440px | min-width |

## Transitions & Animations

**Easing functions:** `ease`, `linear`

**Durations:** `0.25s`, `0.15s`, `0.125s`, `0.175s`, `0.03333s`, `0.06666s`, `0.09999s`, `0.13332s`, `0.16665s`, `0.19998s`, `0.23331s`, `0.3s`, `0s`, `0.2s`, `0.1s`

### Common Transitions

```css
transition: all;
transition: 0.25s ease-in-out;
transition: opacity 0.15s linear, filter 0.15s linear;
transition: background-color 0.125s ease-in 0.175s;
transition: transform 0.25s 0.03333s, opacity 0.25s 0.03333s;
transition: transform 0.25s 0.06666s, opacity 0.25s 0.06666s;
transition: transform 0.25s 0.09999s, opacity 0.25s 0.09999s;
transition: transform 0.25s 0.13332s, opacity 0.25s 0.13332s;
transition: transform 0.25s 0.16665s, opacity 0.25s 0.16665s;
transition: transform 0.25s 0.19998s, opacity 0.25s 0.19998s;
```

### Keyframe Animations

**ptcom-design__progress__nr1asz**
```css
@keyframes ptcom-design__progress__nr1asz {
  0% { background: rgb(30, 33, 36); left: -130%; }
  50% { background: rgb(30, 33, 36); left: 130%; }
  51% { background: rgb(255, 255, 255); }
  100% { background: rgb(255, 255, 255); }
}
```

**onetrust-fade-in**
```css
@keyframes onetrust-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (99 instances)

```css
.buttons {
  background-color: rgb(30, 33, 36);
  color: rgb(30, 33, 36);
  font-size: 16px;
  font-weight: 400;
  padding-top: 5px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Cards (2 instances)

```css
.cards {
  background-color: rgb(255, 255, 255);
  border-radius: 2px;
  box-shadow: rgba(0, 0, 0, 0) 0px 2px 4px 0px, rgba(50, 50, 93, 0.1) 0px 7px 14px 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Inputs (7 instances)

```css
.inputs {
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  border-color: rgb(0, 0, 0);
  border-radius: 0px;
  font-size: 18px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Links (453 instances)

```css
.links {
  color: rgb(99, 99, 99);
  font-size: 16px;
  font-weight: 400;
}
```

### Navigation (34 instances)

```css
.navigation {
  background-color: rgb(255, 255, 255);
  color: rgb(30, 33, 36);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: static;
}
```

### Footer (3 instances)

```css
.footer {
  background-color: rgb(244, 244, 244);
  color: rgb(30, 33, 36);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 18px;
}
```

### Modals (1 instances)

```css
.modals {
  border-radius: 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Dropdowns (10 instances)

```css
.dropdowns {
  background-color: rgb(255, 255, 255);
  border-radius: 0px;
  border-color: rgb(30, 33, 36);
  padding-top: 0px;
}
```

### Badges (2 instances)

```css
.badges {
  color: rgb(118, 118, 118);
  font-size: 12px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Tabs (6 instances)

```css
.tabs {
  background-color: rgb(255, 255, 255);
  color: rgb(30, 33, 36);
  font-size: 18px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-color: rgb(30, 33, 36);
  border-radius: 0px;
}
```

### Switches (6 instances)

```css
.switches {
  background-color: rgb(255, 255, 255);
  border-radius: 0px;
  border-color: rgb(30, 33, 36);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Input — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(30, 33, 36);
  padding: 1px 2px 1px 2px;
  border-radius: 0px;
  border: 0px none rgb(30, 33, 36);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(43, 89, 69);
  color: rgb(255, 255, 255);
  padding: 10.2857px 10.2857px 10.2857px 10.2857px;
  border-radius: 0px;
  border: 1px solid rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 400;
```

### Button — 6 instances, 1 variant

**Variant 1** (6 instances)

```css
  background: rgb(255, 255, 255);
  color: rgb(30, 33, 36);
  padding: 1px 6px 1px 6px;
  border-radius: 0px;
  border: 1px solid rgb(43, 89, 69);
  font-size: 10px;
  font-weight: 400;
```

### Button — 2 instances, 2 variants

**Variant 1** (1 instance)

```css
  background: rgb(255, 255, 255);
  color: rgb(30, 33, 36);
  padding: 1px 6px 1px 6px;
  border-radius: 0px;
  border: 1px solid rgb(43, 89, 69);
  font-size: 10px;
  font-weight: 400;
```

**Variant 2** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 1px 6px 1px 6px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 18px;
  font-weight: 400;
```

### Button — 75 instances, 3 variants

**Variant 1** (3 instances)

```css
  background: rgb(255, 255, 255);
  color: rgb(30, 33, 36);
  padding: 1px 6px 1px 6px;
  border-radius: 0px;
  border: 1px solid rgb(43, 89, 69);
  font-size: 10px;
  font-weight: 400;
```

**Variant 2** (3 instances)

```css
  background: rgb(30, 33, 36);
  color: rgb(255, 255, 255);
  padding: 1px 6px 1px 6px;
  border-radius: 0px;
  border: 1px solid rgb(78, 138, 247);
  font-size: 10px;
  font-weight: 400;
```

**Variant 3** (69 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(30, 33, 36);
  padding: 5px 0px 5px 0px;
  border-radius: 0px;
  border: 0px none rgb(30, 33, 36);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(118, 118, 118);
  padding: 0px 10px 0px 10px;
  border-radius: 0px;
  border: 1px solid rgb(118, 118, 118);
  font-size: 12px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(118, 118, 118);
  padding: 0px 10px 0px 10px;
  border-radius: 0px;
  border: 1px solid rgb(118, 118, 118);
  font-size: 12px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(30, 33, 36);
  padding: 1px 6px 1px 0px;
  border-radius: 0px;
  border: 0px none rgb(30, 33, 36);
  font-size: 16px;
  font-weight: 400;
```

## Layout System

**5 grid containers** and **548 flex containers** detected.

### The System

- **Content column** — 1280px wide (full-bleed — no constrained container found), 15px gutters (1% edge density)
  - Widest constrained block inside it: 660px
  - Width ladder: 408px · 660px · 1280px
- **Column system** — 3 columns
- **Gap scale** — 4px · 6px · 8px · 10px · 16px · 30px
- **Fluid layout** — 5 clamp/viewport declarations

```css
.ptcom-design__wrapper__18wrdu0.ptcom-design__active__18wrdu0 { width: 100vw; }
.ptcom-design__modalWrapper__18ms6of { width: 100vw; }
#onetrust-banner-sdk.otFloatingRoundedCorner { max-width: min(375px, -2em + 100vw); }
#onetrust-pc-sdk { width: min(730px, 100vw); }
#onetrust-pc-sdk { max-width: min(730px, 100vw); }
```

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 1440px | 0px |
| calc(100% - 8px) | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 3-column | 3x |
| 1-column | 1x |
| 2-column | 1x |

### Grid Templates

```css
grid-template-columns: 300px 660px 230px;
gap: normal 30px;
grid-template-columns: 322px 322px;
gap: 16px;
grid-template-columns: 32px 32px 32px;
gap: 4px;
grid-template-columns: 32px 32px 32px;
gap: 4px;
grid-template-columns: 93px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 528x |
| column/nowrap | 20x |

**Gap values:** `normal 30px`, `4px`, `6px`, `8px`, `10px`, `16px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 6 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#ffffff` | `#1e2124` | 16.18:1 | AAA |
| `#ffffff` | `#2b5945` | 8.02:1 | AAA |

## Design System Score

**Overall: 90/100 (Grade: A)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 82/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 100/100 |
| Border Radius Consistency | 100/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 29 !important rules — prefer specificity over overrides
- 76% of CSS is unused — consider purging
- 2175 duplicate CSS declarations

## Z-Index Map

**8 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 2147483646,2147483647 | div.o.n.e.t.r.u.s.t.-.p.c.-.d.a.r.k.-.f.i.l.t.e.r. .o.t.-.h.i.d.e. .o.t.-.f.a.d.e.-.i.n, section, div.o.t.P.c.T.a.b. .o.t.-.h.i.d.e. .o.t.-.f.a.d.e.-.i.n. .o.t.R.e.l.F.o.n.t |
| dropdown | 600,800 | div.p.t.c.o.m.-.d.e.s.i.g.n._._.n.a.v.C.o.n.t.a.i.n.e.r._._.i.a.n.u.1.a. .p.t.c.o.m.-.d.e.s.i.g.n._._.h.a.s.D.r.o.p.d.o.w.n.N.a.v._._.i.a.n.u.1.a, a.p.t.c.o.m.-.d.e.s.i.g.n._._.b.u.t.t.o.n._._.1.d.8.x.e.y.x. .p.t.c.o.m.-.d.e.s.i.g.n._._.f.e.e.d.b.a.c.k.B.u.t.t.o.n._._.i.a.n.u.1.a. .p.t.c.o.m.-.d.e.s.i.g.n._._.f.e.e.d.b.a.c.k.B.u.t.t.o.n.-.W.i.t.h.T.o.c._._.i.a.n.u.1.a, button.p.t.c.o.m.-.d.e.s.i.g.n._._.b.u.t.t.o.n._._.2.o.j.h.e.h |
| sticky | 10,10 | div.p.t.c.o.m.-.d.e.s.i.g.n._._.h.e.a.d.e.r.W.i.t.h.R.i.g.h.t.E.l.e.m.e.n.t._._.p.0.5.5.k.o |
| base | 1,1 | ul.p.t.c.o.m.-.d.e.s.i.g.n._._.p.a.g.e.G.r.o.u.p.L.i.s.t._._.1.m.5.1.2.f.x. .p.t.c.o.m.-.d.e.s.i.g.n._._.s.u.b.N.a.v.L.i.s.t._._.1.w.c.l.y.m.i. .p.t.c.o.m.-.d.e.s.i.g.n._._.p.a.g.e.G.r.o.u.p.L.i.s.t.F.i.x.e.d.W.i.d.t.h._._.1.m.5.1.2.f.x, ul.p.t.c.o.m.-.d.e.s.i.g.n._._.p.a.g.e.G.r.o.u.p.L.i.s.t._._.1.m.5.1.2.f.x, ul.p.t.c.o.m.-.d.e.s.i.g.n._._.p.a.g.e.G.r.o.u.p.L.i.s.t._._.1.m.5.1.2.f.x. .p.t.c.o.m.-.d.e.s.i.g.n._._.p.a.g.e.G.r.o.u.p.L.i.s.t.F.i.x.e.d.W.i.d.t.h._._.1.m.5.1.2.f.x |

**Issues:**
- Very high z-index values: 2147483646, 2147483647

## SVG Icons

**11 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| xs | 1 |
| sm | 3 |
| md | 5 |
| lg | 1 |
| xl | 1 |

**Icon colors:** `rgb(30, 33, 36)`, `currentColor`, `rgb(118, 118, 118)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Alliance No.1 | self-hosted | 400, 700 | normal, italic |
| Alliance No.2 | self-hosted | 400, 700 | normal, italic |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 75 | objectFit: fill, borderRadius: 0px, shape: square |
| gallery | 5 | objectFit: fill, borderRadius: 0px, shape: square |
| general | 3 | objectFit: fill, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (74x), 3:2 (4x), 4.15:1 (1x), 2.8:1 (1x), 2.09:1 (1x), 9:16 (1x), 4.33:1 (1x)

## Motion Language

**Feel:** smooth · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `100ms` | 100 |
| `sm` | `175ms` | 175 |
| `md` | `300ms` | 300 |
| `xxl` | `3333s` | 3333000 |

### Easing Families

- **ease-in-out** (33 uses) — `ease`
- **linear** (1 uses) — `linear`

### Keyframes In Use

| name | kind | properties | uses |
|---|---|---|---|
| `onetrust-fade-in` | fade | opacity | 2 |

## Component Anatomy

### button — 87 instances

**Slots:** label

## Brand Voice

**Tone:** neutral · **Pronoun:** third-person · **Headings:** Title Case (tight)

### Top CTA Verbs

- **object** (8)
- **ab** (6)
- **function** (3)
- **en** (2)
- **functions** (2)
- **typescript** (2)
- **core** (2)
- **legacy** (2)

### Button Copy Patterns

- "ab
xy" (6×)
- "en" (2×)
- "core concepts" (2×)
- "configuration" (2×)
- "send feedback" (1×)
- "jp" (1×)
- "kr" (1×)
- "zh" (1×)
- "system" (1×)
- "hide sidebar" (1×)

### Sample Headings

> ONTOLOGY BUILDING
> CONTENTS
> Privacy Preference Center
> Your Privacy
> Strictly Necessary Cookies
> Targeting Cookies
> Cookie List

## Page Intent

**Type:** `docs` (confidence 1)
**Description:** The home page below is shown when opening Object Explorer. It is an orientation hub where one can start exploring objects, either with a specific...

Alternates: legal (0.4)

## Section Roles

Reading order (top→bottom): nav → content → content → content → nav → nav → footer

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | nav | ONTOLOGY BUILDING | 0.9 |
| 1 | footer | — | 0.95 |
| 2 | nav | CONTENTS | 0.9 |
| 3 | nav | Privacy Preference Center | 0.4 |
| 4 | content | Cookie List | 0.3 |
| 5 | content | — | 0.3 |
| 6 | content | — | 0.3 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.289 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 50px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Imagery Style

**Label:** `mixed` (confidence 0.024)
**Counts:** total 83, svg 75, icon 74, screenshot-like 0, photo-like 0
**Dominant aspect:** square-ish
**Radius profile on images:** square

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Alliance No.1` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
