# APT-LABS — Design Audit & Path to 9/10

**Audited:** working tree @ `65587d1` · Next.js 14.2.35 · Tailwind 3.4.10
**Method:** source review, compiled-CSS inspection, live render of `/`, `/ledger`, `/benben`, `/search`, `/dashboard`, `/contact`, `/robots.txt`, `/sitemap.xml`, plus WCAG contrast computation. Every claim below is reproducible; commands are given inline.

---

## 0. The one-sentence verdict

> The design *system* here is genuinely good — it just isn't **connected**. Six stylesheets, two competing palettes, eleven class names that don't exist, and a hard WCAG failure repeated 249 times. That gap between *documented intent* and *rendered reality* is exactly what reads as 5/10.

The fix is **not a redesign**. It is enforcement, connection, and completion.

### What is already good — do not touch

| Strength | Evidence |
| --- | --- |
| Real design tokens, one file, semantic names | `app/globals.css:12-40` |
| A single global focus ring | `app/globals.css:74-78` |
| Skip link wired to `#main-content` | `app/layout.tsx:34-37` |
| `prefers-reduced-motion` honored globally | `app/globals.css:106-117` |
| `aria-current` / `aria-pressed` / `role="status"` used correctly | `components/Nav.tsx:70`, `app/(site)/ledger/page.tsx:427` |
| `svh` units, `text-wrap: balance` | `app/home.css:64`, `app/home.css:80` |
| Zero network fonts, honored consistently | `tailwind.config.ts:71-94` |
| A real empty state | `app/(site)/benben/page.tsx:582-589` |
| Confident, singular copy voice | throughout |

---

## 1. Scorecard

| Dimension | Now | Why | Target |
| --- | --- | --- | --- |
| Visual craft | 4 | Unstyled buttons/inputs on 5 routes; flush-left containers; dead CSS | 9 |
| Design-system integrity | 4 | 2 palettes, 7 legacy aliases, 203 arbitrary sizes, radius hack | 9 |
| Accessibility | 5 | `--ash` = 2.86:1 used 249×; no `color-scheme` | 9 |
| Trust / truthfulness | 3 | Fabricated verification, dead-end `/search` | 9 |
| Resilience | 3 | 0 error boundaries, 0 loading states | 9 |
| Identity / discoverability | 3 | No imagery, no `og:image`, no `metadataBase`, no `public/` | 9 |
| **Composite** | **5** | | **9** |


---

## 2. TIER 0 — Ship-blockers (these alone explain the 5/10)

### 2.1 Eleven class names are used in JSX and defined nowhere

Reproduce:

```bash
node scripts/audit-classes.js        # committed with this audit
```

Confirmed against the **compiled** stylesheet, not just source:

```bash
curl -s http://localhost:4321/_next/static/css/app/layout.css \
     http://localhost:4321/_next/static/css/app/'(site)'/layout.css > /tmp/all.css
grep -c '\.site-action' /tmp/all.css   # 0
```

| Class | Used in | Consequence |
| --- | --- | --- |
| `site-action` | `dashboard`, `search`, `not-found` | **CTAs render as plain text.** Tailwind Preflight strips `button` background/border — so "Claim your slot →" and "Search" are invisible as buttons |
| `site-action-secondary` | `dashboard`, `not-found` | same |
| `site-field` | `search:29` | **Search input has no border, no background, no padding** — only a floating placeholder |
| `site-section-head` | `contact:16`, `search:19`, `dashboard:48` | Two adjacent `<span>`s collapse together → renders as **`Index / public recordlocal query`** |
| `site-kicker` | `contact:18`, `search:21` | No styling |
| `site-page` | 5 routes | No page padding |
| `site-frame` | `benben:236`, `search:18`, `dashboard:46` | Only defined scoped to `.benben-page` at ≤520px (`benben.css:52`) — **desktop gets no container** |
| `bb-board` | `benben:312` | Board container unstyled |
| `roll-section`, `roll-meta-item` | `ledger` | Unstyled |
| `nav-toggle-text` | `Nav.tsx:101` | "Menu"/"Close" label unstyled |
| `print-sheet` | 7 console files | **Print output is broken** |

