"use client";

import { useId, useState } from "react";
import type { synthesisInput } from "@/lib/epistemic/branches";
import { isProtected } from "@/lib/epistemic/branches";
import type { Branch } from "@/lib/epistemic/model";
import {
  HUMAN_GATE_RULES,
  HUMAN_GATE_VERDICTS,
  type HumanGateVerdict,
} from "@/lib/epistemic/taxonomy";

/**
 * components/epistem/CreativityGate.tsx -- WHERE THE HUMAN IS THE AUTHORITY.
 *
 * ASIANCODER.MD is unambiguous: "Do NOT allow the model to automatically
 * optimize away weird ideas." Every other surface in this system is
 * advisory; this one is authority. The six verbs are rendered from
 * HUMAN_GATE_VERDICTS and each carries the `means` and `effect` from
 * HUMAN_GATE_RULES, so the button a human is about to press says what
 * it will do in the words the contract used, rather than asking them to
 * remember what COMBINE entails.
 *
 * -- Why the rationale gate covers all six, not just PROTECT --------
 *
 * `HumanVerdict.rationale` is `z.string().min(1)` -- required on EVERY
 * verdict, because a verdict with no stated basis is an assertion. So
 * the form refuses to emit a verdict without one. PROTECT gets a
 * distinct prompt and a distinct reason string on top of that, and
 * gets the only filled treatment in the stylesheet, because it is the
 * control ASIANCODER.MD singles out.
 *
 * -- Why the exclusions are shown at all -----------------------------
 *
 * A protection the human cannot see taking effect is a protection they
 * cannot trust. So the `synthesisInput()` reading is passed in and
 * rendered verbatim, with each excluded branch marked PROTECTED or
 * KILLED in words: `synthesisInput()` EXCLUDES, it does not
 * deprioritise, because a deprioritised branch is one that gets
 * averaged in whenever the average is convenient.
 */

/* -- The availability type ------------------------------------------
   A discriminated union rather than `disabledReason?: string`, so a
   gate that has been disabled WITHOUT a reason does not typecheck. The
   requirement is not stylistic: "Disabled buttons explain WHY via
   visible text" is unenforceable when the reason is optional. */

type Availability =
  | { disabled?: false; disabledReason?: never }
  | { disabled: true; disabledReason: string };

export type CreativityGateProps = Availability & {
  /** The idea under judgment. Its verdict list is appended, never rewritten. */
  branch: Branch;
  /** The `synthesisInput()` reading for the whole branch set. */
  synthesis: ReturnType<typeof synthesisInput>;
  /** Called only with a non-empty rationale; the component never fabricates one. */
  onVerdict: (verdict: HumanGateVerdict, rationale: string) => void;
};

const RATIONALE_REQUIRED =
  "Disabled: record a rationale first. Every verdict must state what the human was looking at, so none can be recorded from an empty box.";

const PROTECTION_RATIONALE_REQUIRED =
  "Disabled: protection needs a rationale naming what automated improvement would destroy. Unjustified protection is indistinguishable from the optimisation this control exists to prevent.";

