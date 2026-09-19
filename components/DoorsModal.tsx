"use client";

import { useState } from "react";

// BUILD CAPACITY: one modal, four doors. Every visitor sees them -
// the app is open, so there is no paywall gate hiding the four doors.
// The old JoinLink paywall trigger (M-Pesa paybill overlay) is gone.
export default function DoorsModal({ onClose }: { onClose: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function open(e: React.MouseEvent) {
    setPicked((d) =>
      d === e.currentTarget.textContent?.trim()
        ? null
        : (e.currentTarget.textContent?.trim() ?? null)
    );
  }

  const pickedDoor = picked;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl bg-panel border border-white/10 p-7 md:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-river">BUILD CAPACITY</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-ivory">Who are you?</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/20 px-3 py-1 text-sm text-ivory" aria-label="Close">✕</button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setPicked("Individual"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "Individual" ? "border-river bg-river/10" : "border-white/10 bg-obsidian hover:border-ivory"
            }`}
          >
            <div className="font-bold text-ivory">Individual →</div>
            <div className="mt-1 text-[13px] text-muted">You have a CV? Nobody believes it. Open the ledger.</div>
          </button>
          <button
            type="button"
            onClick={() => { setPicked("Builder"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "Builder" ? "border-river bg-river/10" : "border-white/10 bg-obsidian hover:border-ivory"
            }`}
          >
            <div className="font-bold text-ivory">Builder →</div>
            <div className="mt-1 text-[13px] text-muted">Skilled? Put a build on the floor — the ledger tracks it.</div>
          </button>
          <button
            type="button"
            onClick={() => { setPicked("School"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "School" ? "border-river bg-river/10" : "border-white/10 bg-obsidian hover:border-ivory"
            }`}
          >
            <div className="font-bold text-ivory">School →</div>
            <div className="mt-1 text-[13px] text-muted">Board your school onto the ledger to accelerate dev.</div>
          </button>
          <button
            type="button"
            onClick={() => { setPicked("Everyone"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "Everyone" ? "border-river bg-river/10" : "border-white/10 bg-obsidian hover:border-ivory"
            }`}
          >
            <div className="font-bold text-ivory">Everyone →</div>
            <div className="mt-1 text-[13px] text-muted">See the floor. Builds, votes, forks. No gate.</div>
          </button>
        </div>
        {pickedDoor && !done && (
          <p className="mt-4 rounded-2xl bg-obsidian border border-white/10 p-5 text-sm text-ivory/85">
            <strong>{pickedDoor}</strong> — this opens on you. No paywall, no verification, no queue.
          </p>
        )}
        {done && (
          <p className="mt-4 rounded-2xl bg-river/15 border border-river/30 p-5 text-sm font-semibold text-emerald-300">
            Door noted. The door is open already — just walk through.
          </p>
        )}
      </div>
    </div>
  );
}
