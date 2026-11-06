import { dayTasks } from './constants';
import type { ConsoleSnapshot } from '../../../lib/school-console-storage';

interface MyDayViewProps {
  snapshot: ConsoleSnapshot;
  toggleTask: (taskId: string) => void;
  canWrite: boolean;
}

export function MyDayView({ snapshot, toggleTask, canWrite }: MyDayViewProps) {
  const completeCount = snapshot.completedTasks.filter(id => dayTasks.some(task => task.id === id)).length;

  return (
    <section className="sc-module" aria-labelledby="sc-my-day-title">
      <div className="sc-module-head">
        <div>
          <p className="sc-eyebrow">TEACHER TOOLS <span>/</span> DAILY RHYTHM</p>
          <h2 id="sc-my-day-title">My Day</h2>
          <p className="sc-module-description">A simple planning checklist. These entries are examples, not a live timetable.</p>
        </div>
        <span className="sc-example-stamp">EXAMPLE ROUTINE</span>
      </div>
      <div className="sc-day-summary">
        <span>DAILY PLAN</span>
        <strong>{completeCount}<small> / {dayTasks.length} complete</small></strong>
      </div>
      <div className="sc-day-list">
        {dayTasks.map(task => {
          const complete = snapshot.completedTasks.includes(task.id);
          return (
            <button
              aria-pressed={complete}
              className={`sc-day-item${complete ? ' is-complete' : ''}`}
              disabled={!canWrite}
              key={task.id}
              onClick={() => void toggleTask(task.id)}
              type="button"
            >
              <time>{task.time}</time>
              <span className="sc-task-check" aria-hidden="true">{complete ? '✓' : ''}</span>
              <strong>{task.title}</strong>
              <span className="sc-task-state">{complete ? 'DONE' : 'OPEN'}</span>
            </button>
          );
        })}
      </div>
      <p className="sc-footnote">Checklist changes are stored locally and can be reopened at any time.</p>
    </section>
  );
}
