"use client";

// My Day — not a page; the day itself. One timeline of lessons, three
// actions per lesson, one alert block, one sync line, nothing else.
//
//   THE SEVEN BLOCKS, IN ORDER
//   1 HEADER   "My Day · {school}" + the quick-find trigger + the date.
//   2 COUNT    "N of M done" — the only large text on the page. It is the
//              state of the day: empty · pre-first · mid-day · post-last ·
//              weekend · exam week · crisis.
//   3 ALERT    "Needs attention" — derived from the ledger, never authored.
//              Past slots owing a register or grades, capped at three
//              items; the crisis is three or more unmarked past lessons.
//   4 TIMELINE lessons in their sequence, a gold NOW marker between the
//              past and the future. Each row: time · class · subject ·
//              teacher · room · learners · three actions · flag (✓ · — · !).
//   5 TOMORROW one line from the approved week; suppressed when it has
//              nothing to say.
//   6 SYNC     the honest network line: online/offline, today's records.
//   7 FIND     the quick find, pushed from the header — one search by
//              name, adm no, or guardian phone.
//
// Attendance and Notes expand in place; Grades push to a focused roster
// view with a back button. Never a modal — modals lose the timeline, and
// the timeline is the point. The register is the fastest thing the console
// does: "all present" is one tap. State is computed from the event ledger
// only. The day is declared, never invented. The week grid and the day
// builder sit on the Plan tab, off the day's main stage.

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { baseClassName, scoreKey, Student } from "../../lib/school";
import {
  classLabel,
  classesOnRoll,
  DayEvent,
  eventsSinceToday,
  Lesson,
  loadDayPlan,
  loadEvents,
  loadSchedules,
  makeClassNote,
  makeEvent,
  saveDayPlan,
  saveEvent,
  saveSchedules,
  SCHEDULE_SPAN_MS,
  ScheduleItem,
  timeToMs,
  todayLabel
} from "../../lib/events";
import { isTeachingCell, lessonsForDay, loadApprovedTimetable, WEEKDAYS, WeeklyTimetable, weekdayKey } from "../../lib/timetable";
import { ConsoleSession } from "../../lib/console";
import { useSchoolData } from "./useSchoolData";
import Student360 from "./Student360";
import { ClassPicker } from "./ClassPicker";
import { MiniCalendar } from "./MiniCalendar";
import { btn, btnGhost, field, Gate, Loading, monoLabel, PrintButton } from "./bits";

// A class filter pill for the My Students finder. Quiet when idle, gold when active.
const pill = (active: boolean) =>
  `rounded-full border px-4 py-2 font-mono text-label uppercase tracking-[0.15em] transition-all ${
    active ? "border-signal text-signal" : "border-ink/10 text-dust hover:border-ink/30 hover:text-ink"
  }`;

