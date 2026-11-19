# Design Language: Linear

> Extracted from `https://linear.app/demo/team/ENG/active` on November 19, 2026
> 1247 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Tonal Ramps

Generated in OKLCH from each role colour, so the steps are perceptually even. The site's own colour keeps its position in the ladder.

| Role | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| neutral | `#f2f5fc` | `#e6eaf1` | `#d5d9e2` | **`#b0b5c0`** | `#9ba0aa` | `#7d828c` | `#686c76` | `#53575f` | `#43474e` | `#36393f` | `#1d1f23` |

### Semantic Pairs

| Role | Background | Foreground | Contrast | Level |
|------|------------|------------|----------|-------|
| `surface.page` | `#efeff0` | `#000000` | 18.27:1 | AAA |
| `surface.raised` | `#f9f9fa` | `#000000` | 19.96:1 | AAA |

### Dominance

Share of painted background area — what the page looks like, as opposed to what it declares most often.

- `#f9f9fa` — 50%
- `#efeff0` — 50%

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#000000` | hsl(0, 0%, 0%) | 2472 |
| `#b0b5c0` | hsl(221, 11%, 72%) | 21 |
| `#efeff0` | hsl(240, 3%, 94%) | 1 |
| `#f9f9fa` | hsl(240, 9%, 98%) | 1 |
| `#e2e2e2` | hsl(0, 0%, 89%) | 1 |

### Background Colors

Used on large-area elements: `#efeff0`, `#f9f9fa`

### Text Colors

Text color palette: `#b0b5c0`, `#000000`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#000000` | text, border | 2472 |
| `#b0b5c0` | text, border | 21 |
| `#efeff0` | background | 1 |
| `#f9f9fa` | background | 1 |
| `#e2e2e2` | border | 1 |

## Typography

### Font Families

- **Inter Variable** — used for body (1 elements)

### Type System

- **Scale ratio** — 1.067 (minor second), anchored at 12px · 100% of sizes sit on the ladder
- **Fluid type** — none; sizes are fixed per breakpoint

### Named Scale

| Role | Size | Weight | Line Height | Tracking |
|------|------|--------|-------------|----------|
| `body-sm` | 16px / 1rem | 400 | normal | normal |
| `micro` | 13px / 0.8125rem | 500 | 19.5px | normal |
| `sm-3` | 12px / 0.75rem | 500 | 18px | normal |

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 16px | 1rem | 400 | normal | normal | html, head, style, script |
| 13px | 0.8125rem | 500 | 19.5px | normal | div |
| 12px | 0.75rem | 500 | 18px | normal | div, svg, circle, script |

### Font Weights in Use

`400` (1236x), `500` (11x)

## Spacing

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| lg | 12px | 1 |

## CSS Custom Properties

### Colors

