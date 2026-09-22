import { useState } from "react";
import { Build, FloorTier, BoardRole, timeAgo, needsLine } from "../lib/benben";
import {
  STATE,
  activeBuilders,
  attestationState,
  deriveState,
  lineageOf,
  openClaims,
  upDown,
  upNeeded,
  validAttestations,
  RATIFY
} from "../lib/board";

// CSS class constants (inline styles via Tailwind tokens)
const ghost = "font-mono text-micro uppercase tracking-[0.14em] text-dust hover:text-ink transition";
const ghostDim = "font-mono text-micro uppercase tracking-[0.14em] text-dust/60 hover:text-dust transition";
const inField = "w-full border-b border-rule bg-transparent py-1.5 text-body text-ink outline-none focus:border-amber placeholder:text-dust/60";

// Real date beside the relative time — the floor remembers by proof.
const asOf = (ts: number) =>
  new Date(ts).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

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
      <span aria-hidden className="absolute left-0 top-0 h-full w-px bg-ink/8" />
      <span aria-hidden className={`absolute left-0 top-2 font-mono text-label ${tone}`}>
        {mark}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={`font-mono text-micro uppercase tracking-[0.2em] ${subject ? "text-amber" : "text-dust"}`}>
            {tag}
          </span>
          <span className={`font-serif ${subject ? "text-[1.05rem] text-ink" : "text-[0.95rem] text-dust"}`}>
            {b.title}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.14em] text-dust">
          by @{b.by} · {st.name} · ▲{up}
        </p>
      </div>
    </li>
  );
}

