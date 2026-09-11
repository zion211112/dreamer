"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CursorRipple from "../../components/forest/CursorRipple";
import HallBanner, { Doorway } from "../../components/forest/HallBanner";
import Metatron from "../../components/forest/Metatron";
import Reveal from "../../components/forest/Reveal";
import { myUsername } from "../../lib/benben";
import { HALLS } from "../../lib/halls";
import {
  HallClaim,
  loadClaims,
  loadProfile,
  saveClaims,
  saveProfile
} from "../../lib/zeptepi";

const MASKS = ["Sphinx", "Anubis", "Seshat", "Thoth", "Maat", "Ptah", "Khnum"];
const LINES = [
  "The riddle is the answer.",
  "What is light is heavy.",
  "What is written survives.",
  "The word precedes the world.",
  "The balance is not equal. It is just.",
  "What is spoken becomes.",
  "The clay remembers."
];

function SoundToggle() {
  const [on, setOn] = useState(false);
  function toggle() {
    const next = !on;
    setOn(next);
    if (next) {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 55;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.4);
        window.setTimeout(() => ctx.close(), 4000);
      } catch { /* silence is also an answer */ }
    }
  }
  return (
    <button onClick={toggle} className="fixed bottom-5 left-5 z-40 rounded-full border border-white/15 px-4 py-1.5 font-mono text-xs text-white/50 hover:text-white transition">
      [ sound {on ? "on" : "off"} ]
    </button>
  );
}

