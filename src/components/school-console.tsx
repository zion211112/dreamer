'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Check, ClipboardCheck, Clock3, FileText, GraduationCap, LayoutList, Megaphone, Plus, Printer, ShieldAlert, Sparkles, WalletCards, X } from 'lucide-react';
import { getSchoolCrewCandidates, publishSchoolTender, type SchoolCrewCandidate } from '../../app/console/actions';
import { Button } from '@/components/ui/button';
import { initialConsoleSnapshot, loadConsoleSnapshot, saveConsoleSnapshot, type ConsoleSnapshot, type SchoolTenderDraft } from '@/lib/console-storage';
import { markPaper, parseCsvPapers, parseJsonPapers, type SchemeQuestion } from '@/lib/mark-engine';
import { compileSchoolTenderBOM, parseKesMinorUnits, type SchoolTenderBOMLineDraft } from '@/lib/school-tender';

const modules = [
  { id: 'Content Studio', icon: BookOpen, audience: 'Teacher' },
  { id: 'Auto-Marking', icon: ClipboardCheck, audience: 'Teacher' },
  { id: 'My Day', icon: Clock3, audience: 'Teacher' },
  { id: 'Timetable', icon: LayoutList, audience: 'Both' },
  { id: 'Roster', icon: GraduationCap, audience: 'Both' },
  { id: 'Reports', icon: FileText, audience: 'Teacher' },
  { id: 'Grade Forecast', icon: Sparkles, audience: 'Teacher' },
  { id: 'Fees', icon: WalletCards, audience: 'Principal' },
  { id: 'Inspection', icon: ClipboardCheck, audience: 'Principal' },
  { id: 'Comms', icon: Megaphone, audience: 'Principal' },
  { id: 'Issue Tender', icon: FileText, audience: 'Principal' },
] as const;

const questions: SchemeQuestion[] = [
  { id: 'Q1', prompt: 'What is the chemical formula for water?', topic: 'Matter', answer: 'H2O', keywords: ['H₂O'], marks: 1 },
  { id: 'Q2', prompt: 'Name the process plants use to make food from sunlight.', topic: 'Living things', answer: 'photosynthesis', keywords: ['photosynthesis'], marks: 2 },
];

const dayTasks = [
  { id: 'lesson', time: '08:10', title: 'Form 2 Science · Matter' },
  { id: 'marking', time: '10:20', title: 'Review the latest practice set' },
  { id: 'reports', time: '14:00', title: 'Prepare this week’s class note' },
];

const demoRoster = ['Demo learner 01', 'Demo learner 02', 'Demo learner 03', 'Demo learner 04'];
const emptyBOMLine: SchoolTenderBOMLineDraft = { id: 'bom-line-1', item: '', quantity: '1', unit: 'each', unitCost: '' };

const inspectionItems = [
  'Learning materials are available in the room',
  'Class timetable is visible to learners',
  'Equipment is safe and serviceable',
  'Term records have a local backup',
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected local Console error occurred.';
}

