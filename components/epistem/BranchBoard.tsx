import type { BranchDistance, DiversityReading } from "@/lib/epistemic/branches";
import { allDistances, isProtected } from "@/lib/epistemic/branches";
import type { Branch } from "@/lib/epistemic/model";
import { BRANCH_STRATEGY_RULES } from "@/lib/epistemic/taxonomy";

/**
 * components/epistem/BranchBoard.tsx -- THE ANTI-MEDIAN SURFACE.
 *
 * ASIANCODER.MD's ANTI-MEDIAN ENGINE asks for five genuinely different
 * hypotheses BEFORE synthesis and says plainly that a normal LLM
 * converges toward the statistically common answer. The engine in
 * branches.ts does the measuring; this file's job is to make the
 * measurement impossible to skip past.
 *
 * -- Why the board leads with the finding and not the branches ------
 *
 * A grid of five attractive cards is the exact shape the contract warns
 * about: it looks like diversity while five near-identical paragraphs
 * sit underneath. So the FIRST thing on this surface is `reading.finding`
 * in words, followed by the collapsed pairs, and only then the cards.
 * A reader who stops after two lines has still been told whether the
 * diversity is real.
 *
 * A collapsed pair is given the same weight as a branch, not less. Two
 * branches sharing a mechanism is a finding about the work, and burying
 * it under the cards would be the presentational collapse the module
 * exists to detect.
 *
 * Every pair is shown on all four axes. branches.ts declines to average
 * them, because a branch can be lexically distant and mechanistically
 * identical, and one averaged number erases exactly the thing worth
 * knowing. `verdict` travels with the pair for the same reason.
 *
 * The method is printed. ASIANCODER.MD forbids a number nobody can
 * interrogate ("Quality: 92%" with nothing behind it), and these
 * distances are set distances over content words with no model behind
 * them -- which means they are auditable AND blind to synonyms. Both
 * halves are on the surface, because a shallow measure that does not
 * admit its depth is the misleading kind.
 *
 * Pure, no `"use client"`: a projection of `branches` plus a reading.
 */

/** Pair identity, used to list a pair exactly once across two sections. */
function pairKey(d: BranchDistance): string {
  return `${d.a}--${d.b}`;
}

/** Fixed precision, always two places, so a column of figures lines up. */
function fmt(n: number): string {
  return n.toFixed(2);
}

