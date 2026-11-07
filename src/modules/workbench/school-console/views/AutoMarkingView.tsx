// Rebuilt Auto-Marking: deterministic marking engine, typed practice only,
// teacher review required. No AI, no scans, no external model.
import type { ConsoleSnapshot } from '../../../../lib/school-console-storage';
import { Button } from '../../../../components/Button';
import { Input } from '../../../../components/Input';
import { questions } from '../constants';

interface AutoMarkingViewProps {
  snapshot: ConsoleSnapshot;
  paperLabel: string;
  setPaperLabel: (value: string) => void;
  answers: Record<string, string>;
  setAnswers: (value: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  importError: string;
  submitPaper: (event: Event) => Promise<void>;
  importPapers: (event: Event) => Promise<void>;
  canWrite: boolean;
  markedCount: number;
  averageMark: number | null;
}

export function AutoMarkingView({
  snapshot,
  paperLabel,
  setPaperLabel,
  answers,
  setAnswers,
  importError,
  submitPaper,
  importPapers,
  canWrite,
  markedCount,
  averageMark,
}: AutoMarkingViewProps) {
  return (
    <section className="sc-module" aria-labelledby="sc-marking-title">
      <div className="sc-module-head">
        <div>
          <h2 className="sc-title" id="sc-marking-title">Auto-Marking</h2>
          <p className="sc-description">
            One rule, applied to every typed response.
          </p>
        </div>
      </div>

      <p className="sc-state-line">
        Teacher review required · practice aid only
      </p>

      <div className="sc-panel">
        <div className="sc-panel-head">
          <h3 className="sc-panel-title">Answer scheme</h3>
        </div>
        <div className="sc-list">
          {questions.map((question) => (
            <div className="sc-scheme-row" key={question.id}>
              <span className="sc-question-id">{question.id}</span>
              <div>
                <strong>{question.prompt}</strong>
                <small>
                  Canonical answer: {question.answer} · accepted keyword:{' '}
                  {question.keywords?.join(', ')}
                </small>
              </div>
              <span className="sc-question-marks">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
          ))}
          <p className="sc-scheme-rule">
            Case-insensitive canonical match or accepted keyword. Review before use.
          </p>
        </div>
      </div>

      <form className="sc-form" onSubmit={submitPaper}>
        <div className="sc-panel-head">
          <div>
            <h3>Enter typed responses</h3>
          </div>
          <span className="sc-data-note">Do not enter real learner records</span>
        </div>

        <div className="sc-form">
          <label className="sc-field sc-field-wide" htmlFor="sc-paper-label">
            Practice paper label
            <Input
              id="sc-paper-label"
              onChange={setPaperLabel}
              value={paperLabel}
              disabled={!canWrite}
            />
          </label>

          {questions.map((question) => (
            <label className="sc-field" htmlFor={`sc-answer-${question.id}`} key={question.id}>
              <span>{question.id} / {question.topic}</span>
              <Input
                id={`sc-answer-${question.id}`}
                onChange={(value: string) =>
                  setAnswers((current: Record<string, string>) => ({ ...current, [question.id]: value }))
                }
                value={answers[question.id] ?? ''}
                disabled={!canWrite}
              />
            </label>
          ))}

          {importError && <p className="sc-field-error" role="alert">{importError}</p>}

          <div className="sc-actions">
            <Button disabled={!canWrite} type="submit">
              Mark practice paper
            </Button>
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
        </div>

        <p className="sc-footnote">
          CSV: student,Q1,Q2 · JSON: typed data only · scans not read.
        </p>
      </form>

      <div className="sc-results">
        <div className="sc-results-head">
          <div>
            <h3>Practice results</h3>
          </div>
          <span>
            <strong>{markedCount}</strong>{' '}
            {markedCount === 1 ? 'paper' : 'papers'} /{' '}
            {averageMark === null ? 'No average' : `${averageMark}% average`}
          </span>
        </div>

        {snapshot.markedPapers.length === 0 ? (
          <p className="sc-empty-state">
            No practice papers yet. Enter typed responses above to begin.
          </p>
        ) : (
          <div className="sc-result-list">
            {snapshot.markedPapers.map((paper, index) => (
              <div className="sc-result-row" key={`${paper.student}-${index}`}>
                <strong>{paper.student}</strong>
                <span>
                  {paper.marksByQuestion.map((mark, questionIndex) =>
                    `Q${questionIndex + 1}: ${mark}`,
                  ).join(', ')}
                </span>
                <b className="sc-result-score">
                  {paper.score}<i> / {paper.maximum}</i>
                </b>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
