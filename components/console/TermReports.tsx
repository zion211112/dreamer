"use client";

// Tool 2 — Term Reports. Enter scores per exam, per subject, per student —
// then print a report card. "One-click PDF" means the browser's own
// print-to-PDF: the card renders as a clean white A4 sheet and nothing
// else on the page prints. No libraries, no server.

import { useMemo, useState } from "react";
import { KCSE_SUBJECTS, bandFor } from "../../lib/kcse";
import { scoreKey } from "../../lib/school";
import { useSchoolData } from "./useSchoolData";
import { btn, btnGhost, cellInput, field, Gate, HeadRow, Loading, monoLabel, Notice, panel } from "./bits";

export default function TermReports() {
  const data = useSchoolData();
  const classes = useMemo(
    () => [...new Set(data.students.map((s) => s.className).filter(Boolean))].sort(),
    [data.students]
  );
  const [exam, setExam] = useState("Term 1 Exam");
  const [cls, setCls] = useState("");
  const [selId, setSelId] = useState("");
  const [cleared, setCleared] = useState("");

  if (data.loading) return <Loading />;

  if (data.students.length === 0)
    return (
      <Gate
        title="No students to report on."
        body="Term Reports reads the roll. Import it first, then scores come here, and cards come out."
      />
    );

  const classOf = cls || classes[0] || "";
  const rows = data.students.filter((s) => s.className === classOf);
  const scoreFor = (sid: string, subject: string) =>
    data.assessments.find((a) => a.key === scoreKey(exam, sid, subject))?.score ?? "";

  async function setScore(sid: string, subject: string, raw: string) {
    const key = scoreKey(exam, sid, subject);
    const n = parseFloat(raw);
    if (raw === "" || Number.isNaN(n)) {
      await data.removeScore(key);
      return;
    }
    await data.putScore({ key, exam, studentId: sid, subject, score: Math.max(0, Math.min(100, n)), max: 100 });
  }

  const sel = rows.find((s) => s.id === selId) ?? rows[0];
  const card = sel
    ? {
        subjects: KCSE_SUBJECTS.map((subject) => ({
          subject,
          score: scoreFor(sel.id, subject) as number | "",
          has: data.assessments.some((a) => a.key === scoreKey(exam, sel.id, subject))
        })),
        mean: (() => {
          const nums = KCSE_SUBJECTS.map((s) => scoreFor(sel.id, s)).filter((v) => typeof v === "number") as number[];
          return nums.length > 0 ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
        })()
      }
    : null;
  const band = card?.mean != null ? bandFor(card.mean) : null;
  const rank = sel ? classRankOf(sel.id, exam) : null;

  function classRankOf(sid: string, ex: string) {
    const means = rows.map((s) => {
      const nums = KCSE_SUBJECTS.map((sub) => scoreFor(s.id, sub)).filter((v) => typeof v === "number") as number[];
      return { id: s.id, m: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : -1 };
    });
    const ranked = means.filter((x) => x.m >= 0).sort((a, b) => b.m - a.m);
    const pos = ranked.findIndex((x) => x.id === sid) + 1;
    return pos > 0 ? { pos, of: ranked.length } : null;
  }

  async function clearExam() {
    if (!window.confirm(`Remove every score for "${exam}"? This cannot be undone.`)) return;
    await data.clearScores(exam);
    setCleared(`All "${exam}" scores removed.`);
    setTimeout(() => setCleared(""), 4000);
  }

  return (
    <>
      <HeadRow
        label="Term reports · score entry"
        right={
          <button className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim hover:text-red-400" onClick={() => void clearExam()}>
            Clear this exam
          </button>
        }
      />
      <div className="mb-[21px] flex flex-wrap gap-3">
        <input value={exam} onChange={(e) => setExam(e.target.value)} className={field + " w-52"} placeholder="Exam name" />
        <select value={classOf} onChange={(e) => { setCls(e.target.value); setSelId(""); }} className={field + " w-auto"}>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className={monoLabel + " self-center"}>
          {rows.length} students · scores out of 100
        </span>
      </div>

      <div className={panel + " p-0 mb-[21px]"}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-panel border-b border-edge px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                  Student
                </th>
                {KCSE_SUBJECTS.map((s) => (
                  <th key={s} className="border-b border-edge px-2 py-2 text-left font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
                    {s.replace(" & Government", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="sticky left-0 bg-panel px-3 py-1.5 text-[13px] text-ivory whitespace-nowrap">{s.name}</td>
                  {KCSE_SUBJECTS.map((sub) => (
                    <td key={sub} className="px-2 py-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={scoreFor(s.id, sub)}
                        onChange={(e) => void setScore(s.id, sub, e.target.value)}
                        className={cellInput}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {cleared && <Notice>{cleared}</Notice>}

      {/* The card itself: a white A4 sheet, hidden on screen, the only
          thing the browser prints. */}
      {sel && card && (
        <>
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={monoLabel}>Report card · {classOf}</span>
              <div className="flex flex-wrap items-center gap-3">
                <select value={sel.id} onChange={(e) => setSelId(e.target.value)} className={field + " w-56"}>
                  {rows.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.admNo ? ` (${s.admNo})` : ""}</option>
                  ))}
                </select>
                <button className={btn} onClick={() => window.print()}>
                  Print / Save PDF
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
              <div className="print-sheet rounded-[21px] bg-white p-6 text-black">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em]">APT-LABS · {data.school || "School"}</p>
                <h3 className="mt-2 font-display text-2xl">REPORT CARD — {exam}</h3>
                <p className="mt-1 text-[13px]">{sel.name} · {sel.className}{sel.stream ? ` · ${sel.stream}` : ""} · Adm {sel.admNo || "—"}</p>
                <table className="mt-4 w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      {["Subject", "Score", "Band"].map((h) => (
                        <th key={h} className="border-b border-neutral-300 px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {card.subjects.map((s) => (
                      <tr key={s.subject}>
                        <td className="border-b border-neutral-200 px-2 py-1.5">{s.subject}</td>
                        <td className="border-b border-neutral-200 px-2 py-1.5">{s.has ? s.score : "—"}</td>
                        <td className="border-b border-neutral-200 px-2 py-1.5">{s.has ? bandFor(s.score as number).band : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-[14px]">
                  Mean: <strong>{card.mean ?? "—"}</strong> / 400
                  {band ? <> · Band <strong>{band.band}</strong></> : null}
                  {rank ? <> · Position {rank.pos} of {rank.of} in {classOf}</> : null}
                </p>
                {band && <p className="mt-1 text-[13px] italic">{band.remark}</p>}
                <div className="mt-8 flex gap-10">
                  <p className="border-t border-neutral-400 pt-1 text-[11px] w-40">Class teacher</p>
                  <p className="border-t border-neutral-400 pt-1 text-[11px] w-40">Head teacher</p>
                </div>
              </div>

              <div>
                <p className={monoLabel}>Before printing</p>
                <ul className="mt-3 space-y-2 text-[13px] leading-6 text-muted">
                  <li>Scores are out of 100 per subject.</li>
                  <li>Mean and band follow KCSE weights — one table, every tool.</li>
                  <li>Position is within {classOf || "the class"}.</li>
                  <li>&ldquo;Print / Save PDF&rdquo; opens the browser dialog; &ldquo;Save as PDF&rdquo; is the destination.</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

