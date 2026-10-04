import { CategoryTag } from "./CategoryTag";
import {
  CATEGORY_RANK,
  type StatementCategory,
} from "@/lib/epistemic/taxonomy";
import {
  deriveProvenanceKind,
  type Actor,
  type CategoryTransition,
  type Statement,
} from "@/lib/epistemic/model";

/**
 * components/epistem/StatementCard.tsx - ONE STATEMENT, WHOLE.
 *
 * ASIANCODER.MD requires the interface to expose category transitions and
 * let a user "click any transition and inspect why it happened". This is
 * that surface, and it is deliberately not a summary: the card shows the
 * kind, the earned category, the sentence, the support state, the derived
 * provenance, the recorded unknowns and every transition with its reason,
 * its actor and whether it was a promotion.
 *
 * Three things that are easy to omit and must not be:
 *
 *   1. THE UNKNOWNS. `unknowns` is an array on every statement and it is
 *      rendered whether or not it is interesting. An empty list renders as
 *      the sentence "none recorded" rather than as nothing at all, because
 *      an absent panel and an empty panel are different facts and only one
 *      of them is true here.
 *
 *   2. THE REASON ON EVERY TRANSITION. `CategoryTransition.reason` is
 *      non-empty in the schema precisely so that no move can happen
 *      silently. Rendering it is the whole point; a transition chip showing
 *      only "OBSERVATION -> FACT" would honour the letter of the model and
 *      none of its intent.
 *
 *   3. THE PROMOTION MARKER IN TEXT. A promotion is the move the firewall
 *      exists to catch, so it takes the contradiction colour AND the word
 *      PROMOTION. Colour alone would fail the same rule every other element
 *      in this system obeys.
 *
 * Presentational and stateless: the transition disclosure is a native
 * `<details>`, which is keyboard operable without a line of JavaScript, so
 * this file needs no `use client` and can be rendered on a server.
 */
export interface StatementCardProps {
  statement: Statement;
}

/**
 * A readable name for an `Actor` without inventing an identity the record
 * does not carry. A MODEL is named by its capability and never by a vendor
 * here, because ASIANCODER requires provenance to survive a provider swap.
 */
function actorLabel(actor: Actor): string {
  switch (actor.type) {
    case "MODEL":
      return `model (${actor.capability}${actor.provider ? ` via ${actor.provider}` : ""})`;
    case "HUMAN":
      return `human (${actor.actorId})`;
    case "TOOL":
      return `tool (${actor.toolId})`;
    case "SYSTEM":
      return `system (${actor.component})`;
  }
}

/**
 * ISO-8601 clipped to `YYYY-MM-DD HH:MM` UTC.
 *
 * Deliberately not `toLocaleDateString`. A locale-formatted timestamp
 * differs between the server render and the client hydration, and that
 * mismatch surfaces as a console warning on a page whose entire claim is
 * that its own output is trustworthy. Clipping the stored ISO string is
 * boring, identical on both sides, and states its own timezone instead of
 * inheriting the reader's.
 *
 * This helper exists twice, here and in EvidenceLedger. That is a
 * deliberate duplication rather than a missed extraction: the component
 * surface is five self-contained files, and a shared formatting module
 * would be a sixth file outside it.
 */
