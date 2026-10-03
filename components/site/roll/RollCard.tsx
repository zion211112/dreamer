"use client";

import { CRUCIBLE_QS, shortHash } from "@/lib/ledger";
import type { RollRecord } from "./record";

/**
 * The roll card — the record as it now stands on this device.
 *
 * It is a card rather than a list because there is exactly one reader: the
 * person whose browser this is. A register that looked like a directory
 * would be the first lie on this route, so the count beside the heading is
 * "records on this device" and never "members".
 *
 * The seal gets its own paragraph, including the part it does not cover.
 * `canonical()` in lib/ledger.ts seals id, name, occupation and location —
 * the handle and the skill slugs sit outside the hash — so the honest claim
 * for the seal is narrower than "this record is unedited", and the copy
 * states the narrow version rather than the broad one.
 */
export function RollCard({
  record,
  recordCount,
}: {
  record: RollRecord;
  recordCount: number;
}) {
  const reading = record.crucible;

  return (
    <section className="section" aria-labelledby="roll-card-heading">
      <div className="section-head">
        <h2 className="section-title" id="roll-card-heading">
          Your record
        </h2>
        <p className="section-kicker">
          {recordCount} record{recordCount === 1 ? "" : "s"} on this device
        </p>
      </div>

      <div className="roll-card">
        <div className="register register--std" style={{ borderTop: 0 }}>
          <div className="register-row register--std" role="row">
            <div className="register-cell register-cell--id" role="cell">
              <div className="register-id">{record.id}</div>
              <div className="register-name" style={{ marginTop: 4 }}>
                @{record.username}
              </div>
            </div>

            <div className="register-cell" role="cell" data-field="Holds">
              <div>{record.name}</div>
              <div className="register-provenance" style={{ marginTop: 8 }}>
                Trade · {record.occupation} · Where · {record.location}
              </div>
              <div className="register-provenance" style={{ marginTop: 6 }}>
                Skills ·{" "}
                {record.skills.length > 0
                  ? record.skills.join(", ")
                  : "none claimed — that is a claim not made, not a missing field"}
              </div>
            </div>

            <div className="register-cell" role="cell" data-field="Seal">
              <div className="register-provenance">{shortHash(record.hash)}</div>
              <div className="register-provenance" style={{ marginTop: 8 }}>
                Written as the record was signed, in this tab.
              </div>
            </div>

            <div className="register-cell" role="cell" data-field="Reading">
              {reading ? (
                <>
                  <span className="tier-badge" data-pass={reading.pass ? "true" : "false"}>
                    {reading.tier}
                  </span>
                  <div className="register-provenance" style={{ marginTop: 8 }}>
                    {reading.score}/{CRUCIBLE_QS.length} correct, recomputed
                    here from your own answers.
                  </div>
                </>
              ) : (
                <div className="register-provenance">
                  No reading yet — the crucible below has not been taken on
                  this device.
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="seal" style={{ marginTop: "var(--s-3)" }}>
          <b>seal · </b>
          {shortHash(record.hash)} · the whole thing: {record.hash}
        </p>

        <p className="local-note" style={{ marginTop: "var(--s-3)" }}>
          <strong>The seal · </strong>a SHA-256 hash of your own record,
          computed in this browser. Recompute it over the same record and it
          matches; that is the entire claim — it shows the record has not been
          edited since you sealed it, on this device, where you can also edit
          it. It is not an identity, not a credential, not a token and not a
          signature; nobody issued it and nobody received it, because there is
          no server to receive anything. It covers your id, name, trade and
          location — the handle and the skills slugs sit outside the hash, so
          a changed handle or a changed slug would leave it intact.
        </p>

        <p className="local-note" style={{ marginTop: "var(--s-2)" }}>
          <strong>The tier · </strong>a reading of how you answered eight
          questions, derived in this tab from answers you gave. It is not a
          status issued by anyone, it opens nothing here or anywhere else, and
          it is not a certificate, a credential or a membership of anything.
          Change one answer and it is derived again, which is the only thing
          it is for.
        </p>
      </div>
    </section>
  );
}