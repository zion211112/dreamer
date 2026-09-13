import { KEYS, Member, SEED_MEMBERS, loadStored } from "./ledger";

export function allMembers(): Member[] {
  const stored = loadStored<Member>(KEYS.members);
  const customs = stored.filter((m) => !SEED_MEMBERS.some((s) => s.id === m.id));
  return [...customs, ...SEED_MEMBERS];
}

export function memberByUsername(all: Member[], u: string): Member | null {
  const key = (u || "").toLowerCase();
  return all.find((m) => ((m.username || "") as string).toLowerCase() === key) || null;
}

export const DOMAINS: string[] = [
  "Water", "Power", "Food", "Health", "Education", "Housing",
  "Mobility", "Sanitation", "Finance", "Logistics", "Culture", "Other"
];

export const TYPES: string[] = ["NEED", "OFFER", "SOLUTION", "FAILURE", "QUESTION"];

export const NEED_KEYS = ["labor", "materials", "funds", "intellect", "nothing"] as const;
export type NeedKey = (typeof NEED_KEYS)[number];

export type BuildNeeds = {
  labor: number; // hands wanted, 0 = not needed
  materials: string;
  funds: number; // KES, 0 = not needed
  intellect: string;
  nothing: boolean;
};

export type BuildComment = { by: string; text: string; ts: number; fork: boolean };

export type Visibility = "public" | "hall8" | "private";

export type BuildFile = { name: string; size: number; type: string; dataUrl: string };

// Attachments ride inside the build record. Browsers carry ~5MB of
// localStorage, so the floor caps files at 1MB total per build —
// big files stay on your device. Server stage lifts the cap.
export const MAX_ATTACH_BYTES = 1_000_000;

export type Build = {
  id: string;
  by: string; // username — never a phone number
  title: string;
  body: string;
  domain: string;
  type: string;
  needs: BuildNeeds;
  location: string;
  done: string;
  contact: "dm" | "wa";
  wa?: string; // sealed: shown only to accepted requesters, never in public DOM
  waRequests: { by: string; ts: number; status: "pending" | "accepted" | "declined" }[];
  votes: number;
  votedBy: Record<string, { value: number; ts: number }>;
  comments: BuildComment[];
  nominated?: { hall: string; reason: string; by: string; ts: number };
  visibility: Visibility;
  attachments: BuildFile[];
  createdTs: number;
  tierAtPost: string; // visitor | member | hall
};

// Who may open a build: everyone for public; the author always;
// sealed hall-8 builds open for hall-tier members reviewing for the admin.
export function canView(b: Build, username: string, tier: FloorTier): boolean {
  if (b.visibility === "public") return true;
  if (b.by === username) return true;
  if (b.visibility === "hall8" && tier === "hall") return true;
  return false;
}

export const BENBEN_KEY = "aptlabs-benben-builds-v1";
export const BENBEN_NOMS_KEY = "aptlabs-benben-noms-v1";

export type Nomination = { postId: string; hall: string; reason: string; by: string; ts: number; yes: string[] };

// Astral pictographs (surrogate pairs) plus the common BMP symbols.
// Built by constructor so the source stays pure ASCII � no encoding risk, ES5-safe.
const EMOJI_RE = new RegExp(
  "[\\u00A9\\u00AE\\u203C\\u2049\\u2122\\u2139\\u231A\\u231B\\u23E9-\\u23FA\\u25AA\\u25AB\\u25B6\\u25C0\\u25FB-\\u25FE\\u2614\\u2615\\u2648-\\u2653\\u267F\\u2693\\u26A1\\u26BD\\u26BE\\u26C4\\u26C5\\u26CE\\u26D4\\u26EA\\u26F2\\u26F3\\u26F5\\u26FA\\u26FD\\u2705\\u270A\\u270B\\u2728\\u274C\\u274E\\u2753-\\u2755\\u2757\\u2795-\\u2797\\u27B0\\u27BF\\u2B1B\\u2B1C\\u2B50\\u2B55\\uFE0F\\u200D\\u20E3]" +
  "|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]"
);
const URL_RE = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

export function stripUrls(s: string): string {
  return s.replace(URL_RE, "[link removed — the floor is text]").trim();
}

export function validateBuild(b: {
  title: string;
  body: string;
  done: string;
  needs: BuildNeeds;
}): string | null {
  if (!b.title.trim()) return "A build needs a title.";
  if (b.title.length > 89) return `Title is ${b.title.length}/89. Cut it like firewood.`;
  if (EMOJI_RE.test(b.title + b.body + b.done)) return "No emojis. The floor is text.";
  const words = b.body.trim().split(/\s+/).filter(Boolean).length;
  if (words > 500) return `Body is ${words}/500 words. Say it shorter.`;
  if (!b.done.trim()) return "Say what done looks like. One sentence.";
  if (b.done.length > 144) return "Done-definition is one sentence, 144 max.";
  const n = b.needs;
  if (n.nothing && (n.labor > 0 || n.materials.trim() || n.funds > 0 || n.intellect.trim()))
    return "Nothing means nothing — uncheck the rest or uncheck Nothing.";
  if (!n.nothing && n.labor <= 0 && !n.materials.trim() && n.funds <= 0 && !n.intellect.trim())
    return "Name what's missing: labor, materials, funds, intellect — or Nothing.";
  return null;
}

// ---- feed: velocity, not vanity ----

