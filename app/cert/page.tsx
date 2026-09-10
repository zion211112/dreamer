"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Certificate from "../../components/Certificate";
import GeoArt from "../../components/GeoArt";
import {
  CERT_FEE,
  KEYS,
  Member,
  SEED_MEMBERS,
  TILL,
  isMpesaCode,
  loadStored,
  saveStored
} from "../../lib/ledger";
import { allMembers, memberByUsername, myUsername } from "../../lib/benben";

// Certification: KES 50, no test. Pay → your name sealed → download.
// The certificate is a receipt of existence, not a crown.
export default function Cert() {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [me, setMe] = useState<Member | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [certNo, setCertNo] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const all = allMembers();
    setMembers(all);
    const u = myUsername();
    if (u) {
      const m = memberByUsername(all, u);
      if (m) {
        setMe(m);
        if (m.certNo) {
          setCertNo(m.certNo);
          try {
            const raw = window.localStorage.getItem("aptlabs-cert-at");
            if (raw) {
              const map = JSON.parse(raw);
              if (map[m.id]) setDateStr(map[m.id]);
            }
          } catch { /* undated */ }
        }
      }
    }
  }, []);

  function persist(v: Member[]) {
    setMembers(v);
    saveStored(KEYS.members, v);
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    if (!isMpesaCode(code)) { setMsg("Code should be 10 letters/numbers, like your M-Pesa SMS shows."); return; }
    const no = `APT-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString().slice(0, 10);
    persist(members.map((m) => (m.id === me.id ? { ...m, paid: true, verified: true, certNo: no } : m)));
    try {
      const raw = window.localStorage.getItem("aptlabs-cert-at");
      const map = raw ? JSON.parse(raw) : {};
      map[me.id] = date;
      window.localStorage.setItem("aptlabs-cert-at", JSON.stringify(map));
    } catch { /* undated */ }
    setMe({ ...me, paid: true, verified: true, certNo: no });
    setCertNo(no);
    setDateStr(date);
    setMsg("");
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-2xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-gold">CERTIFICATION · {CERT_FEE} · NO TEST</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Proof you exist on the list.</h1>
          <p className="mt-4 text-muted leading-relaxed">
            Fifty bob seals your name, trade and town into a certificate you can download, print, and pin to a shop wall.
            No examination. No ranking. Carried, not crowned.
          </p>

          {!me && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-7 text-center">
              <p className="text-muted">No member found on this browser for your username.</p>
              <Link href="/ledger#join" className="mt-4 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-black hover:bg-ivory transition">Claim a slot first →</Link>
            </div>
          )}

          {me && !me.paid && (
            <form onSubmit={pay} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
              <p className="text-sm">Certifying <strong className="font-mono text-gold">@{me.username}</strong> ({me.id}). Send {CERT_FEE} to Till {TILL}:</p>
              <div className="mt-3 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="M-Pesa code (10 characters)" maxLength={10} className={`${field} flex-1 font-mono uppercase`} />
                <button className="rounded-2xl bg-gold px-6 text-sm font-bold text-black hover:bg-ivory transition">Seal →</button>
              </div>
              {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}
              <p className="mt-3 text-xs text-muted">Demo check: format only. Live confirmation arrives with Daraja.</p>
            </form>
          )}

          {me && me.paid && (
            <div className="mt-8">
              <Certificate m={me} certNo={certNo || me.certNo || "APT-CERT-2026-0000"} dateStr={dateStr || new Date().toISOString().slice(0, 10)} />
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link href="/benben" className="rounded-full border border-white/20 px-6 py-2.5 font-semibold hover:border-gold transition">Back to the floor →</Link>
                <Link href="/crucible" className="rounded-full border border-white/20 px-6 py-2.5 font-semibold hover:border-gold transition">Eyeing a hall? 100 bob exam →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