// The seal: a threshold bar, not a progress meter. Fill = share of the
// ratification quorum (votes) or closing quorum (attestations); the tick
// marks the bar. Amber while open, signal once proved.
function Threshold({ b, now }: { b: Build; now: number }) {
  const s = deriveState(b, now);
  const proved = s === "done";
  const { up } = upDown(b);
  const need = upNeeded(b);
  const bar = (b.risk === "medium" || b.risk === "high" ? RATIFY[b.risk] : RATIFY.low).minVoters;
  const pct = Math.min(100, Math.round((up / Math.max(1, bar)) * 100));
  const atts = attestationState(b);
  const label = proved
    ? `proved · ${atts.have} attestation${atts.have === 1 ? "" : "s"}`
    : s === "claimed" || s === "active"
      ? `${atts.have} of ${atts.need} attestations to close`
      : `${up} of ${bar} votes · ${need} more`;
  return (
    <div className="threshold">
      <div className="flex items-center gap-3" role="img" aria-label={label}>
        <div className="threshold-track">
          <div
            className={`threshold-fill ${proved ? "proved" : ""}`}
            style={{ width: `${proved ? 100 : pct}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-micro uppercase tracking-[0.14em] text-dust tabular-nums">
          {proved ? `${atts.have}/${atts.need}` : `${up}/${bar}`}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-dust">{label}</p>
    </div>
  );
}

// Proof inset — always visible latest attestation, not hidden in details.
function ProofInset({ b, now }: { b: Build; now: number }) {
  const atts = validAttestations(b);
  if (!atts.length) return null;
  const latest = atts[atts.length - 1];
  return (
    <blockquote className="proof-inset" aria-label="Latest proof">
      <p className="font-serif italic text-[1.05rem] leading-7 text-ink">&ldquo;{latest.evidence}&rdquo;</p>
      <footer className="mt-2 flex items-baseline gap-2 font-mono text-micro uppercase tracking-[0.14em] text-dust">
        <cite>by @{latest.by}</cite>
        <time dateTime={new Date(latest.ts).toISOString()}>{asOf(latest.ts)}</time>
      </footer>
    </blockquote>
  );
}

// Facts grid (dl/dt/dd) — structured metadata, no noise.
function Facts({ b, now, all }: { b: Build; now: number; all: Build[] }) {
  const { up, down } = upDown(b);
  const st = deriveState(b, now);
  const stName = STATE[st].name;
  const atts = attestationState(b);
  const builders = activeBuilders(b);
  const forks = lineageOf(b, all, now).children.length;
  const needs = needsLine(b);

  return (
    <dl className="facts">
      <div>
        <dt>State</dt>
        <dd>{stName}</dd>
      </div>
      <div>
        <dt>Risk</dt>
        <dd className="uppercase">{b.risk}</dd>
      </div>
      <div>
        <dt>Votes</dt>
        <dd>
          <span className="text-amber">▲{up}</span>
          <span className="text-dust ml-1">▼{down}</span>
        </dd>
      </div>
      <div>
        <dt>Attestations</dt>
        <dd>
          {atts.have} / {atts.need}
        </dd>
      </div>
      <div>
        <dt>Builders</dt>
        <dd>
          {builders.length ? builders.map((u) => <span key={u} className="mr-1">@{u}</span>) : "—"}
        </dd>
      </div>
      <div>
        <dt>Forks</dt>
        <dd>{forks}</dd>
      </div>
      {needs && (
        <div>
          <dt>Needs</dt>
          <dd>{needs}</dd>
        </div>
      )}
    </dl>
  );
}

// One commitment on the board. Ruled line, signature, threshold, facts,
// proof — counts, not noise.
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
  const { up, down } = upDown(b);
  const seats = openClaims(b);
  const builders = activeBuilders(b);
  const atts = attestationState(b);
  const proof = validAttestations(b)[0] ?? null;
  const { ancestors, children, hasFork } = lineageOf(b, all, now);
  const prog = (b.progress ?? []).length;

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
    seats.some((c) => c.by.toLowerCase() === me.toLowerCase() && c.role === "reviewer" && c.status === "active");
  const canAttest =
    s === "active" && !myBuilding && !alreadyAttested && !atts.ok && (tier === "hall" || holdsReviewer);

  return (
    <article className="border-b border-rule py-9 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-micro uppercase tracking-[0.2em] text-dust">{b.domain}</p>
        <p className={`font-mono text-micro uppercase tracking-[0.2em] ${meta.tone}`}>{meta.name}</p>
      </div>
      <h3 className="mt-3 max-w-[32ch] font-serif text-[1.65rem] font-normal leading-[1.15] text-ink">
        {b.title}
      </h3>
      <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-7 text-dust">{b.body}</p>

      <div className="mt-5">
        <Threshold b={b} now={now} />
      </div>

      <dl className="mt-5 space-y-1.5 font-mono text-meta">
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 uppercase tracking-[0.14em] text-dust">Needs</dt>
          <dd className="text-ink/90">{needsLine(b)}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 uppercase tracking-[0.14em] text-dust">Done</dt>
          <dd className="italic text-dust">{b.done}</dd>
        </div>
      </dl>

      {proof && (
        <figure className="mt-5 border-l-2 border-signal pl-4">
          <blockquote className="font-serif text-[1.02rem] italic leading-relaxed text-ink">
            &ldquo;{proof.evidence}&rdquo;
          </blockquote>
          <figcaption className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-dust">
            @{proof.by}
            {proof.hall ? " · hall" : ""} · {asOf(proof.ts)}
          </figcaption>
        </figure>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-2 font-mono text-micro uppercase tracking-[0.14em] text-dust">
        <span className="text-amber/90">{b.risk}</span>
        <span aria-hidden>·</span>
        <span>@{b.by}</span>
        <span aria-hidden>·</span>
        <span className="normal-case tracking-[0.05em]">
          {timeAgo(b.createdTs, now)} · {asOf(b.createdTs)}
        </span>
        {(b.skills ?? []).length > 0 && (
          <>
            <span aria-hidden>·</span>
            <span className="text-signal/90">{(b.skills ?? []).join(" · ")}</span>
          </>
        )}
        <span aria-hidden>·</span>
        <span className="tabular-nums">
          <button
            onClick={() => onVote(b.id, 1)}
            aria-label={`Upvote ${b.title}`}
            aria-pressed={myVote === 1}
            className={`min-h-11 min-w-11 px-1 transition ${myVote === 1 ? "text-amber" : "hover:text-ink"}`}
          >
            ▲{up}
          </button>
          <button
            onClick={() => onVote(b.id, -1)}
            aria-label={`Downvote ${b.title}`}
            aria-pressed={myVote === -1}
            className={`min-h-11 min-w-11 px-1 transition ${myVote === -1 ? "text-ink" : "hover:text-ink"}`}
          >
            ▼{down}
          </button>
        </span>
      </div>

      {seats.length > 0 && (
        <div className="mt-4 border-l border-rule pl-4">
          <p className="font-mono text-micro uppercase tracking-[0.24em] text-dust">Seats</p>
          <ul className="mt-2 space-y-1.5">
            {seats.map((c, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-2 font-mono text-meta text-dust">
                <span className={c.role === "reviewer" ? "text-signal" : "text-amber"}>{c.role}</span>
                <span aria-hidden className="text-dust">·</span>
                <span className="text-ink">@{c.by}</span>
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
        <div className="mt-4 border-l border-rule pl-4">
          <p className="font-mono text-micro uppercase tracking-[0.24em] text-dust">Progress</p>
          <ul className="mt-2 space-y-1.5">
            {(b.progress ?? []).slice(-3).map((p, i) => (
              <li key={i} className="font-mono text-meta text-dust">
                <span className="text-ink">@{p.by}</span>
                <span aria-hidden className="text-dust"> · </span>
                {p.text}
                <span className="text-dust/70"> ({timeAgo(p.ts, now)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(b.attestations ?? []).length > 1 && (
        <div className="mt-4 border-l border-rule pl-4">
          <p className="font-mono text-micro uppercase tracking-[0.24em] text-dust">Attestations</p>
          <ul className="mt-2 space-y-1.5">
            {(b.attestations ?? []).slice(1).map((a, i) => (
              <li key={i} className="font-mono text-meta text-dust">
                <span className="text-signal">∎</span>
                <span className="ml-1.5 text-ink">@{a.by}</span>
                {a.hall && <span className="ml-1.5 font-mono text-micro uppercase text-amber/70">hall</span>}
                <span className="ml-2">— {a.evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasFork && (
        <details className="mt-5 border-t border-rule pt-4">
          <summary className="select-none font-mono text-label uppercase tracking-[0.24em] text-dust transition hover:text-ink">
            lineage · {ancestors.length} before · {children.length} after
          </summary>
          <ul className="mt-4 list-none">
            {ancestors.map((a, i) => (
              <LineNode key={"a" + a.id} b={a} now={now} mark="○" tone="text-ash" tag={`before ${i + 1}`} />
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
                  tone={live ? "text-signal" : "text-signal/60"}
                  tag={`fork ${i + 1}`}
                />
              );
            })}
          </ul>
        </details>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-rule pt-5">
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
                    prove it
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
                  prove
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
          <span className="font-mono text-label uppercase tracking-[0.24em] text-ash">
            sign the roll to claim a seat
          </span>
        )}
      </div>

      {msg && <p className="mt-4 font-mono text-xs text-amber">{msg}</p>}
    </article>
  );
}