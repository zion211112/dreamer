"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ============================================================
   NEWPROTOSHELL — a file-manager-inspired workspace
   one route, one store, zero dependencies beyond react itself
   ============================================================ */

type Role = "individual" | "builder" | "teacher";

interface User {
  handle: string;
  role: Role;
  email: string;
}

const ROLE_LABEL: Record<Role, string> = {
  individual: "Individual",
  builder: "Builder",
  teacher: "Teacher",
};

/* ---------------- seed data ---------------- */

interface FsItem {
  name: string;
  kind: "folder" | "file";
  size: string;
  updated: string;
  state: "current" | "stale" | "sealed";
}

const FS_SEED: Record<string, FsItem[]> = {
  "/": [
    { name: "records", kind: "folder", size: "—", updated: "today", state: "current" },
    { name: "builds", kind: "folder", size: "—", updated: "today", state: "current" },
    { name: "tenders", kind: "folder", size: "—", updated: "yesterday", state: "current" },
    { name: "vault", kind: "folder", size: "—", updated: "monday", state: "sealed" },
    { name: "manifest.json", kind: "file", size: "2.1 KB", updated: "today", state: "current" },
    { name: "README.md", kind: "file", size: "884 B", updated: "sunday", state: "stale" },
  ],
  "/records": [
    { name: "attendance.csv", kind: "file", size: "14 KB", updated: "today", state: "current" },
    { name: "marks-term1.csv", kind: "file", size: "31 KB", updated: "friday", state: "current" },
    { name: "marks-term2.csv", kind: "file", size: "29 KB", updated: "monday", state: "stale" },
    { name: "register-2024.json", kind: "file", size: "6 KB", updated: "wednesday", state: "sealed" },
  ],
  "/builds": [
    { name: "terra-ledger", kind: "folder", size: "—", updated: "today", state: "current" },
    { name: "loom-allocator", kind: "folder", size: "—", updated: "thursday", state: "current" },
    { name: "veil-signals", kind: "folder", size: "—", updated: "tuesday", state: "stale" },
  ],
  "/tenders": [
    { name: "offline-register-12-schools.pdf", kind: "file", size: "412 KB", updated: "today", state: "current" },
    { name: "archive-migration.pdf", kind: "file", size: "188 KB", updated: "last week", state: "sealed" },
  ],
  "/vault": [
    { name: "builder-i.sbt", kind: "file", size: "bound", updated: "monday", state: "sealed" },
    { name: "teacher-i.sbt", kind: "file", size: "bound", updated: "friday", state: "sealed" },
  ],
  "/builds/terra-ledger": [
    { name: "flow.json", kind: "file", size: "4 KB", updated: "today", state: "current" },
    { name: "notes.md", kind: "file", size: "1 KB", updated: "today", state: "current" },
  ],
  "/builds/loom-allocator": [
    { name: "flow.json", kind: "file", size: "3 KB", updated: "thursday", state: "current" },
  ],
  "/builds/veil-signals": [
    { name: "flow.json", kind: "file", size: "3 KB", updated: "tuesday", state: "stale" },
  ],
};

interface Build {
  id: string;
  title: string;
  blurb: string;
  stage: "live" | "building" | "staged";
  author: string;
  votes: string[];
  nodes: { id: string; label: string; kind: "input" | "store" | "compute" | "output" | "gate"; x: number; y: number }[];
  edges: { from: string; to: string }[];
}

