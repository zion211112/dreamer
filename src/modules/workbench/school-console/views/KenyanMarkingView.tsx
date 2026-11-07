// Kenyan automarking: KCPE / KCSE subject schemes, typed answers,
// deterministic marking (no AI, no scans), teacher review required.
import { useEffect, useState } from 'preact/hooks';
import type { ConsoleSnapshot } from '../../../../lib/school-console-storage';
import { markPaper, parseCsvPapers, parseJsonPapers } from '../../../../lib/school-marking';
import {
  kcpeSubjects,
  kcseSubjects,
  type SchemeQuestion,
} from '../constants';

interface KenyanMarkingViewProps {
  snapshot: ConsoleSnapshot;
  canWrite: boolean;
  persist: (snapshot: ConsoleSnapshot, confirmation: string) => Promise<boolean>;
}

export function KenyanMarkingView({
  snapshot,
  canWrite,
  persist,
}: KenyanMarkingViewProps) {
  const [level, setLevel] = useState<'KCPE' | 'KCSE'>('KCPE');
  const [subjectId, setSubjectId] = useState<string>('kcpe-math');
  const [student, setStudent] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<{
    subject: string;
    student: string;
    score: number;
    maximum: number;
    marksByQuestion: number[];
    questions: SchemeQuestion[];
    answers: Record<string, string>;
  } | null>(null);
  const [importError, setImportError] = useState('');

  const subjects = level === 'KCPE' ? kcpeSubjects : kcseSubjects;
  const subject = subjects.find((s) => s.id === subjectId)!;
  const questions = subject.questions;

  useEffect(() => {
    setAnswers({});
    for (const q of questions) {
      if (answers[q.id] === undefined) {
        setAnswers((prev) => ({ ...prev, [q.id]: '' }));
      }
    }
  }, [subjectId, questions, answers]);

  async function submitPaper(event: Event) {
    event.preventDefault();
    setImportError('');
    if (!student.trim()) {
      setImportError('Enter a student label.');
      return;
    }
    try {
      const paper = markPaper(questions, { student, answers });
      const nextSnapshot = {
        ...snapshot,
        markedPapers: [paper, ...snapshot.markedPapers],
      };
      if (await persist(nextSnapshot, 'Kenyan paper marked locally for teacher review.')) {
        setMarked({
          subject: subject.label,
          student: paper.student,
          score: paper.score,
          maximum: paper.maximum,
          marksByQuestion: paper.marksByQuestion,
          questions,
          answers: { ...answers },
        });
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Marking failed.');
    }
  }

  async function importPapers(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setImportError('');
    try {
      const content = await file.text();
      const papers =
        file.name.toLocaleLowerCase().endsWith('.csv')
          ? parseCsvPapers(content, questions)
          : file.name.toLocaleLowerCase().endsWith('.json')
            ? parseJsonPapers(content, questions)
            : (() => {
                throw new Error('Use a typed .csv or .json file.');
              })();
      const markedPapers = papers.map((p) => markPaper(questions, p));
      const nextSnapshot = {
        ...snapshot,
        markedPapers: [...markedPapers, ...snapshot.markedPapers],
      };
      if (await persist(nextSnapshot, `${markedPapers.length} paper${markedPapers.length === 1 ? '' : 's'} marked locally.`)) {
        setMarked(null);
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed.');
    }
  }

  function gradeLabel(score: number, maximum: number): string {
    const pct = maximum === 0 ? 0 : Math.round((score / maximum) * 100);
    if (pct >= 80) return 'Distinction';
    if (pct >= 65) return 'Credit';
    if (pct >= 50) return 'Pass';
    return 'Below pass';
  }

  return (
    <section className="sc-module" aria-labelledby="sc-kenyan-title">
      <div className="sc-module-head">
        <div>
          <h2 className="sc-title" id="sc-kenyan-title">Kenyan Marking</h2>
          <p className="sc-description">
            KCPE · KCSE · typed answers only · deterministic scheme marking
          </p>
        </div>
      </div>

      <p className="sc-state-line">
        Teacher review required · practice aid only · no scans, no AI
      </p>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Set up the paper</h3>
          </div>
          <span className="sc-data-note">No learner details</span>
        </div>

        <div className="sc-form">
          <label className="sc-field sc-field-wide" htmlFor="sc-kenyan-level">
            Exam level
            <select
              id="sc-kenyan-level"
              value={level}
              onChange={(event) => {
    const target = event.target as HTMLSelectElement;
    if (target) setLevel(target.value as 'KCPE' | 'KCSE');
  }}
              disabled={!canWrite}
            >
              <option value="KCPE">KCPE — Primary</option>
              <option value="KCSE">KCSE — Secondary</option>
            </select>
          </label>

          <label className="sc-field sc-field-wide" htmlFor="sc-kenyan-subject">
            Subject
            <select
              id="sc-kenyan-subject"
              value={subjectId}
              onChange={(event) => {
    const target = event.target as HTMLSelectElement;
    if (target) setSubjectId(target.value);
  }}
              disabled={!canWrite}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sc-field sc-field-wide" htmlFor="sc-kenyan-student">
            Student label
            <input
              id="sc-kenyan-student"
              value={student}
              onChange={(event) => setStudent((event.target as HTMLInputElement).value)}
              disabled={!canWrite}
              placeholder="e.g. Adm. 24101"
            />
          </label>
        </div>
      </div>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <div>
            <h3 className="sc-panel-title">Answer scheme · {subject.code}</h3>
          </div>
          <span className="sc-data-note">{questions.length} questions</span>
        </div>
        <div className="sc-kenyan-list">
          {questions.map((question) => (
            <label className="sc-kenyan-row" key={question.id}>
              <div className="sc-scheme-q">
                <span className="sc-question-id">{question.id}</span>
                <span>{question.prompt}</span>
              </div>
              <input
                value={answers[question.id] ?? ''}
                onChange={(event) => {
                  const target = event.target as HTMLInputElement;
                  if (target)
                    setAnswers((prev) => ({ ...prev, [question.id]: target.value }));
                }}
                disabled={!canWrite}
                className="sc-answer-input"
              />
              <span className="sc-question-marks">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </span>
            </label>
          ))}
          <p className="sc-scheme-rule">
            Case-insensitive canonical match or accepted keyword. Review before use.
          </p>
        </div>
      </div>

      <div className="sc-actions">
        <button
          className="sc-button sc-button-primary"
          disabled={!canWrite || !student.trim()}
          onClick={submitPaper}
          type="button"
        >
          Mark paper
        </button>
        <label className={`sc-import-button${!canWrite ? ' is-disabled' : ''}`}>
          Import CSV / JSON
          <input
            accept=".csv,.json,application/json,text/csv"
            disabled={!canWrite}
            onChange={importPapers}
            type="file"
          />
        </label>
      </div>

      {importError && <p className="sc-field-error" role="alert">{importError}</p>}

      {marked && (
        <div className="sc-panel sc-result-card">
          <div className="sc-panel-head">
            <div>
              <h3 className="sc-panel-title">Result</h3>
            </div>
            <span className="sc-data-note">Review before recording</span>
          </div>
          <div className="sc-result-summary">
            <div className="sc-result-metric">
              <span className="sc-result-label">Student</span>
              <strong>{marked.student}</strong>
            </div>
            <div className="sc-result-metric">
              <span className="sc-result-label">Subject</span>
              <strong>{marked.subject}</strong>
            </div>
            <div className="sc-result-metric">
              <span className="sc-result-label">Score</span>
              <b className="sc-result-score">{marked.score}<i> / {marked.maximum}</i></b>
            </div>
            <div className="sc-result-metric">
              <span className="sc-result-label">Grade</span>
              <strong className={`sc-grade-${gradeLabel(marked.score, marked.maximum).toLowerCase()}`}>
                {gradeLabel(marked.score, marked.maximum)}
              </strong>
            </div>
          </div>
          <div className="sc-breakdown">
            <h4 className="sc-breakdown-title">Question breakdown</h4>
            <div className="sc-breakdown-list">
              {marked.questions.map((q, i) => (
                <div className="sc-breakdown-row" key={q.id}>
                  <span>{q.id}</span>
                  <span>{q.prompt}</span>
                  <b className={marked.marksByQuestion[i] > 0 ? 'sc-mark-ok' : 'sc-mark-miss'}>
                    {marked.marksByQuestion[i]} / {q.marks}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {snapshot.markedPapers.length > 0 && marked === null && (
        <div className="sc-results">
          <div className="sc-results-head">
            <div>
              <h3>Recent results</h3>
            </div>
            <span>
              <strong>{snapshot.markedPapers.length}</strong>{' '}
              {snapshot.markedPapers.length === 1 ? 'paper' : 'papers'}
            </span>
          </div>
          <div class="sc-result-list">
            {snapshot.markedPapers.slice(0, 5).map((paper, index) => (
              <div className="sc-result-row" key={`${paper.student}-${index}`}>
                <strong>{paper.student}</strong>
                <span>{paper.marksByQuestion.map((m, i) => `Q${i + 1}: ${m}`).join(', ')}</span>
                <b className="sc-result-score">{paper.score}<i> / {paper.maximum}</i></b>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
