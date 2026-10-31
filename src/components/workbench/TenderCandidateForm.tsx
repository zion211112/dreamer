import { useState } from 'preact/hooks';
import { hasPackageDependencyCycle, type SimulationPlan, type SimulationSource } from '../../lib/workbench-simulation';

function lines(value: string): string[] {
  return value.split('\n').map(item => item.trim()).filter(Boolean);
}

export function TenderCandidateForm({
  source,
  context,
  plan,
  onChange,
  onStart,
}: {
  source: SimulationSource;
  context: {
    commonsLabel: string;
    assetLabel: string;
    institutionHref?: string;
    commonsHref?: string;
    assetHref?: string;
  };
  plan: SimulationPlan;
  onChange: (plan: SimulationPlan) => void;
  onStart: () => void;
}) {
  const [reviewing, setReviewing] = useState(false);
  const physicalFactsUnresolved = plan.workKind === 'physical-asset'
    && (plan.unresolvedFacts.length === 0
      || plan.unresolvedFacts.some(fact => fact.trim().toLocaleLowerCase() !== 'none identified'));
  const invalidCost = plan.costAssumptions !== null
    && (!/^\d+(?:\.\d+)?$/.test(plan.costAssumptions.amount)
      || !/^[A-Z]{3}$/.test(plan.costAssumptions.currency)
      || !plan.costAssumptions.basis.trim());
  const missing = [
    !plan.institutionLabel.trim() && 'Select an institutional context.',
    !plan.scope.trim() && 'Define the intended outcome and scope.',
    plan.workKind === 'physical-asset' && !plan.proposedOutputAssetName?.trim()
      && 'Name the proposed physical output asset.',
    plan.packages.length === 0 && 'Add at least one work package.',
    plan.packages.some(item => !item.title.trim() || !item.roleType.trim() || item.deliverables.length === 0)
      && 'Each package needs a title, role type, and deliverable.',
    hasPackageDependencyCycle(plan.packages) && 'Resolve the circular work-package dependencies.',
    invalidCost && 'Enter a valid non-negative cost, three-letter currency, and cost basis, or clear the cost assumption.',
    !plan.compensationTerms.trim() && 'State compensation terms or what remains to be agreed.',
    !plan.rightsTerms.trim() && 'State rights terms or what remains to be agreed.',
    !plan.safetyRequirements.trim() && 'State safety/access requirements or what remains to be checked.',
    plan.acceptanceCriteria.length === 0 && 'Define at least one acceptance criterion.',
    plan.unresolvedFacts.length === 0 && 'List unresolved facts, or explicitly write “None identified”.',
    physicalFactsUnresolved && 'Resolve physical-work facts before review; enter “None identified” only after checking.',
  ].filter((item): item is string => Boolean(item));
  const costAmount = plan.costAssumptions?.amount ?? '';

  function updatePackage(index: number, patch: Partial<SimulationPlan['packages'][number]>) {
    onChange({
      ...plan,
      packages: plan.packages.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    });
  }

  function addPackage() {
    let packageNumber = plan.packages.length + 1;
    while (plan.packages.some(item => item.id === `package-${packageNumber}`)) packageNumber += 1;
    onChange({
      ...plan,
      packages: [...plan.packages, {
        id: `package-${packageNumber}`,
        title: '',
        deliverables: [],
        roleType: '',
        dependsOn: [],
      }],
    });
  }

  function removePackage(index: number) {
    const removed = plan.packages[index];
    onChange({
      ...plan,
      packages: plan.packages
        .filter((_, itemIndex) => itemIndex !== index)
        .map(item => ({ ...item, dependsOn: item.dependsOn.filter(id => id !== removed.id) })),
    });
  }

  if (reviewing) {
    return (
      <section aria-labelledby="workbench-sim-review-title" className="workbench-sim-candidate">
        <p className="workbench-sim-kicker">TENDER CANDIDATE / REVIEW</p>
        <h2 id="workbench-sim-review-title">Review the plan before running</h2>
        <dl className="workbench-sim-review-list">
          <div><dt>Source need</dt><dd>{source.assetName} · {source.need}</dd></div>
          <div><dt>Institution context</dt><dd>{plan.institutionLabel}{context.institutionHref && <a href={context.institutionHref}>Open record</a>}</dd></div>
          <div><dt>Commons observation</dt><dd>{context.commonsLabel}{context.commonsHref && <a href={context.commonsHref}>Open record</a>}</dd></div>
          <div><dt>Asset context</dt><dd>{context.assetLabel}{context.assetHref && <a href={context.assetHref}>Open record</a>}</dd></div>
          <div><dt>Work kind</dt><dd>{plan.workKind === 'physical-asset' ? 'Physical asset work' : 'Non-physical work'}</dd></div>
          <div><dt>Scope</dt><dd>{plan.scope}</dd></div>
          <div><dt>Packages</dt><dd>{plan.packages.map(item => `${item.title} — ${item.roleType}: ${item.deliverables.join(', ')}`).join(' / ')}</dd></div>
          <div><dt>Compensation</dt><dd>{plan.compensationTerms}</dd></div>
          <div><dt>Rights</dt><dd>{plan.rightsTerms}</dd></div>
          <div><dt>Safety and access</dt><dd>{plan.safetyRequirements}</dd></div>
          <div><dt>Acceptance</dt><dd>{plan.acceptanceCriteria.join(' · ')}</dd></div>
          <div><dt>Unresolved facts</dt><dd>{plan.unresolvedFacts.join(' · ')}</dd></div>
        </dl>
        <p className="workbench-sim-boundary-note">Run creates an isolated scenario trace only. It will not publish a Tender, appoint providers, authorize work, or create a registry asset.</p>
        <div className="workbench-sim-run-actions">
          <button className="workbench-sim-primary" onClick={onStart} type="button">Run simulation</button>
          <button className="workbench-sim-secondary" onClick={() => setReviewing(false)} type="button">Return to edit</button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="workbench-sim-candidate-title" className="workbench-sim-candidate">
      <p className="workbench-sim-kicker">02 / TENDER CANDIDATE · MANUAL PLAN</p>
      <h2 id="workbench-sim-candidate-title">Compose the response</h2>
      <p className="workbench-sim-source-reference"><strong>{source.assetName}</strong> · {source.need}</p>
      <div className="workbench-sim-form-grid">
        <label>Work kind
          <select onChange={event => onChange({ ...plan, workKind: (event.currentTarget as HTMLSelectElement).value as SimulationPlan['workKind'] })} value={plan.workKind}>
            <option value="non-physical">Teaching, service, or professional work</option>
            <option value="physical-asset">Physical asset build or installation</option>
          </select>
        </label>
        <label>Institution context
          <input readOnly value={plan.institutionLabel || 'Select in the Need stage'} />
        </label>
        <label className="workbench-sim-field-wide">Outcome and scope
          <textarea onInput={event => onChange({ ...plan, scope: (event.currentTarget as HTMLTextAreaElement).value })} rows={3} value={plan.scope} />
        </label>
        {plan.workKind === 'physical-asset' && (
          <label className="workbench-sim-field-wide">Proposed output asset name <span>(simulation only)</span>
            <input onInput={event => onChange({ ...plan, proposedOutputAssetName: (event.currentTarget as HTMLInputElement).value })} value={plan.proposedOutputAssetName ?? ''} />
          </label>
        )}
        <label>Cost assumption <span>(optional · scenario only)</span>
          <input
            inputMode="decimal"
            onInput={event => {
              const amount = (event.currentTarget as HTMLInputElement).value;
              onChange({
                ...plan,
                costAssumptions: amount ? {
                  amount,
                  currency: plan.costAssumptions?.currency || 'KES',
                  basis: plan.costAssumptions?.basis || 'User-entered scenario assumption',
                } : null,
              });
            }}
            value={costAmount}
          />
        </label>
        <label>Currency
          <input
            onInput={event => onChange({
              ...plan,
              costAssumptions: plan.costAssumptions
                ? { ...plan.costAssumptions, currency: (event.currentTarget as HTMLInputElement).value.toUpperCase() }
                : null,
            })}
            value={plan.costAssumptions?.currency ?? ''}
          />
        </label>
        <label>Cost basis
          <input
            onInput={event => onChange({
              ...plan,
              costAssumptions: plan.costAssumptions
                ? { ...plan.costAssumptions, basis: (event.currentTarget as HTMLInputElement).value }
                : null,
            })}
            value={plan.costAssumptions?.basis ?? ''}
          />
        </label>
      </div>

      <div className="workbench-sim-packages">
        <div className="workbench-sim-section-head">
          <div><p className="workbench-sim-kicker">PACKAGE COMPOSITION</p><h3>Work packages</h3></div>
          <button className="workbench-sim-text" onClick={addPackage} type="button">＋ Add package</button>
        </div>
        {plan.packages.map((item, index) => (
          <fieldset className="workbench-sim-package" key={item.id}>
            <legend>Package {String(index + 1).padStart(2, '0')}</legend>
            <label>Package title
              <input onInput={event => updatePackage(index, { title: (event.currentTarget as HTMLInputElement).value })} value={item.title} />
            </label>
            <label>Role type
              <input onInput={event => updatePackage(index, { roleType: (event.currentTarget as HTMLInputElement).value })} placeholder="e.g. learning designer" value={item.roleType} />
            </label>
            <label>Deliverables <span>(one per line)</span>
              <textarea onInput={event => updatePackage(index, { deliverables: lines((event.currentTarget as HTMLTextAreaElement).value) })} rows={2} value={item.deliverables.join('\n')} />
            </label>
            {plan.packages.length > 1 && (
              <fieldset className="workbench-sim-dependencies">
                <legend>Depends on</legend>
                {plan.packages.filter(other => other.id !== item.id).map(other => (
                  <label key={other.id}>
                    <input
                      checked={item.dependsOn.includes(other.id)}
                      onChange={event => {
                        const checked = (event.currentTarget as HTMLInputElement).checked;
                        updatePackage(index, {
                          dependsOn: checked
                            ? [...item.dependsOn, other.id]
                            : item.dependsOn.filter(id => id !== other.id),
                        });
                      }}
                      type="checkbox"
                    />
                    {other.title || `Package ${other.id}`}
                  </label>
                ))}
              </fieldset>
            )}
            {plan.packages.length > 1 && <button className="workbench-sim-text" onClick={() => removePackage(index)} type="button">Remove package</button>}
          </fieldset>
        ))}
      </div>

      <div className="workbench-sim-form-grid">
        <label>Compensation terms
          <textarea onInput={event => onChange({ ...plan, compensationTerms: (event.currentTarget as HTMLTextAreaElement).value })} rows={2} value={plan.compensationTerms} />
        </label>
        <label>Rights terms
          <textarea onInput={event => onChange({ ...plan, rightsTerms: (event.currentTarget as HTMLTextAreaElement).value })} rows={2} value={plan.rightsTerms} />
        </label>
        <label>Safety and access
          <textarea onInput={event => onChange({ ...plan, safetyRequirements: (event.currentTarget as HTMLTextAreaElement).value })} rows={2} value={plan.safetyRequirements} />
        </label>
        <label>Acceptance criteria <span>(one per line)</span>
          <textarea onInput={event => onChange({ ...plan, acceptanceCriteria: lines((event.currentTarget as HTMLTextAreaElement).value) })} rows={2} value={plan.acceptanceCriteria.join('\n')} />
        </label>
        <label className="workbench-sim-field-wide">Unresolved facts <span>(one per line; enter “None identified” only if reviewed)</span>
          <textarea onInput={event => onChange({ ...plan, unresolvedFacts: lines((event.currentTarget as HTMLTextAreaElement).value) })} rows={2} value={plan.unresolvedFacts.join('\n')} />
        </label>
      </div>

      {missing.length > 0 && (
        <div className="workbench-sim-missing" role="status">
          <strong>Before review</strong>
          <ul>{missing.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
      <button className="workbench-sim-primary" disabled={missing.length > 0} onClick={() => setReviewing(true)} type="button">
        Review simulation plan
      </button>
    </section>
  );
}
