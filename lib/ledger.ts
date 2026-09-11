import { sha256 } from "./hash";

export type Member = {
  id: string;
  name: string;
  username: string;
  occupation: string;
  location: string;
  skills: string[];
  paid: boolean; // KES 50 certificate — unlocks voting
  verified: boolean; // certified: hash sealed, can vote + propose
  hallPaid: boolean; // KES 100 hall exam fee
  tier: string | null;
  testScore: number | null;
  testTs: number;
  hall: string | null; // the one hall entered
  certNo: string | null;
  answers: string[];
  hash: string;
};

export const OCCUPATIONS: string[] = [
  "Maths Tutor",
  "Solar Assistant",
  "Tailor",
  "Masonry Assistant",
  "Animator",
  "Data Enumerator",
  "Tractor Operator"
];

export const LOCATIONS: string[] = ["Mwea", "Kagio", "Kerugoya", "Embu", "Sagana", "Mugumo"];

export const TILL = "555 019";
export const CERT_FEE = "KES 50";
export const HALL_FEE = "KES 100";
export const TEACHER_FEE = "KES 250/month";
export const SCHOOL_FEE = "from KES 3,000/month";

// Default usernames for those who'd rather pick from the yard than invent.
// Usernames are public. Phone numbers never leave the OTP gate.
export const DEFAULT_NAMES: string[] = [
  "Mgeni", "Jirani", "Mkulima", "Fundi", "Mwalimu",
  "Mvuvi", "Mchuuzi", "Dereva", "Kijana", "Mama",
  "Jemedari", "Mshamba", "Dalali", "Seremala", "Mhunzi"
];

export function suggestUsername(taken: string[]): string {
  const lower = taken.map((t) => t.toLowerCase());
  for (let i = 0; i < 40; i++) {
    const cand = `${DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)]}_${Math.floor(1000 + Math.random() * 9000)}`;
    if (!lower.includes(cand.toLowerCase())) return cand;
  }
  return `Mgeni_${Date.now().toString(36).toUpperCase()}`;
}

export function validUsername(s: string, taken: string[]): string | null {
  const v = s.trim().replace(/^@/, "");
  if (v.length < 3) return "At least 3 characters. Even the yard needs a name with weight.";
  if (v.length > 20) return "20 characters max. Say it short.";
  if (!/^[A-Za-z0-9_]+$/.test(v)) return "Letters, numbers, underscore only.";
  if (taken.some((t) => t.toLowerCase() === v.toLowerCase())) return "Taken on this roll. Pick another.";
  return null;
}

export const SUBSCRIBED_SCHOOLS: string[] = [
  "Ngurubani Primary",
  "Kagio Secondary",
  "Mugumo Primary"
];

// Crucible: 8 choice questions. Scored. No memorization. Pure friction.
export type CrucibleQ = { q: string; options: string[]; answer: number; why: string };

export const CRUCIBLE_QS: CrucibleQ[] = [
  {
    q: "14 board in Mwea. Kagio: 6 leave, 8 enter. Kerugoya: half alight. How many ride on?",
    options: ["6", "8", "9", "11"],
    answer: 1,
    why: "14 − 6 + 8 = 16. Half of 16 is 8. Count twice, pay once."
  },
  {
    q: "30 desks, 47 pupils, one door on the left. Monday morning. Your move?",
    options: [
      "Pairs sharing desks, one center aisle to the door",
      "Single rows — 17 stand until more desks come",
      "Stack the desks, everyone sits on the floor",
      "Send 17 pupils home"
    ],
    answer: 0,
    why: "Everyone sits, everyone exits. Constraints first, comfort second."
  },
  {
    q: "A 10,000L tank fills in 4 hours. How long for 2,500L at the same flow?",
    options: ["30 minutes", "1 hour", "2 hours", "4 hours"],
    answer: 1,
    why: "Quarter the water, quarter the time. Ratios don't negotiate."
  },
  {
    q: "Borehole runs 2hrs/day. Tank holds 3hrs of flow. Hours of water per day?",
    options: ["5", "3", "2", "6"],
    answer: 2,
    why: "Storage is not source. The borehole decides, the tank obeys."
  },
  {
    q: "A lantern dies nightly at 8pm and wakes when shaken. First check?",
    options: ["Battery contacts", "Solar panel", "Buy a new one", "Blame the darkness"],
    answer: 0,
    why: "Shake-to-wake means a loose joint. Cheapest cause first — always."
  },
  {
    q: "Fees are 36,000/yr. A parent pays 8,000 monthly from January. Cleared when?",
    options: ["April", "May", "March", "Never"],
    answer: 1,
    why: "8,000 × 4 = 32,000. Short. The fifth month finishes it."
  },
  {
    q: "2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "44"],
    answer: 2,
    why: "Gaps grow: +4, +6, +8, +10, +12. Next is 42. Patterns compound."
  },
  {
    q: "Zero capital, one phone, harvest season. First move?",
    options: [
      "Borrow at 30%",
      "Wait for capital",
      "Queue-sell a farmer's maize for a cut",
      "Sell the phone"
    ],
    answer: 2,
    why: "Move other people's value for a cut. Capital follows motion."
  }
];

