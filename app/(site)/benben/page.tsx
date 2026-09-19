"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BoardCard from "../../../components/BoardCard";
import BuildCard from "../../../components/BuildCard";
import GeoArt from "../../../components/GeoArt";
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
  rankFeed,
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
  "w-full border-b border-ivory/10 bg-transparent py-2.5 text-sm text-ivory outline-none transition focus:border-amber";
const label = "block font-mono text-[11px] uppercase tracking-[0.25em] text-dim";

// The board's lanes: the tabs speak the machine's own state vocabulary —
// open (proposed/ratified), in hand (claimed/active), closed (the rest).
type BoardTab = "all" | "open" | "hand" | "closed";
const BOARD_TABS: { key: BoardTab; name: string }[] = [
  { key: "all", name: "all" },
  { key: "open", name: "open" },
  { key: "hand", name: "in hand" },
  { key: "closed", name: "closed" }
];
function tabBucket(s: LifeState): BoardTab {
  if (s === "proposed" || s === "ratified") return "open";
  if (s === "claimed" || s === "active") return "hand";
  return "closed";
}

// The floor: a commons of builders for local projects, skills, and trusted work.
// The feed is the ranking — vote-driven, local, useful.
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
  const desk = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBuilds(mergeBuilds());
    setMe(myUsername());
    setNow(Date.now());
    setReady(true);
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

  const feed = useMemo(() => rankFeed(builds, now), [builds, now]);
  const totalVotes = feed.reduce((n, b) => n + Math.max(b.votes, 0), 0);
  const totalForks = feed.reduce((n, b) => n + b.comments.filter((c) => c.fork).length, 0);
  const boardList = useMemo(() => boardOrder(builds, now), [builds, now]);
  const openBoard = useMemo(
    () =>
      boardList.filter((b) => {
        const s = deriveState(b, now);
        return s !== "done" && s !== "parked" && s !== "lapsed";
      }).length,
    [boardList, now]
  );
  const boardTabs = useMemo(() => {
    const counts: Record<BoardTab, number> = { all: boardList.length, open: 0, hand: 0, closed: 0 };
    for (const b of boardList) counts[tabBucket(deriveState(b, now))]++;
    return counts;
  }, [boardList, now]);
  const shownBoard = useMemo(
    () => (tab === "all" ? boardList : boardList.filter((b) => tabBucket(deriveState(b, now)) === tab)),
    [boardList, tab, now]
  );

  if (!ready) {
    return <main className="min-h-[60vh] bg-obsidian text-ivory" />;
  }

  return (
    <main className="site-page bg-obsidian text-ivory">
      <div className="site-frame relative max-w-[960px] overflow-hidden py-12 md:py-20">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute -top-16 right-[-80px] h-[300px] w-[300px] text-teal opacity-[0.06]"
        />

        {/* masthead */}
        <div className="site-section-head flex-wrap">
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 rotate-45 place-items-center rounded-[5px] bg-gradient-to-br from-teal/70 to-amber/70"
            />
            <span>Ben-Ben · The Floor</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-teal ring-1 ring-inset ring-teal/25 tabular-nums">
              {feed.length} builds
            </span>
            <span className="rounded-full bg-amber/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber ring-1 ring-inset ring-amber/25 tabular-nums">
              {totalVotes} votes · {totalForks} forks
            </span>
            <span className="rounded-full bg-teal/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-teal ring-1 ring-inset ring-teal/25 tabular-nums">
              {openBoard} open on the board
            </span>
          </div>
        </div>

        <h1 className="mt-10 max-w-[12ch] font-display text-4xl leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
          Post. Vote. Claim. <span className="bb-gradient-text">Prove.</span>
        </h1>
        <p className="mt-5 max-w-[52ch] text-[0.95rem] leading-7 text-muted">
          A commons of builders for local projects, skills, and trusted work. The board decides
          by count; the floor remembers by proof. No emojis, no images, no noise.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setForkOf(null);
              setErr("");
              setNotice("");
              setOpen((o) => !o);
            }}
            className="bb-btn bb-glow min-h-11 rounded-full px-6 py-3 text-sm font-semibold transition"
          >
            {open ? "Close the desk" : "Fork the floor →"}
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-dim">
            {me ? `signed · @${me}` : "signed in as no one yet"}
          </span>
        </div>

        {/* the board: commitments made public — state derived, never written */}
        <section className="bb-board mt-12">
          <div>
            <h2 className="font-display text-[2rem] font-medium leading-tight text-ivory">The Commitments</h2>
            <span aria-hidden className="mt-3 block h-px w-[5.5rem] bg-amber/70" />
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-[11px] uppercase tracking-[0.24em]">
              <span className="text-amber">Propose · Ratify · Claim · Prove</span>
              <span className="text-dim">state is derived — the floor decides</span>
            </div>
            <div role="tablist" aria-label="Board state" className="mt-5 flex border-b border-ivory/10" aria-orientation="horizontal">
              {BOARD_TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  id={`board-tab-${t.key}`}
                  aria-controls="board-panel"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`min-h-11 border-b-2 px-2.5 font-mono text-[10px] uppercase tracking-[0.13em] transition sm:px-4 ${
                    tab === t.key
                      ? "border-amber text-amber"
                      : "border-transparent text-dim hover:border-ivory/30 hover:text-ivory"
                  }`}
                >
                  {t.name} <span className="tabular-nums opacity-60">{boardTabs[t.key]}</span>
                </button>
              ))}
            </div>
          </div>
          <div id="board-panel" role="tabpanel" aria-labelledby={`board-tab-${tab}`} tabIndex={-1}>
            {shownBoard.length === 0 ? (
              <div className="mt-8 border border-dashed border-ivory/15 px-5 py-8">
                <p className="font-display text-xl text-ivory">Nothing in this lane.</p>
                <p className="mt-2 max-w-[48ch] font-mono text-[11px] uppercase leading-6 tracking-[0.16em] text-dim">
                  The floor is waiting for a commitment that belongs here.
                </p>
              </div>
            ) : (
              shownBoard.map((b) => (
                <BoardCard
                  key={b.id}
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
                />
              ))
            )}
          </div>
        </section>

        {/* the desk */}
        <div ref={desk} id="desk" className="mt-12 scroll-mt-24">
          {open && (
            <form onSubmit={submit} className="site-surface p-5 sm:p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber">
                  {forkOf ? `Forking · ${forkOf.id}` : "New build"}
                </p>
                {forkOf && (
                  <p className="font-mono text-[11px] text-dim">
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
                      className={`${field} [&>option]:bg-obsidian`}
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
                      className={`${field} [&>option]:bg-obsidian`}
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
                        className={`border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition ${
                          risk === r
                            ? "border-amber bg-amber/10 text-amber"
                            : "border-ivory/12 text-dim hover:border-ivory/25 hover:text-ivory"
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
                          className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition ${
                            on
                              ? "border-teal/60 bg-teal/10 text-teal"
                              : "border-ivory/12 text-dim hover:border-ivory/25 hover:text-ivory"
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
                    <label className="flex min-h-11 items-center gap-2 font-mono text-[11px] text-muted">
                      <input
                        type="checkbox"
                        checked={nothing}
                        onChange={(e) => setNothing(e.target.checked)}
                        className="accent-amber"
                      />
                      Nothing
                    </label>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-dim">Hands</span>
                      <input
                        className={field}
                        type="number"
                        min={0}
                        value={labor}
                        onChange={(e) => setLabor(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-dim">Funds · KES</span>
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
                        <span className="font-mono text-[10px] uppercase text-dim">Materials</span>
                        <input
                          className={field}
                          value={materials}
                          onChange={(e) => setMaterials(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase text-dim">Intellect</span>
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
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim transition hover:text-ivory"
                  >
                    close the desk
                  </button>
                  <div className="flex items-center gap-4">
                    {err && <p role="alert" className="font-mono text-xs text-amber">{err}</p>}
                    {notice && <p role="status" className="font-mono text-xs text-teal">{notice}</p>}
                    <button className="bb-btn bb-glow min-h-11 rounded-full px-6 py-3 text-sm font-semibold transition">
                      {forkOf ? "Put the fork on the floor →" : "Put it on the floor →"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* the feed */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-amber">On the floor</span>
            <span className="text-dim">velocity, not vanity</span>
          </div>
          {feed.length === 0 && (
            <div className="border-b border-ivory/10 px-1 py-10">
              <p className="font-display text-2xl text-ivory">The floor is clear.</p>
              <p className="mt-2 max-w-[48ch] text-sm leading-7 text-muted">
                Start the first build and give the commons something concrete to move.
              </p>
            </div>
          )}
          {feed.map((b) => (
            <BuildCard
              key={b.id}
              b={b}
              now={now}
              myVote={b.votedBy[voteKey]?.value ?? 0}
              voteErr={voteErrId === b.id ? voteErr : null}
              onVote={vote}
              onFork={fork}
            />
          ))}
        </section>

        <p className="mt-16 border-t border-ivory/10 pt-6 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-dim">
          count, not noise · commit, then prove
        </p>
      </div>
    </main>
  );
}
