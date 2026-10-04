"use client";

/**
 * The CONTROL surface — policies, execution, evaluations, adversarial
 * review, human overrides.
 *
 * ASIANCODER.MD's fourth of five surfaces, and the one place a human acts
 * on the system rather than reading it.
 */

import { useMemo, useState } from "react";
import {
  useEpistem,
  selectHealth,
  selectContamination,
  selectMemorySurface,
  selectOpenGuardSummary,
} from "@/lib/state/store";
import { AttackList } from "@/components/epistem/AttackList";
import { GuardList } from "@/components/epistem/GuardList";
import { HealthVector } from "@/components/epistem/HealthVector";
import { reviewerAgreement } from "@/lib/epistemic/adversarial";
import { MEMORY_NOW } from "@/lib/state/seed";
import {
  GUARD_EVENTS,
  REVIEWER_PROFILES,
  REVIEWER_TYPES,
  guardEventsDeclaredOnly,
  guardEventsImplemented,
  type ReviewerType,
} from "@/lib/epistemic/taxonomy";
import type { GuardEvent } from "@/lib/epistemic/taxonomy";

export function ControlSurface() {
  const guards = useEpistem((s) => s.guards);
  const attacks = useEpistem((s) => s.attacks);
  const statements = useEpistem((s) => s.statements);
  const traces = useEpistem((s) => s.traces);
  const memory = useEpistem((s) => s.memory);
  const branches = useEpistem((s) => s.branches);
  const acknowledge = useEpistem((s) => s.acknowledgeGuard);
  const resolve = useEpistem((s) => s.resolveAttack);
  const forkRun = useEpistem((s) => s.forkRun);
  const rollbackRun = useEpistem((s) => s.rollbackRun);

  const [reviewer, setReviewer] = useState<ReviewerType>("CAUSAL_INFERENCE_REVIEWER");

  /* Selectors name the slices they read rather than taking the whole
     store, so each dependency array below is correct by construction
     instead of by discipline. */
  const health = useMemo(
    () =>
      selectHealth({
        statements,
        guards,
        branches,
        memory,
        traceEventCount: traces[0]?.events.length,
      }),
    [statements, guards, branches, memory, traces]
  );
  const summary = useMemo(() => selectOpenGuardSummary(guards), [guards]);
  const contamination = useMemo(() => selectContamination(memory, guards), [memory, guards]);
  const mem = useMemo(() => selectMemorySurface(memory, guards, new Date(MEMORY_NOW)), [memory, guards]);
  const agreement = useMemo(() => reviewerAgreement(attacks), [attacks]);

  const open = attacks.filter((a) => a.status === "OPEN");

  return (
    <>
      {/* ── Policy ─────────────────────────────────────────────────────
          ASIANCODER.MD's NO HIDDEN AUTHORITY list, printed as the rules
          the domain model enforces. These are not aspirations in a
          document; each one corresponds to a type or a missing function
          somewhere in lib/epistemic/. */}
      <section className="section" aria-labelledby="policy-heading">
        <div className="section-head">
          <h2 className="section-title" id="policy-heading">
            What an agent cannot do
          </h2>
          <p className="section-kicker">change authority: human only</p>
        </div>

        <p className="section-lede">
          These are not warnings to the model. They are absent operations: a
          provider cannot find an API that rewrites provenance, because no
          such function is exported. Enforcement by absence is the only kind
          that survives a prompt.
        </p>

        <div className="register" role="table" aria-labelledby="policy-heading">
          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Policy</div>
            </div>
            <div className="register-cell" role="cell" data-field="Enforced by">
              <div className="register-provenance" style={{ maxWidth: "70ch" }}>
                Change system policy, rewrite evidence, alter provenance,
                delete a contradiction, modify a human decision, promote a
                hypothesis to a fact, or declare itself correct.
              </div>
            </div>
          </div>
          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">How</div>
            </div>
            <div className="register-cell" role="cell" data-field="Mechanism">
              <div className="register-provenance" style={{ maxWidth: "70ch" }}>
                Promotion runs through <span className="figure">gatePromotion()</span>,
                which refuses while an unacknowledged CRITICAL guard stands. Guards
                are acknowledged, never removed. Provenance is an append-only list
                whose display kind is always derived, so no field exists that can
                hold a wrong value. A promotion appends a CategoryTransition
                carrying its reason, its actor, and whether it was a promotion.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Adversarial review ───────────────────────────────────────── */}
      <section className="section" aria-labelledby="review-heading">
        <div className="section-head">
          <h2 className="section-title" id="review-heading">
            Hostile review
          </h2>
          <p className="section-kicker">
            <span className="figure">{open.length}</span> open ·{" "}
            {attacks.length} raised ·{" "}
            weighted <span className="figure">{agreement.effectiveWeight}</span>
          </p>
        </div>

        {/* Each reviewer declares a blind spot, and that is what stops ten
            reviewers becoming one argument counted ten times. */}
        {/* `.register` is a div-based table: role="table" on the container
            and role="row"/"cell" on the children. A real <tbody> cannot
            go inside it — the element has no table parent, so React logs
            "cannot be a child of" and the hydration fails outright. The
            rows carry their roles directly instead. */}
        <div className="register" role="table" aria-labelledby="reviewers-heading">
          <div className="register-head register--quad" role="row">
            <span role="columnheader">Reviewer</span>
            <span role="columnheader">Targets</span>
            <span role="columnheader">Blind spot</span>
            <span role="columnheader">Falsifies via</span>
          </div>
          {REVIEWER_TYPES.map((rt) => {
              const p = REVIEWER_PROFILES[rt];
              const mine = attacks.filter((a) => a.reviewerType === rt).length;
              return (
                <div className="register-row register--quad" role="row" key={rt}>
                  <div className="register-cell" role="cell">
                    <button
                      type="button"
                      className={reviewer === rt ? "btn-ghost" : undefined}
                      style={{ textAlign: "left" }}
                      onClick={() => setReviewer(rt)}
                      aria-pressed={reviewer === rt}
                    >
                      {rt.replace(/_/g, " ").toLowerCase()}{" "}
                      {mine > 0 ? (
                        <span className="figure">({mine})</span>
                      ) : null}
                    </button>
                  </div>
                  <div className="register-cell" role="cell" data-field="Targets">
                    <div className="register-provenance">{p.target}</div>
                  </div>
                  <div className="register-cell" role="cell" data-field="Blind spot">
                    <div className="register-provenance">{p.blindSpot}</div>
                  </div>
                  <div className="register-cell" role="cell" data-field="Mode">
                    <div className="register-provenance">
                      {p.falsifiesVia.map((m) => m.replace(/_/g, " ").toLowerCase()).join(", ")}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <AttackList attacks={attacks} agreement={agreement} />
      </section>

      {/* ── Resolution ──────────────────────────────────────────────────
          ATTACK_RESOLVED is a status, not a deletion. A resolved attack
          stays in the list and stays visible, because an attack that
          vanished is indistinguishable from an attack that was never
          raised. */}
      <section className="section" aria-labelledby="resolve-heading">
        <div className="section-head">
          <h2 className="section-title" id="resolve-heading">
            Resolve
          </h2>
          <p className="section-kicker">
            <span className="figure">{summary.unacknowledged}</span> guards ·{" "}
            <span className="figure">{open.length}</span> attacks
          </p>
        </div>

        <p className="section-lede">
          Both actions record a human decision and change no evidence.
          Acknowledging a guard does not make the finding wrong; resolving an
          attack does not remove it.
        </p>

        <div className="action-row">
          <button
            type="button"
            className="btn"
            disabled={summary.unacknowledged === 0}
            onClick={() => {
              for (const g of guards.filter((x) => !x.acknowledged)) {
                acknowledge(g.id, "human:local-operator");
              }
            }}
          >
            Acknowledge {summary.unacknowledged} guard
            {summary.unacknowledged === 1 ? "" : "s"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={open.length === 0}
            onClick={() => {
              for (const a of open) resolve(a.id, "ACCEPTED_RISK");
            }}
          >
            Accept risk on {open.length} open attack
            {open.length === 1 ? "" : "s"}
          </button>
          {summary.unacknowledged === 0 && open.length === 0 ? (
            <span className="ep-key" style={{ alignSelf: "center" }}>
              nothing outstanding
            </span>
          ) : null}
        </div>
      </section>

      {/* ── Evaluation ─────────────────────────────────────────────────
          Nine axes and no aggregate. There is deliberately no function in
          this codebase that combines them, and the axis question is
          printed next to each score because a number without its question
          is the thing ASIANCODER.MD forbids. */}
      <section className="section" aria-labelledby="health-heading">
        <div className="section-head">
          <h2 className="section-title" id="health-heading">
            Epistemic health
          </h2>
          <p className="section-kicker">nine axes · no overall score</p>
        </div>
        <HealthVector readings={health} />
      </section>

      {/* ── Memory ──────────────────────────────────────────────────────
          Stale items are visible as stale, and the kinds that must never
          expire are marked as such — a FAILED_IDEA that quietly expired
          would be a system that forgets it was wrong. */}
      <section className="section" aria-labelledby="memory-heading">
        <div className="section-head">
          <h2 className="section-title" id="memory-heading">
            Memory
          </h2>
          <p className="section-kicker">
            {mem.groups.length} kinds · <span className="figure">{mem.totals.stale}</span>{" "}
            stale · <span className="figure">{mem.totals.contaminated}</span>{" "}
            contaminated
          </p>
        </div>

        {/* Contamination is reported BEFORE the item list, because a clean
            bill of health that was computed from nothing is the failure
            this panel had: `totals.contaminated` was structurally pinned at
            zero because nothing recomputed it, so a memory whose origin
            statement carried a CRITICAL finding still reported "all inside
            their windows". */}
        {contamination.length > 0 ? (
          <div className="ep-conf-warn" style={{ marginBottom: "var(--s-3)" }}>
            <strong>
              {contamination.length} memory item
              {contamination.length === 1 ? " is" : "s are"} contaminated
            </strong>
            :{" "}
            {contamination.map((c) => (
              <span key={c.itemId}>
                {c.itemId} (from {c.originStatementId})
              </span>
            ))}
            . {contamination.length === 1 ? "It has" : "They have"} been marked
            and kept. Deleting a contradiction is on the forbidden-authority
            list, so nothing is removed — the conflict is preserved and made
            visible instead.
          </div>
        ) : (
          <p className="section-lede" style={{ marginBottom: "var(--s-3)" }}>
            No memory item is contaminated. This is recomputed from the
            current guard findings on every render, so it is a measurement
            rather than a default.
          </p>
        )}
        <div className="ep-ledger">
          {mem.groups.map((g) => (
            <div key={g.kind}>
              <div className="ep-key" style={{ padding: "var(--s-3) 0 var(--s-2)" }}>
                {g.kind.replace(/_/g, " ").toLowerCase()} ·{" "}
                <span className="figure">{g.items.length}</span>
              </div>
              {g.items.map((it) => (
                <div
                  key={it.item.id}
                  className="ep-stmt"
                  style={{
                    marginBottom: "var(--s-2)",
                    borderStyle: it.stale ? "dashed" : undefined,
                  }}
                >
                  <div className="ep-stmt-head">
                    <span className="ep-stmt-kind">{it.item.kind}</span>
                    {it.stale ? (
                      <span className="figure" style={{ color: "var(--ep-pending)" }}>
                        stale
                      </span>
                    ) : null}
                    {!g.decays ? (
                      <span className="ep-key">never expires</span>
                    ) : null}
                  </div>
                  <p className="ep-stmt-text" style={{ fontSize: "var(--fs-ui)" }}>
                    {it.item.text}
                  </p>
                  <p className="ep-stmt-meta">
                    {it.why}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Run control ─────────────────────────────────────────────────
          Fork and rollback are the two operations ASIANCODER.MD names
          for a debugger-shaped trace. Both APPEND rather than mutate:
          rollback truncates into a new trace and records the truncation,
          because undo that leaves no mark is indistinguishable from never
          having done it. */}
      {traces[0] ? (
        <section className="section" aria-labelledby="run-heading">
          <div className="section-head">
            <h2 className="section-title" id="run-heading">
              Run control
            </h2>
            <p className="section-kicker">
              <span className="figure">{traces.length}</span> traces ·{" "}
              <span className="figure">{traces[0].events.length}</span> events
            </p>
          </div>

          <p className="section-lede">
            Forking at an event copies the prefix verbatim and records where
            it diverged, so a diff can prove a fork changed only what it
            claimed to. Rollback keeps the original intact.
          </p>

          <div className="action-row">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                type="button"
                className="btn-ghost"
                disabled={i > traces[0].events.length}
                onClick={() => forkRun(traces[0].id, i, `${traces[0].id}-fork-${i}`)}
              >
                Fork at event {i}
              </button>
            ))}
            <button
              type="button"
              className="btn-ghost"
              disabled={traces[0].events.length === 0}
              onClick={() =>
                rollbackRun(
                  traces[0].id,
                  traces[0].events.length - 1,
                  "operator rolled back the tail",
                  "human:local-operator"
                )
              }
            >
              Roll back one event
            </button>
          </div>

          {traces.length > 1 ? (
            <p className="section-lede" style={{ marginTop: "var(--s-3)" }}>
              <span className="figure">{traces.length - 1}</span> derived trace
              {traces.length - 1 === 1 ? "" : "s"} now exist. Every one is
              append-only; the seed trace is unchanged.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ── Guard events, exhaustively ─────────────────────────────────
          All eighteen declared events with their response. An event list
          with only the ones currently firing hides the size of the
          vocabulary, and a reader who cannot see the vocabulary cannot
          know what was checked for. */}
      <section className="section" aria-labelledby="events-heading">
        <div className="section-head">
          <h2 className="section-title" id="events-heading">
            The guard vocabulary
          </h2>
          <p className="section-kicker">
            <span className="figure">{GUARD_EVENTS.length}</span> declared ·{" "}
            <span className="figure">{guardEventsImplemented().length}</span>{" "}
            detected
          </p>
        </div>
        <GuardList guards={guards} />

        {/* The honest coverage statement.

            The previous version hardcoded "18 declared" — the number was
            wrong, GUARD_EVENTS has 16 members — and then told the reader
            "the rest are checked and did not fire on this project". Four of
            them had no detector at all, so that sentence was a fabricated
            coverage claim sitting on the one panel whose entire job is
            honest coverage.

            It now names what is declared, what is detected, and which of the
            declared events have nothing watching them yet. */}
        <p className="section-lede" style={{ marginTop: "var(--s-3)" }}>
          <span className="figure">{GUARD_EVENTS.length}</span> events are
          declared. <span className="figure">{guardEventsImplemented().length}</span>{" "}
          have a detector and were run:{" "}
          {summary.events.length > 0
            ? summary.events
                .map((e: GuardEvent) => e.replace(/_/g, " ").toLowerCase())
                .join(", ")
            : "none fired on this project"}
          .
        </p>

        {guardEventsDeclaredOnly().length > 0 ? (
          <p className="ep-conf-warn" style={{ marginTop: "var(--s-2)" }}>
            <strong>
              {guardEventsDeclaredOnly().length} declared event
              {guardEventsDeclaredOnly().length === 1 ? " is" : "s are"} not
              detected yet
            </strong>
            :{" "}
            {guardEventsDeclaredOnly()
              .map((e) => e.replace(/_/g, " ").toLowerCase())
              .join(", ")}
            . Nothing checks for {guardEventsDeclaredOnly().length === 1 ? "it" : "them"}, so
            the absence of a finding below is not evidence of anything.
            {GUARD_EVENTS.length !== guardEventsImplemented().length + guardEventsDeclaredOnly().length
              ? " The counts do not reconcile, which is a bug in the vocabulary."
              : ""}
          </p>
        ) : null}
      </section>
    </>
  );
}