**Fix — add to `app/site.css`** (that file's stated job is "Site chrome: nav, footer, page rhythm"). This closes everything above except `print-sheet`:

```css
/* ─── Site page shell ─── */
.site-page { padding-block: 32px 64px; }
@media (max-width: 640px) {
  .site-page { padding-block: 24px 48px; }
}

.site-frame {
  width: min(calc(100% - 48px), 1184px);
  margin-inline: auto;
}
@media (max-width: 640px) {
  .site-frame { width: min(calc(100% - 32px), 1184px); }
}
.site-frame--narrow { max-width: 760px; }

/* ─── Section head: the ruled label row ─── */
.site-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--rule);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--dust);
}
.site-section-head > :first-child { color: var(--ink); }

.site-kicker {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--signal);
}
```

```css
/* ─── Field + action: the two interactive primitives ─── */
.site-field {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  background: var(--panel);
  border: 1px solid var(--rule);
  border-radius: 0;
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 15px;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.site-field::placeholder { color: var(--ash); }
.site-field:hover { border-color: var(--ash); }
.site-field:focus {
  outline: none;
  border-color: var(--signal);
  background: var(--void);
}

.site-action,
.site-action-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, border-color 120ms ease,
    color 120ms ease, transform 120ms ease;
}
.site-action {
  background: var(--signal);
  border-color: var(--signal);
  color: var(--void);
}
.site-action:hover {
  background: var(--signal-dim);
  border-color: var(--signal-dim);
}
.site-action-secondary {
  background: transparent;
  border-color: var(--rule);
  color: var(--ink);
}
.site-action-secondary:hover {
  border-color: var(--signal);
  color: var(--signal);
}
.site-action:active,
.site-action-secondary:active { transform: translateY(1px); }
```

```css
/* ─── Ledger: roll + meta rows ─── */
.roll-section { min-width: 0; }
.roll-meta-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dust);
}

/* ─── Nav toggle label ─── */
.site-nav .nav-toggle-text { font: inherit; }
@media (max-width: 380px) {
  .site-nav .nav-toggle-text { display: none; }
}

/* ─── Print sheets (console) ─── */
@media print {
  .print-sheet { display: block; break-inside: avoid; color: #000; }
}
```

**Effort:** 1 hour. **Score impact: +2.0.** Highest-leverage change in this document.

---

### 2.2 Hard WCAG failure: `--ash` is 2.86:1, used 249 times

| Pair | Ratio | AA (4.5:1) |
| --- | --- | --- |
| `#5C5854` on `#060708` (`--ash` on `--void`) | **2.86:1** | ❌ |
| `#5C5854` on `#0C0D0F` (`--ash` on `--panel`) | **2.76:1** | ❌ |
| `#5C5854` on `#141416` (`--ash` on `--edge`) | **2.61:1** | ❌ |
| `#5C5854` on `#1F1F22` (`--ash` on `--rule`) | **2.33:1** | ❌ |

It fails even the 3:1 large-text floor. And it is a **secondary text** token carrying real prose: `.site-footer-copy` (`site.css:325`), `.record-note` (`site.css:366`), `.protocol-list dt` (`home.css:203`), `.contact-label` (`contact.css:79`), `.contact-loc` (`contact.css:113`), `.ledger-seal` (`ledger.css:132`), `.chip-n` (`ledger.css:776`), `.roll-entry-caret` (`ledger.css:810`), plus every `text-ash` / `text-dim` / `text-muted` in the console (`benben.css:4,9,18,19,22,23,25,32`).

Separately, the comment at `tailwind.config.ts:41-42` claims *"--dust on --void: 4.6:1"*. The real value is **5.52:1** — the documented figure is wrong too.

**Fix — two edits:**

```diff
- app/globals.css:22
-  --ash:    #5C5854;
+  --ash:    #857F7A;   /* 5.10:1 on void · 4.92:1 on panel · 4.66:1 on edge — AA */
```

```diff
- tailwind.config.ts:47
-  ash:    "#5C5854",
+  ash:    "#857F7A",
```

`#857F7A` keeps the warm-grey hue and clears 4.5:1 on all three text surfaces. Then correct the stale comment at `tailwind.config.ts:41-42` to the measured values.

**Effort:** 5 minutes. **Score impact: +1.5.**

---

### 2.3 No `color-scheme` → native controls render light-on-dark

`grep -rn 'color-scheme' app components` returns only the `themeColor` media queries. There are **16 `<select>` elements** plus many `<input type="date|time|number">` in the console; in Chrome and Firefox on Windows those paint **white backgrounds with dark text** inside black panels.

**Fix:**

```diff
  app/globals.css — append after :root
+ html { color-scheme: dark; }
+
+ /* Dark-only by design; do not let the UA paint light controls. */
+ input, select, textarea { color-scheme: dark; }
```

Also drop the light `themeColor` entry at `app/layout.tsx:19` — the site has no light mode, so advertising one is a false signal to the browser chrome.

**Effort:** 2 minutes. **Score impact: +0.5.**

---

### 2.4 The ledger's `<h1>` gets *smaller* on desktop

```css
/* app/(site)/ledger/ledger.css:68-83 */
.page-title        { font-size: 39px; }   /* mobile */
@media (min-width: 768px) {
  .page-title      { font-size: 32px; }   /* desktop — smaller */
}
```

**Fix:** invert the ramp — `32px` at base, `clamp(36px, 4vw, 48px)` at `min-width: 768px`.

**Effort:** 2 minutes. **Score impact: +0.25.**

---

### 2.5 The hero does not fit the viewport

```css
/* app/home.css:63-64 */
.landing-hero-grid { min-height: calc(100svh - 56px); }
```

`.landing-hero-grid` sits below **two** stacked bars: `.site-nav` (`app/site.css:20`, `height: 56px`, `position: sticky` so it still occupies layout) **and** `.landing-system-strip` (`app/home.css:32`, `min-height: 32px`). The hero's bottom edge therefore lands at `100svh + 32px` — every first paint overflows by exactly 32px and the "Three working surfaces" heading is clipped.

`app/site.css:220` compounds it: `.site-content { min-height: calc(100svh - 56px) }` wraps the landing and double-counts the nav.

**Fix:**

```diff
  app/home.css
-  min-height: calc(100svh - 56px);
+  min-height: calc(100svh - 88px);   /* 56 nav + 32 strip */

  @media (max-width: 640px) {
-    min-height: calc(100svh - 52px);
+    min-height: calc(100svh - 84px); /* 52 nav + 32 strip */
  }
```

**Effort:** 5 minutes. **Score impact: +0.5.**

---

### 2.6 Container discipline on three pages

`/benben`, `/search` and `/dashboard` all use `className="site-frame max-w-[760px]"` with **no `mx-auto` and no inline padding**. On a 1440px viewport the content hugs the left edge. `/contact` escapes only because `.contact-page` happens to be a flex container with `justify-content: center`.

**Fix:** the `.site-frame` rule in §2.1 supplies `width: min(calc(100% - 48px), 1184px); margin-inline: auto`. Then move the raw Tailwind max-width onto a class so the padding survives:

```diff
- app/(site)/benben/page.tsx:236
- <div className="site-frame relative max-w-[760px] overflow-hidden py-8 md:py-12">
+ <div className="site-frame site-frame--narrow relative overflow-hidden py-8 md:py-12">
```

Apply the same swap at `app/(site)/search/page.tsx:18` and `app/(site)/dashboard/page.tsx:46`.

**Effort:** 20 minutes. **Score impact: +0.5.**


---

## 3. TIER 1 — Design-system integrity

### 3.1 There are two palettes and two accents

`app/globals.css:24-27` states the rule:

> `/* Accent — one interactive color */ --signal: #14B8A6`

`app/(site)/benben/benben.css:2` breaks it outright:

```css
.benben-page {
  --floor-surface: #0a0a0e;   /* a 5th surface */
  --floor-card:    #0f0f14;   /* a 6th surface */
  --floor-hi:      #16161d;   /* a 7th surface */
  --floor-border:  #1c1c24;   /* an 8th surface */
  --floor-gold:    #c8a238;   /* a SECOND accent */
}
```

Plus `benben.css:44` hardcodes `#dbae3e` as a hover. So BenBen renders as a gold-accented site bolted onto a teal-accented site, with its own four-step surface ramp sitting a few RGB points from the canonical ramp — close enough to look like a mistake, far enough to notice.

**Fix — delete the floor palette, remap to canonical tokens:**

```diff
- .benben-page { --floor-surface: #0a0a0e; ... --floor-gold: #c8a238; }
+ .benben-page { --floor-gold: var(--amber); }   /* informational only */
```

Then sed `--floor-card → var(--panel)`, `--floor-border → var(--rule)`, `--floor-surface → var(--void)`, `--floor-hi → var(--edge)`.

**One decision to make:** `--floor-gold` is currently used on **interactive** things (`benben.css:43` primary button, `:27` active tab, `:20` search focus, `:36-37` row hover). Under the "one interactive accent" rule those must become `--signal`. Keep gold only in `--amber`'s informational role — the "sealed / proof" marks — which is exactly what `tailwind.config.ts:56` reserves it for. If the team would rather have gold as *the* brand accent, then teal must leave the site chrome — but teal is load-bearing in 6 files, so signal-as-accent is the cheaper truth.

**Effort:** 1 hour. **Score impact: +1.0.**

---

### 3.2 203 arbitrary font sizes against a documented "no 13px" rule

`tailwind.config.ts:96`:

> `// ── 8px grid. No Fibonacci. No 13px. Predictable.`

Reality: **203** arbitrary sizes — `text-[13px]` throughout, plus `text-[10px]`, `text-[11px]`, `text-[19px]`, `text-[20px]`, `text-[21px]`, `text-[30px]`, `text-[34px]`. There are **11 distinct sizes between 10px and 15px**.

**Fix — put the scale in the config, delete the arbitrary values:**

```js
// tailwind.config.ts → theme.extend.fontSize
fontSize: {
  micro: ["10px", { lineHeight: "1.5", letterSpacing: "0.12em" }], // instrument
  label: ["11px", { lineHeight: "1.5", letterSpacing: "0.18em" }], // mono labels
  meta:  ["12px", { lineHeight: "1.5" }],
  body:  ["15px", { lineHeight: "1.6" }],                          // the one body size
  lead:  ["17px", { lineHeight: "1.6" }],
  h3:    ["20px", { lineHeight: "1.25" }],
  h2:    ["28px", { lineHeight: "1.2" }],
  h1:    ["clamp(34px, 4.5vw, 48px)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
}
```

Then mechanical replacement (`text-[13px] → text-body`, `text-[11px] → text-label`, `text-[10px] → text-micro`, …) and an ESLint guard:

```js
"no-restricted-syntax": ["warn", {
  selector: "Literal[value=/text-\\[(\\d+)px\\]/]",
  message: "Use the type scale (text-micro/label/meta/body/lead). No arbitrary sizes."
}]
```

**Effort:** 2 hours. **Score impact: +1.0.**

---

### 3.3 Six different `<h1>` treatments

| Route | Definition | Family | Weight | Style | Size |
| --- | --- | --- | --- | --- | --- |
| `/` | `home.css:75` | serif | 600 | normal | `clamp(34,4.5vw,48)` |
| `/ledger` | `ledger.css:68` | serif | 400 | *italic* | 39 → **32** |
| `/benben` | `benben.css:7` | serif | 400 | *italic* | `clamp(32,4vw,48)` |
| `/contact` | `contact.css:34` | serif | 500 | normal | `clamp(40,7vw,56)` |
| `/search` | `site.css:340` | serif | 400 | *italic* | `clamp(40,6vw,56)` |
| `/dashboard`, 404 | Tailwind | serif | 400 | normal | `text-5xl sm:text-6xl` |

Six treatments for one semantic role. A visitor crossing three pages sees three different title styles.

**Fix:** one class, used everywhere:

```css
/* app/globals.css */
.page-title {
  margin: 16px 0 0;
  max-width: 20ch;
  font-family: var(--font-serif);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--ink);
  text-wrap: balance;
}
```

Then delete the five page-local title rules and swap the JSX to `className="page-title"`.

**Effort:** 45 minutes. **Score impact: +0.75.**


---

### 3.4 The radius override destroys every pill

```css
/* app/globals.css:173-179 */
.console-ui .rounded-full,
.console-ui .rounded-3xl,
.console-ui .rounded-2xl,
.console-ui .rounded-xl,
.console-ui .rounded-lg { border-radius: 2px; }
```

`.console-ui .rounded-full` (0,2,0) beats Tailwind's `.rounded-full` (0,1,0), so **every circular element becomes a 2px square** — including the "N tools →" chip (`console/page.tsx:395`), the favourite star button (`:433`), and the `Diamond` glyph. The intent was clearly for pills to survive; `rounded-full` is in the list by accident.

**Fix — remove `rounded-full` and `rounded-3xl` from the selector:**

```diff
- .console-ui .rounded-full,
- .console-ui .rounded-3xl,
  .console-ui .rounded-2xl,
  .console-ui .rounded-xl,
  .console-ui .rounded-lg { border-radius: 2px; }
```

Better still: delete the attribute-selector block entirely and set `rounded-none` / `rounded-sm` at the nine `.console-ui` call sites. Selector overrides that rewrite Tailwind utilities are a smell reviewers reliably punish.

**Effort:** 30 minutes. **Score impact: +0.5.**

---

### 3.5 The accent color is copy-pasted as `rgba()` nineteen times

`rgba(20, 184, 166, …)` appears across 6 stylesheets — `globals.css` (1), `home.css` (2), `site.css` (2), `benben.css` (2), `contact.css` (1), `ledger.css` (11). Change `--signal` once and eleven of those silently desync.

**Fix — one alpha scale in `:root`:**

```css
:root {
  --signal-a06: color-mix(in srgb, var(--signal) 6%, transparent);
  --signal-a08: color-mix(in srgb, var(--signal) 8%, transparent);
  --signal-a25: color-mix(in srgb, var(--signal) 25%, transparent);
  --signal-a30: color-mix(in srgb, var(--signal) 30%, transparent);
  --signal-a35: color-mix(in srgb, var(--signal) 35%, transparent);
}
```

`color-mix` is baseline in all current browsers, and the codebase already uses it (`globals.css:215`).

**Effort:** 30 minutes. **Score impact: +0.4.**

---

### 3.6 Seven dead utilities and seven legacy aliases

**Dead CSS** — defined, used in **zero** files: `.skeleton` (`globals.css:271`), `.no-print` (`:310`), `.tap-target` (`:335`), `.line-clamp-2` (`:342`), `.line-clamp-3` (`:349`), `.flex-center` (`:321`), `.prose` (`:253`), `.page-section` (`:259`). The comment at `:259` reads "Page section rhythm" — the rhythm class was never adopted.

**Legacy aliases** — `tailwind.config.ts:59-68` ships `obsidian`, `ivory`, `muted`, `dim`, `teal`, `panelHi`, `edgeHi` as duplicates of `void`, `ink`, `dust`, `ash`, `signal`, `edge`, `rule` — and the console components use the aliases exclusively. So the "canonical" names in the token block are the ones *nobody actually uses*.

**Fix:** delete every alias, run one sed over `components/console/**` and `app/(console)/**`, delete the eight dead rules, then guard it in CI:

```bash
! grep -rqE '\b(obsidian|ivory|muted|dim|teal|panelHi|edgeHi)\b' app components
```

**Effort:** 1 hour. **Score impact: +0.5.** Bonus: this is what makes a reviewer say "they have taste *and* discipline."


---

## 4. TIER 2 — Trust & truthfulness (highest risk, currently unaddressed)

The site's entire proposition is *provable* work. Three features are not provable, and one of them actively misleads.

### 4.1 New roll entries are marked `verified: true` on submit

```ts
// app/(site)/ledger/page.tsx:112-129
const newMember: Member = {
  ...
  verified: true,          // ← hardcoded. Nothing verified anything.
  hash: seal({ id: nextId, name: form.name.trim(), ... }),
};
```

Then the header claims:

```tsx
// app/(site)/ledger/page.tsx:155-156
<p className="page-desc">
  Names, skills, and proof in one public record. Verified by work, not by paperwork.
</p>
```

…and the telemetry reports `{total} entries · {verified} verified` (`:161`), which is now `100% verified` by construction. `lib/ledger.ts:174` then derives `testScore: verified ? 6 : null`.

A reviewer who reads the canvas *and* the source will call this the most serious finding in the repo — it is a truth claim the code does not support, on a product whose whole pitch is truth.

**Fix (pick one, in order of preference):**

1. **Rename the field to what it is** — `sealed: true` (a hash exists) vs `verified: false` (nobody checked). Show two counts: `sealed` and `verified`.
2. Keep the word "verified" but make it mean something: a second party confirms the skill, which flips the flag. Until then the entry reads **"unattested."**
3. At absolute minimum: set `verified: false` and change the header to *"Names, skills, and seals in one public record. Proof is added by others, not claimed by you."*

Whichever you choose, `lib/ledger.ts:174`'s `testScore` must stop deriving from a boolean.

**Effort:** 1 hour. **Score impact: +1.25.**

---

### 4.2 Credential verification returns "In the roll" for any string starting with `AL-`

```ts
// app/(site)/ledger/page.tsx:140-143
function verifyToken(e: React.FormEvent) {
  e.preventDefault();
  if (!token.trim()) return;
  setVerdict(token.trim().startsWith("AL-") ? "found" : "no");
}
```

Type `AL-anything` → *"In the roll. A sealed record matches this token."* The verification flow is a string prefix check, entirely client-side.

**Fix:** compare against the hashes you already hold:

```ts
function verifyToken(e: React.FormEvent) {
  e.preventDefault();
  const needle = token.trim().toUpperCase();
  if (!needle) return;
  const hit = entries.some(
    (m) => m.id.toUpperCase() === needle || shortHash(m.hash).toUpperCase() === needle
  );
  setVerdict(hit ? "found" : "no");
}
```

Honest, still local-first, and it actually checks something. Keep the existing `.verify-note` wording — it already states correctly that verification confirms presence, not identity.

**Effort:** 15 minutes. **Score impact: +0.5.**

---

### 4.3 `/search` is a dead end that is also in the sitemap

```tsx
// app/(site)/search/page.tsx:34
{state === "submitted" && <p ...>No live index is connected yet. Your query was recorded locally: "{...}".</p>}
```

The page is linked from `/dashboard:123` and listed in `app/sitemap.ts:9` with `priority: 0.7` — so the sitemap actively invites crawlers to a page whose copy says the feature does not exist. That reads as unfinished, not quiet.

**Fix:** the ledger already holds the data and already has a working filter (`app/(site)/ledger/page.tsx:66-76`, with `/`-to-focus at `:51-61`). Either:

- **Point `/search` at the roll's real filter** and delete the "no index" copy, or
- **Make it an honest placeholder** — remove it from the sitemap, remove the dashboard link, mark it `robots: { index: false }`, and say so in the header rather than after submit.

Do not ship a search box that apologizes.

**Effort:** 2 hours (option A) / 15 minutes (option B). **Score impact: +0.75.**

---

### 4.4 `robots.txt` does not block the routes it names

Live output:

```
User-Agent: *
Allow: /
Allow: /contact
Disallow: /dashboard/
Disallow: /benben/
Disallow: /ledger/
Disallow: /search/
```

Robots path values are **prefix** matches. `Disallow: /dashboard/` matches `/dashboard/…` but **not** `/dashboard`. Your routes are `/dashboard`, `/benben`, `/ledger`, `/search` — no trailing slash — so **none of them are actually disallowed.**

Two more defects in the same file:

- No `sitemap:` directive.
- `sitemap.ts:9` submits `/search`, which `robots.ts:12` disallows → Search Console reports *"Submitted URL blocked by robots.txt."*

**Fix:**

```ts
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contact"],
        disallow: ["/dashboard", "/benben", "/ledger", "/search", "/console"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://apt-labs.vercel.app"}/sitemap.xml`,
  };
}
```

Then **decide whether `/ledger` is public.** It is linked from the primary nav (`components/Nav.tsx:10`), the landing hero (`page.tsx:63`), and the footer — yet disallowed in robots and absent from the sitemap. Either it is the front door (index it) or it is private (unlink it). Right now it is both.

**Effort:** 20 minutes. **Score impact: +0.4.**


---

## 5. TIER 3 — Missing states and resilience

```
find app -name 'error.tsx' -o -name 'loading.tsx' -o -name 'global-error.tsx' | wc -l
# 0
```

Zero error boundaries, zero loading states, zero suspense fallbacks across 13 routes. Any runtime throw drops the user onto Next's unbranded default error screen. This is not hypothetical: `/benben` does non-trivial local-storage work, `/dashboard` reads `localStorage`, and `loadStored`/`saveStored` in `lib/ledger.ts` are the first thing to fail when storage is disabled or full.

**Fix — three files:**

```tsx
// app/error.tsx
"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="site-page bg-void text-ink">
      <div className="site-frame site-frame--narrow">
        <p className="site-kicker">Record interrupted</p>
        <h1 className="page-title">The write did not land.</h1>
        <p className="mt-4 max-w-[46ch] text-dust">
          Nothing was lost — this device holds its own copy. Try the write again.
        </p>
        <button type="button" onClick={reset} className="site-action mt-8">
          Try again
        </button>
      </div>
    </main>
  );
}
```

```tsx
// app/(site)/loading.tsx
export default function Loading() {
  return (
    <main className="site-page bg-void text-ink" aria-busy="true">
      <div className="site-frame site-frame--narrow">
        <span className="sr-only">Loading the record</span>
        <div className="skeleton h-6 w-40" />
        <div className="skeleton mt-6 h-12 w-[min(100%,28rem)]" />
        <div className="skeleton mt-4 h-4 w-[min(100%,34rem)]" />
      </div>
    </main>
  );
}
```

```tsx
// app/(console)/console/loading.tsx
export default function Loading() {
  return <div className="h-dvh bg-void" aria-busy="true" />;
}
```

**This finally uses `.skeleton`** — currently defined at `globals.css:271` and referenced nowhere.

Add per-route `error.tsx` for `/ledger`, `/benben` and `/console` so a failure is scoped rather than blanking the shell. Note that `site-page`, `site-frame`, `site-frame--narrow`, `site-kicker` and `site-action` come from §2.1 — land that first.

**Effort:** 1 hour. **Score impact: +1.0.**


---

## 6. TIER 4 — Identity, discoverability, and the 5→9 leap

### 6.1 There is no visual identity at all

`ls public` → **no `public/` directory.** Zero images. Zero icons beyond a data-URI favicon (`app/layout.tsx:13`). No logo file. The nav brand is a `<span>A</span>` in a border box (`site.css:46-58`).

Meanwhile `components/GeoArt.tsx` is a **complete, unused geometric motif system** — five variants (`ring`, `grid`, `band`, `corner`, `cells`), all `currentColor`, all pure SVG. It appears on exactly one page: the 404 (`not-found.tsx:11`).

This is the biggest available jump in perceived quality, and the assets already exist. Five applications:

1. **Homepage hero right rail** — `GeoArt variant="cells"` behind or inside the "Record protocol" panel at `opacity: .06`.
2. **Console login (`console/page.tsx:144`)** — `variant="ring"` as a watermark behind "Who are you?"
3. **Every page header** — a 32px `variant="band"` strip as a ruled divider, giving six routes one shared signature.
4. **Ledger roll entries** — `variant="corner"` clipped into the expanded detail panel (`ledger.css:820`).
5. **Loading + error states** — `variant="grid"` at low opacity, so the states feel designed rather than default.

**Effort:** 3 hours. **Score impact: +1.0.**

### 6.2 Social cards are blank and `og:url` is invalid

Live `<head>` output:

```html
<meta property="og:url" content="/"/>          <!-- relative — invalid per OG spec -->
<meta name="twitter:card" content="summary"/>  <!-- no image -->
```

- **No `metadataBase` anywhere** (`app/layout.tsx:4-15`), so every relative URL in metadata stays relative.
- **No `og:image`** — every share renders as a bare text card.
- `twitter:card` is `summary`, but the site has a strong landscape composition; `summary_large_image` is correct once an image exists.

**Fix:**

```diff
  app/layout.tsx
  export const metadata: Metadata = {
+   metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://apt-labs.vercel.app"),
    title: { default: "APT-LABS — The ledger of useful work.", template: "%s — APT-LABS" },
+   openGraph: {
+     type: "website",
+     siteName: "APT-LABS",
+     locale: "en_KE",
+     images: [{ url: "/og.png", width: 1200, height: 630,
+                alt: "APT-LABS — the ledger of useful work." }],
+   },
+   twitter: { card: "summary_large_image", images: ["/og.png"] },
+   robots: { index: true, follow: true },
  };
