import { SchoolNeedSourcePicker } from '../../../components/workbench/SchoolNeedSourcePicker';
import { TenderCandidateForm } from '../../../components/workbench/TenderCandidateForm';
import type { FieldSignal } from '../../../lib/local-workflows';
import type { NetworkEntity } from '../../../lib/people-network';
import type { SchoolNeedDraft, SimulationContext, SimulationPlan, SimulationSource } from '../../../lib/workbench-simulation';

interface WorkbenchDossierContextLabels {
  commonsLabel: string;
  assetLabel: string;
  institutionHref: string | undefined;
  commonsHref: string | undefined;
  assetHref: string | undefined;
}

interface WorkbenchDossierProps {
  sourceDrafts: SchoolNeedDraft[];
  selectedDraftId: string;
  chooseDraft: (draft: SchoolNeedDraft, initialContext?: SimulationContext) => void;
  source: SimulationSource | null;
  context: SimulationContext;
  updateContext: (field: keyof SimulationContext, value: string) => void;
  eligibleSignals: FieldSignal[];
  institutions: NetworkEntity[];
  assets: NetworkEntity[];
  plan: SimulationPlan | null;
  setPlan: (plan: SimulationPlan) => void;
  startSimulation: () => void;
  contextLabels: WorkbenchDossierContextLabels;
}

export function WorkbenchDossier({
  sourceDrafts,
  selectedDraftId,
  chooseDraft,
  source,
  context,
  updateContext,
  eligibleSignals,
  institutions,
  assets,
  plan,
  setPlan,
  startSimulation,
  contextLabels,
}: WorkbenchDossierProps) {
  return (
    <>
      <SchoolNeedSourcePicker
        drafts={sourceDrafts}
        onSelect={chooseDraft}
        selectedId={selectedDraftId}
      />
      {source && (
        <>
          <section aria-labelledby="workbench-sim-context-title" className="workbench-sim-context">
            <p className="workbench-sim-kicker">LINKED CONTEXT / SELECT BY RECORD</p>
            <h2 id="workbench-sim-context-title">Institution, observation, asset</h2>
            <div className="workbench-sim-form-grid">
              <label>Institution <span>(context, not authority)</span>
                <select onChange={event => updateContext('institutionId', (event.currentTarget as HTMLSelectElement).value)} value={context.institutionId ?? ''}>
                  <option value="">Select a registered institution</option>
                  {institutions.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                </select>
              </label>
              <label>Commons observation <span>(optional · select by record)</span>
                <select onChange={event => updateContext('commonsSignalId', (event.currentTarget as HTMLSelectElement).value)} value={context.commonsSignalId ?? ''}>
                  <option value="">No Commons observation</option>
                  {eligibleSignals.map(signal => <option key={signal.id} value={signal.id}>{signal.title}</option>)}
                </select>
              </label>
              <label className="workbench-sim-field-wide">Registered asset <span>(optional · no inference)</span>
                <select onChange={event => updateContext('assetRecordId', (event.currentTarget as HTMLSelectElement).value)} value={context.assetRecordId ?? ''}>
                  <option value="">Asset not identified</option>
                  {assets.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                </select>
              </label>
            </div>
          </section>
          {plan && (
            <TenderCandidateForm
              context={contextLabels}
              onChange={setPlan}
              onStart={startSimulation}
              plan={plan}
              source={source}
            />
          )}
        </>
      )}
    </>
  );
}