export const PASS_MARK = 5; // 5/8 = 62.5% → Stone and above pass

export function tierFor(score: number): { tier: string; pass: boolean; retryDays: number } {
  const pct = (score / CRUCIBLE_QS.length) * 100;
  if (pct >= 95) return { tier: "Diamond", pass: true, retryDays: 0 };
  if (pct >= 80) return { tier: "Crystal", pass: true, retryDays: 0 };
  if (pct >= 60) return { tier: "Stone", pass: true, retryDays: 0 };
  if (pct >= 40) return { tier: "Clay", pass: false, retryDays: 14 };
  return { tier: "Sand", pass: false, retryDays: 30 };
}

export const KEYS = {
  members: "aptlabs-members-v3",
  queue: "aptlabs-queue-v1",
  myid: "aptlabs-myid",
  identity: "aptlabs-identity",
  benben: "aptlabs-benben-v1"
};

export function canonical(m: Pick<Member, "id" | "name" | "occupation" | "location">): string {
  return `${m.id}|${m.name}|${m.occupation}|${m.location}`;
}

export function seal(m: Pick<Member, "id" | "name" | "occupation" | "location">): string {
  return sha256(canonical(m));
}

function member(
  id: string,
  name: string,
  username: string,
  occupation: string,
  location: string,
  skills: string[],
  paid: boolean,
  verified: boolean,
  tier: string | null = null,
  hallPaid = false
): Member {
  const base = { id, name, occupation, location };
  return { ...base, username, skills, paid, verified, hallPaid, tier, testScore: verified ? 6 : null, testTs: 0, hall: null, certNo: null, answers: [], hash: seal(base) };
}

// The founding roll. Eight handles. Everywhere.
export const SEED_MEMBERS: Member[] = [
  member("AL-0042", "@Shemsu_Node", "Shemsu_Node", "Maths Tutor", "Mwea", ["KCSE Maths", "Revision drills"], true, true, "Stone", true),
  member("AL-0137", "@ZepTepi_Zero", "ZepTepi_Zero", "Solar Assistant", "Kagio", ["Lantern assembly", "Maintenance"], true, true, "Stone", true),
  member("AL-0201", "@KeeperOfRostau", "KeeperOfRostau", "Data Enumerator", "Sagana", ["Surveys", "Entry"], true, true, "Stone", true),
  member("AL-0311", "@VrilToSekhem", "VrilToSekhem", "Masonry Assistant", "Embu", ["Block work", "Repairs"], false, false),
  member("AL-0420", "@Thoth_Architect", "Thoth_Architect", "Animator", "Mwea", ["Explainer clips", "Posters"], true, true, "Stone", true),
  member("AL-0488", "@BenBen_Codex", "BenBen_Codex", "Tailor", "Kerugoya", ["Uniforms", "Repairs"], true, true, "Stone", true),
  member("AL-0513", "@Iunu_Sunset", "Iunu_Sunset", "Maths Tutor", "Kerugoya", ["KCSE Physics", "Drills"], false, false),
  member("AL-0777", "@The_Osirion", "The_Osirion", "Solar Assistant", "Mwea", ["Installation", "Wiring"], false, false)
];

export function loadStored<T>(key: string): T[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function saveStored<T>(key: string, value: T[]): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked — the ledger keeps going in memory
  }
}

export function shortHash(hash: string): string {
  return hash.slice(0, 10) + "…" + hash.slice(-4);
}

// Roll count as ledger version: 1 + members/1000, three decimals.
export function ledgerVersion(count: number): string {
  return (1 + count / 1000).toFixed(3);
}

export function isMpesaCode(s: string): boolean {
  return /^[A-Z0-9]{10}$/.test(s.trim().toUpperCase());
}

// Snapshot ground truth. Schools + treasury are demo figures;
// individuals, projects, current build and master hash are live.
export type SchoolStat = { name: string; students: number };

export const SCHOOL_STATS: SchoolStat[] = [
  { name: "Ngurubani Primary", students: 420 },
  { name: "Kagio Secondary", students: 650 },
  { name: "Mugumo Primary", students: 310 }
];

export const TREASURY = { total: 250000, usedPct: 70 };

// Master hash: rolling seal over every member hash on the roll.
export function masterHash(hashes: string[]): string {
  return sha256(hashes.join("|"));
}
