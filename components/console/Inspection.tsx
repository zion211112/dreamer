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
  pass: "border-signal/25 bg-signal/10 text-signal",
  watch: "border-signal/25 bg-signal/10 text-signal",
  fail: "border-signal/40 bg-signal/15 text-signal"
};
const SEV_WORD: Record<Sev, string> = { pass: "Clear", watch: "Watch", fail: "Open" };

function SevChip({ sev }: { sev: Sev }) {
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-micro uppercase tracking-[0.12em] ${SEV_CHIP[sev]}`}>
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
            <p className="font-mono text-micro uppercase tracking-[0.2em] text-ash">Dossier score</p>
            <p className="font-mono text-3xl text-ink">
              {score}
              <span className="text-base text-ash">/100</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SevChip sev="pass" />
            <span className="font-mono text-meta text-ash">{counts.pass} clear</span>
          </div>
          <div className="flex items-center gap-2">
            <SevChip sev="watch" />
            <span className="font-mono text-meta text-ash">{counts.watch} to watch</span>
          </div>
          <div className="flex items-center gap-2">
            <SevChip sev="fail" />
            <span className="font-mono text-meta text-ash">{counts.fail} open</span>
          </div>
        </div>
        <p className="mt-4 max-w-[60ch] text-ui leading-6 text-dust">
          Every finding below is a rule run over the data on this device — the same roll, scores and fee ledger
          the rest of the console reads. Reproducible, and print-ready.
        </p>
      </div>

      {/* The findings: the auditor's walk-through, in the order an inspector opens things. */}
      <div className={panel + " p-0 mb-[21px]"}>
        <div className="border-b border-ink/10 px-4 py-3 md:px-5">
          <span className={monoLabel}>Findings</span>
        </div>
        <ul>
          {checks.map((c: Finding) => (
            <li key={c.id} className="flex flex-wrap items-start gap-3 border-b border-ink/10/50 px-4 py-3 last:border-0 md:px-5">
              <SevChip sev={c.sev} />
              <div className="min-w-[200px] flex-1">
                <p className="text-ui text-ink">{c.title}</p>
                <p className="mt-0.5 text-meta leading-5 text-dust">{c.detail}</p>
                {c.fix && (
                  <p className="mt-1 font-mono text-micro uppercase tracking-[0.12em] text-signal">Fix · {c.fix}</p>
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
          <p className="mt-2 max-w-[52ch] text-ui leading-6 text-dust">
            {counts.fail > 0
              ? `${counts.fail} open finding${counts.fail === 1 ? "" : "s"} keep this record unsigned — clear them, then the dossier prints clean.`
              : "No open findings — the record stands as it is. Print the dossier; the sign-off lines are on the last sheet."}
          </p>
        </div>
      </div>
      {/* The dossier itself: white A4, the only thing that reaches paper. */}
      <div className="print-sheet bg-white p-6 text-void">
        <p className="font-mono text-micro uppercase tracking-[0.3em]">APT-LABS · {data.school || "School"}</p>
        <h3 className="mt-2 font-serif text-2xl">INSPECTION DOSSIER</h3>
        <p className="mt-1 text-ui">
          Generated {new Date().toISOString().slice(0, 10)} · {data.students.length} students · dossier score{" "}
          {score}/100
        </p>

        <p className="mt-4 font-mono text-micro uppercase tracking-[0.15em] text-void/70">The roll</p>
        <table className="mt-1 w-full border-collapse text-ui">
          <thead>
            <tr>
              {["Class", "Students", "Boys", "Girls"].map((h) => (
                <th key={h} className="border-b border-ink/30 px-2 py-1.5 text-left font-mono text-micro uppercase tracking-[0.15em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roll.map((r) => (
              <tr key={r.cls}>
                <td className="border-b border-ink/50 px-2 py-1.5">{r.cls}</td>
                <td className="border-b border-ink/50 px-2 py-1.5 font-mono text-meta">{r.total}</td>
                <td className="border-b border-ink/50 px-2 py-1.5 font-mono text-meta">{r.boys}</td>
                <td className="border-b border-ink/50 px-2 py-1.5 font-mono text-meta">{r.girls}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 font-mono text-micro uppercase tracking-[0.15em] text-void/70">
          Findings · {counts.pass} clear · {counts.watch} watch · {counts.fail} open
        </p>
        <ul className="mt-2 space-y-2">
          {checks.map((c) => (
            <li key={c.id} className="text-ui leading-5">
              <span className="font-mono text-micro uppercase tracking-[0.12em] text-void/70">[{SEV_WORD[c.sev]}]</span>{" "}
              <strong>{c.title}</strong> — {c.detail}
              {c.fix && <span className="text-void/50"> Fix: {c.fix}</span>}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex gap-10">
          <p className="w-44 border-t border-ink/30 pt-1 text-label text-void/60">Head teacher</p>
          <p className="w-44 border-t border-ink/30 pt-1 text-label text-void/60">Inspector</p>
          <p className="w-28 border-t border-ink/30 pt-1 text-label text-void/60">Date</p>
        </div>
      </div>
    </>
  );
}

