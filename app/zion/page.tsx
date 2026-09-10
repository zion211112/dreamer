"use client";

import { useEffect, useState } from "react";
import ZionChamber from "../../components/ZionChamber";
import { KEYS, Member, SEED_MEMBERS, loadStored } from "../../lib/ledger";

// /zion — unmarked. Not in nav. Reached by those who know.
export default function Zion() {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    if (stored.length > 0) {
      const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
      setMembers([...customs, ...SEED_MEMBERS]);
    }
  }, []);

  return <ZionChamber members={members} />;
}
