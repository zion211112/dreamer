"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  KEYS,
  Member,
  SEED_MEMBERS,
  loadStored,
  shortHash
} from "../../../lib/ledger";

const row = "grid gap-2 border-b border-ivory/10 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-4";
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
    return (
      <main className="min-h-[60vh] bg-void px-6 py-16 text-ink" aria-busy="true">
        <div className="mx-auto max-w-[720px] border-t border-rule pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
          Reading your record…
        </div>
      </main>
    );
  }

  return (
    <main className="site-page bg-void text-ink">
      <div className="site-frame relative max-w-[720px] overflow-hidden py-12 md:py-24">
        {/* masthead */}
        <div className="site-section-head">
          <span>My Profile</span>
          {me && <span className="text-dim">{me.occupation}</span>}
        </div>

        {!me ? (
          <>
            <h1 className="mt-10 max-w-[12ch] font-serif text-5xl leading-[1.04] tracking-tight sm:text-6xl">
              The floor is ready.
            </h1>
            <p className="mt-5 max-w-[48ch] text-[0.95rem] leading-7 text-muted">
              Claim your slot in the roll and this page becomes your standing — no gate, no
              forms, no redundant flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ledger"
                className="site-action"
              >
                Claim your slot →
              </Link>
              <Link
                href="/benben"
                className="site-action-secondary"
              >
                Open BenBen
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-10 max-w-[12ch] font-serif text-5xl leading-[1.04] tracking-tight sm:text-6xl">
              @{me.username}
            </h1>
            <p className="mt-3 font-display text-xl italic text-ivory/75">{me.name}</p>

            <div className="mt-10">
              <p className="border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
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
              <div className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-4">
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
                className="site-action-secondary"
              >
                The roll
              </Link>
              <Link
                href="/search"
                className="site-action-secondary"
              >
                Search
              </Link>
              <Link
                href="/benben"
                className="site-action-secondary"
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
                className="ml-auto min-h-11 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ash transition hover:text-ink"
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
