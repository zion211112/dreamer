"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BenBenEntry,
  BenBenTreeNode,
  buildBenBenTree,
  forkBenBenEntry,
  isBenBenLocked,
  loadBenBenEntries,
  voteBenBenEntry
} from "../../lib/benben";

function EntryNode({
  entry,
  depth = 0,
  onVote,
  onFork
}: {
  entry: BenBenTreeNode;
  depth?: number;
  onVote: (id: string, value: 1 | -1) => void;
  onFork: (parentId: string, reason: string, body: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [reason, setReason] = useState("");
  const locked = isBenBenLocked(entry);

  return (
    <article className="rounded-2xl border border-white/10 bg-panel p-4 md:p-5" style={{ marginLeft: depth * 18 }}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
        <span>Entry {entry.id}</span>
        <span>{entry.authorHandle}</span>
      </div>

      {entry.forkReason && (
        <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-200">
          <span className="font-bold">Reason:</span> {entry.forkReason}
        </div>
      )}

      {entry.title && <h3 className="mt-3 font-display text-xl md:text-2xl text-ivory">{entry.title}</h3>}
      {entry.body && <p className="mt-2 text-[15px] leading-relaxed text-muted">{entry.body}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] font-mono text-muted">
        {locked ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
            {entry.score} for, {entry.downCount} against. Closed.
          </span>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-obsidian px-2 py-1">
            <button
              onClick={() => onVote(entry.id, 1)}
              className="px-2 text-lg text-ivory hover:text-emerald-300"
              aria-label={`Upvote ${entry.id}`}
            >
              ▲
            </button>
            <span className="min-w-5 text-center text-ivory">{entry.score}</span>
            <button
              onClick={() => onVote(entry.id, -1)}
              className="px-2 text-lg text-ivory hover:text-rose-300"
              aria-label={`Downvote ${entry.id}`}
            >
              ▼
            </button>
          </div>
        )}
        <button onClick={() => setOpen((v) => !v)} className="hover:text-ivory">Fork</button>
        {entry.forkCount > 0 && <span>{entry.forkCount} fork{entry.forkCount === 1 ? "" : "s"}</span>}
        {entry.commentCount > 0 && <span>{entry.commentCount} repl{entry.commentCount === 1 ? "y" : "ies"}</span>}
      </div>

      {open && (
        <form
          className="mt-4 rounded-2xl border border-white/10 bg-obsidian p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim() || !body.trim()) return;
            onFork(entry.id, reason.trim(), body.trim());
            setOpen(false);
            setBody("");
            setReason("");
          }}
        >
          <label className="block text-xs font-mono uppercase tracking-[0.18em] text-muted">What are you proposing?</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-xl border border-white/10 bg-panel px-3 py-2 text-sm text-ivory outline-none focus:border-emerald-400"
            placeholder="State the fork."
            required
          />
          <label className="mt-3 block text-xs font-mono uppercase tracking-[0.18em] text-muted">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-xl border border-white/10 bg-panel px-3 py-2 text-sm text-ivory outline-none focus:border-emerald-400"
            placeholder="Why this fork exists. Shown next to it, always."
            required
            minLength={10}
          />
          <button className="mt-3 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400">
            Submit fork
          </button>
        </form>
      )}

      {entry.children.length > 0 && (
        <div className="mt-4 space-y-4 border-l border-white/10 pl-3">
          {entry.children.map((child) => (
            <EntryNode key={child.id} entry={child} depth={depth + 1} onVote={onVote} onFork={onFork} />
          ))}
        </div>
      )}
    </article>
  );
}

export default function BenBenPage() {
  const [entries, setEntries] = useState<BenBenEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(loadBenBenEntries());
    setMounted(true);
  }, []);

  const tree = useMemo(() => buildBenBenTree(entries), [entries]);

  const handleVote = (id: string, value: 1 | -1) => {
    setEntries((current) => voteBenBenEntry(current, id, value));
  };

  const handleFork = (parentId: string, reason: string, body: string) => {
    const created = forkBenBenEntry(parentId, "@Guest", body, reason);
    if (!created) return;
    setEntries(loadBenBenEntries());
  };

  if (!mounted) {
    return <main className="mx-auto max-w-4xl px-6 py-20 text-ivory">Loading BenBen…</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-ivory">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">BenBen</p>
        <h1 className="mt-3 font-display text-4xl md:text-6xl text-ivory">The first mound.</h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Every post, fork, and project on this ledger descends from here.
        </p>
      </header>

      <section className="space-y-5">
        {tree.map((entry) => (
          <EntryNode key={entry.id} entry={entry} onVote={handleVote} onFork={handleFork} />
        ))}
      </section>
    </main>
  );
}
