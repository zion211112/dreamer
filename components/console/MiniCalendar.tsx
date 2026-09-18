import { useMemo, useState } from "react";

import { collisionsOn, makeScheduleItem, ScheduleItem } from "../../lib/events";
import { ClassPicker } from "./ClassPicker";
import { btn, btnGhost, field, monoLabel } from "./bits";

// A small, calm month planner that sits inside My Day. It reads the teacher's
// own schedule items (class or personal) and flags the days where two timed
// items overlap. Notion-like: quiet dots, one day expanded, nothing more.
interface Props {
  items: ScheduleItem[];
  onAdd: (item: ScheduleItem) => void;
  onRemove: (id: string) => void;
}

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function MiniCalendar({ items, onAdd, onRemove }: Props) {
  const today = new Date();
  const todayKey = toKey(today);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState(todayKey);
  const [adding, setAdding] = useState(false);
  const [fTime, setFTime] = useState("08:00");
  const [fTitle, setFTitle] = useState("");
  const [fKind, setFKind] = useState<"class" | "personal">("class");
  const [fClass, setFClass] = useState("");

  const y = view.getFullYear();
  const m = view.getMonth();
  const grid = useMemo(() => {
    const start = new Date(y, m, 1);
    const offset = (start.getDay() + 6) % 7; // Monday-first
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) cells.push(new Date(y, m, 1 - offset + i));
    return cells;
  }, [y, m]);

  const dayItems = items
    .filter((i) => i.date === sel)
    .sort((a, b) => (a.time || "~").localeCompare(b.time || "~") || (a.kind === "class" ? -1 : 1));
  const colliding = useMemo(() => {
    const dates = new Set(items.map((i) => i.date));
    const coll = new Set<string>();
    for (const d of dates) if (collisionsOn(items, d).size > 0) coll.add(d);
    return coll;
  }, [items]);
  const dayCollisions = collisionsOn(items, sel);

  const add = () => {
    const title = fTitle.trim() || (fKind === "class" ? fClass.trim() : "Personal");
    onAdd(makeScheduleItem(sel, fTime, title, fKind, fKind === "class" ? fClass : "", fKind === "class" ? fTitle.trim() : ""));
    setFTitle("");
    setFClass("");
    setAdding(false);
  };

  const dayDot = (key: string) => {
    const has = (kind: "class" | "personal") => items.some((i) => i.date === key && i.kind === kind);
    if (!has("class") && !has("personal")) return null;
    return (
      <span className="mt-0.5 flex items-center gap-[3px]">
        {has("class") && <span className="h-[5px] w-[5px] rounded-full bg-ivory/70" />}
        {has("personal") && <span className="h-[5px] w-[5px] rounded-full bg-gold" />}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ivory">
          {view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button onClick={() => setView(new Date(y, m - 1, 1))} className="rounded-lg border border-edge px-2 py-0.5 text-dim hover:text-ivory" aria-label="Previous month">
            ‹
          </button>
          <button onClick={() => setView(new Date(y, m + 1, 1))} className="rounded-lg border border-edge px-2 py-0.5 text-dim hover:text-ivory" aria-label="Next month">
            ›
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
        {WEEK.map((d, i) => (
          <span key={i} className="font-mono text-[9px] uppercase tracking-[0.15em] text-dim">
            {d}
          </span>
        ))}
        {grid.map((cell) => {
          const key = toKey(cell);
          const inMonth = cell.getMonth() === m;
          const isToday = key === todayKey;
          const isSel = key === sel;
          return (
            <button
              key={key}
              onClick={() => setSel(key)}
              className={`flex h-[34px] flex-col items-start justify-start rounded-lg border p-1 text-left transition-colors ${isSel ? "border-gold/60 bg-gold-soft" : "border-transparent hover:border-edge"}`}
            >
              <span className={`text-[11px] leading-none ${inMonth ? "text-ivory" : "text-dim/40"} ${isToday ? "font-bold text-gold" : ""}`}>
                {cell.getDate()}
              </span>
              {colliding.has(key) ? <span className="mt-0.5 text-[9px] leading-none text-gold">⚠</span> : dayDot(key)}
            </button>
          );
        })}
      </div>

      {/* The selected day, expanded — one day at a time. */}
      <div className="mt-3 border-t border-edge pt-3">
        <div className="flex items-center justify-between">
          <p className={monoLabel}>
            {new Date(`${sel}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <button onClick={() => setAdding((a) => !a)} className={btnGhost}>
            {adding ? "Close" : "+ Add"}
          </button>
        </div>

        {dayItems.length === 0 ? (
          <p className="mt-2 text-xs text-muted">Nothing planned for this day.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {dayItems.map((i) => (
              <li key={i.id} className="flex items-center gap-2 rounded-lg border border-edge/60 px-2.5 py-1.5">
                <span className="w-10 shrink-0 font-mono text-[10px] text-dim">{i.time || "—"}</span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-ivory">
                  {i.title}
                  {i.kind === "class" && i.className ? <span className="text-dim"> · {i.className}</span> : null}
                </span>
                {dayCollisions.has(i.id) && <span title="Overlaps another timed item" className="text-[10px] text-gold">⚠</span>}
                {i.kind === "personal" && <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-dim">personal</span>}
                <button onClick={() => onRemove(i.id)} aria-label="Remove" className="text-[11px] text-dim hover:text-red-400">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {adding && (
          <div className="mt-3 space-y-2.5 rounded-xl border border-edge bg-void p-3">
            <div className="grid grid-cols-2 gap-2">
              <input value={fTime} onChange={(e) => setFTime(e.target.value)} type="time" className={field} />
              <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder={fKind === "class" ? "Subject" : "What's happening"} className={field} />
            </div>
            <div className="flex gap-1.5">
              {(["class", "personal"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFKind(k)}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${fKind === k ? "border-gold bg-gold-soft text-gold" : "border-edge text-dim"}`}
                >
                  {k}
                </button>
              ))}
            </div>
            {fKind === "class" && <ClassPicker value={fClass} onChange={setFClass} />}
            <button onClick={add} className={btn}>
              Add to {new Date(`${sel}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short" })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}