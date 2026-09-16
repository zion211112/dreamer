"use client";

// Console 15 — Content Studio, the Atelier.
//
// Three rooms, one motion. The ORCHARD (left) is the recursive navigator —
// subject, then strand, then KRA, then item; one component that renders
// itself at any depth and is pruned by search. The LOOM (centre) is the
// recursive editor: the item's anatomy is a stack of nested nodes —
// prerequisite mapping, cognitive target, misconception elicitation,
// mastery evidence — each opening its own inner shelf; a paper becomes a
// composer with a white print sheet. The AUDITOR (right) is the structural
// critique: deterministic, expert-tuned checks (lib/audit.ts) that follow
// whatever is selected, with a whole-bank audit on demand.
//
// Predictive learning is gone: no surprise meter, no mastery deltas, no
// logged trials. What remains is design science — exam design, lesson
// design, media, classroom papers — checked on the device before it
// reaches the class. The bank, papers and sheets live in the content
// store; a JSON dump moves it between classrooms on a stick.

import { useEffect, useMemo, useRef, useState } from "react";
import { useSchoolData } from "./useSchoolData";
import {
  BLOOM_LEVELS,
  CATEGORIES,
  CATEGORY_LABEL,
  ContentItem,
  COMPETENCIES,
  ExamPaper,
  GRADE_BANDS,
  ITEM_TYPES,
  VALUES,
  emptyItem,
  emptyPaper,
  examDoc,
  itemDoc,
  loadContent,
  loadContentDump,
  makeContentDump,
  parseKra,
  replaceContent,
  sampleContent
} from "../../lib/content";
import { auditBank, auditItem, auditPaper, BankReport, Check, Sev } from "../../lib/audit";
import { idbDelete, idbPut } from "../../lib/db";
import { btn, monoLabel, Notice } from "./bits";

type Sel = { t: "item"; id: string } | { t: "paper"; id: string } | null;

const room = "rounded-[21px] border border-edge bg-panel";
const ghostBtn =
  "rounded-full border border-edge px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted transition hover:border-edgeHi hover:text-ivory";
const box =
  "w-full rounded-full border border-edge bg-void/40 px-4 py-2.5 text-[13px] text-ivory outline-none transition-colors placeholder:text-dim/60 focus:border-gold";
const BLOOM_HINTS = [
  "retrieve",
  "explain in own words",
  "apply in a new context",
  "break apart and compare",
  "justify a stand",
  "construct"
];

/* ------------------------------------------------------------------ */
/* The Orchard — subject → strand → KRA → item, recursive.            */
/* ------------------------------------------------------------------ */

interface TNode {
  key: string;
  kind: "subject" | "strand" | "kra" | "item";
  label: string;
  meta?: string;
  itemId?: string;
  kraCode?: string;
  subject?: string;
  count?: number;
  children: TNode[];
}

function gradeLabel(g: string): string {
  if (g.startsWith("J")) return `Junior ${g.slice(1)}`;
  if (g.startsWith("L")) return `Lower ${g.slice(1)}`;
  const n = Number(g);
  if (!Number.isNaN(n) && n >= 1 && n <= 3) return `Lower ${n}`;
  if (!Number.isNaN(n) && n >= 4 && n <= 6) return `Upper ${n}`;
  return `Grade ${g}`;
}

function itemNode(it: ContentItem): TNode {
  return { key: `i:${it.id}`, kind: "item", label: it.title || "Untitled", itemId: it.id, meta: CATEGORY_LABEL[it.category], children: [] };
}