```

Then create `public/og.png` (1200×630: `GeoArt variant="cells"` plus the h1 in serif on `--void`) and `public/favicon.ico`. Keep the inline SVG icon as a fallback. Also add `public/manifest.webmanifest` so the site installs cleanly on Android — a real consideration for the stated audience.

**Effort:** 1.5 hours. **Score impact: +0.75.**

### 6.3 `not-found.tsx` cannot carry metadata

`app/not-found.tsx:1` is `"use client"`, so it cannot export `metadata` — the 404 ships with the root title and no `noindex`.

**Fix:** the body has no hooks or handlers, so drop `"use client"` and export metadata:

```tsx
// app/not-found.tsx
import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../components/GeoArt";

export const metadata: Metadata = {
  title: "No such page",
  robots: { index: false, follow: true },
};

export default function NotFound() { /* the same JSX, now server-rendered */ }
```

**Effort:** 10 minutes. **Score impact: +0.25.**

### 6.4 Typography is system-only

`tailwind.config.ts:71-94` uses an OS stack. This is *defensible* and the offline-first rationale is real — but it means the page renders in Segoe UI on Windows, Roboto on Android and SF on Apple, so **line breaks, measure and letter-spacing are not actually controlled anywhere.** It is the most common reason a design reads "developer-made" rather than "designed."

The offline constraint does not require the trade-off. `next/font/local` self-hosts from `/_next/static`, emits no third-party request, and works offline once cached. One variable serif — for `.page-title`, `.rule-text` and roll names — changes more than any other single item here.

If the team wants to stay system-only, then **stop using `--font-serif` for hierarchy**, because on Windows it resolves to Times New Roman, the least authoritative face in the stack. Either self-host, or set the display hierarchy in the mono face (which *is* consistent cross-platform) and reserve serif for the lede only.

**Effort:** 2 hours (self-host) / 1 hour (mono-led hierarchy). **Score impact: +0.75.**

### 6.5 The footer tagline is hidden exactly where there is room for it

```css
/* app/site.css:369-373 */
@media (min-width: 640px) {
  .site-footer-copy { display: none; }
}
```

"A public record of work, skill, and trust. Built open. Held local." disappears on desktop and appears on mobile. Inverted — and it costs the site its best closing line.

**Fix:** delete the media query. The footer is a 3-part flex row above 640px (`site.css:251-258`) and the copy is `max-width: 28ch`, so it fits.

**Effort:** 2 minutes. **Score impact: +0.2.**


---

## 7. TIER 5 — Motion & micro-interaction

The entire motion vocabulary is `120ms` color transitions and one `shimmer` keyframe (`globals.css:283`) that nothing uses. `prefers-reduced-motion` is already handled globally (`globals.css:106-117`) — the guardrail is built, the motion is missing.

Add exactly three, in this order:

1. **Route-enter** (180ms `opacity` + 4px `translateY`) on `.site-content`, keyed to `pathname` in `app/(site)/layout.tsx`. Instantly makes navigation feel considered.
2. **Roll entry expand** — `.roll-entry-detail` (`ledger.css:820`) currently appears with no transition. Add `opacity` / `max-height` at 180ms.
3. **Vote / attest confirmation** — `components/BuildCard.tsx` gives no feedback on vote; a 150ms scale pulse on the count is enough.

All three inherit the existing `prefers-reduced-motion` guard automatically, because it is declared with `!important`.

**Effort:** 1.5 hours. **Score impact: +0.5.**

---

## 8. Execution order

Each tier is independently shippable.

| # | Change | Effort | Δ score | Cumulative |
| --- | --- | --- | --- | --- |
| 1 | §2.1 Define the 11 missing classes | 1h | **+2.00** | 7.0 |
| 2 | §2.2 Fix `--ash` contrast (2 edits) | 5m | +1.50 | 8.5 |
| 3 | §2.3 `color-scheme: dark` | 2m | +0.50 | 9.0 |
| 4 | §5 Error + loading states | 1h | +1.00 | 10.0 |
| 5 | §4.1 Stop calling unverified entries "verified" | 1h | +1.25 | 11.25 |
| 6 | §4.2 Real credential verification | 15m | +0.50 | 11.75 |
| 7 | §6.2 `metadataBase` + `og:image` | 1.5h | +0.75 | 12.5 |
| 8 | §6.1 GeoArt motif pass | 3h | +1.00 | 13.5 |
| 9 | §3.1 One palette, one accent | 1h | +1.00 | 14.5 |
| 10 | §3.3 One `<h1>`, six pages | 45m | +0.75 | 15.25 |
| 11 | §3.2 Type scale in config, kill `text-[Npx]` | 2h | +1.00 | 16.25 |
| 12 | §4.3 Resolve `/search` | 15m–2h | +0.75 | 17.0 |
| 13 | §3.4 radius hack, §3.5 alpha tokens, §3.6 aliases | 2h | +1.40 | 18.4 |
| 14 | §6.4 Typography decision | 1–2h | +0.75 | 19.15 |
| 15 | §2.4–2.6, §4.4, §6.3, §6.5, §7 polish | 3h | +2.35 | 21.5 |

**Steps 1–3 take 67 minutes and move the score from 5.0 to 9.0.** Everything after that is hardening and identity.

---

## 9. Definition of 9/10

Run these before asking for another review. Every one is mechanically checkable:

```bash
# 1. No class used in JSX is missing from CSS
node scripts/audit-classes.js                    # must list 0 project classes

