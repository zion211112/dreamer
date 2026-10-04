"use client";

/**
 * The FIELD surface — reality entering the system, and the instrument that
 * watches whether the way it is being written keeps up with the way it is
 * being supported.
 *
 * ASIANCODER.MD's first of five surfaces, and the fluency counter lives
 * here because that is where the failure is visible first: text arrives
 * looking finished long before its evidence exists.
 */

import { useMemo, useState } from "react";
import { useEpistem } from "@/lib/state/store";
import { GapMeter } from "@/components/epistem/GapMeter";
import { measureFluency, measureGap } from "@/lib/epistemic/health";
import { guardStatement } from "@/lib/epistemic/guard";
import { Claim, StatementId, type Statement } from "@/lib/epistemic/model";
import { GuardList } from "@/components/epistem/GuardList";
import { CategoryTag } from "@/components/epistem/CategoryTag";
import type { StatementCategory } from "@/lib/epistemic/taxonomy";
import { FIELD_EVALUATED_AT, DRAFT_CATEGORIES } from "@/lib/state/seed";

/** The default draft. Chosen to demonstrate the failure rather than to
    demonstrate typing: it is fluent, confident, causally overreaching, and
    cites nothing. Every one of those is a finding the gap meter and the
    guard run will report on it. */
const DRAFT = `Migrants arriving in the district increased local demand by roughly 6%, which explains the observed rise in retail turnover and confirms that the relocation programme is working. Experts agree that no further action is required.`;

export function FieldSurface() {
  const statements = useEpistem((s) => s.statements);
  const guards = useEpistem((s) => s.guards);
  const sources = useEpistem((s) => s.sources);
  const [text, setText] = useState(DRAFT);
  const [category, setCategory] = useState<StatementCategory>("INFERENCE");

  /* The draft is guarded on every keystroke.

     The previous version computed the gap from the text's FLUENCY and the
     project's statements and guards — so the support bar never moved no
     matter what you typed, and the page shipped with a draft its own
     comment called "fluent, confident, causally overreaching, and cites
     nothing" that no detector ever saw.

     So the text becomes a real CLAIM, runs through the real
     guardStatement, and its findings join the project's. That makes the
     instrument honest in both directions: editing the box now moves both
     bars, because it genuinely changes what the system knows.

     The synthetic statement is NOT written into the store. It is a
     projection of the draft for measurement; persisting every keystroke
     would fill the register with fragments, and a register that records
     half-typed sentences is a worse register than one that records
     nothing. */
  const draft: Statement = useMemo(
    () =>
      Claim.parse({
        kind: "CLAIM",
        id: StatementId.parse("draft"),
        text: text.trim() || "(empty)",
        category,
        chainStage: "INTERPRETED",
        support: "UNTESTED",
        provenance: {
          entries: [
            {
              at: FIELD_EVALUATED_AT,
              actor: { type: "HUMAN", actorId: "local-operator" },
              action: "GENERATED",
            },
          ],
        },
        confidence: { factors: [] },
        transitions: [],
        guards: [],
        unknowns: [],
        parentIds: [],
        evidenceIds: [],
        sourceIds: [],
        independentSupports: 0,
        contradicting: [],
        createdAt: FIELD_EVALUATED_AT,
      }),
    [text, category]
  );

  const draftGuards = useMemo(
    () => guardStatement({ statement: draft, all: [draft, ...statements], sources, at: FIELD_EVALUATED_AT }),
    [draft, statements, sources]
  );

  const fluency = useMemo(() => measureFluency(text), [text]);
  const gap = useMemo(
    () => measureGap({ text, statements: [draft, ...statements], guards: [...draftGuards, ...guards] }),
    [text, statements, draft, draftGuards, guards]
  );

  return (
    <>
      <section className="section" aria-labelledby="gap-heading">
        <div className="section-head">
          <h2 className="section-title" id="gap-heading">
            Fluency / evidence gap
          </h2>
          <p className="section-kicker">
            a danger signal, not a quality score
          </p>
        </div>

        <p className="section-lede">
          Two bars on one scale, and the distance between them. Language
          quality rising faster than epistemic support is the failure this
          whole system is built to catch, and it is invisible to a reader
          who has been trained to find fluent text convincing.
        </p>

        <GapMeter reading={gap} fluency={fluency} />
      </section>

      {/* ── The capture surface ──────────────────────────────────────
          The draft is classified before anything else happens to it,
          because classification is the firewall: a sentence that arrives
          already asserted as FACT is the thing this layer exists to
          refuse. */}
      <section className="section" aria-labelledby="capture-heading">
        <div className="section-head">
          <h2 className="section-title" id="capture-heading">
            Capture
          </h2>
          <p className="section-kicker">
            what enters, and in what category
          </p>
        </div>

        <label className="identity-field" htmlFor="field-draft">
          <span className="identity-label">
            Entering text{" "}
            <span className="identity-hint">
              editable — edit it and watch the gap move
            </span>
          </span>
          <textarea
            id="field-draft"
            className="ep-gate-rationale"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>

        {/* The category is a control, not a label.

            It was a chip beside the word "Enters as" with no way to change
            it, and `setCategory` had no callers — so the one decision the
            firewall is about was presented as already made.

            The category determines which detectors apply, so choosing it is
            the reader's first and most consequential act on this page. */}
        <div className="action-row" style={{ marginTop: "var(--s-3)" }}>
          <span className="ep-key" style={{ alignSelf: "center" }}>
            Enters as
          </span>
          {DRAFT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={category === c ? "btn" : "btn-ghost"}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              <CategoryTag category={c} context="proposed category" />
            </button>
          ))}
        </div>

        <p className="section-lede" style={{ marginTop: "var(--s-3)" }}>
          Changing the category changes which detectors apply, so it is the
          first decision on this page rather than a label beside the text.
          The category you choose does not grant the sentence any more
          entitlement than its evidence supports — it records what kind of
          thing the sentence is claiming to be.
        </p>

        {/* What the draft itself raises, right here.

            The previous version told the reader to go and look at the
            Register for the guards on this project's claims, while never
            running a detector on the draft the page ships with. The whole
            point of FIELD is that failure arriving here gets caught here. */}
        <section className="section" aria-labelledby="draft-guards">
          <div className="section-head">
            <h2 className="section-title" id="draft-guards">
              What this draft raises
            </h2>
            <p className="section-kicker">
              <span className="figure">{draftGuards.length}</span> finding
              {draftGuards.length === 1 ? "" : "s"} · recomputed on every
              keystroke
            </p>
          </div>

          <p className="section-lede">
            The shipped draft is fluent, causally overreaching, cites nothing
            and claims consensus. That is deliberate: a demo where the
            instrument finds nothing would misrepresent it.
          </p>

          <GuardList guards={draftGuards} />

          <p className="section-lede" style={{ marginTop: "var(--s-3)" }}>
            Project-wide findings are on <a href="/register">Register</a>. The
            differential for the causal claim this resembles is on{" "}
            <a href="/intelligence">Intelligence</a>.
          </p>
        </section>
      </section>
    </>
  );
}