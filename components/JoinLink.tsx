"use client";

import { useState } from "react";
import { Paywall } from "./PayGate";

// JOIN THE LEDGER: one press pays KES 100 (M-Pesa paybill) and unlocks.
// The old phone-to-name signup is gone; the door is the paybill.
export default function JoinLink({
  className = "",
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <Paywall onClose={() => setOpen(false)} onUnlock={() => setOpen(false)} />}
    </>
  );
}
