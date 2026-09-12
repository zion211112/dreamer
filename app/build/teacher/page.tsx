import Link from "next/link";
import { TEACHER_FEE } from "../../../lib/ledger";

export default function Teacher() {
  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-xl px-6 py-24 md:py-32 text-center relative">
        {/* Floral motif using SVG background */}
        <svg className="absolute -inset--2 -w-24 -h-24 opacity-5 rotate-45 md:inset-0 md:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5" />
        </svg>
        
        <p className="font-mono text-xs tracking-[0.2em] text-emerald-400">TEACHER DOOR · {TEACHER_FEE}</p>
        <h1 className="mt-6 font-display text-4xl md:text-5xl font-semibold leading-tight">
          250 bob a month.<br />The shelves open after login.
        </h1>
        <Link href="/teacher" className="mt-8 inline-block rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-black hover:bg-teal-500 transition">
          Enter the console →
        </Link>
        <p className="mt-4 font-mono text-xs text-dim">Animations · Planners · Guides</p>
      </div>
    </main>
  );
}