"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Result = { hd: number; es: number; pass: boolean; ts: number };

// Fail: totals only, no answers, retry date. Pass: one line, one button.
export default function ZepResult() {
  const [r, setR] = useState<Result | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("aptlabs-zep-result");
      if (raw) setR(JSON.parse(raw) as Result);
    } catch { /* no result to show */ }
  }, []);

  if (!r) {
    return (
      <main className="bg-[#06060f] text-[#e8e0d8]">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · RESULT</p>
          <h1 className="mt-4 text-3xl" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>Nothing to read.</h1>
          <Link href="/zep-tepi/gate" className="mt-8 inline-block rounded-full bg-[#c8763c] px-8 py-3.5 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
            Back to the gate →
          </Link>
        </div>
      </main>
    );
  }

  if (!r.pass) {
    const retry = new Date(r.ts + 7 * 86400000).toLocaleDateString();
    return (
      <main className="bg-[#06060f] text-[#e8e0d8]">
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · RESULT</p>
          <p className="mt-8 font-mono text-sm text-white/60">History {r.hd} / 24</p>
          <p className="mt-1 font-mono text-sm text-white/60">Enslavement {r.es} / 35</p>
          <h1 className="mt-6 text-3xl" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            You did not pass. You may retry in 7 days.
          </h1>
          <p className="mt-3 font-mono text-sm text-white/40">Return after {retry}.</p>
          <Link href="/benben" className="mt-8 inline-block rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold hover:border-white transition">
            Back to the floor →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#06060f] text-[#e8e0d8]">
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-[0.25em] text-[#c8763c]">ZEP TEPI · RESULT</p>
        <h1 className="mt-8 text-4xl" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>You are through.</h1>
        <Link href="/zep-tepi" className="mt-10 inline-block rounded-full bg-[#c8763c] px-8 py-3.5 text-sm font-bold text-black hover:bg-[#e8e0d8] transition">
          Enter the Forest.
        </Link>
      </div>
    </main>
  );
}
