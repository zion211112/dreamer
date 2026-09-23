"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BoardCard from "../../../components/BoardCard";
import HyperbolicHeptagon from "../../../components/HyperbolicHeptagon";
import "./benben.css";
import {
  addBuild,
  allMembers,
  Build,
  BuildNeeds,
  BoardRole,
  castVote,
  DOMAINS,
  mergeBuilds,
  memberByUsername,
  myUsername,
  persistBuilds,
  tierOf,
  TYPES,
  validateBuild
} from "../../../lib/benben";
import {
  acceptClaim,
  attest,
  boardOrder,
  deriveState,
  logProgress,
  park,
  RISKS,
  SKILLS,
  submitClaim,
  withdrawClaim
} from "../../../lib/board";
import type { LifeState, Risk } from "../../../lib/board";

const field =
  "w-full border-b border-rule bg-transparent py-2.5 text-body text-ink outline-none transition focus:border-amber placeholder:text-dust/60";
const label = "block font-mono text-label uppercase tracking-[0.25em] text-dust";

// The floor's lanes: one vocabulary, shared with lib/board STATE names —
// open (proposed/ratified), in hand (claimed/active), proved (done).
// Parked + lapsed rest under a quiet link, not a peer tab.
type BoardTab = "all" | "open" | "hand" | "done" | "rest";
const BOARD_TABS: { key: BoardTab; name: string }[] = [
  { key: "all", name: "all" },
  { key: "open", name: "open" },
  { key: "hand", name: "in hand" },
  { key: "done", name: "proved" }
];
function tabBucket(s: LifeState): BoardTab {
  if (s === "proposed" || s === "ratified") return "open";
  if (s === "claimed" || s === "active") return "hand";
  if (s === "done") return "done";
  return "rest";
}

