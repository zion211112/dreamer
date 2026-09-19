import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "APT-LABS · Kirinyaga, Kenya",
  description: "A public record of work, skill, and trust in Kirinyaga, Kenya."
};

export default function HomePage() {
  return (
    <main className="site-page">
      <section className="site-frame grid min-h-[calc(100svh-64px)] content-center gap-16 py-16 md:grid-cols-[1.15fr_0.85fr] md:gap-20 md:py-24">
        <div>
          <p className="site-kicker">Kirinyaga, Kenya · public record</p>
          <h1 className="mt-6 max-w-[10ch] font-display text-5xl leading-[1.02] tracking-tight text-ivory sm:text-6xl">
            The ledger of useful work.
          </h1>
          <p className="mt-6 max-w-[44ch] text-base leading-7 text-muted">
            A living record of people, skills, and commitments. Open to the people who make the place work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ledger" className="site-action">Open the ledger</Link>
            <Link href="/benben" className="site-action-secondary">Enter the floor</Link>
          </div>
        </div>

        <div className="self-end border-t border-ivory/15 pt-5 md:self-center">
          <p className="site-kicker">Three working surfaces</p>
          <ol className="mt-5 divide-y divide-ivory/10 border-y border-ivory/10">
            <li className="grid grid-cols-[32px_1fr] gap-4 py-4">
              <span className="font-mono text-xs text-dim">01</span>
              <div><h2 className="font-display text-xl text-ivory">The roll</h2><p className="mt-1 text-sm leading-6 text-muted">Names, proof, and the shared record.</p></div>
            </li>
            <li className="grid grid-cols-[32px_1fr] gap-4 py-4">
              <span className="font-mono text-xs text-dim">02</span>
              <div><h2 className="font-display text-xl text-ivory">The floor</h2><p className="mt-1 text-sm leading-6 text-muted">Projects move from proposal to proof.</p></div>
            </li>
            <li className="grid grid-cols-[32px_1fr] gap-4 py-4">
              <span className="font-mono text-xs text-dim">03</span>
              <div><h2 className="font-display text-xl text-ivory">The console</h2><p className="mt-1 text-sm leading-6 text-muted">Schools turn daily work into signals.</p></div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}

