"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { myUsername } from "../../../lib/benben";
import {
  HallClaim,
  HallUpdate,
  loadClaims,
  loadProfile,
  loadUpdates,
  saveClaims,
  saveProfile,
  saveUpdates
} from "../../../lib/zeptepi";

// Hall 7: the capstone. Only crews with a completed, graduated claim enter.
// Private thread: updates, artifacts, learnings. When the crew calls it
// done, the claim archives to the Cold Shelf and every member's
// `Claims completed` increments. That count is the entire reputation system.
export default function HallSeven() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState("");
  const [claims, setClaims] = useState<HallClaim[]>([]);
  const [updates, setUpdates] = useState<HallUpdate[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [kind, setKind] = useState<"update" | "artifact" | "learning">("update");
  const [text, setText] = useState("");

  useEffect(() => {
    const u = myUsername() || "";
    setMe(u);
    setClaims(loadClaims());
    setUpdates(loadUpdates());
  }, []);

  useEffect(() => {
    if (!me) return;
    const mine = loadClaims().filter((c) => c.status === "passed" && c.crew.includes(me));
    if (mine.length > 0) setReady(true);
    else router.push("/zep-tepi");
  }, [me, router]);

  const mine = claims.filter((c) => c.status === "passed" && c.crew.includes(me));
  const active = sel ? mine.find((c) => c.id === sel) || mine[0] : mine[0];
  const thread = active ? updates.filter((u) => u.claimId === active.id) : [];

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !text.trim()) return;
    const u: HallUpdate = {
      id: "HU-" + Date.now().toString(36).toUpperCase(),
      claimId: active.id,
      by: me,
      kind,
      text: text.trim().slice(0, 800),
      ts: Date.now()
    };
    const next = [...updates, u];
    setUpdates(next);
    saveUpdates(next);
    setText("");
  }

  function complete() {
    if (!active) return;
    const next = claims.map((c) => (c.id === active.id ? { ...c, status: "archived" as const } : c));
    setClaims(next);
    saveClaims(next);
    const p = loadProfile();
    saveProfile({ ...p, claimsCompleted: (p.claimsCompleted || 0) + 1 });
    router.push("/zep-tepi");
  }

  if (!ready) return <main className="bg-[#06060f] min-h-screen" />;

  return (
    <main className="bg-[#06060f] text-[#e8e0d8]">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">HALL 7 · THE CAPSTONE</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-light" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          You are here because a crew formed. You did the work. You finished.
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {mine.map((c) => (
            <button
              key={c.id}
              onClick={() => setSel(c.id)}
              className={`rounded-full px-5 py-2 font-mono text-xs transition ${active?.id === c.id ? "bg-[#c8763c] text-black font-bold" : "border border-white/15 text-white/60 hover:border-white"}`}
            >
              {c.title.slice(0, 28)}
            </button>
          ))}
        </div>

        {active && (
          <div className="mt-6 rounded-3xl border border-[#c8763c]/30 bg-[#0a0a25]/70 p-7">
            <div className="font-mono text-xs text-white/40">{active.id} · crew: {active.crew.join(", ")}</div>
            <h2 className="mt-2 text-xl font-bold">{active.title}</h2>
            <p className="mt-1 text-sm text-[#e8e0d8]/75">{active.body}</p>
            <p className="mt-2 font-mono text-xs italic text-white/50">DONE: {active.done}</p>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
              {thread.map((u) => (
                <div key={u.id} className="rounded-2xl bg-[#06060f]/70 px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-[#c8763c]">[{u.kind.toUpperCase()}]</span>{" "}
                  <span className="font-mono text-xs text-white/50">@{u.by}</span>
                  <p className="mt-1 text-[#e8e0d8]/85">{u.text}</p>
                </div>
              ))}
              {thread.length === 0 && <p className="text-sm text-white/40">No entries yet. Log the work as it happens.</p>}
            </div>

            <form onSubmit={post} className="mt-4">
              <div className="flex gap-2">
                {(["update", "artifact", "learning"] as const).map((k) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setKind(k)}
                    className={`rounded-full px-4 py-1.5 font-mono text-xs transition ${kind === k ? "bg-[#c8763c] text-black font-bold" : "border border-white/15 text-white/60"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Update, artifact note, or learning…" maxLength={800} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]" />
              <div className="mt-3 flex flex-wrap gap-3">
                <button className="rounded-full bg-[#c8763c] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">Log →</button>
                <button type="button" onClick={complete} className="rounded-full border border-white/20 px-6 py-2.5 text-sm hover:border-white transition">
                  Crew calls it complete →
                </button>
              </div>
              <p className="mt-2 font-mono text-xs text-white/40">Completing archives the claim to the Cold Shelf and increments every member&apos;s Claims completed.</p>
            </form>
          </div>
        )}

        <p className="mt-8">
          <Link href="/zep-tepi" className="font-mono text-sm text-white/40 hover:text-white">← the Forest</Link>
        </p>
      </div>
    </main>
  );
}
