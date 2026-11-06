// src/modules/assets/school-console/views/MyDayView.tsx
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
  const completeCount = snapshot.completedTasks.filter((id: string) =>
    dayTasks.some((task) => task.id === id),
  ).length;

  return (
    <section className="sc-module" aria-labelledby="sc-my-day-title">
      <div className="sc-module-head">
        <div>
          <p className="sc-eyebrow">TEACHER TOOLS <span>/</span> DAILY RHYTHM</p>
          <h2 className="sc-title" id="sc-my-day-title">My Day</h2>
          <p className="sc-description">
            A simple planning checklist. These entries are examples, not a live timetable.
          </p>
        </div>
        <span className="sc-example-stamp">EXAMPLE ROUTINE</span>
      </div>

      <div className="sc-card">
        <div className="sc-card-head">
          <div>
            <p className="sc-card-label">DAILY PLAN</p>
            <h3 className="sc-card-title">
              {completeCount} <small style={{ fontSize: '0.75rem', opacity: 0.6 }}>/ {dayTasks.length} complete</small>
            </h3>
          </div>
        </div>
        <div className="sc-card-body">
          <div className="sc-day-list">
            {dayTasks.map((task) => {
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
                  <span
                    className="sc-task-check"
                    aria-hidden="true"
                  >
                    {complete ? '✓' : ''}
                  </span>
                  <strong>{task.title}</strong>
                  <span className="sc-task-state">{complete ? 'DONE' : 'OPEN'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="sc-footnote">
        Checklist changes are stored locally and can be reopened at any time.
      </p>
    </section>
  );
}
