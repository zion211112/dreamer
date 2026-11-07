import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import {
  filterCapacityCandidates,
  KIRINYAGA_CAPACITY_SCENARIO,
  type CapacityCandidate,
  type CapacityFilters,
  type CapacitySort,
} from '../../lib/workbench-capacity';
import type { WorkbenchCapacityDraft, WorkbenchCapacityDraftInput } from '../../lib/workbench-capacity-drafts';
import { PageHead } from '../PageHead';
import { CapacityCandidateList } from './CapacityCandidateList';
import { CapacityDraftForm } from './CapacityDraftForm';
import { CapacityRecordInspector } from './CapacityRecordInspector';

export interface WorkbenchCapacityProps {
  view: 'matching' | 'plan';
  planCandidateIds: readonly string[];
  savedDrafts: readonly WorkbenchCapacityDraft[];
  onSaveDraft(input: WorkbenchCapacityDraftInput): void;
  saving: boolean;
  storageError: string;
  saveError: string;
  saveNotice: string;
  onBackToMatching(candidateIds: readonly string[]): void;
}

function getPlanCandidates(ids: readonly string[]) {
  const candidatesById = new Map(
    KIRINYAGA_CAPACITY_SCENARIO.candidates.map(candidate => [candidate.id, candidate]),
  );
  const uniqueIds = [...new Set(ids)];
  return {
    candidates: uniqueIds
      .map(id => candidatesById.get(id))
      .filter((candidate): candidate is CapacityCandidate => candidate !== undefined),
    unknownIds: uniqueIds.filter(id => !candidatesById.has(id)),
  };
}

function planHref(candidateIds: readonly string[]): string {
  const params = new URLSearchParams();
  candidateIds.forEach(id => params.append('candidateId', id));
  return `/workspace/workbench/plan?${params.toString()}`;
}

