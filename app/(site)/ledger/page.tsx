"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GeoArt from "../../../components/GeoArt";
import ZionChamber from "../../../components/ZionChamber";
import { mergeBuilds, myUsername, Build } from "../../../lib/benben";
import {
  KEYS,
  LOCATIONS,
  Member,
  OCCUPATIONS,
  SCHOOL_STATS,
  SEED_MEMBERS,
  SUBSCRIBED_SCHOOLS,
  TREASURY,
  ledgerVersion,
  loadStored,
  masterHash,
  saveStored,
  seal,
  shortHash
} from "../../../lib/ledger";

function useStoredList<T>(key: string, seeds: T[]): [T[], (v: T[]) => void] {
  const [list, setList] = useState<T[]>(seeds);
  useEffect(() => {
    const stored = loadStored<T>(key);
    if (stored.length > 0) setList(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [list, (v: T[]) => { setList(v); saveStored(key, v); }];
}

// The Eight keep fool titles. The trade is real; the title is the joke
// that tells the truth: every one of them can actually do things.
const FOOL: Record<string, string> = {
  "AL-0042": "Keeper of Lost Marks",
  "AL-0137": "Lantern Whisperer",
  "AL-0201": "Counter of Everything",
  "AL-0311": "Stacker of Stones",
  "AL-0420": "Drawer of Ideas",
  "AL-0488": "Mender of Uniforms",
  "AL-0513": "Asker of Hard Questions",
  "AL-0777": "Tamer of Wires"
};

function rough(n: number): string {
  return `~${(Math.round(n / 50) * 50).toLocaleString()}`;
}

// The five doors the roll grows through. Doctrine, not state — the counts
// below answer "how many", the doors answer "how they get in".
const DOORS: { name: string; body: string; produces: string }[] = [
  {
    name: "Console",
    body: "School subscribes. Roster enters automatically. Teachers emit capability signals as they mark. Class-level nodes form from the same stream.",
    produces: "students · classes"
  },
  {
    name: "BenBen",
    body: "Anyone posts a build — an individual, a class, a school, a chama. The floor votes. A crew forms. The build is proved. Every crew member enters the roll.",
    produces: "crews"
  },
  {
    name: "Certify",
    body: "An untracked person pays 50 KES. Skill verified by reviewers. Hash sealed. Credential issued. No school required.",
    produces: "individuals"
  },
  {
    name: "Register",
    body: "A chama or group registers as a collective. One node. Many members. Pooled capital. Can fund builds and hold cooperative shares.",
    produces: "chamas"
  },
  {
    name: "Partner",
    body: "An institution joins as sponsor or hiring partner. Its capital funds proved builds. Its pipeline draws from the roll.",
    produces: "institutions"
  }
];

type CountRow = { label: string; small: string; value: string; gold?: boolean; suppress?: boolean };

export default function Ledger() {
  const [members, setMembers] = useStoredList<Member>(KEYS.members, SEED_MEMBERS);
  const [rootOpen, setRootOpen] = useState(false);
  const [me, setMe] = useState("");

  const [name, setName] = useState("");
  const [regOcc, setRegOcc] = useState(OCCUPATIONS[0]);
  const [regLoc, setRegLoc] = useState(LOCATIONS[0]);
  const [skill, setSkill] = useState("");
  const [notice, setNotice] = useState("");

  const [builds, setBuilds] = useState<Build[]>([]);
  const [sealedAt, setSealedAt] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [verdict, setVerdict] = useState<"" | "found" | "no">("");

  useEffect(() => {
    setMe(myUsername() || "");
    // Real seal time: when this reading of the roll was computed, UTC.
    setSealedAt(new Date().toISOString().slice(0, 19) + "Z");
    setBuilds(mergeBuilds());
  }, []);

  const all = useMemo(() => {
    const customs = members.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
    return [...customs, ...SEED_MEMBERS];
  }, [members]);

  const mine = me ? all.find((m) => m.username.toLowerCase() === me.toLowerCase()) || null : null;
  const field = "w-full border-b border-ivory/15 bg-transparent px-1 py-2.5 text-sm text-ivory outline-none transition focus:border-amber";

  // The anchor: one rolling seal over every record on the roll.
  const master = useMemo(() => masterHash(all.map((m) => m.hash)), [all]);

  // A crew is a build with seats raised — a claim that has not withdrawn.
  const crews = useMemo(
    () => builds.filter((b) => b.claims.some((c) => c.status !== "withdrawn")).length,
    [builds]
  );

  // Counts, never percentages: a count cannot be gamed by abstention.
  // Suppressed lines say what they do not claim.
  const rows: CountRow[] = [
    { label: "Students", small: "signals · classes · halls at exit", value: rough(SCHOOL_STATS.reduce((n, s) => n + s.students, 0)) },
    { label: "Individuals", small: "halls · bank eligibility · chamas", value: String(all.length) },
    { label: "Crews", small: "ownership · capital · cooperatives", value: String(crews), gold: crews > 0 },
    { label: "Chamas", small: "pooling · fund access · shares", value: "n<25", suppress: true },
    { label: "Schools", small: "rosters · sponsorship · console", value: String(SUBSCRIBED_SCHOOLS.length) },
    { label: "Institutions", small: "hiring · funding · partner", value: "n<25", suppress: true },
    { label: "Cooperatives", small: "assets · governance · exit", value: "n<25", suppress: true }
  ];

  // Verify: exact tokens only — the full seal hash, or the short seal as
  // shown on the roll's lines. A yes/no, never a fuzzy list, never a name.
  function verifyToken(e: React.FormEvent) {
    e.preventDefault();
    const t = token.trim();
    if (!t) { setVerdict("no"); return; }
    const hit = all.some((m) => m.hash.toLowerCase() === t.toLowerCase() || shortHash(m.hash) === t);
    setVerdict(hit ? "found" : "no");
  }

  function startDraft(e: React.FormEvent) {
    e.preventDefault();
    if (mine) { setNotice(`${mine.id} is already yours.`); return; }
    if (!name.trim()) { setNotice("Name first. The list needs to know who."); return; }
    let id = "";
    for (let i = 0; i < 20; i++) {
      const cand = "AL-" + Math.floor(1000 + Math.random() * 9000);
      if (!all.some((m) => m.id === cand)) { id = cand; break; }
    }
    if (!id) { setNotice("Try again in a moment."); return; }
    const base = { id, name: name.trim().slice(0, 40), occupation: regOcc, location: regLoc };
    const m: Member = {
      ...base,
      username: me || `Mgeni_${id.slice(3)}`,
      skills: skill.trim() ? [skill.trim().slice(0, 40)] : ["General support"],
      paid: false, verified: false, hallPaid: false, tier: null,
      testScore: null, testTs: 0, hall: null, certNo: null, answers: [], hash: seal(base)
    };
    setMembers([m, ...members]);
    try { window.localStorage.setItem(KEYS.myid, id); } catch { /* memory */ }
    setNotice(`${id} penciled in. Welcome to the floor.`);
    setName(""); setSkill("");
  }

  return (
    <main className="site-page bg-obsidian text-ivory">
      <div className="site-frame relative max-w-[880px] overflow-hidden py-12 sm:py-16 md:py-24">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute -top-20 right-[-90px] h-[300px] w-[300px] text-ivory opacity-[0.05]"
        />

        {/* masthead */}
        <div className="site-section-head">
          <span>Apt-Labs · The Roll · v{ledgerVersion(all.length)}</span>
          <span className="tabular-nums">{all.length} names · sealed</span>
        </div>

        <h1 className="mt-10 max-w-[10ch] font-display text-5xl leading-[1.04] tracking-tight sm:text-6xl">The roll.</h1>
        <p className="mt-5 max-w-[52ch] text-[0.95rem] leading-7 text-muted">
          Every producer on the floor. Students, individuals, crews, chamas, schools,
          institutions. Names private. Proof public.
        </p>

        {/* anchor — the master seal over every record on the roll */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-amber">Anchor</span>
            <span className="flex items-center gap-2 text-dim">
              block {String(all.length).padStart(4, "0")}
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
            </span>
          </div>
          <p className="break-all font-mono text-[13px] leading-6 text-ivory/90">{master}</p>
          <dl className="mt-4 grid grid-cols-[89px_1fr] gap-x-7 gap-y-2 font-mono text-[11px] leading-6">
            <dt className="uppercase tracking-[0.2em] text-dim/70">Sealed</dt>
            <dd className="text-muted">{sealedAt ?? "sealing…"}</dd>
            <dt className="uppercase tracking-[0.2em] text-dim/70">Leaves</dt>
            <dd className="text-muted">{all.length.toLocaleString()} · salted · SHA-256</dd>
            <dt className="uppercase tracking-[0.2em] text-dim/70">Chain</dt>
            <dd className="text-muted">Polygon PoS</dd>
          </dl>
          <button
            onClick={() => setRootOpen(true)}
            className="mt-4 font-mono text-xs text-muted/50 transition hover:text-muted"
          >
            &gt;_ find the root hash
          </button>
        </section>

        {/* five doors in */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-amber">Five doors in</span>
            <span className="text-dim">how the roll grows</span>
          </div>
          <div>
            {DOORS.map((d) => (
              <div
                key={d.name}
                className="grid gap-x-7 gap-y-1 border-b border-ivory/10 py-5 first:border-t md:grid-cols-[89px_1fr_auto] md:items-baseline"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber">{d.name}</span>
                <p className="text-[13px] leading-6 text-muted">{d.body}</p>
                <span className="font-mono text-[11px] tracking-[0.05em] text-amber/80 md:whitespace-nowrap md:text-right">
                  → {d.produces}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* entry desk */}
        <section className="site-surface mt-12 p-5 sm:p-6 md:p-8">
          <p className="site-kicker">Entry desk</p>
          {mine ? (
            <div className="mt-5">
              <div className="font-display text-2xl md:text-3xl">@{mine.username}</div>
              <p className="mt-2 text-sm leading-6 text-muted">
                {mine.id} is already yours. The roll knows you, and the floor is open.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-ivory px-5 py-2.5 text-sm font-semibold text-obsidian transition hover:bg-amber"
                >
                  My profile →
                </Link>
                <Link
                  href="/benben"
                  className="rounded-full border border-ivory/15 px-5 py-2.5 text-sm font-semibold transition hover:border-amber"
                >
                  Open BenBen
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={startDraft} className="mt-5 grid gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name or handle"
                maxLength={40}
                className={field}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={regOcc}
                  onChange={(e) => setRegOcc(e.target.value)}
                  className={`${field} [&>option]:bg-obsidian`}
                >
                  {OCCUPATIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <select
                  value={regLoc}
                  onChange={(e) => setRegLoc(e.target.value)}
                  className={`${field} [&>option]:bg-obsidian`}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Top skill — the trade, not the title"
                maxLength={40}
                className={field}
              />
              <button className="site-action mt-2 w-fit">
                Claim slot →
              </button>
            </form>
          )}
          {notice && <p className="mt-4 font-mono text-xs text-teal">{notice}</p>}
        </section>

        {/* on the roll — counts, with the live pulse */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-amber">On the roll</span>
            <span className="flex items-center gap-2 text-dim">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
              live
            </span>
          </div>
          <div>
            {rows.map((r) => (
              <div
                key={r.label}
                className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-ivory/10 py-3"
              >
                <div>
                  <div className="text-[13px] text-muted">{r.label}</div>
                  <div className="font-mono text-[11px] tracking-[0.03em] text-dim/70">{r.small}</div>
                </div>
                <div
                  className={`font-mono text-[13px] tabular-nums ${
                    r.suppress ? "italic text-dim/70" : r.gold ? "text-amber" : "text-ivory"
                  }`}
                >
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* the roll */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-amber">The roll · first name to last</span>
            <span className="text-dim">{all.length} entries</span>
          </div>
          <ol>
            {all.map((m, i) => (
              <li key={m.id} className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-b border-ivory/10 py-5">
                <span className="font-mono text-[11px] text-dim tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-xl md:text-2xl">@{m.username}</div>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    {m.occupation} · {m.location}
                  </div>
                  {FOOL[m.id] && <div className="mt-1 font-display italic text-sm text-dim">{FOOL[m.id]}</div>}
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] text-dim">{shortHash(m.hash)}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* under one roof */}
        <section className="mt-14">
          <p className="border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-amber">
            Under one roof · pilot
          </p>
          <dl>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-ivory/10 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                Pilot schools · {rough(SCHOOL_STATS.reduce((n, s) => n + s.students, 0))} students
              </dt>
              <dd className="text-right font-display text-base text-ivory md:text-lg">
                {SUBSCRIBED_SCHOOLS.join(" · ")}
              </dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-ivory/10 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Build budget</dt>
              <dd className="text-right font-mono text-sm text-ivory tabular-nums">
                KES {TREASURY.total.toLocaleString()} · {TREASURY.usedPct}% spent
              </dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Sealed records</dt>
              <dd className="text-right font-mono text-sm text-ivory tabular-nums">{all.length}</dd>
            </div>
          </dl>
        </section>

        {/* verify a credential */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-ivory/15 pb-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-amber">Verify a credential</span>
            <span className="text-dim">one at a time</span>
          </div>
          <form onSubmit={verifyToken} className="site-surface mt-5 flex flex-col transition focus-within:border-teal sm:flex-row">
            <input
              value={token}
              onChange={(e) => { setToken(e.target.value); setVerdict(""); }}
              placeholder="paste the token from the credential"
              spellCheck={false}
              autoComplete="off"
              className="site-field min-w-0 flex-1 border-0 font-mono text-[13px] tracking-[0.02em]"
            />
            <button
              type="submit"
              className="site-action min-h-11 shrink-0 border-0 sm:border-l sm:border-ivory/15"
            >
              Verify
            </button>
          </form>
          {verdict === "found" && (
            <p className="mt-3 font-mono text-xs text-teal">
              In the roll. A sealed record matches this token. Identity is not returned.
            </p>
          )}
          {verdict === "no" && (
            <p className="mt-3 font-mono text-xs text-dim">
              Not on the roll. No sealed record for this token.
            </p>
          )}
          <p className="mt-3 text-[13px] leading-6 text-dim">
            Partial matches are not returned. Verification confirms a credential exists in
            the roll — it does not reveal identity.
          </p>
        </section>

        <footer className="mt-16 text-center font-mono text-[11px] tracking-[0.1em] text-dim/60">
          five doors in · one roll · three exits — work, capital, ownership
        </footer>
      </div>

      {rootOpen && <ZionChamber members={all} onClose={() => setRootOpen(false)} />}
    </main>
  );
}
