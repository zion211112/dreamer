import type { Metadata } from "next";
import Link from "next/link";
import { NodeMap } from "@/components/site/NodeMap";
import { StatusBand } from "@/components/site/StatusBand";
import { Tally } from "@/components/site/Tally";
import { EmptyState } from "@/components/site/EmptyState";
import { StateTag } from "@/components/site/StateTag";
import { ValueChain } from "@/components/site/ValueChain";
import {
  COMPANY,
  CONSOLE,
  FIELD_STATIONS,
  MEASURES,
  REGISTERS,
  SIGNALS,
  UNKNOWN_FACTS,
} from "@/lib/system";

export const metadata: Metadata = {
  title: "APT-LABS",
  description: COMPANY.supporting,
};

export default function FieldPage() {
  return (
    <>
      {/* ── THE FIRST VIEWPORT ────────────────────────────────
          The contract asks six things of this screen, in this
          order: reality is observed, records are evidence-bound,
          intelligence is derived, decisions are traceable, the
          current console is real, and unknown remains unknown.

          The sentence and the supporting line carry 1–4. The
          figure block carries 5–6 by putting a state under every
          number, including the number that is not known. */}
      <section aria-labelledby="claim">
        <p className="label">
          Node 01 · Field — reality before interpretation
        </p>
        <h1 className="page-title" id="claim" style={{ maxWidth: "24ch" }}>
          {COMPANY.primary}
        </h1>
        <p className="prose" style={{ marginTop: 18, fontSize: 17 }}>
          {COMPANY.supporting} Every material claim carries an identifier, a
          timestamp, a source and an evidence state — and where the system
          cannot establish a fact, it preserves the uncertainty instead of
          resolving it in its own favour.
        </p>

        <div className="action-row" style={{ marginTop: 24 }}>
          <Link href={CONSOLE.href} className="btn">
            Open the console
          </Link>
          <Link href="/register" className="btn-ghost">
            Read the register
          </Link>
          <Link href="/evidence" className="btn-ghost">
            What is not yet known
          </Link>
        </div>

        <div style={{ marginTop: 36 }}>
          <div className="measure-grid">
            {MEASURES.map((m) => (
              <div className="measure-cell" key={m.key}>
                <div className="measure-figure">{m.figure}</div>
                <div className="measure-key">{m.key}</div>
                <p className="measure-note">{m.note}</p>
                <div style={{ marginTop: 10 }}>
                  <StateTag state={m.state} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 32 }}>
        <StatusBand />
      </div>

      {/* ── THE CONTROL PLANE ────────────────────────────────
          Five nodes, five routes. The map is the navigation and the
          argument at the same time: it says what the system is by
          naming the stages it has to pass through. */}
      <section className="section" aria-labelledby="plane-heading">
        <div className="section-head">
          <h2 className="section-title" id="plane-heading">
            The control plane
          </h2>
          <p className="label">Field → Register → Intelligence → Control → Evidence</p>
        </div>
        <NodeMap />
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            These are not features. They are the five states every piece of
            operational reality passes through, and each one is a route you can
            open and inspect. Action at the fourth stage generates the evidence
            that becomes the first stage of the next cycle.
          </p>
        </div>
      </section>

      <div className="section">
        <ValueChain />
      </div>

      {/* ── THE CONSOLE, AS A REAL SURFACE ───────────────────
          The contract's requirement that "the current console is
          real" is met by naming the modules, linking the route,
          and refusing the deployment claim in the same panel — so
          the reader cannot take the capability without the state. */}
      <section className="section" aria-labelledby="console-heading">
        <div className="section-head">
          <h2 className="section-title" id="console-heading">
            The first field implementation
          </h2>
          <StateTag state={CONSOLE.state} title={CONSOLE.provenance} />
        </div>

        <div className="prose">
          <p>{CONSOLE.oneLine}</p>
        </div>

        <div className="register" style={{ marginTop: 20 }}>
          {CONSOLE.modules.map((m, i) => (
            <div
              className="register-row"
              key={m}
              style={{ gridTemplateColumns: "minmax(0,220px) minmax(0,1fr)" }}
            >
              <div className="register-cell">
                <div className="register-id">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {m}
                </div>
              </div>
              <div className="register-cell" data-field="Module">
                <div className="register-provenance" style={{ maxWidth: "60ch" }}>
                  Runs on this device. Records it writes stay in the browser
                  until the operator exports them.
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="action-row" style={{ marginTop: 22 }}>
          <Link href={CONSOLE.href} className="btn">
            Open {CONSOLE.name}
          </Link>
          <span className="register-provenance" style={{ maxWidth: "52ch" }}>
            {CONSOLE.provenance}
          </span>
        </div>
      </section>

      {/* ── WHAT THE SYSTEM RECORDS ───────────────────────────
          The registers, as a register: each row states what it
          holds, what state its evidence is in, and the provenance
          sentence that makes the state inspectable. The tally is
          counted from these rows — it cannot drift from them. */}
      <section className="section" aria-labelledby="records-heading">
        <div className="section-head">
          <h2 className="section-title" id="records-heading">
            What the system records
          </h2>
          <p className="label">Six record classes</p>
        </div>

        <div className="register">
          <div className="register-head register--std" aria-hidden="true">
            <span>Register</span>
            <span>What one row holds</span>
            <span>Unit</span>
            <span>State</span>
          </div>
          {REGISTERS.map((r) => (
            <div className="register-row register--std" key={r.ord}>
              <div className="register-cell register-cell--id">
                <div className="register-id">{r.ord}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  <Link href={r.href} className="link">
                    {r.name}
                  </Link>
                </div>
              </div>
              <div className="register-cell" data-field="Holds">
                <div>{r.what}</div>
                <div className="register-provenance" style={{ marginTop: 8 }}>
                  {r.provenance}
                </div>
              </div>
              <div className="register-cell" data-field="Unit">
                <div className="register-figure">{r.unit}</div>
              </div>
              <div className="register-cell" data-field="State">
                <StateTag state={r.state} title={r.provenance} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <Tally records={REGISTERS} caption="record classes" />
        </div>
      </section>

      {/* ── UNKNOWN REMAINS UNKNOWN ───────────────────────────
          The contract's sixth requirement for the first viewport,
          given its own surface. This panel is the system's most
          distinctive claim: it publishes what it has not observed,
          in the same register language as what it has.

          A site that shows this before it shows its achievements is
          making a structural argument, not a decorative one — the
          absence of evidence is rendered as carefully as the
          evidence. */}
      <section className="section" aria-labelledby="unknown-heading">
        <div className="section-head">
          <h2 className="section-title" id="unknown-heading">
            What this system does not know
          </h2>
          <p className="label">Published unknowns</p>
        </div>

        <EmptyState
          title="Nothing registered yet — and that is correct"
          body="No institution has run this system, so there is no deployment record, no adoption figure, no outcome measurement and no partner register. Rather than fill this space with projection, the system states the absence and names what would legitimately appear here."
          unit="deployment"
          why="A deployment record requires a named institution, a start date and an operator signature. None is documented."
          unblocks="One school running the console for a full term, exporting its registers on its own device."
          state="UNKNOWN — not zero. The count is unestablished, not measured as none."
        />

        <div className="register" style={{ marginTop: 22 }}>
          <div className="register-head register--std" aria-hidden="true">
            <span>Unknown</span>
            <span>Why it is not established</span>
            <span>Since</span>
            <span>State</span>
          </div>
          {UNKNOWN_FACTS.map((u) => (
            <div className="register-row register--std" key={u.id}>
              <div className="register-cell register-cell--id">
                <div className="register-id">{u.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {u.what}
                </div>
              </div>
              <div className="register-cell" data-field="Why unknown">
                <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                  {u.why}
                </div>
              </div>
              <div className="register-cell" data-field="Since">
                <div className="register-date">{u.since}</div>
              </div>
              <div className="register-cell" data-field="State">
                <StateTag state="UNKNOWN" title={u.why} />
              </div>
            </div>
          ))}
        </div>
      </section>
{/* ── DERIVED SIGNALS ─────────────────────────────────
          Intelligence that shows its work. Each reading names the
          records it was derived from and the method that derived
          it, so a claim of insight can be walked back to its
          inputs rather than taken on trust. */}
      <section className="section" aria-labelledby="signals-heading">
        <div className="section-head">
          <h2 className="section-title" id="signals-heading">
            Derived signals
          </h2>
          <p className="label">Intelligence · traceable to source records</p>
        </div>

        <div className="register">
          {SIGNALS.map((s) => (
            <div
              className="register-row"
              key={s.id}
              style={{ gridTemplateColumns: "minmax(0,260px) minmax(0,1fr)" }}
            >
              <div className="register-cell register-cell--id">
                <div className="register-id">{s.id}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {s.name}
                </div>
                <div style={{ marginTop: 10 }}>
                  <StateTag state={s.state} title={s.provenance} />
                </div>
              </div>
              <div className="register-cell" data-field="Reading">
                <p style={{ margin: "0 0 12px" }}>{s.reading}</p>
                <div className="register-provenance" style={{ maxWidth: "62ch" }}>
                  <strong style={{ color: "var(--dust)" }}>Method · </strong>
                  {s.method}
                  <br />
                  <strong style={{ color: "var(--dust)" }}>Sources · </strong>
                  {s.sources.join("  ·  ")}
                  <br />
                  <strong style={{ color: "var(--dust)" }}>Provenance · </strong>
                  {s.provenance}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <Tally records={SIGNALS} caption="derived signals" />
        </div>
      </section>

      {/* ── FURTHER FIELD STATIONS ───────────────────────────
          The architecture extends by changing the domain and
          nothing else: same seven stages, same epistemic contract,
          same custody boundary. Every row is PLANNED — designed,
          not built — and carries no figure, because a planned
          surface has none. */}
      <section className="section" aria-labelledby="stations-heading">
        <div className="section-head">
          <h2 className="section-title" id="stations-heading">
            Further field stations
          </h2>
          <p className="label">Planned · same grammar</p>
        </div>

        <div className="prose" style={{ marginBottom: 20 }}>
          <p>
            Additional domains running the same chain over local records:{" "}
            <span className="figure">tenders → records → buyer patterns</span>,{" "}
            <span className="figure">farm events → records → patterns</span>,{" "}
            <span className="figure">speech → governed dataset → structure</span>.{" "}
            None of these is built. They are stated to show that the grammar
            generalises, and each carries the state that says so.
          </p>
        </div>

        <div className="register">
          {FIELD_STATIONS.map((f, i) => (
            <div
              className="register-row"
              key={f.name}
              style={{ gridTemplateColumns: "minmax(0,200px) minmax(0,1fr) 116px" }}
            >
              <div className="register-cell">
                <div className="register-id">{String(i + 1).padStart(2, "0")}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {f.name}
                </div>
              </div>
              <div className="register-cell" data-field="Chain">
                <div className="register-provenance" style={{ maxWidth: "58ch" }}>
                  {f.chain}
                </div>
              </div>
              <div className="register-cell" data-field="State">
                <StateTag state={f.state} title="Designed, not built." />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}