// The floor: one board, lanes by commitment state. Counts, not noise.
export default function BenBenPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [me, setMe] = useState<string | null>(null);

  // the desk
  const [open, setOpen] = useState(false);
  const [forkOf, setForkOf] = useState<Build | null>(null);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [type, setType] = useState(TYPES[0]);
  const [location, setLocation] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState("");
  const [labor, setLabor] = useState("0");
  const [funds, setFunds] = useState("0");
  const [materials, setMaterials] = useState("");
  const [intellect, setIntellect] = useState("");
  const [nothing, setNothing] = useState(true);
  const [risk, setRisk] = useState<Risk>("low");
  const [skillsSel, setSkillsSel] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [err, setErr] = useState("");
  const [voteErr, setVoteErr] = useState<string | null>(null);
  const [voteErrId, setVoteErrId] = useState<string | null>(null);
  const [tab, setTab] = useState<BoardTab>("all");
  const [search, setSearch] = useState("");
  const desk = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBuilds(mergeBuilds());
    setMe(myUsername());
    setNow(Date.now());
    setReady(true);
  }, []);

  // "/" jumps to the floor search from anywhere on the page. The hint
  // is not decorative; this wires it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      e.preventDefault();
      document.getElementById("floor-search")?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const voteKey = me || "Guest";
  const tier = useMemo(
    () => (me ? tierOf(me, (u) => memberByUsername(allMembers(), u)) : "visitor"),
    [me]
  );

  function vote(id: string, v: 1 | -1) {
    const t = Date.now();
    const res = castVote(builds, id, voteKey, v, t);
    if (res.err) {
      setVoteErr(res.err);
      setVoteErrId(id);
      return;
    }
    setBuilds(res.list);
    setVoteErr(null);
    setVoteErrId(null);
    setNow(t);
  }

  function fork(b: Build) {
    setForkOf(b);
    setDomain(b.domain);
    setType(b.type);
    setLocation(b.location);
    setDone(b.done);
    setLabor(String(b.needs.labor));
    setFunds(String(b.needs.funds));
    setMaterials(b.needs.materials);
    setIntellect(b.needs.intellect);
    setNothing(b.needs.nothing);
    setRisk(b.risk);
    setSkillsSel(b.skills ?? []);
    setTitle("");
    setBody("");
    setErr("");
    setNotice("");
    setOpen(true);
    desk.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const needs: BuildNeeds = {
      labor: Number(labor) || 0,
      materials,
      funds: Number(funds) || 0,
      intellect,
      nothing
    };
    const problem = validateBuild({ title, body, done, needs });
    if (problem) {
      setErr(problem);
      return;
    }
    const b = addBuild({
      title,
      body,
      domain,
      type,
      needs,
      location,
      done,
      by: me || undefined,
      forkOf: forkOf?.id,
      tierAtPost: tier,
      risk,
      skills: skillsSel
    });
    setBuilds(mergeBuilds());
    setNow(Date.now());
    setOpen(false);
    setForkOf(null);
    setTitle("");
    setBody("");
    setSkillsSel([]);
    setRisk("low");
    setErr("");
    setNotice(`${b.id} is on the floor.`);
  }

  // ---- the board: pure ops from lib/board, one shared apply ----
  function apply(id: string, op: (b: Build) => { b: Build; err: string | null }): string | null {
    const i = builds.findIndex((x) => x.id === id);
    if (i < 0) return "Gone. The floor moved on.";
    const res = op(builds[i]);
    if (res.err) return res.err;
    const next = [...builds];
    next[i] = res.b;
    setBuilds(next);
    persistBuilds(next);
    setNow(Date.now());
    return null;
  }
  const at = () => Date.now();
  const onClaim = (id: string, role: BoardRole, reason: string) =>
    apply(id, (b) => submitClaim(b, me ?? "", tier, role, reason, at()));
  const onAccept = (id: string, target: string, role: BoardRole) =>
    apply(id, (b) => acceptClaim(b, me ?? "", target, role, tier, at()));
  const onWithdraw = (id: string, role: BoardRole) =>
    apply(id, (b) => withdrawClaim(b, me ?? "", me ?? "", role, at()));
  const onProgress = (id: string, text: string) => apply(id, (b) => logProgress(b, me ?? "", text, at()));
  const onAttest = (id: string, evidence: string) => apply(id, (b) => attest(b, me ?? "", evidence, tier, at()));
  const onPark = (id: string) => apply(id, (b) => park(b, me ?? "", tier, at()));

  const boardList = useMemo(() => boardOrder(builds, now), [builds, now]);
  const totalVotes = boardList.reduce((n, b) => n + Math.max(b.votes, 0), 0);
  const totalForks = boardList.reduce((n, b) => n + b.comments.filter((c) => c.fork).length, 0);
  const openBoard = useMemo(
    () =>
      boardList.filter((b) => {
        const s = deriveState(b, now);
        return s !== "done" && s !== "parked" && s !== "lapsed";
      }).length,
    [boardList, now]
  );
  const boardTabs = useMemo(() => {
    const counts: Record<BoardTab, number> = { all: boardList.length, open: 0, hand: 0, done: 0, rest: 0 };
    for (const b of boardList) counts[tabBucket(deriveState(b, now))]++;
    return counts;
  }, [boardList, now]);

  const restCount = useMemo(() =>
    boardList.filter((b) => tabBucket(deriveState(b, now)) === "rest").length,
    [boardList, now]
  );
  const shownBoard = useMemo(
    () => {
      const query = search.trim().toLowerCase();
      return boardList.filter((b) => {
        if (tab !== "all" && tabBucket(deriveState(b, now)) !== tab) return false;
        if (!query) return true;
        return `${b.title} ${b.body} ${b.by} ${b.domain} ${b.location}`.toLowerCase().includes(query);
      });
    },
    [boardList, tab, now, search]
  );

  // J/K walk the board — the Linear muscle memory, arrow keys riding along
  // for the discoverable path. Escape lets go. The focused card takes
  // V/C/Space from BoardCard; this list only moves the cursor.
  const [focusIdx, setFocusIdx] = useState(-1);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (k === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, shownBoard.length - 1));
      } else if (k === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => (i <= 0 ? 0 : i - 1));
      } else if (e.key === "Escape") {
        setFocusIdx(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shownBoard.length]);

  if (!ready) {
    // Never an empty shell: the board reads from local storage, so the
    // first paint has nothing in it. Mirror (site)/loading.tsx so the
    // route always has on-brand structure and a non-empty a11y tree.
    return (
      <main className="site-page bg-void text-ink" aria-busy="true">
        <div className="site-frame site-frame--narrow">
          <span className="sr-only">Loading the floor</span>
          <div className="skeleton h-6 w-52" />
          <div className="skeleton mt-6 h-12 w-[min(100%,26rem)]" />
          <div className="skeleton mt-4 h-4 w-[min(100%,34rem)]" />
          <div className="mt-10 space-y-4">
            <div className="skeleton h-28 w-full" />
            <div className="skeleton h-28 w-full" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="site-page benben-page bg-void text-ink">
      <div className="site-frame site-frame--narrow floor-frame relative overflow-hidden py-8 md:py-12">
        {/* the hall: the {7,3} mark, shared with hero/404/contact, behind the board */}
        <HyperbolicHeptagon depth={2} className="floor-hall-art" />
        <div className="floor-hall-bloom" aria-hidden />
        <div className="floor-hall-light" aria-hidden />
        {/* masthead */}
        <header className="floor-masthead">
          <p className="floor-brand">
            <strong>Post. Vote. Claim. Prove.</strong>
            <span>BenBen · The Floor</span>
          </p>
          <h1 className="floor-title">The board decides by count. The floor remembers by proof.</h1>
          <p className="floor-philosophy">
            A build is a commitment, not a post. State is derived, never written.
          </p>
          <nav
            className="floor-tabs"
            role="tablist"
            aria-label="Floor lanes"
            aria-orientation="horizontal"
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const i = BOARD_TABS.findIndex((t) => t.key === tab);
              const d = e.key === "ArrowRight" ? 1 : -1;
              const next = BOARD_TABS[(i + d + BOARD_TABS.length) % BOARD_TABS.length];
              setTab(next.key);
              document.getElementById(`board-tab-${next.key}`)?.focus();
            }}
          >
            {BOARD_TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                id={`board-tab-${t.key}`}
                aria-controls="board-panel"
                aria-selected={tab === t.key}
                tabIndex={tab === t.key ? 0 : -1}
                onClick={() => setTab(t.key)}
              >
                {t.name} <span>{boardTabs[t.key]}</span>
              </button>
              ))}
            </nav>
          <figure className="floor-seal">
            <HyperbolicHeptagon depth={1} />
            <figcaption>{`the hall · {7,3}`}</figcaption>
          </figure>
        </header>
        <div className="floor-telemetry">
          <span className="floor-beacon"><i aria-hidden="true" /> LOCAL FLOOR ACTIVE</span>
          <span>{boardList.length} builds · {totalVotes} votes · {totalForks} forks</span>
          <span>{openBoard} open commitments</span>
        </div>

        <div className="floor-console">
          <div className="floor-console-row">
            <label className="floor-search">
              <span className="sr-only">Search commitments</span>
              <input
                id="floor-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH TITLE · HANDLE · LOCATION · DOMAIN"
                aria-label="Search commitments"
              />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear commitment search">×</button>}
              {!search && <kbd title="Press / to search">/</kbd>}
            </label>
            <div className="floor-actions">
              <span className="floor-signed">{me ? `signed · @${me}` : "unsigned operator"}</span>
            </div>
          </div>
          <div className="floor-console-row">
            <p className="floor-console-note">Press <kbd>/</kbd> to search · <kbd>J</kbd>/<kbd>K</kbd> to walk the board · <kbd>V</kbd> vote · <kbd>C</kbd> claim · <kbd>Space</kbd> inspect · <kbd>Esc</kbd> let go</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setForkOf(null);
            setErr("");
            setNotice("");
            setOpen((o) => !o);
            requestAnimationFrame(() => desk.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
          }}
          className="post-fab"
          aria-expanded={open}
        >
          {open ? "Close the desk" : "+ Post a build"}
        </button>

        <div className="floor-board-heading">
          <div>
            <p className="floor-kicker">The board</p>
            <h2>Count, not noise.</h2>
          </div>
          <span>{shownBoard.length} visible</span>
        </div>

        {/* the board: commitments made public — state derived, never written.
            The ol carries .floor-board (the ruled register: counter-reset,
            no list markers); the entry is the article inside a bare li. */}
        <section>
          <ol id="board-panel" className="floor-board" role="tabpanel" aria-labelledby={`board-tab-${tab}`} tabIndex={-1}>
            {shownBoard.length === 0 ? (
              <li className="mt-8 border border-dashed border-rule px-5 py-8 list-none">
                <p className="font-serif text-xl text-ink">Nothing in this lane.</p>
                <p className="mt-2 max-w-[48ch] font-mono text-label uppercase leading-6 tracking-[0.16em] text-dust">
                  The floor is waiting for a commitment that belongs here.
                </p>
              </li>
            ) : (
              shownBoard.map((b, i) => (
                <li key={b.id}>
                  <BoardCard
                    b={b}
                    now={now}
                    me={me}
                    tier={tier}
                    all={builds}
                    onVote={vote}
                    onFork={fork}
                    onClaim={onClaim}
                    onAccept={onAccept}
                    onWithdraw={onWithdraw}
                    onProgress={onProgress}
                    onAttest={onAttest}
                    onPark={onPark}
                    focused={i === focusIdx}
                    onActivate={() => setFocusIdx(-1)}
                  />
                </li>
              ))
            )}
          </ol>
        </section>

        {restCount > 0 && (
          <div className="rest-link">
            <button
              type="button"
              onClick={() => setTab("all")}
              aria-expanded={false}
            >
              {restCount} resting {restCount === 1 ? "build" : "builds"} — parked & lapsed
            </button>
          </div>
        )}

        {/* the desk */}
        <div ref={desk} id="desk" className="mt-12 scroll-mt-24">
          {open && (
            <form onSubmit={submit} className="floor-desk p-5 sm:p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-label uppercase tracking-[0.3em] text-amber">
                  {forkOf ? `Forking · ${forkOf.id}` : "New build"}
                </p>
                {forkOf && (
                  <p className="font-mono text-label text-ash">
                    “{forkOf.title.slice(0, 44)}” · @{forkOf.by}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-6">
                <div>
                  <label className={label} htmlFor="bb-title">
                    Title · 89 max
                  </label>
                  <input
                    id="bb-title"
                    className={field}
                    value={title}
                    maxLength={89}
                    placeholder="What is being built, or what is missing"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="bb-domain">
                      Domain
                    </label>
                    <select
                      id="bb-domain"
                      className={`${field} [&>option]:bg-void`}
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    >
                      {DOMAINS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor="bb-type">
                      Type
                    </label>
                    <select
                      id="bb-type"
                      className={`${field} [&>option]:bg-void`}
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      {TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={label} htmlFor="bb-risk">
                    Risk · sets the bar, the window, and the closing quorum
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {RISKS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRisk(r)}
                        aria-pressed={risk === r}
                        className={`min-h-11 border px-4 py-2 font-mono text-label uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                          risk === r
                            ? "border-amber bg-amber/10 text-amber"
                            : "border-rule/12 text-ash hover:border-rule/25 hover:text-ink"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={label}>Skills · the yard</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SKILLS.map((k) => {
                      const on = skillsSel.includes(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setSkillsSel((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))
                          }
                          className={`min-h-11 border px-3 py-1.5 font-mono text-label uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber ${
                            on
                              ? "border-amber/60 bg-amber/10 text-amber"
                              : "border-rule/12 text-ash hover:border-rule/25 hover:text-ink"
                          }`}
                        >
                          {k}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="bb-location">
                      Location · optional
                    </label>
                    <input
                      id="bb-location"
                      className={field}
                      value={location}
                      maxLength={40}
                      placeholder="Mwea"
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="bb-done">
                      Done looks like · 144 max
                    </label>
                    <input
                      id="bb-done"
                      className={field}
                      value={done}
                      maxLength={144}
                      placeholder="One sentence"
                      onChange={(e) => setDone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={label} htmlFor="bb-body">
                    Body · 500 words
                  </label>
                  <textarea
                    id="bb-body"
                    className={`${field} h-24 resize-y`}
                    value={body}
                    placeholder="Enough for a stranger to act on"
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <fieldset>
                  <legend className={label}>What is missing</legend>
                  <div className="mt-3 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
                    <label className="flex min-h-11 items-center gap-2 font-mono text-label text-dust">
                      <input
                        type="checkbox"
                        checked={nothing}
                        onChange={(e) => setNothing(e.target.checked)}
                        className="accent-amber"
                      />
                      Nothing
                    </label>
                    <div>
                      <span className="font-mono text-micro uppercase text-ash">Hands</span>
                      <input
                        className={field}
                        type="number"
                        min={0}
                        value={labor}
                        onChange={(e) => setLabor(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="font-mono text-micro uppercase text-ash">Funds · KES</span>
                      <input
                        className={field}
                        type="number"
                        min={0}
                        value={funds}
                        onChange={(e) => setFunds(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:col-span-2 md:col-span-1">
                      <div>
                        <span className="font-mono text-micro uppercase text-ash">Materials</span>
                        <input
                          className={field}
                          value={materials}
                          onChange={(e) => setMaterials(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="font-mono text-micro uppercase text-ash">Intellect</span>
                        <input
                          className={field}
                          value={intellect}
                          onChange={(e) => setIntellect(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setErr("");
                      setNotice("");
                    }}
                    className="font-mono text-label uppercase tracking-[0.2em] text-dust transition hover:text-ink"
                  >
                    close the desk
                  </button>
                  <div className="flex items-center gap-4">
                    {err && <p role="alert" className="font-mono text-xs text-amber">{err}</p>}
                    {notice && <p role="status" className="font-mono text-xs text-amber">{notice}</p>}
                    <button className="post-fab post-fab--inline">
                      {forkOf ? "Put the fork on the floor →" : "Put it on the floor →"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* the mesh: a static echo of the record — the hall's own seal */}
        <div aria-hidden className="floor-mesh">
          <div className="floor-mesh-cells">
            {Array.from({ length: 28 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className="floor-mesh-caption">
            <span>merkle strip · the hall record</span>
            <span>state is derived, never written</span>
          </div>
        </div>

        {/* colophon lives above the FAB now; keep bottom padding for its overlap */}
        <p className="page-foot">count, not noise · commit, then prove</p>
        <div aria-hidden className="h-24" />
      </div>
    </main>
  );
}