function formatInstant(iso: string): string {
  if (iso.length < 16) return iso;
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

/** `NORMATIVE_JUDGMENT` renders as `NORMATIVE JUDGMENT`. */
function categoryLabel(category: StatementCategory): string {
  return category.replace(/_/g, " ");
}

function TransitionRow({ t }: { t: CategoryTransition }) {
  const rankDelta = CATEGORY_RANK[t.to] - CATEGORY_RANK[t.from];

  return (
    /* `data-` rather than an invented class: this surface owns no class
       names of its own beyond the declared set, and a hook the stylesheet
       has not agreed to is a hook that will rot into a lie. */
    <li data-transition data-promotion={t.promotion}>
      <details>
        <summary>
          <span>{categoryLabel(t.from)}</span>
          {/* DM Mono has no U+2192 and renders one as a tofu box; globals.css
              documents `.glyph` as the wrapper that resolves arrows against
              the sans stack, so the arrow is emitted as an entity (ASCII in
              source) and wrapped rather than typed literally. */}
          <span className="glyph" aria-hidden="true">
            {" "}
            &rarr;{" "}
          </span>
          <span>{categoryLabel(t.to)}</span>
          {/* The redundant channel for the contradiction colour below.
              Never rendered as colour alone. */}
          {t.promotion ? (
            <span
              data-promotion="true"
              style={{ color: "var(--danger)" }}
            >
              {" "}
              PROMOTION
            </span>
          ) : (
            <span className="sr-only">
              {rankDelta > 0
                ? " - weakened, this grants less entitlement than it had"
                : rankDelta < 0
                  ? " - strengthened without an increase in entitlement"
                  : " - lateral, the entitlement is unchanged"}
            </span>
          )}
        </summary>

        {/* The note sits outside the <dl> because a <p> is not a permitted
            child of a description list, and a validator that tolerates it is
            a validator that will tolerate the next thing too. */}
        <dl className="ep-stmt-meta">
          <dt>Reason</dt>
          <dd>{t.reason}</dd>

          <dt>Actor</dt>
          <dd>{actorLabel(t.actor)}</dd>

          <dt>Recorded</dt>
          <dd>{formatInstant(t.at)}</dd>

          {t.guard ? (
            <>
              <dt>Guard raised</dt>
              <dd>{t.guard}</dd>
            </>
          ) : null}
        </dl>

        {t.promotion ? (
          <p>
            {/* guard.ts's detectCategoryDrift rates a promotion with no guard
                as MATERIAL. Stating it here rather than leaving it to the
                guard list means the reader sees the omission at the moment
                they are inspecting the move that caused it. */}
            {t.guard
              ? "This promotion raised a guard event, which is the expected behaviour."
              : "No guard event was raised for this promotion. A promotion that raised nothing is CATEGORY_DRIFT."}
          </p>
        ) : null}
      </details>
    </li>
  );
}

export function StatementCard({ statement: s }: StatementCardProps) {
  const provenance = deriveProvenanceKind(s.provenance);
  const unknownCount = s.unknowns.length;
  const transitionCount = s.transitions.length;

  return (
    <article
      className="ep-stmt"
      data-kind={s.kind}
      data-category={s.category}
      data-support={s.support}
      data-provenance={provenance}
    >
      <header className="ep-stmt-head">
        <span className="ep-stmt-kind">{s.kind.replace(/_/g, " ")}</span>
        <CategoryTag category={s.category} context={`${s.kind} statement`} />
      </header>

      {/* The sentence is the heading. A card whose subject is not navigable
          by heading is a card whose subject has to be hunted for. */}
      <h3 className="ep-stmt-text">{s.text}</h3>

      <div className="ep-stmt-meta">
        <dl>
          <dt>Support</dt>
          <dd>{s.support.replace(/_/g, " ")}</dd>

          {/* Derived from the append-only provenance list, never stored. The
              card cannot show a provenance the record does not carry, which
              is the point: "never erase provenance" is enforced upstream and
              this only reports what survived. */}
          <dt>Provenance</dt>
          <dd>{provenance.replace(/_/g, " ")}</dd>

          <dt>Chain stage</dt>
          {/* Rendered as the raw vocabulary value. Every CHAIN_STAGE is a
              single word today, so any transform here would be a no-op
              written in advance of a need nobody has stated. */}
          <dd>{s.chainStage}</dd>

          <dt>Recorded</dt>
          <dd>{formatInstant(s.createdAt)}</dd>

          <dt>Id</dt>
          <dd>{s.id}</dd>
        </dl>

        {/* Guards are summarised here in words and rendered with their
            quoted span by GuardList. A card that hid an outstanding CRITICAL
            while showing the category it threatens would make the category
            tag the more trustworthy of the two. */}
        <p>
          <strong>Guards:</strong>{" "}
          {s.guards.length > 0
            ? s.guards.map((g) => g.replace(/_/g, " ")).join(", ")
            : "none raised"}
        </p>

        <section>
          <h4>
            Recorded unknowns ({unknownCount})
          </h4>
          {unknownCount > 0 ? (
            <ul>
              {s.unknowns.map((u, i) => (
                /* Two unknowns can be the same string. The index is the only
                   identity available and dropping one would hide a
                   duplicate, which is a fact worth rendering. */
                <li key={`${i}-${u}`}>{u}</li>
              ))}
            </ul>
          ) : (
            /* An absent panel and an empty panel are different facts. */
            <p>None recorded against this statement.</p>
          )}
        </section>

        <section>
          <h4>Category transitions ({transitionCount})</h4>
          {transitionCount > 0 ? (
            <ol>
              {s.transitions.map((t) => (
                <TransitionRow key={t.id} t={t} />
              ))}
            </ol>
          ) : (
            <p>
              No transitions. This statement has held {categoryLabel(s.category)}
              {" "}since it was recorded, and nothing has moved it.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
