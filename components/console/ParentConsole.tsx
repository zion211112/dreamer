"use client";

import { useState } from "react";
import { briefError, buildQuestions, LearningBrief, Question, SAMPLE_BRIEF, scoreQuestions, testDocument } from "../../lib/learning-demo";
import { btn, btnGhost, field, monoLabel, panel } from "./bits";

export default function ParentConsole() {
  const [brief, setBrief] = useState<LearningBrief>({ ...SAMPLE_BRIEF, learner: "My child · Grade 5", minutes: 10 });
  const [count, setCount] = useState(5);
  const [test, setTest] = useState<{ brief: LearningBrief; questions: Question[] } | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const result = test ? scoreQuestions(test.questions, answers) : null;

  function create() {
    const error = briefError(brief);
    if (error) return setNotice(error);
    const questions = buildQuestions(brief.notes, count);
    setTest({ brief: { ...brief }, questions });
    setAnswers(Array(questions.length).fill(-1)); setSubmitted(false);
    setNotice("Test ready. Hand the screen to your child or print a paper copy.");
  }

  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
    <section className={`${panel} print:hidden`}>
      <p className={monoLabel}>01 / A little practice at home</p>
      <h2 className="mt-3 font-display text-2xl">Be curious together.</h2>
      <p className="my-4 text-sm leading-6 text-muted">A short check, not another exam. Try fractions or add notes from what your child learned.</p>
      <div className="space-y-4">
        <label className="block text-sm text-muted">Child or class<input className={`${field} mt-2`} value={brief.learner} onChange={e => setBrief({ ...brief, learner: e.target.value })} /></label>
        <label className="block text-sm text-muted">Topic<input className={`${field} mt-2`} value={brief.title} onChange={e => setBrief({ ...brief, title: e.target.value })} /></label>
        <label className="block text-sm text-muted">Test length<select className={`${field} mt-2`} value={count} onChange={e => setCount(Number(e.target.value))}><option value={3}>3 questions</option><option value={5}>Up to 5 questions</option></select></label>
        <label className="block text-sm text-muted">Notes · 3–8 lines, Concept: explanation<textarea rows={8} className="mt-2 w-full rounded-2xl border border-edge bg-void p-4 text-sm leading-6 text-ivory outline-none focus:border-amber" value={brief.notes} onChange={e => setBrief({ ...brief, notes: e.target.value })} /></label>
        <button className={`${btn} w-full`} onClick={create}>{test ? "Create a new test" : "Create home test →"}</button>
        <p className="text-xs leading-5 text-muted">Local demo: the example checks reasoning; custom notes become concept-matching questions. No AI or video transcription. Answers stay in this session.</p>
        <p role="status" className="text-sm text-amber">{notice}</p>
      </div>
    </section>
    <section className={`${panel} min-h-[440px] print:border-0 print:bg-white print:text-black`}>
      <p className={`${monoLabel} print:hidden`}>02 / Try it, then talk about it</p>
      {!test ? <><h2 className="mt-8 font-display text-3xl">Not just “right or wrong”.<br />Find the idea that needs care.</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted">Your child answers a few questions. You get explanations and a small next step to try together.</p><p className="mt-10 text-sm leading-7 text-amber">Is half a small chapati the same amount as half a large one? Understanding the whole changes everything.</p></> : <>
        <h2 className="mt-4 font-display text-3xl">{test.brief.title}</h2>
        <p className="mt-2 text-sm text-muted">{test.brief.learner} · {test.questions.length} questions · 10 minutes</p>
        <button className={`${btnGhost} my-5 print:hidden`} onClick={() => window.print()}>Print blank test</button>
        <pre className="print-sheet bg-white p-8 font-body text-sm leading-8 text-obsidian print:block">{testDocument(test.brief, test.questions, false)}</pre>
        <div className="space-y-6 print:hidden">
          {test.questions.map((q, i) => <fieldset key={i} disabled={submitted} className="rounded-2xl border border-edge p-5">
            <legend className="px-2 text-sm leading-6">{i + 1}. {q.prompt}</legend>
            <div className="space-y-2">{q.options.map((option, j) => <label key={j} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-6 ${answers[i] === j ? "border-amber bg-amber/5" : "border-edge"}`}><input className="mt-1.5 accent-amber" type="radio" name={`answer-${i}`} checked={answers[i] === j} onChange={() => setAnswers(answers.map((a, n) => n === i ? j : a))} />{option}</label>)}</div>
            {submitted && <p className="mt-4 text-sm leading-6 text-muted"><strong className="text-amber">{answers[i] === q.correct ? "Got it. " : "Let's revisit. "}</strong>{q.explanation}</p>}
          </fieldset>)}
          {!submitted ? <button className={btn} disabled={answers.some(a => a < 0)} onClick={() => setSubmitted(true)}>Check answers · {answers.filter(a => a >= 0).length}/{test.questions.length}</button> : result && <div role="status" className="rounded-2xl border border-amber/30 bg-amber/5 p-6"><h3 className="font-display text-2xl">{result.correct} of {result.total} understood this time.</h3><p className="mt-3 text-sm leading-7 text-muted">{result.revisit.length ? `Practise next: ${result.revisit.join(", ")}. Pick one idea, draw it together, then ask your child to explain it back.` : "Next: ask your child to make a new example and teach it to you."}</p><button className={`${btnGhost} mt-4`} onClick={() => { setAnswers(Array(test.questions.length).fill(-1)); setSubmitted(false); }}>Try again</button></div>}
        </div>
      </>}
    </section>
  </div>;
}
