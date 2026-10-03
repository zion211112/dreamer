import type { Metadata } from "next";
import Link from "next/link";
import { StateTag } from "@/components/site/StateTag";
import { BuildsDesk } from "@/components/site/builds/BuildsDesk";
import { MAX_ATTACH_BYTES } from "@/lib/benben";
import { RISKS, ratifyTerms } from "@/lib/board";

export const metadata: Metadata = {
  title: "The floor",
  description:
    "Open work you can act on: read the floor, vote, take a seat, log progress, post a build. Every record lives in this browser — there is no server.",
};

/**
 * THE FLOOR — the one route on this site where a visitor acts rather than
 * reads.
 *
 * Everything else here describes a system. This page is the system doing
 * something: six builds standing on the floor, seats to be taken, votes to be
 * cast, progress to be logged, and a form to put a new build up. The work is
 * real work — a footbridge over reeds in Mwea, a Swahili legal agent for small
 * firms, a purple-team kit for Kenyan SMEs — and the board that tracks it is
 * real logic in lib/board.ts, reading append-only signals into a life state.
 *
 * What is not real is transport, and the page says so where the buttons are
 * rather than only here. There is no server. Every record on this floor is a
 * row in this browser's localStorage, every tally is a count of rows this
 * device holds, and the six day-one builds are committed fixtures rather than
 * postings anybody made.
 */
export default function BuildsPage() {
  return (
    <>
      <p className="label">The floor · acting, not describing</p>
      <h1 className="page-title">
        Read the work. Take a seat on it. Or put your own up.
      </h1>

      <p className="lede" style={{ marginTop: "var(--s-4)" }}>
        This is the one route here where a visitor does something instead of
        reading about a system that can. Below: six builds standing on the
        floor, the votes and seats and lines of progress that move them, and a
        form for adding your own. Every one of those records lives in this
        browser — there is no server, nothing is transmitted, and every count
        you see is a count of what this device holds.
      </p>

      <BuildsDesk />

      {/* ── WHAT ACTING HERE ACTUALLY DOES ─────────────────────────
          A register of the controls, in the same grammar as every other
          table on this site: what each one does, where its record goes,
          and the state that state is honestly in. Three of them are
          listed as PLANNED rather than quietly omitted, because their
          absence would read as an oversight and their presence is the
          honest answer: the reviewer seat and the closing attestation
          both need a tier this site cannot reach. */}
      <section className="section" aria-labelledby="controls-heading">
        <div className="section-head">
          <h2 className="section-title" id="controls-heading">
            What acting here actually does
          </h2>
          <p className="section-kicker">Control · record · state</p>
        </div>

        <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
          <p>
            Three of the seven controls below are built and running on this
            device. Three more are built and closed here, because the tier they
            require cannot be reached on this site. The last is a field in the
            record type that no form on this site writes. None of the three
            closed ones is presented as a working button.
          </p>
        </div>

        <div className="register" role="table" aria-labelledby="controls-heading">
          <div className="register-head register--std" role="row">
            <span role="columnheader">Control</span>
            <span role="columnheader">What it does</span>
            <span role="columnheader">Where the record goes</span>
            <span role="columnheader">State</span>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Read the floor</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                boardOrder ranks this browser&rsquo;s records plus the six day-one
                fixtures by derived life state, then by the upvotes held in votedBy,
                then by age. canView filters before the sort.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">Derived on render</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PROTOTYPE" />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Vote up or down</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                castVote replaces your own signal rather than adding to it, and
                locks it for sixty seconds. Both refusals are printed on the
                card, unedited.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">votedBy, votes</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PROTOTYPE" />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Take the builder seat</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                submitClaim with one line of reason, 80 characters. The claim
                lands pending; only the author of the record can grant it, and
                acceptClaim refuses anyone else in so many words.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">claims</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PROTOTYPE" />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Log a line of progress</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                logProgress, one line at a time, 200 characters, and only from a
                hand already seated as a builder. It is the signal that moves a
                build from claimed to in motion.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">progress</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PROTOTYPE" />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Take the reviewer seat</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                submitClaim takes it at the hall tier only. tierOf reads paid and
                hallPaid off a member record, lib/ledger.ts has no such fields,
                and no route on this site writes them — so there is no path to
                it here and the control is drawn closed on every card.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">—</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PLANNED" />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Attest it, and close it</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                attest counts an attestation once per hand, never from the hand
                that built, and never without evidence. It answers a hall hand or
                a seated reviewer — the reviewer seat being unreachable here, so
                no build on this site can close.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">attestations</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PLANNED" />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Ratification</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                RATIFY sets a bar of two to five voters by risk class. One device
                holds one roll record, so the bar cannot be met by voting on this
                site and no build here reads as ratified. The rule is doing its
                job; it is not a defect in this page.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">—</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PLANNED" />
            </div>
          </div>

          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-name">Attach a file</div>
            </div>
            <div className="register-cell" role="cell" data-field="Does">
              <div className="register-provenance" style={{ maxWidth: "56ch" }}>
                The record type carries attachments, capped at{" "}
                {MAX_ATTACH_BYTES.toLocaleString()} bytes for the browser&rsquo;s
                roughly 5MB of storage. No form on this site wires a file input,
                so the field stays empty on every record here.
              </div>
            </div>
            <div className="register-cell" role="cell" data-field="Record">
              <div className="register-date">attachments</div>
            </div>
            <div className="register-cell" role="cell" data-field="State">
              <StateTag state="PLANNED" />
            </div>
          </div>
        </div>

        {/* The bar each risk class sets, printed from the same function the
            post form reads, so the two cannot disagree. */}
        <div className="section-head" style={{ marginTop: "var(--s-6)", marginBottom: "var(--s-3)" }}>
          <h3 className="section-title" id="risk-heading">
            What each risk class costs
          </h3>
          <p className="section-kicker">
            ratifyTerms · the bar, the window, the quorum
          </p>
        </div>
        <div className="register" role="table" aria-labelledby="risk-heading">
          <div className="register-head register--std" role="row">
            <span role="columnheader">Risk class</span>
            <span role="columnheader">Bar</span>
            <span role="columnheader">Window</span>
            <span role="columnheader">Closes at</span>
          </div>
          {RISKS.map((r) => {
            const t = ratifyTerms(r);
            return (
              <div className="register-row register--std" role="row" key={r}>
                <div className="register-cell register-cell--id" role="cell">
                  <div className="register-name">{r}</div>
                </div>
                <div className="register-cell" role="cell" data-field="Bar">
                  <div className="register-provenance">{t.barLabel}</div>
                </div>
                <div className="register-cell" role="cell" data-field="Window">
                  <div className="register-provenance">{t.windowLabel}</div>
                </div>
                <div className="register-cell" role="cell" data-field="Closes">
                  <div className="register-provenance">{t.closeLabel}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="local-note" style={{ marginTop: "var(--s-4)" }}>
          <strong>Before you take any of this off the device.</strong> Nothing on this
          page has been sent to a server, and nothing on it describes a community. The
          six day-one builds are text committed in a source file; three of them carry a
          vote count of 12 and three carry 0, and those are constants in the file, not
          observed voters. The only vote numbers this page reports are the ones in your
          own browser&rsquo;s records.
        </div>

        <div className="action-row" style={{ marginTop: "var(--s-4)" }}>
          <Link href="/roll" className="btn">
            Take the roll
          </Link>
          <Link href="/evidence" className="btn-ghost">
            What is not established
          </Link>
        </div>
      </section>
    </>
  );
}