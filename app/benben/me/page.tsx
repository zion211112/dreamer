"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Build,
  SEED_BUILDS,
  allMembers,
  isLive,
  loadBuilds,
  memberByUsername,
  myUsername,
  tierOf
} from "../../../lib/benben";
import { suggestUsername, validUsername } from "../../../lib/ledger";
import { RESERVED_HANDLES } from "../../../lib/halls";

// Your Slot: private stats. No public profile. No followers. No about-me.
// Just your numbers, your upgrades, and one rename a year.
export default function Slot() {
  const [me, setMe] = useState("");
  const [tier, setTier] = useState<"visitor" | "certified" | "hall">("visitor");
  const [builds, setBuilds] = useState<Build[]>([]);
  const [certAt, setCertAt] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");
  const [claimsDone, setClaimsDone] = useState(0);

  useEffect(() => {
    const u = myUsername() || "";
    setMe(u);
    const stored = loadBuilds().filter(
      (b) => b && typeof b.id === "string" && Array.isArray(b.comments)
    );
    const ids = new Set(stored.map((b) => b.id));
    const all = [...stored, ...SEED_BUILDS.filter((s) => !ids.has(s.id))];
    setBuilds(all);
    const members = allMembers();
    setTier(tierOf(u || null, (x) => memberByUsername(members, x)));
    try {
      const zp = window.localStorage.getItem("aptlabs-zep-profile-v1");
      if (zp) setClaimsDone(JSON.parse(zp).claimsCompleted || 0);
    } catch { /* uncounted */ }
    const m = memberByUsername(members, u);
    if (m && m.paid) {
      try {
        const raw = window.localStorage.getItem("aptlabs-cert-at");
        if (raw) {
          const map = JSON.parse(raw);
          if (map[m.id]) setCertAt(map[m.id]);
        }
      } catch { /* undated */ }
    }
  }, []);

  const now = Date.now();
  const mine = builds.filter((b) => b.by === me);
  const active = mine.filter((b) => isLive(b, b.tierAtPost, now)).length;
  const forksGot = mine.reduce((n, b) => n + b.comments.filter((c) => c.fork).length, 0);
  const forksGiven = builds.reduce((n, b) => n + b.comments.filter((c) => c.fork && c.by === me).length, 0);
  const myVotes = builds.reduce((n, b) => n + (b.votedBy[me] ? 1 : 0), 0);

  function rename(e: React.FormEvent) {
    e.preventDefault();
    try {
      const last = window.localStorage.getItem("aptlabs-rename-at");
      if (last && Date.now() - Number(last) < 365 * 86400000) {
        setMsg("One rename a year. Yours is spent — the yard remembers.");
        return;
      }
      const taken = [...allMembers().map((m) => m.username), ...RESERVED_HANDLES];
      builds.forEach((b) => { if (!taken.includes(b.by)) taken.push(b.by); });
      const bad = validUsername(newName, taken.filter((t) => t.toLowerCase() !== me.toLowerCase()));
      if (bad) { setMsg(bad); return; }
      const clean = newName.trim().replace(/^@/, "");
      const raw = window.localStorage.getItem("aptlabs-identity");
      if (raw) {
        const p = JSON.parse(raw);
        window.localStorage.setItem("aptlabs-identity", JSON.stringify({ ...p, username: clean }));
      }
      window.localStorage.setItem("aptlabs-rename-at", String(Date.now()));
      setMe(clean);
      setMsg(`Renamed. The floor now knows you as @${clean}. Old posts keep the old name — history doesn't rewrite.`);
      setNewName("");
    } catch {
      setMsg("The floor hiccuped. Try again.");
    }
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-xl px-6 py-14">
        <Link href="/benben" className="font-mono text-sm text-muted hover:text-ivory">← the floor</Link>
        <div className="mt-4 rounded-3xl border border-white/10 bg-panel p-7">
          <div className="flex items-center justify-between">
            <span className="font-mono text-lg font-bold bb-gradient-text">@{me}</span>
            <button
              onClick={() => { try { window.localStorage.removeItem("aptlabs-identity"); } catch { /* gone */ } window.location.href = "/"; }}
              className="font-mono text-xs text-muted underline"
            >
              Sign Out
            </button>
          </div>
          <div className="mt-5 space-y-2 font-mono text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-muted">TIER</span><span className="font-bold">{tier === "visitor" ? "Playground" : tier === "certified" ? "Certified" : "Hall"}</span></div>
            {certAt && <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-muted">CERTIFIED</span><span>{certAt}</span></div>}
            <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-muted">POSTS</span><span>{active} active · {mine.length - active} on shelf</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-muted">FORKS RECEIVED</span><span>{forksGot}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-muted">FORKS GIVEN</span><span>{forksGiven}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-muted">VOTES CAST</span><span>{myVotes}</span></div>
            <div className="flex justify-between"><span className="text-muted">CLAIMS COMPLETED</span><span>{claimsDone}</span></div>
          </div>

          <div className="mt-6 grid gap-2">
            <Link href="/benben" className="rounded-full border border-white/15 py-3 text-center text-sm font-semibold hover:border-teal-300 transition">Your Posts live on the floor →</Link>
            {tier === "visitor" && (
              <Link href="/cert" className="rounded-full bb-btn py-3 text-center text-sm font-bold transition">Get Certified — 50 KES →</Link>
            )}
            {tier === "certified" && (
              <Link href="/crucible" className="rounded-full bb-btn py-3 text-center text-sm font-bold transition">Enter the Halls — 100 KES →</Link>
            )}
          </div>

          {mine.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted">Your builds · {mine.length}</div>
              <div className="mt-3 space-y-1.5">
                {mine.map((b) => (
                  <Link key={b.id} href={`/benben/post/${b.id}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-obsidian transition">
                    <span className="truncate text-[15px] text-ivory/90">{b.title}</span>
                    <span className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold uppercase ${(b.visibility || "public") === "public" ? "border-white/10 text-muted" : "border-violet-500/40 text-violet-300"}`}>
                      {(b.visibility || "public") === "public" ? "Public" : b.visibility === "hall8" ? "Hall 8" : "Private"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={rename} className="mt-6 border-t border-white/10 pt-6">
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Rename (once a year)</label>
            <div className="mt-2 flex gap-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New username" maxLength={20} className="flex-1 rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm font-mono text-ivory outline-none focus:border-teal-300" />
              <button className="rounded-2xl border border-white/20 px-5 text-sm font-semibold hover:border-teal-300 transition">Rename</button>
            </div>
            {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
          </form>
        </div>
        <p className="mt-4 text-center font-mono text-xs text-dim">No public profile. No followers. Just your numbers.</p>
      </div>
    </main>
  );
}
