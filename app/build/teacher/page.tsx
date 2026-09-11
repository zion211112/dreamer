import Link from "next/link";
import { TEACHER_FEE } from "../../../lib/ledger";

// Teacher door: stripped to the bone. Price, link, nothing else.
// The console at /teacher does the working.
export default function Teacher() {
  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-xl px-6 py-24 md:py-32 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted">TEACHER DOOR · {TEACHER_FEE}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold leading-tight">
          250 bob a month.<br />The shelves open after login.
        </h1>
        <Link href="/teacher" className="mt-8 inline-block rounded-full bg-gold px-10 py-4 text-sm font-bold text-black hover:bg-ivory transition">
          Enter the console →
        </Link>
        <p className="mt-4 font-mono text-xs text-dim">Animations · Planners · Guides</p>
      </div>
    </main>
  );
}
