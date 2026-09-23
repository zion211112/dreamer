import { useState, useEffect, useRef, type ReactNode } from "react";
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
  RATIFY,
  ratifyTerms
} from "../lib/board";

// CSS class constants (inline styles via Tailwind tokens)
const ghost = "font-mono text-micro uppercase tracking-[0.14em] text-dust hover:text-ink transition";
const ghostDim = "font-mono text-micro uppercase tracking-[0.14em] text-dust/60 hover:text-dust transition";
const inField = "w-full border-b border-rule bg-transparent py-1.5 text-body text-ink outline-none focus:border-amber placeholder:text-dust/60";

// Real date beside the relative time — the floor remembers by proof.
const asOf = (ts: number) =>
  new Date(ts).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

// One node on the fork rail. Glyph and tone come straight from STATE — the
// family reads in the same vocabulary as the board, not a separate one.
// The rail and ticks are CSS (.fork-rail); the node only carries content.
function LineNode({
  b,
  now,
  tag,
  subject
}: {
  b: Build;
  now: number;
  tag: string;
  subject?: boolean;
}) {
  const st = deriveState(b, now);
  const meta = STATE[st];
  const { up } = upDown(b);
  const mark = subject ? "text-amber" : meta.tone;
  return (
    <li>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span aria-hidden className={`font-mono text-micro ${mark}`}>
          {meta.glyph}
        </span>
        <span className={`font-mono text-micro uppercase tracking-[0.2em] ${subject ? "text-amber" : "text-ash"}`}>
          {tag}
        </span>
        <span className={`font-serif ${subject ? "text-body text-ink" : "text-ui text-dust"}`}>
          {b.title}
        </span>
      </div>
      <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.14em] text-dust">
        <span className={meta.tone}>{meta.name}</span> · by @{b.by} · {timeAgo(b.createdTs, now)} · ▲{up}
      </p>
    </li>
  );
}

// A nested register — one shape for seats, progress and attestations:
// a rail, a head with its count, ticked lines. Quiet: no card inside a card.
function Register({
  title,
  count,
  children
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="reg">
      <div className="reg-head">
        <p className="reg-title">{title}</p>
        {typeof count === "number" && count > 0 && <p className="reg-count">{count}</p>}
      </div>
      <ul className="reg-list">{children}</ul>
    </div>
  );
}

