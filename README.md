# APT-LABS

A local-first control plane for evidence-bound records, operational decisions,
and inspectable intelligence — plus the School Console, its first working field
implementation.

**The product sentence, and the rule the code enforces:**

> Every material claim carries an identifier, a timestamp, a source and an
> evidence state — and where the system cannot establish a fact, it preserves
> the uncertainty instead of resolving it in its own favour.

Every number, tag and sentence on the public site is minted in `lib/system.ts`
and nowhere else. There are no seeded people, builds, projects, costs, votes,
or impact figures anywhere in this repository. The registers start empty on
purpose; an empty register that says why it is empty is a feature of this
system, not a gap in it.

---

## The evidence states

Every claim is rendered with exactly one state. The states are structural, not
decorative — the UI cannot render a claim without one, and cannot upgrade one
implicitly. The full contract (what each state permits and forbids) is
published at `/evidence` and enforced as a type in `lib/system.ts`.

| State | Means | Never means |
| --- | --- | --- |
| `VERIFIED` | A citable, inspectable evidence path exists | Asserted without a source |
| `PROTOTYPE` | Built and running locally, openable by anyone | Deployed, adopted, or in use |
| `TARGET` | A named intended outcome | Current performance |
| `PLANNED` | Designed, not built | Implemented; carries no figures |
| `UNKNOWN` | The value is not established | Zero, blank, or omitted |

`UNKNOWN ≠ zero` and `PROTOTYPE ≠ deployed` are the two rules most of the
design follows from. The geography (Kirinyaga, Kenya) is declared product
context and is rendered at the state it actually carries: `UNKNOWN`.

---

## Routes

| Route | Node | What it is |
| --- | --- | --- |
| `/` | 01 Field | The first viewport: the mantra, the measures, the five-node graph, and a closing count of one build of six |
| `/register` | 02 Register | What the system records, the anatomy of a row, the empty register |
| `/intelligence` | 03 Intelligence | Derived signals, each bound to the records it came from |
| `/control` | 04 Control | Contribution, decision, allocation, execution — with the School Console presented as the first implementation |
| `/evidence` | 05 Evidence | The five states, the contract rules, the published unknowns |
| `/console` | — | One built example of the grammar: local session, nine modules, ten tools |

Every node on that list resolves to a real route. The five planned builds in
`BUILDS` do not appear in it, because they have no surface: the School Console
is an example of the grammar rather than the product, and the site closes on
the count rather than the achievement.

The console is `noindex` and disallowed in `robots.txt`: it is a device-local
prototype, and a search result implying an institution runs it would be the
exact claim this system is built to prevent.

---

## Running it

Node 18.17+ (Next.js 14 requirement).

