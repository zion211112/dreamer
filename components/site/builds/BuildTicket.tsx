"use client";

/**
 * ONE BUILD, ON THE FLOOR.
 *
 * The card is the whole working surface for a single record, and it is
 * ordered the way the record itself is committed:
 *
 *   what it is · what it needs · what done looks like · who is holding
 *   which seat · what has moved · what is still missing to close.
 *
 * The done-line sits above everything a reader can act on and gets the most
 * weight on the card, because a build without a written definition of done is
 * a wish — `validateBuild` will not let one onto the floor without it, and
 * the close of the build is decided by that sentence alone.
 *
 * Three of the controls here cannot succeed on this site, and none of them is
 * hidden: the reviewer seat, the attestation, and (for a reader without a roll
 * record) voting. Each is rendered with a `.gate` that names what is closed and
 * why, in the words lib/board.ts itself uses. Where a refusal depends on
 * something only the logic knows — whether you have already taken the seat,
 * whether your last vote is inside the 60-second lock — the control stays live
 * and the message the function returns is rendered unedited in the `.err`.
 */

import Link from "next/link";
import { useState } from "react";
import { needsLine, timeAgo, type Build, type BoardClaim, type FloorTier } from "@/lib/benben";
import {
  acceptClaim,
  activeBuilders,
  attest,
  boardStatus,
  deriveState,
  logProgress,
  submitClaim,
  withdrawClaim,
} from "@/lib/board";
import { StateTag } from "@/components/site/StateTag";
import {
  QUOTED,
  closeReadout,
  deviceTally,
  isFixture,
  lifeMark,
  originWord,
} from "./floorRules";

type TicketProps = {
  b: Build;
  now: number;
  username: string | null;
  tier: FloorTier;
  /** Replace one record in the floor and write it to this device. */
  onCommit: (next: Build) => void;
  /** castVote over the whole list; returns the verbatim refusal, or null. */
  onVote: (id: string, value: 1 | -1) => string | null;
};

