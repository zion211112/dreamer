import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkbenchCapacity } from '../../components/workbench/WorkbenchCapacity';
import {
  readWorkbenchCapacityDrafts,
  saveWorkbenchCapacityDraft,
  type WorkbenchCapacityDraft,
  type WorkbenchCapacityDraftInput,
} from '../../lib/workbench-capacity-drafts';
import { WorkspaceLayout } from './WorkspaceLayout';

interface WorkbenchCapacityFinderProps {
  view: 'matching' | 'plan';
}

function matchingHref(candidateIds: readonly string[]): string {
  const params = new URLSearchParams();
  candidateIds.forEach(id => params.append('candidateId', id));
  const query = params.toString();
  return query ? `/workspace/workbench?${query}` : '/workspace/workbench';
}

export function WorkbenchCapacityFinder({ view }: WorkbenchCapacityFinderProps) {
  const [, setLocation] = useLocation();
  const [savedDrafts, setSavedDrafts] = useState<WorkbenchCapacityDraft[]>([]);
  const [storageError, setStorageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const planCandidateIds = new URLSearchParams(window.location.search).getAll('candidateId');

  useEffect(() => {
    try {
      setSavedDrafts(readWorkbenchCapacityDrafts());
    } catch (error) {
      setStorageError(error instanceof Error
        ? error.message
        : 'Saved work plans could not be read from this browser.');
    }
  }, []);

  function saveDraft(input: WorkbenchCapacityDraftInput) {
    setSaving(true);
    setSaveError('');
    setSaveNotice('');
    try {
      const saved = saveWorkbenchCapacityDraft(input);
      setSavedDrafts(current => [saved, ...current]);
      setStorageError('');
      setSaveNotice('Work plan saved in this browser as a draft. It is not authorized or scheduled.');
    } catch (error) {
      setSaveError(error instanceof Error
        ? error.message
        : 'The work plan could not be saved in this browser.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceLayout currentContext={view === 'plan' ? 'workbench:plan' : 'workbench'}>
      <WorkbenchCapacity
        onBackToMatching={candidateIds => setLocation(matchingHref(candidateIds))}
        onSaveDraft={saveDraft}
        planCandidateIds={planCandidateIds}
        saveError={saveError}
        saveNotice={saveNotice}
        savedDrafts={savedDrafts}
        saving={saving}
        storageError={storageError}
        view={view}
      />
    </WorkspaceLayout>
  );
}
