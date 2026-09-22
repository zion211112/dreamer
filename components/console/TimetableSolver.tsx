"use client";
import { useState } from "react";
import Link from "next/link";
import {
  DEMO_TIMETABLES,
  WEEKDAYS,
  WeeklyTimetable,
  isTeachingCell,
  lessonsForDay,
  loadApprovedTimetable,
  monthWeeks,
  prettyRange,
  saveApprovedTimetable,
  subjectTint,
  subjectsInTimetable,
  weekdayIndex,
  weekdayKey
} from "../../lib/timetable";
import { Lesson, saveDayPlan } from "../../lib/events";
import { btn, btnGhost, monoLabel, panel, PrintButton } from "./bits";

function emptyGrid(): WeeklyTimetable {
  const blank = ["", "", "—", "", "", "—", "", "", "LUNCH", ""];
  const fri = ["", "", "—", "", "", "—", "", "", "LUNCH", "PPI"];
  return {
    name: "My class · blank week",
    className: "Grade 4",
    times: [
      { start: "08:00", end: "08:40", kind: "lesson" },
      { start: "08:40", end: "09:20", kind: "lesson" },
      { start: "09:20", end: "09:40", kind: "break" },
      { start: "09:40", end: "10:20", kind: "lesson" },
      { start: "10:20", end: "11:00", kind: "lesson" },
      { start: "11:00", end: "11:30", kind: "break" },
      { start: "11:30", end: "12:10", kind: "lesson" },
      { start: "12:10", end: "12:50", kind: "lesson" },
      { start: "12:50", end: "14:00", kind: "lunch" },
      { start: "14:00", end: "14:40", kind: "lesson" }
    ],
    cells: { MON: [...blank], TUE: [...blank], WED: [...blank], THUR: [...blank], FRI: [...fri] }
  };
}

