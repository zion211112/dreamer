"use client";

import { useState } from "react";

type SearchState = "idle" | "empty" | "submitted";

export default function Search() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(query.trim() ? "submitted" : "empty");
  }

  return (
    <main className="site-page py-12 sm:py-20">
      <div className="site-frame max-w-[760px]">
        <div className="site-section-head"><span>The index</span><span>search · public records</span></div>
        <div className="py-12 sm:py-20">
          <h1 className="max-w-[12ch] font-display text-5xl leading-[1.04] tracking-tight text-ivory sm:text-6xl">Find the work.</h1>
          <p className="mt-5 max-w-[44ch] text-base leading-7 text-muted">Search names, skills, projects, and places in the public record.</p>
          <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="index-query" className="sr-only">Search the public record</label>
            <input id="index-query" value={query} onChange={(event) => { setQuery(event.target.value); setState("idle"); }} className="site-field min-h-12 flex-1" placeholder="Try a skill, name, or place" maxLength={80} />
            <button type="submit" className="site-action min-h-12">Search</button>
          </form>
          <div className="mt-6 min-h-16" aria-live="polite">
            {state === "empty" && <p role="alert" className="border-l-2 border-amber px-4 py-2 font-mono text-xs leading-6 text-amber">Enter a search term first.</p>}
            {state === "submitted" && <p className="border-l-2 border-teal px-4 py-2 font-mono text-xs leading-6 text-teal">No live index is connected yet. Your query was recorded locally: “{query.trim().slice(0, 60)}”.</p>}
          </div>
        </div>
        <div className="border-t border-ivory/10 pt-5 text-sm leading-6 text-dim">The index returns public proof only. Private identity data is never exposed.</div>
      </div>
    </main>
  );
}
