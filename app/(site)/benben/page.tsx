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
import type { Risk } from "../../../lib/board";

const field =
  "w-full border-b border-white/10 bg-transparent py-2.5 text-sm text-ivory outline-none transition focus:border-gold";
const label = "block font-mono text-[11px] uppercase tracking-[0.25em] text-dim";

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
      return;
    }
    setBuilds(res.list);
    setVoteErr(null);
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

  if (!ready) {
    return <main className="min-h-[60vh] bg-obsidian text-ivory" />;
  }

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative mx-auto max-w-[880px] overflow-hidden px-6 py-16 md:py-24">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute -top-16 right-[-80px] h-[300px] w-[300px] text-ivory opacity-[0.05]"
        />

        {/* masthead */}
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
          <span>Ben-Ben · The Floor</span>
          <span className="tabular-nums">
            {feed.length} builds · {totalVotes} votes · {totalForks} forks · {openBoard} open on the board
          </span>
        </div>

        <h1 className="mt-12 font-display text-5xl md:text-6xl tracking-tight">Post. Vote. Claim. Prove.</h1>
        <p className="mt-5 max-w-[52ch] text-[0.95rem] leading-7 text-muted">
          A commons of builders for local projects, skills, and trusted work. The board decides
          by count; the floor remembers by proof. No emojis, no images, no noise.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              setForkOf(null);
              setErr("");
              setNotice("");
              setOpen((o) => !o);
            }}
            className="rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold"
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
            <span aria-hidden className="mt-3 block h-px w-[5.5rem] bg-gold/70" />
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-[11px] uppercase tracking-[0.24em]">
              <span className="text-gold">Propose · Ratify · Claim · Prove</span>
              <span className="text-dim">state is derived — the floor decides</span>
            </div>
          </div>
          {boardList.map((b) => (
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
          ))}
        </section>

        {/* the desk */}
        <div ref={desk} id="desk" className="mt-12 scroll-mt-24">
          {open && (
            <form onSubmit={submit} className="border border-white/10 bg-panel/60 p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
                  {forkOf ? `Forking · ${forkOf.id}` : "New build"}
                </p>
                {forkOf && (
                  <p className="font-mono text-[11px] text-dim">
                    “{forkOf.title.slice(0, 44)}” · @{forkOf.by}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-5">
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

                <div className="grid grid-cols-2 gap-4">
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
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-white/12 text-dim hover:border-white/25 hover:text-ivory"
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
                              ? "border-teal-300/60 bg-teal-300/10 text-teal-300"
                              : "border-white/12 text-dim hover:border-white/25 hover:text-ivory"
                          }`}
                        >
                          {k}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <label className="flex items-center gap-2 font-mono text-[11px] text-muted">
                      <input
                        type="checkbox"
                        checked={nothing}
                        onChange={(e) => setNothing(e.target.checked)}
                        className="accent-[#d4af37]"
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
                    <div className="grid grid-cols-2 gap-3">
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
                    {err && <p className="font-mono text-xs text-red-400">{err}</p>}
                    {notice && <p className="font-mono text-xs text-emerald-300">{notice}</p>}
                    <button className="rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold">
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
          <div className="flex items-baseline justify-between border-b border-white/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-gold">On the floor</span>
            <span className="text-dim">velocity, not vanity</span>
          </div>
          {feed.map((b) => (
            <BuildCard
              key={b.id}
              b={b}
              now={now}
              myVote={b.votedBy[voteKey]?.value ?? 0}
              voteErr={voteErr}
              onVote={vote}
              onFork={fork}
            />
          ))}
        </section>

        <p className="mt-16 border-t border-white/10 pt-6 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-dim">
          count, not noise · commit, then prove
        </p>
      </div>
    </main>
  );
}