function saveDownload(name: string, content: string, mimeType: string) {
  const file = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SchoolConsole({ header }: { header: ReactNode }) {
  const [role, setRole] = useState<'teacher' | 'principal'>('teacher');
  const [activeModule, setActiveModule] = useState<string>('Auto-Marking');
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot>(initialConsoleSnapshot);
  const [storageError, setStorageError] = useState('');
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [student, setStudent] = useState('Sample learner A');
  const [answers, setAnswers] = useState<Record<string, string>>({ Q1: '', Q2: '' });
  const [importError, setImportError] = useState('');
  const [feeDescription, setFeeDescription] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [assetName, setAssetName] = useState('');
  const [tenderNeed, setTenderNeed] = useState('');
  const [importQuote, setImportQuote] = useState('');
  const [localQuote, setLocalQuote] = useState('');
  const [blueprintLines, setBlueprintLines] = useState<SchoolTenderBOMLineDraft[]>([emptyBOMLine]);
  const [commsRecipient, setCommsRecipient] = useState('');
  const [commsText, setCommsText] = useState('');
  const [crewCandidates, setCrewCandidates] = useState<SchoolCrewCandidate[] | null>(null);
  const [crewError, setCrewError] = useState('');
  const [publishDraftId, setPublishDraftId] = useState('');
  const [crewAssignments, setCrewAssignments] = useState({ anchor: '', builder: '', apprentice: '' });
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('role') === 'principal') {
      setRole('principal');
      setActiveModule('Issue Tender');
      requestAnimationFrame(() => document.getElementById('issue-tender')?.scrollIntoView({ block: 'start' }));
    }
    let active = true;
    loadConsoleSnapshot().then(data => {
      if (active) setSnapshot(data);
    }).catch(error => {
      if (active) setStorageError(`Local storage unavailable: ${errorMessage(error)} Work in this tab is temporary until storage is available.`);
    }).finally(() => {
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  const principalView = role === 'principal';
  const visibleModules = modules.filter(module =>
    module.audience === 'Both' || module.audience === (principalView ? 'Principal' : 'Teacher')
  );
  const averageMark = useMemo(() => {
    if (!snapshot.markedPapers.length) return null;
    return Math.round(snapshot.markedPapers.reduce((sum, paper) => sum + paper.score / paper.maximum * 100, 0) / snapshot.markedPapers.length);
  }, [snapshot.markedPapers]);

  async function persist(next: ConsoleSnapshot, confirmation: string) {
    setSnapshot(next);
    setMessage(confirmation);
    setStorageError('');
    try {
      await saveConsoleSnapshot(next);
    } catch (error) {
      setStorageError(`This change is only in memory and could not be saved: ${errorMessage(error)}`);
    }
  }

  function submitManualMark(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const paper = markPaper(questions, { student, answers });
      void persist({ ...snapshot, markedPapers: [paper, ...snapshot.markedPapers] }, 'Marked with the visible deterministic rule scheme and saved on this device.');
      setAnswers({ Q1: '', Q2: '' });
    } catch (error) {
      setImportError(errorMessage(error));
    }
  }

  async function importPapers(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    try {
      const content = await file.text();
      const papers = file.name.toLocaleLowerCase().endsWith('.csv')
        ? parseCsvPapers(content, questions)
        : file.name.toLocaleLowerCase().endsWith('.json')
          ? parseJsonPapers(content, questions)
          : (() => { throw new Error('Use a typed .csv or .json file. Scans and image extraction are not supported.'); })();
      const marked = papers.map(paper => markPaper(questions, paper));
      await persist({ ...snapshot, markedPapers: [...marked, ...snapshot.markedPapers] }, `${marked.length} paper${marked.length === 1 ? '' : 's'} marked and saved locally.`);
      setImportError('');
    } catch (error) {
      setImportError(errorMessage(error));
    }
  }

  async function updateTask(taskId: string) {
    const done = snapshot.completedTasks.includes(taskId);
    const completedTasks = done
      ? snapshot.completedTasks.filter(id => id !== taskId)
      : [...snapshot.completedTasks, taskId];
    await persist({ ...snapshot, completedTasks }, done ? 'Task reopened.' : 'Task checked off on this device.');
  }

  function createTenderDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const importAmountMinor = parseKesMinorUnits(importQuote);
    const localAmountMinor = parseKesMinorUnits(localQuote);
    if (!assetName.trim() || !tenderNeed.trim() || importAmountMinor === undefined || localAmountMinor === undefined || importAmountMinor <= localAmountMinor || localAmountMinor <= 0) {
      setMessage('Enter a need and valid KES quotes; the import quote must be higher than the positive local quote.');
      return;
    }
    let verifiedBlueprintLines: SchoolTenderBOMLineDraft[];
    try {
      compileSchoolTenderBOM(blueprintLines, localAmountMinor);
      verifiedBlueprintLines = blueprintLines.map(line => ({ ...line }));
    } catch (error) {
      setMessage(errorMessage(error));
      return;
    }
    const draft = {
      id: crypto.randomUUID(),
      assetName: assetName.trim(),
      need: tenderNeed.trim(),
      importQuote: (importAmountMinor / 100).toFixed(2),
      localQuote: (localAmountMinor / 100).toFixed(2),
      blueprintLines: verifiedBlueprintLines,
      createdAt: new Date().toISOString(),
    };
    void persist({ ...snapshot, tenderDrafts: [draft, ...snapshot.tenderDrafts] }, 'Tender draft saved on this device only. It is not published or shared.');
    setAssetName('');
    setTenderNeed('');
    setImportQuote('');
    setLocalQuote('');
    setBlueprintLines([{ ...emptyBOMLine }]);
  }

  function updateBlueprintLine(id: string, field: 'item' | 'quantity' | 'unit' | 'unitCost', value: string) {
    setBlueprintLines(lines => lines.map(line => line.id === id ? { ...line, [field]: value } : line));
  }

  function discardTenderDraft(draftId: string) {
    void persist({ ...snapshot, tenderDrafts: snapshot.tenderDrafts.filter(draft => draft.id !== draftId) }, 'Local Tender draft discarded.');
    if (publishDraftId === draftId) {
      setPublishDraftId('');
      setCrewCandidates(null);
      setCrewError('');
    }
  }

  function addFeeNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountKes = Number(feeAmount);
    if (!feeDescription.trim() || !Number.isFinite(amountKes) || amountKes <= 0) {
      setMessage('Enter a short note and a positive amount.');
      return;
    }
    void persist({
      ...snapshot,
      feeNotes: [{ id: crypto.randomUUID(), description: feeDescription.trim(), amountKes }, ...snapshot.feeNotes],
    }, 'Local bookkeeping note saved. No payment was initiated or verified.');
    setFeeDescription('');
    setFeeAmount('');
  }

  async function preparePublication(draft: SchoolTenderDraft) {
    if (!draft.blueprintLines.length) {
      setPublishDraftId(draft.id);
      setCrewCandidates(null);
      setCrewError('This saved draft predates itemized Blueprints. Discard it and create a new draft with a complete bill of materials.');
      return;
    }
    setPublishDraftId(draft.id);
    setCrewCandidates(null);
    setCrewError('');
    setLoadingCrew(true);
    const result = await getSchoolCrewCandidates();
    setLoadingCrew(false);
    if (result.error) {
      setCrewError(result.error);
      return;
    }
    const candidates = result.candidates ?? [];
    setCrewCandidates(candidates);
    setCrewAssignments({
      anchor: candidates[0]?.userId ?? '',
      builder: candidates[1]?.userId ?? '',
      apprentice: candidates[2]?.userId ?? '',
    });
  }

  async function submitPublication(draft: SchoolTenderDraft) {
    setPublishing(true);
    setCrewError('');
    const result = await publishSchoolTender({
      draft,
      anchorUserId: crewAssignments.anchor,
      builderUserId: crewAssignments.builder,
      apprenticeUserId: crewAssignments.apprentice,
    });
    setPublishing(false);
    if (result.error) {
      setCrewError(result.error);
      return;
    }
    if (!result.slug) {
      setCrewError('The server did not return the published Tender reference.');
      return;
    }
    setPublishedSlug(result.slug);
    const next = { ...snapshot, tenderDrafts: snapshot.tenderDrafts.filter(item => item.id !== draft.id) };
    await persist(next, 'Tender published with an authenticated school account, a verified crew and an active Blueprint.');
    setPublishDraftId('');
    setCrewCandidates(null);
  }

  const selected = visibleModules.some(module => module.id === activeModule)
    ? activeModule
    : visibleModules[0].id;

  return (
    <main className="site-shell console-shell">
      {header}
      <section className="console-intro">
        <div>
          <p className="eyebrow"><span className="signal-dot" /> Local-first school utility · {loaded ? 'Ready on this device' : 'Opening local workspace'}</p>
          <h1>School Console<span className="console-title-dot">.</span></h1>
          <p>Tools for the school week. Your work stays in this browser; shared publishing is a separate, authenticated step.</p>
        </div>
        <div className="role-switch-wrap">
          <span className="eyebrow">LOCAL VIEW / NOT AN ACCOUNT</span>
          <div aria-label="Console view (not authentication)" className="role-switch" role="group">
            <button aria-pressed={!principalView} onClick={() => { setRole('teacher'); setActiveModule('Auto-Marking'); }} type="button">Teacher</button>
            <button aria-pressed={principalView} onClick={() => { setRole('principal'); setActiveModule('Fees'); }} type="button">Principal</button>
          </div>
        </div>
      </section>

      <div className="console-boundary" role="note">
        <ShieldAlert aria-hidden="true" size={17} />
        <p><strong>Demo data only.</strong> This browser database is not encrypted multi-user school storage or access control. Use the fictional sample labels; do not enter real student records in this public demo.</p>
        <span>LOCAL / INDEXEDDB</span>
      </div>

      <div className="console-workbench">
        <nav aria-label={`${role} Console tools`} className="console-sidebar">
          <span className="eyebrow">{principalView ? 'SCHOOL LEAD' : 'TEACHER DESK'}</span>
          {visibleModules.map(module => {
            const Icon = module.icon;
            return <button aria-current={selected === module.id ? 'page' : undefined} className={`console-nav-item ${selected === module.id ? 'active' : ''}`} key={module.id} onClick={() => setActiveModule(module.id)} type="button">
              <Icon aria-hidden="true" size={16} /><span>{module.id}</span><ArrowRight aria-hidden="true" className="nav-arrow" size={13} />
            </button>;
          })}
          <div className="console-sidebar-foot"><span className="local-dot" /> SAVED ON THIS DEVICE WHEN AVAILABLE</div>
        </nav>

        <section aria-label={`${selected} workspace`} className="console-panel">
          <div className="console-panel-head">
            <div><p className="eyebrow">{principalView ? 'PRINCIPAL VIEW' : 'TEACHER VIEW'} / LOCAL TOOL</p><h2>{selected}</h2></div>
            <span className="local-badge">LOCAL ONLY</span>
          </div>
          {message && <p className="console-message" role="status"><span>{message}{publishedSlug && <> <Link href={`/tenders/${publishedSlug}`}>View Tender ↗</Link></>}</span><button aria-label="Dismiss message" onClick={() => { setMessage(''); setPublishedSlug(''); }} type="button"><X size={14} /></button></p>}
          {storageError && <p className="storage-warning" role="alert"><ShieldAlert aria-hidden="true" size={15} />{storageError}</p>}
          {!loaded && <p className="console-loading">Opening this device’s local school workspace…</p>}

          {selected === 'Auto-Marking' && <div className="tool-content">
            <p className="tool-lede">A deterministic marking scheme that shows its work. The same answer and scheme always produce the same marks; no model or network service is involved.</p>
            <div className="scheme-card">
              <p className="eyebrow">VISIBLE SCHEME / 3 MARKS TOTAL</p>
              {questions.map(question => <div className="scheme-question" key={question.id}><span>{question.id} · {question.topic} · {question.marks} mark{question.marks > 1 ? 's' : ''}</span><strong>{question.prompt}</strong><small>Full credit for exact answer or listed accepted phrase: {question.keywords?.join(', ')}</small></div>)}
              <p className="scheme-method">Rule: case-insensitive exact answer / accepted phrase → full marks; otherwise → zero. Teacher reviews results before using them.</p>
            </div>
            <form className="mark-form" onSubmit={submitManualMark}>
              <p className="eyebrow">TYPE A PRACTICE PAPER</p>
              <label>Paper label<input onChange={event => setStudent(event.target.value)} value={student} /></label>
              {questions.map(question => <label key={question.id}>{question.id} · {question.prompt}<input onChange={event => setAnswers(previous => ({ ...previous, [question.id]: event.target.value }))} value={answers[question.id] ?? ''} /></label>)}
              <div className="form-actions"><Button className="button button-primary" type="submit">Mark this paper <ArrowRight size={15} /></Button><label className="button button-outline file-button"><ArrowDownToLine size={14} /> Import typed CSV / JSON<input accept=".csv,.json,application/json,text/csv" onChange={importPapers} type="file" /></label></div>
              {importError && <p className="inline-error" role="alert">{importError}</p>}
              <p className="fine-print">CSV headers: student,Q1,Q2 · JSON: [{'{'} &quot;student&quot;, &quot;answers&quot;: {'{'} &quot;Q1&quot;, &quot;Q2&quot; {'}'} {'}'}]. Images/PDFs are not read.</p>
            </form>
            <div className="results-block"><div className="tool-subhead"><div><p className="eyebrow">LOCAL RESULT SET</p><h3>{snapshot.markedPapers.length} paper{snapshot.markedPapers.length === 1 ? '' : 's'} · {averageMark === null ? 'No average yet' : `${averageMark}% average`}</h3></div>{snapshot.markedPapers.length > 0 && <Button className="button button-outline button-small" onClick={() => saveDownload('apt-console-practice-results.csv', `student,score,maximum\n${snapshot.markedPapers.map(paper => `"${paper.student.replaceAll('"', '""')}",${paper.score},${paper.maximum}`).join('\n')}`, 'text/csv')} type="button">Export CSV</Button>}</div>
              {snapshot.markedPapers.length === 0 ? <p className="empty-inline">Mark or import a typed practice paper to see reviewed results here.</p> : <div className="result-list">{snapshot.markedPapers.map((paper, index) => <div className="result-row" key={`${paper.student}-${index}`}><span>{paper.student}</span><span>{paper.marksByQuestion.map((mark, qIndex) => `Q${qIndex + 1}: ${mark}`).join(' · ')}</span><strong>{paper.score}/{paper.maximum}</strong></div>)}</div>}
            </div>
          </div>}

          {selected === 'Content Studio' && <div className="tool-content">
            <p className="tool-lede">Shape a lesson from your own notes. Nothing is generated by a connected model; saving stores this draft in the browser database.</p>
            <label className="field-label">Lesson draft<textarea className="lesson-editor" onChange={event => setSnapshot(previous => ({ ...previous, lessonDraft: event.target.value }))} placeholder="Topic, learning goal, materials, and the one question learners should be able to answer…" value={snapshot.lessonDraft} /></label>
            <Button className="button button-primary" onClick={() => void persist(snapshot, 'Lesson draft saved locally.')} type="button">Save local draft <Check size={15} /></Button>
          </div>}

          {selected === 'My Day' && <div className="tool-content">
            <p className="tool-lede">A small, editable checklist for today. This is not connected to a school calendar or attendance system.</p>
            <div className="day-list">{dayTasks.map(task => {
              const done = snapshot.completedTasks.includes(task.id);
              return <button aria-pressed={done} className={`day-item ${done ? 'done' : ''}`} key={task.id} onClick={() => void updateTask(task.id)} type="button"><time>{task.time}</time><span>{task.title}</span>{done ? <Check size={16} /> : <span className="task-circle" />}</button>;
            })}</div>
          </div>}

          {selected === 'Timetable' && <div className="tool-content">
            <p className="tool-lede">Example weekly rhythm. It is editable as a local planning draft; no rooms or staff are reserved.</p>
            <div className="schedule-grid"><div className="schedule-heading"><span>TIME</span><span>MONDAY · DEMO</span><span>TUESDAY · DEMO</span><span>WEDNESDAY · DEMO</span></div>{[['08:10', 'Science · Form 2', 'Mathematics · Form 1', 'Prep / planning'], ['10:20', 'Language · Form 1', 'Science · Form 2', 'Mathematics · Form 1'], ['14:00', 'Marking / notes', 'Science club', 'Class review']].map(row => <div className="schedule-row" key={row[0]}>{row.map((cell, index) => <span className={index === 0 ? 'schedule-time' : ''} key={index}>{cell}</span>)}</div>)}</div>
            <Button className="button button-outline" onClick={() => window.print()} type="button"><Printer size={15} /> Print this view</Button>
          </div>}

          {selected === 'Roster' && <div className="tool-content">
            <p className="tool-lede">A fictional roster to demonstrate the table. Do not replace these labels with real learner information in the pitch environment.</p>
            <div className="roster-table"><div><span>LOCAL ID</span><span>DISPLAY LABEL</span><span>RECORD TYPE</span></div>{demoRoster.map((label, index) => <div key={label}><span>DEMO-{(index + 1).toString().padStart(2, '0')}</span><strong>{label}</strong><span>Fictional example</span></div>)}</div>
            <Button className="button button-outline" onClick={() => saveDownload('apt-console-demo-roster.csv', `id,label,type\n${demoRoster.map((label, index) => `DEMO-${(index + 1).toString().padStart(2, '0')},${label},fictional example`).join('\n')}`, 'text/csv')} type="button"><ArrowDownToLine size={14} /> Export sample CSV</Button>
          </div>}

          {selected === 'Reports' && <div className="tool-content">
            <p className="tool-lede">Printable practice summary from marks stored locally in this browser. Review every mark before sharing or using it.</p>
            <div className="report-overview"><span className="eyebrow">PRACTICE PAPERS</span><strong>{snapshot.markedPapers.length}</strong><span className="eyebrow">AVERAGE SCORE</span><strong>{averageMark === null ? '—' : `${averageMark}%`}</strong></div>
            {snapshot.markedPapers.length ? <div className="result-list">{snapshot.markedPapers.map((paper, index) => <div className="result-row" key={`${paper.student}-${index}`}><span>{paper.student}</span><span>Rule-marked / local only</span><strong>{paper.score}/{paper.maximum}</strong></div>)}</div> : <p className="empty-inline">No local practice results yet. Use Auto-Marking to begin.</p>}
            <Button className="button button-outline" onClick={() => window.print()} type="button"><Printer size={15} /> Print report</Button>
          </div>}

          {selected === 'Grade Forecast' && <div className="tool-content">
            <p className="tool-lede">There is no credible forecast from one practice paper. This view reports observed local marks only; it does not predict exam outcomes.</p>
            <div className="forecast-card"><span className="eyebrow">OBSERVED PRACTICE AVERAGE</span><strong>{averageMark === null ? 'Not available' : `${averageMark}%`}</strong><p>{snapshot.markedPapers.length < 2 ? 'Collect several teacher-reviewed assessments before drawing conclusions.' : `Based on ${snapshot.markedPapers.length} locally stored, rule-marked paper(s).`}</p></div>
          </div>}

          {selected === 'Fees' && <div className="tool-content">
            <p className="tool-lede">Private, on-device bookkeeping notes only. No payment, reconciliation, M-Pesa verification, or prediction occurs here.</p>
            <form className="fee-form" onSubmit={addFeeNote}><label>Note<input onChange={event => setFeeDescription(event.target.value)} placeholder="e.g. Example stationery balance" value={feeDescription} /></label><label>Amount (KES)<input min="1" onChange={event => setFeeAmount(event.target.value)} placeholder="0" type="number" value={feeAmount} /></label><Button className="button button-primary" type="submit"><Plus size={14} /> Add local note</Button></form>
            {snapshot.feeNotes.length === 0 ? <p className="empty-inline">No local notes yet. Do not store account numbers or payment credentials.</p> : <div className="fee-list">{snapshot.feeNotes.map(note => <div key={note.id}><span>{note.description}</span><strong>KES {note.amountKes.toLocaleString('en-KE')}</strong></div>)}</div>}
          </div>}

          {selected === 'Inspection' && <div className="tool-content">
            <p className="tool-lede">A local preparation checklist—not external inspection, compliance review or certification.</p>
            <div className="inspection-list">{inspectionItems.map(item => {
              const checked = snapshot.inspectionChecks.includes(item);
              return <label key={item}><input checked={checked} onChange={() => {
                const inspectionChecks = checked ? snapshot.inspectionChecks.filter(value => value !== item) : [...snapshot.inspectionChecks, item];
                void persist({ ...snapshot, inspectionChecks }, 'Checklist updated on this device.');
              }} type="checkbox" /><span>{item}</span></label>;
            })}</div>
            <p className="fine-print">{snapshot.inspectionChecks.length} of {inspectionItems.length} preparation items checked.</p>
          </div>}

          {selected === 'Comms' && <div className="tool-content">
            <p className="tool-lede">Prepare one recipient-reviewed message. No bulk delivery or delivery receipt; opening a messaging app is your explicit next step.</p>
            <label className="field-label">Recipient phone number<input autoComplete="tel" onChange={event => setCommsRecipient(event.target.value)} placeholder="Country code + number" value={commsRecipient} /></label>
            <label className="field-label">Message<textarea className="message-editor" onChange={event => setCommsText(event.target.value)} placeholder="Write and review the message before opening your app…" value={commsText} /></label>
            <p className="fine-print">Check the recipient, content and personal-data handling before continuing. A message is not sent until you review it in the external app.</p>
            {commsRecipient.replace(/\D/g, '').length >= 8 && commsText.trim()
              ? <a className="button button-outline" href={`https://wa.me/${commsRecipient.replace(/\D/g, '')}?text=${encodeURIComponent(commsText)}`} rel="noreferrer" target="_blank">Open WhatsApp draft <ArrowUpRight size={14} /></a>
              : <Button className="button button-outline" disabled type="button">Add a number and message to prepare a draft</Button>}
          </div>}

          {selected === 'Issue Tender' && <div className="tool-content" id="issue-tender">
            <p className="tool-lede">Turn a school need into a public Tender draft. Itemized Blueprint lines must total exactly to the local quote. No roster, marks or student data are attached.</p>
            <form className="issue-form" onSubmit={createTenderDraft}>
              <label>What needs building?<input onChange={event => setAssetName(event.target.value)} placeholder="e.g. Repairable classroom desks" value={assetName} /></label>
              <label>Why is this needed?<textarea onChange={event => setTenderNeed(event.target.value)} placeholder="Describe the asset and who it serves, without including student details." value={tenderNeed} /></label>
              <div className="quote-inputs"><label>Import quote (KES)<input min="0.01" onChange={event => setImportQuote(event.target.value)} placeholder="0" step="0.01" type="number" value={importQuote} /></label><label>Proposed local quote (KES)<input min="0.01" onChange={event => setLocalQuote(event.target.value)} placeholder="0" step="0.01" type="number" value={localQuote} /></label></div>
              <fieldset className="bom-editor">
                <legend>Blueprint / bill of materials</legend>
                <p>List every build item, quantity and unit cost. The exact line total must equal the local quote.</p>
                {blueprintLines.map((line, index) => <div className="bom-draft-row" key={line.id}>
                  <label>Item {index + 1}<input maxLength={240} onChange={event => updateBlueprintLine(line.id, 'item', event.target.value)} placeholder="e.g. Treated timber" required value={line.item} /></label>
                  <label>Quantity<input max="999999999.999" min="0.001" onChange={event => updateBlueprintLine(line.id, 'quantity', event.target.value)} required step="0.001" type="number" value={line.quantity} /></label>
                  <label>Unit<input maxLength={40} onChange={event => updateBlueprintLine(line.id, 'unit', event.target.value)} placeholder="e.g. pieces" required value={line.unit} /></label>
                  <label>Unit cost (KES)<input min="0" onChange={event => updateBlueprintLine(line.id, 'unitCost', event.target.value)} required step="0.01" type="number" value={line.unitCost} /></label>
                  <Button aria-label={`Remove Blueprint line ${index + 1}`} className="button button-outline button-small bom-remove" disabled={blueprintLines.length === 1} onClick={() => setBlueprintLines(lines => lines.filter(candidate => candidate.id !== line.id))} type="button"><X size={14} /></Button>
                </div>)}
                <Button className="button button-outline button-small" disabled={blueprintLines.length >= 100} onClick={() => setBlueprintLines(lines => [...lines, { id: crypto.randomUUID(), item: '', quantity: '1', unit: 'each', unitCost: '' }])} type="button"><Plus size={13} /> Add BOM line</Button>
              </fieldset>
              <Button className="button button-primary" type="submit">Save a local draft <Check size={15} /></Button>
            </form>
            {snapshot.tenderDrafts.length > 0 && <div className="draft-list"><p className="eyebrow">THIS DEVICE / UNPUBLISHED</p>{snapshot.tenderDrafts.map(draft => <article key={draft.id}><div><strong>{draft.assetName}</strong><p>{draft.need}</p><small>{draft.blueprintLines.length} itemized Blueprint lines</small></div><span>KES {Number(draft.localQuote).toLocaleString('en-KE')} local <small>Draft only</small></span>{draft.blueprintLines.length > 0 && <Button className="button button-outline button-small" disabled={loadingCrew || publishing} onClick={() => void preparePublication(draft)} type="button">Review crew <ArrowUpRight size={13} /></Button>}<Button aria-label={`Discard ${draft.assetName} draft`} className="button button-outline button-small" disabled={publishing} onClick={() => discardTenderDraft(draft.id)} type="button">Discard</Button></article>)}</div>}
            {publishDraftId && snapshot.tenderDrafts.find(draft => draft.id === publishDraftId) && <div className="crew-publish-panel">
              <p className="eyebrow">REVIEW THE ASSIGNED CREW</p>
              <p>All three people must be named members of this school account. Public names appear only when each member has chosen to share their name.</p>
              {loadingCrew && <p className="empty-inline">Checking the authenticated school roster…</p>}
              {crewError && <p className="inline-error" role="alert">{crewError}</p>}
              {!crewCandidates && !loadingCrew && <Link className="text-link" href="/sign-in?next=%2Fconsole%3Frole%3Dprincipal%23issue-tender">Sign in or check school access <ArrowUpRight size={14} /></Link>}
              {crewCandidates && <div className="crew-assignment-form">
                {([
                  ['anchor', 'Anchor'],
                  ['builder', 'Builder'],
                  ['apprentice', 'Apprentice / Youth'],
                ] as const).map(([roleName, label]) => <label key={roleName}>{label}<select onChange={event => setCrewAssignments(previous => ({ ...previous, [roleName]: event.target.value }))} value={crewAssignments[roleName]}><option value="">Choose a school member</option>{crewCandidates.map(candidate => <option key={candidate.userId} value={candidate.userId}>{candidate.displayName}</option>)}</select></label>)}
                <p className="fine-print">Publication opens the Tender only when every BOM line totals exactly to the local quote, the Blueprint and quote match, and one distinct school member is assigned to each crew role.</p>
                <Button className="button button-primary" disabled={publishing || new Set(Object.values(crewAssignments)).size !== 3 || Object.values(crewAssignments).some(value => !value)} onClick={() => {
                  const draft = snapshot.tenderDrafts.find(item => item.id === publishDraftId);
                  if (draft) void submitPublication(draft);
                }} type="button">{publishing ? 'Publishing…' : 'Publish reviewed Tender'} <ArrowRight size={15} /></Button>
              </div>}
            </div>}
            <div className="publish-boundary"><p className="eyebrow">SCHOOL-ISSUED TENDERS</p><p>A local draft is private to this browser. Publishing requires a configured Supabase deployment, a Principal or issuer membership, three named school members assigned to the crew, and an active matching Blueprint. No student information is sent.</p><Link className="text-link" href="/sign-in?next=%2Fconsole%3Frole%3Dprincipal%23issue-tender">School account access <ArrowUpRight size={14} /></Link></div>
          </div>}
        </section>
      </div>
      <footer className="page-footer"><span>APT-LABS / SCHOOL CONSOLE</span><span>Local browser storage · no server sync · {snapshot.markedPapers.length} practice results on this device</span></footer>
    </main>
  );
}
