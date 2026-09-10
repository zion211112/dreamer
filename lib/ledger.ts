import { sha256 } from "./hash";

export type Member = {
  id: string;
  name: string;
  occupation: string;
  location: string;
  skills: string[];
  paid: boolean;
  verified: boolean;
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
export const LEARNER_FEE = "KES 20/week";
export const TEACHER_FEE = "KES 500/month";
export const SCHOOL_FEE = "from KES 3,000/month";

export const SUBSCRIBED_SCHOOLS: string[] = [
  "Ngurubani Primary",
  "Kagio Secondary",
  "Mugumo Primary"
];

export const ULTRA_QS: string[] = [
  "What can you do? One sentence. No adjectives.",
  "Name the gap: what stands between your ambition and your resources?",
  "Show one finished thing. What did you complete with your own hands?"
];

export const KEYS = {
  members: "aptlabs-members-v2",
  tasks: "aptlabs-tasks-v2",
  needs: "aptlabs-needs-v2",
  comments: "aptlabs-comments-v1",
  queue: "aptlabs-queue-v1",
  myid: "aptlabs-myid"
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
  answers: string[] = []
): Member {
  const base = { id, name, occupation, location };
  return { ...base, skills, paid, verified, answers, hash: seal(base) };
}

// The founding roll. Eight handles. Everywhere.
export const SEED_MEMBERS: Member[] = [
  member("AL-0042", "@Shemsu_Node", "Maths Tutor", "Mwea", ["KCSE Maths", "Revision drills"], true, true,
    ["I teach fractions until the slow kid nods.", "Fees. I close it with Saturday classes.", "Forty pupils passed after my drills."]),
  member("AL-0137", "@ZepTepi_Zero", "Solar Assistant", "Kagio", ["Lantern assembly", "Maintenance"], true, true,
    ["I keep evening classes lit.", "Spare parts. I close it by rebuilding dead lanterns.", "Twelve lanterns running in Kagio."]),
  member("AL-0201", "@KeeperOfRostau", "Data Enumerator", "Sagana", ["Surveys", "Entry"], true, true,
    ["I count things correctly.", "Bad roads. I close it by walking.", "Three ward surveys, zero errors flagged."]),
  member("AL-0311", "@VrilToSekhem", "Masonry Assistant", "Embu", ["Block work", "Repairs"], false, false),
  member("AL-0420", "@Thoth_Architect", "Animator", "Mwea", ["Explainer clips", "Posters"], true, true,
    ["I draw ideas so grandmothers get them.", "Software licenses. I close it with open tools.", "Six explainer clips used in class."]),
  member("AL-0488", "@BenBen_Codex", "Tailor", "Kerugoya", ["Uniforms", "Repairs"], true, true,
    ["I sew uniforms that survive the term.", "Fabric prices. I close it by repairing first.", "Two hundred uniforms delivered."]),
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
