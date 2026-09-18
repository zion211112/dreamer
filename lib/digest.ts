// Pilot 1 — the Parent Digest, before it is a digest. The first practical
// run: a listening questionnaire for parents. It asks what they actually
// want to know, how they want it, what they fear, what they suggest. It is
// input, not a pitch — no paywall, no account, no "coming soon".
//
// What a parent writes here becomes the requirements line for the shipped
// daily digest (ship-order 1 in the plan). Two stores, both local-first:
//   · the in-progress DRAFT lives in localStorage (cheap, per session)
//   · SEALED responses live in the IndexedDB "meta" store, so the teacher
//     console on the same device can read and aggregate what parents asked.
// Nothing leaves the device until a parent chooses to share it.

import { idbAll, idbPut } from "./db";

/* ------------------------------------------------------------------ */
/* The instrument: fixed options so aggregation is deterministic.     */
/* ------------------------------------------------------------------ */

export const DIGEST_CLASS = [
  "Prep",
  "Grade 1–6",
  "Grade 7–9",
  "Secondary",
  "Other / not sure"
] as const;

export const DIGEST_CHILDREN = ["One child", "Two children", "Three", "Four or more"] as const;

// "What do you want to hear about" — the wants, and the top-3 pull from them.
export const DIGEST_WANTS = [
  "Progress in class",
  "Attendance",
  "Homework",
  "Attitude & behaviour",
  "Test & exam results",
  "Health & wellbeing",
  "Discipline incidents",
  "Fees & payments"
] as const;

export const DIGEST_CHANNELS = [
  "WhatsApp",
  "SMS",
  "Phone call",
  "PTA / meeting",
  "Paper letter"
] as const;

export const DIGEST_FREQUENCY = [
  "Daily",
  "Weekly",
  "Each term",
  "Only when something happens"
] as const;

// The trust line: what a parent asks us never to share without permission.
export const DIGEST_TRUST = [
  "Test & exam scores",
  "Health information",
  "Discipline incidents",
  "Attendance",
  "Fee status",
  "Let us decide per item"
] as const;

/* ------------------------------------------------------------------ */
/* The reply shape. Labels, not ids — aggregation and the share text  */
/* both read a human string, not a code.                               */
/* ------------------------------------------------------------------ */

export interface DigestResponse {
  id: string;
  sealedAt: string; // ISO — when the parent sealed it
  childClass: string;
  children: string;
  wants: string[]; // what they want to hear about
  top3: string[]; // the three that matter most (subset of wants)
  channel: string[]; // how to reach them
  frequency: string; // how often
  concern: string; // open: what they can't get today
  suggest: string; // open: what to build, change, or stop
  trust: string[]; // never share without permission
}

// The in-progress shape, one step ahead of a sealed reply.
export interface DigestDraft {
  childClass: string;
  children: string;
  wants: string[];
  top3: string[];
  channel: string[];
  frequency: string;
  concern: string;
  suggest: string;
  trust: string[];
}

export function emptyDraft(): DigestDraft {
  return {
    childClass: "",
    children: "",
    wants: [],
    top3: [],
    channel: [],
    frequency: "",
    concern: "",
    suggest: "",
    trust: []
  };
}

// How many of the nine fields carry an answer yet. Drives the progress line.
export function draftProgress(d: DigestDraft): number {
  let n = 0;
  if (d.childClass) n++;
  if (d.children) n++;
  if (d.wants.length) n++;
  if (d.top3.length) n++;
  if (d.channel.length) n++;
  if (d.frequency) n++;
  if (d.trust.length) n++;
  if (d.concern.trim()) n++;
  if (d.suggest.trim()) n++;
  return n;
}

// A parent may seal as soon as they have said at least one real thing.
export function canSeal(d: DigestDraft): boolean {
  return (
    d.wants.length > 0 ||
    d.top3.length > 0 ||
    d.channel.length > 0 ||
    d.frequency !== "" ||
    d.concern.trim() !== "" ||
    d.suggest.trim() !== ""
  );
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sealResponse(d: DigestDraft): DigestResponse {
  return {
    id: uid("dg"),
    sealedAt: new Date().toISOString(),
    childClass: d.childClass,
    children: d.children,
    wants: d.wants,
    top3: d.top3,
    channel: d.channel,
    frequency: d.frequency,
    concern: d.concern.trim(),
    suggest: d.suggest.trim(),
    trust: d.trust
  };
}

// The share text: what a parent copies to the team, or the console reads.
export function sealText(r: DigestResponse): string {
  const line = (k: string, v: string[]) => (v.length ? `${k}: ${v.join(", ")}` : `${k}: —`);
  return [
    "Pilot 1 · Parent Digest",
    `Sealed ${new Date(r.sealedAt).toLocaleString()}`,
    `Child: ${r.childClass || "—"} · ${r.children || "—"}`,
    line("Wants to know", r.wants),
    line("Top three", r.top3),
    line("Reach me via", r.channel),
    `Cadence: ${r.frequency || "—"}`,
    r.concern ? `Worry: ${r.concern}` : "",
    r.suggest ? `Suggestion: ${r.suggest}` : "",
    line("Never share without asking", r.trust)
  ]
    .filter(Boolean)
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* Draft: localStorage. Safe to call on SSR — no-op off the browser.  */
/* ------------------------------------------------------------------ */

const DRAFT_KEY = "aptlabs.digest.draft";

export function loadDraft(): DigestDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    return { ...emptyDraft(), ...(JSON.parse(raw) as Partial<DigestDraft>) };
  } catch {
    return emptyDraft();
  }
}

export function saveDraft(d: DigestDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* memory-only session */
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to clear */
  }
}

/* ------------------------------------------------------------------ */
/* Sealed responses: the "meta" store in IndexedDB, shared with the   */
/* teacher console on this device.                                     */
/* ------------------------------------------------------------------ */

const DOC_ID = "digest-responses";

interface Doc {
  id: string;
  responses: DigestResponse[];
}

export async function loadResponses(): Promise<DigestResponse[]> {
  const rows = await idbAll<Partial<Doc>>("meta");
  const doc = rows.find((m) => m.id === DOC_ID);
  return doc?.responses ?? [];
}

export async function addResponse(r: DigestResponse): Promise<void> {
  const all = await loadResponses();
  await idbPut<Doc>("meta", { id: DOC_ID, responses: [...all, r] });
}

/* ------------------------------------------------------------------ */
/* Aggregation: the "what did parents ask" answer the console shows.  */
/* Deterministic counts; open text is trimmed and de-duped, verbatim. */
/* ------------------------------------------------------------------ */

export interface DigestAggregate {
  total: number;
  wants: [string, number][]; // ranked, desc
  channels: [string, number][];
  frequencies: [string, number][];
  trusts: [string, number][]; // the never-share lines, ranked
  concerns: string[];
  suggests: string[];
}

function tally(values: string[]): [string, number][] {
  const m = new Map<string, number>();
  for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(t);
    }
  }
  return out;
}

export function aggregate(responses: DigestResponse[]): DigestAggregate {
  return {
    total: responses.length,
    wants: tally(responses.flatMap((r) => r.wants)),
    channels: tally(responses.flatMap((r) => r.channel)),
    frequencies: tally(responses.map((r) => r.frequency)),
    trusts: tally(responses.flatMap((r) => r.trust)),
    concerns: dedupe(responses.map((r) => r.concern)),
    suggests: dedupe(responses.map((r) => r.suggest))
  };
}

