import Link from "next/link";

export const metadata = { title: "Papers — APT-LABS" };

const papers = [
  {
    id: "01",
    title: "Receipts > Reports: a ledger model for rural learning",
    meta: "APT-LABS · 2026 · 8 pages · field data, Kirinyaga",
    abstract:
      "Grades evaporate. Hashes don't. We tracked 50 learners with daily WhatsApp questions + SHA-256 receipts. Result: parents believed the PDF more than the report card. Science? Small. Practical? Very.",
    joke: "Peer review by 3 grandmothers. All approved."
  },
  {
    id: "02",
    title: "137.5° classrooms: what sunflowers know about attention",
    meta: "APT-LABS · 2026 · 6 pages · geometry + teaching",
    abstract:
      "Phyllotaxis packs seeds with zero waste (θ = 137.508°, r = c√n). We applied it to lesson pacing and seating. Same math, fewer bees. Early signal: +22% recall on spaced 5-min drills.",
    joke: "No fractals were harmed. One spiral used, sparingly."
  },
  {
    id: "03",
    title: "Goats vs unicorns: a practical economy for youth co-ops",
    meta: "APT-LABS · 2026 · 10 pages · cooperatives + M-Pesa",
    abstract:
      "Unicorns need venture capital. Goats need grass. We model co-op profit-share (20/60/20) on real KES 50,000 revenue: who earned, who learned, who maintains the tools. Boring spreadsheets, exciting goats.",
    joke: "Ego detached. Authors listed alphabetically. Goat first."
  }
];

export default function Papers() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-xs font-bold tracking-widest text-river">RESEARCH · NO PAYWALL · NO POMPOSITY</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Papers.</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Short, scientific, readable by a Form 2 student and a professor.
          PDFs drop monthly. Today: read the abstracts, steal the ideas, tell us we&apos;re wrong.
        </p>
        <div className="mt-10 space-y-4">
          {papers.map((p) => (
            <article key={p.id} className="rounded-3xl border border-black/10 bg-cream p-7 md:p-8">
              <div className="text-xs text-muted">{p.id} · {p.meta}</div>
              <h2 className="mt-2 text-xl md:text-2xl font-bold tracking-tight">{p.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{p.abstract}</p>
              <p className="mt-3 text-sm italic text-muted">{p.joke}</p>
              <div className="mt-5 flex gap-3">
                <a href="mailto:partners@apt-labs.ke?subject=Paper%20request%20—%20" className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-river transition">
                  Request PDF
                </a>
                <Link href="/community" className="rounded-full border border-black/15 px-5 py-2.5 text-[13px] font-semibold hover:border-ink transition">
                  Argue about it →
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted">
          Full manifesto lives in <span className="font-mono">MANIFESTO.md</span>. Full build list in <span className="font-mono">PROJECT.md</span>. No gatekeeping.
        </p>
      </div>
    </main>
  );
}
