import GeoArt from "../../components/GeoArt";

// Public. Visitors get the porch (/) and this page. Nothing else.
export default function Contact() {
  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="corner" className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-2xl px-6 py-16">
          <p className="text-xs font-bold tracking-widest text-river">CONTACTS</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Knock loudly.</h1>
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-widest text-muted">SCHOOLS + PARTNERS</div>
              <a href="mailto:partners@apt-labs.ke" className="mt-2 block text-xl font-bold hover:text-emerald-300 transition">partners@apt-labs.ke</a>
              <p className="mt-1 text-sm text-muted">Subscriptions, pilots, impossible questions welcome.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-widest text-muted">PAYMENTS</div>
              <div className="mt-2 text-xl font-bold font-mono">Till 555 019</div>
              <p className="mt-1 text-sm text-muted">Test fees, teacher subscriptions, school plans. Keep your SMS.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-panel p-7">
              <div className="text-xs font-bold tracking-widest text-muted">GROUND</div>
              <div className="mt-2 text-xl font-bold">Kirinyaga, Kenya</div>
              <p className="mt-1 text-sm text-muted">Everything else is behind the gate. That&apos;s intentional.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
