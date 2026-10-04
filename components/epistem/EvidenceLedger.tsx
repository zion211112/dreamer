import {
  CATEGORY_RANK,
  CATEGORY_RULES,
  STATEMENT_CATEGORIES,
  type StatementCategory,
} from "@/lib/epistemic/taxonomy";
import type {
  Actor,
  ClaimT,
  Evidence,
  Source,
  Statement,
} from "@/lib/epistemic/model";

/**
 * components/epistem/EvidenceLedger.tsx - THE REGISTER.
 *
 * ASIANCODER.MD's EVIDENCE LEDGER section names twelve fields a
 * consequential claim should display. This component owns the seven that
 * are properties of the stored records: source, source quality,
 * direct/indirect, independent corroboration, contradicting evidence and
 * last verified, under a per-record identity cell. The other five
 * (confidence, confidence basis, timestamp, known unknowns, verification
 * status) live in ConfidenceLedger and StatementCard, because each of those
 * renders one field deeply rather than seven shallowly.
 *
 * Two structural decisions do the real work here.
 *
 *   1. GROUPED BY CATEGORY, STRONGEST FIRST. The register reads as the
 *      category ladder itself rather than as an alphabetical list, and the
 *      rank numeral is printed on every group header. A reader scrolling
 *      this table should be able to see where the entropy of the register
 *      sits: a page with forty rows under rank 4 and one under rank 10 has
 *      told them something a summary line would have hidden.
 *
 *   2. INDEPENDENCE IS COUNTED FROM `independenceGroup`, NOT FROM
 *      CITATIONS. Two sources sharing an independence group are one source
 *      cited twice, and treating them as corroboration is the entire
 *      failure `guard.ts` and `confidence.ts` are both built to catch. So
 *      the corroboration cell prints the citation count and the independent
 *      origin count side by side, names the groups, and, when the stored
 *      `independentSupports` disagrees with what the sources actually
 *      resolve to, says so. That disagreement is a finding, not a
 *      formatting detail, and hiding it would mean the ledger could report
 *      corroboration that no source supports.
 *
 * Presentational and stateless. Grouping, ordering and the independence
 * count are all computed inline from the props, which is why this file
 * imports no state layer and carries no `use client`.
 */
export interface EvidenceLedgerProps {
  statements: readonly Statement[];
  sources: readonly Source[];
  /**
   * Evidence captures. Optional because a claim may cite an id nothing has
   * captured yet, which is a legal and common state, and because an absent
   * list and an empty one are different facts this component reports
   * differently.
   */
  evidence?: readonly Evidence[];
  /**
   * Visible table caption. Omit it and the caption is rendered for
   * assistive tech only, so the table is never unnamed.
   */
  caption?: string;
}

/**
 * ISO-8601 clipped to `YYYY-MM-DD HH:MM` UTC.
 *
 * Deliberately not `toLocaleDateString`: a locale-formatted timestamp
 * differs between the server render and the client hydration, and that
 * mismatch surfaces as a console warning on a page whose entire claim is
 * that its own output is trustworthy. The same three lines appear in
 * StatementCard and GuardList, which is a deliberate duplication rather than
 * a missed extraction: the component surface is five self-contained files.
 */
