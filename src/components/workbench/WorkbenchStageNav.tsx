import type { SimulationStage, SimulationStatus, WorkbenchViewStage } from '../../lib/workbench-simulation';
import { navigationStages, stageCard, stageIndex } from '../../lib/simulation-machine';

export function WorkbenchStageNav({
  stage,
  status,
  rollApplicable,
}: {
  stage: WorkbenchViewStage;
  status: SimulationStatus | null;
  rollApplicable: boolean;
}) {
  const stages: WorkbenchViewStage[] = navigationStages();
  const currentIndex = stage === 'need' ? 0 : stageIndex(stage as SimulationStage) + 1;
  const completed = status === 'completed';

  return (
    <nav aria-label="Simulation stages" className="workbench-sim-stage-nav">
      <ol>
        {stages.map((item, index) => {
          const isNeed = item === 'need';
          const simStage = isNeed ? null : (item as SimulationStage);
          const notApplicable = !isNeed && !rollApplicable && item === 'roll_preview' && completed;
          const done = index < currentIndex + (completed ? 1 : 0) && !notApplicable;
          const currentItem = index === currentIndex && !completed && !notApplicable;
          const blocked = currentItem && status === 'blocked';
          const paused = currentItem && status === 'paused';
          return (
            <li
              aria-current={currentItem ? 'step' : undefined}
              className={`${currentItem ? 'is-current' : ''}${done ? ' is-done' : ''}${notApplicable ? ' is-na' : ''}${blocked ? ' is-blocked' : ''}${paused ? ' is-paused' : ''}`}
              key={item}
            >
              <span className="workbench-sim-stage-index">
                {notApplicable ? 'â€”' : String(index + 1).padStart(2, '0')}
              </span>
              <span>{notApplicable ? 'Roll not applicable' : isNeed ? 'Need' : stageCard(simStage!).label}</span>
              {currentItem && <span className="visually-hidden">Current stage</span>}
              {blocked && <span className="workbench-sim-stage-state">Blocked</span>}
              {paused && <span className="workbench-sim-stage-state">Paused</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