export function BranchBoard({
  branches,
  reading,
  /** Pass distances you already hold; otherwise they are computed here. */
  distances,
}: {
  branches: readonly Branch[];
  reading: DiversityReading;
  distances?: readonly BranchDistance[];
}) {
  /* Derive rather than trust: if the caller did not hold the pairs,
     compute them from the branches on the board. The reading's own
     `collapsedPairs` stays authoritative for WHICH pairs collapsed,
     because that is a judgement, not a recomputation. */
  const allPairs = distances ?? allDistances(branches);
  const collapsedKeys = new Set(reading.collapsedPairs.map(pairKey));
  const otherPairs = allPairs.filter((d) => !collapsedKeys.has(pairKey(d)));

  /* Keyed by the plain string form of the id, because
     `strategyCompliance[].id` is typed `string` while `Branch.id` is
     branded. Widening the key here is what lets a compliance entry be
     matched back to its card without a cast. */
  const byId = new Map<string, Branch>(branches.map((b) => [b.id, b]));

  return (
    <div>
      {/* -- The reading --------------------------------------------
          A bordered panel rather than a line of small type: the finding
          is the argument of this surface and it is read first. */}
      <div className="ep-branch-card">
        <p className="ep-branch-field">
          <b>Finding</b>
          {reading.finding}
        </p>
        <p className="ep-branch-field">
          <b>Diversity score</b>
          {fmt(reading.score)} / 1.00. This is the mean pairwise MECHANISM
          distance with a penalty for collapsed pairs. It is not an average of the
          four axes: an average would let a branch buy diversity with vocabulary,
          which is the cheat this measurement exists to prevent.
        </p>
        <p className="ep-branch-field">
          <b>Mean mechanism distance</b>
          {fmt(reading.meanMechanismDistance)}. The honest measure. Rephrasing
          drives it toward zero.
        </p>
        <p className="ep-branch-field">
          <b>Mean conceptual distance</b>
          {fmt(reading.meanConceptualDistance)}. Whole-branch, across thesis,
          mechanism, assumptions and novel contribution.
        </p>
        <p className="ep-branch-field">
          <b>Method</b>
          Set distance over content words with a small stop-word list and plural
          stripping. No embeddings and no model: these numbers are auditable by
          hand, and equally they CANNOT see that two different phrases name one
          idea. They catch five branches built from one vocabulary, which is the
          common failure, and they will not catch a careful synonym.
        </p>
      </div>

      {/* -- Collapsed pairs -----------------------------------------
          Drawn before the cards. A pair that shares a mechanism is a
          statement about the whole branch set, and it loses its force
          if it has to be found at the bottom of a page. */}
      <div className="ep-branch">
        {reading.collapsedPairs.map((pair) => (
          <div className="ep-branch-collapsed" key={pairKey(pair)}>
            <p className="ep-branch-field">
              <b>Collapsed pair</b>
              {pair.a} and {pair.b} share a mechanism. Counting them as two
              branches is what makes apparent diversity look real.
            </p>

            <DistanceGrid pair={pair} />

            <p className="ep-branch-field">
              <b>Verdict</b>
              {pair.verdict}
            </p>
          </div>
        ))}
      </div>

      {/* Every other pair, on the same four axes. A board that only
          shows its failures would leave the reader unable to tell a
          healthy set from an unmeasured one. */}
      {otherPairs.map((pair) => (
        <div key={pairKey(pair)}>
          <p className="ep-branch-field">
            <b>Distinct pair</b>
            {pair.a} and {pair.b}. {pair.verdict}
          </p>
          <DistanceGrid pair={pair} />
        </div>
      ))}

      {/* -- Strategy compliance -------------------------------------
          All entries, always, keyed by branch id as the reading emits
          them. A compliance check that silently drops the branches it
          did not like is an approval, and this is the Quality Bar item
          4 question: can a set of agents converge on one mediocre idea
          while every card looks plausible? */}
      <div className="ep-branch">
        {reading.strategyCompliance.map((entry) => (
          <div
            className="ep-branch-card"
            data-compliant={entry.compliant}
            key={entry.id}
          >
            <p className="ep-branch-field">
              {/* Word AND mark. Colour is a wash on this card and the
                  mark is what survives a monochrome render, so the
                  verdict is never carried by hue. */}
              <b>
                {entry.compliant ? "+ COMPLIANT" : "X NOT COMPLIANT"}
                {byId.has(entry.id) ? "" : " (branch not on this board)"}
              </b>
              {entry.id} - {entry.strategy}, which promises to differ on{" "}
              {entry.mustDifferOn}. Furthest from any other branch on that axis:{" "}
              {fmt(entry.bestDistanceOn)}.
            </p>
            <p className="ep-branch-field">{entry.why}</p>
          </div>
        ))}
      </div>

      {/* -- The branches themselves ---------------------------------
          ASIANCODER.MD lists six things each branch must expose, and
          all six are here, with `differsBecause` last because it is the
          field that answers "is this actually an alternative". */}
      <div className="ep-branch">
        {branches.map((branch) => {
          const rule = BRANCH_STRATEGY_RULES[branch.strategy];
          const protectedBranch = isProtected(branch);
          const compliance = reading.strategyCompliance.find(
            (c) => c.id === branch.id,
          );

          return (
            <article
              className="ep-branch-card"
              data-protected={protectedBranch}
              data-strategy={branch.strategy}
              key={branch.id}
            >
              <p className="ep-branch-strategy">
                {branch.id} - {branch.strategy}
              </p>

              <p className="ep-branch-field">
                <b>Mandate</b>
                {rule.mandate}
              </p>

              {/* Repeated in words rather than left to the stylesheet's
                  ::after. Generated content is the channel assistive
                  tech announces most reliably, and a protection that a
                  screen reader cannot read is not a protection. */}
              <p className="ep-branch-field">
                <b>Protection</b>
                {protectedBranch
                  ? "PROTECTED FROM OPTIMIZATION - a human removed this from every automated synthesis and simplification pass."
                  : "Not protected. This branch is available to synthesis."}
              </p>

              <p className="ep-branch-field">
                <b>Thesis</b>
                {branch.thesis}
              </p>

              {/* Assumptions are numbered because ASIANCODER.MD's fork
                  workflow is phrased as "change only assumption #4", which
                  needs an ordinal to mean anything. `<br>` rather than a
                  list, because this stylesheet sets no list metrics and a
                  UA `ul` here would indent the register by 40px for
                  nothing. */}
              <p className="ep-branch-field">
                <b>Assumptions</b>
                {branch.assumptions.map((assumption, i) => (
                  <span key={assumption}>
                    {i + 1}. {assumption}
                    {i < branch.assumptions.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>

              <p className="ep-branch-field">
                <b>Mechanism</b>
                {branch.mechanism}
              </p>

              <p className="ep-branch-field">
                <b>Failure mode</b>
                {branch.failureMode}
              </p>

              <p className="ep-branch-field">
                <b>Novel contribution</b>
                {branch.novelContribution}
              </p>

              <p className="ep-branch-field">
                <b>Differs because</b>
                {branch.differsBecause}
              </p>

              {compliance ? (
                <p className="ep-branch-field">
                  <b>Strategy check</b>
                  {compliance.compliant ? "+ COMPLIANT: " : "X NOT COMPLIANT: "}
                  {compliance.why}
                </p>
              ) : (
                <p className="ep-branch-field">
                  <b>Strategy check</b>
                  NOT EVALUATED - this branch does not appear in the diversity
                  reading, so nothing claims it honours its {branch.strategy}{" "}
                  label.
                </p>
              )}

              {/* Verdicts are appended, never overwritten, so the
                  history of a human changing their mind is visible. */}
              <p className="ep-branch-field">
                <b>Human verdicts</b>
                {branch.verdicts.length === 0
                  ? "none recorded. No human has ruled on this branch."
                  : branch.verdicts.map((verdict, i) => (
                      <span key={verdict.id}>
                        {i + 1}. {verdict.verdict} by {verdict.actorId} at{" "}
                        {verdict.at} - {verdict.rationale}
                        {verdict.protectionReason
                          ? ` Protection reason: ${verdict.protectionReason}`
                          : ""}
                        {i < branch.verdicts.length - 1 ? <br /> : null}
                      </span>
                    ))}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/**
 * All four axes, four cells, always four.
 *
 * `ep-branch-dist` is a four-column grid in the stylesheet, which is the
 * stylesheet asserting that these four are one unit of measurement. The
 * `lexical` axis is included even though ASIANCODER.MD names only three
 * distances, because it is the one that separates "rephrased" from
 * "redone" and it is the axis a reader is most tempted to mistake for
 * novelty.
 */
function DistanceGrid({ pair }: { pair: BranchDistance }) {
  return (
    <div className="ep-branch-dist">
      <div>
        <span className="ep-key">Conceptual</span>
        <span>{fmt(pair.conceptual)}</span>
      </div>
      <div>
        <span className="ep-key">Mechanism</span>
        <span>{fmt(pair.mechanism)}</span>
      </div>
      <div>
        <span className="ep-key">Assumption</span>
        <span>{fmt(pair.assumption)}</span>
      </div>
      <div>
        <span className="ep-key">Lexical</span>
        <span>{fmt(pair.lexical)}</span>
      </div>
    </div>
  );
}
