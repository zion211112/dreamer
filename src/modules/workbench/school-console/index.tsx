// src/modules/workbench/school-console/index.tsx
// School Console module — nested under assets, not a main app page.
// Entered from the School Management Console asset in Institutions.
// Browser-local IndexedDB state; deterministic marking; local unpublished tender drafts.
// Honestly labeled as a local demo: real interactions, no fabricated data.
import { useEffect, useState } from 'preact/hooks';

import {
  initialConsoleSnapshot,
  loadConsoleSnapshot,
  saveConsoleSnapshot,
  type ConsoleSnapshot,
  type SchoolTenderDraft,
} from '../../../lib/school-console-storage';
import { markPaper, parseCsvPapers, parseJsonPapers } from '../../../lib/school-marking';
import {
  questions,
  roleModules,
  type ConsoleRole,
  type ConsoleModule,
} from './constants';
import { Shell } from './components/Shell';
import { ModuleNav } from './components/ModuleNav';
import { StatusBanner } from './components/StatusBanner';
import { MyDayView } from './views/MyDayView';
import { AutoMarkingView } from './views/AutoMarkingView';
import { TenderDraftView } from './views/TenderDraftView';
import { KenyanMarkingView } from './views/KenyanMarkingView';
import { DeveloperView } from './views/DeveloperView';
import { ClassView } from './views/ClassView';
import { SchoolOverviewView } from './views/SchoolOverviewView';
import './styles/token-alias.css';
import './styles/module.css';

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

export function SchoolConsoleModule() {
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
    loadConsoleSnapshot()
      .then((data) => {
        if (active) setSnapshot(data);
      })
      .catch((error) => {
        if (active) {
          setLoadFailed(true);
          setStorageError(
            `School Console data could not be loaded. Existing data was not changed. ${errorText(error)}`,
          );
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const canWrite = loaded && !loadFailed && !saving;
  const markedCount = snapshot.markedPapers.length;
  const averageMark = markedCount
    ? Math.round(
        snapshot.markedPapers.reduce(
          (sum, paper) => sum + (paper.score / paper.maximum) * 100,
          0,
        ) / markedCount,
      )
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
      ? snapshot.completedTasks.filter((id) => id !== taskId)
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
      if (
        await persist(
          { ...snapshot, markedPapers: [paper, ...snapshot.markedPapers] },
          'Practice result saved locally for teacher review.',
        )
      ) {
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
          : (() => {
              throw new Error(
                'Use a typed .csv or .json file. Scans and image extraction are not supported.',
              );
            })();
      const marked = papers.map((paper) => markPaper(questions, paper));
      await persist(
        { ...snapshot, markedPapers: [...marked, ...snapshot.markedPapers] },
        `${marked.length} practice paper${marked.length === 1 ? '' : 's'} saved locally for teacher review.`,
      );
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
    if (
      await persist(
        { ...snapshot, tenderDrafts: [draft, ...snapshot.tenderDrafts] },
        'Local tender draft saved. It has not been shared or published.',
      )
    ) {
      setAssetName('');
      setTenderNeed('');
      setAssetBuildCost('');
    }
  }

  async function discardDraft(draftId: string) {
    await persist(
      { ...snapshot, tenderDrafts: snapshot.tenderDrafts.filter((draft) => draft.id !== draftId) },
      'Local tender draft discarded.',
    );
  }

  return (
    <Shell
      title="School Console"
      backHref="/workspace/institutions"
      rail={
        <ModuleNav
          role={role}
          activeModule={activeModule}
          onSelect={(id) => {
            setActiveModule(id);
            setFeedback('');
          }}
        />
      }
    >
      <div className="sc-surface-pad">
        {loadFailed && (
          <StatusBanner message={storageError} type="error" />
        )}
        {feedback && <StatusBanner message={feedback} />}

        {!loaded && <p className="sc-state-line" role="status">Opening local school records…</p>}

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

        {activeModule === 'kenyan-marking' && role === 'teacher' && (
          <KenyanMarkingView
            snapshot={snapshot}
            canWrite={canWrite}
            persist={persist}
          />
        )}

        {activeModule === 'class-view' && role === 'teacher' && (
          <ClassView
            snapshot={snapshot}
            canWrite={canWrite}
            persist={persist}
          />
        )}

        {activeModule === 'school-overview' && role === 'principal' && (
          <SchoolOverviewView
            snapshot={snapshot}
            canWrite={canWrite}
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

        {activeModule === 'developer-tools' && role === 'developer' && (
          <DeveloperView
            snapshot={snapshot}
            canWrite={canWrite}
            persist={persist}
          />
        )}

        {(activeModule === 'integration-hooks' || activeModule === 'capability-coordination') && role === 'developer' && (
          <DeveloperView
            snapshot={snapshot}
            canWrite={canWrite}
            persist={persist}
          />
        )}

        <div className="sc-role-control">
          <span className="sc-control-label">VIEW</span>
          <div aria-label="Console view" className="sc-segmented" role="group">
            <button
              aria-pressed={role === 'teacher'}
              onClick={() => changeRole('teacher')}
              type="button"
            >
              Teacher
            </button>
            <button
              aria-pressed={role === 'principal'}
              onClick={() => changeRole('principal')}
              type="button"
            >
              Principal
            </button>
            <button
              aria-pressed={role === 'developer'}
              onClick={() => changeRole('developer')}
              type="button"
            >
              Developer
            </button>
          </div>
          <small>Demo view, not account access</small>
        </div>

        <div className="sc-boundary-note">
          <span className="sc-boundary-mark" aria-hidden="true">L</span>
          <p>
            School records stay on this device. Nothing is sent to APT-LABS, a school account,
            or an external service.
          </p>
          <span className="sc-boundary-code">BROWSER STORAGE</span>
        </div>
      </div>
    </Shell>
  );
}
