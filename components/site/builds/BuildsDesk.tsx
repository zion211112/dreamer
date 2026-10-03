"use client";

/**
 * THE FLOOR, AS A WORKING SURFACE.
 *
 * One device, one list, one order. Everything a visitor can do to a build
 * happens here: read it, vote on it, take a seat on it, log a line of progress
 * against it, post one of their own.
 *
 * The list is `mergeBuilds()` — this browser's records plus the six day-one
 * fixtures, deduplicated by id — filtered by `canView` and ordered by
 * `boardOrder`. The order is never taken from array order: boardOrder ranks by
 * derived life state, then by upvotes held in votedBy, then by age, and that
 * ranking is what puts a build somebody is actually building above a build
 * nobody has touched.
 *
 * Storage is read after mount and never during render. The seeds mint their
 * timestamps when the module is evaluated, which on the server and in the
 * browser are two different moments, so reading them during render would hand
 * the server's clock to the browser and break hydration on every age line.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BENBEN_KEY,
  canView,
  castVote,
  mergeBuilds,
  myUsername,
  persistBuilds,
  type Build,
} from "@/lib/benben";
import { boardOrder } from "@/lib/board";
import { BuildTicket } from "./BuildTicket";
import { PostBuild } from "./PostBuild";
import { deviceTally, isFixture, tierOnDevice } from "./floorRules";

export function BuildsDesk() {
  const [ready, setReady] = useState(false);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const tier = tierOnDevice(username);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBuilds(mergeBuilds());
    setUsername(myUsername());
    setNow(Date.now());
    setReady(true);
  }, []);

  // Two tabs, one device: a write in either is a record this browser now
  // holds, so the other tab re-reads rather than showing a stale floor.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === BENBEN_KEY && e.newValue) {
        setBuilds(mergeBuilds());
        setNow(Date.now());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const ordered = useMemo(() => {
    if (!ready) return [];
    const visible = builds.filter((b) => canView(b, username ?? "", tier));
    return boardOrder(visible, now);
  }, [builds, username, tier, now, ready]);

  const fixtures = ordered.filter(isFixture).length;
  const signals = ordered.reduce(
    (acc, b) => {
      const t = deviceTally(b);
      return { up: acc.up + t.up, down: acc.down + t.down };
    },
    { up: 0, down: 0 }
  );

  /** Replace one record in place and write the whole list to this device. */
  function commit(next: Build) {
    const list = builds.map((x) => (x.id === next.id ? next : x));
    persistBuilds(list);
    setBuilds(list);
    setNow(Date.now());
  }

  /** castVote over the whole list; the verbatim refusal comes back to the card. */
  function vote(id: string, value: 1 | -1): string | null {
    if (!username) return null;
    const at = Date.now();
    const res = castVote(builds, id, username, value, at);
    if (res.err) return res.err;
    persistBuilds(res.list);
    setBuilds(res.list);
    setNow(at);
    return null;
  }

  function reread() {
    setBuilds(mergeBuilds());
    setNow(Date.now());
  }

  return (
    <>
      {/* ── THE FLOOR ──────────────────────────────────────────────
          The honesty rule, at the point of use and not only in the
          footer: every vote, seat, line of progress and attestation
          below is written to this browser. Nothing is transmitted,
          nothing is shared, and no tally here describes anybody but
          the person holding this device. */}
      <section className="section" aria-labelledby="floor-heading">
        <div className="section-head">
          <h2 className="section-title" id="floor-heading">
            The floor
          </h2>
          <p className="section-kicker">
            Open work · ordered by boardOrder, never by array order
          </p>
        </div>

        <p className="local-note">
          <strong>Nothing here is transmitted.</strong> There is no server. Every vote,
          seat, line of progress and attestation below is written to this browser&rsquo;s
          localStorage and describes records this device holds — including the six
          day-one fixtures, which are committed text in lib/benben.ts and are not
          postings anybody made. A vote here is a signal, not a mandate.
        </p>

        {username ? (
          <p className="hint" style={{ marginTop: "var(--s-3)" }}>
            Signed @{username} as {tier} on this device. Voting, the builder seat and
            progress lines are open. The reviewer seat and every closing attestation are
            closed, and each card says why.
          </p>
        ) : (
          <p className="gate" style={{ marginTop: "var(--s-3)" }}>
            Acting needs a roll record on this device — a username, never a phone
            number. Without one you can read the floor and post to it; voting, seats and
            closing are shut. <Link href="/roll">Take the roll</Link> and they open.
          </p>
        )}

        {ready ? (
          <p className="hint" style={{ marginTop: "var(--s-3)" }}>
            {ordered.length} records on this device — {fixtures} of them day-one
            fixtures, {ordered.length - fixtures} posted here. Signals in this browser:{" "}
            {signals.up} up, {signals.down} down.
          </p>
        ) : (
          <p className="hint" style={{ marginTop: "var(--s-3)" }}>
            Reading this device&rsquo;s records…
          </p>
        )}

        {ready && ordered.length === 0 ? (
          <p className="local-note">
            <strong>Empty.</strong> canView returned nothing for this reader, which on
            this site means the floor holds no record they may open. Post one below and
            it appears here immediately.
          </p>
        ) : null}

        <ul className="floor" style={{ marginTop: "var(--s-4)" }}>
          {ordered.map((b) => (
            <BuildTicket
              key={b.id}
              b={b}
              now={now}
              username={username}
              tier={tier}
              onCommit={commit}
              onVote={vote}
            />
          ))}
        </ul>

        {/* The arithmetic behind every number on the cards, stated once
            here rather than repeated per card. */}
        <p className="hint" style={{ marginTop: "var(--s-4)", maxWidth: "72ch" }}>
          Every count on this floor is a count of records in this browser. The board
          line on a card reads the votes in <code>votedBy</code> against the bar
          <code> RATIFY</code> sets for that build&rsquo;s risk class — and the bar is
          two to five voters. One device holds one roll record, so a build here cannot
          reach <code>ratified</code> by voting: that is the rule working, not a fault
          in this page. Nothing below has ever been counted by anyone else.
        </p>
      </section>

      {/* ── POST A BUILD ──────────────────────────────────────────────
          The way onto the floor. Everything the card reads back is
          written here, and validateBuild decides whether it is
          allowed to stand. */}
      <section className="section" aria-labelledby="post-heading">
        <div className="section-head">
          <h2 className="section-title" id="post-heading">
            Post a build
          </h2>
          <p className="section-kicker">
            {username ? `Signed @${username}` : "Unsigned — it will stand as Guest"}
          </p>
        </div>

        <div className="prose" style={{ marginBottom: "var(--s-4)" }}>
          <p>
            A build on this floor is a written ask: what the work is, what it is
            missing, and the sentence that says what done looks like. The validator is
            the gate and it is not negotiable — no title, no done line, no stated need
            and no emoji gets past it, and when it refuses, its own sentence is what
            you will read.
          </p>
        </div>

        <PostBuild username={username} tier={tier} onPosted={reread} />
      </section>
    </>
  );
}