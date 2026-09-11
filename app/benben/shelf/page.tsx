"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Build, DOMAINS, SEED_BUILDS, TYPES, loadBuilds } from "../../../lib/benben";
import { PAPERS } from "../../../lib/research";
import { HallClaim, loadClaims } from "../../../lib/zeptepi";

// The Cold Shelf: nothing is deleted, nothing is browsed.
// You come with a question, you find the answer, you leave.
export default function Shelf() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [archived, setArchived] = useState<HallClaim[]>([]);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");
  const [type, setType] = useState("All");
  const [forks, setForks] = useState(false);

  useEffect(() => {
    const stored = loadBuilds().filter(
      (b) => b && typeof b.id === "string" && b.needs && typeof b.domain === "string" && Array.isArray(b.comments)
    );
    const ids = new Set(stored.map((b) => b.id));
    setBuilds([...stored, ...SEED_BUILDS.filter((s) => !ids.has(s.id))]);
    setArchived(loadClaims().filter((c) => c.status === "archived"));
  }, []);

  const now = Date.now();
  const results = builds.filter((b) => {
    if ((b.visibility || "public") !== "public") return false;
    const cold = now - b.createdTs >= (b.tierAtPost === "visitor" ? 72 : 168) * 3600000;
    if (!cold) return false;
    if (domain !== "All" && b.domain !== domain) return false;
    if (type !== "All" && b.type !== type) return false;
    if (forks && b.comments.filter((c) => c.fork).length === 0) return false;
    if (q.trim()) {
      const hay = (b.title + " " + b.body + " " + b.done).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Link href="/benben" className="font-mono text-sm text-muted hover:text-ivory">← the floor</Link>
        <h1 className="mt-3 font-display text-4xl font-semibold">The Cold Shelf.</h1>
        <p className="mt-2 text-muted">Everything ever posted, searchable. Not ranked, not browsed. Ask and leave.</p>

        <div className="mt-6 space-y-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the archive…" className="w-full rounded-2xl border border-white/15 bg-panel px-4 py-3 text-sm text-ivory outline-none focus:border-teal-300" />
          <div className="flex flex-wrap gap-2">
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded-2xl border border-white/15 bg-panel px-4 py-2.5 text-sm text-ivory outline-none focus:border-teal-300 [&>option]:bg-obsidian">
              <option>All</option>
              {DOMAINS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl border border-white/15 bg-panel px-4 py-2.5 text-sm text-ivory outline-none focus:border-teal-300 [&>option]:bg-obsidian">
              <option>All</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button onClick={() => setForks(!forks)} className={`rounded-2xl border px-4 py-2.5 font-mono text-xs transition ${forks ? "border-teal-300 text-teal-300" : "border-white/15 text-muted"}`}>
              has-forks {forks ? "✓" : ""}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-1">
          {results.map((b) => (
            <Link key={b.id} href={`/benben/post/${b.id}`} className="block rounded-xl px-3 py-2.5 hover:bg-panel transition">
              <span className="font-mono text-xs text-dim">[{b.domain}] [{b.type}]</span>{" "}
              <span className="text-[15px] text-ivory/90">{b.title}</span>
            </Link>
          ))}
          {results.length === 0 && <p className="py-8 text-center font-mono text-sm text-dim">Nothing cold matches. The floor is still warm — <Link href="/benben" className="underline">go look</Link>.</p>}
        </div>

        {archived.filter((c) => !q.trim() || (c.title + " " + c.body).toLowerCase().includes(q.toLowerCase())).length > 0 && (
          <div className="mt-8">
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-dim">Completed crew claims · from Hall 7</h2>
            <div className="mt-3 space-y-1">
              {archived
                .filter((c) => !q.trim() || (c.title + " " + c.body).toLowerCase().includes(q.toLowerCase()))
                .map((c) => (
                  <div key={c.id} className="rounded-xl px-3 py-2.5">
                    <span className="font-mono text-xs text-dim">[HALL-7] </span>
                    <span className="text-[15px] text-ivory/90">{c.title}</span>
                    <span className="font-mono text-xs text-dim"> · crew {c.crew.join(", ")}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="font-display text-2xl font-semibold">Research shelf.</h2>
          <p className="mt-1 text-sm text-muted">Short papers, readable by a Form 2 student and a professor.</p>
          <div className="mt-4 space-y-3">
            {PAPERS.filter((p) => {
              if (!q.trim()) return true;
              return (p.title + " " + p.abstract).toLowerCase().includes(q.toLowerCase());
            }).map((p) => (
              <article key={p.id} className="rounded-2xl border border-white/10 bg-panel p-5">
                <div className="font-mono text-xs text-dim">{p.id} · {p.meta}</div>
                <h3 className="mt-1 font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{p.abstract}</p>
                <a href="mailto:partners@apt-labs.ke?subject=Paper%20request" className="mt-3 inline-block font-mono text-xs text-teal-300 hover:underline">
                  Request full text →
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