// The navigator is one component that recurses; strands are read off the
// KRA address itself, so the Orchard never invents a name it cannot defend.
function buildTree(list: ContentItem[], q: string): { nodes: TNode[]; pathOf: Record<string, string[]> } {
  const pathOf: Record<string, string[]> = {};
  const query = q.trim().toLowerCase();
  const match = (it: ContentItem) =>
    query === "" ||
    [it.title, it.subject, it.gradeBand, it.misconception, CATEGORY_LABEL[it.category], it.kras.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(query);

  const subjects = new Map<string, { name: string; items: ContentItem[] }>();
  for (const it of list) {
    const name = it.subject.trim() || "Unlabelled";
    const rec = subjects.get(name) ?? { name, items: [] };
    rec.items.push(it);
    subjects.set(name, rec);
  }

  const nodes: TNode[] = [];
  for (const subj of subjects.values()) {
    const shown = subj.items.filter(match);
    if (shown.length === 0) continue;

    const strands = new Map<string, { meta: string; label: string; items: ContentItem[] }>();
    const untraced: ContentItem[] = [];
    for (const it of shown) {
      if (it.kras.length === 0) {
        untraced.push(it);
        continue;
      }
      const ref = parseKra(it.kras[0]);
      const sk = `${ref.subject}.${ref.grade}.${ref.strand}`;
      const rec = strands.get(sk) ?? { meta: sk, label: `${gradeLabel(ref.grade)} · Strand ${ref.strand}`, items: [] };
      rec.items.push(it);
      strands.set(sk, rec);
    }

    const subjKey = `s:${subj.name}`;
    const childNodes: TNode[] = [];
    for (const [sk, rec] of [...strands.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const kraGroups = new Map<string, ContentItem[]>();
      for (const it of rec.items) kraGroups.set(it.kras[0], [...(kraGroups.get(it.kras[0]) ?? []), it]);
      const kraNodes: TNode[] = [...kraGroups.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([code, its]) => ({
          key: `k:${subj.name}|${sk}|${code}`,
          kind: "kra",
          label: code,
          kraCode: code,
          subject: subj.name,
          count: its.length,
          children: its.map(itemNode)
        }));
      childNodes.push({
        key: `st:${subj.name}|${sk}`,
        kind: "strand",
        label: rec.label,
        meta: rec.meta,
        count: rec.items.length,
        children: kraNodes
      });
      for (const it of rec.items) pathOf[it.id] ??= [subjKey, `st:${subj.name}|${sk}`, `k:${subj.name}|${sk}|${it.kras[0]}`];
    }
    if (untraced.length > 0) {
      childNodes.push({
        key: `st:${subj.name}|un`,
        kind: "strand",
        label: "Untraced",
        meta: "no KRA",
        count: untraced.length,
        children: untraced.map(itemNode)
      });
      for (const it of untraced) pathOf[it.id] ??= [subjKey, `st:${subj.name}|un`];
    }
    nodes.push({ key: subjKey, kind: "subject", label: subj.name, count: shown.length, children: childNodes });
  }
  nodes.sort((a, b) => a.label.localeCompare(b.label));
  return { nodes, pathOf };
}

function expandAllKeys(list: ContentItem[]): Set<string> {
  const { nodes } = buildTree(list, "");
  const s = new Set<string>();
  const walk = (ns: TNode[]) => {
    for (const n of ns) {
      if (n.kind !== "item") s.add(n.key);
      walk(n.children);
    }
  };
  walk(nodes);
  return s;
}

export default function ContentStudio() {
  const school = useSchoolData();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [exams, setExams] = useState<ExamPaper[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sel, setSel] = useState<Sel>(null);
  const [draft, setDraft] = useState<ContentItem | null>(null);
  const [pending, setPending] = useState<ContentItem | null>(null);
  const [dirty, setDirty] = useState(false);
  const [paperDraft, setPaperDraft] = useState<ExamPaper | null>(null);
  const [report, setReport] = useState<BankReport | null>(null);
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const allItems = useMemo(() => (pending ? [...items, pending] : items), [items, pending]);
  const tree = useMemo(() => buildTree(allItems, q), [allItems, q]);
  const pathOf = useMemo(() => buildTree(allItems, "").pathOf, [allItems]);

  // The bank, seeded on first visit, never leaves this device.
  useEffect(() => {
    let live = true;
    (async () => {
      let c = await loadContent();
      if (!live) return;
      if (c.items.length === 0 && c.exams.length === 0) {
        const s = sampleContent();
        await replaceContent(s.items, s.exams);
        c = s;
        setNote(`Seeded the sample bank — ${s.items.length} items and ${s.exams.length} papers, all on this device.`);
      }
      setItems(c.items);
      setExams(c.exams);
      setOpen(expandAllKeys(c.items));
      setLoaded(true);
    })();
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(""), 6000);
    return () => clearTimeout(t);
  }, [note]);

  /* --- items: seal, publish, discard, unmake ---------------------- */

  async function seal(d: ContentItem) {
    await idbPut("content", itemDoc(d));
    setItems((prev) => (prev.some((x) => x.id === d.id) ? prev.map((x) => (x.id === d.id ? d : x)) : [...prev, d]));
    if (pending?.id === d.id) setPending(null);
    setDirty(false);
  }

  function mut(fn: (d: ContentItem) => ContentItem) {
    if (!draft) return;
    setDraft(fn(draft));
    setDirty(true);
  }

  function selectItem(id: string) {
    if (pending && pending.id !== id) {
      if (dirty && !window.confirm("Discard the unsealed item? It has not entered the bank.")) return;
      setPending(null);
    }
    if (draft && draft.id !== id && dirty) void seal(draft);
    const it = byId.get(id) ?? pending;
    setDraft(it ?? null);
    setDirty(!!it && it === pending);
    setSel({ t: "item", id });
    const keys = pathOf[id];
    if (keys)
      setOpen((prev) => {
        const s = new Set(prev);
        for (const k of keys) s.add(k);
        return s;
      });
  }

  function newUnder(kra?: string, subject?: string) {
    if (pending && dirty && !window.confirm("Discard the unsealed item? It has not entered the bank.")) return;
    const p = { ...emptyItem(), subject: subject ?? "", kras: kra ? [kra] : [], status: "draft" as const };
    setPending(p);
    setDraft(p);
    setDirty(true);
    setSel({ t: "item", id: p.id });
    setReport(null);
    setNote(kra ? `New item under ${kra} — seal it to put it in the bank.` : "New item — seal it to put it in the bank.");
  }

  function discardPending() {
    setPending(null);
    setDraft(null);
    setDirty(false);
    setSel(null);
    setNote("Unsealed item discarded.");
  }

  async function publish() {
    if (!draft) return;
    const flipped = draft.status === "published";
    const d = { ...draft, status: flipped ? ("draft" as const) : ("published" as const) };
    await seal(d);
    setDraft(d);
    setNote(flipped ? "Moved back to draft." : "Published — cleared for print.");
  }

  async function dropItem(id: string) {
    if (!window.confirm("Unmake this item? It leaves the bank and every paper it sits on.")) return;
    await idbDelete("content", id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (pending?.id === id) {
      setPending(null);
      setDraft(null);
      setDirty(false);
    }
    const affected = exams.filter((e) => e.items.includes(id));
    if (affected.length > 0) {
      const next = exams.map((e) => (e.items.includes(id) ? { ...e, items: e.items.filter((x) => x !== id) } : e));
      setExams(next);
      for (const p of next) if (affected.some((a) => a.id === p.id)) await idbPut("content", examDoc(p));
      setPaperDraft((prev) => (prev && affected.some((a) => a.id === prev.id) ? { ...prev, items: prev.items.filter((x) => x !== id) } : prev));
    }
    if (sel?.t === "item" && sel.id === id) {
      setSel(null);
      if (draft?.id === id) setDraft(null);
    }
    setNote("Item unmade.");
  }

  /* --- papers: autosave the sheet as it is composed --------------- */

  function selectPaper(id: string) {
    const p = exams.find((x) => x.id === id);
    setSel({ t: "paper", id });
    setPaperDraft(p ? { ...p } : null);
    setReport(null);
  }

  async function newPaper() {
    const p = emptyPaper();
    await idbPut("content", examDoc(p));
    setExams((prev) => [...prev, p]);
    setSel({ t: "paper", id: p.id });
    setPaperDraft(p);
    setReport(null);
    setNote("New paper — attach items, then print the sheet.");
  }

  function editPaper(fn: (p: ExamPaper) => ExamPaper) {
    if (!paperDraft) return;
    const p = fn(paperDraft);
    setPaperDraft(p);
    void (async () => {
      await idbPut("content", examDoc(p));
      setExams((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    })();
  }

  async function dropPaper(id: string) {
    if (!window.confirm("Unmake this paper? Its items stay in the bank.")) return;
    await idbDelete("content", id);
    setExams((prev) => prev.filter((x) => x.id !== id));
    if (sel?.t === "paper" && sel.id === id) {
      setSel(null);
      setPaperDraft(null);
    }
    setNote("Paper unmade.");
  }

  /* --- the bank as a whole ----------------------------------------- */

  function seedBank() {
    const s = sampleContent();
    void replaceContent(s.items, s.exams).then(() => {
      setItems(s.items);
      setExams(s.exams);
      setSel(null);
      setDraft(null);
      setPending(null);
      setPaperDraft(null);
      setDirty(false);
      setOpen(expandAllKeys(s.items));
      setReport(null);
      setNote(`Sample bank restored — ${s.items.length} items and ${s.exams.length} papers.`);
    });
  }

  function clearBank() {
    if (!window.confirm("Wipe the bank and every paper on this device? Students and scores stay.")) return;
    void replaceContent([], []).then(() => {
      setItems([]);
      setExams([]);
      setSel(null);
      setDraft(null);
      setPending(null);
      setPaperDraft(null);
      setDirty(false);
      setOpen(new Set());
      setReport(null);
      setNote("Bank cleared — start fresh, or restore the sample.");
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
    setNote(`Bank and papers exported — ${items.length} items, ${exams.length} papers. The file travels on a stick.`);
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
    setSel(null);
    setDraft(null);
    setPending(null);
    setPaperDraft(null);
    setDirty(false);
    setOpen(expandAllKeys(d.items));
    setReport(null);
    setNote(`Imported ${d.items.length} items and ${d.exams.length} papers from the dump.`);
  }

  if (!loaded) return <div className={room}><p className={`${monoLabel} p-[21px]`}>Reading the bank…</p></div>;

  const activeChecks: Check[] =
    sel?.t === "item"
      ? draft
        ? auditItem(draft)
        : []
      : sel?.t === "paper"
        ? paperDraft
          ? auditPaper(paperDraft, byId)
          : []
        : [];
  const counts = {
    pass: activeChecks.filter((c) => c.sev === "pass").length,
    watch: activeChecks.filter((c) => c.sev === "watch").length,
    fail: activeChecks.filter((c) => c.sev === "fail").length
  };

  return (
    <div className="w-full">
      {/* The ribbon — one gold rule, two verbs, no ceremony the tool doesn't earn. */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-edge pb-5">
        <div className="flex flex-wrap items-baseline gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">The Atelier</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">φ 1.618 · on this device</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className={ghostBtn}>
            Import
          </button>
          <button type="button" onClick={exportJSON} className={ghostBtn}>
            Export
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImportFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)_330px]">
        <OrchardPane
          tree={tree}
          q={q}
          setQ={setQ}
          open={open}
          selId={sel?.t === "item" ? sel.id : null}
          onPick={selectItem}
          onToggle={(k) =>
            setOpen((prev) => {
              const s = new Set(prev);
              if (s.has(k)) s.delete(k);
              else s.add(k);
              return s;
            })
          }
          onNew={newUnder}
          exams={exams}
          selPaperId={sel?.t === "paper" ? sel.id : null}
          onPickPaper={selectPaper}
          onNewPaper={() => void newPaper()}
          onSeed={seedBank}
          onClear={clearBank}
        />

        {sel?.t === "item" && draft ? (
          <LoomItem
            draft={draft}
            isPending={pending?.id === draft.id}
            dirty={dirty}
            onMut={mut}
            onSeal={() => {
              void seal(draft).then(() => setNote("Item sealed — it is in the bank, on this device."));
            }}
            onPublish={() => void publish()}
            onDiscard={discardPending}
            onDrop={() => void dropItem(draft.id)}
          />
        ) : sel?.t === "paper" && paperDraft ? (
          <LoomPaper
            school={school.school}
            paper={paperDraft}
            byId={byId}
            items={items}
            onEdit={editPaper}
            onOpenItem={selectItem}
            onDrop={() => void dropPaper(paperDraft.id)}
          />
        ) : (
          <LoomEmpty
            itemCount={items.length}
            paperCount={exams.length}
            onNewItem={() => newUnder()}
            onNewPaper={() => void newPaper()}
          />
        )}

        <AuditorPane checks={activeChecks} counts={counts} report={report} onAudit={() => setReport(auditBank(items, exams))} />
      </div>

      <Notice tone={note.includes("not a Content Studio") ? "warn" : "ok"}>{note}</Notice>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The Orchard — the left room. Recursive tree, search, the papers.  */
/* ------------------------------------------------------------------ */

function TreeNode({
  node,
  depth,
  searching,
  open,
  selId,
  onToggle,
  onPick,
  onNew
}: {
  node: TNode;
  depth: number;
  searching: boolean;
  open: Set<string>;
  selId: string | null;
  onToggle: (k: string) => void;
  onPick: (id: string) => void;
  onNew: (kra?: string, subject?: string) => void;
}) {
  const isItem = node.kind === "item";
  const isOpen = searching || open.has(node.key);
  const active = isItem && selId === node.itemId;
  return (
    <div>
      <button
        type="button"
        onClick={() => (isItem ? onPick(node.itemId!) : onToggle(node.key))}
        style={{ paddingLeft: 6 + depth * 12 }}
        className={`group flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left transition ${
          active ? "bg-gold/10" : "hover:bg-void/60"
        }`}
      >
        {isItem ? (
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-gold" : "bg-edgeHi group-hover:bg-gold/70"}`} />
        ) : (
          <svg
            className={`h-3 w-3 shrink-0 text-dim transition-transform ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span
          className={`min-w-0 flex-1 truncate ${
            node.kind === "subject"
              ? "text-[13px] font-semibold text-ivory"
              : node.kind === "kra"
                ? "font-mono text-[11px] text-gold/90"
                : node.kind === "item"
                  ? active
                    ? "text-[12.5px] text-gold"
                    : "text-[12.5px] text-muted group-hover:text-ivory"
                  : "text-[12px] text-muted group-hover:text-ivory"
          }`}
        >
          {node.label}
        </span>
        {isItem ? (
          <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-wider text-dim">{node.meta}</span>
        ) : (
          <span className="shrink-0 font-mono text-[9.5px] text-dim">{node.count}</span>
        )}
      </button>
      {node.kind === "kra" && (
        <button
          type="button"
          onClick={() => onNew(node.kraCode, node.subject)}
          style={{ paddingLeft: 6 + (depth + 1) * 12 }}
          className="my-0.5 flex w-full items-center gap-1.5 rounded-lg py-1 pr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim transition hover:text-gold"
        >
          ＋ New item
        </button>
      )}
      {node.children.length > 0 && isOpen && (
        <div className="ml-[13px] border-l border-edge/70">
          {node.children.map((c) => (
            <TreeNode
              key={c.key}
              node={c}
              depth={depth + 1}
              searching={searching}
              open={open}
              selId={selId}
              onToggle={onToggle}
              onPick={onPick}
              onNew={onNew}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrchardPane({
  tree,
  q,
  setQ,
  open,
  selId,
  onPick,
  onToggle,
  onNew,
  exams,
  selPaperId,
  onPickPaper,
  onNewPaper,
  onSeed,
  onClear
}: {
  tree: { nodes: TNode[] };
  q: string;
  setQ: (v: string) => void;
  open: Set<string>;
  selId: string | null;
  onPick: (id: string) => void;
  onToggle: (k: string) => void;
  onNew: (kra?: string, subject?: string) => void;
  exams: ExamPaper[];
  selPaperId: string | null;
  onPickPaper: (id: string) => void;
  onNewPaper: () => void;
  onSeed: () => void;
  onClear: () => void;
}) {
  return (
    <aside className={`${room} flex flex-col overflow-hidden`}>
      <div className="border-b border-edge p-4">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">The Orchard</p>
          <p className="font-mono text-[9px] text-dim">subject ▸ strand ▸ kra</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search KRA, subject, hook…"
          className="mt-3 w-full rounded-full border border-edge bg-void/40 px-4 py-2 text-[12.5px] text-ivory outline-none transition-colors placeholder:text-dim/60 focus:border-gold"
        />
      </div>

      <div className="max-h-[430px] flex-1 overflow-y-auto p-3">
        {tree.nodes.length === 0 ? (
          <p className="px-2 py-8 text-center text-[12px] leading-5 text-dim">
            {q ? "Nothing matches the search." : "No items yet — start one below."}
          </p>
        ) : (
          tree.nodes.map((n) => (
            <TreeNode
              key={n.key}
              node={n}
              depth={0}
              searching={q.trim() !== ""}
              open={open}
              selId={selId}
              onToggle={onToggle}
              onPick={onPick}
              onNew={onNew}
            />
          ))
        )}
      </div>

      <div className="border-t border-edge p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">The Papers · {exams.length}</p>
          <button
            type="button"
            onClick={onNewPaper}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold transition hover:text-ivory"
          >
            ＋ New
          </button>
        </div>
        <div className="mt-2 flex max-h-40 flex-col gap-1.5 overflow-y-auto pr-1">
          {exams.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPickPaper(p.id)}
              className={`rounded-[13px] border p-2.5 text-left transition ${
                selPaperId === p.id ? "border-gold/60 bg-gold/5" : "border-edge hover:border-edgeHi"
              }`}
            >
              <p className="truncate text-[12.5px] font-semibold text-ivory">{p.title || "Untitled paper"}</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-dim">
                {p.term} · {p.gradeBand} · {p.items.length} items
              </p>
            </button>
          ))}
          {exams.length === 0 && <p className="px-1 py-3 text-[12px] text-dim">No papers yet — compose one.</p>}
        </div>
        <button type="button" onClick={() => onNew()} className={`${ghostBtn} mt-3 w-full`}>
          ＋ New item
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-edge px-4 py-3">
        <button
          type="button"
          onClick={onSeed}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition hover:text-gold"
        >
          Restore sample
        </button>
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition hover:text-red-400"
        >
          Clear bank
        </button>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* The Loom, item side — the recursive editor. The anatomy is a stack */
/* of AccNodes; each node carries its own shelf of fields.           */
/* ------------------------------------------------------------------ */

function LoomItem({
  draft,
  isPending,
  dirty,
  onMut,
  onSeal,
  onPublish,
  onDiscard,
  onDrop
}: {
  draft: ContentItem;
  isPending: boolean;
  dirty: boolean;
  onMut: (fn: (d: ContentItem) => ContentItem) => void;
  onSeal: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  onDrop: () => void;
}) {
  const [kraText, setKraText] = useState("");
  const isTest = draft.category === "test";
  const isLesson = draft.category === "lesson";
  const isMedia = !isTest && !isLesson && draft.category !== "timeline";
  const kra = draft.kras[0];
  const ref = kra ? parseKra(kra) : null;

  function addKra() {
    const code = kraText.trim().toUpperCase();
    if (!code) return;
    if (!draft.kras.includes(code)) onMut((d) => ({ ...d, kras: [...d.kras, code] }));
    setKraText("");
  }

  return (
    <section className={`${room} relative overflow-hidden`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="p-6 md:p-8">
        {/* Breadcrumb — the address of the piece, in mono small caps. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.15em] text-dim">
            <span>{draft.subject.trim() || "Unlabelled"}</span>
            <span className="text-edgeHi">▸</span>
            {kra ? <span className="text-gold/80">{kra}</span> : <span className="text-red-400/70">untraced</span>}
            <span className="text-edgeHi">▸</span>
            <span className="text-gold">{draft.id.slice(-5).toUpperCase()}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className={`font-mono text-[10px] uppercase tracking-[0.15em] ${dirty ? "text-gold" : "text-dim"}`}>
              {isPending ? "Unsealed" : dirty ? "Amended" : "Sealed"}
            </span>
            <StatusChip s={draft.status} />
          </div>
        </div>

        {/* The piece itself, in the house serif. */}
        <label className="mt-7 block font-mono text-[10px] uppercase tracking-[0.25em] text-dim">
          The item — question, script, or line of paper
        </label>
        <input
          value={draft.title}
          onChange={(e) => onMut((d) => ({ ...d, title: e.target.value }))}
          maxLength={220}
          placeholder="The task, in the learner's words…"
          className="mt-2 w-full border-b border-edge bg-transparent py-3 font-display text-[26px] font-light text-ivory outline-none transition-colors placeholder:text-dim/40 focus:border-gold"
        />

        {/* The coordinates. */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <select
            value={draft.category}
            onChange={(e) => onMut((d) => ({ ...d, category: e.target.value as ContentItem["category"] }))}
            className={box}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={draft.subject}
            onChange={(e) => onMut((d) => ({ ...d, subject: e.target.value }))}
            placeholder="Subject"
            maxLength={40}
            className={box}
          />
          <select
            value={draft.gradeBand}
            onChange={(e) => onMut((d) => ({ ...d, gradeBand: e.target.value }))}
            className={box}
          >
            {GRADE_BANDS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* The anatomy — recursive nodes, each with its inner shelf. */}
        <div className="mt-7 flex flex-col gap-3.5">
          <AccNode title="Prerequisite Mapping" tag="Ontological dependency" tone="bg-edgeHi" defaultOpen>
            <p className="text-[11.5px] leading-5 text-dim">
              Define what the piece assumes. A failure here points to a prerequisite gap, not a failure of this
              item.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.kras.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-2 rounded-full border border-edge bg-void/50 py-1 pl-3 pr-2 font-mono text-[11px]"
                >
                  <span className="text-gold">{code}</span>
                  <span className="text-[9px] text-dim">
                    {gradeLabel(parseKra(code).grade)} · Strand {parseKra(code).strand} · KRA {parseKra(code).kra}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMut((d) => ({ ...d, kras: d.kras.filter((x) => x !== code) }))}
                    className="text-dim transition hover:text-red-400"
                    aria-label={`Remove ${code}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={addKra}
                disabled={!kraText.trim()}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-edge px-3 py-1 text-[11px] text-dim transition hover:border-gold/60 hover:text-gold disabled:opacity-30"
              >
                ＋ {kraText.trim() ? kraText.trim().toUpperCase() : "Add KRA"}
              </button>
            </div>
            <input
              value={kraText}
              onChange={(e) => setKraText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKra()}
              placeholder="MAT.3.1.4, KES.5.2.1…"
              className="mt-2.5 w-full rounded-full border border-edge bg-void/40 px-4 py-2 font-mono text-[11.5px] text-ivory outline-none placeholder:text-dim/50 focus:border-gold"
            />
            {kra && ref && (
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                Primary address — {ref.subject} · {gradeLabel(ref.grade)} · Strand {ref.strand}
              </p>
            )}
          </AccNode>

          <AccNode title="Cognitive Target" tag="Domain activation" tone="bg-gold" defaultOpen={isTest}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BLOOM_LEVELS.map((b, i) => (
                <button
                  key={b}
                  type="button"
                  disabled={!isTest}
                  onClick={() => onMut((d) => ({ ...d, bloom: i }))}
                  className={`relative rounded-[13px] border p-3 text-center transition ${
                    isTest && draft.bloom === i
                      ? "border-gold bg-gold/10"
                      : "border-edge bg-void/30 hover:border-edgeHi disabled:cursor-not-allowed disabled:opacity-35"
                  }`}
                >
                  {isTest && draft.bloom === i && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />}
                  <div className={`text-[11.5px] font-semibold ${isTest && draft.bloom === i ? "text-gold" : "text-muted"}`}>
                    {b}
                  </div>
                  <div className="mt-0.5 text-[9.5px] text-dim">{BLOOM_HINTS[i]}</div>
                </button>
              ))}
            </div>
            {!isTest && (
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                Bloom's demand is placed on written items.
              </p>
            )}
            {isTest && (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_90px]">
                <select
                  value={draft.type}
                  onChange={(e) => onMut((d) => ({ ...d, type: e.target.value }))}
                  className={box}
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={draft.marks}
                  onChange={(e) => onMut((d) => ({ ...d, marks: Math.max(0, Math.min(40, Number(e.target.value) || 0)) }))}
                  className="rounded-full border border-edge bg-void/40 px-4 text-right font-mono text-[13px] text-ivory outline-none focus:border-gold"
                  aria-label="Marks"
                />
              </div>
            )}
            <div className="mt-2.5">
              <select
                value={draft.competency}
                onChange={(e) => onMut((d) => ({ ...d, competency: e.target.value }))}
                className={box}
              >
                <option value="">Competency / value the piece develops…</option>
                {COMPETENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {VALUES.map((v) => (
                  <option key={v} value={`Value · ${v}`}>
                    Value · {v}
                  </option>
                ))}
              </select>
            </div>
          </AccNode>

          <AccNode title="Misconception Elicitation" tag="Diagnostic design" tone="bg-red-400">
            <p className="text-[11.5px] leading-5 text-dim">
              Name the specific wrong answer this piece is built to expose. If the learner fails here, the
              failure must point at one break in the thinking.
            </p>
            <textarea
              rows={3}
              value={draft.misconception}
              onChange={(e) => onMut((d) => ({ ...d, misconception: e.target.value }))}
              maxLength={320}
              placeholder="What the learner is likely to get wrong, and why…"
              className="mt-3 w-full resize-none rounded-[13px] border border-edge bg-void/40 p-3.5 text-[13px] leading-6 text-ivory outline-none transition-colors placeholder:text-dim/50 focus:border-red-400/50"
            />
          </AccNode>

          <AccNode title="Mastery Evidence" tag="Empirical validation" tone="bg-emerald-400">
            {isTest && (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                  Marking key — full marks, half marks, what earns what
                </p>
                <textarea
                  rows={3}
                  value={draft.rubric}
                  onChange={(e) => onMut((d) => ({ ...d, rubric: e.target.value }))}
                  placeholder="Step 1 (n): … Step 2 (n): … What the model answer is. What a teacher can defend."
                  className="mt-2.5 w-full resize-none rounded-[13px] border border-edge bg-void/40 p-3.5 text-[13px] leading-6 text-ivory outline-none transition-colors placeholder:text-dim/50 focus:border-emerald-400/50"
                />
              </>
            )}
            {isLesson && (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                  Lesson scaffold — intention · inputs · activity · evidence · adjustment
                </p>
                <textarea
                  rows={3}
                  value={draft.plan}
                  onChange={(e) => onMut((d) => ({ ...d, plan: e.target.value }))}
                  placeholder="Intention: … Inputs: … Activity: … Evidence: … Adjustment: …"
                  className="mt-2.5 w-full resize-none rounded-[13px] border border-edge bg-void/40 p-3.5 text-[13px] leading-6 text-ivory outline-none transition-colors placeholder:text-dim/50 focus:border-emerald-400/50"
                />
              </>
            )}
            {isMedia && (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={draft.durationMin}
                    onChange={(e) =>
                      onMut((d) => ({ ...d, durationMin: Math.max(0, Math.min(300, Number(e.target.value) || 0)) }))
                    }
                    className="w-24 rounded-full border border-edge bg-void/40 px-4 text-right font-mono text-[13px] text-ivory outline-none focus:border-gold"
                    aria-label="Duration, minutes"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">minutes in the room</span>
                </div>
                <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                  The timetable holds what you name.
                </p>
              </>
            )}
            {draft.category === "timeline" && (
              <p className="text-[11.5px] leading-5 text-dim">
                Timelines print as resources on the sheet's resource list; name the span and the pages in the
                item prompt.
              </p>
            )}
          </AccNode>
        </div>

        {/* The ritual — seal, publish, or unmake. */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-edge pt-5">
          <button type="button" onClick={onSeal} disabled={!draft.title.trim()} className={btn}>
            {isPending ? "Seal into the bank →" : dirty ? "Seal the amendments →" : "Sealed"}
          </button>
          <button
            type="button"
            onClick={onPublish}
            className={
              draft.status === "published"
                ? "rounded-full bg-gold px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-ivory"
                : ghostBtn
            }
          >
            {draft.status === "published" ? "Published ✓" : "Publish"}
          </button>
          {isPending && (
            <button type="button" onClick={onDiscard} className={ghostBtn}>
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={onDrop}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition hover:text-red-400"
          >
            Unmake item
          </button>
        </div>
      </div>
    </section>
  );
}
/* ------------------------------------------------------------------ */
/* The Loom — the recursive editor. Anatomy nodes nest their own     */
/* shelves: the prerequisite map holds the KRA addresses; the        */
/* cognitive node holds the demand grid; and so on.                 */
/* ------------------------------------------------------------------ */

function AccNode({
  title,
  tag,
  tone,
  defaultOpen,
  children
}: {
  title: string;
  tag: string;
  tone: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="overflow-hidden rounded-[17px] border border-edge bg-void/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-panelHi/50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />
          <span className="text-[13px] font-semibold text-ivory">{title}</span>
          <span className="hidden rounded border border-edge px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-dim sm:inline">
            {tag}
          </span>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-dim transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-edge/60 px-4 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ s }: { s: "draft" | "published" }) {
  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.15em] ${s === "published" ? "text-emerald-400" : "text-dim"}`}>
      {s}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* The Auditor — how a Check reads on the wall.                      */
/* ------------------------------------------------------------------ */

const TONE: Record<Sev, { ring: string; text: string; icon: string; label: string }> = {
  pass: { ring: "bg-emerald-400/10 text-emerald-400", text: "text-emerald-400", icon: "✓", label: "pass" },
  watch: { ring: "bg-gold/10 text-gold", text: "text-gold", icon: "!", label: "watch" },
  fail: { ring: "bg-red-400/10 text-red-400", text: "text-red-400", icon: "✕", label: "fail" }
};

function CheckCard({ c }: { c: Check }) {
  return (
    <div className="flex gap-3">
      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${TONE[c.sev].ring}`}>
        {TONE[c.sev].icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[12px] font-semibold ${TONE[c.sev].text}`}>{c.title}</p>
        <p className="mt-1 text-[11.5px] leading-5 text-muted">{c.detail}</p>
        {c.fix && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-dim">
            → {c.fix}
          </p>
        )}
      </div>
    </div>
  );
}

function ReportCard({ r }: { r: BankReport }) {
  return (
    <div className="mt-5 rounded-[17px] border border-edge bg-void/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">Bank audit</p>
        <p className="font-display text-3xl font-light text-ivory">
          {r.score}
          <span className="ml-1 text-sm text-dim">/100</span>
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {r.checks.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE[c.sev].ring}`} />
            <p className="min-w-0 text-[11.5px] leading-4 text-muted">
              <span className={TONE[c.sev].text}>{c.title}</span>
              {c.detail ? <span className="text-dim"> — {c.detail}</span> : null}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The Loom, paper side — compose a sheet, print it from the room.   */
/* ------------------------------------------------------------------ */

function LoomPaper({
  school,
  paper,
  byId,
  items,
  onEdit,
  onOpenItem,
  onDrop
}: {
  school: string;
  paper: ExamPaper;
  byId: Map<string, ContentItem>;
  items: ContentItem[];
  onEdit: (fn: (p: ExamPaper) => ExamPaper) => void;
  onOpenItem: (id: string) => void;
  onDrop: () => void;
}) {
  const attached = paper.items.map((id) => byId.get(id)).filter((i): i is ContentItem => !!i);
  const marks = attached.filter((i) => i.category === "test").reduce((s, i) => s + i.marks, 0);
  const attachable = items.filter((i) => !paper.items.includes(i.id));

  function move(idx: number, dir: -1 | 1) {
    const next = [...paper.items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onEdit((p) => ({ ...p, items: next }));
  }

  return (
    <section className={`${room} relative overflow-hidden`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.15em] text-dim">
            <span>The paper</span>
            <span className="text-edgeHi">▸</span>
            <span className="text-gold">{paper.title || "Unsealed paper"}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">autosaves on this device</span>
            <button
              type="button"
              onClick={onDrop}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition hover:text-red-400"
            >
              Unmake paper
            </button>
          </div>
        </div>

        <input
          value={paper.title}
          onChange={(e) => onEdit((p) => ({ ...p, title: e.target.value }))}
          maxLength={80}
          placeholder="The paper, named…"
          className="mt-6 w-full border-b border-edge bg-transparent py-3 font-display text-[26px] font-light text-ivory outline-none transition-colors placeholder:text-dim/40 focus:border-gold"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <input
            value={paper.subject}
            onChange={(e) => onEdit((p) => ({ ...p, subject: e.target.value }))}
            placeholder="Subject"
            maxLength={40}
            className={box}
          />
          <select value={paper.gradeBand} onChange={(e) => onEdit((p) => ({ ...p, gradeBand: e.target.value }))} className={box}>
            {GRADE_BANDS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            value={paper.term}
            onChange={(e) => onEdit((p) => ({ ...p, term: e.target.value }))}
            placeholder="Term"
            maxLength={20}
            className={box}
          />
          <input
            type="number"
            min={10}
            max={300}
            value={paper.durationMin}
            onChange={(e) => onEdit((p) => ({ ...p, durationMin: Math.max(10, Number(e.target.value) || 10) }))}
            className="rounded-full border border-edge bg-void/40 px-4 text-right font-mono text-[13px] text-ivory outline-none focus:border-gold"
            aria-label="Duration, minutes"
          />
        </div>
        <input
          value={paper.note}
          onChange={(e) => onEdit((p) => ({ ...p, note: e.target.value }))}
          maxLength={200}
          placeholder="The instruction line on the paper"
          className={`${box} mt-3`}
        />
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
          {paper.items.length} items · {marks} marks · {paper.durationMin} min
        </p>

        <div className="mt-6 rounded-[17px] border border-edge bg-void/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">On the paper · {paper.items.length}</p>
          {attached.length === 0 ? (
            <p className="mt-3 text-[13px] text-dim">Nothing attached yet — pull items in from the bank.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {attached.map((it, idx) => (
                <div key={it.id} className="flex items-center gap-3 rounded-[13px] border border-edge p-3">
                  <span className="w-6 shrink-0 text-right font-mono text-[12px] text-dim">{idx + 1}.</span>
                  <button
                    type="button"
                    onClick={() => onOpenItem(it.id)}
                    className="min-w-0 flex-1 text-left transition hover:opacity-90"
                    title="Open in the Loom"
                  >
                    <p className="truncate text-[13px] text-ivory">{it.title}</p>
                    <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-dim">
                      {CATEGORY_LABEL[it.category]}
                      {it.category === "test" ? ` · ${it.marks} marks` : it.durationMin > 0 ? ` · ${it.durationMin} min` : ""}
                      {it.status === "draft" ? " · draft" : ""}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" onClick={() => move(idx, -1)} className="text-dim transition hover:text-ivory" title="Move up">
                      ↑
                    </button>
                    <button type="button" onClick={() => move(idx, 1)} className="text-dim transition hover:text-ivory" title="Move down">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit((p) => ({ ...p, items: p.items.filter((x) => x !== it.id) }))}
                      className="text-dim transition hover:text-ivory"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {attachable.length > 0 && (
          <div className="mt-4 rounded-[17px] border border-edge bg-void/30 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">From the bank · {attachable.length}</p>
            <div className="mt-3 flex flex-col">
              {attachable.slice(0, 10).map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 py-2">
                  <p className="min-w-0 flex-1 truncate text-[13px] text-muted">{i.title}</p>
                  <button
                    type="button"
                    onClick={() => onEdit((p) => ({ ...p, items: [...p.items, i.id] }))}
                    className="shrink-0 rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted transition hover:border-gold/60 hover:text-gold"
                  >
                    ＋ Attach
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-ivory"
          >
            Print the sheet
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">A4 · questions, then the teacher's log</span>
        </div>

        <PrintSheet school={school} paper={paper} byId={byId} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The sheet — the only thing on this page that reaches paper.        */
/* The global print rules isolate .print-sheet; the marking log       */
/* keeps the teacher's record in the same artifact.                  */
/* ------------------------------------------------------------------ */

function PrintSheet({ school, paper, byId }: { school: string; paper: ExamPaper; byId: Map<string, ContentItem> }) {
  const attached = paper.items.map((id) => byId.get(id)).filter((i): i is ContentItem => !!i);
  const tests = attached.filter((i) => i.category === "test");
  const resources = attached.filter((i) => i.category !== "test");
  const marks = tests.reduce((s, i) => s + i.marks, 0);
  return (
    <div className="print-sheet mt-10 rounded-[21px] bg-paper p-8 text-ink shadow-[0_30px_80px_-30px_rgba(212,175,55,0.18)]">
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
                <th className="py-1 pr-2 font-mono">Marks</th>
                <th className="py-1 font-mono">Key & hooks</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((i, idx) => (
                <tr key={i.id} className="border-b border-current/20 align-top">
                  <td className="py-1.5 pr-2 font-mono">{idx + 1}</td>
                  <td className="py-1.5 pr-2 font-mono">{i.kras.join(" ") || "—"}</td>
                  <td className="py-1.5 pr-2">{i.type}</td>
                  <td className="py-1.5 pr-2">{BLOOM_LEVELS[i.bloom]}</td>
                  <td className="py-1.5 pr-2 font-mono">{i.marks}</td>
                  <td className="py-1.5">
                    {[i.rubric.trim() && `Key: ${i.rubric.trim()}`, i.misconception.trim() && `Hook: ${i.misconception.trim()}`]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px]">APT-LABS Content Studio · {new Date().toLocaleDateString()} · printed on this device</p>
        </div>
      </div>
    </div>
  );
}
function LoomEmpty({
  itemCount,
  paperCount,
  onNewItem,
  onNewPaper
}: {
  itemCount: number;
  paperCount: number;
  onNewItem: () => void;
  onNewPaper: () => void;
}) {
  return (
    <section className={`${room} flex min-h-[420px] flex-col items-center justify-center p-8 text-center`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">The loom is empty</p>
      <h3 className="mt-4 font-display text-3xl font-light text-ivory">Choose a piece, or start one.</h3>
      <p className="mt-3 max-w-[44ch] text-sm leading-6 text-muted">
        The Orchard holds {itemCount} item{itemCount === 1 ? "" : "s"} and {paperCount} paper
        {paperCount === 1 ? "" : "s"}. Pick either from the left, or begin a new one — the Auditor follows
        whatever you select.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={onNewItem} className={btn}>
          ＋ New item
        </button>
        <button type="button" onClick={onNewPaper} className={ghostBtn}>
          ＋ New paper
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The Auditor — the right room. The critique that follows the        */
/* selection, and the whole-bank audit on demand.                    */
/* ------------------------------------------------------------------ */

function AuditorPane({
  checks,
  counts,
  report,
  onAudit
}: {
  checks: Check[];
  counts: { pass: number; watch: number; fail: number };
  report: BankReport | null;
  onAudit: () => void;
}) {
  return (
    <aside className={`${room} flex flex-col overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-edge p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">The Auditor</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Structural critique</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[9.5px] text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {counts.pass}
          </span>
          <span className="flex items-center gap-1 font-mono text-[9.5px] text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {counts.watch}
          </span>
          <span className="flex items-center gap-1 font-mono text-[9.5px] text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            {counts.fail}
          </span>
        </div>
      </div>

      <div className="max-h-[560px] flex-1 overflow-y-auto p-4">
        {checks.length === 0 ? (
          <p className="px-1 py-6 text-center text-[12px] leading-5 text-dim">
            Select an item or a paper — the critique follows the selection.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {checks.map((c) => (
              <CheckCard key={c.id} c={c} />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onAudit}
          className="mt-5 w-full rounded-full border border-gold/40 bg-gold/10 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold transition hover:bg-gold/20"
        >
          Run full structural audit
        </button>
        {report && <ReportCard r={report} />}
      </div>

      <p className="border-t border-edge p-4 font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-dim">
        Deterministic rules an education engineer signs. The Check[] shape in lib/audit.ts is where a scored model
        plugs in later — nothing leaves this device.
      </p>
    </aside>
  );
}
