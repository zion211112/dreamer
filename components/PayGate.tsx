"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const UNLOCK_KEY = "apt_pilot_access";
// The threshold is the only free address. Every other public page — home,
// search, benben, my profile, the ledger — is paywalled: an unpaid visitor
// sees the KES-100 paybill and NO page content at all, because the gate does
// not even render the children. /contact stays open on purpose: it is the door
// a school knocks on before it pays. The console lives in its own (console)
// route-group and is locked separately by RunPilotGate.
const EXEMPT = ["/contact"];
// Where a locked visitor can still go: back to the sigil.
const ESCAPE_HREF = "/contact";

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
// trigger so both show the exact same M-Pesa paybill. `escape` adds the one
// door that is still open to a locked visitor: the contact threshold.
export function Paywall({
  onClose,
  onUnlock,
  escape
}: {
  onClose?: () => void;
  onUnlock?: () => void;
  escape?: boolean;
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

        {escape && (
          <p className="mt-5 text-center text-xs text-muted">
            Not yet?{" "}
            <Link href={ESCAPE_HREF} className="text-gold hover:text-ivory transition">
              Knock Knock →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

// Wraps every site page. A locked page renders the paybill and nothing else —
// no content leaks behind the overlay. "ACCESS PILOT" opens the yard
// (persisted to localStorage, local-first like the rest of the app).
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

  return <Paywall onUnlock={() => setUnlocked(true)} escape />;
}
