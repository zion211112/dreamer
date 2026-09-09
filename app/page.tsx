import Link from "next/link";
import { SEED_MEMBERS, SEED_TASKS, SEED_NEEDS } from "../lib/ledger";

// Landing: 5 sections. One drive: capability on record.
// The ledger is the door. Jobs are one room inside.

export default function Home() {
  const verified = SEED_MEMBERS.filter((m) => m.verified).length;
  const openWork =
    SEED_TASKS.filter((t) => t.status !== "done").length + SEED_NEEDS.length;

  return (
    <main className="bg-white">
      {/* 1 — HERO */}
      <section className="border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-14 md:pt-24 md:pb-20 grid md:grid-cols-[1.618fr_1fr] gap-10 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest text-river">
              APT-LABS · CAPABILITY LEDGER · KIRINYAGA
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.02]">
              Hire verified youth in minutes.
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed max-w-xl">
              One ledger. Every trade, every town, every record sealed.
              Youth verify what they can do. Institutions post what they need.
              Jobs are one piece — the ledger is the door.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/ledger" className="rounded-full bg-river px-7 py-3.5 text-sm font-semibold text-white hover:bg-ink transition">
                Search the ledger
              </Link>
              <Link href="/work#hire" className="rounded-full border border-black/15 px-7 py-3.5 text-sm font-semibold hover:border-ink transition">
                Build capability
              </Link>
            </div>
            <Link href="/ledger#verify" className="mt-4 inline-block text-sm font-semibold text-river hover:text-ink transition">
              Verify your capability →
            </Link>
          </div>
          <div className="rounded-3xl border border-black/10 bg-cream p-6">
            <div className="text-xs font-bold tracking-widest text-muted">LEDGER SNAPSHOT</div>
            <div className="mt-4 space-y-3">
              {[
                [`${SEED_MEMBERS.length} registered`, "trade + town on file"],
                [`${verified} verified`, "hash sealed"],
                [`${openWork} open jobs`, "tasks + institution needs"]
              ].map(([v, l]) => (
                <div key={l} className="flex items-baseline justify-between border-b border-black/5 pb-3">
                  <span className="text-xl font-extrabold">{v}</span>
                  <span className="text-[13px] text-muted">{l}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">Demo figures. Real hashes. Counts grow with registrations.</p>
          </div>
        </div>
      </section>

      {/* 2 — HOW IT WORKS */}
      <section className="border-b border-black/5 bg-cream/60">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Three steps. No speeches.</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["1. Register", "Claim your trade and town. Registration is a work commitment — registered members take tasks."],
              ["2. Verify", "Records are sealed with a hash. Institutions check the ledger, not a CV fairy tale."],
              ["3. Work", "The community votes tasks up. Institutions post needs. Youth do the work, paid via M-Pesa."]
            ].map(([t, d]) => (
              <div key={t} className="rounded-3xl bg-white border border-black/10 p-7">
                <div className="font-bold">{t}</div>
                <p className="mt-2 text-sm text-muted leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — FOR INSTITUTIONS */}
      <section className="border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-bold tracking-widest text-river">FOR INSTITUTIONS — PILOT SCHOOLS FIRST</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
              Capability, matched by trade and town.
            </h2>
            <ul className="mt-6 space-y-3 text-[15px] text-ink/80">
              <li>→ <strong>Revision support</strong> — verified tutors, Saturdays, your syllabus.</li>
              <li>→ <strong>Practical projects</strong> — solar, repairs, gardens, quoted upfront.</li>
              <li>→ <strong>One receipt</strong> — who came, what they did, what you paid. On record.</li>
            </ul>
            <p className="mt-6 text-sm text-muted">Built with institutions, not for them. Academies and hiring partners welcome after the pilots.</p>
          </div>
          <div className="rounded-3xl bg-ink text-white p-8">
            <div className="text-sm text-white/60">Simple terms</div>
            <div className="mt-2 text-2xl font-extrabold">Learners from KES 20/week.</div>
            <div className="mt-1 text-2xl font-extrabold">Institution plans from KES 3,000/mo.</div>
            <p className="mt-3 text-sm text-white/65 leading-relaxed">
              You pay the youth directly via M-Pesa. We keep the receipt — obviously, we&apos;re a ledger.
            </p>
            <Link href="/work#hire" className="mt-5 block text-center rounded-full bg-river px-6 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-ink transition">
              Post your first need →
            </Link>
          </div>
        </div>
      </section>

      {/* 4 — VERIFY */}
      <section className="border-b border-black/5 bg-cream/60">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-16 text-center">
          <p className="font-display italic text-3xl md:text-4xl">Lose your certificate? We kept the hash.</p>
          <p className="mt-3 text-muted">Enter any member ID on the ledger and watch the record prove itself.</p>
          <Link href="/ledger#verify" className="mt-6 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white hover:bg-river transition">
            Verify a certificate →
          </Link>
        </div>
      </section>

      {/* 5 — ENTER */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-14 grid sm:grid-cols-2 gap-4">
          <Link href="/ledger" className="rounded-3xl border border-black/10 p-8 hover:border-river transition">
            <div className="text-xs font-bold tracking-widest text-river">YOUTH</div>
            <div className="mt-2 text-xl font-bold">Verify your capability →</div>
            <p className="mt-1 text-sm text-muted">List your trade and town. Take tasks. Get work.</p>
          </Link>
          <Link href="/work" className="rounded-3xl border border-black/10 p-8 hover:border-river transition">
            <div className="text-xs font-bold tracking-widest text-river">INSTITUTIONS + COMMUNITY</div>
            <div className="mt-2 text-xl font-bold">Build capability →</div>
            <p className="mt-1 text-sm text-muted">Vote tasks. Post needs. Hire in minutes.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
