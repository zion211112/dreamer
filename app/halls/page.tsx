"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GeoArt from "../../components/GeoArt";
import { KEYS, Member, SEED_MEMBERS, loadStored, saveStored } from "../../lib/ledger";

const HALLS: { n: string; name: string; discipline: string; admin: string; gate: string }[] = [
  { n: "I", name: "Hall of Analysts", discipline: "STEM / Logic", admin: "@Thoth_Atlas", gate: "An impossible math paradox. Bring a pencil." },
  { n: "II", name: "Hall of Architects", discipline: "Systems / Design", admin: "@Poseidon_Ptah", gate: "A structural test across space and time." },
  { n: "III", name: "Hall of Builders", discipline: "Engineering / Field", admin: "@Nereus_Imhotep", gate: "Build it with nothing. That is the brief." },
  { n: "IV", name: "Hall of Intuitioners", discipline: "Philosophy / Spirit", admin: "@Triton_Ra", gate: "Prove it without words." },
  { n: "V", name: "Hall of Healers", discipline: "Life / Biology", admin: "@Oceanus_Sekhmet", gate: "Triage under absolute constraints." },
  { n: "VI", name: "Hall of Growers", discipline: "Agro-Ecology", admin: "@Proteus_Osiris", gate: "Keep a closed system alive." },
  { n: "VII", name: "Hall of Traders", discipline: "Economics / Flow", admin: "@Amphitrite_Thoth", gate: "Create value with zero capital." },
  { n: "VIII", name: "Hall of Storytellers", discipline: "Culture / Media", admin: "@Nereid_Maat", gate: "Compress a civilization into one story." }
];

// The halls room. Entry: pass the crucible. No paid doors —
// fail the test and there is no price that opens these.
export default function Halls() {
  const [sealed, setSealed] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  const [requested, setRequested] = useState<string[]>([]);

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const all = [...customs, ...SEED_MEMBERS];
    const myid = (window.localStorage.getItem(KEYS.myid) || "").toUpperCase();
    const me = myid ? all.find((m) => m.id.toUpperCase() === myid) : all.find((m) => m.paid && m.verified);
    if (me && me.paid && me.verified) { setSealed(true); setTier(me.tier); }
    try {
      const raw = window.localStorage.getItem("aptlabs-hall-req");
      if (raw) setRequested(JSON.parse(raw));
    } catch { /* unrequested */ }
  }, []);

  function request(name: string) {
    const v = [...requested, name];
    setRequested(v);
    try { window.localStorage.setItem("aptlabs-hall-req", JSON.stringify(v)); } catch { /* memory */ }
  }

  if (!sealed) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">THE HALLS · SEALED ONLY</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">No seal, no stairs down.</h1>
          <p className="mt-3 text-muted">Pass the crucible and the halls open. Fail and no price opens them — there is no paid door here.</p>
          <Link href="/crucible" className="mt-8 inline-block rounded-full bg-river px-8 py-3.5 text-sm font-bold text-white hover:bg-ivory hover:text-black transition">
            Face the crucible →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="pointer-events-none absolute -left-24 -top-24 h-[340px] w-[340px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">THE 8 HALLS · ROSTAU{tier ? ` · ENTERING AS ${tier.toUpperCase()}` : ""}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">You passed. Descend.</h1>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">Eight chambers. Each has a keeper, a discipline, and an impossible test. Request entry — the hall replies within 7 days. Diamond and Crystal invitations arrive on their own.</p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {HALLS.map((h) => (
              <div key={h.n} className="rounded-3xl border border-white/10 bg-panel p-7">
                <div className="flex items-baseline justify-between">
                  <span className="font-display italic text-2xl text-gold">{h.n}</span>
                  <span className="font-mono text-xs text-muted">{h.admin}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold">{h.name}</h2>
                <div className="text-sm text-muted">{h.discipline}</div>
                <p className="mt-3 text-sm text-ivory/85">{h.gate}</p>
                {requested.includes(h.name) ? (
                  <p className="mt-4 text-sm font-semibold text-emerald-300">Requested. The hall is watching.</p>
                ) : (
                  <button onClick={() => request(h.name)} className="mt-4 rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold hover:border-ivory transition">
                    Request the impossible test →
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-dashed border-white/20 p-6 text-sm text-muted">
            The Agora: halls meet weekly. The Paw: three sealed Diamonds, rotating, anonymous — appoints keepers, audits diamonds, settles disputes. Seats stay empty until the first Diamonds exist. That is honest.
          </div>
        </div>
      </div>
    </main>
  );
}
