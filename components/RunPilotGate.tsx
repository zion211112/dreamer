"use client";

import { useEffect, useState } from "react";

// The pilot-team lock. The console and the ledger sit behind this name gate:
// no route or path reaches them without entering the access name "RUNPILOT".
// A successful entry persists to localStorage so the session stays open on
// this device (local-first, like the rest of the app).
const KEY = "runpilot_access";
const ACCESS_NAME = "RUNPILOT";

function isUnlocked(): boolean {
  try {
    return !!window.localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export default function RunPilotGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUnlocked(isUnlocked());
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const given = name.trim().toUpperCase();
    if (given === ACCESS_NAME) {
      try {
        window.localStorage.setItem(KEY, "1");
      } catch {
        /* memory */
      }
      setUnlocked(true);
      setError("");
    } else {
      setError(given === "" ? "Enter the access name." : "Not the right name. Access denied.");
    }
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4">
      <div className="mx-auto w-full max-w-sm rounded-3xl bg-obsidian border border-white/10 p-7">
        <div className="text-xs font-bold tracking-widest text-gold">RESTRICTED</div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ivory">Enter access name</h2>
        <p className="mt-3 text-sm text-muted">
          This section is reserved for the pilot team. Only the access name gets in.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            autoFocus
            placeholder="Access name"
            className="w-full rounded-2xl border border-white/15 bg-panel px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
          />
          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-gold py-3.5 text-sm font-bold text-black hover:bg-ivory transition"
          >
            ENTER
          </button>
        </form>
      </div>
    </div>
  );
}
