import { useMemo, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { Paper, StudentAnswer, MarkedPaper } from '../lib/cbc';
import { markPaper } from '../lib/cbc';
import {
  GRADE5_MATH_T1_2025, GRADE6_SCI_T1_2025, GRADE9_ENG_T1_2025,
} from '../lib/cbc-seed';

const PAPERS: Paper[] = [GRADE5_MATH_T1_2025, GRADE6_SCI_T1_2025, GRADE9_ENG_T1_2025];

export function Marking() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [marked, setMarked] = useState<MarkedPaper | null>(null);

  const paper = useMemo(() => PAPERS.find((p) => p.id === selectedId), [selectedId]);

  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Auto-marking</h1>
        <p className="benben-page-sub">Select a paper, enter learner details, mark by question.</p>
      </div>

      <div className="benben-marking-wrap">
        <Card className="benben-paper-selector">
          <CardHead>
            <h2 className="benben-card-title">Select paper</h2>
          </CardHead>
          <CardBody>
            <div className="benben-paper-grid">
              {PAPERS.map((p) => (
                <button
                  key={p.id}
                  className={`benben-paper-card ${selectedId === p.id ? 'benben-paper-card--selected' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="benben-paper-title">{p.title}</div>
                  <div className="benben-paper-meta">
                    Grade {p.grade} · Term {p.term} · {p.totalMarks} marks · {p.timeMinutes} min
                  </div>
                  <div className="benben-paper-questions">{p.questions.length} questions</div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {selectedId && paper && !marked ? (
          <Card className="benben-marking-form">
            <CardHead>
              <h2 className="benben-card-title">Mark: {paper.title}</h2>
            </CardHead>
            <CardBody>
              <div className="benben-marking-grid">
                <div className="benben-marking-form-col">
                  <div className="benben-field-row">
                    <label className="benben-field-label">Learner ID</label>
                    <Input
                      placeholder="e.g. L101"
                      value={studentId}
                      onChange={(v) => setStudentId(v)}
                      className="benben-form-input"
                    />
                  </div>
                  <div className="benben-field-row">
                    <label className="benben-field-label">Learner name</label>
                    <Input
                      placeholder="e.g. Amani Juma"
                      value={studentName}
                      onChange={(v) => setStudentName(v)}
                      className="benben-form-input"
                    />
                  </div>
                </div>
                <div className="benben-marking-answers-col">
                  {paper.questions.map((q) => (
                    <QuestionMarker key={q.id} q={q} onChange={() => {}} />
                  ))}
                  <div className="benben-marking-actions">
                    <Button
                      variant="primary"
                      disabled={!studentId.trim() || !studentName.trim()}
                      onClick={() => {
                        const answers: Record<string, StudentAnswer> = {};
                        document.querySelectorAll<HTMLElement>('[data-question-id]').forEach((el) => {
                          const qid = el.dataset.questionId!;
                          const answerText = el.querySelector<HTMLElement>('[data-answer-text]')?.textContent ?? '';
                          const optIdx = el.querySelector<HTMLElement>('[data-option-index]')?.dataset.optionIndex;
                          answers[qid] = {
                            questionId: qid,
                            answer: answerText,
                            optionIndex: optIdx ? Number(optIdx) : undefined,
                            marked: false,
                            marksAwarded: 0,
                            level: 'BE',
                          };
                        });
                        setMarked(markPaper(paper, studentId, studentName, answers, 'Ms. Karimi'));
                      }}
                    >
                      Submit marking
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {marked && (
          <Card className="benben-marking-result">
            <CardHead>
              <h2 className="benben-card-title">Marking result — {marked.level}</h2>
              <div className="benben-card-actions">
                <Link href="/benben-os/principal" className="benben-view-all">Send to principal →</Link>
              </div>
            </CardHead>
            <CardBody>
              <div className="benben-result-summary">
                <div className="benben-result-stat">
                  <span className="benben-result-label">Learner</span>
                  <span className="benben-result-value">{marked.studentName}</span>
                </div>
                <div className="benben-result-stat">
                  <span className="benben-result-label">Score</span>
                  <span className="benben-result-value benben-mono">
                    {marked.marksObtained}/{marked.totalMarks}
                  </span>
                </div>
                <div className="benben-result-stat">
                  <span className="benben-result-label">Percentage</span>
                  <span className="benben-result-value benben-mono">{marked.percentage}%</span>
                </div>
                <div className="benben-result-stat">
                  <span className="benben-result-label">Level</span>
                  <span className={`benben-result-level benben-level-${marked.level}`}>{marked.level}</span>
                </div>
              </div>
              <div className="benben-result-table">
                <table className="benben-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Marks</th>
                      <th>Awarded</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marked.answers.map((a) => (
                      <tr key={a.questionId} className="benben-row">
                        <td className="benben-mono">{a.questionId}</td>
                        <td>{a.answer || '(no answer)'}</td>
                        <td className="benben-mono">{marked.totalMarks > 0 ? marked.marksObtained : 0}</td>
                        <td className="benben-mono">{a.marksAwarded}</td>
                        <td>
                          <span className={`benben-badge benben-badge--${a.level === 'EE' ? 'paid' : a.level === 'ME' ? 'canon' : a.level === 'AE' ? 'partial' : 'unpaid'}`}>
                            {a.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="benben-marking-actions">
                <Button variant="primary" onClick={() => setMarked(null)}>
                  Mark another paper
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function QuestionMarker({
  q,
  onChange,
}: {
  q: Paper['questions'][number];
  onChange: (a: StudentAnswer) => void;
}) {
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);

  const handleSave = () => {
    if (q.type === 'mcq') {
      onChange({
        questionId: q.id,
        answer: '',
        optionIndex: selectedOption,
        marked: true,
        marksAwarded: 0,
        level: 'BE',
      });
    } else {
      onChange({
        questionId: q.id,
        answer,
        optionIndex: undefined,
        marked: true,
        marksAwarded: 0,
        level: 'BE',
      });
    }
  };

  return (
    <div className="benben-question-card" data-question-id={q.id}>
      <div className="benben-question-header">
        <div className="benben-question-id benben-mono">{q.id}</div>
        <div className="benben-question-marks">Marks: {q.marks}</div>
      </div>
      <div className="benben-question-stem">{q.stem}</div>
      {q.type === 'mcq' && q.options ? (
        <div className="benben-mcq-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`benben-option-btn ${selectedOption === i ? 'benben-option-btn--selected' : ''}`}
              onClick={() => { setSelectedOption(i); handleSave(); }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="benben-short-answer">
          <textarea
            className="benben-short-answer-input"
            value={answer}
            onChange={(e) => {
              setAnswer(e.currentTarget.value);
              handleSave();
            }}
            rows={3}
            placeholder="Type answer…"
          />
        </div>
      )}
    </div>
  );
}