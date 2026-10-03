// Fee Tracking (3): the ledger a M-Pesa school actually keeps.
//
// One invoice per term — every student bills against the same amount, the way
// a school sets it. Payments are append-only lines with their M-Pesa
// references, because an audit trail you can delete is not one. The
// default-prediction is pure arithmetic on what is still open: who has
// never paid, who has gone quiet, who is just behind.
//
// Same contract as the rest of the lib: pure helpers plus idb passes, no
// React, no network.

import { idbAll, idbBulkPut } from "./db";
import { Student } from "./school";

export interface FeeTerm {
  id: string; // term slug — "2026-t1"
  term: string; // display name — "2026 T1"
  amount: number; // KES, billed per student
  ts: number;
}

export interface FeePayment {
  id: string; // term|studentId|ref
  term: string;
  studentId: string;
  amount: number;
  ref: string; // M-Pesa ref; "" when recorded by hand
  on: string; // ISO date
}

export function termSlug(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "term";
}

export function paymentId(term: string, studentId: string, ref: string): string {
  return [term, studentId, ref || "hand"].join("|");
}

export function defaultTerm(): string {
  return `${new Date().getFullYear()} T1`;
}

export async function loadFeeTerms(): Promise<FeeTerm[]> {
  const all = await idbAll<FeeTerm | FeePayment>("fees");
  return all.filter((f): f is FeeTerm => !("studentId" in f));
}

export async function loadFeePayments(): Promise<FeePayment[]> {
  const all = await idbAll<FeeTerm | FeePayment>("fees");
  return all.filter((f): f is FeePayment => "studentId" in f);
}

export async function commitTerm(term: FeeTerm): Promise<void> {
  await idbBulkPut("fees", [term]);
}

export async function commitPayments(rows: FeePayment[]): Promise<void> {
  if (rows.length > 0) await idbBulkPut("fees", rows);
}

/* ------------------------------------------------------------------ */
/* The ledger row: one student, one term, one risk answer.             */
/* ------------------------------------------------------------------ */

export type FeeRisk = "unbilled" | "clear" | "low" | "medium" | "high";

export interface FeeStanding {
  studentId: string;
  billed: number;
  paid: number;
  balance: number;
  last: string | null; // ISO date of the newest payment, or null
  risk: FeeRisk;
  riskNote: string;
}

// Default prediction, plain and falsifiable: never paid is high, quiet for
// more than 45 days is high, more than 21 days is medium, otherwise low. The
// numbers are a policy, not a claim — a school tunes them by editing this.
export function standingFor(
  term: FeeTerm | null,
  payments: FeePayment[],
  studentId: string
): FeeStanding {
  const mine = payments.filter((p) => p.studentId === studentId);
  const paid = mine.reduce((a, p) => a + p.amount, 0);
  const billed = term ? term.amount : 0;
  const balance = Math.max(0, billed - paid);
  const last = mine.length > 0 ? [...mine].sort((a, b) => (b.on || "").localeCompare(a.on || ""))[0].on : null;

  if (!term)
    return { studentId, billed, paid, balance: 0, last: null, risk: "unbilled", riskNote: "No invoice this term yet." };
  if (balance <= 0)
    return { studentId, billed, paid, balance, last, risk: "clear", riskNote: "Settled." };
  if (mine.length === 0)
    return { studentId, billed, paid, balance, last: null, risk: "high", riskNote: "Owed with no payment on record." };
  const days = last ? Math.floor((Date.now() - Date.parse(last)) / 86_400_000) : 999;
  if (days > 45)
    return { studentId, billed, paid, balance, last, risk: "high", riskNote: `${days} days since the last payment.` };
  if (days > 21)
    return { studentId, billed, paid, balance, last, risk: "medium", riskNote: `${days} days since the last payment.` };
  return {
    studentId,
    billed,
    paid,
    balance,
    last,
    risk: "low",
    riskNote: `Paying — last one ${days} day${days === 1 ? "" : "s"} ago.`
  };
}

export function kes(n: number): string {
  return `KSh ${Math.round(n).toLocaleString("en-US")}`;
}

/* ------------------------------------------------------------------ */
/* M-Pesa statement paste: date, ref, name-or-adm, amount — one line  */
/* per line, commas or tabs. Matching is adm no first, then the full   */
/* name; what it cannot match is surfaced, never silently dropped.     */
/* ------------------------------------------------------------------ */

export interface MpesaLine {
  date: string; // ISO
  ref: string;
  who: string;
  amount: number;
  match: Student | null;
}

export interface MpesaParse {
  lines: MpesaLine[];
  notes: string[];
}

function parseMpesaDate(raw: string): string {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = m[2].padStart(2, "0");
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${mo}-${d}`;
  }
  return new Date().toISOString().slice(0, 10);
}

export function parseMpesaStatement(raw: string, students: Student[]): MpesaParse {
  const notes: string[] = [];
  const byAdm = new Map<string, Student>();
  const byName = new Map<string, Student>();
  for (const s of students) {
    const adm = s.admNo.trim().toUpperCase();
    if (adm) byAdm.set(adm, s);
    const nm = s.name.trim().toLowerCase();
    if (nm) byName.set(nm, s);
  }

  const lines: MpesaLine[] = [];
  const rows = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  rows.forEach((row, i) => {
    const cells = row.split(/[,\t]/).map((c) => c.trim());
    if (i === 0 && /ref|amount/i.test(row) && !/^\d/.test(cells[0] || "")) return; // header row
    const date = parseMpesaDate(cells[0] || "");
    const who = cells[2] || "";
    const amount = parseFloat((cells[3] || "").replace(/[^0-9.\-]/g, ""));
    if (Number.isNaN(amount)) {
      notes.push(`Line ${i + 1}: no amount found — skipped.`);
      return;
    }
    const match = (who && (byAdm.get(who.toUpperCase()) || byName.get(who.toLowerCase()))) || null;
    if (!match) notes.push(`Line ${i + 1} ("${who || "—"}", ${kes(amount)}) matches no student on the roll — left out.`);
    lines.push({ date, ref: cells[1] || "", who, amount, match });
  });
  return { lines, notes };
}
