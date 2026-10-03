import type { Metadata } from "next";
import Link from "next/link";
import { StatusBand } from "@/components/site/StatusBand";
import { EmptyState } from "@/components/site/EmptyState";
import { StateTag } from "@/components/site/StateTag";
import { ValueChain } from "@/components/site/ValueChain";
import { CONSOLE, VALUE_CHAIN } from "@/lib/system";

export const metadata: Metadata = {
  title: "Control",
  description:
    "Knowledge becomes action: the school console, the first field implementation of the APT-LABS architecture.",
};

export default function ControlPage() {
  const execution = VALUE_CHAIN.filter((s) => s.node === "control");

  return (
    <>
      <p className="label">Node 04 · Control — knowledge becomes action</p>
      <h1 className="page-title">
        The console. Real, openable, and not deployed to anyone.
      </h1>

      <div className="prose" style={{ marginTop: 18 }}>
        <p>
          Control is where intelligence becomes work: a decision taken against
          a derived reading, under an explicit rule, by an institution that
          keeps its own record. The first implementation is the School Console
          — nine modules and ten tools, running on the device it is used from.
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
        <StatusBand />
      </div>

      {/* The console, presented as what it is: a working surface, in
          the same register as everything else. The provenance sentence
          sits beside the entry link so nobody can reach the capability
          without the state. */}
      <section className="section" aria-labelledby="console-heading">
        <div className="section-head">
          <h2 className="section-title" id="console-heading">
            {CONSOLE.name}
          </h2>
          <StateTag state={CONSOLE.state} />
        </div>

        <div className="prose">
          <p>{CONSOLE.oneLine}</p>
          <p>{CONSOLE.localFirst}</p>
        </div>

        <div className="register" role="table" aria-labelledby="console-heading" style={{ marginTop: 20 }}>
          <div className="register-head register--std" role="row">
            <span role="columnheader">Module</span>
            <span role="columnheader">What it records</span>
            <span role="columnheader">Runs</span>
            <span role="columnheader">State</span>
          </div>
          {CONSOLE.modules.map((m, i) => (
            <div className="register-row register--std" role="row" key={m}>
              <div className="register-cell register-cell--id" role="cell">
                <div className="register-id">{String(i + 1).padStart(2, "0")}</div>
                <div className="register-name" style={{ marginTop: 4 }}>
                  {m}
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Records">
                <div className="register-provenance" style={{ maxWidth: "54ch" }}>
                  Records written on this device stay in the browser until the
                  operator exports them. Nothing is transmitted.
                </div>
              </div>
              <div className="register-cell" role="cell" data-field="Runs">
                <div className="register-date">On device</div>
              </div>
              <div className="register-cell" role="cell" data-field="State">
                <StateTag state="PROTOTYPE" />
              </div>
            </div>
          ))}
        </div>

        <div className="action-row" style={{ marginTop: 24 }}>
          <Link href={CONSOLE.href} className="btn">
            Open the console
          </Link>
          <span className="register-provenance" style={{ maxWidth: "54ch" }}>
            {CONSOLE.provenance}
          </span>
        </div>
      </section>

      {/* The control stages of the chain, isolated so the reader can
          see where custody sits: the institution decides and executes;
          the local record interprets and measures. */}
      <section className="section" aria-labelledby="stages-heading">
        <div className="section-head">
          <h2 className="section-title" id="stages-heading">
            Decide. Execute.
          </h2>
          <p className="label">
            Stages {execution.map((s) => s.ord).join(" · ")}
          </p>
        </div>

        <div className="register" role="table" aria-labelledby="stages-heading">
          {execution.map((stage) => (
            <div
              className="register-row" role="row"
              key={stage.ord}
              style={{ gridTemplateColumns: "72px minmax(0,1fr) 190px" }}
            >
              <div className="register-cell" role="cell">
                <div className="register-id">{stage.ord}</div>
              </div>
              <div className="register-cell" role="cell" data-field="Stage">
                <div className="register-name">{stage.name}</div>
                <p style={{ margin: "6px 0 0", maxWidth: "58ch" }}>{stage.what}</p>
              </div>
              <div className="register-cell" role="cell" data-field="Custody">
                <div className="register-provenance">{stage.owner}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section">
        <ValueChain />
      </div>

      {/* The decision record is empty, and that is the honest state of
          a system that has not governed anything yet. */}
      <section className="section" aria-labelledby="decisions-heading">
        <div className="section-head">
          <h2 className="section-title" id="decisions-heading">
            Decisions taken through this system
          </h2>
          <p className="label">Decision record</p>
        </div>

        <EmptyState
          title="Nothing registered yet"
          body="No collective decision has been taken, recorded or executed through this system. The decision record is empty, and it is empty because the system has not governed anything."
          unit="decision"
          why="A decision record requires a named decision body, the rule it was taken under, and the records that were in front of it. No such record exists."
          unblocks="One decision taken in a school, recorded with the attendance and assessment records it relied on, and readable afterwards by someone who was not in the room."
          state="UNKNOWN — not zero. The absence of decision records is unestablished, not measured."
        />

        <div className="action-row" style={{ marginTop: 28 }}>
          <Link href="/evidence" className="btn">
            Next — the loop closes
          </Link>
          <Link href="/console" className="btn-ghost">
            Open the console
          </Link>
        </div>
      </section>
    </>
  );
}
