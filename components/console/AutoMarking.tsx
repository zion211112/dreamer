"use client";

// Tool 7 — Auto-Marking. A mark scheme is graded against each student's
// answers; results roll up into a topic-level weakness map. Scheme and
// results live in the "meta" store of IndexedDB.

import { useEffect, useState } from "react";
import { idbAll, idbPut } from "../../lib/db";
import { scoreKey } from "../../lib/school";
import { useSchoolData } from "./useSchoolData";
import {
  demoExtractAnswers,
  markRow,
  parseCsvPapers,
  parseJsonPapers,
  PaperResult,
  ScannedPaper,
  SchemeQ
} from "../../lib/mark-engine";
import { btn, btnGhost, field, Gate, HeadRow, Loading, monoLabel, Notice, panel } from "./bits";

interface Q {
  id: string;
  topic: string;
  answer: string;
  marks: number;
  keywords?: string; // any-of phrases, comma separated — partial-credit path
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
  subject?: string;
  questions: Q[];
  results: Result[];
}

const KEY = "console-marking";
const editInput =
  "rounded-lg border border-ink/10 bg-void px-2.5 py-1.5 text-ui text-ink outline-none focus:border-signal";

export default function AutoMarking() {
  const data = useSchoolData();
  const [exam, setExam] = useState("");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [subject, setSubject] = useState("");
  const [papers, setPapers] = useState<ScannedPaper[]>([]);
  const [batchResults, setBatchResults] = useState<PaperResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState("");

  useEffect(() => {
    (async () => {
      const rows = (await idbAll<Partial<Marking>>("meta")).filter((m) => m.id === KEY);
      if (rows[0]) {
        setExam(rows[0].exam ?? "");
        setSubject(rows[0].subject ?? "");
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
    await idbPut<Marking>("meta", { id: KEY, exam, questions, results, subject });
    setNotice("Scheme and results saved to this device.");
    setTimeout(() => setNotice(""), 4000);
  }

  function schemeQs(): SchemeQ[] {
    return questions.map((q) => ({
      id: q.id,
      topic: q.topic,
      answer: q.answer,
      marks: q.marks,
      keywords: q.keywords ? q.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined
    }));
  }

  // A paper row's first cell may be an id, a name, or "id · name".
  // Resolve against the roll: id first, then full name, then admission no.
  function resolveStudent(who: string) {
    const w = who.trim();
    return (
      data.students.find((s) => s.id === w) ??
      data.students.find((s) => s.name.toLowerCase() === w.toLowerCase()) ??
      data.students.find((s) => s.admNo.toLowerCase() === w.toLowerCase())
    );
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0 || questions.length === 0) {
      setScanNote("Build the scheme first — the stack has no questions to mark against.");
      return;
    }
    const qs = schemeQs();
    const next: ScannedPaper[] = [];
    let typed = 0;
    let scanned = 0;
    for (const f of Array.from(files)) {
      const lower = f.name.toLowerCase();
      if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
        const rows = parseCsvPapers(await f.text(), qs);
        if (rows.length === 0) { setScanNote(`${f.name} had no data rows.`); continue; }
        typed += rows.length;
        next.push(...rows);
      } else if (lower.endsWith(".json")) {
        try {
          const rows = parseJsonPapers(await f.text(), qs);
          typed += rows.length;
          next.push(...rows);
        } catch { setScanNote(`${f.name} is not a valid batch JSON.`); }
      } else {
        // Photo or PDF — a scan. On-device demo extraction stands in for the
        // vision pass; a model replaces demoExtractAnswers at this call site.
        scanned += 1;
        next.push({ kind: "scan", studentName: f.name.replace(/\.[^.]+$/, ""), raw: demoExtractAnswers(f.name, qs), demo: true });
      }
    }
    setPapers((p) => [...p, ...next]);
    setScanNote(
      next.length === 0
        ? "Nothing new in the stack."
        : `Read ${next.length} papers — ${typed} typed, ${scanned} scanned (demo extraction). Mark the stack when ready.`
    );
  }

  async function runBatch() {
    if (papers.length === 0) return;
    setScanning(true);
    setScanNote("");
    const qs = schemeQs();
    const marked: PaperResult[] = [];
    const unmatched: string[] = [];
    for (const p of papers) {
      await new Promise((r) => setTimeout(r, 150)); // paced — a stack has weight
      const s = resolveStudent(p.studentName);
      if (!s) { unmatched.push(p.studentName); continue; }
      marked.push(markRow(qs, { studentId: s.id, studentName: s.name, raw: p.raw }));
    }
    setBatchResults(marked);
    // Fold the stack into the results so the weakness map sees it, and
    // persist the doc in one move — manual and batch share one store.
    const merged = [
      ...results.filter((x) => !marked.some((m) => m.studentId === x.studentId)),
      ...marked.map((m) => ({ studentId: m.studentId, got: m.got, total: m.total, ts: new Date().toISOString() }))
    ];
    setResults(merged);
    void idbPut<Marking>("meta", { id: KEY, exam, questions, results: merged, subject });
    setPapers([]);
    setScanning(false);
    setScanNote(
      `Marked ${marked.length} of ${papers.length} papers against the scheme.` +
      (unmatched.length ? ` ${unmatched.length} didn't match the roll: ${unmatched.join(", ")}.` : "")
    );
  }

  function dropBatchRow(r: PaperResult) {
    setBatchResults((b) => b.filter((x) => x.studentId !== r.studentId));
    setResults((prev) => {
      const next = prev.filter((x) => x.studentId !== r.studentId);
      void idbPut<Marking>("meta", { id: KEY, exam, questions, results: next, subject });
      return next;
    });
  }

  // The synergy write: every marked paper becomes an Assessment record,
  // keyed exam|student|subject — Term Reports, Grade Forecast and My Day
  // read the same store, so one click puts the stack on every report.
  async function writeRecords() {
    if (batchResults.length === 0) return;
    const examLabel = exam.trim() || "Auto-marked test";
    const subjectLabel = subject.trim() || "General";
    for (const r of batchResults) {
      await data.putScore({
        key: scoreKey(examLabel, r.studentId, subjectLabel),
        exam: examLabel,
        studentId: r.studentId,
        subject: subjectLabel,
        score: r.total,
        max: r.max
      });
    }
    setNotice(
      `${batchResults.length} scores written to records · ${examLabel} (${subjectLabel}). Term Reports and Grade Forecast now see this exam.`
    );
    setBatchResults([]);
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
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject, e.g. Chemistry" className={field + " min-w-[160px] w-[220px]"} />
            <button className={btnGhost} onClick={() => void saveAll()}>Save scheme</button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Q", "Topic", "Correct", "Keywords", "Marks", ""].map((h) => (
                    <th key={h} className="border-b border-ink/10 px-2 py-2 text-left font-mono text-micro uppercase tracking-[0.15em] text-ash">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-2 py-6 text-center text-sm text-dust">
                      No questions yet. Add the scheme — topic, correct answer, marks.
                    </td>
                  </tr>
                )}
                {questions.map((q, i) => (
                  <tr key={q.id}>
                    <td className="px-2 py-1.5 font-mono text-meta text-ash">{i + 1}</td>
                    <td className="px-2 py-1.5">
                      <input value={q.topic} onChange={(e) => setQuestions(questions.map((x) => (x.id === q.id ? { ...x, topic: e.target.value } : x)))} placeholder="Topic" className={editInput + " w-full"} />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={q.answer} onChange={(e) => setQuestions(questions.map((x) => (x.id === q.id ? { ...x, answer: e.target.value } : x)))} placeholder="e.g. B" className={editInput + " w-16"} />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={q.keywords ?? ""} onChange={(e) => setQuestions(questions.map((x) => (x.id === q.id ? { ...x, keywords: e.target.value } : x)))} placeholder="any-of, comma-sep" className={editInput + " w-full"} />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" min={1} value={q.marks} onChange={(e) => setQuestions(questions.map((x) => (x.id === q.id ? { ...x, marks: Math.max(1, parseInt(e.target.value) || 1) } : x)))} className={editInput + " w-14"} />
                    </td>
                    <td className="px-2 py-1.5">
                      <button className="font-mono text-micro uppercase text-ash hover:text-signal" onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))}>Cut</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 font-mono text-label uppercase tracking-[0.15em] text-ash hover:text-signal"
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
                      <span className="truncate text-ui text-dust">
                        <span className="font-mono text-label text-ash">Q{i + 1} · {q.marks} mark(s)</span>{" "}
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
            {!selStudent && <p className="mt-4 text-sm text-dust">Pick a student, enter the test answers, mark.</p>}
          </div>

          {/* SCANNED STACK — the bulk path: import, auto-mark, fill records */}
          <div className={panel}>
            <p className={monoLabel}>Scan the stack · auto-mark · fill records</p>
            <p className="mt-3 text-sm leading-6 text-dust">
              Drop the papers in, one per student. CSV and JSON are read for real; photos and PDFs
              take the demo scan pass (a vision model drops in there later). Mark the whole stack
              against the scheme, then fill the records in one click — the term reports and the
              forecast read the same store.
            </p>
            <label className={btnGhost + " mt-4 inline-flex w-fit cursor-pointer"}>
              <input
                type="file"
                multiple
                accept=".csv,.txt,.json,image/*,application/pdf"
                className="hidden"
                onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }}
              />
              + Add papers to the stack
            </label>
            {papers.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <p className="font-mono text-micro uppercase tracking-[0.15em] text-ash">{papers.length} in the stack</p>
                <button className={btn + " flex-1"} onClick={() => void runBatch()} disabled={scanning || questions.length === 0}>
                  {scanning ? "Marking the stack…" : `Mark ${papers.length} papers`}
                </button>
              </div>
            )}
            {batchResults.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {["Student", "Score", "%", ""].map((h) => (
                        <th key={h} className="border-b border-ink/10 px-2 py-2 text-left font-mono text-micro uppercase tracking-[0.15em] text-ash">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((r) => {
                      const s = data.students.find((x) => x.id === r.studentId);
                      return (
                        <tr key={r.studentId}>
                          <td className="px-2 py-1.5 text-ui">{s ? s.name : r.studentName}</td>
                          <td className="px-2 py-1.5 font-mono text-meta text-ink">{r.total} / {r.max}</td>
                          <td className="px-2 py-1.5 font-mono text-meta text-dust">{r.max > 0 ? Math.round((r.total / r.max) * 100) : 0}%</td>
                          <td className="px-2 py-1.5 text-right">
                            <button className="font-mono text-micro uppercase text-ash hover:text-signal" onClick={() => dropBatchRow(r)}>
                              Drop
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button className={btn + " mt-4 w-full"} onClick={() => void writeRecords()}>
                  Fill the records · {batchResults.length} scores
                </button>
              </div>
            )}
            {scanNote !== "" && <Notice>{scanNote}</Notice>}
          </div>

          {/* WEAKNESS MAP */}
          <div className={panel}>
            <p className={monoLabel}>Class weakness map · {results.length} students marked</p>
            {topicRows.length === 0 ? (
              <p className="mt-4 text-sm text-dust">
                Mark at least one student and the topic-level map appears — where the class is losing
                the marks, ranked weakest first.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {topicRows.map((t, i) => (
                  <div key={t.topic}>
                    <div className="mb-1 flex items-center justify-between text-meta">
                      <span className={i === 0 ? "font-semibold text-signal" : "text-dust"}>
                        {i === 0 ? `Teach this first: ${t.topic}` : t.topic}
                      </span>
                      <span className="font-mono text-ash">{t.pct}% · {t.n} tests</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-edge">
                      <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.pct < 40 ? "#d4af37" : t.pct < 70 ? "#d4af37" : "#2dd4bf" }} />
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

