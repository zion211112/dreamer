import { useState } from "react";
import { Build, FloorTier, BoardRole, timeAgo, needsLine } from "../lib/benben";
import {
  STATE,
  activeBuilders,
  attestationState,
  boardStatus,
  deriveState,
  lineageOf,
  openClaims,
  upDown,
  LifeState
} from "../lib/board";

// The seal: a commitment marker, not a progress meter. The fill's length
// encodes how far down the ladder the build sits; its color, the state.
const SEAL: Record<LifeState, { w: number; c: string; tick?: boolean }> = {
  proposed: { w: 16, c: "bg-amber/40" },
  ratified: { w: 42, c: "bg-amber" },
  claimed: { w: 42, c: "bg-amber", tick: true },
  active: { w: 72, c: "bg-teal" },
  done: { w: 100, c: "bg-teal/85" },
  parked: { w: 42, c: "bg-dim/50" },
  lapsed: { w: 30, c: "bg-dim/30" }
};

const inField =
  "border-b border-ivory/10 bg-transparent px-0 py-1.5 font-mono text-[12px] text-ivory outline-none transition focus:border-amber";
const ghost = "font-mono text-[11px] uppercase tracking-[0.2em] text-amber transition hover:text-ivory";
const ghostDim = "font-mono text-[11px] uppercase tracking-[0.2em] text-dim transition hover:text-ivory";

