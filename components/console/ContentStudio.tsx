"use client";

// Console 15/16 — Content Studio. The deep local workshop: a CBC-aligned test
// and content bank, and a prediction-error critique engine. Items carry a
// surprise level (0–5) and the misconception hook they are built to break;
// fielded responses come back as trials; the studio computes difficulty,
// discriminator and prediction error against class mastery. Nothing leaves
// the device — the bank, papers and logs live in the content store, and the
// JSON dump moves it between classrooms on a USB stick.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSchoolData } from "./useSchoolData";
import {
  BLOOM_LEVELS,
  CATEGORIES,
  CATEGORY_LABEL,
  classMastery,
  COMPETENCIES,
  ContentItem,
  emptyItem,
  emptyPaper,
  examCritique,
  examDoc,
  GRADE_BANDS,
  itemCritique,
  itemDoc,
  ITEM_TYPES,
  loadContent,
  loadContentDump,
  makeContentDump,
  replaceContent,
  sampleContent,
  SURPRISE_LEVELS,
  VALUES,
  ExamPaper
} from "../../lib/content";
import { idbDelete, idbPut } from "../../lib/db";
import { btn, field, HeadRow, monoLabel, Notice, panel } from "./bits";

type Tab = "Design" | "Bank" | "Critique" | "Papers";
const pill =
  "rounded-full border border-edge px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted transition hover:border-edgeHi hover:text-ivory";

function Dots({ level, title }: { level: number; title?: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={title ?? SURPRISE_LEVELS[level]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < level ? "bg-gold" : "bg-edge"}`} />
      ))}
    </span>
  );
}

function StatusChip({ s }: { s: "draft" | "published" }) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
        s === "published" ? "text-emerald-400" : "text-dim"
      }`}
    >
      {s}
    </span>
  );
}