# 2. No arbitrary type sizes
! grep -rqE 'text-\[\d+px\]' app components

# 3. No legacy token aliases
! grep -rqE '\b(obsidian|ivory|muted|dim|teal|panelHi|edgeHi)\b' app components

# 4. No hardcoded accent rgba
! grep -rq 'rgba(20, 184, 166' app components

# 5. Only one palette
! grep -rq -- '--floor-' app components

# 6. Error + loading states exist
test -f app/error.tsx && test -f 'app/(site)/loading.tsx'

# 7. Exactly one accent value in CSS
[ "$(grep -rhoE '#(14B8A6|c8a238|dbae3e)' app --include=*.css | sort -u | wc -l)" = "1" ]

# 8. No dead utility classes
for c in skeleton no-print tap-target line-clamp-2 flex-center prose page-section; do
  grep -rq "\b$c\b" app components --include=*.tsx && echo "IN USE: $c" || echo "DEAD: $c"
done
```

Plus, by hand:

- [ ] Tab through all four public routes — every control has a visible focus ring and a 44px target
- [ ] Set the OS to light mode, load `/ledger` — the `<select>`s stay dark
- [ ] Reload `/benben` with `localStorage` disabled — you get the designed error state, not Next's
- [ ] Paste `AL-nonsense` into "Verify a credential" — it does **not** say "In the roll"
- [ ] Check any `/ledger` entry you just created — it does **not** read "verified"
- [ ] Share `/` into WhatsApp — the card shows a real image and a working link
- [ ] Resize to 375px on `/benben`, `/search`, `/dashboard` — content has breathing room on both sides
- [ ] Load `/` at 900px tall — the hero fits the first screen with the rule line visible

---

## 10. Appendix — the two harnesses

**`scripts/audit-classes.js`** — finds classNames used in JSX that no stylesheet defines. Run `node scripts/audit-classes.js`. Wire `process.exit(missing.length)` into it to fail a build.

**Contrast harness** (no dependency):

```bash
node -e "
const V=h=>{h=h.replace('#','');
  const c=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255)
               .map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const R=(a,b)=>((Math.max(V(a),V(b))+0.05)/(Math.min(V(a),V(b))+0.05)).toFixed(2);
