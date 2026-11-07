// Class view: teacher class management, student roster, recent marks.
// Local-only student records, no learner details stored externally.
import { useState } from 'preact/hooks';
import type { ConsoleSnapshot } from '../../../../lib/school-console-storage';

interface ClassViewProps {
  snapshot: ConsoleSnapshot;
  canWrite: boolean;
  persist: (snapshot: ConsoleSnapshot, confirmation: string) => Promise<boolean>;
}

export function ClassView({
  snapshot,
  canWrite,
  persist,
}: ClassViewProps) {
  const [newStudent, setNewStudent] = useState('');
  const [newAdmission, setNewAdmission] = useState('');

  // Derive a simple student list from marked papers (local-only, demo data).
  const students = Array.from(
    new Map(
      snapshot.markedPapers
        .map((paper) => [paper.student, paper] as const)
    ).values()
  );

  async function addStudent(event: Event) {
    event.preventDefault();
    if (!newStudent.trim() || !newAdmission.trim()) return;
    // In pilot 1, class roster is derived from marking activity.
    // A full roster CRUD is a pilot 2 item.
    setNewStudent('');
    setNewAdmission('');
    if (await persist(snapshot, 'Class note updated locally.')) {
      // Roster reflects marking activity after save.
    }
  }

  return (
    <section className="sc-module" aria-labelledby="sc-class-title">
      <div className="sc-module-head">
        <div>
          <h2 className="sc-title" id="sc-class-title">Class</h2>
          <p className="sc-description">
            Student roster and recent marks. Derived from marking activity.
          </p>
        </div>
      </div>

      <p className="sc-state-line">
        Roster built from marked papers · no external learner records
      </p>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Add student</h3>
          </div>
          <span className="sc-data-note">No personal details</span>
        </div>

        <form className="sc-form" onSubmit={addStudent}>
          <label className="sc-field" htmlFor="sc-student-name">
            Student label
            <input
              id="sc-student-name"
              value={newStudent}
              onChange={(event) => setNewStudent((event.target as HTMLInputElement).value)}
              disabled={!canWrite}
              placeholder="e.g. Adm. 24101"
            />
          </label>
          <label className="sc-field" htmlFor="sc-student-admission">
            Admission number
            <input
              id="sc-student-admission"
              value={newAdmission}
              onChange={(event) => setNewAdmission((event.target as HTMLInputElement).value)}
              disabled={!canWrite}
              placeholder="e.g. 24101"
            />
          </label>
          <div className="sc-actions">
            <button
              className="sc-button sc-button-primary"
              disabled={!canWrite || !newStudent.trim() || !newAdmission.trim()}
              type="submit"
            >
              Add to class
            </button>
          </div>
          <p className="sc-footnote">
            Pilot 1: roster is derived from marking activity. Full CRUD in pilot 2.
          </p>
        </form>
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Roster</h3>
          </div>
          <span className="sc-data-note">{students.length} students with marks</span>
        </div>

        {students.length === 0 ? (
          <p className="sc-empty-state">
            No students yet. Mark a paper in Kenyan Marking to begin the roster.
          </p>
        ) : (
          <div className="sc-class-list">
            {students.map((paper) => (
              <div className="sc-class-row" key={paper.student}>
                <div>
                  <strong>{paper.student}</strong>
                  <p className="sc-class-sub">
                    Last marked {new Date().toLocaleDateString()} ·
                    {paper.score} / {paper.maximum}
                  </p>
                </div>
                <b className="sc-class-score">{paper.score}<i> / {paper.maximum}</i></b>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
