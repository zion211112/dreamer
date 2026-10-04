import type { ReviewerAgreement } from "@/lib/epistemic/adversarial";
import type { Attack } from "@/lib/epistemic/model";
import {
  REVIEWER_PROFILES,
  type GuardSeverity,
} from "@/lib/epistemic/taxonomy";

/**
 * components/epistem/AttackList.tsx -- HOSTILE REVIEW, AS A REGISTER.
 *
 * ASIANCODER.MD's HOSTILE REVIEW section is a list of things the UI must
 * explicitly show: ATTACK, TARGET, SEVERITY, COUNTEREVIDENCE, REQUIRED
 * CHANGE, STATUS. Every one of those six is a field on `Attack`, so this
 * component renders all six and does not summarise any of them away. A
 * register that collapses them is the thing the section was written to
 * forbid.
 *
 * -- The number this component refuses to print ---------------------
 *
 * ASIANCODER.MD's own failure is CONSENSUS AMPLIFICATION: several
 * reviewers restating one argument until it looks corroborated.
 * `reviewerAgreement()` therefore returns an `effectiveWeight` after
 * discounting reviewers who share a declared blind spot, and the raw
 * count is deliberately not shown here. Nor is `consensus`, which
 * embeds that count inside its sentence -- printing it would smuggle the
 * number back in through a template string. Nothing is lost: every
 * attack in the group is listed immediately below, which is a better
 * account of "what they agreed on" than a truncated summary would be.
 *
 * The blind spot is the load-bearing text. Each reviewer row carries
 * REVIEWER_PROFILES[type].blindSpot, so a reader can see that the two
 * reviewers who agree hardest are the two who cannot see the same
 * thing. A panel that hides its own weaknesses produces exactly the
 * manufactured consensus this module exists to catch.
 *
 * Pure, no `"use client"`: no state, no handlers.
 */

/* Severity is a word AND a mark. The stylesheet colours the chip and
   draws a heavier rule for CRITICAL, but a chip whose only difference
   is a hue is a chip that fails in monochrome, so each severity also
   carries a count of punctuation that survives colour removal. */
const SEVERITY_MARK: Record<GuardSeverity, string> = {
  CRITICAL: "!!",
  MATERIAL: "!",
  ADVISORY: "~",
};

/* Status is stated, never inferred from the stylesheet's opacity rule.
   A row at 60% opacity tells a sighted reader something; the word is
   what tells everyone else, and ASIANCODER.MD requires STATUS shown. */
function statusSentence(status: Attack["status"]): string {
  switch (status) {
    case "OPEN":
      return "no response recorded; this attack still blocks its stage";
    case "ADDRESSED":
      return "a response was recorded against it";
    case "ACCEPTED_RISK":
      return "acknowledged and carried deliberately, not answered";
    case "WITHDRAWN":
      return "withdrawn by the reviewer; kept here because erasure is not a verb in this system";
  }
}

export function AttackList({
  attacks,
  agreement,
}: {
  attacks: readonly Attack[];
  /**
   * Optional on purpose. A caller holding a bare attack list has not
   * run `reviewerAgreement()`, and this component will not fabricate an
   * independence judgement to fill the space -- it prints the count of
   * what it was given and says the check has not been run.
   */
  agreement?: ReviewerAgreement;
}) {
  /* Zero attacks is not an empty box. It is the exact condition
     `gateStage("ATTACK")` refuses to let the loop leave under, so the
     empty state is written as the blocker it is. */
  if (attacks.length === 0) {
    return (
      <div className="ep-atk">
        <p>
          <b>No attack has been raised.</b> The adversarial loop refuses to leave
          ATTACK on an empty register, so this is a blocked stage rather than a
          quiet one. ASIANCODER.MD requires that each reviewer be asked what would
          make the answer fail, never whether it looks good.
        </p>
      </div>
    );
  }

  return (
    <div className="ep-atk">
      {agreement ? (
        <div className="ep-atk-item">
          <p className="ep-atk-sev">Reviewer agreement</p>

          <p>
            <b>
              Effective weight {agreement.effectiveWeight}{" "}
              {agreement.effectiveWeight === 1 ? "independent objection" : "independent objections"}.
            </b>{" "}
            This is the weight after reviewers who share a declared falsification
            mode were discounted. The raw reviewer count is not printed: a panel
            that reports &quot;4 of 10 reviewers agreed&quot; is the consensus
            amplification the contract forbids.
          </p>

          {agreement.caveat ? (
            /* Verbatim. Paraphrasing a caveat weakens the one sentence
               doing the work of saying these voices are not separate. */
            <p>{agreement.caveat}</p>
          ) : (
            <p>
              No shared blind spot was detected among the attacks on a single
              target, so no discount was applied to this reading.
            </p>
          )}
        </div>
      ) : (
        <div className="ep-atk-item">
          <p>
            <b>Independence not checked.</b> {attacks.length}{" "}
            {attacks.length === 1 ? "attack is" : "attacks are"} listed, but no{" "}
            <code>reviewerAgreement()</code> reading was supplied, so nothing here
            says whether they are independent objections or one argument made
            repeatedly.
          </p>
        </div>
      )}

      {attacks.map((attack) => {
        const profile = REVIEWER_PROFILES[attack.reviewerType];

        return (
          <article
            className="ep-atk-item"
            data-severity={attack.severity}
            data-status={attack.status}
            key={attack.id}
          >
            <p className="ep-atk-sev">
              {SEVERITY_MARK[attack.severity]} {attack.severity}
            </p>

            <p>
              {attack.reviewerType} / attacks {attack.targetStatementId} / mode{" "}
              {attack.mode} / status {attack.status} -{" "}
              {statusSentence(attack.status)}
            </p>

            {/* What this reviewer was pointed at, and what it cannot see.
                The blind spot is what makes the agreement above
                calculable, so it travels with the attack rather than
                living once in a separate table nobody reads. */}
            <p>
              <b>Pointed at: </b>
              {profile.target}
            </p>
            <p>
              <b>Blind spot: </b>
              {profile.blindSpot}
            </p>

            {/* Quoted, because an attack on a paraphrase cannot be
                assessed. ASIANCODER.MD: attacks target spans. */}
            <p className="ep-atk-target">&quot;{attack.targetQuote}&quot;</p>

            {/* Labelled, because ASIANCODER.MD enumerates ATTACK as one
                of six things this register must show by name, and an
                unlabelled paragraph three lines below a severity chip is
                not a heading anyone is reading as one. */}
            <p>
              <b>Attack: </b>
              {attack.body}
            </p>

            {attack.counterEvidence ? (
              <p>
                <b>Counter-evidence: </b>
                {attack.counterEvidence}
              </p>
            ) : (
              /* Absence stated, not omitted. UNKNOWN is a valid
                 terminal state and UNKNOWN_SUPPRESSION is one of the
                 contract's diagnostics; a reviewer who brought no
                 counter-evidence has still made a claim about the
                 world, and saying so is the honest rendering. */
              <p>
                <b>Counter-evidence: </b>
                none supplied. The reviewer objected without showing what would
                survive the objection.
              </p>
            )}

            <p className="ep-atk-req">{attack.requiredChange}</p>

            <p>
              raised {attack.raisedAt}
              {attack.resolvedAt ? ` / resolved ${attack.resolvedAt}` : ""}
              {attack.reviewerAgentId ? ` / agent ${attack.reviewerAgentId}` : ""}
            </p>
          </article>
        );
      })}
    </div>
  );
}
