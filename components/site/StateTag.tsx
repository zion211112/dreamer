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
 *
 * The provenance sentence is a `title` for pointer users and a
 * visually-hidden span for everyone else — assistive tech cannot hover,
 * so a tooltip-only explanation is an explanation some users never get.
 * Callers that already render the provenance next to the tag (register
 * rows) pass no `title`, so the sentence is never announced twice.
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
      {title ? <span className="sr-only"> — {title}</span> : null}
    </span>
  );
}