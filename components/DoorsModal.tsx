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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-void/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl bg-panel border border-rule/10 p-7 md:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-signal">BUILD CAPACITY</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-ink">Who are you?</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-rule/20 px-3 py-1 text-sm text-ink" aria-label="Close">✕</button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setPicked("Individual"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "Individual" ? "border-signal bg-signal/10" : "border-rule/10 bg-void hover:border-rule"
            }`}
          >
            <div className="font-bold text-ink">Individual →</div>
            <div className="mt-1 text-ui text-dust">You have a CV? Nobody believes it. Open the ledger.</div>
          </button>
          <button
            type="button"
            onClick={() => { setPicked("Builder"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "Builder" ? "border-signal bg-signal/10" : "border-rule/10 bg-void hover:border-rule"
            }`}
          >
            <div className="font-bold text-ink">Builder →</div>
            <div className="mt-1 text-ui text-dust">Skilled? Put a build on the floor — the ledger tracks it.</div>
          </button>
          <button
            type="button"
            onClick={() => { setPicked("School"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "School" ? "border-signal bg-signal/10" : "border-rule/10 bg-void hover:border-rule"
            }`}
          >
            <div className="font-bold text-ink">School →</div>
            <div className="mt-1 text-ui text-dust">Board your school onto the ledger to accelerate dev.</div>
          </button>
          <button
            type="button"
            onClick={() => { setPicked("Everyone"); setDone(false); }}
            className={`rounded-2xl border p-5 text-left transition ${
              picked === "Everyone" ? "border-signal bg-signal/10" : "border-rule/10 bg-void hover:border-rule"
            }`}
          >
            <div className="font-bold text-ink">Everyone →</div>
            <div className="mt-1 text-ui text-dust">See the floor. Builds, votes, forks. No gate.</div>
          </button>
        </div>
        {pickedDoor && !done && (
          <p className="mt-4 rounded-2xl bg-void border border-rule/10 p-5 text-sm text-ink/85">
            <strong>{pickedDoor}</strong> — this opens on you. No paywall, no verification, no queue.
          </p>
        )}
        {done && (
          <p className="mt-4 rounded-2xl bg-signal/15 border border-signal/30 p-5 text-sm font-semibold text-signal">
            Door noted. The door is open already — just walk through.
          </p>
        )}
      </div>
    </div>
  );
}
