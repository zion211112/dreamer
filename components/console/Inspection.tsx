"use client";

// Tool 4 — Inspection Mode. The school record, audited by rule: every
// finding is a pure function of what is on this device, so it is
// reproducible and signable. One click prints the whole dossier — roll
// summary, findings, sign-off lines — on a white A4 sheet, like every
// other sheet in this console.

import { useEffect, useMemo, useState } from "react";
import { FeePayment, FeeTerm, loadFeePayments, loadFeeTerms } from "../../lib/fees";
import { Finding, inspectSchool, Sev } from "../../lib/inspection";
import { useSchoolData } from "./useSchoolData";
import { Gate, HeadRow, Loading, monoLabel, panel, PrintButton } from "./bits";

const SEV_CHIP: Record<Sev, string> = {
  pass: "border-emerald-400/25 bg-emerald-400/15 text-emerald-300",
  watch: "border-amber-400/25 bg-amber-400/15 text-amber-300",
  fail: "border-red-400/25 bg-red-400/15 text-red-400"
};
const SEV_WORD: Record<Sev, string> = { pass: "Clear", watch: "Watch", fail: "Open" };

function SevChip({ sev }: { sev: Sev }) {
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${SEV_CHIP[sev]}`}>
      {SEV_WORD[sev]}
    </span>
  );
}

export default function Inspection() {
  const data = useSchoolData();
  const [terms, setTerms] = useState<FeeTerm[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);

  useEffect(() => {
    (async () => {
      const [t, p] = await Promise.all([loadFeeTerms(), loadFeePayments()]);
      setTerms(t);
      setPayments(p);
    })();
  }, []);

  const inspection = useMemo(
    () => inspectSchool(data.students, data.assessments, terms, payments),
    [data.students, data.assessments, terms, payments]
  );

  if (data.loading) return <Loading />;
  if (data.students.length === 0)
    return (
      <Gate
        title="No record to inspect."
        body="Inspection Mode audits what is on this device. Import the roll first — then the dossier writes itself."
      />
    );

  const { checks, counts, roll, score } = inspection;

  return (
    <>
      <HeadRow label={`Inspection dossier · ${data.school || "your school"}`} right={<PrintButton label="Print the dossier" />} />

      {/* The score, the way the audit weighs it: a pass counts one, a watch half. */}
      <div className={panel + " mb-[21px]"}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Dossier score</p>
            <p className="font-mono text-3xl text-ivory">
              {score}
              <span className="text-base text-dim">/100</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SevChip sev="pass" />
            <span className="font-mono text-[12px] text-dim">{counts.pass} clear</span>
          </div>
          <div className="flex items-center gap-2">
            <SevChip sev="watch" />
            <span className="font-mono text-[12px] text-dim">{counts.watch} to watch</span>
          </div>
          <div className="flex items-center gap-2">
            <SevChip sev="fail" />
            <span className="font-mono text-[12px] text-dim">{counts.fail} open</span>
          </div>
        </div>
        <p className="mt-4 max-w-[60ch] text-[13px] leading-6 text-muted">
          Every finding below is a rule run over the data on this device — the same roll, scores and fee ledger
          the rest of the console reads. Reproducible, and print-ready.
        </p>
      </div>

      {/* The findings: the auditor's walk-through, in the order an inspector opens things. */}
      <div className={panel + " p-0 mb-[21px]"}>
        <div className="border-b border-white/10 px-4 py-3 md:px-5">
          <span className={monoLabel}>Findings</span>
        </div>
        <ul>
          {checks.map((c: Finding) => (
            <li key={c.id} className="flex flex-wrap items-start gap-3 border-b border-white/10/50 px-4 py-3 last:border-0 md:px-5">
              <SevChip sev={c.sev} />
              <div className="min-w-[200px] flex-1">
                <p className="text-[13px] text-ivory">{c.title}</p>
                <p className="mt-0.5 text-[12px] leading-5 text-muted">{c.detail}</p>
                {c.fix && (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">Fix · {c.fix}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* The sign-off: when the open findings are cleared, the record is what
          gets signed. Printing lives in the head, not here — one button,
          one paper. */}
      <div className={panel}>
        <div>
          <span className={monoLabel}>Sign-off</span>
          <p className="mt-2 max-w-[52ch] text-[13px] leading-6 text-muted">
            {counts.fail > 0
              ? `${counts.fail} open finding${counts.fail === 1 ? "" : "s"} keep this record unsigned — clear them, then the dossier prints clean.`
              : "No open findings — the record stands as it is. Print the dossier; the sign-off lines are on the last sheet."}
          </p>
        </div>
      </div>
      {/* The dossier itself: white A4, the only thing that reaches paper. */}
      <div className="print-sheet mt-6 rounded-[21px] bg-white p-6 text-black">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">APT-LABS · {data.school || "School"}</p>
        <h3 className="mt-2 font-display text-2xl">INSPECTION DOSSIER</h3>
        <p className="mt-1 text-[13px]">
          Generated {new Date().toISOString().slice(0, 10)} · {data.students.length} students · dossier score{" "}
          {score}/100
        </p>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">The roll</p>
        <table className="mt-1 w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Class", "Students", "Boys", "Girls"].map((h) => (
                <th key={h} className="border-b border-neutral-300 px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roll.map((r) => (
              <tr key={r.cls}>
                <td className="border-b border-neutral-200 px-2 py-1.5">{r.cls}</td>
                <td className="border-b border-neutral-200 px-2 py-1.5 font-mono text-[12px]">{r.total}</td>
                <td className="border-b border-neutral-200 px-2 py-1.5 font-mono text-[12px]">{r.boys}</td>
                <td className="border-b border-neutral-200 px-2 py-1.5 font-mono text-[12px]">{r.girls}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
          Findings · {counts.pass} clear · {counts.watch} watch · {counts.fail} open
        </p>
        <ul className="mt-2 space-y-2">
          {checks.map((c) => (
            <li key={c.id} className="text-[13px] leading-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">[{SEV_WORD[c.sev]}]</span>{" "}
              <strong>{c.title}</strong> — {c.detail}
              {c.fix && <span className="text-neutral-600"> Fix: {c.fix}</span>}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex gap-10">
          <p className="w-44 border-t border-neutral-400 pt-1 text-[11px]">Head teacher</p>
          <p className="w-44 border-t border-neutral-400 pt-1 text-[11px]">Inspector</p>
          <p className="w-28 border-t border-neutral-400 pt-1 text-[11px]">Date</p>
        </div>
      </div>
    </>
  );
}

