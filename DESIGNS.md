# APT-LABS — Design Record (ASIANCODER pass)

Produced under `ASIANCODER.MD`. Stack unchanged: Next.js 14 (App Router) ·
React 18 · TypeScript · Tailwind 3. Earlier site passes moved wholesale to
`RESEARCH TRASH/`.

**Status of each entry.** DESIGN 02 is the shipped system. DESIGN 01 is
superseded — its structure survived, its ground did not. DESIGN 03 and
DESIGN 04 were explored and absorbed in part: their grammars are live in the
current build. Nothing below is deleted when it stops being the answer, because
this file is the record of how the current one was reached, and a direction
that has been ruled out with its reasons still attached is worth more than a
clean repository.

## Product truth each design must serve (from first principles)

- **What this is:** a local-first control plane for auditable, evidence-bound
  records (asset lifecycle, people register, collective decisions), plus one
  built instantiation of it — a school operations console (marking, timetable,
  fees, reports). The console is a build rather than the product: the same
  chain runs over six domains and exactly one of them has a surface to open.
- **Non-negotiables carried over from the old contract:** no invented claims; every
  published figure carries an evidence state (VERIFIED / PROTOTYPE / TARGET /
  PLANNED / UNKNOWN); unknown ≠ zero; prototype ≠ deployed.
- **Audience:** institutions, builders, local teams (Kirinyaga, Kenya declared),
  and school administrators evaluating the console.
- **Memory target (J):** one idea must survive the visit — *"records, not
  assertions."* That is `COMPANY.mantra`, stored pre-broken as two lines
  because the hero is a fluid display setting and a sentence that cannot be set
  at display size was never designed to be the largest thing on the page. The
  longer form — *"this system records reality, not aspiration"* — is
  `COMPANY.primary`, and still carries the full claim immediately below it.

---

## DESIGN 01 — "THE REGISTER" — SUPERSEDED

> **Status: superseded.** This was the built ground — warm paper, near-black
> ink, light-only — and it is the version sitting in `RESEARCH TRASH/`. The
> rule it declared ("Light-only — archives are not dark-mode") is the sentence
> this build exists to reverse, so it is quoted here rather than deleted: the
> rejection is the finding. Its row grammar and its P0–P4 hierarchy both
> shipped, and are still the register and field-station grammars in
> `app/globals.css`. What was withdrawn is the surface, and with it the reason
> the ground is now dark:
> on paper, every row reads at the same optical value and the evidence state has
> nothing to escalate against. On a dark substrate the only light present is the
> light a record emitted, so the contract stops being a label in a column and
> becomes a property of the surface.

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

## DESIGN 02 — "THE AURA" — CURRENT

**▸ INTUATION**
A register that emits its own light. The grounding is the long-exposure plate:
an astronomical or forensic plate is a dark substrate on which the only light
present is the light the record itself emitted, and everything the register
cannot prove stays dark. Nothing here is deployed, and an unknown is not a zero.

DESIGN 01's objection stands as the situation to beat — darkness reads as
developer tooling — and the resolution is to make darkness do work instead of
decorating with it. On a dark ground, light is the only thing that can be
earned, so the one property the system insists on stops being a label in a
column and becomes a property of the surface. You can read the light before you
read the words.

**▸ REBUILD**

*SITUATION.* The contract is unchanged and the register grammar is inherited
intact. What is new is the ground, the scale, and the layout bet: the site is
laid out the way an inspection tool is laid out, because the system's entire
claim is inspectability and the thing you selected should never scroll away.

*COMPLICATION.* A near-black substrate fails three ways by default. It bands
visibly on 8-bit panels once a large low-alpha gradient is over it. It invites
the near-black-plus-one-neon cluster the contract already rejects. And on a dark
ground a card is the only shape that reads, so any layout with three regions in
it collapses into uniform rounded cards. The substrate also constrains width:
five node cards on a spine need roughly 205px each to hold a role clause, and
the mantra at its derived size needs its longer designed line to fit inside the
plate. Two columns is arithmetic, not taste — a third was tried and removed.

*RESOLUTION.*

- **Ground.** A light field, not a colour. `.aura` is a fixed, `aria-hidden`
  div carrying two animated radial-gradient layers positioned on the golden
  reciprocals (61.8% / 38.2% and 23.6% / 61.8%) plus a photographic vignette;
  `body::after` adds a 3.2% SVG fractal-noise grain plate, which is not
  decoration — it is what stops the near-black gradient banding. Two composited
  transforms, no `filter: blur()`, no layout or paint after the first frame.
- **Tokens.** Three surfaces (`--void #04060a`, `--panel #0a0e15`,
  `--edge #0f151d`), four ink tiers (`--ink`, `--dust`, `--ash`, `--quiet`), one
  interactive accent (`--signal #35d9a4`, a mineral aqua rather than a neon,
  with `--signal-dim` and `--signal-lit`), and two informational colours that
  are never interactive (`--amber`, the TARGET tag; `--danger`). Hairlines are
  the only material. Depth is made with luminance: a raised surface is
  separated by one pixel of light at its top edge, never by a drop shadow.
