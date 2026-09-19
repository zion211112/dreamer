"use client";

// Tool 7 — Auto-Marking. A mark scheme is graded against each student's
// answers; results roll up into a topic-level weakness map. Scheme and
// results live in the "meta" store of IndexedDB.

import { useEffect, useState } from "react";
import { idbAll, idbPut } from "../../lib/db";
import { useSchoolData } from "./useSchoolData";
import { btn, btnGhost, field, Gate, HeadRow, Loading, monoLabel, Notice, panel } from "./bits";

interface Q {
  id: string;
  topic: string;
  answer: string;
  marks: number;
}
interface Result {
  studentId: string;
  got: number[];
  total: number;
  ts: string;
}
interface Marking {
  id: "console-marking";
  exam: string;
  questions: Q[];
  results: Result[];
}

const KEY = "console-marking";
const editInput =
  "rounded-lg border border-white/10 bg-void px-2.5 py-1.5 text-[13px] text-ivory outline-none focus:border-gold";

export default function AutoMarking() {
  const data = useSchoolData();
  const [exam, setExam] = useState("");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      const rows = (await idbAll<Partial<Marking>>("meta")).filter((m) => m.id === KEY);
      if (rows[0]) {
        setExam(rows[0].exam ?? "");
        setQuestions(rows[0].questions ?? []);
        setResults(rows[0].results ?? []);
      }
    })();
  }, []);

  if (data.loading) return <Loading />;

  if (data.students.length === 0)
    return (
      <Gate
        title="Nobody to mark against."
        body="Auto-Marking grades a scheme against students on the roll. Import the roll first, then build the scheme."
      />
    );

  async function saveAll() {
    await idbPut<Marking>("meta", { id: KEY, exam, questions, results });
    setNotice("Scheme and results saved to this device.");
    setTimeout(() => setNotice(""), 4000);
  }

  function grade() {
    if (questions.length === 0 || !studentId) return;
    const got = questions.map((q) =>
      (answers[q.id] ?? "").trim().toUpperCase() === q.answer.trim().toUpperCase() ? q.marks : 0
    );
    const total = got.reduce((a, b) => a + b, 0);
    setResults((r) => [
      ...r.filter((x) => x.studentId !== studentId),
      { studentId, got, total, ts: new Date().toISOString() }
    ]);
    setAnswers({});
    setNotice("");
  }

  const topics = new Map<string, { got: number; possible: number; n: number }>();
  for (const r of results) {
    questions.forEach((q, i) => {
      const t = topics.get(q.topic || "General") ?? { got: 0, possible: 0, n: 0 };
      t.got += r.got[i] ?? 0;
      t.possible += q.marks;
      t.n += 1;
      topics.set(q.topic || "General", t);
    });
  }
  const topicRows = [...topics.entries()]
    .map(([topic, t]) => ({ topic, pct: t.possible > 0 ? Math.round((t.got / t.possible) * 100) : 0, n: t.n }))
    .sort((a, b) => a.pct - b.pct);

  const selStudent = data.students.find((s) => s.id === studentId);
  const schemeMax = questions.reduce((a, q) => a + q.marks, 0);

  return (
    <>
      <HeadRow label="Auto-marking · scheme + weakness map" />
      <div className="grid gap-[21px] xl:grid-cols-2">
        <div className={panel}>
          <div className="flex flex-wrap items-center gap-3">
            <input value={exam} onChange={(e) => setExam(e.target.value)} placeholder="Test title, e.g. F2 Chemistry — Acids" className={field + " min-w-[220px] flex-1"} />
            <button className={btnGhost} onClick={() => void saveAll()}>Save scheme</button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Q", "Topic", "Correct", "Marks", ""].map((h) => (
                    <th key={h} className="border-b border-white/10 px-2 py-2 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-dim">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-2 py-6 text-center text-sm text-muted">
                      No questions yet. Add the scheme — topic, correct answer, marks.
                    </td>
                  </tr>
                )}
                {questions.map((q, i) => (
                  <tr key={q.id}>
                    <td className="px-2 py-1.5 font-mono text-[12px] text-dim">{i + 1}</td>
                    <td className="px-2 py-1.5">
                      <input value={q.topic} onChange={(e) => setQuestions(questions.map((x) => (x.id === q.id ? { ...x, topic: e.target.value } : x)))} placeholder="Topic" className={editInput + " w-full"} />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={q.answer} onChange={(e) => setQuestions(questions.map((x) => (x.id === q.id ? { ...x, answer: e.target.value } : x)))} placeholder="e.g. B" className={editInput + " w-16"} />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" min={1} value={q.marks} onChange={(e) => setQuestions(questions.map((x) => (x.id === q.id ? { ...x, marks: Math.max(1, parseInt(e.target.value) || 1) } : x)))} className={editInput + " w-14"} />
                    </td>
                    <td className="px-2 py-1.5">
                      <button className="font-mono text-[10px] uppercase text-dim hover:text-red-400" onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))}>Cut</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-dim hover:text-gold"
            onClick={() => setQuestions([...questions, { id: `Q${Date.now().toString(36)}`, topic: "", answer: "", marks: 1 }])}
          >
            + Add question
          </button>
        </div>

        <div className="flex flex-col gap-[21px]">
          {/* GRADING */}
          <div className={panel}>
            <p className={monoLabel}>Grade a student</p>
            <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setAnswers({}); }} className={field + " mt-4"}>
              <option value="">Pick a student…</option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.admNo ? ` (${s.admNo})` : ""}</option>
              ))}
            </select>

            {selStudent && questions.length > 0 && (
              <>
                <div className="mt-4 space-y-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] text-muted">
                        <span className="font-mono text-[11px] text-dim">Q{i + 1} · {q.marks} mark(s)</span>{" "}
                        {q.topic || "No topic"}
                      </span>
                      <input value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="Answer" className={editInput + " w-24"} />
                    </div>
                  ))}
                </div>
                <button className={btn + " mt-5 w-full"} onClick={grade}>
                  Mark {selStudent.name} · total {schemeMax}
                </button>
                {results.find((r) => r.studentId === selStudent.id) && (
                  <Notice>
                    {selStudent.name}: {results.find((r) => r.studentId === selStudent.id)!.total} of {schemeMax}
                  </Notice>
                )}
              </>
            )}
            {!selStudent && <p className="mt-4 text-sm text-muted">Pick a student, enter the test answers, mark.</p>}
          </div>

          {/* WEAKNESS MAP */}
          <div className={panel}>
            <p className={monoLabel}>Class weakness map · {results.length} students marked</p>
            {topicRows.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                Mark at least one student and the topic-level map appears — where the class is losing
                the marks, ranked weakest first.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {topicRows.map((t, i) => (
                  <div key={t.topic}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className={i === 0 ? "font-semibold text-gold" : "text-muted"}>
                        {i === 0 ? `Teach this first: ${t.topic}` : t.topic}
                      </span>
                      <span className="font-mono text-dim">{t.pct}% · {t.n} tests</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-edge">
                      <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.pct < 40 ? "#ef4444" : t.pct < 70 ? "#f5b30b" : "#34d399" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {notice && <Notice>{notice}</Notice>}
          </div>
        </div>
      </div>
    </>
  );
}

