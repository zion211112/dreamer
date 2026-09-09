import { sha256 } from "./hash";

export type Member = {
  id: string;
  name: string;
  occupation: string;
  location: string;
  skills: string[];
  verified: boolean;
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

export const OCCUPATIONS: string[] = [
  "Maths Tutor",
  "Solar Assistant",
  "Tailor",
  "Masonry Assistant",
  "Animator",
  "Data Enumerator"
];

export const LOCATIONS: string[] = ["Mwea", "Kagio", "Kerugoya", "Embu", "Sagana"];

export const KEYS = {
  members: "aptlabs-members-v1",
  tasks: "aptlabs-tasks-v1",
  needs: "aptlabs-needs-v1"
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
  verified: boolean
): Member {
  const base = { id, name, occupation, location };
  return { ...base, skills, verified, hash: seal(base) };
}

export const SEED_MEMBERS: Member[] = [
  member("AL-0042", "Wanjiku M.", "Maths Tutor", "Mwea", ["KCSE Maths", "Revision drills"], true),
  member("AL-0137", "Otieno K.", "Solar Assistant", "Kagio", ["Lantern assembly", "Maintenance"], true),
  member("AL-0201", "Amina N.", "Tailor", "Kerugoya", ["Uniforms", "Repairs"], true),
  member("AL-0311", "Mwangi J.", "Masonry Assistant", "Embu", ["Block work", "Repairs"], false),
  member("AL-0420", "Njeri W.", "Animator", "Mwea", ["Explainer clips", "Posters"], true),
  member("AL-0513", "Kamau D.", "Data Enumerator", "Sagana", ["Surveys", "Entry"], false)
];

export const SEED_TASKS: Task[] = [
  { id: "T-01", title: "Solar lantern assembly for evening classes", trade: "Solar Assistant", location: "Kagio", pay: 9500, votes: 52, status: "in_progress", claimedBy: "AL-0137" },
  { id: "T-02", title: "Desk repair sprint — Ngurubani Primary", trade: "Masonry Assistant", location: "Mwea", pay: 6000, votes: 48, status: "open", claimedBy: "" },
  { id: "T-03", title: "40 KCSE maths drill questions", trade: "Maths Tutor", location: "Mwea", pay: 4000, votes: 37, status: "open", claimedBy: "" },
  { id: "T-04", title: "Uniform repairs — Kerugoya Primary", trade: "Tailor", location: "Kerugoya", pay: 5000, votes: 29, status: "done", claimedBy: "AL-0201" }
];

export const SEED_NEEDS: Need[] = [
  { id: "N-01", school: "Ngurubani Primary", need: "Saturday maths revision support", occupation: "Maths Tutor", location: "Mwea", contact: "0712 000 321" },
  { id: "N-02", school: "Kagio Secondary", need: "Solar system maintenance check", occupation: "Solar Assistant", location: "Kagio", contact: "0733 000 654" }
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
