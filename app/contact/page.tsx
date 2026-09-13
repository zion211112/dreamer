import GeoArt from "../../components/GeoArt";

export default function Contact() {
  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="corner" className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 md:py-20">
          <p className="text-xs font-bold tracking-[0.28em] text-river">CONTACTS</p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight text-ivory"># Knock Knock.</h1>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <section className="rounded-[26px] border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-[0.28em] text-muted">SCHOOLS + PARTNERS</div>
              <a href="mailto:aptlabske@gmail.com" className="mt-5 block text-xl font-semibold text-ivory hover:text-emerald-300 transition">aptlabske@gmail.com</a>
              <p className="mt-3 text-sm leading-6 text-muted">Subscriptions and pilots open.</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:aptlabske@gmail.com"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-ivory hover:border-river transition"
                >
                  Email
                </a>
                <a
                  href="https://wa.me/?text=Hello%20APT-LABS"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                >
                  WhatsApp
                </a>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-[0.28em] text-muted">GROUND</div>
              <div className="mt-5 text-2xl font-semibold tracking-tight text-ivory">Kirinyaga, Kenya</div>
              <div className="mt-6 border-t border-white/10 pt-5 text-sm text-muted">
                Built for schools, partners, and practical operators.
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