export default function ContentStudio() {
  const school = useSchoolData();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [exams, setExams] = useState<ExamPaper[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("Design");
  const [note, setNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const mastery = useMemo(() => classMastery(school.assessments), [school.assessments]);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  useEffect(() => {
    let live = true;
    (async () => {
      const c = await loadContent();
      if (!live) return;
      if (c.items.length === 0 && c.exams.length === 0) {
        const s = sampleContent();
        await replaceContent(s.items, s.exams);
        setItems(s.items);
        setExams(s.exams);
        setNote(`Seeded the sample bank — ${s.items.length} items and ${s.exams.length} papers, all on this device.`);
      } else {
        setItems(c.items);
        setExams(c.exams);
      }
      setLoaded(true);
    })();
    return () => {
      live = false;
    };
  }, []);

  async function saveItem(it: ContentItem) {
    await idbPut("content", itemDoc(it));
    setItems((prev) => [...prev.filter((x) => x.id !== it.id), it]);
  }

  async function dropItem(id: string) {
    await idbDelete("content", id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    const affected = exams.filter((e) => e.items.includes(id));
    if (affected.length > 0) {
      const next = exams.map((e) =>
        e.items.includes(id) ? { ...e, items: e.items.filter((x) => x !== id) } : e
      );
      setExams(next);
      for (const p of next) if (affected.some((a) => a.id === p.id)) await idbPut("content", examDoc(p));
    }
  }

  async function savePaper(p: ExamPaper) {
    await idbPut("content", examDoc(p));
    setExams((prev) => [...prev.filter((x) => x.id !== p.id), p]);
  }

  async function dropPaper(id: string) {
    await idbDelete("content", id);
    setExams((prev) => prev.filter((x) => x.id !== id));
  }

  function seedBank() {
    const s = sampleContent();
    replaceContent(s.items, s.exams).then(() => {
      setItems(s.items);
      setExams(s.exams);
      setNote("Sample bank restored — 18 items and 2 papers.");
    });
  }

  function clearBank() {
    if (!window.confirm("Wipe the bank and papers on this device? This keeps students and scores.")) return;
    replaceContent([], []).then(() => {
      setItems([]);
      setExams([]);
      setNote("Bank cleared. The Critique engine keeps working the moment items return.");
    });
  }

  function exportJSON() {
    const blob = new Blob([makeContentDump(school.school, items, exams)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-studio-${school.school.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNote(`Bank and papers exported — ${items.length} items, ${exams.length} papers.`);
  }

  async function onImportFile(f: File) {
    const d = loadContentDump(await f.text());
    if (!d) {
      setNote("That file is not a Content Studio dump.");
      return;
    }
    await replaceContent(d.items, d.exams);
    setItems(d.items);
    setExams(d.exams);
    setNote(`Imported ${d.items.length} items and ${exams.length} papers from the dump.`);
  }

  if (!loaded) return <p className={monoLabel}>Reading the bank…</p>;

  const tabs: Tab[] = ["Design", "Bank", "Critique", "Papers"];
  return (
    <div className="w-full max-w-[880px]">
      <HeadRow
        label="Content Studio — 15/16"
        right={
          <>
            <button type="button" onClick={exportJSON} className={pill}>
              Export
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className={pill}>
              Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportFile(f);
                e.target.value = "";
              }}
            />
          </>
        }
      />

      <p className="mt-1 font-mono text-[11px] leading-5 text-dim">
        CBC-aligned test and content design, critiqued by the prediction-error law: an item the class
        can predict teaches nothing; one it cannot reach is broken. Good sits between — the surprise
        band.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-[21px] py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition ${
              tab === t
                ? "bg-ivory font-semibold text-black"
                : "border border-edge text-muted hover:border-edgeHi hover:text-ivory"
            }`}
          >
            {t}
            {t === "Bank" && ` · ${items.length}`}
            {t === "Papers" && ` · ${exams.length}`}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Design" && <DesignPane items={items} onSave={saveItem} onDrop={dropItem} />}
        {tab === "Bank" && (
          <BankPane items={items} exams={exams} onDrop={dropItem} onSeed={seedBank} onClear={clearBank} />
        )}
        {tab === "Critique" && (
          <CritiquePane
            items={items}
            mastery={mastery}
            scoreCount={school.assessments.length}
            onSave={saveItem}
          />
        )}
        {tab === "Papers" && (
          <PapersPane
            school={school.school}
            items={items}
            exams={exams}
            byId={byId}
            onSave={savePaper}
            onDrop={dropPaper}
          />
        )}
        <Notice tone={note.includes("not a Content Studio") ? "warn" : "ok"}>{note}</Notice>
      </div>
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* Design — one form, every category. The surprise meter is the part  */
/* that makes the item a teacher, not just a measurement.             */
/* ------------------------------------------------------------------ */

function DesignPane({ items, onSave, onDrop }: { items: ContentItem[]; onSave: (i: ContentItem) => void; onDrop: (id: string) => void }) {
  const [draft, setDraft] = useState<ContentItem>(emptyItem());
  const [krasText, setKrasText] = useState("");
  const isTest = draft.category === "test";
  const isMedia = draft.category !== "test" && draft.category !== "lesson" && draft.category !== "timeline";

  function set<K extends keyof ContentItem>(k: K, v: ContentItem[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }
  function submit() {
    const kras = krasText.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    onSave({ ...draft, kras });
    setDraft(emptyItem());
    setKrasText("");
  }

  return (
    <div>
      <div className={`${panel} grid gap-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={draft.category}
            onChange={(e) => set("category", e.target.value as ContentItem["category"])}
            className="rounded-full border border-edge bg-panel px-4 py-2 text-sm outline-none focus:border-gold"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => set("status", "draft")} className={pill}>
              Draft
            </button>
            <button
              type="button"
              onClick={() => set("status", "published")}
              className={
                draft.status === "published"
                  ? "rounded-full bg-ivory px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-black"
                  : pill
              }
            >
              Published
            </button>
          </div>
        </div>

        <input
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="The item — the question, the script, the walkthrough, the line of paper"
          className={field}
          maxLength={220}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <input value={draft.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Subject" className={field} maxLength={40} />
          <select
            value={draft.gradeBand}
            onChange={(e) => set("gradeBand", e.target.value)}
            className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none focus:border-gold"
          >
            {GRADE_BANDS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            value={krasText}
            onChange={(e) => setKrasText(e.target.value)}
            placeholder="KRA codes, comma-separated — e.g. MAT.3.1.4, KES.5.2.1"
            className={field}
            maxLength={140}
          />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
            CBC: assessment follows the learning experience. No KRA, the Critique names it.
          </p>
        </div>

        <select
          value={draft.competency}
          onChange={(e) => set("competency", e.target.value)}
          className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none focus:border-gold"
        >
          <option value="">Competency / value target…</option>
          {COMPETENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          {VALUES.map((v) => (
            <option key={v} value={v}>
              Value · {v}
            </option>
          ))}
        </select>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={monoLabel}>Surprise</span>
            <span className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  title={SURPRISE_LEVELS[n]}
                  onClick={() => set("surprise", n)}
                  className={`h-6 w-6 rounded-full font-mono text-[11px] transition ${
                    draft.surprise === n ? "bg-gold font-bold text-black" : "border border-edge text-dim hover:border-edgeHi"
                  }`}
                >
                  {n}
                </button>
              ))}
            </span>
            <span className="text-[12px] text-muted">{SURPRISE_LEVELS[draft.surprise]}</span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
            Prediction-error strength. 3+ is where the item teaches; 0 is pure recall.
          </p>
        </div>

        <input
          value={draft.misconception}
          onChange={(e) => set("misconception", e.target.value)}
          placeholder="The hook — which wrong prediction does this item break?"
          className={field}
          maxLength={160}
        />

        {isTest && (
          <div className="grid gap-4 sm:grid-cols-3">
            <select
              value={draft.type}
              onChange={(e) => set("type", e.target.value)}
              className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none focus:border-gold"
            >
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={String(draft.bloom)}
              onChange={(e) => set("bloom", Number(e.target.value))}
              className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none focus:border-gold"
            >
              {BLOOM_LEVELS.map((b, i) => (
                <option key={b} value={i}>
                  {b}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={100}
              value={draft.marks}
              onChange={(e) => set("marks", Math.max(0, Number(e.target.value) || 0))}
              className="rounded-full border border-edge bg-panel px-5 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
        )}
        {isMedia && (
          <input
            type="number"
            min={0}
            max={300}
            value={draft.durationMin}
            onChange={(e) => set("durationMin", Math.max(0, Number(e.target.value) || 0))}
            className="w-32 rounded-full border border-edge bg-panel px-5 py-3 text-sm outline-none focus:border-gold"
          />
        )}

        <button type="button" onClick={submit} disabled={!draft.title.trim() || !draft.subject.trim()} className={btn}>
          {draft.title ? "Save the item →" : "Title and subject first →"}
        </button>
      </div>

      <div className="mt-6">
        <p className={monoLabel}>In the bank · {items.length}</p>
        <div className="mt-3 flex flex-col divide-y divide-edge">
          {items.slice(0, 8).map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-ivory">{i.title}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                  {CATEGORY_LABEL[i.category]} · {i.subject} · {i.gradeBand}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Dots level={i.surprise} />
                <StatusChip s={i.status} />
                <button type="button" onClick={() => onDrop(i.id)} className="text-dim transition hover:text-ivory" title="Delete">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 8 && (
          <p className="mt-2 text-[11px] text-dim">
            Showing the first 8 — the Bank tab shows all {items.length}.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bank — the categorized shelf. Eight lanes, filtered, counted.      */
/* ------------------------------------------------------------------ */

function BankPane({
  items,
  exams,
  onDrop,
  onSeed,
  onClear
}: {
  items: ContentItem[];
  exams: ExamPaper[];
  onDrop: (id: string) => void;
  onSeed: () => void;
  onClear: () => void;
}) {
  const [cat, setCat] = useState<string>("all");
  const [band, setBand] = useState<string>("all");
  const [subj, setSubj] = useState("");

  const shown = items.filter(
    (i) =>
      (cat === "all" || i.category === cat) &&
      (band === "all" || i.gradeBand === band) &&
      (subj.trim() === "" || i.subject.toLowerCase().includes(subj.trim().toLowerCase()))
  );
  const inPapers = (id: string) => exams.filter((e) => e.items.includes(id)).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition ${
            cat === "all" ? "bg-ivory font-semibold text-black" : "border border-edge text-muted hover:border-edgeHi"
          }`}
        >
          All · {items.length}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(cat === c.id ? "all" : c.id)}
            className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition ${
              cat === c.id ? "bg-ivory font-semibold text-black" : "border border-edge text-muted hover:border-edgeHi"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={band}
          onChange={(e) => setBand(e.target.value)}
          className="rounded-full border border-edge bg-panel px-4 py-2 text-[13px] outline-none focus:border-gold"
        >
          <option value="all">All bands</option>
          {GRADE_BANDS.filter((g) => g !== "All").map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          value={subj}
          onChange={(e) => setSubj(e.target.value)}
          placeholder="Filter by subject…"
          className="w-48 rounded-full border border-edge bg-panel px-4 py-2 text-[13px] outline-none placeholder:text-dim focus:border-gold"
        />
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onSeed} className={pill}>
            Seed sample bank
          </button>
          <button type="button" onClick={onClear} className={pill}>
            Clear bank
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={`${panel} mt-5 flex min-h-[220px] flex-col items-center justify-center text-center`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
            {items.length === 0 ? "The bank is empty" : "Nothing matches the filters"}
          </p>
          <p className="mt-3 max-w-[44ch] text-sm text-muted">
            {items.length === 0
              ? "Seed the sample bank to see the shape of what a deep library holds — eight categories, KRA-traced, hooks named."
              : "Loosen the filters, or write the item in the Design tab."}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {shown.map((i) => (
            <div key={i.id} className={`${panel} flex flex-col gap-2 p-4`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{CATEGORY_LABEL[i.category]}</span>
                <div className="flex items-center gap-2">
                  <Dots level={i.surprise} />
                  <StatusChip s={i.status} />
                </div>
              </div>
              <p className="text-[14px] leading-snug text-ivory">{i.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                {i.subject} · {i.gradeBand}
                {i.category === "test" ? ` · ${i.type} · ${i.marks} marks` : i.durationMin > 0 ? ` · ${i.durationMin} min` : ""}
              </p>
              {i.kras.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {i.kras.map((k) => (
                    <span key={k} className="rounded-full border border-edge px-2 py-0.5 font-mono text-[10px] text-muted">
                      {k}
                    </span>
                  ))}
                </div>
              )}
              {i.misconception && (
                <p className="text-[12px] leading-5 text-muted">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">Hook — </span>
                  {i.misconception}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between border-t border-edge pt-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                  {inPapers(i.id) > 0 ? `On ${inPapers(i.id)} paper${inPapers(i.id) > 1 ? "s" : ""}` : "Not on a paper yet"}
                </span>
                <button type="button" onClick={() => onDrop(i.id)} className="text-dim transition hover:text-ivory" title="Delete">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Critique — the engine's face. Every fielded test item is scored    */
/* against the class's own mastery: difficulty, discriminator, and    */
/* the prediction error that separates the teachable from the hollow. */
/* ------------------------------------------------------------------ */

const VERDICT_TONE: Record<string, string> = {
  evidence: "text-dim",
  calibrated: "text-emerald-400",
  "too-routine": "text-red-400",
  "too-hard": "text-red-400",
  "weak-discriminator": "text-red-400",
  "too-novel": "text-gold"
};

function CritiquePane({
  items,
  mastery,
  scoreCount,
  onSave
}: {
  items: ContentItem[];
  mastery: number | null;
  scoreCount: number;
  onSave: (i: ContentItem) => void;
}) {
  const [trials, setTrials] = useState<Record<string, { name: string; admissible: number; ok: boolean }>>({});
  const tests = items.filter((i) => i.category === "test");
  const fielded = tests.filter((i) => i.responses.length > 0);
  const resting = tests.filter((i) => i.responses.length === 0);

  function logTrial(item: ContentItem) {
    const t = trials[item.id];
    if (!t || !t.name.trim()) return;
    onSave({ ...item, responses: [...item.responses, { admissible: t.admissible, name: t.name.trim().slice(0, 30), correct: t.ok }] });
    setTrials((prev) => ({ ...prev, [item.id]: { name: "", admissible: 30, ok: true } }));
  }

  return (
    <div>
      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={monoLabel}>Class mastery index</p>
            <p className="mt-1 font-mono text-2xl text-ivory">
              {mastery !== null ? mastery.toFixed(2) : "—"}
              <span className="ml-2 text-[12px] text-dim">
                {mastery !== null ? `from ${scoreCount} logged scores` : "no scores yet"}
              </span>
            </p>
          </div>
          {mastery === null && (
            <div>
              <Link
                href="/console/7"
                className="rounded-full bg-ivory px-5 py-2.5 text-[13px] font-semibold text-black transition hover:bg-gold"
              >
                Mark a test →
              </Link>
              <p className="mt-2 text-[11px] text-dim">
                The Critique computes each item's prediction error against this index. Until the device holds
                scores, items fall back to the 0.50 prior.
              </p>
            </div>
          )}
        </div>
        <p className="mt-4 border-t border-edge pt-4 text-[13px] leading-6 text-muted">
          A good item lands the class's prediction wrong by a measurable, useful amount — the surprise band.
          Too little miss and the item only measures; too much and it reads as broken. Everything below is
          computed on this device from the responses you log.
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-4">
        {fielded.map((i) => {
          const c = itemCritique(i, mastery);
          const t = trials[i.id] ?? { name: "", admissible: 30, ok: true };
          return (
            <div key={i.id} className={panel}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] leading-snug text-ivory">{i.title}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                    {i.subject} · {i.gradeBand} · {i.type} · {BLOOM_LEVELS[i.bloom]} · surprise {i.surprise}/5
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${VERDICT_TONE[c.verdict]}`}
                >
                  {c.verdict}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">Difficulty (p)</p>
                  <div className="relative mt-2 h-1.5 rounded-full bg-edge">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gold"
                      style={{ width: `${Math.round((c.p ?? 0) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[12px] text-ivory">
                    {c.p !== null ? `${Math.round(c.p * 100)}% of ${c.n}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">Prediction error (Δ)</p>
                  <p className="mt-2 font-mono text-[12px] text-ivory">
                    {c.predErr !== null ? `${c.predErr >= 0 ? "+" : ""}${c.predErr.toFixed(2)}` : "—"}
                    <span className="ml-1 text-dim">vs {(mastery ?? 0.5).toFixed(2)} expected</span>
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">Discriminator</p>
                  <p className="mt-2 font-mono text-[12px] text-ivory">
                    {c.pbis !== null ? c.pbis.toFixed(2) : "n/a"}
                    <span className="ml-1 text-dim">point-biserial</span>
                  </p>
                </div>
              </div>

              <p className={`mt-3 text-[13px] leading-5 ${VERDICT_TONE[c.verdict]}`}>{c.line}</p>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-edge pt-3">
                {i.responses.map((r, idx) => (
                  <span key={idx} className="rounded-full border border-edge px-2.5 py-1 font-mono text-[10px] text-muted">
                    {r.name} · {r.admissible}/40 · {r.correct ? "✓" : "✗"}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={t.name}
                  onChange={(e) => setTrials((prev) => ({ ...prev, [i.id]: { ...t, name: e.target.value } }))}
                  placeholder="Adm no."
                  className="w-24 rounded-full border border-edge bg-panel px-3 py-1.5 text-[12px] outline-none placeholder:text-dim focus:border-gold"
                />
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={t.admissible}
                  onChange={(e) =>
                    setTrials((prev) => ({
                      ...prev,
                      [i.id]: { ...t, admissible: Math.max(0, Math.min(40, Number(e.target.value) || 0)) }
                    }))
                  }
                  className="w-16 rounded-full border border-edge bg-panel px-3 py-1.5 text-right font-mono text-[12px] outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => setTrials((prev) => ({ ...prev, [i.id]: { ...t, ok: !t.ok } }))}
                  className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition ${
                    t.ok ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"
                  }`}
                >
                  {t.ok ? "Correct" : "Incorrect"}
                </button>
                <button
                  type="button"
                  onClick={() => logTrial(i)}
                  disabled={!t.name.trim()}
                  className="rounded-full border border-edge px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted transition hover:border-edgeHi hover:text-ivory disabled:opacity-40"
                >
                  Log the response
                </button>
              </div>
            </div>
          );
        })}

        {resting.length > 0 && (
          <div>
            <p className={monoLabel}>Not fielded yet · {resting.length}</p>
            <div className="mt-2 flex flex-col divide-y divide-edge">
              {resting.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 py-2">
                  <p className="truncate text-[13px] text-muted">{i.title}</p>
                  <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                    surprise {i.surprise}/5 · {i.marks} marks
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Papers — compose a CBC paper from the bank, get the critique list, */
/* print an A4 sheet with the marking log.                            */
/* ------------------------------------------------------------------ */

function PapersPane({
  school,
  items,
  exams,
  byId,
  onSave,
  onDrop
}: {
  school: string;
  items: ContentItem[];
  exams: ExamPaper[];
  byId: Map<string, ContentItem>;
  onSave: (p: ExamPaper) => void;
  onDrop: (id: string) => void;
}) {
  const [sel, setSel] = useState<string | null>(exams.length > 0 ? exams[0].id : null);
  const paper = exams.find((e) => e.id === sel) ?? null;
  const marks = paper
    ? paper.items.map((id) => byId.get(id)).filter((i): i is ContentItem => !!i).reduce((s, i) => s + (i.category === "test" ? i.marks : 0), 0)
    : 0;

  function newPaper() {
    const p = emptyPaper();
    onSave(p);
    setSel(p.id);
  }
  function edit(fn: (p: ExamPaper) => ExamPaper) {
    if (!paper) return;
    onSave(fn(paper));
  }
  function move(idx: number, dir: -1 | 1) {
    if (!paper) return;
    const to = idx + dir;
    if (to < 0 || to >= paper.items.length) return;
    const next = [...paper.items];
    const tmp = next[idx];
    next[idx] = next[to];
    next[to] = tmp;
    edit((p) => ({ ...p, items: next }));
  }

  const notes = paper ? examCritique(paper, byId) : [];
  const attachable = paper ? items.filter((i) => !paper.items.includes(i.id)) : [];

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className={panel}>
          <div className="flex items-center justify-between">
            <p className={monoLabel}>Papers · {exams.length}</p>
            <button type="button" onClick={newPaper} className={pill}>
              New
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {exams.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSel(e.id)}
                className={`rounded-[13px] border p-3 text-left transition ${
                  sel === e.id ? "border-gold bg-gold/5" : "border-edge hover:border-edgeHi"
                }`}
              >
                <p className="text-[13px] font-semibold text-ivory">{e.title}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                  {e.term} · {e.subject} · {e.items.length} items
                </p>
              </button>
            ))}
          </div>
          {sel && (
            <button
              type="button"
              onClick={() => {
                onDrop(sel);
                setSel(null);
              }}
              className="mt-3 w-full rounded-full border border-edge px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition hover:border-red-400 hover:text-red-400"
            >
              Delete this paper
            </button>
          )}
        </div>

        {!paper ? (
          <div className={`${panel} flex min-h-[220px] flex-col items-center justify-center text-center`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">No paper selected</p>
            <p className="mt-3 max-w-[40ch] text-sm text-muted">
              Start one, then attach items from the bank and let the critique list tell you what to fix.
            </p>
            <button type="button" onClick={newPaper} className={`${btn} mt-4`}>
              New paper →
            </button>
          </div>
        ) : (
          <div>
            <div className={panel}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={paper.title}
                  onChange={(e) => edit((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Paper title"
                  className={field}
                  maxLength={80}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={paper.subject}
                    onChange={(e) => edit((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Subject"
                    className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none placeholder:text-dim focus:border-gold"
                  />
                  <select
                    value={paper.gradeBand}
                    onChange={(e) => edit((p) => ({ ...p, gradeBand: e.target.value }))}
                    className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none focus:border-gold"
                  >
                    {GRADE_BANDS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <input
                    value={paper.term}
                    onChange={(e) => edit((p) => ({ ...p, term: e.target.value }))}
                    placeholder="Term"
                    className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none placeholder:text-dim focus:border-gold"
                  />
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={paper.durationMin}
                    onChange={(e) => edit((p) => ({ ...p, durationMin: Math.max(10, Number(e.target.value) || 10) }))}
                    className="rounded-full border border-edge bg-panel px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>
              <input
                value={paper.note}
                onChange={(e) => edit((p) => ({ ...p, note: e.target.value }))}
                placeholder="Instruction line on the paper"
                className={`${field} mt-4`}
                maxLength={200}
              />
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
                {paper.items.length} items · {marks} marks · {paper.durationMin} min
              </p>
            </div>

            <div className={`${panel} mt-4`}>
              <p className={monoLabel}>On the paper · {paper.items.length}</p>
              {paper.items.length === 0 ? (
                <p className="mt-3 text-[13px] text-dim">Nothing attached yet — pull items in from the right.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {paper.items.map((id, idx) => {
                    const it = byId.get(id);
                    if (!it) return null;
                    return (
                      <div key={id} className="flex items-center gap-3 rounded-[13px] border border-edge p-3">
                        <span className="w-6 shrink-0 text-right font-mono text-[12px] text-dim">{idx + 1}.</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] text-ivory">{it.title}</p>
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                            {CATEGORY_LABEL[it.category]}
                            {it.category === "test" ? ` · ${it.marks} marks` : it.durationMin > 0 ? ` · ${it.durationMin} min` : ""}
                            {it.status === "draft" ? " · draft" : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button type="button" onClick={() => move(idx, -1)} className="text-dim transition hover:text-ivory" title="Move up">
                            ↑
                          </button>
                          <button type="button" onClick={() => move(idx, 1)} className="text-dim transition hover:text-ivory" title="Move down">
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => edit((p) => ({ ...p, items: p.items.filter((x) => x !== id) }))}
                            className="text-dim transition hover:text-ivory"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {attachable.length > 0 && (
              <div className={`${panel} mt-4`}>
                <p className={monoLabel}>Attach from the bank · {attachable.length}</p>
                <div className="mt-3 flex flex-col">
                  {attachable.slice(0, 10).map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-3 py-2">
                      <p className="truncate text-[13px] text-muted">{i.title}</p>
                      <button
                        type="button"
                        onClick={() => edit((p) => ({ ...p, items: [...p.items, i.id] }))}
                        className="shrink-0 rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted transition hover:border-edgeHi hover:text-ivory"
                      >
                        Attach →
                      </button>
                    </div>
                  ))}
                  {attachable.length > 10 && (
                    <p className="mt-1 text-[11px] text-dim">Showing 10 of {attachable.length} — filter the Bank tab to find the rest.</p>
                  )}
                </div>
              </div>
            )}

            <div className={`${panel} mt-4`}>
              <div className="flex items-center justify-between">
                <p className={monoLabel}>The critique · live</p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full bg-ivory px-5 py-2 text-[13px] font-semibold text-black transition hover:bg-gold"
                >
                  Print the paper
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {notes.map((n, idx) => (
                  <p key={idx} className="flex items-start gap-2 text-[13px] leading-5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.sev === "ok" ? "bg-emerald-400" : n.sev === "watch" ? "bg-gold" : "bg-red-400"
                      }`}
                    />
                    <span className={n.sev === "fail" ? "text-ivory" : "text-muted"}>{n.text}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {paper && (
        <PrintSheet
          school={school}
          paper={paper}
          byId={byId}
          marks={marks}
        />
      )}
    </div>
  );
}

/* The printable A4 sheet — CBC paper header, items, resources, and a
   marking log the teacher completes by hand. Hidden-visibility CSS in
   globals.css makes print() take only this sheet. */
function PrintSheet({ school, paper, byId, marks }: { school: string; paper: ExamPaper; byId: Map<string, ContentItem>; marks: number }) {
  const attached = paper.items.map((id) => byId.get(id)).filter((i): i is ContentItem => !!i);
  const tests = attached.filter((i) => i.category === "test");
  const resources = attached.filter((i) => i.category !== "test");
  return (
    <div className="print-sheet mt-10 rounded-[21px] bg-white p-6 text-black">
      <div className="cs-sheet mx-auto max-w-[720px]">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Republic of Kenya · Competency-Based Curriculum</p>
          <p className="mt-1 text-[15px] font-bold">{school}</p>
          <p className="mt-0.5 text-[12px]">
            {paper.term} · {paper.subject} — CBC Continuous Assessment
          </p>
          <p className="mt-1 text-[12px]">
            Class: {paper.gradeBand} · Duration: {paper.durationMin} min · Total marks: {marks}
          </p>
          <p className="mt-1 text-[11px] italic">{paper.note}</p>
          <div className="mx-auto mt-3 border-t-2 border-current" style={{ width: "60%" }} />
        </div>

        <p className="mt-5 text-[13px] font-bold uppercase tracking-wide">Section A — Questions</p>
        <div className="mt-2 flex flex-col gap-4">
          {tests.map((i, idx) => (
            <div key={i.id}>
              <p className="text-[13px] leading-5">
                <span className="font-semibold">
                  {idx + 1}. {i.title}
                </span>{" "}
                <span className="text-[11px]">({i.marks} marks)</span>
              </p>
              <div className="mt-2 h-9 border-b border-dashed border-current/30" />
            </div>
          ))}
        </div>

        {resources.length > 0 && (
          <>
            <p className="mt-6 text-[13px] font-bold uppercase tracking-wide">Attached resources</p>
            <ul className="mt-1 flex flex-col gap-1">
              {resources.map((i) => (
                <li key={i.id} className="text-[12px]">
                  {CATEGORY_LABEL[i.category]} — {i.title}
                  {i.durationMin > 0 ? ` (${i.durationMin} min)` : ""}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6" style={{ pageBreakBefore: "always" }}>
          <p className="text-[13px] font-bold uppercase tracking-wide">Marking log · teacher</p>
          <table className="mt-2 w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-b-2 border-current text-left">
                <th className="py-1 pr-2 font-mono">No.</th>
                <th className="py-1 pr-2 font-mono">KRA</th>
                <th className="py-1 pr-2 font-mono">Type</th>
                <th className="py-1 pr-2 font-mono">Bloom</th>
                <th className="py-1 pr-2 font-mono">Surprise</th>
                <th className="py-1 pr-2 font-mono">Marks</th>
                <th className="py-1 font-mono">Key notes</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((i, idx) => (
                <tr key={i.id} className="border-b border-current/20 align-top">
                  <td className="py-1.5 pr-2 font-mono">{idx + 1}</td>
                  <td className="py-1.5 pr-2 font-mono">{i.kras.join(" ") || "—"}</td>
                  <td className="py-1.5 pr-2">{i.type}</td>
                  <td className="py-1.5 pr-2">{BLOOM_LEVELS[i.bloom]}</td>
                  <td className="py-1.5 pr-2 font-mono">{i.surprise}/5</td>
                  <td className="py-1.5 pr-2 font-mono">{i.marks}</td>
                  <td className="py-1.5">{i.misconception ? `Hook: ${i.misconception}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px]">
            APT-LABS Content Studio · {new Date().toLocaleDateString()} · printed on this device
          </p>
        </div>
      </div>
    </div>
  );
}

