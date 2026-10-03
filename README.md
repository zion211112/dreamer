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
| `/` | 01 Field | The first viewport: the sentence, the five states, the measures |
| `/register` | 02 Register | What the system records, the anatomy of a row, the empty register |
| `/intelligence` | 03 Intelligence | Derived signals, each bound to the records it came from |
| `/control` | 04 Control | The School Console (ten workspaces, runs on-device) |
| `/evidence` | 05 Evidence | The five states, the contract rules, the published unknowns |
| `/console` | — | The product surface: local session, nine modules, ten tools |

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
| `npm run check:contrast` | Computes every WCAG ratio from the token file |
| `npm run check` | typecheck + lint + contrast + build — run before every commit |

The contrast audit is not cosmetic. It parses `app/globals.css` and computes
the real ratio of every foreground/background pair the interface renders —
including accent text on the accent's own translucent washes, the pair that
usually fails silently. It exits non-zero on any pair below threshold, so the
tokens cannot drift into a WCAG failure without the build telling you.


---

## What "done" looks like in this repo

- **No unearned confidence.** A figure without a state, or a state without a
  source, is a bug. `VERIFIED` needs an evidence path; `UNKNOWN` is always
  rendered, never omitted.
- **Absence is content.** Empty states name what would legitimately appear,
  why it is empty, and what would fill it. "Nothing here" alone is a bug.
- **One design system, two surfaces.** Tokens live in `app/globals.css` and
  are mirrored in `tailwind.config.ts`; the console and the site must not
  drift into two products.
- **The register grammar.** Ruled rows are the primary layout primitive —
  hairlines only, one accent (`--signal`, #0a7549, text-safe at 5.3:1 on the
  paper ground), no shadows, radii capped at 2px. Every state is text plus
  hairline, never colour alone.
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
  robots.ts        crawl policy (console excluded)
  sitemap.ts       derived from the same PLANE array as the nav
  opengraph-image.tsx  link preview with the PROTOTYPE declaration on it
components/
  site/            register, tally, state tag, empty state, rail, node map
  console/         ten workspaces + shared bits
lib/
  system.ts        THE runtime source of truth for every public claim
  site.ts          canonical origin resolution
  domain modules   marking, fees, timetable, inspection, …
scripts/
  check-contrast.mjs   WCAG audit with a non-zero exit code
RESEARCH TRASH/    archived previous passes — excluded from build and deploy
```

`RESEARCH TRASH/` is intentionally kept in the repository and intentionally
excluded from the deployment (`.vercelignore`) and from TypeScript
(`tsconfig.json`). It is the evidence record of how the current design was
reached, not source.

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
