import type { SimulationStatus, SimulationStage, WorkbenchViewStage } from '../../lib/workbench-simulation';

const stages: Array<{ id: WorkbenchViewStage; label: string }> = [
  { id: 'need', label: 'Need' },
  { id: 'candidate_drafted', label: 'Tender' },
  { id: 'assembly_simulated', label: 'Assembly' },
  { id: 'delivery_simulated', label: 'Acceptance' },
  { id: 'roll_preview', label: 'Roll preview' },
];

function activeIndex(stage: WorkbenchViewStage, status: SimulationStatus | null, rollApplicable: boolean): number {
  if (stage === 'need') return 0;
  if (stage === 'candidate_drafted') return 1;
  if (stage === 'tender_review_simulated') return status === 'blocked' ? 1 : 2;
  if (stage === 'assembly_simulated') return status === 'blocked' ? 2 : 3;
  if (stage === 'delivery_simulated') return 3;
  if (stage === 'acceptance_simulated') {
    return rollApplicable && status !== 'blocked' && status !== 'completed' ? 4 : 3;
  }
  return 4;
}

export function WorkbenchStageNav({
  stage,
  status,
  rollApplicable,
}: {
  stage: WorkbenchViewStage;
  status: SimulationStatus | null;
  rollApplicable: boolean;
}) {
  const selected = stage === 'need' ? 'need' : stage as SimulationStage;
  const current = activeIndex(selected, status, rollApplicable);
  const nonPhysicalComplete = status === 'completed' && stage === 'acceptance_simulated' && !rollApplicable;

  return (
    <nav aria-label="Simulation stages" className="workbench-sim-stage-nav">
      <ol>
        {stages.map((item, index) => {
          const currentItem = index === current;
          const done = index < current || nonPhysicalComplete && index < 4 || stage === 'roll_preview' && index <= 4;
          const notApplicable = index === 4 && !rollApplicable && status === 'completed';
          return (
            <li
              aria-current={currentItem ? 'step' : undefined}
              className={`${currentItem ? 'is-current' : ''}${done ? ' is-done' : ''}${notApplicable ? ' is-na' : ''}`}
              key={item.id}
            >
              <span className="workbench-sim-stage-index">{notApplicable ? '—' : String(index + 1).padStart(2, '0')}</span>
              <span>{notApplicable ? 'Roll not applicable' : item.label}</span>
              {currentItem && <span className="visually-hidden">Current stage</span>}
              {currentItem && status === 'blocked' && <span className="workbench-sim-stage-state">Blocked</span>}
              {currentItem && status === 'paused' && <span className="workbench-sim-stage-state">Paused</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
