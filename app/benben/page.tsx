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
    const open = builds.filter((b) => (b.visibility || "public") === "public");
    if (sort === "new")
      return [...open]
        .filter((b) => isLive(b, b.tierAtPost, Date.now()))
        .sort((a, z) => z.createdTs - a.createdTs);
    if (sort === "needs")
      return open
        .filter((b) => !b.needs.nothing && isLive(b, b.tierAtPost, Date.now()))
        .sort((a, z) => {
          const rank = (x: Build) => (x.needs.funds > 0 ? 3 : x.needs.intellect.trim() ? 2 : x.needs.materials.trim() ? 1 : 0);
          return rank(z) - rank(a) || z.createdTs - a.createdTs;
        });
    if (sort === "solved")
      return open
        .filter((b) => b.type === "SOLUTION" && isLive(b, b.tierAtPost, Date.now()))
        .sort((a, z) => z.votes - a.votes);
    return rankFeed(open, now);
  }, [builds, sort, now]);

  const visible = feed;

  const sealed = useMemo(
    () => builds.filter((b) => b.visibility === "hall8" && isLive(b, b.tierAtPost, Date.now())),
    [builds]
  );

  const myVotes: Record<string, number> = {};
  builds.forEach((b) => {
    const v = b.votedBy[me];
    if (v) myVotes[b.id] = v.value;
  });

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="grid" className="pointer-events-none absolute inset-0 h-full w-full text-ivory opacity-[0.03]" />
        <div className="relative mx-auto max-w-4xl px-6 py-10">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-400">BEN-BEN · HALL 0 · THE FLOOR</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Every post is a build.</h1>
            <p className="mt-2 leading-relaxed">
              Name the problem. Name what's missing. Name what done looks like.
              Signed in as <span className="font-mono text-teal-400">@{me || "…"}</span>
              {tier === "visitor" ? " · playground" : tier === "certified" ? " · certified" : " · hall"}.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {(["velocity", "new", "needs", "solved"] as Sort[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${sort === s ? "bg-teal-600 text-black" : "border border-white/15 text-teal-400 hover:text-ivory"}`}
                >
                  {s === "needs" ? "Needs work" : s}
                </button>
              ))}
              <span className="text-xs text-teal-400/60">·</span>
              <Link href="/benben/shelf" className="text-[10px] text-teal-400/60 hover:text-ivory transition">Shelf</Link>
              <Link href="/benben/me" className="text-[10px] text-teal-400/60 hover:text-ivory transition">Slot</Link>
            </div>

            <div className="mt-6 space-y-3">
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
                <p className="text-sm text-teal-400/60 text-center">
                  The floor is quiet. <Link href="/benben/new" className="underline text-teal-400">Light the first fire.</Link>
                </p>
              )}
            </div>

            <p className="mt-4 text-[10px] text-teal-400/60">
              Velocity-ranked. No karma. Nothing deleted — old builds rest on the <Link href="/benben/shelf" className="underline text-teal-400">cold shelf</Link>.
            </p>
          </div>
        </div>

        {tier === "hall" && sealed.length > 0 && (
          <div className="mt-6 rounded-3xl border border-violet-500/20 bg-obsidian p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              Sealed for Hall 8 · {sealed.length}
            </div>
            <p className="mt-1 text-[10px] text-violet-400/70">
              Dreams under review. Read gently — the floor can't see these.
            </p>
            <div className="mt-2 space-y-1">
              {sealed.map((b) => (
                <Link key={b.id} href={`/benben/post/${b.id}`} className="block text-[13px] text-ivory/90 hover:text-teal-400 transition">
                  <span className="text-[10px] text-dim">[{b.domain}] </span>
                  <span>{b.title}</span>
                  <span className="text-[10px] text-dim"> · @{b.by}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/benben/new"
          className="fixed bottom-6 right-6 z-10 rounded-full bg-teal-600 py-2.5 text-[10px] font-bold text-black text-center transition hover:bg-teal-500"
          style={{ width: 55, height: 55, lineHeight: "55px" }}
        >
          + POST A BUILD
        </Link>

      </div>
    </main>
  );
}