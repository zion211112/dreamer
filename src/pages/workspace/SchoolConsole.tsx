import { useEffect, useState } from 'preact/hooks';
import { Link } from 'wouter';
import {
  initialConsoleSnapshot,
  loadConsoleSnapshot,
  saveConsoleSnapshot,
  type ConsoleSnapshot,
  type SchoolTenderDraft,
} from '../../lib/school-console-storage';
import { WorkspaceLayout } from './WorkspaceLayout';
import { markPaper, parseCsvPapers, parseJsonPapers } from '../../lib/school-marking';
import { questions, roleModules, type ConsoleRole, type ConsoleModule } from './school-console/constants';
import { MyDayView } from './school-console/MyDayView';
import { AutoMarkingView } from './school-console/AutoMarkingView';
import { TenderDraftView } from './school-console/TenderDraftView';

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
    if (new URLSearchParams(window.location.search).has('draft')) {
      setRole('principal');
      setActiveModule('tender-drafts');
    }
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
    <WorkspaceLayout currentContext="workbench:school-console">
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
              <MyDayView snapshot={snapshot} toggleTask={toggleTask} canWrite={canWrite} />
            )}

            {activeModule === 'auto-marking' && role === 'teacher' && (
              <AutoMarkingView
                snapshot={snapshot}
                paperLabel={paperLabel}
                setPaperLabel={setPaperLabel}
                answers={answers}
                setAnswers={setAnswers}
                importError={importError}
                submitPaper={submitPaper}
                importPapers={importPapers}
                canWrite={canWrite}
                markedCount={markedCount}
                averageMark={averageMark}
              />
            )}

            {activeModule === 'tender-drafts' && role === 'principal' && (
              <TenderDraftView
                snapshot={snapshot}
                assetName={assetName}
                setAssetName={setAssetName}
                tenderNeed={tenderNeed}
                setTenderNeed={setTenderNeed}
                assetBuildCost={assetBuildCost}
                setAssetBuildCost={setAssetBuildCost}
                createDraft={createDraft}
                discardDraft={discardDraft}
                canWrite={canWrite}
              />
            )}
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}