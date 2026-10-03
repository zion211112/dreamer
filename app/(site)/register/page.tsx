import type { Metadata } from "next";
import Link from "next/link";
import { StatusBand } from "@/components/site/StatusBand";
import { Tally } from "@/components/site/Tally";
import { EmptyState } from "@/components/site/EmptyState";
import { RegisterHead, RegisterRow } from "@/components/site/RegisterTable";
import { REGISTERS } from "@/lib/system";

export const metadata: Metadata = {
  title: "Register",
  description:
    "What APT-LABS records, in register form: every row carries an id, a date, a source and an evidence state.",
};

export default function RegisterPage() {
  return (
    <>
      <p className="label">Node 02 · Register — reality is recorded</p>
      <h1 className="page-title">
        This is what the system believes happened, and this is why.
      </h1>

      <div className="prose" style={{ marginTop: 18 }}>
        <p>
          A record earns its place by carrying six things: an identifier, a
          timestamp, a source, an evidence state, its provenance, and the route
          where the evidence can be inspected. A row missing any of them is not
          published — the register would rather hold six honest rows than seven
          where the seventh cannot be checked by anyone.
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
        <StatusBand />
      </div>

      {/* The six record classes. Each links to the surface where that
          record is actually written — a register row that points nowhere
          is a dead node, and the contract removes those. */}
      <section className="section" aria-labelledby="classes-heading">
        <div className="section-head">
          <h2 className="section-title" id="classes-heading">
            Record classes
          </h2>
          <p className="label">{REGISTERS.length} registers</p>
        </div>

        <div className="register" role="table" aria-labelledby="classes-heading">
          <RegisterHead />
          {REGISTERS.map((r) => (
            <RegisterRow
              key={r.ord}
              id={r.ord}
              name={r.name}
              what={r.what}
              recorded="2026-09"
              state={r.state}
              source={{ label: r.href, href: r.href }}
              provenance={r.provenance}
            />
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <Tally records={REGISTERS} caption="record classes" />
        </div>
      </section>

      {/* The load-bearing empty state of the whole system. A register
          that invents rows to avoid looking bare has become a document
          archive; this one states the absence and says what would
          legitimately fill it. */}
      <section className="section" aria-labelledby="held-heading">
        <div className="section-head">
          <h2 className="section-title" id="held-heading">
            Records held
          </h2>
          <p className="label">Instance records · device-local</p>
        </div>

        <EmptyState
          title="Nothing registered yet"
          body="No institutional record has been entered. Records appear here when an operator enters them on their own device in the console — a roster, an attendance register, a set of marks, an invoice. Nothing is entered on your behalf, and nothing arrives from a server."
          unit="record"
          why="No institution has run this system. There is no shared database for records to arrive from, by design: custody of the record stays with the institution that holds it."
          unblocks="Opening the console and entering one day's attendance. That single row is enough to make this register non-empty and inspectable."
          state="UNKNOWN — the contents are unestablished, not zero. The count of records in this repository is not a count of records in the world."
        />

        <div className="prose" style={{ marginTop: 22 }}>
          <p>
            The distinction matters more than it looks. A device-local count is
            a reading about one browser, and publishing it as an institutional
            figure would be the exact failure this system is built to prevent.
            So the figure is not published at all.
          </p>
        </div>
      </section>

      {/* How a row becomes evidence. This is the method behind the
          grammar — the reason a row can be trusted, and the reason a
          reader can tell when it cannot. */}
      <section className="section" aria-labelledby="anatomy-heading">
        <div className="section-head">
          <h2 className="section-title" id="anatomy-heading">
            Anatomy of a row
          </h2>
          <p className="label">Six fields · no exceptions</p>
        </div>

        <div className="register" role="table" aria-labelledby="anatomy-heading">
          <RegisterRow
            id="ID"
            name="Identifier"
            what="A stable reference for the record. It does not change when the record's contents are corrected, so a decision that cited it still resolves."
            recorded="Required"
            state="VERIFIED"
            source={{ label: "Every row" }}
            provenance="Every row renders its identifier first, in the mono register, because a claim without an identifier cannot be cited back to."
          />
          <RegisterRow
            id="TIMESTAMP"
            name="Timestamp"
            what="When the record was made, not when it was reported. The distinction is what keeps a late-entered attendance register honest."
            recorded="Required"
            state="VERIFIED"
            source={{ label: "Every row" }}
            provenance="A record that cannot say when it was made can only say when it arrived, which is a different claim."
          />
          <RegisterRow
            id="SOURCE"
            name="Source"
            what="Who or what produced the record: a person, a device, a document, an imported file. Not a department name."
            recorded="Required"
            state="VERIFIED"
            source={{ label: "Every row" }}
            provenance="Source is what makes a record auditable by someone who was not present and does not trust the operator."
          />
          <RegisterRow
            id="STATE"
            name="Evidence state"
            what="One of VERIFIED, PROTOTYPE, TARGET, PLANNED, UNKNOWN — never blank, never carried by colour alone."
            recorded="Required"
            state="VERIFIED"
            source={{ label: "/evidence", href: "/evidence" }}
            provenance="The five states, and what each one forbids, are published in full on the evidence route so any tag can be looked up."
          />
          <RegisterRow
            id="PROVENANCE"
            name="Provenance"
            what="The sentence saying why this row is allowed to exist, and what it does not establish."
            recorded="Required"
            state="VERIFIED"
            source={{ label: "Every row" }}
            provenance="Provenance is the row's own honesty check: it states the limit of the claim as well as the claim itself."
          />
          <RegisterRow
            id="ROUTE"
            name="Route"
            what="The surface where this record can be opened and inspected. A row pointing nowhere is not published."
            recorded="Required"
            state="VERIFIED"
            source={{ label: "This site" }}
            provenance="Inspectability is the whole claim: if a record cannot be opened it is an assertion, and assertions do not enter the register."
          />
        </div>

        <div className="action-row" style={{ marginTop: 28 }}>
          <Link href="/intelligence" className="btn">
            Next — what records become
          </Link>
          <Link href="/evidence" className="btn-ghost">
            The evidence states
          </Link>
        </div>
      </section>
    </>
  );
}