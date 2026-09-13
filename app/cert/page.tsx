import Link from "next/link";

export default function Cert() {
  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-[0.28em] text-muted">SYSTEM NOTE</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold">Certificates are retired.</h1>
        <p className="mt-4 text-base text-muted">
          Skills and capacity live in the ledger and profile, not in a separate certificate flow.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="rounded-full bg-ivory px-6 py-3 text-sm font-bold text-black hover:bg-river hover:text-white transition">Profile →</Link>
          <Link href="/ledger" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-ivory hover:border-river transition">Join the ledger →</Link>
        </div>
      </div>
    </main>
  );
}
