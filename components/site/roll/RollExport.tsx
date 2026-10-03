"use client";

import { useState } from "react";
import {
  KEYS,
  ledgerToCsv,
  ledgerToJson,
  ledgerVersion,
  masterHash,
  shortHash
} from "@/lib/ledger";
import type { RollRecord } from "./record";

/**
 * The export — the only way anything leaves this device, and it leaves
 * because the visitor carries it out by hand.
 *
 * Two formats because two readers: CSV for a person opening a
 * spreadsheet, JSON for a machine. The CSV header is fixed in
 * lib/ledger.ts and has no column for the crucible reading, so the JSON is
 * the copy that carries it — stated here rather than discovered later by
 * someone comparing the two exports.
 *
 * The wipe is the honest inverse: a prototype that can only ever add to
 * local storage is a prototype that quietly fills someone's browser.
 */
export function RollExport({
  records,
  onWipe,
}: {
  records: RollRecord[];
  onWipe: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState("");

  const count = records.length;
  const version = ledgerVersion(count);
  const master = masterHash(records.map((r) => r.hash));

  function save(text: string, filename: string, type: string) {
    if (typeof window === "undefined") return;
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(`${filename} · ${text.length} bytes written to your downloads`);
  }

  return (
    <section className="section" aria-labelledby="export-heading">
      <div className="section-head">
        <h2 className="section-title" id="export-heading">
          Take the roll with you
        </h2>
        <p className="section-kicker">
          Version <span className="figure">{version}</span> ·{" "}
          <span className="figure">{count}</span> record{count === 1 ? "" : "s"}{" "}
          on this device
        </p>
      </div>

      <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
        <p>
          A browser holds what you give it and loses it when you clear it.
          Exporting is how the record outlives the tab: the file is written to
          your own downloads folder and goes nowhere else. It is a file you
          now own, and nothing is attached to it but the columns below.
        </p>
      </div>

      <div className="action-row">
        <button
          className="btn"
          type="button"
          onClick={() =>
            save(ledgerToCsv(records), `apt-labs-roll-${version}.csv`, "text/csv;charset=utf-8")
          }
        >
          Download CSV
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={() =>
            save(ledgerToJson(records), `apt-labs-roll-${version}.json`, "application/json")
          }
        >
          Download JSON
        </button>
        <p className="hint" style={{ maxWidth: "40ch" }}>
          CSV carries the eight ledger columns. JSON carries those and the
          crucible reading, because the CSV header is fixed in the ledger and
          has no column for it.
        </p>
      </div>

      {saved ? (
        <p className="register-provenance" role="status" style={{ marginTop: "var(--s-3)" }}>
          {saved}
        </p>
      ) : null}

      <p className="seal" style={{ marginTop: "var(--s-4)" }}>
        <b>master seal · </b>
        {shortHash(master)} · the whole thing: {master}
        <br />
        <b>over · </b>
        {count} record seal{count === 1 ? "" : "s"} on this device, hashed in
        order. Change a record and this changes; it is a fingerprint of the
        roll as it stands here, not a signature by anyone.
      </p>

      <div className="action-row" style={{ marginTop: "var(--s-4)" }}>
        {confirming ? (
          <div className="gate">
            This deletes {count} record{count === 1 ? "" : "s"}, the handle
            and the record id from this browser
            {count === 1 ? "" : "s"} —
            {count === 1 ? " it" : " them"} cannot be recovered from here.
            Export first if you want to keep {count === 1 ? "it" : "them"}.
            <div className="action-row" style={{ marginTop: "var(--s-3)" }}>
              <button
                className="btn btn-sm"
                type="button"
                onClick={() => {
                  onWipe();
                  setConfirming(false);
                  setSaved("");
                }}
              >
                Yes, wipe this device
              </button>
              <button
                className="btn-ghost btn-sm"
                type="button"
                onClick={() => setConfirming(false)}
              >
                Keep the roll
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-ghost btn-sm"
            type="button"
            onClick={() => setConfirming(true)}
          >
            Wipe this device
          </button>
        )}
      </div>

      <p className="register-provenance" style={{ marginTop: "var(--s-3)" }}>
        The wipe clears three keys in this browser — the roll
        (<code>{KEYS.members}</code>), the handle ({KEYS.identity}) and the
        record id ({KEYS.myid}). It touches nothing else on this site: builds
        and notes posted elsewhere on the floor are their own records and stay
        where they are.
      </p>
    </section>
  );
}