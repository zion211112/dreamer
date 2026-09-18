"use client";

// My Day — a timeline, not a dashboard. The day has a shape: it starts, moves,
// ends. Lessons sit on a time spine; the eye reads down.
//
//   HEADER        "My Day" + the date. One number: "N of M done".
//   TIMELINE      one row per lesson — TIME · Class · Subject · learners · room.
//                 Every class row carries the same three actions, same order:
//                 [Attendance] [Grades] [Notes]. Non-class items (a staff
//                 meeting) carry only [Notes]. A flag on the right tells the
//                 state: ✓ done · — pending · ! overdue. No separate alerts panel.
//   NOW MARKER    a hairline + "NOW · HH:MM" between the rows — it moves as
//                 the day moves. Only shown when the teacher has fixed times.
//   FOOTER        honest sync state + "+ Add to today".
//
// The teacher declares the day (lib/events day plan); My Day never invents
// one. State is computed from the event ledger only. The My Students view is
// a clean finder — class pills + search, results compact and capped.

import { useEffect, useMemo, useRef, useState } from "react";
import { baseClassName, scoreKey, Student } from "../../lib/school";
import {
  classLabel,
  classesOnRoll,
  DayEvent,
  eventsSinceToday,
  isTimePast,
  Lesson,
  loadDayPlan,
  loadEvents,
  loadSchedules,
  makeClassNote,
  makeEvent,
  makeScheduleItem,
  parseTimetable,
  saveDayPlan,
  saveEvent,
  saveSchedules,
  ScheduleItem,
  timeToMs,
  todayLabel
} from "../../lib/events";
import { ConsoleSession } from "../../lib/console";
import { useSchoolData } from "./useSchoolData";
import Student360 from "./Student360";
import { ClassPicker } from "./ClassPicker";
import { MiniCalendar } from "./MiniCalendar";
import { btn, btnGhost, field, Gate, Loading, monoLabel, PrintButton } from "./bits";

// A class filter pill for the My Students finder. Quiet when idle, gold when active.
const pill = (active: boolean) =>
  `rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-all ${
    active ? "border-gold text-gold" : "border-edge text-muted hover:border-edgeHi hover:text-ivory"
  }`;

// The inline panel that opens under a lesson row: aligned to the row's content,
// ruled off with a hairline, filled by the same register / grade / note forms.
const panelIn = "mt-[21px] border-t border-edge pt-[21px]";

