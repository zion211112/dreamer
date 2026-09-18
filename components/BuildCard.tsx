import { Build, timeAgo } from "../lib/benben";

function typeTone(t: string): string {
  if (t === "NEED") return "text-gold";
  if (t === "SOLUTION") return "text-teal-300";
  if (t === "OFFER") return "text-emerald-300";
  return "text-muted";
}

function needsLine(b: Build): string {
  const n = b.needs;
  if (n.nothing) return "Needs: nothing — already built.";
  const parts: string[] = [];
  if (n.labor > 0) parts.push(`hands (${n.labor})`);
  if (n.materials.trim()) parts.push(`materials · ${n.materials.trim()}`);
  if (n.funds > 0) parts.push(`KES ${n.funds.toLocaleString()}`);
  if (n.intellect.trim()) parts.push(`intellect · ${n.intellect.trim()}`);
  return parts.length > 0 ? `Needs: ${parts.join(" · ")}` : "Needs: —";
}

// One build on the floor. No card frame, no avatar, no karma —
// a ruled line and the type are the furniture.
export default function BuildCard({
  b,
  now,
  myVote,
  voteErr,
  onVote,
  onFork
}: {
  b: Build;
  now: number;
  myVote: number;
  voteErr: string | null;
  onVote: (id: string, v: 1 | -1) => void;
  onFork: (b: Build) => void;
}) {
  const forks = b.comments.filter((c) => c.fork).length;
  return (
    <article className="border-t border-white/10 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
        <span className="flex flex-wrap items-center gap-2">
          <span className="border border-white/10 bg-panel px-2 py-0.5 text-cream">[{b.domain}]</span>
          <span className={typeTone(b.type)}>{b.type}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(b.createdTs, now)}</span>
          {b.location.trim() && <span aria-hidden>· {b.location.trim()}</span>}
        </span>
        <span className="text-gold">@{b.by}</span>
      </div>

      <h3 className="mt-5 max-w-[52ch] font-display text-[1.7rem] leading-snug text-ivory">{b.title}</h3>

      <p className="mt-3 max-w-[62ch] text-[0.95rem] leading-7 text-muted">{b.body}</p>

      <div className="mt-4 space-y-1 font-mono text-[12px] text-dim">
        <p>{needsLine(b)}</p>
        <p className="italic text-muted/80">Done: {b.done}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/5 pt-4">
        <span className="flex items-center gap-1 font-mono text-sm">
          <button
            onClick={() => onVote(b.id, 1)}
            aria-label={`Upvote ${b.title}`}
            className={`px-1 text-base transition ${myVote === 1 ? "text-gold" : "text-muted hover:text-ivory"}`}
          >
            ▲
          </button>
          <span className="min-w-[3ch] text-center font-semibold text-ivory tabular-nums">{b.votes}</span>
          <button
            onClick={() => onVote(b.id, -1)}
            aria-label={`Downvote ${b.title}`}
            className={`px-1 text-base transition ${myVote === -1 ? "text-earth" : "text-muted hover:text-ivory"}`}
          >
            ▼
          </button>
        </span>
        <span className="font-mono text-[12px] text-dim tabular-nums">
          {b.comments.length} comment{b.comments.length === 1 ? "" : "s"} · {forks} fork{forks === 1 ? "" : "s"}
        </span>
        <button
          onClick={() => onFork(b)}
          className="ml-auto font-mono text-[12px] uppercase tracking-[0.22em] text-gold transition hover:text-ivory"
        >
          Fork →
        </button>
      </div>
      {voteErr && <p className="mt-3 font-mono text-xs text-red-400">{voteErr}</p>}
    </article>
  );
}