// One node in the fork family. Filled dot = the live branch; hollow = the rest.
function LineNode({
  b,
  now,
  mark,
  tone,
  tag,
  subject
}: {
  b: Build;
  now: number;
  mark: string;
  tone: string;
  tag: string;
  subject?: boolean;
}) {
  const st = STATE[deriveState(b, now)];
  const { up } = upDown(b);
  return (
    <li className="relative py-2 pl-5">
      <span aria-hidden className="absolute left-0 top-0 h-full w-px bg-ivory/8" />
      <span aria-hidden className={`absolute left-0 top-2 font-mono text-[11px] ${tone}`}>
        {mark}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${subject ? "text-amber" : "text-dim"}`}>
            {tag}
          </span>
          <span className={`font-display ${subject ? "text-[1.05rem] text-ivory" : "text-[0.95rem] text-muted"}`}>
            {b.title}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
          by @{b.by} · {st.name} · ▲{up}
        </p>
      </div>
    </li>
  );
}

// One commitment on the board. No card frame, no avatar, no karma — a ruled
// line, a signature, and the state seal are the furniture. Counts, not noise.
export default function BoardCard({
  b,
  now,
  me,
  tier,
  all,
  onVote,
  onClaim,
  onAccept,
  onWithdraw,
  onProgress,
  onAttest,
  onPark,
  onFork
}: {
  b: Build;
  now: number;
  me: string | null;
  tier: FloorTier;
  all: Build[];
  onVote: (id: string, v: 1 | -1) => void;
  onClaim: (id: string, role: BoardRole, reason: string) => string | null;
  onAccept: (id: string, target: string, role: BoardRole) => string | null;
  onWithdraw: (id: string, role: BoardRole) => string | null;
  onProgress: (id: string, text: string) => string | null;
  onAttest: (id: string, evidence: string) => string | null;
  onPark: (id: string) => string | null;
  onFork: (b: Build) => void;
}) {
  const s = deriveState(b, now);
  const meta = STATE[s];
  const seal = SEAL[s];
  const { up, down } = upDown(b);
  const seated = openClaims(b);
  const builders = activeBuilders(b);
  const atts = attestationState(b);
  const { ancestors, children, hasFork } = lineageOf(b, all, now);
  const open = seated.length;
  const prog = (b.progress ?? []).length;
  const att = (b.attestations ?? []).length;
  const activity = [
    open ? `${open} seat${open > 1 ? "s" : ""}` : null,
    builders.length ? `${builders.length} building` : null,
    prog ? `${prog} progress` : null,
    att ? `${att} attestation${att > 1 ? "s" : ""}` : null
  ].filter(Boolean).join(" · ");

  const [form, setForm] = useState<null | "claim" | "progress" | "attest">(null);
  const [role, setRole] = useState<BoardRole>("builder");
  const [reason, setReason] = useState("");
  const [pText, setPText] = useState("");
  const [evidence, setEvidence] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const myVote = me ? b.votedBy[me]?.value ?? 0 : 0;
  const isAuthor = !!me && me.toLowerCase() === b.by.toLowerCase();
  const canAccept = !!me && (isAuthor || tier === "hall");
  const canPark =
    !!me && (isAuthor || tier === "hall") && s !== "done" && s !== "lapsed" && s !== "parked";
  const canClaim = !!me && (s === "proposed" || s === "ratified" || s === "claimed");
  const myBuilding = !!me && builders.some((x) => x.toLowerCase() === me.toLowerCase());
  const canProgress = myBuilding && (s === "claimed" || s === "active");
  const alreadyAttested =
    !!me && (b.attestations ?? []).some((a) => a.by.toLowerCase() === me.toLowerCase());
  const holdsReviewer =
    !!me &&
    seated.some((c) => c.by.toLowerCase() === me.toLowerCase() && c.role === "reviewer" && c.status === "active");
  const canAttest =
    s === "active" && !myBuilding && !alreadyAttested && !atts.ok && (tier === "hall" || holdsReviewer);

  return (
    <article className="border-t border-ivory/8 py-9">
      <h3 className="max-w-[30ch] font-display text-[1.65rem] font-medium leading-[1.12] text-ivory">
        {b.title}
      </h3>
      <span aria-hidden className="mt-3 block h-px w-[5.5rem] bg-amber/70" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="text-amber/80">{b.risk}</span>
          <span aria-hidden>·</span>
          <span>[{b.domain}]</span>
          <span aria-hidden>·</span>
          <span className="text-amber">@{b.by}</span>
          <span aria-hidden>·</span>
          <span className="normal-case tracking-[0.05em]">{timeAgo(b.createdTs, now)}</span>
        </span>
        <span className="flex items-center gap-3 tabular-nums">
          <button
            onClick={() => onVote(b.id, 1)}
            aria-label={`Upvote ${b.title}`}
            className={`px-1 transition ${myVote === 1 ? "text-amber" : "text-dim hover:text-ivory"}`}
          >
            ▲{up}
          </button>
          <button
            onClick={() => onVote(b.id, -1)}
            aria-label={`Downvote ${b.title}`}
            className={`px-1 transition ${myVote === -1 ? "text-dim" : "text-dim hover:text-ivory"}`}
          >
            ▼{down}
          </button>
        </span>
      </div>

      {(b.skills ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] text-teal/90">
          {(b.skills ?? []).map((k, i) => (
            <span key={k} className="flex items-center gap-2.5">
              {i > 0 && <span aria-hidden className="text-dim/50">·</span>}
              {k}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span aria-hidden className={`font-mono text-sm leading-none ${meta.tone}`}>
            {meta.glyph}
          </span>
          <div className="relative h-1.5 flex-1 bg-edge/50">
            <div className={`relative h-full ${seal.c}`} style={{ width: `${seal.w}%` }}>
              {seal.tick && (
                <span aria-hidden className="absolute right-0 top-1/2 h-3 w-1 -translate-y-1/2 bg-teal" />
              )}
            </div>
          </div>
        </div>
        <span className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] ${meta.tone}`}>
          {meta.name}
        </span>
      </div>

      <p className="mt-3 font-mono text-[12px] text-muted">{boardStatus(b, now)}</p>

      <p className="mt-4 max-w-[64ch] text-[0.95rem] leading-7 text-muted">{b.body}</p>
      <div className="mt-3 space-y-1 font-mono text-[12px] text-dim">
        <p>{needsLine(b)}</p>
        <p className="italic text-muted/80">Done: {b.done}</p>
      </div>

      {activity && (
        <p className="mt-4 font-mono text-[12px] text-muted/80">
          <span aria-hidden className="text-teal">▸ </span>
          {activity}
        </p>
      )}

      {open > 0 && (
        <div className="mt-5 border-l-2 border-ivory/10 pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">Seats</p>
          <ul className="mt-2 space-y-1.5">
            {seated.map((c, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-2 font-mono text-[12px] text-muted">
                <span className={c.role === "reviewer" ? "text-teal" : "text-amber"}>{c.role}</span>
                <span aria-hidden className="text-dim">·</span>
                <span className="text-ivory">@{c.by}</span>
                {canAccept && (
                  <button onClick={() => setMsg(onAccept(b.id, c.by, c.role))} className={`ml-1 ${ghost}`}>
                    seat
                  </button>
                )}
                {me && c.by.toLowerCase() === me.toLowerCase() && (
                  <button onClick={() => setMsg(onWithdraw(b.id, c.role))} className={`ml-1 ${ghostDim}`}>
                    withdraw
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {prog > 0 && (
        <div className="mt-5 border-l-2 border-ivory/10 pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">Progress</p>
          <ul className="mt-2 space-y-1.5">
            {(b.progress ?? []).slice(-3).map((p, i) => (
              <li key={i} className="font-mono text-[12px] text-muted">
                <span className="text-ivory">@{p.by}</span>
                <span aria-hidden className="text-dim"> · </span>
                {p.text}
                <span className="text-dim/70"> ({timeAgo(p.ts, now)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {att > 0 && (
        <div className="mt-5 border-l-2 border-teal/30 pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">Attestations</p>
          <ul className="mt-2 space-y-1.5">
            {(b.attestations ?? []).map((a, i) => (
              <li key={i} className="font-mono text-[12px] text-muted">
                <span className="text-teal">∎</span>
                <span className="ml-1.5 text-ivory">@{a.by}</span>
                {a.hall && <span className="ml-1.5 font-mono text-[10px] uppercase text-amber/70">hall</span>}
                <span className="ml-2">— {a.evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasFork && (
        <details className="mt-6 border-t border-ivory/8 pt-4">
          <summary className="select-none font-mono text-[11px] uppercase tracking-[0.24em] text-dim transition hover:text-ivory">
            lineage · {ancestors.length} before · {children.length} after
          </summary>
          <ul className="mt-4 list-none">
            {ancestors.map((a, i) => (
              <LineNode key={"a" + a.id} b={a} now={now} mark="○" tone="text-dim" tag={`before ${i + 1}`} />
            ))}
            <LineNode b={b} now={now} mark="●" tone="text-amber" tag="now" subject />
            {children.map((c, i) => {
              const cs = deriveState(c, now);
              const live = cs === "claimed" || cs === "active" || cs === "done";
              return (
                <LineNode
                  key={"c" + c.id}
                  b={c}
                  now={now}
                  mark={live ? "●" : "○"}
                  tone={live ? "text-teal" : "text-teal/60"}
                  tag={`fork ${i + 1}`}
                />
              );
            })}
          </ul>
        </details>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-ivory/8 pt-5">
        {me ? (
          <>
            {canClaim &&
              (form === "claim" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as BoardRole)}
                    className={inField}
                    aria-label="Seat"
                  >
                    <option value="builder">builder</option>
                    <option value="reviewer" disabled={tier !== "hall"}>
                      reviewer{tier !== "hall" ? " · hall only" : ""}
                    </option>
                  </select>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={200}
                    placeholder="one line — why you, for what"
                    className={`${inField} w-56`}
                    aria-label="Reason"
                  />
                  <button
                    onClick={() => {
                      const m = onClaim(b.id, role, reason);
                      if (!m) {
                        setForm(null);
                        setReason("");
                      }
                      setMsg(m);
                    }}
                    className={ghost}
                  >
                    seat
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setForm("claim");
                    setMsg(null);
                  }}
                  className={ghost}
                >
                  claim a seat
                </button>
              ))}

            {canProgress &&
              (form === "progress" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={pText}
                    onChange={(e) => setPText(e.target.value)}
                    maxLength={200}
                    placeholder="one line of progress"
                    className={`${inField} w-56`}
                    aria-label="Progress"
                  />
                  <button
                    onClick={() => {
                      const m = onProgress(b.id, pText);
                      if (!m) {
                        setForm(null);
                        setPText("");
                      }
                      setMsg(m);
                    }}
                    className={ghost}
                  >
                    log it
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setForm("progress");
                    setMsg(null);
                  }}
                  className={ghost}
                >
                  progress
                </button>
              ))}

            {canAttest &&
              (form === "attest" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    maxLength={200}
                    placeholder="the proof, one line"
                    className={`${inField} w-56`}
                    aria-label="Evidence"
                  />
                  <button
                    onClick={() => {
                      const m = onAttest(b.id, evidence);
                      if (!m) {
                        setForm(null);
                        setEvidence("");
                      }
                      setMsg(m);
                    }}
                    className={ghost}
                  >
                    attest
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setForm("attest");
                    setMsg(null);
                  }}
                  className={ghost}
                >
                  attest
                </button>
              ))}

            {canPark && (
              <button onClick={() => setMsg(onPark(b.id))} className={ghostDim}>
                let it rest
              </button>
            )}

            <button onClick={() => onFork(b)} className={ghostDim}>
              fork →
            </button>
          </>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
            sign the roll to claim a seat
          </span>
        )}
      </div>

      {msg && <p className="mt-4 font-mono text-xs text-amber">{msg}</p>}
    </article>
  );
}