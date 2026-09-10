"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GeoArt from "../../components/GeoArt";
import { KEYS, Member, SEED_MEMBERS, loadStored } from "../../lib/ledger";
import { SOURCE_TEXT } from "../../lib/source";

const PAPERS = [
  {
    id: "K-01",
    title: "Receipts > reports: a ledger model for rural learning",
    meta: "2026 · 8 pages · field data, Kirinyaga",
    abstract: "Grades evaporate. Hashes don't. Fifty learners, daily questions, sealed records. Headteachers believed the PDF more than the report card. Small science. Very practical."
  },
  {
    id: "K-02",
    title: "What sunflowers know about attention",
    meta: "2026 · 6 pages · geometry + teaching",
    abstract: "Five-minute drills, spaced like seeds. Early signal: +22% recall. Same math, fewer bees."
  },
  {
    id: "K-03",
    title: "Goats vs unicorns: a practical youth economy",
    meta: "2026 · 10 pages · cooperatives + M-Pesa",
    abstract: "Unicorns need venture capital. Goats need grass. Real KES 50,000 modeled: who earned, who learned, who maintains the tools."
  }
];

// Kemet-OS: the secret backgate. Research shelf + the Source.
// Registered members enter. The vault needs a seal.
export default function Kemet() {
  const [slot, setSlot] = useState<boolean | null>(null);
  const [id, setId] = useState("");
  const [open, setOpen] = useState(false);
  const [miss, setMiss] = useState(false);

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    setSlot(stored.some((m) => !SEED_MEMBERS.some((s) => s.id === m.id)));
  }, []);

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    const key = id.trim().toUpperCase();
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const m = [...customs, ...SEED_MEMBERS].find((x) => x.id.toUpperCase() === key);
    if (m && m.paid && m.verified) { setOpen(true); setMiss(false); }
    else { setOpen(false); setMiss(true); }
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  if (slot === null) return <main className="bg-obsidian text-ivory min-h-screen" />;

  if (!slot) {
    return (
      <main className="bg-obsidian text-ivory">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted">KEMET-OS · BACKGATE</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">No slot, no stacks.</h1>
          <p className="mt-3 text-muted">The research wing opens for registered members. Claim your slot first.</p>
          <a href="/ledger#join" className="mt-8 inline-block rounded-full bg-river px-8 py-3.5 text-sm font-bold text-white hover:bg-ivory hover:text-black transition">Claim a slot →</a>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="band" className="mx-auto mt-8 h-10 max-w-3xl px-6 w-full text-ivory opacity-[0.08]" />
        <div className="relative mx-auto max-w-3xl px-6 py-10">
          <p className="text-xs font-bold tracking-widest text-river">KEMET-OS · RESEARCH SHELF</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Read the work. Steal the ideas.</h1>
          <p className="mt-4 text-muted leading-relaxed">Short papers, readable by a Form 2 student and a professor. Tell us where we&apos;re wrong — that&apos;s research.</p>

          <div className="mt-8 space-y-4">
            {PAPERS.map((p) => (
              <article key={p.id} className="rounded-3xl border border-white/10 bg-panel p-7">
                <div className="text-xs text-muted">{p.id} · {p.meta}</div>
                <h2 className="mt-2 text-xl font-bold tracking-tight">{p.title}</h2>
                <p className="mt-2 text-[15px] text-ivory/80 leading-relaxed">{p.abstract}</p>
                <a href="mailto:partners@apt-labs.ke?subject=Paper%20request" className="mt-4 inline-block rounded-full bg-ivory px-5 py-2.5 text-[13px] font-semibold text-black hover:bg-river hover:text-white transition">
                  Request full text
                </a>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-panel border border-white/10 p-7">
            <div className="text-xs font-bold tracking-widest text-muted">THE VAULT · SEALED ONLY</div>
            {!open ? (
              <form onSubmit={unlock} className="mt-3">
                <p className="text-sm text-muted">Past papers + the Source. Enter your sealed ID:</p>
                <div className="mt-3 flex gap-2">
                  <input value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. AL-0042" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                  <button className="rounded-2xl bg-river px-6 text-sm font-semibold text-white hover:bg-ivory hover:text-black transition">Unlock</button>
                </div>
                {miss && <p className="mt-3 text-sm text-muted">That ID isn&apos;t sealed. <Link href="/ledger#join" className="underline">Get sealed →</Link></p>}
              </form>
            ) : (
              <div className="mt-4">
                <p className="text-emerald-300 font-bold text-sm">Vault open. First papers land with the pilots.</p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  <li>→ KCSE Maths Paper 1 — 2019–2024, worked</li>
                  <li>→ KCSE Physics — topical drills</li>
                  <li>→ Std 8 Science — term mocks</li>
                </ul>
                <div className="mt-6 text-xs font-bold tracking-widest text-gold">THE SOURCE · UNREDACTED</div>
                <pre className="mt-3 max-h-[50vh] overflow-y-auto whitespace-pre-wrap border border-gold/20 bg-obsidian p-5 font-mono text-xs leading-relaxed text-ivory/85">
                  {SOURCE_TEXT}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
