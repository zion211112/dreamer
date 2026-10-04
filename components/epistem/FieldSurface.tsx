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
import { useEpistem, selectGap } from "@/lib/state/store";
import { GapMeter } from "@/components/epistem/GapMeter";
import { measureFluency } from "@/lib/epistemic/health";
import { CategoryTag } from "@/components/epistem/CategoryTag";
import type { StatementCategory } from "@/lib/epistemic/taxonomy";

/** The default draft. Chosen to demonstrate the failure rather than to
    demonstrate typing: it is fluent, confident, causally overreaching, and
    cites nothing. Every one of those is a finding the gap meter and the
    guard run will report on it. */
const DRAFT = `Migrants arriving in the district increased local demand by roughly 6%, which explains the observed rise in retail turnover and confirms that the relocation programme is working. Experts agree that no further action is required.`;

export function FieldSurface() {
  const statements = useEpistem((s) => s.statements);
  const guards = useEpistem((s) => s.guards);
  const [text, setText] = useState(DRAFT);
  const [category, setCategory] = useState<StatementCategory>("INFERENCE");

  const gap = useMemo(() => selectGap(statements, guards, text), [text, statements, guards]);
  /* The same text through the proxy directly, so the meter can print its
     method and its four signals rather than a bare pair of bars. */
  const fluency = useMemo(() => measureFluency(text), [text]);

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

        <div className="action-row" style={{ marginTop: "var(--s-3)" }}>
          <span className="ep-key" style={{ alignSelf: "center" }}>
            Enters as
          </span>
          <CategoryTag category={category} context="proposed category" />
        </div>

        <p className="section-lede" style={{ marginTop: "var(--s-3)" }}>
          The draft above asserts a cause, quotes consensus, and puts a
          number on it with no source attached. The guards raised against
          this project are on{" "}
          <a href="/register">Register</a>; the differential for the causal
          claim it resembles is on <a href="/intelligence">Intelligence</a>.
          Both exist because the same sentence keeps arriving.
        </p>
      </section>
    </>
  );
}