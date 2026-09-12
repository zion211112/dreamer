"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BuildCard from "../../../components/BuildCard";
import {
  Build,
  BuildFile,
  BuildNeeds,
  DOMAINS,
  MAX_ATTACH_BYTES,
  SEED_BUILDS,
  Visibility,
  allMembers,
  loadBuilds,
  memberByUsername,
  myUsername,
  persistBuilds,
  stripUrls,
  tierOf,
  validateBuild
} from "../../../lib/benben";

const DRAFT_KEY = "aptlabs-benben-draft-v1";
const AREAS = ["Kagio", "Mwea", "Kerugoya", "Embu", "Sagana", "Mugumo"];

type Persona = "dreamer" | "dropout" | "grad" | "babylon" | "politician";
const PERSONAS: { id: Persona; label: string; hint: string }[] = [
  { id: "dreamer", label: "Dreamer", hint: "Name the dream plainly. Proof beats polish." },
  { id: "dropout", label: "Dropout", hint: "Speak plain. Broken Swahili is allowed. Proof beats grammar." },
  { id: "grad", label: "Graduate", hint: "Show the skill. Cite one thing you can already do." },
  { id: "babylon", label: "Hustla in Babylon", hint: "One thumb, short lines. Time is money — say it fast." },
  { id: "politician", label: "Leader", hint: "No promises. Name what YOU bring — funds, labor, site. The floor downvotes posters." }
];

const TYPE_META: { id: string; label: string; consequence: string }[] = [
  { id: "NEED", label: "NEED", consequence: "I lack something — needs required" },
  { id: "OFFER", label: "OFFER", consequence: "I can do / give — contact required" },
  { id: "SOLUTION", label: "SOLUTION", consequence: "Already works — copy me. Needs auto-set to Nothing" },
  { id: "FAILURE", label: "FAILURE", consequence: "It broke — say what you would do different" },
  { id: "QUESTION", label: "?", consequence: "Ask — Done becomes what a good answer looks like" }
];

const PLACEHOLDER: Record<string, { broke: string; have: string; need: string; done: string }> = {
  NEED: { broke: "Canal gate in Kagio rusted through, water escapes.", have: "Two hands, one welding rod, a borrowed grinder.", need: "A welder for one afternoon + 6 rods.", done: "Gate welded shut and canal holding for 30 days" },
  OFFER: { broke: "KCSE candidates failing matrices.", have: "I can animate 3-minute explainers.", need: "Which topics hurt most — tell me in comments.", done: "10 explainers posted, 100 candidates watched" },
  SOLUTION: { broke: "Fired brick costs too much here.", have: "Tested soil-block recipe, 6 months, two rainy seasons.", need: "Nothing — already built. Copy the ratios.", done: "Blocks pass county standard at 40% less cost" },
  FAILURE: { broke: "Our first chicken run died in week three.", have: "Notes on feed, heat, spacing.", need: "What would you do different?", done: "Second run alive past 60 days" },
  QUESTION: { broke: "How do I price a 3-minute explainer?", have: "I can animate, never sold one.", need: "Real numbers from people who have sold.", done: "A good answer names a price + one buyer" }
};

function loadDraft(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw);
    return p && typeof p === "object" ? p : {};
  } catch { return {}; }
}