export function CreativityGate({
  branch,
  synthesis,
  onVerdict,
  disabled = false,
  disabledReason,
}: CreativityGateProps) {
  const rationaleId = useId();
  /* Trimmed on read as well as on submit: a field holding three spaces
     is the same emptiness as one holding nothing, and
     `z.string().min(1)` would accept the spaces. */
  const [draft, setDraft] = useState("");
  const rationale = draft.trim();
  const protectedBranch = isProtected(branch);

  return (
    <div className="ep-gate">
      {/* -- What protection currently excludes ----------------------
          Read first because it is the state that changes what the
          buttons below will do. */}
      <div className="ep-gate-protected" role="note">
        <p className="ep-gate-reason">
          <b>
            {protectedBranch ? "This branch is PROTECTED." : "This branch is not protected."}
          </b>{" "}
          {protectedBranch
            ? `${HUMAN_GATE_RULES.PROTECT_FROM_OPTIMIZATION.means} ${HUMAN_GATE_RULES.PROTECT_FROM_OPTIMIZATION.effect}`
            : "No human has removed it from the synthesis input, so the next automated pass is free to change it."}
        </p>

        {synthesis.excludedBecause.length === 0 ? (
          <p className="ep-gate-reason">
            Nothing is excluded from synthesis. Every branch on the board is
            available to the next pass.
          </p>
        ) : (
          <>
            <p className="ep-gate-reason">
              {synthesis.excluded.length}{" "}
              {synthesis.excluded.length === 1 ? "branch is" : "branches are"}{" "}
              excluded from the synthesis input, by human decision and not by any
              score.
            </p>
            <p className="ep-gate-reason">
              {synthesis.excluded.map((excluded, i) => (
                <span key={excluded.id}>
                  {excluded.id} - {excluded.strategy} -{" "}
                  {isProtected(excluded)
                    ? "PROTECTED FROM OPTIMIZATION"
                    : "KILLED"}
                  {i < synthesis.excluded.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            {/* Verbatim. These sentences are the audit trail for a
                decision that removed a branch from the next pass, and
                paraphrasing them is how a reader loses track of who
                decided what. */}
            {synthesis.excludedBecause.map((because) => (
              <p className="ep-gate-reason" key={because}>
                {because}
              </p>
            ))}
          </>
        )}
      </div>

      {/* -- The rationale -------------------------------------------
          Above the verbs rather than beside the protected one, because
          the schema makes it a precondition for all of them. */}
      <div>
        <label htmlFor={rationaleId} className="ep-gate-reason">
          <b>Rationale.</b> What were you looking at? Required on every verdict.
          For PROTECT FROM OPTIMIZATION, state what automated improvement would
          destroy.
        </label>
        {/* No inline width: app/epistem.css states that a missing class
           is a finding to raise, not a licence to style locally. The
           field will be narrower than the buttons until the stylesheet
           grows a class for it. */}
        <textarea
          id={rationaleId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
        />
      </div>

      {/* -- The six verbs ------------------------------------------
          Real buttons in DOM order, so Tab reaches them in the order
          they appear and Enter/Space fire them natively. No custom key
          handling: a hand-rolled shortcut is a second, worse keyboard
          path. PROTECT is placed last on purpose - it is the decision
          that removes an idea from the machine, and it should not be
          the thing a stray Enter lands on. */}
      {HUMAN_GATE_VERDICTS.map((verdict) => {
        const rule = HUMAN_GATE_RULES[verdict];
        const isProtection = rule.protected;
        const rationaleMissing = rationale.length === 0;

        /* Why this particular button is unavailable, resolved in the
           caller's terms first: if the parent disabled the whole gate,
           the parent's reason is the honest one and no local reason
           should be stacked on top of it. */
        const reason = disabled
          ? (disabledReason ?? "Disabled by the surrounding surface.")
          : rationaleMissing
            ? isProtection
              ? PROTECTION_RATIONALE_REQUIRED
              : RATIONALE_REQUIRED
            : null;

        return (
          <button
            key={verdict}
            type="button"
            className="ep-gate-verb"
            data-verdict={verdict}
            disabled={disabled || rationaleMissing}
            onClick={() => onVerdict(verdict, rationale)}
          >
            {/* Underscores are a type-level encoding, not something to
                show a human deciding on an idea. The `data-verdict`
                above stays exact so the stylesheet and any caller agree
                on the verb. */}
            {verdict.replace(/_/g, " ")}
            <span className="ep-gate-reason">{rule.means}</span>
            <span className="ep-gate-reason">{rule.effect}</span>
            {reason ? (
              <span className="ep-gate-reason">{reason}</span>
            ) : null}
          </button>
        );
      })}

      {/* -- What has already been decided ---------------------------
          Verdicts are appended and never erased, so the human can see
          whether they are about to contradict themselves.

          Deliberately NOT fenced in `.ep-gate-protected`: that box is
          the protection statement, and putting the verdict history
          inside it would read as part of the protection when it is the
          opposite -- the record of what a human decided. The parent
          `.ep-gate` grid gap supplies the separation. */}
      <div role="note">
        <p className="ep-gate-reason">
          <b>
            {branch.verdicts.length === 0
              ? "No verdict recorded on this branch."
              : `${branch.verdicts.length} verdict(s) recorded on this branch.`}
          </b>{" "}
          These are append-only. ASIANCODER.MD: never erase provenance.
        </p>
        {branch.verdicts.map((verdict) => (
          <p className="ep-gate-reason" key={verdict.id}>
            {verdict.verdict} by {verdict.actorId} at {verdict.at} -{" "}
            {verdict.rationale}
            {verdict.protectionReason
              ? ` Protection reason: ${verdict.protectionReason}`
              : ""}
          </p>
        ))}
      </div>
    </div>
  );
}
