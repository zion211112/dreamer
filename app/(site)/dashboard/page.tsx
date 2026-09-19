"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GeoArt from "../../../components/GeoArt";
import {
  KEYS,
  Member,
  SEED_MEMBERS,
  loadStored,
  shortHash
} from "../../../lib/ledger";

const row = "grid grid-cols-[11rem_1fr] items-baseline gap-4 border-b border-ivory/10 py-4";
const k = "font-mono text-[11px] uppercase tracking-[0.2em] text-dim";

// Your standing on the floor. Black page, white text, no verification tiers,
// no paywall, no unlock gate.
export default function Dashboard() {
  const [me, setMe] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const myId = window.localStorage.getItem(KEYS.myid);
    const found = myId
      ? [...customs, ...SEED_MEMBERS].find((x) => x.id.toUpperCase() === myId.toUpperCase()) || null
      : null;
    setMe(found);
    setReady(true);
  }, []);

  if (!ready) {
    return <main className="min-h-[60vh] bg-obsidian text-ivory" />;
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative mx-auto max-w-[720px] overflow-hidden px-6 py-16 md:py-24">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute -top-16 right-[-90px] h-[300px] w-[300px] text-ivory opacity-[0.05]"
        />

        {/* masthead */}
        <div className="flex items-baseline justify-between border-b border-ivory/10 pb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
          <span>My Profile</span>
          {me && <span className="text-dim">{me.occupation}</span>}
        </div>

        {!me ? (
          <>
            <h1 className="mt-12 font-display text-5xl md:text-6xl tracking-tight">
              The floor is ready.
            </h1>
            <p className="mt-5 max-w-[48ch] text-[0.95rem] leading-7 text-muted">
              Claim your slot in the roll and this page becomes your standing — no gate, no
              forms, no redundant flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ledger"
                className="rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-obsidian transition hover:bg-amber"
              >
                Claim your slot →
              </Link>
              <Link
                href="/benben"
                className="rounded-full border border-ivory/15 px-6 py-3 text-sm font-semibold transition hover:border-amber"
              >
                Open BenBen
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-12 font-display text-5xl md:text-6xl tracking-tight">
              @{me.username}
            </h1>
            <p className="mt-3 font-display text-xl italic text-ivory/75">{me.name}</p>

            <div className="mt-10">
              <p className="border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-amber">
                Identity · {me.id}
              </p>
              <div className={row}>
                <span className={k}>Seal</span>
                <span className="font-mono text-sm text-ivory">{shortHash(me.hash)}</span>
              </div>
              <div className={row}>
                <span className={k}>Location</span>
                <span className="text-sm text-ivory">{me.location}</span>
              </div>
              <div className={row}>
                <span className={k}>Role</span>
                <span className="text-sm text-ivory">{me.occupation}</span>
              </div>
              <div className="grid grid-cols-[11rem_1fr] items-baseline gap-4 py-4">
                <span className={k}>Skills</span>
                <span className="flex flex-wrap gap-2">
                  {me.skills.map((s) => (
                    <span
                      key={s}
                      className="border border-ivory/10 bg-panel px-2.5 py-1 font-mono text-[11px] text-ivory"
                    >
                      {s}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/ledger"
                className="rounded-full border border-ivory/15 px-5 py-2.5 text-sm font-semibold transition hover:border-amber"
              >
                The roll
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-ivory/15 px-5 py-2.5 text-sm font-semibold transition hover:border-amber"
              >
                Search
              </Link>
              <Link
                href="/benben"
                className="rounded-full border border-ivory/15 px-5 py-2.5 text-sm font-semibold transition hover:border-amber"
              >
                BenBen
              </Link>
              <button
                onClick={() => {
                  setMe(null);
                  try {
                    window.localStorage.removeItem(KEYS.myid);
                  } catch {
                    /* memory */
                  }
                }}
                className="ml-auto font-mono text-[11px] uppercase tracking-[0.25em] text-dim transition hover:text-ivory"
              >
                Close the floor
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
