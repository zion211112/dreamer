import { useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';

type AnnalsView = 'records' | 'proposals';

interface TimelineStep {
  label: string;
  title: string;
  detail: string;
  record: string;
}

const recordSteps: readonly TimelineStep[] = [
  {
    label: '01 · reference',
    title: 'Name a Canon snapshot',
    detail: 'Start from an explicit record or state, with its source and basis visible.',
    record: 'A reference point only. It does not imply that a change has been approved.',
  },
  {
    label: '02 · proposal',
    title: 'Describe a possible change',
    detail: 'Carry the originating signal, scope, people, and uncertainty into the work.',
    record: 'A proposal stays separate from the current Canon until disposition.',
  },
  {
    label: '03 · disposition',
    title: 'Record the decision',
    detail: 'Show who decided, under which rule or delegation, and with what rationale.',
    record: 'Approval to proceed and authority to spend or act remain distinct.',
  },
  {
    label: '04 · outcome',
    title: 'Preserve evidence and revision',
    detail: 'Record delivery, acceptance, dispute, correction, and contribution separately.',
    record: 'A Roll record is a source for the chronology—not proof of every claim.',
  },
];

const proposalSteps: readonly TimelineStep[] = [
  {
    label: '01 · source',
    title: 'Name a source record',
    detail: 'Carry the originating signal, scope, people, and uncertainty into the proposal.',
    record: 'A proposed change preserves its source and does not edit the current record.',
  },
  {
    label: '02 · draft',
    title: 'Shape the change',
    detail: 'Develop a proposal in Undertakings without changing current records.',
    record: 'Local Workbench simulations are not shared events or real authorizations.',
  },
  {
    label: '03 · review',
    title: 'Make review attributable',
    detail: 'Keep evidence, dissent, authority, and conditions attached to the review.',
    record: 'Review is a process state, not acceptance or a transfer of authority.',
  },
  {
    label: '04 · resolve',
    title: 'Append a disposition',
    detail: 'Accept, revise, or abandon with a dated, attributable record.',
    record: 'Only an authorized disposition may update affected current records.',
  },
];

export function Annals() {
  const [view, setView] = useState<AnnalsView>('records');
  const [selectedStep, setSelectedStep] = useState(0);
  const steps = view === 'records' ? recordSteps : proposalSteps;
  const selected = steps[selectedStep] ?? steps[0];

  function chooseView(nextView: AnnalsView) {
    setView(nextView);
    setSelectedStep(0);
  }

  return (
    <WorkspaceLayout currentContext="records:annals">
      <div className="annals-page">
        <header className="annals-header">
          <div className="annals-kicker">APT-LABS <span aria-hidden="true">/</span> ANNALS</div>
          <div className="annals-heading-row">
            <div>
              <h1>Annals</h1>
              <p>Review how source records, proposals, decisions, and outcomes connect.</p>
            </div>
            <Link className="annals-primary-link" href="/workspace/workbench">
              Open Undertakings <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </header>

        <section aria-label="Prototype data boundary" className="annals-boundary">
          <span className="annals-boundary-mark" aria-hidden="true">i</span>
          <p>
            <strong>Structure preview · no unified event stream.</strong>
            Current Commons, Workbench, and Roll records remain separate local workflows. This
            timeline describes the intended relationship; it does not display recorded project events.
          </p>
        </section>

        <div className="annals-grid">
          <section aria-labelledby="annals-timeline-title" className="annals-timeline-panel">
            <div className="annals-panel-heading">
              <div>
                <span className="annals-section-label">CHRONOLOGY MODEL</span>
                <h2 id="annals-timeline-title">{view === 'records' ? 'Recorded sequence' : 'Proposed changes'}</h2>
              </div>
              <div aria-label="Annals views" className="annals-line-switch" role="group">
                <button
                  aria-pressed={view === 'records'}
                  className={view === 'records' ? 'is-active' : ''}
                  onClick={() => chooseView('records')}
                  type="button"
                >
                  Records
                </button>
                <button
                  aria-pressed={view === 'proposals'}
                  className={view === 'proposals' ? 'is-active' : ''}
                  onClick={() => chooseView('proposals')}
                  type="button"
                >
                  Proposals
                </button>
              </div>
            </div>

            <div className="annals-illustration-label">
              <span className="annals-example-dot" />
              Illustrative sequence <span>· not an actual history</span>
            </div>

            <div className="annals-flow">
              <div aria-hidden="true" className="annals-flow-rail" />
              {steps.map((step, index) => (
                <button
                  aria-pressed={selectedStep === index}
                  className={`annals-step${selectedStep === index ? ' is-selected' : ''}`}
                  key={step.label}
                  onClick={() => setSelectedStep(index)}
                  type="button"
                >
                  <span className="annals-step-index">{step.label}</span>
                  <strong>{step.title}</strong>
                  <span className="annals-step-detail">{step.detail}</span>
                  <span className="annals-step-kind">{view === 'records' ? 'CANON ↔ ANNALS' : 'PROPOSED CHANGE'}</span>
                </button>
              ))}
            </div>

            <div className={`annals-fork-note${view === 'proposals' ? ' is-branch' : ''}`}>
              <span aria-hidden="true" className="annals-fork-glyph">↳</span>
              <p>
                <strong>{view === 'records' ? 'Current records are qualified views, not mutable drafts.' : 'Proposals retain their source and review history.'}</strong>
                {view === 'records'
                  ? ' Changes are reconstructed from sourced records and attributable events; corrections remain visible.'
                  : ' A proposal cannot silently become an accepted record or authorize work.'}
              </p>
            </div>
          </section>

          <aside aria-live="polite" className="annals-inspector">
            <div className="annals-inspector-top">
              <span className="annals-section-label">SELECTED MOMENT</span>
              <span className="annals-record-tag">{selected.label}</span>
            </div>
            <h2>{selected.title}</h2>
            <p className="annals-inspector-summary">{selected.detail}</p>
            <div className="annals-inspector-rule" />
            <span className="annals-section-label">WHAT THIS MEANS</span>
            <p className="annals-inspector-record">{selected.record}</p>
            <div className="annals-source-note">
              <span className="annals-source-icon" aria-hidden="true">↗</span>
              <p><strong>Source trail</strong><br />Source, actor, time, authority, evidence, and correction path travel with each real event.</p>
            </div>
            <Link className="annals-text-link" href={view === 'records' ? '/workspace/people' : '/workspace/workbench'}>
              {view === 'records' ? 'Inspect Network records' : 'Continue in Undertakings'}
              <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>

        <section aria-labelledby="annals-sources-title" className="annals-sources">
          <div className="annals-sources-heading">
            <div>
              <span className="annals-section-label">CURRENTLY SEPARATE</span>
              <h2 id="annals-sources-title">Potential source lanes</h2>
            </div>
            <span className="annals-lanes-note">No cross-module chronology is connected in this demo.</span>
          </div>
          <div className="annals-lane-list">
            <div className="annals-lane">
              <span className="annals-lane-index">01</span>
              <span className="annals-lane-name"><strong>Commons / Radar</strong><small>Observations, proposals, and local decisions</small></span>
              <span className="annals-lane-status">LOCAL RECORDS</span>
            </div>
            <div className="annals-lane">
              <span className="annals-lane-index">02</span>
              <span className="annals-lane-name"><strong>Undertakings / Workbench</strong><small>Workflow stages and explicitly marked simulations</small></span>
              <span className="annals-lane-status is-muted">SIMULATION ≠ EVENT</span>
            </div>
            <div className="annals-lane">
              <span className="annals-lane-index">03</span>
              <span className="annals-lane-name"><strong>Roll</strong><small>Evidence, outcomes, and visible revisions</small></span>
              <span className="annals-lane-status">SCOPED RECORDS</span>
            </div>
          </div>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
