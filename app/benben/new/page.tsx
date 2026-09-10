"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BENBEN_KEY,
  Build,
  BuildNeeds,
  DOMAINS,
  SEED_BUILDS,
  TYPES,
  allMembers,
  loadBuilds,
  memberByUsername,
  myUsername,
  persistBuilds,
  stripUrls,
  tierOf,
  validateBuild
} from "../../../lib/benben";

// + POST A BUILD. Title, body, one domain, one type, needs, done-line.
// Certified posts live 7 days. Everyone else gets 72 hours.
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
      createdTs: Date.now(),
      tierAtPost: myTier
    };
    persistBuilds([build, ...all]);
    router.push(`/benben/post/${id}`);
  }

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const field = "w-full rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-gold";

  return (
    <main className="bg-obsidian text-ivory min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl md:text-3xl font-semibold">POST A BUILD</h1>
          <button onClick={() => router.back()} className="font-mono text-sm text-muted hover:text-ivory" aria-label="Close">[X]</button>
        </div>
        <p className="mt-2 text-sm text-muted">Name the problem. Name what&apos;s missing. Name what done looks like. Posting as <span className="font-mono text-gold">@{me}</span>.</p>

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
                <button type="button" key={d} onClick={() => setDomain(d)} className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase transition ${domain === d ? "bg-forest text-cream" : "border border-white/15 text-muted hover:border-gold"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Type — pick one</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button type="button" key={t} onClick={() => setType(t)} className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase transition ${type === t ? "bg-gold text-black" : "border border-white/15 text-muted hover:border-gold"}`}>
                  {t === "QUESTION" ? "?" : t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">What it needs</label>
            <div className="mt-2 space-y-2 rounded-2xl border border-white/10 bg-panel p-4">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.labor > 0} onChange={(e) => setNeeds({ ...needs, labor: e.target.checked ? Number(laborN) || 1 : 0 })} className="h-4 w-4 accent-[#d4af37]" />
                <span className="w-20">Labor</span>
                {needs.labor > 0 && <input value={laborN} onChange={(e) => { setLaborN(e.target.value); setNeeds({ ...needs, labor: Number(e.target.value) || 0 }); }} placeholder="How many?" inputMode="numeric" className="w-28 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-gold" />}
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.materials.trim().length > 0} onChange={(e) => setNeeds({ ...needs, materials: e.target.checked ? needs.materials || " " : "" })} className="h-4 w-4 accent-[#d4af37]" />
                <span className="w-20">Materials</span>
                <input value={needs.materials} onChange={(e) => setNeeds({ ...needs, materials: e.target.value })} placeholder="List?" className="flex-1 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-gold" />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.funds > 0} onChange={(e) => setNeeds({ ...needs, funds: e.target.checked ? Number(fundsN) || 1 : 0 })} className="h-4 w-4 accent-[#d4af37]" />
                <span className="w-20">Funds</span>
                {needs.funds > 0 && <input value={fundsN} onChange={(e) => { setFundsN(e.target.value); setNeeds({ ...needs, funds: Number(e.target.value) || 0 }); }} placeholder="KES?" inputMode="numeric" className="w-32 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-gold" />}
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.intellect.trim().length > 0} onChange={(e) => setNeeds({ ...needs, intellect: e.target.checked ? needs.intellect || " " : "" })} className="h-4 w-4 accent-[#d4af37]" />
                <span className="w-20">Intellect</span>
                <input value={needs.intellect} onChange={(e) => setNeeds({ ...needs, intellect: e.target.value })} placeholder="What kind?" className="flex-1 rounded-xl border border-white/15 bg-obsidian px-3 py-2 text-sm outline-none focus:border-gold" />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={needs.nothing} onChange={toggleNothing} className="h-4 w-4 accent-[#d4af37]" />
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
            <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Contact</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-panel px-4 py-3 text-sm">
                <input type="radio" checked={contact === "dm"} onChange={() => setContact("dm")} className="h-4 w-4 accent-[#d4af37]" />
                DM on BenBen <span className="text-muted">— talk in the comments, number stays sealed</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-panel px-4 py-3 text-sm">
                <input type="radio" checked={contact === "wa"} onChange={() => setContact("wa")} className="h-4 w-4 accent-[#d4af37]" />
                Reveal WhatsApp on request
              </label>
              {contact === "wa" && (
                <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="07… — sealed until YOU accept a request" inputMode="tel" className={field} />
              )}
            </div>
          </div>

          {err && <p className="rounded-2xl bg-red-950/40 border border-red-900 p-4 text-sm text-red-300">{err}</p>}
          <button className="w-full rounded-full py-4 text-sm font-bold text-black transition" style={{ background: "#d4af37", height: 55 }}>POST</button>
          <p className="text-center font-mono text-xs text-dim">No emojis. No links. {myTier === "visitor" ? "Lives 72 hours." : "Certified — lives 7 days."}</p>
        </form>
      </div>
    </main>
  );
}
