import Link from "next/link";

// 5 sections. That's it. Fibonacci-approved minimalism.
// Math budget: one spiral (golden, b≈0.306), one angle (137.5°). Nothing else. You're welcome.

function GoldenSpiral() {
  return (
    <svg className="spiral-bg right-[-80px] top-10 h-[420px] w-[420px]" viewBox="0 0 200 200" fill="none" aria-hidden>
      <path
        d="M100 100 m0 -2 a2 2 0 0 1 2 2 a3.2 3.2 0 0 1 -3.2 3.2 a5.2 5.2 0 0 1 -5.2 -5.2 a8.4 8.4 0 0 1 8.4 -8.4 a13.6 13.6 0 0 1 13.6 13.6 a22 22 0 0 1 -22 22 a35.6 35.6 0 0 1 -35.6 -35.6 a57.6 57.6 0 0 1 57.6 -57.6"
        stroke="#0E7C5B"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="bg-white">
      {/* 1 — HERO / LEDGER */}
      <section className="relative overflow-hidden">
        <GoldenSpiral />
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-14 md:pt-24 md:pb-20 grid md:grid-cols-[1.618fr_1fr] gap-10 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest text-river">
              APT-LABS · KIRINYAGA · NO UNICORNS
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.02]">
              Your learning finally has a receipt.
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed max-w-xl">
              The <strong className="text-ink">Osawi Ledger</strong> records what you learned,
              proved, and built. Not grades. Proof. Like an M-Pesa statement, but for your brain.
              Lose your certificate? We kept the hash.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#donate" className="rounded-full bg-river px-7 py-3.5 text-sm font-semibold text-white hover:bg-ink transition">
                Join the Ledger
              </a>
              <Link href="/papers" className="rounded-full border border-black/15 px-7 py-3.5 text-sm font-semibold hover:border-ink transition">
                Read the papers
              </Link>
            </div>
            <p className="mt-4 text-[13px] text-muted">
              We can&apos;t promise jobs. We can promise receipts. That&apos;s more than most schools give you.
            </p>
          </div>

          {/* M-KOPA style product card */}
          <div className="rounded-3xl border border-black/10 bg-cream p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
            <div className="flex justify-between text-xs text-muted">
              <span>OSAWI LEDGER · ID 0042</span>
              <span className="text-river font-semibold">● VERIFIED</span>
            </div>
            <div className="mt-4 text-2xl font-bold">Wanjiku M.</div>
            <div className="text-sm text-muted">Mwea · 16 · Solar + Maths</div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                ["12", "Skills"],
                ["98%", "Accuracy"],
                ["34h", "Built"]
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white border border-black/5 py-3">
                  <div className="font-bold">{v}</div>
                  <div className="text-[11px] text-muted">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-ink text-white p-4 text-[13px] flex justify-between">
              <span>KES 20 / week · pay by M-Pesa</span>
              <span className="text-white/60">like airtime</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — HOW IT WORKS (3 steps, M-KOPA plain) */}
      <section className="border-t border-black/5 bg-cream/60">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How it works. Even your uncle gets it.</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["1. Learn small", "One question a day on WhatsApp. 5 minutes. No bundles burned, no lectures."],
              ["2. Prove it", "Answer, build, repeat. Ledger hashes it. Nobody can eat your marks — not even us."],
              ["3. Own it", "Skills unlock work, tools, micro-grants. Your brain, your statement, your money."]
            ].map(([t, d]) => (
              <div key={t} className="rounded-3xl bg-white border border-black/10 p-7">
                <div className="font-bold">{t}</div>
                <p className="mt-2 text-sm text-muted leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — MATH WHISPER (one joke, one fact) */}
      <section className="border-t border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16 grid md:grid-cols-[1fr_1.618fr] gap-8 items-center">
          <div className="font-display italic text-5xl text-river">φ</div>
          <div>
            <p className="text-sm tracking-widest font-semibold text-muted">WHY THE SPIRAL UP THERE?</p>
            <p className="mt-2 text-lg leading-relaxed">
              φ = 1.618… Sunflowers pack seeds at 137.5° so none shade each other.
              We pack lessons the same way. Same math, fewer bees.
              Full equations live in our papers — we spared you here.
            </p>
          </div>
        </div>
      </section>

      {/* 4 — PARTNERS */}
      <section id="partners" className="border-t border-black/5 bg-ink text-white">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Partners wanted. Especially skeptics.</h2>
            <p className="mt-4 text-white/65 leading-relaxed">
              Schools, dukas, fundis, NGOs with trust issues — plug your youth into the Ledger.
              You bring learners or work. We bring proof. No MOUs that die in drawers.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/75">
              <li>→ Schools: daily questions + parent reports, KES 3,000/mo</li>
              <li>→ Employers: hire from verified skills, not CV fairy tales</li>
              <li>→ NGOs: fund stipends, see hashes, sleep well</li>
            </ul>
          </div>
          <div id="donate" className="rounded-3xl bg-white text-ink p-8">
            <div className="text-xs font-bold tracking-widest text-river">DONATE · M-PESA</div>
            <div className="mt-2 text-3xl font-extrabold">Till 555 019</div>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              KES 100 = one learner on the Ledger for a month.
              100% goes to Ledger fees + youth stipends. We publish every receipt.
              Obviously. We&apos;re a receipt company.
            </p>
            <a href="mailto:partners@apt-labs.ke?subject=Ledger%20Partnership" className="mt-5 block text-center rounded-full bg-river px-6 py-3.5 text-sm font-semibold text-white hover:bg-ink transition">
              partners@apt-labs.ke →
            </a>
            <p className="mt-3 text-center text-xs text-muted">Ego-free zone. Donors don&apos;t get thrones. Learners do.</p>
          </div>
        </div>
      </section>

      {/* 5 — ENTER */}
      <section className="border-t border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-14 text-center">
          <p className="font-display italic text-2xl md:text-3xl">Feed, power, teach, own — together. The rest is decoration.</p>
          <div className="mt-6 flex justify-center gap-3 text-sm">
            <Link href="/papers" className="rounded-full border border-black/15 px-6 py-3 font-semibold hover:border-ink">Papers →</Link>
            <Link href="/community" className="rounded-full border border-black/15 px-6 py-3 font-semibold hover:border-ink">Community →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
