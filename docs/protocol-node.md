# APT-LABS — Protocol Node

**Route:** `/` — the product. The node is the only thing the company presents.

**State:** `PROTOTYPE`. The protocol node is a local-first control plane
mounted at the root of the site. It is **not** a deployed civic system, not a
shared server, and not a claim of live governance. Nothing entered here leaves
the browser.

## What it is

APT-LABS's one product: a local-first control plane that closes the loop
**person → contribution → proposal → allocation → execution → evidence →
record**. It is the *design* of the protocol, not the protocol running in the
world. Three levels:

| Level | Contents |
| --- | --- |
| **Node** | Identity · Contributions · Proposals · Juries · Allocation pools |
| **Execution** | APT Fab · APT Studio · BenBen Builds |
| **The Roll** | People · Assets · Evidence · Audit · Provenance |

Identity is separated from power: credential → eligibility input → explicit
policy → bounded influence. QF policy layer exposes pool internals;
capture-alert replaces auto-slashing; sortition is a first-class object.
The UI reads as a local protocol instrument, not a website.

## Views (10)

| # | View | Focus |
| --- | --- | --- |
| 01 | Overview | The loop in order, node topology, the node's own state |
| 02 | Identity | Credential objects (proposed / prototype) |
| 03 | Contributions | Contribution events (illustrative) |
| 04 | Proposals | Open proposals with explicit rules |
| 05 | Juries | Sortition panels, illustrative |
| 06 | Allocation pools | Prototype economics |
| 07 | The write-up | Product track, evidence ledger, and the console as its example |
| 08 | Assets | Asset register lifecycle states |
| 09 | The Roll | Audit trail (illustrative records) |
| 10 | Audit | High-impact transition trace + design principles |

## Support routes

The node is the root; these routes hang off it as thin, protocol-node-aware
shells:

| Route | Role |
| --- | --- |
| `/roll` | The substrate — people and asset registers |
| `/about` | Doctrine: "a protocol node, not a platform" |
| `/evidence` | Falsifier framing + evidence boundary |
| `/contact` | Engagement |
| `/protocol` | Legacy deep link — redirects to `/` |

There is no `/work`. The console is a **build** inside the write-up (view 07),
not a peer destination, so neither the site header nor the node's own index
links it: it is opened from the surface that presents it.

## Evidence boundary (non-negotiable)

- No seeded people. No deployment counts. No funding claims.
- Every record rendered here is labelled **illustrative**, **proposed**, or
  **prototype** — never `VERIFIED` or `DEMONSTRATION` of a real deployment.
- No doctrine vocabulary: the surface uses civic/protocol language, not the
  internal doctrine register.
- The node is **local-first**: opt-in civic infrastructure, not shadow state.
- The falsifier: an independent observer can reconstruct who was eligible,
  which rule applied, where resources went, what was built, and what evidence
  supports the outcome — without asking anyone involved.

## Shell

The node owns the root route's chrome. `/` renders the control plane alone —
no marketing header, no site footer — because both duplicated the navigation
and the sticky header sat on top of the node's fixed sidebar, hiding its brand
and its node block. The sidebar therefore carries the whole information
architecture:

| Group | Contents |
| --- | --- |
| Control plane | Overview · Identity · Contributions · Proposals · Juries · Allocation pools |
| Execution | The write-up · Assets · The Roll · Audit |
| Support routes | `/roll` · `/about` · `/evidence` · `/contact` |

Implementation: `components/SiteFrame.tsx` renders the header, content column
and footer for every site route and returns `children` unchanged for `/`. The
Organization JSON-LD lives in `app/layout.tsx`, so it travels with the node too.
The support routes remain site routes with the normal chrome; they are not
absorbed into the node.

## Interaction

- **Views are URL state.** `#juries` is a deep link; back and forward step
  through the control plane. Nav items are real anchors with
  `aria-current="location"`, not buttons pretending to be pages.
- **Records disclose in place.** A registry row expands to its record id, its
  state (explicitly labelled illustrative) and the evidence it would have to
  carry to leave that state. There is no "open" button that opens nothing.
- **Export is local.** "Export view" writes a JSON snapshot of the active
  view to the visitor's own downloads and reports the filename it wrote. There
  is no sync control, because there is no server to sync with.
- **No fabricated measures.** The overview shows the protocol loop and the
  node's own state (mode, records, storage, export) — not invented percentages.

## Visual program — the instrument ledger

The surface is built from three rules, in this order of priority:

1. **Compression.** Each view makes one statement, set once, at scale in the
   display face. Nothing competes with it. There is no second headline.
2. **Order.** Hairlines are the only material: full-width rules, a spine down
   the content margin that every section head ticks against, tabular numerals
   on every instrument field, and sharp geometry (no rounded containers).
   Structure is read before content.
3. **Restraint.** One interactive accent. The second colour is a state, never
   an ornament: amber means *review / pending*, red means *blocked*, green
   means *active or sealed*. There are no gradients, no glow, no pills and no
   glyph decoration.

Type registers, each with one job: **DM Mono** for every id, path, state,
label and figure; **Space Grotesk** for statements and record names; **Inter**
for explanatory prose only — prose never appears in caps, and the instrument
never appears as a sentence. Depth comes from one top hairline, not from
shadow.

Requirements carried over from the mock's refinement pass:

- WCAG-compliant contrast (no sub-4.5:1 text)
- `color-scheme: dark` on all native controls
- A real type scale (no arbitrary px sizes)
- `prefers-reduced-motion` honoured — the surface reads without the beat
- Keyboard-reachable navigation with `aria-current`
- A sidebar that re-flows on narrow screens without hiding the control plane
- A visible "local node interface" state, never a fake "connected" state
