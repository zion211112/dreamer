"use client";

import { useRouter } from "next/navigation";
import { KEYS, Member, SEED_MEMBERS, loadStored } from "../lib/ledger";

// JOIN THE LEDGER: sealed members pass straight to their dashboard.
// Everyone else lands on the verify/payment process. No seal, no entry.
export default function JoinLink({
  className = "",
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function go() {
    try {
      const myid = (window.localStorage.getItem(KEYS.myid) || "").toUpperCase();
      const stored = loadStored<Member>(KEYS.members);
      const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
      const all = [...customs, ...SEED_MEMBERS];
      const me = myid ? all.find((m) => m.id.toUpperCase() === myid) : null;
      if (me && me.paid && me.verified) router.push("/dashboard");
      else router.push("/ledger#join");
    } catch {
      router.push("/ledger#join");
    }
  }

  return (
    <button onClick={go} className={className}>
      {children}
    </button>
  );
}