const BUILDS_SEED: Build[] = [
  {
    id: "terra-ledger",
    title: "Terra Ledger",
    blurb: "Land records that outlive the clerk who wrote them.",
    stage: "live",
    author: "kofi",
    votes: ["ama", "wanjiru"],
    nodes: [
      { id: "a", label: "Survey scan", kind: "input", x: 20, y: 60 },
      { id: "b", label: "Parcel store", kind: "store", x: 190, y: 30 },
      { id: "c", label: "Boundary check", kind: "gate", x: 190, y: 130 },
      { id: "d", label: "Registry hash", kind: "compute", x: 360, y: 80 },
      { id: "e", label: "Title certificate", kind: "output", x: 530, y: 80 },
    ],
    edges: [{ from: "a", to: "b" }, { from: "a", to: "c" }, { from: "b", to: "d" }, { from: "c", to: "d" }, { from: "d", to: "e" }],
  },
  {
    id: "loom-allocator",
    title: "Loom Allocator",
    blurb: "Classroom seats assigned like threads on a loom — no fights, no favorites.",
    stage: "building",
    author: "wanjiru",
    votes: ["ama"],
    nodes: [
      { id: "a", label: "Roster", kind: "input", x: 20, y: 80 },
      { id: "b", label: "Need matrix", kind: "compute", x: 190, y: 80 },
      { id: "c", label: "Seat map", kind: "store", x: 360, y: 40 },
      { id: "d", label: "Fairness gate", kind: "gate", x: 360, y: 130 },
      { id: "e", label: "Published grid", kind: "output", x: 530, y: 85 },
    ],
    edges: [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "b", to: "d" }, { from: "c", to: "e" }, { from: "d", to: "e" }],
  },
  {
    id: "veil-signals",
    title: "Veil Signals",
    blurb: "Attendance anomalies whisper before they shout.",
    stage: "staged",
    author: "kofi",
    votes: [],
    nodes: [
      { id: "a", label: "Register feed", kind: "input", x: 20, y: 80 },
      { id: "b", label: "Drift detector", kind: "compute", x: 200, y: 80 },
      { id: "c", label: "Alert desk", kind: "output", x: 390, y: 80 },
    ],
    edges: [{ from: "a", to: "b" }, { from: "b", to: "c" }],
  },
];

interface Tender {
  id: string;
  title: string;
  issuer: string;
  budget: string;
  status: "open" | "evaluation" | "awarded" | "closed";
  bids: { builder: string; note: string; price: string; votes: string[] }[];
}

const TENDERS_SEED: Tender[] = [
  {
    id: "t-1",
    title: "Offline register — 12 schools",
    issuer: "county education office",
    budget: "KES 1.8M",
    status: "open",
    bids: [
      { builder: "kofi", note: "Solar sync kits + paper trail", price: "KES 1.6M", votes: ["ama"] },
    ],
  },
  {
    id: "t-2",
    title: "Archive migration — 1998–2014",
    issuer: "national records board",
    budget: "KES 940K",
    status: "evaluation",
    bids: [
      { builder: "kofi", note: "Scanner farm, 6 weeks", price: "KES 900K", votes: [] },
      { builder: "ama", note: "Crowd-sourced digitization", price: "KES 780K", votes: ["wanjiru"] },
    ],
  },
];

const LEARNERS = [
  { name: "Ama Serwaa", form: "Form 2", attendance: 92, maths: 78, english: 85, science: null },
  { name: "Kofi Mensah", form: "Form 2", attendance: 88, maths: 64, english: null, science: 71 },
  { name: "Wanjiru Mwangi", form: "Form 3", attendance: 97, maths: 91, english: 88, science: 94 },
  { name: "Otieno Ochieng", form: "Form 3", attendance: 71, maths: null, english: 59, science: 62 },
  { name: "Zawadi Ali", form: "Form 1", attendance: 95, maths: 82, english: 90, science: null },
];

const SBT_CATALOG = [
  { id: "builder-i", name: "Builder I", icon: "hammer", desc: "Shipped one build that others voted for." },
  { id: "builder-ii", name: "Builder II", icon: "anvil", desc: "Three builds, three awards." },
  { id: "teacher-i", name: "Teacher I", icon: "book", desc: "Ran a console for one full term." },
  { id: "scholar-i", name: "Scholar I", icon: "scroll", desc: "Voted on ten builds with notes." },
  { id: "keeper-i", name: "Keeper I", icon: "key", desc: "Sealed a record that survived audit." },
];

/* ---------------- persistence ---------------- */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode — session-only */
  }
}

/* ---------------- tiny ui atoms ---------------- */