```css
--bg-sidebar-light: #efeff0;
--bg-base-color-light: #f9f9fa;
--bg-border-color-light: #e2e2e2;
--content-color-light: #b0b5c0;
--content-highlight-color-light: #23252a;
--loading-error-muted-color-light: #5b5b5d;
--loading-error-secondary-bg-light: #fefeff;
--loading-error-secondary-border-light: #00000016;
--loading-error-secondary-hover-bg-light: #f7f7f7;
--loading-error-secondary-label-light: #2f2f31;
--loading-error-secondary-shadow-light: 0px 3px 6px -2px #00000005,0px 1px 1px #0000000a;
--bg-sidebar-dark: #09090a;
--bg-base-color-dark: #121213;
--bg-border-color-dark: #212224;
--content-color-dark: #6b6f76;
--content-highlight-color-dark: #ffffff;
--loading-error-muted-color-dark: #97979a;
--loading-error-secondary-bg-dark: #1c1c1d;
--loading-error-secondary-border-dark: #ffffff22;
--loading-error-secondary-hover-bg-dark: #252627;
--loading-error-secondary-label-dark: #e2e3e5;
--loading-error-secondary-shadow-dark: 0px 4px 4px -1px #0000000a,0px 1px 1px 0px #00000014;
--control-border-radius: var(--control-border-radius, 4px);
--integration-cms-link-color: ;
--changelog-bg-border-faint: ;
--editor-bg-border-thin: #dedede;
--fuzzy-date-picker-control-primary-hover: ;
--diff-view-gutter-added-soft-bg: ;
--color-text-tertiary: ;
--comment-actions-default-background-color: ;
--badge-highlight-color: ;
--details-property-highlight-color: ;
--bg-sidebar-color: #efeff0;
--dp-label-muted: ;
--editor-text-color: #2f2f31;
--btn-group-divider-color-current: transparent;
--diff-view-gutter-removed-bg: ;
--dp-bg-weekend: ;
--integration-cms-text-color: ;
--loading-error-secondary-hover-bg: #f7f7f7;
--app-scrollbar-bg: ;
--selection-bg-active: color-mix(in srgb, #6d78d5 40%, transparent);
--color-border-secondary: ;
--btn-highlight-bg: transparent;
--editor-bg-shade-hover: #e4e4e5;
--pull-request-comment-prompt-label-muted: ;
--sx-1bganv9: ;
--color-border-tertiary: ;
--pull-request-comment-prompt-bg-shade: ;
--loading-error-secondary-border: #00000016;
--changelog-bg-border: ;
--btn-group-divider-color-hover: transparent;
--logic-list-filter-button-border-width: 1px;
--sx-bg2ob9: 400px;
--dp-control-primary: ;
--dp-border-radius: 8px;
--btn-group-divider-color: transparent;
--btn-highlight-color: ;
--loading-error-secondary-shadow: 0px 3px 6px -2px #00000005,0px 1px 1px #0000000a;
--color-border-primary: ;
--diff-view-comment-button-removed-bg-hover: ;
--diff-view-inserted-full-line-bg: ;
--loading-error-secondary-label: #2f2f31;
--ai-selection-bg: ;
--editor-border-solid: #d2d2d2;
--color-text-primary: ;
--diff-view-gutter-added-bg: ;
--diff-view-removed-inline-bg: ;
--integration-cms-link-hover-color: ;
--settings-list-view-item-border-padding: 16px;
--modal-dp-control-primary-hover: ;
--diff-view-focus-bg: ;
--focus-ring-width: 1px;
--non-active-hover-bg-color: ;
--focus-ring-color: #6d78d5;
--editor-bg-shade: #e9e9ea;
--content-color: #b0b5c0;
--row-highlighted-bg: transparent;
--diff-view-gutter-moved-bg: ;
--timeline-background-color: ;
--comment-metadata-link-highlight-color: ;
--details-property-default-highlight-color: ;
--fuzzy-date-picker-label-muted: ;
--comment-actions-background-color: ;
--modal-dp-bg-selected: ;
--pull-request-comment-prompt-bg-border: ;
--diff-view-removed-bg: ;
--color-text-secondary: ;
--content-bg-color: ;
--icon-replacement-color: ;
--selection-bg: color-mix(in srgb, #5b5c5e 20%, transparent);
--changelog-bg-sub: ;
--bg-base-color: #f9f9fa;
--quick-filter-progress-track-color: ;
--app-scrollbar-bg-hover: ;
--loading-error-secondary-bg: #fefeff;
--color-bg-quinary: 0;
--color-text-quaternary: ;
--editor-faint-placeholder-color: ;
--diff-view-blank-bg: ;
--bg-border-color: #e2e2e2;
--diff-view-editor-foreground: ;
--settings-list-view-item-border-bottom-offset: 0px;
--logic-list-filter-button-border-color: transparent;
--diff-view-gutter-removed-soft-bg: ;
--form-description-link-hover-color: ;
--fuzzy-date-picker-bg-selected: ;
--comment-border-radius: ;
--dp-bg-border: ;
--timeline-bar-background-color: ;
--icon-default-color: ;
--app-scrollbar-bg-active: ;
--diff-view-comment-button-removed-bg: ;
--row-applied-bg: transparent;
--app-link-color: ;
--diff-view-inserted-inline-bg: ;
--changelog-label-muted: ;
--diff-view-comment-button-added-bg: ;
--sx-nftbgy: #e7e7e8;
--gutter-card-height: 0px;
--color-bg-tertiary: ;
--header-color: ;
--diff-view-inserted-bg: ;
--diff-view-comment-button-added-bg-hover: ;
--linear-find-highlight-color: ;
--btn-group-inner-highlight-bg: transparent;
--dp-highlighted-color: ;
--focus-ring-outline: 1px solid #6d78d5;
--color-bg-quaternary: ;
--triage-rule-read-only-button-bg: ;
--color-bg-primary: ;
--content-highlight-color: #23252a;
--editor-border-solid-hover: #b4b4b4;
--icon-color: ;
--diff-view-comment-button-default-bg: ;
--diff-view-removed-full-line-bg: ;
--loading-error-muted-color: #5b5b5d;
--diff-view-comment-button-default-bg-hover: ;
--bg-color: ;
--dp-control-primary-hover: ;
--color-bg-secondary: ;
--settings-list-view-border-color: ;
```

### Spacing

```css
--editor-block-spacing-large: calc(1.375 * 1rem);
--font-size-title1: 2.25rem;
--editor-block-menu-size: 20px;
--diff-view-editor-font-size: ;
--font-size-miniPlus: .75rem;
--editor-block-spacing-small: calc(.375 * 1rem);
--fuzzy-date-picker-font-size-mini-plus: ;
--font-size-microPlus: round(up, .6875rem, 2px);
--font-size-largePlus: 1.125rem;
--font-size-smallPlus: .8125rem;
--settings-list-view-item-padding-x: 16px;
--settings-list-view-item-gap: 12px;
--settings-list-view-box-spacing: 12px;
--carousel-gap: ;
--diff-view-inline-highlight-padding-block: ;
--font-size-title3: 1.25rem;
--dp-font-size-small: .8125rem;
--editor-block-spacing: 1rem;
--lightbox-pixel-size: 0;
--font-size-regular: .9375rem;
--font-size-mini: .75rem;
--comment-actions-padding-left: 50px;
--editor-last-invisible-paragraph-spacing: 10px;
--editor-image-margin-start: auto;
--editor-font-size: .9375rem;
--editor-letter-spacing: -.00666667em;
--font-size-micro: round(up, .6875rem, 2px);
--font-size-title2: 1.5rem;
--font-size-small: .8125rem;
--font-size-large: 1.125rem;
--font-size-regularPlus: .9375rem;
--overview-form-margin-top: 64px;
--font-monospace: "Berkeley Mono", "SFMono Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
--settings-list-view-item-padding-y: 12px;
--editor-white-space: pre-wrap;
--fuzzy-date-picker-month-horizontal-spacing: .96rem;
```

### Typography

```css
--font-emoji: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji";
--font-regular: "Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", "Linear Thai", sans-serif;
--diff-view-editor-line-height: ;
--font-weight-medium: 500;
--font-weight-normal: 450;
--editor-line-height: 1.6;
--font-weight-bold: 700;
--dp-font-weight-medium: 500;
--diff-view-editor-font-family: ;
--editor-font-weight: 450;
--font-weight-light: 300;
--timeline-chronology-cycle-bar-text: ;
--link-text-decoration: none;
--font-weight-semibold: 600;
```

