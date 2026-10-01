import Link from "next/link";
import { FACES, REGISTERS } from "../../../lib/company";
import { faceMetadata } from "../../../lib/metadata";
import { Reveal } from "../../../components/site/Reveal";
import "../register.css";
import "./roll.css";

export const metadata = faceMetadata({
  title: "The Roll",
  description:
    "The record behind the work — what was built, who built it, what was tested. People and assets, separately recorded.",
  path: "/roll",
});

/** The lifecycle a record walks. Each step adds evidence, or it is absent. */
const LIFECYCLE = [
  { word: "Designed", copy: "Requirement and design exist as a defined record." },
  { word: "Sourced", copy: "Materials, components or procurement are evidenced." },
  { word: "Built", copy: "Fabrication or assembly is recorded." },
  { word: "Installed", copy: "Placement and handover context are recorded." },
  { word: "Tested", copy: "Observed performance or acceptance evidence exists." },
  { word: "Documented", copy: "The record is complete enough for another party to inspect." },
];

/** The four states the interface is allowed to show. Ranked by evidence. */
const STATES = [
  {
    key: "planned",
    word: "Planned",
    desc: "Architecture or intended work exists; the execution record does not yet establish completion.",
    mark: "State 01",
  },
  {
    key: "prototype",
    word: "Prototype",
    desc: "A working or testable implementation exists, without a verified deployment claim.",
    mark: "State 02",
  },
  {
    key: "installed",
    word: "Installed",
    desc: "Installation or handover is recorded. This does not, by itself, establish performance.",
    mark: "State 03",
  },
  {
    key: "verified",
    word: "Verified",
    desc: "The relevant claim has supporting evidence sufficient for the declared verification scope.",
    mark: "State 04",
  },
];

const PEOPLE_LINES: [string, string][] = [
  ["Makers", "Contribution"],
  ["Builders", "Fabrication"],
  ["Creators", "Production"],
  ["Contributors", "Support"],
];

const ASSET_LINES: [string, string][] = [
  ["Designs", "Definition"],
  ["BOMs", "Materials"],
  ["Builds", "Fabrication"],
  ["Installations", "Handover"],
  ["Repairs", "Maintenance"],
  ["Tests", "Validation"],
  ["Evidence", "Provenance"],
];