// The calendar's seven column heads — the school week plus the two quiet days.
const CALENDAR_HEAD = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function TimetableSolver() {
  const [active, setActive] = useState<WeeklyTimetable>(() => loadApprovedTimetable() ?? structuredClone(DEMO_TIMETABLES[0]));
  const [notice, setNotice] = useState("");
  const [approvedName, setApprovedName] = useState(() => loadApprovedTimetable()?.name ?? "");
  const [demoSel, setDemoSel] = useState<number>(() => (loadApprovedTimetable() ? -1 : 0));
  const [view, setView] = useState<"wall" | "calendar">("wall");
  const [cal, setCal] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selDay, setSelDay] = useState(() => new Date().toDateString());
  const todayKey = weekdayKey(new Date());

  let teachingCount = 0;
  for (const d of WEEKDAYS) {
    const row = active.cells[d] ?? [];
    active.times.forEach((s, i) => {
      if (isTeachingCell(row[i] ?? "", s.kind)) teachingCount += 1;
    });
  }
  const subjects = subjectsInTimetable(active);

  // The calendar is the same week laid out on real dates: a Monday-first
  // month grid with the approved week repeating on, today ringed in gold.
  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const shiftMonth = (delta: number) =>
    setCal((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const dayLessons: Record<string, ReturnType<typeof lessonsForDay>> = {};
  for (const d of WEEKDAYS) dayLessons[d] = lessonsForDay(active, d);
  const rangeFor = (start: string) => {
    const s = active.times.find((x) => x.start === start);
    return s ? prettyRange(s) : start;
  };
  const selDate = new Date(selDay);
  const selIdx = weekdayIndex(selDate);
  const selLabel = selIdx < 5 ? WEEKDAYS[selIdx] : null;
  const selLessons = selLabel ? dayLessons[selLabel] : [];

  function setCell(day: string, i: number, v: string) {
    setActive((prev) => {
      const row = [...(prev.cells[day] ?? [])];
      while (row.length < prev.times.length) row.push("");
      row[i] = v.toUpperCase().slice(0, 28);
      return { ...prev, cells: { ...prev.cells, [day]: row } };
    });
  }

  function setTime(i: number, key: "start" | "end", v: string) {
    if (!/^\d{2}:\d{2}$/.test(v)) return;
    setActive((prev) => {
      const times = prev.times.map((t, j) => (j === i ? { ...t, [key]: v } : t));
      return { ...prev, times };
    });
  }

  async function approve() {
    saveApprovedTimetable(active);
    setApprovedName(active.name);
    const day = weekdayKey(new Date());
    const lessons: Lesson[] = lessonsForDay(active, day).map((l, i) => ({
      id: "TT-" + Date.now().toString(36) + "-" + i,
      time: l.time,
      className: l.className,
      subject: l.subject,
      room: "",
      teacher: ""
    }));
    await saveDayPlan(lessons);
    setNotice("Approved — " + active.className + " · " + lessons.length + " periods fill Today (" + day + ").");
  }

  return (
    <div className="min-w-0 max-w-full space-y-8">
      <div className="border-b border-ink/10 pb-6">
        <p className={monoLabel}>Timetable Solver · build · print · approve</p>
        <h1 className="mt-3 font-serif text-4xl font-light tracking-tight md:text-5xl">The week, on one wall grid.</h1>
        <p className="mt-3 max-w-[62ch] text-sm leading-6 text-dust">
          Start from a real Kenyan wall grid, rewrite any cell, flip it to the calendar to read it on real dates,
          print for the wall, then approve once — <span className="text-ink">Today reads the approved week</span>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href="/console/17" className={btnGhost + " px-4 py-2"}>→ Open My Day</Link>
          <PrintButton label="Print wall grid" />
          {approvedName !== "" && (
            <span className="font-mono text-label uppercase tracking-[0.15em] text-signal">Approved · {approvedName}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DEMO_TIMETABLES.map((d, i) => (
          <button
            key={d.name}
            onClick={() => {
              setActive(structuredClone(d));
              setDemoSel(i);
              setNotice("Loaded " + d.name + " — rewrite, print, approve.");
            }}
            className={`rounded-[21px] border p-[21px] text-left transition-colors ${
              i === demoSel ? "border-signal/60 bg-signal/5" : "border-ink/10 bg-panel hover:border-ink/30"
            }`}
          >
            <p className={monoLabel}>Demo {i + 1} · {d.className}</p>
            <p className="mt-2 font-serif text-xl font-normal leading-snug">{d.name}</p>
            <p className="mt-2 text-ui leading-5 text-dust">{subjectsInTimetable(d).slice(0, 5).join(" · ")}</p>
          </button>
        ))}
        <button
          onClick={() => {
            setActive(emptyGrid());
            setDemoSel(-1);
            setNotice("Blank week — 7 teaching periods, breaks, lunch, Friday PPI.");
          }}
          className="rounded-[21px] border border-dashed border-ink/10 bg-void p-[21px] text-left transition-colors hover:border-signal/60"
        >
          <p className={monoLabel}>Blank</p>
          <p className="mt-2 font-serif text-xl font-normal">Start empty</p>
        </button>
      </div>

      <div className={panel + " flex flex-wrap items-end gap-4"}>
        <label className="min-w-[200px] flex-1">
          <span className={monoLabel}>Class on the wall</span>
          <input
            value={active.className}
            onChange={(e) => setActive((p) => ({ ...p, className: e.target.value.slice(0, 24) }))}
            className="mt-2 w-full rounded-full border border-ink/10 bg-void px-5 py-3 text-sm text-ink outline-none focus:border-signal"
          />
        </label>
        <label className="min-w-[200px] flex-1">
          <span className={monoLabel}>Grid name</span>
          <input
            value={active.name}
            onChange={(e) => setActive((p) => ({ ...p, name: e.target.value.slice(0, 60) }))}
            className="mt-2 w-full rounded-full border border-ink/10 bg-void px-5 py-3 text-sm text-ink outline-none focus:border-signal"
          />
        </label>
        <div className="flex items-center gap-1 self-end">
          {(["wall", "calendar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`min-h-11 px-4 font-mono text-label uppercase tracking-[0.15em] transition-colors ${
                view === v ? "border-b-2 border-signal text-ink" : "border-b-2 border-transparent text-dust hover:text-ink"
              }`}
            >
              {v === "wall" ? "Wall grid" : "Calendar"}
            </button>
          ))}
        </div>
        <p className="w-full font-mono text-label uppercase tracking-[0.15em] text-ash">
          {teachingCount} teaching periods / week · {subjects.length} subjects · today is {todayKey}
        </p>
      </div>

      {view === "wall" && (
        <div className="overflow-x-auto rounded-[21px] border border-ink/10 bg-panel">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="w-[160px] px-4 py-3 text-left font-mono text-micro uppercase tracking-[0.2em] text-ash">Time</th>
                {WEEKDAYS.map((d) => (
                  <th key={d} className={`px-3 py-3 text-left font-mono text-micro uppercase tracking-[0.2em] ${d === todayKey ? "text-signal" : "text-ash"}`}>
                    {d}
                    {d === todayKey && <span className="ml-2 font-mono text-micro text-signal/70">· today</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.times.map((slot, i) => (
                <tr key={i} className="border-b border-ink/10/50 last:border-0">
                  <td className="px-4 py-2 align-top">
                    <div className="flex items-center gap-1.5">
                      <input
                        value={slot.start}
                        onChange={(e) => setTime(i, "start", e.target.value)}
                        type="time"
                        aria-label={"Slot " + (i + 1) + " start"}
                        className="w-[80px] rounded-lg border border-transparent bg-transparent px-1 py-1 font-mono text-meta tabular-nums text-ink outline-none focus:border-signal"
                      />
                      <span className="font-mono text-micro text-ash">–</span>
                      <input
                        value={slot.end}
                        onChange={(e) => setTime(i, "end", e.target.value)}
                        type="time"
                        aria-label={"Slot " + (i + 1) + " end"}
                        className="w-[80px] rounded-lg border border-transparent bg-transparent px-1 py-1 font-mono text-meta tabular-nums text-ink outline-none focus:border-signal"
                      />
                    </div>
                    <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.2em] text-ash/70">
                      {slot.kind === "break" ? "health break" : slot.kind === "lunch" ? "lunch" : slot.kind === "roll" ? "roll call" : prettyRange(slot)}
                    </p>
                  </td>
                  {WEEKDAYS.map((d) => {
                    const v = (active.cells[d]?.[i] ?? "").trim();
                    const tint = subjectTint(v);
                    return (
                      <td key={d} className={`px-2 py-1.5 ${d === todayKey ? "bg-signal/[0.04]" : ""}`}>
                        <input
                          value={active.cells[d]?.[i] ?? ""}
                          onChange={(e) => setCell(d, i, e.target.value)}
                          placeholder="—"
                          style={tint ? { backgroundColor: tint + "14", boxShadow: `inset 3px 0 0 0 ${tint}` } : undefined}
                          className="w-full rounded-lg border border-transparent bg-void px-2.5 py-2 font-mono text-meta uppercase outline-none focus:border-signal"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="px-4 py-2 font-mono text-micro uppercase tracking-[0.2em] text-ash/70">Periods / day</td>
                {WEEKDAYS.map((d) => {
                  const row = active.cells[d] ?? [];
                  let n = 0;
                  active.times.forEach((s, i) => {
                    if (isTeachingCell(row[i] ?? "", s.kind)) n += 1;
                  });
                  return (
                    <td key={d} className={`px-3 py-2 text-center font-mono text-meta ${d === todayKey ? "text-signal" : "text-dust"}`}>
                      {n}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {view === "calendar" && (
        <div className="grid gap-[21px] xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-serif text-2xl font-light">
                {new Date(cal.y, cal.m, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => shiftMonth(-1)} className="min-h-9 rounded-full border border-ink/10 px-3 py-1.5 font-mono text-meta text-dust transition-colors hover:border-signal hover:text-signal" aria-label="Previous month">‹</button>
                <button
                  onClick={() => {
                    const d = new Date();
                    setCal({ y: d.getFullYear(), m: d.getMonth() });
                    setSelDay(d.toDateString());
                  }}
                  className="min-h-9 rounded-full border border-ink/10 px-3 py-1.5 font-mono text-meta text-dust transition-colors hover:border-signal hover:text-signal"
                >
                  Today
                </button>
                <button onClick={() => shiftMonth(1)} className="min-h-9 rounded-full border border-ink/10 px-3 py-1.5 font-mono text-meta text-dust transition-colors hover:border-signal hover:text-signal" aria-label="Next month">›</button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 border-b border-ink/10">
              {CALENDAR_HEAD.map((h, i) => (
                <div key={h} className={`px-2 py-2 font-mono text-micro uppercase tracking-[0.2em] ${i < 5 ? "text-ash" : "text-ash/50"}`}>
                  {h}
                </div>
              ))}
            </div>
            {monthWeeks(cal.y, cal.m).map((week, wi) => (
              <div key={wi} className={`grid grid-cols-7 ${wi < 5 ? "border-b border-ink/10/50" : ""}`}>
                {week.map((d) => {
                  const idx = weekdayIndex(d);
                  const label = idx < 5 ? WEEKDAYS[idx] : null;
                  const lessons = label ? dayLessons[label] : [];
                  const inMonth = d.getMonth() === cal.m;
                  const chips = lessons.slice(0, 3);
                  const key = d.toDateString();
                  return (
                    <button
                      key={key}
                      onClick={() => setSelDay(key)}
                      aria-label={d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                      className={`min-h-[92px] border-r border-ink/5 p-2 text-left transition-colors last:border-r-0 ${
                        key === selDay ? "bg-signal/[0.06]" : "hover:bg-edge/40"
                      } ${!inMonth ? "opacity-30" : ""}`}
                    >
                      <span className="flex items-center gap-1.5 font-mono text-meta">
                        <span className={isToday(d) ? "text-signal" : inMonth ? "text-ink" : "text-dust"}>{d.getDate()}</span>
                        {isToday(d) && <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />}
                      </span>
                      <span className="mt-1.5 block space-y-1">
                        {label && lessons.length > 0 ? (
                          <>
                            {chips.map((l) => (
                              <span
                                key={l.time + l.subject}
                                className="block truncate rounded px-1.5 py-0.5 font-mono text-micro text-ink"
                                style={{ backgroundColor: (subjectTint(l.subject) || "#888") + "26" }}
                              >
                                {l.subject}
                              </span>
                            ))}
                            {lessons.length > 3 && <span className="font-mono text-micro text-ash">+{lessons.length - 3} more</span>}
                          </>
                        ) : (
                          <span className="font-mono text-micro text-ash/50">{idx >= 5 ? "—" : ""}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
            <p className="mt-3 font-mono text-micro uppercase tracking-[0.15em] text-ash/70">
              The week repeats on through the month — holidays are not in this store yet.
            </p>
          </div>

          <aside className={panel + " self-start xl:sticky xl:top-6"}>
            <p className={monoLabel}>Selected day</p>
            <h3 className="mt-2 font-serif text-2xl font-light">
              {selDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <p className="mt-1 text-sm text-dust">
              {active.className} · {selLabel ? `${selLessons.length} lessons` : "weekend"}
            </p>
            <ul className="mt-4 space-y-2.5">
              {selLessons.map((l) => (
                <li key={l.time} className="flex items-center gap-3">
                  <span className="w-[118px] font-mono text-meta tabular-nums text-dust">{rangeFor(l.time)}</span>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: subjectTint(l.subject) || "#555" }} aria-hidden="true" />
                  <span className="truncate font-mono text-label uppercase text-ink">{l.subject}</span>
                </li>
              ))}
              {!selLabel && <li className="text-sm leading-6 text-dust">No periods — the class is off on weekends.</li>}
              {selLabel && selLessons.length === 0 && <li className="text-sm leading-6 text-dust">No teaching periods on this day yet.</li>}
            </ul>
          </aside>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={() => void approve()} className={btn}>Approve — fill Today</button>
      </div>
      {notice !== "" && <p role="status" className="font-mono text-meta text-signal">{notice}</p>}

      {/* The print path: a clean wall grid on white paper. The screen UI
          above is chrome; the paper gets rules and subject names only. */}
      <div aria-hidden="true" className="print-sheet bg-white p-8 text-void print:block print:w-full">
        <p className="font-mono text-micro uppercase tracking-[0.3em]">Timetable · {active.className}</p>
        <h3 className="mt-2 font-serif text-2xl">{active.name}</h3>
        <table className="mt-4 w-full border-collapse text-meta">
          <thead>
            <tr>
              <th className="w-[120px] border-b border-ink/30 px-2 py-1.5 text-left font-mono text-micro uppercase tracking-[0.15em] text-void/70">
                Time
              </th>
              {WEEKDAYS.map((d) => (
                <th key={d} className="border-b border-ink/30 px-2 py-1.5 text-left font-mono text-micro uppercase tracking-[0.15em] text-void/70">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.times.map((slot, i) => (
              <tr key={i}>
                <td className="border-b border-ink/50 px-2 py-1.5 font-mono text-label tabular-nums text-void/80">
                  {prettyRange(slot)}
                  {slot.kind === "break" ? " · break" : slot.kind === "lunch" ? " · lunch" : ""}
                </td>
                {WEEKDAYS.map((d) => {
                  const v = (active.cells[d]?.[i] ?? "").trim();
                  const isFurniture = slot.kind === "break" || slot.kind === "lunch";
                  return (
                    <td
                      key={d}
                      className={`border-b border-ink/50 px-2 py-1.5 font-mono text-label uppercase tracking-wide ${isFurniture ? "text-void/50" : ""}`}
                    >
                      {v === "" ? "·" : v.toUpperCase()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 font-mono text-micro uppercase tracking-[0.15em] text-void/70">
          {teachingCount} teaching periods / week · approved in the Timetable Solver
        </p>
      </div>
    </div>
  );
}