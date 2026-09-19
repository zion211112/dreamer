// Inspection Mode (4): the school record audited by rule before it is
// audited by person. The same contract as the studio's content audit
// (audit.ts) — every check is a pure function of the data on this device,
// no state, no IO — so a finding is reproducible, signable and printable.
//
// Checks mirror what an inspector actually opens first: the roll, its
// completeness, identities, the scores behind it, the bands it projects,
// and the money still out the door.

import { forecast } from "./kcse";
import { FeePayment, FeeTerm, standingFor } from "./fees";
import { Assessment, Student } from "./school";

export type Sev = "pass" | "watch" | "fail";

export interface Finding {
  id: string;
  sev: Sev;
  title: string;
  detail: string;
  fix?: string;
}

export interface RollSummary {
  cls: string;
  total: number;
  boys: number;
  girls: number;
}

export interface Inspection {
  score: number; // 0–100 — a pass counts 1, a watch half
  checks: Finding[];
  counts: { pass: number; watch: number; fail: number };
  roll: RollSummary[];
}

export function inspectSchool(
  students: Student[],
  assessments: Assessment[],
  feeTerms: FeeTerm[],
  feePayments: FeePayment[]
): Inspection {
  const cs: Finding[] = [];
  const count = (f: Finding) => cs.push(f);

  // 1 · The roll itself.
  const classes = [...new Set(students.map((s) => s.className).filter(Boolean))];
  const roll: RollSummary[] = classes
    .map((cls) => {
      const inClass = students.filter((s) => s.className === cls);
      return {
        cls,
        total: inClass.length,
        boys: inClass.filter((s) => s.sex === "M").length,
        girls: inClass.filter((s) => s.sex === "F").length
      };
    })
    .sort((a, b) => a.cls.localeCompare(b.cls, undefined, { numeric: true }));
  count({
    id: "roll",
    sev: "pass",
    title: `${students.length} students across ${classes.length} class${classes.length === 1 ? "" : "es"}`,
    detail: "The roll is present. Every other check reads from it."
  });

  // 2 · Roll completeness: a row without a parent or a class is a hole an
  // inspector finds on minute one.
  const incomplete = students.filter(
    (s) => !s.parentPhone.trim() || !s.parentName.trim() || !s.className.trim()
  ).length;
  const completeness = 1 - incomplete / Math.max(1, students.length);
  if (incomplete === 0)
    count({ id: "complete", sev: "pass", title: "Every row is complete", detail: "Parent, contact and class on all students — the roll closes." });
  else if (completeness >= 0.75)
    count({
      id: "complete",
      sev: "watch",
      title: `${incomplete} row${incomplete === 1 ? "" : "s"} without a parent, contact or class`,
      detail: "Above the 75% bar, but an inspector can open any of them.",
      fix: "Open Roster Import and fill the gaps."
    });
  else
    count({
      id: "complete",
      sev: "fail",
      title: `${incomplete} of ${students.length} rows incomplete`,
      detail: "Below the 75% bar — more than a quarter of the roll cannot be reached or placed.",
      fix: "Re-import the roster with full rows."
    });
  // 3 · Identities: the same adm no on two students is a fail; the same
  // name in one class is a watch — possibly twins, possibly a duplicate.
  const byAdm = new Map<string, number>();
  const byName = new Map<string, number>();
  for (const s of students) {
    const adm = s.admNo.trim().toUpperCase();
    if (adm) byAdm.set(adm, (byAdm.get(adm) || 0) + 1);
    const nm = `${s.name.trim().toLowerCase()}@${s.className.trim().toLowerCase()}`;
    byName.set(nm, (byName.get(nm) || 0) + 1);
  }
  const admDupes = [...byAdm.values()].filter((n) => n > 1).reduce((a, n) => a + n - 1, 0);
  const nameDupes = [...byName.values()].filter((n) => n > 1).length;
  if (admDupes > 0)
    count({
      id: "identity",
      sev: "fail",
      title: `${admDupes} student${admDupes === 1 ? "" : "s"} share an adm no`,
      detail: "Two records under one identity — reports and fees will land on the wrong row.",
      fix: "De-duplicate in Roster Import."
    });
  else if (nameDupes > 0)
    count({
      id: "identity",
      sev: "watch",
      title: `${nameDupes} name collision${nameDupes === 1 ? "" : "s"} inside a class`,
      detail: "Possibly twins, possibly a paste double. Confirm before the term report goes out.",
      fix: "Confirm each pair in Roster Import."
    });
  else count({ id: "identity", sev: "pass", title: "Identities are unique", detail: "No shared adm numbers, no name collisions within a class." });

  // 4 · Score coverage: reports and forecasts only exist where scores do.
  const known = new Set(students.map((s) => s.id));
  const scored = new Set(assessments.filter((a) => known.has(a.studentId)).map((a) => a.studentId)).size;
  const cover = scored / Math.max(1, students.length);
  if (scored === 0)
    count({
      id: "coverage",
      sev: "fail",
      title: "No scores on record",
      detail: "Reports and KCSE forecasts have nothing to stand on.",
      fix: "Open Term Reports and enter the first exam."
    });
  else if (cover >= 0.8)
    count({ id: "coverage", sev: "pass", title: `${scored} of ${students.length} students carry scores`, detail: "Coverage is inspection-safe." });
  else if (cover >= 0.5)
    count({
      id: "coverage",
      sev: "watch",
      title: `${students.length - scored} students have no scores yet`,
      detail: "Above half the roll is covered; the rest will print blank cards.",
      fix: "Enter the missing exams in Term Reports."
    });
  else
    count({
      id: "coverage",
      sev: "fail",
      title: `Only ${Math.round(cover * 100)}% of the roll has scores`,
      detail: "Most reports would be empty shells.",
      fix: "Backfill scores in Term Reports."
    });

  // 5 · Score consistency: out of range is a data error, not a judgement.
  const bad = assessments.filter((a) => a.score < 0 || (a.max > 0 && a.score > a.max)).length;
  count(
    bad === 0
      ? { id: "consistency", sev: "pass", title: "Scores are in range", detail: "No entry above its maximum, none negative." }
      : {
          id: "consistency",
          sev: "watch",
          title: `${bad} score${bad === 1 ? "" : "s"} out of range`,
          detail: "A score above its maximum — usually a paste that lost its column.",
          fix: "Correct the entries in Term Reports."
        }
  );

  // 6 · The projection: of the students the ledger can forecast, how many
  // sit on the credit line? The audit reports; it does not fix.
  const forecasts = students
    .map((s) => forecast(assessments, s.id))
    .filter((f): f is NonNullable<ReturnType<typeof forecast>> => f !== null);
  if (forecasts.length > 0) {
    const credit = forecasts.filter((f) => f.mean >= 150).length; // C+ and above
    const pct = Math.round((credit / forecasts.length) * 100);
    if (pct >= 60)
      count({
        id: "bands",
        sev: "pass",
        title: `${pct}% of the class sits at credit or above`,
        detail: "C+ is the credit line — the projection is healthy."
      });
    else
      count({
        id: "bands",
        sev: "watch",
        title: `${pct}% of the class sits at credit or above`,
        detail: "Below the 60% line the cohort needs remedial support, not another exam.",
        fix: "Open Grade Forecast for the weak subjects per student."
      });
  }

  // 7 · The money: if a term is invoiced, how much of it is back?
  if (feeTerms.length > 0) {
    const latest = [...feeTerms].sort((a, b) => b.ts - a.ts)[0];
    const stand = students.map((s) => standingFor(latest, feePayments.filter((p) => p.term === latest.term), s.id));
    const billed = stand.reduce((a, s) => a + s.billed, 0);
    const outstanding = stand.reduce((a, s) => a + s.balance, 0);
    const atRisk = stand.filter((s) => s.risk === "high").length;
    const pct = billed > 0 ? Math.round(((billed - outstanding) / billed) * 100) : 100;
    if (pct >= 80)
      count({
        id: "fees",
        sev: "pass",
        title: `${pct}% of the ${latest.term} invoice is back`,
        detail: `${atRisk} student${atRisk === 1 ? "" : "s"} still high-risk — their names are on the fee sheet.`
      });
    else if (pct >= 50)
      count({
        id: "fees",
        sev: "watch",
        title: `${pct}% of the ${latest.term} invoice is back`,
        detail: `${kes(outstanding)} outstanding · ${atRisk} at high risk.`,
        fix: "Open Fee Tracking — the M-Pesa sheet prints from there."
      });
    else
      count({
        id: "fees",
        sev: "fail",
        title: `Only ${pct}% of the ${latest.term} invoice is back`,
        detail: `${kes(outstanding)} outstanding — the highest exposure on this record.`,
        fix: "Run the reconciliation in Fee Tracking, then chase by Comms."
      });
  } else {
    count({ id: "fees", sev: "pass", title: "No fee invoice on the record", detail: "No term invoiced yet — no money exposure to report." });
  }

  const total = cs.length;
  const full = cs.filter((c) => c.sev === "pass").length;
  const half = cs.filter((c) => c.sev === "watch").length;
  const fails = total - full - half;
  const score = total === 0 ? 0 : Math.round(((full + 0.5 * half) / total) * 100);
  return { score, checks: cs, counts: { pass: full, watch: half, fail: fails }, roll };
}

// One number-format answer in the lib, not in the view.
export function kes(n: number): string {
  return `KSh ${Math.round(n).toLocaleString("en-US")}`;
}