export function BuildTicket({ b, now, username, tier, onCommit, onVote }: TicketProps) {
  const [err, setErr] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [seatOpen, setSeatOpen] = useState(false);
  const [progress, setProgress] = useState("");
  const [evidence, setEvidence] = useState("");

  const uid = (s: string) => `${b.id}-${s}`;
  const life = deriveState(b, now);
  const tally = deviceTally(b);
  const close = closeReadout(b);
  const authors = activeBuilders(b);
  const seated = username
    ? authors.some((x) => x.toLowerCase() === username.toLowerCase())
    : false;
  const isAuthor = !!username && username === b.by;

  // ── the five mutations, each one wired to the library and nothing else ──
  function doVote(value: 1 | -1) {
    setErr(onVote(b.id, value));
  }

  function raiseSeat() {
    const res = submitClaim(b, username ?? "", tier, "builder", reason, Date.now());
    setErr(res.err);
    if (!res.err) {
      setReason("");
      setSeatOpen(false);
      onCommit(res.b);
    }
  }

  function seatClaim(c: BoardClaim) {
    const res = acceptClaim(b, username ?? "", c.by, c.role, tier, Date.now());
    setErr(res.err);
    if (!res.err) onCommit(res.b);
  }

  function pullClaim(c: BoardClaim) {
    const res = withdrawClaim(b, username ?? "", c.by, c.role, Date.now());
    setErr(res.err);
    if (!res.err) onCommit(res.b);
  }

  function postProgress() {
    const res = logProgress(b, username ?? "", progress, Date.now());
    setErr(res.err);
    if (!res.err) {
      setProgress("");
      onCommit(res.b);
    }
  }

  function closeOut() {
    const res = attest(b, username ?? "", evidence, tier, Date.now());
    setErr(res.err);
    if (!res.err) {
      setEvidence("");
      onCommit(res.b);
    }
  }

  return (
    <li className="ticket">
      <div className="ticket-top">
        <h3 className="ticket-title">{b.title}</h3>
        <span className="hint">{lifeMark(life)}</span>
      </div>

      <div className="ticket-meta">
        <span>{b.domain}</span>
        <span>{b.type}</span>
        <span>{b.location}</span>
        <span>{timeAgo(b.createdTs, now)} old</span>
        <span>state {life}</span>
        <span>{b.risk} risk</span>
        <span>by @{b.by}</span>
        <span>{originWord(b)}</span>
      </div>

      <p className="ticket-body">{b.body}</p>

      <p className="needs">{needsLine(b)}</p>

      {/* The most prominent line on the card, and the one that decides
          whether the build may ever close. */}
      <p className="done-line">
        <b>Done when</b>
        {b.done}
      </p>

      <p className="hint" style={{ marginTop: "var(--s-2)" }}>
        Board — {boardStatus(b, now)}
      </p>

      {/* The evidence state of the record itself. PROTOTYPE because that is
          exactly what it is: a local surface, inspectable by anyone who opens
          the route, transmitted to nobody. The sentence behind it names which
          of the two kinds of record this is. */}
      <div style={{ marginTop: "var(--s-3)" }}>
        <StateTag
          state="PROTOTYPE"
          title={
            isFixture(b)
              ? "Day-one fixture committed in lib/benben.ts. Authored content, not a posting observed anywhere; its vote field is a constant in the file."
              : "Written on this device by the roll on this device. No server has received it and no other device holds it."
          }
        />
      </div>

      {/* ── the fixture's baked vote count, named as a constant ──────────
          Three of the six day-one records carry votes: 12 and three carry
          0, written into the seed literal. Those are not observed voters
          and must never read as a tally, so the only vote numbers this
          card shows are the ones derived from votedBy — which is this
          browser's record and nobody else's. */}
      {isFixture(b) ? (
        <p className="hint" style={{ marginTop: "var(--s-2)" }}>
          <b>Fixture</b> the day-one record carries votes: {b.votes}. That is a constant
          written into lib/benben.ts, not a count of people and not a tally. The vote
          numbers below are the only ones here that mean anything: they are counted
          out of votedBy, on this device.
        </p>
      ) : null}

      {/* ── seats ────────────────────────────────────────────────────── */}
      <div className="seats">
        <p className="hint">Seats</p>
        {b.claims.length === 0 ? (
          <p className="hint">
            No hand raised. A seat is a claim with a name and one line of reason.
          </p>
        ) : (
          b.claims.map((c) => {
            const mine = !!username && c.by.toLowerCase() === username.toLowerCase();
            return (
              <div className="seat" data-status={c.status} key={`${c.role}-${c.by}-${c.ts}`}>
                <span className="seat-role">{c.role}</span>
                <span>@{c.by}</span>
                <span>{c.status}</span>
                <span>{c.reason}</span>
                <span>{timeAgo(c.ts, now)}</span>
                {c.status === "pending" && isAuthor ? (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => seatClaim(c)}
                  >
                    Seat this hand
                  </button>
                ) : null}
                {mine && c.status !== "withdrawn" ? (
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => pullClaim(c)}
                  >
                    Withdraw
                  </button>
                ) : null}
              </div>
            );
          })
        )}
        {b.claims.some((c) => c.status === "pending") && !isAuthor ? (
          <p className="hint">
            Pending — the author seats it. acceptClaim refuses anyone else with
            &ldquo;{QUOTED.authorSeats}&rdquo;
          </p>
        ) : null}
      </div>

      {/* ── progress, from seated builders ────────────────────────────── */}
      {b.progress.length > 0 ? (
        <div className="seats">
          <p className="hint">Progress — one line each, appended</p>
          {b.progress.map((p, i) => (
            <div className="seat" key={`${p.by}-${p.ts}-${i}`}>
              <span className="seat-role">progress</span>
              <span>@{p.by}</span>
              <span>{p.text}</span>
              <span>{timeAgo(p.ts, now)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* ── attestations that actually count ────────────────────────────
          validAttestations drops the empty, the duplicate and the
          self-signed, so this list is the quorum as the logic counts it,
          not as it was typed. */}
      <div className="seats">
        <p className="hint">
          Closing — {close.have} of {close.need} valid attestation
          {close.need === 1 ? "" : "s"}
          {close.hallNeed > 0 ? `, ${close.hall} of ${close.hallNeed} from the hall` : ""}.
          It {close.closeLabel}. Still needed: {close.missing}.
        </p>
      </div>

      {err ? (
        <p className="err" role="alert" style={{ marginTop: "var(--s-3)" }}>
          {err}
        </p>
      ) : null}

      {/* ── vote ────────────────────────────────────────────────────────
          Up and down are castVote, which is a signal with a 60-second
          per-user lock and a ±1 that replaces rather than accumulates.
          Without a roll record the control is not rendered at all: a gate
          that names the way in takes its place, so nothing on this floor
          is ever a button that silently does nothing. */}
      <div className="ticket-actions">
        {username ? (
          <>
            <button type="button" className="btn btn-sm" onClick={() => doVote(1)}>
              Up
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => doVote(-1)}>
              Down
            </button>
            <span className="hint">
              {tally.up} up, {tally.down} down — cast on this device
              {b.votedBy && Object.keys(b.votedBy).length > 0 && username in b.votedBy
                ? `, including yours ${timeAgo(b.votedBy[username].ts, now)} ago`
                : ""}
            </span>
          </>
        ) : (
          <p className="gate" style={{ flex: "1 0 100%" }}>
            Voting needs a roll record on this device. castVote signs every vote
            with a name, and there is no name here yet.{" "}
            <Link href="/roll">Take the roll</Link> and these two buttons open;
            until then you can read the floor and post to it.
          </p>
        )}
      </div>

      {/* ── the builder seat ───────────────────────────────────────────
          Reach for the seat with one line of reason and the budget shown
          as it is spent, because submitClaim counts characters and not
          goodwill. The gate above it quotes the rule; the button stays
          live so the refusal that actually applies is the one the logic
          returns. */}
      <div className="ticket-actions">
        {seatOpen ? (
          <>
            <div className="field" style={{ flex: "1 0 100%" }}>
              <label className="field-label" htmlFor={uid("reason")}>
                One line, {reason.trim().length}/80
              </label>
              <input
                id={uid("reason")}
                className="input"
                value={reason}
                maxLength={100}
                onChange={(e) => setReason(e.target.value)}
                placeholder="why you can take this one"
              />
              <p className="hint">
                submitClaim refuses a line under three characters and a line over 80.
                The seat is then the author&rsquo;s to grant.
              </p>
            </div>
            <button type="button" className="btn btn-sm" onClick={raiseSeat}>
              Raise the hand
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => {
                setSeatOpen(false);
                setReason("");
              }}
            >
              Leave it
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => setSeatOpen(true)}
          >
            Raise a seat
          </button>
        )}
      </div>

      {!username ? (
        <p className="gate">
          The builder seat is a member seat. With no roll record submitClaim stops at
          the first rule it meets: &ldquo;{QUOTED.unnamed}&rdquo; Behind that one sits
          the second: &ldquo;{QUOTED.visitorSeat}&rdquo;
        </p>
      ) : null}

      {/* The reviewer seat is closed on this site, so it is drawn closed:
          a gate with the reason, never a button that fails. */}
      <p className="gate" style={{ marginTop: "var(--s-3)" }}>
        Reviewer seat — closed here. submitClaim takes it only at the hall tier and
        refuses anything else with &ldquo;{QUOTED.reviewerSeat}&rdquo; No path to the
        hall tier exists on this site: tierOf reads paid and hallPaid off a member
        record, and nothing here writes either.
      </p>

      {/* ── progress, when you hold the seat ───────────────────────────
          logProgress takes one line from a hand that is already building,
          and nothing from anyone else. The form appears only where the
          logic would accept it. */}
      {seated ? (
        <div className="ticket-actions">
          <div className="field" style={{ flex: "1 0 100%" }}>
            <label className="field-label" htmlFor={uid("progress")}>
              One line of progress — {progress.trim().length}/200
            </label>
            <input
              id={uid("progress")}
              className="input"
              value={progress}
              maxLength={220}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="what moved today"
            />
          </div>
          <button type="button" className="btn btn-sm" onClick={postProgress}>
            Log it
          </button>
        </div>
      ) : null}

      {/* ── closing a build ───────────────────────────────────────────
          The attestation is the one act that cannot be performed here at
          all: attest wants the hall tier or a seated reviewer, the
          reviewer seat wants the hall tier, and the hall tier is
          unreachable. Rather than hide the act, the evidence field is
          here, the gate names the refusal, and pressing it returns the
          library's own sentence — the same one quoted above it. */}
      {username && !seated ? (
        <>
          <div className="ticket-actions">
            <div className="field" style={{ flex: "1 0 100%" }}>
              <label className="field-label" htmlFor={uid("evidence")}>
                Evidence for the done line — {evidence.trim().length}/200
              </label>
              <textarea
                id={uid("evidence")}
                className="textarea"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="what a stranger could check"
              />
              <p className="hint">
                attest counts an attestation once per hand, never from a building
                hand, and never without evidence: &ldquo;An attestation is proof, not
                a nod. One line.&rdquo;
              </p>
            </div>
            <button type="button" className="btn btn-sm" onClick={closeOut}>
              Attest it
            </button>
          </div>
          <p className="gate" style={{ marginTop: "var(--s-3)" }}>
            Closing a build is refused on this site. attest requires the hall tier or a
            seated reviewer and answers &ldquo;{QUOTED.closingIsHall}&rdquo; That is
            why the reviewer seat above is closed too. This build can be read and
            voted on here; it cannot be closed here.
          </p>
        </>
      ) : null}
    </li>
  );
}