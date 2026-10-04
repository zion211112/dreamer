import { GUARD_RULES, type GuardEvent, type GuardSeverity } from "@/lib/epistemic/taxonomy";
import type { GuardRecord } from "@/lib/epistemic/model";

/**
 * components/epistem/GuardList.tsx - THE CATEGORY GUARD, AS EVENTS.
 *
 * ASIANCODER.MD is blunt that these are "first-class system events", and
 * `guard.ts` says the same thing about its own lexical detectors: a guard
 * that reports a finding without showing the words it caught is an oracle,
 * and oracles are the thing this system exists to replace.
 *
 * Therefore this list is structurally incapable of rendering a bare event
 * name. `GuardRecord.observed` is `z.string().min(1)` in the domain model -
 * a guard cannot be recorded without the span that tripped it - and the
 * span is rendered here as a `<q>`, in the same row, before the reasoning
 * that follows from it. The evidence string is not a substitute for the
 * quote and is not rendered in its place; a reader who cannot check the
 * detector's input has no way to know whether it fired correctly.
 *
 * The other three lines that are always present, each for a reason:
 *
 *   RULE      the question a reviewer must answer to justify the finding.
 *             Without it a guard can be dismissed by anyone and defended by
 *             nobody.
 *   REQUIRED  `GUARD_RULES[].response`. A guard that cannot say what it
 *             wants is a complaint, and ASIANCODER's position is that these
 *             findings cannot be ignored.
 *   STATUS    open or acknowledged, and whether it currently blocks. A
 *             CRITICAL guard blocks promotion until a human acknowledges it
 *             (`gatePromotion`); an ADVISORY one never does. Saying so
 *             prevents the CRITICAL and the ADVISORY from reading alike.
 *
 * Presentational and stateless - no acknowledgement happens here, because a
 * human decision is a trace event and belongs to the state layer, not to a
 * list component. So there is no `use client`.
 */
export interface GuardListProps {
  guards: readonly GuardRecord[];
  /**
   * Replaces the empty-list sentence. Used when the caller knows the guards
   * are empty for a specific reason ("this stage raises none") rather than
   * because nothing has been checked.
   */
  emptyNote?: string;
}

const SEVERITY_ORDER: Record<GuardSeverity, number> = {
  CRITICAL: 0,
  MATERIAL: 1,
  ADVISORY: 2,
};

function eventLabel(event: GuardEvent): string {
  return event.replace(/_/g, " ");
}

/**
 * ISO-8601 clipped to `YYYY-MM-DD HH:MM` UTC.
 *
 * Deliberately not `toLocaleDateString`. A locale-formatted timestamp
 * differs between the server render and the client hydration, and that
 * mismatch surfaces as a console warning on a page whose entire claim is
 * that its own output is trustworthy. Clipping the stored ISO string is
 * boring, identical on both sides, and states its own timezone rather than
 * inheriting the reader's.
 *
 * The same three lines appear in StatementCard and EvidenceLedger. That is
 * a deliberate duplication: the component surface is five self-contained
 * files and a shared formatting module would be a sixth file outside it.
 */
function formatInstant(iso: string): string {
  if (iso.length < 16) return iso;
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

/**
 * Worst first, then by event name, then by time.
 *
 * The ordering is deliberate rather than cosmetic. A list of guard events
 * sorted by insertion puts whichever violation the system happened to meet
 * first at the top, which buries a later CRITICAL under the ADVISORY that
 * preceded it. Ranking by severity means the worst thing is the first thing
 * read, and the sort is total and deterministic, so the list does not
 * reshuffle between renders of the same records.
 */
function ordered(guards: readonly GuardRecord[]): GuardRecord[] {
  return [...guards].sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.event.localeCompare(b.event) ||
      a.raisedAt.localeCompare(b.raisedAt) ||
      a.id.localeCompare(b.id)
  );
}

export function GuardList({ guards, emptyNote }: GuardListProps) {
  if (guards.length === 0) {
    return (
      <section className="ep-guard" aria-label="Category guard events">
        <p className="ep-guard-item">
          {emptyNote ??
            "No guard events recorded. That is a statement about what has been checked, not a statement that nothing is wrong."}
        </p>
      </section>
    );
  }

  return (
    <section className="ep-guard" aria-label="Category guard events">
      <ol>
        {ordered(guards).map((g) => {
          const rule = GUARD_RULES[g.event];
          const blocks = g.severity === "CRITICAL" && !g.acknowledged;

          return (
            <li
              className="ep-guard-item"
              key={g.id}
              data-event={g.event}
              data-severity={g.severity}
            >
              {/* Severity is the raw vocabulary value and is text first; the
                  colour is what the stylesheet hangs off `ep-guard-sev`.
                  Never the other way round. */}
              <p className="ep-guard-sev">
                {g.severity} &middot; {eventLabel(g.event)}
                {/* `contract` marks the six ASIANCODER.MD names explicitly.
                    It is rendered because a list that cannot be checked
                    against the contract cannot be audited against it. */}
                {rule.contract ? " &middot; contract event" : ""}
              </p>

              {/* Both the span and the evidence carry `ep-guard-ev`; the
                  element type is what separates the quote from the
                  reasoning it feeds, so no second class has to be invented
                  for the stylesheet to tell them apart. */}
              <q className="ep-guard-ev">{g.observed}</q>
              <p className="ep-guard-ev">{g.evidence}</p>

              <dl>
                <dt>Rule</dt>
                <dd>{rule.test}</dd>

                <dt>Required</dt>
                <dd>{rule.response}</dd>

                <dt>Raised</dt>
                <dd>
                  {formatInstant(g.raisedAt)}
                  {g.statementId ? ` | statement ${g.statementId}` : ""}
                  {g.traceEventId ? ` | trace event ${g.traceEventId}` : ""}
                </dd>

                <dt>Status</dt>
                <dd>
                  {g.acknowledged
                    ? `Acknowledged by ${g.acknowledgedBy ?? "an unnamed human"}. Acknowledging records the decision; it does not remove the finding.`
                    : blocks
                      ? "Open. An unacknowledged CRITICAL guard blocks promotion until a human acknowledges it."
                      : "Open. This severity does not block a transition."}
                </dd>
              </dl>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
