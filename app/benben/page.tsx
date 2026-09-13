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
      className="border-b border-[#C7BBA0] py-6"
      style={{ marginLeft: depth * 22 }}
    >
      <div className="flex flex-wrap items-center gap-3 text-[0.8rem] text-[#6B6252]" style={{ fontVariantNumeric: "tabular-nums" }}>
        <span>Entry {entry.id.slice(0, 6)}</span>
        {depth > 0 && <span>forked</span>}
        {entry.authorHandle && <span className="text-[#204734] font-medium">{entry.authorHandle}</span> }
      </div>

      {entry.forkReason && (
        <div className="mt-3 max-w-[50ch] border-l-[3px] border-[#8B5E24] pl-[15px] text-[0.9rem] text-[#6B6252]">
          <strong className="font-semibold text-[#211C15]">Reason:</strong> {entry.forkReason}
        </div>
      )}

      {entry.title && (
        <h3 className="mt-3 text-[1.1rem] font-semibold text-[#211C15]">{entry.title}</h3>
      )}

      {entry.body && (
        <p className="mt-1 max-w-[58ch] text-[0.97rem] leading-6 text-[#211C15]">
          {entry.body}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-[18px] text-[0.84rem] text-[#6B6252]">
        {locked ? (
          <span className="font-semibold text-[#211C15]">
            <b className="font-semibold">{entry.score} for, {entry.downCount} against.</b> Passed.
          </span>
        ) : (
          <div className="flex items-center gap-[5px]">
            <button
              onClick={() => onVote(entry.id, 1)}
              className="border-none bg-transparent p-1 text-[0.7rem] text-[#6B6252] hover:text-[#204734]"
              aria-label={`Upvote ${entry.id}`}
            >
              ▲
            </button>
            <span className="min-w-[1.3em] text-center font-semibold text-[#211C15]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {entry.score}
            </span>
            <button
              onClick={() => onVote(entry.id, -1)}
              className="border-none bg-transparent p-1 text-[0.7rem] text-[#6B6252] hover:text-[#8B5E24]"
              aria-label={`Downvote ${entry.id}`}
            >
              ▼
            </button>
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="border-b border-transparent text-[#211C15] hover:border-[#211C15]"
        >
          Fork
        </button>

        {entry.forkCount > 0 && <span>{entry.forkCount} fork{entry.forkCount === 1 ? "" : "s"}</span>}
        {entry.commentCount > 0 && <span>{entry.commentCount} repl{entry.commentCount === 1 ? "y" : "ies"}</span>}
      </div>

      {open && (
        <form
          className="mt-5 border-t border-[#C7BBA0] pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim() || !body.trim()) return;
            onFork(entry.id, reason.trim(), body.trim());
            setOpen(false);
            setBody("");
            setReason("");
          }}
        >
          <label className="mb-2 block text-[0.84rem] text-[#6B6252]">What you're proposing</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="w-full resize-y rounded-[3px] border border-[#C7BBA0] bg-transparent px-3 py-2 text-[0.95rem] text-[#211C15] outline-none focus:border-[#204734]"
            placeholder="State the fork."
            required
          />

          <label className="mb-2 mt-4 block text-[0.84rem] text-[#6B6252]">Reason <span className="text-[#8B5E24] font-semibold">— required</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full resize-y rounded-[3px] border border-[#C7BBA0] bg-transparent px-3 py-2 text-[0.95rem] text-[#211C15] outline-none focus:border-[#204734]"
            placeholder="Why this fork exists. Shown next to it, always."
            required
            minLength={10}
          />

          <button
            type="submit"
            className="mt-4 inline-flex items-center rounded-[3px] bg-[#204734] px-5 py-3 text-[0.92rem] font-medium text-[#EDE6D6] transition hover:bg-[#16332A]"
          >
            Submit fork
          </button>
        </form>
      )}

      {entry.children.length > 0 && (
        <div className="mt-5 border-l border-[#C7BBA0] pl-4 md:pl-6">
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
      <main className="bg-[#EDE6D6] text-[#211C15]">
        <div className="mx-auto max-w-[860px] px-6 py-20 text-center text-sm uppercase tracking-[0.2em] text-[#6B6252]">
          Loading BenBen…
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#EDE6D6] text-[#211C15]" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-[860px] px-6">
        <section className="pb-10 pt-[76px]">
          <h1 className="m-0 text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] tracking-[-0.01em]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Benben
          </h1>
          <p className="mt-5 max-w-[46ch] text-[1.15rem] text-[#6B6252]">
            The first mound. Every post, fork, and project on this ledger descends from here.
          </p>
        </section>

        <section className="pb-8">
          <div className="border-t border-[#C7BBA0]">
            {tree.map((entry) => (
              <EntryNode key={entry.id} entry={entry} onVote={handleVote} onFork={handleFork} />
            ))}
          </div>
        </section>

        <section className="border-t border-[#C7BBA0] py-8">
          <h2 className="mb-5 text-[1.25rem] font-medium text-[#211C15]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Fork this entry
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = tree[0];
              if (!target) return;
              const form = e.currentTarget;
              const body = (form.elements.namedItem("fork-body") as HTMLTextAreaElement | null)?.value ?? "";
              const reason = (form.elements.namedItem("fork-reason") as HTMLTextAreaElement | null)?.value ?? "";
              if (!body.trim() || !reason.trim()) return;
              handleFork(target.id, reason.trim(), body.trim());
              form.reset();
            }}
          >
            <label className="mb-2 block text-[0.84rem] text-[#6B6252]">What you're proposing</label>
            <textarea
              name="fork-body"
              rows={2}
              className="w-full resize-y rounded-[3px] border border-[#C7BBA0] bg-transparent px-3 py-2 text-[0.95rem] text-[#211C15] outline-none focus:border-[#204734]"
              placeholder="State the fork."
            />

            <label className="mb-2 mt-4 block text-[0.84rem] text-[#6B6252]">Reason <span className="font-semibold text-[#8B5E24]">— required</span></label>
            <textarea
              name="fork-reason"
              rows={2}
              className="w-full resize-y rounded-[3px] border border-[#C7BBA0] bg-transparent px-3 py-2 text-[0.95rem] text-[#211C15] outline-none focus:border-[#204734]"
              placeholder="Why this fork exists. Shown next to it, always."
            />

            <button type="submit" className="mt-4 inline-flex items-center rounded-[3px] bg-[#204734] px-5 py-3 text-[0.92rem] font-medium text-[#EDE6D6] transition hover:bg-[#16332A]">
              Submit fork
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
