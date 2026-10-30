import { useEffect, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import {
  initialConsoleSnapshot,
  loadConsoleSnapshot,
  saveConsoleSnapshot,
  type ConsoleSnapshot,
  type SchoolTenderDraft,
} from '../../lib/school-console-storage';
import {
  markPaper,
  parseCsvPapers,
  parseJsonPapers,
  type SchemeQuestion,
} from '../../lib/school-marking';
import { WorkspaceLayout } from './WorkspaceLayout';

type ConsoleRole = 'teacher' | 'principal';
type ConsoleModule = 'my-day' | 'auto-marking' | 'tender-drafts';

const questions: SchemeQuestion[] = [
  { id: 'Q1', prompt: 'What is the chemical formula for water?', topic: 'Matter', answer: 'H2O', keywords: ['H₂O'], marks: 1 },
  { id: 'Q2', prompt: 'Name the process plants use to make food from sunlight.', topic: 'Living things', answer: 'photosynthesis', keywords: ['photosynthesis'], marks: 2 },
];

const dayTasks = [
  { id: 'lesson', time: '08:10', title: 'Form 2 Science · Matter' },
  { id: 'marking', time: '10:20', title: 'Review a practice set' },
  { id: 'reports', time: '14:00', title: 'Prepare a class note' },
];

const roleModules: Record<ConsoleRole, { id: ConsoleModule; label: string; index: string }[]> = {
  teacher: [
    { id: 'my-day', label: 'My Day', index: '01' },
    { id: 'auto-marking', label: 'Auto-Marking', index: '02' },
  ],
  principal: [
    { id: 'tender-drafts', label: 'Tender drafts', index: '01' },
  ],
};

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'The local School Console action failed.';
}

function newTenderDraft(assetName: string, need: string, assetBuildCost: string): SchoolTenderDraft {
  return {
    id: crypto.randomUUID(),
    assetName: assetName.trim(),
    need: need.trim(),
    assetBuildCost: assetBuildCost.trim(),
    projectedAnnualYield: '',
    localSpendPercentage: '',
    crewWageAllocation: { anchor: '', builder: '', apprentice: '' },
    economicModelNote: '',
    blueprintLines: [],
    createdAt: new Date().toISOString(),
  };
}

