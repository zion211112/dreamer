"use client";

import Link from "next/link";
import { useState } from "react";
import Certificate from "../../components/Certificate";
import GeoArt from "../../components/GeoArt";
import {
  KEYS,
  Member,
  SEED_MEMBERS,
  loadStored
} from "../../lib/ledger";

// My Profile: nothing but the digital ID.
// Login with your member ID → your downloadable certificate.
// Not certified yet? The door to certification stands open.
export default function Dashboard() {
  const [id, setId] = useState("");
  const [me, setMe] = useState<Member | null>(null);
  const [miss, setMiss] = useState(false);
  const [certNo, setCertNo] = useState("");
  const [dateStr, setDateStr] = useState("");

  function login(e: React.FormEvent) {
    e.preventDefault();
    const key = id.trim().toUpperCase();
    const stored = loadStored<Member>(KEYS.members);
    const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    const m = [...customs, ...SEED_MEMBERS].find((x) => x.id.toUpperCase() === key) || null;
    setMe(m);
    setMiss(!m);
    if (m) {
      try { window.localStorage.setItem(KEYS.myid, m.id); } catch { /* memory */ }
      if (m.certNo) {
        setCertNo(m.certNo);
        try {
          const raw = window.localStorage.getItem("aptlabs-cert-at");
          if (raw) {
            const map = JSON.parse(raw);
            if (map[m.id]) setDateStr(map[m.id]);
          }
        } catch { /* undated */ }
      } else {
        setCertNo("");
        setDateStr("");
      }
    }
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-2xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">MY PROFILE · DIGITAL ID</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Your card on the list.</h1>

          {!me && (
            <form onSubmit={login} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
              <label className="text-sm font-bold">Member ID</label>
              <div className="mt-2 flex gap-2">
                <input value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. AL-0042" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                <button className="rounded-2xl bg-ivory px-6 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Open →</button>
              </div>
              {miss && <p className="mt-3 text-sm text-muted">No record for that ID. <Link href="/ledger#join" className="underline">Get on the list →</Link></p>}
              <p className="mt-3 text-xs text-muted">This login lives in this browser.</p>
            </form>
          )}

          {me && me.paid && (
            <div className="mt-8">
              <Certificate m={me} certNo={certNo || me.certNo || "APT-CERT-2026-0000"} dateStr={dateStr || new Date().toISOString().slice(0, 10)} />
              <button onClick={() => { setMe(null); setId(""); }} className="mt-4 text-sm text-muted underline">Leave this browser →</button>
            </div>
          )}

          {me && !me.paid && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-center">
              <p className="font-display text-2xl">@{me.username} exists — uncertified.</p>
              <Link href="/cert" className="mt-5 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-black hover:bg-ivory transition">
                Get certified →
              </Link>
              <div>
                <button onClick={() => { setMe(null); setId(""); }} className="mt-4 text-sm text-muted underline">Leave this browser →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
