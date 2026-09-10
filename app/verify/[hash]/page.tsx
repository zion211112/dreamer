"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Member, SEED_MEMBERS, loadStored, seal, shortHash } from "../../../lib/ledger";
import { KEYS } from "../../../lib/ledger";

// Public record check. Same-browser records verify fully;
// anything else is honest about it: the network ledger is staged.
export default function VerifyHash({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);
  const [found, setFound] = useState<Member | null | undefined>(undefined);

  useEffect(() => {
    const target = (hash || "").toLowerCase();
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const all = [...customs, ...SEED_MEMBERS];
    setFound(all.find((m) => m.hash.toLowerCase() === target) || null);
  }, [hash]);

  if (found === undefined) return <main className="bg-obsidian min-h-screen" />;

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted">APT-LABS · RECORD CHECK</p>
        {found && seal(found) === found.hash ? (
          <div className="mt-6 rounded-3xl border border-gold/40 bg-gold/[0.06] p-8">
            <p className="font-mono text-sm font-bold text-gold">✓ ON THE LIST · INTACT</p>
            <p className="mt-4 font-display text-3xl font-semibold">{found.name}</p>
            <p className="mt-1 font-mono text-gold">@{found.username} · {found.id}</p>
            <p className="mt-2 text-sm text-muted">{found.occupation} · {found.location}</p>
            <p className="mt-4 font-mono text-xs text-muted break-all">hash {found.hash}</p>
            <p className="mt-2 font-mono text-xs text-dim">short {shortHash(found.hash)}</p>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-white/10 bg-panel p-8">
            <p className="font-mono text-sm font-bold text-red-400">✗ NOT FOUND HERE</p>
            <p className="mt-3 text-sm text-muted">
              This browser holds no record with that hash. Network-wide verification
              travels with the server ledger — staged, not faked.
            </p>
            <Link href="/" className="mt-6 inline-block rounded-full bg-ivory px-8 py-3 text-sm font-semibold text-black hover:bg-gold transition">
              Home →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
