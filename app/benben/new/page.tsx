"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BENBEN_KEY,
  Build,
  BuildFile,
  BuildNeeds,
  DOMAINS,
  MAX_ATTACH_BYTES,
  SEED_BUILDS,
  TYPES,
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

// The sacred area. Every post is a build — an MVP, a company, an invention.
// Name the dream plainly, seal who may see it, attach what proves it.
export default function NewBuild() {
  const router = useRouter();
  const [me, setMe] = useState("");
  const [myTier, setMyTier] = useState<"visitor" | "certified" | "hall">("visitor");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [type, setType] = useState("NEED");
  const [needs, setNeeds] = useState<BuildNeeds>({ labor: 0, materials: "", funds: 0, intellect: "", nothing: false });
  const [laborN, setLaborN] = useState("4");
  const [fundsN, setFundsN] = useState("");
  const [location, setLocation] = useState("");
  const [done, setDone] = useState("");
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
  }, []);

  function toggleNothing() {
    setNeeds((n) => ({ ...n, nothing: !n.nothing }));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const cur = files.reduce((n, f) => n + f.size, 0);
    let total = cur;
    for (const f of Array.from(list)) {
      if (total + f.size > MAX_ATTACH_BYTES) {
        setErr(`That would pass 1 MB total. The browser carries what it can — big files stay on your device.`);
        break;
      }
      total += f.size;
      const reader = new FileReader();
      reader.onload = () => {
        setFiles((prev) => {
          if (prev.some((p) => p.name === f.name && p.size === f.size)) return prev;
          return [...prev, { name: f.name.slice(0, 80), size: f.size, type: f.type, dataUrl: String(reader.result || "") }];
        });
      };
      reader.readAsDataURL(f);
    }
    setErr("");
  }

  function post(e: React.FormEvent) {
    e.preventDefault();
    const clean: BuildNeeds = {
      labor: needs.labor > 0 ? needs.labor : 0,
      materials: stripUrls(needs.materials).slice(0, 140),
      funds: needs.funds > 0 ? needs.funds : 0,
      intellect: stripUrls(needs.intellect).slice(0, 140),
      nothing: needs.nothing
    };
    const b = {
      title: title.trim().slice(0, 120),
      body: stripUrls(body).slice(0, 4000),
      done: done.trim().slice(0, 200),
      needs: clean
    };
    const bad = validateBuild(b);
    if (bad) { setErr(bad); return; }
    if (files.some((f) => !f.dataUrl)) { setErr("Files still loading — breathe, then post."); return; }
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
      needs: clean,
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
    router.push(`/benben/post/${id}`);
  }

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const field = "w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-teal-300";

  return (
    <main className="bg-obsidian text-ivory min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-teal-300">The sacred area</p>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-semibold">Submit your dream.</h1>
          </div>
          <button onClick={() => router.back()} className="font-mono text-sm text-muted hover:text-ivory" aria-label="Close">[X]</button>
        </div>
        <p className="mt-2 text-sm text-muted">Every post is a build — an MVP, a company, an invention. Name it plainly. Posting as <span className="font-mono text-teal-300">@{me}</span>.</p>

        <form onSubmit={post} className="mt-6 space-y-5">
          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Title ({title.length}/89)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Welding help needed for Kagio canal gate" maxLength={120} className={`${field} mt-2`} />
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Body ({words}/500 words, text only)</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="What broke, what you have, what you need…" className={`${field} mt-2`} />
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Domain — pick one</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <button type="button" key={d} onClick={() => setDomain(d)} className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase transition ${domain === d ? "bg-teal-400/15 text-teal-200 border border-teal-300" : "border border-white/15 text-muted hover:border-teal-300"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Type — pick one</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button type="button" key={t} onClick={() => setType(t)} className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase transition ${type === t ? "bb-btn" : "border border-white/15 text-muted hover:border-teal-300"}`}>
                  {t === "QUESTION" ? "?" : t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">What it needs</label>
            <div className="mt-2 space-y-2 rounded-2xl border border-white/10 bg-panel p-4">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.labor > 0} onChange={(e) => setNeeds({ ...needs, labor: e.target.checked ? Number(laborN) || 1 : 0 })} className="h-4 w-4 accent-[#2dd4bf]" />
                <span className="w-20">Labor</span>
                {needs.labor > 0 && <input value={laborN} onChange={(e) => { setLaborN(e.target.value); setNeeds({ ...needs, labor: Number(e.target.value) || 0 }); }} placeholder="How many?" inputMode="numeric" className="w-28 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-teal-300" />}
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.materials.trim().length > 0} onChange={(e) => setNeeds({ ...needs, materials: e.target.checked ? needs.materials || " " : "" })} className="h-4 w-4 accent-[#2dd4bf]" />
                <span className="w-20">Materials</span>
                <input value={needs.materials} onChange={(e) => setNeeds({ ...needs, materials: e.target.value })} placeholder="List?" className="flex-1 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-teal-300" />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.funds > 0} onChange={(e) => setNeeds({ ...needs, funds: e.target.checked ? Number(fundsN) || 1 : 0 })} className="h-4 w-4 accent-[#2dd4bf]" />
                <span className="w-20">Funds</span>
                {needs.funds > 0 && <input value={fundsN} onChange={(e) => { setFundsN(e.target.value); setNeeds({ ...needs, funds: Number(e.target.value) || 0 }); }} placeholder="KES?" inputMode="numeric" className="w-32 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-teal-300" />}
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.intellect.trim().length > 0} onChange={(e) => setNeeds({ ...needs, intellect: e.target.checked ? needs.intellect || " " : "" })} className="h-4 w-4 accent-[#2dd4bf]" />
                <span className="w-20">Intellect</span>
                <input value={needs.intellect} onChange={(e) => setNeeds({ ...needs, intellect: e.target.value })} placeholder="What kind?" className="flex-1 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-teal-300" />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.nothing} onChange={toggleNothing} className="h-4 w-4 accent-[#2dd4bf]" />
                <span>Nothing — already built, just showing it</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Location (optional)</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kagio, Mwea" maxLength={60} className={`${field} mt-2`} />
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">What done looks like — one sentence, required ({done.length}/144)</label>
            <input value={done} onChange={(e) => setDone(e.target.value)} placeholder="Gate welded shut and canal holding for 30 days" maxLength={200} className={`${field} mt-2`} />
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Who sees this</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([
                ["public", "Public", "the whole floor"],
                ["hall8", "Hall 8 only", "admin review"],
                ["private", "Only me", "sealed"]
              ] as [Visibility, string, string][]).map(([v, label, sub]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVis(v)}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${vis === v ? "border-teal-300 bg-teal-400/10" : "border-white/10 bg-panel hover:border-teal-300/50"}`}
                >
                  <div className={`text-sm font-bold ${vis === v ? "text-teal-200" : "text-ivory/80"}`}>{label}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
              Attach files {files.length > 0 && <span className="text-teal-300">· {(files.reduce((n, f) => n + f.size, 0) / 1024).toFixed(0)} KB / 1024 KB</span>}
            </label>
            <label className="mt-2 block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-panel px-4 py-5 text-center transition hover:border-teal-300/60">
              <span className="text-sm text-muted">Drawings, photos, one-pagers — proof, not decoration.</span>
              <input type="file" multiple accept="image/*,.pdf,.txt,.md,.csv" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </label>
            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((f) => (
                  <div key={`${f.name}-${f.size}`} className="flex items-center justify-between gap-3 rounded-xl bg-panel px-3 py-2 text-sm">
                    <span className="truncate font-mono text-xs text-ivory/85">{f.name || "(loading…)"} <span className="text-dim">· {(f.size / 1024).toFixed(0)} KB</span></span>
                    <button type="button" onClick={() => setFiles(files.filter((x) => x !== f))} className="shrink-0 font-mono text-xs text-muted hover:text-ivory" aria-label={`Remove ${f.name}`}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Contact</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-panel px-4 py-3 text-sm">
                <input type="radio" checked={contact === "dm"} onChange={() => setContact("dm")} className="h-4 w-4 accent-[#2dd4bf]" />
                DM on BenBen <span className="text-muted">— talk in the comments, number stays sealed</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-panel px-4 py-3 text-sm">
                <input type="radio" checked={contact === "wa"} onChange={() => setContact("wa")} className="h-4 w-4 accent-[#2dd4bf]" />
                Reveal WhatsApp on request
              </label>
              {contact === "wa" && (
                <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="07… — sealed until YOU accept a request" inputMode="tel" className={field} />
              )}
            </div>
          </div>

          {err && <p className="rounded-2xl bg-red-950/40 border border-red-900 p-4 text-sm text-red-300">{err}</p>}
          <button className="w-full rounded-full bb-btn py-4 text-sm font-bold transition" style={{ height: 55 }}>Submit the dream →</button>
          <p className="text-center font-mono text-xs text-dim">No emojis. No links. {myTier === "visitor" ? "Lives 72 hours." : "Certified — lives 7 days."}</p>
        </form>
      </div>
    </main>
  );
}