// The seal: a threshold bar, not a progress meter. Fill = share of the
// ratification quorum (votes) or closing quorum (attestations); the tick
// marks the bar. Amber while open, ink once proved.
function Threshold({ b, now }: { b: Build; now: number }) {
  const s = deriveState(b, now);
  const proved = s === "done";
  const { up } = upDown(b);
  const need = upNeeded(b);
  const bar = (b.risk === "medium" || b.risk === "high" ? RATIFY[b.risk] : RATIFY.low).minVoters;
  const pct = Math.min(100, Math.round((up / Math.max(1, bar)) * 100));
  const atts = attestationState(b);
  // Quorum reached but the record is not closed: the fill takes the gold —
  // Snapshot's shift from mute to alive. Ink only when proved.
  const quorumHit = !proved && up >= bar;
  const closing = s === "claimed" || s === "active" || proved;
  const sealClass = proved ? "is-proved" : atts.ok ? "is-quorum" : "";
  const terms = ratifyTerms(b.risk === "medium" || b.risk === "high" ? b.risk : "low");
  // The line speaks the machine's own voice: counts, not percentages — a
  // count cannot be moved by not showing up.
  const label = proved
    ? `proved · ${atts.have} attestation${atts.have === 1 ? "" : "s"}`
    : s === "claimed" || s === "active"
      ? `${atts.have} of ${atts.need} to close · ${terms.closeLabel}`
      : need > 0
        ? `${up} of ${bar} shown · ${need} more to show up`
        : `${up} of ${bar} shown · the bar is met — waiting to close`;
  return (
    <div className="threshold">
      <div className="flex items-center gap-3" role="img" aria-label={label}>
        <div className="threshold-track">
          <div
            className={["threshold-fill", quorumHit ? "quorum" : "", proved ? "proved" : ""].filter(Boolean).join(" ")}
            style={{ width: `${proved ? 100 : pct}%` }}
          />
        </div>
        {closing ? (
          <span
            className={`close-seal ${sealClass}`.trim()}
            title={`attestations · ${atts.have} of ${atts.need}`}
          >
            {atts.ok ? "∎" : `${atts.have}/${atts.need}`}
          </span>
        ) : (
          <span className="shrink-0 font-mono text-micro uppercase tracking-[0.14em] text-dust tabular-nums">
            {up}/{bar}
          </span>
        )}
      </div>
      <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-dust">{label}</p>
    </div>
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
  onFork,
  focused,
  onActivate
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
  focused?: boolean;
  onActivate?: () => void;
}) {
  const s = deriveState(b, now);
  const meta = STATE[s];
  const { up, down } = upDown(b);
  const seats = openClaims(b);
  const builders = activeBuilders(b);
  const atts = attestationState(b);
  const validAtts = validAttestations(b);
  const proof = validAtts[0] ?? null;
  const { ancestors, children, hasFork } = lineageOf(b, all, now);
  const prog = (b.progress ?? []).length;

  const [form, setForm] = useState<null | "claim" | "progress" | "attest">(null);
  const [role, setRole] = useState<BoardRole>("builder");
  const [reason, setReason] = useState("");
  const [pText, setPText] = useState("");
  const [evidence, setEvidence] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [lineOpen, setLineOpen] = useState(false);

  // The hall-seal moment: the one loud instant on the floor. When this record
  // crosses into "proved", the card blooms in gold once — the room remembers.
  const [bloom, setBloom] = useState(false);
  const prevState = useRef<ReturnType<typeof deriveState> | null>(null);
  useEffect(() => {
    const justProved = s === "done" && prevState.current !== "done";
    prevState.current = s;
    if (!justProved) return;
    setBloom(true);
    const t = setTimeout(() => setBloom(false), 1000);
    return () => clearTimeout(t);
  }, [s]);

  // Keyboard — the Linear register: V vote · C claim · Space inspect · Esc let go.
  // Guards mirror the visible affordances: a key never grants an action the
  // pointer could not take. The focused card rides into view, never jumps.
  const cardRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!focused) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "v" || e.key === "V") { e.preventDefault(); onVote(b.id, 1); }
      if (e.key === "c" || e.key === "C") {
        const st = deriveState(b, now);
        if (me && (st === "proposed" || st === "ratified" || st === "claimed")) {
          e.preventDefault();
          setForm("claim");
          setMsg(null);
        }
      }
      if (e.key === " ") { e.preventDefault(); setLineOpen((o) => !o); }
      if (e.key === "Escape") { e.preventDefault(); setLineOpen(false); onActivate?.(); }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [focused, b, me, now, onVote, onActivate]);
  useEffect(() => {
    if (focused) cardRef.current?.scrollIntoView({ block: "nearest" });
  }, [focused]);

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
    <article
      ref={cardRef}
      className={`floor-card ${focused ? "floor-card--focused" : ""} ${bloom ? "hall-bloom" : ""}`.trim()}
      tabIndex={focused ? 0 : -1}
    >
      <div className="entry-head">
        <p className="entry-kind">
          {b.domain}
          {b.type && (
            <>
              {" · "}
              <b>{b.type}</b>
            </>
          )}
        </p>
        <p className={`entry-status ${meta.tone}`}>
          <span aria-hidden>{meta.glyph}</span>
          {meta.name}
        </p>
        <div className="entry-actions">
          {canClaim && (
            <button type="button" onClick={() => { setForm("claim"); setMsg(null); }} className="entry-action" aria-label={`Claim ${b.title}`}>Claim</button>
          )}
          <button type="button" onClick={() => onFork(b)} className="entry-action" aria-label={`Fork ${b.title}`}>Fork</button>
        </div>
      </div>
      <h3 className="entry-title mt-3 max-w-[32ch] font-serif text-h2 font-normal text-ink transition-colors duration-150">
        {b.title}
      </h3>
      <p className="mt-3 max-w-[60ch] text-body text-dust line-clamp-2">{b.body}</p>

      <div className="mt-4">
        <Threshold b={b} now={now} />
      </div>

      <dl className="mt-4 space-y-1.5 font-mono text-meta">
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
        <figure className="mt-5 border-l-2 border-ink pl-4">
          <blockquote className="font-serif text-lead italic text-ink">
            &ldquo;{proof.evidence}&rdquo;
          </blockquote>
          <figcaption className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-dust">
            @{proof.by}
            {proof.hall ? " · hall" : ""} · {asOf(proof.ts)}
          </figcaption>
        </figure>
      )}

      <div className="entry-foot">
        <span className="risk">{b.risk}</span>
        <span className="sep" aria-hidden>·</span>
        <span className="who">@{b.by}</span>
        <span className="sep" aria-hidden>·</span>
        <span className="time">
          {timeAgo(b.createdTs, now)} · {asOf(b.createdTs)}
        </span>
        {(b.skills ?? []).length > 0 && (
          <>
            <span className="sep" aria-hidden>·</span>
            <span className="text-ash">{(b.skills ?? []).join(" · ")}</span>
          </>
        )}
        <span className="sep" aria-hidden>·</span>
        <span className="tabular-nums flex items-center gap-0.5">
          <button
            onClick={() => onVote(b.id, 1)}
            aria-label={`Support ${b.title}`}
            aria-pressed={myVote === 1}
            className={`vote-btn ${myVote === 1 ? "text-amber" : "text-ink hover:text-amber"}`}
          >
            ▲<span key={up} className="vote-pop">{up}</span>
          </button>
          <button
            onClick={() => onVote(b.id, -1)}
            aria-label={`Push back on ${b.title}`}
            aria-pressed={myVote === -1}
            className={`vote-btn ${myVote === -1 ? "text-amber" : "text-ink hover:text-amber"}`}
          >
            ▼<span key={down} className="vote-pop">{down}</span>
          </button>
        </span>
      </div>

      {seats.length > 0 && (
        <Register title="Seats" count={seats.length}>
          {seats.map((c) => (
            <li
              key={`${c.by}-${c.role}-${c.ts}`}
              className="flex flex-wrap items-baseline gap-x-2 font-mono text-meta text-dust"
            >
              <span className="text-amber">{c.role}</span>
              <span className="text-ink">@{c.by}</span>
              <span>{c.reason}</span>
              {c.status === "pending" && (
                <>
                  <span className="text-ash">awaiting seat</span>
                  {canAccept && (
                    <button onClick={() => setMsg(onAccept(b.id, c.by, c.role))} className={ghost}>
                      seat
                    </button>
                  )}
                </>
              )}
              {me && c.by.toLowerCase() === me.toLowerCase() && (
                <button onClick={() => setMsg(onWithdraw(b.id, c.role))} className={`ml-1 ${ghostDim}`}>
                  withdraw
                </button>
              )}
            </li>
          ))}
        </Register>
      )}

      {prog > 0 && (
        <Register title="Progress" count={prog}>
          {(b.progress ?? []).slice(-3).map((p) => (
            <li
              key={p.ts}
              className="flex flex-wrap items-baseline gap-x-2 font-mono text-meta text-dust"
            >
              <span className="text-ink">@{p.by}</span>
              <span>{p.text}</span>
              <span className="text-ash">({timeAgo(p.ts, now)})</span>
            </li>
          ))}
          {prog > 3 && (
            <li className="font-mono text-micro uppercase tracking-[0.14em] text-ash">
              + {prog - 3} earlier line{prog - 3 === 1 ? "" : "s"}
            </li>
          )}
        </Register>
      )}

      {validAtts.length > 1 && (
        <Register title="Attestations" count={validAtts.length}>
          {validAtts.slice(1).map((a, i) => (
            <li
              key={`${a.by}-${i}`}
              className="flex flex-wrap items-baseline gap-x-2 font-mono text-meta text-dust"
            >
              <span className="text-ink">@{a.by}</span>
              {a.hall && <span className="font-mono text-micro uppercase text-ash">hall</span>}
              <span>— {a.evidence}</span>
            </li>
          ))}
        </Register>
      )}

      {hasFork && (
        <details className="lineage" open={lineOpen} onToggle={(e) => setLineOpen(e.currentTarget.open)}>
          <summary className="flex select-none flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-label uppercase tracking-[0.24em] text-dust transition hover:text-ink">
            lineage
            <span className="font-mono text-micro normal-case tracking-[0.14em] text-ash tabular-nums">
              {ancestors.length} before · {children.length} after
            </span>
          </summary>
          {/* one spine: ancestors, then the subject; forks step in on a
              nested rail under the subject */}
          <ul className="fork-rail">
            {ancestors.map((a, i) => (
              <LineNode key={"a" + a.id} b={a} now={now} tag={i === 0 ? "root" : `n${i + 1}`} />
            ))}
            <LineNode b={b} now={now} tag="now" subject />
            {children.length > 0 && (
              <li>
                <ul className="fork-children">
                  {children.map((c, i) => (
                    <LineNode key={"c" + c.id} b={c} now={now} tag={`fork ${i + 1}`} />
                  ))}
                </ul>
              </li>
            )}
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