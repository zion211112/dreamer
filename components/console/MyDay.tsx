"use client";

// My Day — one spine, three depths. The day has a shape: it starts, moves,
// ends. The eye never reads a list; it reads the clock.
//
//   DEPTH 1  NOW — one card, one question: what do I do now? The phase
//             (empty · before · in · break · end · untimed) picks the primary
//             action; "in" is claimed only inside a period's 40-minute
//             window. The day's arc — one segment per period — shows where
//             the day stands.
//   DEPTH 2  SPINE — past periods fold into an "owes work" band; now and the
//             next read full; the far recedes. Every class row carries the
//             same three chips, same order: Att · Grades · Note.
//   DEPTH 3  PLAN — the five-week calendar, timetable import and the day
//             builder live on their own tab, off the day's main stage.
//
// The register is bulk-first: "all present" is one tap, names are the adjust
// path. State is computed from the event ledger only. The day is declared,
// never invented. My Students stays a clean finder — class pills + search.

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
  // Plan previews the approved week (Solver builds it). No paste-import here:
  // the import box lives once, in the Timetable Solver, where the grid is.
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [approvedWeek, setApprovedWeek] = useState<WeeklyTimetable | null>(null);
  const todayKey = weekdayKey(new Date());
  // Today's column of the approved week — what the Plan tab previews.
  const todayLessons = useMemo(() => (approvedWeek ? lessonsForDay(approvedWeek, todayKey) : []), [approvedWeek, todayKey]);

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [online, setOnline] = useState<boolean>(true);

  const [selected, setSelected] = useState<Student | null>(null);
  const [query, setQuery] = useState("");
  const [clsFilter, setClsFilter] = useState(rosterClass ?? "");
  const [notice, setNotice] = useState("");
  // Today / Students / Plan — planning demotes to its own tab, off the day's main stage.
  const [tab, setTab] = useState<"today" | "students" | "plan">(section === "students" ? "students" : "today");
  // Past periods fold into an owed band; the day never scrolls past itself.
  const [pastOpen, setPastOpen] = useState(false);
  // Register: bulk is the default, the names view is the adjust path.
  const [attMode, setAttMode] = useState<"bulk" | "names">("bulk");
  // A day-level line to close the day (ledger: a note with no class).
  const [dayNote, setDayNote] = useState("");
  const dayNoteRef = useRef<HTMLInputElement>(null);
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
      if (planRows.length === 0 && approved) {
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

  // Arriving with a ?cls= param (a class roster tap) pre-filters the finder.
  useEffect(() => {
    if (rosterClass) setClsFilter(rosterClass);
  }, [rosterClass]);

  useEffect(() => {
    setTab(section === "students" ? "students" : "today");
  }, [section]);

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

  // Close the day with one line that belongs to no class.
  async function saveDayNote() {
    if (!dayNote.trim()) {
      setNotice("Add a line first.");
      return;
    }
    await saveEvent(makeClassNote("", session.name, dayNote.trim()));
    setEvents(await loadEvents());
    setDayNote("");
    setNotice("Day note saved — it sits on the ledger, not in a class history.");
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

  /* The approved week fills Today when empty: one sync from the Solver's
     grid into today's plan, then the teacher works the spine as usual. */
  function syncApprovedToToday() {
    if (!approvedWeek || plan.length > 0) return false;
    const ls = lessonsForDay(approvedWeek, todayKey);
    if (ls.length === 0) return false;
    const next = ls.map((l, i) => ({
      id: "TT-" + Date.now().toString(36) + "-" + i,
      time: l.time, className: l.className, subject: l.subject, room: "", teacher: "",
    }));
    setPlan(next as Lesson[]);
    void saveDayPlan(next as Lesson[]);
    return true;
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

  /* -------- the now-phase: one card, one question — what do I do now ------- */

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

  const nextInMin = upNext && upNext.time ? Math.max(1, Math.round((timeToMs(upNext.time, nowMs) - nowMs) / 60_000)) : null;
  const dayNotes = todayEvents.filter((e) => e.type === "note" && e.className === "");

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

  // The day's shape in one glance: a segment per class period, untimed items
  // grouped last. Tap and the spine scrolls — the past unfolds first.
  const arc = (() => {
    const items: { key: string; lesson: Lesson; done: boolean }[] = classRows.map((l) => ({ key: l.id, lesson: l, done: attDone(l.className) }));
    const untimedRows = ordered.filter((l) => !l.time);
    if (untimedRows.length > 0) items.push({ key: "__untimed__", lesson: untimedRows[0], done: untimedRows.every((l) => attDone(l.className)) });
    return items;
  })();

  function jumpTo(id: string) {
    setPastOpen(true);
    setTimeout(() => rowRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  // The hero: the phase picks the primary action; the eye lands on one thing.
  const hero = (() => {
    if (phase === "empty")
      return {
        tag: "Today",
        title: "Build the week once",
        meta: "The Solver holds the wall grid. Approve it there — Today fills itself.",
        cta: "Open Timetable Solver",
        run: () => { window.location.href = "/console/6"; }
      };
    if (phase === "before" && firstSlot) {
      const has = roster(firstSlot.className).length > 0;
      return {
        tag: "First up",
        title: firstSlot.subject || firstSlot.className || "Lesson",
        meta: [firstSlot.time, firstSlot.className, firstSlot.room].filter(Boolean).join(" · "),
        cta: has ? "Register the first period" : "Enter grades",
        run: () => {
          openPanel(firstSlot, has ? "att" : "grades");
          jumpTo(firstSlot.id);
        }
      };
    }
    if (phase === "in" && liveSlot) {
      const l = liveSlot;
      const has = roster(l.className).length > 0;
      const done = has && attDone(l.className);
      return {
        tag: "Now",
        title: `${l.time} ${l.subject || l.className || "Lesson"}`,
        meta: [l.className, has ? `${roster(l.className).length} learners` : "", l.room].filter(Boolean).join(" · "),
        cta: done ? "Enter grades" : has ? "Take register" : "Enter grades",
        run: () => {
          openPanel(l, done || !has ? "grades" : "att");
          jumpTo(l.id);
        }
      };
    }
    if (phase === "between" && upNext) {
      const has = roster(upNext.className).length > 0;
      return {
        tag: "Break",
        title: `${upNext.time} ${upNext.subject || upNext.className || "Lesson"}`,
        meta: "The room is free — prep the next period. Anything owed is in the band below.",
        cta: has ? "Prep the next period" : "Enter grades",
        run: () => {
          openPanel(upNext, has ? "att" : "grades");
          jumpTo(upNext.id);
        }
      };
    }
    if (phase === "end") {
      const out = classRows.filter((l) => !attDone(l.className)).length;
      return {
        tag: "Day",
        title: `${doneCount} of ${classRows.length} recorded`,
        meta:
          out > 0
            ? `${out} register${out === 1 ? "" : "s"} still out — the band below keeps them visible.`
            : "Every register in. Close the day with one line.",
        cta: "Close the day",
        run: () => dayNoteRef.current?.focus()
      };
    }
    return {
      tag: "Today",
      title: `${ordered.length} item${ordered.length === 1 ? "" : "s"}, untimed`,
      meta: "Add times and the day starts moving — or work the list as it stands.",
      cta: "+ Add to today",
      run: () => {
        setTab("plan");
        setAdding(true);
      }
    };
  })();

  // The row state as a chip: three facts, same order, on every class row —
  // done is quiet green, owed is gold, the far future is dim.
  function chip(lesson: Lesson, kind: "att" | "grades" | "notes", st: "done" | "pending" | "none", past: boolean) {
    const on = open?.id === lesson.id && open.kind === kind;
    const n = roster(lesson.className).length;
    let label = "Notes";
    let tone = "text-dim";
    if (kind === "att") {
      label = st === "done" ? `Att ✓ ${n}` : past ? "Att · owed" : "Att";
      tone = st === "done" ? "text-emerald-400" : past ? "text-gold" : "text-dim";
    } else if (kind === "grades") {
      if (st === "none") return null;
      label = st === "done" ? "Grades ✓" : past ? "Grades · owed" : "Grades";
      tone = st === "done" ? "text-emerald-400" : past ? "text-gold" : "text-dim";
    } else {
      const c = notesCount(lesson.className);
      label = c > 0 ? `Note ${c}` : "Notes";
    }
    return (
      <button
        onClick={() => (on ? closePanel() : openPanel(lesson, kind))}
        className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
          on ? "border border-gold bg-gold-soft text-gold" : `border border-transparent ${tone} hover:text-ivory`
        }`}
      >
        {label}
      </button>
    );
  }

  // A uniform row: time · class · subject · learners · room, the three chips,
  // the panel opens inline under its own row.
  function timelineRow(lesson: Lesson, past: boolean) {
    const hasRoster = roster(lesson.className).length > 0;
    const n = roster(lesson.className).length;
    const attSt: "done" | "pending" | "none" = !hasRoster ? "none" : attDone(lesson.className) ? "done" : "pending";
    const grSt: "done" | "pending" | "none" = !hasRoster ? "none" : gradesDone(lesson.className) ? "done" : "pending";
    const notesSt: "done" | "none" = notesCount(lesson.className) > 0 ? "done" : "none";
    const isNowRow = lesson.id === liveSlot?.id;
    const isNextRow = !past && upNext?.id === lesson.id;
    const title = lesson.subject || lesson.className || "Lesson";
    const detail = [
      lesson.className && lesson.className !== title ? lesson.className : "",
      hasRoster ? `${n} learner${n === 1 ? "" : "s"}` : "",
      lesson.room
    ]
      .filter(Boolean)
      .join("  ·  ");
    return (
      <li
        key={lesson.id}
        ref={(el) => {
          rowRefs.current[lesson.id] = el;
        }}
        className={`m-0 list-none py-[21px] ${
          isNowRow
            ? "-mx-4 rounded-[21px] border border-edge bg-panelHi px-4"
            : past
            ? "border-b border-edge/40 opacity-50"
            : isNextRow
            ? "border-b border-edge/60"
            : "border-b border-edge/60 opacity-60"
        }`}
      >
        <div className="grid grid-cols-[55px_1fr] gap-3 md:grid-cols-[90px_1fr] md:gap-[21px]">
          <div className="pt-1">
            <span className={`font-mono tabular-nums text-[13px] ${isNextRow ? "text-gold" : "text-dim"}`}>{lesson.time || "—"}</span>
            {isNextRow && <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-gold">next</span>}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-[21px] font-normal leading-tight text-ivory">{title}</h3>
            <p className="mt-1 text-[13px] text-muted">{detail || "—"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {hasRoster && chip(lesson, "att", attSt, past)}
              {hasRoster && chip(lesson, "grades", grSt, past)}
              {chip(lesson, "notes", notesSt, past)}
              <button
                onClick={() => removeLesson(lesson.id)}
                title="Remove from today"
                className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition-colors hover:text-red-400"
              >
                ✕
              </button>
            </div>
            {lessonPanel(lesson)}
          </div>
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
          <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className={monoLabel}>Register · {cls} · {todayLabel()}</span>
              {rows.length > 0 && <PrintButton label="Print" />}
            </div>
            {rows.length === 0 ? (
              <p className="py-4 text-sm text-muted">No learners on the roll for this class yet.</p>
            ) : (
              <div className="space-y-4">
                {attMode === "bulk" ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[13px] text-muted">
                        <span className="font-medium text-ivory">{rows.length}</span> learners ·{" "}
                        {absentNames(rows).length === 0 ? (
                          <span className="text-emerald-400">All present</span>
                        ) : (
                          <span className="text-gold">{absentNames(rows).length} absent</span>
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
                              className="rounded-full border border-red-500/60 px-3 py-1 text-[13px] text-red-400 transition-colors hover:bg-red-500/10"
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
      {/* HEADER — school, date, and the three views of the day */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={monoLabel}>My Day · {session.school}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim">{todayLabel()}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["today", "students", "plan"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={pill(tab === t)}>
              {t === "today" ? "Today" : t === "students" ? `Students · ${data.students.length}` : "Plan"}
            </button>
          ))}
        </div>
      </div>

      {/* NOW — one card, one question: what do I do now. The phase picks the
         primary; the arc below shows where the day stands. */}
      {tab === "today" && (
        <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={monoLabel}>
              {hero.tag} · {new Date(nowMs).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
            {upNext && upNext.time && nextInMin !== null && (
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
                Up next · <span className="text-gold">{upNext.time}</span>
                {upNext.subject || upNext.className ? ` · ${[upNext.subject, upNext.className].filter(Boolean).join(" · ")}` : ""} — in {nextInMin} min
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-4xl font-light tracking-tight">{hero.title}</h1>
              <p className="mt-2 max-w-[52ch] text-[13px] text-muted">{hero.meta}</p>
              {phase === "end" && dayNotes.length > 0 && (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
                  {dayNotes.length} day note{dayNotes.length === 1 ? "" : "s"} on the ledger
                </p>
              )}
            </div>
            <button onClick={hero.run} className={btn + " shrink-0"}>
              {hero.cta}
            </button>
          </div>

          {phase === "end" && (
            <div className="mt-4 border-t border-edge pt-4">
              <p className={monoLabel}>Close the day</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  ref={dayNoteRef}
                  value={dayNote}
                  onChange={(e) => setDayNote(e.target.value)}
                  placeholder="One line for the ledger — what was the day like?"
                  className={field + " min-w-[240px] flex-1"}
                />
                <button onClick={() => void saveDayNote()} className={btnGhost + " px-3 py-2"}>
                  Save day note
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ARC — the day's shape: one segment per period. Tappable. */}
      {tab === "today" && arc.length > 0 && (
        <div>
          <div className="flex gap-1.5">
            {arc.map((a) => {
              const st = a.done
                ? "done"
                : a.lesson.id === liveSlot?.id
                ? "cur"
                : hasTimes && a.lesson.time && timeToMs(a.lesson.time, nowMs) <= nowMs
                ? "owed"
                : "future";
              return (
                <button
                  key={a.key}
                  onClick={() => jumpTo(a.lesson.id)}
                  aria-label={`${a.lesson.time || "Untimed"} — ${st === "done" ? "recorded" : st}`}
                  title={a.lesson.time || "Untimed"}
                  className={`h-[6px] min-w-4 flex-1 rounded-full transition-colors ${
                    st === "done" ? "bg-ivory/60" : st === "cur" ? "animate-pulse bg-gold" : st === "owed" ? "bg-amber-500/50" : "bg-edge"
                  }`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={monoLabel}>
              {doneCount} of {classRows.length} recorded
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">{online ? "Online" : "Offline"}</span>
          </div>
        </div>
      )}

      {/* SPINE — past folds into an owed band; now + next read full; the far
          recedes. Three chips, same order, on every class row. */}
      {tab === "today" && ordered.length > 0 && (
        <ol className="m-0 max-w-3xl list-none">
          {hasTimes && pastRows.length > 0 && !pastOpen && (
            <li className="border-b border-edge/60 py-[21px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={monoLabel}>
                  Before {timed[nowIndex]?.time ?? ""} · {pastRows.length} period{pastRows.length === 1 ? "" : "s"}
                </p>
                <button onClick={() => setPastOpen(true)} className={btnGhost + " px-3 py-1.5"}>
                  Expand
                </button>
              </div>
              {owed.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {owed.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => {
                        setPastOpen(true);
                        openPanel(o.lesson, o.kind);
                        jumpTo(o.lesson.id);
                      }}
                      className="rounded-full border border-amber-500/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-amber-400 transition-colors hover:bg-amber-500/10"
                    >
                      {o.label} · {o.kind === "att" ? "register" : "grades"}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-dim">All recorded.</p>
              )}
            </li>
          )}
          {hasTimes && pastOpen && pastRows.map((lesson) => timelineRow(lesson, true))}
          {hasTimes && nowIndex > 0 && (
            <li aria-hidden="true" className="border-b border-edge/40 pb-[21px]">
              <div className="relative flex items-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-gold/40" />
                <span className="relative z-10 bg-void px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  Now · {new Date(nowMs).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </li>
          )}
          {liveRows.map((lesson) => timelineRow(lesson, false))}
        </ol>
      )}

      {/* FOOTER — the honest sync line, nothing more. */}
      {tab === "today" && (
        <div className="border-t border-edge pt-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
            {online ? "Online" : "Offline"} · {todayEvents.length} record{todayEvents.length === 1 ? "" : "s"} today
          </p>
        </div>
      )}

      {tab === "plan" && (
        <section className="space-y-5">
          <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
            <p className={monoLabel}>Plan · approved week</p>
            {approvedWeek ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-[26px] font-light tracking-tight">{approvedWeek.className} · Today&apos;s column</h2>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setAdding((v) => !v)} className={btnGhost + " px-3 py-1.5"}>
                      {adding ? "Close" : "+ Add one period"}
                    </button>
                    <Link href="/console/6" className={btnGhost + " px-3 py-1.5"}>Open Timetable Solver</Link>
                  </div>
                </div>
                <p className="mt-1 text-[13px] text-muted">{approvedWeek.name} · {todayLessons.length} periods today ({todayKey}). The Solver builds + prints; Today works them.</p>
                {todayLessons.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">No teaching periods today — weekends read Monday&apos;s column.</p>
                ) : (
                  <ol className="mt-4 divide-y divide-edge/60 border-y border-edge/60">
                    {todayLessons.map((l, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-3 py-2.5">
                        <span className="font-mono text-[12px] tabular-nums text-dim">{l.time}</span>
                        <span className="min-w-0 flex-1 truncate text-[13px] text-ivory">{l.subject}</span>
                        <span className="shrink-0 font-mono text-[11px] text-dim">{approvedWeek.className}</span>
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
                <h2 className="mt-2 font-display text-[26px] font-light tracking-tight">No approved week yet</h2>
                <p className="mt-1 max-w-[52ch] text-[13px] leading-6 text-muted">
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
              <div className="mt-5 rounded-[21px] border border-edge bg-void p-[21px]">
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
          </div>

          <div className="rounded-[21px] border border-edge bg-panel p-[21px]">
            <p className={monoLabel}>Five weeks</p>
            <div className="mt-3">
              <MiniCalendar items={schedules} onAdd={addSchedule} onRemove={removeSchedule} />
            </div>
          </div>
        </section>
      )}

      {/* MY STUDENTS — clean finder: class pills + search, results compact & capped. */}
      {tab === "students" && (
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
                  className={`p-1.5 text-left font-mono text-[9px] uppercase tracking-[0.18em] ${d === today ? "text-gold" : "text-dim"}`}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {week.times.map((slot, i) => (
              <tr key={i} className="border-t border-edge/40">
                <td className="p-1.5 align-top">
                  <p className="font-mono text-[10px] tabular-nums text-dim">
                    {slot.start}
                    <span className="text-dim/50">–{slot.end}</span>
                  </p>
                  {slot.kind !== "lesson" && slot.kind !== "roll" && (
                    <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-dim/60">
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
                        className={`h-6 truncate rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
                          teaching
                            ? isToday
                              ? "border-gold/60 bg-gold/10 text-ivory"
                              : "border-edge/60 bg-void/50 text-muted"
                            : "border-transparent text-dim/40"
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
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
        {week.className} · gold column is {today} — its periods are on Today
      </p>
    </div>
  );
}