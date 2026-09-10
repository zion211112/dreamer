import { sha256 } from "./hash";

export type Member = {
  id: string;
  name: string;
  occupation: string;
  location: string;
  skills: string[];
  paid: boolean;
  verified: boolean;
  tier: string | null;
  testScore: number | null;
  testTs: number;
  answers: string[];
  hash: string;
};

export type Task = {
  id: string;
  title: string;
  trade: string;
  location: string;
  pay: number;
  votes: number;
  status: "open" | "in_progress" | "done";
  claimedBy: string;
};

export type Need = {
  id: string;
  school: string;
  need: string;
  occupation: string;
  location: string;
  contact: string;
};

export type Comment = { name: string; text: string; ts: number };

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
export const TEST_FEE = "KES 50";
export const TEACHER_FEE = "KES 250/month";
export const SCHOOL_FEE = "from KES 3,000/month";

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
  tasks: "aptlabs-tasks-v2",
  needs: "aptlabs-needs-v2",
  comments: "aptlabs-comments-v1",
  queue: "aptlabs-queue-v1",
  myid: "aptlabs-myid",
  identity: "aptlabs-identity"
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
  occupation: string,
  location: string,
  skills: string[],
  paid: boolean,
  verified: boolean,
  tier: string | null = null
): Member {
  const base = { id, name, occupation, location };
  return { ...base, skills, paid, verified, tier, testScore: verified ? 6 : null, testTs: 0, answers: [], hash: seal(base) };
}

// The founding roll. Eight handles. Everywhere.
export const SEED_MEMBERS: Member[] = [
  member("AL-0042", "@Shemsu_Node", "Maths Tutor", "Mwea", ["KCSE Maths", "Revision drills"], true, true, "Stone"),
  member("AL-0137", "@ZepTepi_Zero", "Solar Assistant", "Kagio", ["Lantern assembly", "Maintenance"], true, true, "Stone"),
  member("AL-0201", "@KeeperOfRostau", "Data Enumerator", "Sagana", ["Surveys", "Entry"], true, true, "Stone"),
  member("AL-0311", "@VrilToSekhem", "Masonry Assistant", "Embu", ["Block work", "Repairs"], false, false),
  member("AL-0420", "@Thoth_Architect", "Animator", "Mwea", ["Explainer clips", "Posters"], true, true, "Stone"),
  member("AL-0488", "@BenBen_Codex", "Tailor", "Kerugoya", ["Uniforms", "Repairs"], true, true, "Stone"),
  member("AL-0513", "@Iunu_Sunset", "Maths Tutor", "Kerugoya", ["KCSE Physics", "Drills"], false, false),
  member("AL-0777", "@The_Osirion", "Solar Assistant", "Mwea", ["Installation", "Wiring"], false, false)
];

export const SEED_TASKS: Task[] = [
  { id: "T-01", title: "Solar lantern assembly for evening classes", trade: "Solar Assistant", location: "Kagio", pay: 9500, votes: 52, status: "in_progress", claimedBy: "AL-0137" },
  { id: "T-02", title: "Desk repair sprint — Ngurubani Primary", trade: "Masonry Assistant", location: "Mwea", pay: 6000, votes: 48, status: "open", claimedBy: "" },
  { id: "T-03", title: "40 KCSE maths drill questions", trade: "Maths Tutor", location: "Mwea", pay: 4000, votes: 37, status: "open", claimedBy: "" },
  { id: "T-04", title: "Uniform repairs — Kerugoya Primary", trade: "Tailor", location: "Kerugoya", pay: 5000, votes: 29, status: "done", claimedBy: "AL-0488" },
  { id: "T-05", title: "Community tractor: vote the first ward it tills", trade: "Tractor Operator", location: "Kagio", pay: 0, votes: 21, status: "open", claimedBy: "" },
  { id: "T-06", title: "Lantern v2: iterate from field failures", trade: "Solar Assistant", location: "Kagio", pay: 7500, votes: 18, status: "open", claimedBy: "" }
];

export const SEED_NEEDS: Need[] = [
  { id: "N-01", school: "Ngurubani Primary", need: "Saturday maths revision support", occupation: "Maths Tutor", location: "Mwea", contact: "0712 000 321" },
  { id: "N-02", school: "Kagio Secondary", need: "Solar system maintenance check", occupation: "Solar Assistant", location: "Kagio", contact: "0733 000 654" },
  { id: "N-03", school: "Mugumo Primary", need: "Micro-hydro feasibility study (lecturer-directed)", occupation: "Solar Assistant", location: "Mugumo", contact: "0722 000 987" }
];

export const WILD_NOTES: { title: string; text: string }[] = [
  { title: "AGI study cell", text: "Open notebook. What would village-scale machine intelligence run on?" },
  { title: "Antigravity notes", text: "Open notebook. Collect the failed experiments first." },
  { title: "New transport sketches", text: "Open notebook. Draw how the harvest moves without matatus." }
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
