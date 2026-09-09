"use client";

import { useEffect, useRef, useState } from "react";
import { Member } from "../lib/ledger";
import { sha256 } from "../lib/hash";
import { SOURCE_TEXT } from "../lib/source";

const VOID_KEY = "aptlabs-void-v1";

// The Priest's chamber. Trigger: type `root` in the ledger search.
// Esc or 60s of silence leaves. The Void keeps hashes, never words.
export default function RootAccess({
  members,
  onClose
}: {
  members: Member[];
  onClose: () => void;
}) {
  const [voidInput, setVoidInput] = useState("");
  const [logged, setLogged] = useState(false);
  const timer = useRef<number | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const leave = () => closeRef.current();
    const arm = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(leave, 60000);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
      else arm();
    };
    arm();
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", arm);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", arm);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function dropIntoVoid(e: React.FormEvent) {
    e.preventDefault();
    const v = voidInput.trim();
    if (!v || logged) return;
    try {
      const raw = window.localStorage.getItem(VOID_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      arr.push(sha256(v));
      window.localStorage.setItem(VOID_KEY, JSON.stringify(arr.slice(-500)));
    } catch {
      // the void accepts anyway
    }
    setVoidInput("");
    setLogged(true);
    window.setTimeout(() => closeRef.current(), 4000);
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black font-mono text-green-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-widest">OSAWI: ROOT ACCESS</h1>
          <span className="text-xs text-green-100/40">[esc to leave]</span>
        </div>
        <div className="mt-2 h-px bg-green-100/20" />

        <section className="mt-10">
          <div className="text-xs tracking-widest text-green-100/50">01 / THE SOURCE</div>
          <pre className="mt-3 max-h-[50vh] overflow-y-auto whitespace-pre-wrap border border-green-100/15 bg-green-100/[0.03] p-5 text-xs leading-relaxed">
            {SOURCE_TEXT}
          </pre>
        </section>

        <section className="mt-10">
          <div className="text-xs tracking-widest text-green-100/50">
            02 / THE RAW LEDGER — {members.length} SEALED RECORDS · STREAMING LIVE
          </div>
          <div className="mt-3 space-y-1 border border-green-100/15 bg-green-100/[0.03] p-5 text-xs">
            {members.map((m) => (
              <div key={m.id} className="break-all">
                <span className="text-green-100/60">{m.id}</span> {m.hash}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="text-xs tracking-widest text-green-100/50">03 / THE VOID</div>
          <div className="mt-3 border border-green-100/15 bg-green-100/[0.03] p-5">
            {!logged ? (
              <form onSubmit={dropIntoVoid} className="flex items-center gap-2">
                <span className="text-green-100/70">&gt;_</span>
                <input
                  value={voidInput}
                  onChange={(e) => setVoidInput(e.target.value)}
                  autoFocus
                  maxLength={280}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-green-100/25"
                />
              </form>
            ) : (
              <p className="text-sm">Your silence has been logged. Now build.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