function Chip({ tone = "neutral", children }: { tone?: "neutral" | "jade" | "amber" | "red" | "ash"; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    neutral: "bg-white/[0.06] text-neutral-300 border-white/10",
    jade: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    amber: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    red: "bg-rose-400/10 text-rose-300 border-rose-400/30",
    ash: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] tracking-wide ${styles[tone]}`}>{children}</span>;
}

function StateChip({ state }: { state: FsItem["state"] }) {
  if (state === "current") return <Chip tone="jade">current</Chip>;
  if (state === "sealed") return <Chip tone="amber">sealed</Chip>;
  return <Chip tone="ash">stale</Chip>;
}

function FlowGraph({ build }: { build: Build }) {
  const tone: Record<Build["nodes"][number]["kind"], { stroke: string; fill: string }> = {
    input: { stroke: "#8b9bb4", fill: "#151a24" },
    store: { stroke: "#35d9a4", fill: "#0d1f1a" },
    compute: { stroke: "#35d9a4", fill: "#0d1f1a" },
    output: { stroke: "#e8b84b", fill: "#211a0c" },
    gate: { stroke: "#f0566a", fill: "#241114" },
  };
  const pos = new Map(build.nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 640 220" className="h-auto w-full" role="img" aria-label={`${build.title} flow`}>
      {build.edges.map((e, i) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        const x1 = a.x + 80;
        const y1 = a.y + 28;
        const x2 = b.x;
        const y2 = b.y + 28;
        const mx = (x1 + x2) / 2;
        return (
          <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke="#2a3342" strokeWidth="1.5" />
        );
      })}
      {build.nodes.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width="160" height="56" rx="10" fill={tone[n.kind].fill} stroke={tone[n.kind].stroke} strokeWidth="1.5" />
          <text x={n.x + 80} y={n.y + 33} textAnchor="middle" fill="#e8ecf4" fontSize="12.5" fontFamily="inherit">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------------- auth ---------------- */

function SignIn({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("individual");

  const demo = (h: string, r: Role) => onSignIn({ handle: h, role: r, email: `${h}@newprotoshell.dev` });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300">newprotoshell</p>
          <h1 className="mt-3 text-[34px] leading-[1.1] font-semibold text-neutral-100">
            A workspace that treats your files like first-class citizens.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">
            Sign in. Touch nothing twice. Vote on builds, bid on tenders, teach from the console, keep your badges close.
          </p>
        </div>
        <form
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!handle.trim()) return;
            onSignIn({ handle: handle.trim().toLowerCase(), role, email: email.trim() || `${handle.trim().toLowerCase()}@newprotoshell.dev` });
          }}
        >
          <label className="block text-[12px] uppercase tracking-widest text-neutral-500">Handle</label>
          <input
            autoFocus
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="ama"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-[15px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
          />
          <label className="mt-4 block text-[12px] uppercase tracking-widest text-neutral-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ama@example.dev"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-[15px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
          />
          <label className="mt-4 block text-[12px] uppercase tracking-widest text-neutral-500">I am a</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg border px-2 py-2 text-[13px] transition-colors ${
                  role === r
                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20"
                }`}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!handle.trim()}
            className="mt-6 w-full rounded-lg bg-emerald-400 py-2.5 text-[15px] font-semibold text-emerald-950 transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-[12px] text-neutral-500">
          demo handles — <button className="text-emerald-300 underline underline-offset-2" onClick={() => demo("ama", "individual")}>ama</button> (individual) ·{" "}
          <button className="text-emerald-300 underline underline-offset-2" onClick={() => demo("kofi", "builder")}>kofi</button> (builder) ·{" "}
          <button className="text-emerald-300 underline underline-offset-2" onClick={() => demo("wanjiru", "teacher")}>wanjiru</button> (teacher)
        </p>
      </div>
    </div>
  );
}

/* ---------------- main shell ---------------- */

type View = "files" | "builds" | "tenders" | "console" | "vault";

const NAV: { id: View; label: string; icon: string; roles: Role[] }[] = [
  { id: "files", label: "Files", icon: "▦", roles: ["individual", "builder", "teacher"] },
  { id: "builds", label: "Builds", icon: "◈", roles: ["individual", "builder", "teacher"] },
  { id: "tenders", label: "Tenders", icon: "❖", roles: ["individual", "builder", "teacher"] },
  { id: "console", label: "Console", icon: "▤", roles: ["teacher"] },
  { id: "vault", label: "Vault", icon: "⚿", roles: ["individual", "builder", "teacher"] },
];