- **The five states are a temperature scale, and the scale is a test.** One
  token per state, asserted by `scripts/check-contrast.mjs` to hold a strict
  luminance order — `UNKNOWN` darkest, then `PLANNED`, `TARGET`, `VERIFIED`,
  `PROTOTYPE` brightest — with `TARGET` the warm outlier by R/B ratio. "An
  unknown that shouts is a hidden zero" is a statement about relative
  luminance, so it is enforced as one: 59 real WCAG pairs are computed on the
  screen palette, and the lowest text ratio in the system is `--quiet` on
  `--edge` at 5.07:1.
- **One size constant, two tracking registers, one space constant, all
  machine-checked.** The type ladder is geometric — every step is the previous
  step × 2^(1/4) from a 16px base, running 9.51 / 11.31 / 13.45 / 16 / 19.03 /
  22.63 / 26.91 / 32 / 38.05 / 45.25 — and the hero is the one fluid size,
  `clamp(2.8284rem, 1.15rem + 7.6vw, 11.3137rem)`, 45.25px to 181.02px.
  Tracking follows k·ln(size/16) at k = −0.0125em for sentence and display
  setting, because tracking is added once per glyph and no constant em value
  holds across a 19× size range. The hero's tracking steps across four bands at
  600 / 949 / 1443px, derived from the √2 ladder mapped through the clamp's own
  affine term, worst case 0.00217em. And `--ls-caps: 0.08em` exists as a
  separate register for a reason the curve cannot serve: capitals have no
  ascenders to interleave, so small uppercase needs tracking opened regardless
  of size, and no value of k·ln(size) produces that. Space is 8px with one
  declared 4px half-unit. `scripts/check-scale.mjs` re-derives all of it (48
  invariants) and also fails if a hard-coded `letter-spacing` or an off-grid px
  length reappears, because otherwise the constants are true only until the
  next edit.
- **THE FOUR GRAMMARS**, each with exactly one job, on one dark ground:
  - **CONTROL PLANE** — navigation and selection. A 336px sticky rail holds the
    node index (every published node, grouped as `Control plane · the loop` and
    `Field builds · 1 live · 5 planned`) above the node record (the selected
    node as a `<dl>`: Holds / Custody / Provenance, plus its state tag). The
    plane is the route, above a compact five-cell spine that is hidden on `/`,
    where the full canvas graph renders instead. Below 1200px the rail becomes a
    horizontal scroll strip and the spine turns from five columns to two with
    vertical connectors, recomposing both at once so the navigation and the
    graph cannot disagree about how many things are across.
  - **REGISTER** — evidence. Ruled rows with identifiers, dates, tabular figures,
    provenance that is never omitted, and a state tag that is text before it is
    anything else. Mobile re-composes a row into a definition list rather than
    shrinking a four-column table.
  - **FIELD STATION** — uncertainty. A status band declaring the truths the
    system always holds, a tally counted from the records actually rendered on
    that surface, and empty states that name what the system has not observed
    instead of apologising for it.
  - **VALUE CHAIN** — transformation. Seven stages from OBSERVE to MEASURE with
    a named custodian at each transition and a return stroke, because local-first
    is a claim about custody and has to stop being a slogan somewhere.
- **The graph is drawn, not decorated.** `components/site/Graph.tsx` draws the
  five-node spine with real CSS edges, drawn by the node that arrives at them,
  so an edge lights jade exactly when the flow is leaving the node you are
  standing on. There are no unlinked nodes on that spine. Ports are the one
  element taken from the node-workspace idiom and they earn it: filled for a
  node with a surface, hollow for one without, so "can I open this" is answered
  by shape rather than by colour.
- **The build reframe.** `BUILDS` in `lib/system.ts` holds six instantiations of
  the same chain in six domains. The School Console is the only one with a
  `href`, which is the only reason it is listed first; the other five render as
  text with no route and carry no figure. The site leads with the graph and
  closes on the count — one build of six — because the console is the most
  impressive thing in the repository and the least representative of it.
- **Console parity, without an aurora.** `.console-ui` is a real rule: the
  console gets the tokens, the ladder and the grid, and none of the field,
  because an instrument panel with an aurora behind it is a dashboard.
  `.print-sheet` was a dangling class used by six console components with no CSS
  behind it, so on screen those sheets rendered as white blocks of unreadable
  near-white text; it is now `display: none` on screen and `display: block` in
  print, and `@media print` re-declares every token to a light palette so
  `text-void` on `bg-white` resolves correctly without a second colour system.
  The console's hand-picked tracking values were normalised onto the single
  `tracking-caps` utility, so both surfaces share one caps register.
- **Responsive, and checked rather than asserted.** The rail → strip and the
  five → two recomposition share one breakpoint at 1199px, chosen because that
  is where the arithmetic puts the plane below the width five cards and four
  edges need. Every animation on the system is atmospheric or positional; none
  carries meaning the text does not also carry, so `prefers-reduced-motion`
  drops the whole register and each element lands in its final state.

