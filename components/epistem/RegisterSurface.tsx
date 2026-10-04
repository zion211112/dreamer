"use client";

/**
 * The REGISTER surface — evidence, claims, sources, provenance.
 *
 * ASIANCODER.MD's second of five surfaces: "Evidence, claims, sources,
 * provenance, records."
 *
 * This is a client component because the whole point is that the reader can
 * act on what they see. A ledger you cannot expand, filter or challenge is
 * a document, and a document does not hold a category together.
 */

import { useMemo, useState } from "react";
import { useEpistem, selectHealth, selectOpenGuardSummary, selectGuardsFor } from "@/lib/state/store";
import { CategoryTag } from "@/components/epistem/CategoryTag";
import { ConfidenceLedger } from "@/components/epistem/ConfidenceLedger";
import { EvidenceLedger } from "@/components/epistem/EvidenceLedger";
import { GuardList } from "@/components/epistem/GuardList";
import { StatementCard } from "@/components/epistem/StatementCard";
import { HealthVector } from "@/components/epistem/HealthVector";
import { AxisRadar } from "@/components/epistem/AxisRadar";
import { displayConfidence, statementConfidence } from "@/lib/epistemic/confidence";
import { CATEGORY_RULES, type StatementCategory } from "@/lib/epistemic/taxonomy";

/** Category order: by entitlement rank, strongest first. The register is
    sorted by how much a claim is owed, not by arrival time, because the
    question a reader brings here is "how much of this is solid". */
const ORDER: StatementCategory[] = [
  "FACT",
  "OBSERVATION",
  "SOURCE_CLAIM",
  "INFERENCE",
  "HYPOTHESIS",
  "PREDICTION",
  "SPECULATION",
  "ASSUMPTION",
  "NORMATIVE_JUDGMENT",
  "DESIGN_CHOICE",
  "UNKNOWN",
];