### Shadows

```css
--btn-overlay-shadow-hover: none;
--btn-overlay-shadow: none;
--changelog-shadow-medium: ;
```

### Radii

```css
--radius-rounded: 9999px;
--settings-list-view-item-bottom-radius: 0px;
--editor-block-radius: 6px;
--settings-list-view-item-top-radius: 0px;
--settings-list-view-item-radius: 10px;
```

### Other

```css
--sidebar-width: 244px;
--agent-toolbar-height: 0px;
--desktop-tabs-height: 40px;
--scrollbar-width: 12px;
--loading-error-thin-pixel: 1px;
--sx-1d01t9x: ;
--zoom-in: zoom-in;
--content-view-header-tabs-flex-basis: 300px;
--sx-1ijrdvx: #e85c20;
--sx-gauayi: ;
--sx-lvzzfs: #ffffff8c;
--sx-zkk3rq: 1;
--sx-1uv3w6h: #e9e9e9;
--sx-2d51or: 0px;
--active-tab-left: 0px;
--speed-highlightFadeOut: .15s;
--sx-vuknjc: transparent;
--sx-12xxnta: ;
--sx-138kmyo: #b4b4b4;
--sx-1mc3c6y: #f8f8f9;
--sx-e6p7v2: 43px;
--sx-owsuzu: transparent;
--ease-in-out-quart: cubic-bezier(.77, 0, .175, 1);
--sx-18yrgu8: #00000082;
--sx-vpp110: none;
--sx-w6mwde: ;
--sx-jyk0vw: 20px;
--comment-actions-opacity: 0;
--sx-jq95p6: 36px;
--content-view-header-tabs-min-width: 300px;
--sx-tw6awd: #ffe7de;
--settings-list-view-tablet-max-input-width: 200px;
--sx-wc5opx: opacity .25s cubic-bezier(.25, .46, .45, .94);
--sx-183dfpr: #cf4608;
--sx-kthb5v: #4f5ec4;
--sx-ea5pml: #ffffff40;
--ease-in-out-circ: cubic-bezier(.785, .135, .15, .86);
--electron-control-region: none;
--speed-quickTransition: .1s;
--sx-jw5zf4: #32ae4b;
--sx-1r654ja: ;
--details-property-hover-background: ;
--sx-twzhyf: 4px;
--sx-pqiwo2: #cdcdd3;
--sx-1h2bms7: 2;
--sx-y1b6ko: 0px;
--sx-f4w00v: [timestamp] minmax(24px, auto);
--sx-6zt3z6: 1px solid #dedede;
--sx-r47mz5: currentColor;
--editor-bullet-disc-offset: .5em;
--sx-1k2yhd9: transparent;
--sx-1fh23cp: #5b5c5e;
--sx-1vyp3gc: #ffeac6;
--sx-en4zqf: 1;
--sx-11ard2x: 0px;
--sx-62pevc: ;
--sx-17mgn4b: #f7f7f8;
--sx-or1tl7: #55ccff;
--sx-ys2i3t: #1b1b1b;
--sx-fu49gr: 0;
--vp-chapters-mask: none;
--sx-1hx1gpb: transparent;
--editor-surface-background: #f8f8f9;
--sx-ue1eae: none;
--sx-b9djef: transparent;
--sx-umgfby: 0 1px 1px inset #00000011, 0 1px 3px inset #00000011, 0 2px 5px inset #00000019;
--sx-80qb8v: 0px;
--sx-1rzu7x2: #9c9c9e;
--sx-1d2fpwc: #7c7c7c;
--sx-1yh79ju: #e5e5e6;
--ease-out-circ: cubic-bezier(.075, .82, .165, 1);
--ease-out-quint: cubic-bezier(.23, 1, .32, 1);
--sx-1n1r1h9: #00000007;
--sx-b6ovjl: 150px;
--sx-1cxqmhc: #0092b9;
--sx-5t1vcl: #007eff;
--sx-46qmas: 28px;
--sx-8q2yyj: 8px;
--sx-2icmlu: #00000007;
--sx-5jglzr: none;
--agent-highlight-active: ;
--editor-image-max-height: 600px;
--settings-list-view-phone-max-input-width: 125px;
--sx-cx2ark: #d2d2d2;
--sx-1208dfj: transparent;
--sx-nihqbq: ;
--sx-14ohyvw: ;
--sx-1vjun7z: transparent;
--sx-1h56kua: #f0bf00;
--sx-nhru9t: 0px;
--sx-1rsaf4u: #e1e2ee;
--sx-sw3ywu: 0px;
--sx-1i9e63q: auto;
--sx-35jz1e: #c5c6cc;
--sx-h1y8j5: 0px;
--sx-10lzhmx: 0px 3px 6px -2px #00000005, 0px 1px 1px #0000000a;
--diff-view-git-added-soft-fg: ;
--sx-thqf4m: ;
--sx-k68kma: #d6d6d6;
--sx-1phsih9: 0;
--sx-1rnpv0l: ;
--changelog-label-link: ;
--sx-ykavoc: 8px;
--table-header-travel: 0px;
--sx-mn0vzc: 0px;
--sx-1ye6hau: ;
--sx-v3o8qy: #9e9ea1;
--sx-d29rh7: #f1f1f1;
--block-comment-outline: transparent;
--sx-pw6wed: 7px;
--table-header-start: 0px;
--sx-1pirhht: 100%;
--editor-toolbar-fade-duration: 40ms;
--sx-13m9wh7: #006cdb;
--sx-14duy06: [title] minmax(0, 1fr);
--logic-list-container-background: transparent;
--sx-13kjjc4: #f3f3f3;
--sx-12bxqqe: ;
--sx-1q6smeb: #d9343f;
--ease-in-quint: cubic-bezier(.755, .05, .855, .06);
--sx-c3gk8m: 0 0 0 1px #6d78d5;
--sx-1cbklrt: transparent;
--sx-sato2r: ;
--sx-16hn3q3: #f0f0f1;
--speed-highlightFadeIn: 0s;
--dp-label-title: ;
--sx-1xaoi8i: #3f60d9;
--sx-mbhm4x: 0px;
--sx-d1bcc1: #00000007;
--fuzzy-date-picker-thin-pixel: ;
--sx-d3xb6x: 0px;
--sx-1u14tly: 0px;
--sx-5qq5xi: 1;
--sx-3zwjav: #2f2f31;
--sx-1crf4sx: ;
--header-tab-link-right-icon-fill: ;
--available-height: none;
--sx-8gevfv: #26a544;
--agent-panel-content-inset-inline: 24px;
--sx-8q2ft0: 57px;
--editor-label-link: ;
--sx-6od1kq: #dbffff;
--sx-154g0i3: 1px;
--changelog-control-tertiary-hover: ;
--sx-ws85c5: #fcfaff;
--sx-1knprew: transparent;
--sx-1qdowq0: #0000003f;
--sx-15wwovl: #f1f1f1;
--sx-6ayg1n: #fefeff;
--agent-composer-contains-question-frame: 0;
--sx-ikq9iy: #fae6e3;
--sx-bf3q0r: 0%;
--sx-y7sonv: 0px;
--dp-label-base: ;
--sx-80z91o: none;
--timeline-bar-tooltip-offset: ;
--ease-out-expo: cubic-bezier(.19, 1, .22, 1);
--settings-list-view-max-input-width: ;
--sx-g52i5g: #e0e0e1;
--sx-9o00jb: #00aabd;
--sx-1awr4hy: #656567;
--sx-habas: 9999px;
--sx-1jnyq19: transparent;
--sx-1bd72wb: none;
--sx-16143rj: #555555;
--sx-1k7nh0l: #fffaa6;
--editor-block-menu-offset: 28px;
--sx-e51q5u: transparent;
--speed-regularTransition: .25s;
--sx-1d5ccp0: ;
--sx-1yxodyc: ;
--detail-button-control-tertiary-selected: ;
--sx-142jeir: #dedede;
--sx-67d2b4: #d2d2d2;
--editor-safe-area: 16px;
--sx-of04q6: transparent;
--sx-uray09: transparent;
--ease-in-out-quad: cubic-bezier(.455, .03, .515, .955);
--sx-oknmg0: 0;
--sx-1s7dof8: transparent;
--sx-1yxqotz: #5e6ad2;
--sx-1v6vk6k: transparent;
--settings-list-view-item-min-height: 60px;
--diff-view-gutter-added-fg: ;
--sx-356tna: #dfdfe0;
--diff-view-git-deleted-fg: ;
--sx-puww38: ;
--sx-1ki3hp4: #fefeff;
--sx-u6ngdw: #d6d6d7;
--sx-n768d: 100%;
--fuzzy-date-picker-label-base: ;
--ease-in-expo: cubic-bezier(.95, .05, .795, .035);
--ease-in-cubic: cubic-bezier(.55, .055, .675, .19);
--sx-nnhj77: ;
--sx-1dhgva: ;
--sx-17ckey5: #e33e46;
--diff-view-editor-background: ;
--sx-74qs5: #ffffff00;
--sx-gp8rmj: ;
--sx-14ggo8w: #e3eee5;
--sx-f6abet: #87888a;
--sx-1jv8une: ;
--sx-7jk47a: #eaeaeb;
--block-comment-outline-style: none;
--sx-1m4y240: #eeeeef;
--sx-18dvjbk: ;
--diff-view-editor-background-opaque: ;
--sx-ljw4h1: #ececed;
--header-height: ;
--sx-18pfyxa: 6px 12px;
--editor-todolist-checkbox-width: 14px;
--sx-1urpf9d: #00000007;
--timeline-bar-height: ;
--sx-1stx5uy: #2bb7ff;
--sx-7ide1: #4656bb;
--sx-1u7bqqx: 0px;
--timeline-chronology-cycle-bar-tint: ;
--sx-5li4y: #ffffffbf;
--ease-out-quad: cubic-bezier(.25, .46, .45, .94);
--editor-toolbar-reveal-delay: .1s;
--detail-button-control-tertiary-hover: ;
--sx-138rywl: 13vh;
--sx-g7ivzp: 24px;
--sx-1ltkoa: #9d9d9f;
--sx-1dcvabv: #f7e3e4;
--sx-1n3lj3z: 100%;
--sx-1q5mwld: ;
--sx-91u3ar: #e0b100;
--sx-y7jo44: ;
--sx-ot17o6: #00a2b5;
--sx-18uyzu6: #007818;
--sx-1jpq86z: transparent;
--sx-1gm0lru: #e9e9ea;
--sx-9pdekr: #7c7c7c;
--sx-34xdpc: #c31930;
--sx-74og9a: #dfdfe0;
--sx-1gxylln: #eeeeef;
--media-player-preview: 0;
--editor-hairline: 1px;
--diff-view-git-modified-fg: ;
--media-player-range-start: 0;
--ease-out-quart: cubic-bezier(.165, .84, .44, 1);
--sx-1ccqs4f: #f0f0f0;
--sx-12c2v8z: transparent;
--sx-fwc8so: #b93200;
--ease-in-circ: cubic-bezier(.6, .04, .98, .335);
--sx-13sdql6: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji";
--sx-1hb946d: 1px;
--sx-9q4apk: calc(50% - 8px);
--sx-1dxus2b: 0px;
--sx-62li6g: ;
--sx-116kpz8: ;
--sx-1vqca58: #3dbfff;
--logic-list-filter-button-background: transparent;
--sx-1fphd1n: #fefeff;
--ease-in-quart: cubic-bezier(.895, .03, .685, .22);
--ease-in-out-cubic: cubic-bezier(.645, .045, .355, 1);
--active-tab-top: 0px;
--sx-5igtf4: #0000001a;
--sx-x9n8tw: transparent;
--sx-as9fd0: #fefeff;
--sx-1sk69r3: 100%;
--sx-hlrqpp: 100vw;
--sx-ugsh4: #d7a900;
--ease-in-out-quint: cubic-bezier(.86, 0, .07, 1);
--editor-bullet-disc-width: .5em;
--editor-placeholder-height: 0px;
--sx-1glqxor: #e4e5f2;
--sx-n8xqcl: #6d78d5;
--sx-1s9ay51: 2px;
--sx-w1p5jj: #d2d2d2;
--sx-82449w: transparent;
--sx-1qx5m0a: 0px;
--ease-in-out-expo: cubic-bezier(1, 0, 0, 1);
--sx-1k7v50d: 0 9px 48px #00000014, 0 6px 24px #00000019,  0 1px 1px #0000000a;
--sx-1ospiv4: #00000022;
--sx-p5qbno: auto;
--content-view-header-tabs-flex: 1 1 300px;
--sx-1agk939: 0px;
--sx-q9soxx: ;
--sx-15deudd: ;
--modal-dp-label-base: ;
--sx-1jffjrl: #5e69c1;
--dp-label-faint: ;
--sx-cb0zzs: #fefeff;
--sx-ch85qk: #6d78d5;
--sx-ohseg1: ;
--sx-1maueeq: auto;
--details-property-default-hover-background: ;
--sx-1ubxoo9: #f8f8f9;
--sx-3446h1: ;
--sx-wsz0k3: #43bc58;
--external: pointer;
--sx-1qlh175: #007689;
--diff-view-line-number-fg: ;
--sx-1pq3ez9: 2px;
--diff-view-gutter-removed-soft-fg: ;
--row-header-height: ;
--sx-193njt9: #00000026;
--sx-1qsdgpw: 43px;
--sx-t7c6qk: 0px;
--agent-composer-outset-inline: 0px;
--sx-1yqbkz7: 1;
--sx-hsrmg4: ;
--sx-1dhg814: 0 6px 18px #00000005, 0 3px 9px #0000000a, 0 1px 1px #0000000a;
--sx-629164: #f0f0f1;
--sx-1dd5bcf: #5b5c5e;
--sx-30t2fc: transparent;
--sx-1uoekal: #00b8cb;
--settings-list-view-single-group-header-min-height: 60px;
--release-stages-items-background: ;
--sx-gms505: 0px;
--sx-11zyrxl: ;
--carousel-arrow-path-shift: 0px;
--pr-folder-arrow-fill: ;
--sx-1uztw8p: #00000044;
--sx-1q28qnr: 7px;
--agent-panel-chat-max-width: none;
--sx-tfzjps: transparent;
--review-input-expanded-height: ;
--sx-19cs4pj: 1;
--sx-ar3yek: transparent;
--pointer: default;
--diff-view-gutter-removed-fg: ;
--settings-list-view-thin-pixel: 1px;
--media-player-thumb-start: 0;
--action-trigger-min-width: 32px;
--agent-session-background: ;
--sx-1wu6xkv: 12px;
--agent-page-details-width: 0px;
--sx-1qt67zd: ;
--timeline-row-height: ;
--sx-1ikf7kw: #00000026;
--sx-mgdamm: ;
--sx-kwfvdu: ;
--sx-1gakdvt: #e7e8f3;
--sx-133wec9: ;
--sx-gl962a: #dedede;
--pr-file-list-sidebar-width: 0px;
--sx-imi5ey: ;
--sx-1qhehcb: ;
--sx-1a798ef: 6px;
--sx-1jhz5qx: #dedede;
--sx-129bhjt: #825f00;
--sx-1ipkkxf: "Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", "Linear Thai", sans-serif;
--diff-view-gutter-added-soft-fg: ;
--sx-1rwcria: ;
--ease-in-quad: cubic-bezier(.55, .085, .68, .53);
--sx-2mkq2x: transparent;
--agent-highlight-previous: ;
--media-player-range-end: 0;
--sx-9jlh1t: #00000082;
--sx-180qi0f: #d5ffd6;
--sx-irmyh9: #0000000f;
--sx-11lpf43: 0.8125rem;
--sx-1vpc0dj: 0px;
--sx-1bu05id: #e1243a;
--settings-list-view-input-width: ;
--sx-1f0t6bp: 13px;
--overview-subheader-top-position: 12px;
--sx-19hxmp1: #4d6cfa;
--sx-1o1lnwn: #dedede;
--sx-1fj52yw: ;
--sx-1gcjx5j: #e4e4e5;
--active-tab-height: 0px;
--diff-view-git-deleted-soft-fg: ;
--sx-1ddj3ws: ;
--sx-1em7oyp: #e3f1ff;
--sx-11vg3qk: #ff7235;
--sx-um3pee: -12px;
--sx-13q74cg: transparent;
--sx-i20l48: #f34e52;
--sx-1edn6di: #eaeaeb;
--sx-2sixw9: 8px;
--sx-j1ai0m: #2f2f31;
--sx-f3kpr5: #eeeeef;
--anchor-width: 0px;
--zoom-out: zoom-out;
--review-pill-highlight-background: ;
--logic-list-container-hover-background: transparent;
--sx-1nirgtt: -3px;
--diff-view-git-added-fg: ;
--dp-control-label: ;
--agent-item-min-width: ;
--sx-agxjf1: ;
--sx-ickszr: #fefeff;
--sx-1hz3utq: #f26428;
--ease-out-cubic: cubic-bezier(.215, .61, .355, 1);
--dp-thin-pixel: 1px;
--sx-13epfux: #616161;
--sx-axo4ug: 0 0 0 0.5px #dedede;
--sx-10845vo: #c9ffff;
--sx-10o0rs5: #2f2f31;
--sx-12b209l: transparent;
--sx-1u1lwzs: transparent;
--sx-1ps2i54: #e0edf1;
--sx-a53adu: ;
--sx-1umwnkk: "Berkeley Mono", "SFMono Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
--sx-184j388: ;
--sx-1jmjcvw: #0000001a;
--sx-1rt708v: #fefeff;
--sx-105wzx7: #947100;
--logic-list-item-label-width: 6ch;
--line-number-width: 50px;
--sx-1ub7w50: #000000a0;
--speed-slowTransition: .35s;
--sx-3vxfcz: transparent;
--sx-1uu732i: 12px;
--sx-msgncm: #f7eee1;
--sx-toat0o: 1;
--sx-1eg3f49: transparent;
--sx-hfmm6c: #fefeff;
--sx-1idull7: none;
--active-tab-width: 0px;
--diff-view-gutter-moved-fg: ;
--sx-1m26xuc: 17px;
--sx-1eapsa9: #9c9c9e;
--sx-1q5oaey: transparent;
--editor-list-inset: 1.5rem;
--sx-1ele6il: 1px;
--detail-button-label-base: ;
--sx-x8afrf: 6px;
--sx-nwayy8: currentColor;
--sx-1ee229o: 0s;
--sx-ciqj87: #008e08;
--sx-sd9zla: transparent;
--sx-bpgheo: #4f5dc4;
--changelog-label-title: ;
--sx-ds2y8i: 5px;
```