export function SchoolConsole() {
  const [role, setRole] = useState<ConsoleRole>('teacher');
  const [activeModule, setActiveModule] = useState<ConsoleModule>('my-day');
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot>(initialConsoleSnapshot);
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [paperLabel, setPaperLabel] = useState('Practice paper 01');
  const [answers, setAnswers] = useState<Record<string, string>>({ Q1: '', Q2: '' });
  const [importError, setImportError] = useState('');
  const [assetName, setAssetName] = useState('');
  const [tenderNeed, setTenderNeed] = useState('');
  const [assetBuildCost, setAssetBuildCost] = useState('');

  useEffect(() => {
    let active = true;
    loadConsoleSnapshot().then(data => {
      if (active) setSnapshot(data);
    }).catch(error => {
      if (active) {
        setLoadFailed(true);
        setStorageError(`School Console data could not be loaded. Existing data was not changed. ${errorText(error)}`);
      }
    }).finally(() => {
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  const canWrite = loaded && !loadFailed && !saving;
  const visibleModules = roleModules[role];
  const markedCount = snapshot.markedPapers.length;
  const averageMark = markedCount
    ? Math.round(snapshot.markedPapers.reduce((sum, paper) => sum + paper.score / paper.maximum * 100, 0) / markedCount)
    : null;

  function changeRole(nextRole: ConsoleRole) {
    setRole(nextRole);
    setActiveModule(roleModules[nextRole][0].id);
    setFeedback('');
  }

  async function persist(nextSnapshot: ConsoleSnapshot, confirmation: string): Promise<boolean> {
    if (!canWrite) return false;
    setSaving(true);
    setStorageError('');
    setFeedback('');
    try {
      await saveConsoleSnapshot(nextSnapshot);
      setSnapshot(nextSnapshot);
      setFeedback(confirmation);
      return true;
    } catch (error) {
      setStorageError(`This change was not saved to this device. ${errorText(error)}`);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(taskId: string) {
    const alreadyDone = snapshot.completedTasks.includes(taskId);
    const completedTasks = alreadyDone
      ? snapshot.completedTasks.filter(id => id !== taskId)
      : [...snapshot.completedTasks, taskId];
    await persist(
      { ...snapshot, completedTasks },
      alreadyDone ? 'Task reopened on this device.' : 'Task checked off on this device.',
    );
  }

  async function submitPaper(event: Event) {
    event.preventDefault();
    setImportError('');
    try {
      const paper = markPaper(questions, { student: paperLabel, answers });
      if (await persist({ ...snapshot, markedPapers: [paper, ...snapshot.markedPapers] }, 'Practice result saved locally for teacher review.')) {
        setAnswers({ Q1: '', Q2: '' });
      }
    } catch (error) {
      setImportError(errorText(error));
    }
  }

  async function importPapers(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setImportError('');
    try {
      const content = await file.text();
      const papers = file.name.toLocaleLowerCase().endsWith('.csv')
        ? parseCsvPapers(content, questions)
        : file.name.toLocaleLowerCase().endsWith('.json')
          ? parseJsonPapers(content, questions)
          : (() => { throw new Error('Use a typed .csv or .json file. Scans and image extraction are not supported.'); })();
      const marked = papers.map(paper => markPaper(questions, paper));
      await persist({ ...snapshot, markedPapers: [...marked, ...snapshot.markedPapers] }, `${marked.length} practice paper${marked.length === 1 ? '' : 's'} saved locally for teacher review.`);
    } catch (error) {
      setImportError(errorText(error));
    }
  }

  async function createDraft(event: Event) {
    event.preventDefault();
    const cost = assetBuildCost.trim();
    if (!assetName.trim() || !tenderNeed.trim()) {
      setFeedback('Enter an asset or need title and describe the school need.');
      return;
    }
    if (cost && (!Number.isFinite(Number(cost)) || Number(cost) < 0)) {
      setFeedback('Enter a non-negative build-cost estimate or leave it blank.');
      return;
    }
    const draft = newTenderDraft(assetName, tenderNeed, cost);
    if (await persist({ ...snapshot, tenderDrafts: [draft, ...snapshot.tenderDrafts] }, 'Local tender draft saved. It has not been shared or published.')) {
      setAssetName('');
      setTenderNeed('');
      setAssetBuildCost('');
    }
  }

  async function discardDraft(draftId: string) {
    await persist(
      { ...snapshot, tenderDrafts: snapshot.tenderDrafts.filter(draft => draft.id !== draftId) },
      'Local tender draft discarded.',
    );
  }

  return (
    <WorkspaceLayout currentContext="institutions">
      <section aria-label="School Console" className="sc-console">
        <header className="sc-header">
          <div className="sc-header-main">
            <Link className="sc-back-link" href="/workspace/institutions">Institutions <span aria-hidden="true">/</span> Assets</Link>
            <div className="sc-heading-row">
              <div>
                <p className="sc-eyebrow">SCHOOL MANAGEMENT CONSOLE <span>/</span> LOCAL DEVICE</p>
                <h1>School Console</h1>
              </div>
              <div className="sc-local-status" aria-label="Data is stored in this browser only">
                <span aria-hidden="true" />
                <div><strong>LOCAL</strong><small>Not synced</small></div>
              </div>
            </div>
            <p className="sc-header-copy">Teaching and school operations tools, held in this browser.</p>
          </div>
          <div className="sc-role-control">
            <span className="sc-control-label">VIEW</span>
            <div aria-label="Console view" className="sc-segmented" role="group">
              <button aria-pressed={role === 'teacher'} onClick={() => changeRole('teacher')} type="button">Teacher</button>
              <button aria-pressed={role === 'principal'} onClick={() => changeRole('principal')} type="button">Principal</button>
            </div>
            <small>Demo view · not account access</small>
          </div>
        </header>

        <div className="sc-boundary-note">
          <span className="sc-boundary-mark" aria-hidden="true">L</span>
          <p>School records stay on this device. Nothing is sent to APT-LABS, a school account, or an external service.</p>
          <span className="sc-boundary-code">BROWSER STORAGE</span>
        </div>

        <div className="sc-workspace">
          <nav aria-label={`${role === 'teacher' ? 'Teacher' : 'Principal'} tools`} className="sc-module-nav">
            <p className="sc-nav-label">{role === 'teacher' ? 'TEACHER TOOLS' : 'SCHOOL OPERATIONS'}</p>
            {visibleModules.map(module => (
              <button
                aria-current={activeModule === module.id ? 'page' : undefined}
                className={`sc-module-link${activeModule === module.id ? ' is-active' : ''}`}
                key={module.id}
                onClick={() => { setActiveModule(module.id); setFeedback(''); }}
                type="button"
              >
                <span>{module.index}</span>
                <strong>{module.label}</strong>
                {activeModule === module.id && <i aria-hidden="true" />}
              </button>
            ))}
            <div className="sc-nav-foot">
              <span className="sc-nav-rule" />
              <p>PRIVATE WORKSPACE</p>
              <small>Local to this browser profile</small>
            </div>
          </nav>

          <div className="sc-content">
            {!loaded && <p className="sc-state-line" role="status">Opening local school records…</p>}
            {storageError && <p className="sc-state-line is-error" role="alert">{storageError}</p>}
            {feedback && <p className="sc-state-line" role="status">{feedback}</p>}

            {activeModule === 'my-day' && role === 'teacher' && (
              <section className="sc-module" aria-labelledby="sc-my-day-title">
                <div className="sc-module-head">
                  <div>
                    <p className="sc-eyebrow">TEACHER TOOLS <span>/</span> DAILY RHYTHM</p>
                    <h2 id="sc-my-day-title">My Day</h2>
                    <p className="sc-module-description">A simple planning checklist. These entries are examples, not a live timetable.</p>
                  </div>
                  <span className="sc-example-stamp">EXAMPLE ROUTINE</span>
                </div>
                <div className="sc-day-summary">
                  <span>DAILY PLAN</span>
                  <strong>{snapshot.completedTasks.filter(id => dayTasks.some(task => task.id === id)).length}<small> / {dayTasks.length} complete</small></strong>
                </div>
                <div className="sc-day-list">
                  {dayTasks.map(task => {
                    const complete = snapshot.completedTasks.includes(task.id);
                    return (
                      <button
                        aria-pressed={complete}
                        className={`sc-day-item${complete ? ' is-complete' : ''}`}
                        disabled={!canWrite}
                        key={task.id}
                        onClick={() => void toggleTask(task.id)}
                        type="button"
                      >
                        <time>{task.time}</time>
                        <span className="sc-task-check" aria-hidden="true">{complete ? '✓' : ''}</span>
                        <strong>{task.title}</strong>
                        <span className="sc-task-state">{complete ? 'DONE' : 'OPEN'}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="sc-footnote">Checklist changes are stored locally and can be reopened at any time.</p>
              </section>
            )}

            {activeModule === 'auto-marking' && role === 'teacher' && (
              <section className="sc-module" aria-labelledby="sc-marking-title">
                <div className="sc-module-head">
                  <div>
                    <p className="sc-eyebrow">TEACHER TOOLS <span>/</span> PRACTICE ASSESSMENT</p>
                    <h2 id="sc-marking-title">Auto-Marking</h2>
                    <p className="sc-module-description">A visible answer scheme applies the same deterministic rule to each typed response.</p>
                  </div>
                  <span className="sc-example-stamp">LOCAL PRACTICE</span>
                </div>

                <div className="sc-review-warning">
                  <strong>Teacher review required</strong>
                  <span>Practice aid only · not an official grade · no AI or scan reading</span>
                </div>

                <div className="sc-scheme">
                  <div className="sc-scheme-head"><span>ANSWER SCHEME</span><span>RULE-MARKED</span></div>
                  {questions.map(question => (
                    <div className="sc-scheme-row" key={question.id}>
                      <span className="sc-question-id">{question.id}</span>
                      <div><strong>{question.prompt}</strong><small>Canonical answer: {question.answer} · accepted keyword: {question.keywords?.join(', ')}</small></div>
                      <span className="sc-question-marks">{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
                    </div>
                  ))}
                  <p className="sc-scheme-rule">Case-insensitive, accent-sensitive canonical match or accepted keyword found within the response. Review every result before use.</p>
                </div>

                <form className="sc-mark-form" onSubmit={submitPaper}>
                  <div className="sc-form-heading"><div><span className="sc-eyebrow">NEW PRACTICE PAPER</span><h3>Enter typed responses</h3></div><span className="sc-data-note">Do not enter real learner records</span></div>
                  <label className="sc-field sc-field-wide" htmlFor="sc-paper-label">Practice paper label
                    <Input id="sc-paper-label" onChange={setPaperLabel} value={paperLabel} disabled={!canWrite} />
                  </label>
                  {questions.map(question => (
                    <label className="sc-field" htmlFor={`sc-answer-${question.id}`} key={question.id}>
                      <span>{question.id} <i>/</i> {question.topic}</span>
                      <Input id={`sc-answer-${question.id}`} onChange={value => setAnswers(current => ({ ...current, [question.id]: value }))} value={answers[question.id] ?? ''} disabled={!canWrite} />
                    </label>
                  ))}
                  {importError && <p className="sc-inline-error" role="alert">{importError}</p>}
                  <div className="sc-form-actions">
                    <Button disabled={!canWrite} type="submit">Mark practice paper <span aria-hidden="true">→</span></Button>
                    <label className={`sc-import-button${!canWrite ? ' is-disabled' : ''}`}>
                      Import CSV / JSON
                      <input accept=".csv,.json,application/json,text/csv" disabled={!canWrite} onChange={event => void importPapers(event)} type="file" />
                    </label>
                  </div>
                  <p className="sc-footnote">CSV headers: student,Q1,Q2 · JSON: [{'{'} &quot;student&quot;, &quot;answers&quot;: {'{'} &quot;Q1&quot;, &quot;Q2&quot; {'}'} {'}'}]. Typed data only; scans and images are not read.</p>
                </form>

                <div className="sc-results">
                  <div className="sc-results-head">
                    <div><span className="sc-eyebrow">LOCAL RESULT SET</span><h3>Practice results</h3></div>
                    <span><strong>{markedCount}</strong> {markedCount === 1 ? 'paper' : 'papers'} <i>/</i> {averageMark === null ? 'No average' : `${averageMark}% average`}</span>
                  </div>
                  {snapshot.markedPapers.length === 0
                    ? <p className="sc-empty-state">No practice papers yet. Enter typed responses above to begin.</p>
                    : <div className="sc-result-list">{snapshot.markedPapers.map((paper, index) => (
                      <div className="sc-result-row" key={`${paper.student}-${index}`}>
                        <strong>{paper.student}</strong>
                        <span>{paper.marksByQuestion.map((mark, questionIndex) => `Q${questionIndex + 1}: ${mark}`).join(' · ')}</span>
                        <b>{paper.score}<i> / {paper.maximum}</i></b>
                      </div>
                    ))}</div>}
                </div>
              </section>
            )}

            {activeModule === 'tender-drafts' && role === 'principal' && (
              <section className="sc-module" aria-labelledby="sc-tenders-title">
                <div className="sc-module-head">
                  <div>
                    <p className="sc-eyebrow">SCHOOL OPERATIONS <span>/</span> PRIVATE DRAFTS</p>
                    <h2 id="sc-tenders-title">Tender drafts</h2>
                    <p className="sc-module-description">Record a school need for local review. Nothing is published or sent to the APT-LABS Workbench.</p>
                  </div>
                  <span className="sc-example-stamp">NOT PUBLISHED</span>
                </div>

                <form className="sc-tender-form" onSubmit={createDraft}>
                  <div className="sc-form-heading"><div><span className="sc-eyebrow">NEW LOCAL RECORD</span><h3>Describe the need</h3></div><span className="sc-data-note">No learner details</span></div>
                  <label className="sc-field sc-field-wide" htmlFor="sc-asset-name">Asset or need title
                    <Input id="sc-asset-name" onChange={setAssetName} value={assetName} disabled={!canWrite} placeholder="e.g. Classroom desks for repair" />
                  </label>
                  <label className="sc-field sc-field-wide" htmlFor="sc-tender-need">Need and operating context
                    <textarea id="sc-tender-need" disabled={!canWrite} onInput={event => setTenderNeed((event.currentTarget as HTMLTextAreaElement).value)} placeholder="Describe the service gap and the outcome needed. Avoid personal or learner information." value={tenderNeed} />
                  </label>
                  <label className="sc-field sc-field-cost" htmlFor="sc-build-cost">Estimated build cost <span>(KES · optional)</span>
                    <Input id="sc-build-cost" min={0} step={0.01} onChange={setAssetBuildCost} value={assetBuildCost} disabled={!canWrite} placeholder="Leave blank if unknown" type="number" />
                  </label>
                  <div className="sc-form-actions">
                    <Button disabled={!canWrite} type="submit">Save local draft <span aria-hidden="true">→</span></Button>
                    <span className="sc-form-disclosure">Stored in this browser only</span>
                  </div>
                </form>

                <div className="sc-results">
                  <div className="sc-results-head">
                    <div><span className="sc-eyebrow">THIS DEVICE</span><h3>Unpublished drafts</h3></div>
                    <span><strong>{snapshot.tenderDrafts.length}</strong> {snapshot.tenderDrafts.length === 1 ? 'draft' : 'drafts'}</span>
                  </div>
                  {snapshot.tenderDrafts.length === 0
                    ? <p className="sc-empty-state">No local tender drafts. A saved draft remains private and unpublished.</p>
                    : <div className="sc-tender-list">{snapshot.tenderDrafts.map(draft => (
                      <article className="sc-tender-row" key={draft.id}>
                        <div className="sc-tender-row-copy">
                          <span className="sc-draft-status">LOCAL DRAFT <i>/</i> UNPUBLISHED</span>
                          <h4>{draft.assetName}</h4>
                          <p>{draft.need}</p>
                          <small>{draft.assetBuildCost ? `Estimated KES ${Number(draft.assetBuildCost).toLocaleString('en-KE')}` : 'Build cost not estimated'} <i>/</i> {new Date(draft.createdAt).toLocaleDateString()}</small>
                        </div>
                        <Button className="sc-discard-button" disabled={!canWrite} onClick={() => void discardDraft(draft.id)} type="button" variant="ghost">Discard</Button>
                      </article>
                    ))}</div>}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}