**▸ FAILURE MODES**
1. **Neon on near-black.** The one interactive colour is jade, a mineral aqua.
   If the accent could be swapped for any other hue without the layout
   changing, it is decoration and the palette is wrong.
2. **Uniform rounded cards.** A card is the only shape that reads on a dark
   ground, so the failure is always available. The plate is one per page and
   only around the hero; repetition is exactly how it becomes card soup.
3. **Gradient wash doing structural work.** The aura is atmosphere. It carries
   no meaning the text does not already carry, and it must never read as a
   border, a state, or an affordance.
4. **Schematic as ornament.** Every node on the spine resolves to a route. A
   node with no surface is rendered as text with a hollow port, never as a link
   that resolves to nothing — that is the one failure this grammar exists to
   prevent.
5. **Dead nodes and implied flows.** An edge implies a running flow, so the
   build annex is six nodes with no edges at all and the connection is stated
   once in its caption. A dead node is deleted, not greyed.
6. **Arrow glyphs in a mono register.** DM Mono carries Latin, Greek and
   Cyrillic and no U+2192, and this system says "records → structure"
   constantly, so an arrow set in mono is a tofu box. Arrows are wrapped in
   `.glyph`, which resolves the symbol against the sans stack and nothing else —
   appending a proportional face to the mono stack would substitute silently.
7. **An unknown that shouts.** The state ordering is asserted as a luminance
   inequality, not a comment. If it inverts, every contrast ratio can still pass
   while the interface becomes dishonest.
8. **Banding.** A near-black ground with a large low-alpha gradient bands on an
   8-bit panel. The grain plate is load-bearing, not finishing.

**▸ FALSIFIER**
If visitors describe the site as a developer tool, the aura has become
atmosphere with nothing underneath it. The bet being tested is that the node
record — the one place on screen that answers "what am I actually looking at?" —
earns its 336px and its permanent position.

---

## DESIGN 03 — "THE CONTROL PLANE" — EXPLORED, ABSORBED

> **Status: not shipped as a direction; absorbed into DESIGN 02.** The
> schematic node and the persistent left rail both survived and became the
> CONTROL PLANE grammar and the `Graph.tsx` spine. What was revised: the accent
> was signal amber marking position, and the console was going to be the hero
> as an embedded interactive panel. Both were reversed — the accent is now jade
> and means evidence and interaction, and the console is one build of six with
> the graph leading the site instead.

**▸ INTUATION**
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

## DESIGN 04 — "THE FIELD STATION" — EXPLORED, ABSORBED

> **Status: not shipped as a direction; absorbed into DESIGN 02.** The status
> band, the inspection tally and the empty-state panel are all live as the
> FIELD STATION grammar. What was revised: the tally's signature count re-roll
> was dropped, because motion that exists to make a number feel satisfying is
> the wrong use of the one place this system spends its motion, and the state
> tally is already legible from the share bars before the digits are read.

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

| | 01 Register | 02 Aura | 03 Control Plane | 04 Field Station |
|---|---|---|---|---|
| Status | superseded | **current** | absorbed | absorbed |
| Surface | paper / light | near-black / aura field | graphite / dark | off-white / light |
| Core primitive | ruled row | node on a lit ground | schematic node | status band + tally |
| Accent | one ink accent | jade `#35d9a4`, one interactive colour | signal amber, position only | cool secondary for `VERIFIED` |
| Motion | row progression | field drift only | loop line redraw | count re-roll |
| Console presence | as appendix record | one build of six | as hero panel | as inspectable export |
| Strongest against | claim inflation | generic-dark risk | navigation confusion | caveat fatigue |
| Weakest against | first-visit warmth | atmosphere with nothing under it | dead-node overclaim | caveat fatigue |

## Quality-gate summary (ASIANCODER §QUALITY GATES)

- **A/B Information & Hierarchy** — 02 states its bet explicitly: the node
  record is the only place on screen that answers "what am I actually looking
  at?", and it is never scrolled away. P0 is the selected record and its
  evidence state, not the decoration.
- **C Brand** — 02 commits to a reference tradition the other three did not
  (the long-exposure plate), and the commit is load-bearing: the dark ground
  exists so that evidence state becomes a property of the surface rather than a
  label in a column.
- **F Accessibility** — verified, not asserted. State is never colour alone;
  focus ring is global; reduced motion is honoured globally; the skip link is
  kept; and unlike 01, 03 and 04, the palette claim is backed by 59 computed
  WCAG pairs plus an asserted state ordering, with the lowest ratio in the
  system named (5.07:1) rather than asserted to pass.
- **G Responsive** — 02 defines a re-composition, not a stack: rail → horizontal
  strip, spine five → two with vertical connectors, both at one breakpoint
  chosen by the arithmetic rather than by a round number.
- **I Trust** — evidence states are structural in all four; 02 additionally
  makes the *ordering* of the states a checked invariant, because the contract's
  sharpest claim — an unknown is never louder than a verified row — is a claim
  about luminance and cannot be enforced any other way.
- **J Memory** — 01: "a record book that runs as software." 02: *"records, not
  assertions."* 03: "the loop, drawn." 04: "it shows you what it doesn't know."