# APT-LABS — Three Design Directions (ASIANCODER pass)

Produced under `ASIANCODER.MD`. Previous site moved wholesale to `RESEARCH TRASH/`.
Stack unchanged: Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3.

## Product truth each design must serve (from first principles)

- **What this is:** a local-first control plane for auditable, evidence-bound records
  (asset lifecycle, people register, collective decisions) plus a real school
  operations console (marking, timetable, fees, reports).
- **Non-negotiables carried over from the old contract:** no invented claims; every
  published figure carries an evidence state (VERIFIED / PROTOTYPE / TARGET /
  PLANNED / UNKNOWN); unknown ≠ zero; prototype ≠ deployed.
- **Audience:** institutions, builders, local teams (Kirinyaga, Kenya declared),
  and school administrators evaluating the console.
- **Memory target (J):** one idea must survive the visit — *"this system records
  reality, not aspiration."*

---

## DESIGN 01 — "THE REGISTER"

**▸ INTUITION**
The site *is* a ledger: an institutional record book rendered as a page, where
every claim sits in a ruled row beside its evidence state.

**▸ REBUILD**
- **Surface:** warm paper (#F4F1EA) with near-black ink (#161512). Light-only —
  archives are not dark-mode.
- **Type:** one serif display (system fallback `Georgia, serif`) for headings;
  `ui-monospace` for every state tag, ID, date and figure. Numerals tabular, always.
- **Structure:** full-width ruled tables are the primary layout primitive, not
  cards. Horizontal hairlines only (no boxes, no shadows, no radii > 2px).
  Section numbers (`01 /`, `02 /`) as marginalia in mono.
- **Hierarchy:** P0 = the record under inspection; P1 = its state tag and
  evidence link; P2 = narrative; P3/P4 = provenance footnotes at 11px mono in
  the margin — visible, never competing.
- **State language:** a single inline chip (`PROTOTYPE`, `VERIFIED`, `UNKNOWN`)
  as text + hairline outline, never color-only.
- **Signature:** the row. A record slides from `PLANNED → … → VERIFIED` as a
  rule that progresses on scroll — the only motion in the system.
- **Responsive:** desktop = two-column (margin annotations + record); tablet =
  annotations fold under their row; mobile = each row becomes a definition
  list (`term / value`), never a shrunken table.

**▸ FAILURE MODES**
1. Reads as a spreadsheet → if a screenshot has no type contrast larger than
   2×, the display scale has failed.
2. Nostalgia cosplay → any sepia texture or faux stamp means the metaphor is
   decorating instead of structuring.
3. Density scares first-timers → the first viewport must contain exactly one
   sentence a stranger can repeat.

**▸ FALSIFIER**
If visitors describe it as "a document" rather than "a system," the register
metaphor has stopped communicating software.

---

## DESIGN 02 — "THE CONTROL PLANE"

**▸ INTUITION**
Show the machine running: the homepage is a live schematic of the loop
(contribution → decision → allocation → execution → evidence), and every route
is a zoom into one node of that diagram.

**▸ REBUILD**
- **Surface:** graphite (#0E1013) with bone text (#E7E4DC). One accent —
  signal amber (#E0A33E) — used *only* to mark the node you are currently in.
  Color communicates location, never decoration.
- **Type:** grotesque sans for interface copy (`system-ui` stack), strict mono
  for identifiers, states and coordinates. Display sizes tight (−0.03em),
  body set loose.
- **Structure:** a persistent thin left rail (desktop) showing the loop as
  five stacked nodes with an amber position marker; page body is one column,
  max 62ch for prose, full-bleed for tables and the console surface.
- **Hierarchy:** P0 = the schematic (where am I in the loop?); P1 = current
  node's one-sentence claim + evidence state; P2 = supporting registers;
  P3 = expandable provenance drawers (`<details>`) under each claim.
- **The console is the hero:** the school operations surface embedded as a
  real, interactive panel on the homepage — actual code, no mockups, labelled
  `DEMONSTRATION`.
- **Signature:** the loop line — a 1px rule that redraws between node markers
  as you navigate. Under `prefers-reduced-motion` it snaps instantly; meaning
  never depends on the animation.
- **Responsive:** tablet collapses the rail to a horizontal node strip; mobile
  becomes a 5-step top progress bar plus an anchor sheet — deliberate
  re-composition, not stacking.

**▸ FAILURE MODES**
1. "Another dark SaaS" → if removing the accent leaves a page that could be
   any developer-tools site, the structure isn't carrying the brand.
2. Schematic becomes ornament → every node must be a real link to a real
   route; a dead node is deleted, not greyed.
3. Demo panel implies a shipped product → any `VERIFIED`-looking figure inside
   the demo without an evidence chip = instant fail.

**▸ FALSIFIER**
If scroll data shows users bypassing the schematic and hunting for plain nav,
the loop metaphor is costing time and must demote to a secondary device.

---

## DESIGN 03 — "THE FIELD STATION"

**▸ INTUITION**
Trust is built by exposure: the site is an open inspection — what is known,
what is planned, and what is explicitly unknown, shown at equal weight.

**▸ REBUILD**
- **Surface:** off-white (#FAFAF7) with graphite ink (#1B1C1A); one cool
  secondary (#3B5F58) reserved for `VERIFIED` so green *means* something.
- **Type:** humanist sans throughout; monospace only for hashes and export
  artefacts. Generous leading (1.7), stable measure (66ch).
- **Structure:** every page opens with a **status band** — full-width strip of
  the three always-held truths (local-first · prototype · declared geography) —
  then a 12-column grid used asymmetrically: content in 1–8, an "inspection
  panel" in 9–12 tallying that section's evidence states
  (`VERIFIED 2 · PLANNED 4 · UNKNOWN 1`).
- **Hierarchy:** P0 = status band; P1 = section claim; P2 = inspection tally;
  P3 = linked source records.
- **Empty states are content:** where nothing exists yet, show an explicit
  `NOTHING REGISTERED YET — this is correct` panel naming what *would* appear
  there and why it legitimately doesn't yet.
- **Signature:** the tally. Counts re-roll (240ms, reduced-motion-safe) when a
  section enters view, so honesty is visible in motion.
- **Responsive:** inspection panel moves *above* content on mobile (caveat
  before claim); status band wraps to two lines max.

**▸ FAILURE MODES**
1. Caveat fatigue → more than three state chips per screen means users are
   being nagged, not informed — collapse to one section-level tally.
2. Honest-but-empty reads as dead → any empty panel without the "what belongs
   here" sentence is a bug.
3. Clinical coldness → if tone-testing yields "government form," the prose
   layer needs warmth — the structure is fine.

**▸ FALSIFIER**
If first-time users rate the site *less* trustworthy than a conventional
marketing page, exposing uncertainty up-front is backfiring and the evidence
layer must move behind interaction.

---

## Comparison at a glance

| | 01 Register | 02 Control Plane | 03 Field Station |
|---|---|---|---|
| Surface | paper / light | graphite / dark | off-white / light |
| Core primitive | ruled row | schematic node | status band + tally |
| Motion | row progression | loop line redraw | count re-roll |
| Console presence | as appendix record | as hero panel | as inspectable export |
| Strongest against | claim inflation | navigation confusion | trust skepticism |
| Weakest against | first-visit warmth | generic-dark risk | caveat fatigue |

## Quality-gate summary (ASIANCODER §QUALITY GATES)

- **A/B Information & Hierarchy** — all three enforce P0–P4 explicitly; 02 has
  the strongest "where am I" affordance, 01 the strongest density control.
- **C Brand** — 01 and 02 could not belong to another company without losing
  their organizing metaphor; 03's risk is stated above.
- **F Accessibility** — state never color-only, focus ring global,
  reduced-motion honored, skip link kept in the new scaffold.
- **G Responsive** — each defines a mobile *re-composition*, not a stack.
- **I Trust** — evidence states are structural in all three; 03 makes them the
  headline.
- **J Memory** — 01: "a record book that runs as software." 02: "the loop,
  drawn." 03: "it shows you what it doesn't know."