const surfaces={void:'#060708',panel:'#0C0D0F',edge:'#141416'};
const text={ink:'#F2EFE9',dust:'#8A8580',ash:'#5C5854',signal:'#14B8A6',amber:'#D97706'};
for(const [sn,sv] of Object.entries(surfaces))
  for(const [tn,tv] of Object.entries(text)) {
    const r=+R(tv,sv);
    if(r<4.5) console.log('FAIL', tn, 'on', sn, r+':1');
  }
"
```

Current output: `ash` fails on all three surfaces. After the §2.2 fix, it prints nothing.

---

## 11. Repo hygiene

- `nul` at the root is a 0-byte Windows artifact — but it is **already covered** by `.gitignore` (lines 14 and 237) and is untracked, so it is a local curiosity, not a repo problem. Safe to delete locally; nothing to fix in git.
- `.next-build.txt` **is** tracked (`git ls-files` confirms it). Build output belongs in `.gitignore` — `git rm --cached .next-build.txt`.
- `tsconfig.tsbuildinfo` (70KB) — same treatment; `incremental: true` is set in `tsconfig.json` so this regenerates locally.
- No `public/` directory — needed for §6.2.
- **There is no ESLint config file.** `next lint` is wired into `package.json` but with no `.eslintrc.json` present, rule-level guidance (§3.2) cannot land. Create one as part of §3.2.
- `a.md`–`d.md` at the root are source material (manifesto, architecture, philosophy, MVP list), not product documentation. Move them to `docs/` so the root reads as a product rather than a scratchpad. `DESIGN-AUDIT.md` should move there too.

