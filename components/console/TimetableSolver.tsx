"use client";
import { useState } from "react";
import Link from "next/link";
import { DEMO_TIMETABLES, WEEKDAYS, WeeklyTimetable, isTeachingCell, loadApprovedTimetable, prettyRange, saveApprovedTimetable, subjectsInTimetable, weekdayKey, lessonsForDay } from "../../lib/timetable";

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
      { start: "14:00", end: "14:40", kind: "lesson" },
    ],
    cells: { MON: [...blank], TUE: [...blank], WED: [...blank], THUR: [...blank], FRI: [...fri] },
  };
}

export default function TimetableSolver() {
  const [active, setActive] = useState<WeeklyTimetable>(() => loadApprovedTimetable() ?? structuredClone(DEMO_TIMETABLES[0]));
  const [notice, setNotice] = useState("");
  const [approvedName, setApprovedName] = useState(() => loadApprovedTimetable()?.name ?? "");
  const [demoSel, setDemoSel] = useState<number>(() => (loadApprovedTimetable() ? -1 : 0));
  const todayKey = weekdayKey(new Date());
  let teachingCount = 0;
  for (const d of WEEKDAYS) {
    const row = active.cells[d] ?? [];
    active.times.forEach((s, i) => { if (isTeachingCell(row[i] ?? "", s.kind)) teachingCount += 1; });
  }
  const subjects = subjectsInTimetable(active);

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
      time: l.time, className: l.className, subject: l.subject, room: "", teacher: "",
    }));
    await saveDayPlan(lessons);
    setNotice("Approved — " + active.className + " · " + lessons.length + " periods fill Today (" + day + ").");
  }

  return (
    <div className="min-w-0 max-w-full space-y-8">
      <div className="border-b border-ivory/10 pb-6">
        <p className={monoLabel}>Timetable Solver · build · print · approve</p>
        <h1 className="mt-3 font-display text-4xl font-light tracking-tight md:text-5xl">The week, on one wall grid.</h1>
        <p className="mt-3 max-w-[62ch] text-sm leading-6 text-muted">
          Start from a real CBC wall grid, rewrite any cell, print for the wall, then approve once —{" "}
          <span className="text-ivory">Today reads the approved week</span>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href="/console/17" className={btnGhost + " px-4 py-2"}>→ Open My Day</Link>
          <PrintButton label="Print wall grid" />
          {approvedName !== "" && <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-teal">Approved · {approvedName}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {DEMO_TIMETABLES.map((d, i) => (
          <button
            key={d.name}
            onClick={() => {
              setActive(structuredClone(d));
              setDemoSel(i);
              setNotice("Loaded demo grid — rewrite, print, approve.");
            }}
            className={`rounded-[21px] border p-[21px] text-left transition-colors ${
              i === demoSel ? "border-amber/60 bg-amber/5" : "border-ivory/10 bg-panel hover:border-ivory/30"
            }`}
          >
            <p className={monoLabel}>Demo {i + 1} · {d.className}</p>
            <p className="mt-2 font-display text-xl font-normal leading-snug">{d.name}</p>
            <p className="mt-2 text-[13px] leading-5 text-muted">{subjectsInTimetable(d).slice(0, 5).join(" · ")}</p>
          </button>
        ))}
        <button
          onClick={() => {
            setActive(emptyGrid());
            setDemoSel(-1);
            setNotice("Blank week — 7 teaching periods, breaks, lunch, Friday PPI.");
          }}
          className="rounded-[21px] border border-dashed border-ivory/10 bg-void p-[21px] text-left transition-colors hover:border-amber/60"
        >
          <p className={monoLabel}>Blank</p>
          <p className="mt-2 font-display text-xl font-normal">Start empty</p>
        </button>
      </div>

      <div className={panel + " flex flex-wrap items-end gap-4"}>
        <label className="min-w-[200px] flex-1">
          <span className={monoLabel}>Class on the wall</span>
          <input
            value={active.className}
            onChange={(e) => setActive((p) => ({ ...p, className: e.target.value.slice(0, 24) }))}
            className="mt-2 w-full rounded-full border border-ivory/10 bg-void px-5 py-3 text-sm text-ivory outline-none focus:border-amber"
          />
        </label>
        <label className="min-w-[200px] flex-1">
          <span className={monoLabel}>Grid name</span>
          <input
            value={active.name}
            onChange={(e) => setActive((p) => ({ ...p, name: e.target.value.slice(0, 60) }))}
            className="mt-2 w-full rounded-full border border-ivory/10 bg-void px-5 py-3 text-sm text-ivory outline-none focus:border-amber"
          />
        </label>
        <p className="w-full font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
          {teachingCount} teaching periods / week · {subjects.length} subjects · today is {todayKey}
        </p>
      </div>

      <div className="overflow-x-auto rounded-[21px] border border-ivory/10 bg-panel">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-ivory/10">
              <th className="w-[160px] px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-dim">Time</th>
              {WEEKDAYS.map((d) => (
                <th key={d} className="px-3 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.times.map((slot, i) => (
              <tr key={i} className="border-b border-ivory/10/50 last:border-0">
                <td className="px-4 py-2 align-top">
                  <div className="flex items-center gap-1.5">
                    <input value={slot.start} onChange={(e) => setTime(i, "start", e.target.value)} type="time" aria-label={"Slot " + (i + 1) + " start"}
                      className="w-[80px] rounded-lg border border-transparent bg-transparent px-1 py-1 font-mono text-[12px] tabular-nums text-ivory outline-none focus:border-amber" />
                    <span className="font-mono text-[10px] text-dim">–</span>
                    <input value={slot.end} onChange={(e) => setTime(i, "end", e.target.value)} type="time" aria-label={"Slot " + (i + 1) + " end"}
                      className="w-[80px] rounded-lg border border-transparent bg-transparent px-1 py-1 font-mono text-[12px] tabular-nums text-muted outline-none focus:border-amber" />
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-dim/70">
                    {slot.kind === "break" ? "health break" : slot.kind === "lunch" ? "lunch" : slot.kind === "roll" ? "roll call" : prettyRange(slot)}
                  </p>
                </td>
                {WEEKDAYS.map((d) => (
                  <td key={d} className="px-2 py-1.5">
                    <input
                      value={active.cells[d]?.[i] ?? ""}
                      onChange={(e) => setCell(d, i, e.target.value)}
                      placeholder="—"
                      className="w-full rounded-lg border border-transparent bg-void px-2.5 py-2 font-mono text-[12px] uppercase outline-none focus:border-amber"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => void approve()} className={btn}>Approve — fill Today</button>
      </div>
      {notice !== "" && <p role="status" className="font-mono text-[12px] text-amber">{notice}</p>}

      {/* The print path: a clean wall grid on white paper. The screen UI
          above is chrome; the paper gets rules and subject names only. */}
      <div
        aria-hidden="true"
        className="print-sheet bg-white p-8 text-obsidian print:block print:w-full"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Timetable · {active.className}</p>
        <h3 className="mt-2 font-display text-2xl">{active.name}</h3>
        <table className="mt-4 w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="w-[120px] border-b border-ivory/30 px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-obsidian/70">
                Time
              </th>
              {WEEKDAYS.map((d) => (
                <th key={d} className="border-b border-ivory/30 px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-obsidian/70">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.times.map((slot, i) => (
              <tr key={i}>
                <td className="border-b border-ivory/50 px-2 py-1.5 font-mono text-[11px] tabular-nums text-obsidian/80">
                  {prettyRange(slot)}
                  {slot.kind === "break" ? " · break" : slot.kind === "lunch" ? " · lunch" : ""}
                </td>
                {WEEKDAYS.map((d) => {
                  const v = (active.cells[d]?.[i] ?? "").trim();
                  const label =
                    v === "" ? "·" : v.toUpperCase();
                  const isFurniture = slot.kind === "break" || slot.kind === "lunch";
                  return (
                    <td
                      key={d}
                      className={`border-b border-ivory/50 px-2 py-1.5 font-mono text-[11px] uppercase tracking-wide ${isFurniture ? "text-obsidian/50" : ""}`}
                    >
                      {label}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-obsidian/70">
          {teachingCount} teaching periods / week · approved in the Timetable Solver
        </p>
      </div>
    </div>
  );
}

