import type { ConfidenceDisplay } from "@/lib/epistemic/confidence";

/**
 * components/epistem/ConfidenceLedger.tsx - CONFIDENCE, WITH ITS REASONS,
 * OR NOT AT ALL.
 *
 * This is the component the whole contract hangs on. ASIANCODER.MD says it
 * twice and in the imperative:
 *
 *   "Do not let 'high confidence' exist without a visible reason."
 *   "This must remain inspectable."
 *
 * So there is deliberately no `compact` prop, no `valueOnly` prop and no
 * code path through this file that renders the number alone. The type of
 * the prop makes it structurally impossible to pass a bare score: it
 * accepts the whole `ConfidenceDisplay` returned by `displayConfidence()`,
 * and that object contains the ledger that produced the number. A caller
 * who wants a confidence on screen has to have the reasons in hand.
 *
 * Two decisions worth stating:
 *
 *   1. THE REASONS ARE NOT BEHIND A DISCLOSURE. A collapsed `<details>`
 *      would be a defensible layout and a violation of the contract, since
 *      a reason nobody has opened is a reason nobody has read. The value
 *      sits above an always-open list.
 *
 *   2. THE DUPLICATION WARNING IS NOT IN THE LIST. `displayConfidence`
 *      reports repeated factors separately from the ledger, because a
 *      repeated factor is not a weaker reason, it is a DIFFERENT KIND of
 *      finding: the same support arriving twice and being counted once.
 *      That is repetition-as-corroboration, which is CONSENSUS_AMPLIFICATION
 *      in arithmetic form, and burying it in a list of line items would
 *      file a structural defect as one more piece of prose.
 *
 * Presentational and stateless, so no `use client`: there is nothing here
 * that a renderer cannot do on a server.
 */
export interface ConfidenceLedgerProps {
  /** The whole of `displayConfidence()` - value, basis and warning. */
  display: ConfidenceDisplay;
  /**
   * What the number is about, announced to assistive tech only. A ledger
   * with no subject says "0.82" to a screen-reader user with no idea
   * whether it is the claim, the retrieval, or the weather.
   */
  subject?: string;
}

export function ConfidenceLedger({ display, subject }: ConfidenceLedgerProps) {
  const hasBasis = display.basis.length > 0;

  return (
    <div className="ep-conf">
      <p className="ep-conf-value">
        {display.value}
        <span className="sr-only">
          {subject ? ` - confidence in ${subject}. ` : " - confidence. "}
          The reasons below are the entire basis for this number; there is
          none held back.
        </span>
      </p>

      {/* `null` is a real answer here, not a missing one. A confidence with
          no factors is the neutral prior from confidence.ts, and rendering
          it as "0.50 - nothing recorded" is more honest than rendering an
          empty list beside a number that looks measured. */}
      {hasBasis ? (
        /* The list is unclassed on purpose: the declared class set carries
           `ep-conf-line` and nothing for its container, so the line items are
           the hooks and the list is plain structure. A container class
           invented here would be one the stylesheet owner never agreed to. */
        <ul>
          {display.basis.map((line, i) => (
            <li
              /* Two lines can carry the same sign and the same label if the
                 underlying factors repeat with different bases, and
                 confidence.ts deduplicates the FACTOR not the entry, so
                 index plus label is the only stable identity available. */
              key={`${line.label}-${i}`}
              className={
                line.sign === "+"
                  ? "ep-conf-line ep-conf-line-pos"
                  : "ep-conf-line ep-conf-line-neg"
              }
            >
              {/* The sign is the redundant channel for the line colour, and
                  it is read rather than hidden: a plus and a minus are the
                  one pair of marks that survives monochrome. */}
              <span aria-hidden="true">{line.sign}</span>
              <span>{line.label}</span>
              <span>{line.detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ep-conf-line">
          No factors recorded. This is the neutral prior, not a measurement:
          nothing here supports the claim and nothing here undermines it.
        </p>
      )}

      {display.warning ? (
        /* `aside` rather than a bare div: the duplication notice is
           tangential to the arithmetic and belongs in the accessibility
           tree as its own block, so a reader can navigate past it and come
           back. No `role="alert"` - nothing here is announcing a change,
           and an alert on static markup teaches operators to ignore it. */
        <aside className="ep-conf-warn" aria-label="Confidence warning">
          <strong>Duplicated factor.</strong> {display.warning}
        </aside>
      ) : null}
    </div>
  );
}