function Shell({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [view, setView] = useState<View>("files");
  const [path, setPath] = useState("/");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [files, setFiles] = useState<Record<string, FsItem[]>>(load("nps-files-v1", FS_SEED));
  const [builds, setBuilds] = useState<Build[]>(load("nps-builds-v1", BUILDS_SEED));
  const [tenders, setTenders] = useState<Tender[]>(load("nps-tenders-v1", TENDERS_SEED));
  const [attendance, setAttendance] = useState<number[]>(load("nps-attend-v1", LEARNERS.map((l) => l.attendance)));
  const [newTender, setNewTender] = useState({ title: "", budget: "" });
  const [newBid, setNewBid] = useState<Record<string, { note: string; price: string }>>({});
  const [note, setNote] = useState("");

  useEffect(() => save("nps-files-v1", files), [files]);
  useEffect(() => save("nps-builds-v1", builds), [builds]);
  useEffect(() => save("nps-tenders-v1", tenders), [tenders]);
  useEffect(() => save("nps-attend-v1", attendance), [attendance]);

  const mySBTs = useMemo(() => {
    const held: string[] = [];
    if (user.role === "builder") held.push("builder-i");
    if (user.role === "teacher") held.push("teacher-i");
    if (builds.some((b) => b.votes.includes(user.handle) && b.stage === "live")) held.push("scholar-i");
    if (tenders.some((t) => t.bids.some((b) => b.builder === user.handle))) held.push("keeper-i");
    return held;
  }, [user, builds, tenders]);

  const nav = NAV.filter((n) => n.roles.includes(user.role));

  const breadcrumb = path === "/" ? ["root"] : path.split("/").filter(Boolean);
  const entries = (files[path] ?? []).filter((f) => f.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
    const k = (x: FsItem) => (x.kind === "folder" ? "0" : "1") + x.name;
    return sortAsc ? k(a).localeCompare(k(b)) : k(b).localeCompare(k(a));
  });

  const open = (item: FsItem) => {
    if (item.kind === "folder") setPath(path === "/" ? `/${item.name}` : `${path}/${item.name}`);
  };
  const up = () => {
    if (path === "/") return;
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    setPath(parts.length ? `/${parts.join("/")}` : "/");
  };
  const toggleVoteBuild = (id: string) =>
    setBuilds((bs) => bs.map((b) => (b.id === id ? { ...b, votes: b.votes.includes(user.handle) ? b.votes.filter((v) => v !== user.handle) : [...b.votes, user.handle] } : b)));
  const toggleVoteBid = (tid: string, builder: string) =>
    setTenders((ts) => ts.map((t) => (t.id === tid ? { ...t, bids: t.bids.map((b) => (b.builder === builder ? { ...b, votes: b.votes.includes(user.handle) ? b.votes.filter((v) => v !== user.handle) : [...b.votes, user.handle] } : b)) } : t)));
  const awardBid = (tid: string, builder: string) =>
    setTenders((ts) => ts.map((t) => (t.id === tid ? { ...t, status: "awarded", bids: t.bids.map((b) => ({ ...b, votes: b.builder === builder ? [...b.votes, `${user.handle} ✦ award`] : b.votes })) } : t)));
  const submitBid = (tid: string) => {
    const d = newBid[tid];
    if (!d || !d.note.trim() || !d.price.trim()) return;
    setTenders((ts) => ts.map((t) => (t.id === tid ? { ...t, bids: [...t.bids, { builder: user.handle, note: d.note, price: d.price, votes: [] }] } : t)));
    setNewBid((nb) => ({ ...nb, [tid]: { note: "", price: "" } }));
  };
  const issueTender = () => {
    if (!newTender.title.trim()) return;
    setTenders((ts) => [...ts, { id: `t-${Date.now()}`, title: newTender.title, issuer: user.handle, budget: newTender.budget || "TBD", status: "open", bids: [] }]);
    setNewTender({ title: "", budget: "" });
  };
  const stageTone = { live: "jade", building: "amber", staged: "ash" } as const;

  const stageAccess = (need: Role) => (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
      <p className="text-[40px]">{need === "teacher" ? "▤" : "⚿"}</p>
      <p className="mt-3 text-lg text-neutral-300">This desk is for {ROLE_LABEL[need].toLowerCase()}s.</p>
      <p className="mt-1 max-w-[36ch] text-[14px] text-neutral-500">
        You signed in as {ROLE_LABEL[user.role].toLowerCase()}. Sign out and walk in as a {ROLE_LABEL[need].toLowerCase()} to open it — one click, no password theatre.
      </p>
      <button onClick={onSignOut} className="mt-5 rounded-lg border border-white/15 px-4 py-2 text-[13px] text-neutral-300 hover:border-emerald-400/60 hover:text-emerald-300">
        Switch role
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* sidebar */}
      <aside className="flex w-[210px] shrink-0 flex-col border-r border-white/[0.07] bg-white/[0.015]">
        <div className="px-5 pt-6 pb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300">newprotoshell</p>
          <p className="mt-1 text-[12px] text-neutral-500">the quiet workspace</p>
        </div>
        <nav className="flex-1 px-3">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] transition-colors ${
                view === n.id ? "bg-emerald-400/10 text-emerald-200" : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
              }`}
            >
              <span className="w-4 text-center text-[13px] opacity-80">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-[12px] font-semibold text-emerald-300">
              {user.handle[0]?.toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-neutral-200">{user.handle}</p>
              <p className="text-[11px] text-neutral-500">{ROLE_LABEL[user.role]}</p>
            </div>
            <button onClick={onSignOut} title="Sign out" className="text-neutral-500 hover:text-rose-300">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-white/[0.07] px-6 py-3.5">
          <div className="flex items-center gap-1.5 text-[13px] text-neutral-500">
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-neutral-700">/</span>}
                <button
                  className={i === breadcrumb.length - 1 ? "text-neutral-200" : "hover:text-emerald-300"}
                  onClick={() => setPath(i === 0 ? "/" : "/" + breadcrumb.slice(1, i + 1).join("/"))}
                >
                  {seg}
                </button>
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search this folder…"
              className="w-[220px] rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[13px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
            />
            <Chip tone="neutral">
              {user.handle} · {ROLE_LABEL[user.role]}
            </Chip>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {view === "files" && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-[22px] font-semibold text-neutral-100">Files</h2>
                <button onClick={up} disabled={path === "/"} className="rounded-lg border border-white/10 px-2.5 py-1 text-[12px] text-neutral-400 hover:border-emerald-400/50 hover:text-emerald-300 disabled:opacity-30">
                  ↑ up
                </button>
                <button onClick={() => setSortAsc((s) => !s)} className="rounded-lg border border-white/10 px-2.5 py-1 text-[12px] text-neutral-400 hover:border-emerald-400/50 hover:text-emerald-300">
                  sort {sortAsc ? "A→Z" : "Z→A"}
                </button>
                <button
                  onClick={() => {
                    const name = `untitled-${Date.now() % 10000}.md`;
                    setFiles((f) => ({ ...f, [path]: [...(f[path] ?? []), { name, kind: "file", size: "0 B", updated: "just now", state: "current" }] }));
                  }}
                  className="rounded-lg bg-emerald-400 px-3 py-1.5 text-[12px] font-semibold text-emerald-950 hover:opacity-90"
                >
                  + new file
                </button>
              </div>
              {entries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                  <p className="text-[28px]">▦</p>
                  <p className="mt-2 text-neutral-400">This folder is a blank sheet. Even blank sheets deserve a title.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-widest text-neutral-500">
                    <span>name</span>
                    <span>size</span>
                    <span>updated</span>
                    <span>state</span>
                  </div>
                  {entries.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => open(f)}
                      className="grid w-full grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 text-left text-[14px] text-neutral-300 transition-colors last:border-0 hover:bg-emerald-400/[0.05]"
                    >
                      <span className="truncate">
                        <span className="mr-2 text-neutral-500">{f.kind === "folder" ? "▸" : "·"}</span>
                        {f.name}
                      </span>
                      <span className="font-mono text-[12px] text-neutral-500">{f.size}</span>
                      <span className="text-[12px] text-neutral-500">{f.updated}</span>
                      <span>
                        <StateChip state={f.state} />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === "builds" && (
            <section>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="text-[22px] font-semibold text-neutral-100">Builds</h2>
                  <p className="mt-1 text-[14px] text-neutral-500">The flow is the file. Vote with your name, not your vibes.</p>
                </div>
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                {builds.map((b) => (
                  <article key={b.id} className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                    <div className="flex items-center gap-3 px-5 pt-4">
                      <h3 className="text-[17px] font-semibold text-neutral-100">{b.title}</h3>
                      <Chip tone={stageTone[b.stage]}>{b.stage}</Chip>
                      <span className="ml-auto text-[12px] text-neutral-500">by {b.author}</span>
                    </div>
                    <p className="px-5 pt-1.5 text-[13.5px] text-neutral-400">{b.blurb}</p>
                    <div className="px-5 py-4">
                      <FlowGraph build={b} />
                    </div>
                    <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-3">
                      <button
                        onClick={() => toggleVoteBuild(b.id)}
                        className={`rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                          b.votes.includes(user.handle)
                            ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
                            : "border-white/10 text-neutral-400 hover:border-emerald-400/50 hover:text-emerald-300"
                        }`}
                      >
                        {b.votes.includes(user.handle) ? "✓ voted" : "▲ vote"}
                      </button>
                      <span className="text-[12.5px] text-neutral-500">
                        {b.votes.length} vote{b.votes.length === 1 ? "" : "s"}
                        {b.votes.length > 0 && ` — ${b.votes.join(", ")}`}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "tenders" && (
            <section>
              <h2 className="text-[22px] font-semibold text-neutral-100">Tenders</h2>
              <p className="mb-5 mt-1 text-[14px] text-neutral-500">Work, posted honestly. Bid well, win clean, get remembered.</p>
              <div className="mb-5 flex gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <input
                  value={newTender.title}
                  onChange={(e) => setNewTender({ ...newTender, title: e.target.value })}
                  placeholder="Issue a tender — e.g. 'Library shelving, 6 schools'"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[13.5px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
                />
                <input
                  value={newTender.budget}
                  onChange={(e) => setNewTender({ ...newTender, budget: e.target.value })}
                  placeholder="Budget"
                  className="w-[130px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[13.5px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
                />
                <button onClick={issueTender} className="rounded-lg bg-emerald-400 px-4 py-2 text-[13px] font-semibold text-emerald-950 hover:opacity-90">
                  Issue
                </button>
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                {tenders.map((t) => (
                  <article key={t.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[16.5px] font-semibold text-neutral-100">{t.title}</h3>
                      <Chip tone={t.status === "open" ? "jade" : t.status === "awarded" ? "amber" : t.status === "evaluation" ? "neutral" : "ash"}>{t.status}</Chip>
                    </div>
                    <p className="mt-1 text-[13px] text-neutral-500">
                      issued by {t.issuer} · <span className="font-mono text-neutral-400">{t.budget}</span>
                    </p>
                    <div className="mt-4 space-y-2">
                      {t.bids.length === 0 && <p className="rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-[13px] text-neutral-500">No bids yet. The room is quiet — for now.</p>}
                      {t.bids.map((b) => (
                        <div key={b.builder} className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[13.5px] font-medium text-neutral-200">{b.builder}</span>
                            <span className="font-mono text-[12px] text-emerald-300">{b.price}</span>
                            <button
                              onClick={() => toggleVoteBid(t.id, b.builder)}
                              className={`ml-auto rounded-md border px-2 py-0.5 text-[11.5px] ${
                                b.votes.includes(user.handle) ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200" : "border-white/10 text-neutral-400 hover:border-emerald-400/50"
                              }`}
                            >
                              {b.votes.includes(user.handle) ? "✓" : "▲"} {b.votes.length}
                            </button>
                            {t.status === "evaluation" && (
                              <button onClick={() => awardBid(t.id, b.builder)} className="rounded-md border border-amber-400/40 px-2 py-0.5 text-[11.5px] text-amber-300 hover:bg-amber-400/10">
                                award
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-[12.5px] text-neutral-500">{b.note}</p>
                        </div>
                      ))}
                    </div>
                    {t.status === "open" && user.role === "builder" && (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={newBid[t.id]?.note ?? ""}
                          onChange={(e) => setNewBid({ ...newBid, [t.id]: { note: e.target.value, price: newBid[t.id]?.price ?? "" } })}
                          placeholder="Your proposal…"
                          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[12.5px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
                        />
                        <input
                          value={newBid[t.id]?.price ?? ""}
                          onChange={(e) => setNewBid({ ...newBid, [t.id]: { price: e.target.value, note: newBid[t.id]?.note ?? "" } })}
                          placeholder="Price"
                          className="w-[100px] rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[12.5px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
                        />
                        <button onClick={() => submitBid(t.id)} className="rounded-lg bg-emerald-400 px-3 py-1.5 text-[12px] font-semibold text-emerald-950 hover:opacity-90">
                          Bid
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "console" && (
            user.role === "teacher" ? (
              <section>
                <h2 className="text-[22px] font-semibold text-neutral-100">School Console</h2>
                <p className="mb-5 mt-1 text-[14px] text-neutral-500">Marks left empty are unknown — not zero. Never confuse the two.</p>
                <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] gap-2 border-b border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-widest text-neutral-500">
                    <span>learner</span>
                    <span>form</span>
                    <span>attendance</span>
                    <span>maths</span>
                    <span>english</span>
                    <span>science</span>
                    <span>signal</span>
                  </div>
                  {LEARNERS.map((l, i) => {
                    const marks = [l.maths, l.english, l.science].filter((m) => m !== null) as number[];
                    const avg = marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : null;
                    return (
                      <div key={l.name} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 text-[13.5px] text-neutral-300 last:border-0">
                        <span className="font-medium text-neutral-200">{l.name}</span>
                        <span className="text-neutral-500">{l.form}</span>
                        <span className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={attendance[i]}
                            onChange={(e) => setAttendance((a) => a.map((v, j) => (j === i ? Number(e.target.value) : v)))}
                            className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-400"
                          />
                          <span className="font-mono text-[12px] text-neutral-400">{attendance[i]}%</span>
                        </span>
                        {[l.maths, l.english, l.science].map((m, j) => (
                          <span key={j} className={m === null ? "italic text-neutral-600" : "font-mono text-[12.5px]"}>
                            {m === null ? "unknown" : m}
                          </span>
                        ))}
                        <span>
                          {avg === null ? (
                            <Chip tone="ash">no data</Chip>
                          ) : attendance[i] < 80 ? (
                            <Chip tone="red">watch · avg {avg}</Chip>
                          ) : (
                            <Chip tone="jade">avg {avg}</Chip>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Console note — e.g. 'Ama to represent school at science fair'"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[13px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
                  />
                  <button onClick={() => setNote("")} className="rounded-lg bg-emerald-400 px-4 py-2 text-[13px] font-semibold text-emerald-950 hover:opacity-90">
                    File
                  </button>
                </div>
              </section>
            ) : (
              stageAccess("teacher")
            )
          )}

          {view === "vault" && (
            <section>
              <h2 className="text-[22px] font-semibold text-neutral-100">Vault</h2>
              <p className="mb-5 mt-1 text-[14px] text-neutral-500">Soulbound tokens — earned, bound, and quietly proud. They cannot be bought, only deserved.</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {SBT_CATALOG.map((s) => {
                  const held = mySBTs.includes(s.id);
                  const icons: Record<string, string> = { hammer: "🔨", anvil: "⚒", book: "📖", scroll: "📜", key: "🗝" };
                  return (
                    <div key={s.id} className={`rounded-2xl border p-5 ${held ? "border-emerald-400/40 bg-emerald-400/[0.05]" : "border-white/[0.07] bg-white/[0.02] opacity-60"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-[26px]">{icons[s.icon]}</span>
                        <div>
                          <p className="text-[15.5px] font-semibold text-neutral-100">{s.name}</p>
                          {held && <Chip tone="jade">bound to {user.handle}</Chip>}
                        </div>
                      </div>
                      <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">{held ? s.desc : `Locked — ${s.desc}`}</p>
                    </div>
                  );
                })}
              </div>
              {note === "" && mySBTs.length === 0 && (
                <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-3 text-[13px] text-neutral-500">
                  The vault echoes. Vote on a build or place a bid — the shell notices.
                </p>
              )}
            </section>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-white/[0.06] px-6 py-2.5 text-[11.5px] text-neutral-600">
          <span>newprotoshell — files are citizens, not luggage</span>
          <span className="font-mono">φ · 1 : 1.618</span>
        </footer>
      </main>
    </div>
  );
}

/* ---------------- app ---------------- */

export default function App() {
  const [user, setUser] = useState<User | null>(() => load<User | null>("nps-session-v1", null));
  useEffect(() => {
    if (user) save("nps-session-v1", user);
    else localStorage.removeItem("nps-session-v1");
  }, [user]);
  return user ? <Shell user={user} onSignOut={() => setUser(null)} /> : <SignIn onSignIn={setUser} />;
}
