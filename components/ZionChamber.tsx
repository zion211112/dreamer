"use client";

import { useEffect, useRef } from "react";
import { Member } from "../lib/ledger";
import { SOURCE_TEXT } from "../lib/source";

// The chamber behind `root`. Source + raw ledger.
// Teal terminal on obsidian — reads the source, does not keep it.
// Esc or 60 s of silence leaves.
export default function ZionChamber({
  members,
  onClose
}: {
  members: Member[];
  onClose?: () => void;
}) {
  const timer = useRef<number | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!closeRef.current) return;
    const leave = () => closeRef.current && closeRef.current();
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

  const inner = (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-widest">OSAWI: ROOT ACCESS</h1>
        {onClose && <span className="text-xs text-signal/40">[esc to leave]</span>}
      </div>
      <div className="mt-2 h-px bg-signal/10" />

      <section className="mt-10">
        <div className="text-xs tracking-widest text-signal/50">01 / THE SOURCE</div>
        <pre className="mt-3 max-h-[50vh] overflow-y-auto whitespace-pre-wrap border border-signal/15 bg-signal/[0.03] p-5 text-xs leading-relaxed">
          {SOURCE_TEXT}
        </pre>
      </section>

      <section className="mt-10">
        <div className="text-xs tracking-widest text-signal/50">
          02 / THE RAW LEDGER — {members.length} SEALED RECORDS · STREAMING LIVE
        </div>
        <div className="mt-3 space-y-1 border border-signal/15 bg-signal/[0.03] p-5 text-xs">
          {members.map((m) => (
            <div key={m.id} className="break-all">
              <span className="text-signal/60">{m.id}</span> {m.hash}
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  if (!onClose) return <main className="bg-void font-mono text-signal min-h-screen">{inner}</main>;
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-void font-mono text-signal">
      {inner}
    </div>
  );
}