export function WorkbenchCapacity({
  view,
  planCandidateIds,
  savedDrafts,
  onSaveDraft,
  saving,
  storageError,
  saveError,
  saveNotice,
  onBackToMatching,
}: WorkbenchCapacityProps) {
  const scenario = KIRINYAGA_CAPACITY_SCENARIO;
  const [query, setQuery] = useState('');
  const [hasEvidence, setHasEvidence] = useState(false);
  const [within15Km, setWithin15Km] = useState(false);
  const [sortBy, setSortBy] = useState<CapacitySort>('distance');
  const [selectedId, setSelectedId] = useState<string | null>(scenario.candidates[0]?.id ?? null);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(
    () => new Set(view === 'matching' ? getPlanCandidates(planCandidateIds).candidates.map(item => item.id) : []),
  );
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);

  const filters: CapacityFilters = {
    query,
    hasEvidence,
    withinKm: within15Km ? 15 : null,
    sortBy,
  };
  const filteredCandidates = useMemo(
    () => filterCapacityCandidates(scenario.candidates, filters),
    [scenario.candidates, query, hasEvidence, within15Km, sortBy],
  );
  const selectedCandidate = filteredCandidates.find(candidate => candidate.id === selectedId) ?? null;
  const selectedPlan = useMemo(() => getPlanCandidates(planCandidateIds), [planCandidateIds]);
  const canSavePlan = view === 'plan' && selectedPlan.candidates.length > 0 && selectedPlan.unknownIds.length === 0;

  useEffect(() => {
    if (selectedId && !filteredCandidates.some(candidate => candidate.id === selectedId)) {
      setSelectedId(filteredCandidates[0]?.id ?? null);
    }
  }, [filteredCandidates, selectedId]);

  function selectCandidate(id: string) {
    const activeElement = document.activeElement;
    returnFocusRef.current = activeElement instanceof HTMLButtonElement ? activeElement : null;
    setSelectedId(id);
  }

  function closeInspector() {
    setSelectedId(null);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  function toggleShortlist(id: string) {
    setShortlistedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="workbench-capacity-page">
      {view === 'matching' ? (
        <>
          <PageHead
            className="capacity-page-head"
            eyebrow="WORKBENCH / CAPACITY"
            title="Find capacity"
            subtitle="Inspect local scenario records, check evidence gaps, and assemble a shortlist before drafting a plan."
            metrics={[
              { label: 'Illustrative candidates', value: scenario.candidates.length },
              { label: 'Shortlisted', value: shortlistedIds.size },
            ]}
          />
          <div className="capacity-page-links">
            <Link href="/workspace/workbench/examples">Local examples</Link>
            <Link href="/workspace/workbench/field-desk">Field desk</Link>
            <Link href="/workspace/workbench/plan">Saved work plans · {savedDrafts.length}</Link>
          </div>
          {storageError && <p className="capacity-storage-warning" role="alert">{storageError} Matching is still available.</p>}

          <section aria-label="Illustrative capacity need" className="capacity-need-summary">
            <div>
              <p className="capacity-kicker">ACTIVE NEED / ILLUSTRATIVE</p>
              <h2>{scenario.need.title}</h2>
              <p>{scenario.need.institution} · {scenario.need.location}</p>
            </div>
            <dl>
              <div><dt>Volume</dt><dd>{scenario.need.quantity} {scenario.need.unit}</dd></div>
              <div><dt>Window</dt><dd>{scenario.need.startDate} – {scenario.need.endDate}</dd></div>
              <div><dt>Basis</dt><dd>Scenario only</dd></div>
            </dl>
          </section>

          <div className="capacity-matching-layout">
            <div className="capacity-matching-main">
              <CapacityCandidateList
                candidates={filteredCandidates}
                hasEvidence={hasEvidence}
                onHasEvidenceChange={setHasEvidence}
                onQueryChange={setQuery}
                onSelect={selectCandidate}
                onSortChange={setSortBy}
                onToggleShortlist={toggleShortlist}
                onWithin15KmChange={setWithin15Km}
                query={query}
                selectedId={selectedId}
                shortlistedIds={shortlistedIds}
                sortBy={sortBy}
                within15Km={within15Km}
              />
              <footer className="capacity-shortlist-footer">
                <span>{shortlistedIds.size} selected for review · no commitment made</span>
                {shortlistedIds.size > 0 ? (
                  <Link href={planHref([...shortlistedIds])}>
                    Build a work plan <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <button disabled type="button">Shortlist candidates to continue</button>
                )}
              </footer>
            </div>
            <CapacityRecordInspector
              candidate={selectedCandidate}
              onClose={closeInspector}
              onToggleShortlist={() => selectedCandidate && toggleShortlist(selectedCandidate.id)}
              shortlisted={selectedCandidate ? shortlistedIds.has(selectedCandidate.id) : false}
            />
          </div>
        </>
      ) : (
        <>
          <PageHead
            className="capacity-page-head"
            eyebrow="WORKBENCH / LOCAL DRAFT"
            title="Build a work plan"
            subtitle="Turn a shortlist into a browser-local draft. Nothing here authorizes or schedules delivery."
          />
          {storageError && <p className="capacity-storage-warning" role="alert">{storageError} Existing saved drafts were not changed.</p>}
          {selectedPlan.unknownIds.length > 0 && (
            <div className="capacity-stale-ids" role="alert">
              <strong>Some shortlisted records are no longer available.</strong>
              <p>These IDs were not replaced: {selectedPlan.unknownIds.map(id => <code key={id}>{id}</code>)}</p>
              <p><Link href="/workspace/workbench">Return to matching and make a fresh shortlist before saving.</Link></p>
            </div>
          )}
          {canSavePlan ? (
            <>
              {saveNotice && <p className="capacity-save-notice" role="status">{saveNotice}</p>}
              <CapacityDraftForm
                candidateIds={selectedPlan.candidates.map(candidate => candidate.id)}
                onBack={() => onBackToMatching(selectedPlan.candidates.map(candidate => candidate.id))}
                onSave={onSaveDraft}
                saving={saving}
                saveError={saveError}
              />
            </>
          ) : selectedPlan.unknownIds.length === 0 ? (
            <section className="capacity-empty-plan">
              <p className="capacity-kicker">NO SHORTLIST RECEIVED</p>
              <h2>Choose candidates before drafting.</h2>
              <p>Shortlisting keeps this decision reversible and separate from authorization.</p>
              <Link href="/workspace/workbench">Return to Find capacity</Link>
            </section>
          ) : null}
          <section aria-labelledby="capacity-saved-drafts-title" className="capacity-saved-drafts">
            <header>
              <div>
                <p className="capacity-kicker">THIS BROWSER ONLY</p>
                <h2 id="capacity-saved-drafts-title">Saved work plans</h2>
              </div>
              <span>{savedDrafts.length}</span>
            </header>
            {savedDrafts.length > 0 ? (
              <ul>
                {savedDrafts.map(draft => (
                  <li key={draft.id}>
                    <div>
                      <strong>{draft.title}</strong>
                      <span>{draft.targetVolume} {scenario.need.unit} · {draft.startDate} – {draft.endDate}</span>
                    </div>
                    <small>Draft · not authorized · {draft.candidateIds.length} candidates</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No local work plans saved yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
