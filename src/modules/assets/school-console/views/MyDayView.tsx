// Rebuilt My Day: daily checklist, reversible local completion.
// Design language: sc-* module styles on APT-LABS tokens (token-alias.css).
import type { ConsoleSnapshot } from '../../../../lib/school-console-storage';
import { dayTasks } from '../constants';

interface MyDayViewProps {
  snapshot: ConsoleSnapshot;
  toggleTask: (taskId: string) => void;
  canWrite: boolean;
}

export function MyDayView({ snapshot, toggleTask, canWrite }: MyDayViewProps) {
  return (
    <section className="sc-module" aria-labelledby="sc-my-day-title">
      <div className="sc-module-head">
        <div>
          <h2 className="sc-title" id="sc-my-day-title">My Day</h2>
          <p className="sc-description">
            A simple planning checklist. These entries are examples, not a live timetable.
          </p>
        </div>
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <h3 className="sc-panel-title">Daily plan</h3>
        </div>
        <div className="sc-list">
          {dayTasks.map((task) => {
            const complete = snapshot.completedTasks.includes(task.id);
            return (
              <button
                aria-pressed={complete}
                className={`sc-list-item${complete ? ' is-complete' : ''}`}
                disabled={!canWrite}
                key={task.id}
                onClick={() => void toggleTask(task.id)}
                type="button"
              >
                <time>{task.time}</time>
                <span
                  className="sc-task-check"
                  aria-hidden="true"
                >
                  {complete ? '✓' : ''}
                </span>
                <strong>{task.title}</strong>
                <span className="sc-task-state">{complete ? 'Done' : 'Open'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sc-footnote">
        Checklist changes are stored locally and can be reopened at any time.
      </p>
    </section>
  );
}