export default function RollPage() {
  return (
    <main className="rg-page roll-page">
      <Reveal />

      {/* ── Hero ── */}
      <section className="rg-hero">
        <div className="rg-frame rg-hero-grid">
          <div>
            <p className="rg-eyebrow">The Roll · Evidence / provenance</p>
            <h1 className="rg-title">
              The <em>record.</em>
            </h1>
            <p className="rg-lead">
              What was built. Who built it. What state it reached. What evidence
              remains.
            </p>
          </div>

          <aside className="rg-aside">
            <div className="rg-aside-row">
              <span>Structure</span>
              <strong>One ledger / two registers</strong>
            </div>
            <div className="rg-aside-row">
              <span>People</span>
              <strong>Contribution + provenance</strong>
            </div>
            <div className="rg-aside-row">
              <span>Assets</span>
              <strong>Lifecycle + evidence</strong>
            </div>
            <div className="rg-aside-row">
              <span>State</span>
              <strong>Only what evidence supports</strong>
            </div>
          </aside>
        </div>

        <div className="rg-frame rg-base">
          <span>The Roll · evidence layer</span>
          <span>Planned ≠ prototype ≠ installed ≠ verified</span>
        </div>
      </section>

      {/* ── Thesis — why the register exists ── */}
      <section className="rl-thesis">
        <div className="rg-frame rl-split" data-reveal>
          <p className="rg-mark">01 / Why it exists</p>

          <div>
            <h2>
              A build should not disappear into a story.{" "}
              <em>It should leave a trace.</em>
            </h2>

            <p className="rl-thesis-sub">
              The Roll is the evidence layer around APT-LABS work. It connects
              the people involved to the assets produced, and the assets to the
              records that support their current state — so another institution
              can inspect what happened rather than inherit a narrative.
            </p>

            <div className="rl-rule" />
          </div>
        </div>
      </section>

      {/* ── The ledger — two registers, one spine ── */}
      <section className="rg-section" style={{ paddingBottom: 0 }}>
        <div className="rg-frame">
          <div className="rg-head" data-reveal>
            <p className="rg-mark">02 / The ledger</p>
            <div>
              <h2 className="rg-h2">One ledger. Two registers.</h2>
              <p className="rg-copy">
                People and assets are different kinds of records, but they belong
                to the same chain of accountability. A contribution needs a maker.
                A built asset needs a history.
              </p>
            </div>
          </div>

          <div className="rg-panel" data-reveal>
            <div className="rg-panel-head">
              <span>Roll / register architecture</span>
              <span>{REGISTERS.length} registers · evidence-first</span>
            </div>

            <div className="rl-ledger-canvas">
              <section className="rl-panel rl-panel-left">
                <div className="rl-panel-title">
                  <div className="rl-panel-name">
                    People
                    <small>People Register</small>
                  </div>
                  <span className="rg-chip" data-state="prototype">
                    Prototype
                  </span>
                </div>

                <p className="rl-panel-copy">
                  Makers, builders, creators and contributors. The person is not
                  ornamental credit; the record links work to the person who did
                  it.
                </p>

                <div className="rl-lines">
                  {PEOPLE_LINES.map(([name, role]) => (
                    <div className="rl-line" key={name}>
                      <span>{name}</span>
                      <small>{role}</small>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rl-spine" aria-hidden="true">
                <div className="rl-spine-core" />
                <span className="rl-spine-text">{FACES.roll.name}</span>
              </div>

              <section className="rl-panel rl-panel-right">
                <div className="rl-panel-title">
                  <div className="rl-panel-name">
                    Assets
                    <small>Asset Register</small>
                  </div>
                  <span className="rg-chip" data-state="prototype">
                    Prototype
                  </span>
                </div>

                <p className="rl-panel-copy">
                  What was designed, sourced, built, installed, tested, accepted,
                  repaired and documented — with a state attached to every
                  record.
                </p>

                <div className="rl-lines">
                  {ASSET_LINES.map(([name, role]) => (
                    <div className="rl-line" key={name}>
                      <span>{name}</span>
                      <small>{role}</small>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="rg-panel-foot">
              <span>
                A single record can point outward to its people, its asset
                history and its supporting evidence.
              </span>
              <span>No shared server-backed register is published</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lifecycle — intention to inspectable history ── */}
      <section className="rg-section">
        <div className="rg-frame">
          <div className="rg-head" data-reveal>
            <p className="rg-mark">03 / Asset lifecycle</p>
            <div>
              <h2 className="rg-h2">From intention to inspectable history.</h2>
              <p className="rg-copy">
                An asset record is not complete because a field has been filled.
                It becomes stronger as successive events acquire evidence.
              </p>
            </div>
          </div>

          <div className="rg-panel" data-reveal>
            <div className="rg-panel-head">
              <span>Asset state sequence</span>
              <span>Only actual states shown</span>
            </div>

            <div className="rl-track">
              {LIFECYCLE.map((step, i) => (
                <article className="rl-step" key={step.word}>
                  <span className="rl-step-index">{String(i + 1).padStart(2, "0")}</span>
                  <strong>{step.word}</strong>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>

            <div className="rg-panel-foot">
              <span>
                <strong>Principle:</strong> a missing event is shown as missing;
                the interface does not manufacture continuity.
              </span>
              <span>Evidence → state</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── State discipline — the four states, ranked by evidence ── */}
      <section className="rg-section" style={{ paddingTop: 0 }}>
        <div className="rg-frame rl-split" data-reveal>
          <p className="rg-mark">04 / State discipline</p>

          <div>
            <h2 className="rg-h2">The Roll records reality, not aspiration.</h2>
            <p className="rg-copy">
              The visual language deliberately separates what is planned, what is
              being prototyped, what has been installed and what has been
              verified. The record itself never substitutes for evidence.
            </p>

            <div className="rl-states">
              {STATES.map((state) => (
                <div className="rl-state-row" data-state={state.key} key={state.key}>
                  <div className="rl-state-name">{state.word}</div>
                  <p className="rl-state-desc">{state.desc}</p>
                  <div className="rl-state-mark">{state.mark}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing — the record survives handover ── */}
      <section className="rg-end">
        <div className="rg-frame">
          <div className="rg-end-grid" data-reveal>
            <div>
              <p className="rg-eyebrow">The Roll</p>
              <h2>
                What survives handover is <span>the record.</span>
              </h2>
            </div>

            <div>
              <p className="rg-end-copy">
                Inspect the work, follow its evidence, or bring a new build into
                the system. No shared server-backed register is published: the
                registers start empty, and an asset without evidence is marked
                accordingly or omitted. The point is not to make every claim look
                complete — it is to make incompleteness visible.
              </p>

              <div className="rg-tiles">
                <Link className="rg-tile" href="/work">
                  <small>Work</small>
                  <strong>See what we build ↗</strong>
                </Link>
                <Link className="rg-tile" href="/contact">
                  <small>Engagement</small>
                  <strong>Start a project →</strong>
                </Link>
                <Link className="rg-tile" href="/evidence">
                  <small>Evidence</small>
                  <strong>Inspect the boundary ↗</strong>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}