export function recencyBoost(ageH: number): number {
  if (ageH < 6) return 1.0;
  if (ageH < 24) return 0.8;
  if (ageH < 48) return 0.5;
  return 0.3;
}

// All tiers weigh 1.0. Active members get longer life, never higher rank.
export function velocityScore(b: Build, votes6h: number, now: number): number {
  const ageH = Math.max((now - b.createdTs) / 3600000, 0.05);
  return (votes6h / ageH) * recencyBoost(ageH);
}

export function isLive(b: Build, tier: string, now: number): boolean {
  const lifeH = tier === "visitor" ? 72 : 168; // 7 days for member+
  return now - b.createdTs < lifeH * 3600000;
}

export function rankFeed(builds: Build[], now: number): Build[] {
  const live = builds.filter((b) => isLive(b, b.tierAtPost, now));
  const scored = live.map((b) => {
    const recent = b.comments.filter((c) => now - c.ts < 6 * 3600000).length;
    return { b, s: velocityScore(b, Math.max(b.votes, 0) + recent * 0.5, now) };
  });
  scored.sort((a, z) => z.s - a.s || Math.random() - 0.5);
  // No domain may hold more than 3 slots in any 20-post window.
  const out: Build[] = [];
  const window: string[] = [];
  for (const { b } of scored) {
    const last20 = window.slice(-20);
    if (last20.filter((d) => d === b.domain).length >= 3) continue;
    out.push(b);
    window.push(b.domain);
  }
  return out;
}

export function persistBuilds(v: Build[]): void {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(BENBEN_KEY, JSON.stringify(v));
  } catch { /* the floor remembers anyway */ }
}

// Who is holding the phone? Username only — phones never leave the gate.
export function myUsername(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(KEYS.identity);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.username ? (p.username as string) : null;
  } catch {
    return null;
  }
}

export type FloorTier = "visitor" | "member" | "hall";

export function tierOf(username: string | null, findMember: (u: string) => { paid: boolean; verified: boolean; hallPaid: boolean; tier: string | null } | null): FloorTier {
  if (!username) return "visitor";
  const m = findMember(username);
  if (!m) return "visitor";
  if (m.hallPaid && m.verified && m.tier) return "hall";
  if (m.paid && m.verified) return "member";
  return "visitor";
}

export function timeAgo(ts: number, now: number): string {
  const s = Math.max(1, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function castVote(
  list: Build[],
  id: string,
  username: string,
  value: 1 | -1,
  now: number
): { list: Build[]; err: string | null } {
  const i = list.findIndex((b) => b.id === id);
  if (i < 0) return { list, err: "Gone. The floor moved on." };
  const b = list[i];
  const prev = b.votedBy[username];
  if (prev && now - prev.ts < 60000)
    return { list, err: "Vote locked for 60 seconds. The floor is patient." };
  const next = [...list];
  const delta = prev ? value - prev.value : value;
  next[i] = { ...b, votes: b.votes + delta, votedBy: { ...b.votedBy, [username]: { value, ts: now } } };
  return { list: next, err: null };
}

export function loadBuilds(): Build[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(BENBEN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Old records predate seals and files — default them open and empty.
    return (parsed as Build[]).map((b) => ({
      ...b,
      visibility: (b.visibility === "hall8" || b.visibility === "private" ? b.visibility : "public") as Visibility,
      attachments: Array.isArray(b.attachments) ? b.attachments : [],
      waRequests: Array.isArray(b.waRequests) ? b.waRequests : [],
      votedBy: b.votedBy && typeof b.votedBy === "object" ? b.votedBy : {}
    }));
  } catch {
    return [];
  }
}

// ---- the 3 seeds: posted day one, they set the standard ----

function seed(
  id: string,
  by: string,
  title: string,
  body: string,
  domain: string,
  type: string,
  needs: BuildNeeds,
  location: string,
  done: string
): Build {
  return {
    id, by, title, body, domain, type, needs, location, done,
    contact: "dm", waRequests: [], votes: 12, votedBy: {},
    comments: [], visibility: "public" as Visibility, attachments: [],
    createdTs: Date.now() - 2 * 3600000, tierAtPost: "visitor"
  };
}

const none = (): BuildNeeds => ({ labor: 0, materials: "", funds: 0, intellect: "", nothing: true });

export const SEED_BUILDS: Build[] = [
  seed("BB-02", "Fundi_0002", "Bike-powered phone charger for 1,800 KES — parts list and wiring",
    "Dynamo 800, rectifier 350, regulator 250, casing and wire 400. Mount on the rear fork, output 5V 1A at walking pace. Full wiring order inside the comments on request.",
    "Power", "SOLUTION", none(), "Mwea",
    "Anyone can build this with local parts"),
  seed("BB-05", "Mwalimu_0005", "I can animate 3-minute KCSE explainers — free in exchange for skill work",
    "Ten explainers queued: matrices, photosynthesis, Sarufi. I want them listed on the ledger instead of cash. Reviewers welcome.",
    "Education", "OFFER", none(), "Mwea",
    "10 explainers published on APT-LABS, my name on the ledger"),
  seed("BB-06", "Seremala_0006", "Stabilized soil block recipe after 6 months of tests — 7% cement, 2% lime",
    "Tested across two rainy seasons. Passes county building standards, costs 40% less than fired brick. Full ratios and curing schedule in thread.",
    "Housing", "SOLUTION", none(), "Embu",
    "Blocks that pass county standards, 40% cheaper than brick")
];
