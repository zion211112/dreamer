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

## Views (9)

| # | View | Focus |
| --- | --- | --- |
| 01 | Overview | Node topology, protocol pulse, illustrative measures |
| 02 | Identity | Credential objects (proposed / prototype) |
| 03 | Contributions | Contribution events (illustrative) |
| 04 | Proposals | Open proposals with explicit rules |
| 05 | Juries | Sortition panels, illustrative |
| 06 | Allocation pools | Prototype economics |
| 07 | Assets | Asset register lifecycle states |
| 08 | The Roll | Audit trail (illustrative records) |
| 09 | Audit | High-impact transition trace + capture controls |

## Support routes

The node is the root; these routes hang off it as thin, protocol-node-aware
shells:

| Route | Role |
| --- | --- |
| `/work` | Execution surfaces + product track (Fab, Studio, BenBen Builds) |
| `/roll` | The substrate — people and asset registers |
| `/about` | Doctrine: "a protocol node, not a platform" |
| `/evidence` | Falsifier framing + evidence boundary |
| `/contact` | Engagement |
| `/protocol` | Legacy deep link — redirects to `/` |

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

## Design intent

Refinement of the `preview (2).html` protocol-node mock: same structure, same
visual register (obsidian / signal green / gold, DM Mono + Inter + Space
Grotesk), with:

- WCAG-compliant contrast (no sub-4.5:1 text)
- `color-scheme: dark` on all native controls
- A real type scale (no arbitrary px sizes)
- `prefers-reduced-motion` honoured
- Keyboard-reachable tab navigation with `aria-current`
- A fixed sidebar that collapses on mobile without hiding the control plane
- A visible "local node interface" state, never a fake "connected" state