export default function MyDay({
  session,
  section,
  rosterClass
}: {
  session: ConsoleSession;
  section: "day" | "students";
  rosterClass?: string;
}) {
  const data = useSchoolData();
  const [events, setEvents] = useState<DayEvent[]>([]);
  const [plan, setPlan] = useState<Lesson[]>([]);
  const [loaded, setLoaded] = useState(false);

  // One panel open at a time, nested under its own lesson row.
  const [open, setOpen] = useState<{ id: string; kind: "att" | "grades" | "notes" } | null>(null);
  const [marks, setMarks] = useState<Record<string, "present" | "absent">>({});
  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [maxMark, setMaxMark] = useState("100");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  const [adding, setAdding] = useState(false);
  const [af, setAf] = useState({ time: "", className: "", subject: "", room: "" });
  const [calOpen, setCalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [online, setOnline] = useState<boolean>(true);

  const [selected, setSelected] = useState<Student | null>(null);
  const [query, setQuery] = useState("");
  const [clsFilter, setClsFilter] = useState(rosterClass ?? "");
  const [notice, setNotice] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const [evs, planRows, sch] = await Promise.all([loadEvents(), loadDayPlan(), loadSchedules()]);
      setEvents(evs);
      setPlan(planRows);
      setSchedules(sch.items);
      setLoaded(true);
    })();
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const tick = window.setInterval(() => setNowMs(Date.now()), 30_000); // NOW keeps moving
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.clearInterval(tick);
    };
  }, []);

  // Arriving with a ?cls= param (a class roster tap) pre-filters the finder.
  useEffect(() => {
    if (rosterClass) setClsFilter(rosterClass);
  }, [rosterClass]);

  const allClasses = useMemo(() => classesOnRoll(data.students), [data.students]);

  function roster(cls: string): Student[] {
    const base = baseClassName(cls);
    return data.students.filter((s) => s.className === base);
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.students.filter((s) => {
      if (clsFilter && s.className !== clsFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.admNo.toLowerCase().includes(q) || s.parentPhone.includes(q);
    });
  }, [data.students, clsFilter, query]);

  /* ------------- actions — each writes events, never copies ------------ */

  function openPanel(lesson: Lesson, kind: "att" | "grades" | "notes") {
    setOpen({ id: lesson.id, kind });
    setNotice("");
    if (kind === "att") {
      const init: Record<string, "present" | "absent"> = {};
      for (const s of roster(lesson.className)) init[s.id] = "present";
      setMarks(init);
    }
    if (kind === "grades") setScores({});
    if (kind === "notes") setNote("");
  }
  function closePanel() {
    setOpen(null);
    setNotice("");
  }
  const openLesson = open ? plan.find((l) => l.id === open.id) ?? null : null;
  const openClass = openLesson?.className ?? "";

  async function saveAttendance(cls: string) {
    const batch = roster(cls).map((s) => makeEvent("attendance", s, session.name, marks[s.id] ?? "present"));
    for (const ev of batch) await saveEvent(ev);
    setEvents((prev) => [...batch.slice().reverse(), ...prev]);
    const absent = batch.filter((e) => e.text === "absent").length;
    setNotice(`${cls} — register saved: ${batch.length - absent} present, ${absent} absent.`);
  }

  async function saveGrades(cls: string) {
    if (!exam.trim()) {
      setNotice("Name the assessment first — reports group scores by exam.");
      return;
    }
    const m = Number(maxMark) || 100;
    let written = 0;
    for (const s of roster(cls)) {
      const raw = scores[s.id];
      if (raw === undefined || raw.trim() === "") continue;
      const score = Number(raw);
      if (Number.isNaN(score) || score < 0 || score > m) continue;
      await data.putScore({
        key: scoreKey(exam.trim(), s.id, subject.trim()),
        exam: exam.trim(),
        studentId: s.id,
        subject: subject.trim(),
        score,
        max: m
      });
      await saveEvent(makeEvent("grade", s, session.name, `${score}/${m} ${exam.trim()}`));
      written += 1;
    }
    setEvents(await loadEvents());
    setNotice(written ? `${cls} — ${written} score${written === 1 ? "" : "s"} saved. Term Reports sees them.` : "Nothing to save — no scores entered.");
  }

  async function saveClassNote(cls: string) {
    if (!note.trim()) {
      setNotice("Add a line first.");
      return;
    }
    await saveEvent(makeClassNote(cls, session.name, note.trim()));
    setEvents(await loadEvents());
    setNote("");
    setNotice(`${cls || "Class"} — note added.`);
  }

  async function addNote(s: Student, text: string) {
    const ev = makeEvent("note", s, session.name, text);
    await saveEvent(ev);
    setEvents((prev) => [ev, ...prev]);
  }

  function addLesson() {
    const lesson: Lesson = {
      id: `L-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: af.time.trim(),
      className: af.className.trim(),
      subject: af.subject.trim(),
      room: af.room.trim(),
      teacher: ""
    };
    if (!lesson.className && !lesson.subject && !lesson.room) return;
    const next = [...plan, lesson];
    setPlan(next);
    void saveDayPlan(next);
    setAf({ time: "", className: "", subject: "", room: "" });
    setAdding(false);
    setNotice("Added to today.");
  }

  function removeLesson(id: string) {
    const next = plan.filter((l) => l.id !== id);
    setPlan(next);
    void saveDayPlan(next);
    if (open?.id === id) setOpen(null);
  }

  /* ------- mini calendar: schedules live on dates, class or personal ------- */

  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function addSchedule(item: ScheduleItem) {
    setSchedules((prev) => {
      const s = [...prev, item];
      void saveSchedules({ items: s });
      return s;
    });
  }

  function removeSchedule(id: string) {
    setSchedules((prev) => {
      const s = prev.filter((i) => i.id !== id);
      void saveSchedules({ items: s });
      return s;
    });
  }

  /* Import a pasted timetable — parsed, never guessed. Optionally mirror the
     same periods into the calendar for the next five weeks. */
  function importTimetable() {
    const parsed = parseTimetable(importText).filter(
      (l) => !plan.some((p) => p.time === l.time && p.className === l.className && p.subject === l.subject)
    );
    if (parsed.length === 0) {
      setNotice("Nothing new to import — paste a timetable first.");
      return;
    }
    const next = [...plan, ...parsed];
    setPlan(next);
    void saveDayPlan(next);
    if (repeatWeekly) {
      const t = new Date();
      const repeats: ScheduleItem[] = [];
      for (let w = 1; w <= 5; w++) {
        const d = new Date(t);
        d.setDate(t.getDate() + 7 * w);
        const key = dateKey(d);
        for (const l of parsed)
          repeats.push(makeScheduleItem(key, l.time, l.subject || l.className || "Lesson", "class", l.className, l.subject));
      }
      setSchedules((prev) => {
        const s = [...prev, ...repeats];
        void saveSchedules({ items: s });
        return s;
      });
    }
    setImportText("");
    setImporting(false);
    setNotice(`Imported ${parsed.length} lesson${parsed.length === 1 ? "" : "s"} to today${repeatWeekly ? " + the next 5 weeks" : ""}.`);
  }

  /* The print path: a plain-text register to hand-tick at the door. */
  function registerSheet(): string {
    if (!openClass) return "";
    const lines = [session.school, `Attendance register — ${openClass}`, todayLabel(), `Teacher: ${session.name}`, ""];
    roster(openClass).forEach((s, i) => {
      lines.push(`${String(i + 1).padStart(2, " ")}. ${s.name.padEnd(30, " ").slice(0, 30)} Present ☐   Absent ☐`);
    });
    return lines.join("\n");
  }

  /* -------- timeline: time is the spine, state is honest -------------- */

  const todayEvents = eventsSinceToday(events);
  // Events store the full "Class · Stream" label, but the day plan uses the
  // plain class name — so match a lesson to its events by the learner ids on
  // its roll, never by string equality.
  const idsFor = (cls: string) => new Set(roster(cls).map((s) => s.id));
  const attDone = (cls: string) => {
    const ids = idsFor(cls);
    return ids.size > 0 && todayEvents.some((e) => e.type === "attendance" && ids.has(e.studentId));
  };
  const gradesDone = (cls: string) => {
    const ids = idsFor(cls);
    return ids.size > 0 && todayEvents.some((e) => e.type === "grade" && ids.has(e.studentId));
  };
  const notesCount = (cls: string) => {
    const ids = idsFor(cls);
    return todayEvents.filter((e) => e.type === "note" && (ids.has(e.studentId) || (e.studentId === "" && e.className === cls))).length;
  };

  // Timed slots first (earliest → latest); untimed items follow, in the order declared.
  const timed = plan
    .filter((l) => /^\d{1,2}:\d{2}$/.test(l.time))
    .sort((a, b) => timeToMs(a.time, nowMs) - timeToMs(b.time, nowMs));
  const ordered = [...timed, ...plan.filter((l) => !/^\d{1,2}:\d{2}$/.test(l.time))];
  const hasTimes = timed.length > 0;
  // "NOW" sits after every slot at or before the current time.
  const nowIndex = hasTimes ? timed.filter((l) => timeToMs(l.time, nowMs) <= nowMs).length : -1;

  // "N of M done" counts class rows; a row is done when its register is in.
  const classRows = ordered.filter((l) => roster(l.className).length > 0);
  const doneCount = classRows.filter((l) => attDone(l.className)).length;

  // "Up next" — the earliest still-upcoming timed slot, so the eye lands on the
  // next thing to teach before the day has to be read top to bottom.
  const upNext =
    ordered
      .filter((l) => /^\d{1,2}:\d{2}$/.test(l.time) && timeToMs(l.time, nowMs) > nowMs)
      .sort((a, b) => timeToMs(a.time, nowMs) - timeToMs(b.time, nowMs))[0] ?? null;

  type Flag = { ch: string; cls: string };
  function flagFor(lesson: Lesson): Flag {
    if (roster(lesson.className).length === 0) return { ch: "", cls: "" };
    if (attDone(lesson.className)) return { ch: "✓", cls: "text-emerald-400" };
    if (isTimePast(lesson.time, nowMs)) return { ch: "!", cls: "text-gold" };
    return { ch: lesson.time ? "" : "—", cls: "text-dim" };
  }

  // A uniform row action. Same three, same order, everywhere — muscle memory.
  function actionBtn(lesson: Lesson, kind: "att" | "grades" | "notes", st: "done" | "pending" | "none", name: string) {
    const on = open?.id === lesson.id && open.kind === kind;
    const mark = st === "done" ? " ✓" : st === "pending" ? " —" : "";
    const color = on ? "border border-gold text-gold" : st === "done" ? "text-emerald-400" : st === "pending" ? "text-muted" : "text-dim";
    return (
      <button
        onClick={() => (on ? closePanel() : openPanel(lesson, kind))}
        className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:text-gold ${color}`}
      >
        {name}
        {mark}
      </button>
    );
  }

  // The panel that opens under a lesson row: register / grade entry / note.
  function lessonPanel(lesson: Lesson) {
    if (!open || open.id !== lesson.id) return null;
    const cls = lesson.className;
    const rows = roster(cls);
    return (
      <div className={panelIn}>
        {open.kind === "att" && (
          <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className={monoLabel}>Register · {cls} · {todayLabel()}</span>
              {rows.length > 0 && <PrintButton label="Print" />}
            </div>
            {rows.length === 0 ? (
              <p className="py-4 text-sm text-muted">No learners on the roll for this class yet.</p>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {rows.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 rounded-xl border border-edge/60 px-3 py-2">
                      <span className="truncate text-[13px] text-ivory">{s.name}</span>
                      <span className="flex shrink-0 gap-1">
                        {(["present", "absent"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setMarks((prev) => ({ ...prev, [s.id]: m }))}
                            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${(marks[s.id] ?? "present") === m ? (m === "present" ? "border-emerald-500/60 text-emerald-400" : "border-red-500/60 text-red-400") : "border-edge text-dim hover:text-ivory"}`}
                          >
                            {m === "present" ? "P" : "A"}
                          </button>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-3">
                  <button onClick={() => void saveAttendance(cls)} className={btn}>Save register</button>
                  <span className={monoLabel}>Saved to the day ledger</span>
                </div>
              </>
            )}
          </div>
        )}
        {open.kind === "grades" && (
          <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
            <span className={monoLabel}>Enter grades · {cls}</span>
            <div className="my-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input value={exam} onChange={(e) => setExam(e.target.value)} placeholder="Assessment — e.g. Opener Test" className={field} />
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={field} />
              <input value={maxMark} onChange={(e) => setMaxMark(e.target.value)} type="number" min={1} placeholder="Out of" className={field} />
            </div>
            {rows.length === 0 ? (
              <p className="py-4 text-sm text-muted">No learners on the roll for this class yet.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {rows.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-edge/60 px-3 py-2">
                    <span className="truncate text-[13px] text-ivory">{s.name}</span>
                    <input
                      value={scores[s.id] ?? ""}
                      onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      inputMode="numeric"
                      aria-label={`Score for ${s.name}`}
                      placeholder="—"
                      className="w-20 rounded-lg border border-edge bg-void px-2 py-1.5 text-right font-mono text-[12px] text-ivory outline-none focus:border-gold"
                    />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => void saveGrades(cls)} className={btn}>Save scores</button>
              <span className={monoLabel}>Term Reports picks these up</span>
            </div>
          </div>
        )}
        {open.kind === "notes" && (
          <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
            <span className={monoLabel}>Note · {cls || "Today"}</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="A line for the ledger — it shows in the learner's history."
              className={field + " mt-3 resize-none"}
            />
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => void saveClassNote(cls)} className={btn}>Save note</button>
              <span className={monoLabel}>Writes one event</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!loaded || data.loading) return <Loading />;

  if (data.students.length === 0)
    return (
      <Gate
        title="The roll is empty."
        body="Import the roster once — classes, registers and grade sheets all read from it."
      />
    );

  if (selected)
    return (
      <Student360
        student={selected}
        assessments={data.assessments}
        events={events}
        onAddNote={addNote}
        onBack={() => setSelected(null)}
      />
    );

  return (
    <div className="min-w-0 max-w-full space-y-10">
      {section === "day" && (
        <>
          {/* HEADER — one number: the state of the day, plus a quick "up next" */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className={monoLabel}>My Day · {session.school}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setImporting((v) => !v);
                    setAdding(false);
                    setCalOpen(false);
                  }}
                  className={btnGhost + " px-3 py-1.5"}
                >
                  Import
                </button>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim">{todayLabel()}</p>
              </div>
            </div>
            <h1 className="mt-3 font-display text-4xl font-light tracking-tight">
              {classRows.length > 0 ? `${doneCount} of ${classRows.length} done` : "Add your first lesson below"}
            </h1>
            {upNext && classRows.length > 0 && (
              <p className="mt-2 font-mono text-[12px] text-dim">
                Up next · <span className="text-gold">{upNext.time}</span>
                {upNext.subject || upNext.className ? ` · ${[upNext.subject, upNext.className].filter(Boolean).join(" · ")}` : ""}
              </p>
            )}
          </div>

          {/* TIMELINE — time is the spine; every class row has the same three actions */}
          {ordered.length > 0 && (
            <ol className="m-0 max-w-3xl list-none">
              {ordered.map((lesson, i) => {
                const hasRoster = roster(lesson.className).length > 0;
                const n = roster(lesson.className).length;
                const f = flagFor(lesson);
                const attSt: "done" | "pending" | "none" = !hasRoster ? "none" : attDone(lesson.className) ? "done" : "pending";
                const grSt: "done" | "pending" | "none" = !hasRoster ? "none" : gradesDone(lesson.className) ? "done" : "pending";
                const notesSt: "done" | "none" = notesCount(lesson.className) > 0 ? "done" : "none";
                const isNext = upNext?.id === lesson.id;
                const title = lesson.subject || lesson.className || "Lesson";
                const detail = [
                  lesson.className && lesson.className !== title ? lesson.className : "",
                  hasRoster ? `${n} learner${n === 1 ? "" : "s"}` : "",
                  lesson.room
                ]
                  .filter(Boolean)
                  .join("  ·  ");
                return (
                  <li key={lesson.id} className="m-0 list-none">
                    {hasTimes && i === nowIndex && (
                      <div className="relative flex items-center border-b border-edge/40 pb-[21px]">
                        <span className="absolute inset-x-0 top-1/2 h-px bg-gold/40" aria-hidden="true" />
                        <span className="relative z-10 bg-void px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                          Now · {new Date(nowMs).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-[55px_1fr_21px] gap-3 border-b border-edge/60 py-[21px] md:grid-cols-[90px_1fr_21px] md:gap-[21px]">
                      <div className="pt-1">
                        <span className={`font-mono text-[13px] ${isNext ? "text-gold" : "text-dim"}`}>{lesson.time || "—"}</span>
                        {isNext && <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-gold">next</span>}
                      </div>
                      <div className="min-w-0">
                        <div>
                          <h3 className="font-display text-[21px] font-normal leading-tight text-ivory">{title}</h3>
                          <p className="mt-1 text-[13px] text-muted">{detail || "—"}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {hasRoster && actionBtn(lesson, "att", attSt, "Attendance")}
                            {hasRoster && actionBtn(lesson, "grades", grSt, "Grades")}
                            {actionBtn(lesson, "notes", notesSt, "Notes")}
                            <button
                              onClick={() => removeLesson(lesson.id)}
                              title="Remove from today"
                              className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        {lessonPanel(lesson)}
                      </div>
                      <span className={`pt-1 text-right font-mono text-[15px] ${f.cls}`}>{f.ch}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {/* PLANNER — add a lesson, open the mini calendar, or import a timetable */}
          <div className="mt-[34px] border-t border-edge pt-[21px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
                {online ? "Online" : "Offline"} · {todayEvents.length} record{todayEvents.length === 1 ? "" : "s"} today
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAdding((v) => !v);
                    setCalOpen(false);
                    setImporting(false);
                  }}
                  className={btnGhost + " px-3 py-1.5"}
                >
                  {adding ? "Close" : "+ Add to today"}
                </button>
                <button
                  onClick={() => {
                    setCalOpen((v) => !v);
                    setAdding(false);
                    setImporting(false);
                  }}
                  className={btnGhost + " px-3 py-1.5"}
                >
                  {calOpen ? "Close" : "Calendar"}
                </button>
              </div>
            </div>

            {notice && <p role="status" className="mt-3 font-mono text-[12px] text-gold">{notice}</p>}

            {importing && (
              <div className="mt-4 rounded-[21px] border border-edge bg-panel p-[21px]">
                <p className={monoLabel}>Import timetable</p>
                <p className="mt-1 text-xs text-muted">Paste your week, one line per period. It's read into today — nothing is guessed.</p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={5}
                  placeholder={"08:00 Maths Form 4\n10:00 English Grade 8 · Z\n13:00 Science Form 4"}
                  className="mt-3 w-full rounded-xl border border-edge bg-void px-3 py-2 font-mono text-[12px] leading-6 text-ivory outline-none focus:border-gold"
                />
                {(() => {
                  const fresh = parseTimetable(importText).filter(
                    (l) => !plan.some((p) => p.time === l.time && p.className === l.className && p.subject === l.subject)
                  );
                  const classes = [...new Set(fresh.map((l) => l.className).filter(Boolean))];
                  return fresh.length > 0 ? (
                    <p className="mt-2 font-mono text-[11px] text-dim">
                      Will add {fresh.length} lesson{fresh.length === 1 ? "" : "s"} · {classes.join(", ") || "no class"}
                    </p>
                  ) : null;
                })()}
                <label className="mt-3 flex items-center gap-2 text-[12px] text-muted">
                  <input type="checkbox" checked={repeatWeekly} onChange={(e) => setRepeatWeekly(e.target.checked)} />
                  Repeat weekly — mirror into the calendar for 5 more weeks
                </label>
                <button onClick={importTimetable} className={btn + " mt-4"}>
                  Add to today
                </button>
              </div>
            )}

            {adding && (
              <div className="mt-4 rounded-[21px] border border-edge bg-panel p-[21px]">
                <p className={monoLabel}>Add to today</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={`${monoLabel} mb-1.5`}>Time</span>
                    <input value={af.time} onChange={(e) => setAf({ ...af, time: e.target.value })} type="time" className={field} />
                  </label>
                  <label className="block">
                    <span className={`${monoLabel} mb-1.5`}>Subject</span>
                    <input value={af.subject} onChange={(e) => setAf({ ...af, subject: e.target.value })} placeholder="Maths" className={field} />
                  </label>
                </div>
                <div className="mt-3">
                  <p className={monoLabel}>Class · stream</p>
                  <div className="mt-2 rounded-xl border border-edge/60 bg-void p-3">
                    <ClassPicker value={af.className} onChange={(v) => setAf({ ...af, className: v })} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`${monoLabel} mb-1.5`}>Room</span>
                  <input value={af.room} onChange={(e) => setAf({ ...af, room: e.target.value })} placeholder="Optional" className={field} />
                </div>
                <button onClick={addLesson} className={btn + " mt-4"}>
                  Save to today
                </button>
              </div>
            )}

            {calOpen && (
              <div className="mt-4 rounded-[21px] border border-edge bg-panel p-[21px]">
                <MiniCalendar items={schedules} onAdd={addSchedule} onRemove={removeSchedule} />
              </div>
            )}
          </div>

          {/* Attendance, grades and notes all open inline under their row; alerts live in the row flags. */}
        </>
      )}

      {/* MY STUDENTS — clean finder: class pills + search, results compact & capped. */}
      {section === "students" && (
        <section>
          <div className="mb-[21px] flex flex-wrap items-center gap-2 border-b border-edge pb-3">
            <button onClick={() => setClsFilter("")} className={pill(clsFilter === "")}>All · {data.students.length}</button>
            {allClasses.map((c) => (
              <button key={c} onClick={() => setClsFilter(c)} className={pill(clsFilter === c)}>{c} · {roster(c).length}</button>
            ))}
          </div>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a learner — name, adm no, or guardian phone…"
            className={field}
          />
          {results.length === 0 ? (
            <p className="py-8 text-sm text-muted">{query || clsFilter ? "Nobody matches. Try fewer letters." : "Pick a class, or search to find a learner."}</p>
          ) : (
            <>
              <ul className="mt-4 flex flex-col gap-2">
                {results.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelected(s)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-edge bg-panel px-4 py-3 text-left transition-colors hover:border-edgeHi hover:bg-panelHi"
                    >
                      <span className="truncate text-[13px] text-ivory">{s.name}</span>
                      <span className="shrink-0 font-mono text-[11px] text-dim">{classLabel(s)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {results.length > 8 && (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">{results.length - 8} more — type to narrow</p>
              )}
            </>
          )}
        </section>
      )}

      {notice && <p role="status" className="font-mono text-[12px] text-gold">{notice}</p>}

      {/* The print path: the paper register, ready to tick by hand. */}
      {open?.kind === "att" && openClass && (
        <pre
          aria-hidden="true"
          className="print-sheet hidden whitespace-pre-wrap bg-white p-8 font-body text-sm leading-8 text-black print:block"
        >
          {registerSheet()}
        </pre>
      )}
    </div>
  );
}