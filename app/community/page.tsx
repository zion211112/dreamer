"use client";

import { useEffect, useState } from "react";

type Msg = { name: string; text: string; ts: number };
const KEY = "aptlabs-community-v1";

const seed: Msg[] = [
  { name: "Wanjiku", text: "Ledger ID 0042 here. Finished fractions. Who wants the solar wiring notes?", ts: Date.now() - 86400000 },
  { name: "Otis", text: "Mwalimu wa φ hapa. Remember: 137.5° — like sharing chapati fairly. No one gets the burnt piece twice.", ts: Date.now() - 43000000 }
];

export default function Community() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setMsgs(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(msgs.slice(-50)));
    } catch {}
  }, [msgs]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { name: name.trim() || "Anonymous goat", text: t.slice(0, 280), ts: Date.now() }]);
    setText("");
  }

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <p className="text-xs font-bold tracking-widest text-river">COMMUNITY · SHENG / KISWAHILI / ENGLISH</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Sema. No gurus.</h1>
        <p className="mt-3 text-muted leading-relaxed text-[15px]">
          Learners, fundis, parents, skeptics. Show work, share notes, ask dumb questions proudly.
          Stored in your browser for now — Ledger sync comes next. Ego stays outside.
        </p>

        <div className="mt-6 rounded-2xl border border-black/10 bg-cream p-4 text-[13px] text-muted">
          Rules: 1. No guru behavior. 2. Kiswahili, Sheng, English — zote sawa. 3. Proof &gt; promises. 4. Be kind, be scientific.
        </div>

        <div className="mt-6 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex justify-between text-xs">
                <span className="font-bold">{m.name}</span>
                <span className="text-muted">{new Date(m.ts).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-[15px] leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={send} className="mt-6 rounded-3xl border border-black/10 bg-cream p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jina (optional)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river"
            maxLength={30}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Andika hapa… e.g. Nani ako na notes za matrices?"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-river"
            rows={3}
            maxLength={280}
          />
          <button className="mt-2 w-full rounded-full bg-river py-3.5 text-sm font-semibold text-white hover:bg-ink transition">
            Tuma →
          </button>
        </form>
      </div>
    </main>
  );
}
