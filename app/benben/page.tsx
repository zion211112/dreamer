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
    <article
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1117]/85 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur-sm md:p-5"
      style={{ marginLeft: depth * 18 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">
            {entry.id.slice(0, 6)}
          </span>
          <span className="text-slate-400">Thread</span>
        </div>
        <span className="text-slate-400">{entry.authorHandle}</span>
      </div>

      {entry.forkReason && (
        <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          <span className="font-semibold">Reason:</span> {entry.forkReason}
        </div>
      )}

      {entry.title && (
        <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-white md:text-[2rem]">
          {entry.title}
        </h3>
      )}

      {entry.body && (
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-300 md:text-base">
          {entry.body}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-[12px] font-mono text-slate-300">
        {locked ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
            {entry.score} for · {entry.downCount} against · closed
          </span>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#070b10] px-2 py-1.5">
            <button
              onClick={() => onVote(entry.id, 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-base text-slate-200 transition hover:bg-emerald-500/10 hover:text-emerald-300"
              aria-label={`Upvote ${entry.id}`}
            >
              ▲
            </button>
            <span className="min-w-5 text-center text-lg font-semibold text-white">{entry.score}</span>
            <button
              onClick={() => onVote(entry.id, -1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-base text-slate-200 transition hover:bg-rose-500/10 hover:text-rose-300"
              aria-label={`Downvote ${entry.id}`}
            >
              ▼
            </button>
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 transition hover:border-emerald-400/40 hover:text-white"
        >
          Fork
        </button>

        {entry.forkCount > 0 && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-300">
            {entry.forkCount} fork{entry.forkCount === 1 ? "" : "s"}
          </span>
        )}

        {entry.commentCount > 0 && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-300">
            {entry.commentCount} repl{entry.commentCount === 1 ? "y" : "ies"}
          </span>
        )}
      </div>

      {open && (
        <form
          className="mt-5 rounded-[22px] border border-white/10 bg-[#070b10] p-3.5 md:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim() || !body.trim()) return;
            onFork(entry.id, reason.trim(), body.trim());
            setOpen(false);
            setBody("");
            setReason("");
          }}
        >
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
            What are you proposing?
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400/60"
            placeholder="State the fork."
            required
          />
          <label className="mt-3 block text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400/60"
            placeholder="Why this fork exists. Shown beside it, always."
            required
            minLength={10}
          />
          <button className="mt-3 inline-flex rounded-full bg-gradient-to-r from-emerald-400 to-violet-400 px-4 py-2 text-sm font-bold text-[#0b1115] transition hover:brightness-110">
            Submit fork
          </button>
        </form>
      )}

      {entry.children.length > 0 && (
        <div className="mt-5 space-y-4 border-l border-white/10 pl-3 md:pl-4">
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
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-slate-200">
        <div className="rounded-[28px] border border-white/10 bg-[#0d1117]/80 p-8 text-center text-sm uppercase tracking-[0.25em] text-slate-400">
          Loading BenBen…
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-[#08090d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(167,139,250,0.14),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-white/10 bg-[#0d1117]/75 p-5 shadow-[0_12px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-emerald-300">BenBen</p>
              <h1 className="mt-3 font-display text-4xl leading-none tracking-[-0.06em] text-white md:text-6xl">
                The first mound.
              </h1>
            </div>

            <div className="grid w-full max-w-md grid-cols-3 gap-3 text-left">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Entries</div>
                <div className="mt-2 text-2xl font-semibold text-white">{entries.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Forks</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {entries.reduce((sum, item) => sum + item.forkCount, 0)}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Signal</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-300">
                  {entries.reduce((sum, item) => sum + item.score, 0)}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
            Every post, fork, and project on this ledger descends from here.
            A living stack of proposals, edits, and decisions — simple enough to read, strong enough to steer.
          </p>
        </header>

        <section className="mt-8 space-y-5">
          {tree.map((entry) => (
            <EntryNode key={entry.id} entry={entry} onVote={handleVote} onFork={handleFork} />
          ))}
        </section>
      </div>
    </main>
  );
}
