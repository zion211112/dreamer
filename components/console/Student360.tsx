"use client";

// Student 360 — one view of one learner, shared by both doors. The teacher
// reaches it from My Day; the school reaches it from the roster. Same tabs,
// same data stores, role-filtered by whoever opened it. Every action writes
// an event to the day-ledger — notes and messages never pass through
// Compliance or Communication; they are one tap from here.

import { useMemo, useState } from "react";
import { Assessment, Student } from "../../lib/school";
import { classLabel, DayEvent, eventsForStudent } from "../../lib/events";
import { btn, btnGhost, field, HeadRow, monoLabel, panel, PrintButton } from "./bits";

const TABS = [
  ["profile", "Profile"],
  ["scores", "Scores"],
  ["notes", "Notes"],
  ["guardian", "Guardian"]
] as const;

type Tab = (typeof TABS)[number][0];

export default function Student360({
  student,
  assessments,
  events,
  onAddNote,
  onBack
}: {
  student: Student;
  assessments: Assessment[];
  events: DayEvent[];
  onAddNote: (student: Student, text: string) => Promise<void>;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const [noteText, setNoteText] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const mine = useMemo(() => eventsForStudent(events, student.id), [events, student.id]);
  const scores = useMemo(
    () =>
      assessments
        .filter((a) => a.studentId === student.id)
        .sort((a, b) => (a.exam < b.exam ? 1 : -1)),
    [assessments, student.id]
  );
  const notes = mine.filter((e) => e.type === "note" || e.type === "message");

  function printSheet(): string {
    const lines: string[] = [
      `${student.name}  ·  ${student.admNo || "no adm no"}  ·  ${classLabel(student)}`,
      `Sex: ${student.sex || "—"}   DOB: ${student.dob || "—"}`,
      `Guardian: ${student.parentName || "—"}   ${student.parentPhone || "—"}`,
      ""
    ];
    if (scores.length > 0) {
      lines.push("SCORES");
      for (const a of scores) lines.push(`${a.exam}  ·  ${a.subject || "—"}  ·  ${a.score}/${a.max}`);
      lines.push("");
    }
    if (notes.length > 0) {
      lines.push("NOTES & MESSAGES");
      for (const e of notes.slice(0, 12))
        lines.push(`${new Date(e.ts).toLocaleDateString("en-GB")}  ·  ${e.text.replace(/\n/g, " ")}`);
    }
    return lines.join("\n");
  }

  async function copyMessage() {
    if (!message.trim()) {
      setNotice("Write the message first. It copies clean, ready to paste.");
      return;
    }
    try {
      await navigator.clipboard.writeText(message.trim());
      setNotice("Message copied. Paste it into WhatsApp or SMS — nothing is sent from here.");
    } catch {
      setNotice("Clipboard unavailable. Select the text and copy it by hand.");
    }
  }

  async function saveNote() {
    if (!noteText.trim()) {
      setNotice("An empty note is not a note. Write the concern in a line.");
      return;
    }
    await onAddNote(student, noteText.trim());
    setNoteText("");
    setNotice("Note saved to this learner's record — on this device only.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={monoLabel}>Student 360 / {classLabel(student)}</p>
          <h2 className="mt-2 font-serif text-3xl font-light tracking-tight">{student.name}</h2>
          <p className="mt-1 font-mono text-meta text-ash">{student.admNo || "no adm no"}</p>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton label="Print summary" />
          <button onClick={onBack} className="font-mono text-label uppercase tracking-[0.15em] text-ash transition-colors hover:text-ink">
            ← Back
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Student 360 sections">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full border px-5 py-2 text-sm transition-colors ${
              tab === id ? "border-signal bg-signal/5 text-signal" : "border-edge text-dust hover:border-rule hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <section className={panel}>
          <HeadRow label="Profile" />
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div><dt className={monoLabel}>Class</dt><dd className="mt-1 text-ink">{classLabel(student)}</dd></div>
            <div><dt className={monoLabel}>Sex</dt><dd className="mt-1 text-ink">{student.sex || "—"}</dd></div>
            <div><dt className={monoLabel}>Date of birth</dt><dd className="mt-1 text-ink">{student.dob || "—"}</dd></div>
            <div><dt className={monoLabel}>Guardian</dt><dd className="mt-1 text-ink">{student.parentName || "—"}</dd></div>
            <div><dt className={monoLabel}>Guardian phone</dt><dd className="mt-1 font-mono text-ink">{student.parentPhone || "—"}</dd></div>
            <div><dt className={monoLabel}>Scores on record</dt><dd className="mt-1 text-ink">{scores.length}</dd></div>
          </dl>
        </section>
      )}

      {tab === "scores" && (
        <section className={panel}>
          <HeadRow label="Scores — every recorded assessment" />
          {scores.length === 0 ? (
            <p className="py-6 text-sm text-dust">No scores yet. Enter grades from My Day → today&apos;s class.</p>
          ) : (
            <table className="w-full text-left text-ui">
              <thead>
                <tr className={`${monoLabel} border-b border-edge`}>
                  <th className="px-3 py-2">Exam</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((a) => (
                  <tr key={a.key} className="border-b border-edge/50">
                    <td className="px-3 py-2 text-ink">{a.exam}</td>
                    <td className="px-3 py-2 text-dust">{a.subject || "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-ink">{a.score}/{a.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {tab === "notes" && (
        <section className={panel}>
          <HeadRow label="Notes — the concern log" right={<span className={monoLabel}>{notes.length} on record</span>} />
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="One line is enough: what you saw, when, and what you will watch for."
            className={`${field} rounded-2xl`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button onClick={() => void saveNote()} className={btn}>Add note</button>
          </div>
          {notes.length === 0 ? (
            <p className="mt-6 text-sm text-dust">Nothing flagged for this learner yet.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {notes.map((e) => (
                <li key={e.id} className="border-b border-edge/50 pb-3 text-sm">
                  <span className="font-mono text-label uppercase tracking-[0.15em] text-ash">
                    {new Date(e.ts).toLocaleDateString("en-GB")} · {e.type === "note" ? "Note" : "Message"} · {e.teacher}
                  </span>
                  <p className="mt-1 leading-6 text-ink">{e.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "guardian" && (
        <section className={panel}>
          <HeadRow label={`Guardian — ${student.parentName || "no guardian on record"}`} />
          <p className="font-mono text-ui text-ink">{student.parentPhone || "No phone on record — ask at the office."}</p>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hello ${student.parentName || "parent"}, I am ${student.name}'s teacher…`}
            className={`${field} mt-4 rounded-2xl`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button onClick={() => void copyMessage()} className={btnGhost}>Copy message</button>
            <span className={monoLabel}>Nothing sends from here — you press send</span>
          </div>
        </section>
      )}

      {notice && <p role="status" className="font-mono text-meta text-signal">{notice}</p>}

      {/* The print path: a clean black-on-white summary sheet. */}
      <pre
        aria-hidden="true"
        className="print-sheet bg-white p-8 font-sans text-sm leading-8 text-void print:block"
      >
        {printSheet()}
      </pre>
    </div>
  );
}