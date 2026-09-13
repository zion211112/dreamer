import Link from "next/link";
import { Build, FloorTier, timeAgo } from "../lib/benben";

function typeStyle(t: string): string {
  if (t === "SOLUTION") return "bg-violet-500/15 text-violet-300 border-violet-500/30";
  if (t === "NEED") return "bg-royal/25 text-[#d9a066] border-royal/60";
  return "bg-white/5 text-muted border-white/10";
}

function needsLine(b: Build): string {
  const n = b.needs;
  if (n.nothing) return "NEEDS: Nothing — already built";
  const parts: string[] = [];
  if (n.labor > 0) parts.push(`Labor (${n.labor})`);
  if (n.materials.trim()) parts.push(`Materials: ${n.materials.trim()}`);
  if (n.funds > 0) parts.push(`Funds: ${n.funds.toLocaleString()}`);
  if (n.intellect.trim()) parts.push(`Intellect: ${n.intellect.trim()}`);
  return parts.length > 0 ? `NEEDS: ${parts.join(" · ")}` : "NEEDS: —";
}

// One build card, everywhere. No images. No avatars. No emojis. No karma.
export default function BuildCard({
  b,
  now,
  tier,
  myVote,
  voteErr,
  onVote,
  onNominate,
  canNominate,
  detailLink = true
}: {
  b: Build;
  now: number;
  tier: FloorTier;
  myVote: number;
  voteErr: string | null;
  onVote: (id: string, v: 1 | -1) => void;
  onNominate: (id: string) => void;
  canNominate: boolean;
  detailLink?: boolean;
}) {
  const forks = b.comments.filter((c) => c.fork).length;
  const canVote = tier !== "visitor";
  return (
    <article className="rounded-[21px] border border-edge bg-panel p-fb3 hover:border-[#404040] transition">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold uppercase">
        <span className="rounded-md bg-forest px-2 py-0.5 text-cream">[{b.domain}]</span>
        <span className={`rounded-md border px-2 py-0.5 ${typeStyle(b.type)}`}>[{b.type}]</span>
        <span className="text-dim">· {timeAgo(b.createdTs, now)}</span>
        {b.location.trim() && <span className="text-dim">· {b.location.trim()}</span>}
      </div>

      {detailLink ? (
        <Link href="/">
          <h3 className="mt-fb2 font-display text-[21px] font-semibold leading-snug text-cream hover:text-teal-300 transition">{b.title}</h3>
        </Link>
      ) : (
        <h3 className="mt-fb2 font-display text-[21px] font-semibold leading-snug text-cream">{b.title}</h3>
      )}

      <p className="mt-2 line-clamp-4 text-[16px] leading-relaxed text-muted">{b.body}</p>
      <p className="mt-3 font-mono text-[13px] text-muted">{needsLine(b)}</p>
      <p className="mt-1 font-mono text-[13px] italic text-dim">DONE: {b.done}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-edge pt-3">
        <span className="flex items-center gap-1 font-mono text-sm">
          <button
            onClick={() => onVote(b.id, 1)}
            disabled={!canVote}
            title={canVote ? "Upvote" : "Member access unlocks voting"}
            aria-label="Upvote"
            className={`px-1 text-lg leading-none transition ${!canVote ? "cursor-not-allowed opacity-30" : myVote === 1 ? "text-teal-300" : "text-muted hover:text-teal-300"}`}
          >
            ▲
          </button>
          <span className="min-w-6 text-center text-cream">{b.votes}</span>
          <button
            onClick={() => onVote(b.id, -1)}
            disabled={!canVote}
            title={canVote ? "Downvote: not a real build, or off-topic. Never for disagreement." : "Member access unlocks voting"}
            aria-label="Downvote"
            className={`px-1 text-lg leading-none transition ${!canVote ? "cursor-not-allowed opacity-30" : myVote === -1 ? "text-earth" : "text-muted hover:text-earth"}`}
          >
            ▼
          </button>
        </span>
        <Link href="/" className="font-mono text-[13px] text-muted hover:text-ivory">
          {b.comments.length} comment{b.comments.length === 1 ? "" : "s"} · {forks} fork{forks === 1 ? "" : "s"}
        </Link>
        <span className="font-mono text-[13px] text-dim">[Open]</span>
        {canNominate && (
          <button onClick={() => onNominate(b.id)} className="ml-auto font-mono text-[13px] text-teal-300 hover:underline">
            [ Nominate ]
          </button>
        )}
        <span className="w-full text-right font-mono text-[13px] font-bold text-teal-300">@{b.by}</span>
      </div>
      {voteErr && <p className="mt-2 font-mono text-xs text-red-400">{voteErr}</p>}
      {!canVote && (
        <p className="mt-2 font-mono text-xs text-dim">Voting unlocks with active member access.</p>
      )}
    </article>
  );
}
