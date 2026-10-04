import {
  CATEGORY_RANK,
  CATEGORY_RULES,
  type StatementCategory,
} from "@/lib/epistemic/taxonomy";

/**
 * components/epistem/CategoryTag.tsx - THE RANK, MADE VISIBLE.
 *
 * ASIANCODER.MD's first anti-category-error mechanism is that the UI "must
 * visually distinguish" the eleven categories. Colouring a chip is the easy
 * half of that and is nearly worthless on its own: eleven hues on a dark
 * ground is a legend nobody learns, and it fails entirely in monochrome,
 * for a colour-blind reader, or on a projector.
 *
 * So the chip carries THREE channels and the colour is the weakest of them:
 *
 *   1. the numeral    - the entitlement rank itself, 0 to 10
 *   2. the words      - the category, spelled
 *   3. the colour     - the band the rank falls in
 *
 * The numeral is the one that cannot be lost. `ep-cat-rank` is rendered
 * before the label and is never hidden behind a legend, because a reader
 * who cannot use the colour must still be able to tell a FACT (0) from a
 * DESIGN_CHOICE (9) without guessing.
 *
 * The `test` is exposed twice on purpose. `title` reaches the pointer, and
 * assistive tech cannot hover, so the same sentence is repeated into a
 * visually-hidden span. That is the contract StateTag established and this
 * component does not get to quietly forget it: a tooltip-only explanation
 * is an explanation some users never receive.
 */

/**
 * Rank bands. Five colours for eleven categories, read as a temperature
 * rather than as eleven identities.
 *
 * The boundaries are placed where the entitlement changes KIND, not where it
 * fades evenly:
 *
 *   0        FACT                    the only category this system verifies
 *   1-2      OBSERVATION,            captured or relayed - both checkable
 *            SOURCE_CLAIM
 *   3-4      INFERENCE,              defeasible reasoning
 *            HYPOTHESIS
 *   5-6      PREDICTION,             a future debt, or no committed basis
 *            SPECULATION
 *   7-10     ASSUMPTION .. UNKNOWN   owed no belief on evidence grounds
 *
 * The last band lumps a human's value judgement together with UNKNOWN, and
 * that is the one non-obvious call in the file. It looks like it flattens
 * very different things. It does not: a normative claim is not weakly
 * evidenced, it is a DIFFERENT KIND of thing, and no quantity of evidence
 * would entitle it. Painting it a warmer "mildly doubtful" amber is
 * precisely the category error the ladder exists to prevent - it would
 * suggest that evidence could be found. So the human-owned and the
 * unknown categories share the quietest colour, and the distinction
 * between them is carried by the numeral and the words.
 *
 * `--state-unknown` for that band is deliberate rather than ironic: it is
 * the darkest token on the surface, and ASIANCODER's rule is that an
 * unknown must be a deliberately quiet neutral state, never a loud one.
 */
const BANDS = [
  { max: 0, name: "VERIFIED", token: "var(--signal)" },
  { max: 2, name: "RECORDED", token: "var(--state-prototype)" },
  { max: 4, name: "REASONED", token: "var(--amber)" },
  { max: 6, name: "DEFERRED", token: "var(--state-planned)" },
  { max: 10, name: "UNENTITLED", token: "var(--state-unknown)" },
] as const;

function bandFor(rank: number) {
  const found = BANDS.find((b) => rank <= b.max);
  /* The ladder is a total function over 0..10 and BANDS ends at 10, so this
     throw is unreachable. It is written rather than defaulted because a
     silent fallback here would paint an unbanded rank in whatever colour
     happened to be last, which is exactly the kind of quiet drift that
     makes a colour scale stop meaning anything. */
  if (!found) throw new Error(`No category band covers rank ${rank}.`);
  return found;
}

/** `NORMATIVE_JUDGMENT` renders as `NORMATIVE JUDGMENT`. */
function label(category: StatementCategory): string {
  return category.replace(/_/g, " ");
}

export interface CategoryTagProps {
  category: StatementCategory;
  /**
   * Optional prefix for assistive tech, so a chip in a list of forty can
   * say what it is a chip OF. Visible nothing, announced once.
   */
  context?: string;
}

/**
 * A category, as a chip, with its entitlement rank.
 *
 * Presentational and stateless on purpose: there is no `use client`
 * directive, because there is no state to own. The chip is focusable only
 * so that `title` has a keyboard path - a `title` is announced on hover
 * and on focus in every browser that matters, and a chip nobody can focus
 * is a chip whose category test nobody but a mouse user can read. The
 * visually-hidden sentence is the actual guarantee; the focusability is
 * the courtesy.
 */
export function CategoryTag({ category, context }: CategoryTagProps) {
  const rank = CATEGORY_RANK[category];
  const rule = CATEGORY_RULES[category];
  const band = bandFor(rank);

  return (
    <span
      className="ep-cat"
      data-band={band.name}
      data-rank={rank}
      title={rule.test}
      tabIndex={0}
      style={{ color: band.token, borderColor: band.token }}
    >
      {/* Hidden from assistive tech and stated in the sentence below, so a
          screen reader hears "entitlement rank 0" rather than a bare "0". */}
      <span className="ep-cat-rank" aria-hidden="true">
        {rank}
      </span>
      <span>{label(category)}</span>
      <span className="sr-only">
        {context ? ` - ${context}. ` : " - "}
        Entitlement rank {rank} of {CATEGORY_RULES.UNKNOWN.rank}. Band{" "}
        {band.name}. Category test: {rule.test} It does not entitle:{" "}
        {rule.doesNotEntitle}
      </span>
    </span>
  );
}
