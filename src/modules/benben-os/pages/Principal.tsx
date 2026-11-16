import { useMemo, useState } from 'preact/hooks';
import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import type { MarkedPaper } from '../lib/cbc';

const PENDING_PAPERS: MarkedPaper[] = [
  {
    paperId: 'P-MAT-5-T1-2025-001',
    studentId: 'L101',
    studentName: 'Amani Juma',
    grade: 5,
    subjectCode: 'MAT',
    term: 1,
    year: 2025,
    totalMarks: 50,
    marksObtained: 42,
    percentage: 84,
    level: 'EE',
    answers: [],
    markedBy: 'Ms. Karimi',
    markedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'submitted',
  },
  {
    paperId: 'P-SCI-6-T1-2025-001',
    studentId: 'L104',
    studentName: 'Kato Njeri',
    grade: 6,
    subjectCode: 'SCI',
    term: 1,
    year: 2025,
    totalMarks: 50,
    marksObtained: 38,
    percentage: 76,
    level: 'EE',
    answers: [],
    markedBy: 'Mr. Okeke',
    markedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'submitted',
  },
  {
    paperId: 'P-ENG-9-T1-2025-001',
    studentId: 'L110',
    studentName: 'Omar Said',
    grade: 9,
    subjectCode: 'ENG',
    term: 1,
    year: 2025,
    totalMarks: 50,
    marksObtained: 44,
    percentage: 88,
    level: 'EE',
    answers: [],
    markedBy: 'Ms. Nkosi',
    markedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'submitted',
  },
  {
    paperId: 'P-MAT-5-T1-2025-002',
    studentId: 'L102',
    studentName: 'Nalia Otieno',
    grade: 5,
    subjectCode: 'MAT',
    term: 1,
    year: 2025,
    totalMarks: 50,
    marksObtained: 29,
    percentage: 58,
    level: 'AE',
    answers: [],
    markedBy: 'Ms. Karimi',
    markedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'approved',
    principalComment: 'Good effort, needs more practice in algebra.',
  },
];

type PrincipalFilter = 'all' | 'submitted' | 'approved' | 'rejected';

export function Principal() {
  const [filter, setFilter] = useState<PrincipalFilter>('all');
  const [approving, setApproving] = useState<{ paperId: string; action: 'approve' | 'reject' } | null>(null);
  const [principalComment, setPrincipalComment] = useState('');

  const papers = useMemo(() => {
    if (filter === 'all') return PENDING_PAPERS;
    return PENDING_PAPERS.filter((p) => p.status === filter);
  }, [filter]);

  const handleApprove = (paperId: string, action: 'approve' | 'reject') => {
    setApproving({ paperId, action });
  };

  const handleConfirmApprove = (paperId: string) => {
    const idx = PENDING_PAPERS.findIndex((p) => p.paperId === paperId);
    if (idx >= 0) {
      PENDING_PAPERS[idx].status = 'approved';
      PENDING_PAPERS[idx].principalComment = principalComment || 'Approved.';
    }
    setApproving(null);
    setPrincipalComment('');
  };

  const handleReject = (paperId: string) => {
    const idx = PENDING_PAPERS.findIndex((p) => p.paperId === paperId);
    if (idx >= 0) {
      PENDING_PAPERS[idx].status = 'rejected';
      PENDING_PAPERS[idx].principalComment = principalComment || 'Needs revision.';
    }
    setApproving(null);
    setPrincipalComment('');
  };

  const handleCancel = () => {
    setApproving(null);
    setPrincipalComment('');
  };

  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Principal inbox</h1>
        <p className="benben-page-sub">Review submitted papers, approve or reject.</p>
      </div>

      <div className="benben-principal-wrap">
        <Card className="benben-filter-bar">
          <CardBody>
            <div className="benben-chip-group">
              {(['all', 'submitted', 'approved', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  className={`benben-chip ${filter === f ? 'benben-chip--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="benben-papers-list">
          <CardHead>
            <h2 className="benben-card-title">{papers.length} paper{sOrNot(papers.length)} awaiting review</h2>
          </CardHead>
          <CardBody>
            <table className="benben-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Paper</th>
                  <th>Grade</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Marked by</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={`${p.paperId}-${p.studentId}`} className="benben-row">
                    <td>{p.studentName}</td>
                    <td className="benben-mono">{p.paperId}</td>
                    <td className="benben-mono">Grade {p.grade}</td>
                    <td className="benben-mono">{p.marksObtained}/{p.totalMarks}</td>
                    <td>
                      <span className={`benben-badge benben-badge--${p.level === 'EE' ? 'paid' : p.level === 'ME' ? 'canon' : p.level === 'AE' ? 'partial' : 'unpaid'}`}>
                        {p.level} ({p.percentage}%)
                      </span>
                    </td>
                    <td>{p.markedBy}</td>
                    <td>
                      <span className={`benben-badge benben-badge--${p.status === 'submitted' ? 'caution' : p.status === 'approved' ? 'paid' : 'unpaid'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === 'submitted' ? (
                        <div className="benben-action-cell">
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(p.paperId, 'approve')}>
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(p.paperId, 'reject')}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="benben-small">{p.principalComment || ''}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {papers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="benben-empty">No papers match that filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {approving && (
          <Card className="benben-approve-dialog">
            <CardHead>
              <h2 className="benben-card-title">{approving.action === 'approve' ? 'Approve paper' : 'Reject paper'}</h2>
            </CardHead>
            <CardBody>
              <div className="benben-field-row">
                <label className="benben-field-label">Principal comment</label>
                <textarea
                  className="benben-form-input"
                  value={principalComment}
                  onChange={(e) => setPrincipalComment(e.currentTarget.value)}
                  rows={3}
                  placeholder="Add a comment for the teacher…"
                />
              </div>
              <div className="benben-marking-actions">
                <Button variant="primary" onClick={() => {
                  if (approving.action === 'approve') {
                    handleConfirmApprove(approving.paperId);
                  } else {
                    handleReject(approving.paperId);
                  }
                }}>
                  Confirm
                </Button>
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function sOrNot(n: number) {
  return n === 1 ? '' : 's';
}