// Composer v4: 4 fires — WHO / WHAT KIND / SAY IT / PROVE + SEAL.
// TYPE > DONE > TITLE > BODY > NEEDS > PROOF > SEAL. Live preview is law.
export default function NewBuild() {
  const router = useRouter();
  const [me, setMe] = useState("");
  const [myTier, setMyTier] = useState<"visitor" | "certified" | "hall">("visitor");
  const [persona, setPersona] = useState<Persona>("dreamer");
  const [type, setType] = useState("NEED");
  const [done, setDone] = useState("");
  const [title, setTitle] = useState("");
  const [broke, setBroke] = useState("");
  const [have, setHave] = useState("");
  const [need, setNeed] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [needs, setNeeds] = useState<BuildNeeds>({ labor: 0, materials: "", funds: 0, intellect: "", nothing: false });
  const [laborOn, setLaborOn] = useState(false);
  const [matsOn, setMatsOn] = useState(false);
  const [fundsOn, setFundsOn] = useState(false);
  const [intelOn, setIntelOn] = useState(false);
  const [laborN, setLaborN] = useState("4");
  const [fundsN, setFundsN] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState<"dm" | "wa">("dm");
  const [wa, setWa] = useState("");
  const [vis, setVis] = useState<Visibility>("public");
  const [files, setFiles] = useState<BuildFile[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const u = myUsername() || "";
    setMe(u);
    const all = allMembers();
    setMyTier(tierOf(u || null, (x) => memberByUsername(all, x)));
    const d = loadDraft();
    if (d.title) setTitle(d.title);
    if (d.broke) setBroke(d.broke);
    if (d.have) setHave(d.have);
    if (d.need) setNeed(d.need);
    if (d.done) setDone(d.done);
    if (d.domain && DOMAINS.includes(d.domain)) setDomain(d.domain);
    if (d.type && TYPE_META.some((t) => t.id === d.type)) setType(d.type);
    if (d.location) setLocation(d.location);
    if (d.contact === "dm" || d.contact === "wa") setContact(d.contact);
    if (d.vis === "public" || d.vis === "hall8" || d.vis === "private") setVis(d.vis);
    if (d.persona && PERSONAS.some((p) => p.id === d.persona)) setPersona(d.persona as Persona);
    if (d.laborN) setLaborN(d.laborN);
    if (d.fundsN) setFundsN(d.fundsN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
        title, broke, have, need, done, domain, type, location, contact, vis, persona, laborN, fundsN
      }));
    } catch { /* draft lost, dream kept in memory */ }
  }, [title, broke, have, need, done, domain, type, location, contact, vis, persona, laborN, fundsN]);

  // SOLUTION auto-sets Nothing; leaving SOLUTION restores the toggles.
  useEffect(() => {
    if (type === "SOLUTION") {
      setNeeds({ labor: 0, materials: "", funds: 0, intellect: "", nothing: true });
      setLaborOn(false); setMatsOn(false); setFundsOn(false); setIntelOn(false);
    } else {
      setNeeds((n) => (n.nothing ? { ...n, nothing: false } : n));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function enableNothing() {
    setNeeds({ labor: 0, materials: "", funds: 0, intellect: "", nothing: true });
    setLaborOn(false); setMatsOn(false); setFundsOn(false); setIntelOn(false);
  }

  const body = useMemo(() => {
    const parts: string[] = [];
    if (broke.trim()) parts.push(`BROKE: ${broke.trim()}`);
    if (have.trim()) parts.push(`HAVE: ${have.trim()}`);
    if (need.trim()) parts.push(`NEED: ${need.trim()}`);
    return parts.join("\n");
  }, [broke, have, need]);

  const words = body.split(/\s+/).filter(Boolean).length;

  const cleanNeeds: BuildNeeds = useMemo(() => ({
    labor: laborOn ? Number(laborN) || 0 : 0,
    materials: matsOn ? stripUrls(needs.materials).slice(0, 140) : "",
    funds: fundsOn ? Number(fundsN) || 0 : 0,
    intellect: intelOn ? stripUrls(needs.intellect).slice(0, 140) : "",
    nothing: needs.nothing
  }), [laborOn, laborN, matsOn, needs.materials, fundsOn, fundsN, intelOn, needs.intellect, needs.nothing]);

  const bad = useMemo(() => validateBuild({
    title: title.trim().slice(0, 89),
    body: stripUrls(body).slice(0, 4000),
    done: done.trim().slice(0, 144),
    needs: cleanNeeds
  }), [title, body, done, cleanNeeds]);

  const waBad = contact === "wa" && wa.replace(/\D/g, "").length < 9;
  const filesLoading = files.some((f) => !f.dataUrl);
  const canSubmit = !bad && !waBad && !filesLoading;

  const politicianNudge = persona === "politician" && type === "NEED" && cleanNeeds.funds <= 0 && !cleanNeeds.intellect.trim();

  const preview: Build = useMemo(() => ({
    id: "PREVIEW",
    by: me || "you",
    title: title.trim() || "Your title lands here, bold, exactly as the floor votes it.",
    body: body || "BROKE / HAVE / NEED land here as you type.",
    domain,
    type,
    needs: cleanNeeds,
    location: location.trim(),
    done: done.trim() || "Done = ? lands here.",
    contact,
    waRequests: [],
    votes: 0,
    votedBy: {},
    comments: [],
    visibility: vis,
    attachments: [],
    createdTs: Date.now(),
    tierAtPost: myTier
  }), [me, title, body, domain, type, cleanNeeds, location, done, contact, vis, myTier]);

  const ph = PLACEHOLDER[type] || PLACEHOLDER.NEED;
  const field = "w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-teal-300";
  const errField = "border-red-800 focus:border-red-500";
  const label = "font-mono text-[11px] font-bold uppercase tracking-wider text-muted";
  const stepShell = "rounded-3xl border border-white/10 bg-panel p-5 md:p-7";
  const pill = (on: boolean) => `min-h-[44px] rounded-full px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider transition ${on ? "bb-btn" : "border border-white/15 text-muted hover:border-teal-300 hover:text-ivory"}`;

  function compressImage(f: File): Promise<{ dataUrl: string; size: number }> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        try {
          const max = 1280;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          if (!ctx) throw new Error("no ctx");
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = c.toDataURL("image/jpeg", 0.8);
          URL.revokeObjectURL(url);
          resolve({ dataUrl, size: Math.round((dataUrl.length * 3) / 4) });
        } catch {
          URL.revokeObjectURL(url);
          const reader = new FileReader();
          reader.onload = () => resolve({ dataUrl: String(reader.result || ""), size: f.size });
          reader.readAsDataURL(f);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: String(reader.result || ""), size: f.size });
        reader.readAsDataURL(f);
      };
      img.src = url;
    });
  }

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const cur = files.reduce((n, f) => n + f.size, 0);
    let total = cur;
    const next: BuildFile[] = [];
    for (const f of Array.from(list)) {
      const isImg = f.type.startsWith("image/");
      const got = isImg ? await compressImage(f) : await new Promise<{ dataUrl: string; size: number }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: String(reader.result || ""), size: f.size });
        reader.readAsDataURL(f);
      });
      if (total + got.size > MAX_ATTACH_BYTES) {
        setErr("That would pass 1 MB total. The browser carries what it can — big files stay on your device.");
        break;
      }
      total += got.size;
      next.push({ name: f.name.slice(0, 80), size: got.size, type: isImg ? "image/jpeg" : f.type, dataUrl: got.dataUrl });
      setErr("");
    }
    if (next.length > 0) {
      setFiles((prev) => {
        const known = new Set(prev.map((p) => `${p.name}-${p.size}`));
        return [...prev, ...next.filter((n) => !known.has(`${n.name}-${n.size}`))];
      });
    }
  }

  function post(e: React.FormEvent) {
    e.preventDefault();
    const b = {
      title: title.trim().slice(0, 89),
      body: stripUrls(body).slice(0, 4000),
      done: done.trim().slice(0, 144),
      needs: cleanNeeds
    };
    const v = validateBuild(b);
    if (v) { setErr(v); return; }
    if (filesLoading) { setErr("Files still loading — breathe, then post."); return; }
    if (files.reduce((n, f) => n + f.size, 0) > MAX_ATTACH_BYTES) { setErr("Attachments pass 1 MB total. Drop the heaviest and try again."); return; }
    if (contact === "wa" && wa.replace(/\D/g, "").length < 9) {
      setErr("WhatsApp mode needs your number — it stays sealed until you accept a request.");
      return;
    }
    const stored = loadBuilds();
    const ids = new Set(stored.map((x) => x.id));
    const all: Build[] = [...stored, ...SEED_BUILDS.filter((s) => !ids.has(s.id))];
    let id = "";
    for (let i = 0; i < 20; i++) {
      const cand = "BB-" + String(Math.floor(10 + Math.random() * 89)) + "-" + Date.now().toString(36).slice(-3).toUpperCase();
      if (!all.some((x) => x.id === cand)) { id = cand; break; }
    }
    if (!id) { setErr("The floor hiccuped. Try again."); return; }
    const build: Build = {
      id,
      by: me,
      title: b.title,
      body: b.body,
      domain,
      type,
      needs: cleanNeeds,
      location: location.trim().slice(0, 60),
      done: b.done,
      contact,
      wa: contact === "wa" ? wa.replace(/\D/g, "").slice(-12) : undefined,
      waRequests: [],
      votes: 0,
      votedBy: {},
      comments: [],
      visibility: vis,
      attachments: files,
      createdTs: Date.now(),
      tierAtPost: myTier
    };
    persistBuilds([build, ...all]);
    try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* draft already gone */ }
    router.push(`/benben/post/${id}`);
  }

  const kb = files.reduce((n, f) => n + f.size, 0) / 1024;

  return (
    <main className="bg-obsidian text-ivory min-h-screen">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Submit your dream.</h1>
          <button onClick={() => router.back()} className="font-mono text-sm text-muted hover:text-ivory" aria-label="Close">[X]</button>
        </div>
        <p className="mt-2 text-sm text-muted">Posting as <span className="font-mono text-teal-300">@{me || "…"}</span> · draft saves as you type.</p>

        <nav aria-label="Composer steps" className="sticky top-0 z-20 -mx-4 md:-mx-6 mt-6 border-y border-white/10 bg-obsidian/95 px-4 md:px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-4 font-mono text-[11px] font-bold uppercase tracking-wider">
            <a href="#step1" className="text-teal-300 hover:text-ivory">1 · Who</a>
            <a href="#step2" className="text-teal-300 hover:text-ivory">2 · Kind</a>
            <a href="#step3" className="text-teal-300 hover:text-ivory">3 · Say it</a>
            <a href="#step4" className="text-teal-300 hover:text-ivory">4 · Prove + Seal</a>
          </div>
        </nav>

        <form onSubmit={post} className="mt-6 grid gap-5 lg:grid-cols-[1.618fr_1fr]">
          <div className="space-y-5">
            <section id="step1" className={stepShell} aria-label="Step 1: who brings this">
              <div className={label}>1 · Who brings this? (helper only — never stored)</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PERSONAS.map((p) => (
                  <button type="button" key={p.id} aria-pressed={persona === p.id} onClick={() => setPersona(p.id)} className={pill(persona === p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted">{PERSONAS.find((p) => p.id === persona)?.hint}</p>
            </section>

            <section id="step2" className={stepShell} aria-label="Step 2: what kind">
              <div className={label}>2 · What kind? Pick first</div>
              <div className="mt-3 grid gap-2">
                {TYPE_META.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    aria-pressed={type === t.id}
                    onClick={() => setType(t.id)}
                    className={`min-h-[44px] rounded-2xl border px-4 py-3 text-left transition ${type === t.id ? "border-teal-300 bg-teal-400/10" : "border-white/10 bg-obsidian hover:border-teal-300/50"}`}
                  >
                    <div className={`text-sm font-bold ${type === t.id ? "text-teal-200" : "text-ivory/85"}`}>{t.label}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted">{t.consequence}</div>
                  </button>
                ))}
              </div>
              {politicianNudge && (
                <p className="mt-3 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                  Leaders post OFFERs. What do you bring — funds, labor, site?
                </p>
              )}
              <div className="mt-4">
                <div className={label}>Domain — pick one</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DOMAINS.map((d) => (
                    <button type="button" key={d} aria-pressed={domain === d} onClick={() => setDomain(d)} className={pill(domain === d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section id="step3" className={stepShell} aria-label="Step 3: say it">
              <div className={label}>3 · Say it — the vote zone</div>

              <div className="mt-4">
                <label className={label} htmlFor="bb-done">Done = ? — required ({done.length}/144)</label>
                <input id="bb-done" value={done} onChange={(e) => setDone(e.target.value)} placeholder={ph.done} maxLength={144} className={`${field} mt-2`} />
                <p className="mt-1.5 font-mono text-[11px] text-muted">Good: “{ph.done}”. Bad: “Help us please.”</p>
              </div>

              <div className="mt-4">
                <label className={label} htmlFor="bb-title">Title — required ({title.length}/89)</label>
                <input id="bb-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Welding help needed for Kagio canal gate" maxLength={89} className={`${field} mt-2`} />
              </div>

              <div className="mt-4 grid gap-2">
                <div>
                  <label className={label} htmlFor="bb-broke">What broke? — one line</label>
                  <input id="bb-broke" value={broke} onChange={(e) => setBroke(e.target.value)} placeholder={ph.broke} maxLength={280} className={`${field} mt-2`} />
                </div>
                <div>
                  <label className={label} htmlFor="bb-have">What you have? — one line</label>
                  <input id="bb-have" value={have} onChange={(e) => setHave(e.target.value)} placeholder={ph.have} maxLength={280} className={`${field} mt-2`} />
                </div>
                <div>
                  <label className={label} htmlFor="bb-need">What you need? — one line</label>
                  <input id="bb-need" value={need} onChange={(e) => setNeed(e.target.value)} placeholder={ph.need} maxLength={280} className={`${field} mt-2`} />
                </div>
                <p className={`font-mono text-[11px] ${words > 500 ? "text-red-400" : "text-muted"}`}>
                  {words}/500 words · No links. The floor is text.
                </p>
              </div>
            </section>

            <section id="step4" className={stepShell} aria-label="Step 4: prove and seal">
              <div className={label}>4 · Prove + Seal</div>

              <div className="mt-4">
                <div className={label}>What it needs {type === "NEED" ? "— required" : "— optional"}</div>
                <div className="mt-2 space-y-2">
                  <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm">
                    <input type="checkbox" checked={laborOn} onChange={(e) => { setLaborOn(e.target.checked); setNeeds((n) => ({ ...n, nothing: false })); }} className="h-4 w-4 accent-[#2dd4bf]" aria-label="Needs labor" />
                    <span className="w-20 shrink-0">[hands]</span>
                    {laborOn && <input value={laborN} onChange={(e) => setLaborN(e.target.value)} placeholder="How many hands?" inputMode="numeric" className="w-32 rounded-xl border border-white/15 bg-panel px-3 py-2 text-sm outline-none focus:border-teal-300" />}
                  </label>
                  <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm">
                    <input type="checkbox" checked={matsOn} onChange={(e) => { setMatsOn(e.target.checked); setNeeds((n) => ({ ...n, nothing: false })); }} className="h-4 w-4 accent-[#2dd4bf]" aria-label="Needs materials" />
                    <span className="w-20 shrink-0">[box]</span>
                    {matsOn && <input value={needs.materials} onChange={(e) => setNeeds({ ...needs, materials: e.target.value })} placeholder="List the materials?" className="flex-1 rounded-xl border border-white/15 bg-panel px-3 py-2 text-sm outline-none focus:border-teal-300" />}
                  </label>
                  <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm">
                    <input type="checkbox" checked={fundsOn} onChange={(e) => { setFundsOn(e.target.checked); setNeeds((n) => ({ ...n, nothing: false })); }} className="h-4 w-4 accent-[#2dd4bf]" aria-label="Needs funds" />
                    <span className="w-20 shrink-0">[KES]</span>
                    {fundsOn && <input value={fundsN} onChange={(e) => setFundsN(e.target.value)} placeholder="KES?" inputMode="numeric" className="w-32 rounded-xl border border-white/15 bg-panel px-3 py-2 text-sm outline-none focus:border-teal-300" />}
                  </label>
                  <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm">
                    <input type="checkbox" checked={intelOn} onChange={(e) => { setIntelOn(e.target.checked); setNeeds((n) => ({ ...n, nothing: false })); }} className="h-4 w-4 accent-[#2dd4bf]" aria-label="Needs intellect" />
                    <span className="w-20 shrink-0">[brain]</span>
                    {intelOn && <input value={needs.intellect} onChange={(e) => setNeeds({ ...needs, intellect: e.target.value })} placeholder="What kind of brains?" className="flex-1 rounded-xl border border-white/15 bg-panel px-3 py-2 text-sm outline-none focus:border-teal-300" />}
                  </label>
                  <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm">
                    <input type="radio" checked={needs.nothing} onChange={enableNothing} className="h-4 w-4 accent-[#2dd4bf]" aria-label="Nothing, already built" />
                    Nothing — already built, just showing it
                  </label>
                </div>
                {bad && <p className="mt-2 font-mono text-[11px] text-red-400">{bad}</p>}
              </div>

              <div className="mt-4">
                <label className={label} htmlFor="bb-loc">Location (optional — doubles votes)</label>
                <input id="bb-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kagio, Mwea" maxLength={60} list="bb-areas" className={`${field} mt-2`} />
                <datalist id="bb-areas">
                  {AREAS.map((a) => <option key={a} value={a} />)}
                </datalist>
              </div>

              <div className="mt-4">
                <div className={label}>
                  Proof {files.length > 0 && <span className="text-teal-300">· {kb.toFixed(0)} KB / 1024 KB</span>}
                </div>
                <label className="mt-2 block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-obsidian px-4 py-5 text-center transition hover:border-teal-300/60">
                  <span className="text-sm text-muted">Photo of gate, not poster. Images compress on your phone.</span>
                  <input type="file" multiple accept="image/*,.pdf,.txt,.md,.csv" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </label>
                {files.length > 0 && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${Math.min(100, (kb / 1024) * 100)}%` }} />
                  </div>
                )}
                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((f) => (
                      <div key={`${f.name}-${f.size}`} className="flex items-center justify-between gap-3 rounded-xl bg-obsidian px-3 py-2 text-sm">
                        <span className="truncate font-mono text-xs text-ivory/85">{f.name || "(loading…)"} <span className="text-dim">· {(f.size / 1024).toFixed(0)} KB</span></span>
                        <button type="button" onClick={() => setFiles(files.filter((x) => x !== f))} className="shrink-0 font-mono text-xs text-muted hover:text-ivory" aria-label={`Remove ${f.name}`}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className={label}>Who sees this</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([
                    ["public", "Public", "the whole floor votes"],
                    ["hall8", "Hall 8", "ask elders, no votes"],
                    ["private", "Only me", "diary, no one sees"]
                  ] as [Visibility, string, string][]).map(([v, l, sub]) => (
                    <button
                      type="button"
                      key={v}
                      aria-pressed={vis === v}
                      onClick={() => setVis(v)}
                      className={`min-h-[44px] rounded-2xl border px-3 py-3 text-left transition ${vis === v ? "border-teal-300 bg-teal-400/10" : "border-white/10 bg-obsidian hover:border-teal-300/50"}`}
                    >
                      <div className={`text-sm font-bold ${vis === v ? "text-teal-200" : "text-ivory/80"}`}>{l}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted">{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className={label}>How do forkers reach you?</div>
                <div className="mt-2 space-y-2">
                  <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm">
                    <input type="radio" checked={contact === "dm"} onChange={() => setContact("dm")} className="h-4 w-4 accent-[#2dd4bf]" />
                    Talk here (safe) <span className="text-muted">— number stays sealed</span>
                  </label>
                  <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-obsidian px-4 py-3 text-sm">
                    <input type="radio" checked={contact === "wa"} onChange={() => setContact("wa")} className="h-4 w-4 accent-[#2dd4bf]" />
                    WhatsApp on request
                  </label>
                  {contact === "wa" && (
                    <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="07… — sealed until YOU accept a request" inputMode="tel" className={`${field} ${waBad ? errField : ""}`} />
                  )}
                  {waBad && <p className="font-mono text-[11px] text-red-400">WhatsApp mode needs your number — it stays sealed until you accept a request.</p>}
                </div>
              </div>
            </section>

            {err && <p className="rounded-2xl bg-red-950/40 border border-red-900 p-4 text-sm text-red-300">{err}</p>}
            {!canSubmit && !err && bad && <p className="font-mono text-[11px] text-muted">Fix the red line above — the fire stays unlit until it reads clean.</p>}
            <button disabled={!canSubmit} className="w-full rounded-full bb-btn py-4 text-sm font-bold transition disabled:opacity-40" style={{ height: 55 }}>
              Light the fire →
            </button>
            <p className="text-center font-mono text-[11px] text-muted">Playground 72h live. Certified 7 days. Votes = forks, not likes.</p>
          </div>

          <aside className="lg:sticky lg:top-20 h-fit" aria-label="Live preview">
            <div className={label}>Live preview — what the floor votes</div>
            <div className="mt-3">
              <BuildCard
                b={preview}
                now={Date.now()}
                tier={myTier}
                myVote={0}
                voteErr={null}
                onVote={() => {}}
                onNominate={() => {}}
                canNominate={false}
                detailLink={false}
              />
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
