"use client";

import { useState } from "react";
import { briefError, buildDocument, buildQuestions, OutputKind, SAMPLE_BRIEF, testDocument } from "../../lib/learning-demo";
import { btn, btnGhost, field, monoLabel, panel } from "./bits";

export default function LearningStudio({ initialKind = "lesson" }: { initialKind?: OutputKind }) {
  const [brief, setBrief] = useState(SAMPLE_BRIEF);
  const [kind, setKind] = useState<OutputKind>(initialKind);
  const [draft, setDraft] = useState("");
  const [key, setKey] = useState("");
  const [notice, setNotice] = useState("");

  function generate() {
    const error = briefError(brief);
    if (error) return setNotice(error);
    setDraft(buildDocument(brief, kind));
    setKey(kind === "test" ? testDocument(brief, buildQuestions(brief.notes, 8), true) : "");
    setNotice("Draft ready. Review and edit before sharing.");
  }

  async function copy() {
    try { await navigator.clipboard.writeText(draft); setNotice("Draft copied without the answer guide."); }
    catch { setNotice("Clipboard unavailable. Select and copy the draft text below."); }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([draft + (key ? "\n\n" + key : "")], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "teaching-draft.txt"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3" aria-label="Output format">
      {([ ["lesson", "Lesson plan"], ["semester", "Semester outline"], ["test", "Video-notes test"] ] as const).map(([id, label]) =>
        <button key={id} aria-pressed={kind === id} onClick={() => setKind(id)} className={`${btnGhost} ${kind === id ? "border-signal text-signal" : ""}`}>{label}</button>)}
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <section className={panel}>
        <p className={monoLabel}>01 / Start with one good idea</p>
        <h2 className="mt-3 font-serif text-2xl">Less admin. More teaching.</h2>
        <p className="my-4 text-sm leading-6 text-dust">Try the fractions example or use your own video notes. This local prototype uses templates, not AI or automatic video transcription.</p>
        <div className="space-y-4">
          <label className="block text-sm text-dust">Topic<input className={`${field} mt-2`} value={brief.title} onChange={e => setBrief({ ...brief, title: e.target.value })} /></label>
          <label className="block text-sm text-dust">Class<input className={`${field} mt-2`} value={brief.learner} onChange={e => setBrief({ ...brief, learner: e.target.value })} /></label>
          <label className="block text-sm text-dust">{kind === "semester" ? "Weeks (6–16)" : "Minutes (10–90)"}<input type="number" min={kind === "semester" ? 6 : 10} max={kind === "semester" ? 16 : 90} className={`${field} mt-2`} value={kind === "semester" ? brief.weeks : brief.minutes} onChange={e => setBrief({ ...brief, [kind === "semester" ? "weeks" : "minutes"]: Number(e.target.value) })} /></label>
          <label className="block text-sm text-dust">Video notes · 3–8 lines, Concept: explanation<textarea rows={9} className="mt-2 w-full rounded-2xl border border-ink/10 bg-void p-4 text-sm leading-6 text-ink outline-none focus:border-signal" value={brief.notes} onChange={e => setBrief({ ...brief, notes: e.target.value })} /></label>
          <button onClick={generate} className={`${btn} w-full`}>Create draft →</button>
          <button onClick={() => { setBrief(SAMPLE_BRIEF); setNotice("Example loaded. Create a draft when ready."); }} className="text-sm text-dust hover:text-signal">Load fractions example</button>
        </div>
      </section>
      <section className={`${panel} min-h-[440px]`}>
        <p className={monoLabel}>02 / Make it yours</p>
        {draft ? <>
          <div className="my-5 flex flex-wrap gap-2"><button onClick={copy} className={btnGhost}>Copy draft</button><button onClick={download} className={btnGhost}>Download .txt</button></div>
          <label className="block text-sm text-dust">Editable draft<textarea rows={24} value={draft} onChange={e => setDraft(e.target.value)} className="mt-2 w-full rounded-2xl border border-ink/10 bg-void p-5 text-sm leading-7 text-ink outline-none focus:border-signal" /></label>
          {key && <details className="mt-4 text-sm"><summary className="cursor-pointer text-signal">Answer guide · included in download only</summary><p className="mt-3 text-xs leading-6 text-dust">If you change a question, update its answer here before downloading.</p><textarea aria-label="Editable answer guide" rows={12} value={key} onChange={e => setKey(e.target.value)} className="mt-4 w-full rounded-2xl border border-ink/10 bg-void p-4 text-sm leading-7 text-ink outline-none focus:border-signal" /></details>}
        </> : <><h2 className="mt-8 font-serif text-3xl">One source. A lesson.<br />A term. A way to know.</h2><p className="mt-5 max-w-md text-sm leading-7 text-dust">Turn the same concepts into something you can teach and something you can check. The example is ready—create your first draft on the left.</p><p className="mt-12 text-sm text-signal">Source → plan → practise → understand</p></>}
      </section>
    </div>
    <p role="status" className="text-sm text-signal">{notice}</p>
  </div>;
}
