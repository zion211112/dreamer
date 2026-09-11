"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  Build,
  SEED_BUILDS,
  allMembers,
  canView,
  castVote,
  loadBuilds,
  memberByUsername,
  myUsername,
  persistBuilds,
  stripUrls,
  tierOf,
  timeAgo
} from "../../../../lib/benben";

// One build + threaded comments. Forks are citations.
// WhatsApp numbers stay sealed until the poster accepts —
// revealed only to the accepter, never listed, never scraped.
export default function PostView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [me, setMe] = useState("");
  const [tier, setTier] = useState<"visitor" | "certified" | "hall">("visitor");
  const [text, setText] = useState("");
  const [fork, setFork] = useState(false);
  const [voteErr, setVoteErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const stored = loadBuilds().filter(
      (b) => b && typeof b.id === "string" && b.needs && Array.isArray(b.comments)
    );
    const ids = new Set(stored.map((b) => b.id));
    setBuilds([...stored, ...SEED_BUILDS.filter((s) => !ids.has(s.id))]);
    const u = myUsername() || "";
    setMe(u);
    const all = allMembers();
    setTier(tierOf(u || null, (x) => memberByUsername(all, x)));
    const t = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(t);
  }, []);

  function save(v: Build[]) {
    setBuilds(v);
    persistBuilds(v);
  }

  const b = builds.find((x) => x.id === id);
  if (!b) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-mono text-sm text-muted">No build by that mark. The floor moved on.</p>
          <Link href="/benben" className="mt-6 inline-block underline">Back to the floor →</Link>
        </div>
      </main>
    );
  }

  if (!canView(b, me, tier)) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">SEALED</p>
          <h1 className="mt-4 font-display text-3xl font-semibold">This dream is sealed.</h1>
          <p className="mt-3 text-sm text-muted">
            {b.visibility === "private"
              ? "Its keeper holds it close. The floor respects that."
              : "It waits under Hall 8 review. Sealed members may read."}
          </p>
          <Link href="/benben" className="mt-8 inline-block rounded-full border border-white/20 px-8 py-3 text-sm font-semibold hover:border-teal-300 transition">
            Back to the floor →
          </Link>
        </div>
      </main>
    );
  }

  const myVote = b.votedBy[me]?.value || 0;
  const forks = b.comments.filter((c) => c.fork).length;
  const mine = b.by === me;
  const myRequest = b.waRequests.find((r) => r.by === me);
  const revealedToMe = myRequest?.status === "accepted" && b.wa;

  function vote(v: 1 | -1) {
    if (tier === "visitor") return;
    const { list, err } = castVote(builds, id, me, v, Date.now());
    if (err) { setVoteErr(err); return; }
    setVoteErr(null);
    save(list);
  }

  function comment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const clean = stripUrls(text).slice(0, 1200);
    save(builds.map((x) =>
      x.id === id
        ? { ...x, comments: [...x.comments, { by: me, text: clean, ts: Date.now(), fork }] }
        : x
    ));
    setText(""); setFork(false);
  }

  function requestWa() {
    save(builds.map((x) =>
      x.id === id && !x.waRequests.some((r) => r.by === me)
        ? { ...x, waRequests: [...x.waRequests, { by: me, ts: Date.now(), status: "pending" as const }] }
        : x
    ));
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-8 md:py-12">
        <Link href="/benben" className="font-mono text-sm text-muted hover:text-ivory">← the floor</Link>

        <article className="mt-6 rounded-[21px] border border-edge bg-panel p-fb3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold uppercase">
            <span className="rounded-md bg-forest px-2 py-0.5 text-cream">[{b.domain}]</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-muted">[{b.type}]</span>
            <span className="text-dim">· {timeAgo(b.createdTs, now)}</span>
            {b.location.trim() && <span className="text-dim">· {b.location.trim()}</span>}
            {(b.visibility || "public") !== "public" && (
              <span className="rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-violet-300">
                [{b.visibility === "hall8" ? "HALL 8" : "PRIVATE"}]
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-2xl md:text-3xl font-semibold leading-snug text-cream">{b.title}</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-muted whitespace-pre-wrap">{b.body}</p>
          <p className="mt-3 font-mono text-[13px] italic text-dim">DONE: {b.done}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-edge pt-3">
            <span className="flex items-center gap-1 font-mono">
              <button onClick={() => vote(1)} disabled={tier === "visitor"} aria-label="Upvote" className={`px-1 text-xl leading-none ${tier === "visitor" ? "cursor-not-allowed opacity-30" : myVote === 1 ? "text-teal-300" : "text-muted hover:text-teal-300"}`}>▲</button>
              <span className="min-w-6 text-center">{b.votes}</span>
              <button onClick={() => vote(-1)} disabled={tier === "visitor"} aria-label="Downvote" className={`px-1 text-xl leading-none ${tier === "visitor" ? "cursor-not-allowed opacity-30" : myVote === -1 ? "text-earth" : "text-muted hover:text-earth"}`}>▼</button>
            </span>
            <span className="font-mono text-[13px] text-muted">{forks} fork{forks === 1 ? "" : "s"}</span>
            <span className="w-full text-right font-mono text-[13px] font-bold text-teal-300">@{b.by}</span>
          </div>
          {voteErr && <p className="mt-2 font-mono text-xs text-red-400">{voteErr}</p>}

          <div className="mt-4 rounded-2xl bg-obsidian border border-white/10 p-4 text-sm">
            {b.contact === "dm" && <p className="text-muted">Contact: talk here, in the thread. Numbers stay sealed.</p>}
            {b.contact === "wa" && mine && (
              <p className="text-muted">Your number is sealed. {b.waRequests.filter((r) => r.status === "pending").length} pending request(s) — answer them in <Link href="/benben/me" className="underline">your slot</Link>.</p>
            )}
            {b.contact === "wa" && !mine && !myRequest && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted">Poster prefers WhatsApp. Request it — they decide, you never see it until they say so.</p>
                <button onClick={requestWa} className="shrink-0 rounded-full border border-teal-300/50 px-5 py-2 text-sm font-semibold text-teal-300 hover:bg-teal-300 hover:text-black transition">Request</button>
              </div>
            )}
            {b.contact === "wa" && !mine && myRequest?.status === "pending" && (
              <p className="text-muted">Requested. The poster decides — check back.</p>
            )}
            {b.contact === "wa" && !mine && revealedToMe && (
              <p>WhatsApp: <span className="font-mono font-bold text-teal-300">{b.wa}</span> <span className="text-muted">— shared with you alone. Don&apos;t spread it.</span></p>
            )}
          </div>

          {(b.attachments || []).length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
                Attached · {(b.attachments || []).length}
              </div>
              <div className="mt-2 grid gap-2">
                {(b.attachments || []).map((f, i) => (
                  <div key={i}>
                    {f.type.startsWith("image/") && f.dataUrl ? (
                      <a href={f.dataUrl} download={f.name} className="block overflow-hidden rounded-2xl border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.dataUrl} alt={f.name} className="max-h-80 w-full object-cover" />
                      </a>
                    ) : (
                      <a
                        href={f.dataUrl || undefined}
                        download={f.name}
                        onClick={(e) => { if (!f.dataUrl) e.preventDefault(); }}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm hover:border-teal-300/60 transition"
                      >
                        <span className="truncate font-mono text-xs text-ivory/85">{f.name}</span>
                        <span className="shrink-0 font-mono text-xs text-teal-300">{f.dataUrl ? `↓ ${(f.size / 1024).toFixed(0)} KB` : "…"}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        <section className="mt-6">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">{b.comments.length} replies · reverse-chronological</h2>
          <div className="mt-3 space-y-2">
            {[...b.comments].reverse().map((c, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-panel px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-teal-300">@{c.by}</span>
                  {c.fork && <span className="rounded-md bg-violet-500/15 border border-violet-500/40 px-2 py-0.5 font-mono text-[11px] font-bold text-violet-300">[FORK] — building on this</span>}
                </div>
                <p className="mt-1 text-[15px] text-ivory/85">{c.text}</p>
              </div>
            ))}
            {b.comments.length === 0 && <p className="text-sm text-muted">Silence. Say the useful thing.</p>}
          </div>

          <form onSubmit={comment} className="mt-4 rounded-3xl border border-white/10 bg-panel p-5">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Reply as @…" maxLength={1200} className="w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-teal-300" />
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 font-mono text-xs text-muted">
                <input type="checkbox" checked={fork} onChange={(e) => setFork(e.target.checked)} className="h-4 w-4 accent-[#2dd4bf]" />
                [FORK] I&apos;m building on this
              </label>
              <button className="rounded-full bb-btn px-6 py-2.5 text-sm font-semibold transition">Reply →</button>
            </div>
            <p className="mt-2 font-mono text-xs text-dim">Text only. No links, no images.</p>
          </form>
        </section>
      </div>
    </main>
  );
}
