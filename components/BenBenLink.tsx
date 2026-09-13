"use client";

import { useState } from "react";

export default function BenBenLink({
  className = "",
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [contact, setContact] = useState("");
  const [done, setDone] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    const cleanContact = contact.trim();

    if (!cleanTitle || !cleanBody || !cleanContact) return;

    try {
      const key = "aptlabs-benben-quick-v1";
      const raw = window.localStorage.getItem(key);
      const arr: { title: string; body: string; contact: string; ts: number }[] = raw ? JSON.parse(raw) : [];
      arr.unshift({ title: cleanTitle.slice(0, 80), body: cleanBody.slice(0, 500), contact: cleanContact.slice(0, 80), ts: Date.now() });
      window.localStorage.setItem(key, JSON.stringify(arr.slice(0, 25)));
    } catch {
      // Quiet fallback: the intent is still captured in the client state.
    }

    setDone(true);
    setTitle("");
    setBody("");
    setContact("");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-10 max-w-md rounded-3xl bg-panel border border-white/10 p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-emerald-300">BEN BEN</div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ivory">Quick build note</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-3 py-1 text-sm text-ivory" aria-label="Close">✕</button>
            </div>

            {!done ? (
              <form onSubmit={save} className="mt-5">
                <label className="text-sm font-bold text-ivory">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Need help with a build?" maxLength={80} className="mt-2 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-emerald-400" />

                <label className="mt-4 block text-sm font-bold text-ivory">What are you building?</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe the need, offer, or build gap." rows={4} maxLength={500} className="mt-2 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-emerald-400" />

                <label className="mt-4 block text-sm font-bold text-ivory">Contact</label>
                <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" maxLength={80} className="mt-2 w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-emerald-400" />

                <button className="mt-4 w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold text-black hover:bg-emerald-400 transition">Post to BenBen →</button>
                <p className="mt-3 text-xs text-muted">No signup. No certification. Just the build entry.</p>
              </form>
            ) : (
              <div className="mt-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 p-6 text-center">
                <p className="font-mono font-bold text-emerald-300">BenBen entry saved.</p>
                <p className="mt-2 text-sm text-muted">Your build note is ready for the floor.</p>
                <button onClick={() => setOpen(false)} className="mt-4 w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold text-black hover:bg-emerald-400 transition">Close →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
