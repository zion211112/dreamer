import { useState } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';

type AnnalsLine = 'main' | 'branch';

interface TimelineStep {
  label: string;
  title: string;
  detail: string;
  record: string;
}

const mainSteps: readonly TimelineStep[] = [
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

const branchSteps: readonly TimelineStep[] = [
  {
    label: '01 · fork',
    title: 'Pin the origin',
    detail: 'Choose the exact Main record or event that this working line starts from.',
    record: 'A branch preserves its origin and never silently edits its parent.',
  },
  {
    label: '02 · draft',
    title: 'Shape the change',
    detail: 'Develop a proposal in Undertakings without changing the Canon projection.',
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
    record: 'Only an authorized disposition may update affected Main projections.',
  },
];

export function Annals() {
  const [line, setLine] = useState<AnnalsLine>('main');
  const [selectedStep, setSelectedStep] = useState(0);
  const steps = line === 'main' ? mainSteps : branchSteps;
  const selected = steps[selectedStep] ?? steps[0];

  function chooseLine(nextLine: AnnalsLine) {
    setLine(nextLine);
    setSelectedStep(0);
  }

  return (
    <WorkspaceLayout currentContext="annals">
      <div className="annals-page">
        <header className="annals-header">
          <div className="annals-kicker">BRANCH <span aria-hidden="true">/</span> ANNALS</div>
          <div className="annals-heading-row">
            <div>
              <h1>Annals</h1>
              <p>Follow what changed, where a working line began, and what evidence supports its disposition.</p>
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
          <span className="annals-local-tag">BROWSER-LOCAL DEMO</span>
        </section>

        <div className="annals-grid">
          <section aria-labelledby="annals-timeline-title" className="annals-timeline-panel">
            <div className="annals-panel-heading">
              <div>
                <span className="annals-section-label">CHRONOLOGY MODEL</span>
                <h2 id="annals-timeline-title">{line === 'main' ? 'Canon source line' : 'Working fork'}</h2>
              </div>
              <div aria-label="Annals timeline view" className="annals-line-switch" role="group">
                <button
                  aria-pressed={line === 'main'}
                  className={line === 'main' ? 'is-active' : ''}
                  onClick={() => chooseLine('main')}
                  type="button"
                >
                  Source line
                </button>
                <button
                  aria-pressed={line === 'branch'}
                  className={line === 'branch' ? 'is-active' : ''}
                  onClick={() => chooseLine('branch')}
                  type="button"
                >
                  Working fork
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
                  <span className="annals-step-kind">{line === 'main' ? 'CANON ↔ ANNALS' : 'PROPOSED LINE'}</span>
                </button>
              ))}
            </div>

            <div className={`annals-fork-note${line === 'branch' ? ' is-branch' : ''}`}>
              <span aria-hidden="true" className="annals-fork-glyph">↳</span>
              <p>
                <strong>{line === 'main' ? 'Main is a qualified present, not a mutable draft.' : 'A branch carries its own lineage.'}</strong>
                {line === 'main'
                  ? ' Changes are reconstructed from sourced records and attributable events; corrections remain visible.'
                  : ' Compare it with its named origin. A proposed path cannot silently become the Canon.'}
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
            <Link className="annals-text-link" href={line === 'main' ? '/workspace/people' : '/workspace/workbench'}>
              {line === 'main' ? 'Inspect Canon records' : 'Continue in Undertakings'}
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
