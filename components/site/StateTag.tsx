import type { EvidenceState } from "@/lib/system";

/**
 * The evidence state tag — the signature element of the REGISTER grammar.
 *
 * Three rules make it trustworthy rather than decorative:
 *
 *   1. The state is always text. The dot, the border and the colour are
 *      redundant channels; if colour fails or is filtered, the meaning
 *      survives.
 *   2. The dot's *form* varies with state, not only its hue: filled for
 *      VERIFIED, outlined for PROTOTYPE, dashed for PLANNED, dotted for
 *      UNKNOWN. Distinguishable in monochrome.
 *   3. UNKNOWN is the quietest state in the system, never an omission.
 */
export function StateTag({
  state,
  title,
}: {
  state: EvidenceState;
  /** The provenance sentence, exposed on hover and to assistive tech. */
  title?: string;
}) {
  return (
    <span className="state" data-state={state} title={title}>
      {state}
    </span>
  );
}