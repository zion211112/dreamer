"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BuildCard from "../../components/BuildCard";
import GeoArt from "../../components/GeoArt";
import {
  BENBEN_NOMS_KEY,
  Build,
  Nomination,
  SEED_BUILDS,
  allMembers,
  castVote,
  isLive,
  loadBuilds,
  memberByUsername,
  myUsername,
  persistBuilds,
  rankFeed,
  tierOf
} from "../../lib/benben";
import { HALLS } from "../../lib/halls";

type Sort = "velocity" | "new" | "needs" | "solved";

// BenBen: the floor. Velocity-ranked builds, no karma, nothing deleted.
export default function BenBen() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [sort, setSort] = useState<Sort>("velocity");
  const [me, setMe] = useState("");
  const [tier, setTier] = useState<"visitor" | "certified" | "hall">("visitor");
  const [nomFor, setNomFor] = useState<string | null>(null);
  const [nomHall, setNomHall] = useState(HALLS[0].name);
  const [nomWhy, setNomWhy] = useState("");
  const [errId, setErrId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const stored = loadBuilds().filter(
      (b) => b && typeof b.id === "string" && b.needs && typeof b.domain === "string" && Array.isArray(b.comments)
    );
    const ids = new Set(stored.map((b) => b.id));
    const merged = [...stored, ...SEED_BUILDS.filter((s) => !ids.has(s.id))];
    setBuilds(merged.length > 0 ? merged : SEED_BUILDS);
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

  function vote(id: string, value: 1 | -1) {
    if (tier === "visitor") return;
    const { list, err: e } = castVote(builds, id, me, value, Date.now());
    if (e) { setErrId(id); setErr(e); return; }
    setErrId(null); setErr(null);
    save(list);
  }

  function nominate(e: React.FormEvent) {
    e.preventDefault();
    if (!nomFor || !nomWhy.trim()) return;
    try {
      const raw = window.localStorage.getItem(BENBEN_NOMS_KEY);
      const arr: Nomination[] = raw ? JSON.parse(raw) : [];
      arr.push({ postId: nomFor, hall: nomHall, reason: nomWhy.trim().slice(0, 140), by: me, ts: Date.now(), yes: [] });
      window.localStorage.setItem(BENBEN_NOMS_KEY, JSON.stringify(arr));
    } catch { /* the hall didn't hear */ }
    setNomFor(null); setNomWhy("");
  }

  const feed = useMemo(() => {
    if (sort === "new")
      return [...builds]
        .filter((b) => isLive(b, b.tierAtPost, Date.now()))
        .sort((a, z) => z.createdTs - a.createdTs);
    if (sort === "needs")
      return builds
        .filter((b) => !b.needs.nothing && isLive(b, b.tierAtPost, Date.now()))
        .sort((a, z) => {
          const rank = (x: Build) => (x.needs.funds > 0 ? 3 : x.needs.intellect.trim() ? 2 : x.needs.materials.trim() ? 1 : 0);
          return rank(z) - rank(a) || z.createdTs - a.createdTs;
        });
    if (sort === "solved")
      return builds
        .filter((b) => b.type === "SOLUTION" && isLive(b, b.tierAtPost, Date.now()))
        .sort((a, z) => z.votes - a.votes);
    return rankFeed(builds, now);
  }, [builds, sort, now]);

  const visible = feed;

  const myVotes: Record<string, number> = {};
  builds.forEach((b) => {
    const v = b.votedBy[me];
    if (v) myVotes[b.id] = v.value;
  });

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.035]" />
        <div className="relative mx-auto max-w-5xl px-6 py-14 lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start" style={{ width: "100%" }}>
        <div>
          <p className="text-xs font-bold tracking-widest text-river">BEN-BEN · HALL 0 · THE FLOOR</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Every post is a build.</h1>
          <p className="mt-3 max-w-2xl text-muted leading-relaxed">
            Name the problem. Name what&apos;s missing. Name what done looks like.
            Signed in as <span className="font-mono text-gold">@{me || "…"}</span>
            {tier === "visitor" ? " · playground" : tier === "certified" ? " · certified" : " · hall"}.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(["velocity", "new", "needs", "solved"] as Sort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded-full px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition ${sort === s ? "bg-ivory text-black" : "border border-white/15 text-muted hover:border-gold hover:text-ivory"}`}
              >
                {s === "needs" ? "Needs work" : s}
              </button>
            ))}
            <Link href="/benben/shelf" className="rounded-full px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider border border-white/15 text-muted hover:border-gold hover:text-ivory transition">
              Shelf
            </Link>
            <Link href="/benben/me" className="rounded-full px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider border border-white/15 text-muted hover:border-gold hover:text-ivory transition">
              Slot
            </Link>
          </div>

          <div className="mt-6 space-y-2">
            {visible.map((b) => (
              <BuildCard
                key={b.id}
                b={b}
                now={now}
                tier={tier}
                myVote={myVotes[b.id] || 0}
                voteErr={errId === b.id ? err : null}
                onVote={vote}
                onNominate={(id) => setNomFor(id)}
                canNominate={tier !== "visitor"}
              />
            ))}
            {visible.length === 0 && (
              <p className="rounded-3xl border border-white/10 bg-panel p-8 text-center text-sm text-muted">
                The floor is quiet. Light the first fire. <Link href="/benben/new" className="underline">Post a build →</Link>
              </p>
            )}
          </div>

          <p className="mt-8 text-center font-mono text-xs text-dim">
            Velocity-ranked. No karma. Nothing deleted — old builds rest on the <Link href="/benben/shelf" className="underline">cold shelf</Link>.
          </p>
        </div>
        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-white/10 bg-panel p-6">
            <div className="font-mono text-xs font-bold tracking-[0.2em] text-muted">ZEP TEPI</div>
            <p className="mt-2 text-sm text-muted">Not for everyone.</p>
            <Link href="/zep-tepi/gate" className="mt-4 block text-center rounded-full border border-gold/50 px-5 py-2.5 text-sm font-bold text-gold hover:bg-gold hover:text-black transition">
              Enter the gate →
            </Link>
          </div>
        </aside>
        </div>
      </div>

      <Link
        href="/benben/new"
        className="fixed bottom-6 right-6 z-40 rounded-full bg-gold px-7 text-black font-bold shadow-[0_10px_40px_-10px_rgba(212,175,55,0.6)] hover:bg-ivory transition hidden md:block"
        style={{ height: 55, lineHeight: "55px" }}
      >
        + POST A BUILD
      </Link>
      <div className="md:hidden sticky bottom-0 z-40 border-t border-white/10 bg-obsidian/95 p-3 backdrop-blur">
        <Link href="/benben/new" className="block rounded-full bg-gold py-3.5 text-center font-bold text-black">
          + POST A BUILD
        </Link>
      </div>

      {nomFor && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 p-4" onClick={() => setNomFor(null)}>
          <form onSubmit={nominate} onClick={(e) => e.stopPropagation()} className="mx-auto mt-16 max-w-md rounded-3xl bg-panel border border-white/10 p-7">
            <div className="text-xs font-bold tracking-widest text-gold">SILENT NOMINATION</div>
            <p className="mt-2 text-sm text-muted">Which hall should see this? The poster is never told — no shortlists, no rejections, no noise.</p>
            <select value={nomHall} onChange={(e) => setNomHall(e.target.value)} className="mt-4 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold [&>option]:bg-obsidian">
              {HALLS.map((h) => <option key={h.name} value={h.name}>{h.name}</option>)}
            </select>
            <input value={nomWhy} onChange={(e) => setNomWhy(e.target.value)} placeholder="One line: why this hall? (e.g. Fits Builders — needs hands)" maxLength={140} className="mt-2 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
            <button className="mt-3 w-full rounded-full bg-gold py-3 text-sm font-bold text-black hover:bg-ivory transition">Nominate silently →</button>
          </form>
        </div>
      )}
    </main>
  );
}