```sh
npm install
npm run dev          # http://localhost:3000
```

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (all public routes are static) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:scale` | Verifies the type ladder, both tracking registers and the space grid, then guards them against drift |
| `npm run check:contrast` | Computes every WCAG ratio from the token file and asserts the state temperature order |
| `npm run check` | typecheck + lint + check:scale + check:contrast + build — run before every commit |

Neither audit is cosmetic, and both parse `app/globals.css` instead of
trusting the stylesheet that uses it. `check:scale` recomputes the type ladder
as 48 invariants: every step against the geometric ratio 2^(1/4) from a 16px
base, every `letter-spacing` against k·ln(size/16) at k = −0.0125em, the caps
register that no value of that curve can produce, the fluid hero's four
tracking bands against their derived 600 / 949 / 1443px breakpoints, and the
8px space grid with its single declared 4px half-unit. It then fails the build
if a hard-coded `letter-spacing` or an off-grid px length has crept back in,
because without that drift guard the constants are only true until the next
edit.

`check:contrast` computes 59 real pairs on the dark palette — every text token
on all three surfaces, filled-control ink on each jade register, accent text on
the accent's own translucent washes, the row wash, and focus rings at 3:1. It
also asserts something a ratio cannot express alone: that the five evidence
states hold a strict luminance order, `UNKNOWN` darkest and `PROTOTYPE`
brightest, with `TARGET` the warm outlier by R/B ratio. That ordering is the
contract — an unknown that shouts is a hidden zero — and it is a statement
about relative luminance, so it can only be enforced as one. The lowest text
ratio anywhere in the system is `--quiet` on `--edge` at 5.07:1. Both scripts
exit non-zero on any failure.


---

## What "done" looks like in this repo

- **No unearned confidence.** A figure without a state, or a state without a
  source, is a bug. `VERIFIED` needs an evidence path; `UNKNOWN` is always
  rendered, never omitted.
- **Absence is content.** Empty states name what would legitimately appear,
  why it is empty, and what would fill it. "Nothing here" alone is a bug.
- **One design system, two surfaces.** Tokens live in `app/globals.css` and
  are mirrored in `tailwind.config.ts`; the console and the site must not
  drift into two products. The console is the flat one — no aura field,
  because an instrument panel with an aurora behind it is a dashboard.
- **The register grammar.** The ground is dark and light is what a claim has to
  earn, so depth is made with luminance rather than with a drop shadow — a
  raised surface is separated by one pixel of light at its top edge. Ruled
  rows are the primary layout primitive, hairline only, radii capped at 2px.
  One interactive colour, `--signal` #35d9a4, and informational amber that is
  never interactive. Every state is text plus mark, never colour alone.
- **The workspace is a workspace.** The site is two columns: a 336px sticky
  rail holding the node index and the node record, and the plane. Every node
  in the index is a live route except the five planned builds, which render as
  text with a hollow port rather than as links that resolve to nothing.
- **The scale is checked, not asserted.** One size constant, two tracking
  registers, one space constant, all re-derived from `app/globals.css` on
  every build by `npm run check:scale`. A number this file quotes has to be
  one a script can confirm.
- **Accessibility is verified, not asserted.** Registers expose real table
  semantics (`role="table"` with labelled rows and column headers), the tally
  is a real list, tooltip-only provenance is duplicated into visually-hidden
  text, focus is visible globally, reduced motion is honoured globally, and
  the palette is checked numerically.

## Resilience

| Surface | Behaviour |
| --- | --- |
| Route error (`app/error.tsx`) | States that a shell fault is not a statement about the record; retry + digest |
| Shell error (`app/global-error.tsx`) | Inline-styled last resort, same grammar, no data claims |
| 404 (`app/not-found.tsx`) | "This route is not in the register" — absence rendered as content |
| Loading (`app/(site)/loading.tsx`) | The ruled register the route is about to show, not a spinner |

---

## Repository layout

```
app/
  (site)/          five public nodes + loading state
  (console)/       the School Console (client-side, device-local)
  not-found.tsx    register-grammar 404
  error.tsx        route error boundary
  global-error.tsx shell error boundary
  icon.svg         dark-surface mark
  apple-icon.tsx   dark-surface mark
  opengraph-image.tsx  share card: the mantra at 112px, PROTOTYPE declared
  robots.ts        crawl policy (console excluded)
  sitemap.ts       derived from the same PLANE array as the nav
components/
  site/            NodeIndex, NodeRecord, Graph, BuildGrid, register, tally,
                   state tag, empty state
  console/         the nine console modules + shared bits
lib/
  system.ts        THE runtime source of truth for every public claim
  site.ts          canonical origin resolution
  domain modules   marking, fees, timetable, inspection, …
scripts/
  check-scale.mjs      ladder, tracking and space audit, plus the drift guard
  check-contrast.mjs   WCAG audit and state ordering; non-zero exit on failure
RESEARCH TRASH/    archived previous passes — excluded from build and deploy
```

`RESEARCH TRASH/` is intentionally kept in the repository and intentionally
excluded from the deployment (`.vercelignore`) and from TypeScript
(`tsconfig.json`). It is the evidence record of how the current design was
reached, not source: it still holds the light warm-paper register that DESIGN
01 describes and that this build superseded, at roughly 163MB including a
nested `node_modules`. `DESIGNS.md` is the companion record, and it is marked
superseded rather than deleted for the same reason.

---

## Deployment

Deploys on Vercel with zero environment variables required. The canonical
origin (`lib/site.ts`) resolves `NEXT_PUBLIC_SITE_URL`, then `VERCEL_URL`,
then localhost — so metadata, the OG image, robots and the sitemap all agree
on one origin without per-environment configuration.

```sh
npm run check     # the full gate
npx vercel        # or connect the repository in Vercel
```