// The inline panel that opens under a lesson row: aligned to the row's content,
// ruled off with a hairline, filled by the same register / grade / note forms.
const panelIn = "mt-[21px] border-t border-ink/10 pt-[21px]";

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
  // Plan previews the approved week (Solver builds it). No paste-import here:
  // the import box lives once, in the Timetable Solver, where the grid is.
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [approvedWeek, setApprovedWeek] = useState<WeeklyTimetable | null>(null);
  const todayKey = weekdayKey(new Date());
  // A weekend day reads "No lessons." — the Plan tab still previews Monday's
  // column, but the day itself is empty.
  const isWeekendDay = new Date().getDay() === 0 || new Date().getDay() === 6;
  // Today's column of the approved week — what the Plan tab previews.
  const todayLessons = useMemo(() => (approvedWeek ? lessonsForDay(approvedWeek, todayKey) : []), [approvedWeek, todayKey]);

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [online, setOnline] = useState<boolean>(true);

  const [selected, setSelected] = useState<Student | null>(null);
  const [query, setQuery] = useState("");
  const [clsFilter, setClsFilter] = useState(rosterClass ?? "");
  const [notice, setNotice] = useState("");
  // Today / Plan — planning sits on its own tab, off the day's main stage.
  const [tab, setTab] = useState<"today" | "plan">("today");
  // The quick find: a focused view pushed from the header trigger. Arriving
  // from My Students, or a class roster tap, lands in it with its filter on.
  const [findOpen, setFindOpen] = useState(section === "students");
  // Register: bulk is the default, the names view is the adjust path.
  const [attMode, setAttMode] = useState<"bulk" | "names">("bulk");
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const [evs, planRows, sch] = await Promise.all([loadEvents(), loadDayPlan(), loadSchedules()]);
      setEvents(evs);
      const approved = loadApprovedTimetable();
      setApprovedWeek(approved);
      // The Solver's approved week fills an empty Today once — today's
      // column becomes the plan. After that the spine is the source of truth.
      // A weekend day is never seeded: it simply reads "No lessons."
      const weekend = new Date().getDay() === 0 || new Date().getDay() === 6;
      if (!weekend && planRows.length === 0 && approved) {
        const day = weekdayKey(new Date());
        const ls = lessonsForDay(approved, day);
        if (ls.length > 0) {
          const seeded = ls.map((l, i) => ({
            id: "TT-" + Date.now().toString(36) + "-" + i,
            time: l.time, className: l.className, subject: l.subject, room: "", teacher: "",
          })) as Lesson[];
          setPlan(seeded);
          void saveDayPlan(seeded);
        } else {
          setPlan(planRows);
        }
      } else {
        setPlan(planRows);
      }
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

  // Arriving with a ?cls= param (a class roster tap), or from My Students,
  // opens the quick find with its filter already on.
  useEffect(() => {
    if (rosterClass || section === "students") {
      setFindOpen(true);
      if (rosterClass) setClsFilter(rosterClass);
    }
  }, [rosterClass, section]);

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
    setAttMode("bulk");
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

  /* -------- the day's phases: before · in · between · end · untimed ------- */

  const firstSlot = timed[0] ?? null;
  const lastSlot = timed.length > 0 ? timed[timed.length - 1] : null;
  // The slot that actually owns this moment: started, and still inside its
  // 40-minute session (SCHEDULE_SPAN_MS). Outside that window the day is in
  // a break — never "in progress".
  const liveSlot = (() => {
    if (!hasTimes || nowIndex === 0) return null;
    const l = timed[nowIndex - 1];
    return nowMs < timeToMs(l.time, nowMs) + SCHEDULE_SPAN_MS ? l : null;
  })();
  const dayOver = lastSlot !== null && nowMs >= timeToMs(lastSlot.time, nowMs) + SCHEDULE_SPAN_MS;
  const phase =
    ordered.length === 0
      ? "empty"
      : !hasTimes
        ? "untimed"
        : nowMs < timeToMs(firstSlot!.time, nowMs)
          ? "before"
          : dayOver
            ? "end"
            : liveSlot
              ? "in"
              : "between";

  const pastRows = hasTimes ? ordered.slice(0, nowIndex) : [];
  const liveRows = hasTimes ? ordered.slice(nowIndex) : ordered;
  // The band's queue: past periods still owing a register, or a register in
  // but grades not entered. Never a graveyard — tap and it unfolds.
  const owed = pastRows.flatMap((l) => {
    if (roster(l.className).length === 0) return [];
    const label = `${l.time || "Untimed"} · ${l.subject || l.className || "Lesson"}`;
    const out: { key: string; lesson: Lesson; kind: "att" | "grades"; label: string }[] = [];
    if (!attDone(l.className)) out.push({ key: l.id + "-att", lesson: l, kind: "att", label });
    else if (!gradesDone(l.className)) out.push({ key: l.id + "-gr", lesson: l, kind: "grades", label });
    return out;
  });

  function jumpTo(id: string) {
    setTimeout(() => rowRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  // Exam week — the day announces itself; the timeline keeps its shape,
  // and a lesson row declaring an exam carries the same three actions.
  const examCount = ordered.filter((l) => /exam|paper/i.test(l.subject ?? "")).length;
  // The crisis: three or more past lessons with no register in. The alert
  // block is the flag — derived from the ledger, never authored.
  const unmarkedCount = pastRows.filter((l) => roster(l.className).length > 0 && !attDone(l.className)).length;
  const crisis = unmarkedCount >= 3;
  // The weekend state reads "Saturday. No lessons."
  const dayName = new Date(nowMs).toLocaleDateString("en-GB", { weekday: "long" });
  // The day after — the Tomorrow block's one line. A weekend tomorrow, or no
  // approved week, is nothing to say: the block stays suppressed.
  const tomorrowLessons = useMemo(() => {
    if (!approvedWeek) return [] as { time: string; subject: string }[];
    const t = new Date(nowMs);
    t.setDate(t.getDate() + 1);
    const g = t.getDay();
    if (g === 0 || g === 6) return [] as { time: string; subject: string }[];
    return lessonsForDay(approvedWeek, WEEKDAYS[g - 1]);
  }, [approvedWeek, nowMs]);

  // The three actions, same order on every class row: Attendance · Grades ·
  // Notes. Text, not chips — done is quiet green, a past slot that owes is
  // gold, the far future is dim, hover is gold. Attendance and Notes open in
  // place; Grades pushes to its focused roster view.
  function action(lesson: Lesson, kind: "att" | "grades" | "notes", past: boolean) {
    const on = open?.id === lesson.id && open.kind === kind;
    let label = "Notes";
    let tone = "text-ash";
    if (kind === "att") {
      const done = attDone(lesson.className);
      label = done ? "Attendance ✓" : past ? "Attendance —" : "Attendance";
      tone = done ? "text-signal" : past ? "text-signal" : "text-dust";
    } else if (kind === "grades") {
      const done = gradesDone(lesson.className);
      label = done ? "Grades ✓" : past ? "Grades —" : "Grades";
      tone = done ? "text-signal" : past ? "text-signal" : "text-dust";
    } else {
      const c = notesCount(lesson.className);
      label = c > 0 ? `Note ${c}` : "Notes";
    }
    return (
      <button
        onClick={() => (on ? closePanel() : openPanel(lesson, kind))}
        className={`text-ui transition-colors hover:text-signal ${on ? "text-signal" : tone}`}
      >
        {label}
      </button>
    );
  }

  // A uniform row: time · class · subject · teacher · room · learners, the
  // three actions, the flag. The panel opens inline under its own row — the
  // day is a timeline, not a card stack.
  function timelineRow(lesson: Lesson, past: boolean) {
    const hasRoster = roster(lesson.className).length > 0;
    const n = roster(lesson.className).length;
    const attSt: "done" | "pending" | "none" = !hasRoster ? "none" : attDone(lesson.className) ? "done" : "pending";
    const isNowRow = lesson.id === liveSlot?.id;
    // "Form 1 · Science" — class and subject; free-form rows fall back to
    // whatever the teacher declared.
    const title = [lesson.className, lesson.subject].filter(Boolean).join(" · ") || "Lesson";
    const detail = [
      lesson.teacher,
      lesson.room,
      hasRoster ? `${n} learner${n === 1 ? "" : "s"}` : ""
    ]
      .filter(Boolean)
      .join(" · ");
    // The flag: ✓ done, — pending, ! a past slot that needs attention.
    const flag = !hasRoster ? "" : attSt === "done" ? "✓" : past ? "!" : "—";
    const flagTone = flag === "✓" ? "text-signal" : flag === "!" ? "text-signal" : "text-ash";
    return (
      <li
        key={lesson.id}
        ref={(el) => {
          rowRefs.current[lesson.id] = el;
        }}
        className={`m-0 list-none py-[21px] ${
          isNowRow ? "-mx-4 rounded-[21px] border border-ink/10 bg-edge px-4" : "border-b border-ink/10/60"
        }`}
      >
        <div className="grid grid-cols-[55px_1fr_21px] items-start gap-3 md:grid-cols-[89px_1fr_21px] md:gap-[21px]">
          <span className={`pt-1 font-mono tabular-nums text-ui ${past ? "text-ash" : "text-dust"}`}>{lesson.time || "—"}</span>
          <div className="min-w-0">
            <h3 className="font-serif text-h2 font-normal leading-tight text-ink">{title}</h3>
            <p className="mt-1 text-ui text-dust">{detail}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-[21px] gap-y-1">
              {hasRoster && action(lesson, "att", past)}
              {hasRoster && action(lesson, "grades", past)}
              {action(lesson, "notes", past)}
            </div>
            {lessonPanel(lesson)}
          </div>
          <span className={`pt-1 text-right font-mono text-ui ${flagTone}`}>{flag}</span>
        </div>
      </li>
    );
  }

  // Bulk first: the exceptions list, not the roll. Most days are "all present".
  const absentNames = (rows: Student[]) => rows.filter((s) => marks[s.id] === "absent");

  // The panel that opens under a lesson row: register / grade entry / note.
  function lessonPanel(lesson: Lesson) {
    if (!open || open.id !== lesson.id) return null;
    const cls = lesson.className;
    const rows = roster(cls);
    return (
      <div className={panelIn}>
        {open.kind === "att" && (
          <div className="rounded-[21px] border border-ink/10 bg-panel p-[21px]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className={monoLabel}>Register · {cls} · {todayLabel()}</span>
              {rows.length > 0 && <PrintButton label="Print" />}
            </div>
            {rows.length === 0 ? (
              <p className="py-4 text-sm text-dust">No learners on the roll for this class yet.</p>
            ) : (
              <div className="space-y-4">
                {attMode === "bulk" ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-ui text-dust">
                        <span className="font-medium text-ink">{rows.length}</span> learners ·{" "}
                        {absentNames(rows).length === 0 ? (
                          <span className="text-signal">All present</span>
                        ) : (
                          <span className="text-signal">{absentNames(rows).length} absent</span>
                        )}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setAttMode("names")} className={btnGhost + " px-3 py-1.5"}>
                          Adjust names
                        </button>
                        <button onClick={() => void saveAttendance(cls)} className={btn + " px-4 py-1.5"}>
                          {absentNames(rows).length === 0 ? "Confirm & save" : "Save register"}
                        </button>
                      </div>
                    </div>
                    {absentNames(rows).length > 0 && (
                      <div>
                        <p className={monoLabel}>Absentees</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {absentNames(rows).map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setMarks((prev) => ({ ...prev, [s.id]: "present" }))}
                              className="rounded-full border border-signal/60 px-3 py-1 text-ui text-signal transition-colors hover:bg-signal/10"
                            >
                              {s.name} · make present
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <ul className="m-0 list-none divide-y divide-edge/60 border-y border-ink/10/40">
                      {rows.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                          <span className="truncate text-ui text-ink">{s.name}</span>
                          <span className="flex shrink-0 gap-2">
                            {(["present", "absent"] as const).map((m) => (
                              <button
                                key={m}
                                onClick={() => setMarks((prev) => ({ ...prev, [s.id]: m }))}
                                aria-label={`${s.name} — ${m === "present" ? "present" : "absent"}`}
                                className={`border px-2 py-1 font-mono text-label transition-colors ${(marks[s.id] ?? "present") === m ? (m === "present" ? "border-signal/60 text-signal" : "border-signal/60 text-signal") : "border-ink/10 text-ash hover:text-ink"}`}
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
                      <button onClick={() => setAttMode("bulk")} className={btnGhost + " px-3 py-1.5"}>
                        Back to bulk
                      </button>
                      <span className={monoLabel}>Saved to the day ledger</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        {open.kind === "notes" && (
          <div className="rounded-[21px] border border-ink/10 bg-panel p-[21px]">
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

  // Grades — a focused roster view pushed from the row's action, not a
  // modal: the timeline sits behind it, and back returns to the day.
  if (open?.kind === "grades" && openLesson) {
    const cls = openLesson.className;
    const rows = roster(cls);
    return (
      <div className="min-w-0 max-w-full">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/10 pb-3">
          <button
            onClick={closePanel}
            className="font-mono text-meta uppercase tracking-[0.15em] text-ash transition-colors hover:text-signal"
          >
            ← My Day
          </button>
          <p className={monoLabel}>Enter grades · {cls} · {todayLabel()}</p>
        </div>
        <div className="mt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input value={exam} onChange={(e) => setExam(e.target.value)} placeholder="Assessment — e.g. Opener Test" className={field} />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={field} />
            <input value={maxMark} onChange={(e) => setMaxMark(e.target.value)} type="number" min="1" placeholder="Out of" className={field} />
          </div>
          {rows.length === 0 ? (
            <p className="py-8 text-sm text-dust">No learners on the roll for this class yet.</p>
          ) : (
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rows.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10/60 px-3 py-2">
                  <span className="truncate text-ui text-ink">{s.name}</span>
                  <input
                    value={scores[s.id] ?? ""}
                    onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    inputMode="numeric"
                    aria-label={`Score for ${s.name}`}
                    placeholder="—"
                    className="w-20 rounded-lg border border-ink/10 bg-void px-2 py-1.5 text-right font-mono text-meta text-ink outline-none focus:border-signal"
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex items-center gap-3">
            <button onClick={() => void saveGrades(cls)} className={btn}>Save scores</button>
            <span className={monoLabel}>Term Reports picks these up</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-10">
      {/* 1 · HEADER — school on the left, date on the right; the quick-find
          trigger pushes the focused search. An exam week carries its own
          line instead of the plain date. */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
          <p className={monoLabel}>My Day · {session.school}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFindOpen(true)}
              title="Find a learner — name, adm no, guardian phone"
              className="rounded-full border border-ink/10 px-3 py-1.5 font-mono text-label uppercase tracking-[0.15em] text-ash transition-colors hover:border-signal hover:text-signal"
            >
              ⌘F · Find
            </button>
            <p className="font-mono text-label uppercase tracking-[0.15em] text-ash">
              {examCount > 0 ? `Exam week · ${examCount} paper${examCount === 1 ? "" : "s"} today · ` : ""}
              {todayLabel()}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["today", "plan"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setFindOpen(false); }}
              className={pill(tab === t)}
            >
              {t === "today" ? "Today" : "Plan"}
            </button>
          ))}
        </div>
      </div>

      {/* 7 · FIND — the quick find as a focused view: one search by name,
          adm no, or guardian phone; class pills; results capped. Pushed,
          not modaled — the day sits behind it. */}
      {findOpen && (
        <section>
          <div className="mb-[21px] flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
            <button
              onClick={() => setFindOpen(false)}
              className="font-mono text-meta uppercase tracking-[0.15em] text-ash transition-colors hover:text-signal"
            >
              ← My Day
            </button>
            <p className={monoLabel}>Find a learner · {results.length}</p>
          </div>
          <input
            ref={searchRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a learner — name, adm no, guardian phone"
            className={field}
          />
          <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-ink/10 pb-3">
            <button onClick={() => setClsFilter("")} className={pill(clsFilter === "")}>All · {data.students.length}</button>
            {allClasses.map((c) => (
              <button key={c} onClick={() => setClsFilter(c)} className={pill(clsFilter === c)}>{c} · {roster(c).length}</button>
            ))}
          </div>
          {results.length === 0 ? (
            <p className="py-8 text-sm text-dust">{query || clsFilter ? "Nobody matches. Try fewer letters." : "Pick a class, or search to find a learner."}</p>
          ) : (
            <>
              <ul className="mt-4 flex flex-col gap-2">
                {results.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelected(s)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-ink/10 bg-panel px-4 py-3 text-left transition-colors hover:border-ink/30 hover:bg-edge"
                    >
                      <span className="truncate text-ui text-ink">{s.name}</span>
                      <span className="shrink-0 font-mono text-label text-ash">{classLabel(s)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {results.length > 8 && (
                <p className="mt-3 font-mono text-label uppercase tracking-[0.2em] text-ash">{results.length - 8} more — type to narrow</p>
              )}
            </>
          )}
        </section>
      )}

      {/* 2 · COUNT — the only large text on the page: the state of the day.
          3 · ALERT — "needs attention", derived and capped: three items,
          "N more below" when the queue runs longer; the crisis — three or
          more unmarked past lessons — flags itself in the same block. */}
      {!findOpen && tab === "today" && (
        <div>
          <h1 className="font-serif text-4xl font-light tracking-tight">
            {ordered.length === 0
              ? isWeekendDay
                ? "No lessons."
                : "No lessons today."
              : classRows.length > 0
                ? `${doneCount} of ${classRows.length} done`
                : `${ordered.length} untimed item${ordered.length === 1 ? "" : "s"}`}
          </h1>
          {isWeekendDay && (
            <p className="mt-2 text-ui text-dust">
              {dayName} · {todayEvents.length} record{todayEvents.length === 1 ? "" : "s"} on today&apos;s ledger.
            </p>
          )}
          {!isWeekendDay && ordered.length === 0 && (
            <>
              <p className="mt-2 max-w-[52ch] text-ui text-dust">
                See the plan — approve the week in the Solver and today fills itself; or add one period in the Plan tab.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/console/6" className={btn + " px-5 py-2.5"}>Open Timetable Solver</Link>
                <button onClick={() => { setTab("plan"); setAdding(true); }} className={btnGhost + " px-4 py-2"}>
                  + Add one period
                </button>
              </div>
            </>
          )}
          {!isWeekendDay && ordered.length > 0 && phase === "before" && firstSlot && (
            <p className="mt-2 text-ui text-dust">First lesson at {firstSlot.time}.</p>
          )}
          {!isWeekendDay && ordered.length > 0 && phase === "end" && (
            <p className="mt-2 text-ui text-dust">Day closed · {todayEvents.length} record{todayEvents.length === 1 ? "" : "s"} today.</p>
          )}
        </div>
      )}

      {!findOpen && tab === "today" && owed.length > 0 && (
        <div className="border-l-2 border-signal pl-[21px]">
          <p className={`font-mono text-label uppercase tracking-[0.15em] ${crisis ? "text-signal" : "text-ash"}`}>Needs attention</p>
          {crisis && (
            <p className="mt-2 text-ui text-dust">{unmarkedCount} lessons not marked.</p>
          )}
          <div className="mt-2 space-y-1">
            {owed.slice(0, 3).map((o) => (
              <button
                key={o.key}
                onClick={() => {
                  openPanel(o.lesson, o.kind);
                  jumpTo(o.lesson.id);
                }}
                className="block text-ui text-signal transition-colors hover:underline"
              >
                {o.label} — {o.kind === "att" ? "register" : "grades"} →
              </button>
            ))}
            {owed.length > 3 && (
              <button
                onClick={() => jumpTo(pastRows[0].id)}
                className="block font-mono text-label uppercase tracking-[0.15em] text-ash transition-colors hover:text-signal"
              >
                {owed.length - 3} more below
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 · TIMELINE — lessons in their sequence; the gold NOW marker
          sits between the past and the future. Past rows dim; the day
          never scrolls past itself. */}
      {!findOpen && tab === "today" && ordered.length > 0 && (
        <ol className="m-0 max-w-3xl list-none">
          {pastRows.map((lesson) => timelineRow(lesson, true))}
          {hasTimes && nowIndex > 0 && !dayOver && (
            <li aria-hidden="true" className="border-b border-ink/10/40 pb-[21px]">
              <div className="relative flex items-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-signal/40" />
                <span className="relative z-10 bg-void px-3 font-mono text-label uppercase tracking-[0.2em] text-signal">
                  Now · {new Date(nowMs).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </li>
          )}
          {liveRows.map((lesson) => timelineRow(lesson, false))}
        </ol>
      )}

      {/* 5 · TOMORROW — one line; the teacher sees tomorrow without leaving
          today. Suppressed when the week has nothing to say. */}
      {!findOpen && tab === "today" && tomorrowLessons.length > 0 && (
        <div className="border-y border-ink/10 py-[21px]">
          <p className={monoLabel}>Tomorrow</p>
          <p className="mt-2 text-ui text-dust">
            {tomorrowLessons.length} lesson{tomorrowLessons.length === 1 ? "" : "s"}. First: {tomorrowLessons[0].time} {tomorrowLessons[0].subject}.
          </p>
        </div>
      )}

      {/* 6 · SYNC — the honest network line; nothing more. */}
      {!findOpen && tab === "today" && (
        <div className="border-t border-ink/10 pt-3">
          <p className="font-mono text-label uppercase tracking-[0.15em] text-ash">
            {online ? "Online" : "Offline"} · {todayEvents.length} record{todayEvents.length === 1 ? "" : "s"} today
            {!online && " · awaiting connection"}
          </p>
        </div>
      )}

      {tab === "plan" && !findOpen && (
        <section className="space-y-5">
          <div className="rounded-[21px] border border-ink/10 bg-panel p-[21px]">
            <p className={monoLabel}>Plan · approved week</p>
            {approvedWeek ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-serif text-h2 font-light tracking-tight">{approvedWeek.className} · Today&apos;s column</h2>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setAdding((v) => !v)} className={btnGhost + " px-3 py-1.5"}>
                      {adding ? "Close" : "+ Add one period"}
                    </button>
                    <Link href="/console/6" className={btnGhost + " px-3 py-1.5"}>Open Timetable Solver</Link>
                  </div>
                </div>
                <p className="mt-1 text-ui text-dust">{approvedWeek.name} · {todayLessons.length} periods today ({todayKey}). The Solver builds + prints; Today works them.</p>
                {todayLessons.length === 0 ? (
                  <p className="mt-4 text-sm text-dust">No teaching periods today — weekends read Monday&apos;s column.</p>
                ) : (
                  <ol className="mt-4 divide-y divide-edge/60 border-y border-ink/10/60">
                    {todayLessons.map((l, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-3 py-2.5">
                        <span className="font-mono text-meta tabular-nums text-ash">{l.time}</span>
                        <span className="min-w-0 flex-1 truncate text-ui text-ink">{l.subject}</span>
                        <span className="shrink-0 font-mono text-label text-ash">{approvedWeek.className}</span>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="mt-4 overflow-x-auto">
                  <MiniWeekGrid week={approvedWeek} today={todayKey} />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="mt-2 font-serif text-h2 font-light tracking-tight">No approved week yet</h2>
                <p className="mt-1 max-w-[52ch] text-ui leading-6 text-dust">
                  The week is built in the Timetable Solver — pick a CBC demo grid, print it for the wall, approve once. Today then fills itself.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/console/6" className={btn + " px-5 py-2.5"}>Open Timetable Solver</Link>
                  <button onClick={() => { setAdding((v) => !v); }} className={btnGhost + " px-3 py-1.5"}>
                    {adding ? "Close" : "+ Add one period"}
                  </button>
                </div>
              </div>
            )}

            {adding && (
              <div className="mt-5 rounded-[21px] border border-ink/10 bg-void p-[21px]">
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
                  <div className="mt-2 rounded-xl border border-ink/10/60 bg-void p-3">
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

            {plan.length > 0 && (
              <div className="mt-5 border-t border-ink/10 pt-4">
                <p className={monoLabel}>Today&apos;s plan · {plan.length}</p>
                <ol className="mt-3 m-0 list-none divide-y divide-edge/60 border-y border-ink/10/40">
                  {plan.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0 truncate text-ui text-ink">
                        <span className="font-mono text-meta tabular-nums text-ash">{l.time || "untimed"}</span>
                        {" · "}
                        {[l.className, l.subject].filter(Boolean).join(" · ")}
                      </span>
                      <button
                        onClick={() => removeLesson(l.id)}
                        title="Remove from today"
                        className="shrink-0 font-mono text-label text-ash transition-colors hover:text-signal"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="rounded-[21px] border border-ink/10 bg-panel p-[21px]">
            <p className={monoLabel}>Five weeks</p>
            <div className="mt-3">
              <MiniCalendar items={schedules} onAdd={addSchedule} onRemove={removeSchedule} />
            </div>
          </div>
        </section>
      )}

      {notice && <p role="status" className="font-mono text-meta text-signal">{notice}</p>}

      {/* The print path: the paper register, ready to tick by hand. */}
      {open?.kind === "att" && openClass && (
        <pre
          aria-hidden="true"
          className="print-sheet bg-white p-8 font-sans text-sm leading-8 text-void print:block"
        >
          {registerSheet()}
        </pre>
      )}
    </div>
  );
}

/* The approved week, scaled down: a quiet ruler-grid for the Plan tab.
   Same shape as the wall grid in the Solver — times down, days across,
   today's column lit, breaks and lunch furniture-dimmed. */
function MiniWeekGrid({ week, today }: { week: WeeklyTimetable; today: string }) {
  return (
    <div>
      <p className={monoLabel}>Week · {week.name}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th aria-hidden="true" className="w-[70px] p-1.5 text-left" />
              {WEEKDAYS.map((d) => (
                <th
                  key={d}
                  className={`p-1.5 text-left font-mono text-micro uppercase tracking-[0.18em] ${d === today ? "text-signal" : "text-ash"}`}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {week.times.map((slot, i) => (
              <tr key={i} className="border-t border-ink/10/40">
                <td className="p-1.5 align-top">
                  <p className="font-mono text-micro tabular-nums text-ash">
                    {slot.start}
                    <span className="text-ash/50">–{slot.end}</span>
                  </p>
                  {slot.kind !== "lesson" && slot.kind !== "roll" && (
                    <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.15em] text-ash/60">
                      {slot.kind === "break" ? "break" : "lunch"}
                    </p>
                  )}
                </td>
                {WEEKDAYS.map((d) => {
                  const v = (week.cells[d]?.[i] ?? "").trim();
                  const teaching = isTeachingCell(v, slot.kind);
                  const isToday = d === today;
                  return (
                    <td key={d} className="p-1">
                      <div
                        className={`h-6 truncate rounded-md border px-2 py-1 font-mono text-micro uppercase tracking-wide ${
                          teaching
                            ? isToday
                              ? "border-signal/60 bg-signal/10 text-ink"
                              : "border-ink/10/60 bg-void/50 text-dust"
                            : "border-transparent text-ash/40"
                        }`}
                      >
                        {v || "·"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-micro uppercase tracking-[0.15em] text-ash">
        {week.className} · signal column is {today} — its periods are on Today
      </p>
    </div>
  );
}