function formatInstant(iso: string): string {
  if (iso.length < 16) return iso;
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

function categoryLabel(category: StatementCategory): string {
  return category.replace(/_/g, " ");
}

function qualityLabel(q: Source["quality"]): string {
  return q.replace(/_/g, " ");
}

/**
 * The evidence path a statement of this kind actually HAS.
 *
 * ASIANCODER's complaint is that observation, inference and value judgment
 * "blur together". They blur in the register precisely because the ledger
 * asks every row the same seven questions and eight of the nine statement
 * kinds have no citation field to answer them with. The correct rendering
 * of "no sources" for a hypothesis is therefore not a zero: it is the test
 * that would move it, and for a value judgement it is the human who holds
 * it. No amount of evidence entitles a normative claim, so showing one
 * beside three sources would be the category error rendered as layout.
 *
 * Exhaustive over the union on purpose: a tenth statement kind that forgets
 * this case is a compile error, not a blank cell in the register.
 */
function evidencePath(s: Statement): string {
  switch (s.kind) {
    case "OBSERVATION":
      return `Captured reading, not a citation. Method "${s.method}" by ${actorLabel(
        s.capturedBy
      )}.`;
    case "INFERENCE":
      return `Rests on ${s.premises.length} premise(s) by ${s.warrant.toLowerCase()} warrant: ${
        s.rule
      }. Evidenced through its premises, never cited directly.`;
    case "HYPOTHESIS":
      return `Untested. Would be supported by: ${s.wouldBeSupportedBy} Would be refuted by: ${s.wouldBeRefutedBy}`;
    case "ASSUMPTION":
      return `Unverified assumption. ${
        s.verified ? "Marked verified." : "Marked unverified."
      } If false: ${s.ifFalse}`;
    case "VALUE_JUDGMENT":
      return `Held by ${s.heldBy}. Prioritises ${s.prioritises} over ${s.over}. Not derivable from evidence.`;
    case "DECISION":
      return `Authorised by ${
        s.authorisedBy.type === "HUMAN"
          ? `human (${s.authorisedBy.actorId})`
          : s.authorisedBy.type.toLowerCase()
      }. Irreversible and external actions require a named human.`;
    case "PREDICTION":
      return `Betting against ${formatInstant(
        s.resolvesAt
      )}. ${
        s.resolvedOutcome === null
          ? "Still pending. Pending is not wrong."
          : `Resolved: ${s.resolvedOutcome}`
      }`;
    case "COUNTEREXAMPLE":
      return `Counterexample to ${s.refutes}, by ${s.mode
        .toLowerCase()
        .replace(/_/g, " ")}.`;
    case "CLAIM":
      return "Cites sources below.";
    default: {
      /* Exhaustive by construction: if a statement kind is added and this
         case is not handled, `s` is not `never` here and tsc fails. */
      const unhandled: never = s;
      return unhandled;
    }
  }
}

/**
 * A readable name for an actor, without inventing an identity the record does
 * not carry. A MODEL is named by its capability and never by a vendor here,
 * because ASIANCODER requires provenance to survive a provider swap.
 *
 * This is the third helper duplicated across these files (with
 * `formatInstant` above and its twin in StatementCard). That is deliberate:
 * the component surface is five self-contained files, and a shared module
 * would be a sixth file outside it.
 */
function actorLabel(actor: Actor): string {
  switch (actor.type) {
    case "MODEL":
      return `model (${actor.capability}${
        actor.provider ? ` via ${actor.provider}` : ""
      })`;
    case "HUMAN":
      return `human (${actor.actorId})`;
    case "TOOL":
      return `tool (${actor.toolId})`;
    case "SYSTEM":
      return `system (${actor.component})`;
  }
}

interface Group {
  category: StatementCategory;
  rows: Statement[];
}

/**
 * Grouped by category in rank order, rows in time order.
 *
 * Both sorts are total: every comparison falls through to a string tie, so
 * the same records always render in the same order. A register that
 * reshuffles between renders is not auditable, because "row 14" stops
 * meaning anything.
 */
function group(statements: readonly Statement[]): Group[] {
  /* Sorted by CATEGORY_RANK rather than by the order STATEMENT_CATEGORIES
     happens to be written in. Two lists that must agree are exactly the
     pair that drifts, and the rank is the number CategoryTag prints, so the
     ledger's order is derived from the same source of truth as its heading. */
  const ladder = [...STATEMENT_CATEGORIES].sort(
    (a, b) => CATEGORY_RANK[a] - CATEGORY_RANK[b]
  );
  const out: Group[] = [];
  for (const category of ladder) {
    const rows = statements
      .filter((s) => s.category === category)
      .sort(
        (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
      );
    if (rows.length > 0) out.push({ category, rows });
  }
  return out;
}

export function EvidenceLedger({
  statements,
  sources,
  evidence,
  caption,
}: EvidenceLedgerProps) {
  const bySource = new Map<string, Source>(sources.map((s) => [s.id, s]));
  const byEvidence = new Map<string, Evidence>(
    (evidence ?? []).map((e) => [e.id, e])
  );
  const groups = group(statements);

  /* Every source id the register cannot resolve is a dangling citation.
     Counted per statement so the corroboration cell can say "with 1
     citation resolving to no source" rather than quietly shortening a
     list and reporting a smaller count than the record actually holds. */
  const dangling = new Map<string, number>();
  for (const s of statements) {
    if (s.kind !== "CLAIM") continue;
    const missing = s.sourceIds.filter((id) => !bySource.has(id)).length;
    if (missing > 0) dangling.set(s.id, missing);
  }

  return (
    <table className="ep-ledger">
      <caption className={caption ? undefined : "sr-only"}>
        {caption ??
          "Evidence ledger. One row per statement, grouped by epistemic category from the strongest entitlement to the weakest, with each statement's sources, source quality, directness, independent corroboration count, contradicting evidence and last retrieval."}
      </caption>

      <thead>
        <tr className="ep-ledger-row">
          <th className="ep-ledger-cell" scope="col">
            Record
          </th>
          <th className="ep-ledger-cell" scope="col">
            Source
          </th>
          <th className="ep-ledger-cell" scope="col">
            Source quality
          </th>
          <th className="ep-ledger-cell" scope="col">
            Direct / indirect
          </th>
          <th className="ep-ledger-cell" scope="col">
            Independent corroboration
          </th>
          <th className="ep-ledger-cell" scope="col">
            Contradicting evidence
          </th>
          <th className="ep-ledger-cell" scope="col">
            Last verified
          </th>
        </tr>
      </thead>

      {groups.length === 0 ? (
        <tbody>
          <tr className="ep-ledger-row">
            <td className="ep-ledger-cell" colSpan={7}>
              {/* Absence is content in this system. An empty register states
                  what it would hold and why it is legitimately empty. */}
              No records. This ledger holds one row per statement, grouped by
              the category that statement earns. It is empty because no
              statement has been recorded, which is a different fact from
              having recorded nothing worth believing.
            </td>
          </tr>
        </tbody>
      ) : (
        groups.map((g) => {
          const rule = CATEGORY_RULES[g.category];

          return (
            /* One tbody per category, so the group heading is a real
               `colgroup` scope rather than a decorative row and a screen
               reader can navigate to "the FACT group" and hear its name. */
            <tbody key={g.category}>
              <tr className="ep-ledger-row">
                <th className="ep-ledger-cell" scope="colgroup" colSpan={7}>
                  {/* The numeral is the redundant channel for the colour
                      band, and it is the same number CategoryTag prints. */}
                  <span className="ep-rank">{CATEGORY_RANK[g.category]}</span>{" "}
                  {categoryLabel(g.category)}
                  <span> &mdash; {rule.test}</span>
                  <span> Does not entitle: {rule.doesNotEntitle}</span>{" "}
                  {g.rows.length} record{g.rows.length === 1 ? "" : "s"}
                </th>
              </tr>

              {g.rows.map((s) => {
                const claim: ClaimT | null = s.kind === "CLAIM" ? s : null;
                const resolved = claim
                  ? claim.sourceIds
                      .map((id) => bySource.get(id))
                      .filter((x): x is Source => !!x)
                  : [];
                const unopened = resolved.filter((src) => !src.opened);
                /* Independence is counted from the groups, never from the
                   citation list. This is the single most load-bearing line in
                   the file. */
                const origins = new Set(
                  resolved.map((src) => src.independenceGroup)
                );

                const captures = claim
                  ? claim.evidenceIds
                      .map((id) => byEvidence.get(id))
                      .filter((x): x is Evidence => !!x)
                  : [];
                const direct = captures.filter((c) => c.directness === "DIRECT")
                  .length;

                /* The stored figure and the computed one are both printed. A
                   record claiming more independent origins than its sources
                   resolve to is overstating its own support, and that is a
                   finding the register must not smooth over. */
                const stated = claim ? claim.independentSupports : null;
                const disputed =
                  claim !== null &&
                  (stated !== origins.size || dangling.has(s.id));

                const latest = resolved
                  .map((src) => src.retrievedAt)
                  .filter((t): t is string => typeof t === "string")
                  .sort()
                  .pop();

                return (
                  <tr className="ep-ledger-row" key={s.id}>
                    <td className="ep-ledger-cell">
                      <div>{s.id}</div>
                      <div>{s.kind.replace(/_/g, " ")}</div>
                      <div>{s.text}</div>
                      <div>{s.support.replace(/_/g, " ")}</div>
                    </td>

                    <td className="ep-ledger-cell">
                      {claim ? (
                        resolved.length > 0 ? (
                          <ul>
                            {resolved.map((src) => (
                              <li key={src.id}>
                                <div>{src.locator}</div>
                                <div>{src.originator}</div>
                                <div>group: {src.independenceGroup}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          /* A claim citing ids the register cannot resolve is
                             a citation with nothing behind it. Saying so is
                             this cell's whole job. */
                          <p>
                            {claim.sourceIds.length} citation(s), none of which
                            resolve to a recorded source.
                          </p>
                        )
                      ) : (
                        <p>{evidencePath(s)}</p>
                      )}
                    </td>

                    <td className="ep-ledger-cell">
                      {claim ? (
                        resolved.length > 0 ? (
                          <>
                            <ul>
                              {resolved.map((src) => (
                                <li key={src.id}>
                                  {qualityLabel(src.quality)}
                                  {src.opened ? "" : " - not opened"}
                                </li>
                              ))}
                            </ul>
                            {unopened.length > 0 ? (
                              <p>
                                {unopened.length} of {resolved.length} never
                                opened by this system. An unopened citation is
                                decoration.
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <p>No source to grade.</p>
                        )
                      ) : (
                        <p>
                          Not applicable. This kind of statement carries no
                          source field.
                        </p>
                      )}
                    </td>

                    <td className="ep-ledger-cell">
                      {claim ? (
                        <>
                          <div>
                            {direct} direct, {captures.length - direct}{" "}
                            indirect
                          </div>
                          {captures.length === 0 ? (
                            <p>
                              {claim.evidenceIds.length > 0
                                ? `${claim.evidenceIds.length} capture id(s) recorded with no captured excerpt on file.`
                                : "Nothing has been captured from the source itself."}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p>
                          Not applicable. Not evidenced by quotation, but by{" "}
                          {s.kind === "OBSERVATION"
                            ? "a capture"
                            : s.kind === "INFERENCE"
                              ? "its premises"
                              : s.kind === "COUNTEREXAMPLE"
                                ? "a refuted assertion"
                                : "the path named in the source cell"}
                          .
                        </p>
                      )}
                    </td>

                    <td className="ep-ledger-cell">
                      {claim ? (
                        <>
                          <div>
                            {claim.sourceIds.length} citation(s),{" "}
                            {origins.size} independent origin
                            {origins.size === 1 ? "" : "s"}
                          </div>
                          {origins.size > 0 ? (
                            <div>groups: {[...origins].join(", ")}</div>
                          ) : null}
                          <div>
                            record states {stated} independent
                            {stated === 1 ? "" : "s"}
                          </div>
                          {disputed ? (
                            <p>
                              Discrepancy. The record claims {stated}{" "}
                              independent origin{stated === 1 ? "" : "s"} but
                              its sources resolve to {origins.size}
                              {dangling.has(s.id)
                                ? `, with ${dangling.get(s.id)} citation(s) resolving to no source`
                                : ""}
                              . Repetition is not corroboration.
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p>
                          Not applicable. This kind of statement cannot cite
                          sources, so it has no corroboration count and no
                          absence of one.
                        </p>
                      )}
                    </td>

                    <td className="ep-ledger-cell">
                      {claim ? (
                        claim.contradicting.length > 0 ? (
                          <ul>
                            {claim.contradicting.map((c, i) => (
                              <li key={`${i}-${c}`}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>None recorded. Not the same as none existing.</p>
                        )
                      ) : (
                        <p>Not applicable. Recorded on the statement, not here.</p>
                      )}
                    </td>

                    <td className="ep-ledger-cell">
                      {/* No `lastVerified` field exists on Source and this
                          component does not get to invent one. What it can
                          report honestly is when the source was retrieved and
                          whether anybody here opened it, so the cell names
                          which of the two it is showing rather than calling a
                          retrieval a verification. */}
                      {resolved.length > 0 ? (
                        <>
                          <div>
                            {latest
                              ? `${formatInstant(latest)} retrieved`
                              : "never retrieved"}
                          </div>
                          <div>
                            {unopened.length === 0
                              ? "opened by this system"
                              : `${unopened.length} never opened`}
                          </div>
                        </>
                      ) : (
                        <p>No source retrieved.</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          );
        })
      )}
    </table>
  );
}
