# Landing page — the 20/20 rubric

Scope: `apt-labs/src/app/features/landing/landing.component.ts` (public landing page).
Method: every point is a binary check measured on the **rendered page**, not on intention.
Runner: `node scripts/landing-20-audit.mjs` (build first: `cd apt-labs && npx ng build`).
Latest result: `.taste-skill/landing-20-latest.json`.

The rubric is deliberately about properties that survive to 2090: plain language,
real product truth, a stable design system, keyboard and contrast, and a page that
can be re-measured after any future change. No point is awarded for a trend, a
copyright year, or an invented statistic.

## A. Truth and clarity (1–4)

1. **Category headline** — the `h1` is 4–12 words and names the product category plus who it serves.
2. **Hard fact on the first screen** — the hero contains `[data-hard-fact]`: a short, countable, verifiable fact.
3. **One main action** — nav, hero and close use the same verb+object label; at most two filled buttons on the first screen.
4. **Real product shown** — the hero frame is `[data-hero-ui]` with at least 10 real text labels and no skeleton bars.

## B. Anti-slop (5–8)

5. **No slop copy** — none of the stock verbs/adjectives from the copy-lint ban list appear in visible text.
6. **No slop styling** — no gradient fills, glass blur, or violet/lavender in the page's own colours.
7. **Varied composition** — adjacent `main > section` blocks carry different `data-layout` values; at least four distinct layouts.
8. **Own type voice** — a serif display face and a mono interface face are actually applied; no Arial/Inter/system-ui display face.

## C. Recursive structure and durability (9–12)

9. **One grammar at every scale** — four `[data-cycle-step]` values (`need`, `work`, `evidence`, `record`) appear in at least three different sections.
10. **One section per screen** — at 1440×900 the hero ends within ±8% of the fold and the next section does not peek in.
11. **Equal edges** — every section's container shares the same left/right lines at 1440 and 390; no sideways scroll at 1440/1024/768/390/320.
12. **Durable copy** — no calendar year, trend word, or status claim that expires (`AI-powered`, `new era`, `coming soon`).

## D. Craft and motion (13–16)

13. **Hero entrance** — hero carries `data-enter`; the `h1` animates once on load; reduced-motion is declared.
14. **Hover and press** — every sampled link/button visibly answers the pointer; `:active` and `:focus-visible` rules exist.
15. **One dealt moment** — exactly one or two `[data-moment]` sections; no scroll-reveal/scrub effects elsewhere.
16. **Real icons** — at least two inline geometric SVGs with a consistent viewBox; no emoji standing in for icons.

## E. Access and endurance (17–20)

17. **Contrast** — every sampled text element meets WCAG AA (≥4.5:1, or ≥3:1 for large text).
18. **Keyboard and names** — one `h1`, ordered headings, skip link, no `tabindex>0`, all controls named, hero visual labelled.
19. **Responsive and touch** — at 390 and 320: menu toggle opens the navigation, visible controls are ≥44 px, no overlap or overflow.
20. **Stable render** — cumulative layout shift < 0.1 and DOMContentLoaded < 2.5 s.

## Why this is "usable to 2090"

Points 1–4 keep the page legible to a stranger without current events. Points 5–8
and 12 remove the fashion layer that dates pages fastest. Points 9–11 encode the
product's own self-similar structure, so the page stays coherent as modules change.
Points 13–16 and 17–20 are browser and human invariants, not platform features:
they keep working when frameworks change. The runner makes the score reproducible
instead of a claim in a chat message.

## Recursive loop

Change → `npx ng build` → `node scripts/landing-20-audit.mjs` → fix every FAIL →
repeat. A waived check must be recorded in `.taste-skill/landing-20-latest.json`
with a reason; never edit the checks to make the page pass.