### Dependencies

```css
0: --control-border-radius;
```

### Semantic

```css
--loading-error-muted-color-light: #5b5b5d;
--loading-error-secondary-bg-light: #fefeff;
--loading-error-secondary-border-light: #00000016;
--loading-error-secondary-hover-bg-light: #f7f7f7;
--loading-error-secondary-label-light: #2f2f31;
--loading-error-secondary-shadow-light: 0px 3px 6px -2px #00000005,0px 1px 1px #0000000a;
--loading-error-muted-color-dark: #97979a;
--loading-error-secondary-bg-dark: #1c1c1d;
--loading-error-secondary-border-dark: #ffffff22;
--loading-error-secondary-hover-bg-dark: #252627;
--loading-error-secondary-label-dark: #e2e3e5;
--loading-error-secondary-shadow-dark: 0px 4px 4px -1px #0000000a,0px 1px 1px 0px #00000014;
--loading-error-thin-pixel: 1px;
--loading-error-secondary-hover-bg: #f7f7f7;
--loading-error-secondary-border: #00000016;
--loading-error-secondary-shadow: 0px 3px 6px -2px #00000005,0px 1px 1px #0000000a;
--loading-error-secondary-label: #2f2f31;
--loading-error-secondary-bg: #fefeff;
--loading-error-muted-color: #5b5b5d;
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| sm | 420px | max-width |
| sm | 480px | max-width |
| sm | 600px | max-width |
| sm | 640px | max-width |
| 880px | 880px | max-width |
| lg | 1023px | max-width |
| lg | 1024px | max-width |

## Transitions & Animations

**Easing functions:** `cubic-bezier(0.45, 0, 0.55, 1)`, `ease`

**Durations:** `0.1s`, `0.45s`, `0.2s`, `0.4s`, `0.8s`

### Common Transitions

```css
transition: all;
transition: opacity 0.1s;
transition: margin 0.45s cubic-bezier(0.45, 0, 0.55, 1);
transition: margin-left 0.45s cubic-bezier(0.45, 0, 0.55, 1), margin-top 0.45s cubic-bezier(0.45, 0, 0.55, 1);
transition: opacity 0.2s ease-out;
transition: opacity, stroke 0.4s;
transition: fill 0.4s;
transition: opacity 0.8s ease-out 0.8s;
```

### Keyframe Animations

**logoBackgroundPulse**
```css
@keyframes logoBackgroundPulse {
  0% { opacity: 0; transform: scale(0.8); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: scale(1); }
}
```

**fadeIn**
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**gli-small-medley**
```css
@keyframes gli-small-medley {
  0% { transform: translate(0px, 0px); }
  0.8696% { transform: translate(-1.4706%); }
  1.7391% { transform: translate(-2.9412%); }
  2.6087% { transform: translate(-4.4118%); }
  3.4783% { transform: translate(-5.8824%); }
  4.3478% { transform: translate(-7.3529%); }
  5.2174% { transform: translate(-8.8235%); }
  6.087% { transform: translate(-10.2941%); }
  6.9565% { transform: translate(-11.7647%); }
  7.8261% { transform: translate(-13.2353%); }
  8.6957% { transform: translate(-14.7059%); }
  9.5652% { transform: translate(-16.1765%); }
  10.4348% { transform: translate(-17.6471%); }
  11.3043% { transform: translate(-19.1176%); }
  12.1739% { transform: translate(-20.5882%); }
  13.0435% { transform: translate(-22.0588%); }
  13.913% { transform: translate(-23.5294%); }
  14.7826% { transform: translate(-25%); }
  15.6522% { transform: translate(-26.4706%); }
  16.5217% { transform: translate(-10.2941%); }
  17.3913% { transform: translate(-11.7647%); }
  18.2609% { transform: translate(-27.9412%); }
  19.1304% { transform: translate(-29.4118%); }
  20% { transform: translate(-30.8824%); }
  20.8696% { transform: translate(-32.3529%); }
  21.7391% { transform: translate(-33.8235%); }
  22.6087% { transform: translate(-35.2941%); }
  23.4783% { transform: translate(0px, 0px); }
  24.3478% { transform: translate(-36.7647%); }
  25.2174% { transform: translate(-38.2353%); }
  26.087% { transform: translate(-39.7059%); }
  26.9565% { transform: translate(-41.1765%); }
  27.8261% { transform: translate(-42.6471%); }
  28.6957% { transform: translate(-44.1176%); }
  29.5652% { transform: translate(-45.5882%); }
  30.4348% { transform: translate(-47.0588%); }
  31.3043% { transform: translate(-48.5294%); }
  32.1739% { transform: translate(-44.1176%); }
  33.0435% { transform: translate(-42.6471%); }
  33.913% { transform: translate(-44.1176%); }
  34.7826% { transform: translate(-45.5882%); }
  35.6522% { transform: translate(-47.0588%); }
  36.5217% { transform: translate(-48.5294%); }
  37.3913% { transform: translate(-44.1176%); }
  38.2609% { transform: translate(-42.6471%); }
  39.1304% { transform: translate(-44.1176%); }
  40% { transform: translate(-45.5882%); }
  40.8696% { transform: translate(-47.0588%); }
  41.7391% { transform: translate(-48.5294%); }
  42.6087% { transform: translate(-44.1176%); }
  43.4783% { transform: translate(-42.6471%); }
  44.3478% { transform: translate(-50%); }
  45.2174% { transform: translate(-51.4706%); }
  46.087% { transform: translate(-52.9412%); }
  46.9565% { transform: translate(-54.4118%); }
  47.8261% { transform: translate(-55.8824%); }
  48.6957% { transform: translate(-57.3529%); }
  49.5652% { transform: translate(-58.8235%); }
  50.4348% { transform: translate(-60.2941%); }
  51.3043% { transform: translate(-61.7647%); }
  52.1739% { transform: translate(-63.2353%); }
  53.0435% { transform: translate(-64.7059%); }
  53.913% { transform: translate(-66.1765%); }
  54.7826% { transform: translate(-52.9412%); }
  55.6522% { transform: translate(-54.4118%); }
  56.5217% { transform: translate(-55.8824%); }
  57.3913% { transform: translate(-57.3529%); }
  58.2609% { transform: translate(-58.8235%); }
  59.1304% { transform: translate(-60.2941%); }
  60% { transform: translate(-61.7647%); }
  60.8696% { transform: translate(-63.2353%); }
  61.7391% { transform: translate(-64.7059%); }
  62.6087% { transform: translate(-66.1765%); }
  63.4783% { transform: translate(-52.9412%); }
  64.3478% { transform: translate(-67.6471%); }
  65.2174% { transform: translate(-69.1176%); }
  66.087% { transform: translate(-70.5882%); }
  66.9565% { transform: translate(-72.0588%); }
  67.8261% { transform: translate(-73.5294%); }
  68.6957% { transform: translate(-75%); }
  69.5652% { transform: translate(-76.4706%); }
  70.4348% { transform: translate(-77.9412%); }
  71.3043% { transform: translate(-79.4118%); }
  72.1739% { transform: translate(-72.0588%); }
  73.0435% { transform: translate(-73.5294%); }
  73.913% { transform: translate(-75%); }
  74.7826% { transform: translate(-76.4706%); }
  75.6522% { transform: translate(-77.9412%); }
  76.5217% { transform: translate(-79.4118%); }
  77.3913% { transform: translate(-72.0588%); }
  78.2609% { transform: translate(-73.5294%); }
  79.1304% { transform: translate(-75%); }
  80% { transform: translate(-76.4706%); }
  80.8696% { transform: translate(-77.9412%); }
  81.7391% { transform: translate(-79.4118%); }
  82.6087% { transform: translate(-72.0588%); }
  83.4783% { transform: translate(-70.5882%); }
  84.3478% { transform: translate(-69.1176%); }
  85.2174% { transform: translate(-80.8824%); }
  86.087% { transform: translate(-82.3529%); }
  86.9565% { transform: translate(-83.8235%); }
  87.8261% { transform: translate(-85.2941%); }
  88.6957% { transform: translate(-86.7647%); }
  89.5652% { transform: translate(-88.2353%); }
  90.4348% { transform: translate(-89.7059%); }
  91.3043% { transform: translate(-91.1765%); }
  92.1739% { transform: translate(-92.6471%); }
  93.0435% { transform: translate(-94.1176%); }
  93.913% { transform: translate(-95.5882%); }
  94.7826% { transform: translate(-83.8235%); }
  95.6522% { transform: translate(-85.2941%); }
  96.5217% { transform: translate(-86.7647%); }
  97.3913% { transform: translate(-88.2353%); }
  98.2609% { transform: translate(-97.0588%); }
  99.1304% { transform: translate(-98.5294%); }
  100% { transform: translate(-98.5294%); }
}
```

**gli-sprite**
```css
@keyframes gli-sprite {
  0% { transform: translate(0px, 0px); }
  5% { transform: translate(-100%); }
  5.0001% { transform: translate(0px, 0px); }
  10% { transform: translate(-100%); }
  10.0001% { transform: translate(0px, 0px); }
  15% { transform: translate(-100%); }
  15.0001% { transform: translate(0px, 0px); }
  20% { transform: translate(-100%); }
  20.0001% { transform: translate(0px, 0px); }
  25% { transform: translate(-100%); }
  25.0001% { transform: translate(0px, 0px); }
  30% { transform: translate(-100%); }
  30.0001% { transform: translate(0px, 0px); }
  35% { transform: translate(-100%); }
  35.0001% { transform: translate(0px, 0px); }
  40% { transform: translate(-100%); }
  40.0001% { transform: translate(0px, 0px); }
  45% { transform: translate(-100%); }
  45.0001% { transform: translate(0px, 0px); }
  50% { transform: translate(-100%); }
  50.0001% { transform: translate(0px, 0px); }
  55% { transform: translate(-100%); }
  55.0001% { transform: translate(0px, 0px); }
  60% { transform: translate(-100%); }
  60.0001% { transform: translate(0px, 0px); }
  65% { transform: translate(-100%); }
  65.0001% { transform: translate(0px, 0px); }
  70% { transform: translate(-100%); }
  70.0001% { transform: translate(0px, 0px); }
  75% { transform: translate(-100%); }
  75.0001% { transform: translate(0px, 0px); }
  80% { transform: translate(-100%); }
  80.0001% { transform: translate(0px, 0px); }
  85% { transform: translate(-100%); }
  85.0001% { transform: translate(0px, 0px); }
  90% { transform: translate(-100%); }
  90.0001% { transform: translate(0px, 0px); }
  95% { transform: translate(-100%); }
  95.0001% { transform: translate(0px, 0px); }
  100% { transform: translate(-100%); }
}
```

**editor-diff-code-addition-color-change**
```css
@keyframes editor-diff-code-addition-color-change {
  0% { background-color: rgba(0, 0, 0, 0); }
  70% { background-color: var(--editor-diff-code-addition-40); }
  100% { background-color: var(--editor-diff-code-addition-30); }
}
```

**editor-diff-code-removal-color-change**
```css
@keyframes editor-diff-code-removal-color-change {
  0% { background-color: rgba(0, 0, 0, 0); }
  70% { background-color: var(--editor-diff-code-removal-40); }
  100% { background-color: var(--editor-diff-code-removal-30); }
}
```

**_ProseMirror-cursor-blink_1hu1s_1**
```css
@keyframes _ProseMirror-cursor-blink_1hu1s_1 {
  100% { visibility: hidden; }
}
```

**_blink_1hu1s_1**
```css
@keyframes _blink_1hu1s_1 {
  0%, 49% { border-color: currentcolor; }
  50%, 100% { border-color: rgba(0, 0, 0, 0); }
}
```

**_mdStreamFadeIn_18nqr_1**
```css
@keyframes _mdStreamFadeIn_18nqr_1 {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**tableDropIndicatorFadeIn**
```css
@keyframes tableDropIndicatorFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

## Layout System

**1 grid containers** and **3 flex containers** detected.

### The System

- **Fluid layout** — 12 clamp/viewport declarations

```css
.loadingError { max-width: min(440px, -48px + 100vw); }
#loadingText .loadingTextContainer { width: 100vw; }
.loadingError { max-width: calc(-32px + 100vw); }
.sx-16xn7b0 { max-width: 100vw; }
.sx-eatkqw { max-width: 50vw; }
.sx-1iey704 { max-width: 86vw; }
```

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 1-column | 1x |

### Grid Templates

```css
grid-template-columns: 64px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 2x |
| column/nowrap | 1x |

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
- 278 !important rules — prefer specificity over overrides
- 96% of CSS is unused — consider purging
- 6984 duplicate CSS declarations

## Z-Index Map

**2 unique z-index values** across 2 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 99999,99999 | div |
| dropdown | 581,581 | div.s.x.-.i.x.x.i.i.4. .s.x.-.1.3.5.5.n.6.m |

**Issues:**
- Very high z-index values: 99999

## SVG Icons

**2 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| lg | 1 |
| xl | 1 |

**Icon colors:** `url(#bkg)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Inter Variable | self-hosted | 100 900 | normal, italic |
| KaTeX_AMS | self-hosted | 400 | normal |
| KaTeX_Caligraphic | self-hosted | 400, 700 | normal |
| KaTeX_Fraktur | self-hosted | 400, 700 | normal |
| KaTeX_Main | self-hosted | 400, 700 | normal, italic |
| KaTeX_Math | self-hosted | 400, 700 | italic |
| KaTeX_SansSerif | self-hosted | 400, 700 | normal, italic |
| KaTeX_Script | self-hosted | 400 | normal |
| KaTeX_Size1 | self-hosted | 400 | normal |
| KaTeX_Size2 | self-hosted | 400 | normal |
| KaTeX_Size3 | self-hosted | 400 | normal |
| KaTeX_Size4 | self-hosted | 400 | normal |
| KaTeX_Typewriter | self-hosted | 400 | normal |

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `100ms` | 100 |
| `sm` | `200ms` | 200 |
| `md` | `400ms` | 400 |
| `lg` | `450ms` | 450 |
| `xl` | `800ms` | 800 |

### Easing Families

- **custom** (2 uses) — `cubic-bezier(0.45, 0, 0.55, 1)`
- **ease-in-out** (2 uses) — `ease`

### Keyframes In Use

| name | kind | properties | uses |
|---|---|---|---|
| `fadeIn` | fade | opacity | 1 |

## Page Intent

**Type:** `about` (confidence 0.85)

## Section Roles

Reading order (top→bottom): content

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | content | — | 0.3 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.018 |
| Shadow profile | none |
| Avg shadow blur | 0px |
| Max radius | 12px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Inter Variable` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
