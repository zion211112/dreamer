"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BuildCard from "../../components/BuildCard";
import {
  Build,
  SEED_BUILDS,
  allMembers,
  castVote,
  isLive,
  loadBuilds,
  memberByUsername,
  myUsername,
  persistBuilds,
  tierOf
} from "../../lib/benben";

// BenBen: one post on the floor. Read it. Fork it.
export default function BenBen() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [me, setMe] = useState("");
  const [tier, setTier] = useState<"visitor" | "certified" | "hall">("visitor");
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

  const one = useMemo(() => {
    const open = builds.filter((b) => (b.visibility || "public") === "public" && isLive(b, b.tierAtPost, Date.now()));
    return open[0] || SEED_BUILDS[0];
  }, [builds]);

  const rec = builds.find((b) => b.id === one.id);
  const myVote = rec?.votedBy[me]?.value || 0;

  function vote(id: string, value: 1 | -1) {
    if (tier === "visitor") return;
    const { list, err: e } = castVote(builds, id, me, value, Date.now());
    if (e) { setErr(e); return; }
    setErr(null);
    setBuilds(list);
    persistBuilds(list);
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-3xl px-6 py-14" style={{ width: "100%" }}>
        <p className="text-xs font-bold tracking-widest text-teal-300">BEN-BEN · HALL 0 · THE FLOOR</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">One post on the floor.</h1>
        <p className="mt-3 max-w-2xl text-muted leading-relaxed">
          Read it. Fork it.
          Signed in as <span className="font-mono text-teal-300">@{me || "…"}</span>
          {tier === "visitor" ? " · playground" : tier === "certified" ? " · certified" : " · hall"}.
        </p>

        <div className="mt-6">
          <BuildCard
            b={one}
            now={now}
            tier={tier}
            myVote={myVote}
            voteErr={err}
            onVote={vote}
            onNominate={() => {}}
            canNominate={false}
          />
        </div>

        <p className="mt-8 text-center font-mono text-xs text-dim">
          One post. Nothing deleted — old builds rest on the <Link href="/benben/shelf" className="underline">cold shelf</Link>.
        </p>
      </div>
    </main>
  );
}
