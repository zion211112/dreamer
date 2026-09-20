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
    <main className="site-page py-8 sm:py-12">
      <div className="site-frame max-w-[760px]">
        <div className="site-section-head"><span>Index / public record</span><span>local query</span></div>
        <div className="record-intro">
          <p className="site-kicker">Search the roll</p>
          <h1>Find the work.</h1>
          <p>Search names, skills, projects, and places in the public record.</p>
        </div>
        <section className="record-panel" aria-labelledby="search-panel-title">
          <h2 id="search-panel-title" className="sr-only">Search the public record</h2>
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="index-query" className="sr-only">Search the public record</label>
            <input id="index-query" value={query} onChange={(event) => { setQuery(event.target.value); setState("idle"); }} className="site-field min-h-12 flex-1" placeholder="Try a skill, name, or place" maxLength={80} />
            <button type="submit" className="site-action min-h-12">Search</button>
          </form>
          <div className="mt-5 min-h-16" aria-live="polite">
            {state === "empty" && <p role="alert" className="border-l-2 border-amber px-4 py-2 font-mono text-xs leading-6 text-amber">Enter a search term first.</p>}
            {state === "submitted" && <p className="border-l-2 border-teal px-4 py-2 font-mono text-xs leading-6 text-teal">No live index is connected yet. Your query was recorded locally: “{query.trim().slice(0, 60)}”.</p>}
          </div>
        </section>
        <p className="record-note">The index returns public proof only. Private identity data is never exposed.</p>
      </div>
    </main>
  );
}
