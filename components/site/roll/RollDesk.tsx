"use client";

import { useEffect, useState } from "react";
import { CRUCIBLE_QS, KEYS, type Member, loadStored, saveStored, seal } from "@/lib/ledger";
import { myUsername } from "@/lib/benben";
import { Crucible } from "./Crucible";
import { JoinForm } from "./JoinForm";
import { RollCard } from "./RollCard";
import { RollExport } from "./RollExport";
import {
  asRollRecord,
  makeRecordId,
  type CrucibleResult,
  type RollRecord,
  type SignUpInput
} from "./record";

/**
 * The desk — everything on this route that touches storage.
 *
 * There is no fetch in this file and there never will be one: the roll is
 * read from localStorage on mount and written back to it, so the browser
 * holding the record is the only party to the transaction. Two states are
 * distinguished carefully, because conflating them is how a prototype
 * starts lying:
 *
 *   no record      the join form, and the crucible is *closed* — a gate
 *                  block that says why, never a form that does nothing
 *   a record       the roll card, the crucible, and the export
 *
 * A third case exists and is handled rather than ignored: a record on the
 * device that this browser is not holding the handle for. That is a
 * stranded ledger, not an empty one, so it is named as such instead of
 * quietly offering a second signing.
 */
export function RollDesk() {
  const [ready, setReady] = useState(false);
  const [records, setRecords] = useState<RollRecord[]>([]);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    setRecords(loadStored<Member>(KEYS.members).map(asRollRecord));
    setMe(myUsername());
    setReady(true);
  }, []);

  const current = me ? records.find((r) => r.username === me) ?? null : null;
  const taken = records.map((r) => r.username);
  const handles = records.map((r) => `@${r.username}`).join(", ");

  function write(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function signUp(input: SignUpInput) {
    const member: Member = {
      id: makeRecordId(),
      name: input.name,
      username: input.username,
      occupation: input.occupation,
      location: input.location,
      skills: input.skills,
      // The record is sealed as it is written, below. This flag says the
      // local seal exists — it is not a verification by anyone else.
      verified: true,
      hash: ""
    };
    const record: RollRecord = { ...member, hash: seal(member), crucible: null };

    const next = [...records, record];
    saveStored(KEYS.members, next);
    // The identity key is what myUsername() reads, and the whole rest of
    // the floor finds this person through it.
    write(KEYS.identity, { username: record.username });
    write(KEYS.myid, record.id);

    setRecords(next);
    setMe(record.username);
  }

  function recordCrucible(result: CrucibleResult | null) {
    if (!current) return;
    const next = records.map((r) =>
      r.id === current.id ? { ...r, crucible: result } : r
    );
    saveStored(KEYS.members, next);
    setRecords(next);
  }

  function wipeDevice() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEYS.members);
      window.localStorage.removeItem(KEYS.identity);
      window.localStorage.removeItem(KEYS.myid);
    }
    setRecords([]);
    setMe(null);
  }

  if (!ready) {
    return (
      <p className="gate">
        Reading this device&rsquo;s roll. Nothing is fetched — the record, if
        there is one, is already in this browser.
      </p>
    );
  }

  return (
    <>
      {current ? (
        <>
          <RollCard record={current} recordCount={records.length} />
          <Crucible result={current.crucible} onRecord={recordCrucible} />
        </>
      ) : (
        <>
          <JoinForm taken={taken} onSignUp={signUp} />
          <section className="section" aria-labelledby="crucible-closed-heading">
            <div className="section-head">
              <h2 className="section-title" id="crucible-closed-heading">
                The crucible
              </h2>
              <p className="section-kicker">
                {CRUCIBLE_QS.length} questions · closed until you sign
              </p>
            </div>
            <div className="gate">
              The crucible is closed until you sign the roll.{" "}
              <a href="#roll-join">Sign the roll above</a> and it opens here, on
              this device, in this browser. There is nothing to fetch, no
              account to create, and nobody waiting to see the result.
            </div>
          </section>
        </>
      )}

      {records.length > 0 && !current ? (
        <p className="local-note" style={{ marginTop: "var(--s-4)" }}>
          <strong>Stranded record · </strong>
          {records.length} record{records.length === 1 ? "" : "s"} sit on this
          device under {handles}, but this browser is not holding the handle
          for {records.length === 1 ? "it" : "them"}, so there is nobody here
          to seat. Signing again would write a second record beside{" "}
          {records.length === 1 ? "it" : "them"}. Export the roll below to keep{" "}
          {records.length === 1 ? "it" : "them"}, or wipe this device to start
          clean.
        </p>
      ) : null}

      {records.length > 0 ? (
        <RollExport records={records} onWipe={wipeDevice} />
      ) : null}
    </>
  );
}