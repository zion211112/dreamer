import type { Metadata } from "next";
import Link from "next/link";
import { StatusBand } from "@/components/site/StatusBand";
import { Tally } from "@/components/site/Tally";
import { EmptyState } from "@/components/site/EmptyState";
import { StateTag } from "@/components/site/StateTag";
import { SIGNALS } from "@/lib/system";

export const metadata: Metadata = {
  title: "Intelligence",
  description:
    "Derived signals, each bound to the records it came from. APT-LABS intelligence stays traceable to its sources.",
};

export default function IntelligencePage() {
  return (
    <>
      <p className="label">Node 03 · Intelligence — records become structure</p>
      <h1 className="page-title">
        Intelligence you can walk back to the record it came from.
      </h1>

      <div className="prose" style={{ marginTop: 18 }}>
        <p>
          A derived signal that will not show its sources is an assertion with
          extra steps. Every reading on this page carries three things: the
          records it was derived from, the method that derived it, and the
          state that says how far it has been exercised. That combination is
          what separates intelligence from a report — a report tells you what
          happened; intelligence tells you what the records support, and what
          they still do not.
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
        <StatusBand />
      </div>

      {/* The signals, in register form. Sources are rendered as ids
          because they are citations, and a citation that looks like
          prose is not a citation. */}
      <section className="section" aria-labelledby="signals-heading">
        <div className="section-head">
          <h2 className="section-title" id="signals-heading">
            Derived signals
          </h2>
          <p className="label">{SIGNALS.length} readings · each with sources</p>
        </div>

        <div className="register">
          {SIGNALS.map((s) => (
            <div
              className="register-row"
              key={s.id}
              style={{ gridTemplateColumns: "minmax(0,250px) minmax(0,1fr) 132px" }}
            >
              <div className="register-cell register-cell--id">
                <div className="register-id">{s.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {s.name}
                </div>
              </div>
              <div className="register-cell" data-field="Reading">
                <p style={{ margin: "0 0 14px" }}>{s.reading}</p>
                <div className="register-provenance" style={{ maxWidth: "62ch" }}>
                  <span style={{ color: "var(--dust)" }}>Method</span> — {s.method}
                  <br />
                  <span style={{ color: "var(--dust)" }}>Sources</span> —{" "}
                  {s.sources.map((src) => (
                    <span key={src} style={{ marginRight: 10 }}>
                      {src}
                    </span>
                  ))}
                  <br />
                  <span style={{ color: "var(--dust)" }}>Provenance</span> —{" "}
                  {s.provenance}
                </div>
              </div>
              <div className="register-cell" data-field="State">
                <StateTag state={s.state} title={s.provenance} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <Tally records={SIGNALS} caption="derived signals" />
        </div>
      </section>

      {/* The boundary of this node. Intelligence is the stage where a
          system is most tempted to overstate, so the absence is given
          as much structure as the presence. */}
      <section className="section" aria-labelledby="limit-heading">
        <div className="section-head">
          <h2 className="section-title" id="limit-heading">
            What has not been derived
          </h2>
          <p className="label">No reading published</p>
        </div>

        <EmptyState
          title="Nothing derived from a real cohort"
          body="No signal on this page has been produced from a real institution's records. The derivations run against locally entered data and demonstrate method. Nothing here describes learners, teachers, schools or outcomes."
          unit="derived reading"
          why="A derived signal requires a recorded population to derive from. No institution has run this system, so there is no population to derive from."
          unblocks="One term of attendance and assessment records entered on a school's own device, then derived locally and read by someone who did not enter them."
          state="UNKNOWN — the absence of readings is unestablished as a fact about the world, not a measurement of it."
        />

        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            The distinction between <em>a method that works</em> and{" "}
            <em>a finding about people</em> is the whole reason this node is
            published empty. Intelligence derived from a school&rsquo;s own records
            and read by its own staff is a legitimate and useful thing. The
            moment it is presented as an assessment of learners it is neither
            evidenced nor owned by the institution, and it stops being
            intelligence — it becomes surveillance with a provenance field.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="action-row">
          <Link href="/control" className="btn">
            Next — knowledge becomes action
          </Link>
          <Link href="/register" className="btn-ghost">
            Back to the register
          </Link>
        </div>
      </section>
    </>
  );
}