"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const UNLOCK_KEY = "apt_pilot_access";
// Free pages — the gate never covers these. The console ("access build
// capacity") lives in its own route group, so it is not wrapped here at all.
const EXEMPT = ["/contact", "/search"];

function isExempt(pathname: string): boolean {
  return EXEMPT.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function setUnlockedFlag() {
  try {
    window.localStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* memory */
  }
}

// The centered paybill card and its overlay. Shared with the "Join the ledger"
// trigger so both show the exact same M-Pesa paybill.
export function Paywall({
  onClose,
  onUnlock
}: {
  onClose?: () => void;
  onUnlock?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-md rounded-3xl bg-panel border border-white/10 p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-gold">ACCESS PILOT</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ivory">KES 100 opens the yard</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 px-3 py-1 text-sm text-ivory"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-muted">Send the amount to the M-Pesa paybill below, then press the button.</p>

        <dl className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-obsidian px-4 py-3">
            <dt className="text-xs uppercase tracking-wider text-muted">Paybill</dt>
            <dd className="font-mono text-lg font-bold text-ivory">247247</dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-obsidian px-4 py-3">
            <dt className="text-xs uppercase tracking-wider text-muted">Account no</dt>
            <dd className="font-mono text-lg font-bold text-ivory">0704260906</dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-obsidian px-4 py-3">
            <dt className="text-xs uppercase tracking-wider text-muted">Amount</dt>
            <dd className="font-mono text-lg font-bold text-gold">KES 100</dd>
          </div>
        </dl>

        <button
          onClick={() => {
            setUnlockedFlag();
            onUnlock?.();
          }}
          className="mt-5 w-full rounded-full bg-gold py-3.5 text-sm font-bold text-black hover:bg-ivory transition"
        >
          ACCESS PILOT
        </button>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>Free:</span>
          <Link href="/contact" className="text-ivory/80 hover:text-gold transition">Contacts</Link>
          <Link href="/search" className="text-ivory/80 hover:text-gold transition">Search</Link>
          <Link href="/console" className="text-ivory/80 hover:text-gold transition">Access build capacity</Link>
        </div>
      </div>
    </div>
  );
}

// Wraps every site page. Locked pages stay inert behind a centered paybill
// overlay until "ACCESS PILOT" is pressed (persisted to localStorage).
export default function PayGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(!!window.localStorage.getItem(UNLOCK_KEY));
    } catch {
      /* memory */
    }
  }, [pathname]);

  if (isExempt(pathname) || unlocked) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="pointer-events-none" aria-hidden>
        {children}
      </div>
      <Paywall onUnlock={() => setUnlocked(true)} />
    </>
  );
}
