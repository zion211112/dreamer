"use client";

import Link from "next/link";
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

const RING = [
  { n: 1, angle: -90 }, { n: 2, angle: -38 }, { n: 3, angle: 14 },
  { n: 4, angle: 66 }, { n: 5, angle: 118 }, { n: 6, angle: 170 }, { n: 7, angle: 218 }
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

// The Forest. Gated on pass — otherwise the gate.
// Hall 8 center open; Halls 1–7 locked ring; Hall 7 wakes on crew graduation.
export default function Forest() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState("");
  const [claims, setClaims] = useState<HallClaim[]>([]);
  const [openBanner, setOpenBanner] = useState<number | null>(null);
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

  if (!ready) return <main className="bg-[#06060f] min-h-screen" />;

  return (
    <main className="relative overflow-hidden">
      <Metatron />
      <CursorRipple />
      <SoundToggle />

      <div className="relative mx-auto max-w-5xl px-6 py-14">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · THE FOREST</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-light tracking-wide" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            You are through. The Forest keeps what the floor cannot.
          </h1>
        </Reveal>

        {/* OCTAGON */}
        <Reveal className="mt-12">
          <div className="relative mx-auto hidden h-[520px] max-w-[520px] sm:block">
            {RING.map(({ n, angle }) => {
              const rad = (angle * Math.PI) / 180;
              const x = 50 + 38 * Math.cos(rad);
              const y = 50 + 38 * Math.sin(rad);
              const hall = HALLS[n - 1];
              const lit = n === 7 && claims.some((c) => c.status === "passed" && c.crew.includes(me));
              return (
                <button
                  key={n}
                  onClick={() => setOpenBanner(n)}
                  className="group absolute"
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
                  aria-label={`Hall ${n}, locked`}
                >
                  <span
                    className={`diamond block h-20 w-20 border transition ${
                      lit ? "border-[#e0a040] bg-[#e0a040]/10 center-pulse" : "border-white/15 bg-[#0a0a25]/80 opacity-60 group-hover:opacity-100 group-hover:border-[#c8763c]"
                    }`}
                  />
                  <span className="diamond-inner absolute inset-0 grid place-items-center text-center">
                    <span>
                      <span className="block font-mono text-[10px] text-[#c8763c]">H{n}</span>
                      <span className="block font-mono text-[9px] text-white/50">{hall.admin}</span>
                    </span>
                  </span>
                </button>
              );
            })}
            <Link
              href="#hall8"
              className="center-pulse absolute grid h-32 w-32 place-items-center rounded-full border border-[#c8763c] bg-[#0a0a25]/90 text-center"
              style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
            >
              <span>
                <span className="block font-mono text-xs text-[#c8763c]">H8 · YOU</span>
                <span className="block font-mono text-[10px] text-white/60">the vestibule</span>
              </span>
            </Link>
          </div>

          {/* small screens: stacked ring */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:hidden">
            {RING.map(({ n }) => {
              const hall = HALLS[n - 1];
              return (
                <button key={n} onClick={() => setOpenBanner(n)} className="rounded-2xl border border-white/15 bg-[#0a0a25]/80 p-4 text-left opacity-70">
                  <div className="font-mono text-xs text-[#c8763c]">HALL {n} · LOCKED</div>
                  <div className="mt-1 font-mono text-xs text-white/60">{hall.admin}</div>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* HALL 8 */}
        <Reveal className="mt-14" >
          <div id="hall8" className="rounded-3xl border border-[#c8763c]/30 bg-[#0a0a25]/70 p-7 md:p-9">
            <Doorway />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">HALL 8 · THE VESTIBULE</div>
                <p className="mt-2 max-w-xl text-[15px] text-[#e8e0d8]/80">
                  Claims are posted, voted, committed, and executed here. When a claim completes
                  and its crew is confirmed, the crew graduates to Hall 7.
                </p>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="rounded-full bg-[#c8763c] px-6 py-3 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
                + POST A CLAIM
              </button>
            </div>

            {showForm && (
              <form onSubmit={post} className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-[#06060f]/60 p-5">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Claim title (89 max)" maxLength={100} className="rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]" />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="What is being built, and why here?" maxLength={1200} className="rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]" />
                <div className="grid sm:grid-cols-2 gap-2">
                  <input value={needs} onChange={(e) => setNeeds(e.target.value)} placeholder="Needs: labor, materials, funds…" maxLength={200} className="rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]" />
                  <input value={done} onChange={(e) => setDone(e.target.value)} placeholder="Done looks like… (one sentence)" maxLength={144} className="rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]" />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" maxLength={60} className="rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]" />
                  <input value={funds} onChange={(e) => setFunds(e.target.value)} placeholder="Funds needed in KES (optional)" inputMode="numeric" className="rounded-2xl border border-white/15 bg-[#06060f] px-4 py-3 text-sm text-[#e8e0d8] outline-none focus:border-[#c8763c]" />
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
                    <h3 className="mt-2 text-lg font-bold">{c.title}</h3>
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

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 p-5">
                <div className="font-mono text-[11px] tracking-[0.2em] text-white/40">FUND WIDGET · LOCAL DEMO</div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#e0a040]">
                  KES {fundNeed.toLocaleString()}
                </div>
                <p className="mt-1 font-mono text-xs text-white/40">sum of open claim needs on this device</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-5">
                <div className="font-mono text-[11px] tracking-[0.2em] text-white/40">LOCKED HALLS</div>
                <p className="mt-1 font-mono text-xs leading-relaxed text-white/60">
                  ◇ HALL 1 @Thoth_Atlas · closed<br />
                  ◇ HALL 2 @Poseidon_Ptah · closed<br />
                  ◇ HALL 3 @Nereus_Imhotep · closed<br />
                  ◇ HALL 4 @Triton_Ra · closed<br />
                  ◇ HALL 5 @Oceanus_Sekhmet · closed<br />
                  ◇ HALL 6 @Proteus_Osiris · closed<br />
                  ◆ HALL 7 @Amphitrite_Thoth · opens on completed claim
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {openBanner !== null && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/85 p-4" onClick={() => setOpenBanner(null)}>
          <div className="mx-auto mt-10 max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const hall = HALLS[openBanner - 1];
              const masks = ["Sphinx", "Anubis", "Seshat", "Thoth", "Maat", "Ptah", "Khnum"];
              const lines = [
                "The riddle is the answer.",
                "What is light is heavy.",
                "What is written survives.",
                "The word precedes the world.",
                "The balance is not equal. It is just.",
                "What is spoken becomes.",
                "The clay remembers."
              ];
              const Banner = HallBanner;
              return (
                <div>
                  <Banner hall={openBanner} />
                  <p className="mt-4 text-center font-mono text-sm text-[#c8763c]">@{hall.admin} · mask “{masks[openBanner - 1]}”</p>
                  <p className="mt-1 text-center text-sm text-white/50">{lines[openBanner - 1]} — locked. No entry. No hint.</p>
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