// The Forest, distilled: a kicker, one word, one door.
// Through the door: eight blocks in a row — Hall 8 open,
// Halls 1–7 locked. No maze. Everything visible.
export default function Forest() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [me, setMe] = useState("");
  const [claims, setClaims] = useState<HallClaim[]>([]);
  const [openBanner, setOpenBanner] = useState<number | null>(null);
  const [hall8Open, setHall8Open] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [needs, setNeeds] = useState("");
  const [done, setDone] = useState("");
  const [location, setLocation] = useState("");
  const [funds, setFunds] = useState("");

  useEffect(() => {
    const p = loadProfile();
    if (!p.passed) {
      router.push("/zep-tepi/gate");
      return;
    }
    setMe(myUsername() || "");
    setClaims(loadClaims());
    setReady(true);
  }, [router]);

  function persist(v: HallClaim[]) {
    setClaims(v);
    saveClaims(v);
  }

  function vote(id: string) {
    persist(claims.map((c) =>
      c.id === id ? { ...c, votes: { ...c.votes, [me || "anon"]: 1 } } : c
    ));
  }

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !done.trim()) return;
    const id = "HC-" + Date.now().toString(36).toUpperCase();
    persist([
      {
        id, by: me || "anon", title: title.trim().slice(0, 90), body: body.trim().slice(0, 1200),
        needs: needs.trim().slice(0, 200), done: done.trim().slice(0, 144),
        location: location.trim().slice(0, 60), status: "active",
        votes: {}, crew: [me || "anon"], createdTs: Date.now(),
        fundsKes: Number(funds) || 0
      } as HallClaim & { fundsKes: number },
      ...claims
    ]);
    setTitle(""); setBody(""); setNeeds(""); setDone(""); setLocation(""); setFunds("");
    setShowForm(false);
  }

  function commit(id: string) {
    if (!me) return;
    persist(claims.map((c) =>
      c.id === id && !c.crew.includes(me) ? { ...c, crew: [...c.crew, me] } : c
    ));
  }

  function graduate(id: string) {
    const c = claims.find((x) => x.id === id);
    if (!c || c.by !== me) return;
    if (c.crew.length < 2) return;
    persist(claims.map((x) => (x.id === id ? { ...x, status: "passed" as const } : x)));
    const p = loadProfile();
    if (c.crew.includes(me)) {
      saveProfile({ ...p, currentHall: 7 });
    }
    router.push("/zep-tepi/hall-7");
  }

  const active = useMemo(() => claims.filter((c) => c.status === "active"), [claims]);
  const fundNeed = useMemo(
    () => active.reduce((n, c) => n + ((c as HallClaim & { fundsKes?: number }).fundsKes || 0), 0),
    [active]
  );
  const hall7Lit = claims.some((c) => c.status === "passed" && c.crew.includes(me));

  if (!ready) return <main className="bg-[#06060f] min-h-screen" />;

  const field = "rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]";

  return (
    <main className="relative overflow-hidden">
      <Metatron />
      <CursorRipple />
      <SoundToggle />

      {!entered ? (
        <div className="relative mx-auto flex min-h-[85vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · THE GATE</p>
          <h1 className="mt-6 text-7xl md:text-9xl font-light tracking-wide" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            African
          </h1>
          <button onClick={() => setEntered(true)} className="mt-10 rounded-full bg-[#c8763c] px-10 py-4 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
            Enter the Forest →
          </button>
        </div>
      ) : (
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <Reveal>
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · THE HALLS</p>
              <button onClick={() => setEntered(false)} className="font-mono text-xs text-white/40 hover:text-white transition">← back</button>
            </div>
          </Reveal>

          {/* Eight blocks, aligned. Hall 8 open — the rest locked. */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <button
              onClick={() => setHall8Open(!hall8Open)}
              className={`rounded-2xl border p-6 text-left transition ${hall8Open ? "border-[#c8763c] bg-[#c8763c]/10" : "border-[#c8763c]/50 bg-[#0a0a25]/80 hover:border-[#c8763c]"}`}
            >
              <div className="font-mono text-xs font-bold text-[#c8763c]">HALL 8 · OPEN</div>
              <div className="mt-2 text-lg font-bold">You</div>
              <div className="mt-1 font-mono text-[11px] text-white/50">the vestibule · {active.length} open claim{active.length === 1 ? "" : "s"}</div>
            </button>

            {[1, 2, 3, 4, 5, 6].map((n) => {
              const hall = HALLS[n - 1];
              return (
                <button
                  key={n}
                  onClick={() => setOpenBanner(n)}
                  className="rounded-2xl border border-white/10 bg-[#0a0a25]/60 p-6 text-left opacity-70 transition hover:border-[#c8763c]/60 hover:opacity-100"
                >
                  <div className="font-mono text-xs font-bold text-white/40">HALL {n} · LOCKED</div>
                  <div className="mt-2 font-bold">{hall.name.replace("Hall of ", "")}</div>
                  <div className="mt-1 font-mono text-[11px] text-white/40">@{hall.admin}</div>
                </button>
              );
            })}

            {hall7Lit ? (
              <button
                onClick={() => router.push("/zep-tepi/hall-7")}
                className="center-pulse rounded-2xl border border-[#e0a040] bg-[#e0a040]/10 p-6 text-left transition hover:bg-[#e0a040]/20"
              >
                <div className="font-mono text-xs font-bold text-[#e0a040]">HALL 7 · OPEN</div>
                <div className="mt-2 font-bold">Traders</div>
                <div className="mt-1 font-mono text-[11px] text-white/50">the capstone · enter →</div>
              </button>
            ) : (
              <button
                onClick={() => setOpenBanner(7)}
                className="rounded-2xl border border-white/10 bg-[#0a0a25]/60 p-6 text-left opacity-70 transition hover:border-[#c8763c]/60 hover:opacity-100"
              >
                <div className="font-mono text-xs font-bold text-white/40">HALL 7 · LOCKED</div>
                <div className="mt-2 font-bold">Traders</div>
                <div className="mt-1 font-mono text-[11px] text-white/40">@Amphitrite_Thoth</div>
              </button>
            )}
          </div>

          {/* Hall 8 engine, opened from its block */}
          {hall8Open && (
            <Reveal className="mt-6">
              <div className="rounded-3xl border border-[#c8763c]/30 bg-[#0a0a25]/70 p-7 md:p-9">
                <Doorway />
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-xl text-[15px] text-[#e8e0d8]/80">
                    Claims are posted, voted, committed, and executed here. When a claim completes
                    and its crew is confirmed, the crew graduates to Hall 7.
                  </p>
                  <button onClick={() => setShowForm(!showForm)} className="rounded-full bg-[#c8763c] px-6 py-3 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
                    + POST A CLAIM
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={post} className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-[#06060f]/60 p-5">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Claim title (89 max)" maxLength={100} className={field} />
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="What is being built, and why here?" maxLength={1200} className={field} />
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input value={needs} onChange={(e) => setNeeds(e.target.value)} placeholder="Needs: labor, materials, funds…" maxLength={200} className={field} />
                      <input value={done} onChange={(e) => setDone(e.target.value)} placeholder="Done looks like… (one sentence)" maxLength={144} className={field} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" maxLength={60} className={field} />
                      <input value={funds} onChange={(e) => setFunds(e.target.value)} placeholder="Funds needed in KES (optional)" inputMode="numeric" className={field} />
                    </div>
                    <button className="rounded-2xl bg-[#c8763c] py-3 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">Post claim →</button>
                  </form>
                )}

                <div className="mt-6 grid gap-3">
                  {active.length === 0 && (
                    <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-white/50">
                      No claims yet. The vestibule waits for the first crew.
                    </p>
                  )}
                  {active.map((c) => {
                    const votes = Object.keys(c.votes).length;
                    const inCrew = c.crew.includes(me);
                    return (
                      <div key={c.id} className="rounded-2xl border border-white/10 bg-[#06060f]/60 p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-mono text-xs text-white/40">{c.id} · @{c.by}{c.location ? ` · ${c.location}` : ""}</span>
                          <span className="font-mono text-xs text-[#e0a040]">{votes} committed-votes · crew {c.crew.length}</span>
                        </div>
                        <h3 className="mt-1 text-lg font-bold">{c.title}</h3>
                        <p className="mt-1 text-sm text-[#e8e0d8]/75">{c.body}</p>
                        {c.needs && <p className="mt-1 font-mono text-xs text-white/50">NEEDS: {c.needs}</p>}
                        <p className="mt-1 font-mono text-xs italic text-white/50">DONE: {c.done}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => vote(c.id)} className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-xs hover:border-[#c8763c] transition">▲ back it</button>
                          {!inCrew && me && (
                            <button onClick={() => commit(c.id)} className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-xs hover:border-[#c8763c] transition">Commit (join crew)</button>
                          )}
                          {c.by === me && c.crew.length >= 2 && (
                            <button onClick={() => graduate(c.id)} className="rounded-full bg-[#c8763c] px-4 py-1.5 font-mono text-xs font-bold text-black hover:bg-[#e8e0d8] transition">
                              Complete + graduate crew →
                            </button>
                          )}
                        </div>
                        {c.by === me && c.crew.length < 2 && (
                          <p className="mt-2 font-mono text-xs text-white/40">A crew needs at least two. Wait for a committer.</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 p-5">
                  <div className="font-mono text-[11px] tracking-[0.2em] text-white/40">FUND WIDGET · LOCAL DEMO</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#e0a040]">
                    KES {fundNeed.toLocaleString()}
                  </div>
                  <p className="mt-1 font-mono text-xs text-white/40">sum of open claim needs on this device</p>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      )}

      {openBanner !== null && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/85 p-4" onClick={() => setOpenBanner(null)}>
          <div className="mx-auto mt-10 max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const hall = HALLS[openBanner - 1];
              return (
                <div>
                  <HallBanner hall={openBanner} />
                  <p className="mt-4 text-center font-mono text-sm text-[#c8763c]">@{hall.admin} · mask “{MASKS[openBanner - 1]}”</p>
                  <p className="mt-1 text-center text-sm text-white/50">{LINES[openBanner - 1]} — locked. No entry. No hint.</p>
                  <button onClick={() => setOpenBanner(null)} className="mx-auto mt-4 block rounded-full border border-white/20 px-6 py-2 text-sm hover:border-white transition">Return →</button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
