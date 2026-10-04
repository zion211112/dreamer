"use client";

/**
 * The INTELLIGENCE surface — agent graph, reasoning artifacts, hypotheses,
 * alternatives, and the differential.
 *
 * ASIANCODER.MD's third of five surfaces. The differential is here because
 * it belongs next to the branches: the whole question a reader arrives with
 * on this page is "what are the real options", and the answer is worthless
 * without seeing which of them the evidence actually reaches.
 */

import { useMemo, useState } from "react";
import {
  useEpistem,
  selectDiversity,
  selectDifferential,
  selectSynthesisInput,
} from "@/lib/state/store";
import { BranchBoard } from "@/components/epistem/BranchBoard";
import { CreativityGate } from "@/components/epistem/CreativityGate";
import { Differential } from "@/components/epistem/Differential";
import { LoopTimeline } from "@/components/epistem/LoopTimeline";
import { runLoop, reviewerAgreement } from "@/lib/epistemic/adversarial";
import { allDistances } from "@/lib/epistemic/branches";
import type { HumanGateVerdict } from "@/lib/epistemic/taxonomy";

export function IntelligenceSurface() {
  const branches = useEpistem((s) => s.branches);
  const statements = useEpistem((s) => s.statements);
  const attacks = useEpistem((s) => s.attacks);
  const guards = useEpistem((s) => s.guards);
  const traces = useEpistem((s) => s.traces);
  const addVerdict = useEpistem((s) => s.addVerdict);

  const [selected, setSelected] = useState<string>(
    "demand-claim-1"
  );
  const [branchId, setBranchId] = useState<string>(branches[0]?.id ?? "");

  const diversity = useMemo(() => selectDiversity(branches), [branches]);
  const synthesis = useMemo(() => selectSynthesisInput(branches), [branches]);
  const distances = useMemo(() => allDistances(branches), [branches]);
  const agreement = useMemo(() => reviewerAgreement(attacks), [attacks]);

  const statement = statements.find((s) => s.id === selected);
  const differential = useMemo(
    () => (statement ? selectDifferential(statements, guards, statement.id) : null),
    [statement, statements, guards]
  );

  const loop = useMemo(
    () => (traces[0] ? runLoop(traces[0]) : null),
    [traces]
  );

  const branch = branches.find((b) => b.id === branchId) ?? branches[0];

  return (
    <>
      {/* ── The differential ──────────────────────────────────────────
          ASIANCODER.MD calls this "one of the most important screens".
          It goes first because it is the reason the other four pages
          exist: four lanes that disagree, shown side by side, so a reader
          can see a narrative outrun its evidence without having to work
          it out. */}
      <section className="section" aria-labelledby="differential-heading">
        <div className="section-head">
          <h2 className="section-title" id="differential-heading">
            Epistemic differential
          </h2>
          <p className="section-kicker">four lanes, never reconciled</p>
        </div>

        <p className="section-lede">
          What the model said, what the evidence supports, what this system
          can verify, and what remains unknown. The lanes disagree by design —
          a view that merged them would have destroyed the finding before you
          could see it.
        </p>

        <div className="action-row" style={{ marginBottom: "var(--s-3)" }}>
          {statements
            .filter((s) => s.kind === "CLAIM" || s.kind === "INFERENCE")
            .map((s) => (
              <button
                key={s.id}
                type="button"
                className={selected === s.id ? "btn" : "btn-ghost"}
                onClick={() => setSelected(s.id)}
              >
                {s.text.slice(0, 52)}
                {s.text.length > 52 ? "\u2026" : ""}
              </button>
            ))}
        </div>

        {differential && statement ? (
          <>
            <div className="ep-stmt" style={{ marginBottom: "var(--s-3)" }}>
              <div className="ep-stmt-head">
                <span className="ep-stmt-kind">{statement.kind}</span>
                <span className="figure">{statement.id}</span>
              </div>
              <p className="ep-stmt-text">{statement.text}</p>
            </div>
            <Differential differential={differential} />
          </>
        ) : (
          <p className="section-lede">No claim selected.</p>
        )}
      </section>

      {/* ── The anti-median board ───────────────────────────────────── */}
      <section className="section" aria-labelledby="branches-heading">
        <div className="section-head">
          <h2 className="section-title" id="branches-heading">
            Alternatives
          </h2>
          <p className="section-kicker">
            <span className="figure">{diversity.score.toFixed(2)}</span>{" "}
            diversity · {branches.length} branches
          </p>
        </div>
        <BranchBoard branches={branches} reading={diversity} distances={distances} />
      </section>

      {/* ── The human gate ────────────────────────────────────────────
          Before synthesis, and above it. ASIANCODER.MD is explicit that
          the model may critique an idea but must not automatically
          converge it, and this is the only place that rule can be
          exercised. */}
      <section className="section" aria-labelledby="gate-heading">
        <div className="section-head">
          <h2 className="section-title" id="gate-heading">
            Human creativity gate
          </h2>
          <p className="section-kicker">
            {synthesis.excluded.length} excluded from synthesis
          </p>
        </div>

        <p className="section-lede">
          The human is the authority over creative direction. A branch marked
          PROTECT FROM OPTIMIZATION is removed from every automated pass
          permanently — excluded rather than deprioritised, because
          deprioritised still gets averaged in when averaging is convenient.
        </p>

        <div className="action-row" style={{ marginBottom: "var(--s-3)" }}>
          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              className={branchId === b.id ? "btn" : "btn-ghost"}
              onClick={() => setBranchId(b.id)}
            >
              {b.strategy.replace(/_/g, " ").toLowerCase()}
              {b.protectedFromOptimization ? " · protected" : ""}
            </button>
          ))}
        </div>

        {branch ? (
          <CreativityGate
            branch={branch}
            synthesis={synthesis}
            onVerdict={(verdict: HumanGateVerdict, rationale: string) =>
              addVerdict(branch.id, {
                id: `verdict-${branch.verdicts.length + 1}`,
                verdict,
                actorId: "human:local-operator",
                at: new Date().toISOString(),
                rationale,
                protectionReason:
                  verdict === "PROTECT_FROM_OPTIMIZATION"
                    ? rationale
                    : undefined,
              })
            }
          />
        ) : (
          <p className="section-lede">No branch selected.</p>
        )}
      </section>

      {/* ── The loop, and what attacked the work ─────────────────────── */}
      <section className="section" aria-labelledby="loop-heading">
        <div className="section-head">
          <h2 className="section-title" id="loop-heading">
            Adversarial loop
          </h2>
          <p className="section-kicker">
            {loop?.converged ? "converged" : "incomplete"} ·{" "}
            <span className="figure">{attacks.length}</span> attacks ·{" "}
            weighted <span className="figure">{agreement.effectiveWeight}</span>
          </p>
        </div>
        {loop ? <LoopTimeline outcome={loop} /> : <p className="section-lede">No trace.</p>}
      </section>
    </>
  );
}