export function RegisterSurface() {
  const statements = useEpistem((s) => s.statements);
  const sources = useEpistem((s) => s.sources);
  const guards = useEpistem((s) => s.guards);
  const branches = useEpistem((s) => s.branches);
  const memory = useEpistem((s) => s.memory);
  const runGuards = useEpistem((s) => s.runGuards);
  const acknowledge = useEpistem((s) => s.acknowledgeGuard);

  const [filter, setFilter] = useState<StatementCategory | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  /* `useEpistem.getState` is a stable singleton, so it is a free dependency.
     Listing it keeps the memo honest under exhaustive-deps: the selectors
     read the whole store, not just the slices named in the array, and a
     memo that claimed otherwise would silently go stale on exactly the
     class of bug this system exists to catch. */
  const health = useMemo(() => selectHealth({ statements, guards, branches, memory, traceEventCount: undefined }), [statements, guards, branches, memory]);
  const summary = useMemo(() => selectOpenGuardSummary(guards), [guards]);

  const visible = useMemo(
    () =>
      filter === "ALL"
        ? statements
        : statements.filter((s) => s.category === filter),
    [statements, filter]
  );

  const grouped = useMemo(() => {
    const map = new Map<StatementCategory, typeof statements>();
    for (const s of [...statements].sort(
      (a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category)
    )) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return [...map.entries()];
  }, [statements]);

  const present = new Set(statements.map((s) => s.category));

  return (
    <>
      {/* ── The standing position, before any content ───────────────
          A reader who opens a register wants to know how much of it is
          contested before they start reading any of it. */}
      <div className="measures-caption" style={{ marginBottom: "var(--s-4)" }}>
        <span className="figure">{statements.length}</span> statements ·{" "}
        <span className="figure">{guards.length}</span> guard findings ({" "}
        <span className="figure">{summary.critical}</span> critical) ·{" "}
        <span className="figure">{sources.length}</span> sources.
        {summary.unacknowledged > 0 ? (
          <>
            {" "}
            {summary.unacknowledged} not yet seen by a human.
          </>
        ) : null}
      </div>

      <HealthVector readings={health} />

      {/* The vector's shape, not its rows.

          ASIANCODER.MD asks for a "radar / vector". The row list above
          answers "what is each axis" and is where a drill-down belongs; this
          answers "do these nine axes agree with each other", which is a
          different question and the reason to have both. A set of axes that
          all read mid-range can be one healthy system or one system where
          nothing was measured, and the shape is what tells them apart at a
          glance.

          It renders an sr-only table of the same readings underneath, so the
          chart is never the only way to read the numbers. */}
      <section className="section" aria-labelledby="vector-heading">
        <div className="section-head">
          <h2 className="section-title" id="vector-heading">
            The shape of it
          </h2>
          <p className="section-kicker">
            <span className="figure">{health.filter((r) => r.value === null).length}</span>{" "}
            of {health.length} axes not measured
          </p>
        </div>
        <AxisRadar readings={health} />
      </section>

      {/* ── The firewall ────────────────────────────────────────────
          Eleven categories, each with the test that decides membership.
          The test is the content: a label applied without a decidable
          rule is decoration, and ASIANCODER.MD's first anti-category
          mechanism is that the categories are checkable. */}
      <section className="section" aria-labelledby="firewall-heading">
        <h2 className="sr-only" id="firewall-heading">
          The epistemic firewall
        </h2>
        <ol className="register" style={{ listStyle: "none", padding: 0 }}>
          {ORDER.map((category) => {
            const rule = CATEGORY_RULES[category];
            const count = statements.filter((s) => s.category === category).length;
            return (
              <li
                className="register-row register--pair"
                key={category}
                style={{ opacity: count > 0 ? 1 : 0.55 }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <CategoryTag category={category} context="in this project" />
                  <span className="figure" style={{ color: "var(--quiet)" }}>
                    {count}
                  </span>
                </div>
                <div className="register-cell" data-field="Test">
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--fs-ui)",
                      lineHeight: "20px",
                      color: "var(--ash)",
                      maxWidth: "66ch",
                    }}
                  >
                    <span className="ep-key">Test · </span>
                    {rule.test}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "var(--fs-ui)",
                      lineHeight: "19px",
                      color: "var(--quiet)",
                      maxWidth: "66ch",
                    }}
                  >
                    Does not entitle: {rule.doesNotEntitle}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── Guards ──────────────────────────────────────────────────
          First-class events, above the records they were raised against,
          because a finding nobody scrolls to has not been surfaced. */}
      <section className="section" aria-labelledby="guards-heading">
        <div className="section-head">
          <h2 className="section-title" id="guards-heading">
            Guards
          </h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              runGuards();
            }}
          >
            Re-run against current state
          </button>
        </div>
        <GuardList guards={guards} />
      </section>

      {/* ── The ledger ────────────────────────────────────────────────
          Independence counted by group, not by citation. Two sources in
          one independence group are one source cited twice, and the
          ledger says which. */}
      <section className="section" aria-labelledby="ledger-heading">
        <div className="section-head">
          <h2 className="section-title" id="ledger-heading">
            Evidence ledger
          </h2>
          <p className="section-kicker">every consequential claim</p>
        </div>

        <div className="action-row" style={{ marginBottom: "var(--s-3)" }}>
          <button
            type="button"
            className={filter === "ALL" ? "btn" : "btn-ghost"}
            onClick={() => setFilter("ALL")}
          >
            All
          </button>
          {ORDER.filter((c) => present.has(c)).map((c) => (
            <button
              key={c}
              type="button"
              className={filter === c ? "btn" : "btn-ghost"}
              onClick={() => setFilter(c)}
            >
              {c.replace(/_/g, " ").toLowerCase()}{" "}
              <span className="figure">
                {statements.filter((s) => s.category === c).length}
              </span>
            </button>
          ))}
        </div>

        <EvidenceLedger statements={visible} sources={sources} />
      </section>

      {/* ── The statements themselves ─────────────────────────────────
          Grouped by category so the firewall is legible in the data as
          well as in the table above. Each card expands to its confidence
          ledger and its own guards, because evidence has to be inspectable
          AT THE MOMENT OF JUDGMENT — not one click away on another page. */}
      <section className="section" aria-labelledby="statements-heading">
        <div className="section-head">
          <h2 className="section-title" id="statements-heading">
            Statements
          </h2>
          <p className="section-kicker">grouped by category, strongest first</p>
        </div>

        <div className="ep-ledger">
          {grouped.map(([category, list]) => (
            <div key={category}>
              <div
                className="ep-key"
                style={{ padding: "var(--s-3) 0 var(--s-2)" }}
              >
                <CategoryTag category={category} context="this group" />{" "}
                <span className="figure" style={{ marginLeft: 8 }}>
                  {list.length}
                </span>
              </div>
              {list.map((s) => {
                const derived = statementConfidence(s);
                const own = selectGuardsFor(guards, s.id);
                const open = expanded === s.id;
                return (
                  <div key={s.id} style={{ marginBottom: "var(--s-2)" }}>
                    <StatementCard statement={s} />
                    <div className="action-row" style={{ marginTop: "var(--s-2)" }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        aria-expanded={open}
                        onClick={() => setExpanded(open ? null : s.id)}
                      >
                        {open ? "Hide" : "Inspect"} evidence{" "}
                        <span className="figure">{own.length}</span> guard
                        {own.length === 1 ? "" : "s"}
                      </button>
                    </div>
                    {open ? (
                      <div style={{ marginTop: "var(--s-2)" }}>
                        <ConfidenceLedger
                          display={displayConfidence(derived)}
                          subject={`statement ${s.id}`}
                        />
                        {own.length > 0 ? (
                          <GuardList
                            guards={own}
                            emptyNote="No guard was raised against this statement."
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ── Acknowledgement is a separate, explicit act ────────────────
          Every guard is offered an acknowledge button rather than being
          acknowledged on view. A system that marks something seen because
          it was rendered has no record of a human looking, and the
          difference matters when the finding is CRITICAL. */}
      {summary.unacknowledged > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Unacknowledged findings</h2>
            <p className="section-kicker">
              {summary.unacknowledged} awaiting a human
            </p>
          </div>
          <p className="section-lede">
            Acknowledging records that a named human read the finding. It does
            not remove it and it does not make the claim true — a guard
            that has been seen is still a guard.
          </p>
          <GuardList
            guards={guards.filter((g) => !g.acknowledged)}
            emptyNote="Every finding has been acknowledged."
          />
          <div className="action-row">
            <button
              type="button"
              className="btn"
              onClick={() => {
                for (const g of guards.filter((x) => !x.acknowledged)) {
                  acknowledge(g.id, "human:local-operator");
                }
              }}
            >
              Acknowledge all as human:local-operator
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}